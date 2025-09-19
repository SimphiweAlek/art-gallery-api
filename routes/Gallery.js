const express = require("express");
const router = express.Router();
const { Gallery, Exhibition, User, ArtPiece, Artist } = require("../models");
const { ensureAuth, requireRole, ensureOwnsArtPiece } = require("../middleware/auth");


//Get all galleries
router.get("/", ensureAuth, async (req, res) => {
    try {

        const galleries = await Gallery.findAll({ where: { UserID: req.session.user?.ID }, include: [User, Exhibition, ArtPiece] });
        res.status(200).json(galleries);

    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Create gallery
router.post("/new", ensureAuth, requireRole("Owner"), async (req, res) => {
    try {
        //Checking provided parameter
        const { UserID, ...galleryData } = req.body;

        //checking if associated User(Owner) exists
        const owner = await User.findByPk(UserID);
        if (!owner)
        {
            return res.status(404).json({ error: "Associated Owner not found."});
        }
        //TODO: Include manager validations
        //Creating new Gallery
        const gallery = await Gallery.create({
            UserID,
            ...galleryData
        });

        const galleries = await Gallery.findAll({ where: { UserID: owner.ID }, include: [User, Exhibition, ArtPiece] });
        
        res.status(201).json(galleries);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

//Update gallery
router.put("/update/:ID", ensureAuth, requireRole("Owner"), async (req, res) => {
    try {
        await Gallery.update(req.body, { where: { ID: req.params.ID } });

        const updatedGalleries = await Gallery.findAll({ where: { OwnerID: req.session.user?.ID }, include: [{ model: User, as: "Owner"}, { model: Exhibition, as: "Exhibitions"}, { model: ArtPiece, as: "Artpieces" }] });

        res.status(200).json(updatedGalleries);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

//Get gallery by ID
router.get("/:ID", ensureAuth, requireRole("Owner"), async (req, res) => {
    try {
        const gallery = await Gallery.findByPk({ where: {ID: req.params.ID }, include: [{ model: User, as: "Owner"}, { model: Exhibition, as: "Exhibitions"}, { model: ArtPiece, as: "Artpieces" }] });

        if (!gallery) return res.status(404).json({ error: "Gallery not found" });
        res.status(200).json(gallery);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//consider making a get my galleries function

// Delete gallery
router.delete("/:ID", ensureAuth, requireRole("Owner"), async (req, res) => {
    try {
        const gallery = await Gallery.findByPk(req.params.ID);

        if(!gallery)
        {
            return res.status(404).json({ error: "Gallery not found."});
        }

        await Gallery.destroy({ where: { ID: req.params.ID } });

        const galleries = await Gallery.findAll({ where: { OwnerID: req.session.user?.ID }, include: [{ model: User, as: "Owner"}, { model: Exhibition, as: "Exhibitions"}, { model: ArtPiece, as: "Artpieces" }] });

        res.status(200).json(galleries); //returns updated list(array) of galleries
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

module.exports = router;