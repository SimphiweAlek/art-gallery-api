const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
//Some of the top imports may not be reuired here. Clean up code when everything's laid out

const app = express();
app.use(express.json()); //allows json type parsing
app.use(cors()); //whitelists API

//request structure
app.use((req, res, next) => {
	console.log(`${req.method}, ${req.url}`);
	console.log('Headers:', req.headers);
	console.log('Body:', req.body);
	next();
});

const db = require("./models");

//Consider routing through the authRouter

//ROUTES

//Start API and listen...
db.sequelize.sync().then(() => {
	//TODO: API auto-terminates after a few seconds, Look into that!!
    app.listen(process.env.PORT, () => {
        console.log("Server running on port 3001...")
    });
});