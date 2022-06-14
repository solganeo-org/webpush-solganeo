define(["postmonger", 'lightning-lookup'], function (Postmonger, LightningLookup) {
  "use strict";

  var connection = new Postmonger.Session();
  var payload = {};
  var eventDefinitionKey = "";
  var eventDefinitionID = "";

  var journeydata = {};

  var lastStepEnabled = false;
  var contactAttributesResult = [];

  $(window).ready(onRender);

  connection.on("initActivity", initialize);
  connection.on("requestedTokens", onGetTokens);
  connection.on("requestedEndpoints", onGetEndpoints);
  connection.on('requestedDataSources', requestDataSources);
  connection.on('requestedTriggerEventDefinition', function(eventDefinitionModel) {
    // console.log('*** TriggerEventDefinition ***');
    // console.log(eventDefinitionModel);
    eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
    eventDefinitionID = eventDefinitionModel.id;
  });

  connection.on("clickedNext", onClickedNext);

  function onRender() {
    // JB will respond the first time 'ready' is called with 'initActivity'

    connection.trigger("requestTokens");
    connection.trigger("requestEndpoints");
    connection.trigger('requestDataSources');
    connection.trigger("requestTriggerEventDefinition");

    connection.trigger("ready");

    // Disable the next button if a value isn't selected
    $("#select1").change(function () {
      var message = getMessage();
      connection.trigger("updateButton", {
        button: "next",
        enabled: Boolean(message),
      });

      $("#message").html(message);
    });

  }

  function initialize(data) {
    if (data) {
      payload = data;
    }

    var hasInArguments = Boolean(
      payload["arguments"] &&
        payload["arguments"].execute &&
        payload["arguments"].execute.inArguments &&
        payload["arguments"].execute.inArguments.length > 0
    );

    var inArguments = hasInArguments
      ? payload["arguments"].execute.inArguments
      : {};

    LoadAttributeSets(inArguments, true);

    $.each(inArguments, function (index, inArgument) {
      $.each(inArgument, function (key, val) {
      });
    });

    connection.trigger('updateButton', {
      button: 'next',
      text: 'done',
      visible: true,
    });

  }

  function requestDataSources (dataSources) {    
    console.log('*** DataSources ***');
    console.log(dataSources);
    journeydata = dataSources;
  }

  function LoadAttributeSets(inArguments, isInit) {

   contactAttributesResult.length = 0;
      var url = "/sfmcHelper/fieldNames";

      console.log(eventDefinitionKey);
      if(eventDefinitionKey!="") {
        url+="?eventDefinitionKey=" + eventDefinitionKey;
      }

      $.ajax({
        url:url,
        type:"POST",
        data:JSON.stringify(journeydata[0]),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
          var jsonResponse = data;
          $.each(jsonResponse.items, function( index, item ) {
            $.each(item.attributes,function(indexAttribute,attribute){
              contactAttributesResult.push({id:attribute.id,label:attribute.key,metaLabel:attribute.fullyQualifiedName});
            });
          });
          $('#nameLookup').lookup({
            items: contactAttributesResult,
            objectPluralLabel: 'Contact Attributes',
            objectLabel: 'Contact Attribute',
            useImgTag: false,
            objectIconUrl: '/assets/icons/standard-sprite/svg/symbols.svg#people',
            objectIconClass: 'slds-icon-standard-people',
            initialSelection: { },
            showSearch: true,
            recentLabel: '',
            clearOnSelect: false,
            assetsLocation: "/"
          });
        }
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

  function onClickedNext() {


      save();

  }

  function save() {

    // 'payload' is initialized on 'initActivity' above.
    // Journey Builder sends an initial payload with defaults
    // set by this activity's config.json file.  Any property
    // may be overridden as desired.
    payload.name = name;

    payload["arguments"].execute.inArguments = [{ variable: "Test" }];

    payload["metaData"].isConfigured = true;

    connection.trigger("updateActivity", payload);
  }

  function getMessage() {
    return $("#select1").find("option:selected").attr("value").trim();
  }
});