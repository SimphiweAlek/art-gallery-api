module.exports = (sequelize, DataTypes) => {
    const Artist = sequelize.define("Artist", {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        Bio:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        Nationality:{
            type: DataTypes.STRING,
            allowNull: true
        },
        ProfileImageURL:{
            type: DataTypes.STRING,
            allowNull: true
        },
    });

    Artist.associate = models => {
        Artist.hasMany(models.ArtPiece, {
            foreignKey: "ArtistID",
            onDelete: "CASCADE"
        });

        Artist.belongsTo(models.User, {
            foreignKey: "UserID",
            onDelete: "CASCADE"
        });
    };

    return Artist;
};