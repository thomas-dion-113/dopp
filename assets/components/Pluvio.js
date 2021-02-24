import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import arrowLeft from '../images/left-arrow-white.svg';
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import Offline from "./Offline";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

class Pluvio extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            pluvio: null,
            offline: false,
        };
    }

    componentDidMount() {

        fetch(process.env.SITE_URL + "/api/private/pluvio/" + document.location.pathname.split('/').pop(), {
            headers: {
                "Authorization": "Bearer " + this.props.token
            }
        }).then(async res => {
            if (res.status === 200) {
                let data = await res.json();
                this.setState({
                    loading: false,
                    offline: false,
                    pluvio: JSON.parse(data)
                });

                let map = L.map('map-view').setView([this.state.pluvio.coordinates.lat, this.state.pluvio.coordinates.lng], 16);
                L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + process.env.MAPBOX_TOKEN, {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    id: 'mapbox/satellite-streets-v9',
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: process.env.MAPBOX_TOKEN,
                }).addTo(map);

                let marker = new L.marker([this.state.pluvio.coordinates.lat, this.state.pluvio.coordinates.lng]).addTo(map);
            } else {
                this.props.history.replace('/404');
            }
        }).catch(function (error) {
            this.setState({
                loading: false,
                offline: true,
            });
        }.bind(this));
    }

    render() {
        return (
            <div className="container md">
                {this.state.loading ? (
                    <div className="spinner-border m-auto d-block" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    <>
                        {this.state.offline ? (
                            <>
                                <Offline reloadCallbackFunction={() => {
                                    this.componentDidMount();
                                }}/>
                            </>
                        ) : (
                            <div className="container-pluvio-view">
                                <div>
                                <Link to='/pluvios'>
                                    <button className="btn btn-primary">
                                        <img width="20" className="mr-2" src={arrowLeft}/>
                                        <span>Retour</span></button>
                                </Link>
                                </div>
                                <h1 className="mt-3 mb-4">Emplacement du pluvio : {this.state.pluvio.name}</h1>
                                <div className="container-map-view">
                                    <div id="map-view"></div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }
}

export default withRouter(Pluvio)