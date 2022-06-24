import convict from 'convict'
import * as path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
convict.addFormat(require('convict-format-with-validator').ipaddress)

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'local',
    env: 'NODE_ENV',
  },

  queue: {
    doc: 'Queue channel where messages will be sent',
    format: String,
    default: 'test',
    env: 'queue',
  },

  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
    arg: 'port',
  },

  sfmc_client_id: {
    doc: 'Client id to connect to the SFMC API',
    format: String,
    env: `SFMC_CLIENT_ID`,
    default: '',
  },

  sfmc_client_secret: {
    doc: 'Client secret to connect to the SFMC API',
    format: String,
    env: `SFMC_CLIENT_SECRET`,
    default: '',
  },

  sfmc_auth_url: {
    doc: 'Auth to connect to the SFMC API',
    format: String,
    env: `SFMC_AUTH_URL`,
    default: '',
  },
<<<<<<< Updated upstream
  jwt_secret: {
    doc: 'JWT secret to connect to the SFMC API',
=======

  jwt_secret: {
    doc: 'Jwt Secret',
>>>>>>> Stashed changes
    format: String,
    env: `JWT_SECRET`,
    default: '',
  },
<<<<<<< Updated upstream

  rabbit: {

    url: {

      format: String,
      default: 'amqp://localhost',
      env: 'RABBIT_URL',

    }

  }
=======
>>>>>>> Stashed changes
})

const env = config.get('env')

if (env == 'local') {
  config.loadFile(path.join(__dirname, '.env.' + env + '.json'))
}

// Perform validation
config.validate({ allowed: 'strict' })
export { config }
