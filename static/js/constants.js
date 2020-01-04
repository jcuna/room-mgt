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

/**
 *
 * format is backend endpoint name upper-cased and front end path
 */
export const ENDPOINTS = {
    ACCOUNT_URL: '/account',
    ACCOUNT_PROFILE: '/account/profile',
    ACCOUNT_LOGIN: '/account/login',
    ACCOUNT_LOGOUT: '/account/logout',
    ROOMS_URL: '/habitaciones',
    AGREEMENTS_URL: '/contratos',
    RECEIPTS_URL: '/recibos',
    TENANTS_URL: '/inquilinos',
    ROLES_URL: '/roles',
    USERS_MANAGER_URL: '/usuarios',
    PROJECTS_URL: '/proyectos',
    EXPENSES_URL: '/gastos',
    EXPENSE_SCANS_URL: '/escanear-recibo',
    ROOMS_HISTORY_URL: '/rooms-history',
    BALANCE_PAYMENTS_URL: '/pay-balance',
    EMAILS_URL: '/email',
    NOT_FOUND: '/error/404',
    NO_ACCESS: '/error/403',
};

export const BACKEND_URLS = {
    EXPENSE_SCANS: '/expense-scans'
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
    DATE: 'date',
};

export const VALIDATE_FUNC_SUFFIX = 'Func';
export const VALIDATE_TRANSFORM_FUNC = 'Transform';

export const CASH_PAYMENT_ID = 100;
export const REFUND_PAYMENT_ID = 600;
