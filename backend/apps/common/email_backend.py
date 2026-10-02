import email.utils
import logging
import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)


class BrevoEmailBackend(BaseEmailBackend):
    """
    HTTP-based email backend using Brevo (Sendinblue) REST API v3 over Port 443.
    Works from Render Free Tier without requiring a custom domain.
    Sends up to 300 emails/day for free to ANY recipient.
    """

    def __init__(self, api_key=None, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = api_key or getattr(settings, "BREVO_API_KEY", "")

    def send_messages(self, email_messages):
        if not self.api_key:
            logger.warning("BREVO_API_KEY is not configured.")
            return 0

        sent_count = 0
        for message in email_messages:
            from_str = message.from_email or getattr(settings, "DEFAULT_FROM_EMAIL", "")
            sender_name, sender_email = email.utils.parseaddr(from_str)

            # Extract HTML body
            html_content = None
            if hasattr(message, "alternatives"):
                for content, mimetype in message.alternatives:
                    if mimetype == "text/html":
                        html_content = content
                        break

            if not html_content and getattr(message, "content_subtype", "plain") == "html":
                html_content = message.body

            payload = {
                "sender": {
                    "name": sender_name or "CustomCollection",
                    "email": sender_email or getattr(settings, "BREVO_SENDER_EMAIL", sender_str := getattr(settings, "EMAIL_HOST_USER", "")),
                },
                "to": [{"email": to_addr} for to_addr in message.to],
                "subject": message.subject,
                "htmlContent": html_content or f"<pre>{message.body}</pre>",
                "textContent": message.body,
            }

            try:
                response = requests.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers={
                        "accept": "application/json",
                        "api-key": self.api_key,
                        "content-type": "application/json",
                    },
                    json=payload,
                    timeout=10,
                )
                if response.status_code in (200, 201):
                    sent_count += 1
                    logger.info("Email delivered via Brevo to %s", message.to)
                else:
                    logger.error("Brevo API error (%s): %s", response.status_code, response.text)
                    if not self.fail_silently:
                        raise Exception(f"Brevo error: {response.text}")
            except Exception as e:
                logger.error("Failed to send email via Brevo to %s: %s", message.to, e)
                if not self.fail_silently:
                    raise e

        return sent_count


class ResendEmailBackend(BaseEmailBackend):
    """
    HTTP-based email backend using Resend REST API (over port 443).
    Bypasses SMTP port blocking on Render Free Tier.
    """

    def __init__(self, api_key=None, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = api_key or getattr(settings, "RESEND_API_KEY", "")

    def send_messages(self, email_messages):
        if not self.api_key:
            logger.warning("RESEND_API_KEY is not configured.")
            return 0

        sent_count = 0
        for message in email_messages:
            from_email = message.from_email or getattr(settings, "DEFAULT_FROM_EMAIL", "onboarding@resend.dev")

            payload = {
                "from": from_email,
                "to": list(message.to),
                "subject": message.subject,
            }

            # Handle HTML body vs plain text
            html_content = None
            if hasattr(message, "alternatives"):
                for content, mimetype in message.alternatives:
                    if mimetype == "text/html":
                        html_content = content
                        break

            if html_content:
                payload["html"] = html_content
                payload["text"] = message.body
            elif getattr(message, "content_subtype", "plain") == "html":
                payload["html"] = message.body
            else:
                payload["text"] = message.body

            try:
                response = requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=10,
                )
                if response.status_code in (200, 201):
                    sent_count += 1
                    logger.info("Email delivered via Resend to %s", message.to)
                else:
                    logger.error("Resend API error (%s): %s", response.status_code, response.text)
                    if not self.fail_silently:
                        raise Exception(f"Resend error: {response.text}")
            except Exception as e:
                logger.error("Failed to send email via Resend to %s: %s", message.to, e)
                if not self.fail_silently:
                    raise e

        return sent_count
