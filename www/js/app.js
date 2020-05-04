var scheduleFile;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		dir.getFile("schedule.json", {create:true}, function(file) {
            scheduleFile = file;
            readFile(scheduleFile);
        });
    }, fail);
    //window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "schedule.json", readFile, fail);
}

function fail(err) {
    alert("Error Code " + err.code + ": " + JSON.stringify(err));
}

function readFile(fileEntry) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
            parseFile(this.result);
		}
		reader.readAsText(file);
	}, fail); 
}

function writeFile(line) {
	if (!scheduleFile) return;
	scheduleFile.createWriter(function(fileWriter) {		
		fileWriter.seek(fileWriter.length);
		var blob = new Blob([line], {type:'text/plain'});
		fileWriter.write(blob);
	}, fail);
}

function parseFile(contents) {
    if (contents == "") {
        let event = {
            "start": "00:00",
            "end": "23:59",
            "events": [
                {
                    "name": "Nothing Planned",
                    "color": "#dddddd"
                }
            ]
        };
        displayEvent(event);
    } else {
        contents = '[' + contents + ']';
        var schedule = JSON.parse(contents);
        for (i = 0; i < schedule.length; i++) {
            displayEvent(schedule[i]);
        }
    }
}

function displayEvent(event) {
    $("#schedule").append(JSON.stringify(event));
}