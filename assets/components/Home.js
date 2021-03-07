import React, {Component} from 'react';
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import format from "date-fns/format";
import { zonedTimeToUtc } from 'date-fns-tz';
import frLocale from "date-fns/locale/fr";
import "../css/leaflet-fullscreen.css";
import "./leaflet-fullscreen";
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import configDateRangePicker from './configDateRangePicker';
import deviceDetection from "./DeviceDetection";

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pluvios: null,
            settings: 'last_24_h',
            mobile: deviceDetection() ? true : false,
            event: deviceDetection() ? 'touchstart' : 'click'
        };

        this.limits = [[47.337423, -2.500645], [47.286010, -2.502467], [47.279478, -2.439705], [47.292789, -2.402294], [47.305233, -2.418892], [47.322426, -2.460425]];
    }

    componentWillUnmount() {
        document.querySelector('html').classList.remove('home');
    }

    componentDidMount() {
        document.querySelector('html').classList.add('home');
        document.querySelector('.container-map').classList.add('loading');

        this.initMap();
        this.initSettings();
        this.initLegend();
        this.initDateRangePicker();
        setTimeout(() => {
            this.getReleves();
        }, 1);
    }

    initMap() {
        this.map = L.map('home-map').fitBounds(this.limits);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + process.env.MAPBOX_TOKEN, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/satellite-streets-v9',
            tileSize: 512,
            zoomOffset: -1,
        }).addTo(this.map);

        this.markerGroup = L.layerGroup().addTo(this.map);

        this.map.zoomControl.setPosition('bottomright');

        let legend = L.control({position: 'bottomleft'});
        legend.onAdd = () => this.getLegend();
        legend.addTo(this.map);

        let settings = L.control({position: 'topleft'});
        settings.onAdd = () => this.getSettings();
        settings.addTo(this.map);
    }

    initDateRangePicker() {
        $('input[name="custom-field"]').daterangepicker({
            autoUpdateInput: false,
            autoApply: true,
            locale: {
                format: "DD/MM/YYYY",
                separator: " - ",
                fromLabel: "Du",
                toLabel: "Au",
                weekLabel: "S",
                daysOfWeek: configDateRangePicker.daysShort,
                monthNames: configDateRangePicker.months,
                firstDay: 1
            },
            maxDate: new Date()
        }).on('show.daterangepicker', function (ev, picker) {
            document.querySelector('.daterangepicker').classList.add('active');
        }).on('hide.daterangepicker', function (ev, picker) {
            document.querySelector('.daterangepicker').classList.remove('active');
        }).on('apply.daterangepicker', function (ev, picker) {
            let datesFr = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
            this.customField.value = datesFr;
            this.currentSetting.innerHTML = datesFr;
            this.changeSettingsCustom(picker.startDate, picker.endDate);
        }.bind(this));
    }

    getReleves() {
        if (document.querySelector('.container-map')) {
            document.querySelector('.container-map').classList.add('loading');
        }

        fetch(process.env.SITE_URL + "/api/public/releves/" + this.state.settings).then(async res => {
            if (res.status === 200) {
                let data = await res.json();

                this.markerGroup.clearLayers();

                if (data.length > 0) {
                    data.forEach((pluvio, index) => {
                        let circleMarker = new L.circleMarker([pluvio.lat, pluvio.lng], {
                            radius: 15,
                            color: "black",
                            fillColor: this.getColor(pluvio.total_precipitations),
                            fillOpacity: 1,
                        })
                            .bindPopup(this.getPopupContent(pluvio))
                            .addTo(this.markerGroup);
                    });
                    document.querySelector('.container-map').classList.remove('loading');
                } else {
                    switch (this.state.settings) {
                        case 'last_24_h':
                            this.disableSetting('last_24_h');
                            this.changeSettings('last_2_d')
                            break;
                        case 'last_2_d':
                            this.disableSetting('last_2_d');
                            this.changeSettings('last_5_d');
                            break;
                        case 'last_5_d':
                            this.disableSetting('last_5_d');
                            this.changeSettings('last_7_d');
                            break;
                        case 'last_7_d':
                            this.disableSetting('last_7_d');
                            document.querySelector('.container-map').classList.remove('loading');
                            break;
                        default:
                            document.querySelector('.container-map').classList.remove('loading');
                            break;
                    }
                }
            }
        }).catch(function (error) {
            if (error === 'TypeError: Failed to fetch') {
                this.props.notificationCallback('Hors connexion', 'Vous devez être connecté à internet pour voir la cartographie', 5);
                if (this.state.settings !== 'last_24_h') {
                    this.changeSettings('last_24_h');
                }
                this.containerCustomSetting.classList.remove('active');
            }
        }.bind(this));
    }

    getLegend() {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 3, 6, 9, 12],
            labels = [];

        div.id = 'legend';

        let contentDiv = document.createElement("div");
        contentDiv.classList.add('content');

        let titleDiv = document.createElement("div");
        titleDiv.classList.add('title');

        if (this.state.mobile) {
            titleDiv.classList.add('active');
        } else {
            contentDiv.classList.add('active');
        }

        titleDiv.innerHTML = `<span>Légende</span>`;

        contentDiv.innerHTML =
            '<p class="font-weight-bold mb-2">Précipitations (en mm)</p>' +
            '<i style="background:#ffffff;border: 1px solid #bfbfbf;"></i> 0<br>';

        for (let i = 0; i < grades.length; i++) {
            contentDiv.innerHTML +=
                '<i style="background:' + this.getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? ' - ' + grades[i + 1] + '<br>' : '+');

            if (i === grades.length - 1) {
                contentDiv.innerHTML += `</div>`;
                div.innerHTML = contentDiv.outerHTML + titleDiv.outerHTML;
            }
        }

        return div;
    }

    initLegend() {
        let elem = L.DomUtil.get('legend');
        L.DomEvent.on(elem, 'dblclick', L.DomEvent.stopPropagation);
        L.DomEvent.on(elem, 'mousewheel', L.DomEvent.stopPropagation);

        document.querySelector('.legend').addEventListener(this.state.event, () => {
            document.querySelectorAll('.legend div').forEach(div => {
                div.classList.toggle('active');
            });
        });
    }

    getSettings() {
        let div = L.DomUtil.create('div', 'settings');

        div.id = 'settings';

        div.innerHTML = `<span class="current-setting">Dernières 24h</span>`;
        div.innerHTML +=
            `<div class="settings-choices">` +
            `<span class="active" id="last_24_h">Dernières 24h</span>` +
            `<span id="last_2_d">2 derniers jours</span>` +
            `<span id="last_5_d">5 derniers jours</span>` +
            `<span id="last_7_d">7 derniers jours</span>` +
            `<span id="custom">Dates personnalisées</span>` +
            `<div id="container-custom-field"><input readonly placeholder="Dates" name="custom-field" class="form-control"/></div>` +
            `</div>`;

        return div;
    }

    initSettings() {
        this.currentSetting = document.querySelector('.current-setting');
        this.containerSettings = document.querySelector('.settings-choices');
        this.containerCustomSetting = document.querySelector('#container-custom-field');
        this.customField = document.querySelector('#container-custom-field input');
        this.settings = document.querySelectorAll('.settings-choices span');

        let elem = L.DomUtil.get('settings');
        L.DomEvent.on(elem, 'dblclick', L.DomEvent.stopPropagation);
        L.DomEvent.on(elem, 'mousewheel', L.DomEvent.stopPropagation);

        this.currentSetting.addEventListener(this.state.event, () => {
            this.currentSetting.classList.toggle('active');
            this.containerSettings.classList.toggle('active');
        });

        this.settings.forEach(setting => {
            setting.addEventListener(this.state.event, () => {
                if (!setting.classList.contains('active') && !setting.classList.contains('disable')) {
                    if (setting.id !== 'custom') {
                        this.containerCustomSetting.classList.remove('active');
                        this.changeSettings(setting.id);
                    } else {
                        this.containerCustomSetting.classList.add('active');
                        this.settings.forEach(otherSetting => {
                            otherSetting.classList.remove('active');
                        });
                        setting.classList.add('active');
                    }
                }
            });
        });
    }

    changeSettings(setting) {
        let settingElement = document.querySelector('#' + setting);
        this.settings.forEach(otherSetting => {
            otherSetting.classList.remove('active');
        });
        settingElement.classList.add('active');
        this.currentSetting.classList.remove('active');
        this.containerSettings.classList.remove('active');
        this.currentSetting.innerHTML = settingElement.innerHTML;
        this.setState({settings: setting});
        this.getReleves();
    }

    changeSettingsCustom(dateFrom, dateTo) {
        this.currentSetting.classList.remove('active');
        this.containerSettings.classList.remove('active');
        this.setState({settings: 'custom/' + dateFrom.toISOString() + '/' + dateTo.toISOString()});
        this.getReleves();
    }

    disableSetting(setting) {
        let settingElement = document.querySelector('#' + setting);
        settingElement.classList.add('disable');
    }

    getPopupContent(pluvio) {
        let popupContent = `<h3 class="text-center">${pluvio.total_precipitations.toString()}mm</h3>`;
        let releves = pluvio.releves.split('|');

        releves.forEach((releve, index) => {
            let precipitations = releve.split(';')[0];
            let dateTime = releve.split(';')[1];
            popupContent = popupContent + `<p>${precipitations}mm le ${format(zonedTimeToUtc(dateTime + "Z", 'Europe/Paris'), "dd/MM/yyyy à HH:mm", {locale: frLocale})}`;
        });

        return popupContent;
    }

    getColor(total_precipitations) {
        if (total_precipitations == 0) {
            return '#ffffff';
        } else if (total_precipitations < 3) {
            return '#b1b1fd';
        } else if (total_precipitations < 6) {
            return '#7c7cf2';
        } else if (total_precipitations < 9) {
            return '#2f2fc0';
        } else if (total_precipitations < 12) {
            return '#06066a';
        } else {
            return '#000032';
        }
    }

    render() {
        return (
            <div className='container-map loading'>
                <div id='home-map'></div>
                <div className="container-loading">
                    <div className="spinner-border m-auto d-block" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default Home;