import json

from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.http import Http404, JsonResponse, HttpResponse

from event.models import Event, Registration
from .models import Analytics


def index(req):
    if not (req.user.is_staff and req.user.has_perm('event.change_event')):
        raise Http404

    if settings.DEBUG:
        template = 'magnovite/dashboard.html'
    else:
        template = 'magnovite/dist/dashboard.html'

    qs = Event.objects.all()
    show_summary = True
    if not req.user.is_superuser and req.user.has_perm('event.change_own'):
        qs = qs.filter(heads=req.user.profile)
        show_summary = False

    return render(req, template, {
        'events': qs,
        'show_summary': show_summary,
    })


def analytics(req):
    """
    API endpoint for returning analytics for events
    """
    if not (req.user.is_staff and req.user.has_perm('event.change_event')):
        raise HttpResponse(status=401)

    if req.GET.get('ids', '') == '':
        return HttpResponse(status=400)

    try:
        ids = list(map(int, req.GET['ids'].split(',')))
    except ValueError:
        return HttpResponse(status=400)

    events = Event.objects.filter(id__in=ids)

    if not req.user.is_superuser and req.user.has_perm('event.change_own'):
        # make sure user has permission for all requested ids
        acceptable = Event.objects.filter(heads=req.user.profile)
        if events.exclude(id__in=acceptable).exists():
            return HttpResponse(status=401)

    out = []
    for day in Analytics.objects.all():
        events_a = list(filter(lambda o: o['id'] in ids, json.loads(day.data)))
        obj = {
            'date': day.date.strftime('%Y-%m-%d'),
            'events': [],
        }

        for event in events_a:
            obj['events'].append({
                'id': event['id'],
                'title': event['title'],
                'views': event['views'],
                'registrations': event['registrations'],
            })

        out.append(obj)

    return JsonResponse(out, safe=False)


def registrations(req, id):
    """
    API endpoint for returning registrations for given event
    """
    if not (req.user.is_staff and req.user.has_perm('event.change_registration')):
        return HttpResponse(status=401)

    # verify user has permission for given id
    event = get_object_or_404(Event, id=id)
    if not req.user.is_superuser and req.user.has_perm('event.own_event_registrations'):
        if not event.heads.filter(id=req.user.profile.id).exists():
            return HttpResponse(status=401)

    out = {
        'id': id,
        'title': event.title,
        'registrations': []
    }

    teams = {}
    for reg in Registration.objects.filter(event=event).select_related('profile'):
        obj = {
            'id': reg.profile.id,
            'name': reg.profile.name,
            'email': reg.profile.active_email,
            'mobile': reg.profile.mobile,
            'college': reg.profile.college,
        }

        if event.is_multiple():
            teams[reg.team_id] = teams.get(reg.team_id, []) + [obj]
        else:
            out['registrations'].append(obj)

    if event.is_multiple():
        for team_id, members in teams.items():
            out['registrations'].append({team_id: members})

    return JsonResponse(out, safe=False)


@csrf_exempt
def capture(req):
    if settings.DEBUG:
        secret = req.GET.get('secret', '')
    else:
        secret = req.POST.get('secret', '')

    if secret != settings.ANALYTICS_SECRET:
        status = 400
    else:
        status = 200
        Analytics.capture()

    return HttpResponse(status=status)
