import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { AutoForm } from 'meteor/aldeed:autoform';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';

//submanager
import { directoryListSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Lists } from '../../api/lists.js';

import { nameToCollection } from '../../api/helpers.js';

import './directory.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

import { pageDirectory } from '../../api/client/reactive.js';

//suivant le scope

Template.directory.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();
  pageDirectory.set('search', null);
  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = directoryListSubs.subscribe('directoryList', Router.current().params.scope, Router.current().params._id);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.directory.onRendered(function(){
  self = this;

});

Template.directory.helpers({
  scope () {
    if(Router.current().params.scope){
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    }
  },
  scopeDirectoryTemplate () {
    return  'listDirectory'+Router.current().params.scope;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  search (){
    return pageDirectory.get('search');
  }
});

Template.listDirectorycitoyens.onCreated(function(){
  pageDirectory.set('search', null);
  pageDirectory.set('view', 'all');
  pageDirectory.set('selectorga', null);
});


Template.listDirectorycitoyens.helpers({
  search (){
    return pageDirectory.get('search');
  },
  view (){
    return pageDirectory.get('view');
  }
});

Template.listDirectorycitoyens.events({
  "click .all" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','all');
  },
  "click .follows" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','follows');
  },
  "click .memberof" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','memberof');
  },
  "click .events" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','events');
  },
  "click .projects" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','projects');
  },
  "click .followers" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','followers');
  },
});

Template.listDirectoryorganizations.onCreated(function(){
  pageDirectory.set('search', null);
  pageDirectory.set('view', 'all');
  pageDirectory.set('selectorga', null);
});


Template.listDirectoryorganizations.helpers({
  search (){
    return pageDirectory.get('search');
  },
  view (){
    return pageDirectory.get('view');
  }
});

Template.listDirectoryorganizations.events({
  "click .all" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','all');
  },
  "click .members" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','members');
  },
  "click .membersorganizations" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','membersorganizations');
  },
  "click .events" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','events');
  },
  "click .projects" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','projects');
  },
  "click .followers" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','followers');
  },
});

Template.listDirectoryprojects.onCreated(function(){
  pageDirectory.set('search', null);
  pageDirectory.set('view', 'all');
});


Template.listDirectoryprojects.helpers({
  search (){
    return pageDirectory.get('search');
  },
  view (){
    return pageDirectory.get('view');
  }
});

Template.listDirectoryprojects.events({
  "click .all" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','all');
  },
  "click .contributors" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','contributors');
  },
  "click .events" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','events');
  },
  "click .followers" (evt) {
    evt.preventDefault();
    pageDirectory.set('view','followers');
  },
});

Template.listDirectoryFollows.helpers({
  search (){
    return pageDirectory.get('search');
  }
});

Template.listDirectoryMemberOf.helpers({
  search (){
    return pageDirectory.get('search');
  },
  selectorga (){
    return pageDirectory.get('selectorga');
  },
  listOrganisationTypes (){
      const listSelect = Lists.findOne({name:'organisationTypes'});
      if(listSelect && listSelect.list){
      return _.map(listSelect.list, (value,key) => {
        return {label: value, value: key};
      });
    }
  }
});

Template.listDirectoryMembers.helpers({
  search (){
    return pageDirectory.get('search');
  }
});

Template.listDirectoryMembersOrganizations.helpers({
  search (){
    return pageDirectory.get('search');
  },
  selectorga (){
    return pageDirectory.get('selectorga');
  },
  listOrganisationTypes (){
      const listSelect = Lists.findOne({name:'organisationTypes'});
      if(listSelect && listSelect.list){
      return _.map(listSelect.list, (value,key) => {
        return {label: value, value: key};
      });
    }
  }
});

Template.listDirectoryContributors.helpers({
  search (){
    return pageDirectory.get('search');
  }
});

Template.listDirectoryProjects.helpers({
  search (){
    return pageDirectory.get('search');
  }
});

Template.listDirectoryEvents.helpers({
  search (){
    return pageDirectory.get('search');
  }
});

Template.listDirectoryFollowers.helpers({
  search (){
    return pageDirectory.get('search');
  }
});


Template.listDirectorycitoyens.events({
  'keyup #search, change #search':_.throttle((event,template) => {
    if(event.currentTarget.value.length>0){
      console.log(event.currentTarget.value);
      pageDirectory.set( 'search', event.currentTarget.value);
    }else{
      pageDirectory.set( 'search', null);
    }
  }, 500)
});

Template.listDirectoryorganizations.events({
  'keyup #search, change #search':_.throttle((event,template) => {
    if(event.currentTarget.value.length>0){
      console.log(event.currentTarget.value);
      pageDirectory.set( 'search', event.currentTarget.value);
    }else{
      pageDirectory.set( 'search', null);
    }
  }, 500)
});

Template.listDirectoryprojects.events({
  'keyup #search, change #search':_.throttle((event,template) => {
    if(event.currentTarget.value.length>0){
      console.log(event.currentTarget.value);
      pageDirectory.set( 'search', event.currentTarget.value);
    }else{
      pageDirectory.set( 'search', null);
    }
  }, 500)
});

Template.listDirectoryFollows.events({
  "click .unfollowperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'citoyens');
    return ;
  },
  "click .followperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('followEntity',this._id._str,'citoyens');
    return ;
  }
});

Template.listDirectoryFollowers.events({
  "click .unfollowperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'citoyens');
    return ;
  },
  "click .followperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('followEntity',this._id._str,'citoyens');
    return ;
  }
});

Template.listDirectoryContributors.events({
  "click .unfollowperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'citoyens');
    return ;
  },
  "click .followperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('followEntity',this._id._str,'citoyens');
    return ;
  }
});

Template.listDirectoryMemberOf.events({
  "click .disconnectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'organizations');
    return ;
  },
  "click .connectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('connectEntity',this._id._str,'organizations');
    return ;
  },
  "click .selectorga" (evt) {
    evt.preventDefault();
    pageDirectory.set( 'selectorga', evt.currentTarget.id);
    return ;
  },

});

Template.listDirectoryMembers.events({
  "click .unfollowperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'citoyens');
    return ;
  },
  "click .followperson-link" (evt) {
    evt.preventDefault();
    Meteor.call('followEntity',this._id._str,'citoyens');
    return ;
  }
});

Template.listDirectoryMembersOrganizations.events({
  "click .disconnectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'organizations');
    return ;
  },
  "click .connectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('connectEntity',this._id._str,'organizations');
    return ;
  }
});

Template.listDirectoryProjects.events({
  "click .disconnectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'projects');
    return ;
  },
  "click .connectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('connectEntity',this._id._str,'projects');
    return ;
  }
});

Template.listDirectoryEvents.events({
  "click .disconnectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity',this._id._str,'events');
    return ;
  },
  "click .connectscope-link" (evt) {
    evt.preventDefault();
    Meteor.call('connectEntity',this._id._str,'events');
    return ;
  }
});
