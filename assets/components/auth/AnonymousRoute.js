import React, {Component} from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';

class AnonymousRoute extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Route
                render={({location}) =>
                    !this.props.user ? (
                        this.props.children
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/",
                                state: {from: location}
                            }}
                        />
                    )
                }
            />
        );
    }
}

export default withRouter(AnonymousRoute)