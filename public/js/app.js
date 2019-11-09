// const portAudio = require('naudiodon');

$(document).ready(function() {
    var isTouchDevice = !1;
    $("#pttImage").click(function(event) { if (isTouchDevice == !1) { y_3() } });
    $("#stopImage").mouseup(function(event) {
        if (isTouchDevice == !1) {
            $("#stopImage").hide();
            $("#pttImage").show();
            p72()
        }
    });
    $('#pttImage').on('touchstart', function() { if (isTouchDevice) { y_3() } });
    $('#pttImage').on('touchend', function() { if (isTouchDevice) { p72() } })


    $('#user_select').multiselect({

        includeSelectAllOption: true

    });
});


function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"))
}

function y_3() {
    // let username = $("#user_select").val();

    var username = $("#user_select option:selected");

    if ((username.length) == 0) {
        alert('Please select any user');
        return !1
    }


    // alert(username[0].val());

    // username.each(function () {
    //        message += $(this).text() + " " + $(this).val() + "\n";
    //    });



    // let group_id = $("#group_id").val();
    // if (group_id == 0) {
    //     alert('Please select any group');
    //     return !1
    // }
    pttMode = "record"
    startRecording()
}


function p72() {
    pttMode = "stop"
    r43();
    return
}





var socket = io();
var username = getQueryStringValue('u');
// alert(username);
socket.emit('register', username);
socket.on('private_chat', function(data) {
    let content = `
                <div id="myElement"></div>
    `;


    // <div class="row message-body">
    //         <div class="col-sm-12 ${data.src}">
    //           <div class="receiver">
    //             <div class="message-text">
    //             <div id="myElement"></div>

               
    //             </div>
    //             <span class="message-time pull-right">
    //               ${data.from}
    //             </span>
    //           </div>
    //         </div>
    //       </div>
    // <audio onended="$('#msgBy').html('')" controls="controls" autoplay="autoplay" src="${data.videosrc}"></audio>
    // alert(data.videosrc);


    $("#msgBy").html('Msg By: ' + data.from);

    $('#talkingToResult').append(content)


    // Local copy of jQuery selectors, for performance.
    var my_jPlayer = $("#myElement");


    // Instance jPlayer
    my_jPlayer.jPlayer({
        ready: function() {
            // $("#jp_container .track-default").click();
            // alert("dddd");
        },
        timeupdate: function(event) {
            // alert("time");
            // my_extraPlayInfo.text(parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%");
        },
        play: function(event) {
            // alert("dddd play ");
            // my_playState.text(opt_text_playing);
        },
        pause: function(event) {
            // alert("pasu");
            // my_playState.text(opt_text_selected);
        },
        ended: function(event) {
            // alert("end");
            $("#msgBy").html("");
            // my_playState.text(opt_text_selected);
        },
        swfPath: "../dist/jplayer",
        supplied: "mp3",
        autoPlay: true
    });

    my_jPlayer.jPlayer("setMedia", {
        mp3: data.videosrc
    });
    // if((opt_play_first && first_track) || (opt_auto_play && !first_track)) {
    my_jPlayer.jPlayer("play");
    // }


    //  <audio controls>
    //                 <source onended="$('#msgBy').html('')" src="${data.videosrc}" type="audio/wav">
    //                  </audio>
    // //<audio onended="$('#msgBy').html('')" controls="" src="${data.videosrc}" autoplay></audio>


    // Create an instance of AudioIO with outOptions, which will return a WritableStream
    // var ao = new portAudio.AudioIO({
    //   outOptions: {
    //     channelCount: 2,
    //     sampleFormat: portAudio.SampleFormat16Bit,
    //     sampleRate: 48000,
    //     deviceId: -1 // Use -1 or omit the deviceId to select the default device
    //   }
    // });

    // // Create a stream to pipe into the AudioOutput
    // // Note that this does not strip the WAV header so a click will be heard at the beginning
    // var rs = fs.createReadStream(data.videosrc);

    // // Start piping data and start streaming
    // rs.pipe(ao);
    // ao.start();

});

URL = window.URL || window.webkitURL;
var gumStream;
var rec;
var input;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;
var encodingType;                   //holds selected encoding for resulting audio (file)
var encodeAfterRecord = true; 


