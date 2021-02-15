import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';

class RegisterComplete extends Component {
    render() {
        return (
            <div className="container mt-5">
                <h1>Inscription terminée</h1>
                <p>Vous aller recevoir un email afin de valider votre compte.</p>
                <Link to="/">Retourner à l'accueil</Link>
            </div>
        )
    }
}

export default withRouter(RegisterComplete);