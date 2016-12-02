var globalImageFileStorage = [];
var globalMapFileStorage = [];
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
		        var image = new Image();
		        var tempImage = {imageUrl: this.result, imageName: file.name};
		        image.height = 100;
		        image.title = file.name;
		        image.src = this.result;
		        image.id = 'fileId' + file.index;
		        preview.appendChild( image );
		        
		        if (isDeleteButtonRequired == true)
		        	$('<i>', {id: file.index}).addClass('zmdi zmdi-close').appendTo($('<a>', {id: 'anchorTag'+file.index}).addClass('close_img').appendTo(preview)).click(removeFileFromPreview);

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

	// Remove icon
	this.remove();

	// Remove the file from global array
	if (whichFile == 'image')
		globalImageFileStorage.splice(this.id, 1);
	else
		globalMapFileStorage.splice(this.id, 1);
}
