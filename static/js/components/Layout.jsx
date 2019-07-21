/**
 * Created by Jon on 11/20/17.
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import RequiresLogin from './user/RequiresLogin.jsx';
import FlashMessages from '../utils/Notifications.jsx';
import Menu from './Menu';
import Header from './Header';
import Footer from './Footer';
import Overlay from '../utils/Overlay';
import PropTypes from 'prop-types';
import Routes from './Routes';
import Account from './user/Account';
import Login from './user/Login';
import { ENDPOINTS } from '../constants';
import ExpenseScans from './expenses/ExpenseScans';

export default class Layout extends React.Component {
    render() {
        return (
            <Route render = { props => {
                props = { ...this.props, ...props };
                return (
                    <div>
                        <Menu { ...props }/>
                        <div className={ this.getClassName() }>
                            <Header { ...props }/>
                            <div className='content-area container'>
                                <FlashMessages { ...this.props }/>
                                <Switch>
                                    <Route path={ ENDPOINTS.ACCOUNT_LOGIN } render={ (props2) =>
                                        <Login { ...this.props } { ...props2 }/> }
                                    />
                                    <Route exact path='/account/activate/:user_token' render={ (props2) =>
                                        <Account { ...this.props } { ...props2 }/> }
                                    />
                                    <Route
                                        exact path={
                                            `${ENDPOINTS.EXPENSE_SCANS_URL}/:token([a-f0-9]+)/:expense_id([0-9]+)`
                                        } render={ (props2) => <ExpenseScans { ...this.props } { ...props2 }/> }
                                    />
                                    <RequiresLogin { ...props }>
                                        <Routes { ...props }/>
                                    </RequiresLogin>
                                </Switch>
                            </div>
                            <Footer/>
                        </div>
                        <Overlay { ...props }/>
                    </div>
                );
            } }/>
        );
    }

    getClassName() {
        let className = 'body-container';

        if (this.props.showMobileMenu) {
            className += ' body-displaced';
        }
        return className;
    }

    static propTypes = {
        showMobileMenu: PropTypes.bool
    };
}
