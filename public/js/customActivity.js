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
        $('#nameLookup').lookup({
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
          console.log(inArguments)
          if (inArguments.length > 0 && inArguments[0].UInameLookup) {
            inArgument = inArguments[0]

            $('#nameLookup').lookup('setSelection', inArgument.UInameLookup)
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

    if ($('#nameLookup').lookup('getSelection') != null) {
      var nameLookupLabel = $('#nameLookup').lookup('getSelection').metaLabel
      if (nameLookupLabel == null) {
        nameLookupLabel = $('#nameLookup').lookup('getSelection').label
      }
      let fixedNameField = buildArgument(nameLookupLabel)

      arg.name = NormalizeInArgument(fixedNameField)
    } else {
      arg.name = ''
    }

    arg.UInameLookup = $('#nameLookup').lookup('getSelection')

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
