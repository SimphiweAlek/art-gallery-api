const { ArtPiece } = require("../models");

function ensureAuth(req, res, next) {
    if (!req.session.user) return res.status(401).json({ message: "Not authenticated" });
    next();
};

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.session.user) return res.status(401).json({ message: "Not authenticated" });
        if (!roles.includes(req.session.user.Role)) {
        return res.status(403).json({ message: "Not authorized" });
        }
        next();
    };
};

//Checking artist ownership on specific art piece
async function ensureOwnsArtPiece(req, res, next) {
    try {
        const { id } = req.params;
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: "Not authenticated" });

        //Owners/Clerks can pass through
        if (user.Role === "Owner" || user.Role === "Clerk") return next();

        //Artists must own the piece
        if (user.Role !== "Artist") return res.status(403).json({ message: "Not authorized" });

        const piece = await ArtPiece.findByPk(id);
        if (!piece) return res.status(404).json({ message: "Art piece not found" });

        if (!user.ArtistID || piece.ArtistID !== user.ArtistID) {
        return res.status(403).json({ message: "Not authorized" });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Ownership check failed" });
    }
}

module.exports = { ensureAuth, requireRole, ensureOwnsArtPiece };
