var globalFileStorage = [];
function showPreview (ElementID, inputFileSelectorId, isDeleteButtonRequired) {
	
	// Get the Div
	var preview = document.querySelector(ElementID);

	// Get all the uploaded files
	var files   = document.querySelector(inputFileSelectorId).files;
	
	// Initialize counter. This wil be used for giving dynamic id's to the elements
	var counter = 0;

	// This function accepts one file at a time and append the Image to the above fetched div. It also attach anchort taf with icon for image removal
	function readAndPreview(file) {
		globalFileStorage.push(file);
		file.index = counter;
		counter++;
	    // Make sure `file.name` matches our extensions criteria
	    if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
	    	var reader = new FileReader();

	    	// Event listener. It run's on load to do the required thing.
	      	reader.addEventListener("load", function () {
		        var image = new Image();
		        var tempImage = {imageUrl: this.result, imageName: file.name};
		        // globalFileStorage.push(tempImage);
		        image.height = 100;
		        image.title = file.name;
		        image.src = this.result;
		        image.id = 'image' + file.index;
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
function removeFileFromPreview () {
	// Get Image element
	var imageElement = document.getElementById('image' + this.id);

	// Remove Image element
	imageElement.remove();

	// Remove icon
	this.remove();

	// Remove the file from global array
	globalFileStorage.splice(this.id, 1);
}

// Save the files to the server
/* function uploadFiles () {
	angular.element(document.getElementById('tours')).scope().uploadImage('abcbc','dbnasdjkasd');
	$.ajax({
      url:'/api/product/productPicture',
        type:'POST',
        dataType: 'json',
        data: {filesToUpload: globalFileStorage},
        success: function( json ) {
        
      	}
    });
} */