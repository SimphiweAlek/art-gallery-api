
module.exports = (sequelize, DataTypes) => {
    const Gallery = sequelize.define("Gallery", {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    });

    Gallery.associate = models => {
        Gallery.hasMany(models.Exhibition, {
            foreignKey: "GalleryID",
            as: "Exhibitions",
            onDelete: "CASCADE"
        });

        Gallery.hasMany(models.ArtPiece, {
            foreignKey: "GalleryID",
            as: "Artpieces",
            onDelete: "CASCADE"
        });

        Gallery.belongsTo(models.User, {
            foreignKey: "OwnerID",
            as: "Owner",
            onDelete: "SET NULL"
        });
    };

    return Gallery;
};