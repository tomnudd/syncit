const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const session = require("express-session");
const {URLSearchParams} = require("url");

/*
    Environment variables
*/

const config = require("dotenv").config();
 
if (config.error) {
    console.log("No .env file found!")
}

/*
    Session
*/
app.use(session({
    secret: "nutella is better than peanut butter",
    saveUninitialized: false
}))

app.use(bodyParser.json());

let users = {};

/*
    Database setup
*/

const mongoose = require("mongoose"),
    Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    console.log("Connected to database");
});

/*
    User schema
*/

const userSchema = new Schema({
    _id: String,
    access_token: String,
    token_expiry: {type: Date, default: Date.now()},
    refresh_token: String,
    displayName: String,
    url: String,
    friends: [String]
})

// Hunting for user accounts!
userSchema.statics.findOrCreate = function findOrCreate(profile, callback) {
    let userObj = new this();

    this.findOne({_id: profile.id}, function(err, res) {
        if (!res) {
            console.log(profile.id, "not found");
            let dateObj = new Date();
            dateObj.setSeconds(dateObj.getSeconds() + parseInt(profile.expires_in));
            userObj._id = profile.id;
            userObj.displayName = (profile.display_name === undefined) ? profile.id : profile.display_name;
            userObj.url = (profile.external_urls.spotify === undefined) ? "" : profile.external_urls.spotify;
            userObj.access_token = profile.access_token;
            userObj.refresh_token = profile.refresh_token;
            userObj.token_expiry = dateObj;
            userObj.friends = [];
            userObj.save(callback);
        } else {
            User.updateOne({_id: profile.id}, {access_token: profile.access_token, refresh_token: profile.refresh_token}).exec();
            console.log(profile.id, "found");
            callback(err, res);
        }
    });
};

const User = db.model("User", userSchema);

/*
    Spotify calls
*/

const authHeader = "Basic " + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
const SPOTIFY_REDIRECT_URI = "http://127.0.0.1:8090/login/callback";
// user-read-recently-played playlist-modify-private user-library-read
const SPOTIFY_SCOPES = "\
user-read-playback-state user-modify-playback-state \
user-read-currently-playing playlist-read-collaborative \
playlist-modify-public playlist-read-private \
playlist-modify-private"

// (Step 1)
// User gives app permission to use Spotify
// (login route)
app.get("/login", (req, res) => {
    res.redirect("https://accounts.spotify.com/authorize" + 
    '?response_type=code' +
    '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
    '&scope=' + encodeURIComponent(SPOTIFY_SCOPES) +
    '&redirect_uri=' + encodeURIComponent(SPOTIFY_REDIRECT_URI));
})

// callback for spotify
app.get("/login/callback", async (req, res) => {
    if (req.query.error) {
        // temp solution until FE set up
        console.log(req.query.error);
        res.redirect("/login");
    } else if (req.query && req.query.code) {
        const code = req.query.code;

        const parameters = new URLSearchParams();
        parameters.append("grant_type", "authorization_code");
        parameters.append("redirect_uri", SPOTIFY_REDIRECT_URI);
        parameters.append("code", code);

        // (Step 2)
        // Spotify returns us to /callback
        // From here, now request a token if the user authoritzed
        let rawToken = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: parameters,
        }).then(response => response.json());
        
        // (Step 3)
        // Grab user information, such as id and profile URL
        let userData = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: {
                "Authorization": 'Bearer ' + rawToken.access_token,
            },
        }).then(response => response.json());

        // (Step 4)
        // combine user data with token data
        let combinedData = Object.assign({}, userData, rawToken);

        combinedObj = Object.assign({}, combinedData);
        delete combinedObj["_id"];
        users[combinedData.id] = combinedObj;

        // (Step 5)
        // Add to database if they don't
        User.findOrCreate(combinedData, (err, result) => {
            if (!err) {
                req.session.user = result;
                res.redirect("/")
            } else {
                res.send(err);
            }
        });
    }
})

/*
    Spotify API calls
*/

