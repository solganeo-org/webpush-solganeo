import convict from 'convict'
import * as path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
convict.addFormat(require('convict-format-with-validator').ipaddress)

const config = convict({
  ENV: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test', 'local'],
    default: 'local',
    env: 'ENV',
  },

  QUEUE: {
    doc: 'Queue channel where messages will be sent',
    format: String,
    default: 'test',
    env: 'QUEUE',
  },

  PORT: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
    arg: 'port',
  },

  SFMC_CLIENT_ID: {
    doc: 'Client id to connect to the SFMC API',
    format: String,
    env: `SFMC_CLIENT_ID`,
    default: '',
  },

  SFMC_CLIENT_SECRET: {
    doc: 'Client secret to connect to the SFMC API',
    format: String,
    env: `SFMC_CLIENT_SECRET`,
    default: '',
  },

  SFMC_AUTH_URL: {
    doc: 'Auth to connect to the SFMC API',
    format: String,
    env: `SFMC_AUTH_URL`,
    default: '',
  },
  JWT_SECRET: {
    doc: 'JWT secret to connect to the SFMC API',
    format: String,
    env: `JWT_SECRET`,
    default: '',
  },

  RABBIT: {
    url: {
      format: String,
      default: 'amqp://localhost',
      env: 'RABBIT_URL',
    },
  },
})

const env = config.get('ENV')

if (env == 'local') {
  config.loadFile(path.join(__dirname, '.env.' + env + '.json'))
}

// Perform validation
config.validate({ allowed: 'strict' })
export { config }
