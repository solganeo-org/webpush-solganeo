import amqp from 'amqplib';
import {RabbitConfig, config} from '../config';
import { ProducerNotFound } from '../utils';

export class RabbitClient {

    conn: any;
    producers: any;
    rabbitConfig: RabbitConfig;

    static instance: any = null;

    private constructor(rabbitConfig: RabbitConfig) {

        this.rabbitConfig = rabbitConfig;
        this.producers = {};

    }

    static getInstance = () => {
        return RabbitClient.instance || (RabbitClient.instance = new RabbitClient(config.get('rabbit')))
    }

    async connect(): Promise<void> {

        console.log(this.rabbitConfig.url);
        
        try{
            this.conn = await amqp.connect(this.rabbitConfig.url);
        }

        catch(error){
            console.log(error);
        }
    }

    async initializeProduce(producerName: string, queue: string ): Promise<void> {

        try{

            this.producers[producerName] = await this.conn.createChannel();
            await this.producers[producerName].assertQueue(queue, {durable: false});
            await this.producers[producerName].prefetch(1);
            console.log(`Producer ${producerName} initialized`);

        }

        catch(error){
            console.log(error);
        }

    }

    async sendMessage(producerName: string, queue: string, message: any): Promise<void> {
        if (!this.producers[producerName]) {
          throw new ProducerNotFound(`There is no active producer with the name ${producerName}`)
        }
        try {
          await this.producers[producerName].sendToQueue(queue, Buffer.from(message));
        } catch (error: any) {
          console.log(error)
        }
    }

    async close(): Promise<void> {
        await Promise.all(Object.values(this.producers).map((producer: any) => producer.close()))
        return this.conn.close()
      }

}