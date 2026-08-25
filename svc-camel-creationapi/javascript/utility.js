var XPathConstants = Java.type('javax.xml.xpath.XPathConstants');
var XPathFactory = Java.type('javax.xml.xpath.XPathFactory');
var HashMap = Java.type('java.util.HashMap');
var Entry = Java.type('java.util.Map.Entry');
var BigDecimal = Java.type('java.math.BigDecimal');
var JavaDate = Java.type('java.util.Date');
var System = Java.type('java.lang.System');
var ArrayList = Java.type("java.util.ArrayList");
var DocumentBuilderFactory = Java.type("javax.xml.parsers.DocumentBuilderFactory");
//var Logger = Java.type("org.apache.log4j.Logger");
var Logger = Java.type("org.slf4j.Logger");
var Logger = Java.type("org.slf4j.LoggerFactory");
var logger = Logger.getLogger("JavaScript");
var JSHelperClass = Java.type("ai.pelican.camel.utils.JSHelperClass");
var EncryptDecrypt = Java.type("ai.pelican.camel.authentication.EncryptDecrypt");
var DocumentBuilderFactory = Java.type('javax.xml.parsers.DocumentBuilderFactory');
var TransformerFactory = Java.type('javax.xml.transform.TransformerFactory');
var StringWriter = Java.type('java.io.StringWriter');
var DOMSource = Java.type('javax.xml.transform.dom.DOMSource');
var StreamResult = Java.type('javax.xml.transform.stream.StreamResult');

/*
**
* This function is called when any exception is encountered. Header variable PLCN_exceptionFlag is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function onException(exchange) { 
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();    

    logger.info("In onException");

    setHeader(map, "PLCN_exceptionFlag", true);
    setHeader(map, "PLCN_validMessage", false);
    setHeader(map, "status", "XSD invalid");

    createResponse(exchange);
}

/*
**
* This function sets the given value to header.
* @param {String} key - The key.
* @param {HashMap} map - The header values.
* @param {String} value - header value.
*/
function setHeader(map, key, value) {

	map.put(key, value);
}

/*
**
* This function retrieves the value from header.
* @param {String} key -
* @param {HashMap} map - The header values.
* @returns {String} returns value.
*/
function getHeader(map, key) {
	var value;

	value = map.get(key);

	if(value === null) {
		key = replacePattern(key, "PLCN_", "PLCNAPI_");
		logger.trace("getHeader: key = " + key);
		value = map.get(key);
		logger.trace("getHeader: value = " + value);

		if(value === null) {
			return "";
		}
	}
	return value;
}

/*
**
* This function returns the value for the specified key, from the specified Table stored in memory. 
* @param {String} key - The string containing the Key in the table
* @param {HashMap} map - The header values.
* @param {String} tableName - The string containing the name of the table
* @returns {String} returns value else returns empty string if the key or the table does not exist.
*/
function memTblGetTableValue(map, tableName, key) {
	var hazelCastInstance;
	var hazelcastMap;
	var value;
	var jsHelperClass;

	jsHelperClass = new JSHelperClass();
	value = jsHelperClass.getHzlMapValue(map, tableName, key);

	if(value) {
		value = value.trim();
	}

	return value;
}

/*
**
* This function sets the value for the specified key, in the specified Table stored in Hazelcast.
* @param {String} key - The string containing key in the table.
* @param {String} value - The value of the key to be set.
* @param {HashMap} map - The header values.
* @param {String} tableName - The string containing the name of the table.
*/
function memTblSetTableValue(map, tableName, key, value) {
	var hazelCastInstance;
	var hazelcastMap;
	var value;

	var jsHelperClass = new JSHelperClass();
	jsHelperClass.setHzlMapValue(map, tableName, key, value);
}

function createElementwithTextNode(document, rootElement, elementName, elementValue){
	var element = document.createElement(elementName);
	element.appendChild(document.createTextNode(elementValue));
	rootElement.appendChild(element);
	return element;
}

function createElementwithTextNode2(document, elementName, elementValue){
    var element = document.createElement(elementName);
    element.appendChild(document.createTextNode(elementValue));
    return element;
}

/*
**
* This function converts string to document.
* @param {String} inputFile - Input string.
* @returns {Document} doc - Converted Document.
*/
function createDocument(inputFile){
	logger.trace("createDocument: inputFile = " + inputFile);
	var dbFactory = DocumentBuilderFactory.newInstance();
	var dBuilder = dbFactory.newDocumentBuilder();
	var doc = dBuilder.parse(new InputSource(new StringReader(inputFile)));
	doc.getDocumentElement().normalize();
	return doc;
}

function createAttribute(document, element, attributeName, attributeValue){
	var attribute = document.createAttribute(attributeName);
	attribute.setValue(attributeValue);
	element.setAttributeNode(attribute);	
}

function appendElementtoNode(document, element){
	document.appendChild(element);	
}

function createElement(document, elementName){
	var root = document.createElement(elementName);
	return root;
}

function getDocument(){
	var documentFactory = DocumentBuilderFactory.newInstance();
	var documentBuilder = documentFactory.newDocumentBuilder();
	var document = documentBuilder.newDocument();
	return document;
}

