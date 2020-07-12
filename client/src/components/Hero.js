import React from "react";

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
            button = <button>Sign in with Spotify</button>;
        } else {
            button = (
                <div>
                    <button onClick={this.addFriend} value="Add friend">Add friend</button><br/>
                    <button onClick={this.shareMusic} value="Share my music">Share my music</button>
                </div>
            )
        }
        return (
            <div className={this.props.loggedIn ? "heroContent" : "fullHero"}>
                <Container maxWidth="sm">
                    <h1 className={this.props.loggedIn ? "chop" : ""}>SyncItUp</h1>
                    <h2>Listen along to Spotify with your friends</h2>
                </Container>
                <div className="heroButtons">
                    {button}
                </div>
            </div>
        )
    }
}

export default MyInfo;