from django.shortcuts import render
from django.conf import settings

from .models import Workshop


def index(req):
    if settings.DEBUG:
        template = 'magnovite/workshop.html'
    else:
        template = 'magnovite/dist/workshop.html'

    registered = []
    if req.user.is_authenticated():
        registered = req.user.profile.registered_workshops.all()

    return render(req, template, {
        'workshops': Workshop.objects.all(),
        'registered': registered
    })
