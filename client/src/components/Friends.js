import React from "react";

import FriendItem from "./FriendItem";

let HOST = "http://127.0.0.1:8090";

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
                    fetch(HOST + "/api/friends/" + friend)
                        .then(res => {
                            if (res.ok) {
                                return res.json();
                            } else {
                                return {};
                            }
                        })
                        .then(res => {
                            console.log("FriendAPI", res);
                            friend = res;
                        });

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