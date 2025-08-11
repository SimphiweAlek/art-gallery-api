const express = require("express");
const router = express.Router();
const { User, Gallery, Artist } = require("../models");

//Get all users
router.get("/", async (req, res) => {
    try{
        const users = await User.findAll({ include: ["OwnedGalleries", Artist] }); //Test this line of code!
        res.json(users);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal Server error"});
    }
});

//User by ID
router.get("/:ID", async (req, res) => {
    try{
        const user = await User.findByPk(req.params.ID, { include: ["OwnedGalleries", Artist] }); //Artist might throw an error, as above
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error"});
    }
});

//Update user
router.put("/:ID", async (req, res) => {
    try {
        await User.update(req.body, { where: { ID: req.params.ID } });
        res.status(200).json({ message: "User updated successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

//Delete user
router.delete("/:ID", async (req, res) => {
    try {
        await User.destroy({ where: { ID: req.params.ID } });
        res.status(200).json({ message: "User deleted successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router