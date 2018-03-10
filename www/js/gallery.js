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
	
	  var currentToken = getForgeToken();
	  var categoryDetails = {};
  if (currentToken != '') {
  	$('.loader').show();
  	jQuery.ajax({
	    url: '/dm/getInitValues',
	    success: function (data) {
	  	 var LatestVersion = data[0].body.data[0].relationships.storage.meta.link.href;	
	  	 getCategories(LatestVersion);
	  	 categoryDetails = data[1].body.data;
	  	 console.log('categoryDetails')
	  	 console.log(categoryDetails)
	    }
	  });
  	}else{
  		console.log('token invalid')
  	}

  	var Categories = {};
	function getCategories(LatestVersion) {
	  jQuery.getJSON({
	    url: LatestVersion,
	    method: "GET",
	    'dataType': "json",
	    headers: {
	      'Authorization': 'Bearer ' + currentToken
	    },
	    success: function (data) {
			Categories = data.Categories;
			appendCategories(data.Categories)
	    }
	  });
	}

	function appendCategories(Categories) {
		var template = '';
		for (var i = 0; i < Categories.length; i++) {
			template += '<div data-index="'+i+'" class="col-sm-6 col-md-4 category">'+
					        '<div class="thumbnail">'+
					            '<img src="'+Categories[i].Thumbnail+'" alt="">'+
					          '<div class="caption">'+
					            '<h3>'+Categories[i].Name+'</h3>'+
					            '<p>'+Categories[i].Description+'</p>'+
					          '</div>'+
					        '</div>'+
					    '</div>';
		}
		$('.categories_list').html(template);
		$('.category').click(loadItems);
		$('.loader').hide();
	}

	var CategoryItems = [];
	var loadItems = function() {
		$('.loader').show();
		var index = parseInt($(this).attr('data-index'));
		var FolderId = getFolderIdByName(Categories[index].Name);
		$('.collection_name').text(Categories[index].Name);
		jQuery.ajax({
		    url: '/dm/getCategoryList?folderid='+FolderId,
		    success: function (data) {
		    	console.log('CategoryItems')
		    	console.log(data[0])
		    	// createjson(data[0].body.data)
		    	CategoryItems = data[0];
		    	getCategoryItems(data[1]);		  	 
		    }
		  });
	}
/*function createjson(arr){
	var json = {};
	json.CategoryItems = [];
	for(var i=0;i<arr.length;i++){
		var temparr = {"Name":arr[i].attributes.displayName, "Description":"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."};
		json.CategoryItems.push(temparr);
	}
		console.log('json created:')
		console.log(JSON.stringify(json))
}*/
  	var CategoriesJson = {};
	function getCategoryItems(jsonid) {
	  jQuery.getJSON({
	    url: jsonid,
	    method: "GET",
	    'dataType': "json",
	    headers: {
	      'Authorization': 'Bearer ' + currentToken
	    },
	    success: function (data) {
			console.log(data)
			CategoriesJson = data.CategoryItems;
			appendCategoryItems(CategoryItems)
	    }
	  });
	}

	function appendCategoryItems(Categories) {
		var template = '';
		for (var i = 0; i < Categories.body.data.length; i++) {
			var displayName = Categories.body.data[i].attributes.displayName;
			if (displayName.includes('json')) continue;
			var details = getDetailsByName(displayName);
			// getThumbnail(Categories.body.included[i].relationships.thumbnails.meta.link.href);
			var params = encodeURIComponent(Categories.body.included[i].relationships.derivatives.data.id+'/'+currentToken);
			// console.log('thumbnail_link: ',thumbnail_link)
			template += '<div data-index="'+i+'" class="categoryitem row">'+
							'<div class="thumbnail_div col-md-3"><img src="'+location.protocol+'//'+location.host+location.pathname+'thumbnails/?id='+params+'" ></div>'+
							'<div class="col-md-9"><h2 class="item_title">'+details.DisplayName+'</h2><p>'+details.ShortDescription+'</p></div>'+
						'</div>';
		}
		$('.items_list').html(template);
		$('.categoryitem').click(viewItem);
		$('.gallery-container,.loader').hide();
		$('.items_list_container,.breadcrumb').show();
	}

	function viewItem() {
		$('.item_label').show();
		$('.collection_name').addClass('collection_link');
		var index = parseInt($(this).attr('data-index'));
		var details = getDetailsByName(CategoryItems.body.data[index].attributes.displayName);
		$('.item_name,.product_name').text(details.DisplayName)
		$('.product_desc').html(details.LongDescription)
		$('.price').html(details.Price)
		$('.inventory').text(details.Inventory)
		// var FolderId = getFolderIdByName(Categories[index].Name);
		console.log('view')
		console.log(CategoryItems.body.included[index].relationships.derivatives.data.id)
		launchViewer(CategoryItems.body.included[index].relationships.derivatives.data.id)
		$('.items_list_container').hide();
		$('.viewer_container').show()
	}
	
	function getThumbnail(url) {
		jQuery.ajax({
		    url: url,
		    method: "GET",
        	encoding: null,
		    headers: {
		      'Authorization': 'Bearer ' + currentToken
		    },
		    success: function (data) {
				/*console.log('imagebinaydata')
				console.log(data)*/
				return data;
		    }
		  });
	}
	function getDetailsByName(name) {
		for (var i = 0; i < CategoriesJson.length; i++) {
			if (name === CategoriesJson[i].Name){
				return CategoriesJson[i];
			}
		}
	}

	function getFolderIdByName(name){
		for (var i = 0; i < categoryDetails.length; i++) {
			if (categoryDetails[i].attributes.displayName === name) return categoryDetails[i].id;			
		}
	}

	$('.categories_gallery').click(function(){
		$('.items_list_container,.breadcrumb,.viewer_container,.item_label').hide();
		$('.collection_name').removeClass('collection_link');
		$('.gallery-container').show();
	})

	$('.collection_name').click(function(){
		if ($(this).hasClass('collection_link')) {
			$('.items_list_container,.viewer_container,.item_label').hide();
			$('.collection_name').removeClass('collection_link');
			$('.items_list_container').show();
		}
	})
});