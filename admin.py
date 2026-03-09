# admin.py — Flask Admin Blueprint
# Handles: login/logout, session auth, CMS content API,
#           image uploads, contact list viewing.

import os
import json
import base64
from functools import wraps
from flask import (
    Blueprint, render_template, request, jsonify,
    session, redirect, url_for, current_app
)
from werkzeug.utils import secure_filename

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# ── Config ────────────────────────────────────────────────────
CMS_FILE       = 'cms_content.json'
CONTACTS_FILE  = 'contacts.json'
CREDS_FILE     = 'admin_creds.json'
UPLOAD_FOLDER  = os.path.join('static', 'uploads')
ALLOWED_EXT    = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}

# ── Default admin credentials ─────────────────────────────────
DEFAULT_CREDS = {
    'username': 'admin',
    'password': 'admin123'   # change via /admin/settings after first login
}

# ── Default CMS content (mirrors index.html) ─────────────────
DEFAULT_CMS = {
    'nav': {
        'brand': 'Adefolami Structural Solutions',
        'logo':  'static/img/folami-logo.png',
        'link1': 'About', 'link2': 'Services',
        'link3': 'Projects', 'link4': 'Contact'
    },
    'hero': {
        'headline': 'Revitalize your building structure',
        'subtext':  "Nigeria's trusted civil & structural engineering firm — "
                    "delivering world-class construction solutions across power, "
                    "oil & gas, and real estate sectors.",
        'btn_text': 'Get in touch',
        'btn_link': '#contact-form',
        'img':      'static/img/e1.png'
    },
    'about': {
        'title':   'ABOUT',
        'heading': 'ADEFOLAMI STRUCTURAL SOLUTIONS NIGERIA LIMITED',
        'body':    (
            'Adefolami Structural Solutions Nigeria Limited is a Nigerian '
            'Incorporated Company and locally owned. The company offers '
            'engineering construction and construction project management. '
            'We provide services to power distribution and transmission '
            'companies, parastatals, oil and pipeline municipalities and '
            'commercial/residential real estate developers. Our expertise '
            'includes building technology, civil and structural engineering.'
        ),
        'img': 'static/img/folami-logo.png'
    },
    'services': {
        'heading': 'SERVICES',
        'lead': (
            'ASSNL offers a wide range of civil and structural engineering '
            'construction ranging from steel structures, erections, reinforced '
            'concrete and road construction in gravel, paving block, concrete, '
            'Bitumen roads and associated drainage, culvert and bridge structures.'
        ),
        'cards': [
            {'title': 'Structural Engineering', 'img': 'static/img/event2.png'},
            {'title': 'Civil Engineering',      'img': 'static/img/road.png'},
            {'title': 'Project Management',     'img': 'static/img/manager.png'},
            {'title': 'Building Construction',  'img': 'static/img/estate2.png'},
            {'title': 'Additional Services',    'img': 'static/img/services.png'},
        ]
    },
    'projects': {
        'heading': 'PROJECTS',
        'entries': [
            {'caption': 'HOTEL MOTIF',                          'img': 'static/img/hotel.png',      'link': '/hotelmotif'},
            {'caption': 'ROAD CONSTRUCTION',                    'img': 'static/img/road.png',       'link': '/roadconstruct'},
            {'caption': 'BOREHOLE DRILLING',                    'img': 'static/img/borehole.png',   'link': '/borehole'},
            {'caption': 'SCHOOL RENOVATION (AGILE PROJECT)',    'img': 'static/img/renovation.png', 'link': '/renovation'},
            {'caption': 'DUPLEX CONSTRUCTION, SUNSHINE ESTATE', 'img': 'static/img/estate1.png',    'link': ''},
            {'caption': 'BOX CULVERT',                          'img': 'static/img/box.jpg',        'link': ''},
            {'caption': '750 CAPACITY EVENT HALL, IJEBU ODE',   'img': 'static/img/event1.png',     'link': ''},
            {'caption': 'DECORATIVE CONCRETE WALKWAY',          'img': 'static/img/walkway.png',    'link': ''},
            {'caption': 'OUR TECHNICAL TEAM',                   'img': 'static/img/team.png',       'link': '/team'},
        ]
    },
    'stats': {
        'label1': 'Year Established',  'value1': '2009',
        'label2': 'Skilled Artisans',  'value2': '56',
        'label3': 'Completed Projects','value3': '200+'
    },
    'testimonials': {
        'heading': 'FROM OUR SATISFIED CUSTOMER',
        'entries': [
            {'quote': 'Boost your product credibility...', 'name': 'Bass Co.',      'img': 'static/img/p1.png'},
            {'quote': 'Trusted service delivery...',       'name': 'Bass Co.',      'img': 'static/img/black-engineers-supervising-industrial-automation-system.jpg'},
            {'quote': 'People love recommendations...',    'name': 'Micheleur Law', 'img': 'static/img/p3.png'},
            {'quote': 'Valuable feedback...',              'name': 'Studio Rallia', 'img': 'static/img/p2.png'},
            {'quote': 'Professional experience...',        'name': 'Studio Rallia', 'img': 'static/img/all-black-team-engineers-comparing-solar-panels-designs-laptop.jpg'},
            {'quote': 'Customer trust matters...',         'name': 'Bass Co.',      'img': 'static/img/p2.png'},
            {'quote': 'Credibility sells...',              'name': 'Bass Co.',      'img': 'static/img/p1.png'},
            {'quote': 'Recommendations win...',            'name': 'Micheleur Law', 'img': 'static/img/working-housing-project.jpg'},
        ]
    },
    'certs': {
        'heading': 'OUR CERTIFICATIONS & ACCREDITATIONS',
        'entries': [
            {'title': 'ISO 9001 Certification',                  'desc': 'Confirms our compliance with international quality management standards, ensuring efficient project execution, quality assurance, and customer satisfaction.', 'img': 'static/img/cert1.jpg'},
            {'title': 'Engineering Regulatory Council Approval', 'desc': 'Official approval confirming our company is legally registered and authorized to execute civil and structural engineering projects.',                        'img': 'static/img/cert2.jpg'},
            {'title': 'Safety Compliance Certificate',           'desc': 'Demonstrates strict adherence to industrial safety regulations.',                                                                                          'img': 'static/img/cert1.jpg'},
            {'title': 'Environmental Compliance',                'desc': 'Certified environmental sustainability practices.',                                                                                                        'img': 'static/img/cert3.jpg'},
            {'title': 'Construction License',                    'desc': 'Government-issued construction operating license.',                                                                                                        'img': 'static/img/cert4.jpg'},
            {'title': 'Project Excellence Award',                'desc': 'Awarded for outstanding engineering execution.',                                                                                                           'img': 'static/img/cert6.jpg'},
            {'title': 'Client Trust Certificate',                'desc': 'Recognition for consistent client satisfaction.',                                                                                                          'img': 'static/img/cert7.jpg'},
            {'title': 'Professional Membership',                 'desc': 'Registered member of engineering professional bodies.',                                                                                                    'img': 'static/img/cert8.jpg'},
            {'title': 'Quality Assurance',                       'desc': 'Proof of quality-controlled construction process.',                                                                                                        'img': 'static/img/cert9.jpg'},
            {'title': 'Operational Permit',                      'desc': 'Legal permit to operate engineering services.',                                                                                                            'img': 'static/img/cert10.jpg'},
        ]
    },
    'contact': {
        'heading':   'CONTACT US',
        'location':  'Ekiti State Nigeria.',
        'address':   'F6, Shelter View Estate, Ado Ekiti',
        'phone':     '+2348061242484',
        'email':     '',
        'facebook':  'https://www.facebook.com/profile.php?id=61585844184780',
        'twitter':   '', 'instagram': '', 'pinterest': '', 'youtube': '',
        'whatsapp':  '2348061242484'
    },
    'footer': {
        'address':   'F6, Shelter View Estate, Ado Ekiti',
        'hours':     '08:00 - 18:00, Mon - Sat',
        'copyright': 'Adefolami Structural Solutions | Created by Zammy and Bazillin'
    }
}

