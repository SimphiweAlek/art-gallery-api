const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ArtPiece, Artist, Exhibition, Gallery, User } = require("../models");
const { ensureAuth, requireRole, ensureOwnsArtPiece } = require("../middleware/auth");

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
router.post("/upload-image/:ID", ensureAuth, requireRole("Owner", "Artist"), upload.single('artworkImage'), async (req, res) => {
    try {
        const artPiece = await ArtPiece.findByPk(req.params.ID);
        if(!artPiece)
        {
            return res.status(404).json({ error: "Art piece not found." });
        }

        if(!req.file)
        {
            return res.status(400).json({ error: "No image file provided." });
        }

        //string URL to be saved in the DB
        const imageURL = `/public/uploads/${req.file.filename}`;

        await artPiece.update({ ImageURL: imageURL });

        res.status(200).json({ message: "Image uploaded successfully.", artPiece });
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Get all art pieces and their assigned exhibitions
router.get("/", ensureAuth , async (req, res) => {
    try {
        const user = req.session.user; //from auth

        //If user is an artist, we'll use this clause to return only their pieces, else we return all pieces
        let whereClause = {};
        if (user.Role === "Artist")
        {
            whereClause = { ArtistID: user.ID };
        }

        const pieces = await ArtPiece.findAll({ 
            where: whereClause, 
            include: [
                {
                    model: Artist,
                    include: [User]
                },
                {
                    model: Gallery,
                }
                // {
                //     model: Exhibition
                // }
            ] 
        });

        res.status(200).json(pieces);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Create new art piece
router.post("/new", ensureAuth, requireRole("Artist", "Owner") ,async (req, res) => {
    try {
        const user = req.session.user;

        //Checking provided parameter
        const { ArtistID, ...artPieceData } = req.body;
        if (!ArtistID) 
        {
            return res.status(400).json({ error: "ArtistID is required."});
        }

        let assignedArtistID = ArtistID;
        if (user.Role === "Artist")
        {
            assignedArtistID = user.ID; //making sure their ID is enforced if user is an Artist
        }

        //Checking if the associated artist exists
        const artist = await Artist.findByPk(assignedArtistID);
        if (!artist) 
        {
            return res.status(404).json({ error: "Associated Artist not found."});
        }

        req.session.user.ArtistID = assignedArtistID; //update session cache if artist existss

        //Creating new Art Piece
        const newPiece = await ArtPiece.create({
            ArtistID: assignedArtistID,
            ...artPieceData
        });

        res.status(201).json(newPiece); //TODO: consider returning the entire array of pieces
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//Update art piece
router.put("/update/:ID", ensureAuth, requireRole("Artist", "Owner", "Clerk"), async (req, res) => {
    try {
        const user = req.session.user;
        const { ID } = req.params;

        const artPiece = await ArtPiece.findByPk(ID);
        if (!artPiece) return res.status(404).json({ error: "ArtPiece not found" });

        // Only Owners can reassign artists to artworks, Artists cannot
        if (user.Role !== "Owner") delete req.body.ArtistID

        await artPiece.update(req.body);

        const ArtistID = req.session.user?.ArtistID; //If logged in user is an Artist, return only their art pieces below, else all of them

        const updatedPieces = await ArtPiece.findAll({
            where: { ArtistID },
            include: [
                    {
                        model: Artist,
                        include: [User]
                    },
                    {
                        model: Gallery,
                    }
            ] 
        });
        res.status(200).json(updatedPieces);
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

//List my art pieces (Artist only)
router.get("/my", ensureAuth, requireRole("Artist"), async (req, res) => {
    try {
        console.log("My artpieces triggered.");
        const ArtistID = req.session.user?.ArtistID;
        if (!ArtistID) return res.status(404).json({ message: "Artist not found or not logged in." });

        const pieces = await ArtPiece.findAll({ 
            where: { ArtistID },
            include: [
                {
                    model: Artist,
                    include: [User]
                },
                {
                    model: Gallery,
                }
            ]
        });

        res.status(200).json(pieces);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: "Failed to fetch art pieces" });
    }
});

//Get single art piece by ID
router.get("/:ID", ensureAuth, async (req, res) => {
    try {
        console.log("Single artpiece fetch triggered.");
        const piece = await ArtPiece.findByPk(req.params.ID, {
            include: [
                {
                    model: Artist,
                    include: [User]
                },
                {
                    model: Gallery,
                }
            ] 
          });
        if (!piece) return res.status(404).json({ error: "Art piece not found" });

        res.status(200).json(piece);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Delete art piece
router.delete("/:ID", ensureAuth, requireRole("Artist", "Owner"), ensureOwnsArtPiece, async (req, res) => {
    try {
        const art = await ArtPiece.findByPk(req.params.ID);

        if (!art) {
            return res.status(404).json({ error: "Artwork not found." });
        }

        await ArtPiece.destroy({ where: { ID: req.params.ID } });

        const ArtistID = req.session.user?.ArtistID;
        const pieces = await ArtPiece.findAll({ 
            where: { ArtistID },
            include: [
                {
                    model: Artist,
                    include: [User]
                },
                {
                    model: Gallery,
                }
            ]
        });

        res.status(200).json(pieces); //returns updated list(array) of art pieces
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error." });
    }
});

module.exports = router;

