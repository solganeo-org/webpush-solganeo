import {Request, Response } from 'express';

const request = require('request');
const uuid = require('uuid');

var FuelRest = require('fuel-rest');

function getFieldNames(req: Request, res: Response){

    // Get Field Names from SFMC

    var options = {
        auth: {
            // options you want passed when Fuel Auth is initialized
            clientId: process.env.SFMC_CLIENT_ID,
            clientSecret: process.env.SFMC_CLIENT_SECRET,
            authVersion: 2,
            authUrl: process.env.SFMC_AUTH_URL,
            authOptions:{
                authVersion: 2
            }
        },
        uri: ''
    };
    var eventDefinitionKey = req.query.eventDefinitionKey;
    
    var journeyData:any = {};
  
    var jsonResults:any = {};
    jsonResults.items = [];
   
      var entrySource = req.body;
      
      journeyData.fullyQualifiedName = "JourneyData";
      journeyData.key = "JourneyData";
      journeyData.id = uuid.v1();
      journeyData.attributes = [];
      // if we found the DE we need to replace the fully qualified name property
      var schema = entrySource.deSchema ? entrySource.deSchema : entrySource.schema;
      if(schema) {
        schema.fields.forEach((attr:any) => {
          var attribute:any = {};
          attribute.fullyQualifiedName = "EntrySource."+eventDefinitionKey + "." + attr.name;
          attribute.key = "EntrySource." + attr.name;
          attribute.id = uuid.v1();
          journeyData.attributes.push(attribute);
        });
        jsonResults.items.push(journeyData);
  
      }
      // Once Journey Data is found the we append it to the results we return but we replace the fullyQualifiedName property
      
    options.uri = '/contacts/v1/attributesetdefinitions/?$Page=1&$pagesize=450';
    var RestClient = new FuelRest(options);
  
    RestClient.get(options)
        .then((response: any) => {
            var attributeResults = response.body;
              
            attributeResults.items.forEach((item: any) => {
                item.attributes.forEach((attr: any) => {
                  let qualifiedName = attr.fullyQualifiedName;
                  attr.fullyQualifiedName = qualifiedName;
                  attr.key = qualifiedName;
                  attr.id = uuid.v1();
                  
                });
                jsonResults.items.push(item)
            });
            res.status(200).json(jsonResults);
  
          })
        .catch((err: any) => console.log('Error General', err));


}

export default {getFieldNames};