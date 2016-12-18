import json
from datetime import date

from django.db import models

from event.models import Event

class Analytics(models.Model):
    date = models.DateField(auto_now_add=True)
    data = models.TextField()

    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Analytics'

    @staticmethod
    def capture():
        obj = []
        for event in Event.objects.all():
            obj.append({
                'id': event.id,
                'title': event.title,
                'url': event.get_absolute_url(),
                'views': event.views,
                'registrations': event.num_registrations()
            })

        try:
            instance = Analytics.objects.get(date=date.today())
        except Analytics.DoesNotExist:
            instance = Analytics()

        instance.data = json.dumps(obj)
        instance.save()
        return instance
