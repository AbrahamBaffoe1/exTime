const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const authenticateToken = require('../middleware/authenticateToken');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { after } = req.query;
        const whereClause = {
            userId: req.user.id,
            type: {
                [Op.in]: ['LOGIN', 'LOGOUT']
            }
        };

        if (after) {
            whereClause.timestamp = {
                [Op.gte]: new Date(after)
            };
        }

        const authHistory = await sequelize.query(
            `SELECT type, timestamp 
             FROM auth_logs 
             WHERE user_id = :userId 
             ${after ? 'AND timestamp >= :after' : ''}
             ORDER BY timestamp DESC`,
            {
                replacements: { 
                    userId: req.user.id,
                    after: after || null
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
