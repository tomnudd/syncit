const express = require("express");
const app = express();

const fetch = require("node-fetch");
const {URLSearchParams} = require("url");

/*
    Environment variables
*/

const config = require("dotenv").config();
 
if (config.error) {
    console.log("No .env file found!")
}

/*
    Database setup
*/

const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId;

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
})

// Hunting for user accounts!
userSchema.statics.findOrCreate = function findOrCreate(profile, callback) {
    let userObj = new this();

    this.findOne({_id: profile.id}, function(err, res) {
        if (!res) {
            console.log(profile.id, "not found")
            let dateObj = new Date();
            dateObj.setSeconds(dateObj.getSeconds() + parseInt(profile.expires_in));

            userObj._id = profile.id;
            userObj.displayName = (profile.display_name === undefined) ? profile.id : profile.display_name;
            userObj.url = (profile.external_urls.spotify === undefined) ? "" : profile.external_urls.spotify;
            userObj.access_token = profile.access_token;
            userObj.refresh_token = profile.refresh_token;
            userObj.token_expiry = dateObj;
            userObj.save(callback);
        } else {
            console.log("found")
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

// login route
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

        let rawToken = await fetch("https://accounts.spotify.com/api/token", {
            method: 'POST',
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: parameters,
        }).then(response => response.json());
        
        let userData = await fetch("https://api.spotify.com/v1/me", {
            method: 'GET',
            headers: {
                "Authorization": 'Bearer ' + rawToken.access_token,
            },
        }).then(response => response.json());

        // combine user data with token data
        combinedData = Object.assign({}, userData, rawToken);

        res.redirect("/")

        User.findOrCreate(combinedData, (err, result) => {
            console.log("Error", err);
            console.log("Result", result)
        });
    }
})

/*
    Routes
*/
app.get("/", async (req, res) => {
    res.end("Hi!");
})

module.exports = app;