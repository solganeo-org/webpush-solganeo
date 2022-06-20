import { Request, Response } from 'express'
import { config } from '../config'


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

function execute(req: Request, res: Response) {

    console.log("Executing ...");
    
    res.status(200).send("Execute");
}


export default { save, publish, validate, execute };