'use strict';

//Instantiating the database

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
//const env = process.env.NODE_ENV || 'development';
const sequelize = require(__dirname + '/../config/database');
const basename = path.basename(__filename);
const db = {};

//Sequelize instance
//let sequelize;

// if (config.use_env_variable) {
//     sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//     sequelize = new Sequelize(config.database, config.username, config.password, 
//         {
//             host: config.host,
//             dialect: config.dialect,
//             logging: false
//         }
//     );
// }

sequelize.options.logging = true;
sequelize.options.logging = console.log;

//Loading all models in the folder, .js file types
fs.readdirSync(__dirname).filter(file => {
    return (
        file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1
    );
}).forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
});

//setting up model/table associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;

module.exports = db;
