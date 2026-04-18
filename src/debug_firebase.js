/**
 * @file debug_firebase.js
 * @description Connection tester for Firebase Realtime Database.
 */

require('dotenv').config();
const { db, IS_MOCK_MODE, admin } = require('./firebase');

async function testConnection() {
  console.log("🔍 --- VenueFlow Firebase Connectivity Debugger ---");
  
  if (IS_MOCK_MODE) {
    console.error("❌ MOCK MODE is active. Authentication credentials were not found in .env");
    return;
  }

  console.log(`📡 Attempting to connect to: ${process.env.FIREBASE_DATABASE_URL || "Default Project URL"}`);
  console.log(`🔑 Service Account: ${process.env.FIREBASE_CLIENT_EMAIL}`);

  try {
    // 1. Check Auth 
    console.log("⏱️  Checking Firebase Admin SDK Initialization...");
    const app = admin.app();
    console.log(`✅ App Name: ${app.name}`);

    // 2. Perform a read operation with a timeout
    console.log("⏱️  Executing read from root (/) with 10s timeout...");
    
    // Using a promise-based timeout wrapper
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DATABASE_TIMEOUT: Handshake hung for 10 seconds. Check your Database URL and Network.')), 10000)
    );

    const readTask = db.ref('.info/connected').once('value');
    const isConnected = await Promise.race([readTask, timeout]);
    
    if (isConnected.val() === true) {
      console.log("✅ Socket Connected: Realtime Database Protocol is active.");
    } else {
      console.warn("⚠️  Socket status reported as DISCONNECTED, but no error thrown yet.");
    }

    // 3. Try to read real data
    console.log("⏱️  Testing Read Access permissions on /zones...");
    const zonesSnapshot = await db.ref('zones').once('value');
    console.log(`✅ Read success! Found ${zonesSnapshot.numChildren()} zones.`);
    
    console.log("\n✨ --- ALL CLEAR --- ✨");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ --- CONNECTION FAILED ---");
    console.error(`Error Code: ${err.code || 'UNKNOWN'}`);
    console.error(`Error Message: ${err.message}`);
    
    if (err.message.includes('DATABASE_TIMEOUT')) {
      console.error("\n💡 TROUBLESHOOTING TIP:");
      console.error("Your FIREBASE_DATABASE_URL is likely incorrect or your region is blocking the connection.");
    } else if (err.code === 'PERMISSION_DENIED') {
      console.error("\n💡 TROUBLESHOOTING TIP:");
      console.error("Your service account is authenticated but doesn't have permissions.");
      console.error("Go to Google Cloud console and add 'Firebase Realtime Database Admin' role to this account.");
    } else if (err.message.includes('invalid-credential') || err.message.includes('private key')) {
      console.error("\n💡 TROUBLESHOOTING TIP:");
      console.error("Your private key is formatted incorrectly in the .env file.");
    }
    
    process.exit(1);
  }
}

testConnection();
