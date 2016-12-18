from django.conf.urls import url
from .views import *

urlpatterns = [
    url('^$', index, name='campus'),

    url('^api/register/$', register, name='campus-register'),

    url('^api/unregister/$', unregister, name='campus-unregister'),
]
