import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';
//import { MeteoricCamera } from 'meteor/meteoric:camera';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { AutoForm } from 'meteor/aldeed:autoform';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import '../qrcode/qrcode.js'

//submanager
import { newsListSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { News } from '../../api/news.js';

import { nameToCollection } from '../../api/helpers.js';

import './news.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

let pageSession = new ReactiveDict('pageNews');

Session.setDefault('limit', 5);

Template.newsList.onCreated(function(){
  self = this;
  this.ready = new ReactiveVar();
  this.readyScopeDetail = new ReactiveVar();

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });


this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    this.readyScopeDetail.set(handle.ready());
}.bind(this));

  this.autorun(function() {
    if (!!Session.get('limit')) {
      const handle = newsListSubs.subscribe('newsList', Router.current().params.scope, Router.current().params._id,Session.get('limit'));
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.newsList.onRendered(function(){
  self = this;
  const showMoreVisible = () => {
    let threshold, target = $("#showMoreResults");
    if (!target.length) return;
    threshold = $('.content.overflow-scroll').scrollTop() + $('.content.overflow-scroll').height();
    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("visible", true);
        Session.set("limit",
        Session.get('limit') + 5);
      }
    } else {
      if (target.data("visible")) {
        target.data("visible", false);
      }
    }
  }

  $('.content.overflow-scroll').scroll(showMoreVisible);

});

Template.newsList.helpers({
  scope () {
    if(Router.current().params.scope){
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    }
  },
  scopeCardTemplate () {
    return  'listCard'+Router.current().params.scope;
  },
  isLimit (countNews) {
    return  countNews > Session.get('limit');
  },
  countNews () {
    //console.log(Router.current().params._id)
    return Counts.get(`countNews.${Router.current().params._id}`);
  },
  countsousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  issousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`) > 0;
  },
  isVote () {
    return  this.type == "vote";
  },
  dataReady() {
  return Template.instance().ready.get();
  },
  dataReadyScopeDetail() {
  return Template.instance().readyScopeDetail.get();
  }
});

Template.listCard.helpers({
  countsousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  issousEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`) > 0;
  }
});

