URL = window.URL || window.webkitURL;

navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {handlerFunction(stream)})

var filename = new Date().toISOString();

function handlerFunction(stream) {
	rec = new MediaRecorder(stream);
	rec.ondataavailable = e => {
		audioChunks.push(e.data);
		if (rec.state == "inactive"){
			let blob = new Blob(audioChunks,{type:'audio/mpeg-3'});
			recordedAudio.src = URL.createObjectURL(blob);
			recordedAudio.controls=true;
			recordedAudio.autoplay=false;
			/*recordedAudio.fnExtractSoundToMP3('/audio/file1.mp3', function(error, file){
				if (!error)
				console.log('Audio file: ' + file);
			});
			url = window.URL.createObjectURL(blob);
			this.href = url;
			this.target = '_blank';
			this.download = 'my_audio';*/
		}
	}
}

// Recording button animation
$(document).ready(function() {
    $("#stop").hide();
});

var state = 1;

function switch_state() {

	if (state){
		$('#record').fadeOut(100);
		$('#stop').fadeIn(300);
		state=0;
		console.log('I was clicked')
		record.disabled = true;
		audioChunks = [];
		rec.start();

	}else{
		$('#record').fadeIn(300);
		$('#stop').fadeOut(100);
		state=1;
		console.log("I was clicked")
		record.disabled = false;
		rec.stop();
	}
	
}
$('#record_Button').click(switch_state);
