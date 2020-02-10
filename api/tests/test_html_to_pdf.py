from base64 import b64encode

from flask.testing import FlaskClient

from tests import endpoint


def test_api_get_project_report(client: FlaskClient, admin_login: dict):
    from urllib.parse import quote

    resp = client.post(endpoint('/to-pdf'))
    assert resp.status_code == 401
    assert resp.json['error'] == 'Token is missing!'

    resp = client.post(endpoint('/to-pdf'), headers=admin_login)
    assert resp.status_code == 400
    assert resp.json['error'] == 'Missing necessary arguments'

    data = {
        'html': b64encode(quote('<div><h1>Hello</h1></div>').encode()).decode(),
        'style': b64encode(quote('<style>h1 {color: red;}</style>').encode()).decode(),
        'extra_css': [b64encode(
            quote('https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css').encode()
        ).decode()],
        'uid': 'filename'
    }

    resp = client.post(endpoint('/to-pdf'), json=data, headers=admin_login)
    assert resp.status_code == 200
    #assert resp.headers['Content-Disposition'] == "download;filename='filename.pdf'"
