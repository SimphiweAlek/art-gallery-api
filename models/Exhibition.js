module.exports = (sequelize, DataTypes) => {
    const Exhibition = sequelize.define("Exhibition", {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        Name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Description:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        MaxVisitors:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50
        },
        Count:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultvalue: 0 //current visitor counter, starts at zero
        },
        StartDate:{
            type: DataTypes.DATE, //Rmmbr to ask for start/end time from FrontEnd
            allowNull: false
        },
        EndDate:{
            type: DataTypes.DATE,
            allowNull: false
        },
        Status:{
            type: DataTypes.ENUM("Open", "Full", "Closed"),
            defaultvalue: "Open"
        }

    });

    Exhibition.associate = models => {
        Exhibition.belongsToMany(models.ArtPiece, {
            through: "ExhibitionArtPieces"
        });
        Exhibition.hasMany(models.Registration, {
            foreignKey: "ExhibitionID"
        });
    };

    return Exhibition;
};