"""
Django settings for magnovite project.

Generated by 'django-admin startproject' using Django 1.10.4.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os
# import dj_database_url


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '89k_y!7ezyhbj!g%$)so3o!zbs^axh)7nk+$@228xb=rr&fl8i'

HELP_INCHARGE = (
    'gaurav.sehgal@btech.christuniversity.in',   
)

ACCOMODATION_INCHARGE = (
    'gaurav.sehgal@btech.christuniversity.in',
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# should countdown timer be zero
TIMER_ZERO = os.environ.get('TIMER_ZERO', False)

ID_OFFSET = int(os.environ.get('ID_OFFSET', 1432))

# Custom user model
AUTH_USER_MODEL = 'main.MUser'

SITE_ID = 1


# Application definition

INSTALLED_APPS = [
    'jet',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.humanize',


    # 3rd party
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',

    'main',
    'message',
    'subscribe',
    'event',
    'campusambester',
    'rightclick',
    'payment',
    'workshop',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'magnovite.urls'



TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',


                # `allauth` needs this from django
                'django.template.context_processors.request',

                # # allauth specific context processors
                # "allauth.account.context_processors.account",
                # "allauth.socialaccount.context_processors.socialaccount",

                # my processors
                'main.context_processors.profile',
                'main.context_processors.access',
            ],
        },
    },
]

AUTHENTICATION_BACKENDS = (
    
    # Needed to login by username in Django admin, regardless of `allauth`
    'django.contrib.auth.backends.ModelBackend',

    # `allauth` specific authentication methods, such as login by e-mail
    'allauth.account.auth_backends.AuthenticationBackend',
)

# allauth settings
SOCIALACCOUNT_AUTO_SIGNUP = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'email'
SOCIALACCOUNT_QUERY_EMAIL = True
ACCOUNT_EMAIL_VERIFICATION = 'none'

SOCIALACCOUNT_PROVIDERS = {
    'facebook': {
        'SCOPE': ['email'],
        'AUTH_PARAMS': {
            'auth_type': 'https'
        },
        'METHOD': 'oauth2',
        'LOCALE_FUNC': lambda _: 'en_US',
    },
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {
            'access_type': 'online'
        }
    },
    'github': {
        'SCOPE': ['user']
    }
}

# if not DEBUG:
#     ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"
# SOCIALACCOUNT_ADAPTER = 'main.allauth.MSocialAccountAdapter'
# payment settings
PAYU_MERCHANT_ID = os.environ.get('PAYU_MERCHANT_ID', '')
PAYU_MERCHANT_KEY = os.environ.get('PAYU_MERCHANT_KEY', '')
PAYU_MERCHANT_SALT = os.environ.get('PAYU_MERCHANT_SALT', '')

PAYU_URL = 'https://secure.payu.in/_payment'
PAYU_SUCCESS_URL = 'https://magnovite.net/payment/success/'
PAYU_FAILURE_URL = 'https://magnovite.net/payment/failure/'
PAYU_NOTIFY_URL = 'https://magnovite.net/payment/notify/'

if DEBUG:
    PAYU_MERCHANT_ID = 4944221
    PAYU_MERCHANT_KEY = 'Oj20qapU'
    PAYU_MERCHANT_SALT = 'auaSx01zGF'

    PAYU_URL = 'https://test.payu.in/_payment'
    PAYU_SUCCESS_URL = 'http://127.0.0.1:8000/payment/success/'
    PAYU_FAILURE_URL = 'http://127.0.0.1:8000/payment/failure/'
    PAYU_NOTIFY_URL = 'http://127.0.0.1:8000/payment/notify/'

LOGIN_REDIRECT_URL = '/profile/'
LOGIN_URL = '/#login'

WSGI_APPLICATION = 'magnovite.wsgi.application'



# email settings
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
DEFAULT_FROM_EMAIL = ''
DEFAULT_TO_EMAIL = 'gaurav.sehgal@btech.christuniversity.in'

# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

# https settings
# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True


# Update database configuration with $DATABASE_URL.
# db_from_env = dj_database_url.config(conn_max_age=500)
# DATABASES['default'].update(db_from_env)

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')



# Simplified static file serving.
# https://warehouse.python.org/project/whitenoise/

STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'