function convertDocumentToString(doc){
	var tf = TransformerFactory.newInstance();
	var transformer = tf.newTransformer();
	// below code to remove XML declaration
	//transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
	var writer = new StringWriter();
	transformer.transform(new DOMSource(doc), new StreamResult(writer));
	var output = writer.getBuffer().toString();
	//logger.info("convertDocumentToString: XML created:"+ output);
	return output;
}

/*
**
* This function converts node to string.
* @param {CamelExchange} exchange - The exchange.
*/
function node2String(node) {
    var domSource = new DOMSource(node);
    var writer = new StringWriter();
    var result = new StreamResult(writer);
    var tf = TransformerFactory.newInstance();
    var transformer = tf.newTransformer();
    transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
    transformer.transform(domSource, result);
    return writer.toString();
}

/*
**
* This function is used to form and set violation in header.
* @param {CamelExchange} exchange - The exchange.
* @returns {String} returns violation raised.
*/
function setCommentsForTransaction(fldCode, errorCode2, map) { //(71, 1560, map)
	var PLCN_txnComments;            
	var finalPLCN_txnComments;
	var currentPLCN_txnComments;
	var errorCode;
	var errorCode1;
	var errorCountAdd;
	var msgType;

	logger.info("setCommentsForTransaction: Invalid Message");

	setHeader(map, "PLCN_validFlag", false);

	//errorCountAdd = memTblGetTableValue(map, "STREAM_DETAILS", "errorCountAdd");
	errorCountAdd = getHeader(map, "PLCN_errorCountAdd"); //for testing

	if(fldCode) {
		errorCode2 = fldCode.concat("-".concat(errorCode2)); 
	}

	PLCN_txnComments = getHeader(map, 'PLCN_txnComments'); //for tetsing
	logger.info("setCommentsForTransaction: PLCN_txnComments = " + PLCN_txnComments);

	errorCode = strStr(errorCode2, "-"); 
	errorCode1 = removePattern(errorCode2, errorCode); 

	currentPLCN_txnComments = (('P'.concat(errorCode1)).concat('-1')).concat((':A00:'.concat(errorCode1)).concat(errorCode)); 
	finalPLCN_txnComments = genCommentsFormation(PLCN_txnComments, currentPLCN_txnComments, map);
	logger.info('setCommentsForTransaction: finalPLCN_txnComments = ' + finalPLCN_txnComments);

	setHeader(map, 'PLCN_txnComments', finalPLCN_txnComments);

	if(memTblGetTableValue(map, "STREAM_DETAILS", "MANUAL_MODE") != 'REPAIR') {
		//setHeader(map, "PLCN_epcCheckEnrichFlag", "N");//for testing
		if(getHeader(map, "PLCN_epcCheckEnrichFlag") != 'Y' || errorCountAdd == 'Y') {
			errorReportRuleCounterChkTaTxn(map);
		}
	}

	return finalPLCN_txnComments;
}

/*
**
* This function is used to generate violation in header.
* @param {CamelExchange} exchange - The exchange.
* @returns {String} returns violation raised.
*/
function genCommentsFormation(commentsPrev, commentsCurr, map) { //('', P71-1:A00:71-1560)
	var prevAftPresenceInfo;
	var prevBefPresenceInfo;
	var currAftPresenceInfo;
	var currBefPresenceInfo;
	var finalComment;

	//logger.info("In genCommentsFormation");

	prevAftPresenceInfo = strStr(commentsPrev, ":A00:"); //prevAftPresenceInfo = ''
	prevBefPresenceInfo = removePattern(commentsPrev, prevAftPresenceInfo); //prevBefPresenceInfo = ''

	currAftPresenceInfo = strStr(commentsCurr, ":A00:"); //currAftPresenceInfo = :A00:71-1560
	currBefPresenceInfo = removePattern(commentsCurr, currAftPresenceInfo); //currBefPresenceInfo = P71-1

	finalComment = prevBefPresenceInfo + currBefPresenceInfo + prevAftPresenceInfo + currAftPresenceInfo;
	finalComment = cleanupCommentsTa(finalComment, map);

	return finalComment;
}

/*
**
* This function is called for cleanup of comments
* @param {String} comments - The comments.
* @returns {String} returns final comment
*/
function cleanupCommentsTa(comments, map) { //(P71-1:A00:71-1560)
	var orgComments
	var pViolationInfo;
	var pViolationInfoNew;
	var pInfoCode;
	var pInfoTemp;
	var pViolation;
	var pViolationCode;
	var pViolationNew;
	var pViolationTemp;
	var pViolationFinal = '';
	var FldLength;
	var codeLength;
	var tmpCtr;
	var tmpCntr;
	var finalComments;
	var pInfoFinal = '';

	//logger.info("In cleanupCommentsTa");

	orgComments = comments; // orgComments = P71-1:A00:71-1560
	pViolation = strStr(comments, ":A00:"); // pViolation = :A00:71-1560
	pViolationNew = pViolation; // pViolationNew = :A00:71-1560
	pViolationInfo = removePattern(comments, pViolation); // pViolationInfo = P71-1
	pViolationInfoNew = pViolationInfo; // pViolationInfoNew = P71-1

	while(pViolationNew) { // pViolationNew = :A00:71-1560
		pViolationCode = dataBetweenTokens(":A00:", ":A00:", pViolationNew); //pViolationCode = 71-1560
		pViolationCode = ":A00:".concat(pViolationCode); // pViolationCode =  :A00:71-1560 
		pViolationTemp = pViolationCode; //pViolationTemp =  :A00:71-1560
		//logger.info('cleanupCommentsTa: pViolationCode = '+ pViolationCode);

		if(isPatternPresent(pViolationNew, pViolationCode)) { //(:A00:71-1560, :A00:71-1560)
			pViolationNew = replaceAllPattern(pViolationNew, pViolationCode, ""); // pViolationNew = ""
			pViolationFinal = pViolationFinal.concat(pViolationTemp); // pViolationFinal = :A00:71-1560
		}
	}

	while((pViolationInfoNew)) { // pViolationInfoNew = P71-1
		pInfoCode = dataBetweenTokens("P", "P", pViolationInfoNew); //71-1
		pInfoCode = "P".concat(pInfoCode); //P71-1

		if(pInfoCode != 'P') {
			pInfoTemp = pInfoCode; //P71-1

			if(isPatternPresent(pViolationInfoNew, pInfoCode)) {
			pViolationInfoNew = replaceAllPattern(pViolationInfoNew, pInfoCode, ""); // ''
			pInfoFinal = pInfoFinal.concat(pInfoTemp); //P71-1
		}
		}else {
			break;
		}
	}

	finalComments = pInfoFinal.concat(pViolationFinal); //P71-1:A00:71-1560
	return finalComments;
}

