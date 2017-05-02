import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { Helpers } from 'meteor/raix:handlebar-helpers';

import { Location } from 'meteor/djabatav:geolocation-plus';
import { geolib } from 'meteor/outatime:geolib';
import { TAPi18n } from 'meteor/tap:i18n';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';
import { DeepLink } from 'meteor/communecter:deep-link';

//collections
import { ActivityStream } from '../../api/activitystream.js';
import { Documents } from '../../api/documents.js';

//schemas
import { SchemasEventsRest,BlockEventsRest } from '../../api/events.js';
import { SchemasOrganizationsRest,BlockOrganizationsRest } from '../../api/organizations.js';
import { SchemasProjectsRest,BlockProjectsRest } from '../../api/projects.js';
import { SchemasFollowRest,SchemasInviteAttendeesEventRest } from '../../api/citoyens.js';
import { SchemasNewsRest } from '../../api/news.js';
import { SchemasCommentsRest,SchemasCommentsEditRest } from '../../api/comments.js';
import { SchemasCitoyensRest,BlockCitoyensRest } from '../../api/citoyens.js';


Meteor.startup(function () {

  window.HTML.isConstructedObject = function(x) {
  return _.isObject(x) && !$.isPlainObject(x)
};
if (Meteor.isCordova && !Meteor.isDesktop) {

  DeepLink.once('INTENT', function(intent){
    console.log('INTENT');
    console.log(intent);
    if (intent.split('#').length === 2) {
      console.log('SPLIT');
      let urlArray = intent.split('#')[1].split('.');
      if (urlArray && urlArray.length === 4) {
        const type = urlArray[0];
        const detail = urlArray[1];
        const _id = urlArray[3];
        const scope = (type === 'person') ? 'citoyens' : `${type}s`;
        if(detail === 'detail'){
        if(scope === 'events' || scope === 'organizations' || scope === 'projects' || scope === 'citoyens'){
          Router.go("newsList",{scope:scope,_id:_id});
        }
      }
      }
    }
   });

  DeepLink.once('communecter', function(data, url, scheme, path, querystring){
    console.log('communecter');
    console.log(url);
    console.log(scheme);
    console.log(path);
    console.log(querystring);
    /*
    communecter://
    communecter://login
    communecter://signin
    communecter://sign-out
    communecter://events
    communecter://organizations
    communecter://projects
    communecter://citoyens
    communecter://citoyens/:_id/edit
    communecter://organizations/add
    communecter://organizations/:_id/edit
    communecter://projects/add
    communecter://projects/:_id/edit
    communecter://events/add
    communecter://events/:_id/edit
    communecter://events/sous/:_id
    communecter://map/:scope/
    communecter://map/:scope/:_id
    communecter://:scope/news/:_id
    communecter://:scope/directory/:_id
    communecter://:scope/news/:_id/new/:newsId
    communecter://:scope/news/:_id/add
    communecter://:scope/news/:_id/edit/:newsId
    communecter://:scope/news/:_id/new/:newsId/comment
    communecter://:scope/news/:_id/edit/:newsId/comments/:commentId/edit
    communecter://organizations/members/:_id
    communecter://projects/contributors/:_id
    communecter://events/attendees/:_id
    communecter://citoyens/follows/:_id
    communecter://settings
    communecter://contact
    communecter://citie
    communecter://notifications
    communecter://search
    */
    Router.go(`/${path}`);
   });

DeepLink.on('https', (data, url, scheme, path) => {
console.log('HTTPS');
console.log(url);
console.log(scheme);
console.log(path);
});

}


  if (Meteor.isCordova) {
    window.alert = navigator.notification.alert;
    window.confirm = navigator.notification.confirm;
  }

let language = window.navigator.userLanguage || window.navigator.language;
if (language.indexOf('-') !== -1)
language = language.split('-')[0];

if (language.indexOf('_') !== -1)
language = language.split('_')[0];

////console.log(language);
//alert('language: ' + language + '\n');

Helpers.setLanguage(language);

TAPi18n.setLanguage(language)
.done(function () {
  //Session.set("showLoadingIndicator", false);
})
.fail(function (error_message) {
  //console.log(error_message);
});

SchemasEventsRest.i18n("schemas.eventsrest");
SchemasOrganizationsRest.i18n("schemas.organizationsrest");
SchemasProjectsRest.i18n("schemas.projectsrest");
SchemasFollowRest.i18n("schemas.followrest");
SchemasInviteAttendeesEventRest.i18n("schemas.followrest");
SchemasNewsRest.i18n("schemas.news");
SchemasCommentsRest.i18n("schemas.comments");
SchemasCommentsEditRest.i18n("schemas.comments");
SchemasCitoyensRest.i18n("schemas.citoyens");
BlockCitoyensRest.info.i18n("schemas.global");
BlockCitoyensRest.contact.i18n("schemas.global");
BlockCitoyensRest.description.i18n("schemas.global");
BlockCitoyensRest.locality.i18n("schemas.global");
BlockCitoyensRest.preferences.i18n("schemas.global");
BlockEventsRest.info.i18n("schemas.global");
BlockEventsRest.contact.i18n("schemas.global");
BlockEventsRest.description.i18n("schemas.global");
BlockEventsRest.when.i18n("schemas.global");
BlockEventsRest.locality.i18n("schemas.global");
BlockEventsRest.preferences.i18n("schemas.global");
BlockOrganizationsRest.info.i18n("schemas.global");
BlockOrganizationsRest.contact.i18n("schemas.global");
BlockOrganizationsRest.description.i18n("schemas.global");
BlockOrganizationsRest.locality.i18n("schemas.global");
BlockOrganizationsRest.preferences.i18n("schemas.global");
BlockProjectsRest.info.i18n("schemas.global");
BlockProjectsRest.contact.i18n("schemas.global");
BlockProjectsRest.description.i18n("schemas.global");
BlockProjectsRest.when.i18n("schemas.global");
BlockProjectsRest.locality.i18n("schemas.global");
BlockProjectsRest.preferences.i18n("schemas.global");

Template.registerHelper('equals',
  function(v1, v2) {
    return (v1 === v2);
  }
);

Template.registerHelper('langChoix',
function() {
  return Helpers.language();
}
);

Template.registerHelper('diffInText',
function(start, end) {
  let a = moment(start);
  let b = moment(end);
  let diffInMs = b.diff(a); // 86400000 milliseconds
  let diffInDays = b.diff(a, 'days'); // 1 day
  let diffInDayText=moment.duration(diffInMs).humanize();
  return diffInDayText;
}
);

Template.registerHelper('isCordova',
function() {
  return Meteor.isCordova;
}
);

Template.registerHelper('notificationsCount',
function() {
  return ActivityStream.find({}).count();
}
);

Template.registerHelper('imageDoc',
function(id) {
  if(id){
    //console.log(id);
    return Documents.findOne({	id : id,doctype :'image'},{sort: {"created": -1}});
  }else{
    return this && this._id && this._id._str && Documents.findOne({	id : this._id._str,doctype :'image'},{sort: {"created": -1}});
  }
}
);


Template.registerHelper("currentFieldValue", function (fieldName) {
  return AutoForm.getFieldValue(fieldName) || false;
});

Template.registerHelper("urlImageCommunecter", function () {
  return Meteor.settings.public.urlimage;
});

Template.registerHelper("urlImageDesktop", function () {
  console.log(Meteor.settings.public.remoteUrl);
  return Meteor.isDesktop ? Meteor.settings.public.remoteUrl : '';
});

Template.registerHelper("SchemasFollowRest", SchemasFollowRest);
Template.registerHelper("SchemasInviteAttendeesEventRest", SchemasInviteAttendeesEventRest);
Template.registerHelper("SchemasNewsRest", SchemasNewsRest);
Template.registerHelper("SchemasEventsRest", SchemasEventsRest);
Template.registerHelper("SchemasOrganizationsRest", SchemasOrganizationsRest);
Template.registerHelper("SchemasProjectsRest", SchemasProjectsRest);
Template.registerHelper("SchemasCommentsRest", SchemasCommentsRest);
Template.registerHelper("SchemasCommentsEditRest", SchemasCommentsEditRest);
Template.registerHelper("SchemasCitoyensRest", SchemasCitoyensRest);

});
