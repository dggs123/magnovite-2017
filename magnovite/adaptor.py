from django.http import HttpResponseRedirect

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from django.contrib import messages

from main.models import Profile, MUser

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
        

        # if this is a returning user dont try to connect
        if sociallogin.account.pk:
            # dont override next

            try:
                if sociallogin.account.user.profile.is_complete():
                    return
                else:
                    sociallogin.state['next'] = '/profile/'
                    messages.success(request,"Please Complete Your Profile")
            except Exception:
                pass

            return

        
    def save_user(self, request, sociallogin, form=None):
        user = super(MSocialAccountAdapter, self).save_user(request, sociallogin, form)

        p = user.profile
        p.auth_provider = sociallogin.account.provider
        p.user = user
        p.active_email = user.email
        p.name = sociallogin.account.extra_data['name']
        p.save()
