var scheduleFile;
var schedule;
//var today = new Date();
var interval;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    var index;
    drawSchedule();
    drawModal();
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		dir.getFile('schedule.json', {create:true}, function(file) {
            scheduleFile = file;
            readFile(scheduleFile);
        });
    }, fail);
    $('#clock').swiperight(function() {
		$(this).carousel('prev');
	});  
	$("#clock").swipeleft(function() {
		$(this).carousel('next');
	});
    $('.switch').click(function(e) {
        e.preventDefault();
        if ($('#clock').hasClass('hide')) {
            $('#schedule').addClass('hide');
            $('#clock').removeClass('hide');
            displayClock();
        } else {
            $('#clock').addClass('hide');
            $('#schedule').removeClass('hide');
            focusSchedule();
        }
    });
    $('#add').click(function(e) {
        e.preventDefault();
        $('#schedule-form').trigger('reset');
        $('#update, #delete, #alt-event').addClass('hide');
        $('label[for="start"], #start, #save, #alt-add').removeClass('hide');
        clearError();
    });
    $('#image').click(function(e) {
        e.preventDefault();
        getPic(false);
    });
    $('#alt-image').click(function(e) {
        e.preventDefault();
        getPic(true);
    });
    $('#alt-add').click(function(e) {
        e.preventDefault();
        $('#alt-event').removeClass('hide');
        $(this).addClass('hide');
    });
    $('#save').click(function(e) {
        e.preventDefault();
        var event = [
            {
                "start": `${$('#shr').val()}:${$('#smin').val()}:${$('#sap').val()}`,
                "duration": `${$('#dhr').val()}:${$('#dmin').val()}`,
                "color": $('#color').val(),
                "event": [
                    {
                        "name": $('#name').val(),
                        "image": $('#image-url').val()
                    }
                ]
            }
        ];
        if ($('#alt-name').val() != "") {
            event[0].event.push({
                "name": $('#alt-name').val(),
                "image": $('#alt-image').val()
            });
        } 
        if (isSplit(event[0])) {
            event = splitEvent(event[0]);
        }
        if (isConflict(event[0]) || event[1] != undefined && isConflict(event[1])) {
            displayError();
        } else {
            saveEvent(event);
        }
    });
    $('#schedule-content').on('click', '.event', function() {
        //e.preventDefault();
        $('label[for="start"], #start, #save, #alt-event').addClass('hide');
        $('#delete, #update, #alt-add').removeClass('hide');
        clearError();
        index = getIndex($(this).attr('id').substring(1));
        //event = schedule[index];
        $('#name').val(schedule[index].event[0].name);
        $('#dhr').val(schedule[index].duration.split(':')[0]);
        $('#dmin').val(schedule[index].duration.split(':')[1]);
        $('#color').val(schedule[index].color);
        $('#image-url').val(schedule[index].event[0].image);
        if (schedule[index].event.length > 1) {
            $('#alt-event').removeClass('hide');
            $('#alt-name').val(schedule[index].event[1].name);
            $('#alt-image').val(schedule[index].event[1].image);
        }
        $('#schedule-modal').modal();
    });
    $('#update').click(function(e) {
        e.preventDefault();
        var event = JSON.parse(JSON.stringify(schedule[index]));
        var tempEvent = [JSON.parse(JSON.stringify(event))];
        //alert(`${JSON.stringify(tempEvent)} - ${JSON.stringify(event)}`);
        schedule[index] = {};
        tempEvent[0].event[0].name = $('#name').val();
        tempEvent[0].duration = `${$('#dhr').val()}:${$('#dmin').val()}`;
        tempEvent[0].color = $('#color').val();
        tempEvent[0].event[0].image = $('#image-url').val();
        if ($('#alt-name').val() != "") {
            if (tempEvent[0].event[1] != undefined) {
                tempEvent[0].event[1].name = $('#alt-name').val();
                tempEvent[0].event[1].image = $('#alt-image').val();
            } else {
                tempEvent[0].event.push({
                    "name": $('#alt-name').val(),
                    "image": $('#alt-image').val()
                });
            }
        }
        if (isSplit(tempEvent[0])) {
            tempEvent = splitEvent(tempEvent[0]);
        }
        if (isConflict(tempEvent[0]) || tempEvent[1] != undefined && isConflict(tempEvent[1])) {
            schedule[index] = event;
            displayError();
        } else {
            $(`#b${toTimestamp(event.start)}`).remove();
            schedule.splice(index, 1);
            saveEvent(tempEvent);
        }
    });
    $('#delete').click(function(e) {
        e.preventDefault();
        for (i = 0; i < schedule[index].event.length; i++) {
            let temp = schedule[index].event[i].image;
            schedule[index].event[i].image = '';
            if (isOrphan(temp)) {
                deleteFile(temp);
            }
        }
        $(`#b${toTimestamp(schedule[index].start)}`).remove();
        schedule.splice(index, 1);
        writeFile(JSON.stringify(schedule));
        $('#schedule-modal').modal('hide');
    });
}

