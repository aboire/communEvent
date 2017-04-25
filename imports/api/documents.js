import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

export const Documents = new Meteor.Collection("documents", {idGeneration : 'MONGO'});


Documents.attachSchema(
  new SimpleSchema({
    id : {
      type : String
    },
    type : {
      type : String,
      allowedValues: ['events','projects','citoyens','organizations']
    },
    folder : {
      type : String
    },
    objId : {
      type : String,
      optional : true
    },
    moduleId : {
      type : String,
      defaultValue : 'communevent'
    },
    doctype : {
      type : String,
      allowedValues: ['image']
    },
    name : {
      type : String
    },
    size : {
      type : Number,
      optional : true
    },
    contentKey : {
      type : String,
      optional : true
    },
    category : {
      type : String,
      optional : true
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
    },
    author : {
      type: String,
      autoValue: function() {
        if (this.isInsert) {
          return Meteor.userId();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: Meteor.userId()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    }
}));
