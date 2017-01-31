from django.conf.urls import url
from django.contrib import admin
from .views import *

urlpatterns = [
    url(r'^$', index, name='workshop'),
     url('^api/register/(?P<id>\d+)/$', register, name='register'),
     url('^api/unregister/(?P<id>\d+)/$', unregister, name='unregister'),
]
