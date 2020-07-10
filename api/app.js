const express = require("express");
const app = express();

app.get("/", async (req, res) => {
    res.end("Hi!");
})

module.exports = app;