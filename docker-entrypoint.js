import { app } from './src/server.ts';
import { env } from 'hono/adapter';

const {
  PORT = 3000,
  HOST = '0.0.0.0',
  DISCORD_APPLICATION_ID,
  DISCORD_PUBLIC_KEY,
  DISCORD_TOKEN,
  BOT_SECRET,
} = env();

if (!DISCORD_APPLICATION_ID) {
  throw new Error('DISCORD_APPLICATION_ID is required');
}

if (!DISCORD_PUBLIC_KEY) {
  throw new Error('DISCORD_PUBLIC_KEY is required');
}

if (!DISCORD_TOKEN) {
  throw new Error('DISCORD_TOKEN is required');
}

if (!BOT_SECRET) {
  throw new Error('BOT_SECRET is required');
}


console.log('Starting server...');
console.log('Server is running on port ' + PORT);
console.log('App ID: ', DISCORD_APPLICATION_ID);

export default {
  host: HOST,
  port: 3000,
  fetch: app.fetch,
};
