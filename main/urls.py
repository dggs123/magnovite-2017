from django.conf.urls import url
from django.contrib import admin
from .views import *

urlpatterns = [
			url('^$', index, name='home'),
			url('^login/$', login_view, name='login'),
			url('^logout/$', logout_view, name='logout'),
			url('^profile/$', profile, name='profile'),
			url('^profile/update/(?P<pk>\d+)/$', profile_update_view, name='profile_update'),
			url(r'^profile/message/$', add_message, name='add_message'),
			url('^gallery/$',gallery,name="gallery"),

]