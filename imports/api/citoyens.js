import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';

//Person
export const Citoyens = new Meteor.Collection("citoyens", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,blockBaseSchema,geoSchema,PostalAddress,GeoCoordinates,GeoPosition,linksCitoyens,preferences_SELECT } from './schema.js'

const baseSchemaCitoyens = baseSchema.pick(['name','shortDescription','description','url','tags','tags.$']);

const updateSchemaCitoyens = new SimpleSchema({
username : {
  type : String,
  custom: function () {
      if (Meteor.isClient && this.isSet) {
        Meteor.call('checkUsername', this.value, function (error, result) {
          console.log(result);
          if (!result) {
            updateSchemaCitoyens.namedContext("editBlockCitoyen").addInvalidKeys([{name: "username", type: "notUnique"}]);
          }
        });
      }
    }
},
email : {
  type : String,
  unique: true
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
},
birthDate : {
  type : Date,
  optional: true
},
github : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
telegram : {
  type : String,
  optional: true
},
skype : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
gpplus : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
twitter : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
facebook : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
}
});


export const SchemasCitoyensRest = new SimpleSchema([baseSchemaCitoyens,updateSchemaCitoyens,geoSchema,{
  preferences : {
    type: Object,
    optional:true
  },
  'preferences.isOpenData' : {
    type : Boolean
  }
}]);

