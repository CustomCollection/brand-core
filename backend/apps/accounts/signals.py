"""
Signals for the accounts app.

Auto-creates a Profile instance whenever a new User is created.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile, User


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a Profile for every newly created User."""
    if created:
        Profile.objects.create(user=instance)
