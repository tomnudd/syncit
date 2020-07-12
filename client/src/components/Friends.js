import React from "react";

import FriendItem from "./FriendItem";

class Friends extends React.Component {
    constructor() {
        super()
        this.state = {
            friends: [],
        }
    }

    componentWillReceiveProps(newProps) {
        console.log(newProps)
        if (newProps.info.friends !== undefined) {
            this.setState({friends: newProps.info.friends});
        }
    }

    render() {
        let friendComponents;
        let len = 0;
        if (this.state.friends.length > 0) {
            len = this.state.friends.length;
            friendComponents = this.state.friends.map(friend => {
                if (friend != null) {
                    return <FriendItem key={friend._id} info={friend} />
                }
            })
        }

        return (
            <div>
                <h2>Friends</h2>
                {len <= 0 && <p>Add friends to use the app!</p>}
                <div className="list">
                    {friendComponents}
                </div>
            </div>
        )
    }
}

export default Friends;