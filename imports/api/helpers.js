import { Meteor } from 'meteor/meteor';

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
