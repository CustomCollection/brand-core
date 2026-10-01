"""Context processors for CMS dynamic content."""

from apps.cms.models import SiteConfig


def site_config_context(request):
    """
    Inject site configuration branding into all templates (including Django admin).
    """
    try:
        config = SiteConfig.get_config()
        logo = config.logo_url or ""
        favicon = config.favicon_url or logo or ""
        brand_name = config.brand_name or "CustomCollection"
        return {
            "site_logo_url": logo,
            "site_favicon_url": favicon,
            "site_brand_name": brand_name,
        }
    except Exception:
        return {
            "site_logo_url": "",
            "site_favicon_url": "",
            "site_brand_name": "CustomCollection",
        }
