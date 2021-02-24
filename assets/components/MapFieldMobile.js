import React, {Component} from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import {withRouter} from "react-router-dom";
import targetImage from "../images/target.svg";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

class MapFieldMobile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            location: null,
            locationChange: false,
        };

        this.show = this.show.bind(this);
        this.refreshLocation = this.refreshLocation.bind(this);
        this.onLocationFound = this.onLocationFound.bind(this);
        this.valid = this.valid.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    show() {
        document.querySelector('#map-field-mobile').classList.add('active');
        document.querySelector('.container-map-field-buttons').classList.add('active');

        if (this.mapMobile === undefined) {
            this.mapMobile = L.map('map-field-mobile').setView([47.302578, -2.458123], 12);
            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + process.env.MAPBOX_TOKEN, {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox/satellite-streets-v9',
                tileSize: 512,
                zoomOffset: -1,
            }).addTo(this.mapMobile);

            this.mapMobile.locate({
                watch: true,
            });
            this.mapMobile.on('locationfound', this.onLocationFound);

            let target = L.control({
                position : 'topleft'
            });
            target.onAdd = function(map) {
                this._div = L.DomUtil.create('div', 'container-target');
                this._div.innerHTML = "<img class='target' src='" + targetImage + "' />";
                return this._div;

            };
            target.addTo(this.mapMobile);
        }
    }

    valid() {
        this.props.formik.setFieldValue('coordinates', JSON.stringify(this.mapMobile.getCenter()));
        document.querySelector('#map-field-mobile').classList.remove('active');
        document.querySelector('.container-map-field-buttons').classList.remove('active');
    }

    cancel() {
        if (this.props.formik.values.coordinates) {
            let coordinates = JSON.parse(this.props.formik.values.coordinates);
            this.mapMobile.setView([coordinates.lat, coordinates.lng], this.mapMobile.getZoom());
        }
        document.querySelector('#map-field-mobile').classList.remove('active');
        document.querySelector('.container-map-field-buttons').classList.remove('active');
    }

    onLocationFound(e) {
        this.setState({
            location: e.latlng,
            locationChange: true,
        });
    }

    refreshLocation() {
        this.mapMobile.setView(this.state.location);
        this.setState({locationChange: false});
    }

    render() {
        return (
            <>
                <button type="button" className="btn btn-secondary" onClick={this.show}>Placer votre pluvio</button>
                <div id="map-field-mobile"></div>
                <div className="container-map-field-buttons">
                    <div className="container-buttons">
                        <button type="button" className="btn btn-light" onClick={this.cancel}>Annuler</button>
                        <button type="button" className="btn btn-primary" onClick={this.valid}>OK</button>
                    </div>
                    {this.state.locationChange && (
                        <div className="container-refresh">
                            <button type="button" className="btn btn-primary" onClick={this.refreshLocation}>Actualiser la position</button>
                        </div>
                    )}
                </div>
            </>
        );
    }
}

export default withRouter(MapFieldMobile)