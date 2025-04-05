const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Apna real token yahan paste karo
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Stripe API Key
const stripeApiKey = process.env.STRIPE_API_KEY;

// Card verification function using Stripe
async function verifyCard(cardNumber, expMonth, expYear, cvc) {
  try {
    // Sending the card details to Stripe for validation
    const response = await axios.post(
      'https://api.stripe.com/v1/payment_methods',
      {
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: expMonth,  // Expiry Month
          exp_year: expYear,    // Expiry Year
          cvc: cvc,             // CVC Code
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Check if CVC validation passes
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
  bot.sendMessage(msg.chat.id, 'Hello! I am your Telegram bot. Type /verifycard <card_number> <expiry_month> <expiry_year> <cvc> to verify a card.');
});

// Command to check card status
bot.onText(/\/verifycard (\d{16}) (\d{2}) (\d{4}) (\d{3})/, async (msg, match) => {
  const cardNumber = match[1];
  const expMonth = match[2];
  const expYear = match[3];
  const cvc = match[4];

  // Validate the card number (16 digits)
  if (!/^\d{16}$/.test(cardNumber)) {
    return bot.sendMessage(msg.chat.id, 'Please enter a valid 16-digit card number.');
  }

  // Validate the expiration date (MM YYYY)
  if (!/^\d{2}$/.test(expMonth) || !/^\d{4}$/.test(expYear)) {
    return bot.sendMessage(msg.chat.id, 'Please enter a valid expiration date (MM YYYY).');
  }

  // Validate CVC (3 digits)
  if (!/^\d{3}$/.test(cvc)) {
    return bot.sendMessage(msg.chat.id, 'Please enter a valid 3-digit CVC.');
  }

  // Call the card verification function
  const verificationResult = await verifyCard(cardNumber, expMonth, expYear, cvc);

  // Send the verification result
  bot.sendMessage(msg.chat.id, verificationResult);
});
