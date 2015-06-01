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
/* global prevClickedElement */

function DefaultValues(){ //remember that this is an bject, not a proper function
	this.initialFields=1;
	this.theme="default";
	this.minFields=1;
	this.maxFields=7;
	this.fieldsName="default";
	this.variableLength=true;
	this.allowMoreFields=false;
	this.horizontalLines=false;
        this.smartResize=true;
}
/* Initialization of enum*/
var defaultValues=Object.freeze(new DefaultValues());

var themeList=Object.freeze(["default","google","apple","windows10","weird"]);

var multiDinamicInputFieldsList=new Array();

// This variable is updated each time that the focus change
var prevFocusedIndex=null;
var prevFocusedElement=null;

/*
 * Find the index of serached wrapper
 * @param {Object} target is the wrapper (in jQuery object)
 * @returns {Number} index of the target into the array multiDinamicInputFieldsList
 */
function findInMDIFList(target){
    var index=-1;
    var i=0;
    while(i<multiDinamicInputFieldsList.length&&index===-1){
        var aaa=multiDinamicInputFieldsList[i].wrapper;
        if(target.is(aaa)){
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
    if(this.wrapper.length !==1){
        console.log( "You have mistakes with wrapper identifier: --"+wrapperName+"--. It should be an existent ID ( => single ). The MDIF's initialization is quitted." );
        return;
    }

    if($.inArray(this.options.theme,themeList)===-1){
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

    $(this.wrapper).append("<span id=\"mokeText\" style=\"display:none\"></span>");


    //Init the lines
    if(this.options.horizontalLines){
        this.adjustLines();
    }


	//NB: add button is defined as an array, so it can contain more elements (more trigger button) without any problem
    $(this.add_button).click(function(e){
    	e.preventDefault();
    	var targetId=this.getAttribute("data-target");

    	var index=findInMDIFList($(targetId));

    	//focus on last element to simulate the "tab" press on the last .myInput. I know that it's not the best solution.
    	$(multiDinamicInputFieldsList[index].wrapperName).find(".myInput-"+multiDinamicInputFieldsList[index].options.theme+":last").focus();
        multiDinamicInputFieldsList[index].addInput();
        e.stopPropagation();
    });

    $(this.wrapper).on("click",".remove_field", function(e){ //user click on remove text
        e.preventDefault();
        var index=findInMDIFList($(this).parent().parent());
        multiDinamicInputFieldsList[index].removeInput(this,true);
        
    });

    $(this.wrapper).on("click",".inputAndCloseWrapper-"+this.options.theme,function(e){
        e.stopPropagation();
    });
    
    $(this.wrapper).click(function(e){
        var index=findInMDIFList($(e.currentTarget));
        if((prevFocusedIndex===null&&prevFocusedElement===null)
            ||
           (prevFocusedIndex>=0&&index!==prevFocusedIndex)){
           multiDinamicInputFieldsList[index].addInput();
       }
    });

    /*NB: keydown and key press are pretty different! keydown should be used to detect the button, not the symbol. I don't know why, but it doesn't work properly with all button. I mean, same symbol on the same button have different code... Maybe it is duw to keyboard layout.
    keypress should be used to detect the specific symbol pressed. This mean that it considers modificator like shift or alt. Thus, if you press and release only "shift", the trigger doesn't fire.
    */
    $(this.wrapper).on("keydown",".myInput-"+this.options.theme,/*keydown*/(function(event) {
    	var code= (event.which);
    	var index=findInMDIFList($(this).parent().parent());

    	// 9 is the code for tab. Not shift because i want to navigate backward
    	if(code===9&&!event.shiftKey){
            if(multiDinamicInputFieldsList[index].addInput(event)){
                event.preventDefault();
	    }
    	// 8 is the code for DEL
    	}else if(code===8&&$(this).val()===""){
            event.preventDefault();
            multiDinamicInputFieldsList[index].removeInput(this,true);
    	}else if(code===8){
            multiDinamicInputFieldsList[index].resizeInput(this,null);
        }
    }));

    $(this.wrapper).on("keypress",".myInput-"+this.options.theme,(function(event) {
    	var code= event.which;
    	var asd=$(this).parent().parent();
    	var index=findInMDIFList($(this).parent().parent());

    	// 44 and 59 are the codes for , ;
    	if(code===44||code===59){
            event.preventDefault();
            multiDinamicInputFieldsList[index].addInput();
    	}else{
            var char=String.fromCharCode(event.which);
            multiDinamicInputFieldsList[index].resizeInput(this,char);
        }

    }));
    //////////////////////////////////////////// LOOK ABOVE
    
        
    $(this.wrapper).focusout(function(e){
        prevFocusedIndex=findInMDIFList($(e.currentTarget));
        prevFocusedElement=e.target;
    });
    
    $(this.wrapper).focusin(function(e){
        if(prevFocusedIndex!==null){
            var index=findInMDIFList($(e.currentTarget));
            if(prevFocusedIndex===index){
                console.log("Focusin: Sono ancora dello stesso wrapper");
            }else{
                console.log("Focusin: Wrapper cambiato");
                if(multiDinamicInputFieldsList[prevFocusedIndex].x>1){
                    var lastInput=multiDinamicInputFieldsList[prevFocusedIndex].wrapper.find("input:last");    
                    if(lastInput.val()===""){
                        multiDinamicInputFieldsList[prevFocusedIndex].removeInput(lastInput,false);
                    }
                    
                }
                prevFocusedIndex=null;
                prevFocusedElement=null;
            }
        }
    });
    
    /*
     * This is called each time that an element in the entire document get a click. This is need only to remove when you lose the "focus"
     */
    $(document).on("click","",function(event){
        //this first if is a simple optimization to avoid the execution of the for cycle due to the continue and multiple recall when a click occurs
        if(prevFocusedElement!==null&&prevFocusedIndex!==null){
            var foundPrevious=false;
            for(var i=0; i<multiDinamicInputFieldsList.length;i++){
                if(multiDinamicInputFieldsList[i].wrapper.find("*").is(prevFocusedElement)||multiDinamicInputFieldsList[i].wrapper===$(prevFocusedElement)){
                    foundPrevious=true;
                }
            }

            var foundCurrent=false;
            for(var i=0; i<multiDinamicInputFieldsList.length;i++){
                if(multiDinamicInputFieldsList[i].wrapper.find("*").is(event.target)||multiDinamicInputFieldsList[i].wrapper===$(event.target)){
                    foundCurrent=true;
                }
            }
            if(!foundCurrent&&foundPrevious){
                var lastInput=multiDinamicInputFieldsList[prevFocusedIndex].wrapper.find("input:last");
                if(lastInput.val()===""){
                    multiDinamicInputFieldsList[prevFocusedIndex].removeInput(lastInput,false);
                }

                prevFocusedElement=null;
                prevFocusedIndex=null;
            }
        }
    });
    
    $(this.add_button).focusin(function(e){
        if(prevFocusedIndex!==null){
            var index=findInMDIFList($(e.currentTarget));
            if(prevFocusedIndex===index){
                console.log("Focusin: Sono ancora dello stesso wrapper");
            }else{
                console.log("Focusin: Wrapper cambiato");
                if(multiDinamicInputFieldsList[prevFocusedIndex].x>1){
                    var lastInput=multiDinamicInputFieldsList[prevFocusedIndex].wrapper.find("input:last");    
                    if(lastInput.val()===""){
                        multiDinamicInputFieldsList[prevFocusedIndex].removeInput(lastInput,false);
                    }
                    
                }
                prevFocusedElement=null;
                prevFocusedIndex=null;
            }
        } 
    });
    
}

/*
 * This fucntion add a new input a do all the control necessary to verify if adding a new field is really necessary.
 * @returns {Boolean} Return true if the new inputField is effectively added, otherwise false
 */
MultiDinamicInputFields.prototype.addInput=function(){ //on add input button click
	//alert(this.wrapperName);
	var lastElem=$(this.wrapperName + ' .inputAndCloseWrapper-'+this.options.theme+':last').find(".myInput-"+this.options.theme)[0];
	var actualFocused=$( document.activeElement )[0];
	//In practise, verdetto tell me if the focus is on one of the input text
	var verdetto=$.inArray(actualFocused,$(this.wrapperName + ' .inputAndCloseWrapper-'+this.options.theme+' .myInput-'+this.options.theme));
	if(verdetto>=0&&actualFocused!=lastElem){
            //this branch is not useful because the normal function of tab is to go to the next element
	}else if(verdetto>=0&&actualFocused==lastElem&&this.options.allowMoreFields!==true&&lastElem.value===""){
		//do nothing :)
	}else if(this.options.maxFields===0 || this.x < this.options.maxFields){ //max input box allowed
	    this.x++; //text box increment
	    $(this.wrapper).append(
	    '<div class="inputAndCloseWrapper-'+this.options.theme+'">'+
	    	'<input type="text" size="5" name="'+this.options.fieldsName+'[]" class="myInput-'+this.options.theme+'" />'+
	    	'<div class="remove_field hide removeFieldDiv-'+this.options.theme+'">'+
	    		'<div class="separator-'+this.options.theme+'"></div>'+
	    		'<div class="closeSymbol-'+this.options.theme+' " ></div>'+
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

/*
 * Remove an element from the wrapper
 * @param {type} baseElement html element to remove (not jQuery)
 * @param {boolean} searchNewFocus true if you want to set automatically the new focus on the previous field
 * @returns {undefined}
 */
MultiDinamicInputFields.prototype.removeInput=function(baseElement,searchNewFocus){
	if(this.x===1){
            $(baseElement).parent().find("input").val("");
            if(searchNewFocus){
                $(baseElement).parent().find("input").focus();
            }
	}
	if(this.x>1){
            if(searchNewFocus===true){
                var futureFocused0=$(baseElement).parent();
                var futureFocused=futureFocused0.prev();
                if(futureFocused.is("hr")){//back again. Assumend that the lines are in the start point and consecutive
                    futureFocused=$(baseElement).parent().next();
                }
                if(futureFocused.length===0){
                    futureFocused=$(baseElement).parent().next();
                }
                var aux=futureFocused.find("input");
                aux.focus();
            }
            $(baseElement).parent().remove();
            this.x--;
            this.adjustLines();
	}
};

MultiDinamicInputFields.prototype.adjustLines=function(){
	if(this.options.horizontalLines){
		var lines=this.whichLinesAreOccupied();
		if(this.needMoreOrLessLines()!==0){
			//IDEA: remove all the lines and add what is necessary
			this.wrapper.find("hr").remove();

			var inputHeight=this.wrapper.find(".myInput-"+this.options.theme).css("height");
			if(inputHeight.substr(inputHeight.length -2)==="px"){
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
};

/*
 * Find the number of line that should be add or remove (negative number is returned)
 * @returns {MultiDinamicInputFields.wrapper.find.length|MultiDinamicInputFields@call;whichLinesAreOccupied@pro;length}
 */
MultiDinamicInputFields.prototype.needMoreOrLessLines=function(){
    var numberOfExistingLines=this.wrapper.find("hr").length;
    var numberLines=this.whichLinesAreOccupied().length;
    return numberLines-numberOfExistingLines;
};

/*
 * Calculate the lines necessary to support all the existing input fields. 
 * @returns {Array|MultiDinamicInputFields.prototype.whichLinesAreOccupied.positionArray} Array with all the distinct top position of input fields.
 */
MultiDinamicInputFields.prototype.whichLinesAreOccupied=function(){
	var positionArray=new Array();
	$(this.wrapperName).find(".inputAndCloseWrapper-"+this.options.theme).each(
            function(index){
                //some unknown error: the position isn't relative to the parent but sem to entire doc. I also tried with other div...
                var top=$(this).position().top;
                if($.inArray(top,positionArray)===-1){
                    positionArray.push(top);
                }
            }
        );
    return positionArray;
};

/*
 * Resize an input box.
 * @param {Object} HTML element (not jQuery).
 * @returns {undefined}
 */
MultiDinamicInputFields.prototype.resizeInput=function (elem, char) {
    if(this.options.smartResize){
        var text=$(elem).val();
        if(char!==null){
            text+=char;
        }else{
            text=text.substr(0,text.length-1);
        }
        
        this.wrapper.find("span").text(text);
        this.wrapper.find("span").css("font-size",$(elem).css("font-size"));
        
        //Find the width of the close div
        var widthClose=this.wrapper.find(".removeFieldDiv-"+this.options.theme).width();
       
       //15 is constant and take into account margin a border
        var num=this.wrapper.find("span").width()+15+widthClose;
        var as=this.wrapper.find("span").width();
        $(elem).css("width",num+"px");
    }else{
        $(elem).css("width","auto");
        $(elem).attr('size', $(elem).val().length+5);
    }   
};

/*
 * Funtion to init the wrapper: it's not necessary recall the real constructor
 * @param {String} wrapperName
 * @param {Object} options
 * @returns {undefined}
 */
function newMultiDinamicInputFields(wrapperName,options){
	multiDinamicInputFieldsList.push(new MultiDinamicInputFields(wrapperName,options));
}

// I need to store the last focused element to have more precise control about the creation on input field 
// when a user clicks on a wrapper (but not on its fields)
$(document).ready(function() {
    
});