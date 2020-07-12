import React from "react";

import FriendItem from "./FriendItem";

class Friends extends React.Component {
    render() {
        let friendComponents;
        let len = 0;
        if (this.props.info.friends !== undefined && this.props.info.friends.length > 0) {
            len = this.props.info.friends.length;
            friendComponents = this.props.info.friends.map(friend =>
                <FriendItem key={friend._id} info={friend} />
              )
        }

         

        return (
            <div>
                <h2>Friends</h2>
                {len > 0 && <p>Add friends to use the app!</p>}
                <div className="list">
                    {friendComponents}
                </div>
            </div>
        )
    }
}

export default Friends;