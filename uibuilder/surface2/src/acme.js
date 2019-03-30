var mouseDown = 0;
var dmxbuffer = new Uint8Array(81);

// Convert an int to ASCII hex

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
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

}

document.onmousedown = function() { 
	if (mouseDown<=0) {
		++mouseDown;
	}
}

document.onmouseup = function() {
	if (mouseDown>=0) {
		--mouseDown;
	}
}

function click_button() {
	uibuilder.send({"topic":"click","payload":true});
}

function buffer_update(id,value) {

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
			/*
			dmxbuffer[(i-1)*9+2]=brightness;
			dmxbuffer[(i-1)*9+3]=red;
			dmxbuffer[(i-1)*9+4]=green;
			dmxbuffer[(i-1)*9+5]=blue;
			dmxbuffer[(i-1)*9+6]=white;
			dmxbuffer[(i-1)*9+7]=speed;
			*/
			uibuilder.send({"topic":i,"payload": {"brightness":brightness,"red":red,"green":green,"blue":blue,"white":white,"speed":speed}});
		}
	}
	//dumpDMXbuffer();
}

var canvas;
var context;

function getxy(e){
	if (mouseDown==1) {
		canvas = document.getElementById("xypad");
		context = canvas.getContext("2d");

		var posx = e.clientX-$("#xypad").offset().left;
		var posy = e.clientY-$("#xypad").offset().top;

		if (posx<0) posx=0;
		if (posx>200) posx=200;
		if (posy<0) posy=0;
		if (posy>200) posy=200;
		
		var pan=Math.round((posx/(200/100)));
		var tilt=Math.round((posy/(200/100)));

		$("#pan").html(pan);
		$("#tilt").html(tilt);

		for (i=1;i<=9;i++) {
			if (document.getElementById("par" + i).checked===true) {
				uibuilder.send({"topic":i,"payload": {"pan":pan,"tilt":tilt}});
				//dmxbuffer[(i-1)*9+0]=pan;
				//dmxbuffer[(i-1)*9+1]=tilt;
			}
		}
	}
}

$(document).ready(function() {
	for (i=0;i<dmxbuffer.byteLength;i++) dmxbuffer[i]=0;
	dumpDMXbuffer();

	//setInterval(function(){ dumpDMXbuffer(); }, 500);

//	$("#range_red").change(function() {
//		$("#red").html($("#range_red").val());
//	});
}); 
