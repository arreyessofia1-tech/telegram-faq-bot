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
  console.error('❌ Error: Token o API Key no definidos.');
}

// Inicializar Telegraf y Gemini
const bot = new Telegraf(token);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  systemInstruction: `Sos el asistente virtual de Espacio Digital. Tu nombre es Digi.
  Respondés dudas sobre marketing digital, redes sociales y tecnología con lenguaje rioplatense amigable.
  En grupos, solo respondés si te mencionan con @${botUsername}.
  Tus respuestas deben ser cortas (máximo 5-6 líneas) y claras.`
});

// Historial de conversación
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

bot.start((ctx) => ctx.reply('¡Hola! Soy Digi. Enviame cualquier duda sobre marketing o tecnología y te ayudo.'));

bot.on('message', async (ctx) => {
  const text = ctx.message.text;
  if (!text) return;

  const isPrivate = ctx.chat.type === 'private';
  const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';
  const isMentioned = text.includes(`@${botUsername}`);

  if (isPrivate || (isGroup && isMentioned)) {
    const cleanText = text.replace(`@${botUsername}`, '').trim();
    try {
      await ctx.sendChatAction('typing');
      const aiResponse = await getAIResponse(ctx.chat.id, cleanText);
      await ctx.reply(aiResponse, { reply_to_message_id: ctx.message.message_id });
    } catch (e) {
      ctx.reply('😅 Ups, algo salió mal. ¡Intentá de nuevo!');
    }
  }
});

// Lanzar Bot
bot.launch().then(() => console.log('✅ Bot Online'));

// Servidor de salud para Render
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Activo ✅'));
app.listen(PORT, () => console.log(`Puerto ${PORT}`));

// Apagado seguro
process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });
