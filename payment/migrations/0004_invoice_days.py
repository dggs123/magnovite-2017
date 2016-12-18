# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0003_invoice_workshop'),
    ]

    operations = [
        migrations.AddField(
            model_name='invoice',
            name='days',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
