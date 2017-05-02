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
githubAccount : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
telegramAccount : {
  type : String,
  optional: true
},
skypeAccount : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
gpplusAccount : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
twitterAccount : {
  type : String,
  regEx: SimpleSchema.RegEx.Url,
  optional: true
},
facebookAccount : {
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
BlockCitoyensRest.description = new SimpleSchema([blockBaseSchema,baseSchema.pick(['shortDescription','description'])]);
BlockCitoyensRest.info = new SimpleSchema([blockBaseSchema,baseSchema.pick(['name','tags','tags.$']),updateSchemaCitoyens.pick(['githubAccount','telegramAccount','skypeAccount','gpplusAccount','twitterAccount','facebookAccount']),{
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
BlockCitoyensRest.contact = new SimpleSchema([blockBaseSchema,baseSchema.pick(['url']),updateSchemaCitoyens.pick(['email','fixe','mobile','fax','birthDate'])]);
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
      listMemberOf (search,selectorga){
        if(this.links && this.links.memberOf){
            const query = queryLink(this.links.memberOf,search,selectorga);
            return Organizations.find(query,queryOptions);
        } else{
          return false;
        }
      },
      countMemberOf (search,selectorga) {
        return this.listMemberOf(search,selectorga).count();
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
        return this.listProjects(search).count();
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
