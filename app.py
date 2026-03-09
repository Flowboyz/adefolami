# app.py — Main Flask Application
# Adefolami Structural Solutions
# Features: contact form, WhatsApp notify, email notify,
#            CMS content injection, admin blueprint.

from flask import Flask, render_template, request, jsonify
from email_validator import validate_email, EmailNotValidError
from whatsapp import send_whatsapp_message
from emailer import send_email
from admin import admin_bp, load_cms
import json, os

app = Flask(__name__)
app.secret_key = "FLOWBOYZ_SECRET_KEY"   # ← replace with a strong random key in production

# ── Register admin blueprint ──────────────────────────────────
app.register_blueprint(admin_bp)

# ── CMS context processor ─────────────────────────────────────
# Injects {{ cms }} into every template automatically so index.html
# can render the latest admin-edited content on every request.
@app.context_processor
def inject_cms():
    return dict(cms=load_cms())

# ── Contacts file ─────────────────────────────────────────────
CONTACTS_FILE = 'contacts.json'

def save_contact(data):
    existing = []
    if os.path.exists(CONTACTS_FILE):
        try:
            with open(CONTACTS_FILE, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except Exception:
            existing = []
    existing.append(data)
    with open(CONTACTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)

# ════════════════════════════════════════════════════════════
#  PUBLIC ROUTES
# ════════════════════════════════════════════════════════════

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    try:
        payload = request.get_json()
        name    = payload.get('name', '').strip()
        email   = payload.get('email', '').strip()
        message = payload.get('message', '').strip()

        if not name or not email or not message:
            return jsonify({'ok': False, 'error': 'All fields are required.'}), 400

        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({'ok': False, 'error': 'Invalid email address.'}), 400

        contact_record = {'name': name, 'email': email, 'message': message}
        save_contact(contact_record)

        # Non-blocking notifications
        try:
            send_whatsapp_message(name, email, message)
        except Exception as e:
            print("WhatsApp failed:", e)

        try:
            send_email(name, email, message)
        except Exception as e:
            print("Email failed:", e)

        return jsonify({'ok': True, 'message': 'Thanks! We received your message.'})

    except Exception as e:
        print("Server error:", e)
        return jsonify({'ok': False, 'error': 'Server error.'}), 500

@app.route('/borehole')
def borehole():
    return render_template('borehole.html')

@app.route('/hotelmotif')
def hotel():
    return render_template('hotelmotif.html')

@app.route('/renovation')
def renovation():
    return render_template('renovation.html')

@app.route('/roadconstruct')
def road():
    return render_template('roadconstruct.html')

@app.route('/team')
def team():
    return render_template('team.html')

if __name__ == '__main__':
    app.run(debug=True)