Template.actionSheet.events({
  "click .action-card-citoyen" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Citoyens'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit contact')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'contact'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'description'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('citoyensBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
  "click .action-card-events" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Events'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit contact')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit dates')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'contact'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'description'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'when'});
        }
        if (index === 5) {
          console.log('Edit!');
          Router.go('eventsBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
  "click .action-card-organizations" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Organizations'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit contact')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'contact'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'description'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('organizationsBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
  "click .action-card-projects" (e, t) {
    const self=this;
    e.preventDefault();
    //info,description,contact
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Projects'),
      buttons: [
        { text: `${TAPi18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit contact')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit dates')} <i class="icon ion-edit"></i>` },
        { text: `${TAPi18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: TAPi18n.__('cancel'),
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'info'});
        }
        if (index === 1) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'contact'});
        }
        if (index === 2) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'description'});
        }
        if (index === 3) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'locality'});
        }
        if (index === 4) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'when'});
        }
        if (index === 5) {
          console.log('Edit!');
          Router.go('projectsBlockEdit', {_id:Router.current().params._id,block:'preferences'});
        }
        return true;
      }
    });
  },
});

Template.newsList.events({
  "click .saveattendees-link" (evt) {
    evt.preventDefault();
    let scopeId=Session.get('scopeId');
    Meteor.call('saveattendeesEvent',scopeId);
    return ;
  },
  "click .inviteattendees-link" (evt) {
    evt.preventDefault();
    let scopeId=Session.get('scopeId');
    Meteor.call('inviteattendeesEvent',scopeId);
    return ;
  },
  "click .connectscope-link" (evt) {
    evt.preventDefault();
    const scopeId=Session.get('scopeId');
    const scope=Session.get('scope');
    Meteor.call('connectEntity',scopeId,scope);
    return ;
  },
  "click .disconnectscope-link" (evt) {
    evt.preventDefault();
    const scopeId=Session.get('scopeId');
    const scope=Session.get('scope');
    Meteor.call('disconnectEntity',scopeId,scope);
    return ;
  },
  "click .followperson-link" (evt) {
    evt.preventDefault();
    const scopeId=Session.get('scopeId');
    const scope=Session.get('scope');
    Meteor.call('followEntity',scopeId,scope);
  return ;
},
"click .unfollowperson-link" (evt) {
  evt.preventDefault();
  const scopeId=Session.get('scopeId');
  const scope=Session.get('scope');
  Meteor.call('disconnectEntity',scopeId,scope);
return ;
},
  'click .scanner-event' : function(event, template){
    event.preventDefault();
    if(Meteor.isCordova){
      const scopeId=Session.get('scopeId');
      const scope=Session.get('scope');
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if(result.cancelled==false && result.text && result.format=='QR_CODE'){
            let qr = {};
            if (result.text.split('#').length === 2) {
              let urlArray = result.text.split('#')[1].split('.');
              if (urlArray && urlArray.length === 4) {
                qr.type = urlArray[0];
                qr._id = urlArray[3];
              }
            } else {
              qr=JSON.parse(result.text);
            }
            if(qr && qr.type && qr._id){
              if(qr.type === 'person'){
                if(scope === 'events'){
                Meteor.call('saveattendeesEvent', scopeId, undefined, qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              } else if(scope === 'organizations'){
                Meteor.call('connectEntity',scopeId,'organizations',qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              } else if(scope === 'projects'){
                Meteor.call('connectEntity',scopeId,'projects',qr._id, function (error, result) {
                  if (!error) {
                    window.alert("Connexion à l'entité réussie");
                  }else{
                    window.alert(error.reason);
                    console.log('error',error);
                  }
                });
              }
            }
            }
          }else{
            return ;
          }
        },
        function (error) {
          alert("Scanning failed: " + error);
          return ;
        }
      );
    }
    return ;
  },
  "click .give-me-more" (evt) {
    let newLimit = Session.get('limit') + 10;
    Session.set('limit', newLimit);
  },
  "click .photo-link-new" (event, template) {
    var self = this;
    let scopeId=Session.get('scopeId');
    let scope=Session.get('scope');
    let options = {
      width: 640,
      height: 480,
      quality: 75
    };

function successCallback (retour){
  const newsId = retour;
  IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous ajouter une autre photo à cette news ?'),
  onOk: function(){
    MeteorCameraUI.getPicture(options,function (error, data) {
      if (! error) {
        let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        Meteor.call("photoNews",data,str,scope,self._id._str,newsId, function (error, result) {
          if (!error) {
            successCallback(result.newsId);
          }else{
            //console.log('error',error);
          }
        });
      }});
    },
    onCancel: function(){
      Router.go('newsList', {_id:self._id._str,scope:scope});
    }
  });
}

    MeteorCameraUI.getPicture(options,function (error, data) {
      if (! error) {
        let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        Meteor.call("photoNews",data,str,scope,self._id._str, function (error, result) {
          if (!error) {
            successCallback(result.newsId);
          }else{
            //console.log('error',error);
          }
        });
      }});

    },
    "click .photo-link-scope" (event, template) {
      event.preventDefault();
      const self = this;
      const scopeId = Session.get('scopeId');
      const scope = Session.get('scope');
      const options = {
        width: 640,
        height: 480,
        quality: 75
      };
      MeteorCameraUI.getPicture(options,function (error, data) {
        if (! error) {
          let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
          let dataURI = data;
          Meteor.call("photoScope",scope,data,str,self._id._str, function (error, result) {
            if (!error) {

            }else{
              //console.log('error',error);
            }
          });
        }});

      }
    });

    Template.newsAdd.onCreated(function () {
      this.autorun(function() {
        Session.set('scopeId', Router.current().params._id);
        Session.set('scope', Router.current().params.scope);
      });

      pageSession.set( 'error', false );
    });

    Template.newsAdd.onRendered(function () {
      pageSession.set( 'error', false );
    });

    Template.newsAdd.helpers({
      error () {
        return pageSession.get( 'error' );
      }
    });

    Template.newsEdit.onCreated(function () {
      const self = this;
      self.ready = new ReactiveVar();
      pageSession.set( 'error', false );

      self.autorun(function(c) {
          Session.set('scopeId', Router.current().params._id);
          Session.set('scope', Router.current().params.scope);
      });

      self.autorun(function(c) {
          const handle = Meteor.subscribe('scopeDetail',Router.current().params.scope,Router.current().params._id);
          const handleScopeDetail = Meteor.subscribe('newsDetail', Router.current().params.newsId);
          if(handle.ready() && handleScopeDetail.ready()){
            self.ready.set(handle.ready());
          }
      });

    });

    Template.newsEdit.onRendered(function () {
      pageSession.set( 'error', false );
    });

    Template.newsEdit.helpers({
      new () {
        return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
      },
      error () {
        return pageSession.get( 'error' );
      },
      dataReady() {
      return Template.instance().ready.get();
      }
    });

    AutoForm.addHooks(['addNew', 'editNew'], {
      after: {
        method : function(error, result) {
          if (!error) {
            var self = this;
            let selfresult=result.data.id["$id"];
            let scopeId=Session.get('scopeId');
            let scope=Session.get('scope');

            let options = {
              width: 640,
              height: 480,
              quality: 75
            };

            function successCallback (retour){
              const newsId = retour;
              IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous ajouter une autre photo à cette news ?'),
              onOk: function(){
                MeteorCameraUI.getPicture(options,function (error, data) {
                  if (! error) {
                    let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
                    Meteor.call("photoNews",data,str,scope,scopeId,newsId, function (error, result) {
                      if (!error) {
                        successCallback(result.newsId);
                      }else{
                        //console.log('error',error);
                      }
                    });
                  }});
                },
                onCancel: function(){
                  Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
                }
              });
            }

            IonPopup.confirm({title:TAPi18n.__('Photo'),template:TAPi18n.__('Voulez vous prendre une photo ?'),
            onOk: function(){
              MeteorCameraUI.getPicture(options,function (error, data) {
                if (! error) {
                  let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
                  Meteor.call("photoNews",data,str,scope,scopeId,selfresult, function (error, photoret) {
                    if (!error) {
                      successCallback(photoret.newsId);
                    }else{
                      //console.log('error',error);
                    }
                  });
                }});
              },
              onCancel: function(){

              }
            });

            //Meteor.call('pushNewNewsAttendees',scopeId,selfresult);
            Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});

          }
        },
        "method-update" : function(error, result) {
          if (!error) {
            Router.go('newsList', {_id: Session.get('scopeId'),scope:Session.get('scope')});
          }
        }
      },
      before: {
        method : function(doc, template) {
          //console.log(doc);
          let scope = Session.get('scope');
          let scopeId = Session.get('scopeId');
          doc.parentType = scope;
          doc.parentId = scopeId;
          return doc;
        },
        "method-update" : function(modifier, documentId) {
          let scope = Session.get('scope');
          let scopeId = Session.get('scopeId');
          modifier["$set"].parentType = scope;
          modifier["$set"].parentId = scopeId;
          return modifier;
        }
      },
      onError: function(formType, error) {
        if (error.errorType && error.errorType === 'Meteor.Error') {
          if (error && error.error === "error_call") {
            pageSession.set( 'error', error.reason.replace(":", " "));
          }
        }
        //let ref;
        //if (error.errorType && error.errorType === 'Meteor.Error') {
        //if ((ref = error.reason) === 'Name must be unique') {
        //this.addStickyValidationError('name', error.reason);
        //AutoForm.validateField(this.formId, 'name');
        //}
        //}
      }
    });

    Template._inviteattendeesEvent.onCreated(function () {
      pageSession.set( 'error', false );
      pageSession.set( 'invitedUserEmail', false);
    });

    Template._inviteattendeesEvent.onRendered(function () {
      pageSession.set( 'error', false );
      pageSession.set( 'invitedUserEmail', false);
    });

    Template._inviteattendeesEvent.helpers({
      error () {
        return pageSession.get( 'error' );
      }
    });

    AutoForm.addHooks(['inviteAttendeesEvent'], {
      before: {
        method : function(doc, template) {
          let scopeId = Session.get('scopeId');
          doc.eventId = scopeId;
          pageSession.set( 'invitedUserEmail', doc.invitedUserEmail);
          return doc;
        }
      },
      after: {
        method : function(error, result) {
          if (!error) {
            IonModal.close();
          }
        }
      },
      onError: function(formType, error) {
        //console.log(error);
        if (error.errorType && error.errorType === 'Meteor.Error') {
          if (error && error.error === "error_call") {
            if( error.reason == "Problème à l'insertion du nouvel utilisateur : une personne avec cet mail existe déjà sur la plateforme"){
              Meteor.call('saveattendeesEvent',Session.get('scopeId'),pageSession.get( 'invitedUserEmail'),function(error,result){
                if(error){
                  pageSession.set( 'error', error.reason.replace(":", " "));
                }else{
                  IonModal.close();
                }
              });
            }
          }else{
            pageSession.set( 'error', error.reason.replace(":", " "));
          }
        }
      }
    });
