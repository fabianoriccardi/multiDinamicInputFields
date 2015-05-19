/*
	defaultRequiredAttributes is an object that contains key=>defaultValue pairs. If the object doesn't have 1 one or more property, it is added and initializated with the defaultValue.
*/
function JSONCorrector(defaultRequiredAttributes, object){
	var newObject=$.extend({},object);
	if(defaultRequiredAttributes===undefined||object===undefined){
		console.log("One of the 2 paramenter passed to JSONCorrector is undefined. Are you sure that you are properly coding?");
		return ;
	}
	for(var key in defaultRequiredAttributes){
		if(!newObject.hasOwnProperty(key)){
			newObject[key]=defaultRequiredAttributes[key];
		}
	}
	return newObject;
}