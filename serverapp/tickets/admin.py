# tickets/admin.py
from django.contrib import admin
from .models import User, Project, ProjectMember, Ticket, Message

# Registriamo i modelli in modo semplice
admin.site.register(User)
admin.site.register(Project)
admin.site.register(ProjectMember)
admin.site.register(Ticket)
admin.site.register(Message)