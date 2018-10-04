/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

// token handling in session
var token = require('./token');
var config = require('./config');
var request = require("request");
// web framework
var express = require('express');
var router = express.Router();
var moment = require('moment');

// forge
var forgeSDK = require('forge-apis');

var hubId = config.ids.hub_id;
var projectId = config.ids.project_id;
var rootFolderId = config.ids.root_folder_id;
var rootjsonId = config.ids.root_json_id;

router.get('/dm/getInitValues', function (req, res) {
  var tokenSession = new token(req.session);
  if (!tokenSession.isAuthorized()) {
    res.status(401).end('Please login first');
    return;
  }  
  var items = new forgeSDK.ItemsApi();
  var folders = new forgeSDK.FoldersApi();
  var versions = items.getItemVersions(projectId, rootjsonId, {}, tokenSession.getInternalOAuth(), tokenSession.getInternalCredentials())
  var foldercontents = folders.getFolderContents(projectId, rootFolderId, {}, tokenSession.getInternalOAuth(), tokenSession.getInternalCredentials())
  Promise.all([versions, foldercontents]).then(function(values) {
    res.json(values);
  });
});

router.get('/dm/getCategoryList', function (req, res) {
  var tokenSession = new token(req.session);
  if (!tokenSession.isAuthorized()) {
    res.status(401).end('Please login first');
    return;
  }  
  var folderid = req.query.folderid;
  var folders = new forgeSDK.FoldersApi();
  var foldercontents = folders.getFolderContents(projectId, folderid, {}, tokenSession.getInternalOAuth(), tokenSession.getInternalCredentials())
  foldercontents.then(function(data){
    var folderdata = data.body.data;
    var jsonId = getFolderjsonId(folderdata);
    var items = new forgeSDK.ItemsApi();
    items.getItemVersions(projectId, jsonId, {}, tokenSession.getInternalOAuth(), tokenSession.getInternalCredentials())
    .then(function(versions){
      var LatestVersion = versions.body.data[0].relationships.storage.meta.link.href;
      var payload = [data,LatestVersion]
      res.json(payload);
    })
  })
});

router.get('/thumbnails', function (req, res) {    
  var href = decodeURIComponent(req.query.id);
  var params = href.split('/');

  request({
    url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/'+params[0]+'/thumbnail',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + params[1]
    },
    encoding: null,
    responseType: 'buffer',
    },
    function(error, response, body) {
      res.contentType('image/png')
      res.end(body)
    });
  

});

function getFolderjsonId(items){
  for (var i = 0; i < items.length; i++) {
    var displayName = items[i].attributes.displayName;
    if (displayName.includes('json')) return items[i].id;

  }
}


module.exports = router;