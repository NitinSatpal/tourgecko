var globalImageFileStorage = [];
var globalMapFileStorage = [];
var globalImageFileStorageEdit = [];
var globalMapFileStorageEdit = [];
var globalCounter = 0;
var imageSizeLimitExceeded = false;
var mapSizeLimitExceeded = false;
var sizeLimitErrorImages = new Set();
var sizeLimitErrorMaps = new Set();

function showPreview (ElementID, inputFileSelectorId, isDeleteButtonRequired) {
	// angular.element(document.getElementById('tours')).scope().showSpinner();
	// Get the Div
	$('#tourgeckoBody').addClass('waitCursor');

	localCounter = globalCounter;
	var preview = document.querySelector(ElementID);

	// get the uploaded files
	var files  = document.querySelector(inputFileSelectorId).files;

	var waitCursorCounter;

	var maxLimit = 0;

	if (inputFileSelectorId == '#productImages') {
		if(files.length > 5) {
			maxLimit = 5;
			waitCursorCounter = 5;
			$('#pictureUploadLimitExceeded').show();
		} else {
			maxLimit = files.length;
			waitCursorCounter = files.length;
		}
	} else {
		if (files.length > 3) {
			maxLimit = 3;
			waitCursorCounter = 3;
			$('#mapUploadLimitExceeded').show();
		} else {
			maxLimit = files.length;
			waitCursorCounter = files.length;
		}
	}


	for (var index = 0; index < maxLimit; index++) {
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
	var fileType;	
	// This function accepts one file at a time and append the Image to the above fetched div. It also attach anchort taf with icon for image removal
	function readAndPreview(file) {
		if (inputFileSelectorId == '#productImages') {
			globalImageFileStorage.push(file);
			fileType = 'image';
		}
		else {
			globalMapFileStorage.push(file);
			fileType = 'map';
		}

	    // Make sure `file.name` matches our extensions criteria
	    if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
	    	var reader = new FileReader();

	    	// Event listener. It run's on load to do the required thing.
	      	reader.addEventListener("load", function () {
	      		waitCursorCounter--;
	      		$('#loader' + localCounter).remove();
		        $('#fileId'+ localCounter).attr('src', this.result);
		        $('#fileId'+ localCounter).attr('title', file.name);

		        if (waitCursorCounter == 0)
	    			$('#tourgeckoBody').removeClass('waitCursor');

	    		if (isDeleteButtonRequired == true) {
		        	$('<span>', {id: localCounter, name: fileType})
		        		.addClass('glyphicon glyphicon-remove-sign timeslotRemove')
		        		.appendTo($('<a>', {id: 'anchorTag'+localCounter})
		        		.addClass('close_img')
		        		.appendTo(document.getElementById('parentdiv'+localCounter)))
		        		.click(removeFileFromPreview);
	    		}
	    		file.index = localCounter;
		        if (file.size > 5242880) {
		        	var tempElement = document.getElementById('parentdiv' + file.index);
            		var markAsToBeRemoved = $('<span>Size Limit Exceeded<span>')
            			.attr('id', 'elementToBeRemoved' + file.index)
            			.attr('class', 'markAsToBeRemoved');
            		markAsToBeRemoved.appendTo(tempElement);
            		if (inputFileSelectorId == '#productImages') {
            			sizeLimitErrorImages.add(localCounter);
            			$('#pictureUploadSizeLimitExceeded').show();
            			imageSizeLimitExceeded = true;
            		} else {
            			sizeLimitErrorMaps.add(localCounter);
            			$('#mapUploadSizeLimitExceeded').show();
            			mapSizeLimitExceeded = true;
            		}
		        }
		        localCounter++;
		      }, false);
	      	
	      	reader.readAsDataURL(file);
	    }
	}

	// Multiple files uploaded. Send one by one.
	if (files) {
		for (var index = 0; index < maxLimit; index++)
			readAndPreview(files[index]);
		//[].forEach.call(files, readAndPreview);
	}
}


// To remove the selected file
function removeFileFromPreview () {
	var whichFileType = this.attributes["name"].value;
	// Get Image element
	var fileElement = document.getElementById('fileId' + this.id);

	// Remove Image element
	fileElement.remove();

	var parentElement = document.getElementById('parentdiv'+this.id);
	parentElement.remove();

	// Remove icon
	this.remove();
	// Remove the file from global array
	if (whichFileType == 'image') {
		globalImageFileStorage.splice(this.id, 1);
		if (sizeLimitErrorImages.has(parseInt(this.id)))
			sizeLimitErrorImages.delete(parseInt(this.id));

		if(sizeLimitErrorImages.size == 0) {
			imageSizeLimitExceeded = false;
			$('#pictureUploadSizeLimitExceeded').hide();
		}
	} else {
		globalMapFileStorage.splice(this.id, 1);
		if (sizeLimitErrorMaps.has(parseInt(this.id)))
			sizeLimitErrorMaps.delete(parseInt(this.id));

		if(sizeLimitErrorMaps.size == 0) {
			mapSizeLimitExceeded = false;
			$('#mapUploadSizeLimitExceeded').hide();
		}
	}
}


function addImagesMapEditMode (productImages, productMaps) {
	var index = 0;
	for (index = 0; index < productImages.length; index++) {
		globalImageFileStorageEdit.push(productImages[index]);
		addImageOneByOne(productImages[index]);
	}

	for(index = 0; index < productMaps.length; index++) {
		globalMapFileStorageEdit.push(productMaps[index])
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


/*if (response == 'LIMIT_FILE_SIZE') {
        for(var index = 0; index < $window.globalImageFileStorage.length; index++) {
          if ($window.globalImageFileStorage[index].size > 5242880) {
            var parentElement = document.getElementById('parentdiv' + $window.globalImageFileStorage[index].index);
            var markAsToBeRemoved = $('<span>To Be Removed<span>')
            .attr('id', 'elementToBeRemoved' + $window.globalImageFileStorage[index].index)
            .attr('class', 'markAsToBeRemoved');
            markAsToBeRemoved.appendTo(parentElement);
            // $window.globalImageFileStorage.splice($window.globalImageFileStorage[index], 1);
          }
        }
        vm.imageError = 'Marked images exceeds 5MB limit. Please remove them.'
      } */ 
