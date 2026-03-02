#!/usr/bin/env node

/**
 * Example: Use Chatbot API Programmatically
 * 
 * This script demonstrates how to:
 * - Register a new client
 * - Send chat messages
 * - Submit leads
 * - Update client settings
 * 
 * Usage: node example-usage.js
 */

const https = require('https');

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const hostname = url.hostname;
    const port = url.port || 3000;
    const pathname = url.pathname + url.search;

    const options = {
      hostname,
      port,
      path: pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add auth token if provided
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = require('http').request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Main example flow
 */
async function main() {
  console.log('🤖 Chatbot API Examples\n');

  try {
    // ==========================================
    // EXAMPLE 1: Register a new customer
    // ==========================================
    console.log('📝 STEP 1: Registering new customer...');
    const registerResponse = await makeRequest('POST', '/clients/register', {
      clientId: 'coffee-shop-downtown',
      businessName: 'Downtown Coffee Shop',
      businessEmail: 'owner@coffeeshop.com',
      businessData: `We are Downtown Coffee Shop.
      
Our Menu:
- Espresso ($3)
- Cappuccino ($4)
- Latte ($4.50)
- Americano ($3.50)
- Iced Coffee ($4)
- Pastries ($2-5)

Hours: 7AM - 8PM Daily
Location: 123 Main Street
Phone: +1-555-COFFEE

Special: Free pastry with any 3 drinks!`
    });

    if (registerResponse.status !== 201) {
      console.error('❌ Registration failed:', registerResponse.data);
      return;
    }

    const apiKey = registerResponse.data.client.apiKey;
    const clientId = registerResponse.data.client.clientId;

    console.log('✅ Client registered successfully!');
    console.log(`   Client ID: ${clientId}`);
    console.log(`   Email: ${registerResponse.data.client.businessEmail}`);
    console.log(`   API Key: ${apiKey}\n`);

    // ==========================================
    // EXAMPLE 2: Send a chat message
    // ==========================================
    console.log('💬 STEP 2: Sending chat message...');
    const chatResponse = await makeRequest('POST', '/chat', {
      type: 'text',
      messages: [
        { role: 'user', content: 'What are your opening hours?' }
      ]
    }, apiKey);

    if (chatResponse.status !== 200) {
      console.error('❌ Chat failed:', chatResponse.data);
      return;
    }

    console.log('✅ Bot response:');
    console.log(`   "${chatResponse.data.reply}"\n`);

    // ==========================================
    // EXAMPLE 3: Multi-turn conversation
    // ==========================================
    console.log('💬 STEP 3: Multi-turn conversation...');
    const conversation = [
      { role: 'user', content: 'Do you have vegan options?' },
      { role: 'assistant', content: 'Yes! All our pastries can be made vegan with plant-based milk for no extra charge.' },
      { role: 'user', content: 'How much for a vegan cappuccino?' }
    ];

    const chat2Response = await makeRequest('POST', '/chat', {
      type: 'text',
      messages: conversation
    }, apiKey);

    if (chat2Response.status === 200) {
      console.log('✅ Bot response:');
      console.log(`   "${chat2Response.data.reply}"\n`);
    }

    // ==========================================
    // EXAMPLE 4: Submit a lead
    // ==========================================
    console.log('📧 STEP 4: Submitting lead...');
    const leadResponse = await makeRequest('POST', '/lead', {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      message: 'I want to book your space for a corporate event'
    }, apiKey);

    if (leadResponse.status !== 200) {
      console.error('❌ Lead submission failed:', leadResponse.data);
      return;
    }

    console.log('✅ Lead submitted!');
    console.log(`   Lead ID: ${leadResponse.data.lead._id}`);
    console.log(`   Name: ${leadResponse.data.lead.name}`);
    console.log(`   Email: ${leadResponse.data.lead.email}\n`);

    // ==========================================
    // EXAMPLE 5: Update client settings
    // ==========================================
    console.log('⚙️  STEP 5: Updating client settings...');
    const updateResponse = await makeRequest('PUT', '/clients/update', {
      businessData: `We are Downtown Coffee Shop - Your favorite spot!

Menu:
- Espresso ($3)
- Cappuccino ($4)
- Latte ($4.50)
- Americano ($3.50)
- Cold Brew ($4)
- Matcha Latte ($5)
- Fresh Pastries ($2-5)

Hours: 7AM - 8PM Daily
Closed: Sundays
Location: 123 Main Street
Phone: +1-555-COFFEE
Website: coffeeshop.com

NOW OPEN:
- Event space rentals
- Catering services
- WiFi & Power outlets
- Loyalty program: Buy 10 drinks, get 1 free!`
    }, apiKey);

    if (updateResponse.status !== 200) {
      console.error('❌ Update failed:', updateResponse.data);
      return;
    }

    console.log('✅ Client settings updated!');
    console.log(`   Business Name: ${updateResponse.data.client.businessName}\n`);

    // ==========================================
    // EXAMPLE 6: Get client info
    // ==========================================
    console.log('📋 STEP 6: Getting client info...');
    const infoResponse = await makeRequest('GET', '/clients/info', null, apiKey);

    if (infoResponse.status !== 200) {
      console.error('❌ Get info failed:', infoResponse.data);
      return;
    }

    console.log('✅ Client Info:');
    console.log(`   Status: ${infoResponse.data.active ? '🟢 Active' : '🔴 Inactive'}`);
    console.log(`   Plan: ${infoResponse.data.plan}`);
    console.log(`   Model: ${infoResponse.data.model}`);
    console.log(`   Created: ${new Date(infoResponse.data.createdAt).toLocaleDateString()}\n`);

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('✨ All examples completed! Here\'s what happened:');
    console.log('1. ✅ Registered new customer');
    console.log('2. ✅ Sent chat message - bot responded');
    console.log('3. ✅ Had multi-turn conversation');
    console.log('4. ✅ Submitted lead - email would be sent');
    console.log('5. ✅ Updated bot training data');
    console.log('6. ✅ Checked client settings\n');

    console.log('💡 Next steps:');
    console.log('- Deploy your backend to a server');
    console.log('- Give this API key to your customer');
    console.log('- They embed the widget on their website');
    console.log('- Customers chat with their customized bot!');
    console.log('- Leads are collected automatically\n');

    console.log('🚀 To use in production:');
    console.log('1. Change API_BASE_URL to your domain');
    console.log('2. This script becomes your backend API client');
    console.log('3. Use it in your Node.js app, CLI, or dashboard\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure your backend is running:');
    console.log('   npm run dev');
  }
}

// Run the example
main();
