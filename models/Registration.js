const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Registration = sequelize.define("Registration", {
        Status:{
            type: DataTypes.ENUM("Pending", "Confirmed", "Cancelled"),
            defaultValue: "Pending"
        },
    });

    Registration.associate = models => {
        Registration.belongsTo(models.Visitor, {
            foreignKey: VisitorID
        });
        Registration.belongsTo(models.Exhibition, {
            foreignKey: "ExhibitionID"
        });
        Registration.hasMany(models.Attendee, {
            foreignKey: "RegistrationID"
        });
    };

    return Registration;
}