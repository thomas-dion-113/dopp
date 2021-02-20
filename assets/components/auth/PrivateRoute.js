import React, {Component} from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';

class PrivateRoute extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Route
                render={({location}) =>
                    this.props.user !== null ? (
                        this.props.children
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: {from: location}
                            }}
                        />
                    )
                }
            />
        );
    }
}

export default withRouter(PrivateRoute)