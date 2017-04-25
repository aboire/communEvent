import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

//Person
export const Citoyens = new Meteor.Collection("citoyens", {idGeneration : 'MONGO'});

//schemas
import { PostalAddress,GeoCoordinates,GeoPosition,linksCitoyens } from './schema.js'

//Social
const socialNetwork = new SimpleSchema({
  facebook: {
    type : String,
    optional: true
  },
  twitter: {
    type : String,
    optional: true
  },
  github: {
    type : String,
    optional: true
  },
  skype: {
    type : String,
    optional: true
  }
});

//Preferences
const preferencesCitoyen = new SimpleSchema({
  bgClass: {
    type : String,
    optional: true
  },
  bgUrl: {
    type : String,
    optional: true
  }
});

//Roles
const rolesCitoyen = new SimpleSchema({
  tobeactivated: {
    type : Boolean,
    defaultValue:true
  },
  betaTester: {
    type : Boolean,
    defaultValue:false
  },
  standalonePageAccess: {
    type : Boolean,
    defaultValue: true
  },
  superAdmin: {
    type : Boolean,
    defaultValue: false
  }
});

//type : person / follow
//invitedUserName
//invitedUserEmail
export const SchemasFollowRest = new SimpleSchema({
  invitedUserName : {
    type : String
  },
  invitedUserEmail : {
    type : String,
    regEx: SimpleSchema.RegEx.Email
  }
});

export const SchemasInviteAttendeesEventRest = new SimpleSchema({
  invitedUserName : {
    type : String
  },
  invitedUserEmail : {
    type : String,
    regEx: SimpleSchema.RegEx.Email
  },
  eventId : {
    type: String
  },
});


Citoyens.attachSchema(
  new SimpleSchema({
    name : {
      type : String
    },
    username : {
      type : String
      //unique: true
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
      unique: true
    },
    pwd : {
      type : String
    },
    birthDate: {
      type: Date,
      optional: true
    },
    address : {
      type : PostalAddress
    },
    geo : {
      type : GeoCoordinates
    },
    geoPosition : {
      type : GeoPosition
    },
    socialNetwork : {
      type : socialNetwork,
      optional: true
    },
    shortDescription : {
      type : String,
      optional: true
    },
    telephone: {
      type : String,
      optional: true
    },
    preferences : {
      type : preferencesCitoyen,
      optional: true
    },
    roles : {
      type : rolesCitoyen
    },
    links : {
      type : linksCitoyens,
      optional:true
    },
    profilImageUrl : {
      type : String,
      optional:true
    },
    profilThumbImageUrl : {
      type : String,
      optional:true
    },
    profilMarkerImageUrl : {
      type : String,
      optional:true
    },
    created: {
      type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: new Date()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    }
  }));

  //if(Meteor.isClient){
  import { News } from './news.js';
  import { Events } from './events.js';
  import { Projects } from './projects.js';
  import { Organizations } from './organizations.js';

    Citoyens.helpers({
      isMe (){
        return this._id._str === Meteor.userId();
      },
      isFollows (followId){
        return this.links && this.links.follows && this.links.follows[followId];
      },
      isFollowsMe (){
        return this.links && this.links.follows && this.links.follows[Meteor.userId()];
      },
      listFollows (){
        if(this.links && this.links.follows){
          let follows = _.map(this.links.follows, function(follows,key){
             return new Mongo.ObjectID(key);
           });
            return Citoyens.find({_id:{$in:follows}},{sort: {"name": 1} });
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
      listFollowers (){
        if(this.links && this.links.followers){
          let followers = _.map(this.links.followers, function(followers,key){
             return new Mongo.ObjectID(key);
           });
            return Citoyens.find({_id:{$in:followers}},{sort: {"name": 1} });
        } else{
          return false;
        }
      },
      countFollowers () {
        return this.links && this.links.followers && _.size(this.links.followers);
      },
      listMemberOf (){
        if(this.links && this.links.memberOf){
          let memberOf = _.map(this.links.memberOf, function(memberOf,key){
             return new Mongo.ObjectID(key);
           });
            return Organizations.find({_id:{$in:memberOf}},{sort: {"name": 1} });
        } else{
          return false;
        }
      },
      countMemberOf () {
        return this.links && this.links.memberOf && _.size(this.links.memberOf);
      },
      listEvents (){
        if(this.links && this.links.events){
          let events = _.map(this.links.events, function(events,key){
             return new Mongo.ObjectID(key);
           });
            return Events.find({_id:{$in:events}},{sort: {"name": 1} });
        } else{
          return false;
        }
      },
      countEvents () {
        return this.links && this.links.events && _.size(this.links.events);
      },
      listProjects (){
        if(this.links && this.links.projects){
          let projects = _.map(this.links.projects, function(projects,key){
             return new Mongo.ObjectID(key);
           });
            return Projects.find({_id:{$in:projects}},{sort: {"name": 1} });
        } else{
          return false;
        }
      },
      countProjects () {
        return this.links && this.links.projects && _.size(this.links.projects);
      },
      scopeVar () {
        return 'citoyens';
      },
      scopeEdit () {
        return 'citoyensEdit';
      },
      listScope () {
        return 'listCitoyens';
      },
      news () {
        return News.find({'target.id':Router.current().params._id},{sort: {"created": -1},limit: Session.get('limit') });
      },
      new () {
        return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
      }
    });

  //}
