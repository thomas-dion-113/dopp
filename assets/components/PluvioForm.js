import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from './yupLocales'
import MapField from "./MapField";

Yup.setLocale(yupLocale);

class PluvioForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            requestLoading: false,
        };
    }

    handlerSubmit(values, {setErrors}) {
        this.setState({requestLoading: true});
        fetch(process.env.SITE_URL + "/api/private/create_pluvio",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + this.props.token,
                },
                body: JSON.stringify({
                    name: values.name,
                    coordinates: values.coordinates,
                })
            })
            .then(async res => {
                if (res.status === 200) {
                    this.props.history.push('/pluvios');
                } else {
                    setErrors({
                        passwordRepeat: 'Erreur'
                    });

                    this.setState({requestLoading: false});
                }
            })
    }

    render() {
        return (
            <Formik
                initialValues={{
                    name: '',
                    coordinates: '',
                }}
                validate={this.validate}
                validationSchema={
                    Yup.object().shape({
                        name: Yup.string()
                            .required(),
                        coordinates: Yup.string()
                            .required(),
                    })}
                onSubmit={this.handlerSubmit.bind(this)}
            >
                {props => (
                    <div className="container container-form">
                        <div>
                            <h1>Ajouter un pluvio</h1>
                            <form onSubmit={props.handleSubmit} noValidate="noValidate">
                                <div className={props.errors.name && props.touched.name
                                    ? "form-group error"
                                    : "form-group"}>
                                    <label htmlFor="name">Nom du pluvio</label>
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
                                <div className={props.errors.coordinates && props.touched.coordinates
                                    ? "form-group error"
                                    : "form-group"}>
                                    <label>Cliquez sur la carte pour placer votre pluvio</label>
                                    <input
                                        id="coordinates"
                                        type="hidden"
                                        name="coordinates"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.coordinates}
                                        className="form-control"
                                    />

                                    <MapField formik={props}/>
                                    {props.errors.coordinates && props.touched.coordinates &&
                                    <div id="feedback">{props.errors.coordinates}</div>}
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
        );
    }
}

export default withRouter(PluvioForm)