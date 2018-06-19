/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import {logout} from "../../actions/userActions";
import Spinner from "../../utils/Spinner";

export default class Logout extends React.Component {

    componentWillMount() {
        if (this.props.user.status === 'logged_in') {
            this.props.dispatch(logout());
        } else {
            this.props.history.push("/");
        }
    }

    render() {
        return <Spinner/>
    }
}