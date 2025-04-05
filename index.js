const TelegramBot = require('node-telegram-bot-api');

// Apna real token yahan paste karo (BotFather se mila tha)
const token = '7938764609:AAFUdBg9DyJWlDKFcJI_3XFMMau6LKkqrO8';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot local system se chal raha hai! ✅');
});
