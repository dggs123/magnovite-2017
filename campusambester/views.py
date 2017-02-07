import csv
from django.shortcuts import render
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import PermissionDenied
from django.views.decorators.http import require_POST

from .models import RegistrationCA
# Create your views here.

def index(req):

    if settings.DEBUG:
        template = 'magnovite/campusAmbester.html'
    else:
        template = 'magnovite/campusAmbester.html'


    is_registered = False
    if req.user.is_authenticated():
    	if req.user.profile.registrationca_set.count()>=1:
			is_registered = True

    return render(req, template, {
        'is_registered': is_registered
    })


@require_POST
def register(req):
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



    r = RegistrationCA()
    r.profile = req.user.profile


    try:
        r.save()
    except Exception:
        return JsonResponse({
            'errorCode': 'unknown',
            'errorMessage': 'Something went wrong! Try refreshing the page, or try again later'
        }, status=400)

    return HttpResponse(status=200)


@require_POST
def unregister(req):
    if not req.user.is_authenticated():
        return HttpResponse(status=400)
    try:
        reg = RegistrationCA.objects.get(profile=req.user.profile)
        reg.delete()

    except RegistrationCA.DoesNotExist:
        pass

    # we return 200, even if the user was previously
    # not registered to the event
    return HttpResponse(status=200)

def generate_exel(req):
    if not req.user.is_superuser:
        raise PermissionDenied

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="camus.csv"'
    writer = csv.writer(response)
    rca = RegistrationCA.objects.all()
    writer.writerow(['Campus Ambester'])
    writer.writerow([''])
    writer.writerow([''])
    writer.writerow(['Slno', 'Name', "Mobile", "Email", "College"])
    i=0
    for w in rca:
        writer.writerow([i+1, w.name, w.mobile, w.user.email, w.college])
        i+=1
    return response



