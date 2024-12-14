const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const TimeEntry = require('../models/timeEntry');
const User = require('../models/user');

// Middleware to verify authentication (you'll need to implement this)
const authenticateToken = require('../middleware/authenticateToken.js');

// Create a new time entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { action, timestamp, category, notes, userId } = req.body;
    
    const entry = await TimeEntry.create({
      action,
      timestamp,
      category,
      notes,
      userId: userId || req.user.id // Use provided userId or from authenticated user
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Failed to create time entry', details: error.message });
  }
});

// Get time entries with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { filter } = req.query;
    let whereCondition = {
      userId: req.user.id // Ensure user only sees their own entries
    };
    let dateCondition = {};

    const now = new Date();
    switch (filter) {
      case 'week':
        dateCondition = {
          timestamp: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
          }
        };
        break;
      case 'month':
        dateCondition = {
          timestamp: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
      case 'all':
      default:
        // No additional filter
        break;
    }

    // Merge conditions
    const finalCondition = {
      ...whereCondition,
      ...dateCondition
    };

    const entries = await TimeEntry.findAll({
      where: finalCondition,
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: 'Failed to fetch time entries', details: error.message });
  }
});

// Get the last time entry for a user
router.get('/last', authenticateToken, async (req, res) => {
  try {
    const lastEntry = await TimeEntry.findOne({
      where: { userId: req.user.id },
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    if (lastEntry) {
      res.json(lastEntry);
    } else {
      res.status(404).json({ message: 'No entries found' });
    }
  } catch (error) {
    console.error('Error fetching last time entry:', error);
    res.status(500).json({ error: 'Failed to fetch last time entry', details: error.message });
  }
});

// Update a time entry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, timestamp, category, notes } = req.body;

    // First, verify the entry belongs to the user
    const existingEntry = await TimeEntry.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Time entry not found or unauthorized' });
    }

    const [updated] = await TimeEntry.update(
      { action, timestamp, category, notes },
      { 
        where: { 
          id,
          userId: req.user.id 
        } 
      }
    );

    if (updated) {
      const updatedEntry = await TimeEntry.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ]
      });
      res.json(updatedEntry);
    } else {
      res.status(404).json({ error: 'Time entry not found or update failed' });
    }
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ error: 'Failed to update time entry', details: error.message });
  }
});

// Delete a time entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TimeEntry.destroy({
      where: { 
        id,
        userId: req.user.id // Ensure user can only delete their own entries
      }
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Time entry not found or unauthorized' });
    }
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ error: 'Failed to delete time entry', details: error.message });
  }
});

module.exports = router;