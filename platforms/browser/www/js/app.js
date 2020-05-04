var scheduleFile;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		console.log("Data directory is: " + dir);
		dir.getFile("schedule", {create:true}, function(file) {
			console.log("file is: " + file);
			scheduleFile = file;
			writeFile("Hello World!!!!");			
        });
    });
    //window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "schedule", readFile, fail);
}

function fail(e) {
    console.log(e.code);
    console.log(e)
}

function readFile(fileEntry) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
            console.log(e.target.result);
            if (this.result == "") {
                $("#schedule").html("Empty File");
            } else {
                $("#schedule").html(this.result);
            }
		}
		reader.readAsText(file);
	}, fail); 
}

function writeFile(str) {
	if (!scheduleFile) return;
	var line = str + "\n";
	console.log("writing line: " + line + "to file");
	scheduleFile.createWriter(function(fileWriter) {		
		fileWriter.seek(fileWriter.length);
		var blob = new Blob([line], {type:'text/plain'});
		fileWriter.write(blob);
	}, fail);
}