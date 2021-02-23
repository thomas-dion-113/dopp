import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from '../yupLocales';
import Offline from "../Offline";
import LoginForm from "./LoginForm";

Yup.setLocale(yupLocale);

class LoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            offline: false,
        };

        this.submitForm = null;
        this.reload = this.reload.bind(this);
    }

    componentDidMount() {
        this.setState({loading: false});
    }

    reload() {
        this.handleSubmitForm();
    }

    handleSubmitForm = () => {
        if (this.submitForm) {
            this.submitForm();
        }
    };

    bindSubmitForm = (submitForm) => {
        this.submitForm = submitForm;
    };

    render() {
        return (
            <>
                {this.state.loading ? (
                    <div className="spinner-border m-auto" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    <>
                        {this.state.offline ? (
                            <>
                                <Offline reloadCallbackFunction={() => {
                                    this.reload(this.values);
                                }}/>
                            </>
                        ) : (
                            <>
                                <LoginForm
                                    bindSubmitForm={this.bindSubmitForm}
                                    triggerSubmit={this.handleSubmitForm}
                                    setOffline={(value) => {
                                        this.setState({offline: value});
                                    }}
                                    loginCallbackFunction={(values, from) => {
                                        this.props.loginCallbackFunction(values, from);
                                    }}
                                />
                            </>
                        )}
                    </>
                )}
            </>
        );
    }
}

export default withRouter(LoginPage)