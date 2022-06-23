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
    // console.log('*** DataSources ***')
    // console.log(dataSources)
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
        $('#subscriberLookup, #authLookup, #p256dhLookup, #endpointLookup, #text-input-content').lookup({
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

        if (!isInit) {
          Spinner(false)
        } else {
          inArgument = inArguments[0]

          console.log(inArgument)

          if (inArguments.length > 0) {

            (inArguments[0].UIsubscriberLookup) ? $('#subscriberLookup').lookup('setSelection', inArgument.UIsubscriberLookup) : false ;
            (inArguments[0].UIauthLookup)       ? $('#authLookup').lookup('setSelection', inArgument.UIauthLookup) : false ;
            (inArguments[0].UIp256dhLookup)     ? $('#p256dhLookup').lookup('setSelection', inArgument.UIp256dhLookup) : false ;
            (inArguments[0].UIendpointLookup)   ? $('#endpointLookup').lookup('setSelection', inArgument.UIendpointLookup) : false ;

            // Notification Input
            (inArguments[0].UIcontent)        ?  $('#text-input-content')[0].value = inArgument.UIcontent : false ;
            (inArguments[0].UIactionName)     ?  $('#text-input-action-name')[0].value = inArgument.UIactionName : false ;
            (inArguments[0].UIactionTitle)    ?  $('#text-input-action-title')[0].value = inArgument.UIactionTitle : false ;
            (inArguments[0].UIicon)           ?  $('#text-input-icon')[0].value = inArgument.UIicon : false ;
            (inArguments[0].UIurl1)           ?  $('#text-input-url1')[0].value = inArgument.UIurl1 : false ;
            (inArguments[0].UIurl2)           ?  $('#text-input-url2')[0].value = inArgument.UIurl2 : false ;

          }
        }
      },
    })
  }

  // FE Validation
  function isValidURL(string) { // Validate https
    // eslint-disable-next-line no-useless-escape
    var isStaticImage = string.match(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/)   
    if(isStaticImage !== null){    
      return true
    }
    return false
  }

  function onGetTokens(tokens) {
    // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
    // console.log(tokens);
  }

  function onGetEndpoints(endpoints) {
    // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
    // console.log(endpoints);
  }

  function onClickedNext() {
    Spinner(true)
    if(validateSave()) {
      
      Spinner(false)
      connection.trigger('ready');
      return;



    }

    else{

      console.log("Before Save")
      save();
      return;

    }

  }

  function validateSave() {
    let isError = false;

    console.log("Validating ...")

    $('.required').each(function (i, el) {

      var data = $(el).val();

      if(this.id == 'subscriberLookup' || this.id == 'endpointLookup' || this.id == 'p256dhLookup' || this.id == 'authLookup' ) {
        if($("#" + this.id).lookup('getSelection') == null) {
          $(this).closest('.slds-form-element_stacked').addClass('slds-has-error');
          isError = true;
          event.preventDefault();
        } else {
          $(this).closest('.slds-form-element_stacked').removeClass("slds-has-error");
        }
      } else {
        var len = data.length;
        if (len<1) {
          
          $(this).closest('.slds-form-element_stacked').addClass('slds-has-error');
          isError = true;
          event.preventDefault();
        }else{
          $(this).closest('.slds-form-element_stacked').removeClass("slds-has-error");
        }
      }

    })

    let isErrorUrl = $('.validateUrl').val() != "" ? !isValidURL( $('.validateUrl').val() ) : false;

    if (isErrorUrl ){
      $('.slds-notify_alert').fadeIn();
      $('.validateUrl').closest('.slds-form-element_stacked').addClass("slds-has-error");
    }else{
      $('.slds-notify_alert').fadeOut()
      $('.validateUrl').closest('.slds-form-element_stacked').removeClass("slds-has-error");
    }

    return (isError || isErrorUrl);
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
    arg.contactId = '{{Contact.Id}}';


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

    // Notification Input
    arg.UIcontent     = $('#text-input-content')[0].value;
    arg.UIactionName  = $('#text-input-action-name')[0].value;
    arg.UIactionTitle = $('#text-input-action-title')[0].value;
    arg.UIicon        = $('#text-input-icon')[0].value;
    arg.UIurl1        = $('#text-input-url1')[0].value;
    arg.UIurl2        = $('#text-input-url2')[0].value;


    inArgs.push(arg)
    Spinner(false)

    console.log(inArgs[0])

    payload['arguments'].execute.inArguments = inArgs

    payload['metaData'].isConfigured = true
    connection.trigger('updateActivity', payload)
  }

  function getMessage() {
    return $('#select1').find('option:selected').attr('value').trim()
  }
})
