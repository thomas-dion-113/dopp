import React, {Component} from 'react';
import {Route, Switch, Link, withRouter} from 'react-router-dom';

import Home from './Home';
import ReleveForm from "./ReleveForm";
import Statistiques from "./Statistiques";
import PrivateRoute from "./auth/PrivateRoute";
import LoginPage from "./auth/LoginPage";
import AnonymousRoute from "./auth/AnonymousRoute";
import RegisterPage from "./auth/RegisterPage";
import RegisterComplete from "./auth/RegisterComplete";
import ResetPassword from "./auth/ResetPassword";
import RequestResetPassword from "./auth/RequestResetPassword";
import RequestResetPasswordComplete from "./auth/RequestResetPasswordComplete";
import ResetPasswordComplete from "./auth/ResetPasswordComplete";
import PluvioForm from "./PluvioForm";
import Pluvios from "./Pluvios";
import Pluvio from "./Pluvio";
import Page404 from "./Page404";
import Releves from "./Releves";
import ChoosePluvio from "./ChoosePluvio";
import AccountForm from "./AccountForm";
import MentionsLegales from "./MentionsLegales";

import logo from '../images/dopp_logo_white_h_60.png';
import logoResp from '../images/dopp_white_h_60.png';
import profile from '../images/profile.svg';
import OfflinePage from "./OfflinePage";
import {messageSW, Workbox} from "workbox-window";

class App extends Component {

    constructor() {
        super();

        this.state = {
            tokenRequest: localStorage.getItem('token') ? false : true,
            loadingSW: true,
            maj: false,
            token: JSON.parse(localStorage.getItem('token')),
            user: null,
            notification: false,
            notificationTitle: '',
            notificationMessage: '',
        };

        if ('serviceWorker' in navigator) {
            const wb = new Workbox(process.env.SITE_URL + '/sw.js');
            let registration;

            const showSkipWaitingPrompt = (event) => {
                console.log('UPDATE');
                this.setState({
                    loadingSW: true,
                    maj:true,
                });
                wb.addEventListener('controlling', (event) => {
                    console.log('RELOAD');
                    window.location.reload();
                });

                if (registration && registration.waiting) {
                    messageSW(registration.waiting, {type: 'SKIP_WAITING'});
                }

                console.log('END UPDATE');
            };

            wb.addEventListener('waiting', showSkipWaitingPrompt);
            wb.addEventListener('externalwaiting', showSkipWaitingPrompt);

            console.log('REGISTER');
            wb.register().then((r) => registration = r).then(() => {
                if (this.state.token) {
                    this.getUserFromToken();
                }

                setInterval(function () {
                    if (this.state.token) {
                        this.getUserFromToken();
                    }
                }.bind(this), 3540000);

                this.setState({loadingSW: false});
                this.initNav();
                console.log('END REGISTER');
            });
        }
    }

    componentDidMount() {
        this.initNav();
    }

    initNav() {
        console.log("INIT NAV");
        let navLinks = document.querySelectorAll('nav .navbar-brand, nav .nav-link:not(#navbarDropdown), nav .nav-item .btn');
        navLinks.forEach(navLink => {
            navLink.addEventListener('touchend', () => {
                console.log("HIDE NAVBAR 0");
                setTimeout(() => {
                    console.log("HIDE NAVBAR 1");
                    $('.navbar-collapse').collapse('hide');
                    console.log("HIDE NAVBAR 2");
                }, 150);
            });
        });
    }

