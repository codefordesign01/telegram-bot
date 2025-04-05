const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Apna real token yahan paste karo
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Stripe API Key
const stripeApiKey = process.env.STRIPE_API_KEY;

// Card verification function using Stripe
async function verifyCard(cardNumber) {
  try {
    // Sending the card number to Stripe for validation (simple validation example)
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

    if (response.data.card.checks.cvc_check === 'pass') {
      return 'Card is live and valid ✅';
    } else {
      return 'Card is invalid or expired ❌';
    }
  } catch (error) {
    console.error('Error verifying card:', error);
    return 'Error verifying card. Please try again later.';
  }
}

// Handler for /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hello! I am your Telegram bot. Type /verifycard <card_number> to verify a card.');
});

// Command to check card status
bot.onText(/\/verifycard (\d+)/, async (msg, match) => {
  const cardNumber = match[1];

  // Check if the card number is valid (basic validation)
  if (!/^\d{16}$/.test(cardNumber)) {
    return bot.sendMessage(msg.chat.id, 'Please enter a valid 16-digit card number.');
  }

  // Call the card verification function
  const verificationResult = await verifyCard(cardNumber);

  bot.sendMessage(msg.chat.id, verificationResult);
});
