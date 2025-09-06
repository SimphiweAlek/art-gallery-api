const express = require("express");
const bodyParser = require('body-parser');
const session = require("express-session");
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const router = express.Router();
const authController = require("./controllers/authController");
//Some of the top imports may not be reuired here. Clean up code when everything's laid out

const app = express();
app.use(express.json()); //allows json type parsing
app.use(cors({			//whitelists API
	origin: ["http://localhost:5173"],
	credentials: true, //allow cookies
})); 

//request structure logging
app.use((req, res, next) => {
	console.log(`${req.method}, ${req.url}`);
	console.log('Headers:', req.headers);
	console.log('Body:', req.body);
	next();
});

const db = require("./models");

//Dev-Only Session store (dies on end/restart)
app.use(session({
	secret: process.env.SESSION_SECRET || "GalleryAPI",
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		sameSite: "lax",
		secure: false, //using http not httpS
		maxAge: 1000*60*5, //10 minutes session length
	}
}));

//Auth routes
app.post("/auth/register", authController.register);
app.post("/auth/login", authController.login);
app.post("/auth/logout", authController.logout);
app.get("/auth/me", authController.me);

//Model routes
app.use("/users", require("./routes/User"));
app.use("/artists", require("./routes/Artist"));
app.use("/artpieces", require("./routes/ArtPiece"));
app.use("/exhibitions", require("./routes/Exhibition"));
app.use("/galleries", require("./routes/Gallery"));
app.use("/notifications", require("./routes/Notification"));
app.use("/registrations", require("./routes/Registration"));

//Start API and listen...
db.sequelize.sync().then(() => {
	//TODO: Consider having an upload image feature for each artpiece, and one of the images assigned as the face of the exhibition
    app.listen(process.env.PORT, () => {
        console.log("Server running on port 3001...")
    });
});