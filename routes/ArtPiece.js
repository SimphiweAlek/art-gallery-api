const express = require("express");
const router = express.Router();
const { ArtPiece, Artist, Exhibition } = require("../models");
const { ensureAuth, requireRole, ensureOwnsArtPiece } = require("../middleware/auth");

//Get all art pieces and their assigned exhibitions
router.get("/", ensureAuth ,async (req, res) => {
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
router.get("/:ID", ensureAuth, async (req, res) => {
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
router.post("/new", ensureAuth, requireRole("Artist", "Owner") ,async (req, res) => {
    try {

        //Checking provided parameter
        const { ArtistID, ...artPieceData } = req.body;
        if (!ArtistID) 
        {
            return res.status(400).json({ error: "ArtistID is required."});
        }
        //Checking if the associated artist exists
        const artist = await Artist.findByPk(artistID);
        if (!artist) 
        {
            return res.status(404).json({ error: "Associated Artist not found."});
        }

        req.session.user.ArtistID = artistID; //update session cache if artist existss

        //Creating new Art Piece
        const newPiece = await ArtPiece.create({
            artistID,
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
router.put("update/:ID", ensureAuth, requireRole("Artist", "Owner", "Clerk"), async (req, res) => {
    try {
        await ArtPiece.update(req.body, { where: { ID: req.params.ID } });
        res.status(200).json({ message: "Art piece updated successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//List my art pieces (Artist only)
router.get("/my", ensureAuth, requireRole("Artist"), ensureOwnsArtPiece, async (req, res) => {
    try {
        const { ArtistID } = req.session.user?.ArtistID;
        if (!ArtistID) return res.status(404).json({ message: "Artist not found or not logged in." });

        const pieces = await ArtPiece.findAll({ where: { ArtistID } });

        res.status(200).json(pieces);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: "Failed to fetch art pieces" });
    }
})

//Delete art piece
router.delete("/:ID", ensureAuth, requireRole("Artist", "Owner"), ensureOwnsArtPiece, async (req, res) => {
    try {
        const art = await ArtPiece.findByPk(req.params.ID);

        if (!art) {
            return res.status(404).json({ error: "Artwork not found." });
        }

        await ArtPiece.destroy({ where: { ID: req.params.ID } });

        res.status(200).json({ message: "Art piece deleted successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

module.exports = router;