// for future use
class Event {
    constructor(params) {
        this.start = params.start;
        this.duration = params.duration;
        this.color = params.color;
        for (i = 0; i < params.event.length; i++) {
            this.event[i].name = params.event[i].name;
            this.event[i].image = params.event[i].image;
        }
    }
    get end() {
        return toTimestamp(this.start) + toTimestamp(this.duration);
    }
}

function fail(err) {
    alert("Error Code " + err.code + ": " + JSON.stringify(err));
}

function getPic(alt) {
    let options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        targetWidth: 1080,
        targetHeight: 1920
    }
    navigator.camera.getPicture(function cameraSuccess(imageURI) {
        var dest;
        var filename = imageURI.split('/').slice(-1)[0].replace(/\s+/g, '');
        if (filename.split('.').slice(-1)[0] == 'jpeg') {
            filename = filename.split('.')[0] + '.jpg';
        }
        //var filename = Date.now().toString() + '.' + imageURI.split('.').slice(-1)[0];
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
            dest = dirEntry;
        }, fail);
        window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
            fileEntry.copyTo(dest, filename, function() {
                window.resolveLocalFileSystemURL(dest.toURL() + filename, function(file) {
                    if (alt) {
                        $('#alt-image-url').val(file.toURL());
                    } else {
                        $('#image-url').val(file.toURL());
                    }
                    $('#loading').fadeIn(200).delay(1000).fadeOut(200);
                }, fail);
            }, fail);
        }, fail);
    }, function cameraError(error) {
        alert(`Error retreiving image: ${error}`);
    }, options);
}

function toTimestamp(str) {
    var ts;
    if (str.split(':')[0] == '12' && str.split(':')[2] != undefined) {
        ts = Number(str.split(':')[1]);
    } else {
        ts = Number(str.split(':')[0]) * 60 + Number(str.split(':')[1]);
    }
    if (str.split(':')[2] != undefined && str.split(':')[2] == 'PM') {
        ts += 720;
    }
    return ts;
}

function toHumanTime(ts) {
    var ampm;
    var hr = Math.floor(ts / 60);
    var min = ts - hr * 60;
    if (min == 0) {
        min = '00';
    }
    if (ts >= 720) {
        ampm = 'PM';
        hr -= 12;
    } else {
        ampm = 'AM';
    }
    if (hr == 0) {
        hr = '12';
    }
    return `${hr}:${min}:${ampm}`;
}

function getIndex(id) {
    for (i = 0; i < schedule.length; i++) {
        if (toTimestamp(schedule[i].start) == Number(id)) {
            return i;
        }
    }
}

function drawSchedule() {
    $('#schedule-content').html(`<div style="height: ${$('.buttons').outerHeight() + 8}px;"></div>`);
    var hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    var minutes = ['00', '15', '30', '45'];
    for (i = 0; i < hours.length; i++) {
        for (j = 0; j < minutes.length; j++) {
            let t = `${hours[i]}:${minutes[j]}`;
            $('#schedule-content').append(`<div class="row"><div class="col-2">${t}</div><div id="a${toTimestamp(t)}" class="col-10"></div></div>`);
        }
    }
    $('#schedule').addClass('hide');
    $('#loading').fadeOut(1);
}

function drawModal() {
    for (i = 1; i < 13; i++) {
        $('#shr').append(`<option value="${i}">${i}</option>`);
    }
    for (i = 0; i < 24; i++) {
        $('#dhr').append(`<option value="${i}">${i}</option>`);
    }
    var minutes = ['00', '15', '30', '45'];
    for (i = 0; i < minutes.length; i++) {
        $('#smin, #dmin').append(`<option value="${minutes[i]}">${minutes[i]}</option>`);
    }
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
		//fileWriter.seek(fileWriter.length);
		var blob = new Blob([line], {type:'text/plain'});
		fileWriter.write(blob);
	}, fail);
}

function parseFile(contents) {
    if (contents == '') {
        schedule = [];
    } else {
        schedule = JSON.parse(contents);
    }
    for (i = 0; i < schedule.length; i++) {
        displaySchedule(schedule[i]);
    }
    if ($('#schedule').hasClass('hide')) {
        displayClock();
    }
}

function deleteFile(file) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
        dir.getFile(file.split('/').slice(-1)[0], {create:false}, function(fileEntry) {
            fileEntry.remove(function() {
                return;
            }, fail);
        });
    }, fail);
}

function isOrphan(file) {
    for (i = 0; i < schedule.length; i++) {
        for (j = 0; j < schedule[i].event.length; j++) {
            if (schedule[i].event[j].image == file) {
                return false;
            }
        }
    }
    return true;
}

