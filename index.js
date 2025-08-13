const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const router = express.Router();
const authController = require("./controllers/authController");
//Some of the top imports may not be reuired here. Clean up code when everything's laid out

const app = express();
app.use(express.json()); //allows json type parsing
app.use(cors()); //whitelists API

//request structure logging
app.use((req, res, next) => {
	console.log(`${req.method}, ${req.url}`);
	console.log('Headers:', req.headers);
	console.log('Body:', req.body);
	next();
});

const db = require("./models");

//Auth routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

//Model routes
router.use("/users", require("./routes/User"));
router.use("/artists", require("./routes/Artist"));
router.use("/artpieces", require("./routes/ArtPiece"));
router.use("/exhibitions", require("./routes/Exhibition"));
router.use("/galleries", require("./routes/Gallery"));
router.use("/notifications", require("./routes/Notification"));
router.use("/registrations", require("./routes/Registration"));

//Start API and listen...
db.sequelize.sync().then(() => {
	//TODO: Consider having an upload image feature for each artpiece, and one of the images assigned as the face of the exhibition
    app.listen(process.env.PORT, () => {
        console.log("Server running on port 3001...")
    });
});