require('dotenv').config();
const mongoose = require('mongoose');

async function diag() {
    console.log('--- Mongoose Connection Diagnostic ---');
    console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'UNDEFINED');

    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not set in .env');
        process.exit(1);
    }

    mongoose.connection.on('connecting', () => console.log('Connecting...'));
    mongoose.connection.on('connected', () => console.log('Connected!'));
    mongoose.connection.on('error', (err) => console.error('Connection error:', err));
    mongoose.connection.on('disconnected', () => console.log('Disconnected.'));

    try {
        console.log('Starting connection attempt (15s timeout)...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            heartbeatFrequencyMS: 2000
        });

        console.log('Successfully connected to MongoDB!');
        console.log('Host:', mongoose.connection.host);
        console.log('Database:', mongoose.connection.name);

    } catch (error) {
        console.error('Diagnostic Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);

        if (error.message.includes('ETIMEDOUT')) {
            console.error('\nPOSSIBLE CAUSES:');
            console.error('1. IP Address not whitelisted in MongoDB Atlas.');
            console.error('2. Firewall or Antivirus blocking port 27017.');
            console.error('3. VPN or Proxy interfering with the connection.');
        }
    } finally {
        await mongoose.disconnect();
        console.log('--- Diagnostic Complete ---');
    }
}

diag();
