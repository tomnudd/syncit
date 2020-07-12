import React from "react";

import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

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

    render() {
        let button;
        if (!this.props.loggedIn) {
            button = <button>Sign in with Spotify</button>;
        } else {
            button = (
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                        <textarea placeholder="User name" value={this.state.value} onChange={this.handleChange} />
                        </label><br />
                        <input type="submit" value="Add friend" />
                    </form>
                    <button>Share my music</button>
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