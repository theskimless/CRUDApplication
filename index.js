function _(data) { console.log(data) }
const PORT = process.env.PORT || 3000;

const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, "dist")));

app.listen(PORT, () => _(PORT));