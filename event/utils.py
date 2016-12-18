import hashlib
import random

from django.conf import settings

from event.models import Registration


def generate_team_id(email, event):
    while True:
        prefix = 't-'
        if event.is_group():
            prefix = 'g-'

        corpus = email + event.slug + settings.SECRET_KEY[:10] + str(random.random())
        team_id = prefix + hashlib.sha1(corpus.encode('utf-8')).hexdigest()[:5]

        # make sure team_id is unique
        if Registration.objects.filter(team_id=team_id).count() == 0:
            return team_id.lower()
