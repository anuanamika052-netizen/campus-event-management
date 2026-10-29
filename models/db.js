const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('student', 'organizer', 'admin'), defaultValue: 'student' }
});

const Event = sequelize.define('Event', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false, defaultValue: 'General' },
  date: { type: DataTypes.STRING, allowNull: false },
  venue: { type: DataTypes.STRING, allowNull: false },
  limit: { type: DataTypes.INTEGER, allowNull: false },
  organizerId: { type: DataTypes.INTEGER, allowNull: false }
});

const Registration = sequelize.define('Registration', {});

User.hasMany(Event, { foreignKey: 'organizerId', onDelete: 'CASCADE' });
Event.belongsTo(User, { as: 'Organizer', foreignKey: 'organizerId' });

User.belongsToMany(Event, { through: Registration, foreignKey: 'userId' });
Event.belongsToMany(User, { through: Registration, foreignKey: 'eventId' });

module.exports = { sequelize, User, Event, Registration };
