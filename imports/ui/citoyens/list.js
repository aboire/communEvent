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
import { NotificationHistory } from '../../api/notification_history.js';
import { Cities } from '../../api/cities.js';

//submanager
import { dashboardSubs,listEventsSubs,listOrganizationsSubs,listProjectsSubs,listCitoyensSubs,listsSubs } from '../../api/client/subsmanager.js';

import '../map/map.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';


Template.listCitoyens.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();
  pageSession.set('sortCitoyens', null);
  pageSession.set('searchCitoyens', null);

  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  //sub listCitoyens
  self.autorun(function(c) {
    let geo = Location.getReactivePosition();
    let radius = Session.get('radius');
    console.log(radius);
    if(radius && geo && geo.latitude){
      console.log('sub list citoyens geo radius');
      let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
      let handle = listCitoyensSubs.subscribe('geo.scope','citoyens',latlng,radius);
          self.ready.set(handle.ready());
    }else{
      console.log('sub list citoyens city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        let handle = listCitoyensSubs.subscribe('geo.scope','citoyens',city.geoShape);
            self.ready.set(handle.ready());
      }
    }

  });

  self.autorun(function(c) {
    let geo = Location.getReactivePosition();
    if(geo && geo.latitude){
      let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
      Meteor.call('getcitiesbylatlng',latlng,function(error, result){
        if(result){
          //console.log('call city');
          Session.set('city', result);
        }
      });
    }
  });

});

Template.listCitoyens.onRendered(function() {

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
          listCitoyensSubs.clear();
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


Template.listCitoyens.helpers({
  citoyens () {
    let inputDate = new Date();
    let searchCitoyens= pageSession.get('searchCitoyens');
    let query={};
    if(searchCitoyens){
      if ( searchCitoyens.charAt( 0 ) == '#' ) {
        query['name']={$regex : searchCitoyens, '$options' : 'i'}
      }else{
        query['name']={$regex : searchCitoyens, '$options' : 'i'}
      }
    }
      query['_id']={$ne: new Mongo.ObjectID(Meteor.userId())};
    return Citoyens.find(query);
  },
  countCitoyens () {
    let inputDate = new Date();
    let searchCitoyens= pageSession.get('searchCitoyens');
    let query={};
    if(searchCitoyens){
      query['name']={$regex : searchCitoyens, '$options' : 'i'}
    }
    query['_id']={$ne: new Mongo.ObjectID(Meteor.userId())};
    return Citoyens.find(query).count();
  },
  searchCitoyens (){
    return pageSession.get('searchCitoyens');
  },
  notificationsCountOld (){
    let notificationsCountOld = pageSession.get('notificationsCount');
    pageSession.set('notificationsCount',null);
    let notificationsCount = NotificationHistory.find({}).count();
    if(notificationsCountOld<notificationsCount){
      pageSession.set('notificationsCount',notificationsCount);
      return true;
    }else{
      return false;
    }
  },
  notificationsCount () {
    return NotificationHistory.find({}).count()
  },
  city (){
    return Session.get('city');
  },
  dataReady() {
  return Template.instance().ready.get();
},
dataReadyAll() {
return Template.instance().ready.get() && Citoyens.find({_id: {$ne: new Mongo.ObjectID(Meteor.userId())}}).count() === Counts.get(`countScopeGeo.citoyens`);
},
dataReadyPourcentage() {
return  `${Citoyens.find({_id: {$ne: new Mongo.ObjectID(Meteor.userId())}}).count()}/${Counts.get('countScopeGeo.citoyens')}`;
}
});

Template.listCitoyens.events({
  'keyup #search, change #search': function(event,template){
    if(event.currentTarget.value.length>2){
      pageSession.set( 'searchCitoyens', event.currentTarget.value);
    }else{
      pageSession.set( 'searchCitoyens', null);
    }
  },
});

/*
Meteor.call('searchGlobalautocomplete',{name:'test',searchType:['citoyens']})
*/
Template.citoyensAdd.onCreated(function () {
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
      const handleList = listsSubs.subscribe('lists');
      if(handleList.ready()){
        template.ready.set(handleList.ready());
      }
  });
});

Template.citoyensEdit.onCreated(function () {
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
      const handleList = listsSubs.subscribe('lists');
      const handle = Meteor.subscribe('scopeDetail','citoyens',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });
});

Template.citoyensAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.citoyensEdit.helpers({
  citoyen () {
    let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let citoyenEdit = {};
    citoyenEdit._id = citoyen._id._str;
    citoyenEdit.name = citoyen.name;
    citoyenEdit.type = citoyen.type;
    citoyenEdit.email = citoyen.email;
    citoyenEdit.url = citoyen.url;
    citoyenEdit.role = citoyen.role;
    citoyenEdit.tags = citoyen.tags;
    citoyenEdit.description = citoyen.description;
    citoyenEdit.shortDescription = citoyen.shortDescription;
    if(citoyen && citoyen.preferences){
      citoyenEdit.preferences = {};
      if(citoyen.preferences.isOpenData == "true"){
        citoyenEdit.preferences.isOpenData = true;
      }else{
        citoyenEdit.preferences.isOpenData = false;
      }
      if(citoyen.preferences.isOpenEdition == "true"){
        citoyenEdit.preferences.isOpenEdition = true;
      }else{
        citoyenEdit.preferences.isOpenEdition = false;
      }
    }
    citoyenEdit.country = citoyen.address.addressCountry;
    citoyenEdit.postalCode = citoyen.address.postalCode;
    citoyenEdit.city = citoyen.address.codeInsee;
    citoyenEdit.cityName = citoyen.address.addressLocality;
    if(citoyen && citoyen.address && citoyen.address.streetAddress){
      citoyenEdit.streetAddress = citoyen.address.streetAddress;
    }
    if(citoyen && citoyen.address && citoyen.address.regionName){
      citoyenEdit.regionName = citoyen.address.regionName;
    }
    if(citoyen && citoyen.address && citoyen.address.depName){
      citoyenEdit.depName = citoyen.address.depName;
    }
    citoyenEdit.geoPosLatitude = citoyen.geo.latitude;
    citoyenEdit.geoPosLongitude = citoyen.geo.longitude;
    return citoyenEdit;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});



Template.citoyensFields.helpers({
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


Template.citoyensFields.onRendered(function() {
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
  if(geolocate && Router.current().route.getName()!="citoyensEdit"){
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


Template.citoyensFields.events({
  'keyup input[name="postalCode"],change input[name="postalCode"]': function(e, tmpl) {
    e.preventDefault();
    pageSession.set( 'postalCode', tmpl.$(e.currentTarget).val() );
  },
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
  'change input[name="streetAddress"]': function(event,template){

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
}
});

AutoForm.addHooks(['addCitoyen', 'editCitoyen'], {
  after: {
    method : function(error, result) {
      if (!error) {
        Router.go('newsList', {_id:result.data.id,scope:'citoyens'});
      }
    },
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('newsList', {_id:result.data.id,scope:'citoyens'});
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
      //if (error.reason === 'Something went really bad  An citoyen with the same name allready exists') {
      //this.addStickyValidationError('name', error.reason.replace(":", " "));
      //this.addStickyValidationError('name', error.errorType , error.reason)
      //AutoForm.validateField(this.formId, 'name');
      //}
    //}
  }
});

AutoForm.addHooks(['addCitoyen'], {
  before: {
    method : function(doc, template) {
      return doc;
    }
  }
});
