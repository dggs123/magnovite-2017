from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model

from main.models import MUser


class AuthUserTestCase(TestCase):
    def setUp(self):
        self.model = get_user_model()

    def test_super_user_model(self):
        self.assertEqual(get_user_model(), MUser)

    def test_create_user(self):
        self.model.objects.create_user('test@test.com', 'test')
        try:
            self.model.objects.get(email='test@test.com')
        except self.model.DoesNotExist as e:
            self.fail('Create User failed')

