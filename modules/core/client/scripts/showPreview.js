var globalImageFileStorage = [];
var globalMapFileStorage = [];
var globalImageFileStorageEdit = [];
var globalMapFileStorageEdit = [];
var globalCounter = 0;

function showPreview (ElementID, inputFileSelectorId, isDeleteButtonRequired) {
	// angular.element(document.getElementById('tours')).scope().showSpinner();
	// Get the Div
	$('#tourgeckoBody').addClass('waitCursor');

	localCounter = globalCounter;
	var preview = document.querySelector(ElementID);

	// get the uploaded files
	var files  = document.querySelector(inputFileSelectorId).files;

	fileCounter = files.length;

	for (var index = 0; index < files.length; index++) {
		var parentDivId = 'parentdiv' + globalCounter;
  		var parentDiv = $('<div></div>').attr('id', parentDivId).attr('class', 'input-group');
    	$(parentDiv).css('float','left');
    	$(parentDiv).css('margin-left','20px');
    	$(parentDiv).css('margin-top','15px');
    	$(parentDiv).css('height', '100px');
    	$(parentDiv).css('background-color','#lightgrey');

    	var image = new Image();
        image.height = 100;
        image.id = 'fileId' + globalCounter;
    	
    	var loaderDiv = $('<div></div>').attr('id', 'loader'+globalCounter).attr('class', 'imageUploader');

    	loaderDiv.appendTo(parentDiv);
        parentDiv.append(image);
    	parentDiv.appendTo(preview);

    	globalCounter++;
	}

	// This function accepts one file at a time and append the Image to the above fetched div. It also attach anchort taf with icon for image removal
	function readAndPreview(file) {
		if (inputFileSelectorId == '#productImages')
			globalImageFileStorage.push(file);
		else
			globalMapFileStorage.push(file);

		file.index = localCounter;

	    // Make sure `file.name` matches our extensions criteria
	    if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
	    	var reader = new FileReader();

	    	// Event listener. It run's on load to do the required thing.
	      	reader.addEventListener("load", function () {
	      		fileCounter--;
	      		$('#loader' + localCounter).remove();
		        $('#fileId'+ localCounter).attr('src', this.result);
		        $('#fileId'+ localCounter).attr('title', file.name);

		        if (fileCounter == 0)
	    			$('#tourgeckoBody').removeClass('waitCursor');

	    		if (isDeleteButtonRequired == true) {
		        	$('<span>', {id: localCounter})
		        		.addClass('glyphicon glyphicon-remove-sign timeslotRemove')
		        		.appendTo($('<a>', {id: 'anchorTag'+localCounter})
		        		.addClass('close_img')
		        		.appendTo(document.getElementById('parentdiv'+localCounter)))
		        		.click(removeFileFromPreview);
	    		}
		        localCounter++;

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
	globalMapFileStorageEdit = productMaps;

	var index = 0;
	for (index = 0; index < productImages.length; index++) {
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