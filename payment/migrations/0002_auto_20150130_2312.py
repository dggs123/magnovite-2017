# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0017_auto_20150115_0134'),
        ('payment', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='invoice',
            name='completed',
        ),
        migrations.AddField(
            model_name='invoice',
            name='event',
            field=models.ForeignKey(blank=True, to='event.Event', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='invoice',
            name='post_data',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='invoice',
            name='status',
            field=models.CharField(blank=True, max_length=50, default=''),
            preserve_default=False,
        ),
    ]
