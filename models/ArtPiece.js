module.exports = (sequelize, DataTypes) => {
    const ArtPiece = sequelize.define("ArtPiece", {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        Title:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Description:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        EstimatedValue:{
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Year:{
            type: DataTypes.SMALLINT,
            allowNull: true
        },
        Dimensions:{
            type: DataTypes.STRING,
            allowNull: true
        },
        AvailStatus:{
            type: DataTypes.ENUM("Available", "Unavailable"),
            defaultValue: "Available"
        },
    });

    ArtPiece.associate = models => {
        ArtPiece.belongsTo(models.Artist, 
            {
                foreignKey: "ArtistID",
                onDelete: "CASCADE"
            }
        );
        ArtPiece.belongsTo(models.Gallery,
            {
                foreignKey: "GalleryID",
                allowNull: true,
            }
        );
        ArtPiece.belongsToMany(models.Exhibition,
            {
                through: "ExhibitionArtPieces"  //Join table
            }
        );
    };

    return ArtPiece;
};