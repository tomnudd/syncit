import React from "react";

import { Button } from "react-bootstrap";
import Container from "@material-ui/core/Container";

let HOST = "http://127.0.0.1:8090";

class MyInfo extends React.Component {
    constructor() {
        super()
        this.state = {
            value: "",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        // do things
        alert(this.state.value);
        event.preventDefault();
    }

    addFriend() {
        let friend = prompt("Please enter their Spotify username!", "Name");
        if (friend != null && friend != "") {
            // not empty
            fetch(HOST + "/api/friends/add", {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: friend
                })
            })
            .then(res => console.log(res));
        }
    }

    render() {
        let button;
        if (!this.props.loggedIn) {
            button = <a className="btn btn-success" href="http://127.0.0.1:8090/login">Sign in with Spotify</a>;
        } else {
            button = (
                <div>
                    <a className="btn btn-success" onClick={this.addFriend}>Add friend</a>{' '}
                    <a className="btn btn-success" onClick={this.shareMusic}>Share my music</a>{' '}
                </div>
            )
        }
        return (
            <div className={this.props.loggedIn ? "heroContent" : "fullHero"}>
                <Container maxWidth="sm">
                    <h1 className={this.props.loggedIn ? "chop" : ""}>SyncItUp</h1>
                    <h2>Listen to Spotify with your friends</h2>
                </Container>
                <div className="heroButtons">
                    {button}
                </div>
            </div>
        )
    }
}

export default MyInfo;