import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css';

const PaymentForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create subscription
      const response = await fetch('http://localhost:3000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { clientSecret, subscriptionId } = await response.json();

      // Confirm subscription payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: localStorage.getItem('userEmail') // Make sure to store user's email in localStorage during login
          }
        }
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Wait a moment for webhook to process
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element-container">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: 'var(--text-primary)',
                '::placeholder': {
                  color: 'var(--text-secondary)',
                },
              },
              invalid: {
                color: 'var(--error)',
              },
            },
          }}
        />
      </div>
      
      {error && <div className="payment-error">{error}</div>}
      
      <div className="payment-actions">
        <button 
          type="button" 
          onClick={onCancel}
          className="cancel-button"
          disabled={processing}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="submit-button"
          disabled={!stripe || processing}
        >
          {processing ? 'Processing...' : 'Pay $9.99'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
