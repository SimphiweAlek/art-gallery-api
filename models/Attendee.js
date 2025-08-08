const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Attendee = sequelize.define("Attendee", {
        Name:{
            Type: DataTypes.STRING,
            allowNull: false
        },
        Phone:{
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Attendee.associate = models => {
        Attendee.belongsTo(models.Registration, {
            foreignKey: "RegistrationID"
        });
    };

    return Attendee;
}