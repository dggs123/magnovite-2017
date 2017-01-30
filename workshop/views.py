from django.shortcuts import render
from django.conf import settings


from .models import Workshop


def index(req):
    if settings.DEBUG:
        template = 'magnovite/new/workshops.html'
    else:
        template = 'magnovite/new/workshops.html'

    open_r=False

    registered = []
    if req.user.is_authenticated():
        registered = req.user.profile.registered_workshops.all()
        if "btech.christuniversity.in" in req.user.email or "mtech.christuniversity.in" in req.user.email:
            open_r = True

    return render(req, template, {
        'workshops': Workshop.objects.all(),
        'registered': registered,
        'open_r':open_r
    })
