/*
	THIS file contains all the necessary to add a multiple dinamic email address list in your web page.
	Requirement: jQuery of course, and bootstrap for GUI
	Use: insert in your HTML a div with class multiDinamicInputFields and an ID (e.g myWrapper). THEN, you need to init the element. The command is very simple: newMultiDinamicInputFields(String wrapperID, Object options)
	
	Options:
		NAME			DEFAULT VALUE
		initialFields	1
		theme			"default"
		minFields		1			specify min number of fields
		minFields		10			specify max number of fields. 0 to set infinte (approximately).
		fieldsName		"default"		specify the attrib name of input element. Note: a pair of squared brackets it's added to the name to support send multiple input in PHP (or other languages)
		variableLength	true
		allowMoreFields	false
	
	Button element: one ore more element can be bind to a specific wrapper to add a new field manually. This buttom must have the class add_field_button. It requires 1 extra html tag:
		data-target: (default: -)		This attribute have to insert in a button element. Specify the wrapper ID to link the button element to that wrapper. This allow to insert new field when you press that button. eg: #myWrapperID (note the #).
*/

 /*
	RANDOM NOTE about code
	1. jQuery function as prev, next, find parent etc return always array, even if the element is single.
 */



/*
	This object (ENUMERATION) contains all the default values.
*/
function DefaultValues(){ //remember that this is an bject, not a proper function
	this.initialFields=1;
	this.theme="default";
	this.minFields=1;
	this.maxFields=7;
	this.fieldsName="default";
	this.variableLength=true;
	this.allowMoreFields=false;
	this.horizontalLines=false;
}
/* Initialization of enum*/
var defaultValues=Object.freeze(new DefaultValues());

var themeList=Object.freeze(["default","google","apple","windows10"]);

var multiDinamicInputFieldsList=new Array();
function findInMDIFList(target){
	var prova=target[0];
	var index=-1;
	var i=0;
	while(i<multiDinamicInputFieldsList.length&&index==-1){
		/* i don't know why aaaaa and aaaa are different*/
		var aaaa=multiDinamicInputFieldsList[i].wrapper[0];
		var aaa=multiDinamicInputFieldsList[i].wrapper;
		var aaaaa=aaa[0];
    	if(aaa[0]==target[0]){
	    	index=i;
    	}else{
	    	i++;
    	}
    }
    return index;
}

