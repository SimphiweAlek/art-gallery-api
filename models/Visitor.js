const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Visitor = sequelize.define("Visitor", {
        Name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Email:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Phone:{
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Visitor.associate = models => {
        Visitor.hasMany(models.Registration, {
            foreignKey: "VisitorID"
        });
    };

    return Visitor;
}