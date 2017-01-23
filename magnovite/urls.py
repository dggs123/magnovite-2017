"""magnovite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

urlpatterns = [
    url(r'^jet/', include('jet.urls', 'jet')),
    url(r'^admin/', admin.site.urls),
    # main app
	url(r'', include('main.urls')),
    #for subscription
    url(r'^subscribe/', include('subscribe.urls')),
    # Events
    url(r'^events/', include('event.urls')),
    # url(r'^quest/', include('quest.urls')),
   # url(r'^dashboard/', include('dashboard.urls')),

   url(r'^campus/',include('campusambester.urls')),

   url(r'^rightclick/',include('rightclick.urls')),

	# 3rd party
	url(r'^accounts/', include('allauth.urls')),
]
# + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
