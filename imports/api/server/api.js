import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { request } from 'meteor/froatsnook:request';

export const callPixelRest = function (token,method,controller,action,post){
  post["X-Auth-Token"] = token;
  let responsePost = HTTP.call( method, 'http://qa.communecter.org/communecter/'+controller+'/'+action, {
    headers:{
      'X-Auth-Token' : token,
      'Origin':"http://meteor.communecter.org"
    },
    params: post,
    npmRequestOptions : {
      jar: true
    }
  });
  if(responsePost && responsePost.data && responsePost.data.result){
    return responsePost;
  }else{
    if(responsePost && responsePost.data && responsePost.data.msg){
      throw new Meteor.Error("error_call",responsePost.data.msg);
    }else{
      throw new Meteor.Error("error_server", "error server");
    }
  }
}


function dataUriToBuffer (uri) {
  if (!/^data\:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }

  // strip newlines
  uri = uri.replace(/\r?\n/g, '');

  // split the URI up into the "metadata" and the "data" portions
  var firstComma = uri.indexOf(',');
  if (-1 === firstComma || firstComma <= 4) throw new TypeError('malformed data: URI');

  // remove the "data:" scheme and parse the metadata
  var meta = uri.substring(5, firstComma).split(';');

  var base64 = false;
  var charset = 'US-ASCII';
  for (var i = 0; i < meta.length; i++) {
    if ('base64' == meta[i]) {
      base64 = true;
    } else if (0 == meta[i].indexOf('charset=')) {
      charset = meta[i].substring(8);
    }
  }

  // get the encoded data portion and decode URI-encoded chars
  var data = unescape(uri.substring(firstComma + 1));

  var encoding = base64 ? 'base64' : 'ascii';
  var buffer = new Buffer(data, encoding);

  // set `.type` property to MIME type
  buffer.type = meta[0] || 'text/plain';

  // set the `.charset` property
  //buffer.charset = charset;

  return buffer;
}

export const callPixelUploadRest = function (token,folder,ownerId,input,dataURI,name){
  let result;
  let fileBuf = dataUriToBuffer(dataURI);
  let formData = {};
  formData['X-Auth-Token'] = token;
  formData[input] = {
    value:  fileBuf,
    options: {
      filename: name,
      contentType: "image/jpeg"
    }
  };

  let responsePost = request.postSync('http://qa.communecter.org/communecter/document/upload/dir/communecter/folder/'+folder+'/ownerId/'+ownerId+'/input/'+input, {
    formData: formData,
    jar: true
  });
  responsePost.data = JSON.parse(responsePost.response.body);
  if(responsePost && responsePost.data && responsePost.data.success==true){
    return responsePost.data;
  }else{
    if(responsePost && responsePost.data && responsePost.data.msg){
      throw new Meteor.Error("error_call",responsePost.data.msg);
    }else{
      throw new Meteor.Error("error_server", "error server");
    }
  }
}

export const authPixelRest = function (email,pwd){
  var response = HTTP.call( 'POST', 'http://qa.communecter.org/communecter/person/authenticate', {
    params: {
      "pwd": pwd,
      "email": email
    },
    npmRequestOptions : {
      jar: true
    }
  });
  return response;
}
