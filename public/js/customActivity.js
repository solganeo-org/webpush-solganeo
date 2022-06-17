/* eslint-disable no-undef */
define(['postmonger', 'lightning-lookup'], function (
  Postmonger,
  LightningLookup
) {
  'use strict'

  var connection = new Postmonger.Session()
  var payload = {}
  var eventDefinitionKey = ''
  var eventDefinitionID = ''

  var journeydata = {}
  var inArgument = {}

  var lastStepEnabled = false
  var contactAttributesResult = []

  $(window).ready(onRender)

  connection.on('initActivity', initialize)
  connection.on('requestedTokens', onGetTokens)
  connection.on('requestedEndpoints', onGetEndpoints)
  connection.on('requestedDataSources', requestDataSources)
  connection.on(
    'requestedTriggerEventDefinition',
    function (eventDefinitionModel) {
      // console.log('*** TriggerEventDefinition ***');
      // console.log(eventDefinitionModel);
      eventDefinitionKey = eventDefinitionModel.eventDefinitionKey
      eventDefinitionID = eventDefinitionModel.id
    }
  )

  connection.on('clickedNext', onClickedNext)

  function onRender() {
    Spinner(true)
    // JB will respond the first time 'ready' is called with 'initActivity'

    connection.trigger('requestTokens')
    connection.trigger('requestEndpoints')
    connection.trigger('requestDataSources')
    connection.trigger('requestTriggerEventDefinition')

    connection.trigger('ready')

    // Disable the next button if a value isn't selected
    $('#select1').change(function () {
      var message = getMessage()
      connection.trigger('updateButton', {
        button: 'next',
        enabled: Boolean(message),
      })

      $('#message').html(message)
    })
  }

  function initialize(data) {
    if (data) {
      payload = data
    }

    var hasInArguments = Boolean(
      payload['arguments'] &&
        payload['arguments'].execute &&
        payload['arguments'].execute.inArguments &&
        payload['arguments'].execute.inArguments.length > 0
    )

    var inArguments = hasInArguments
      ? payload['arguments'].execute.inArguments
      : {}

    LoadAttributeSets(inArguments, true)

    Spinner(false)

    connection.trigger('updateButton', {
      button: 'next',
      text: 'done',
      visible: true,
    })
  }

  function requestDataSources(dataSources) {
    console.log('*** DataSources ***')
    console.log(dataSources)
    journeydata = dataSources
  }

  function Spinner(show) {
    if (show) {
      $('.spinner').show()
    } else {
      $('.spinner').hide()
    }
  }

  function LoadAttributeSets(inArguments, isInit) {
    contactAttributesResult.length = 0
    var url = '/sfmcHelper/fieldNames'

    console.log(inArguments)

    console.log(eventDefinitionKey)
    if (eventDefinitionKey != '') {
      url += '?eventDefinitionKey=' + eventDefinitionKey
    }
    if (!isInit) {
      Spinner(true)
    }

    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(journeydata[0]),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        var jsonResponse = data
        $.each(jsonResponse.items, function (index, item) {
          $.each(item.attributes, function (indexAttribute, attribute) {
            contactAttributesResult.push({
              id: attribute.id,
              label: attribute.key,
              metaLabel: attribute.fullyQualifiedName,
            })
          })
        })
        $('#subscriberLookup, #authLookup, #p256dhLookup, #endpointLookup').lookup({
          items: contactAttributesResult,
          objectPluralLabel: 'Contact Attributes',
          objectLabel: 'Contact Attribute',
          useImgTag: false,
          objectIconUrl: '/assets/icons/standard-sprite/svg/symbols.svg#people',
          objectIconClass: 'slds-icon-standard-people',
          initialSelection: {},
          showSearch: true,
          recentLabel: '',
          clearOnSelect: false,
          assetsLocation: '/',
        })

        console.log('HERREEEE')

        if (!isInit) {
          Spinner(false)
        } else {
          inArgument = inArguments[0]

          if (inArguments.length > 0) {

            (inArguments[0].UIsubscriberLookup) ? $('#subscriberLookup').lookup('setSelection', inArgument.UIsubscriberLookup) : false ;
            (inArguments[0].UIauthLookup) ? $('#authLookup').lookup('setSelection', inArgument.UIauthLookup) : false ;
            (inArguments[0].UIp256dhLookup) ? $('#p256dhLookup').lookup('setSelection', inArgument.UIp256dhLookup) : false ;
            (inArguments[0].UIendpointLookup) ? $('#endpointLookup').lookup('setSelection', inArgument.UIendpointLookup) : false ;

          }
        }
      },
    })
  }

  function onGetTokens(tokens) {
    // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
    // console.log(tokens);
  }

  function onGetEndpoints(endpoints) {
    // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
    // console.log(endpoints);
  }
  123358434168
  function onClickedNext() {
    Spinner(true)
    save()
  }

  function buildArgument(value) {
    let valueSplited = value.split('.')
    let valueField = '"'
    for (var i = 2; i < valueSplited.length; i++) {
      valueField += valueSplited[i]
    }

    valueField += '"'
    let returningValue =
      valueSplited[0] + '.' + valueSplited[1] + '.' + valueField
    return returningValue
  }

  function NormalizeInArgument(inArg) {
    if (inArg.startsWith('EntrySource.')) {
      return '{{' + inArg.replace('EntrySource.', 'Event.') + '}}'
    }
    var firstPart = inArg.substring(0, inArg.indexOf('.'))
    var lastPart = inArg.substring(inArg.indexOf('.') + 1)
    return '{{Contact.Attribute."' + firstPart + '"."' + lastPart + '"}}'
  }

  function save() {
    var inArgs = []
    var arg = {}
    arg.contactId = '{{Contact.Id}}'

    // Subscriber Key Lookup
    if ($('#subscriberLookup').lookup('getSelection') != null) {
      var subscriberLookupLabel = $('#subscriberLookup').lookup('getSelection').metaLabel
      if (subscriberLookupLabel == null) {
        subscriberLookupLabel = $('#subscriberLookup').lookup('getSelection').label
      }
      let fixedSubscriberField = buildArgument(subscriberLookupLabel)

      arg.subscriber = NormalizeInArgument(fixedSubscriberField)
    } else {
      arg.subscriber = ''
    }

    // Auth Key Lookup
    if ($('#authLookup').lookup('getSelection') != null) {
      var authLookupLabel = $('#authLookup').lookup('getSelection').metaLabel
      if (authLookupLabel == null) {
        authLookupLabel = $('#authLookup').lookup('getSelection').label
      }
      let fixedAuthField = buildArgument(authLookupLabel)

      arg.auth = NormalizeInArgument(fixedAuthField)
    } else {
      arg.auth = ''
    }

    // P256dh Key Lookup
    if ($('#p256dhLookup').lookup('getSelection') != null) {
      var p256dhLookupLabel = $('#p256dhLookup').lookup('getSelection').metaLabel
      if (p256dhLookupLabel == null) {
        p256dhLookupLabel = $('#p256dhLookup').lookup('getSelection').label
      }
      let fixedP256dhField = buildArgument(p256dhLookupLabel)

      arg.p256dh = NormalizeInArgument(fixedP256dhField)
    } else {
      arg.p256dh = ''
    }

    // Endpoint Key Lookup
    if ($('#endpointLookup').lookup('getSelection') != null) {
      var endpointLookupLabel = $('#endpointLookup').lookup('getSelection').metaLabel
      if (endpointLookupLabel == null) {
        endpointLookupLabel = $('#endpointLookup').lookup('getSelection').label
      }
      let fixedEndpointField = buildArgument(endpointLookupLabel)

      arg.endpoint = NormalizeInArgument(fixedEndpointField)
    } else {
      arg.endpoint = ''
    }

    arg.UIsubscriberLookup = $('#subscriberLookup').lookup('getSelection')
    arg.UIauthLookup = $('#authLookup').lookup('getSelection')
    arg.UIp256dhLookup = $('#p256dhLookup').lookup('getSelection')
    arg.UIendpointLookup = $('#endpointLookup').lookup('getSelection')

    inArgs.push(arg)
    Spinner(false)

    payload['arguments'].execute.inArguments = inArgs

    payload['metaData'].isConfigured = true
    connection.trigger('updateActivity', payload)
  }

  function getMessage() {
    return $('#select1').find('option:selected').attr('value').trim()
  }
})
