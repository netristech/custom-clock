document.addEventListener("deviceready", init, false);
function init() {
	//console.log(cordova.file.applicationDirectory + "index.html");	
	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory, function(f) {
		console.dir(f);
	}, fail);
	//This alias is a read-only pointer to the app itself
	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/schedule", readFile, fail);
}

function fail(e) {
    console.log(e.code);
}

function readFile(fileEntry) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
            //console.log("Text is: "+this.result);
            console.log(e.target.result);
            document.querySelector("#schedule").innerHTML = this.result;
            //document.querySelector("#schedule").innerHTML = "Hello World!";
		}
		reader.readAsText(file);
	}); 
}

/*function readFile(fileEntry) {
    fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            displayFileData(fileEntry.fullPath + ": " + this.result);
        };
        reader.readAsText(file);
    }, onErrorReadFile);
}*/