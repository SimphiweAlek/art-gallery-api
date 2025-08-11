const express = require("express");
const router = express.Router();
const { Notification, User } = require("../models");

//Get all notifications
router.get("/", async (req, res) => {
    try {
        const notifications = await Notification.findAll({ include: [User] });
        res.json(notifications);
    } catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Get notifications by UserID
router.get("/:UserID", async (req, res) => {
    try {
        const notification = await Notification.findAll( {where: { UserID : req.params.UserID }, include: [User] }); //Test this line
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json(notification);
    } catch(err)
    {
        consoler.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

//Create notification
router.post("/", async (req, res) => {
    try {
        //TODO: require specific User ID (fk)
        const notification = await Notification.create(req.body);
        res.status(201).json(notification);
    } catch(err)
    {
        consoler.log(err);
        res.status(400).json({ error: "Internal server error/ bad request." });
    }
});


//Mark as read
router.put("/:ID/read", async (req, res) => {
    try {
        await Notification.update({ isRead: true }, { where: { ID: req.params.ID } });
        res.status(200).json({ message: "Notification marked as read" });
    } catch(err)
    {
        consoler.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});


//Delete notification
router.delete("/:ID", async (req, res) => {
    try {
        await Notification.destroy({ where: { ID: req.params.ID } });
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch(err)
    {
        consoler.log(err);
        res.status(400).json({ error: "Internal server error/ Bad request." });
    }
});

module.exports = router;
