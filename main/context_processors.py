from .models import Profile


def profile(request):
    if request.user.is_authenticated():
        try:
            profile = request.user.profile
            return {'profile' : profile}
        except Profile.DoesNotExist:
            pass

    return {'profile': ''}


def access(req):
    is_staff = req.user.is_staff

    access_level = ''
    has_admin = ''
    has_dashboard = ''

    if is_staff:
        if req.user.is_superuser:
            access_level = 'Superuser'
        else:
            access_level = req.user.groups.all()[0].name

        has_admin = req.user.is_staff
        # has_dashboard = req.user.has_perm('event.change_event')

    return {
        'is_staff': is_staff,
        'access_level': access_level,
        'has_admin': has_admin,
        'has_dashboard': has_dashboard,
    }

