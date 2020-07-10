import React from "react";

import FriendItem from "./FriendItem";

let friendsList = [
    {
        id: 1,
        first: "Tom",
        last: "Nudd"
    },
    {
        id: 2,
        first: "Dominic",
        last: "Harvey"
    }
]

class MyFriends extends React.Component {
    constructor() {
        super()
        this.state = {
          friends: friendsList,
        }
      }

    render() {
        const friendComponents = this.state.friends.map(friend =>
            <FriendItem key={friend.id} info={friend} />
          )

        return (
            <div>
                <h2>Friends</h2>
                <div className="list">
                    {friendComponents}
                </div>
            </div>
        )
    }
}

export default MyFriends;