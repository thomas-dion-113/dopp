import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from '../yupLocales';

Yup.setLocale(yupLocale);

class LoginPage extends Component {
    constructor(props) {
        super(props);

        const {location} = this.props;
        this.from = location.state ? location.state.from.pathname : "/";

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
        fetch(process.env.SITE_URL + "/api/login_check",
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: values.email,
                    password: values.password,
                })
            })
            .then(async res => {
                if (res.status === 200) {
                    let data = await res.json();
                    localStorage.setItem('token', JSON.stringify(data.token));
                    localStorage.setItem('refresh_token', JSON.stringify(data.refresh_token));
                    this.props.loginCallbackFunction(data, this.from);
                } else {
                    const {setFieldError, setFieldTouched, values} = this.props;
                    setErrors({
                        password: 'Email ou mot de passe incorrect'
                    })
                }
                this.setState({requestLoading: false});
            })
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
                            password: '',
                        }}
                        validate={this.validate}
                        validationSchema={
                            Yup.object().shape({
                                email: Yup.string()
                                    .email()
                                    .required(),
                                password: Yup.string()
                                    .required(),
                            })}
                        onSubmit={this.handlerSubmit.bind(this)}
                    >
                        {props => (
                            <div className="container container-form xs center">
                                <div>
                                    <h1>Connexion</h1>
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
                                        <div className="d-inline-flex">
                                            <button className="btn btn-primary mr-4" type="submit">Valider</button>
                                            {this.state.requestLoading && (
                                                <div className="spinner-border m-auto" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-3">Si vous n'avez pas de compte, <Link
                                            to="/inscription">Inscrivez-vous</Link> !</p>
                                        <p className="mt-1"><Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link></p>
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

export default withRouter(LoginPage)