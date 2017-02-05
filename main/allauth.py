from django.http import HttpResponseRedirect

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
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

class MSocialAccountAdapter(DefaultSocialAccountAdapter):

    def pre_social_login(self, request, sociallogin):
        """
        This contains a lot of bolted on hack-y logic. It uses alot of work arounds
        based on the way allauth works, so it has no guarantee to work with another
        version of all auth

        1. If this is a sign-in(user already signed in before) then we decide where to
           redirect based on if profile is complete
        2. If the email associated with this socialnetwork already has logged in via
           another socialnetwork then we are going to connect both of it.
           This has security issues: opens a vector where someone creates a fake social
           account with same email to hijack our account. But who are we kidding, this is
           a tech fest website, and uses only FB/Google as providers.
        """

        # twitter doesnt give a email id so use a fake one as the id
        if sociallogin.account.provider == 'twitter':
            email = sociallogin.account.extra_data['screen_name'] + '@twitter.com'
            sociallogin.account.extra_data['email'] = email

            if hasattr(sociallogin.account, "_user_cache"):
                sociallogin.account._user_cache.email = email

        # if this is a returning user dont try to connect
        if sociallogin.account.pk:
            # dont override next
            if sociallogin.state.get('next') != None:
                return

            try:
                if sociallogin.account.user.profile.is_complete():
                    sociallogin.state['next'] = '/'
                else:
                    sociallogin.state['next'] = '/profile/'
            except Exception:
                pass

            return

        try:
            if 'email' not in sociallogin.account.extra_data:
                messages.error(request, 'Facebook did not return an email!, please make sure you authorized us to access your email id')
                raise ImmediateHttpResponse(HttpResponseRedirect('/'))

            user = MUser.objects.get(email=sociallogin.account.extra_data['email'])
            sociallogin.connect(request, user)

            # send to the profile page only if the profile is incomplete
            url = '/profile/'
            try:
                profile = user.profile
                if profile.is_complete():
                    url = '/'
            except Profile.DoesNotExist:
                pass

            raise ImmediateHttpResponse(HttpResponseRedirect(url))
        except MUser.DoesNotExist:
            # this is a new user, make sure we redirect to profile
            sociallogin.state['next'] = '/profile/'

    def save_user(self, request, sociallogin, form=None):
        user = super(MSocialAccountAdapter, self).save_user(request, sociallogin, form)

        p = user.profile
        p.auth_provider = sociallogin.account.provider
        p.user = user
        p.active_email = user.email
        p.name = sociallogin.account.extra_data['name']
        p.save()
