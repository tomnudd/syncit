import React from "react";

import { Button } from "react-bootstrap";
import { Card } from "react-bootstrap";

let HOST = "http://127.0.0.1:8090";

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function syncSong(songURI, position) {
    console.log('is being called')
    fetch(HOST + "/api/friends/add", {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uri: songURI,
            position_ms: position * 1000
        })
    })
    .then(res => console.log(res));
}

function MockFriendItem(props) {
    return (
        <Card border="success" style={{ width: '18rem' }}>
            <Card.Header>{props.info.name}</Card.Header>
            <Card.Body>
                <Card.Text>
                    Listening to {props.info.song.name}. {Math.floor(props.info.song.position / 60)}:{pad(props.info.song.position % 60, 2)} / {Math.floor(props.info.song.end / 60)}:{pad(props.info.song.end % 60, 2)}
                </Card.Text>
                <Button variant="primary" onClick={syncSong(props.info.song.uri, props.info.song.position)}>Sync</Button>
            </Card.Body>
        </Card>
    )
}

export default MockFriendItem;