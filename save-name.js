const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { name } = JSON.parse(event.body);
        
        if (!name || name.trim() === '') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Name is required' }),
            };
        }

        await client.connect();
        const database = client.db('mywebsite');
        const collection = database.collection('names');

        const result = await collection.insertOne({
            name: name.trim(),
            createdAt: new Date(),
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                id: result.insertedId,
                message: 'Name saved successfully'
            }),
        };
    } catch (error) {
        console.error('Error saving name:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save name' }),
        };
    } finally {
        await client.close();
    }
};