import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from './yupLocales';

Yup.setLocale(yupLocale);

class AccountForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            requestLoading: false,
            initialValues: {
                name: this.props.user.name,
            },
        };
    }

    componentDidMount() {
        this.setState({loading: false});
    }

    handlerSubmit(values, {setErrors}) {
        this.setState({requestLoading: true});
        fetch(process.env.SITE_URL + "/api/private/edit_user",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + this.props.token,
                },
                body: JSON.stringify({
                    name: values.name,
                })
            })
            .then(async res => {
                if (res.status === 200) {
                    await this.props.accountFormCallbackFunction();
                    this.props.history.replace('/releves');
                } else if (res.status === 400) {
                    let data = await res.json();
                    let errors = {};
                    if (Array.isArray(data)) {
                        if (data.includes('name')) {
                            errors['name'] = 'Ce nom d\'utilisateur existe déjà';
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
            .catch(async function (error) {
                this.props.notificationCallback('Hors connexion', 'Votre compte sera modifié dès vous serez connecté à internet', 5);
                await this.props.accountFormCallbackFunction();
                this.props.history.replace('/releves');
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
                        initialValues={this.state.initialValues}
                        validate={this.validate}
                        validationSchema={
                            Yup.object().shape({
                                name: Yup.string()
                                    .required(),
                            })}
                        onSubmit={this.handlerSubmit.bind(this)}
                    >
                        {props => (
                            <div className="container container-form xs center">
                                <div>
                                    <h1>Mon compte</h1>
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

export default withRouter(AccountForm)