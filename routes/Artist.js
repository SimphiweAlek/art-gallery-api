const express = require("express");
const router = express.Router();
const { Artist, ArtPiece, User } = require("../models");

//Get all artists + their art
router.get("/", async (req, res) => {
    try {
        const artists = await Artist.findAll({ include: [ArtPiece, User] });
        res.status(200).json(artists);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error." });
    }
});

//Create artist profile
router.post("/", async (req, res) => {
    try {
        //Consider having UserID fk included as a parameter
        const artist = await Artist.create(req.body); //Include UserID in body. TODO: include checks here
        res.status(201).json(artist);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Update artist
router.put("/:ID", async (req, res) => {
    try {
        await Artist.update(req.body, { where: { ID: req.params.ID } });
        res.status(200).json({ message: "Artist updated successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Delete artist
router.delete("/:ID", async (req, res) => {
    try {
        //TODO: Include deletion from the higher User table
        await Artist.destroy({ where: { ID: req.params.ID } });
        res.status(200).json({ message: "Artist deleted successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

module.exports = router;