import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';

class ResetPasswordComplete extends Component {
    render() {
        return (
            <div className="container mt-5">
                <h1>Mot de passe modifié avec succès</h1>
                <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                <div className="text-center">
                    <Link class="btn btn-primary" to="/login">Connexion</Link>
                </div>
            </div>
        )
    }
}

export default withRouter(ResetPasswordComplete);