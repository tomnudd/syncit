import React from "react";

function FriendItem(props) {
    return (
        <div>
            <p>Name: {props.info.first} {props.info.last}</p>
            <p>ID: {props.info.id}</p>
        </div>
    )
}

export default FriendItem;