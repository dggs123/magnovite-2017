from django.conf.urls import patterns, url

urlpatterns = patterns('app.payment.views',
    url(r'^generate/(?P<invoice_type>[-\w]+)/$', 'generate', name='generate_invoice'),
    url(r'^success/', 'success', name='payment_success'),
    url(r'^failure/', 'failure', name='payment_failure'),
    url(r'^notify/', 'notify', name='payment_notify'),
)
