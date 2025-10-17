const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuth, requireRole } = require("../middleware/auth");
const { Artist, ArtPiece, User } = require("../models");
const { sequelize } = require("../models");

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
router.post("/upload-image/:ID", upload.single('profileImage'), async (req, res) => {
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

//Update artist
router.put("/:ID", async (req, res) => {
    try {
        const { ID: artistId } = req.params;
        const { FullName, Email, Phone, Bio, Nationality } = req.body;

        const artist = await Artist.findByPk(artistId);
        if (!artist)
        {
            return res.status(404).json({ error: "Artist profile not found." });
        }

        const user = await User.findByPk(artist.UserID);
        if (!user)
        {
            return res.status(404).json({ error: "Associated user account not found." });
        }

        //updating as a single block using a transaction
        const transaction = await sequelize.transaction();
        try {
            await user.update({ FullName, Email, Phone }, { transaction });
            await artist.update({ Bio, Nationality }, { transaction });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

        const updatedArtist = await User.findByPk(artist.UserID, { include: [Artist] });

        res.status(200).json(updatedArtist); //return updated artist
    } catch(err)
    {
        console.log("Artist Update error: ", err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Delete artist
router.delete("/:ID", ensureAuth, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const artistID = req.params.ID;
        const artist = await Artist.findByPk(artistID, { transaction: t });
        if (!artist) 
        {
            await t.rollback();
            return res.status(404).json({ error: "Artist not found." });
        }

        const userIdToDelete = artist.UserID;
        await artist.destroy({ transaction: t });

        if (userIdToDelete) 
        {
            await User.destroy({ where: { ID: userIdToDelete }, transaction: t });
        }
        // await User.destroy({ where: { ID: artist.UserID } }); //this should cascade

        await t.commit();

        const artists = await Artist.findAll({ include: [ArtPiece, User] });

        res.status(200).json(artists);
    } catch(err)
    {
        await t.rollback();
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

module.exports = router;