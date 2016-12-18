from django import forms
from django.forms import ModelForm

from .models import Profile


class ProfileForm(ModelForm):

    def clean_mobile(self):
        mobile = str(self.cleaned_data['mobile'])

        # accept empty
        if mobile == '':
            return mobile

        if not mobile.isdigit() or len(mobile) != 10:
            raise forms.ValidationError('Mobile must be 10 digits')

        return mobile

    class Meta:
        model = Profile
        fields = ['active_email', 'name', 'mobile', 'college', 'referral']