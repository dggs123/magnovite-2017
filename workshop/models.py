import hashlib

from django.db import models
from django.conf import settings

class Workshop(models.Model):
    TEAM_TYPES = (
        ('Technical', 'Technical'),
        ('Non-Technical', 'Non-Technical')
    )
    slug = models.CharField(max_length=50, blank=True, null=True, default='')
    private_slug = models.CharField(max_length=50, blank=True, null=True, default='')

    registrations_open = models.BooleanField(default=True)

    title = models.CharField(max_length=50)
    desc_1 = models.TextField()
    desc_2 = models.TextField()

    std_1_name = models.CharField(max_length=50)
    std_1_email = models.EmailField(
        verbose_name='Email Address',
        default = "dggs222@gmail.com"
    )
    std_1_mobile = models.CharField(max_length=10)

    faculty_name = models.CharField(max_length=50)
    faculty_email = models.EmailField(
        verbose_name='Email Address',
        default="dggs222@gmail.com"
    )

    price = models.IntegerField(max_length=5)
    min_range = models.IntegerField(max_length=2, default=0)
    max_range = models.IntegerField(max_length=2, default=40)


    date_string = models.CharField(
        max_length=50, blank=True, null=True,
        help_text='Eg: From 2, 3 or 4 March'
    )
    venue = models.CharField(
        max_length=50, blank=True, null=True,
        help_text='Eg: Block:C, 205 Room'
    )

    img_big = models.URLField(help_text='400x400')
    img_small = models.URLField(help_text='120x120')
    w_type = models.CharField(max_length=20, choices=TEAM_TYPES, default='Technical')


    def save(self, *args, **kwargs):
        if not self.private_slug:
            text = self.title + self.desc_1 + settings.SECRET_KEY[:10]
            self.private_slug = hashlib.sha1(text.encode('utf-8')).hexdigest()

        return super(Workshop, self).save(*args, **kwargs)

    def num_registered(self):
        return self.profile_set.count()

    def __str__(self):
        return self.title
