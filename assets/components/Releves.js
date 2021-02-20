import React, {Component} from 'react';
import {Link, withRouter} from "react-router-dom";
import format from "date-fns/format";
import frLocale from "date-fns/locale/fr";
import Pagination from "react-js-pagination";

class Releves extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            releves: null,
            activePage: null,
            itemsPerPage: 10,
        };
    }

    componentDidMount() {
        fetch(process.env.SITE_URL + "/api/private/releves", {
            headers: {
                "Authorization": "Bearer " + this.props.token
            }
        }).then(async res => {
            if (res.status === 200) {
                let data = await res.json();
                this.setState({
                    loading: false,
                    releves: JSON.parse(data),
                    activePage: 1
                });
            } else {
                this.props.history.replace('/404');
            }
        })
    }

    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
        document.querySelector('div.container').scrollIntoView();
    }

    render() {
        let currentItems = [];
        if (!this.state.loading) {
            const indexOfLastItem = this.state.activePage * this.state.itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - this.state.itemsPerPage;
            currentItems = this.state.releves.slice(indexOfFirstItem, indexOfLastItem);
        }

        return (
            <div className="container xs">
                {this.state.loading ? (
                    <div className="spinner-border m-auto d-block" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    <>
                        <div className="container-horizontal">
                            <h1>Mes relevés</h1>
                            <Link to='/ajouter-un-releve'>
                                <button className="btn btn-primary">Ajouter un Relevé</button>
                            </Link>
                        </div>
                        <ul className="items">
                            {currentItems.length > 0 ? (
                                <>
                                    {currentItems.map((releve) => {
                                        return (
                                            <li key={releve.id} className="item">
                                                <h2 className="h3">{format(new Date(releve.dateTime.date + "Z"), "dd/MM/yyyy à HH:mm", {locale: frLocale})}</h2>
                                                <p>Pluvio : {releve.pluvio.name}</p>
                                                <p>Précipitations : {releve.precipitations}mm</p>
                                                <div
                                                    className="container-horizontal mt-3">
                                                    <Link to={"/modifier-un-releve/" + releve.id}>
                                                        <button className="btn btn-primary">Modifier
                                                        </button>
                                                    </Link>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {this.state.releves.length > this.state.itemsPerPage && (
                                        <Pagination
                                            activePage={this.state.activePage}
                                            itemsCountPerPage={this.state.itemsPerPage}
                                            totalItemsCount={this.state.releves.length}
                                            pageRangeDisplayed={5}
                                            hideFirstLastPages={true}
                                            itemClass="page-item"
                                            linkClass="page-link"
                                            innerClass="pagination d-flex justify-content-center"
                                            onChange={this.handlePageChange.bind(this)}
                                        />
                                    )}
                                </>
                            ) : (
                                <p className="text-center mt-5">Vous n'avez pas de Relevés</p>
                            )}
                        </ul>
                    </>
                )}
            </div>
        )
    }
}

export default withRouter(Releves);