/*
**
* This function is called for cleanup of comments
* @param {String} comments - The comments.
* @returns {String} returns final comment
*/
function cleanupComments(comments) {
	var orgComments
	var pViolationInfo;
	var pViolationInfoNew;
	var pInfoCode;
	var pInfoTemp;
	var pViolation;
	var pViolationCode;
	var pViolationNew;
	var pViolationTemp;
	var pViolationFinal;
	var FldLength;
	var codeLength;
	var tmpCtr;
	var tmpCntr;
	var finalComments;
	var pInfoFinal;

	orgComments = comments;
	pViolation = strStr(comments, ":A00:");
	pViolationNew = pViolation;
	pViolationInfo = removePattern(comments, pViolation);
	pViolationInfoNew = pViolationInfo;

	while(pViolationNew) {
		pViolationCode = pViolationNew.strsub(0, 12);
		pViolationTemp = pViolationCode;

		if(isPatternPresent (pViolationNew, pViolationCode)) {
			pViolationNew = replaceAllPattern(pViolationNew, pViolationCode, "");
			pViolationFinal = pViolationFinal + pViolationTemp;
		}
	}

	while(pViolationInfoNew) {
		pInfoCode = pViolationInfoNew.substr(0, 5);
		pInfoTemp = pInfoCode;

		if(isPatternPresent(pViolationInfoNew, pInfoCode)) {
			pViolationInfoNew = replaceAllPattern(pViolationInfoNew, pInfoCode, "");
			pInfoFinal = pInfoFinal + pInfoTemp;
		}

		finalComments = pInfoFinal + pViolationFinal;
	}
}

function errorReportRuleCounterChkTaTxn(map) {
    var txnCounter;

    txnCounter = getHeader(map, "PLCN_txxnForceStopCounter");
    txnCounter++;
    setHeader(map, "PLCN_txxnForceStopCounter", txnCounter);
}

/*
**
* This function is called to fetch values from dnb and set in headet varaibles.
* @param {String} string - The string from which the pattern is to be replaced
* @param {String} search - The string containing the pattern to be replaced.
* @param {String} replace - The string containing the new pattern that is to be put in place of the Old Pattern.
* @returns {String} returns the String with the new pattern.
*/
function replaceAllPattern(string, search, replace) {

	return string.split(search).join(replace);
}

/*
**
* This function is called to
* @param {String} str - The target string.
* @param {String} char_pos - The string containing the pattern to be replaced.
* @returns {String} return 
*/
function removeCharacter(str, char_pos) {  
	if(str != null){
		part1 = str.substr(0, char_pos);
		part2 = str.substr(char_pos + 1, str.length);
		return (part1 + part2);
	}
} 

/*
**
* This function searches for the presence of the pattern, specified in the string PatternStr, in the string Str.
* @param {String} str - The target string.
* @param {String} PatternStrPatternStr - the string containing the pattern to be searched.
* @returns {String} returns true if it finds the pattern, else false.
*/
function isPatternPresent(str, PatternStr) {
	//logger.info("In isPatternPresent");
	//logger.info("isPatternPresent: str = " + str);
	//logger.info("isPatternPresent: PatternStr = " + PatternStr);

	if(PatternStr.length > 0) {
		if(str){
			var n = str.search(PatternStr);

			if(n == -1) {
				//logger.info("isPatternPresent: returning false");
				return false;
			}else {
				//logger.info("isPatternPresent: returning true");
				return true;
			}
		}else {
			//logger.info("isPatternPresent: returning false");
			return false;
		}		
	}else {
		return false;
	}
}

/*
**
* This function removes all non-alphanumeric characters from the given string and returns the resultant string.
* @param {String} str - The string which is to be cleaned.
* @returns {String} returns the string after removing all the non-alphanumeric characters from the given string.
*/
function cleanString(str) {    
	if(str != null){
		str = str.replaceAll("[^a-zA-Z0-9]", "");  
		return str; 
	}
} 