function startRecording() {
    var constraints = { audio: !0, video: !1 }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        $("#pttImage").hide();
        $("#stopImage").show();
        audioContext = new AudioContext();
        gumStream = stream;
        input = audioContext.createMediaStreamSource(stream);
        
        // encodingType = encodingTypeSelect.options["mp3"];

        rec = new WebAudioRecorder(input, {
          workerDir: "webrecorder/lib/", // must end with slash
          encoding: "mp3",
          numChannels:2, //2 is the default, mp3 encoding supports only 2
          onEncoderLoading: function(recorder, encoding) {
            // show "loading encoder..." display
            console.log("Loading "+encoding+" encoder...");
          },
          onEncoderLoaded: function(recorder, encoding) {
            // hide "loading encoder..." display
            _console.log(encoding+" encoder loaded");
          }
        });

        rec.onComplete = function(recorder, blob) { 
            console.log("Encoding complete");
            createDownloadLink(blob,recorder.encoding);
            // encodingTypeSelect.disabled = false;
        }

        rec.setOptions({
          timeLimit:120,
          encodeAfterRecord:encodeAfterRecord,
          ogg: {quality: 0.5},
          mp3: {bitRate: 160}
        });

        //start the recording process
        rec.startRecording();
 console.log("Recording started");


        // rec = new Recorder(input, { numChannels: 1 })
        // rec.record()
    }).catch(function(err) { alert(err.message) })
}

function r43() {


    // rec.stop();
    gumStream.getAudioTracks()[0].stop();
    rec.finishRecording();
    // rec.exportWAV(uytr3)
}

function createDownloadLink(blob,encoding) {
    
    var userIds = $("#user_select option:selected");
    var selectedUsers = [];
    userIds.each(function() {
        //alert($(this).val());
        selectedUsers.push($(this).val());
    });

    var url = URL.createObjectURL(blob);
    var xhr = new XMLHttpRequest();

    var filename = new Date().toISOString();
    xhr.onload = function(e) {
        if (this.readyState === 4) {
            console.log("Server returned: ", e.target.responseText)
        }
    };
    var fd = new FormData();
    fd.append("audio_data", blob, filename);
    xhr.open("POST", WEBSITE_URL + "/upload?from=" + username + "&userIds=" + selectedUsers, !0);
    // xhr.open("POST", WEBSITE_URL + "/upload?group_id=" + group_id + "&from=" + username + "&userId=" + userId, !0);
    xhr.send(fd)


    //link the a element to the blob
    // link.href = url;
    // link.download = new Date().toISOString() + '.'+encoding;
    // link.innerHTML = link.download;

    // //add the new audio and a elements to the li element
    // li.appendChild(au);
    // li.appendChild(link);

    // //add the li element to the ordered list
    // recordingsList.appendChild(li);
}


function uytr3(blob) {
    // let group_id = $("#group_id").val();
    // let userId = $("#user_select").val();
    var userIds = $("#user_select option:selected");
    var selectedUsers = [];
    userIds.each(function() {
        //alert($(this).val());
        selectedUsers.push($(this).val());
    });

    // console.log(selectedUsers);

    var url = URL.createObjectURL(blob);
    var filename = new Date().toISOString();
    var xhr = new XMLHttpRequest();

    xhr.onload = function(e) {
        if (this.readyState === 4) {
            console.log("Server returned: ", e.target.responseText)
        }
    };
    var fd = new FormData();
    fd.append("audio_data", blob, filename);
    xhr.open("POST", WEBSITE_URL + "/upload?from=" + username + "&userIds=" + selectedUsers, !0);
    // xhr.open("POST", WEBSITE_URL + "/upload?group_id=" + group_id + "&from=" + username + "&userId=" + userId, !0);
    xhr.send(fd)
}

// $("#group_id").change(function(e) {
//     console.log($(this).val());
//     $.ajax({
//         url: WEBSITE_URL + '/findUser',
//         dateType: 'json',
//         type: 'GET',
//         data: { group_id: $(this).val(), loginUserId: username },
//         success: function(r) {
//             let option = `
// <select class="myCombo" id="user_select" name="user">
//     <option value="all_user">Select User</option>`;
//             for (let i = 0; i < r.length; i++) { option += `<option value="${r[i].id}">${r[i].name}</option>` }
//             option += `</select>`;
//             console.log(option);
//             $("#user_select_box").html(option);
//             console.log(r)
//         }
//     })
// })