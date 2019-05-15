import { combineReducers } from 'redux';
import appReducer from './appReducer';
import userReducer from './userReducer';
import rolesReducer from './rolesReducer';
import projectReducer from './projectReducer';
import roomReducer from './roomReducer';
import tenantsReducer from './tenantsReducer';

export default combineReducers({
    app: appReducer,
    user: userReducer,
    roles: rolesReducer,
    projects: projectReducer,
    rooms: roomReducer,
    tenants: tenantsReducer,
});