// new token? look no further
async function requestNew(userObj) {
    const parameters = new URLSearchParams();
    parameters.append("grant_type", "refresh_token");
    parameters.append("refresh_token", userObj.refresh_token);

    // Grab a new access token
    let rawToken = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Authorization": authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: parameters,
    }).then(response => response.json());

    // Update database
    // update tokens and token_expiry
    
    let dateObj = new Date();
    dateObj.setSeconds(dateObj.getSeconds() + parseInt(rawToken.expires_in));

    let toChange = {
        access_token: rawToken.access_token,
        refresh_token: rawToken.refresh_token,
        token_expiry: dateObj,
    }

    User.updateOne({_id: userObj.id}, toChange, (err, dat) => {
        if (err) {
            console.log(err);
        }
    })

    return Object.assign({}, userObj, toChange);
}

app.get("/api/currentSong", async (req, res) => {
    // this would've been an implied return with (!req.session || !req.session.user)
    // but that apparently doesn't work!

    if (!req.session || !req.session.user) {
        return res.json({response: "Not logged in!"});
    }

    // Check if token has expired
    // If it has, replace it

    if (!req.session.user.token_expiry || new Date(req.session.user.token_expiry) > new Date()) {
        userObj = await requestNew(req.session.user).then((result) => {
            return result;
        });

        // replace session object with our swanky new one
        req.session.user = userObj;
    }

    let playingObj = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: "GET",
        headers: {
            "Authorization": 'Bearer ' + req.session.user.access_token,
        },
    }).then(response => {
        if (response.status == 204) {
            return {response: "No song playing"};
        } else {
            return response.json();
        }
    });

    res.send(playingObj);
})

async function currentlyPlaying(user) {
    // Check if token has expired
    // If it has, replace it

    let playingObj = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: "GET",
        headers: {
            "Authorization": 'Bearer ' + user.access_token,
        },
    }).then(response => {
        if (response.status == 204) {
            return {response: "No song playing"};
        } else {
            return response.json();
        }
    });

    return playingObj;
}

// GET /api/friends/list
// returns a list of friends
app.get("/api/friends/list", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.send({response: "Not logged in!"});
    }

    let myFriends = Object.assign({}, req.session.user.friends);

    res.send(myFriends);
})

// POST /api/friends/add
// body {id: "friendID"}
// returns updated list of friends
app.post("/api/friends/add", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.send({response: "Not logged in!"});
    }

    let friendId = req.body.id;
    
    users[req.session.user._id]["friends"].append(friendId);
    req.session.user.friends.append(friendId);

    let toChange = {
        friends: users[req.session.user._id]["friends"],
    }

    User.updateOne({_id: req.session.user._id}, toChange, (err, dat) => {
        if (err) {
            res.send({response: "Failed to update friends!"});
        }
    })

    res.send(req.session.user.friends);
})

// GET /api/attempt
// Syncs you up to a bit of Hamilton
app.get("/api/attempt", async (req, res) => {
    let spot = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
            "Authorization": 'Bearer ' + req.session.user.access_token,
        },
        body: JSON.stringify({
            uris: ["spotify:track:4cxvludVmQxryrnx1m9FqL"],
            position_ms: 7500,
        }),
    }).then((response) => {
        // error handling comes later!
        return response;
    })
    console.log(spot);

    res.redirect("/");
})

/*
    Routes
*/

// Default
app.get("/", async (req, res) => {
    res.end("Hi!");
    if (req.session.user) {
        console.log(req.session.user);
    }
})

// Is the user logged in?
// Returns object {result: Boolean}
app.get("/api/loggedIn", (req, res) => {
    if (req.session && req.session.user) {
        res.send({response: true});
    }
    res.send({response: false});
})

// POST /api/share
// body {share: true} or {share: false}
// turns online or offline
app.post("/api/share", (req, res) => {
    if (!req.session || !req.session.user) {
        res.send({response: "Not logged in!"});
    }
    if (req.body.share == true) {
        users[req.session.user._id]["status"] = "online";
    } else {
        users[req.session.user._id]["status"] = "offline";
    }
})

// GET /api/status
app.get("/api/status", (req, res) => {
    if (!req.session || !req.session.user) {
        res.send({response: "Not logged in!"});
    }

    if (users[req.session.user._id]["status"] == "online") {
        res.send({response: "online"});
    } else {
        res.send({response: "offline"});
    }
})

/*
    Main loop
    Every two seconds, let's check what they're listening to
*/

var requestLoop = setInterval(async function() {
    activeUsers = [];
    for (let user in users) {
        if (true) {
            let curPlaying = await currentlyPlaying(users[user]).then(response => response);
            users[user]["song"] = curPlaying;
            console.log("AAAA", users[user]);
        }
    }
}, 1000);

requestLoop;
  

module.exports = app;