import logging
import traceback

from flask import Flask, jsonify


class Middleware:

    def __init__(self, app: Flask, debug: bool):
        self.app = app
        self.debug = debug

    def __call__(self, environ, start_response) -> Flask:
        if self.debug:
            logging.basicConfig()

        return self.app(environ, start_response)


def error_handler(app: Flask):
    status_code = 500

    def handle_error_response(error: Exception):
        raise error
        json_output = {
            'error': str(error),
            'traceback': traceback.format_stack()
        }

        response = jsonify(json_output)

        if hasattr(error, 'status_code'):
            response.status_code = error.status_code
        else:
            response.status_code = status_code

        return response

    def handle_error_response_prod(error: Exception):
        app.logger.exception(error)
        json_output = {
            'error': 'An unexpected error occurred',
        }

        response = jsonify(json_output)

        if hasattr(error, 'status_code'):
            response.status_code = error.status_code
        else:
            response.status_code = status_code

        return response

    if app.debug:
        app.register_error_handler(Exception, handle_error_response)
    else:
        app.register_error_handler(Exception, handle_error_response_prod)
