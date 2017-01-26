from django.db import models
from django.conf import settings

from main.utils import template_email
from main.models import Profile

class Thread(models.Model):
    profile = models.OneToOneField(Profile)

    is_pending = models.BooleanField(default=False)

    def __str__(self):
        return 'Thread: ' + str(self.id) + ' | ' + str(self.profile)


class Message(models.Model):
    thread = models.ForeignKey(Thread, related_name='messages')

    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    is_staff = models.BooleanField(default=False)
    should_email = models.BooleanField(default=False, help_text='If checked, the user will be emailed notifying about this reply')

    def save(self, *args, **kwargs):
        # if we are adding a staff message then that thread
        # is no longer pending
        if self.is_staff:
            self.thread.is_pending = False
            self.thread.save()

        if self.should_email:
            template_email((settings.DEFAULT_FROM_EMAIL, [self.thread.profile.active_email],
                           'Magnovite: Update on help request',
                           'admin_help_reply',
                           {'user': self.thread.profile, 'message': self})

        super(Message, self).save(*args, **kwargs)

    def who_class(self):
        if self.is_staff:
            return 'them'
        else:
            return 'me'

    def __str__(self):
        return self.content[:10]

    class Meta:
        ordering = ['-timestamp']

