# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-18 19:03
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('main', '0001_initial'),
        ('event', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='registration',
            name='profile',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='main.Profile'),
        ),
        migrations.AlterUniqueTogether(
            name='registration',
            unique_together=set([('event', 'profile')]),
        ),
    ]
