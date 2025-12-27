from flask import Flask, render_template, request, jsonify, url_for
from email_validator import validate_email, EmailNotValidError
import json, os


app = Flask(__name__)


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
    json.dump(existing, f, indent=2)


@app.route('/')
def index():
 return render_template('index.html')


@app.route('/contact', methods=['POST'])
def contact():
    try:
        payload = request.get_json()
        name = payload.get('name','').strip()
        email = payload.get('email','').strip()
        message = payload.get('message','').strip()


        if not name or not email or not message:
            return jsonify({'ok': False, 'error': 'All fields are required.'}), 400


        try:
             validate_email(email)
        except EmailNotValidError as e:
             return jsonify({'ok': False, 'error': 'Invalid email address.'}), 400


        contact_record = {
        'name': name,
        'email': email,
        'message': message
        }


        save_contact(contact_record)


        return jsonify({'ok': True, 'message': 'Thanks! We received your message.'})
    except Exception as e:
        return jsonify({'ok': False, 'error': 'Server error.'}), 500


if __name__ == '__main__':
 app.run(debug=True)