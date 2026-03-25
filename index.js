require('dotenv').config();
const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const app = express();

// Configuración de variables de entorno
const token = process.env.TELEGRAM_BOT_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;
const botUsername = process.env.BOT_USERNAME || 'espaciodigital_bot';

if (!token || !geminiKey) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN o GEMINI_API_KEY no están definidos');
  process.exit(1);
}

// Inicializar Telegraf y Gemini
const bot = new Telegraf(token);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: `Sos el asistente virtual de Espacio Digital. Tu nombre es Digi. Respondés en rioplatense (vos, che, dale) de forma corta y amigable sobre marketing y tecnología.`
});

const chatContexts = new Map();

async function getAIResponse(chatId, userMessage) {
  let chat = chatContexts.get(chatId);
  if (!chat) {
    chat = model.startChat({ history: [] });
    chatContexts.set(chatId, chat);
  }
  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}

bot.start((ctx) => ctx.reply('¡Hola! Soy Digi. Ya estoy configurado. Preguntame lo que quieras.'));

bot.on('message', async (ctx) => {
  const text = ctx.message.text;
  if (!text) return;
  const isPrivate = ctx.chat.type === 'private';
  const isMentioned = text.includes(`@${botUsername}`);

  if (isPrivate || isMentioned) {
    const cleanText = text.replace(`@${botUsername}`, '').trim();
    if (!cleanText) return;
    try {
      await ctx.sendChatAction('typing');
      const aiResponse = await getAIResponse(ctx.chat.id, cleanText);
      await ctx.reply(aiResponse, { reply_to_message_id: ctx.message.message_id });
    } catch (error) {
      console.error('Error con Gemini:', error);
      // Muestra el error real en Telegram para debuguear
      await ctx.reply(`😅 Error de IA: ${error.message}`);
    }
  }
});

bot.launch();

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Activo ✅'));
app.listen(PORT, () => console.log(`Salud en puerto ${PORT}`));

