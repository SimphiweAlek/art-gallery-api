const express = require("express");
const router = express.Router();
const { Registration, Exhibition, User } = require("../models");

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
        //TODO: Test the line line below!
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
router.post("/", async (req, res) => {
    try {
        //TODO: Include UserID check here
        const newReg = await Registration.create(req.body);
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
        consoler.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
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


