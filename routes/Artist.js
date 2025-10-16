const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuth, requireRole } = require("../middleware/auth");
const { Artist, ArtPiece, User } = require("../models");

// --- Multer file management ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); //saving to 'public/uploads folder
    },
    filename: (req, file, cb) => {
        //forcing unique file names to avoid overwrites
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//upload image for a specific artpiece. By Owner/Artist
router.post("/upload-image/:ID", ensureAuth, upload.single('profileImage'), async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.ID);
        if(!artist)
        {
            return res.status(404).json({ error: "Artist not found." });
        }

        if (!req.file)
        {
            return res.status(400).json({ error: "No image file provided."});
        }

        //DB image URL and update
        const imageURL = `/public/uploads/${req.file.filename}`;
        await artist.update({ ProfileImageURL: imageURL });

        res.status(200).json({ message: "Profile image updated successfully." });
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Get all artists + their art
router.get("/", ensureAuth, async (req, res) => {
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
router.delete("/:ID", ensureAuth, async (req, res) => {
    try {
        //TODO: Include deletion from the higher User table (fetch and delete by associated UserID)
        await User.destroy({ where: { ID: req.params.ID } }); //this should cascade

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