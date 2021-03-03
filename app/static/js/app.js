URL = window.URL || window.webkitURL;

// GLOBAL  APP CONTROLLER
var controller = (function(){

	// shim for AudioContext when it's not avb. 
	var AudioContext = window.AudioContext || window.webkitAudioContext;

	var filename = new Date().toISOString();

	var gumStream; 						//stream from getUserMedia()
	var rec; 							//Recorder.js object
	var input; 							//MediaStreamAudioSourceNode we'll be recording
	var state = 1;						//Button state 1 when idle and 0 when recording
	var html;							//html container for list of audio recordings
	var audioContext 					//audio context to help us record
	var note_id =0; 					//note id 
	var note_html; 						//note id 
	var options = {'backdrop': 'static'};
	var maleModal = new bootstrap.Modal(document.getElementById('popup-content-1'), options);
	var femaleModal = new bootstrap.Modal(document.getElementById('popup-content-2'), options);
	var thinking = new bootstrap.Modal(document.getElementById('popup-content-3'), options);
	var p;
	fetch('../static/js/score.json')
	.then(response => response.json())
	.then(data => init_score(data))
	.catch(err => console.log(err))

	var score = {
		current_Score: 100,
		victory : 100,
		loss : 0
	}

	var  init_score = function(data){
		score.current_Score = data.current_Score;
		score.victory = data.victory;
		score.loss = data.loss;
	};

	var  setupEventListeners = function(){
		$('#record_Button').click(switch_state);
		//removes the "active" class to .popup and .popup-content when the "Close" button is clicked 
		$(".close-1").on("click", function() {
			if (p > 0.5){
				//$(".popup-overlay, #popup-content-1").removeClass("active");
				maleModal.hide();
			}else{
				//$(".popup-overlay, #popup-content-2").removeClass("active");
				femaleModal.hide();
			}
			//update text for next recording
			update_note();

			score.victory = score.victory + 1;
			score.current_Score = Math.round( (score.victory * 100 / (score.victory + score.loss)) * 100) / 100;
			//update the accuracy of the model
			console.log("Pos")
			update_accuracy(true);

		});	
		
		//removes the "active" class to .popup and .popup-content when the "Close" button is clicked 
		$(".close-2").on("click", function() {
			if (p > 0.5){
				//$(".popup-overlay, #popup-content-1").removeClass("active");
				maleModal.hide();
			}else{
				//$(".popup-overlay, #popup-content-2").removeClass("active");
				femaleModal.hide();
			}
			//update text for next recording
			update_note();

			score.loss = score.loss + 1;
			score.current_Score = Math.round((score.victory * 100 / (score.victory + score.loss)) * 100) / 100;
			//update the accuracy of the model
			console.log("NEg")
			update_accuracy(false);
		});
	};

	var result = function(){

		// if probability greater than 0.5 its a male otherwise its a female
		if (p > 0.5){
			//$(".popup-overlay, #popup-content-1").addClass("active");
			maleModal.show();
		}else{
			//$(".popup-overlay, #popup-content-2").addClass("active");
			femaleModal.show();
		}

	};

	var init_accuracy = function(){
		$(".progress").each(function(){
			var $bar = $(this).find(".slide_bar");
			var $val = $(".rainbow");
			//var perc = parseInt( $val.text(), 10);
			var perc = score.current_Score;
			$({p:0}).animate({p:perc}, {
			  duration: 3000,
			  easing: "swing",
			  step: function(p) {
				$bar.css({
				  transform: "rotate("+ (45+(p*1.8)) +"deg)", // 100%=180° so: ° = % * 1.8
				  // 45 is to add the needed rotation to have the green borders at the bottom
				});
				$val.text(p|0);
			  },
			  complete: function() { $(".rainbow").text(score.current_Score)}
			});
		});
	};

	var update_accuracy = function(issue){
		$(".progress").each(function(){
			var $bar = $(this).find(".slide_bar");
			var $val = $(".rainbow");
			//var perc = parseInt( $val.text(), 10);
			var perc = score.current_Score;
			$({p:0}).animate({p:perc}, {
			  duration: 3000,
			  easing: "swing",
			  step: function(p) {
				$bar.css({
				  transform: "rotate("+ (45+(p*1.8)) +"deg)", // 100%=180° so: ° = % * 1.8
				  // 45 is to add the needed rotation to have the green borders at the bottom
				});
				$val.text(p|0);
			  },
			  complete: function() { $(".rainbow").text(score.current_Score)}
			});

			$.ajax({
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({issue : issue}),
				dataType: 'json',
				url: '/saveScore',
				success: function () {
					console.log("Issue succesfully saved !")
				}})
		});
	};

	var switch_state = function() {
		if (state){
			// 1. Switch button
			$('#record').fadeOut(100);
			$('#stop').fadeIn(300);
			navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {handlerFunction(stream)})
			state=0;
			console.log('I was clicked');
			record.disabled = true;
			//start waves
			$("#bars").addClass("active");
		}else{
			$('#record').fadeIn(300);
			$('#stop').fadeOut(100);
			state=1;
			console.log("I was clicked");
			record.disabled = false;
			rec.stop();
			//stop microphone access
			gumStream.getAudioTracks()[0].stop();
			//create the wav blob and pass it on to createDownloadLink
			rec.exportWAV(update_UI_Audios);
			//remove waves
			$("#bars").removeClass("active");
			//thinking.show
			thinking.show();
		}
		
	};

	var handlerFunction = function(stream) {

		audioContext = new AudioContext();
	
		//update the format 
		//document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"
	
		/*  assign to gumStream for later use  */
		gumStream = stream;
	
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);
	
		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1});
	
		//start the recording process
		rec.record();
	
		console.log("Recording started");
	
	};	

	var update_UI_Audios = function(blob){
		
		var url = URL.createObjectURL(blob);
		var au = document.createElement('audio');
		var li = document.createElement('li');
		var link = document.createElement('a');
	
		//name of .wav file to use during upload and download (without extendion)
		var filename = new Date().toISOString();
	
		//add controls to the <audio> element
		au.controls = true;
		au.src = url;
		
		//save to disk link
		link.href = url;
		link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
		link.innerHTML = "Save to disk";
		//add the new audio element to li
		li.appendChild(au);
		
		//add the filename to the li
		li.appendChild(document.createTextNode(filename+".wav "));
	
		//add the save to disk link to li
		li.appendChild(link);
		//upload link
		var upload = document.createElement('a');
		//upload.href="#";
		//upload.innerHTML = "Upload";
		//upload.addEventListener("click", function(event){
		var xhr=new XMLHttpRequest();
		xhr.onload=function(e) {
			if(this.readyState === 4) {
				//hide thinking
				thinking.hide();
				console.log("Server returned: ", e.target.responseText);
				console.log(e)
				var transition = e.target.responseText;
				p = parseFloat(transition.slice(1, -1));
				console.log(p);
				//show results
				result();
			}
		};
		var fd=new FormData();
		fd.append("audio_data",blob, filename);
		xhr.open("POST","/",true);
		xhr.send(fd);
		//})
		li.appendChild(document.createTextNode (" "))//add a space in between
		li.appendChild(upload);//add the upload link to li

		//add the li element to the ol
		recordingsList.appendChild(li);
	};

	var create_waveforms = function(){
		for (var i = 1; i < 10; i++) {
			document.getElementById("bars").innerHTML+='<div class="bar"></div>';
		}
	};

	var update_note = function(){
		note_id += 1;
		switch (note_id) {
			case 1 :
				note_html = "I’d like to help you out today. Which way did you come in? Excuse my naivety - I was born at a very early age.";
			break;
			case 2 :
				note_html = "I recall that Kevin was selected by his school to come to the states to study computer science."; 
			break;
			case 3 :  
				note_html =  "I'm not as think as you confused I am ! Out of my mind. Back in five minutes.";
			break;
			case 4 : 
				note_html = "Kevin is special, imagine what he could bring to the company. Let's have him for an interview";
				note_id = 0;
			break;
		}
		document.getElementById("note").innerHTML = note_html;

	};

	return {
        init: function() {
			// Recording button animation
			$(document).ready(function() {
				$("#stop").hide();
			});
            console.log('Application has started.');
			setupEventListeners();
			create_waveforms();
			init_accuracy();
		}
    };

})();

controller.init();
