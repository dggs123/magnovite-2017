# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0012_auto_20150130_2215'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, verbose_name='ID', primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('invoice_type', models.CharField(max_length=20)),
                ('description', models.CharField(max_length=200)),
                ('amount', models.IntegerField(max_length=5)),
                ('pending', models.BooleanField(default=True)),
                ('completed', models.BooleanField(default=False)),
                ('success', models.BooleanField(default=False)),
                ('profile', models.ForeignKey(to='main.Profile')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
