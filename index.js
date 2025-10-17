const express = require("express");
const bodyParser = require('body-parser');
const session = require("express-session");
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const router = express.Router();
const authController = require("./controllers/authController");
const { ensureAuth } = require("./middleware/auth");
const path = require('path'); //will use this for image local storage
//Some of the top imports may not be reuired here. Clean up code when everything's laid out

const app = express();
app.use('/public', express.static(path.join(__dirname, 'public'))); //makes any file on 'public' folder accessible by URL
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
		maxAge: 6000*60*5, //60 minutes session length
	}
}));

//Auth routes
app.post("/auth/register", authController.register);
app.post("/auth/login", authController.login);
app.post("/auth/logout", authController.logout);
app.put(`/auth/update/:ID`, ensureAuth, authController.update);
app.get("/auth/me", ensureAuth, authController.me);
app.put("/auth/me/update", ensureAuth, authController.updateProfile);

//Model routes
app.use("/users", require("./routes/User"));
app.use("/artists", require("./routes/Artist"));
app.use("/artpieces", require("./routes/ArtPiece"));
app.use("/exhibitions", require("./routes/Exhibition"));
app.use("/galleries", require("./routes/Gallery"));
app.use("/notifications", require("./routes/Notification"));
app.use("/registrations", require("./routes/Registration"));
app.use("/dashboard", require("./routes/dashboard"));

//Start API and listen...
db.sequelize.sync({ alter: true }).then(() => {
	//TODO: Consider having an upload image feature for each artpiece, and one of the images assigned as the face of the exhibition
    app.listen(process.env.PORT, () => {
        console.log("Server running on port 3001...")
    });
});