function isSplit(event) {
    let e = toTimestamp(event.start) + toTimestamp(event.duration);
    if (1440 < e) {
        return true;
    }
}

function splitEvent(event) {
    let event1 = JSON.parse(JSON.stringify(event));
    event1.duration = toHumanTime(1440 - toTimestamp(event.start));
    let event2 = JSON.parse(JSON.stringify(event));
    event2.duration = toHumanTime(toTimestamp(event.duration) - toTimestamp(event1.duration));
    event2.start = '12:00:AM';
    return [event1, event2];
}

function saveEvent(event) {
    for (i = 0; i < event.length; i++) {
        schedule.push(event[i]);
        writeFile(JSON.stringify(schedule));
        displaySchedule(event[i]);
    }
    $('#schedule-modal').modal('hide');
}

function getNow() {
    let now = new Date();
    return toTimestamp(`${now.getHours()}:${now.getMinutes()}`);
}

function isNow(event) {
    let n = getNow();
    //let s = Number(event.start.slice(0, 2)) * 60 + Number(event.start.slice(2));
    let s = toTimestamp(event.start);
    let e = s + (toTimestamp(event.duration) - 1);
    if (n >= s && n <= e ) {
        return true;
    }
}

function isConflict(event) {
    var s1 = toTimestamp(event.start);
    var e1 = s1 + toTimestamp(event.duration) - 1;
    for (i = 0; i < schedule.length; i++) {
        if (!jQuery.isEmptyObject(schedule[i])) {
            let s2 = toTimestamp(schedule[i].start);
            let e2 = s2 + toTimestamp(schedule[i].duration) - 1;
            if (s1 <= e2 && s2 <= e1) {
                return true;
            }
        }
    }
}

function displayError() {
    $('#shr, #smin, #dhr, #dmin').addClass('is-invalid');
}

function clearError() {
    $('#shr, #smin, #dhr, #dmin').removeClass('is-invalid');
}

function displaySchedule(event) {
    var s = toTimestamp(event.start);
    if (!$(`#b${s}`).length) {
        let t = $(`#a${s}`).position().top;
        let l = $(`#a${s}`).position().left;
        let b = t + $(`#a${s}`).outerHeight() * (toTimestamp(event.duration) / 15);
        let w = $(`#a${s}`).outerWidth() - 16;
        let h = b - t;
        let c = event.color;
        $("#schedule-content").append(`<button type="button" id="b${s}" class="event" style="top: ${t}px; left: ${l}px; width: ${w}px; height: ${h}px; background-color: ${c};"><span style="opacity: 1.0;">${event.event[0].name}</span></button>`);
    }
}

function focusSchedule() {
    //let h = today.getHours();
    //let m = 15 * (Math.floor(today.getMinutes() / 15));
    let e = `#a${15 * (Math.floor(getNow() / 15))}`;
    let em = $(e).offset().top + ($(e).outerHeight() / 2);
    $('html').scrollTop(em - $(window).height() / 2);
}

function displayClock() {
    clearInterval(interval);
    function refreshClock() {
        $('#clock .carousel-inner .active').css('background-image', 'url(img/beach.jpg)');
        $('#clock .carousel-inner .active').html(`<div class="center"><strong>Nothing Planned</strong></div>`);
        for (i = 0; i < schedule.length; i++) {
            if (isNow(schedule[i])) {
                let d = toTimestamp(schedule[i].duration);
                let e = toTimestamp(schedule[i].start) + d;
                let rt = ((e - getNow()) / d) * 100;
                if (schedule[i].event[0].image != '') {
                    $('#clock .carousel-inner .active').css('background-image', `url(${schedule[i].event[0].image})`);
                } else {
                    $('#clock .carousel-inner .active').css('background-image', 'none');
                    $('#clock .carousel-inner .active').css('background-color', schedule[i].color);
                }
                $('#clock .carousel-inner .active').html(`<div class="center"><strong>${schedule[i].event[0].name}</strong></div><div class="pbar-container"><div class="pbar" style="width: ${rt}%;"></div></div>`);
                if (schedule[i].event[1] != undefined) {
                    if (!$('#clock .carousel-inner .alt').length) {
                        $('#clock .carousel-inner').append('<div class="carousel-item alt">');
                    }
                    if (schedule[i].event[1].image != '') {
                        $('#clock .carousel-inner .alt').css('background-image', `url(${schedule[i].event[1].image})`);
                    } else {
                        $('#clock .carousel-inner .alt').css('background-image', 'none');
                        $('#clock .carousel-inner .alt').css('background-color', schedule[i].color);
                    }
                    $('#clock .carousel-inner .alt').html(`<div class="center"><strong>${schedule[i].event[1].name}</strong></div><div class="pbar-container"><div class="pbar" style="width: ${rt}%;"></div></div>`);
                }
            }
        }
    }
    refreshClock();
    interval = setInterval(refreshClock, 30000);
}