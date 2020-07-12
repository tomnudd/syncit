import React from "react";

import { Button } from "react-bootstrap";
import { Card } from "react-bootstrap";

let HOST = "http://127.0.0.1:8090";

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

class MockFriendItem extends React.Component {
    constructor() {
        super()

        this.state = {
            timePassed: 0
        }

        this.syncSong = this.syncSong.bind(this);
    }

    syncSong() {
        console.log('is being called')
        fetch(HOST + "/api/changeSong", {
            method: "POST",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uri: this.props.info.song.uri,
                position_ms: (parseInt(this.props.info.song.position) + this.state.timePassed) * 1000
            })
        })
        .then(res => console.log(res));
    }

    componentDidMount() {
        setInterval(() => this.setState(oldState => ({timePassed: oldState.timePassed + 1})), 1000);
    }

    render() {
        console.log(this.state.timePassed, this.props.info.song.position);
        return (
            <Card border="success" style={{ width: '18rem' }}>
                <Card.Header>{this.props.info.name}</Card.Header>
                <Card.Body>
                    <Card.Text>
                        Listening to <b>{this.props.info.song.name}</b> by <i>{this.props.info.song.artist}</i>. {Math.floor((parseInt(this.props.info.song.position) + this.state.timePassed) / 60)}:{pad((parseInt(this.props.info.song.position) + this.state.timePassed) % 60, 2)} / {Math.floor(this.props.info.song.end / 60)}:{pad(this.props.info.song.end % 60, 2)}
                    </Card.Text>
                    <Button variant="primary" onClick={this.syncSong}>Sync</Button>
                </Card.Body>
            </Card>
        )
    }
}

export default MockFriendItem;