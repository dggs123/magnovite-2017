from django.shortcuts import render
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_POST

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


@require_POST
def register(req, id):
    if not req.user.is_authenticated():
        return JsonResponse({
            'errorCode': 'login',
            'errorMessage': 'Please login first'
        }, status=400)

    # you can only register if profile is complete
    if not req.user.profile.is_complete():
        return JsonResponse({
            'errorCode': 'profile_incomplete',
            'actionType': 'redirect',
            'actionText': 'Complete Now',
            'redirectLocation': '/profile/',
            'errorMessage': 'You need to complete your profile first'
        }, status=400)
    workshop = get_object_or_404(Workshop, id=id)

    req.user.profile.registered_workshops.add(workshop)
    
    try:
        req.user.profile.save()
    except Exception:
        return JsonResponse({
            'errorCode': 'unknown',
            'errorMessage': 'Something went wrong! Try refreshing the page, or try again later'
        }, status=400)

    return HttpResponse(status=200)


@require_POST
def unregister(req, id):
    if not req.user.is_authenticated():
        return HttpResponse(status=400)
    workshop = get_object_or_404(Workshop, id=id)

    req.user.profile.registered_workshops.remove(workshop)
    try:
        
        req.user.profile.save()

    except Exception:
        return JsonResponse({
            'errorCode': 'unknown',
            'errorMessage': 'Something went wrong! Try refreshing the page, or try again later'
        }, status=400)
    # we return 200, even if the user was previously
    # not registered to the event
    return HttpResponse(status=200)
