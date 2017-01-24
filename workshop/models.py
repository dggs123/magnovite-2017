import hashlib

from django.db import models
from django.conf import settings

class Workshop(models.Model):
    slug = models.CharField(max_length=50, blank=True, null=True, default='')
    private_slug = models.CharField(max_length=50, blank=True, null=True, default='')

    registrations_open = models.BooleanField(default=True)

    title = models.CharField(max_length=50)
    desc_1 = models.TextField()
    desc_2 = models.TextField()

    std_1_name = models.CharField(max_length=50)
    std_1_mobile = models.CharField(max_length=10)
    std_2_name = models.CharField(max_length=50)
    std_2_mobile = models.CharField(max_length=10)

    faculty_name = models.CharField(max_length=50)
    faculty_mobile = models.CharField(max_length=10)

    price = models.IntegerField(max_length=5)

    date_string = models.CharField(
        max_length=50, blank=True, null=True,
        help_text='Eg: From 20th to 21st of February'
    )

    img_big = models.URLField(help_text='400x400')
    img_small = models.URLField(help_text='120x120')

    def save(self, *args, **kwargs):
        if not self.private_slug:
            text = self.title + self.desc_1 + settings.SECRET_KEY[:10]
            self.private_slug = hashlib.sha1(text.encode('utf-8')).hexdigest()

        return super(Workshop, self).save(*args, **kwargs)

    def num_registered(self):
        return self.profile_set.count()

    def __str__(self):
        return self.title
