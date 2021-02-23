import React, {Component} from 'react';
import OfflineImage from '../images/no-wifi.svg';

class OfflinePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container">
                <div className="d-flex flex-column align-items-center justify-content-center">
                    <img style={{width:"50px",height:"auto"}} src={OfflineImage}/>
                    <h1 className="text-center">Pas de connexion internet</h1>
                    <button className="btn btn-primary">Recharger</button>
                </div>
            </div>
        )
    }
}

export default OfflinePage;