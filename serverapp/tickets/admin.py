# tickets/admin.py
from django.contrib import admin
from .models import Organization, User, Project, ProjectMember, Ticket, Message

# Registriamo i modelli in modo semplice
admin.site.register(Organization)
admin.site.register(User)
admin.site.register(Project)
admin.site.register(ProjectMember)
admin.site.register(Ticket)
admin.site.register(Message)