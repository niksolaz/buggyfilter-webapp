from django.contrib.auth.models import AbstractUser
from django.db import models

# ==========================================
# 6. ORGANIZATION MODEL (For Multi-Tenant Support)
# ==========================================
class Organization(models.Model):
    """
    Rappresenta la Software House o l'Azienda.
    L'unità di isolamento principale del SaaS.
    """
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    # Qui in futuro potremmo aggiungere campi come 'plan' (Free, Pro) o 'subscription_id'

    def __str__(self):
        return self.name
# ==========================================
# 1. USER MODEL (Custom)
# ==========================================
class User(AbstractUser):
    ROLE_CHOICES = [
        ('CLIENT', 'Client'),
        ('OPERATOR', 'Operator'),
        ('OWNER', 'Owner'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CLIENT')

    # NUOVA RIGA: Ogni utente appartiene a un'organizzazione.
    # null=True perché un cliente potrebbe non essere legato a un'organizzazione
    # ma solo a un progetto specifico, o l'owner creato inizialmente.
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# ==========================================
# 2. PROJECT MODEL
# ==========================================
class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# ==========================================
# 3. PROJECT MEMBER (Relazione Utenti <-> Progetti)
# ==========================================
class ProjectMember(models.Model):
    """
    Tabella di giunzione per gestire chi appartiene a quale progetto
    e con quale ruolo specifico in quel progetto.
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_memberships')
    role_in_project = models.CharField(max_length=20, default='MEMBER') # es: Admin, Member, Viewer
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'user') # Impedisce che un utente sia due volte nello stesso progetto

    def __str__(self):
        return f"{self.user.username} in {self.project.name}"

# ==========================================
# 4. TICKET MODEL
# ==========================================
class Ticket(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'Todo'),
        ('IN_PROGRESS', 'In Progress'),
        ('IN_REVIEW', 'In Review'),
        ('DONE', 'Done'),
    ]
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]

    # Relazioni
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tickets')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_tickets')
    operator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')

    # Dati Ticket
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')

    # Campi Tecnici (Invisibili al Cliente)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, null=True, blank=True)
    estimated_hours = models.IntegerField(null=True, blank=True)
    ai_solution = models.TextField(blank=True) # Brief tecnico generato dall'AI

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

# ==========================================
# 5. MESSAGE MODEL (Chat AI/User/Operator)
# ==========================================
class Message(models.Model):
    """
    Storico di tutti i messaggi scambiati per un ticket.
    """
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp'] # I messaggi sono sempre ordinati per tempo

    def __str__(self):
        return f"Msg from {self.sender} for ticket {self.ticket_id}"