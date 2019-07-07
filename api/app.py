from flask import Flask
from flask_socketio import SocketIO
from config import get_mail
from core import get_logger
from core.utils import basic_logging
from dal.shared import db
import core

app_logger = get_logger()


def init_app(mode='web') -> Flask:
    this_app = Flask(__name__)

    this_app.config.from_envvar('APP_SETTINGS_PATH')
    this_app.debug = this_app.config['APP_ENV'] == 'develop'
    this_app.env = this_app.config['APP_ENV']
    basic_logging(app_logger.handlers, this_app.env)

    core.Encryptor.password = this_app.config['SECRET_KEY']

    if mode == 'web':
        core.error_handler(this_app)
        core.cache.init_app(this_app, config=this_app.config['CACHE_CONFIG'])
        core.Router(this_app)
        this_app.wsgi_app = core.Middleware(this_app.wsgi_app, this_app.debug)
        core.runner(this_app)

    db.init_app(this_app)
    this_app.mail = get_mail(this_app)

    return this_app


if __name__ == '__main__':
    app = init_app()
    socketio = SocketIO(app)
    socketio.run(app, host='0.0.0.0', port=5000, debug=app.debug)
