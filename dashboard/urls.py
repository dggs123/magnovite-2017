from django.conf.urls import url

from .views import *

urlpatterns = [
    url(r'^$', index, name='dashboard'),
    url(r'^capture/$', capture, name='dashboard:capture'),
    url(r'^api/analytics/$', analytics, name='dashboard:api:analytics'),
    url(r'^api/registrations/(?P<id>\d+)/$', registrations, name='dashboard:api:registrations'),
]
