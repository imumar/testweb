const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        await client.connect();
        const database = client.db('mywebsite');
        const collection = database.collection('names');

        const names = await collection
            .find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                names: names,
                count: names.length
            }),
        };
    } catch (error) {
        console.error('Error fetching names:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch names' }),
        };
    } finally {
        await client.close();
    }
};
