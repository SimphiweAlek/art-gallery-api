const express = require("express");
const router = express.Router();
const { Exhibition, ArtPiece, Registration, Artist, sequelize } = require("../models");
const { Op } = require("sequelize");

/**
 * @desc Gets a summary of all key metrics for the dashboard
 */
router.get("/summary", async (req, res) => {
    try {
        //total counts
        const totExhibitions = await Exhibition.count();
        const totArtworks = await ArtPiece.count();
        const totArtists = await Artist.count();

        //Registration stats
        const today = new Date();
        today.setHours(0,0,0,0);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const registrationsToday = await Registration.count({
            where: { createdAt: { [Op.gte]: today } }
        });

        const registrationsThisWeek = await Registration.count({
            where: { createdAt: { [Op.gte]: oneWeekAgo } }
        });

        //Top 5 popular exhibitions
        const popExhibitions = await Exhibition.findAll({
            attributes: [
                'ID',
                'Name',
                [sequelize.fn('COUNT', sequelize.col('Registrations.ID')), 'registrationCount']
            ],
            include: [{
                model: Registration,
                attributes: []
            }],
            group: ['Exhibition.ID', 'Exhibition.Name'],
            order: [[sequelize.literal('registrationCount'), 'DESC']],
            limit: 5,
            //to incorrect subquery from being generated
            subQuery: false,
        });

        //Artwork statuses
        const artworkStatus = await ArtPiece.findAll({
            attributes: [
                'AvailStatus',
                [sequelize.fn('COUNT', sequelize.col('AvailStatus')), 'count']
            ],
            group: ['AvailStatus']
        });

        res.status(200).json({
            totExhibitions,
            totArtworks,
            totArtists,
            registrationsToday,
            registrationsThisWeek,
            popExhibitions,
            artworkStatus
        });
    } catch (err)
    {
        console.error("Dashboard summary error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;