from __future__ import unicode_literals

from django.db import models

# Create your models here.
class RegistrationRC(models.Model):
    profile = models.ForeignKey('main.Profile')

    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['profile']
        ordering = ['-created']
        permissions = (
            ('own_rightclick_registrations', 'View registrations for admin'),
        )