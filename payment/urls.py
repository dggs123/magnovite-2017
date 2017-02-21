from django.conf.urls import url
from django.contrib import admin
from .views import *

urlpatterns = [
    url(r'^generate/(?P<invoice_type>[-\w]+)/$', generate, name='generate_invoice'),
    url(r'^success/', success, name='payment_success'),
    url(r'^failure/', failure, name='payment_failure'),
    url(r'^notify/', notify, name='payment_notify'),
    url(r'^email/', send_email, name='payment_email'),
]
