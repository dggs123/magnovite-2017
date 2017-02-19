import os
# from ipware.ip import get_real_ip
from datetime import timedelta

from django.conf import settings
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import logout, authenticate, login
from django.views.generic.edit import UpdateView
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from event.models import Registration
from message.models import Thread, Message

from .forms import ProfileForm
from .models import Profile
from .utils import AjaxableResponseMixin, template_email
# Create your views here.

def index(req):
    if settings.DEBUG:
        template = 'magnovite/home_new/index.html'
    else:
        template = 'magnovite/home_new/index.html'

    timer_zero = 'false'
    if settings.TIMER_ZERO:
        timer_zero = 'true'

    resp = render(req, template, {'timer_zero': timer_zero})

    if req.user.is_authenticated() and 'mag_uid' not in req.COOKIES:
        resp.set_cookie('mag_uid', req.user.get_id(), max_age=365*24*60*60)

    return resp

@csrf_exempt
def homeajax(req):
    if settings.DEBUG:
        template = 'content-desktop/home.html'
    else:
        template = 'content-desktop/home.html'
    resp = render(req, template, {})

    return resp


@csrf_exempt
def aboutajax(req):
    if settings.DEBUG:
        template = 'content-desktop/about.html'
    else:
        template = 'content-desktop/about.html'
    resp = render(req, template, {})

    return resp


def gallery(req):
    if settings.DEBUG:
        template = 'magnovite/home/gallary.html'
    else:
        template = 'magnovite/home/gallary.html'

    timer_zero = 'false'
    if settings.TIMER_ZERO:
        timer_zero = 'true'

    resp = render(req, template, {'timer_zero': timer_zero})

    return resp

def about(req):
    if settings.DEBUG:
        template = 'magnovite/home_new/about.html'
    else:
        template = 'magnovite/home_new/about.html'

    timer_zero = 'false'
    if settings.TIMER_ZERO:
        timer_zero = 'true'

    resp = render(req, template, {'timer_zero': timer_zero})

    return resp


def login_view(req):
    """
    This is not intended to be a user facing feature, and thus no GUI
    """
    username = req.GET.get('u', '')
    password = req.GET.get('p', '')

    if not username or not password:
        return redirect('/')

    if req.user.is_authenticated():
        logout(req)

    user = authenticate(username=username, password=password)
    if user is not None:
        login(req, user)

    return redirect('/')


def logout_view(req):
    if req.user.is_authenticated():
        logout(req)

    next_url = req.GET.get('next', '/')
    if "profile" in next_url:
        next_url="/"
    print next_url

    resp = HttpResponseRedirect(next_url)
    resp.delete_cookie('mag_uid')
    return resp

def loginuser_view(req):
    if settings.DEBUG:
        template = 'magnovite/home_new/loginuser.html'
    else:
        template = 'magnovite/home_new/loginuser.html'

    timer_zero = 'false'
    if settings.TIMER_ZERO:
        timer_zero = 'true'

    resp = render(req, template, {'timer_zero': timer_zero})

    return resp

@csrf_exempt
def loginuserajax(req):
    if settings.DEBUG:
        template = 'content-desktop/loginuser.html'
    else:
        template = 'content-desktop/loginuser.html'

    timer_zero = 'false'
    if settings.TIMER_ZERO:
        timer_zero = 'true'

    resp = render(req, template, {'timer_zero': timer_zero})

    return resp

def sponsors(req):
    if settings.DEBUG:
        template = 'magnovite/new/sponsor.html'
    else:
        template = 'magnovite/new/sponsor.html'

    resp = render(req, template, {})

    return resp

@require_POST
@login_required
def add_message(req):
    content = req.POST.get('text', '')
    if content == '':
        return JsonResponse({
            'errorCode': 'invalid_request',
            'errorMessage': 'Invalid request, no text parameter'
        }, status=400)

    thread, created = Thread.objects.get_or_create(profile=req.user.profile)

    # rate limit
    if (thread.is_pending):
        last_staff_msg = Message.objects.filter(is_staff=True, thread=thread.id)
        ratelimit_hour = timezone.now() - timedelta(hours=6)

        time_check = ratelimit_hour
        if (last_staff_msg and last_staff_msg[0].timestamp > ratelimit_hour):
            # chose last hour, or the last time a staff replied
            time_check = last_staff_msg[0].timestamp

        count = Message.objects.filter(timestamp__gt=time_check).count()

        if (count >= 5):
            return JsonResponse({
                'errorCode': 'ratelimit',
                'errorMessage': 'Please wait for a response before trying to send further requests.'
            }, status=400)

    thread.is_pending = True
    thread.save()

    message = Message(thread=thread, content=content)
    message.save()

    template_email(settings.DEFAULT_FROM_EMAIL, settings.HELP_INCHARGE,
                   '[Mag:help] : ' + req.user.email,
                   'admin_help_request',
                   {'user': req.user.profile, 'message': message})

    return HttpResponse(status=200)


@login_required
def profile(req):
    if settings.DEBUG:
        template = 'magnovite/profile.html'
    else:
        template = 'magnovite/profile.html'

    open_r = False

    if "btech.christuniversity.in" in req.user.email or "mtech.christuniversity.in" in req.user.email:
        open_r = True
    else:
        open_r = False

    profile_form = ProfileForm(instance=req.user.profile)

    registrations = Registration.objects.filter(profile=req.user.profile)
    day_one = map(lambda x: x.event, registrations)
    workshop=[]

    workshop = req.user.profile.registered_workshops.all()
    # evaluate maps
    day_one = [x for x in day_one]

    

    messages = []
    try:
        messages = req.user.profile.thread.messages.all()
    except:
        pass

    owned_teams = []
    for obj in Registration.objects.filter(profile=req.user.profile, is_owner=True):
        event = obj.event
        num_members = Registration.objects.filter(team_id=obj.team_id).count()

        owned_teams.append((event, num_members))

    test_payment = False
    if req.user.is_staff and os.environ.get('TEST_PAYMENT', None) != None:
        test_payment = True

    return render(req, template, {
        'profile_form': profile_form,
        'days': [day_one],
        'workshop': [workshop],
        'help_messages': messages,
        'owned_teams': owned_teams,
        'test_payment': test_payment,
        'open_r':open_r
    })


@require_POST
@login_required
def accomodation(req):
    req.user.profile.hospitality_days = 1
    try:
        
        req.user.profile.save()

    except Exception:
        return JsonResponse({
            'errorCode': 'unknown',
            'errorMessage': 'Something went wrong! Try refreshing the page, or try again later'
        }, status=400)

    return HttpResponse(status=200)



class ProfileUpdate(AjaxableResponseMixin, UpdateView):
    model = Profile
    form_class = ProfileForm
    http_method_names = ['post']

profile_update_view = ProfileUpdate.as_view()
