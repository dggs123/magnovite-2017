from django.conf.urls import url
from .views import *

urlpatterns = [
    url(r'^$', index, name='quest:index'),
    url(r'guess/$', guess, name='quest:guess'),
]
