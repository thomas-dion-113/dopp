import React, {Component} from 'react';
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import format from "date-fns/format";
import {zonedTimeToUtc} from 'date-fns-tz';
import frLocale from "date-fns/locale/fr";
import "../css/leaflet-fullscreen.css";
import "./leaflet-fullscreen";
import "./leaflet-idw";
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import Switch from './Switch';
import '../css/switch.css';
import configDateRangePicker from './configDateRangePicker';
import deviceDetection from "./DeviceDetection";

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pluvios: null,
            settings: 'last_24_h',
            otherSettingsOpened: false,
            idw: false,
            idwBounds: [],
            legendBig: false,
            grades: [0, 3, 6, 9, 12],
            switchAnimate: false,
            drag: false,
            phone: window.innerWidth < 376,
            mobile: deviceDetection() ? true : false,
            eventClick: deviceDetection() ? 'touchstart' : 'click',
            eventMouseDown: deviceDetection() ? 'touchstart' : 'mousedown',
            eventMouseUp: deviceDetection() ? 'touchend' : 'mouseup',
            eventMouseMove: deviceDetection() ? 'touchmove' : 'mousemove',
        };

        this.limits = [[47.337423, -2.500645], [47.286010, -2.502467], [47.279478, -2.439705], [47.292789, -2.402294], [47.305233, -2.418892], [47.322426, -2.460425]];
    }

    componentWillUnmount() {
        document.querySelector('html').classList.remove('home');
        $('input[name="custom-field"]').data('daterangepicker').remove();
    }

    componentDidMount() {
        document.querySelector('html').classList.add('home');
        document.querySelector('.container-map').classList.add('loading');

        this.initMap();
        this.initSettings();
        this.initOtherSettings();
        this.initLegend();
        this.initDateRangePicker();
        setTimeout(() => {
            this.getReleves();
        }, 1);
    }

    initMap() {
        this.map = L.map('home-map').fitBounds(this.limits);

        this.initMapLayers();
        this.setMapLayer();

        this.markerGroup = L.featureGroup().addTo(this.map);
        this.idwLayer = null;

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

        this.markerGroup.clearLayers();
        if (this.map.hasLayer(this.idwLayer)) {
            this.map.removeLayer(this.idwLayer);
        }

        fetch(process.env.SITE_URL + "/api/public/releves/" + this.state.settings).then(async res => {
            if (res.status === 200) {
                let data = await res.json();

                if (data.length > 0) {
                    if (!this.state.idw) {
                        data.forEach((pluvio, index) => {
                            let circleMarker = new L.circleMarker([pluvio.lat, pluvio.lng], {
                                radius: 15,
                                color: "black",
                                fillColor: this.getColor(pluvio.total_precipitations),
                                fillOpacity: 1,
                            })
                                .bindPopup(this.getPopupContent(pluvio))
                                .bindPopup(L.popup({autoPanPadding: [10, 50]}).setContent(this.getPopupContent(pluvio)))
                                .addTo(this.markerGroup);
                        });

                        this.fitBounds();

                        document.querySelector('.container-map').classList.remove('loading');
                    } else {
                        let pluvios = [];
                        let bounds = [];

                        console.log('OK');

                        data.forEach((pluvio, index) => {
                            pluvios.push([pluvio.lat, pluvio.lng, pluvio.total_precipitations]);
                            bounds.push([pluvio.lat, pluvio.lng]);
                        });

                        this.setState({idwBounds: bounds});

                        console.log(this.state.idwBounds);

                        if (this.idwLayer) {
                            this.map.removeLayer(this.idwLayer);
                        }

                        this.idwLayer = L.idwLayer(pluvios, {
                            opacity: 0.7,
                            maxZoom: 18,
                            cellSize: 6,
                            exp: 4,
                            max: this.state.legendBig ? 24 : 12,
                            gradient: {
                                0: '#ffff05',
                                0.2: '#f5ff66',
                                0.4: '#7fbb66',
                                0.6: '#66ccb9',
                                0.8: '#b2b2ff',
                                1: '#724ce5'
                            }
                        }).addTo(this.map);

                        this.idwLayer.on('idwstart', () => {
                            this.map.scrollWheelZoom.disable();
                            document.querySelector('canvas.leaflet-idwmap-layer').style.opacity = 0;
                            document.querySelector('.container-map').classList.add('loading');
                        }).on('idwend', () => {
                            document.querySelector('canvas.leaflet-idwmap-layer').style.opacity = 1;
                            document.querySelector('.container-map').classList.remove('loading');

                            window.setTimeout(() => {
                                this.map.scrollWheelZoom.enable();
                            }, 10);
                        });

                        this.fitBounds();
                    }
                } else {
                    switch (this.state.settings) {
                        case 'last_24_h':
                            this.disableSetting('last_24_h');
                            this.changeSettings('last_2_d');
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
                            this.changeSettings('last_15_d');
                            break;
                        case 'last_15_d':
                            this.disableSetting('last_15_d');
                            this.changeSettings('last_30_d');
                            break;
                        case 'last_30_d':
                            this.disableSetting('last_30_d');
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

    fitBounds() {
        if (!this.state.idw) {
            this.map.fitBounds(this.markerGroup.getBounds(), {
                maxZoom: 13,
                paddingTopLeft: [this.state.otherSettingsOpened ? 365 : 50, 50],
                paddingBottomRight: [50, 50],
            });
        } else {
            console.log("toto");
            this.map.fitBounds(this.state.idwBounds, {
                maxZoom: 13,
                paddingTopLeft: [this.state.otherSettingsOpened ? 365 : 50, 50],
                paddingBottomRight: [50, 50],
            });
        }
    }

    getLegend() {
        let div = L.DomUtil.create('div', 'info legend');

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

        for (let i = 0; i < this.state.grades.length; i++) {
            contentDiv.innerHTML +=
                '<i style="background:' + this.getColor(this.state.grades[i] + 1) + '"></i> ' +
                this.state.grades[i] + (this.state.grades[i + 1] ? ' - ' + this.state.grades[i + 1] + '<br>' : '+');

            if (i === this.state.grades.length - 1) {
                contentDiv.innerHTML += `</div>`;
                div.innerHTML = contentDiv.outerHTML + titleDiv.outerHTML;
            }
        }

        return div;
    }

    setLegend() {
        this.legendContent = document.querySelector('div#legend div.content');

        this.legendContent.innerHTML = '<p class="font-weight-bold mb-2">Précipitations (en mm)</p>';
        if (!this.state.idw) {
            this.legendContent.innerHTML += '<i style="background:#ffffff;border: 1px solid #bfbfbf;border-bottom:none"></i> 0<br>';
        }

        for (let i = 0; i < this.state.grades.length; i++) {
            this.legendContent.innerHTML +=
                '<i style="background:' + this.getColor(this.state.grades[i] + 1) + '"></i> ' +
                this.state.grades[i] + (this.state.grades[i + 1] ? ' - ' + this.state.grades[i + 1] + '<br>' : '+');

            if (i === this.state.grades.length - 1) {
                this.legendContent.innerHTML += `</div>`;
            }
        }
    }

    initLegend() {
        let elem = L.DomUtil.get('legend');
        L.DomEvent.disableClickPropagation(elem);
        L.DomEvent.on(elem, 'dblclick', L.DomEvent.stopPropagation);
        L.DomEvent.on(elem, 'mousewheel', L.DomEvent.stopPropagation);

        document.querySelector('.legend').addEventListener(this.state.eventClick, () => {
            document.querySelectorAll('.legend div').forEach(div => {
                div.classList.toggle('active');
            });
        });
    }

    getSettings() {
        let div = L.DomUtil.create('div', 'settings');
        L.DomEvent.disableClickPropagation(div);

        div.id = 'settings';

        div.innerHTML =
            `<div class="settings-menu">` +
            `<span class="current-setting">Dernières 24h</span>` +
            `<span class="vertical-separator"></span>` +
            `<span class="other-settings"></span>` +
            `</div>`;
        div.innerHTML +=
            `<div class="container-other-settings">` +
            `<span class="horizontal-separator"></span>` +
            `<div class="item">` +
            `<h3>Affichage des relevés</h3>` +
            `<div class="container-switch" id="container-switch-idw">` +
            `<span class="switch-label left active">Points</span>` +
            `<span class="container-range"><input type="range" value="0" /></span>` +
            `<div class="container-switch-label">` +
            `<span class="switch-label right">Interpolation</span>` +
            `<span data-toggle="modal" data-target="#exampleModal" class="custom-help">?</span>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `<span class="horizontal-separator"></span>` +
            `<div class="item">` +
            `<h3>Échelle de la légende</h3>` +
            `<div class="container-switch" id="container-switch-legend">` +
            `<span class="switch-label left active">0-3-6-9-12mm</span>` +
            `<span class="container-range"><input type="range" value="0" /></span>` +
            `<span class="switch-label right">0-6-12-18-24mm</span>` +
            `</div>` +
            `</div>` +
            `<span class="horizontal-separator"></span>` +
            `<div class="close-other-settings">Tout masquer</div>` +
            `</div>`;
        div.innerHTML +=
            `<div class="settings-choices">` +
            `<span class="active" id="last_24_h">Dernières 24h</span>` +
            `<span id="last_2_d">2 derniers jours</span>` +
            `<span id="last_5_d">5 derniers jours</span>` +
            `<span id="last_7_d">7 derniers jours</span>` +
            `<span id="last_15_d">15 derniers jours</span>` +
            `<span id="last_30_d">30 derniers jours</span>` +
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

        this.currentSetting.addEventListener(this.state.eventClick, () => {
            this.currentSetting.classList.toggle('active');
            this.containerSettings.classList.toggle('active');
        });

        this.settings.forEach(setting => {
            setting.addEventListener(this.state.eventClick, () => {
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

    initOtherSettings() {
        this.otherSettings = document.querySelector('.other-settings');
        this.closeOtherSettings = document.querySelector('.close-other-settings');
        this.containerOtherSettings = document.querySelector('.container-other-settings');
        this.leafletContainer = document.querySelector('.container-map');
        this.attributions = document.querySelector('.container-map .leaflet-control-attribution');

        [this.otherSettings, this.closeOtherSettings].forEach(el => {
            el.addEventListener(this.state.eventClick, () => {
                this.toggleOtherSettings();
            });
        });

        this.switchIDW = new Switch(
            document.querySelector('#container-switch-idw'),
            this.state.eventClick,
            this.state.eventMouseDown,
            this.state.eventMouseUp,
            this.state.eventMouseMove,
            (idw) => {
                this.setState({idw: idw});
                this.getReleves();
                this.setMapLayer();
                this.setLegend();

                if (this.state.phone) {
                    this.toggleOtherSettings();
                }
            }
        );

        this.switchLegend = new Switch(
            document.querySelector('#container-switch-legend'),
            this.state.eventClick,
            this.state.eventMouseDown,
            this.state.eventMouseUp,
            this.state.eventMouseMove,
            (legendBig) => {
                this.setState({
                    legendBig: legendBig,
                    grades: legendBig ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12],
                });
                this.getReleves();
                this.setLegend();

                if (this.state.phone) {
                    this.toggleOtherSettings();
                }
            }
        );
    }

    toggleOtherSettings() {
        this.otherSettings.classList.toggle('active');
        this.containerOtherSettings.classList.toggle('active');
        this.leafletContainer.classList.toggle('other-settings-opened');
        this.currentSetting.classList.remove('active');
        this.containerSettings.classList.remove('active');
        this.setState({otherSettingsOpened: !this.state.otherSettingsOpened});
        console.log(this.attributions);
        if (this.state.phone) {
            if (this.state.otherSettingsOpened) {
                this.attributions.hidden = true;
            } else {
                setTimeout(() => {
                    this.attributions.hidden = false;
                }, 100);
            }
        } else {
            this.fitBounds();
        }
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

        if (this.state.otherSettingsOpened && this.state.phone) {
            this.toggleOtherSettings();
        }
    }

    changeSettingsCustom(dateFrom, dateTo) {
        this.currentSetting.classList.remove('active');
        this.containerSettings.classList.remove('active');
        this.setState({settings: 'custom/' + dateFrom.toISOString() + '/' + dateTo.toISOString()});
        this.getReleves();

        if (this.state.otherSettingsOpened && this.state.phone) {
            this.toggleOtherSettings();
        }
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
        } else if (total_precipitations < this.state.grades[1]) {
            return this.state.idw ? '#f5ff66' : '#b1b1fd';
        } else if (total_precipitations < this.state.grades[2]) {
            return this.state.idw ? '#7fbb66' : '#7c7cf2';
        } else if (total_precipitations < this.state.grades[3]) {
            return this.state.idw ? '#66ccb9' : '#2f2fc0';
        } else if (total_precipitations < this.state.grades[4]) {
            return this.state.idw ? '#b2b2ff' : '#06066a';
        } else {
            return this.state.idw ? '#724ce5' : '#000032';
        }
    }

    setMapLayer() {
        if (!this.state.idw) {
            if (this.map.hasLayer(this.streetLayer)) {
                this.map.removeLayer(this.streetLayer);
            }
            this.map.addLayer(this.sateliteLayer);
        } else {
            if (this.map.hasLayer(this.sateliteLayer)) {
                this.map.removeLayer(this.sateliteLayer);
            }
            this.map.addLayer(this.streetLayer);
        }
    }

    initMapLayers() {
        this.sateliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + process.env.MAPBOX_TOKEN, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/satellite-streets-v9',
            tileSize: 512,
            zoomOffset: -1,
        });

        this.streetLayer = L.tileLayer('https://api.mapbox.com/styles/v1/thomasdion/ckuvd94j9omar17o4cmhlgyp2/tiles/{z}/{x}/{y}?access_token=' + process.env.MAPBOX_TOKEN, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
        });
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

                <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog"
                     aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Affichage des relevés par interpolation</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                L'interpolation spatiale permet de proposer une estimation des points inconnus à partir des points connus. Plus d'informations <a target="_blank" href="https://docs.qgis.org/2.8/fr/docs/gentle_gis_introduction/spatial_analysis_interpolation.html#spatial-interpolation-in-detail">sur cette page</a>.<br></br><br></br>
                                Le type d'interpolation utilisé ici est la <a target="_blank" href="https://fr.wikipedia.org/wiki/Pond%C3%A9ration_inverse_%C3%A0_la_distance">pondération inverse à la distance</a>.
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Home;