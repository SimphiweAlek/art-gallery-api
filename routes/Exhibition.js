const express = require("express");
const router = express.Router();
const { Exhibition, Gallery, ArtPiece } = require("../models");

//Get all exhibitions
router.get("/", async (req, res) => {
    try {
        const exhibitions = await Exhibition.findAll({ include: [Gallery, ArtPiece] });
        res.status(200).json(exhibitions);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Get single exhibition
router.get("/:ID", async (req, res) => {
    try {
        const exhibition = await Exhibition.findByPk(req.params.ID, { include: [Gallery, ArtPiece] });
        if (!exhibition) return res.status(404).json({ error: "Exhibition not found" });
        res.status(200).json(exhibition);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


//Create exhibition
router.post("/", async (req, res) => {
    try {
        //Checking provided parameter
        const { GalleryID, ...exhibitionData} = req.body;
        if (!GalleryID)
        {
            return res.status(400).json({ error: "GalleryID is required."});
        }

        //Checking if the associated gallery exists
        const gallery = await Gallery.findByPk(GalleryID);
        if(!gallery)
        {
            return response.status(404).json({ error: "Associated gallery not found."});
        }

        //creating new Exhibition
        const newExhibition = await Exhibition.create({
            GalleryID,
            ...exhibitionData
        });
        
        res.status(200).json(newExhibition);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Update exhibition
router.put("/:ID", async (req, res) => {
    try {
        await Exhibition.update(req.body, { where: { ID: req.params.ID } });
        res.status(200).json({ message: "Exhibition updated successfully" });
    } catch(err) 
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

// Delete exhibition
router.delete("/:ID", async (req, res) => {
    try {
        await Exhibition.destroy({ where: { ID: req.params.ID } });
        res.status(200).json({ message: "Exhibition deleted successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

module.exports = router;