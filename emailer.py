import smtplib
import os
from email.message import EmailMessage


EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587

EMAIL_USER = os.getenv("EMAIL_USER")       # admin email
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")  # app password
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")     # where to receive messages


def send_email(name, email, message):
    if not EMAIL_USER or not EMAIL_PASSWORD or not ADMIN_EMAIL:
        raise EnvironmentError("Email environment variables not set")

    msg = EmailMessage()
    msg["Subject"] = "📩 New Contact Message"
    msg["From"] = EMAIL_USER
    msg["To"] = ADMIN_EMAIL

    msg.set_content(
        f"""
New Contact Message

Name: {name}
Email: {email}

Message:
{message}
        """
    )

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)

        return True

    except smtplib.SMTPException as e:
        raise RuntimeError(f"Email send failed: {e}")
