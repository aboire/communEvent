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

  Events.helpers({
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
    listAttendees (){
      if(this.links && this.links.attendees){
        let attendees = _.map(this.links.attendees, function(attendees,key){
           return new Mongo.ObjectID(key);
         });
          return Citoyens.find({_id:{$in:attendees}},{sort: {"name": 1} });
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
