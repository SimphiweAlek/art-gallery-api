const express = require("express");
const router = express.Router();
const { Gallery, Exhibition, User } = require("../models");

//Get all galleries
router.get("/", async (req, res) => {
    try {
        const galleries = await Gallery.findAll({ include: [User, Exhibition] });
        res.status(200).json(galleries);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});


//Get gallery by ID
router.get("/:ID", async (req, res) => {
    try {
        const gallery = await Gallery.findByPk(req.params.ID, { include: [User, Exhibition] });
        if (!gallery) return res.status(404).json({ error: "Gallery not found" });
        res.status(200).json(gallery);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});


//Create gallery
router.post("/", async (req, res) => {
    try {
        //TODO: INclude gallery owner UserID (fk) as a parameter
        const gallery = await Gallery.create(req.body);
        res.status(201).json(gallery);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

//Update gallery
router.put("/:ID", async (req, res) => {
    try {
        await Gallery.update(req.body, { where: { ID: req.params.ID } });
        res.status(200).json({ message: "Gallery updated successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

// Delete gallery
router.delete("/:ID", async (req, res) => {
    try {
        await Gallery.destroy({ where: { ID: req.params.ID } });
        res.status(200).json({ message: "Gallery deleted successfully" });
    } catch(err)
    {
        consoler.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

module.exports = router;