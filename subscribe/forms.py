from django.forms import ModelForm

from .models import Subscription

class SubscribeForm(ModelForm):
    class Meta:
        model = Subscription
        fields = ['email']
