const express = require("express");
const router = express.Router();
const { Registration, Exhibition, User } = require("../models");
const { ensureAuth, requireRole, ensureOwnsArtPiece } = require("../middleware/auth");

//Get all registrations
router.get("/", async (req, res) => {
    try {
        const regs = await Registration.findAll({ include: [User, Exhibition] });
        res.status(200).json(regs);
    } catch(err)
    {
        consoler.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});


//Get registration by UserID or ExhibitionID
router.get("/:UserID/:ExhibitionID", async (req, res) => {
    try {
        //TODO: Test the line line below! If does not work, consider assigning to req body instead
        const reg = await Registration.findByPk({ where: { UserID: req.params.UserID} || { ExhibitionID: req.params.ExhibitionID },  include: [User, Exhibition] });
        if (!reg) return res.status(404).json({ error: "Registration not found" });
        res.status(200).json(reg);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});


//Create registration
router.post("/", ensureAuth, async (req, res) => {
    try {
        //Checking provided parameter
        const { ExhibitionID, numberOfAttendees = 1 } = req.body;
        // if(!UserID)
        // {
        //     return res.status(400).json({ error: "UserID is required."});
        // }
        const userID = req.session.user.ID;

        //Checking if associated user exists
        //const user = await User.findByPk(UserID);
        if(!ExhibitionID)
        {
            return res.status(400).json({ error: "Exhibition ID is required."});
        }

        const exhibition = await Exhibition.findByPk(ExhibitionID);
        if (!exhibition) {
            return res.status(404).json({ error: "Exhibition not found."})
        }

        //Checking exhibition availability
        const availSpots = exhibition.MaxVisitors - exhibition.Count;
        if (numberOfAttendees > availSpots)
        {
            return res.status(400).json({ error: `There is only ${availSpots} spots available.` });
        }

        //Creating new Registration
        const newReg = await Registration.create({
            UserID: userID,
            ExhibitionID: ExhibitionID,
            numberOfAttendees: numberOfAttendees,
        });

        //updating related exhibition
        const newCount = exhibition.Count + numberOfAttendees;
        await exhibition.update({
            Count: newCount,
            Status: newCount >= exhibition.MaxVisitors ? "Full" : "Open"
        });        
        
        res.status(201).json(newReg);
    } catch(err)
    {
        consoler.log(err);
        res.status(400).json({ error: "Internal server erro/ bad request." });
    }
});

//Update number of attendees
router.put("/:UserID/attendees/:numberOfAttendees", async (req, res) => {
    try {
        //NOTE: This means each user can only have one registartion on the system
        await Registration.update(
            { numberOfAttendees: req.params.numberOfAttendees },
            { where: { UserID: req.params.UserID } }
        );
        res.status(200).json({ message: "Number of attendees updated" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

//Check if user is registered for a specific exhibition
router.get("/check/:exhibitionID", ensureAuth, async (req, res) => {
    try {
        const { exhibitionID } = req.params;
        const userID = rgtieq.session.user.ID;

        const existRegistration = await Registration.findOne({
            where: {
                UserID: userID,
                ExhibitionID: exhibitionID
            }
        });

        res.status(200).json({ isRegistered: !!existRegistration });
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});


// Delete registration
router.delete("/:ID", async (req, res) => {
    try {
        await Registration.destroy({ where: { ID: req.params.ID } });
        res.status(200).json({ message: "Registration deleted successfully" });
    } catch(err)
    {
        console.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

module.exports = router;


