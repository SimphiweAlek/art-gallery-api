module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        FullName:{
            type: DataTypes.STRING, 
            allowNull: false,
        },
        Email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        Phone:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Password:{
            type: DataTypes.STRING, 
            allowNull: false
        },
        Role:{
            type: DataTypes.ENUM("Owner", "Manager", "Clerk", "Artist", "Visitor"),
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

        //Might not need this association. Can be checked by Role instead.
        //If user is a Manager (Monitors/Reports on Artpieces and Exhibitions)
        User.hasMany(models.Gallery, {
            foreignKey: "ManagerID", //Accesses Exhibition & ArtPiece models trhough gallery model
            as: "ManagedGalleries",
            onDelete: "SET NULL"
        })

        //If user in an Artist
        User.hasMany(models.Artist, {
            foreignKey: "UserID",
            onDelete: "CASCADE"
        });

        //If user is a visitor
        User.hasMany(models.Registration, {
            foreignKey: "UserID",
            as: "VisitorProfile",
            onDelete: "CASCADE"
        });

        //Notifications
        User.hasMany(models.Notification, {
            foreignKey: "UserID",
            as: "Notifications",
            onDelete: "CASCADE"
        });

        //TODO: CONSIDER A ROLES TABLE!!
    };

    return User;
};