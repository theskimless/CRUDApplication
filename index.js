function _(data) { console.log(data) }
const PORT = process.env.PORT || 5000;

const express = require("express");
const app = express();

// const http = require("http").Server(app);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => _(PORT));