import hashlib

from django.conf import settings
from django.shortcuts import render

def get_payu_form(req, invoice):
    profile = req.user.profile

    obj = {
        'key': settings.PAYU_MERCHANT_KEY,
        'txnid': invoice.get_id(),
        'amount': invoice.amount,
        'productinfo': invoice.description,
        'firstname': profile.first_name(),
        'email': profile.active_email,
        'phone': profile.mobile,
        'surl': settings.PAYU_SUCCESS_URL,
        'furl': settings.PAYU_FAILURE_URL,
        'notify_url': settings.PAYU_NOTIFY_URL,
        'service_provider': 'payu_paisa',
    }

    obj['hash'] = generate_checksum(obj)
    return render(req, 'magnovite/paymentForm.html', {
        'fields': obj.items(),
        'url': settings.PAYU_URL,
    })

PAYU_FIELDS = [
    'key', 'txnid', 'amount', 'productinfo', 'firstname', 'email',
    'udf1', 'udf2', 'udf3', 'udf4', 'udf5', 'udf6', 'udf7', 'udf8',
    'udf9', 'udf10'
]

def generate_checksum(obj):
    fields = PAYU_FIELDS

    text = '|'.join(map(lambda key: str(obj.get(key, '')), fields)) + '|' + settings.PAYU_MERCHANT_SALT
    return hashlib.sha512(text.encode('utf-8')).hexdigest()

def test_checksum(obj, debug=False):
    fields = reversed(PAYU_FIELDS + ['status'])

    text = settings.PAYU_MERCHANT_SALT + '|' + '|'.join(map(lambda key: str(obj.get(key, '')), fields))
    if obj.get('additionalCharges', '') != '':
        text = obj.get('additionalCharges', '') + '|' + text

    hashcode = hashlib.sha512(text.encode('utf-8')).hexdigest()

    if debug:
        return text + ' -- ' + hashcode + ' -- ' + obj.get('hash', '')

    return obj.get('hash', '') == hashcode
