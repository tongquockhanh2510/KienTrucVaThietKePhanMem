const amqp = require('amqplib');

let connection = null;
let channel = null;

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'auth_events';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(RABBITMQ_URL);

        connection.on('error', (err) => {
            console.error('RabbitMQ connection error:', err.message);
        });

        connection.on('close', () => {
            console.warn('RabbitMQ disconnected. Reconnecting in 5s...');
            channel = null;
            setTimeout(connectRabbitMQ, 5000);
        });

        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE, 'topic', {
            durable: true
        });
        
        console.log('RabbitMQ connected successfully');
        return channel;
    } catch (error) {
        console.error('RabbitMQ connection failed:', error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
};

const publishEvent = async (routingKey, payload) => {
    try {
        if (!channel) {
            console.error('Channel not available - message not published');
            return false;
        }

        const event = {
            eventType: 'USER_REGISTERED',
            routingKey,
            payload,
            createdAt: new Date().toISOString()
        };

        const success = channel.publish(
            EXCHANGE,
            routingKey,
            Buffer.from(JSON.stringify(event)),
            {
                persistent: true,
                contentType: 'application/json'
            }
        );

        if (success) {
            console.log('[RabbitMQ] Event published:', routingKey);
            console.log('[RabbitMQ] Payload:', JSON.stringify(payload, null, 2));
        }

        return success;
    } catch (error) {
        console.error('[RabbitMQ] Publish event error:', error.message);
        return false;
    }
};

const consumeEvent = async (queueName, handler) => {
    try {
        if (!channel) {
            throw new Error('Channel not available');
        }

        // Assert queue
        await channel.assertQueue(queueName, {
            durable: true
        });

        // Consume messages
        await channel.consume(queueName, async (msg) => {
            if (!msg) return;

            try {
                const event = JSON.parse(msg.content.toString());
                console.log('Event received:', event);

                await handler(event);

                // Acknowledge message
                channel.ack(msg);
            } catch (error) {
                console.error('Consume event error:', error.message);
                // Negative acknowledge - requeue message
                channel.nack(msg, false, true);
            }
        });

        console.log(`Consuming from queue: ${queueName}`);
    } catch (error) {
        console.error('Consumer setup error:', error.message);
    }
};

const getChannel = () => channel;

module.exports = {
    connectRabbitMQ,
    publishEvent,
    consumeEvent,
    getChannel
};