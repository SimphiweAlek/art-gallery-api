module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("Notification", {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Type: {
            type: DataTypes.ENUM("Reminder", "Event", "General"),
            allowNull: false,
            defaultValue: "General"
        },
        // RltdEntityID: { //Related table or entity ID
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        // RltdEntityType: {
        //     type: DataTypes.STRING, //REMINDER: consider making this an ENUM
        //     allowNull: true
        // },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    Notification.associate = models => {
        Notification.belongsTo(models.User, {
            foreignKey: "UserID",
            as: "Recipient",
            onDelete: "CASCADE"
        });
    };

    return Notification;
}