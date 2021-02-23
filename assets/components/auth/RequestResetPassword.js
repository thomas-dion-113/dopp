import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from '../yupLocales';

Yup.setLocale(yupLocale);

class RequestResetPassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        this.setState({loading: false});
    }

    handlerSubmit(values, {setErrors}) {
        fetch(process.env.SITE_URL + "/api/public/request_reset_password",
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: values.email,
                })
            })
            .then(async res => {
                if (res.status === 200) {
                    this.props.history.push('/mot-de-passe-oublie-complete');
                } else {
                    setErrors({
                        email: 'Erreur'
                    })
                }
            })
            .catch(function (error) {
                this.props.history.replace('/mot-de-passe-oublie-complete');
            }.bind(this));
    }

    render() {
        return (
            <>
                {this.state.loading ? (
                    <div className="spinner-border m-auto" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    <Formik
                        initialValues={{
                            email: '',
                        }}
                        validate={this.validate}
                        validationSchema={
                            Yup.object().shape({
                                email: Yup.string()
                                    .email()
                                    .required(),
                            })}
                        onSubmit={this.handlerSubmit.bind(this)}
                    >
                        {props => (
                            <div className="container container-form xs center">
                                <div>
                                    <h1>Mot de passe oublié</h1>
                                    <form onSubmit={props.handleSubmit} noValidate="noValidate">
                                        <div className={props.errors.email && props.touched.email
                                            ? "form-group error"
                                            : "form-group"}>
                                            <label htmlFor="email">Email</label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                onChange={props.handleChange}
                                                onBlur={props.handleBlur}
                                                value={props.values.email}
                                                className="form-control"
                                            />
                                            {props.errors.email && props.touched.email &&
                                            <div id="feedback">{props.errors.email}</div>}
                                        </div>
                                            <button className="btn btn-primary mr-4" type="submit">Valider</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </Formik>
                )}
            </>
        );
    }
}

export default withRouter(RequestResetPassword)