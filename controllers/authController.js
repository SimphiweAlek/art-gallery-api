const bcrypt = require("bcrypt");
const { User, Artist } = require("../models");

//Register function for all users
const register = async (req, res) => {
    try {
        const { FullName, Email, Phone, Password, Role, Bio, Nationality } = req.body;

        if (!Email || !FullName || !Phone || !Role)
        {
			return res.status(400).json({ error: "Missing field! Please check all your input and try again." });
		}
        
        //Checking if user/email already exists
        const userCheck = await User.findOne({ where: { Email } });
        if(userCheck)
        {
            res.status(400).json({ error: "User already exists."});
        }
        
        const hashedPass = await bcrypt.hash(Password || "admin", 10); //Sets a temporary default password if it was not provided (User was probably created by the owner)

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
                Bio: Bio,
                Nationality: Nationality
            });
        }

        const newUser = await User.findOne({ where: { Email }, include: [Artist] });
        
        res.status(201).json(newUser);
    } catch(err)
    {
        console.error(err);
        res.status(500).json({ error: "Internal server error"});
    }
};

//Login function for all users
const login = async (req, res) => {
    try {
        const { Email, Password, client } = req.body;
        if (!Email || !Password) return res.status(400).json({ message: "Email & Password required."});

        const user = await User.findOne({ where: { Email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        //Role based access control for mobile and the web app
        if (client === "mobile" && user.Role !== "Visitor")
        {
            return res.status(403).json({ error: "Access denied. Only Visitors can use the mobile app." });
        }
        if (client === "web" && user.Role === "Visitor")
        {
            return res.status(403).json({ error: "Access denied. Visitors can not log into the management panel."})
        }

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

//update user information
const update = async (req, res) => {

    try {
        const { ID } = req.params;
        const { FullName, Email, Phone, Role, Bio, Nationality } = req.body;

        const user = await User.findByPk(ID);
        if (!user) 
        {
            return res.status(404).json({ error: "User not found." });
        }

        await user.update({
            FullName,
            Email,
            Phone,
            Role
        });

        if (user.Role === "Artist")
        {
            let artist = await Artist.findOne({ where: { UserID: user.ID }});

            if (artist)
            {
                await artist.update({
                    Bio: Bio,
                    Nationality: Nationality
                });
            }
        }

        const updated = await User.findAll({ include: [Artist] });

        res.status(200).json(updated);

    } catch (err)
    {
        console.error(err);
        res.status(500).json({ error: "INternal server error."});
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

module.exports = { register, login, logout, update, me };