/*
**
* This function returns a string formed by deleting the string Pattern from the source string String. 
* @param {String} str - The target string.
* @param {String} Pattern - the string that is to be removed.
* @returns {String} returns new string, If the Pattern is not found, the return string is same as the source String.
*/
function removePattern(str, Pattern){   
	if(str != null){
		str = str.replace(Pattern, "");
		return str;
	}
}

/*
**
* This function is used to retrieve data between start token and end token. 
* @param {String} startTok - The start token
* @param {String} endTok - The end token
* @param {String} str - The target string.
* @returns {String} returns
*/
function dataBetweenTokens(startTok, endTok, str) {   
	var tempStr;
	var startTokLen;
	var data;
	var trimLen;

	data = "";
	trimLen = 0;

	startTokLen = startTok.length;
	tempStr = strStr(str, startTok);

	if(!tempStr) {
		return data;
	}

	tempStr = tempStr.substr((startTokLen ), (tempStr.length) - startTokLen);
	trimLen = strStr(tempStr, endTok).length;

	if(trimLen > 0) {
		data = tempStr.substr(0, (tempStr.length - trimLen));
	}else {
		data = tempStr;
	}

	return data;
}

/*
**
* This function checks if the given character is an alpha character. It returns True if the character is an alphabet character else it returns False.
* @param {String} inputtxt - A character.
* @returns {String} returns true if alphabet else returns false.
*/
function isAlpha(inputtxt) { 
	var letters = /^[A-Za-z]+$/;
	if (inputtxt.match(letters)) {
		return true;
	} else {
		return false;
	}		
}

/*
**
* This function removes all the characters from the string s1 before the first occurrence of the string s2 in the string s1
* @param {String} s1 - The string.
* @param {String} s2 - The string
* @returns {String} returns new string s1 if s2 is found in s1. null if s2 is not found in s1.
*/
function strStr(s1, s2){  
	var output = "";
	if(s1){
		if (s1.indexOf(s2)!= -1) {                                       
			output = s1.substr(s1.indexOf(s2));                        
		}
	}
	return output;
}

/*
**
* This function replaces the first occurrence of the pattern given in the string OldPattern with the pattern given in the string NewPattern from the string Str.
* @param {String} oldpattern - The string containing the pattern to be replaced.
* @param {String} newpattern - The string containing the new pattern that is to be put in place of the OldPattern.
* @param {String} str - the string from which the pattern is to be replaced.
* @returns {String} returns the string with the New Pattern in place of Old Pattern.
*/
function replacePattern(str, oldpattern, newpattern) {
	if(str)
	{
		var output = str.replace(oldpattern, newpattern);
		return output;
	}	
}

/*
**
* This function checks if the given string contains all digits.
* @param {String} inputtxt - the string which is to be checked for digits
* @returns {String} returns true if the string contains all digits else false.
*/
function isAllDigits(inputtxt) { 
	var Digits = /^[0-9]+$/;
	if (inputtxt.match(Digits)) {
		return true;
	} else {
		return false;
	}		
}

/*
**
* This function extracts endPos characters to form a substring from source string starting from the start position startPos.
* @param {String} startPos - An integer.
* @param {String} endPos - An integer.
* @param {String} string - The string.
* @returns {String} returns the substring extracted.
*/
function strSub(string, startPos, endPos){

	return string.substring(startPos,endPos);
}

/*
**
* This function checks if the given character is a digit
* @param {String} inputtxt -A character.
* @returns {String} returns False if inputtxt is not a decimal digit, else True if inputtxt is a decimal digit.
*/
function isDigit(inputtxt) {   
	var Digit = /^[0-9]+$/;
	if (inputtxt.match(Digit)) {
		return true;
	} else {
		return false;
	}		
}

/*
**
* This function replaces the nth occurrence of the pattern given in the string OldPattern with the pattern given in the string NewPattern from the string Str. It returns the resultant string. Here, if n is a negative number, the nth pattern is replaced from the backside of the string.
* @param {String} str - the string from which the pattern is to be replaced.
* @param {String} OldPattern - The string containing the pattern to be replaced.
* @param {String} NewPattern - The string containing the new pattern that is to be put in place of New Pattern.
* @param {String} N - The nth occurrence of the pattern to be replaced
* @returns {String} returns the string with the NewPattern in place of OldPattern
*/
function replaceNthPattern(str, OldPattern, NewPattern, N) {
	var nth = 0;
	if (N > 0) {
		var re = new RegExp(OldPattern, "gi");
		str = str.replace(re, function (match) {
			nth++;
			if (nth == N) {
				return NewPattern;
			}
			else { return match; }
		});
		return (str);
	}
	else {
		var str = str.split("").reverse().join("");
		var nth = 0;
		var OldPattern = OldPattern.split("").reverse().join("");
		var NewPattern = NewPattern.split("").reverse().join("")
		var re = new RegExp(OldPattern, "gi");
		str = str.replace(re, function (match) {
			nth++;
			if (nth == -(N)) {
				return NewPattern;
			}
			else { return match; }
		});
		return (str.split("").reverse().join(""));
	}
}

