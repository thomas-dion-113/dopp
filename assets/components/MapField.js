import React, {Component} from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import {withRouter} from "react-router-dom";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

class MapField extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let map = L.map('map-field').setView([47.302578, -2.458123], 13);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + process.env.MAPBOX_TOKEN, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/satellite-streets-v9',
            tileSize: 512,
            zoomOffset: -1,
        }).addTo(map);

        let marker = L.marker();

        map.on('click', function(e) {
            let popLocation= e.latlng;
            marker.setLatLng(popLocation).addTo(map);
            this.props.formik.setFieldValue('coordinates', JSON.stringify(e.latlng));
        }.bind(this));
    }

    render() {
        return (
            <div id="map-field"></div>
        );
    }
}

export default withRouter(MapField)