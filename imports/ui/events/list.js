import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Location } from 'meteor/djabatav:geolocation-plus';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { Mapbox } from 'meteor/pauloborges:mapbox';


//collections
import { Citoyens } from '../../api/citoyens.js';
import { Events,BlockEventsRest } from '../../api/events.js';
import { Cities } from '../../api/cities.js';

//submanager
import { dashboardSubs,listEventsSubs,listOrganizationsSubs,listProjectsSubs,listsSubs } from '../../api/client/subsmanager.js';

import '../map/map.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import { position } from '../../api/client/position.js';
import { searchQuery } from '../../api/helpers.js';

Template.listEvents.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('sortEvents', null);
  pageSession.set('searchEvents', null);

  //mettre sur layer ?
  //Meteor.subscribe('citoyen');

  //sub listEvents
  this.autorun(function(c) {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      const handle = listEventsSubs.subscribe('geo.scope','events',latlngObj,radius);
          template.ready.set(handle.ready());
    }else{
      console.log('sub list events city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        const handle = listEventsSubs.subscribe('geo.scope','events',city.geoShape);
            template.ready.set(handle.ready());
      }
    }

  });

  this.autorun(function(c) {
    const latlngObj = position.getLatlngObject();
    if (latlngObj) {
      Meteor.call('getcitiesbylatlng',latlngObj,function(error, result){
        if(result){
          //console.log('call city');
          Session.set('city', result);
        }
      });
    }
  });

});

Template.listEvents.onRendered(function() {

  const testgeo = () => {
    let geolocate = Session.get('geolocate');
    if(!Session.get('GPSstart') && geolocate && !Location.getReactivePosition()){

      IonPopup.confirm({title:TAPi18n.__('Position'),template:TAPi18n.__('Utiliser la position de votre profil'),
      onOk: function(){
        if(Citoyens.findOne() && Citoyens.findOne().geo && Citoyens.findOne().geo.latitude){
          Location.setMockLocation({
            latitude : Citoyens.findOne().geo.latitude,
            longitude : Citoyens.findOne().geo.longitude,
            updatedAt : new Date()
          });
          //clear cache
          listEventsSubs.clear();
          listOrganizationsSubs.clear();
          listProjectsSubs.clear();
          dashboardSubs.clear();
        }
      },
      onCancel: function(){
        Router.go('changePosition');
      }
    });
  }
}

Meteor.setTimeout(testgeo, '3000');
});


Template.listEvents.helpers({
  events () {
    let inputDate = new Date();
    let sortEvents= pageSession.get('sortEvents');
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    if(sortEvents === "Current"){
      query['startDate']={$lte : inputDate};
      query['endDate']={$gte : inputDate};
    }else if(sortEvents === "Upcoming"){
      query['startDate']={$gte : inputDate};
    }else if(sortEvents === "History"){
      query['endDate']={$lte : inputDate};
    }
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query);
  },
  countEvents () {
    let inputDate = new Date();
    let sortEvents= pageSession.get('sortEvents');
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    if(sortEvents === "Current"){
      query['startDate']={$lte : inputDate};
      query['endDate']={$gte : inputDate};
    }else if(sortEvents === "Upcoming"){
      query['startDate']={$gte : inputDate};
    }else if(sortEvents === "History"){
      query['endDate']={$lte : inputDate};
    }
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsCurrent () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query['startDate']={$lte : inputDate};
    query['endDate']={$gte : inputDate};
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsUpcoming () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query['startDate']={$gte : inputDate};
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsHistory () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query['endDate']={$lte : inputDate};
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  sortEvents (){
    return pageSession.get('sortEvents');
  },
  searchEvents (){
    return pageSession.get('searchEvents');
  },
  city (){
    return Session.get('city');
  },
  dataReady() {
  return Template.instance().ready.get();
  },
  dataReadyAll() {
  return Template.instance().ready.get() && Events.find({}).count() === Counts.get(`countScopeGeo.events`);
  },
  dataReadyPourcentage() {
  return  `${Events.find({}).count()}/${Counts.get('countScopeGeo.events')}`;
  }
});

