module.exports = (sequelize, DataTypes) => {
    const Registration = sequelize.define("Registration", {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        numberOfAttendees: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        CheckedIn:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    });

    Registration.associate = models => {
        Registration.belongsTo(models.User, {
            foreignKey: "UserID"
        });
        Registration.belongsTo(models.Exhibition, {
            foreignKey: "ExhibitionID"
        });
        // Registration.hasMany(models.Attendee, {
        //     foreignKey: "RegistrationID"
        // });
    };

    return Registration;
};