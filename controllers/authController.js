const bcrypt = require("bcrypt");
const { User, Artist } = require("../models");

//Register function for all users
const register = async (req, res) => {
    try {
        const { FullName, Email, Phone, Password, Role } = req.body;

        if (!Email || !Password || !FullName || !Phone || !Role) {
			return res.status(400).json({ error: "Missing field! Please check all your input and try again." });
		}
        
        //Checking if user/email already exists
        const userCheck = await User.findOne({ where: { Email } });
        if(userCheck)
        {
            res.status(400).json({ error: "User already exists."});
        }
        //else...
        const hashedPass = await bcrypt.hash(Password, 10);
        const user = await User.create({
            FullName,
            Email,
            Phone,
            Password: hashedPass,
            Role
        });

        let artist = null;

        //if user is an artist, auto creating artist profile as well
        if (Role === "Artist")
        {
            artist = await Artist.create({
                UserID: user.ID,
                Bio: "",    //To modify later
                Nationality: ""
            });
        }
        
        res.status(201).json({
            message: "User registered successfully",
            id: user.ID,
            role: Role,
            ArtistID: artist ? artist.ID : null
        });
    } catch(err)
    {
        console.error(err);
        res.status(500).json({ error: "Internal server error"});
    }
};

//Login function for all users
const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        if (!Email || !Password) return res.status(400).json({ message: "Email & Password required."});

        const user = await User.findOne({ where: { Email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const validPass = await bcrypt.compare(Password, user.Password);
        if(!validPass) return res.status(401).json({ error: "Invalid Password"});

        //Attaching artist ID if user is an Artist
        let artist = null;
        if (user.Role === "Artist")
        {
            artist = await Artist.findOne({ where: {UserID: user.ID}});
        }

        //Initializing user's session
        req.session.user = {
            ID: user.ID,
            FullName: user.FullName,
            Email: user.Email,
            Role: user.Role,
            ArtistID: artist ? artist.ID : null //including artist ID if role is artist
        };

        res.status(200).json({ message: "Login Successful", user: req.session.user });
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal sever error"});
    }
};

//logout or end session
const logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out."});
    });
};

//get current user's session
const me = (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Not authenticated."});
    return res.json({ user: req.session.user });
};

module.exports = { register, login, logout, me };