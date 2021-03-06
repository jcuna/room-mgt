import json
import re
from datetime import datetime

import sqlalchemy
from flask import request, session

from sqlalchemy.orm import joinedload, load_only
from core import API
from core.AWS import Resource
from core.middleware import HttpException
from dal.models import Project, TimeInterval, User, Room, PaymentType, RentalAgreement, TenantHistory, Tenant
from dal.shared import token_required, access_required, db, get_fillable, Paginator
from views import Result


class Projects(API):

    @token_required
    def get(self):

        access = request.user.attributes.user_access if hasattr(request.user.attributes, 'user_access') \
            else None

        q = Project.query.filter_by(deleted=None)

        if access:
            access = json.loads(access)
            if 'projects' in access:
                pl = access['projects']
                if pl == '*':
                    q = q.limit(10)
                else:
                    q = q.filter(Project.id.in_(pl))

        return {
            'projects': Result.model(q.all())
        }

    @token_required
    @access_required
    def post(self):

        data = request.get_json()

        if not data:
            return Result.error('project object is required')

        project = Project(name=data['name'], contact=data['phone'])

        if data['address']:
            project.address = data['address']

        db.session.add(project)
        db.session.commit()

        user = User.query.filter_by(email=session['user_email']).first()
        attr = {}
        if user.attributes.user_preferences:
            attr = user.attributes.preferences

        if data['active']:
            attr['default_project'] = project.id
        user.attributes.user_preferences = json.dumps(attr)
        db.session.commit()

        return Result.custom({'id': project.id})

    @token_required
    @access_required
    def put(self, project_id):
        data = request.get_json()

        updated_data = {}

        if 'active' in data:
            user = User.query.filter_by(email=session['user_email']).first()

            attr = {}
            if user.attributes.user_preferences:
                attr = user.attributes.preferences

            attr['default_project'] = project_id if data['active'] else None
            user.attributes.user_preferences = json.dumps(attr)

        if 'name' in data:
            updated_data.update({'name': data['name']})
        if 'address' in data:
            updated_data.update({'address': data['address']})
        if 'phone' in data:
            updated_data.update({'contact': data['phone']})
        if 'deleted' in data:
            updated_data.update({'deleted': datetime.utcnow()})

        if updated_data:
            db.session.query(Project).filter_by(id=project_id).update(updated_data)
        db.session.commit()

        return Result.success()


class Rooms(API):
    @token_required
    @access_required
    def get(self, room_id=None):

        project_id = request.user.attributes.preferences['default_project']

        if room_id:
            room = Room.query.filter_by(id=room_id).filter_by(project_id=project_id).first()

            if not room:
                raise HttpException('Not found', 404)

            room_dict = dict(room)
            room_dict['reserved'] = room.rental_agreement is not None
            return room_dict

        result = []
        page = request.args.get('page', 1)
        total_pages = 1

        if 'query' in request.args:
            q = request.args['query']
            rooms = Room.query.filter((Room.name.like('%' + q + '%'))).filter_by(project_id=project_id).all()

        else:
            sql_query = Room.query.options(joinedload('rental_agreement').load_only(RentalAgreement.id)) \
                .filter_by(project_id=project_id) \
                .outerjoin(RentalAgreement, RentalAgreement.room_id == Room.id)

            order_by = request.args.get('orderBy') if 'orderBy' in request.args else 'id'
            paginator = Paginator(sql_query, int(page), order_by, request.args.get('orderDir'))
            total_pages = paginator.total_pages
            rooms = paginator.get_result()

        if rooms:
            for room in rooms:
                room_dic = dict(room)
                room_dic['reserved'] = room.rental_agreement is not None
                result.append(room_dic)

        return Result.paginate(result, page, total_pages)

    @token_required
    @access_required
    def post(self):
        data = request.get_json()

        room_data = get_fillable(Room, **data)
        room = Room(**room_data)
        db.session.add(room)

        try:
            db.session.commit()
        except sqlalchemy.exc.IntegrityError:
            return Result.error('Nombre ya ha sido utilizado')

        return dict(id=room.id)

    @token_required
    @access_required
    def put(self, room_id):

        form_data = request.get_json()
        project_id = form_data['project_id']
        del form_data['project_id']

        object_data = get_fillable(Room, True, **form_data)

        Room.query.filter(Room.id == room_id).filter(Room.project_id == project_id) \
            .update(object_data)

        db.session.commit()

        return Result.success()


