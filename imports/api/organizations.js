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

  Organizations.helpers({
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
    isMembers (){
          return this.links && this.links.members && this.links.members[Meteor.userId()];
    },
    listMembers (){
      if(this.links && this.links.members){
        let members = _.map(this.links.members, function(members,key){
           return new Mongo.ObjectID(key);
         });
          return Citoyens.find({_id:{$in:members}},{sort: {"name": 1} });
      } else{
        return false;
      }
    },
    countMembers () {
      return this.links && this.links.members && _.size(this.links.members);
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
