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
var OutputKeys = Java.type("javax.xml.transform.OutputKeys");

/*
**
* This function is called when any exception is encountered. Header variable PLCN_exceptionFlag is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function onException(exchange) { 
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();    

    logger.trace("In onException");

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

	if(key) {
		value = jsHelperClass.getHzlMapValue(map, tableName, key);
		//logger.info("memTblGetTableValue: value = " + value);

		if(value){
			value = value.trim();
		}
	}

	return value;
}

function customMemTblGetTblValue(map, tableName, key) {
	var hazelCastInstance;
	var hazelcastMap;
	var value;
	var jsHelperClass;

	jsHelperClass = new JSHelperClass();
	value = jsHelperClass.getHzlMapValue(map, tableName, key);
	logger.info("customMemTblGetTblValue: value = " + value);

	//if(value) {
		//logger.info("memTblGetTableValue: typeof value = " + typeof value);

		//var flag = hasWhiteSpace(value);
		//logger.info("memTblGetTableValue: flag = " + flag);

		value = value.replace(/\n|\r/g,'');
		logger.info("customMemTblGetTblValue: value after remove crlf = " + value);

		//if(flag == true) {
			//value = value.trim();
			//logger.info("memTblGetTableValue: value after trim = " + value);
			//logger.info("memTblGetTableValue: typeof value after trim = " + typeof value);
		//}
	//}

	return value;
}

function hasWhiteSpace(s) {
  return /\s/g.test(s);
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
	//logger.trace("createDocument: inputFile = " + inputFile);
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
	//logger.trace("convertDocumentToString: XML created:"+ output);
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
	setHeader(map, 'PLCNAPI_txnComments', finalPLCN_txnComments);

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

	//logger.trace("In genCommentsFormation");

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

	//logger.trace("In cleanupCommentsTa");

	orgComments = comments; // orgComments = P71-1:A00:71-1560
	pViolation = strStr(comments, ":A00:"); // pViolation = :A00:71-1560
	pViolationNew = pViolation; // pViolationNew = :A00:71-1560
	pViolationInfo = removePattern(comments, pViolation); // pViolationInfo = P71-1
	pViolationInfoNew = pViolationInfo; // pViolationInfoNew = P71-1

	while(pViolationNew) { // pViolationNew = :A00:71-1560
		pViolationCode = dataBetweenTokens(":A00:", ":A00:", pViolationNew); //pViolationCode = 71-1560
		pViolationCode = ":A00:".concat(pViolationCode); // pViolationCode =  :A00:71-1560 
		pViolationTemp = pViolationCode; //pViolationTemp =  :A00:71-1560
		//logger.trace('cleanupCommentsTa: pViolationCode = '+ pViolationCode);

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
	//logger.trace("In isPatternPresent");
	//logger.trace("isPatternPresent: str = " + str);
	//logger.trace("isPatternPresent: PatternStr = " + PatternStr);

	if(PatternStr.length > 0) {
		if(str){
			var n = str.search(PatternStr);

			if(n == -1) {
				//logger.trace("isPatternPresent: returning false");
				return false;
			}else {
				//logger.trace("isPatternPresent: returning true");
				return true;
			}
		}else {
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
		logger.trace("convertDateFormat: DD = " + DD);
		logger.trace("convertDateFormat: MM = " + MM);
		logger.trace("convertDateFormat: CC = " + CC);
		logger.trace("convertDateFormat: YY = " + YY);
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

	logger.trace("getDateFromNumOfDays: NoOfDays = " + NoOfDays);

	if(NoOfDays == "" || !NoOfDays) {
		return date;
	}

	year = date.substr(0, 4);
	month = date.substr(4, 2);
	day = date.substr(6, 2);

	logger.trace("getDateFromNumOfDays: year = " + year);
	logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
	logger.trace("getDateFromNumOfDays: month = " + month);
	logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
	logger.trace("getDateFromNumOfDays: day = " + day);
	logger.trace("getDateFromNumOfDays: typeof day = " + typeof day);

	if((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) {
		leap == true;
	}else {
		leap == false;
	}

	newDay = parseInt(day) + parseInt(NoOfDays);
	//newDay = newDay.toString();
	logger.trace("getDateFromNumOfDays: newDay = " + newDay);
	logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);

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
		logger.trace("getDateFromNumOfDays: month.length = " + month.length);

		if(month.length == 1) {
			month = "0" + month;
		}

		newDay = newDay.toString();
		logger.trace("getDateFromNumOfDays: year = " + year);
		logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
		logger.trace("getDateFromNumOfDays: month = " + month);
		logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
		logger.trace("getDateFromNumOfDays: newDay = " + newDay);
		logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);
		date = year.concat(month).concat(newDay);
		return date;
	}else if(newDay <= 28) {
		if(newDay < 10) {
			newDay = "0".concat(newDay);
		}

		newDay = newDay.toString();
		logger.trace("getDateFromNumOfDays: year = " + year);
		logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
		logger.trace("getDateFromNumOfDays: month = " + month);
		logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
		logger.trace("getDateFromNumOfDays: newDay = " + newDay);
		logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);
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

				if(month.toString().length < 2) {
					month = "0".concat(month);
				}

				newDay = newDay.toString();
				logger.trace("getDateFromNumOfDays: year = " + year);
				logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.trace("getDateFromNumOfDays: month = " + month);
				logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.trace("getDateFromNumOfDays: newDay = " + newDay);
				logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);				
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
					
					if(month.toString().length < 2) {
					month = "0".concat(month);
				    }
				}

				newDay = newDay.toString();
				logger.trace("getDateFromNumOfDays: year = " + year);
				logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.trace("getDateFromNumOfDays: month = " + month);
				logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.trace("getDateFromNumOfDays: newDay = " + newDay);
				logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);				
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
				logger.trace("getDateFromNumOfDays: year = " + year);
				logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.trace("getDateFromNumOfDays: month = " + month);
				logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.trace("getDateFromNumOfDays: newDay = " + newDay);
				logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);								
				date = year.concat(month).concat(newDay); 
				return date;
			}else {
				newDay = newDay.toString();
				logger.trace("getDateFromNumOfDays: year = " + year);
				logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
				logger.trace("getDateFromNumOfDays: month = " + month);
				logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
				logger.trace("getDateFromNumOfDays: newDay = " + newDay);
				logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);				
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
			logger.trace("getDateFromNumOfDays: year = " + year);
			logger.trace("getDateFromNumOfDays: typeof year = " + typeof year);
			logger.trace("getDateFromNumOfDays: month = " + month);
			logger.trace("getDateFromNumOfDays: typeof month = " + typeof month);
			logger.trace("getDateFromNumOfDays: newDay = " + newDay);
			logger.trace("getDateFromNumOfDays: typeof newDay = " + typeof newDay);			
			date = year.concat(month).concat(newDay);
			return date;    
		}    
	}
}

/*function getWeekday(dateStr) {
	var dd = dateStr.substring(2, 4);
	var mm = dateStr.substring(0, 2);
	var ccyy = dateStr.substring(4, 8);

	logger.info("getWeekday: year = " + ccyy);   
	logger.info("getWeekday: month = " + mm);
	logger.info("getWeekday: day = " + dd);
	
	dateStr = [mm, dd, ccyy].join('/');
	logger.info("getWeekday: dateStr = " + dateStr);
	
	var date = new Date(dateStr);
	logger.info("getWeekday: date = " + date);

	logger.info("DEBUG: date object = " + date);
	logger.info("DEBUG: date.toString() = " + date.toString());
	logger.info("DEBUG: date.toISOString() = " + date.toISOString());
	logger.info("DEBUG: date.getDay() = " + date.getDay());
	logger.info("DEBUG: date.getTimezoneOffset() = " + date.getTimezoneOffset());	

	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var day = days[ date.getDay() ];
	
	//return date.toLocaleDateString("en-IN", { weekday: 'long' });

	return day;	
}*/