/*
**
* This function searches for the nth occurrence of the Pattern in the string Str. It returns the position of the search pattern in the string. Here, if n is a negative number, the nth pattern is searched from the backside of the string. For example, if n is –1, the 1st matching pattern, starting from the right side of the string, is searched.
* @param {String} str - The string in which the pattern is to be searched.
* @param {String} Pattern - The string containing the pattern to be searched.
* @param {String} N - The nth occurrence of the pattern to be searched
* @returns {Number} returns the position of the Nth occurance of Pattern in the string Str. If the Nth occurance of Pattern is not found then 0 is returned.
*/
function searchNthPattern(str, Pattern, N) {
	if (N > 0) {
		return (str.split(Pattern, N).join(Pattern).length + 1);
	}
	else {
		str = str.split("").reverse().join("");
		Pattern = Pattern.split("").reverse().join("");
		N = -1 * (N);
		return (str.split(Pattern, N).join(Pattern).length + 1);
	}
}

/*
**
* This function 
* @param {String} startTok - The target string.
* @param {String} endTok - the string that is to be removed.
* @param {String} str - The target string.
* @returns {String} returns
*/
function convertDateFormatProcessing(format, DD, MM, YY, CC) {
	if (format == "DDMMYY") { return (DD + MM + YY); }
	else if (format == "MMDDYY") { return (MM + DD + YY); }
	else if (format == "YYMMDD") { return (YY + MM + DD); }
	else if (format == "DDMMCCYY") {
		if (CC == undefined) {
			if (YY >= 80) { CC = 19; }
			else { CC = 20; }
		}
		return (DD + MM + CC + YY);
	}
	else if (format == "MMDDCCYY") {
		if (CC == undefined) {
			if (YY >= 80) { CC = 19; }
			else { CC = 20; }
		}
		return (MM + DD + CC + YY);
	}
	else if (format == "CCYYMMDD") {
		if (CC == undefined) {
			if (YY >= 80) { CC = 19; }
			else { CC = 20; }
		}
		return (CC + YY + MM + DD);
	}
	else { return ("INVALID FORMAT"); }
}

/*
**
* This function converts the date specified by d1 having format currfmt (current format) to retfmt (return format). The accepted date formats are DDMMYY, MMDDYY, YYMMDD, DDMMCCYY, MMDDCCYY, CCYYMMDD.
* @param {String} d1 - The string d1.
* @param {String} currfmt - the string currfmt.
* @param {String} retfmt - The string retfmt.
* @returns {String} returns d1 in return format.
*/
function convertDateFormat(d1, currfmt, retfmt) {
	var newDate = "";
	if (currfmt == "DDMMYY") {
		var DD = d1.substring(0, 2);
		var MM = d1.substring(2, 4);
		var YY = d1.substring(4, 6);
		if (currfmt == retfmt) { 
			newDate = d1;
		}
		else {
			newDate = convertDateFormatProcessing(retfmt, DD, MM, YY); 
		}

	}
	else if (currfmt == "MMDDYY") {
		var DD = d1.substring(2, 4);
		var MM = d1.substring(0, 2);
		var YY = d1.substring(4, 6);
		if (currfmt == retfmt) { 
			newDate = d1; 
		}
		else { 
			newDate = convertDateFormatProcessing(retfmt, DD, MM, YY); 
		}

	}
	else if (currfmt == "YYMMDD") {
		var DD = d1.substring(0, 2);
		var MM = d1.substring(2, 4);
		var YY = d1.substring(4, 6);
		if (currfmt == retfmt) { newDate = d1; }
		else { 
			newDate = convertDateFormatProcessing(retfmt, DD, MM, YY); 
		}

	}
	else if (currfmt == "DDMMCCYY") {
		var DD = d1.substring(0, 2);
		var MM = d1.substring(2, 4);
		var CC = d1.substring(4, 6);
		var YY = d1.substring(6, 8);
		logger.info("convertDateFormat: DD = " + DD);
		logger.info("convertDateFormat: MM = " + MM);
		logger.info("convertDateFormat: CC = " + CC);
		logger.info("convertDateFormat: YY = " + YY);
		if (currfmt == retfmt) { newDate = d1; }
		else { newDate = convertDateFormatProcessing(retfmt, DD, MM, YY, CC); }

	}
	else if (currfmt == "MMDDCCYY") {
		var DD = d1.substring(2, 4);
		var MM = d1.substring(0, 2);
		var YY = d1.substring(6, 8);
		var CC = d1.substring(4, 6);
		if (currfmt == retfmt) { newDate = d1; }
		else { newDate = convertDateFormatProcessing(retfmt, DD, MM, YY, CC); }

	}
	else if (currfmt == "CCYYMMDD") {
		var DD = d1.substring(6, 8);
		var MM = d1.substring(4, 6);
		var YY = d1.substring(2, 4);
		var CC = d1.substring(0, 2);
		if (currfmt == retfmt) {
			newDate = d1; 
		}
		else { 
			newDate = convertDateFormatProcessing(retfmt, DD, MM, YY, CC); 
		}

	}
	else { 
		newDate = "INVALID FORMAT"; 
	}
	return newDate;
}

/*
**
* This function returns the current date.
* @returns {String} returns d1 in return format.
*/
function getDate() { 
	var d = new Date(),
	month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	year = d.getFullYear();

	if (month.length < 2) 
		month = '0' + month;
	if (day.length < 2) 
		day = '0' + day;

	return [year, month, day].join('');
}

/*
**
* This function returns the value of current date and time.
* @returns {String} returns the value of current date and time.
*/
function localTime() {  
	var d = new Date();
	var n = d.toLocaleTimeString();
	return n;
}