# ── File helpers ──────────────────────────────────────────────
def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return default.copy()

def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_cms():
    saved = load_json(CMS_FILE, {})
    # deep-merge defaults with saved so new keys always exist
    import copy
    merged = copy.deepcopy(DEFAULT_CMS)
    for section, val in saved.items():
        if isinstance(val, dict) and section in merged and isinstance(merged[section], dict):
            merged[section].update(val)
        else:
            merged[section] = val
    return merged

def load_creds():
    return load_json(CREDS_FILE, DEFAULT_CREDS)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT

# ── Auth decorator ────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            if request.is_json:
                return jsonify({'ok': False, 'error': 'Unauthorized'}), 401
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated

# ════════════════════════════════════════════════════════════
#  ROUTES
# ════════════════════════════════════════════════════════════

# ── Login ─────────────────────────────────────────────────────
@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        creds = load_creds()
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        if username == creds['username'] and password == creds['password']:
            session['admin_logged_in'] = True
            session.permanent = False
            return redirect(url_for('admin.dashboard'))
        error = 'Invalid username or password.'
    return render_template('admin/login.html', error=error)

# ── Logout ────────────────────────────────────────────────────
@admin_bp.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin.login'))

# ── Dashboard ─────────────────────────────────────────────────
@admin_bp.route('/')
@admin_bp.route('/dashboard')
@login_required
def dashboard():
    contacts = load_json(CONTACTS_FILE, [])
    cms = load_cms()
    return render_template('admin/dashboard.html', cms=cms, contact_count=len(contacts))

