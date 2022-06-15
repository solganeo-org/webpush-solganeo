import express, { Express, Request, Response } from 'express'
import { config } from './config'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerDocument = require('./swagger.json')

import sfmchelper from './routes/sfmchelper'

console.log(config.get('env'))

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

app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'My Custom Activity' })
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at Port: ${port}`)
})
