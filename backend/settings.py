import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-development-key"
)

DEBUG = os.getenv(
    "DJANGO_DEBUG",
    "True"
).lower() == "true"

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
]


# Application definition

INSTALLED_APPS = [

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",

    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.headless",

    "allauth.socialaccount.providers.google",
    "allauth.socialaccount.providers.facebook",

    "core",

]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [

    {

        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {

            "context_processors": [

                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",

            ],

        },

    },

]

WSGI_APPLICATION = "backend.wsgi.application"


DATABASES = {

    "default": dj_database_url.config(

        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",

        conn_max_age=600,

        conn_health_checks=True,

    )

}


AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },

    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },

    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },

    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },

]

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_DIRS = [

    BASE_DIR / "static",
]

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },

    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


REST_FRAMEWORK = {

    "DEFAULT_AUTHENTICATION_CLASSES": (

        "rest_framework_simplejwt.authentication.JWTAuthentication",

    ),

    "DEFAULT_PERMISSION_CLASSES": (

        "rest_framework.permissions.AllowAny",

    ),

}

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

ACCOUNT_LOGIN_METHODS = {"username", "email"}

ACCOUNT_EMAIL_VERIFICATION = "none"

SOCIALACCOUNT_EMAIL_VERIFICATION = "none"

SOCIALACCOUNT_QUERY_EMAIL = True

SOCIALACCOUNT_AUTO_SIGNUP = True


HEADLESS_TOKEN_STRATEGY = (
    "allauth.headless.tokens.strategies.jwt.JWTTokenStrategy"
)

HEADLESS_JWT_ALGORITHM = "HS256"

HEADLESS_JWT_ACCESS_TOKEN_EXPIRES_IN = 86400

HEADLESS_JWT_REFRESH_TOKEN_EXPIRES_IN = 604800

HEADLESS_FRONTEND_URLS = {
    "account_confirm_email":
        "http://localhost:5173/register",

    "account_reset_password":
        "http://localhost:5173/login",

    "account_reset_password_from_key":
        "http://localhost:5173/login",

    "socialaccount_login_error":
        "http://localhost:5173/login",
}


SIMPLE_JWT = {

    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),

    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": False,

    "BLACKLIST_AFTER_ROTATION": False,

    "UPDATE_LAST_LOGIN": True,

}


CORS_ALLOWED_ORIGINS = [

    "http://localhost:5173",

    "http://127.0.0.1:5173",

]

SOCIALACCOUNT_LOGIN_ON_GET = True 

LOGIN_REDIRECT_URL = (
    "http://127.0.0.1:8000/api/social-login/complete/"
)

LOGOUT_REDIRECT_URL = (
    "http://localhost:5173/"
)