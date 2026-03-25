require('dotenv').config();
const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const app = express();

const token = process.env.TELEGRAM_BOT_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;
const botUsername = process.env.BOT_USERNAME || 'espaciodigital_bot';

const bot = new Telegraf(token);
const genAI = new GoogleGenerativeAI(geminiKey);

bot.start((ctx) => ctx.reply('¡Hola! Soy Digi. Ya estoy activo.'));

// Comando de prueba
bot.command('test', async (ctx) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hola");
    const response = await result.response;
    ctx.reply(`✅ IA Funcionando: ${response.text().slice(0, 50)}...`);
  } catch (error) {
    // Esto nos va a decir qué clave está fallando exactamente
    ctx.reply(`❌ Fallo: ${error.message}\nClave termina en: ...${geminiKey.slice(-4)}`);
  }
});

bot.on('message', async (ctx) => {
  const text = ctx.message.text;
  if (!text) return;
  if (ctx.chat.type === 'private' || text.includes(`@${botUsername}`)) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(text);
      const response = await result.response;
      ctx.reply(response.text());
    } catch (e) {
      ctx.reply(`😅 Error de IA: ${e.message}\nEscribí /test para ver detalles.`);
    }
  }
});

bot.launch();
app.get('/', (req, res) => res.send('Bot Activo ✅'));
app.listen(process.env.PORT || 3000);