/*
	Class to store all the data about one MultiDinamicInputFields
*/
function MultiDinamicInputFields(wrapperName,options){
	if(options===undefined){
		options=new Object();
	}
	
	this.options	= $.extend({},defaultValues,options);
	this.x			= 0;
	this.wrapperName= wrapperName;
	this.wrapper	= $(wrapperName);
	if(this.wrapper.length !=1){
		console.log( "You have mistakes with wrapper identifier: --"+wrapperName+"--. It should be an existent ID ( => single ). The MDIF's initialization is quitted." );
		return;
	}
	
	if($.inArray(this.options.theme,themeList)==-1){		
		this.options.theme="default";
		console.log("Warning: you are setting an unknown theme: assumed default.");
	}
	
	this.add_button	= $("button[data-target=\""+wrapperName+"\"]"); //Add button ID
	
	//This weird code serves to init the corrent number of fields ignoring the option allowMoreFields
	this.options.allowMoreFields=true;
	for(var i=0;i<this.options.initialFields;i++){
		this.addInput();
	}
	if(options.hasOwnProperty("allowMoreFields")){
		this.options.allowMoreFields=options.allowMoreFields;
	}else{
		this.options.allowMoreFields=defaultValues.allowMoreFields;
	}
	
	
	
	//Init the lines
	if(this.options.horizontalLines){
		this.adjustLines();
	}
	
	
	//NB: add button is defined as an array, so it can contain more elements (more trigger button) without any problem 
    $(this.add_button).click(function(e){
    	event.preventDefault();
    	var targetId=this.getAttribute("data-target");
    	
    	var index=findInMDIFList($(targetId));
    	
    	//focus on last element to simulate the "tab" press on the last .myInput. I know that it's not the best solution.
    	$(multiDinamicInputFieldsList[index].wrapperName).find(".myInput-"+multiDinamicInputFieldsList[index].options.theme+":last").focus();
        multiDinamicInputFieldsList[index].addInput();
    });
    
    $(this.wrapper).on("click",".remove_field", function(e){ //user click on remove text
        e.stopPropagation();
        e.preventDefault();
        var index=findInMDIFList($(this).parent().parent());
        multiDinamicInputFieldsList[index].removeInput(this);
    });

	$(this.wrapper).on("click",".inputAndCloseWrapper-"+this.options.theme,function(e){
		/*Necessary to avoid the triggering of click binded to the entire wrapper*/
		e.stopPropagation(); 
	});
	
	/*This fires and create a new input field.*/
	$(this.wrapperName).click(function(e){
		var a=$(e.currentTarget);
		var index=findInMDIFList($(e.currentTarget));
	});
	
	
    /*NB: keydown and key press are pretty different! keydown should be used to detect the button, not the symbol. I don't know why, but it doesn't work properly with all button. I mean, same symbol on the same button have different code... Maybe it is duw to keyboard layout. 
    keypress should be used to detect the specific symbol pressed. This mean that it considers modificator like shift or alt. Thus, if you press and release only "shift", the trigger doesn't fire.
    */
	$(this.wrapper).on("keydown",".myInput-"+this.options.theme,/*keydown*/(function(event) {
    	var code= (event.which);
    	var index=findInMDIFList($(this).parent().parent());	    	
    	
    	// 9 is the code for tab. Not shift because i want to navigate backward
    	if(code==9&&!event.shiftKey){
    		if(multiDinamicInputFieldsList[index].addInput(event)){
	    		event.preventDefault();
	    	}
    	// 8 is the code for DEL
    	}else if(code==8&&$(this).val()==""){
    		event.preventDefault();
			multiDinamicInputFieldsList[index].removeInput(this);
    	}
		}));

    $(this.wrapper).on("keypress",".myInput-"+this.options.theme,(function(event) {
    	var code= (event.which);
    	var asd=$(this).parent().parent();
    	var index=findInMDIFList($(this).parent().parent());
    	
    	resizeInput(this);
    	// 44 and 59 are the codes for , ;
    	if(code==44||code==59){
    		event.preventDefault();
    		multiDinamicInputFieldsList[index].addInput();
    	}
			
		}));
		//////////////////////////////////////////// LOOK ABOVE
	
}

 /*
	 Return true if the new inputField is effectively added, otherwise false
*/
MultiDinamicInputFields.prototype.addInput=function(){ //on add input button click
	//alert(this.wrapperName);
	var lastElem=$(this.wrapperName + ' .inputAndCloseWrapper-'+this.options.theme+':last').find(".myInput-"+this.options.theme)[0];
	var actualFocused=$( document.activeElement )[0];
	//In practise, verdetto tell me if the focus is on one of the input text
	var verdetto=$.inArray(actualFocused,$(this.wrapperName + ' .inputAndCloseWrapper-'+this.options.theme+' .myInput-'+this.options.theme));
	if(verdetto>=0&&actualFocused!=lastElem){
		//this line is not use ful because the normal function of tab is to go to the next element
		//$( document.activeElement ).parent().next().find(".myInput-"+this.options.theme).focus();
	}else if(verdetto>=0&&actualFocused==lastElem&&this.options.allowMoreFields!=true&&lastElem.value==""){
		//do nothing :)
	}else if(this.options.maxFields==0 || this.x < this.options.maxFields){ //max input box allowed
	    this.x++; //text box increment
	    $(this.wrapper).append(
	    '<div class="inputAndCloseWrapper-'+this.options.theme+'">'+
	    	'<input type="text" size="5" name="'+this.options.fieldsName+'[]" class="myInput-'+this.options.theme+'" />'+
	    	'<div class="remove_field hide removeFieldDiv-'+this.options.theme+'">'+
	    		'<div class="separator-'+this.options.theme+'"></div>'+
	    		'<img class="closeSymbol-'+this.options.theme+' " src="img/x.png" />'+
	    	'</div>'+
	    '</div>'); //add input box
	    $(this.wrapperName+" .inputAndCloseWrapper-"+this.options.theme+":last").hover(
//very dangerous due to the fact that this is the entire window. I HAVE TO CORRECT THIS
			function(){$( this).find($(".remove_field")) .removeClass("hide");},
			function(){$( this).find($(".remove_field")) .addClass("hide");});
		//automatic focus on the last inserted, otherwise you can navigate the dom to find the last
		var aaa=$(this.wrapperName+" .myInput-"+this.options.theme+":last");
		$(this.wrapperName+" .myInput-"+this.options.theme+":last").focus(); //even without ":last" the methods works because, I suppose, it applies focus() to each element in the array, until it reaches the last (element that keeps the focus)
		this.adjustLines();
		return true;
	}
	return false;
};

