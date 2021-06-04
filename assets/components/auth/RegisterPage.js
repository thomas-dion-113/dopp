import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from '../yupLocales';

Yup.setLocale(yupLocale);

class RegisterPage extends Component {
    constructor(props) {
        super(props);

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
        fetch(process.env.SITE_URL + "/api/public/register",
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                })
            })
            .then(async res => {
                if (res.status === 200) {
                    this.props.history.replace('/inscription-complete');
                } else if (res.status === 400) {
                    let data = await res.json();
                    let errors = {};
                    if (Array.isArray(data)) {
                        if (data.includes('name')) {
                            errors['name'] = 'Ce nom d\'utilisateur existe déjà';
                        }
                        if (data.includes('email')) {
                            errors['email'] = 'Cet email existe déjà';
                        }
                        setErrors(errors);
                    }
                    this.setState({requestLoading: false});
                } else {
                    setErrors({
                        passwordRepeat: 'Erreur'
                    });

                    this.setState({requestLoading: false});
                }
            })
            .catch(function (error) {
                this.props.history.replace('/inscription-complete');
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
                            name: '',
                            email: '',
                            password: '',
                            passwordRepeat: '',
                            acceptMail: false,
                        }}
                        validate={this.validate}
                        validationSchema={
                            Yup.object().shape({
                                name: Yup.string()
                                    .required(),
                                email: Yup.string()
                                    .email()
                                    .required(),
                                password: Yup.string()
                                    .required(),
                                passwordRepeat: Yup.string()
                                    .oneOf([Yup.ref('password'), null], 'Les mots de passes doivent être identiques')
                                    .required(),
                                acceptMail: Yup.boolean()
                            })}
                        onSubmit={this.handlerSubmit.bind(this)}
                    >
                        {props => (
                            <div className="container container-form xs center">
                                <div>
                                    <h1>Inscription</h1>
                                    <form onSubmit={props.handleSubmit} noValidate="noValidate">
                                        <div className={props.errors.name && props.touched.name
                                            ? "form-group error"
                                            : "form-group"}>
                                            <label htmlFor="name">Nom d'utilisateur</label>
                                            <input
                                                id="name"
                                                type="text"
                                                name="name"
                                                onChange={props.handleChange}
                                                onBlur={props.handleBlur}
                                                value={props.values.name}
                                                className="form-control"
                                            />
                                            {props.errors.name && props.touched.name &&
                                            <div id="feedback">{props.errors.name}</div>}
                                        </div>
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
                                        <div
                                            className={props.errors.acceptMail && props.touched.acceptMail
                                                ? "form-group form-group-checkbox error"
                                                : "form-group form-group-checkbox"}>
                                            <input
                                                id="acceptMail"
                                                type="checkbox"
                                                name="acceptMail"
                                                onChange={props.handleChange}
                                                onBlur={props.handleBlur}
                                                value={props.values.acceptMail}
                                                className="form-control"
                                            />
                                            <label htmlFor="acceptMail">J'accepte de recevoir des emails de la part de DOPP</label>
                                            {props.errors.acceptMail && props.touched.acceptMail &&
                                            <div id="feedback">{props.errors.acceptMail}</div>}
                                        </div>
                                        <div className="d-inline-flex">
                                            <button className="btn btn-primary mr-4" type="submit">Valider
                                            </button>
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

export default withRouter(RegisterPage)