from __future__ import unicode_literals
import hashlib

from django.db import models

from django.conf import settings
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser, PermissionsMixin
)

from event.models import Event, Registration
from workshop.models import Workshop


# Create your models here.
class MUserManager(BaseUserManager):
    def create_user(self, email, password=None):
        """
        Creates and saves a User with the given email and pwd
        """
        if not email:
            raise ValueError('User must have an email')

        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None):
        """
        Creates and saves a superuse with the given email and pwd
        """
        user = self.create_user(email, password)
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class MUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        verbose_name='Email Address',
        max_length=255,
        unique=True
    )

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False, help_text='Has access to admin site')

    objects = MUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Magnovite User'

    def save(self, *args, **kwargs):
        super(MUser, self).save(*args, **kwargs)
        if self.has_profile():
            return

        # Create a blank profile if the user doesnt have a profile
        p = Profile()
        p.user = self
        p.auth_provider = 'internal'
        p.active_email = self.email
        p.save()

    def auth_provider(self):
        return self.profile.auth_provider

    def has_profile(self):
        try:
            self.profile
            return True
        except Profile.DoesNotExist:
            return False

    def get_full_name(self):
        # The user is identified by their email address
        return self.email

    def get_short_name(self):
        # The user is identified by their email address
        return self.email

    def get_id(self):
        return settings.ID_OFFSET + self.id

    @staticmethod
    def get_real_id(id):
        return int(id) - settings.ID_OFFSET

    def __str__(self):
        return str(self.get_id()) + ' | ' + self.email


        
class Profile(models.Model):
    user = models.OneToOneField(MUser, null=True)

    checked_in = models.BooleanField(default=False)
    checked_in_first_day = models.BooleanField(default=False)

    id_printed = models.BooleanField(default=False)

    receipt_id = models.CharField(max_length=100, blank=True, null=True)

    remarks = models.TextField(blank=True, null=True, default='')

    # auth provider
    auth_provider = models.CharField(max_length=30, blank=True)

    # if on-spot, who registered the user
    on_spot = models.BooleanField(default=False)
    on_spot_registerer = models.CharField(max_length=50, blank=True, null=True, default='')

    total_payment = models.IntegerField(max_length=4, default=0)

    # The payment pack
    PACKS = (
        ('none', 'No Pack'),
        ('single', 'Single Event Pack'),
        ('multiple', 'Multiple Events Pack')
    )

    pack = models.CharField(max_length=10, choices=PACKS, default='none')

    # this will be initialized to user.email
    # This will be used for commmunication and we will
    # let the user change this. user.email will be the one
    # we got from social_provider
    active_email = models.EmailField()

    # basic details
    name = models.CharField(blank=True, max_length=50)
    mobile = models.CharField(blank=True, max_length=10, help_text='Without +91')
    college = models.CharField(blank=True, max_length=50)
    referral = models.CharField(
        blank=True, max_length=50,
        help_text='Referral: How did you find out about us?',
        default=''
    )

    registered_events = models.ManyToManyField(Event, through=Registration)
    registered_workshops = models.ManyToManyField(Workshop, null=True, blank=True)

    hospitality_days = models.IntegerField(default=0)

    # internal fields
    # is_internal = models.BooleanField(
    #     default=False,
    #     help_text='Is this an internal account? (Event Heads, etc)'
    #     )
    
    events = models.ManyToManyField(Event,
        verbose_name='Events Incharge of',
        related_name='heads',
        help_text='The event this profile is in-charge of',
        null=True, blank=True
    )

    class Meta:
        permissions = (
            ('on_spot_registration', 'Able to create on-spot registrations'),
        )

    def save(self, *args, **kwargs):
        if not self.receipt_id:
            corpus = settings.SECRET_KEY + self.active_email + self.name
            self.receipt_id = hashlib.sha1(corpus.encode('utf-8')).hexdigest()

        return super(Profile, self).save(*args, **kwargs)

    def summary_str(self):
        EVENT_MAP = {
            'DEFC':1, 'DANC':4, 'GCS':5, 'CTYC':6, 'WEBD':7, 'TEKH':8,
            'PRJ':9, 'CADM':11, 'JYW':12, 'CANG':13, 'LDSC':14, 'BLDR':15,
            'PPR':16, 'RBW':18, 'WATR':19, 'LINE':20, 'CDBG':21, 'THT':22,
            'CMCS':23, 'ARTR':24, 'PHOT':25, 'DMBC':26, 'QUIZ':27,
            'POTP':28, 'JAM':29, 'DBTE':31, 'INDM':32, 'WSEL':33, 'ACOU':34,
            'KRKE':35, 'BBOY':36, 'SWTCH':37, 'OVNC':38, 'ANDV':39,
            'GNFS':40, 'CADC':41, 'INSW':42, 'SOLO':44,
        }

        INV_EVENT_MAP = {v: k for k, v in EVENT_MAP.items()}

        if self.pack == 'single':
            type = 'S'
        elif self.pack == 'multiple':
            type = 'M'
        elif self.registered_events.count() != 0:
            type = 'G'
        else:
            type = 'N'

        id_text = type + '| '
        for _event in self.registered_events.all():
            id_text += INV_EVENT_MAP[_event.id] + ','

        id_text = id_text.strip(', ')

        workshops = self.registered_workshops.all()
        if workshops.count() != 0:
            id_text += ' |W '
            for workshop in workshops:
                id_text += workshop.slug + ','

            id_text = id_text.strip(',')

        return id_text


    def get_event_incharge_of(self):
        return self.events.all().first()

    def college_neat(self):
        """
        Returns title case unless everything is one uppercase word
        """
        if len(self.college.split(' ')) == 1 and self.college.upper() == self.college:
            return self.college

        return self.college.title()

    def receipt_url(self):
        return '/receipt/' + self.receipt_id + '/'

    def registered_quota_events(self):
        return self.registered_events.filter(~Q(team_type='group'))

    def first_name(self):
        if not self.name:
            return ''

        return self.name.split(' ')[0]

    def is_registered_to_event(self, event):
        return self.registered_events.filter(id=event.id).count() == 1

    def hospitality_days_plus_one(self):
        return self.hospitality_days + 1

    def get_absolute_url(self):
        return '/profile/'

    def is_complete(self):
        return self.name != '' and self.mobile != '' and \
            self.college != '' and \
            self.active_email != ''

    @staticmethod
    def prefetch_all(qs):
        qs = qs.prefetch_related('registered_workshops')
        qs = qs.prefetch_related('registered_events')
        qs = qs.prefetch_related('user')
        return qs

    def __str__(self):
        return str(self.id) + ', ' + self.name + '(' + self.active_email + ')'
