const express = require("express");
const router = express.Router();
const { Registration, Exhibition, User } = require("../models");
const { ensureAuth, requireRole, ensureOwnsArtPiece } = require("../middleware/auth");
const { sequelize } = require("../models");

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


//Check if user is registered for a specific exhibition
router.get("/check/:exhibitionID", ensureAuth, async (req, res) => {
    try {
        const { exhibitionID } = req.params;
        const userID = req.session.user.ID;

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
        console.log(err);
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

// Delete registration
router.delete("/:ID", ensureAuth, async (req, res) => {
    const t = await sequelize.transaction(); //transaction to ensure all DB operations are executed as one block
    try {
        const regID = req.params.ID;
        const user = req.session.user;

        const reg = await Registration.findByPk(regID, {transaction: t});

        if(!reg)
        {
            await t.rollback();
            return res.status(404).json({ error: "Registration not found."});
        }

        //Role authorization TODO: double check who can't manage regs from management
        const isStaff = ["Owner", "Manager", "Clerk"].includes(user.Role);
        if(!isStaff && reg.UserID !== user.ID)
        {
            await t.rollback();
            return res.status(403).json({ error: "You are not authorized to delete this registration."});
        }

        //locking related exhibition into transaction
        const exhibition = await Exhibition.findByPk(reg.ExhibitionID, {
            lock: t.LOCK.UPDATE,
            transaction: t,
        });

        //updating related exhibition
        if (exhibition)
        {
            const spotsToFree = reg.numberOfAttendees;
            const newCount = exhibition.Count - spotsToFree;

            await exhibition.update({
                Count: newCount < 0 ? 0 : newCount, //count can't be negative(just in case)
                Status: "Open",
            }, { transaction: t });
        }

        //finally, deleting the registration and commiting transaction if all went well
        await reg.destroy({ transaction: t });
        await t.commit();

        res.status(200).json({ message: "Registration deleted successfully" });
    } catch(err)
    {
        await t.rollback();
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Get all registrations for the currently logged in user
router.get("/my-registrations", ensureAuth, async (req, res) => {
    try {
        const userID = req.session.user.ID;

        const myRegs = await Registration.findAll({ where: { UserID: userID},  include: [Exhibition], order: [[Exhibition, 'StartDate', 'ASC']] });
        
        res.status(200).json(myRegs);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;


