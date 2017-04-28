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

//collections
import { ActivityStream } from '../../api/activitystream.js';
import { Documents } from '../../api/documents.js';

//schemas
import { SchemasEventsRest } from '../../api/events.js';
import { SchemasOrganizationsRest } from '../../api/organizations.js';
import { SchemasProjectsRest } from '../../api/projects.js';
import { SchemasFollowRest,SchemasInviteAttendeesEventRest } from '../../api/citoyens.js';
import { SchemasNewsRest } from '../../api/news.js';
import { SchemasCommentsRest,SchemasCommentsEditRest } from '../../api/comments.js';

Meteor.startup(function () {

  window.HTML.isConstructedObject = function(x) {
  return _.isObject(x) && !$.isPlainObject(x)
};

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

});
