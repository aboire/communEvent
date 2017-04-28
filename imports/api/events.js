import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Events = new Meteor.Collection("events", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,geoSchema,Countries_SELECT,Countries_SELECT_LABEL } from './schema.js'

//collection
import { Lists } from './lists.js'

//SimpleSchema.debug = true;

export const SchemasEventsRest = new SimpleSchema([baseSchema,geoSchema, {
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'eventTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    allDay : {
      type : Boolean,
      defaultValue:false
    },
    startDate : {
      type : Date
    },
    endDate : {
      type : Date
    }
  }]);


//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js';
  import { Documents } from './documents.js';
  import { queryLink,queryLinkType,arrayLinkType,queryOptions } from './helpers.js';

  Events.helpers({
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
      return this.links && this.links.attendees && this.links.attendees[Meteor.userId()] && this.links.attendees[Meteor.userId()].isAdmin;
    },
    scopeVar () {
      return 'events';
    },
    scopeEdit () {
      return 'eventsEdit';
    },
    listScope () {
      return 'listEvents';
    },
    isAttendees (){
          return this.links && this.links.attendees && this.links.attendees[Meteor.userId()];
    },
    listAttendees (search){
      if(this.links && this.links.attendees){
        const query = queryLink(this.links.attendees,search);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countAttendees () {
      return this.links && this.links.attendees && _.size(this.links.attendees);
    },
    countPopMap () {
      return this.links && this.links.attendees && _.size(this.links.attendees);
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    news () {
      return News.find({'target.id':Router.current().params._id},{sort: {"created": -1},limit: Session.get('limit') });
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });

//}
