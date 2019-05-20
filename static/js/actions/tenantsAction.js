import api from '../utils/api';
import { token } from '../utils/token';

export const TENANT_CREATED = 'TENANT_CREATED';
export const TENANTS_PROCESSING = 'TENANTS_PROCESSING';
export const TENANTS_PROCESSING_FAILED = 'TENANTS_PROCESSING_FAILED';
export const TENANTS_FETCHED = 'TENANTS_FETCHED';
export const TENANT_SELECTED_CLEAR = 'TENANT_SELECTED_CLEAR';
export const TENANT_SELECTED_SET = 'TENANT_SELECTED_SET';

export const createTenant = (data, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: 'tenants',
            method: 'POST',
            headers: header,
        }, data).then(resp => {
            data.tenant_id = resp.data.tenant_id;
            dispatch({ type: TENANT_CREATED, payload: data });
            resolve && resolve(data.tenant_id);
        }, reject), reject);
    };

export const editTenant = (data, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: `tenants/${ data.tenant_id }`,
            method: 'PUT',
            headers: header,
        }, data).then(resp => {
            dispatch({ type: TENANT_CREATED, payload: resp.data });
            resolve && resolve();
        }, reject), reject);
    };

export const getTenants = (page, orderBy, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: `tenants?page=${page}&orderBy=${orderBy}`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: TENANTS_FETCHED, payload: resp.data });
            resolve && resolve();
        }, reject), reject);
    };

export const setSelectedTenant = (selected) =>
    (dispatch) => {
        const payload = { ...selected, tenant_id: selected.id }
        delete payload.id;
        dispatch({ type: TENANT_SELECTED_SET, payload });
    };

export const clearSelectedTenant = () =>
    (dispatch) => dispatch({ type: TENANT_SELECTED_CLEAR });