function getWeekday(dateStr) {
    var mm = dateStr.substring(0, 2);
    var dd = dateStr.substring(2, 4);
    var ccyy = dateStr.substring(4, 8);
    
    // Use Date constructor with numeric arguments - ALWAYS works correctly
    var date = new Date(parseInt(ccyy), parseInt(mm) - 1, parseInt(dd));
	logger.info("getWeekday: Created date = " + date);
	    
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
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
	logger.trace("inside convertccyymmddIsoDate");
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

	logger.trace("isoDate: " + isoDate);	
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
	//logger.trace("isXmlNodePresent: fieldName = " + fieldName); 

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
	//logger.trace("In isXmlNodePresent2");

	var fieldName = Document.getElementsByTagName(field); 
	//logger.trace("isXmlNodePresent: fieldName = " + convertDocumentToString(fieldName));
	var fieldNameChild = fieldName.item(0);

	var fieldNameChildString = convertDocumentToString(fieldNameChild);
	//logger.trace("isXmlNodePresent2: fieldNameChildString = " + fieldNameChildString);

	if(fieldNameChildString == '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
		return false;
	}else {
		return true;
	}
}

function isXmlNodePresent3(Document, grandParentField, parentField, childField, grandChildField){

	var grandParentfieldName = Document.getElementsByTagName(grandParentField);
	//logger.trace("isXmlNodePresent3: grandParentfieldName = " + grandParentfieldName); 
	//logger.trace("isXmlNodePresent3: grandParentfieldName = " + convertDocumentToString(grandParentfieldName));

	var grandParentfieldNameChild = grandParentfieldName.item(0);

	var grandParentfieldNameChildString = convertDocumentToString(grandParentfieldNameChild);
	logger.trace("isXmlNodePresent3: grandParentfieldNameChildString = " + grandParentfieldNameChildString);

	if(grandParentfieldNameChildString != '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
		var fieldName = grandParentfieldNameChild.getElementsByTagName(parentField);
		//logger.trace("isXmlNodePresent3: fieldName = " + fieldName); 
		//logger.trace("isXmlNodePresent3: fieldName = " + convertDocumentToString(fieldName));

		var fieldNameChild = fieldName.item(0);
		//logger.trace("isXmlNodePresent3: fieldNameChild = " + fieldNameChild);

		var fieldNameChildString = convertDocumentToString(fieldNameChild);
		logger.trace("isXmlNodePresent3: fieldNameChildString = " + fieldNameChildString);
		//logger.trace("isXmlNodePresent3: typeof fieldNameChildString = " + typeof fieldNameChildString);

		if(fieldNameChildString != '<?xml version="1.0" encoding="UTF-8" standalone="no"?>') {
			var childFieldName = fieldNameChild.getElementsByTagName(childField);

			//logger.trace("isXmlNodePresent3: childFieldName = " + childFieldName);
			var childField = childFieldName.item(0);
			//logger.trace("isXmlNodePresent3: childField = " + childField);

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
	//logger.trace("textToNum: map = " + map);
	textNo = textNo.toLowerCase();
	//logger.trace("textToNum: textNo = " + textNo);
	var Num = map.get(textNo);
	//logger.trace("textToNum: Num = " + Num);
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

	logger.trace("In isXmlNodePresent4");

	var fieldName = Document.getElementsByTagName(parentfield); 
	var fieldNameChild = fieldName.item(0);
	//logger.trace("isXmlNodePresent4: fieldNameChild = " + convertDocumentToString(fieldNameChild));
	var childFieldName = fieldNameChild.getElementsByTagName(childField);
	var childField = childFieldName.item(0);
	//logger.trace("isXmlNodePresent4: childField = " + convertDocumentToString(childField));
	var fieldNameChildString = convertDocumentToString(childField);
	//logger.trace("isXmlNodePresent2: fieldNameChildString = " + fieldNameChildString);

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

/*
**
* This function is calls ruleGenerateKbJs function.
* @param {CamelExchange} exchange - The exchange.
*/
function messageFromDB(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.trace("Message From DB");

	ruleGenerateKbJs(exchange);
}

/*
**
* This function is called to populate values in database.
* @param {CamelExchange} exchange - The exchange.
*/
function dbOperation(exchange) {
	var inMsg;
	var msgdbMap;
	var map;
	var readMsgdb;
	var audit;
	var comments;
	var sourceChannelId;
	var channelIdTarget;
	var validMessage;
	var msgType;
	var processId;
	var custom27;
	var custom17;
	var msgStateMeaning;
	var targetChannelId;

	logger.trace("In dbOperation");

	var inMsg = exchange.getIn();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	inMsg = exchange.getIn();
	msgdbMap = new HashMap();
	map = inMsg.getHeaders();
	readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	audit = new HashMap();

	sourceChannelId = getHeader(map, "sourceChannelId");
	channelIdTarget = memTblGetTableValue(map, "MQ_CHANNEL_CONF_MAP", sourceChannelId);
	logger.trace("dbOperation: sourceChannelId = " + sourceChannelId);
	logger.trace("dbOperation: channelIdTarget = " + channelIdTarget);

	processId = getHeader(map,"PROCESS_ID");
	comments = getHeader(map, "PLCN_txnComments");
	logger.trace("dbOperation: comments = " + comments);
	validMessage = getHeader(map, "PLCN_validMessage");

	audit.put("messageNo", readMsgdb.get("messageNo"));
	audit.put("USERNAME","ADMIN1");
	audit.put("APPLICATION","ACEQ_CMP");
	audit.put("MODULENAME","ACEQWRITE");
	audit.put("ACTION","PROCESS");
	audit.put("AUDITTEXT","Route2 valid message");
	audit.put("INSTITUTIONID","INST");

	var Msgblock2 = new HashMap();

	Msgblock2.put("MSGBLOCKTYPE", "2");
	var message = 'CAMEL_EXCHANGE_BODY';
	Msgblock2.put("MESSAGE", message);
	var list = new ArrayList();
	list.add(Msgblock2);

	var Msgdb = new HashMap();

	msgdbMap.put("comments", comments);
	msgdbMap.put("INSTANCEID","PELICAN1");
	msgdbMap.put("CHANNEL_ID_TARGET", channelIdTarget);
    msgdbMap.put("PROCESS_ID", processId);

	msgType = getHeader(map, "msgType");
	logger.trace("dbOperation: msgType = " + msgType);

	//TECHBULLS-26824
	if(msgType == 'pacs.008.001.08' || msgType == "pacs.009.001.08" || msgType == "pacs.009.001.08C" || msgType == "pacs.009.001.08A"){
 		
    	var msgId = getHeader(map, "msgId");
    	logger.trace('dbOperation: msgId = ' + msgId);

    	var endToend = getHeader(map, "endToEnd");
    	logger.trace('dbOperation: endToend = ' + endToend);
       	txnCustom2 = msgId + "¿" + endToend;
    	logger.trace('dbOperation: txnCustom2 = ' + txnCustom2);
    	msgdbMap.put("CUSTOM2", txnCustom2);

		custom27 = getHeader(map,"instgAgtBic");
		logger.trace("dbOperation: custom27 = " + custom27);
		custom17 = getHeader(map,"instdAgtBic");
		logger.trace("dbOperation: custom17 = " + custom17);
		//msgStateMeaning = getHeader(map,"businessMessageIdentifier");
		//logger.trace("dbOperation: msgStateMeaning = " + msgStateMeaning);
		targetChannelId = getHeader(map,"messageDefinitionIdentifier");
		logger.trace("dbOperation: targetChannelId = " + targetChannelId);

	    msgdbMap.put("CUSTOM27", custom27);
	    msgdbMap.put("CUSTOM17", custom17);
	    //msgdbMap.put("MSGSTATEMEANING", msgStateMeaning);
	    msgdbMap.put("TARGETCHANNELID", targetChannelId);

		if(validMessage) {
			msgdbMap.put("NEXT_WORKFLOW_QUEUE_ID", "PROCDQ");
			msgdbMap.put("NEXT_WORKFLOW_STATUS", "84");
		}
	}

	if(msgType == 'pacs.002.001.10'){
		var transrefno = getHeader(map, "TRANSREFNO");
    	msgdbMap.put("TRANSREFNO", transrefno);

		mtchTransrefno = getHeader(map, "mtchTransrefno");
		fileOrgMsgId = getHeader(map, "fileOrgMsgId");
		txnMtchParam = getHeader(map, "txnMtchParam");

		
		mtchTransrefno = "|" + mtchTransrefno + "¿" + fileOrgMsgId  + txnMtchParam;
		logger.trace("dbOperation: mtchTransrefno = " + mtchTransrefno);
		msgdbMap.put("CUSTOM7", mtchTransrefno);
		
		var PLCN_custom12 = getHeader(map,"PLCN_custom12");
		logger.trace("PLCN_custom12: " + PLCN_custom12);
		msgdbMap.put("PLCN_custom12", PLCN_custom12);
    	
    	var msgFamily = getHeader(map,"MSG_FAMILY");
        msgdbMap.put("MSG_FAMILY", msgFamily);
	}

	setHeader(map,"ACEQ_WRITE_MSGDB", msgdbMap);
	setHeader(map,"ACEQ_WRITE_MSGBLOCKS", list);
	setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
	setHeader(map,"GENAUDIT", audit);
}

/*
**
* This function is called to fetch values from database and set in header variables.
* @param {CamelExchange} exchange - The exchange.
*/
function ruleGenerateKbJs(exchange) {
	var inMsg;
	var map;
	var readMsgdb;
	var Document;

	logger.trace("In ruleGenerateKbJs");

	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	logger.trace("readMsgdb = ")
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.trace("messageBody = " + messageBody);
	setHeader(map, "originalMessage", messageBody);

	var institutionId =  readMsgdb.get("INSTITUTIONID");
	logger.trace("ruleGenerateKbJs: institutionId = " + institutionId);
	setHeader(map, "institutionId", institutionId);

	var msgType = readMsgdb.get("MESSAGECLASSTYPE");
	logger.trace("ruleGenerateKbJs: msgType = " + msgType);
	
	//TECHBULLS-26824
	if(msgType == "pacs009.001.08")
		{
			setHeader(map, "msgType", "pacs.009.001.08");
			logger.trace("ruleGenerateKbJs: msgType = " + msgType);
		}
	else if(msgType == "pacs009.001.08C")
		{
			setHeader(map, "msgType", "pacs.009.001.08C");
			logger.trace("ruleGenerateKbJs: msgType = " + msgType);
		}
	else if(msgType == "pacs009.001.08A")
		{
			setHeader(map, "msgType", "pacs.009.001.08A");
			logger.trace("ruleGenerateKbJs: msgType = " + msgType);
		}
	else{
	setHeader(map, "msgType", msgType);
		}

	var msgDirection = readMsgdb.get("MESSAGEDIRECTION");
	logger.trace("ruleGenerateKbJs: msgDirection = "+msgDirection);
	setHeader(map, "msgDirection", msgDirection);

	var messageNo = readMsgdb.get("MESSAGENO");
	logger.trace("ruleGenerateKbJs: messageNo = "+messageNo);
	setHeader(map, "messageNo", messageNo);

	var custom5DuplPrev = readMsgdb.get("CUSTOM5_DUPL");
	logger.trace("ruleGenerateKbJs: custom5DuplPrev = "+custom5DuplPrev);
	setHeader(map, "custom5Dupl", custom5DuplPrev);

	var sender = readMsgdb.get("SENDER");
	logger.trace("ruleGenerateKbJs: sender = "+sender);
	setHeader(map, "sender", sender);

	var receiver = readMsgdb.get("RECEIVER");
	logger.trace("ruleGenerateKbJs: receiver = "+receiver);
	setHeader(map, "receiver", receiver);

	var currency = readMsgdb.get("CURRENCY");
	logger.trace("ruleGenerateKbJs: currency = "+currency);
	setHeader(map, "currency", currency);

	var messageDirection =  readMsgdb.get("MESSAGEDIRECTION");
	logger.trace("ruleGenerateKbJs: messageDirection = "+messageDirection);
	setHeader(map, "direction", messageDirection);

	var priorityAmount = readMsgdb.get("AMOUNT");
	logger.trace("ruleGenerateKbJs: priorityAmount = "+priorityAmount);
	setHeader(map, "amount", priorityAmount);

	var priorityDate = readMsgdb.get("PRIORITYDATE");
	logger.trace("ruleGenerateKbJs: priorityDate = "+priorityDate);
	setHeader(map,"priorityDate", priorityDate);
	setHeader(map, "valueDate", priorityDate);

	var transRefNo = readMsgdb.get("TRANSREFNO");
	logger.trace("ruleGenerateKbJs: transRefNo = "+transRefNo);
	setHeader(map, "transRefNo", transRefNo);

	var mode = readMsgdb.get("MSG_MODE_IN");
	logger.trace("ruleGenerateKbJs: mode = "+ mode);
	setHeader(map, "mode", mode);

	var priorityAmount1 = readMsgdb.get("PRIORITYAMOUNT");
	logger.trace("ruleGenerateKbJs: priorityAmount1 = " + priorityAmount1);
	setHeader(map, "priorityAmount", priorityAmount1);

	var priorityDate3 = readMsgdb.get("PRIORITYDATE");
	logger.trace("ruleGenerateKbJs: priorityDate3 = " + priorityDate3);
	setHeader(map, "priorityDate3", priorityDate3);

	var msgPriority = readMsgdb.get("PRIORITY");
	logger.trace("ruleGenerateKbJs: msgPriority = " + msgPriority);
	setHeader(map, "msgPriority", msgPriority);

	var custom11 = readMsgdb.get("PRIORITY");
	logger.trace("ruleGenerateKbJs: custom11 = " + custom11);
	setHeader(map, "custom11", custom11);

	var msgModeIn = readMsgdb.get("MSG_MODE_IN");
	logger.trace("ruleGenerateKbJs: msgModeIn = " + msgModeIn);
	setHeader(map, "msgModeIn", msgModeIn);

	var manualMode = readMsgdb.get("MANUAL_MODE");
	logger.trace("ruleGenerateKbJs: manualMode = " + manualMode);
	setHeader(map, "manualMode", manualMode);
	
	var stage = readMsgdb.get("PROCESSING_STAGE");
	logger.trace("ruleGenerateKbJs: stage = " + stage);
	setHeader(map, "stage", stage);

	var queueId = readMsgdb.get("QUEUEID");
	logger.trace("ruleGenerateKbJs: queueId = " + queueId);
	setHeader(map, "queueId", queueId);

	var channelIdSource =  readMsgdb.get("CHANNEL_ID_SOURCE");
	logger.trace("ruleGenerateKbJs: channelIdSource = "+ channelIdSource);
	setHeader(map, "channelIdSource", channelIdSource);
	
	if(channelIdSource) {
		memTblSetTableValue(map, "STREAM_DETAILS", "channelIdSource", channelIdSource);
	}

	var sourceChannelId =  readMsgdb.get("SOURCECHANNELID");
	logger.trace("ruleGenerateKbJs: sourceChannelId = " + sourceChannelId);
	setHeader(map, "sourceChannelId", sourceChannelId);

	if(msgType == "pacs.008.001.08") {
		b2bPacs008ExtractVarMx(Document, map);
		target2BahValuesMxPacs008(Document, map);
	}

	if(msgType == "pacs.009.001.08") {
		target2BahValuesMxPacs009(Document, map);
	}
	if(msgType == "pacs.009.001.08C") {
		target2BahValuesMxPacs009(Document, map);
	}
	if(msgType == "pacs.009.001.08A") {
		target2BahValuesMxPacs009(Document, map);
	}
}

/*
**
* This function is used for Pacs002 and Pacs008 custom matching.
* @param {DOMTree} Document - The message.
* @param {HashMap} map - The header values.
*/
function target2BahValuesMxPacs008(Document, map){
	var instdAgt;
	var instgAgt;
	var msgId;
	var msgClassType;
	var msg;
	var messageNo;

	//instgAgt = "/Document/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
	instgAgtPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
	instgAgt = getValueFromPath(Document, instgAgtPath);
	logger.trace("target2BahValuesMxPacs08 utility: instgAgt = " + instgAgt);

	//instdAgt = "/Document/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";
	instdAgtPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";
	instdAgt = getValueFromPath(Document, instdAgtPath);
	logger.trace("target2BahValuesMxPacs08 utility: instdAgt = " + instdAgt);

	//msgId = "/Document/GrpHdr/MsgId";
	msgIdPath = "/Document/FIToFICstmrCdtTrf/GrpHdr/MsgId";
	msgId = getValueFromPath(Document, msgIdPath);
	logger.trace("target2BahValuesMxPacs08 utility: msgId = " + msgId);

	setHeader(map, "instgAgtBic", instgAgt);
	setHeader(map, "instdAgtBic", instdAgt);

	messageNo = getHeader(map, "messageNo");

	if(msgId == "NONREF"){
		//messageNo = messageNo.substr(0, 8);
		//setHeader(map, "businessMessageIdentifier", messageNo); using transref no
		logger.trace("target2BahValuesMxPacs08 utility: businessMessageIdentifier = " + messageNo);
	}

	if(!(msgId == "NONREF")){
		//msgId = msgId.substr(0, 8);
		//setHeader(map, "businessMessageIdentifier", msgId); using transref no
		logger.trace("target2BahValuesMxPacs08 utility: businessMessageIdentifier = " + msgId);
	}

	setHeader(map, "messageDefinitionIdentifier", "PACS.008.001.08");
	//setHeader(map, "messageDefinitionIdentifier", "PACS.008");
	logger.trace("target2BahValuesMxPacs08 utility: messageDefinitionIdentifier = PACS.008.001.08");
}

/*
**
* This function is used for populating BAH values for Pacs008.
* @param {DOMTree} Document - The message.
* @param {HashMap} map - The header values.
*/
function target2BahValuesMxPacs009(Document, map){
	var instdAgt;
	var instgAgt;
	var msgId;
	var msgClassType;
	var msg;
	var instgAgtPath;
	var instdAgtPath;
	var msgIdPath;

	//instgAgtPath = "/Document/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
	instgAgtPath = "/Document/FICdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
	instgAgt = getValueFromPath(Document, instgAgtPath);
	logger.trace("target2BahValuesMxPacs09: instgAgt = " + instgAgt);

	//instdAgtPath = "/Document/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";
	instdAgtPath = "/Document/FICdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";
	instdAgt = getValueFromPath(Document, instdAgtPath);
	logger.trace("target2BahValuesMxPacs09: instdAgt = " + instdAgt);

	//msgIdPath = "/Document/GrpHdr/MsgId";
	msgIdPath = "/Document/FICdtTrf/GrpHdr/MsgId";
	msgId = getValueFromPath(Document, msgIdPath);
	logger.trace("target2BahValuesMxPacs09: msgId = " + msgId);

	setHeader(map, "instgAgtBic", instgAgt);
	setHeader(map, "instdAgtBic", instdAgt);

	if(msgId == "NONREF"){
		//setHeader(map, "businessMessageIdentifier", getHeader(map, "messageNo")); using transref no
		logger.trace("target2BahValuesMxPacs09: businessMessageIdentifier = " + getHeader(map, "messageNo"));
	}

	if(!(msgId == "NONREF")){
		//setHeader(map, "businessMessageIdentifier", msgId);
		logger.trace("target2BahValuesMxPacs09: businessMessageIdentifier = " + msgId);
	}

	undrlygCstmrCdtTrfPath = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf"
	undrlygCstmrCdtTrf = getValueFromPath(Document, undrlygCstmrCdtTrfPath);
	if(undrlygCstmrCdtTrf){
		//setHeader(map, "messageDefinitionIdentifier", "PACS.009.001.08COVER"); using transref no
		setHeader(map, "messageDefinitionIdentifier", "PACS.009.001.08COVER");
		logger.trace("target2BahValuesMxPacs09: messageDefinitionIdentifier = PACS.009.001.08COVER");
	}else{
		//setHeader(map, "messageDefinitionIdentifier", "PACS.009.001.08CORE");
		setHeader(map, "messageDefinitionIdentifier", "PACS.009.001.08CORE");
		logger.trace("target2BahValuesMxPacs09: messageDefinitionIdentifier = PACS.009.001.08CORE");
	}
}

/*
**
* This function is used for populating BAH values for Pacs009.
* @param {DOMTree} Document - The message.
* @param {HashMap} map - The header values.
*/
function b2bPacs008ExtractVarMx(Document, map){
    logger.trace("In b2bPacs008ExtractVarMx");
    var msgId;
    var endToend;
    var txnCustom2;
    var msgIdPath;
    var endtoendPath;
   
    msgIdPath = "/Document/FIToFICstmrCdtTrf/GrpHdr/MsgId";
    msgId = getValueFromPath(Document, msgIdPath);
    logger.trace('msgId = '+msgId);
    setHeader(map, "msgId", msgId);
    //msgId = REPLACESPECIALCHARTOXML(msgId);
    //endtoendPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/TxId";
    endtoendPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/EndToEndId";
    endToend = getValueFromPath(Document, endtoendPath);
    logger.trace('b2bPacs008ExtractVarMx: endToend = '+endToend);
    setHeader(map, "endToEnd", endToend);
    //endToend = REPLACESPECIALCHARTOXML(endToend);
           
    ///txnCustom2 = msgId.concat("ß¢").concat(endToend);
    //txnCustom2 = msgId.concat("Â¿").concat(endToend);

    txnCustom2 = msgId + "¿" + endToend; // (msgId.concat("Â¿")).concat(endToend);
    logger.trace("b2bPacs008ExtractVarMx: txnCustom2 = " + txnCustom2);
    setHeader(map, "CUSTOM2", txnCustom2);
    logger.trace("b2bPacs008ExtractVarMx: CUSTOM2 = " + getHeader(map, "CUSTOM2"));
}

function countXmlNodes(Document, parentNodeName, targetNodeName) {
	logger.info("countXmlNodes: parentNodeName = " + parentNodeName);
	logger.info("countXmlNodes: targetNodeName = " + targetNodeName);
    //var parentNode = Document.getElementsByTagName(parentNodeName)[0];
    var parentNode = Document.getElementsByTagName(parentNodeName);
    logger.info("countXmlNodes: parentNode = " + parentNode);
    
    if (!parentNode) {
        logger.info("countXmlNodes: Parent node not found.");
        return 0;
    }else{
    	parentNode = parentNode.item(0);
    }

    var targetNodes = parentNode.getElementsByTagName(targetNodeName);
    logger.info("countXmlNodes: targetNodes = " + targetNodes);

    if(targetNodes) {
    	logger.info("countXmlNodes: targetNodes length = " + targetNodes.length);
    	return targetNodes.length;
    }else{
    	return 0;
    }   
}