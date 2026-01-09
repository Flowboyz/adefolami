import requests
import os


# Load from environment variables (SAFE)
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
ADMIN_PHONE = os.getenv("ADMIN_PHONE")  # format: 234XXXXXXXXX


def send_whatsapp_message(name, email, message):
    """
    Sends a WhatsApp message to the admin using WhatsApp Cloud API
    """
    if not WHATSAPP_TOKEN or not PHONE_NUMBER_ID or not ADMIN_PHONE:
        raise EnvironmentError("WhatsApp environment variables not set")

    url = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": ADMIN_PHONE,
        "type": "text",
        "text": {
            "body": (
                "📩 New Contact Message\n\n"
                f"Name: {name}\n"
                f"Email: {email}\n"
                f"Message:\n{message}"
            )
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)

        if response.status_code != 200:
            raise RuntimeError(
                f"WhatsApp API error {response.status_code}: {response.text}"
            )

        return True

    except requests.exceptions.RequestException as e:
        raise ConnectionError(f"WhatsApp request failed: {e}")

#setx WHATSAPP_TOKEN "YOUR_META_TOKEN"
#setx PHONE_NUMBER_ID "YOUR_PHONE_NUMBER_ID"
#setx ADMIN_PHONE "234XXXXXXXXX"