const express = require("express");
const app = express();
const path = require("path");

const PORT = 8080;

app.use(express.static("dist"));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/dist/index.html"));
});

app.listen(PORT, () => {
    console.warn(`Battle Arena Server is now live on port`, PORT);
});