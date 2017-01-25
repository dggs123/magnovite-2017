import json

from django.http import HttpResponse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context, TemplateDoesNotExist


class AjaxableResponseMixin(object):
    """
    Mixin to add AJAX support to a form.
    Must be used with an object-based FormView (e.g. CreateView)
    """
    def render_to_json_response(self, context, **response_kwargs):
        data = json.dumps(context)
        response_kwargs['content_type'] = 'application/json'
        return HttpResponse(data, **response_kwargs)

    def form_invalid(self, form):
        response = super(AjaxableResponseMixin, self).form_invalid(form)
        if self.request.is_ajax():
            return self.render_to_json_response({
                'errors': form.errors,
                'status': 'fail'
            }, status=400)
        else:
            return response

    def form_valid(self, form):
        # We make sure to call the parent's form_valid() method because
        # it might do some processing (in the case of CreateView, it will
        # call form.save() for example).
        response = super(AjaxableResponseMixin, self).form_valid(form)
        if self.request.is_ajax():
            data = {
                'status': 'success',
                'pk': self.object.pk,
            }
            return self.render_to_json_response(data)
        else:
            return response




def template_email(from_email, to_email, subject, template, context):
    ctx = Context(context)

    plaintext = get_template('magnovite/email/text/' + template + '.text')
    #html = get_template('magnovite/email/html/' + template + '.html')

    plaintext = plaintext.render(ctx)
    #html = html.render(ctx)

    msg = EmailMultiAlternatives(subject, plaintext, from_email, to_email)
    #msg.attach_alternative(html, 'text/html')
    msg.send()
