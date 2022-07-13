import express, { Express, Request, Response } from 'express'
import { config } from './config'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerDocument = require('./swagger.json')

import { AppStateManager } from './utils/app-state-manager'

import sfmchelper from './routes/sfmchelper'
import sfmc from './routes/sfmc'
import { RabbitClient } from './utils'

const runApplication = async (): Promise<void> => {

  console.log(config)
  const rabbitClient = RabbitClient.getInstance()

  await rabbitClient.connect()

  if (config.get('ENV') === 'development') {
    await rabbitClient.initializeProduce('local_producer', config.get('QUEUE'))
  }

  const appStateManager = new AppStateManager()
  appStateManager.saveClosableDependecy(rabbitClient)

  const app: Express = express()
  const port = process.env.PORT || 3000

  app.use(express.static('public'))
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
  app.use(bodyParser.json())
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use('/sfmcHelper', sfmchelper)
  app.use('/sfmc', sfmc)

  app.get('/', (req: Request, res: Response) => {
    res.render('index', { title: 'My Custom Activity' })
  })

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at Port: ${port}`)
  })
}

runApplication()
