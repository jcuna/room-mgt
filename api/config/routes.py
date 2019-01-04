
def register():
    """
        declare routes as follows: 'module.PluralNameClass@endpoint': 'route'
        returns: dict
    """
    return {
        'users.Users@users_url': '/user',
        'users.UsersManager@users_manager_url': '/users|/users/<int:user_id>',
        'users.Session@login_url': '/login',
        'users.Roles@roles_url': '/roles',
        'users.Permissions@permissions_url': '/permissions',
        'projects.Projects@projects_url': '/projects'
    }


noPermissions = [
    'views.users.Session',
    'views.users.Users',
    'views.users.Permissions'
]

defaultAccess = {
    'views.projects.Projects': ['read']
}
