import dotenv from 'dotenv';
dotenv.config();

import dbConnect from './lib/db.js';
import handler from './api/food/matches.js';

async function test() {
  try {
    console.log('Connecting...');
    await dbConnect();
    console.log('Connected.');
    
    const req = { method: 'GET', query: {} };
    const res = {
      status: (code) => ({
        json: (data) => console.log('Status', code, 'Response', JSON.stringify(data).substring(0, 100))
      })
    };
    
    await handler(req, res);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

test();
