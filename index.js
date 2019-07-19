function _(data) { console.log(data) }
const PORT = process.env.PORT || 3000;

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => _(port));