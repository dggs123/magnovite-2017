from django.conf.urls import url
from django.contrib import admin
from .views import *

urlpatterns = [
    url(r'^$', index, name='workshop'),
     url('^api/register/(?P<id>\d+)/$', register, name='registerw'),
     url('^api/unregister/(?P<id>\d+)/$', unregister, name='unregisterw'),
     url('^exel$', generate_exel, name='wexel'),
     # url('^mexel$', generate_exel_invoice, name='mexel')
]
