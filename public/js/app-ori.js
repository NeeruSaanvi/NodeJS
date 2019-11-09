/*$(document).ready(function () {
    var isTouchDevice = 'ontouchstart' in document.documentElement;
    // alert(isTouchDevice);
    $("#pttImage").mousedown(function(event) {
        if (isTouchDevice == false) {   
            pttRecStart();   
        }
    });
    $("#pttImage").mouseup(function(event) {
        if (isTouchDevice == false) {   
            pttRecStop(); 
        }
    });
    $('#pttImage').on('touchstart', function(){
        if (isTouchDevice)  {   
            pttRecStart();   
        }
    });
    $('#pttImage').on('touchend', function(){
        if (isTouchDevice)  {   
            pttRecStop(); 
        }
    });
});
*/
$(document).ready(function () {
    var isTouchDevice = false;
    // alert(isTouchDevice);
    $("#pttImage").click(function(event) {
        if (isTouchDevice == false) {   
            pttRecStart();   
        }
    });
    $("#stopImage").mouseup(function(event) {
        if (isTouchDevice == false) {
        	$("#stopImage").hide();
        	$("#pttImage").show();
            pttRecStop(); 
        }
    });
    $('#pttImage').on('touchstart', function(){
        if (isTouchDevice)  {   
            pttRecStart();   
        }
    });
    $('#pttImage').on('touchend', function(){
        if (isTouchDevice)  {   
            pttRecStop(); 
        }
    });
});




function getQueryStringValue (key) {  
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}  


// document.getElementById("pttImage").addEventListener("mousedown", pttRecStart);
// document.getElementById("pttImage").addEventListener("mouseup", pttRecStop);

function pttRecStart() {    

	let group_id 		 = $("#group_id").val();
	if(group_id == 0) {
		alert('Please select any group');
		return false;
	}


	pttMode = "record"
	//document.getElementById("pttImage").src = "https://www.AirRevive-live.com/images/ptt-TALK.PNG"
    startRecording();  
}

function pttRecStop(){
    pttMode = "stop"
    //document.getElementById("pttImage").src = "https://www.AirRevive-live.com/images/ptt-RECORD.PNG"
    stopRecording();  
    return;
}


var socket = io();
	var username = getQueryStringValue('user_id');
	socket.emit('register',username);
	
	socket.on('private_chat',function(data){
		
			let content = `
		<div class="row message-body">
            <div class="col-sm-12 ${data.src}">
              <div class="receiver">
                <div class="message-text">
                 <audio controls="" src="${data.videosrc}" autoplay></audio>
                </div>
                <span class="message-time pull-right">
                  ${data.from}
                </span>
              </div>
            </div>
          </div>
	  `;
		
		$('#talkingToResult').append(content);	
		 
		
	});
	

	/*
	socket.on('fileUploaded', function(msg){
	  let name  	= msg.name;	
	  let className = msg.className;	
	  let src		= msg.src;
	  
	  $('#conversation').append(`
		<div class="row message-body">
            <div class="col-sm-12 ${src}">
              <div class="receiver">
                <div class="message-text">
                 <audio controls="" src="${src}" autoplay></audio>
                </div>
                <span class="message-time pull-right">
                  ${name}
                </span>
              </div>
            </div>
          </div>
	  `);
	}); */

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

function startRecording() {		

	// alert(id);
	
	
    var constraints = { audio: true, video:false }
	
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {


        $("#pttImage").hide();
        $("#stopImage").show();

		audioContext = new AudioContext();
		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

	}).catch(function(err) {

		alert(err.message);
	});
}


function stopRecording() {	

	// socket.emit('recordingStatus', {type,to:id,username:username,msg:'Recording Finished'});
	
	
	// $('#recordingStatus_'+id).html('Recording Finished');
	
	rec.stop();
	gumStream.getAudioTracks()[0].stop();
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
	
	let group_id 		 = $("#group_id").val();
	let userId			 = $("#user_select").val();

	var url 	 = URL.createObjectURL(blob);
	var filename = new Date().toISOString();
	  var xhr=new XMLHttpRequest();

	  xhr.onload=function(e) {
		  if(this.readyState === 4) {
			  console.log("Server returned: ",e.target.responseText);
		  }
	  };

	  var fd=new FormData();
	  fd.append("audio_data",blob, filename);
	  xhr.open("POST",WEBSITE_URL+"/upload?group_id="+group_id+"&from="+username+"&userId="+userId,true);

	  xhr.send(fd);
}

/*
function valueChange(id,name,type){
	$(".aar").hide();
	$("#userName").val(id);
	$("#roomType").val(type);
	$(".conversation").show();
	$("#conversation_"+id).show();
	$("#heading_"+id).show();
}

function sendMessage(){
	let roomType		 = $("#roomType").val();
	let comment  = $("#comment").val();
	let id		 = $("#userName").val();
	if(comment == ''){
		$("#comment").addClass('border-red');
		return false;
	}else{
		$("#comment").removeClass('border-red');		
	}
	
	socket.emit('private_chat',{
        to : id,
        message : comment,
        from : username,
        roomType : roomType
    });
	
	$("#comment").val('');
	// socket.emit("private", { msg: comment, to: id });

}*/

$("#group_id").change(function(e){
	console.log($(this).val());
	$.ajax({
		url:WEBSITE_URL+'/findUser',
		dateType:'json',
		type:'GET',
		data:{group_id:$(this).val(),loginUserId:username},
		success: function(r){
			let option = `
<select class="myCombo" id="user_select" name="user">
    <option value="all_user">Select User</option>`;
			for(let i=0; i< r.length; i++){
				option += `<option value="${r[i].id}">${r[i].name}</option>`;
			}
			option += `</select>`;
			console.log(option);
			$("#user_select_box").html(option);
			console.log(r);
		}
	})
});