# ── CMS: get all content ──────────────────────────────────────
@admin_bp.route('/api/cms', methods=['GET'])
@login_required
def api_get_cms():
    return jsonify(load_cms())

# ── CMS: save a section ───────────────────────────────────────
@admin_bp.route('/api/cms/<section>', methods=['POST'])
@login_required
def api_save_section(section):
    if section not in DEFAULT_CMS:
        return jsonify({'ok': False, 'error': 'Unknown section'}), 400
    data = request.get_json(force=True)
    cms = load_cms()
    cms[section] = data
    write_json(CMS_FILE, cms)
    return jsonify({'ok': True, 'message': f'{section} saved.'})

# ── Image upload ──────────────────────────────────────────────
@admin_bp.route('/api/upload', methods=['POST'])
@login_required
def api_upload():
    if 'file' not in request.files:
        return jsonify({'ok': False, 'error': 'No file'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'ok': False, 'error': 'Empty filename'}), 400
    if not allowed_file(file.filename):
        return jsonify({'ok': False, 'error': 'File type not allowed'}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(file.filename)
    # avoid overwriting — prefix with a counter if needed
    base, ext = os.path.splitext(filename)
    counter = 1
    dest = os.path.join(UPLOAD_FOLDER, filename)
    while os.path.exists(dest):
        filename = f"{base}_{counter}{ext}"
        dest = os.path.join(UPLOAD_FOLDER, filename)
        counter += 1

    file.save(dest)
    url = f'static/uploads/{filename}'
    return jsonify({'ok': True, 'url': url, 'filename': filename})

# ── Contacts list ─────────────────────────────────────────────
@admin_bp.route('/contacts')
@login_required
def contacts():
    items = load_json(CONTACTS_FILE, [])
    items.reverse()   # newest first
    return render_template('admin/contacts.html', contacts=items)

@admin_bp.route('/api/contacts', methods=['GET'])
@login_required
def api_contacts():
    items = load_json(CONTACTS_FILE, [])
    items.reverse()
    return jsonify(items)

# ── Section editor page ───────────────────────────────────────
SECTION_TITLES = {
    'nav':          'Navigation',
    'hero':         'Hero Section',
    'about':        'About',
    'services':     'Services',
    'projects':     'Projects',
    'stats':        'Statistics',
    'testimonials': 'Testimonials',
    'certs':        'Certificates & Accreditations',
    'contact':      'Contact Section',
    'footer':       'Footer',
    'password':     'Change Password',
}
SECTION_SUBS = {
    'nav':          'Edit brand name, logo and navigation link labels.',
    'hero':         'Edit the main banner headline, subtext, button and image.',
    'about':        'Edit the about heading, body text and company logo.',
    'services':     'Edit the section heading, lead paragraph and all 5 service cards.',
    'projects':     'Edit each project caption, image and link URL.',
    'stats':        'Edit the three statistics shown in the gold band.',
    'testimonials': 'Edit client quotes, names and photos.',
    'certs':        'Edit each certificate slide — title, description and image.',
    'contact':      'Edit address, phone, email and social media links.',
    'footer':       'Edit footer address, hours and copyright text.',
    'password':     'Update the admin login credentials.',
}

@admin_bp.route('/section/<name>')
@login_required
def section(name):
    if name not in SECTION_TITLES:
        return redirect(url_for('admin.dashboard'))
    return render_template(
        'admin/section.html',
        section_name=name,
        cms=load_cms(),
        titles=SECTION_TITLES,
        subtitles=SECTION_SUBS
    )

# ── Change credentials ────────────────────────────────────────
@admin_bp.route('/api/credentials', methods=['POST'])
@login_required
def api_credentials():
    data = request.get_json(force=True)
    username = data.get('username', '').strip()
    password = data.get('password', '')
    if not username or not password:
        return jsonify({'ok': False, 'error': 'Both fields required'}), 400
    if len(password) < 6:
        return jsonify({'ok': False, 'error': 'Password must be at least 6 characters'}), 400
    write_json(CREDS_FILE, {'username': username, 'password': password})
    return jsonify({'ok': True, 'message': 'Credentials updated.'})