MultiDinamicInputFields.prototype.removeInput=function(baseElement){
	if(this.x==1){
		$(baseElement).parent().find("input").val("");
		$(baseElement).parent().find("input").focus();
	}
	if(this.x>1){
		var futureFocused0=$(baseElement).parent();
		var futureFocused=futureFocused0.prev();
		if(futureFocused.is("hr")){//back again. Assumend that the lines aren't consecutive
			futureFocused=futureFocused.prev();
		}
		if(futureFocused.length==0){
			futureFocused=$(baseElement).parent().next();
		}
		var aux=futureFocused.find("input");
		aux.focus(); //non va se c'è la linea
		$(baseElement).parent().remove(); 
		this.x--;
		this.adjustLines();
	}
}

MultiDinamicInputFields.prototype.adjustLines=function(){
	if(this.options.horizontalLines){
		var lines=this.whichLinesAreOccupied();
		if(this.needMoreOrLessLines()!=0){
			//IDEA: remove all the lines and add what is necessary
			this.wrapper.find("hr").remove();

			var inputHeight=this.wrapper.find(".myInput-"+this.options.theme).css("height");
			if(inputHeight.substr(inputHeight.length -2)=="px"){
				var inputHeightNumber=parseInt(inputHeight.substr(0,inputHeight.length -2));
			}else{
				console.log("You should specify the height of input in px");
			}
			for(var line in lines){
				var offset=parseInt(lines[line])+parseInt(inputHeightNumber)+1;
				this.wrapper.prepend('<hr class=\"horizontalLine\" style=\"top:'+offset+'px;\" />');
			}
			
		}
	}
}

MultiDinamicInputFields.prototype.needMoreOrLessLines=function(){
	var numberOfExistingLines=this.wrapper.find("hr").length;
	var numberLines=this.whichLinesAreOccupied().length;
	return numberLines-numberOfExistingLines;
}

MultiDinamicInputFields.prototype.whichLinesAreOccupied=function(){
	var positionArray=new Array();
	var aaa=$(this.wrapperName).find(".inputAndCloseWrapper-"+this.options.theme).each(
		function(index){
			//some unknown error: the position isn't relative to the parent but sem to entire doc. I also tried with other div...
			var top=$(this).position().top;
			if($.inArray(top,positionArray)==-1){
				positionArray.push(top);
			}
		}
		);
	return positionArray;
}

function resizeInput(elem) {
	$(elem).css("width","auto");
    $(elem).attr('size', $(elem).val().length+5);
}

function newMultiDinamicInputFields(wrapperName,options){
	multiDinamicInputFieldsList.push(new MultiDinamicInputFields(wrapperName,options));
}

$(document).ready(function() {});