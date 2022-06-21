// eslint-disable-next-line no-var
// eslint-disable-next-line @typescript-eslint/no-var-requires
const amqp = require('amqplib/callback_api');


function produceMessage(){
    amqp.connect('amqp://localhost', function(error0: any, connection: any) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1: any, channel: any) {
          if (error1) {
            throw error1;
          }
          const queue = 'test_queue';
          const msg = 'Hello world';
      
          channel.assertQueue(queue, {
            durable: false
          });
      
          channel.sendToQueue(queue, Buffer.from(msg));
          console.log(" [x] Sent %s", msg);
        });
      });

}

produceMessage();