export const BlockCitoyensRest = {};
BlockCitoyensRest.descriptions = new SimpleSchema([blockBaseSchema,baseSchema.pick(['shortDescription','description'])]);
BlockCitoyensRest.info = new SimpleSchema([blockBaseSchema,baseSchema.pick(['name','tags','tags.$','url']),updateSchemaCitoyens.pick(['email','fixe','mobile','fax','birthDate']),{
  username : {
    type : String,
    custom: function () {
        if (Meteor.isClient && this.isSet) {
          Meteor.call('checkUsername', this.value, function (error, result) {
            console.log(result);
            if (!result) {
              BlockCitoyensRest.info.namedContext("editBlockCitoyen").addInvalidKeys([{name: "username", type: "usernameNotUnique"}]);
            }
          });
        }
      }
  }
}]);
BlockCitoyensRest.network = new SimpleSchema([blockBaseSchema,updateSchemaCitoyens.pick(['github','telegram','skype','gpplus','twitter','facebook'])]);
BlockCitoyensRest.locality = new SimpleSchema([blockBaseSchema,geoSchema]);
BlockCitoyensRest.preferences = new SimpleSchema([blockBaseSchema,{
  preferences : {
    type: Object,
    optional:true
  },
  'preferences.email' : {
    type : String,
    allowedValues: preferences_SELECT,
    optional:true
  },
  'preferences.locality' : {
    type : String,
    allowedValues: preferences_SELECT,
    optional:true
  },
  'preferences.phone' : {
    type : String,
    allowedValues: preferences_SELECT,
    optional:true
  },
  'preferences.directory' : {
    type : String,
    allowedValues: preferences_SELECT,
    optional:true
  },
  'preferences.birthDate' : {
    type : String,
    allowedValues: preferences_SELECT,
    optional:true
  },
  'preferences.isOpenData' : {
    type : Boolean,
    optional:true
  }
}]);

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

  //if(Meteor.isClient){
  import { News } from './news.js';
  import { Events } from './events.js';
  import { Projects } from './projects.js';
  import { Organizations } from './organizations.js';
  import { Documents } from './documents.js';
  import { ActivityStream } from './activitystream.js';
  import { queryLink,queryOptions } from './helpers.js';

    Citoyens.helpers({
      isVisibleFields (field){
        if(this.isMe()){
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
        }
      },
      isPublicFields (field){
         return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
      },
      isPrivateFields (field){
        return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
      },
      formatBirthDate(){
        return moment(this.birthDate).format('DD/MM/YYYY');
      },
      documents (){
      return Documents.find({
        id : this._id._str,
        contentKey : "profil"
      },{sort: {"created": -1},limit: 1 });
      },
      isMe (){
        return this._id._str === Meteor.userId();
      },
      isFollows (followId){
        return (this.links && this.links.follows && this.links.follows[followId]) ? true : false;
      },
      isFollowsMe (){
        return (this.links && this.links.follows && this.links.follows[Meteor.userId()]) ? true : false;
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
        return this.listFollows(search) && this.listFollows(search).count();
      },
      isFollowers (followId){
        return (this.links && this.links.followers && this.links.followers[followId]) ? true : false;
      },
      isFollowersMe (){
        return (this.links && this.links.followers && this.links.followers[Meteor.userId()]) ? true : false;
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
        return this.listFollowers(search) && this.listFollowers(search).count();
      },
      listMemberOf (search,selectorga){
        if(this.links && this.links.memberOf){
            const query = queryLink(this.links.memberOf,search,selectorga);
            return Organizations.find(query,queryOptions);
        } else{
          return false;
        }
      },
      countMemberOf (search,selectorga) {
        return this.listMemberOf(search,selectorga) && this.listMemberOf(search,selectorga).count();
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
        return this.listEvents(search) && this.listEvents(search).count();
      },
      listProjects (search){
        if(this.links && this.links.projects){
           const query = queryLink(this.links.projects,search);
            return Projects.find(query,queryOptions);
        } else{
          return false;
        }
      },
      countProjects (search) {
        //return this.links && this.links.projects && _.size(this.links.projects);
        return this.listProjects(search) && this.listProjects(search).count();
      },
      listProjectsCreator (){
        let query = {};
        //query['creator'] = this._id._str;
        query[`links.contributors.${this._id._str}.isAdmin`] = true;
        return Projects.find(query,queryOptions);
      },
      countProjectsCreator () {
        return this.listProjectsCreator() && this.listProjectsCreator().count();
      },
      listEventsCreator (){
        let query = {};
        query['organizerId'] = this._id._str;
        //query[`links.organizer.${this._id._str}`] = {$exist:1};
        return Events.find(query,queryOptions);
      },
      countEventsCreator () {
        //return this.links && this.links.events && _.size(this.links.events);
        return this.listEventsCreator() && this.listEventsCreator().count();
      },
      listOrganizationsCreator (){
        let query = {};
        //query['creator'] = this._id._str;
        query[`links.members.${this._id._str}.isAdmin`] = true;
        return Organizations.find(query,queryOptions);
      },
      countOrganizationsCreator () {
        return this.listOrganizationsCreator() && this.listOrganizationsCreator().count();
      },
      listNotifications (){
      return ActivityStream.api.isUnread(this._id._str);
      },
      listNotificationsAsk (){
      return ActivityStream.api.isUnreadAsk(this._id._str);
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
      newsJournal (target,userId,limit) {
        const query = {};
        const options = {};
        options['sort'] = {"created": -1};
        query['$or'] = [];
        let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
        let targetId = (typeof target !== 'undefined') ? target : Router.current().params._id;
        if(Meteor.isClient){
          let bothLimit = Session.get('limit');
        }else{
          if(typeof limit !== 'undefined'){
            options['limit'] = limit;
          }
        }
        let scopeTypeArray = ['public','restricted'];
        if(bothUserId === targetId){
          //scopeTypeArray.push('private');
          query['$or'].push({'author':targetId, targetIsAuthor:{$exists:false},type:'news'});
          query['$or'].push({'target.id':targetId});
          //query['$or'].push({'mentions.id':targetId,'scope.type':{$in:scopeTypeArray}});
        }else{
          query['$or'].push({'author':targetId, targetIsAuthor:{$exists:false},type:'news','scope.type':{$in:scopeTypeArray}});
          query['$or'].push({'target.id':targetId,'scope.type':{$in:scopeTypeArray}});
          //query['$or'].push({'mentions.id':targetId,'scope.type':{$in:scopeTypeArray}});
        }
        if(bothUserId){
          query['$or'].push({'author':bothUserId,'target.id':targetId});
        }
        return News.find(query,options);
      },
      newsActus (userId,limit) {
        const query = {};
        const options = {};
        options['sort'] = {"created": -1};
        query['$or'] = [];
        let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
        if(Meteor.isClient){
          let bothLimit = Session.get('limit');
        }else{
          if(typeof limit !== 'undefined'){
            options['limit'] = limit;
          }
        }

          let projectsArray,eventsArray,memberOfArray = [];
          //projects
          if(this.links && this.links.projects){
          projectsArray = _.map(this.links.projects, (a,k) => k);
          }
          //events
          if(this.links && this.links.events){
          eventsArray = _.map(this.links.events, (a,k) => k);
          }
          //memberOf
          if(this.links && this.links.memberOf){
          memberOfArray = _.map(this.links.memberOf, (a,k) => k);
          }

          const arrayIds = _.union(projectsArray,eventsArray,memberOfArray);
          arrayIds.push(bothUserId);
          query['$or'].push({'author': bothUserId});
          query['$or'].push({'target.id': {$in:arrayIds}});
          query['$or'].push({'mentions.id': {$in:arrayIds}});
          query['$or'].push({'sharedBy': bothUserId});

          //follows
          if(this.links && this.links.follows){
          const followsArray = _.map(this.links.follows, (a,k) => k);
          query['$or'].push({'target.id': {$in:followsArray},'scope.type':{$in:['public','restricted']}});
          }
        return News.find(query,options);
      },
      new () {
        return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
      }
    });

  //}
