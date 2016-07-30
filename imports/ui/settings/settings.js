import './settings.html';

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Push } from 'meteor/raix:push';

//submanager
import { listEventsSubs } from '../../api/client/subsmanager.js';

Template.settings.events({
  "change #radius": function(e, t) {
    let value = parseInt(t.find('#radius').value);
    Session.set('radius',  value);
    Meteor._localStorage.setItem('radius', value);
    //clear cache
    listEventsSubs.clear();
    return;
  },
  'click #clear': function(event) {
    Meteor.call('clear');
    return;
  },
  'click #geolocate': function(e, t) {
    if(t.find('#geolocate').checked){
      Session.set('geolocate', true);
      Meteor._localStorage.setItem('geolocate', 'true');
      //clear cache
      listEventsSubs.clear();
    }else{
      Session.set('geolocate',  false);
      Meteor._localStorage.setItem('geolocate', false);
    }
    return;
  },
  'click #pushenabled': function(e, t) {
    let state=Push.enabled();
    if(state===false){
      Push.enabled(true);
    }else{
      Push.enabled(false);
    }
    return;
  }
});

Template.settings.helpers({
  isSelected: function (radius,select) {
    return Session.equals("radius", parseInt(select));
  },
  radius: function (select) {
    return Session.get("radius");
  },
  geolocate:function() {
    return Session.get("geolocate");
  },
  pushEnabled:function() {
    let state=Push.enabled();
  return state !== false;
}
});
