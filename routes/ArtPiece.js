const express = require("express");
const router = express.Router();
const { ArtPiece, Artist, Exhibition } = require("../models");

//Get all art pieces and their assigned exhibitions
router.get("/", async (req, res) => {
    try {
        const pieces = await ArtPiece.findAll({ include: [Artist, Exhibition] });
        res.status(200).json(pieces);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Get single art piece by ID
router.get("/:ID", async (req, res) => {
    try {
        const piece = await ArtPiece.findByPk(req.params.ID, { include: [Artist, Exhibition] });
        if (!piece) return res.status(404).json({ error: "Art piece not found" });

        res.status(200).json(piece);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Create new art piece
router.post("/", async (req, res) => {
    try {
        //Checking provided parameter
        const { ArtistID, ...artPieceData } = req.body;
        if (!ArtistID) 
        {
            return res.status(400).json({ error: "ArtistID is required."});
        }
        //Checking if the associated artist exists
        const artist = await Artist.findByPk(ArtistID);
        if (!artist) 
        {
            return res.status(404).json({ error: "Associated Artist not found."});
        }

        //Creating new Art Piece
        const newPiece = await ArtPiece.create({
            ArtistID,
            ...artPieceData
        });

        res.status(201).json(newPiece);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Update art piece
router.put("/:ID", async (req, res) => {
    try {
        await ArtPiece.update(req.body, { where: { ID: req.params.ID } });
        res.status(200).json({ message: "Art piece updated successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Delete art piece
router.delete("/:ID", async (req, res) => {
    try {
        await ArtPiece.destroy({ where: { ID: req.params.ID } });
        res.status(200).json({ message: "Art piece deleted successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

module.exports = router;

