from django.http import HttpResponseRedirect

from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter

from django.contrib import messages

from .models import Profile, MUser


class MyAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        if request.user.profile.is_complete:
            path = request.url
        else:
            path = "/profile/"
        return path.format(username=request.user.username)
