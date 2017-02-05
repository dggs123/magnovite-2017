import markdown2
import re
import hashlib

from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from django.core.exceptions import ValidationError

from multiselectfield import MultiSelectField


class Event(models.Model):
    TECHNICAL_TAGS = (
        ('cse', 'Computer Science'),
        ('ec', 'Electronics'),
        ('mech', 'Mechanical'),
        ('civil', 'Civil'),
    )

    reg_closed = models.BooleanField(default=False)

    title = models.CharField(max_length=100)

    slug = models.SlugField(help_text='The event url, use all simple and - as a seperator, Eg: junkyard-wars')
    private_slug = models.CharField(max_length=40, blank=True, default='')

    quote = models.CharField(max_length=70, help_text='Text displayed on the cards in /events/')

    # This is assumed to be a Markdown field
    info = models.TextField(
        help_text='Please write in Markdown (Editor: http://dillinger.io/)'
    )

    cash_prize = models.IntegerField(help_text='Numeric, Eg: 5000')

    # Time and venue are simple text
    date = models.IntegerField(
        max_length=2,
        help_text='2 or 3 or 4',
        blank=True, null=True
    )
    time = models.CharField(
        max_length=30,
        help_text='(Start time), Eg: 9:00 am',
        blank=True
    )
    end_time = models.CharField(
        max_length=30,
        help_text='(End Time), Eg: 4:00 pm',
        blank=True, null=True,
    )
    venue = models.CharField(
        max_length=50,
        help_text='Eg: Room 243, Block 2',
        blank=True
    )

    team_min = models.IntegerField(
        help_text='Minimum number of people in a team (If individual: 1)',
        default=1
    )
    team_max = models.IntegerField(
        help_text='Maximum number of people in a team (If individual: 1)',
        default=1
    )

    price = models.IntegerField(max_length=5, default=100)

    TEAM_TYPES = (
        ('individual', 'Individual'),
        ('team', 'Team'),
        ('group', 'Group')
    )

    team_type = models.CharField(max_length=20, choices=TEAM_TYPES, default='individual')

    # if not technical, then cultural
    technical = models.BooleanField(default=True, help_text='If cultural set to false')

    # This is a comma seperated field
    tags = models.CharField(max_length=20, choices=TECHNICAL_TAGS, default='cse', blank=True, null=True)

    # pictures
    cover = models.URLField(blank=True, default='', help_text='imgur link for cover (1300x500)')
    picture_one = models.URLField(blank=True, default='', help_text='imgur link for head one (100x100)')
    picture_two = models.URLField(blank=True, default='', help_text='imgur link for head one (100x100)')

    # analytics
    views = models.IntegerField(default=0)

    class Meta:
        permissions = (
            ('change_own', 'Change events incharge of'),
            ('see_events', 'See all events'),
        )
        ordering = ['-views']

    def save(self, *args, **kwargs):
        if not self.private_slug:
            text = self.title + self.quote + settings.SECRET_KEY
            self.private_slug = hashlib.sha1(text.encode('utf-8')).hexdigest()

        return super(Event, self).save(*args, **kwargs)

    def clean(self):
        if self.title:
            if (self.title.lower() == self.title or
                self.title.upper() == self.title):
                raise ValidationError('Title needs to be in Title Case (eg: Dance Event)')

        if self.slug:
            if not re.match(r'^[-a-z]+$', self.slug):
                raise ValidationError('Slug must contain only lowercase letters and -')

        if self.date:
            if not self.date in [2, 3, 4]:
                raise ValidationError('Date can only be 2 or 3 or 4')

        time_re = re.compile(r'^1?\d:\d\d (am|pm)$')
        if self.time:
            if not time_re.match(self.time):
                raise ValidationError('Start Time must be in format "0:00 am" or "0:00 pm" (note spaces)')

        if self.end_time:
            if not time_re.match(self.end_time):
                raise ValidationError('End Time must be in format "0:00 am" or "0:00 pm" (note spaces)')

    def info_as_html(self):
        """
        Returns the rendered html from the markdown
        """
        return markdown2.markdown(self.info)

    def is_group(self):
        return self.team_type == 'group'

    def is_individual(self):
        return self.team_type == 'individual'

    def is_team(self):
        return self.team_type == 'team'

    def is_multiple(self):
        """
        If not an individual event it is considered to be a team event
        """
        return self.is_group() or self.is_team()

    def num_registrations(self):
        return self.registration_set.count()

    def complete_status(self):
        """
        Are all the details of this event complete,
        we only need to verify optional fields
        """
        fields = ('date', 'time', 'end_time', 'venue', 'cover',
                  'picture_one', 'picture_two')

        count = 0
        for field in fields:
            if bool(getattr(self, field)):
                count += 1

        if count == len(fields):
            return 'Complete'
        else:
            return str(count) + '/' + str(len(fields))

    def type(self):
        if self.technical:
            return 'technical'
        else:
            return 'cultural'

    def tag_assoc(self):
        """
        Returns an array of objects [{tag, name}]
        """
        out = []

        if not self.tags:
            return out

        for tag in self.tags:
            out.append({
                'tag': tag,
                'name': self.get_tag_verbose(tag)
            })

        return out

    def class_string(self):
        """
        Returns all the tags as a string
        """
        if self.tags:
            return ' '.join(self.tags)
        else:
            return ''

    def get_tag_verbose(self, tag):
        for row in self.TECHNICAL_TAGS:
            if row[0] == tag:
                return row[1]

        return ""

    def event_head_p1(self):
        if self.picture_one:
            return self.picture_one
        else:
            return '/static/img/events/head_default.jpg'

    def event_head_p2(self):
        if self.picture_two:
            return self.picture_two
        else:
            return '/static/img/events/head_default.jpg'

    def get_first_head(self):
        return self.heads.first()

    def get_absolute_url(self):
        return reverse('event_details', kwargs={'slug': self.slug})

    def __str__(self):
        return self.title + ' | ' + self.team_type


class Registration(models.Model):
    event = models.ForeignKey(Event)
    profile = models.ForeignKey('main.Profile')

    # If this registration is for a team event
    # then the team id
    team_id = models.CharField(max_length=10, blank=True, null=True)

    # for group events, the owner will not be able to leave the team
    is_owner = models.BooleanField(default=False)

    on_spot = models.BooleanField(default=False)

    created = models.DateTimeField(auto_now_add=True)

    mode = models.CharField(max_length=50, default='online', blank=True, null=True)

    class Meta:
        unique_together = ['event', 'profile']
        ordering = ['-created']
        permissions = (
            ('own_event_registrations', 'View registrations for own event'),
        )
