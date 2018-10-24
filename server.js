require("./db/connection");
require("./db/models");

const express = require('express');
const app = express();
const port = 4000;

const cors = require('cors');
const bodyParser = require('body-parser');
const services = require("./services");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', services);

app.listen(port, () => console.log(`Web server listening on port ${port}!`));
