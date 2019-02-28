/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { clearUserToken, updatePassword, validateUserToken } from '../../actions/userActions';
import { ALERTS, ENDPOINTS, STATUS } from '../../constants';
import Spinner from '../../utils/Spinner';
import Redirect from 'react-router-dom/es/Redirect';
import { notifications } from '../../actions/appActions';
import FormGenerator from '../../utils/FromGenerator';

export default class Account extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pw: '',
            pw2: '',
            disabledPW2: true,
            errors: true,
        };

        const hasToken = typeof props.match.params.user_token !== 'undefined';

        if (hasToken) {
            this.props.dispatch(validateUserToken(props.match.params.user_token));
        }

        this.validateFields = this.validateFields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const { user, match } = this.props;

        if (typeof match.params.user_token !== 'undefined') {
            if (user.userToken.status === STATUS.PENDING) {
                return <Spinner/>;
            } else if (user.userToken.status === STATUS.COMPLETE) {
                if (user.status === STATUS.UNPROCESSED && user.userToken.isValid) {
                    return this.getForm();
                }
            }
            return <Redirect to="/"/>;
        }

        return <h2>{ user.first_name }</h2>;
    }

    componentWillUnmount() {
        this.props.dispatch(clearUserToken());
        if (this.props.user.userToken.status === STATUS.COMPLETE &&
            !this.props.user.userToken.isValid) {
            this.props.dispatch(notifications({
                type: ALERTS.WARNING, message: 'El token no es valido o ha expirado'
            }));
        }
    }

    getForm() {
        return (
            <div>
                <h2>Debes crear una contraseña</h2>
                <div className="card mb-3">
                    <div className="card-header">
                        Usa 6 o más caracteres con una combinación de letras, números y símbolos
                    </div>
                </div>
                <FormGenerator { ...{
                    formName: 'pw-reset-form',
                    button: { value: 'Cambiar', disabled: this.state.errors },
                    elements: [
                        { type: 'password', placeholder: 'Contraseña', onChange: this.validateFields, name: 'password' },
                        { type: 'password',
                            placeholder:
                                'Repetir Contraseña',
                            onChange: this.validateFields,
                            name: 'password-repeat',
                            disabled: this.state.disabledPW2
                        }
                    ],
                    callback: this.handleSubmit,
                    object: this,
                    initialRefs: this.initialRefs
                } }/>
            </div>
        );
    }

    validateFields({ target }) {
        if (target.name === 'password') {
            this.refs.password_repeat.value = '';
            this.setState({ pw2: '', errors: true });
            if (Account.passIsValid(target.value)) {
                this.setState({ pw: target.value, disabledPW2: false });
                if (target.classList.contains('is-invalid')) {
                    target.classList.remove('is-invalid');
                }
            } else {
                this.setState({ pw: '', disabledPW2: true });
                if (!target.classList.contains('is-invalid')) {
                    target.classList.add('is-invalid');
                }
            }
        }

        if (target.name === 'password-repeat') {
            if (target.value === this.state.pw) {
                this.setState({ pw2: target.value, errors: false });
                if (target.classList.contains('is-invalid')) {
                    target.classList.remove('is-invalid');
                }
            } else {
                this.setState({ errors: true, pw2: '' });
                if (!target.classList.contains('is-invalid')) {
                    target.classList.add('is-invalid');
                }
            }
        }
    }

    static passIsValid(password) {
        return password.length > 5 && password.match(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/) !== null;
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.dispatch(updatePassword(
            {
                token: this.props.match.params.user_token,
                pw: this.state.pw,
                pw2: this.state.pw2
            },
            () => {
                this.props.history.push(ENDPOINTS.ACCOUNT_LOGIN);
                this.props.dispatch(notifications(
                    { type: ALERTS.SUCCESS, message: 'Cuenta ha sido activada.' })
                );
            },
            () => {
                this.props.dispatch(notifications(this.props.updatePasswordError),
                );
            }
        ));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        user: PropTypes.object,
        match: PropTypes.object,
        history: PropTypes.object,
        updatePasswordError: PropTypes.object,
    };

    static defaultProps = {
        updatePasswordError: { type: ALERTS.DANGER, message: 'No se pudo guardar el password, trate mas tarde' }
    }
}
