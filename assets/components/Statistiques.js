import React, {Component} from 'react';
import {Line} from "react-chartjs-2";
import 'chartjs-plugin-colorschemes';
import moment from 'moment';
import $ from "jquery";
import configDateRangePicker from "./configDateRangePicker";
import deviceDetection from "./DeviceDetection";
import closeImage from '../images/close.svg';
import rotateImage from '../images/rotate.svg';

Chart.Legend.prototype.afterFit = function() {
    this.height = this.height + 10;
};

class Statistiques extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            noData: false,
            data: {},
            settings: '',
            security: this.props.user ? 'private' : 'public',
            event: deviceDetection() ? 'touchend' : 'click',
        };
    }

    componentDidMount() {
        this.initDateRangePicker();

        this.getReleves();
    }

    initDateRangePicker() {
        $('input[name="custom-dates"]').daterangepicker({
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
            $('input[name="custom-dates"]').val(datesFr);
            // this.currentSetting.innerHTML = datesFr;
            this.changeSettingsCustomDates(picker.startDate, picker.endDate);
        }.bind(this));
    }

    changeSettingsCustomDates(dateFrom, dateTo) {
        this.setState({
            settings: 'custom_dates/' + dateFrom.toISOString() + '/' + dateTo.toISOString(),
        });

        document.querySelector('.container-input .close').addEventListener(this.state.event, () => {
            this.setState({settings: ''});
            $('input[name="custom-dates"]').val('');
            this.getReleves();
        });

        this.getReleves();
    }

    getReleves() {
        this.setState({
            loading: true,
        });

        fetch(process.env.SITE_URL + "/api/" + this.state.security + "/stats/average/" + this.state.settings, {
            headers: {
                "Authorization": "Bearer " + this.props.token
            }
        }).then(async res => {
            if (res.status === 200) {
                let result = await res.json();
                let datasets = [];
                let globalData = [];
                let userData = [];

                result.global.forEach(day => {
                    globalData.push({
                        x: moment(day.castDate, "YYYY-MM-DD"),
                        y: parseFloat(day.avgPrecipitations)
                    });
                });

                if (globalData.length > 1) {
                    datasets.push({
                        label: 'Tous les pluvios',
                        data: globalData,
                        fill: false,
                        borderWidth: 5,
                    });
                }

                if (result.user) {
                    result.user.forEach(day => {
                        if (!userData[day.id]) {
                            userData[day.id] = [];
                        }
                        userData[day.id].push({
                            x: moment(day.castDate, "YYYY-MM-DD"),
                            y: parseFloat(day.avgPrecipitations),
                            name: day.name,
                        });
                    });

                    userData.forEach(data => {
                        if (data.length > 1) {
                            datasets.push({
                                label: data[0].name,
                                data: data,
                                fill: false,
                                borderWidth: 5,
                            });
                        }
                    });
                }

                if (datasets.length > 0) {
                    this.setState({
                        loading: false,
                        noData: false,
                        data: {
                            datasets: datasets,
                        }
                    });
                } else {
                    this.setState({
                        loading: false,
                        noData: true,
                        data: {
                            datasets: datasets,
                        }
                    });
                }
            }
        }).catch(function (error) {
            this.props.notificationCallback('Hors connexion', 'Vous devez être connecté à internet pour voir les statistiques', 5);
        }.bind(this));
    }

    render() {
        return (
            <div className="container">
                <h1 className="text-center">Statistiques</h1>
                <h2 className="mt-5">Évolution de la moyenne des précipitations par jour</h2>
                <div className="container-input">
                    <label>Filtrer par dates :</label>
                    <div className="container-input-close">
                        <input name="custom-dates" className="form-control"/>
                        {this.state.settings != '' && (
                            <img className="close" src={closeImage}/>
                        )}
                    </div>
                </div>
                {this.state.loading ? (
                    <div className="container xs text-center">
                        <div className="spinner-border m-auto" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="chart-container">
                        {this.state.noData ? (
                            <p className="no-data">Aucune donnée</p>
                        ) : (
                            <Line
                                labels={this.state.labels}
                                data={this.state.data}
                                // width={100}
                                // height={50}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        xAxes: [{
                                            ticks: {
                                                maxTicksLimit: 15,
                                                autoSkip: false,
                                                maxRotation: 45,
                                                minRotation: 45
                                            },
                                            type: 'time',
                                            time: {
                                                unit: 'day',
                                                isoWeekday: true,
                                                tooltipFormat: 'll',
                                                displayFormats: {
                                                    day: 'DD/MM/Y'
                                                }
                                            },
                                            scaleLabel: {
                                                display: true,
                                                labelString: 'Date',
                                            }
                                        }],
                                        yAxes: [{
                                            ticks: {
                                                beginAtZero: true,
                                            },
                                            scaleLabel: {
                                                display: true,
                                                labelString: 'Précipitations (en mm)'
                                            },
                                        }]
                                    },
                                    plugins: {
                                        colorschemes: {
                                            scheme: 'brewer.Paired12',
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                )}
                <div className="rotate">
                    <img src={rotateImage} />
                    <span>Tourner votre appareil</span>
                </div>
            </div>
        )
    }
}

export default Statistiques;