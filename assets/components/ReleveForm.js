import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Field, Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from './yupLocales';
import DateTime from "./DateTime";
import setInputFilter from "./inputFilter";

Yup.setLocale(yupLocale);

class ReleveForm extends Component {
    constructor(props) {
        super(props);

        if (this.props.location.pathname.split('/')[1] === 'modifier-un-releve') {
            this.state = {
                edit: true,
                loadingPluvio: true,
                loadingReleve: true,
                releveId: document.location.pathname.split('/').pop(),
                pluvio: null,
                initialValues: null,
                requestLoading: false,
            };
        } else {
            this.state = {
                edit: false,
                loadingPluvio: true,
                loadingReleve: true,
                pluvioId: document.location.pathname.split('/').pop(),
                pluvio: null,
                initialValues: null,
                requestLoading: false,
            };
        }
    }

    componentDidMount() {
        if (this.state.edit) {
            fetch(process.env.SITE_URL + "/api/private/releve/" + this.state.releveId, {
                headers: {
                    "Authorization": "Bearer " + this.props.token
                }
            }).then(async res => {
                if (res.status === 200) {
                    let data = await res.json();
                    const releve = JSON.parse(data);

                    this.setState({
                        pluvio: releve.pluvio,
                        initialValues: {
                            dateTime: new Date(releve.dateTime.date + "Z"),
                            previousDateTime: new Date(releve.previousDateTime.date + "Z"),
                            precipitations: releve.precipitations,
                        },
                        loadingReleve: false,
                        loadingPluvio: false,
                    });
                } else {
                    this.props.history.replace('/404');
                }

                if (!this.state.loadingPluvio) {
                    setInputFilter(document.getElementById("precipitations"), function (value) {
                        return /^\d*[.,]?\d{0,2}$/.test(value);
                    });
                }
            });
        } else {
            fetch(process.env.SITE_URL + "/api/private/pluvio/" + this.state.pluvioId, {
                headers: {
                    "Authorization": "Bearer " + this.props.token
                }
            }).then(async res => {
                if (res.status === 200) {
                    let data = await res.json();
                    this.setState({
                        loadingPluvio: false,
                        pluvio: JSON.parse(data)
                    });
                } else {
                    this.props.history.replace('/404');
                }

                if (!this.state.loadingReleve) {
                    setInputFilter(document.getElementById("precipitations"), function (value) {
                        return /^\d*[.,]?\d{0,2}$/.test(value);
                    });
                }
            });

            fetch(process.env.SITE_URL + "/api/private/last_releve/" + this.state.pluvioId, {
                headers: {
                    "Authorization": "Bearer " + this.props.token
                }
            }).then(async res => {
                if (res.status === 200) {
                    let data = await res.json();
                    this.setState({
                        initialValues: {
                            dateTime: new Date(),
                            previousDateTime: new Date(JSON.parse(data).dateTime.date + "Z"),
                            precipitations: '',
                        }
                    });
                } else {
                    this.setState({
                        initialValues: {
                            dateTime: new Date(),
                            previousDateTime: new Date(),
                            precipitations: '',
                        }
                    });
                }

                this.setState({loadingReleve: false});

                if (!this.state.loadingPluvio) {
                    setInputFilter(document.getElementById("precipitations"), function (value) {
                        return /^\d*[.,]?\d{0,2}$/.test(value);
                    });
                }
            });
        }
    }

    handlerSubmit(values, {setErrors}) {
        this.setState({requestLoading: true});

        if (this.state.edit) {
            fetch(process.env.SITE_URL + "/api/private/edit_releve",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + this.props.token
                    },
                    body: JSON.stringify({
                        dateTime: values.dateTime,
                        previousDateTime: values.previousDateTime,
                        precipitations: values.precipitations,
                        releve: this.state.releveId,
                    })
                })
                .then(async res => {
                    if (res.status === 200) {
                        this.props.history.push('/releves');
                    } else {
                        setErrors({
                            passwordRepeat: 'Erreur'
                        });

                        this.setState({requestLoading: false});
                    }
                });
        } else {
            fetch(process.env.SITE_URL + "/api/private/create_releve",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + this.props.token
                    },
                    body: JSON.stringify({
                        dateTime: values.dateTime,
                        previousDateTime: values.previousDateTime,
                        precipitations: values.precipitations,
                        pluvio: this.state.pluvio.id,
                    })
                })
                .then(async res => {
                    if (res.status === 200) {
                        this.props.history.push('/releves');
                    } else {
                        setErrors({
                            passwordRepeat: 'Erreur'
                        });

                        this.setState({requestLoading: false});
                    }
                });
        }
    }

    render() {
        return (
            <>
                {this.state.loadingPluvio || this.state.loadingReleve ? (
                    <div className="container xs text-center">
                        <div className="spinner-border m-auto" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <Formik
                        initialValues={this.state.initialValues}
                        validate={this.validate}
                        validationSchema={
                            Yup.object().shape({
                                dateTime: Yup.date()
                                    .required(),
                                previousDateTime: Yup.date()
                                    .required(),
                                precipitations: Yup.string()
                                    .required()
                                    .test(
                                        'float',
                                        'La valeur doit être un nombre positif avec maximum 2 chiffres après la virgule',
                                        (value) => /^\d*[.,]?\d{0,2}$/.test(value),
                                    ),
                            })}
                        onSubmit={this.handlerSubmit.bind(this)}
                    >
                        {props => (
                            <div className="container container-form xs">
                                <h1>{this.state.edit ? 'Modifier le' : 'Ajouter un'} relevé pour le pluvio : {this.state.pluvio.name}</h1>
                                <div>
                                    <form onSubmit={props.handleSubmit} noValidate="noValidate">
                                        <div className={props.errors.dateTime && props.touched.dateTime
                                            ? "form-group error"
                                            : "form-group"}>
                                            <label htmlFor="dateTime">Date et heure du relevé</label>
                                            <Field name="dateTime" component={DateTime}/>
                                            {props.errors.dateTime && props.touched.dateTime &&
                                            <div id="feedback">{props.errors.dateTime}</div>}
                                        </div>
                                        <div className={props.errors.previousDateTime && props.touched.previousDateTime
                                            ? "form-group error"
                                            : "form-group"}>
                                            <label htmlFor="previousDateTime">Date et heure du précédent relevé</label>
                                            <Field name="previousDateTime" component={DateTime}/>
                                            {props.errors.previousDateTime && props.touched.previousDateTime &&
                                            <div id="feedback">{props.errors.previousDateTime}</div>}
                                        </div>
                                        <div className={props.errors.precipitations && props.touched.precipitations
                                            ? "form-group error"
                                            : "form-group"}>
                                            <label htmlFor="password">Quantité de précipitations (en mm)</label>
                                            <input
                                                id="precipitations"
                                                type="text"
                                                name="precipitations"
                                                onChange={props.handleChange}
                                                onBlur={props.handleBlur}
                                                value={props.values.precipitations}
                                                className="form-control"
                                            />
                                            {props.errors.precipitations && props.touched.precipitations &&
                                            <div id="feedback">{props.errors.precipitations}</div>}
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

export default withRouter(ReleveForm)