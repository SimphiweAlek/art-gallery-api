const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Artist = sequelize.define("Artist", {
        Name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Bio:{
            type: DataTypes.TEXT,
            allowNull: true
        },
    });

    Artist.associate = models => {
        Artist.hasMany(models.ArtPiece, {
            foreignKey: "ArtistID",
            onDelete: "CASCADE"
        });
    };

    return Artist;
}