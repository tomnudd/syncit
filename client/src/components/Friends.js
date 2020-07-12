import React from "react";

import FriendItem from "./FriendItem";

class MyFriends extends React.Component {
    render() {
        let text;
        if (this.props.info.friends !== undefined && this.props.info.friends.length > 0) {
            text = this.props.info.friends;
        } else {
            text = "Add friends to use the app!";
        }

        /*const friendComponents = this.props.info.friends.map(friend =>
            <FriendItem key={friend.id} info={friend} />
          )

        return (
            <div>
                <h2>Friends</h2>
                <div className="list">
                    {friendComponents}
                </div>
            </div>
        )*/
        return (
            <p>{text}</p>
        )
    }
}

export default MyFriends;