const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();  // Load environment variables from .env file

// Use Telegram Bot Token from .env file
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Use Stripe API Key from .env file
const stripeApiKey = process.env.STRIPE_API_KEY;

// Card verification function using Stripe
async function verifyCard(cardNumber) {
  try {
    const response = await axios.post(
      'https://api.stripe.com/v1/payment_methods',
      {
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: '12',  // Placeholder expiration month
          exp_year: '2025', // Placeholder expiration year
          cvc: '123',       // Placeholder CVC code
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Assuming response contains valid data
    if (response.data.card && response.data.card.checks.cvc_check === 'pass') {
      return 'Card is live and valid ✅';
    } else {
      return 'Card is invalid or expired ❌';
    }
  } catch (error) {
    console.error('Error verifying card:', error);
    return 'Error verifying card. Please try again later.';
  }
}

// Command to check card status
bot.onText(/\/verifycard (\d+)/, async (msg, match) => {
  const cardNumber = match[1];

  // Validate card number (check for 16 digits)
  if (!/^\d{16}$/.test(cardNumber)) {
    return bot.sendMessage(msg.chat.id, 'Please enter a valid 16-digit card number.');
  }

  // Call the card verification function
  const verificationResult = await verifyCard(cardNumber);

  bot.sendMessage(msg.chat.id, verificationResult);
});
