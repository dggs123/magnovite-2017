from __future__ import unicode_literals

from django.db import models

# Create your models here.
class RegistrationCA(models.Model):
    profile = models.ForeignKey('main.Profile')

    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['profile']
        ordering = ['-created']
        permissions = (
            ('own_campusambester_registrations', 'View registrations for admin'),
        )