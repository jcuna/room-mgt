/**
 * Created by Jon on 11/22/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../css/menu.scss';
import { toggleMobileMenu } from '../actions/appActions';
import { hasAccess, routes } from '../utils/config';

export default class Menu extends React.Component {
    constructor() {
        super();
        this.toggleMenu = this.toggleMenu.bind(this);
    }

    render() {
        const { user } = this.props;
        const loggedIn = user.status === 'logged_in';

        return (
            <div className={ this.className }>
                <i onClick={ this.toggleMenu } className="fas fa-times" aria-hidden="true"/>
                <nav id="mobile-nav">
                    {this.getLinksBasedOffAccess()}
                    <Link to={ loggedIn ? '/logout' : '/login' } onClick={ this.toggleMenu }>
                        <span>{ loggedIn ? `${user.first_name}` : 'login' }</span>
                        { loggedIn && <i className='user-logout fas fa-sign-out-alt'/> }
                    </Link>
                </nav>
            </div>
        );
    }

    get className() {
        let className = 'mobile-menu';

        if (this.props.showMobileMenu) {
            className += ' slide';
        }
        return className;
    }

    getLinksBasedOffAccess() {
        if (Object.keys(this.props.roles.permissions).length === 0) {
            return null;
        }

        return routes.map(item => {
            if (hasAccess(item.link, 'read')) {
                return <Link key={ item.link } to={ item.link } onClick={ this.toggleMenu }>{ item.name }</Link>;
            }
            return null;
        });
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(this.props.showMobileMenu));
    }

    static propTypes = {
        user: PropTypes.object,
        roles: PropTypes.object,
        showMobileMenu: PropTypes.bool,
        dispatch: PropTypes.func
    }
}
