const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const ArtPiece = sequelize.define("ArtPiece", {
        Title:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Description:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        EstimatedValue:{
            type: DataTypes.FLOAT,
            allowNull: false
        },
        AvailStatus:{
            type: DataTypes.ENUM("Available", "Unavailable"),
            defaultvalue: "Available"
        },
    });

    ArtPiece.associate = models => {
        ArtPiece.belongsTo(models.Artist, 
            {
                foreignKey: "ArtistID"
            }
        );
        ArtPiece.belongsToMany(models.Exhibition,
            {
                through: "ExhibitionArtPieces"  //Join table
            }
        );
    };

    return ArtPieces;
}