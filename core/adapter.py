from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter


class NoteShareAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        return (
            f"{settings.BACKEND_URL}/api/social-login/complete/"
        )