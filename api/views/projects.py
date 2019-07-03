import json
import sqlalchemy
from datetime import datetime
from flask import request, session
from core import API
from core.middleware import HttpException
from dal.models import Project, TimeInterval, User, Room, PaymentType
from dal.shared import token_required, access_required, db, get_fillable, row2dict, Paginator
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
            'projects': list(map(lambda r: row2dict(r), q.all()))
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

        return dict(id=project.id)

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

            return row2dict(room)

        result = []
        page = request.args.get('page') if 'page' in request.args else 1
        total_pages = 1

        if 'query' in request.args:
            q = request.args['query']
            rooms = Room.query.filter((Room.name.like('%' + q + '%'))).filter_by(project_id=project_id).all()

        else:
            sql_query = Room.query.filter_by(project_id=project_id)
            order_by = request.args.get('orderBy') if 'orderBy' in request.args else 'id'
            paginator = Paginator(sql_query, int(page), order_by, request.args.get('orderDir'))
            total_pages = paginator.total_pages
            rooms = paginator.get_result()

        if rooms:
            for room in rooms:
                result.append(row2dict(room))

        return {'list': result, 'page': page, 'total_pages': total_pages}

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
            result.append(row2dict(interval))

        return result


class PaymentTypes(API):

    @token_required
    def get(self):
        result = []
        for payment in PaymentType.query.all():
            result.append(row2dict(payment))

        return result
