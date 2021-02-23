import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from '../yupLocales';

Yup.setLocale(yupLocale);

class ResetPassword extends Component {
    constructor(props) {
        super(props);

        this.token = new URLSearchParams(this.props.location.search).get("token");

        this.state = {
            loading: true,
            requestLoading: false,
        };
    }

    componentDidMount() {
        this.setState({loading: false});
    }

    handlerSubmit(values, {setErrors}) {
        this.setState({requestLoading: true});
        fetch(process.env.SITE_URL + "/api/public/reset_password",
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    token: this.token,
                    password: values.password,
                })
            })
            .then(async res => {
                if (res.status === 200) {
                    this.props.history.push('/modification-mot-de-passe-complete');
                } else {
                    setErrors({
                        password: 'Email ou mot de passe incorrect'
                    })
                }
                this.setState({requestLoading: false});
            })
            .catch(function (error) {
                this.props.history.push('/modification-mot-de-passe-complete');
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
                            password: '',
                            passwordRepeat: '',
                        }}
                        validate={this.validate}
                        validationSchema={
                            Yup.object().shape({
                                password: Yup.string()
                                    .required(),
                                passwordRepeat: Yup.string()
                                    .oneOf([Yup.ref('password'), null], 'Les mots de passes doivent être identiques')
                                    .required(),
                            })}
                        onSubmit={this.handlerSubmit.bind(this)}
                    >
                        {props => (
                            <div className="container container-form xs center">
                                <div>
                                    <h1>Réinitialisation du mot de passe</h1>
                                    <form onSubmit={props.handleSubmit} noValidate="noValidate">
                                        <div className={props.errors.password && props.touched.password
                                            ? "form-group error"
                                            : "form-group"}>
                                            <label htmlFor="password">Mot de passe</label>
                                            <input
                                                id="password"
                                                type="password"
                                                name="password"
                                                onChange={props.handleChange}
                                                onBlur={props.handleBlur}
                                                value={props.values.password}
                                                className="form-control"
                                            />
                                            {props.errors.password && props.touched.password &&
                                            <div id="feedback">{props.errors.password}</div>}
                                        </div>
                                        <div
                                            className={props.errors.passwordRepeat && props.touched.passwordRepeat
                                                ? "form-group error"
                                                : "form-group"}>
                                            <label htmlFor="passwordRepeat">Répéter votre mot de passe</label>
                                            <input
                                                id="passwordRepeat"
                                                type="password"
                                                name="passwordRepeat"
                                                onChange={props.handleChange}
                                                onBlur={props.handleBlur}
                                                value={props.values.passwordRepeat}
                                                className="form-control"
                                            />
                                            {props.errors.passwordRepeat && props.touched.passwordRepeat &&
                                            <div id="feedback">{props.errors.passwordRepeat}</div>}
                                        </div>
                                        <div className="d-inline-flex">
                                            <button className="btn btn-primary mr-4" type="submit">Valider</button>
                                            {this.state.requestLoading && (
                                                <div className="spinner-border m-auto" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            )}
                                        </div>
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

export default withRouter(ResetPassword)