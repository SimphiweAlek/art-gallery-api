const bcrypt = require("bcrypt");
const { User } = require("../models");

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

        res.status(201).json({
            message: "User registered successfully",
            id: user.ID,
            role: Role
        });

    } catch(err)
    {
        console.error(error);
        res.status(500).json({ error: "Internal server error"});
    }
};

//Login function for all users
const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const user = await User.findOne({ where: { Email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const validPass = await bcrypt.compare(Password, user.Password);
        if(!validPass) return res.status(401).json({ error: "Invalid Password"});

        res.status(200).json({ message: "Login Successful", user });
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal sever error"});
    }
};

module.exports = { register, login };