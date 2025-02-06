const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require('../middleware/authenticateToken');
const sequelize = require('../config/database');

router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          userId: req.user.id
        }
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }], // Monthly subscription price ID
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: req.user.id
      }
    });

    // Save subscription details to database
    await sequelize.query(
      `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end)
       VALUES (:userId, :subscriptionId, :customerId, :status, to_timestamp(:periodStart), to_timestamp(:periodEnd))`,
      {
        replacements: {
          userId: req.user.id,
          subscriptionId: subscription.id,
          customerId: customer.id,
          status: subscription.status,
          periodStart: subscription.current_period_start,
          periodEnd: subscription.current_period_end
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  if (event.type === 'customer.subscription.created' || 
      event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    
    try {
      await sequelize.query(
        `UPDATE subscriptions 
         SET status = :status, 
             current_period_start = to_timestamp(:periodStart),
             current_period_end = to_timestamp(:periodEnd)
         WHERE stripe_subscription_id = :subscriptionId`,
        {
          replacements: {
            status: subscription.status,
            periodStart: subscription.current_period_start,
            periodEnd: subscription.current_period_end,
            subscriptionId: subscription.id
          },
          type: sequelize.QueryTypes.UPDATE
        }
      );

      // Update user's premium status based on subscription status
      if (subscription.status === 'active') {
        await sequelize.query(
          `UPDATE users 
           SET premium_settings = '{"enabled": true}'::jsonb 
           WHERE id = (
             SELECT user_id 
             FROM subscriptions 
             WHERE stripe_subscription_id = :subscriptionId
           )`,
          {
            replacements: {
              subscriptionId: subscription.id
            },
            type: sequelize.QueryTypes.UPDATE
          }
        );
      }
      
      console.log('Subscription updated:', subscription.id);
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  }

  res.json({received: true});
});

module.exports = router;
