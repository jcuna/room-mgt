export const STATUS = {
    PENDING: 'PENDING',
    TRANSMITTING: 'TRANSMITTING',
    FAILED: 'FAILED',
    ERROR: 'ERROR',
    COMPLETE: 'COMPLETE',
    UNPROCESSED: 'UNPROCESSED',
    PROCESSED: 'PROCESSED',
    DECOMMISSIONING: 'DECOMMISSIONING',
    DECOMMISSIONED: 'DECOMMISSIONED',
};

export const ALERTS = {
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'warning',
    DANGER: 'danger',
};

export const ENDPOINTS = {
    ACCOUNT_URL: '/account',
    ACCOUNT_PROFILE: '/account/profile',
    ACCOUNT_LOGIN: '/account/login',
    ACCOUNT_LOGOUT: '/account/logout',
    ROOMS_URL: '/habitaciones',
    AGREEMENTS_URL: '/contratos',
    TENANTS_URL: '/inquilinos',
    ROLES_URL: '/roles',
    USERS_MANAGER_URL: '/usuarios',
    PROJECTS_URL: '/proyectos',
};

export const ACCESS_TYPES = {
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',
};

export const INVALID_LANDING_PAGES = [
    '',
    ENDPOINTS.ACCOUNT_LOGOUT,
    ENDPOINTS.ACCOUNT_LOGOUT,
];

export const API_PREFIX = '/api/';
export const API_VERSION = 'v1.0';

export const GENERIC_ERROR = 'Ha ocurrido un error inesperado.';

export const FORM_VALIDATION = {
    NUMBER: 'number',
    EMAIL: 'email',
    PHONE: 'phone',
    REGEX: 'regex',
    ALPHA_NUM: 'alpha_num',
    REQUIRED: 'required',
    NO_SPACE: 'no_space',
    LENGTH: 'length',
};

export const VALIDATE_FUNC_SUFFIX = 'Func';
