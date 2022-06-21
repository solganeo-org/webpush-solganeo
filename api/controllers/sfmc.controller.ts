import { Request, Response } from 'express'
import { RabbitClient } from '../utils';

function save(req: Request, res: Response) {

    console.log("Saving ...");

    res.status(200).send("Save");
}

function publish(req: Request, res: Response) {

    console.log("Publishing ...");

    res.status(200).send("Publish");
}

function validate(req: Request, res: Response) {

    console.log("Validating ...");

    res.status(200).send("Validate");
}

function stop(req: Request, res: Response) {

    console.log("Stopping ...");

    res.status(200).send("Stop");
}

function execute(req: Request, res: Response) {

    console.log("Executing ...");

    const args: any = req.body.inArguments[0];

    const contactId: string = args.contactId;
    const subscriber: string = args.subscriber;
    const auth: string = args.auth;
    const p256dh: string = args.p256dh;

    const payload = {
        contactId: contactId,
        subscriber: subscriber,
        auth: auth,
        p256dh: p256dh
    }

    const rabbitClient = RabbitClient.getInstance();
    rabbitClient.sendMessage('local_producer', 'test_queue', JSON.stringify(payload));

    res.status(200).send("Execute");

}


export default { save, publish, validate, execute, stop };