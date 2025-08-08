const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Exhibition = sequelize.define("Exhibtion", {
        Name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Description:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        MaxVisitors:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50
        },
        Count:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultvalue: 0 //current visitor counter, starts at zero
        },
        Status:{
            type: DataTypes.ENUM("Open", "Full", "Closed"),
            defaultvalue: "Open"
        }

    });

    Exhibition.associate = models => {
        Exhibition.belongsToMany(models.ArtPiece, {
            through: "ExhibitionArtPieces"
        });
        Exhibition.hasMany(models.Registration, {
            foreignKey: "ExhibitionID"
        });
    };

    return Exhibition;
}