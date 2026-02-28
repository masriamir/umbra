from django.db import models


class EFBase(models.Model):
    created_date = models.DateTimeField('Date Created', auto_now_add=True)
    updated_date = models.DateTimeField('Date Updated', auto_now=True)

    class Meta:
        abstract = True
