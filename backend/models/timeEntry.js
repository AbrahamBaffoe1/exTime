const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const TimeEntry = sequelize.define('TimeEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('IN', 'OUT', 'BREAK_START', 'BREAK_END'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  category: {
    type: DataTypes.ENUM('regular', 'overtime', 'remote', 'training'),
    defaultValue: 'regular'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in seconds
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'time_entries',
  timestamps: true
});

// Establish relationship
TimeEntry.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});
User.hasMany(TimeEntry, { 
  foreignKey: 'userId', 
  as: 'timeEntries' 
});

module.exports = TimeEntry;