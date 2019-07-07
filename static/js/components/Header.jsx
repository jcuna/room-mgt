/**
 * Created by Jon on 11/20/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../css/header.scss';
import { toggleMobileMenu } from '../actions/appActions';
import { API_PREFIX, ENDPOINTS, STATUS } from '../constants';
import { listenRoleChanges } from '../actions/roleActions';
import { listenUserChanges, updateMyUser } from '../actions/userActions';
import FontAwesome from '../utils/FontAwesome';

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.toggleMenu = this.toggleMenu.bind(this);
        this.toggleUserMenu = this.toggleUserMenu.bind(this);
        this.state = {
            userNameClass: this.props.initialClass,
            dispatchedRolesWS: false,
            dispatchedUserWS: false
        };
    }

    componentDidUpdate({ clickedContent, appState }) {
        if (Header.userMenuIsShowing(this.state.userNameClass) && this.props.clickedContent !== clickedContent) {
            this.hideUserMenu();
        }
        const { user, dispatch } = this.props;

        if (user.status === STATUS.PROCESSED) {
            if (!this.state.dispatchedRolesWS && user.roles.length > 0) {
                this.setState({
                    dispatchedRolesWS: true,
                });
                dispatch(listenRoleChanges(this.getFetchRolesOptions(user)));
            }

            if (!this.state.dispatchedUserWS) {
                this.setState({
                    dispatchedUserWS: true,
                });
                dispatch(listenUserChanges(user.id));
            }
        }
        if (appState === 1 && this.props.appState === 0) {
            window.location.href = `${API_PREFIX}install`;
        }
    }

    getFetchRolesOptions(user) {
        const options = {
            shouldFetch: false,
            roles: []
        };

        user.roles.forEach(r => {
            options.roles.push(r.name);
            if (typeof r.permissions['views.users.Roles'] !== 'undefined' &&
                r.permissions['views.users.Roles'].includes('read')) {
                options.shouldFetch = true;
            }
        });

        return options;
    }

    static userMenuIsShowing(userNameClass) {
        return userNameClass.includes(Header.defaultProps.extraClass);
    }

    getSelectedProject({ projects }, { attributes }) {
        let name = 'Roomanize';

        if (typeof attributes.preferences.default_project !== 'undefined') {
            projects.forEach(item => {
                if (Number(item.id) === attributes.preferences.default_project) {
                    name = item.name;
                }
            });
        }
        return name;
    }

    render() {
        const { user, projects } = this.props;
        const loggedIn = user.status === STATUS.PROCESSED;
        const projectName = this.getSelectedProject(projects, user);

        return (
            <header id="header">
                <div className="inner">
                    <Link to="/" className="logo"><img src="/images/building.png"/></Link>

                    { loggedIn &&
                        <ul className="super-menu">
                            <li className="user-icon" onClick={ this.toggleUserMenu }>
                                { this.getUserIcon() }
                                { this.userMenu() }
                            </li>
                            <li className="navPanelToggle" onClick={ this.toggleMenu }>
                                <FontAwesome className='menu-grid' type="th"/>
                            </li>
                        </ul>
                    }
                </div>
                <section id="banner">
                    <h1>{ projectName }</h1>
                    <p>Contabilidad y manejo de clientes</p>
                </section>
            </header>
        );
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(!this.props.showMobileMenu));
        this.props.dispatch(updateMyUser({
            attributes: {
                preferences: { showMobileMenu: !this.props.showMobileMenu }
            }
        }));
    }

    userMenu() {
        const menu = [
            { name: 'Perfil', link: ENDPOINTS.ACCOUNT_PROFILE },
            { name: 'Logout', link: ENDPOINTS.ACCOUNT_LOGOUT }
        ];

        return (
            <div className={ this.state.userNameClass }>
                <ul>
                    { menu.map((a, b) => <li key={ b }><Link to={ a.link }>{ a.name }</Link><hr/></li>) }
                </ul>
            </div>
        );
    }

    getUserIcon() {
        const { user } = this.props;

        return (
            <div
                className="user-pic">{ user.pic && <img src={ user.pic }/> || this.getUserInitials() }
            </div>
        );
    }

    toggleUserMenu(e) {
        e.stopPropagation();
        if (Header.userMenuIsShowing(this.state.userNameClass)) {
            this.hideUserMenu();
        } else {
            this.setState({
                userNameClass: this.props.initialClass + ' ' + this.props.extraClass
            });
        }
    }

    hideUserMenu() {
        this.setState({
            userNameClass: this.props.initialClass
        });
    }

    getUserInitials() {
        const { user } = this.props;

        return user.first_name.charAt(0) + user.last_name.charAt(0);
    }

    static propTypes = {
        dispatch: PropTypes.func,
        showMobileMenu: PropTypes.bool,
        user: PropTypes.object,
        initialClass: PropTypes.string,
        extraClass: PropTypes.string,
        clickedContent: PropTypes.bool,
        projects: PropTypes.object,
        history: PropTypes.object,
        appState: PropTypes.number,
    }
}

Header.defaultProps = {
    initialClass: 'user-menu',
    extraClass: 'user-menu-display'
};

export default Header;
