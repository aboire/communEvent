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
import { Projects } from '../../api/projects.js';
import { NotificationHistory } from '../../api/notification_history.js';
import { Cities } from '../../api/cities.js';

//submanager
import { dashboardSubs,listEventsSubs,listOrganizationsSubs,listProjectsSubs,listsSubs } from '../../api/client/subsmanager.js';

import '../map/map.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import { position } from '../../api/client/position.js';
import { searchQuery } from '../../api/helpers.js';

Template.listProjects.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();
  pageSession.set('sortProjects', null);
  pageSession.set('searchProjects', null);

  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  //sub listProjects
  self.autorun(function(c) {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      console.log('sub list projects geo radius');
      let handle = listProjectsSubs.subscribe('geo.scope','projects',latlngObj,radius);
          self.ready.set(handle.ready());
    }else{
      console.log('sub list projects city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        let handle = listProjectsSubs.subscribe('geo.scope','projects',city.geoShape);
            self.ready.set(handle.ready());
      }
    }

  });

  self.autorun(function(c) {
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

Template.listProjects.onRendered(function() {

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


Template.listProjects.helpers({
  projects () {
    let inputDate = new Date();
    let searchProjects= pageSession.get('searchProjects');
    let query={};
    if(searchProjects){
      query = searchQuery(query,searchProjects);
    }
    return Projects.find(query);
  },
  countProjects () {
    let inputDate = new Date();
    let searchProjects= pageSession.get('searchProjects');
    let query={};
    if(searchProjects){
      query = searchQuery(query,searchProjects);
    }
    return Projects.find(query).count();
  },
  searchProjects (){
    return pageSession.get('searchProjects');
  },
  city (){
    return Session.get('city');
  },
  dataReady() {
  return Template.instance().ready.get();
},
dataReadyAll() {
return Template.instance().ready.get() && Projects.find({}).count() === Counts.get(`countScopeGeo.projects`);
},
dataReadyPourcentage() {
return  `${Projects.find({}).count()}/${Counts.get('countScopeGeo.projects')}`;
}
});

Template.listProjects.events({
  'keyup #search, change #search': function(event,template){
    if(event.currentTarget.value.length>2){
      pageSession.set( 'searchProjects', event.currentTarget.value);
    }else{
      pageSession.set( 'searchProjects', null);
    }
  },
});

/*
Meteor.call('searchGlobalautocomplete',{name:'test',searchType:['projects']})
*/
Template.projectsAdd.onCreated(function () {
  pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.projectsEdit.onCreated(function () {
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
      const handle = Meteor.subscribe('scopeDetail','projects',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });
});

Template.projectsAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  }
});

Template.projectsEdit.helpers({
  project () {
    let project = Projects.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let projectEdit = {};
    projectEdit._id = project._id._str;
    projectEdit.name = project.name;
    projectEdit.url = project.url;
    projectEdit.startDate = project.startDate;
    projectEdit.endDate = project.endDate;
    if(project && project.preferences){
      projectEdit.preferences = {};
      if(project.preferences.isOpenData == "true"){
        projectEdit.preferences.isOpenData = true;
      }else{
        projectEdit.preferences.isOpenData = false;
      }
      if(project.preferences.isOpenEdition == "true"){
        projectEdit.preferences.isOpenEdition = true;
      }else{
        projectEdit.preferences.isOpenEdition = false;
      }
    }
    projectEdit.tags = project.tags;
    projectEdit.description = project.description;
    projectEdit.shortDescription = project.shortDescription;
    projectEdit.country = project.address.addressCountry;
    projectEdit.postalCode = project.address.postalCode;
    projectEdit.city = project.address.codeInsee;
    projectEdit.cityName = project.address.addressLocality;
    if(project && project.address && project.address.streetAddress){
      projectEdit.streetAddress = project.address.streetAddress;
    }
    if(project && project.address && project.address.regionName){
      projectEdit.regionName = project.address.regionName;
    }
    if(project && project.address && project.address.depName){
      projectEdit.depName = project.address.depName;
    }
    projectEdit.geoPosLatitude = project.geo.latitude;
    projectEdit.geoPosLongitude = project.geo.longitude;
    return projectEdit;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});



Template.projectsFields.helpers({
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


Template.projectsFields.onRendered(function() {
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
  if(geolocate && Router.current().route.getName()!="projectsEdit"){
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


Template.projectsFields.events({
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

AutoForm.addHooks(['addProject', 'editProject'], {
  after: {
    method : function(error, result) {
      if (!error) {
        Router.go('newsList', {_id:result.data.id,scope:'projects'});
      }
    },
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('newsList', {_id:result.data.id,scope:'projects'});
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
      //if (error.reason === 'Something went really bad  An project with the same name allready exists') {
      //this.addStickyValidationError('name', error.reason.replace(":", " "));
      //this.addStickyValidationError('name', error.errorType , error.reason)
      //AutoForm.validateField(this.formId, 'name');
      //}
    //}
  }
});

AutoForm.addHooks(['addProject'], {
  before: {
    method : function(doc, template) {
      return doc;
    }
  }
});
