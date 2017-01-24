from django.conf.urls import url
from .views import *

urlpatterns = [
    url('^$', index, name='rightclick'),
    url('^event$', index1, name='rightclick1'),

    url('^api/register/$', register, name='right-register'),

    url('^api/unregister/$', unregister, name='right-unregister'),
]
