import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { env } from './env';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

type MessageHandler = (message: string, channel: string) => Promise<void>;

async function getChannel(): Promise<Channel> {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  return channel;
}

export async function initializeBroker(): Promise<void> {
  if (connection && channel) {
    return;
  }

  const createdConnection = await amqp.connect(env.rabbitMqUrl);
  createdConnection.on('error', (error) => {
    console.error('RabbitMQ connection error:', error.message);
  });

  createdConnection.on('close', () => {
    console.warn('RabbitMQ connection closed');
  });

  const createdChannel = await createdConnection.createChannel();
  await createdChannel.assertExchange(env.rabbitMqExchange, 'topic', { durable: true });

  connection = createdConnection;
  channel = createdChannel;

  console.log(`RabbitMQ connected: ${env.rabbitMqUrl}`);
  console.log(`RabbitMQ exchange: ${env.rabbitMqExchange}`);
}

export async function subscribeEvent(
  eventChannel: string,
  handler: MessageHandler
): Promise<void> {
  const brokerChannel = await getChannel();
  const assertedQueue = await brokerChannel.assertQueue('', {
    exclusive: true,
    durable: false,
    autoDelete: true,
  });

  await brokerChannel.bindQueue(
    assertedQueue.queue,
    env.rabbitMqExchange,
    eventChannel
  );

  await brokerChannel.consume(assertedQueue.queue, async (message: ConsumeMessage | null) => {
    if (!message) {
      return;
    }

    const payload = message.content.toString('utf-8');
    try {
      await handler(payload, eventChannel);
      brokerChannel.ack(message);
    } catch (error) {
      console.error(`Failed to handle message on ${eventChannel}:`, error);
      brokerChannel.nack(message, false, false);
    }
  });

  console.log(`Subscribed to event: ${eventChannel}`);
}

export async function publishEvent(
  eventChannel: string,
  payload: object
): Promise<void> {
  const brokerChannel = await getChannel();
  brokerChannel.publish(
    env.rabbitMqExchange,
    eventChannel,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );
}

export async function closeBroker(): Promise<void> {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }
}
