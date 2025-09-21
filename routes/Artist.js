const express = require("express");
const router = express.Router();
const { Artist, ArtPiece, User } = require("../models");

//Get all artists + their art
router.get("/", async (req, res) => {
    try {
        const artists = await Artist.findAll({ include: [ArtPiece, User] });
        const mergedUsers = artists.map(artist => {
            const { User, ...rest } = artist.toJSON();
            return { ...rest, ...User }; // merging User fields to artist at root
        });

        res.status(200).json(artists);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error." });
    }
});

//Create artist profile (This will probably never be used, as this functionalit is ran through authController)
router.post("/", async (req, res) => {
    try {
        const { UserID, ...artistData } = req.body;
        //checking provided parameter
        if (!UserID)
        {
            return res.status(400).json({ error: "UserID required."});
        }

        //Checking if associated User exists
        const user = await User.findByPk(UserID);
        if (!User)
        {
            return res.status(404).json({ error: "No such user exists in the User table."});
        }

        //creating new Artist
        const artist = await Artist.create({
            UserID,
            ...artistData
        });
        
        res.status(201).json(artist);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//get by ID

//Update artist (Probably won't be used, all users get updated through authController)
router.put("/:ID", async (req, res) => {
    try {
        await Artist.update(req.body, { where: { ID: req.params.ID } });

        const artists = await Artist.findAll({ include: [ArtPiece, User] });
        const mergedUsers = artists.map(artist => {
            const { User, ...rest } = artist.toJSON();
            return { ...rest, ...User }; // merging User fields to artist at root
        });

        res.status(200).json(artists); //return updated array of artists
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Delete artist
router.delete("/:ID", async (req, res) => {
    try {
        //TODO: Include deletion from the higher User table (fetch and delete by associated UserID)
        await User.destroy({ where: { ID: req.params.ID } });

        const artists = await Artist.findAll({ include: [ArtPiece, User] });
        const mergedUsers = artists.map(artist => {
            const { User, ...rest } = artist.toJSON();
            return { ...rest, ...User }; // merging User fields to artist at root
        });

        res.status(200).json(artists);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

module.exports = router;