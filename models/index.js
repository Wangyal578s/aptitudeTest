'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Load all models
fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Run associations here (manually define them)
const { User, Admin, Category, Question, QuizResult } = db;

if (Category && Question) {
  Category.hasMany(Question, { foreignKey: 'categoryId' });
  Question.belongsTo(Category, { foreignKey: 'categoryId' });
}

if (User && QuizResult) {
  User.hasMany(QuizResult, { foreignKey: 'userEmail', sourceKey: 'email' });
  QuizResult.belongsTo(User, { foreignKey: 'userEmail', targetKey: 'email' });
}

if (Category && QuizResult) {
  Category.hasMany(QuizResult, { foreignKey: 'categoryId' });
  QuizResult.belongsTo(Category, { foreignKey: 'categoryId' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
