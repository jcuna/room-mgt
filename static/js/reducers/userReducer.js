/**
 * Created by Jon on 12/4/17.
 */

import {
    USER_FETCHED,
    USER_MUST_LOGIN,
    USER_LOGGING_IN,
    USER_LOGIN_SUCCESS,
    USER_LOGIN_FAIL,
    USER_LOGIN_ERROR,
    USER_LOGGING_OUT,
    USER_LOGGED_OUT,
    USERS_FETCHED,
    USER_CREATED,
    USERS_FETCHING,
    USER_DELETE_SUCCESS,
    USER_UPDATE_SUCCESS,
    USER_TOKEN_CLEAR,
    USER_TOKEN_FETCHED,
    USERS_SEARCHING,
    USERS_SEARCHED,
    USER_TOKEN_FAILED,
    USER_MESSAGES_FETCHING, USER_MESSAGES_FETCHED, USER_MESSAGES_NEW, USER_MESSAGES_MARKED_READ,
} from '../actions/userActions';
import { STATUS } from '../constants';

const initialData = {
    user: {
        status: STATUS.PENDING,
        roles: [],
        list: {
            status: STATUS.PENDING,
            page: 1,
            users: [],
            total_pages: 1,
            searching: false,
        },
        pic: null,
        // a user token used to validate or verify a multi factor request
        userToken: {
            status: STATUS.PENDING,
            isValid: false
        },
        attributes: {
            preferences: {},
            access: {}
        },
        messages: {
            status: STATUS.pending,
            list: [],
            page: 1,
            total_pages: 1,
            total_unread: 0,
        }
    },
    // jwt session token, expires regularly
    token: {
        value: '',
        expires: '',
    }
};

export default function userReducer(state = initialData, action) {
    switch (action.type) {
        case USER_FETCHED:
            return {
                ...state,
                user: { ...state.user, ...action.payload.user, status: STATUS.PROCESSED },
                token: action.payload.token,
            };
        case USER_MUST_LOGIN:
            return { ...state, user: { ...state.user, status: STATUS.UNPROCESSED }};
        case USER_LOGGING_IN:
            return { ...state, user: { ...state.user, status: STATUS.TRANSMITTING }};
        case USER_LOGIN_SUCCESS:
            return {
                ...state,
                user: { ...state.user, ...action.payload.user, list: state.user.list, status: STATUS.PROCESSED },
                token: action.payload.token,
            };
        case USER_LOGIN_FAIL:
            return {
                ...state,
                user: {
                    ...state.user,
                    status: STATUS.FAILED,
                    email: action.payload.email,
                    password: action.payload.password,
                },
            };
        case USER_LOGIN_ERROR:
            return {
                ...state,
                user: {
                    ...state.user,
                    list: state.user.list,
                    status: STATUS.ERROR,
                    email: action.payload.email,
                    password: action.payload.password,
                },
            };
        case USER_LOGGING_OUT:
            return {
                ...state,
                user: { ...state.user, status: STATUS.DECOMMISSIONING },
            };
        case USER_LOGGED_OUT:
            return { ...state, ...initialData, user: { ...initialData.user, status: STATUS.DECOMMISSIONED }};

        case USERS_FETCHING:
            return { ...state, user: { ...state.user, list: { ...state.user.list, status: STATUS.TRANSMITTING }}};
        case USERS_FETCHED:
            return { ...state, user: { ...state.user, list: {
                ...state.user.list,
                status: STATUS.COMPLETE,
                users: action.payload.list,
                page: action.payload.page,
                total_pages: action.payload.total_pages,
            }}};

        case USER_CREATED:
        case USER_DELETE_SUCCESS:
        case USER_UPDATE_SUCCESS:
            return { ...state, user: { ...state.user, list: { ...state.user.list, status: STATUS.PENDING }}};

        case USER_TOKEN_CLEAR:
            return { ...state, user: { ...state.user, userToken: {
                status: STATUS.PENDING,
                isValid: false
            }}};

        case USER_TOKEN_FETCHED:
            return { ...state, user: { ...state.user, userToken: {
                status: STATUS.COMPLETE,
                isValid: action.payload.isValid
            }}};
        case USER_TOKEN_FAILED:
            return { ...state, user: { ...state.user, userToken: {
                status: STATUS.FAILED,
                isValid: false
            }}};
        case USERS_SEARCHING:
            return { ...state, user: { ...state.user, list: { ...state.user.list, searching: true }}};
        case USERS_SEARCHED:
            return { ...state, user: { ...state.user, list: { ...state.user.list, searching: false }}};
        case USER_MESSAGES_FETCHING:
            return {
                ...state,
                user: { ...state.user, messages: { ...state.user.messages, status: STATUS.TRANSMITTING }}
            };
        case USER_MESSAGES_FETCHED:
            return {
                ...state,
                user: { ...state.user, messages: action.payload.data }
            };
        case USER_MESSAGES_NEW:
            const list = [...state.user.messages.list];
            list.unshift(action.payload.data);
            return {
                ...state,
                user: { ...state.user, messages: {
                    ...state.user.messages, list, total_unread: state.user.messages.total_unread + 1 }
                }
            };
        case USER_MESSAGES_MARKED_READ:
            const _list = [...state.user.messages.list];
            _list.forEach(item => {
                if (item.id === action.payload) {
                    item.read = true;
                }
            });

            return {
                ...state,
                user: {
                    ...state.user, messages: {
                        ...state.user.messages, _list, total_unread: state.user.messages.total_unread - 1
                    }
                }
            };
        default:
            return state;
    }
}
