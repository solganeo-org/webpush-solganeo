import { Request, Response } from 'express'
import { RabbitClient } from '../utils'
import { config, NotificationPayload } from '../config'

function save(req: Request, res: Response) {
  console.log('Saving ...')

  res.status(200).send('Save')
}

function publish(req: Request, res: Response) {
  console.log('Publishing ...')

  res.status(200).send('Publish')
}

function validate(req: Request, res: Response) {
  console.log('Validating ...')

  res.status(200).send('Validate')
}

function stop(req: Request, res: Response) {
  console.log('Stopping ...')

  res.status(200).send('Stop')
}

function execute(req: Request, res: Response) {
  console.log('Executing ...')

  const args: any = req.body.inArguments[0]

  console.log(args)

  // const subscriber: string = args.subscriber
  const auth: string = args.auth
  const p256dh: string = args.p256dh
  const endpoint: string = args.endpoint
  const actionName: string = args.UIactionName
  const actionTitle: string = args.UIactionTitle
  const icon: string = args.UIicon
  const url1: string = args.UIurl1
  const url2: string = args.UIurl2

  const payload: NotificationPayload = {
    auth: auth,
    p256dh: p256dh,
    endpoint: endpoint,
    content: 'Test from SFMC',
    actionName: actionName,
    actionTitle: actionTitle,
    icon: icon,
    url1: url1,
    url2: url2,
  }

  const rabbitClient = RabbitClient.getInstance()
  rabbitClient.sendMessage(
    'local_producer',
    config.get('queue'),
    JSON.stringify(payload)
  )

  res.status(200).send('Execute')
}

export default { save, publish, validate, execute, stop }
