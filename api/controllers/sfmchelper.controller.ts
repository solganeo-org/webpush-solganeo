import { Request, Response } from 'express'

import uuid from 'uuid'

import FuelRest from 'fuel-rest'

function getFieldNames(req: Request, res: Response) {
  // Get Field Names from SFMC

  const options = {
    auth: {
      // options you want passed when Fuel Auth is initialized
      clientId: process.env.SFMC_CLIENT_ID,
      clientSecret: process.env.SFMC_CLIENT_SECRET,
      authVersion: 2,
      authUrl: process.env.SFMC_AUTH_URL,
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

  options.uri = '/contacts/v1/attributesetdefinitions/?$Page=1&$pagesize=450'
  const RestClient = new FuelRest(options)

  RestClient.get(options)
    .then((response: any) => {
      const attributeResults = response.body

      attributeResults.items.forEach((item: any) => {
        item.attributes.forEach((attr: any) => {
          const qualifiedName = attr.fullyQualifiedName
          attr.fullyQualifiedName = qualifiedName
          attr.key = qualifiedName
          attr.id = uuid.v1()
        })
        jsonResults.items.push(item)
      })
      res.status(200).json(jsonResults)
    })
    .catch((err: any) => console.log('Error General', err))
}

export default { getFieldNames }
