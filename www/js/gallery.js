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


$(document).ready(function () {
  if (getForgeToken() != '') {
  	jQuery.ajax({
    url: '/dm/rootjson',
    success: function (data) {
  	 var LatestVersion = data.body.data[0].relationships.storage.meta.link.href;	
  	 console.log('LatestVersion:')
  	 console.log(LatestVersion)
  	 getCategories(LatestVersion)
    }
  });
  	}else{
  		console.log('token invalid')
  	}

function getCategories(LatestVersion) {
  jQuery.getJSON({
    url: LatestVersion,
    method: "GET",
    'dataType': "json",
    headers: {
      'Authorization': 'Bearer ' + getForgeToken()
    },
    success: function (data) {
    	console.log('data:')
		console.log(data.Categories)
		appendCategories(data.Categories)
    }
  });
}

function appendCategories(Categories) {
	var template = '';
	for (var i = 0; i < Categories.length; i++) {
		template += '<div class="col-sm-6 col-md-4">'+
				        '<div class="thumbnail">'+
				            '<img src="'+Categories[i].Thumbnail+'" alt="Engine">'+
				          '<div class="caption">'+
				            '<h3>'+Categories[i].Name+'</h3>'+
				            '<p>'+Categories[i].Description+'</p>'+
				          '</div>'+
				        '</div>'+
				    '</div>';
	}
	$('.categories_list').html(template)
}
});