/*
**
* This function converts the date specified by d1 having format currfmt (current format) to retfmt (return format). The accepted date formats are DDMMYY, MMDDYY, YYMMDD, DDMMCCYY, MMDDCCYY, CCYYMMDD.
* @param {String} date - date in CCYYMMDD format.
* @param {String} NoOfDays - The number of days to be counted while calculating the date.
* @returns {String} returns date in CCYYMMDD format.
*/
function getDateFromNumOfDays(date, NoOfDays) { 
	var month;
	var day;
	var newDay;
	var leap;

	logger.info("getDateFromNumOfDays: NoOfDays = " + NoOfDays);

	if(NoOfDays == "" || !NoOfDays) {
		return date;
	}

	year = date.substr(0, 4);
	month = date.substr(4, 2);
	day = date.substr(6, 2);

	logger.info("getDateFromNumOfDays: year = " + year);
	logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
	logger.info("getDateFromNumOfDays: month = " + month);
	logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
	logger.info("getDateFromNumOfDays: day = " + day);
	logger.info("getDateFromNumOfDays: typeof day = " + typeof day);

	if((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) {
		leap == true;
	}else {
		leap == false;
	}

	newDay = parseInt(day) + parseInt(NoOfDays);
	//newDay = newDay.toString();
	logger.info("getDateFromNumOfDays: newDay = " + newDay);
	logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);

	if(newDay == 0) {
		if(month.toString() == '01') {
			month = 12;
			year = parseInt(year) - 1;
			year = year.toString();
		}else {
			month = parseInt(month) - 1;	
		}
		
		logger.info("getDateFromNumOfDays: month = " + month);
		logger.info("getDateFromNumOfDays: typeof month = " + typeof month);

		logger.info("getDateFromNumOfDays: year = " + year);
		logger.info("getDateFromNumOfDays: typeof year = " + typeof year);		

		if(month == 2) {
			if(leap) {
				newDay = "29";
			}else {
				newDay = "28";
			}
		}else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
			newDay = "31";
		}else {
			newDay = "30";
		}

		month = month.toString();
		logger.info("getDateFromNumOfDays: month.length = " + month.length);

		if(month.length == 1) {
			month = "0" + month;
		}

		newDay = newDay.toString();
		logger.info("getDateFromNumOfDays: year = " + year);
		logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
		logger.info("getDateFromNumOfDays: month = " + month);
		logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
		logger.info("getDateFromNumOfDays: newDay = " + newDay);
		logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);
		date = year.concat(month).concat(newDay);
		return date;
	}else if(newDay <= 28) {
		if(newDay < 10) {
			newDay = "0".concat(newDay);
		}

		newDay = newDay.toString();
		logger.info("getDateFromNumOfDays: year = " + year);
		logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
		logger.info("getDateFromNumOfDays: month = " + month);
		logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
		logger.info("getDateFromNumOfDays: newDay = " + newDay);
		logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);
		date = year.concat(month).concat(newDay);
		return date;
	}else {
		if(month == "02") {
			if(newDay > 28 && !leap){
				newDay = newDay - 28;
				if(newDay < 10) {
					newDay = "0".concat(newDay);
				}
				month = parseInt(month);
				month ++;
				month = month.toString();

				newDay = newDay.toString();
				logger.info("getDateFromNumOfDays: year = " + year);
				logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.info("getDateFromNumOfDays: month = " + month);
				logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.info("getDateFromNumOfDays: newDay = " + newDay);
				logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);				
				date = year.concat(month).concat(newDay);
				return date;
			}else {
				if(newDay > 29) {
					newDay = newDay - 29; 
					
					if(newDay < 10) {
						newDay = "0".concat(newDay);
					}
					
					month = parseInt(month);
					month ++;
					month = month.toString();
				}

				newDay = newDay.toString();
				logger.info("getDateFromNumOfDays: year = " + year);
				logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.info("getDateFromNumOfDays: month = " + month);
				logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.info("getDateFromNumOfDays: newDay = " + newDay);
				logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);				
				date = year.concat(month).concat(newDay);
				return date;       
			}
		}else if(month == "01" || month == "03" || month == "05" || month == "07" || month == "08" || month == "10" || month == "12") {
			if(newDay > 31) {
				newDay = newDay - 31; 
				if(newDay < 10) {
					newDay = "0".concat(newDay);
				}
				if(month == 12) {
					year = parseInt(year);
					year ++;
					year = year.toString();
					month = "01";
				}else {
					month = parseInt(month);
					month ++;
					month = month.toString();
				}
				if(month.toString().length < 2) {
					month = "0".concat(month);
				}

				newDay = newDay.toString();
				logger.info("getDateFromNumOfDays: year = " + year);
				logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.info("getDateFromNumOfDays: month = " + month);
				logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.info("getDateFromNumOfDays: newDay = " + newDay);
				logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);								
				date = year.concat(month).concat(newDay); 
				return date;
			}else {
				newDay = newDay.toString();
				logger.info("getDateFromNumOfDays: year = " + year);
				logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.info("getDateFromNumOfDays: month = " + month);
				logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.info("getDateFromNumOfDays: newDay = " + newDay);
				logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);				
				date = year.concat(month).concat(newDay); 
				return date;
			}
		}else {
			if(newDay > 30) {
				newDay = newDay - 30;
				if(newDay < 10) {
					newDay = "0".concat(newDay);
				}
				month = parseInt(month);
				month ++;
				month = month.toString();
				if(month < 10) {
					month = "0".concat(month);
				}
			}

			newDay = newDay.toString();
			logger.info("getDateFromNumOfDays: year = " + year);
			logger.info("getDateFromNumOfDays: typeof year = " + typeof year);
			logger.info("getDateFromNumOfDays: month = " + month);
			logger.info("getDateFromNumOfDays: typeof month = " + typeof month);
			logger.info("getDateFromNumOfDays: newDay = " + newDay);
			logger.info("getDateFromNumOfDays: typeof newDay = " + typeof newDay);			
			date = year.concat(month).concat(newDay);
			return date;    
		}    
	}
}

