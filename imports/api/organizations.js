import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Organizations = new Meteor.Collection("organizations", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,geoSchema,roles_SELECT,roles_SELECT_LABEL } from './schema.js'

//collection
import { Lists } from './lists.js'

//SimpleSchema.debug = true;

export const SchemasOrganizationsRest = new SimpleSchema([baseSchema,geoSchema,{
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'organisationTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    role: {
      type : String,
      allowedValues: roles_SELECT,
      autoform: {
        type: "select",
        options: roles_SELECT_LABEL,
      },
      denyUpdate: true
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
      optional: true
    }
  }]);

//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js';
  import { Documents } from './documents.js';
  import { Events } from './events.js';
  import { Projects } from './projects.js';
  import { queryLink,queryLinkType,arrayLinkType,queryOptions } from './helpers.js';

  Organizations.helpers({
    isVisibleFields (field){
      /*if(this.isMe()){
        return true;
      }else{
        if(this.isPublicFields(field)){
          return true;
        }else{
          if(this.isFollowersMe() && this.isPrivateFields(field)){
            return true;
          }else{
            return false;
          }
        }
      }*/
      return true;
    },
    isPublicFields (field){
       return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
    },
    isPrivateFields (field){
      return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
    },
    documents (){
    return Documents.find({
      id : this._id._str,
      contentKey : "profil"
    },{sort: {"created": -1},limit: 1 });
    },
    creatorProfile () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    },
    isAdmin () {
      return this.links && this.links.members && this.links.members[Meteor.userId()] && this.links.members[Meteor.userId()].isAdmin;
    },
    scopeVar () {
      return 'organizations';
    },
    scopeEdit () {
      return 'organizationsEdit';
    },
    listScope () {
      return 'listOrganizations';
    },
    isFollows (followId){
      return this.links && this.links.follows && this.links.follows[followId];
    },
    isFollowsMe (){
      return this.links && this.links.follows && this.links.follows[Meteor.userId()];
    },
    listFollows (search){
      if(this.links && this.links.follows){
        const query = queryLink(this.links.follows,search);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countFollows () {
      return this.links && this.links.follows && _.size(this.links.follows);
    },
    isFollowers (followId){
      return this.links && this.links.followers && this.links.followers[followId];
    },
    isFollowersMe (){
      return this.links && this.links.followers && this.links.followers[Meteor.userId()];
    },
    listFollowers (search){
      if(this.links && this.links.followers){
         const query = queryLink(this.links.followers,search);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countFollowers () {
      return this.links && this.links.followers && _.size(this.links.followers);
    },
    isMembers (){
          return this.links && this.links.members && this.links.members[Meteor.userId()];
    },
    listEvents (search){
      if(this.links && this.links.events){
         const query = queryLink(this.links.events,search);
          return Events.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countEvents () {
      return this.links && this.links.events && _.size(this.links.events);
    },
    listProjects (search){
      if(this.links && this.links.projects){
         const query = queryLink(this.links.projects,search);
          return Projects.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countProjects () {
      return this.links && this.links.projects && _.size(this.links.projects);
    },
    listMembers (search){
      if(this.links && this.links.members){
        const query = queryLinkType(this.links.members,search,'citoyens');
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countMembers () {
      if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'citoyens');
      return members && _.size(members);
    }
    },
    listMembersOrganizations (search){
      if(this.links && this.links.members){
        const query = queryLinkType(this.links.members,search,'organizations');
          return Organizations.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countMembersOrganizations () {
      if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'organizations');
      return members && _.size(members);
    }
    },
    countPopMap () {
      return this.links && this.links.members && _.size(this.links.members);
    },
    news () {
      return News.find({'target.id':Router.current().params._id},{sort: {"created": -1},limit: Session.get('limit') });
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });

//}