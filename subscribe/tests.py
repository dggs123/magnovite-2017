from django.test import TestCase, RequestFactory
from django.core.urlresolvers import reverse

from .models import Subscription


class TestSubscribe(TestCase):
    def test_wrong_method(self):
        resp = self.client.get(reverse('subscribe'))
        self.assertEqual(resp.status_code, 501)

    def test_empty_data(self):
        resp = self.client.post(reverse('subscribe'), {'email': ''})
        self.assertEqual(resp.status_code, 400)

    def test_success(self):
        resp = self.client.post(reverse('subscribe'), {'email': 'test@test.com'})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Subscription.objects.all().count(), 1)
