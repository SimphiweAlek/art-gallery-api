
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
            onDelete: "CASCADE"
        });

        Gallery.hasMany(models.ArtPiece, {
            foreignKey: "GalleryID",
        });

        Gallery.belongsTo(models.User, {
            foreignKey: "OwnerID",
            onDelete: "SET NULL"
        });
    };

    return Gallery;
};