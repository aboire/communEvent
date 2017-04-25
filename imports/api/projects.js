import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Projects = new Meteor.Collection("projects", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,geoSchema } from './schema.js'

//collection
import { Lists } from './lists.js'

//SimpleSchema.debug = true;

export const SchemasProjectsRest = new SimpleSchema([baseSchema,geoSchema,{
    startDate : {
      type : Date,
      optional:true
    },
    endDate : {
      type : Date,
      optional:true
    }
  }]);

//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js';

  Projects.helpers({
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
    isContributors (){
          return this.links && this.links.contributors && this.links.contributors[Meteor.userId()];
    },
    listContributors (){
      if(this.links && this.links.contributors){
        let contributors = _.map(this.links.contributors, function(contributors,key){
           return new Mongo.ObjectID(key);
         });
          return Citoyens.find({_id:{$in:contributors}},{sort: {"name": 1} });
      } else{
        return false;
      }
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    countContributors () {
      return this.links && this.links.contributors && _.size(this.links.contributors);
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
