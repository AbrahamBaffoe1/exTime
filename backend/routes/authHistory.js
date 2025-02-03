const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const authenticateToken = require('../middleware/authenticateToken');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { filter } = req.query;
        let afterDate = null;
        
        const now = new Date();
        if (filter === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            afterDate = startOfWeek;
        } else if (filter === 'month') {
            afterDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const authHistory = await sequelize.query(
            `SELECT type, timestamp 
             FROM auth_logs 
             WHERE user_id = :userId 
             ${afterDate ? 'AND timestamp >= :after' : ''}
             ORDER BY timestamp DESC`,
            {
                replacements: { 
                    userId: req.user.id,
                    after: afterDate
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(authHistory);
    } catch (error) {
        console.error('Error fetching auth history:', error);
        res.status(500).json({ message: 'Error fetching auth history' });
    }
});

module.exports = router;
