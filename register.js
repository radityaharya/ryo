import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config({ path: '.dev.vars' });

const BOT_SECRET = process.env.BOT_SECRET;
const BOT_URL = process.env.BOT_URL;

fetch(`${BOT_URL}/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${BOT_SECRET}`,
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
