from _decimal import Decimal
from datetime import datetime, timedelta
from flask import request
from sqlalchemy.orm import joinedload, Load
from core import API
from core.middleware import HttpException
from core.utils import local_to_utc
from dal.models import RentalAgreement, TenantHistory, Room, TimeInterval, Policy, Balance, Payment, Tenant
from dal.shared import token_required, access_required, db, get_fillable, Paginator, row2dict
from views import Result


class Agreements(API):

    @token_required
    @access_required
    def get(self, agreement_id=None):
        pass

    @token_required
    @access_required
    def post(self):

        data = request.get_json()
        tenant_data = {
            'tenant_id': data['tenant_id'],
            'reference1_phone': data['reference1']
        }
        utc_date = local_to_utc(data['date'])

        if utc_date.date() < (datetime.utcnow().date() - timedelta(days=5)):
            raise HttpException('Invalid date', 400)

        if data['reference2']:
            tenant_data['reference2_phone'] = data['reference2']
        if data['reference3']:
            tenant_data['reference3_phone'] = data['reference3']

        tenant_history = TenantHistory(**tenant_data)
        room = Room.query.filter_by(id=data['room_id']).first()
        interval = TimeInterval.query.filter_by(id=data['interval']).first()
        project_id = request.user.attributes.preferences['default_project']
        agreement = RentalAgreement(
            tenant_history=tenant_history,
            room=room, interval=interval,
            project_id=project_id,
            rate=data['rate'],
            deposit=data['deposit'],
            entered_on=utc_date
        )

        balance = Balance(
            agreement=agreement,
            balance=Decimal(agreement.rate) + Decimal(agreement.deposit),
            previous_balance=0.00,
            due_date=agreement.entered_on
        )

        db.session.add(agreement)
        db.session.add(balance)
        db.session.commit()

        return Result.id(agreement.id)

    @token_required
    @access_required
    def put(self, agreement_id):

        data = request.get_json()
        agreement = RentalAgreement.query.filter_by(id=agreement_id).first()

        if 'terminated_on' in data:
            date = local_to_utc(data['terminated_on']).date()
            if date > datetime.utcnow().date():
                raise HttpException('Invalid date', 400)
            agreement.terminated_on = date

        for item in get_fillable(RentalAgreement, **data):
            setattr(agreement, item, data[item])

        if data['refund']:
            # find current balance and deduct refund from it and make a negative payment
            balance = Balance.query.options(joinedload('payments')).filter_by(agreement_id=agreement.id).order_by(Balance.due_date.desc()).first()
            refund = Decimal(data['refund'])
            balance.balance -= refund
            last_pay: Payment
            last_pay = balance.payments[-1]
            balance.payments.append(Payment(amount=-refund, payment_type_id=last_pay.payment_type_id))

        db.session.commit()

        return Result.success()


class BalancePayments(API):

    @token_required
    @access_required
    def post(self):

        data = request.get_json()

        balance = Balance.query.filter_by(id=data['balance_id']).first()
        payment = Payment(**get_fillable(Payment, **data))
        balance.payments.append(payment)

        db.session.commit()

        return Result.id(payment.id)

    def delete(self, payment_id):
        pass

    def get(self, payment_id):
        pass


class Policies(API):

    @token_required
    @access_required
    def get(self):
        pass

    @token_required
    @access_required
    def post(self):
        pass

    @token_required
    @access_required
    def put(self):
        pass


class Receipts(API):

    @token_required
    @access_required
    def get(self):

        project_id = request.user.attributes.preferences['default_project']
        result = []

        query = Payment.query.options(
            joinedload('balances'),
            joinedload('balances.agreement'),
            joinedload('balances.agreement.tenant_history'),
            joinedload('balances.agreement.tenant_history.tenant'),
        ).join(Balance, (Balance.id == Payment.balance_id)).join(RentalAgreement).join(TenantHistory).options(
            Load(TenantHistory).load_only('id'),
        ).join(Tenant).filter(RentalAgreement.project_id == project_id)
        page = request.args.get('page') if 'page' in request.args else 1

        if 'tenant' in request.args:
            query = query.filter(Tenant.id == request.args.get('tenant'))
        elif 'receipt' in request.args:
            query = query.filter(Payment.id == request.args.get('receipt'))
        elif 'paid_date' in request.args:
            day_start = datetime.strptime(request.args.get('paid_date') + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
            day_end = datetime.strptime(request.args.get('paid_date') + ' 23:59:59', '%Y-%m-%d %H:%M:%S')
            query = query.filter(Payment.paid_date.between(day_start, day_end))

        order_by = request.args.get('orderBy') if 'orderBy' in request.args else 'id'
        paginator = Paginator(query, int(page), order_by, request.args.get('orderDir'))
        total_pages = paginator.total_pages
        receipts = paginator.get_result()

        if receipts:
            for row in receipts:
                receipt = row2dict(row)
                receipt['user'] = row2dict(row.balances.agreement.tenant_history.tenant)
                receipt['balance'] = row2dict(row.balances)
                receipt['balance']['agreement'] = row2dict(row.balances.agreement)
                result.append(receipt)

        return Result.paginate(result, page, total_pages)

    @token_required
    @access_required
    def post(self):
        pass

    @token_required
    @access_required
    def put(self):
        pass
