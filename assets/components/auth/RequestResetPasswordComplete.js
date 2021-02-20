import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';

class RequestResetPasswordComplete extends Component {
    render() {
        return (
            <div className="container mt-5">
                <h1>Réinitialisation de votre mot de passe</h1>
                <p>Vous allez recevoir un email afin de réinitialiser votre mot de passe.</p>
                <Link to="/">Retourner à l'accueil</Link>
            </div>
        )
    }
}

export default withRouter(RequestResetPasswordComplete);