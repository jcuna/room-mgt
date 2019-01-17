
def register():
    """
        declare routes as follows: 'module.PluralNameClass@endpoint': 'route'
        returns: dict
    """
    return {
        'users.Users@users_url': '/user|/user/',
        'users.UsersManager@users_manager_url': '/users|/users/<int:user_id>',
        'users.Session@login_url': '/login|/login/',
        'users.Roles@roles_url': '/roles|/roles/',
        'users.Permissions@permissions_url': '/permissions|/permissions/',
        'projects.Projects@projects_url': '/projects|/projects/|/projects/<int:project_id>',
        'projects.Rooms@rooms_url': '/rooms|/rooms/|/rooms/<int:room_id>',
        'agreements.Agreements@agreements_url': '/agreements|/agreements/|/agreements/<int:agreement_id>',
        'tenants.Tenants@tenants_url': '/tenants|/tenants/|/tenants/<int:tenants_id>',
    }


no_permissions = [
    'views.users.Session',
    'views.users.Users',
    'views.users.Permissions'
]

default_access = {
    'views.projects.Projects': ['read']
}
