const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        FullName:{
            type: DataTypes.STRING, 
            allowNull: false,
        },
        Email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        Password:{
            type: DataTypes.STRING, 
            allowNull: false
        },
        Role:{
            type: DataTypes.ENUM("Owner", "Manager", "Clerk"),
            allowNull: false
        }
    });

    User.associate = models => {
        //If user is an Owner
        User.hasMany(models.Gallery, {
            foreignKey: "OwnerID",
            as: "OwnedGalleries",
            onDelete: "CASCADE"
        });

        //If user in an Artist
        User.hasMany(models.ArtPiece, {
            foreignKey: "artistID",
            as: "Artworks",
            onDelete: "CASCADE"
        });

        //If user is a visitor, join table
        User.belongsToMany(models.Exhibition, {
            through: models.VisitorRegistration,
            foreignKey: "UserID",
            as: "RegisteredExhibitions"
        });

        //Notifications
        User.hasMany(models.Notification, {
            foreignKey: "UserID",
            as: "Notifications",
            onDelete: "CASCADE"
        });

        //CONSIDER A ROLES TABLE!!
    };

    return User;
}