    async getUserFromToken() {
        await fetch(process.env.SITE_URL + "/api/private/token_check", {
            headers: {
                "Authorization": "Bearer " + this.state.token
            }
        })
            .then(async res => {
                if (res.status === 200) {
                    let data = await res.json();
                    this.setState({
                        tokenRequest: true,
                        user: data
                    });
                    this.initNav();
                } else {
                    let data = await res.json();
                    await fetch(process.env.SITE_URL + "/api/public/token/refresh",
                        {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                refresh_token: JSON.parse(localStorage.getItem('refresh_token')),
                            })
                        })
                        .then(async res => {
                            if (res.status === 200) {
                                let data = await res.json();
                                localStorage.setItem('token', JSON.stringify(data.token));
                                this.setState({token: data.token});
                                this.getUserFromToken();
                            } else {
                                localStorage.removeItem('token');
                                localStorage.removeItem('refresh_token');
                                this.setState({
                                    tokenRequest: true
                                });
                                this.initNav();
                            }
                        });
                }
            })
    }

    login(data, from) {
        this.setState({token: data.token});

        this.getUserFromToken().then(() => {
            this.props.history.replace(from);
            this.initNav();
        });
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');

        this.setState({
            token: null,
            user: null
        });

        this.props.history.push("/");

        setTimeout(() => {
            this.initNav();
        }, 500);
    }

    setNotification(title, message, time) {
        this.setState({
            notification: true,
            notificationTitle: title,
            notificationMessage: message,
        });

        setTimeout(() => {
            this.setState({
                notification: false,
            });
        }, time * 1000);
    }

    render() {
        return (
            <div>
                {this.state.tokenRequest && !this.state.loadingSW ? (
                    <>
                        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                            <Link className={"navbar-brand"} to={"/"}>
                                <img className="logo d-none d-md-block" src={logo}/>
                                <img className="logo d-md-none" src={logoResp}/>
                            </Link>
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                    aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                <ul className="navbar-nav mr-auto">
                                    <li className="nav-item">
                                        <Link className={"nav-link"} to={"/"}>Accueil</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={"nav-link"} to={"/ajouter-un-releve"}>Ajouter un relevé</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={"nav-link"} to={"/statistiques"}>Statistiques</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={"nav-link"} to={"/mentions-legales"}>Mentions Légales</Link>
                                    </li>
                                </ul>
                                {this.state.user ? (
                                    <>
                                        <ul className="navbar-nav justify-content-end d-none d-md-block">
                                            <li className="nav-item dropdown ml-2 mr-3">
                                                <a className="nav-link d-flex align-items-center" href="#"
                                                   id="navbarDropdown" role="button"
                                                   data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <span className="text-light mr-3">{this.state.user.name}</span><img
                                                    src={profile}/>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-center"
                                                     aria-labelledby="navbarDropdown">
                                                    <Link className={"dropdown-item"} to={"/mon-compte"}>Mon
                                                        compte</Link>
                                                    <Link className={"dropdown-item"} to={"/releves"}>Mes relevés</Link>
                                                    <Link className={"dropdown-item"} to={"/pluvios"}>Mes pluvios</Link>
                                                    <div className="dropdown-item logout"
                                                         onClick={this.logout.bind(this)}>Déconnexion
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                        <ul className="navbar-nav d-md-none border-top border-white">
                                            <li className="nav-item">
                                                <Link className={"nav-link"} to={"/mon-compte"}>Mon compte</Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link className={"nav-link"} to={"/releves"}>Mes relevés</Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link className={"nav-link"} to={"/pluvios"}>Mes pluvios</Link>
                                            </li>
                                            <li className="nav-item">
                                                <div className={"nav-link"}
                                                     onClick={this.logout.bind(this)}>Déconnexion
                                                </div>
                                            </li>
                                        </ul>
                                    </>
                                ) : (
                                    <ul className="navbar-nav justify-content-end">
                                        <li className="nav-item">
                                            <Link className="btn btn-primary mr-3" to={"/login"}>Connexion</Link>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </nav>
                        <div
                            className={"alert alert-primary alert-dismissible " + (this.state.notification ? "show" : "")}>
                            <strong>{this.state.notificationTitle}</strong>
                            <span>{this.state.notificationMessage}</span>
                            <button type="button" className="close" data-dismiss="alert">&times;</button>
                        </div>
                        <Switch>
                            <Route path="/statistiques">
                                <Statistiques token={this.state.token} user={this.state.user}
                                              notificationCallback={(title, message, time) => {
                                                  this.setNotification(title, message, time)
                                              }}/>
                            </Route>
                            <Route path="/mentions-legales">
                                <MentionsLegales/>
                            </Route>
                            <Route path="/404">
                                <Page404/>
                            </Route>
                            <Route path="/offline.html">
                                <OfflinePage/>
                            </Route>
                            <AnonymousRoute path="/login" user={this.state.user}>
                                <LoginPage loginCallbackFunction={(values, from) => {
                                    this.login(values, from);
                                }}/>
                            </AnonymousRoute>
                            <AnonymousRoute path="/inscription" user={this.state.user}>
                                <RegisterPage/>
                            </AnonymousRoute>
                            <AnonymousRoute path="/inscription-complete" user={this.state.user}>
                                <RegisterComplete/>
                            </AnonymousRoute>
                            <AnonymousRoute path="/mot-de-passe-oublie" user={this.state.user}>
                                <RequestResetPassword/>
                            </AnonymousRoute>
                            <AnonymousRoute path="/mot-de-passe-oublie-complete" user={this.state.user}>
                                <RequestResetPasswordComplete/>
                            </AnonymousRoute>
                            <AnonymousRoute path="/modification-mot-de-passe" user={this.state.user}>
                                <ResetPassword/>
                            </AnonymousRoute>
                            <AnonymousRoute path="/modification-mot-de-passe-complete" user={this.state.user}>
                                <ResetPasswordComplete/>
                            </AnonymousRoute>
                            <PrivateRoute path="/mon-compte" user={this.state.user}>
                                <AccountForm token={this.state.token} user={this.state.user}
                                             accountFormCallbackFunction={() => this.getUserFromToken()}
                                             notificationCallback={(title, message, time) => {
                                                 this.setNotification(title, message, time)
                                             }}
                                />
                            </PrivateRoute>
                            <PrivateRoute path="/releves" user={this.state.user}>
                                <Releves token={this.state.token}/>
                            </PrivateRoute>
                            <PrivateRoute exact path="/ajouter-un-releve" user={this.state.user}>
                                <ChoosePluvio token={this.state.token}/>
                            </PrivateRoute>
                            <PrivateRoute path="/ajouter-un-releve/:id" user={this.state.user}>
                                <ReleveForm token={this.state.token} notificationCallback={(title, message, time) => {
                                    this.setNotification(title, message, time)
                                }}/>
                            </PrivateRoute>
                            <PrivateRoute path="/modifier-un-releve/:id" user={this.state.user}>
                                <ReleveForm token={this.state.token} notificationCallback={(title, message, time) => {
                                    this.setNotification(title, message, time)
                                }}/>
                            </PrivateRoute>
                            <PrivateRoute path="/ajouter-un-pluvio" user={this.state.user}>
                                <PluvioForm token={this.state.token} notificationCallback={(title, message, time) => {
                                    this.setNotification(title, message, time)
                                }}/>
                            </PrivateRoute>
                            <PrivateRoute path="/pluvios" user={this.state.user}>
                                <Pluvios token={this.state.token}/>
                            </PrivateRoute>
                            <PrivateRoute path="/pluvio/:id" user={this.state.user}>
                                <Pluvio token={this.state.token}/>
                            </PrivateRoute>
                            <Route path="/">
                                <Home notificationCallback={(title, message, time) => {
                                    this.setNotification(title, message, time)
                                }}/>
                            </Route>
                        </Switch>
                    </>
                ) : (
                    <div className="container d-flex flex-column align-items-center">
                        <div className="spinner-border m-auto" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        {this.state.maj && (
                            <h1 className="mt-5">Mise à jour...</h1>
                        )}
                    </div>
                )}
            </div>
        )
    }
}

export default withRouter(App);