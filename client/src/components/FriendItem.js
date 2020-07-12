import React from "react";

function FriendItem(props) {
    console.log(props);
    return (
        <div>
            <p>{props.info}</p>
            <hr />
        </div>
    )
}

export default FriendItem;