function getWeekday(dateStr) {
	var dd = dateStr.substring(2, 4);
	var mm = dateStr.substring(0, 2);
	var ccyy = dateStr.substring(4, 8);

	//logger.info("getWeekday: year = " + ccyy);   
	//logger.info("getWeekday: month = " + mm);
	//logger.info("getWeekday: day = " + dd);
	
	dateStr = [mm, dd, ccyy].join('/');
	//logger.info("getWeekday: dateStr = " + dateStr);
	
	var date = new Date(dateStr);
	//logger.info("getWeekday: date = " + date);

	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var day = days[ date.getDay() ];
	
	//return date.toLocaleDateString("en-IN", { weekday: 'long' });

	return day;	
}

/*
**
* This function trims the specified character (TrimChar) from the left side of the string (Str).
* @param {String} input - the string from which the character is to be trimmed.
* @param {String} trimChar - the character that is to be trimmed from the string Str.
* @returns {String} returns string generated after trimming trimChar from the left side of the string Str
*/
function lTrimChar(input,trimChar){	
	if(input)
	{
		var count = 0;
		while(input.charAt(count)== pattern)
		{
			var value = input.charAt(count);
			count++;
		}
		if (count > 0)
		{
			input = input.slice(count);
			return input;
		}
		else
		{
			return input;
		}
	}
}

/*
**
* This function is used to determine if String contains only textual and numeric characters.
* @param {String} str - The string.
* @returns {String} returns date in CCYYMMDD format.
*/
function isAlphaNumeric(str) {
	var code;
	var i;
	var len;

	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i);
		if (!(code > 47 && code < 58) && !(code > 64 && code < 91) && !(code > 96 && code < 123)) { 
			return false;
		}
		return true;
	}
}

/**
* This function converts CCYYMMDD into ISO date
* @param {String} ccyymmdd - date
* @returns {String} return isoDate.
*/
function convertccyymmddIsoDate(ccyymmdd){
	logger.info("inside convertccyymmddIsoDate");
	var ccyy;
	var mm;
	var dd;
	var isoDate;
	
	if(!ccyymmdd){
		return "";
	}
	
	ccyy = StrSub(ccyymmdd,0,4);
	mm = StrSub(ccyymmdd,4,2);
	dd = StrSub(ccyymmdd,6,2);
	
	isoDate = ccyy + "-";
	isoDate = isoDate + mm;
	isoDate = isoDate + "-";
	isoDate = isoDate + dd;

	logger.info("isoDate: " + isoDate);	
	return isoDate;	
}

function lTrimChar1(input,pattern){   
    if(input)
    {
        var count = 0;
        while(input.charAt(count)== pattern)
        {
            var value = input.charAt(count);
            count++;
        }
        if (count > 0)
        {
            input = input.slice(count);
            return input;
        }
        else
        {
         return input;
        }
    }
}

function lPadChar(str, num, ch) {
	var i;

	i = str.length;

	while(i < num) {
		str = ch.concat(str);
		i++;
	}

	return str;
}

function extractFromPattern(str, pat) {
    var start = str.indexOf(pat);

    if(start == -1) {
    	return "";
    }else {
   		var end = str.length;   
    	str = str.substring(start + 1, end);
    	return str;
    }
} 

function extractFromPatternPosition(str, pos, pat) {
	str = str.substring(pos, str.length)
    var start = str.indexOf(pat);

    if(start == -1) {
    	return "";
    }else {
   		var end = str.length;   
    	str = str.substring(start + 1, end);
    	return str;
    }
}

function getPrettyPrint(doc2){
	var tf = TransformerFactory.newInstance().newTransformer();
	tf.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
	tf.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
	tf.setOutputProperty(OutputKeys.INDENT, "yes");
	var out = new StringWriter();
	tf.transform(new DOMSource(doc2), new StreamResult(out));
	var out1= out.toString();
	return out1;
}

function getDateBAH() { 
	var d = new Date(),
	month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	year = d.getFullYear();

	if (month.length < 2) 
		month = '0' + month;
	if (day.length < 2) 
		day = '0' + day;

	return [year, month, day].join('-');
}

