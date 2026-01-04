from flask import Blueprint, render_template, request, session, redirect, url_for
import json
import os

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

CONTACTS_FILE = 'contacts.json'

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "strongpassword123"


def admin_required():
    return session.get('admin_logged_in') is True


@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin.dashboard'))

        return render_template(
            'admin_login.html',
            error="Invalid credentials"
        )

    return render_template('admin_login.html')


@admin_bp.route('/dashboard')
def dashboard():
    if not admin_required():
        return redirect(url_for('admin.login'))

    if os.path.exists(CONTACTS_FILE):
        with open(CONTACTS_FILE, 'r', encoding='utf-8') as f:
            contacts = json.load(f)
    else:
        contacts = []

    return render_template(
        'admin_dashboard.html',
        contacts=contacts
    )


@admin_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('admin.login'))