class TimeIntervals(API):

    @token_required
    def get(self):
        result = []
        for interval in TimeInterval.query.all():
            result.append(dict(interval))

        return result


class PaymentTypes(API):

    @token_required
    def get(self):
        result = []
        for payment in PaymentType.query.all():
            result.append(dict(payment))

        return result


class RoomsHistory(API):

    @token_required
    @access_required
    def get(self, room_id):
        page = request.args.get('page', 1)

        query = db.session.query(RentalAgreement).options(
            load_only(RentalAgreement.terminated_on, RentalAgreement.rate),
            joinedload(RentalAgreement.tenant_history)
                .load_only(TenantHistory.tenant_id)
                .joinedload(TenantHistory.tenant)
                .load_only(Tenant.first_name, Tenant.last_name),
            joinedload(RentalAgreement.interval).load_only(TimeInterval.interval)
        ).filter_by(room_id=room_id)

        order_by = request.args.get('orderBy') if 'orderBy' in request.args else 'created_on'
        order_dir = request.args.get('orderDir') if 'orderDir' in request.args else 'desc'
        paginator = Paginator(query, int(page), order_by, order_dir)
        total_pages = paginator.total_pages

        return Result.paginate(
            list(map(self.deconstruct_room_history, paginator.get_result())), page, total_pages
        )

    @staticmethod
    def deconstruct_room_history(row: RentalAgreement):
        return {
            'agreement_id': row.id,
            'rate': '{0:.2f}'.format(row.rate),
            'agreement_terminated_on': str(row.terminated_on) if row.terminated_on is not None else None,
            'tenant_name': ' '.join([row.tenant_history.tenant.first_name, row.tenant_history.tenant.last_name]),
            'tenant_id': row.tenant_history.tenant_id,
            'interval': row.interval.interval
        }


class Reports(API):

    @token_required
    @access_required
    def get(self, report_uid = None):

        r = Resource()

        if report_uid is not None:
            return self.get_by_uid(r, report_uid)

        project_id = request.args.get('project_id')

        if project_id is not None and \
                (request.user.attributes.access['projects'] != '*' and
                 str(project_id) not in request.user.attributes.access['projects']):
            raise HttpException('No access to project', 401)


        if project_id is None:
            project_id = request.user.attributes.preferences['default_project']
            if project_id is None:
                raise HttpException('No default project')

        start_key = None

        start_key_uid = request.args.get('uid')
        start_key_project_id = request.args.get('project_id')
        if start_key_project_id is not None and start_key_uid is not None:
            start_key = {'uid': start_key_uid, 'project_id': start_key_project_id}

        resp = r.scan(r.get_monthly_reports_table(), 'project_id', str(project_id), start_key=start_key)

        if len(resp['Items']) > 0:
            return {'items': resp['Items'], 'end_key': resp['LastEvaluatedKey'] if 'LastEvaluatedKey' in resp else {}}

        return Result.error('Not Found', 404)

    @staticmethod
    def get_by_uid(resource, report_uid):
        matches = re.match(r'([0-9]+)-([0-9-]*)', report_uid)
        project_id, from_date = matches.group(1), matches.group(2)
        if request.user.attributes.access['projects'] != '*' and \
                project_id not in request.user.attributes.access['projects']:
            raise HttpException('No access to project', 401)

        resp = resource.query(resource.get_monthly_reports_table(), 'project_id', project_id, 'from_date', from_date)

        if len(resp['Items']) > 0:
            return resp['Items'][0]
        return Result.error('Not Found', 404)
