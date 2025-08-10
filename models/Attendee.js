
module.exports = (sequelize, DataTypes) => {
    //This Model is no longer required
    
    const Attendee = sequelize.define("Attendee", {
        ID: {
            type: DataTypes.INTEGER,
            autopIncrement: true,
            primaryKey: true
        },
        FullName:{
            Type: DataTypes.STRING,
            allowNull: false
        },
        Email:{
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