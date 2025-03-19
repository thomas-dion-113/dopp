import React, {Component} from 'react';
import {Line} from "react-chartjs-2";
import {Bar} from "react-chartjs-2";
import 'chartjs-plugin-colorschemes';
import moment from 'moment';
import $ from "jquery";
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import configDateRangePicker from "./configDateRangePicker";
import deviceDetection from "./DeviceDetection";
import closeImage from '../images/close.svg';
import rotateImage from '../images/rotate.svg';

Chart.Legend.prototype.afterFit = function() {
    this.height = this.height + 10;
};

const monthStrings = {
    0: 'Janvier',
    1: 'Février',
    2: 'Mars',
    3: 'Avril',
    4: 'Mai',
    5: 'Juin',
    6: 'Juillet',
    7: 'Août',
    8: 'Septembre',
    9: 'Octobre',
    10: 'Novembre',
    11: 'Décembre',
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
            format: 'days',
            period: '7',
            labels: [],
        };
    }

    componentWillUnmount() {
        $('input[name="custom-dates"]').data('daterangepicker').remove();
    }

    componentDidMount() {
        this.initDateRangePicker();
        this.updateFormat('days', '7');
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

    closeDatepicker() {
        this.setState({settings: ''});
        $('input[name="custom-dates"]').val('');
        this.updateFormat('days');
    }

    changeSettingsCustomDates(dateFrom, dateTo) {
        this.setState({
            settings: '/custom_dates/' + dateFrom.toISOString() + '/' + dateTo.toISOString(),
        });

        this.updateFormat('days', null, moment(dateFrom, "YYYY-MM-DD").subtract(1, 'days'), moment(dateTo, "YYYY-MM-DD"));
    }

    enumerateDaysBetweenDates(startDate, endDate) {
        var dates = [];

        var currDate = startDate.add(1, 'days').startOf('day');
        var lastDate = endDate.add(1, 'days').startOf('day');

        dates.push(currDate.clone().format('DD/MM/YYYY'));

        while(currDate.add(1, 'days').diff(lastDate) < 0) {
            dates.push(currDate.clone().format('DD/MM/YYYY'));
        }

        return dates;
    }

    enumerateWeeksBetweenWeekNumbers(startWeek, endWeek) {
        var weeks = [];

        var i = startWeek;

        if (startWeek > endWeek) {
            for (i;i<=52;i++) {
                weeks.push('Semaine ' + i.toString());
            }

            i = 1;
        }

        for (i;i<endWeek;i++) {
            weeks.push('Semaine ' + i.toString());
        }

        return weeks;
    }

    enumerateMonthsBetweenMonthsNumbers(startMonth, endMonth) {
        var months = [];

        startMonth += 1;

        var i = startMonth;

        if (startMonth > endMonth) {
            for (i;i<=11;i++) {
                months.push(monthStrings[i]);
            }

            i = 0;
        }

        for (i;i<=endMonth;i++) {
            months.push(monthStrings[i]);
        }

        return months;
    }

    enumerateYearsBetweenYearsNumbers(startYear, endYear) {
        console.log(startYear, endYear);
        var years = [];

        startYear += 1;

        var i = startYear;

        for (i;i<=endYear;i++) {
            years.push(i.toString());
        }

        return years;
    }

    updateFormat(format, period = null, dateFrom = null, dateTo = null) {
        var labels = null;

        switch (format) {
            case 'days':
                if (period === null) {
                    $('#pills-days .nav-link').removeClass('active');

                    if (dateFrom === null && dateTo === null) {
                        $('#pills-days .nav-link.first').toggleClass('active');
                        period = '7';
                    }
                }

                if (period) {
                    dateFrom = moment().subtract(period, 'days');
                    dateTo = moment();
                };

                labels = this.enumerateDaysBetweenDates(dateFrom, dateTo);
                break;
            case 'weeks':
                if (period === null) {
                    $('#pills-weeks .nav-link').removeClass('active');
                    $('#pills-weeks .nav-link.first').toggleClass('active');
                }

                period = period ?? '5';
                var weekNumberFrom = moment().subtract(period, 'weeks').week();
                var weekNumberTo = moment().week();
                labels = this.enumerateWeeksBetweenWeekNumbers(weekNumberFrom, weekNumberTo);
                break;
            case 'months':
                if (period === null) {
                    $('#pills-months .nav-link').removeClass('active');
                    $('#pills-months .nav-link.first').toggleClass('active');
                }

                period = period ?? '6';
                var monthNumberFrom = moment().subtract(period, 'months').month();
                var monthNumberTo = moment().month();
                labels = this.enumerateMonthsBetweenMonthsNumbers(monthNumberFrom, monthNumberTo);
                break;
            case 'years':
                if (period === null) {
                    $('#pills-years .nav-link').removeClass('active');
                    $('#pills-years .nav-link.first').toggleClass('active');
                }

                period = period ?? '5';
                var yearNumberFrom = moment().subtract(period, 'years').year();
                var yearNumberTo = moment().year();
                labels = this.enumerateYearsBetweenYearsNumbers(yearNumberFrom, yearNumberTo);
                break;
        }

        this.setState({
            format: format,
            period: period,
            labels: labels,
        }, () => {
            this.getReleves();
        });
    }

    getReleves() {
        this.setState({
            loading: true,
        });

        fetch(process.env.SITE_URL + "/api/" + this.state.security + "/stats/average/" + this.state.format + "/" + this.state.period + this.state.settings, {
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
                    var xValue = '';

                    switch (this.state.format) {
                        case "days":
                            xValue = moment(day.castDate, "YYYY-MM-DD").format('DD/MM/YYYY');
                            break;
                        case "weeks":
                            xValue = 'Semaine ' + day.castDate.toString();
                            break;
                        case "months":
                        case "years":
                            xValue = day.castDate;
                            break;
                    }

                    globalData.push({
                        x: xValue,
                        y: parseFloat(day.avgPrecipitations)
                    });
                });

                if (globalData.length > 1) {
                    datasets.push({
                        label: 'Tous les pluvios',
                        data: globalData,
                        fill: false,
                        borderWidth: 5,
                        stack: 'global',
                    });
                }

                if (result.user) {
                    result.user.forEach(day => {
                        if (!userData[day.id]) {
                            userData[day.id] = [];
                        }

                        var xValue = '';

                        switch (this.state.format) {
                            case "days":
                                xValue = moment(day.castDate, "YYYY-MM-DD").format('DD/MM/YYYY');
                                break;
                            case "weeks":
                                xValue = 'Semaine ' + day.castDate.toString();
                                break;
                            case "months":
                            case "years":
                                xValue = day.castDate;
                                break;
                        }

                        userData[day.id].push({
                            x: xValue,
                            y: parseFloat(day.avgPrecipitations),
                            name: day.name,
                        });
                    });

                    userData.forEach((data,index) => {
                        if (data.length > 0) {
                            datasets.push({
                                label: data[0].name,
                                data: data,
                                fill: false,
                                borderWidth: 5,
                                stack: 'pluvio-' + index,
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
                <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <a onClick={() => this.updateFormat('days')} className="nav-link active" id="pills-days-tab" data-toggle="pill"
                                data-target="#pills-days" type="button" role="tab" aria-controls="pills-days"
                                aria-selected="true">Par jours
                        </a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a onClick={() => this.updateFormat('weeks')} className="nav-link" id="pills-weeks-tab" data-toggle="pill"
                                data-target="#pills-weeks" type="button" role="tab" aria-controls="pills-weeks"
                                aria-selected="false">Par semaines
                        </a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a onClick={() => this.updateFormat('months')} className="nav-link" id="pills-months-tab" data-toggle="pill"
                                data-target="#pills-months" type="button" role="tab" aria-controls="pills-months"
                                aria-selected="false">Par mois
                        </a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a onClick={() => this.updateFormat('years')} className="nav-link" id="pills-years-tab" data-toggle="pill"
                           data-target="#pills-years" type="button" role="tab" aria-controls="pills-years"
                           aria-selected="false">Par années
                        </a>
                    </li>
                </ul>
                <div className="tab-content" id="pills-tabContent">
                    <div className="tab-pane fade show active" id="pills-days" role="tabpanel"
                         aria-labelledby="pills-days-tab">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('days', 7)} className="nav-link first active" data-toggle="pill" type="button" >7 derniers jours</a>
                            </li>
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('days', 15)} className="nav-link" data-toggle="pill" type="button">15 derniers jours</a>
                            </li>
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('days', 30)} className="nav-link" data-toggle="pill" type="button">30 derniers jours</a>
                            </li>
                        </ul>

                        <div className="container-input">
                            <label>Filtrer par dates :</label>
                            <div className="container-input-close">
                                <input readOnly name="custom-dates" className="form-control"/>
                                {this.state.settings != '' && (
                                    <img className="close" src={closeImage} onClick={() => this.closeDatepicker()}/>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="pills-weeks" role="tabpanel"
                         aria-labelledby="pills-weeks-tab">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('weeks', 5)} className="nav-link first active" data-toggle="pill" type="button">5 dernières semaines</a>
                            </li>
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('weeks', 10)} className="nav-link" data-toggle="pill" type="button">10 dernières semaines</a>
                            </li>
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('weeks', 30)} className="nav-link" data-toggle="pill" type="button">30 dernières semaines</a>
                            </li>
                        </ul>
                    </div>
                    <div className="tab-pane fade" id="pills-months" role="tabpanel"
                         aria-labelledby="pills-months-tab">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('months', 6)} className="nav-link first active" data-toggle="pill" type="button">6 derniers mois</a>
                            </li>
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('months', 12)} className="nav-link" data-toggle="pill" type="button">12 derniers mois</a>
                            </li>
                        </ul>
                    </div>
                    <div className="tab-pane fade" id="pills-years" role="tabpanel"
                         aria-labelledby="pills-years-tab">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('years', 5)} className="nav-link first active" data-toggle="pill"  type="button">5 dernières années</a>
                            </li>
                            <li className="nav-item">
                                <a onClick={() => this.updateFormat('years', 10)} className="nav-link" data-toggle="pill"  type="button">10 dernières années</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="container-min-height">
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
                                <Bar
                                    options={{
                                        tooltips: {
                                            callbacks: {
                                                title: function(tooltipItems, data) {
                                                    return data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index].x;
                                                },
                                            }
                                        },
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Chart.js Bar Chart',
                                            },
                                        },
                                        scales: {
                                            xAxes: [{
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: 'Date',
                                                },
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
                                    }}
                                    data={{
                                        labels: this.state.labels,
                                        datasets: this.state.data.datasets,
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="rotate">
                    <img src={rotateImage} />
                    <span>Tourner votre appareil</span>
                </div>
            </div>
        )
    }
}

export default Statistiques;