import React from "react";

import FriendItem from "./FriendItem";
import MockFriendItem from "./MockFriendItem";

let HOST = "http://127.0.0.1:8090";

let mockFriends = [
    {
        id: 1,
        name: "Tom",
        song: {
            name: "The Reynolds Pamphlet",
            artist: "Original Broadway Cast of Hamilton",
            position: "12",
            end: "128",
            uri: "spotify:track:7D1Lf7N7AtCuEq5PGJtIPz"
        }
    }
]

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

        let mockFriendComponents = mockFriends.map(friend => {
            if (friend != null) {
                return <MockFriendItem key={friend._id} info={friend} />
            }
        })


        return (
            <div className="friendArea">
                {len <= 0 && <p>Add friends to use the app!</p>}
                <div className="list">
                    {mockFriendComponents}
                </div>
            </div>
        )
    }
}

export default Friends;