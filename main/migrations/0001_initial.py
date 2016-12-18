# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-03 17:27
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0008_alter_user_username_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='MUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(max_length=255, unique=True, verbose_name='Email Address')),
                ('is_active', models.BooleanField(default=True)),
                ('is_admin', models.BooleanField(default=False)),
                ('is_staff', models.BooleanField(default=False, help_text='Has access to admin site')),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'Magnovite User',
            },
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('checked_in', models.BooleanField(default=False)),
                ('checked_in_first_day', models.BooleanField(default=False)),
                ('id_printed', models.BooleanField(default=False)),
                ('receipt_id', models.CharField(blank=True, max_length=100, null=True)),
                ('remarks', models.TextField(blank=True, default='', null=True)),
                ('auth_provider', models.CharField(blank=True, max_length=30)),
                ('on_spot', models.BooleanField(default=False)),
                ('on_spot_registerer', models.CharField(blank=True, default='', max_length=50, null=True)),
                ('total_payment', models.IntegerField(default=0, max_length=4)),
                ('pack', models.CharField(choices=[('none', 'No Pack'), ('single', 'Single Event Pack'), ('multiple', 'Multiple Events Pack')], default='none', max_length=10)),
                ('active_email', models.EmailField(max_length=254)),
                ('name', models.CharField(blank=True, max_length=50)),
                ('mobile', models.CharField(blank=True, help_text='Without +91', max_length=10)),
                ('college', models.CharField(blank=True, max_length=50)),
                ('referral', models.CharField(blank=True, default='', help_text='Referral: How did you find out about us?', max_length=50)),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'permissions': (('on_spot_registration', 'Able to create on-spot registrations'),),
            },
        ),
    ]