Template.listEvents.events({
  'click .triEvents':function(event, template){
    event.preventDefault();
    pageSession.set('sortEvents', event.target.value);
    //console.log("sortEvents",  event.target.value);
  },
  'keyup #search, change #search': function(event,template){
    if(event.currentTarget.value.length>2){
      pageSession.set( 'searchEvents', event.currentTarget.value);
    }else{
      pageSession.set( 'searchEvents', null);
    }
  },
});

Template.eventsAdd.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function(c) {
      const handleList = listsSubs.subscribe('lists','eventTypes');
      if(handleList.ready()){
        template.ready.set(handleList.ready());
      }
  });
});

Template.eventsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function(c) {
      const handleList = listsSubs.subscribe('lists','eventTypes');
      const handle = Meteor.subscribe('scopeDetail','events',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });

});

Template.eventsBlockEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function(c) {
      Session.set('scopeId', Router.current().params._id);
      Session.set('block', Router.current().params.block);
  });

  this.autorun(function(c) {
      const handleList = listsSubs.subscribe('lists','eventTypes');
      const handle = Meteor.subscribe('scopeDetail','events',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });

});



Template.eventsAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.eventsEdit.helpers({
  event () {
    let event = Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let eventEdit = {};
    eventEdit._id = event._id._str;
    eventEdit.name = event.name;
    eventEdit.type = event.type;
    eventEdit.shortDescription = event.shortDescription;
    eventEdit.description = event.description;
    eventEdit.startDate = event.startDate;
    eventEdit.endDate = event.endDate;
    if(event && event.preferences){
      eventEdit.preferences = {};
      if(event.preferences.isOpenData == "true"){
        eventEdit.preferences.isOpenData = true;
      }else{
        eventEdit.preferences.isOpenData = false;
      }
      if(event.preferences.isOpenEdition == "true"){
        eventEdit.preferences.isOpenEdition = true;
      }else{
        eventEdit.preferences.isOpenEdition = false;
      }
    }
    eventEdit.allDay = event.allDay;
    eventEdit.country = event.address.addressCountry;
    eventEdit.postalCode = event.address.postalCode;
    eventEdit.city = event.address.codeInsee;
    eventEdit.cityName = event.address.addressLocality;
    if(event && event.address && event.address.streetAddress){
      eventEdit.streetAddress = event.address.streetAddress;
    }
    if(event && event.address && event.address.regionName){
      eventEdit.regionName = event.address.regionName;
    }
    if(event && event.address && event.address.depName){
      eventEdit.depName = event.address.depName;
    }
    eventEdit.geoPosLatitude = event.geo.latitude;
    eventEdit.geoPosLongitude = event.geo.longitude;
    return eventEdit;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.eventsBlockEdit.helpers({
  event () {
    let event = Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let eventEdit = {};
    eventEdit._id = event._id._str;
    if(Router.current().params.block === 'description'){
      eventEdit.description = event.description;
      eventEdit.shortDescription = event.shortDescription;
    }else if(Router.current().params.block === 'info'){
      eventEdit.name = event.name;
      eventEdit.type = event.type;
      if(event.tags){
        eventEdit.tags = event.tags;
      }
    }else if(Router.current().params.block === 'contact'){
      eventEdit.email = event.email;
      eventEdit.url = event.url;
      if(event.telephone){
        if(event.telephone.fixe){
          eventEdit.fixe = event.telephone.fixe.join();
        }
        if(event.telephone.mobile){
          eventEdit.mobile = event.telephone.mobile.join();
        }
        if(event.telephone.fax){
          eventEdit.fax = event.telephone.fax.join();
        }
      }
    }else if(Router.current().params.block === 'when'){
      eventEdit.allDay = event.allDay;
      eventEdit.startDate = event.startDate;
      eventEdit.endDate = event.endDate;
    }else if(Router.current().params.block === 'locality'){
      if(event && event.address){
      eventEdit.country = event.address.addressCountry;
      eventEdit.postalCode = event.address.postalCode;
      eventEdit.city = event.address.codeInsee;
      eventEdit.cityName = event.address.addressLocality;
      if(event && event.address && event.address.streetAddress){
        eventEdit.streetAddress = event.address.streetAddress;
      }
      if(event && event.address && event.address.regionName){
        eventEdit.regionName = event.address.regionName;
      }
      if(event && event.address && event.address.depName){
        eventEdit.depName = event.address.depName;
      }
      eventEdit.geoPosLatitude = event.geo.latitude;
      eventEdit.geoPosLongitude = event.geo.longitude;
    }
  }else if(Router.current().params.block === 'preferences'){
    if(event && event.preferences){
      eventEdit.preferences = {};
      if(event.preferences.isOpenData === true){
        eventEdit.preferences.isOpenData = true;
      }else{
        eventEdit.preferences.isOpenData = false;
      }
      if(event.preferences.isOpenEdition === true){
        eventEdit.preferences.isOpenEdition = true;
      }else{
        eventEdit.preferences.isOpenEdition = false;
      }
    }
  }
    return eventEdit;
  },
  blockSchema() {
    return BlockEventsRest[Router.current().params.block];
  },
  block() {
    return Router.current().params.block;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});



Template.eventsFields.helpers({
  optionsInsee () {
    let postalCode = '';
    let country = '';
    postalCode = pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
    country = pageSession.get('country') || AutoForm.getFieldValue('country');
    if(postalCode && country){
      let insee = Cities.find({'postalCodes.postalCode':postalCode,country:country});
      //console.log(insee.fetch());
      if(insee){
        return insee.map(function (c) {
          return {label: c.alternateName, value: c.insee};
        });
      }
    }else{return false;}
  },
  latlng () {
    let city = pageSession.get('city') || AutoForm.getFieldValue('city');
    let latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
    let longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
    return city && latitude && longitude;
  },
  longitude (){
    return pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
  },
  latitude (){
    return pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
  },
  country (){
    return pageSession.get('country') || AutoForm.getFieldValue('country');
  },
  postalCode (){
    return pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
  },
  city (){
    return pageSession.get('city') || AutoForm.getFieldValue('city');
  },
  cityName (){
    return pageSession.get('cityName') || AutoForm.getFieldValue('cityName');
  },
  regionName (){
    return pageSession.get('regionName') || AutoForm.getFieldValue('regionName');
  },
  depName (){
    return pageSession.get('depName') || AutoForm.getFieldValue('depName');
  }
});


Template.eventsFields.onRendered(function() {
  var self = this;
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  let geolocate = Session.get('geolocate');
  if(geolocate && Router.current().route.getName()!="eventsEdit" && Router.current().route.getName()!="eventsBlockEdit"){
    var onOk=IonPopup.confirm({template:TAPi18n.__('Utiliser votre position actuelle ?'),
    onOk: function(){
      let geo = Location.getReactivePosition();
      if(geo && geo.latitude){
        let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
        Meteor.call('getcitiesbylatlng',latlng,function(error, result){
          if(result){
            //console.log(result);
            pageSession.set('postalCode', result.postalCodes[0].postalCode);
            pageSession.set('country', result.country);
            pageSession.set('city', result.insee);
            pageSession.set('cityName', result.postalCodes[0].name);
            pageSession.set('regionName', result.regionName);
            pageSession.set('depName', result.depName);
            pageSession.set('geoPosLatitude', result.geo.latitude);
            pageSession.set('geoPosLongitude', result.geo.longitude);
          }
        });
      }
    }});
  }

  self.autorun(function() {
    let postalCode = pageSession.get('postalCode')  || AutoForm.getFieldValue('postalCode');
    let country = pageSession.get('country')  || AutoForm.getFieldValue('country');
    let city = pageSession.get('city');
    if (!!postalCode && !!country) {
      if(postalCode.length>4){
        //console.log(`${postalCode} ${country}`);
        //console.log('recompute');
        //console.log('subscribs');
        self.subscribe('cities',postalCode,country);
      }
    }
  });
});


Template.eventsFields.events({
  'keyup input[name="postalCode"],change input[name="postalCode"]':_.throttle((e, tmpl) => {
    e.preventDefault();
    pageSession.set( 'postalCode', tmpl.$(e.currentTarget).val() );
  }, 500)
  ,
  'change select[name="country"]': function(e, tmpl) {
    e.preventDefault();
    //console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'country', tmpl.$(e.currentTarget).val() );
  },
  'change select[name="city"]': function(e, tmpl) {
    e.preventDefault();
    //console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'city', tmpl.$(e.currentTarget).val() );
    let insee = Cities.findOne({insee:tmpl.$(e.currentTarget).val()});
    pageSession.set( 'geoPosLatitude', insee.geo.latitude);
    pageSession.set( 'geoPosLongitude', insee.geo.longitude);
    pageSession.set( 'regionName', insee.regionName);
    pageSession.set( 'depName', insee.depName);
    pageSession.set('cityName', e.currentTarget.options[e.currentTarget.selectedIndex].text);
    //console.log(insee.geo.latitude);
    //console.log(insee.geo.longitude);
  },
  'change input[name="streetAddress"]':_.throttle((event,template) => {
    function addToRequest(request, dataStr){
      if(dataStr == "") return request;
      if(request != "") dataStr = " " + dataStr;
      return transformNominatimUrl(request + dataStr);
    }

    //remplace les espaces par des +
    function transformNominatimUrl(str){
      var res = "";
      for(var i = 0; i<str.length; i++){
        res += (str.charAt(i) == " ") ? "+" : str.charAt(i);
      }
      return res;
    };


    let postalCode = '';
    let country = '';
    let streetAddress = '';
    postalCode = AutoForm.getFieldValue('postalCode');
    country = template.find('select[name="country"]').options[template.find('select[name="country"]').selectedIndex].text;
    //console.log(country);
    streetAddress = AutoForm.getFieldValue('streetAddress');

    var request = "";

    request = addToRequest(request, streetAddress);
    request = addToRequest(request, postalCode);
    request = addToRequest(request, country);
    request = transformNominatimUrl(request);

    if(event.currentTarget.value.length>5){
      HTTP.get( 'https://maps.googleapis.com/maps/api/geocode/json?address=' + request + '&key='+Meteor.settings.public.googlekey, {},
      function( error, response ) {
        if ( error ) {
          //console.log( error );
        } else {
          //console.log(response.data);
          if (response.data.results.length > 0 && response.data.status != "ZERO_RESULTS") {
            pageSession.set( 'geoPosLatitude', response.data.results[0].geometry.location.lat);
            pageSession.set( 'geoPosLongitude', response.data.results[0].geometry.location.lng);
            //console.log(response.data.results[0].geometry.location.lat);
            //console.log(response.data.results[0].geometry.location.lng);
          }
          return;
        }
      }
    );
  }
}, 500)
});

AutoForm.addHooks(['addEvent', 'editEvent'], {
  after: {
    method : function(error, result) {
      if (!error) {
        Router.go('newsList', {_id:result.data.id,scope:'events'});
      }
    },
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('newsList', {_id:result.data.id,scope:'events'});
      }
    }
  },
  onError: function(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === "error_call") {
        pageSession.set( 'error', error.reason.replace(": ", ""));
      }
    }
    //let ref;
    //if (error.errorType && error.errorType === 'Meteor.Error') {
      //if ((ref = error.reason) === 'Name must be unique') {
      //this.addStickyValidationError('name', error.reason);
      //AutoForm.validateField(this.formId, 'name');
      //}
    //}
  }
});

AutoForm.addHooks(['editBlockEvent'], {
  after: {
    "method-update" : function(error, result) {
      if (!error) {
        if(Session.get('block')!=='preferences'){
        Router.go('newsList', {_id:Session.get('scopeId'),scope:'events'});
      }
      }
    }
  },
  before: {
    "method-update" : function(modifier, documentId) {
      let scope = 'events';
      let block = Session.get('block');
      if(modifier && modifier["$set"]){

      }else{
        modifier["$set"] = {};
      }
      modifier["$set"].typeElement = scope;
      modifier["$set"].block = block;
      return modifier;
    }
  },
  onError: function(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === "error_call") {
        pageSession.set( 'error', error.reason.replace(": ", ""));
      }
    }
  }
});
