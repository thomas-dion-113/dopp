import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {Field, Formik} from 'formik';
import * as Yup from 'yup';
import yupLocale from './yupLocales';
import DateTime from "./DateTime";
import setInputFilter from "./inputFilter";

Yup.setLocale(yupLocale);

class ChoosePluvio extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            pluvios: null,
        };
    }

    componentDidMount() {
        fetch(process.env.SITE_URL + "/api/private/pluvios/", {
            headers: {
                "Authorization": "Bearer " + this.props.token
            }
        }).then(async res => {
            if (res.status === 200) {
                let data = await res.json();
                this.setState({
                    loading: false,
                    pluvios: JSON.parse(data)
                });
            } else {
                this.props.history.replace('/404');
            }
        });
    }

    render() {
        return (
            <div className="container xs">
                {this.state.loading ? (
                    <div className="container xs text-center">
                        <div className="spinner-border m-auto" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <ul className="items">
                        <h1>Ajouter un relevé</h1>
                        {this.state.pluvios.length > 0 ? (
                            <>
                                <p>Veuillez choisir un pluvio pour votre relevé :</p>
                                {this.state.pluvios.map((pluvio) => {
                                    return (
                                        <li key={pluvio.id} className="item">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h2>{pluvio.name}</h2>
                                                <Link to={"/ajouter-un-releve/" + pluvio.id}>
                                                    <button className="btn btn-primary">Sélectionner
                                                    </button>
                                                </Link>
                                            </div>
                                        </li>
                                    );
                                })}
                            </>
                        ) : (
                            <>
                                <p className="text-center mt-5">Vous n'avez pas de pluvio</p>
                                <Link to={"/ajouter-un-pluvio"} className="d-flex justify-content-center">
                                    <button className="btn btn-primary">Cliquez ici pour en ajouter un
                                    </button>
                                </Link>
                            </>
                        )}
                    </ul>
                )}
            </div>
        );
    }
}

export default withRouter(ChoosePluvio)