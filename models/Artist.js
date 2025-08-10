const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Artist = sequelize.define("Artist", {
        ID: {
            type: DataTypes.INTEGER,
            autopIncrement: true,
            primaryKey: true
        },
        Bio:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        Nationality:{
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    Artist.associate = models => {
        Artist.hasMany(models.ArtPiece, {
            foreignKey: "ArtistID",
            onDelete: "CASCADE"
        });
    };

    return Artist;
}