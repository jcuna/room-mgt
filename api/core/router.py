import importlib
from sqlalchemy.exc import ProgrammingError, OperationalError
from flask import Flask, url_for, render_template, redirect, request, Blueprint
from flask_restful import Api
import json
from config.routes import register, no_permissions
import re

from core.AWS import Resource
from dal import db
from dal.models import User, Role, UserAttributes, admin_access, admin_preferences, CompanyProfile
from dal.shared import get_fillable

permissions = {}
base = Blueprint('base', __name__, url_prefix='/')


class Router:
    version = 'v1.0'
    routes = {}

    def __init__(self, app: Flask):
        api = Api(app)
        app.register_blueprint(base)
        app.url_map.strict_slashes = False

        for concat_data, concat_route in register().items():
            parts = re.split('\\W+', concat_data)

            full_routes = []
            for route in re.split('\\|', concat_route):
                full_routes.append('/' + self.version + route)

            pack_name = 'views.' + parts[0]
            pack = importlib.import_module(pack_name, parts[1])
            mod = getattr(pack, parts[1])
            api.add_resource(mod, *full_routes, endpoint=parts[2])
            if pack_name + '.' + parts[1] not in no_permissions:
                permissions.update({parts[2]: pack_name + '.' + parts[1]})

            with app.test_request_context():
                self.routes.update({parts[2]: url_for(parts[2])})


@base.route('/status')
def status():
    return {'status': 'ok'}


@base.route('/routes')
def routes():
    return render_template('routes.html', routes=Router.routes)


@base.route('/install', methods=['GET', 'POST'])
def install():
    try:
        if User.query.count() > 0:
            return redirect('/')
    except (ProgrammingError, OperationalError):
        from helpers import run_migration
        run_migration()

    if request.method == 'POST':
        data = request.form
        if 'first_name' in data and data['first_name'] and 'last_name' in data and data['last_name'] \
                and 'email' in data and data['email'] and 'password' in data and data['password'] \
                and 'company_name' in data and 'address' in data and 'contact' in data:
            user_data = get_fillable(User, **data)
            user = User(**user_data)
            user.email = user.email.lower()
            user.hash_password()

            user.attributes = UserAttributes(
                user_access=json.dumps(admin_access),
                user_preferences=json.dumps(admin_preferences)
            )

            company_data = get_fillable(CompanyProfile, **data)
            company = CompanyProfile(**company_data)
            company.name = data['company_name']
            if 'logo' in request.files:
                company.logo = request.files.get('logo').read()

            admin_perms = {}

            for endpoint, permission in permissions.items():
                admin_perms.update({permission: ['read', 'write', 'delete']})

            role = Role(name='Admin', permissions=json.dumps(admin_perms))
            db.session.add(role)

            user.roles.append(role)
            db.session.add(user)
            db.session.add(company)

            db.session.commit()

            create_dynamo_db_table()

            return redirect('/')
        else:
            return render_template('install.html', error='Invalid submission'), 400

    return render_template('install.html', error=None)


def create_dynamo_db_table():
    r = Resource()
    from config import configs

    table = r.get_client('dynamodb').create_table(
        TableName=configs.AWS_MONTHLY_REPORT_TABLE,
        KeySchema=[
            {
                'AttributeName': 'uid',
                'KeyType': 'HASH'  #Partition key
            },
            {
                'AttributeName': 'project_id',
                'KeyType': 'RANGE'  #Sort key
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'uid',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'project_id',
                'AttributeType': 'N'
            },
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 10,
            'WriteCapacityUnits': 5
        }
    )
    return table
