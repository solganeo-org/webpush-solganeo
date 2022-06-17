import { Request, Response } from 'express'
import { config } from '../config'

import uuid from 'uuid'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FuelRest = require('fuel-rest')

function getFieldNames(req: Request, res: Response) {
  // Get Field Names from SFMC

  const options = {
    auth: {
      // options you want passed when Fuel Auth is initialized
      clientId: config.get('sfmc_client_id'),
      clientSecret: config.get('sfmc_client_secret'),
      authVersion: 2,
      authUrl: config.get('sfmc_auth_url'),
      authOptions: {
        authVersion: 2,
      },
    },
    uri: '',
  }
  const eventDefinitionKey = req.query.eventDefinitionKey

  const journeyData: any = {}

  const jsonResults: any = {}
  jsonResults.items = []

  const entrySource = req.body

  journeyData.fullyQualifiedName = 'JourneyData'
  journeyData.key = 'JourneyData'
  journeyData.id = uuid.v1()
  journeyData.attributes = []
  // if we found the DE we need to replace the fully qualified name property
  const schema = entrySource.deSchema
    ? entrySource.deSchema
    : entrySource.schema
  if (schema) {
    schema.fields.forEach((attr: any) => {
      const attribute: any = {}
      attribute.fullyQualifiedName =
        'EntrySource.' + eventDefinitionKey + '.' + attr.name
      attribute.key = 'EntrySource.' + attr.name
      attribute.id = uuid.v1()
      journeyData.attributes.push(attribute)
    })
    jsonResults.items.push(journeyData)
  }

  // Once Journey Data is found the we append it to the results we return but we replace the fullyQualifiedName property

  res.send(jsonResults)
}

export default { getFieldNames }
