import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const nameToCollection = (name) => {
  if(Meteor.isClient){
    // Client
  return  window[capitalize(name)];
  }else{
    // Server
  return  global[capitalize(name)];
  }

};

export const encodeString = (str) => {
  return encodeURIComponent(str).replace(/\*/g, "%2A");
};

export const queryLink = (array,search,selectorga) => {
  let arrayIds = _.map(array, function(array,key){
     return new Mongo.ObjectID(key);
   });
  let query={};
  query['_id']={$in:arrayIds};
  if(Meteor.isClient){
  if(search){
    query = searchQuery(query,search);
  }
  if(selectorga){
    query = selectorgaQuery(query,selectorga);
  }
}
return query;
};

export const arrayLinkType = (array,type) => {
   let arrayIds = _.filter(_.map(array, function(array,key) {
     if(array.type === type){
     return new Mongo.ObjectID(key);
     }
   }), function(array){
      return array!==undefined;
    });
return arrayIds;
};

export const queryLinkType = (array,search,type,selectorga) => {
  let arrayIds = arrayLinkType(array,type);
  let query={};
  query['_id']={$in:arrayIds};
  if(Meteor.isClient){
  if(search){
    query = searchQuery(query,search);
  }
  if(selectorga){
    query = selectorgaQuery(query,selectorga);
  }
}
return query;
};

const queryOptions = {sort: {"name": 1}, fields: {
  '_id': 1,
  'name': 1,
  'links': 1,
  'tags': 1
}};

export const searchQuery = (query,search) => {
if ( search.charAt( 0 ) == '#' && search.length > 1) {
  query['tags']={$regex : search.substr(1), '$options' : 'i'}
}else{
  query['name']={$regex : search, '$options' : 'i'}
}
return query;
};

export const selectorgaQuery = (query,selectorga) => {
if (selectorga) {
  query['type']=selectorga;
}
return query;
};
