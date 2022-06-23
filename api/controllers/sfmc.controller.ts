import { Request, Response } from 'express'
import { RabbitClient } from '../utils';
import {config} from "../config"

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

    console.log(req.body);

    const args: any = req.body.inArguments[0];

    const subscriber: string = args.subscriber;
    const auth: string = args.auth;
    const p256dh: string = args.p256dh;
    const endpoint: string = args.endpoint;

    const payload = {
        subscriber: subscriber,
        auth: auth,
        p256dh: p256dh,
        endpoint: endpoint,
        content: "Test from SFMC"
    }

    const rabbitClient = RabbitClient.getInstance();
    rabbitClient.sendMessage('local_producer', config.get('queue'), JSON.stringify(payload));

    res.status(200).send("Execute");

}


export default { save, publish, validate, execute, stop };