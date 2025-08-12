# Stripe Integration Guide

This guide covers the complete Stripe integration for the Adlaan subscription system.

## 🚀 Overview

The Stripe integration provides:

- **Customer Management**: Automatic Stripe customer creation
- **Subscription Management**: Create, update, and cancel subscriptions
- **Payment Processing**: Handle one-time payments and recurring billing
- **Webhook Handling**: Real-time subscription status updates
- **Plan Management**: Sync local plans with Stripe prices

## 🔧 Setup

### 1. Environment Configuration

Your `.env` file already contains the necessary Stripe configuration:

```env
# Stripe Configuration (Sandbox/Test)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### 2. Initialize Stripe Prices

First, create the subscription plans in Stripe:

```bash
# Login to get a JWT token first, then:
JWT_TOKEN=your_jwt_token node setup-stripe-prices.js
```

This creates Stripe products and prices for:

- **Starter Plan (BASIC)**: $19/month
- **Pro Plan**: $49/month
- **Enterprise Plan**: $99/month

## 📚 API Endpoints

### Stripe Management

#### Create/Get Customer

```http
POST /stripe/customers/company/:companyId
Authorization: Bearer <jwt_token>
```

#### Get Available Plans

```http
GET /stripe/plans
```

#### Create Subscription

```http
POST /stripe/subscriptions/company/:companyId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "priceId": "price_xxx",
  "trialDays": 14
}
```

#### Update Subscription

```http
PUT /stripe/subscriptions/:subscriptionId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "priceId": "price_xxx"
}
```

#### Cancel Subscription

```http
DELETE /stripe/subscriptions/:subscriptionId
Authorization: Bearer <jwt_token>
```

#### Create Payment Intent

```http
POST /stripe/payment-intents
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 100,
  "currency": "usd"
}
```

#### Webhook Endpoint

```http
POST /stripe/webhooks
Stripe-Signature: <stripe_signature>
```

## 🔄 Integration Flow

### 1. Complete Signup with Stripe

The system supports both local subscriptions and Stripe-integrated subscriptions:

```typescript
// Local subscription (existing flow)
POST / auth / signup - complete;

// Stripe-integrated signup (new flow)
POST / auth / signup - complete - stripe;
```

### 2. Upgrade to Paid Plan

```typescript
// 1. Get company's Stripe customer ID
const customer = await stripeService.getOrCreateCustomerForCompany(companyId);

// 2. Create Stripe subscription
const subscription = await stripeService.createStripeSubscription(
  customer.customerId,
  priceId,
  trialDays,
);

// 3. Update local subscription with Stripe IDs
await subscriptionService.updateSubscriptionWithStripeData(
  localSubscriptionId,
  {
    stripeCustomerId: customer.customerId,
    stripeSubscriptionId: subscription.id,
    status: 'ACTIVE',
  },
);
```

### 3. Webhook Synchronization

Stripe webhooks automatically sync subscription status:

```typescript
// Handled webhook events:
-customer.subscription.created -
  customer.subscription.updated -
  customer.subscription.deleted -
  invoice.payment_succeeded -
  invoice.payment_failed;
```

## 🎨 Frontend Integration

### 1. Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### 2. Initialize Stripe

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(
  'pk_test_51RuhCMPRTPZ6fUY3tTHLgMVbo4XmGrf33IO7fOCogyN0BTY4zGA95O37q8pGu5kyApfbodrDQqU6TlIr3rZOV8uL00qb8Lt8gr',
);
```

### 3. Create Subscription Flow

```javascript
// 1. Get available plans
const plansResponse = await fetch('/api/stripe/plans');
const plans = await plansResponse.json();

// 2. Create subscription
const subscriptionResponse = await fetch(
  `/api/stripe/subscriptions/company/${companyId}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      priceId: selectedPlan.priceId,
      trialDays: 14,
    }),
  },
);

const { clientSecret, subscriptionId } = await subscriptionResponse.json();

// 3. Confirm payment if required
if (clientSecret) {
  const { error } = await stripe.confirmPayment({
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/subscription/success`,
    },
  });
}
```

### 4. Payment Element Integration

```jsx
import { Elements, PaymentElement } from '@stripe/react-stripe-js';

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`,
      },
    });

    if (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Subscribe</button>
    </form>
  );
}

function App() {
  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
```

## 🧪 Testing

### 1. Test Cards

Use Stripe test cards for testing:

- **Success**: `4242424242424242`
- **Declined**: `4000000000000002`
- **Requires Authentication**: `4000002500003155`

### 2. Run Integration Test

```bash
node test-stripe-integration.js
```

This test:

1. Creates a user with local subscription
2. Logs in to get authentication
3. Creates Stripe customer
4. Creates Stripe subscription
5. Tests payment flow

### 3. Webhook Testing

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
# Forward webhooks to local server
stripe listen --forward-to localhost:4007/stripe/webhooks
```

## 🔒 Security

### 1. Webhook Security

Webhooks are verified using Stripe signatures:

```typescript
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### 2. API Security

All Stripe endpoints (except webhooks) require JWT authentication:

```typescript
@UseGuards(JwtAuthGuard)
```

### 3. Environment Variables

- **Never expose secret keys** in frontend code
- **Use publishable keys** only in frontend
- **Validate webhook signatures** for security

## 📊 Monitoring

### 1. Stripe Dashboard

Monitor subscriptions, payments, and events in the [Stripe Dashboard](https://dashboard.stripe.com/).

### 2. Application Logs

The integration logs important events:

```typescript
this.logger.log(`Created Stripe customer: ${customer.id}`);
this.logger.log(`Subscription status updated: ${subscription.status}`);
```

### 3. Database Sync

Local subscriptions are automatically synced with Stripe via webhooks:

```sql
-- Check subscription status
SELECT
  id,
  plan,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  next_billing_date
FROM subscriptions
WHERE stripe_subscription_id IS NOT NULL;
```

## 🚀 Production Deployment

### 1. Switch to Live Keys

Update `.env` with production Stripe keys:

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### 2. Configure Webhooks

Set up production webhook endpoint in Stripe Dashboard:

- **URL**: `https://yourdomain.com/stripe/webhooks`
- **Events**: Select relevant events
- **Update**: `STRIPE_WEBHOOK_SECRET` in production

### 3. Test Production Flow

Test the complete flow in production environment before going live.

## 📞 Support

- **Stripe Documentation**: https://stripe.com/docs
- **Test Data**: https://stripe.com/docs/testing
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
