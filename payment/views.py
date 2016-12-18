from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.core.exceptions import PermissionDenied
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import mail_admins
from django.contrib import messages
from django.conf import settings

from app.event.models import Event, Registration
from app.event.utils import generate_team_id
from app.workshop.models import Workshop

from app.main.utils import template_email
from .utils import get_payu_form, test_checksum
from .models import create_invoice, Invoice


def generate(req, invoice_type):
    if not req.user.is_authenticated():
        return JsonResponse({
            'status': 'error',
            'errorMessage': 'Please Login/Register first'
        }, status=403)

    if invoice_type not in ('test', 'team', 'single', 'multiple',
                            'upgrade', 'workshop', 'hospitality'):
        return JsonResponse({
            'status': 'error',
            'errorMessage': 'Invalid invoice type'
        }, status=400)


    if not req.user.profile.is_complete():
        return JsonResponse({
            'errorCode': 'profile_incomplete',
            'actionType': 'redirect',
            'actionText': 'Complete Now',
            'redirectLocation': '/profile/',
            'errorMessage': 'You need to complete your profile first'
        }, status=400)

    # if team verify event is correct
    if invoice_type == 'team':
        event = get_object_or_404(Event, id=req.GET.get('id', None))
        invoice = create_invoice(invoice_type, req.user.profile, event=event)
        return get_payu_form(req, invoice)

    elif invoice_type in ('single', 'multiple'):
        invoice = create_invoice(invoice_type, req.user.profile)
        return get_payu_form(req, invoice)

    elif invoice_type == 'upgrade':
        # upgrade only valid if user is in single pack
        if req.user.profile.pack != 'single':
            return JsonResponse({
                'status': 'error',
                'errorMessage': 'Upgrade only valid for single pack'
            }, status=400)

        invoice = create_invoice(invoice_type, req.user.profile)
        return get_payu_form(req, invoice)

    elif invoice_type == 'test':
        if not req.user.is_staff:
            return HttpResponse(status=403)

        invoice = create_invoice(invoice_type, req.user.profile)
        return get_payu_form(req, invoice)

    elif invoice_type == 'workshop':
        workshop = get_object_or_404(Workshop, id=req.GET.get('id', None))
        invoice = create_invoice(invoice_type, req.user.profile, workshop=workshop)
        return get_payu_form(req, invoice)

    elif invoice_type == 'hospitality':
        # validate
        try:
            days = int(req.GET.get('days', None))
            if days <= 0 or days > 6 or days <= req.user.profile.hospitality_days:
                raise ValueError
        except ValueError:
            return JsonResponse({
                'status': 'error',
                'errorMessage': 'Invalid days'
            }, status=400)

        invoice = create_invoice(invoice_type, req.user.profile, days=days)
        return get_payu_form(req, invoice)

    # unrecognized invoice_type
    return JsonResponse({
        'status': 'error',
        'errorMessage': 'Unrecognized invoice type'
    }, status=403)


@csrf_exempt
@require_POST
def success(req):
    if not test_checksum(req.POST):
        messages.error(req, 'Invalid Transaction, please contact support (Error: ES01)')
        mail_admins('S-Checksum Fail', str(req.POST) + '\n\n' + test_checksum(req.POST, debug=True))
        print(req.POST)
        return redirect('/profile/#help')

    invoice_id = int(req.POST.get('txnid', '').split('-')[-1])
    invoice = get_object_or_404(Invoice, id=invoice_id)

    # if already processed skip
    if invoice.pending == False:
        return redirect('/profile/#pack')

    return_val = process_invoice(req, invoice)

    # invalid invoice
    if return_val == None:
        messages.error(req, 'Transaction could not be completed, please contact support (Error: ES02)')
        return redirect('/profile/#help')
    else:
        # Success
        template_email(
            'server@magnovite.net',
            (invoice.profile.active_email,),
            'Transaction Receipt',
            'payment_success',
            {
                'profile': invoice.profile,
                'invoice': invoice
            }
        )

        return return_val

@csrf_exempt
@require_POST
def failure(req):
    messages.error(req, 'Could not complete transaction, please try again or contact support (Error: EF01)')

    invoice_id = int(req.POST.get('txnid', '').split('-')[-1])
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        invoice.pending = False
        invoice.post_data = str(req.POST)
        invoice.success = False
        invoice.save()
    except Invoice.DoesNotExist:
        pass

    return redirect('/profile/#help')

@csrf_exempt
@require_POST
def notify(req):
    if not test_checksum(req.POST):
        # TODO: log
        print('ERROR: Invalid checksum in notify()')
        return HttpResponse()

    invoice_id = int(req.POST.get('txnid', '').split('-')[-1])
    invoice = get_object_or_404(Invoice, id=invoice_id)

    print(req.POST)

    # if already processed skip
    if invoice.pending == False:
        print('INFO: Skipping invoice already processed')
        return HttpResponse()

    return_val = process_invoice(req, invoice)

    # invalid invoice
    if return_val == None:
        messages.error(req, 'Invalid Transaction, please contact support (Error: EN01)')

    return HttpResponse()


def process_invoice(req, invoice):
    """
    This is not a view, rather a helper function which processes the invoices
    """
    invoice.status = req.POST.get('status', '')
    invoice.success = True
    invoice.pending = False

    invoice.post_data = str(req.POST)
    invoice.save()

    if invoice.invoice_type in ('single', 'multiple', 'upgrade'):
        new_pack = invoice.invoice_type

        payment = 100
        if new_pack == 'multiple':
            payment = 200

        elif new_pack == 'upgrade':
            payment = 100
            new_pack = 'multiple'

        invoice.profile.pack = new_pack
        invoice.profile.total_payment += payment
        invoice.profile.save()

        messages.success(req, invoice.profile.get_pack_display() + ' has successfully been activated!')
        return redirect('/profile/#pack')

    elif invoice.invoice_type == 'team':
        team_id = generate_team_id(req.user.email, invoice.event)

        invoice.profile.total_payment += 500
        invoice.profile.save()

        r = Registration()
        r.event = invoice.event
        r.profile = req.user.profile
        r.team_id = team_id
        r.is_owner = True
        r.save()

        messages.success(req, 'Scucessfully registered for ' + r.event.title)
        return redirect(r.event.get_absolute_url() + '#view-team')

    elif invoice.invoice_type == 'workshop':
        invoice.profile.registered_workshops.add(invoice.workshop)

        invoice.profile.total_payment += invoice.workshop.price
        invoice.profile.save()

        messages.success(req, 'Successfully registered for ' + invoice.workshop.title)
        return redirect('/workshops/')

    elif invoice.invoice_type == 'test':
        messages.success(req, 'Payment success!')
        return redirect('/profile/#pack')

    elif invoice.invoice_type == 'hospitality':
        invoice.profile.total_payment += invoice.amount
        invoice.profile.hospitality_days = invoice.days
        invoice.profile.save()

        # Success
        template_email(
            'server@magnovite.net',
            settings.ACCOMODATION_INCHARGE,
            'New Accomodation Request',
            'accomodation_request',
            {
                'profile': invoice.profile,
            }
        )

        messages.success(req, 'Successfully applied for ' + str(invoice.days) + ' day(s)')
        return redirect('/profile/#hospitality')

    # invalid invoice
    return None
