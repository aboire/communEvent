import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Projects = new Meteor.Collection("projects", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,blockBaseSchema,geoSchema,avancements_SELECT,avancements_SELECT_LABEL,preferences } from './schema.js'

//collection
import { Lists } from './lists.js'

//SimpleSchema.debug = true;

export const SchemasProjectsRest = new SimpleSchema([baseSchema,geoSchema,{
  avancement : {
    type : String
  },
    startDate : {
      type : Date,
      optional:true
    },
    endDate : {
      type : Date,
      optional:true
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
      optional: true
    },
    fixe : {
      type : String,
      optional: true
    },
    mobile : {
      type : String,
      optional: true
    },
    fax : {
      type : String,
      optional: true
    }
  }]);

  export const BlockProjectsRest = {};
  BlockProjectsRest.description = new SimpleSchema([blockBaseSchema,baseSchema.pick(['shortDescription','description'])]);
  BlockProjectsRest.info = new SimpleSchema([blockBaseSchema,baseSchema.pick(['name','tags','tags.$']),SchemasProjectsRest.pick(['avancement'])]);
  BlockProjectsRest.contact = new SimpleSchema([blockBaseSchema,baseSchema.pick(['url']),SchemasProjectsRest.pick(['email','fixe','mobile','fax'])]);
  BlockProjectsRest.when = new SimpleSchema([blockBaseSchema,SchemasProjectsRest.pick(['startDate','endDate'])]);
  BlockProjectsRest.locality = new SimpleSchema([blockBaseSchema,geoSchema]);
  BlockProjectsRest.preferences = new SimpleSchema([blockBaseSchema,{
    preferences : {
      type: preferences,
      optional:true
    }
  }]);

//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js';
  import { Documents } from './documents.js';
  import { Events } from './events.js';
  import { queryLink,queryLinkType,arrayLinkType,queryOptions } from './helpers.js';

  Projects.helpers({
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
      return this.links && this.links.contributors && this.links.contributors[Meteor.userId()] && this.links.contributors[Meteor.userId()].isAdmin;
    },
    scopeVar () {
      return 'projects';
    },
    scopeEdit () {
      return 'projectsEdit';
    },
    listScope () {
      return 'listProjects';
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
    countFollows (search) {
      //return this.links && this.links.follows && _.size(this.links.follows);
      return this.listFollows(search).count();
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
    countFollowers (search) {
      //return this.links && this.links.followers && _.size(this.links.followers);
      return this.listFollowers(search).count();
    },
    isContributors (){
          return this.links && this.links.contributors && this.links.contributors[Meteor.userId()];
    },
    listContributors (search){
      if(this.links && this.links.contributors){
        const query = queryLink(this.links.contributors,search);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    countContributors (search) {
      //return this.links && this.links.contributors && _.size(this.links.contributors);
      return this.listContributors(search).count();
    },
    listEvents (search){
      if(this.links && this.links.events){
        const query = queryLink(this.links.events,search);
          return Events.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countEvents (search) {
      //return this.links && this.links.events && _.size(this.links.events);
      return this.listEvents(search).count();
    },
    countPopMap () {
      return this.links && this.links.contributors && _.size(this.links.contributors);
    },
    news () {
      return News.find({'target.id':Router.current().params._id},{sort: {"created": -1},limit: Session.get('limit') });
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });

//}