function isXmlNodePresent(Document, parentField, childField, grandChildField){

	var fieldName = Document.getElementsByTagName(parentField);
	logger.trace("isXmlNodePresent: fieldName = " + fieldName); 

	var fieldNameChild = fieldName.item(0);
	logger.trace("isXmlNodePresent: fieldNameChild = " + fieldNameChild);

	var fieldNameChildString = convertDocumentToString(fieldNameChild);
	logger.trace("isXmlNodePresent: fieldNameChildString = " + fieldNameChildString);
	logger.trace("isXmlNodePresent: typeof fieldNameChildString = " + typeof fieldNameChildString);

	if(fieldNameChildString != '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
		var childFieldName = fieldNameChild.getElementsByTagName(childField);

		logger.trace("isXmlNodePresent: childFieldName = " + childFieldName);
		var childField = childFieldName.item(0);
		logger.trace("isXmlNodePresent: childField = " + childField);

		var childFieldString = convertDocumentToString(childField);
		logger.trace("isXmlNodePresent: childFieldString = " + childFieldString);

		if(childFieldString != '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
			childField = convertDocumentToString(childField);
			logger.trace("isXmlNodePresent: childField = " + childField);
			var childTag = isPatternPresent(childField, grandChildField);
			logger.trace("isXmlNodePresent: childTag = " + childTag);
			return childTag;
		}
	}

	return false
}

function isXmlNodePresent2(Document, field){
	logger.trace("In isXmlNodePresent2");

	var fieldName = Document.getElementsByTagName(field);
	var fieldNameChild = fieldName.item(0);

	var fieldNameChildString = convertDocumentToString(fieldNameChild);
	logger.trace("isXmlNodePresent2: fieldNameChildString = " + fieldNameChildString);

	if(fieldNameChildString == '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
		return false;
	}else {
		return true;
	}
}

function isXmlNodePresent3(Document, grandParentField, parentField, childField, grandChildField){

	var grandParentfieldName = Document.getElementsByTagName(grandParentField);
	logger.trace("isXmlNodePresent3: grandParentfieldName = " + grandParentfieldName); 

	var grandParentfieldNameChild = grandParentfieldName.item(0);

	var grandParentfieldNameChildString = convertDocumentToString(grandParentfieldNameChild);
	logger.trace("isXmlNodePresent3: grandParentfieldNameChildString = " + grandParentfieldNameChildString);

	if(grandParentfieldNameChildString != '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
		var fieldName = grandParentfieldNameChild.getElementsByTagName(parentField);
		logger.trace("isXmlNodePresent3: fieldName = " + fieldName); 

		var fieldNameChild = fieldName.item(0);
		logger.trace("isXmlNodePresent3: fieldNameChild = " + fieldNameChild);

		var fieldNameChildString = convertDocumentToString(fieldNameChild);
		logger.trace("isXmlNodePresent3: fieldNameChildString = " + fieldNameChildString);
		logger.trace("isXmlNodePresent3: typeof fieldNameChildString = " + typeof fieldNameChildString);

		if(fieldNameChildString != '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
			var childFieldName = fieldNameChild.getElementsByTagName(childField);

			logger.trace("isXmlNodePresent3: childFieldName = " + childFieldName);
			var childField = childFieldName.item(0);
			logger.trace("isXmlNodePresent3: childField = " + childField);

			var childFieldString = convertDocumentToString(childField);
			logger.trace("isXmlNodePresent3: childFieldString = " + childFieldString);

			if(childFieldString != '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
				childField = convertDocumentToString(childField);
				var childTag = isPatternPresent(childField, grandChildField);
				logger.trace("isXmlNodePresent3: childTag = " + childTag);
				return childTag;
			}
		}
	}

	return false
}

function setValueInTxtNode(doc, xPath, value) {
    var xpathFactory = XPathFactory.newInstance();
    var xpath = xpathFactory.newXPath();
    var myNodeList = xpath.compile(xPath).evaluate(doc, XPathConstants.NODESET);
    myNodeList.item(0).setTextContent(value);
    return doc;
}

function textToNum(textNo) {
	var map =  new Map([["two", "2"], ["four", "4"], ["six", "6"]]);
	//logger.info("textToNum: map = " + map);
	textNo = textNo.toLowerCase();
	//logger.info("textToNum: textNo = " + textNo);
	var Num = map.get(textNo);
	//logger.info("textToNum: Num = " + Num);
	return Num;
}

function getCurrentDateTime() {
	var currentdate = new Date();
	var datetime = "Last Sync: " + currentdate.getDay() + "/" + currentdate.getMonth() 
	+ "/" + currentdate.getFullYear() + " @ " 
	+ currentdate.getHours() + ":" 
	+ currentdate.getMinutes() + ":" + currentdate.getSeconds();
}

function isXmlNodePresent4(Document, parentfield, childField){

	logger.info("In isXmlNodePresent4");

	var fieldName = Document.getElementsByTagName(parentfield); 
	var fieldNameChild = fieldName.item(0);
	logger.trace("isXmlNodePresent4: fieldNameChild = " + convertDocumentToString(fieldNameChild));
	var childFieldName = fieldNameChild.getElementsByTagName(childField);
	var childField = childFieldName.item(0);
	logger.trace("isXmlNodePresent4: childField = " + convertDocumentToString(childField));
	var fieldNameChildString = convertDocumentToString(childField);
	logger.trace("isXmlNodePresent2: fieldNameChildString = " + fieldNameChildString);

	if(fieldNameChildString == '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
		return false;
	}else {
		return true;
	}
	/*if(fieldNameChild && childField) {
		return true;
	}else {
		return false;
	}
	*/
}