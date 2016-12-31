var globalImageFileStorage = [];
var globalMapFileStorage = [];
var globalImageFileStorageEdit = [];
var globalMapFileStorageEdit = [];
function showPreview (ElementID, inputFileSelectorId, isDeleteButtonRequired) {
	
	// Get the Div
	var preview = document.querySelector(ElementID);

	// get the uploaded files
	var files  = document.querySelector(inputFileSelectorId).files;
	
	// Initialize counter. This wil be used for giving dynamic id's to the elements
	var counter = 0;

	// This function accepts one file at a time and append the Image to the above fetched div. It also attach anchort taf with icon for image removal
	function readAndPreview(file) {
		if (inputFileSelectorId == '#productImages')
			globalImageFileStorage.push(file);
		else
			globalMapFileStorage.push(file);

		file.index = counter;
		counter++;
	    // Make sure `file.name` matches our extensions criteria
	    if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
	    	var reader = new FileReader();

	    	// Event listener. It run's on load to do the required thing.
	      	reader.addEventListener("load", function () {
	      		var parentDivId = 'parentdiv'+counter-1;
	      		var parentDiv = $('<div></div>').attr('id', parentDivId).attr('class', 'input-group');
		    	$(parentDiv).css('float','left');
		    	$(parentDiv).css('margin-left','20px');
		    	$(parentDiv).css('margin-top','15px');
		        var image = new Image();
		        var tempImage = {imageUrl: this.result, imageName: file.name};
		        image.height = 100;
		        image.title = file.name;
		        image.src = this.result;
		        image.id = 'fileId' + file.index;
		        parentDiv.append(image);
		        parentDiv.appendTo(preview);
		        
		        if (isDeleteButtonRequired == true)
		        	$('<span>', {id: file.index}).addClass('glyphicon glyphicon-remove-sign timeslotRemove').appendTo($('<a>', {id: 'anchorTag'+file.index}).addClass('close_img').appendTo(parentDiv)).click(removeFileFromPreview);

		      }, false);
	      	
	      	reader.readAsDataURL(file);
	    }

	}

	// Multiple files uploaded. Send one by one.
	if (files) {
		[].forEach.call(files, readAndPreview);
	}
}


// To remove the selected file
function removeFileFromPreview (whichFile) {
	// Get Image element
	var fileElement = document.getElementById('fileId' + this.id);

	// Remove Image element
	fileElement.remove();

	$('parentdiv'+this.id).remove();

	// Remove icon
	this.remove();

	// Remove the file from global array
	if (whichFile == 'image')
		globalImageFileStorage.splice(this.id, 1);
	else
		globalMapFileStorage.splice(this.id, 1);
}


function addImagesMapEditMode (productImages, productMaps) {
	console.log('in script ' + productImages);
	globalMapFileStorageEdit = productMaps;

	var index = 0;
	for (index = 0; index < productImages.length; index++) {
		console.log('in script again' + productImages[index]);
		globalImageFileStorageEdit.push(productImages[index]);
		addImageOneByOne(productImages[index]);
	}

	for(index = 0; index < productMaps.length; index++) {
		addMapOneByOne(productMaps[index]);
	}
}
var editImageCounter = 0;
var editMapCounter = 0;
function addImageOneByOne(source) {
	var parentDivId = 'parentDivImg'+editImageCounter;
	var parentDivImg = $('<div></div>').attr('id', parentDivId).attr('class', 'input-group');
	$(parentDivImg).css('float','left');
	$(parentDivImg).css('margin-left','20px');
	$(parentDivImg).css('margin-top','15px');
	var img = $('<img>');
	img.attr('src', source);
    img.appendTo(parentDivImg);
    parentDivImg.appendTo('#product_img_preview');
    
    $('<span>', {id: editImageCounter}).addClass('glyphicon glyphicon-remove-sign timeslotRemove')
    .appendTo($('<a>', {id: 'anchorTag'+editImageCounter}).addClass('close_img')
    .appendTo(parentDivImg)).click(removeImageFromEditPreview);

    editImageCounter++;
}

function addMapOneByOne(source){
	var parentDivId = 'parentDivMap'+editMapCounter;
	var parentDivMap = $('<div></div>').attr('id', parentDivId).attr('class', 'input-group');
	$(parentDivMap).css('float','left');
	$(parentDivMap).css('margin-left','20px');
	$(parentDivMap).css('margin-top','15px');
	var img = $('<img>');
	img.attr('src', source);
    img.appendTo(parentDivMap);
    parentDivMap.appendTo('#product_Map_preview');
    
    $('<span>', {id: editMapCounter}).addClass('glyphicon glyphicon-remove-sign timeslotRemove')
    .appendTo($('<a>', {id: 'anchorTag'+editMapCounter}).addClass('close_img')
    .appendTo(parentDivMap)).click(removeMapFromEditPreview);

    editMapCounter++;
}

function removeImageFromEditPreview (whichFile) {
	$('#parentDivImg'+this.id).remove();
	globalImageFileStorageEdit.splice(this.id, 1);
}

function removeMapFromEditPreview (whichFile) {
	$('#parentDivMap'+this.id).remove();
	globalMapFileStorage.splice(this.id, 1);
}