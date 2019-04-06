var mouseDown = 0;
var dmxbuffer = new Uint8Array(81);

uibuilder.onChange('msg', function(newVal){
	if (newVal.topic=="dmxbuf") {
	    var dmxbuf=Array.from(Object.keys(newVal.payload), k=>newVal.payload[k]);
	    
	    $('#rxmsg').text(dmxbuf.toString());
		dmxbuffer=dmxbuf;
		dumpDMXbuffer();
	}
	
	if (newVal.topic=="slot") {
		$('#rxmsg').text("Incoming slot");
		for (var i=0;i<newVal.payload.length;i++) {
			$("#slot_" + newVal.payload[i]["slot"]).val(newVal.payload[i]["name"])
		}
	}
});	


// Convert an int to ASCII hex
function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase();
}

function dumpDMXbuffer() {
	var ascii_dump="";
	
	i=0;
	for (r=0;r<9;r++) {
		for (c=0;c<9;c++) {
			ascii_dump+=toHex(dmxbuffer[i]) + " ";
			i++;
		}
		ascii_dump+="<br/>";
	}
	$("#dmxbuffer").html(ascii_dump);
	uibuilder.send({"topic":"dmxbuf","payload":dmxbuffer});
	$('#txmsg').text(dmxbuffer.toString());

}

document.onmousedown = function() { 
	if (mouseDown<=0) {
		++mouseDown;
	}
};

document.onmouseup = function() {
	if (mouseDown>=0) {
		--mouseDown;
	}
};

function off_button() {
	document.getElementById("range_red").value=0;
	document.getElementById("range_green").value=0;
	document.getElementById("range_blue").value=0;
	document.getElementById("range_white").value=0;
	buffer_update();
}

function red_button() {
	document.getElementById("range_red").value=255;
	document.getElementById("range_green").value=0;
	document.getElementById("range_blue").value=0;
	document.getElementById("range_white").value=0;
	buffer_update();
}

function green_button() {
	document.getElementById("range_red").value=0;
	document.getElementById("range_green").value=255;
	document.getElementById("range_blue").value=0;
	document.getElementById("range_white").value=0;
	buffer_update();
}

function blue_button() {
	document.getElementById("range_red").value=0;
	document.getElementById("range_green").value=0;
	document.getElementById("range_blue").value=255;
	document.getElementById("range_white").value=0;
	buffer_update();
}

function white_button() {
	document.getElementById("range_red").value=0;
	document.getElementById("range_green").value=0;
	document.getElementById("range_blue").value=0;
	document.getElementById("range_white").value=255;
	buffer_update();
}

function yellow_button() {
	document.getElementById("range_red").value=255;
	document.getElementById("range_green").value=255;
	document.getElementById("range_blue").value=0;
	document.getElementById("range_white").value=0;
	buffer_update();
}

function magenta_button() {
	document.getElementById("range_red").value=255;
	document.getElementById("range_green").value=0;
	document.getElementById("range_blue").value=255;
	document.getElementById("range_white").value=0;
	buffer_update();
}

function all_button() {
	if ($("#all_button").text()=="ALL") {
		for (i=1;i<=9;i++) {
			document.getElementById("par" + i).checked=true;
		}
		$("#all_button").text("NONE");
	} else {
		for (i=1;i<=9;i++) {
			document.getElementById("par" + i).checked=false;
		}
		$("#all_button").text("ALL");
	}
}


// Aggiorna il buffer DMX in ram in base allo stato dei singoli slider	

function buffer_update() {
	var red=document.getElementById("range_red").value;
	var green=document.getElementById("range_green").value;
	var blue=document.getElementById("range_blue").value;
	var white=document.getElementById("range_white").value;
	var brightness=document.getElementById("range_brightness").value;
	var speed=document.getElementById("range_speed").value;

	document.getElementById("red").innerHTML=toHex(red);
	document.getElementById("green").innerHTML=toHex(green);
	document.getElementById("blue").innerHTML=toHex(blue);
	document.getElementById("white").innerHTML=toHex(white);
	document.getElementById("brightness").innerHTML=toHex(brightness);
	document.getElementById("speed").innerHTML=toHex(speed);

	dmx_color=document.getElementById("color_display").style["background-color"]="rgb(" + red + "," + green + "," + blue + ")";

	for (i=1;i<=9;i++) {
		if (document.getElementById("par" + i).checked===true) {
			dmxbuffer[(i-1)*9+2]=brightness;
			dmxbuffer[(i-1)*9+3]=red;
			dmxbuffer[(i-1)*9+4]=green;
			dmxbuffer[(i-1)*9+5]=blue;
			dmxbuffer[(i-1)*9+6]=white;
			dmxbuffer[(i-1)*9+7]=speed;
		}
	}
	dumpDMXbuffer();
}

var canvas;
var context;

function getxy(e){
	if (mouseDown==1) {

		var posx = e.clientX-$("#xypad").offset().left;
		var posy = e.clientY-$("#xypad").offset().top;

		if (posx<0) posx=0;
		if (posx>320) posx=320;
		if (posy<0) posy=0;
		if (posy>160) posy=160;

		var pan=Math.round((posx/(320/170)));
		var tilt=Math.round((posy/(160/255)));

		$("#pan").html(pan);
		$("#tilt").html(tilt);

		for (i=1;i<=9;i++) {
			if (document.getElementById("par" + i).checked===true) {
				dmxbuffer[(i-1)*9+0]=pan;
				dmxbuffer[(i-1)*9+1]=tilt;
			}
		}
		dumpDMXbuffer();
	}
}

$(document).ready(function() {
	for (i=0;i<dmxbuffer.byteLength;i++) dmxbuffer[i]=0;
	dumpDMXbuffer();

	canvas = document.getElementById("xypad");
	context = canvas.getContext("2d");

	$(".save_button").dblclick(function() {
		var name = $(this).prev().val();
		var slot = $(this).attr("slot");
	    $('#debug_msg').text("Save \"" + name + "\""  + " Slot: " + slot);
		uibuilder.send({"topic":"save","name":name,"slot":slot});
		$(this).prev().css("background-color","red");	
		setTimeout(function(a){ a.css("background-color","white"); }, 500, $(this).prev());
	});
		
	$(".load_button").click(function() {
		var scene_name = $(this).next().val();
	    $('#debug_msg').text("Load \"" + scene_name + "\"");
		uibuilder.send({"topic":"load","payload":scene_name});
	});

	uibuilder.send({"topic":"init"});

	//setInterval(function(){ dumpDMXbuffer(); }, 500);
}); 
