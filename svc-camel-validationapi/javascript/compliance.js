var XPathConstants = Java.type('javax.xml.xpath.XPathConstants');
var XPathFactory = Java.type('javax.xml.xpath.XPathFactory');
var HashMap = Java.type('java.util.HashMap');
//var Entry = Java.type('java.util.Map.Entry');
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
var JavaScriptDBHandler = Java.type("ai.pelican.camel.js.database.JavaScriptDBHandler");
var InterActFile = Java.type("ai.pelican.camel.interact.InterActFile");
var AuthCodeGenerator = Java.type("ai.pelican.camel.authentication.AuthCodeGenerator");
var AppHeaderHandler = Java.type("ai.pelican.camel.bah.AppHeaderHandler");

var DOMSource = Java.type("javax.xml.transform.dom.DOMSource");
var StringWriter = Java.type("java.io.StringWriter");
var StreamResult = Java.type("javax.xml.transform.stream.StreamResult");
var TransformerFactory = Java.type("javax.xml.transform.TransformerFactory");
var Transformer = Java.type("javax.xml.transform.Transformer");
var OutputKeys = Java.type("javax.xml.transform.OutputKeys");
var ExecuteCamelRoute = Java.type('ai.pelican.camel.js.processor.ExecuteCamelRoute');
var Base64 = Java.type('java.util.Base64');

function sanctionCheck(exchange){
	var inMsg;
	var msgdbMap;
	var map;
	var Document;
	var Document1;
	var msgType;
	var readMsgdb;
	var sanctionFlag;
	var sanctionCheck;
	var institutionId;

	logger.info("In sanctionCheck");

	inMsg = exchange.getIn();
	msgdbMap = new HashMap();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
  	body = inMsg.getBody(java.lang.String.class);
  	setHeader(map, "originalMsg", body);
  	logger.trace("schedulingCheck: body = " + body);	

	setHeader(map, "PLCN_sanctionFlag", false);
	setHeader(map, "PLCN_complianceCheckExit", false);
	var plcnInternalcall = getHeader(map,"PLCN_call");
	plcnInternalcall = plcnInternalcall.toString();
	logger.info("schedulingCheck: plcnInternalcall = " + plcnInternalcall);	
	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("schedulingCheck: msgFamily = " + msgFamily);

	if(!msgFamily){
		var msgFamily = getHeader(map, "PLCN_msgFamily");
	}
	logger.info("calculateBusiness: msgFamily = " + msgFamily);	
	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("schedulingCheck: custom13 = " + custom13);	

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("schedulingCheck: institutionId = " + institutionId);	
	sanctionPath = institutionId.concat(".PROCESSING_STAGES.SANCTION_SCANNING.PRODUCTS");
	logger.info("sanctionCheck: sanctionPath = " + sanctionPath);
	var sanctionCode = memTblGetTableValue(map, "INST_PARAM", sanctionPath);
	logger.info("sanctionCheck: sanctionCode = " + sanctionCode);

	var productCode = getHeader(map, "PLCN_productCode");
	logger.info("sanctionCheck: productCode = " + productCode);

	if(isPatternPresent(sanctionCode, productCode)) {
		sanctionCheck = true;
	}else {
		sanctionCheck = true; //testing
	}

	setHeader(map, "PLCN_sanctionCheck", sanctionCheck);

	if((isPatternPresent(msgFamily,"SEPA") || isPatternPresent(msgFamily,"CBPR")) && plcnInternalcall == "true"){
		if(isPatternPresent(custom13, "SCANNING=Y|")){
			if(sanctionCheck == true) {
				logger.info("inside if loop to call createOfacRequest")
				createOfacRequest(exchange);
			}			
		}else{
			setHeader(map, "PLCN_sanctionFlag", false);
		}
	}

}

function validateHeaderCompliance(exchange) {
	var mapSize;
	var institutionId;
	var authorization;
	var serviceType;
	var uniqueMessageId;
	var headerFlag;
	var PLCN_sanctionFlag;

	logger.info('In validateHeaderCompliance');

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	mapSize = map.size;
	logger.info('validateHeaderCompliance: mapSize = ' + mapSize);

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info('validateHeaderCompliance: institutionId = ' + institutionId);

	authorization = getHeader(map, "PLCN_Authorization");
	logger.info('validateHeaderCompliance: authorization = ' + authorization);

	uniqueMessageId = getHeader(map, "PLCN_msgDbId");
	logger.info('validateHeaderCompliance: uniqueMessageId = ' + uniqueMessageId);

	serviceType = getHeader(map, "PLCNAPI_ServiceType");
	logger.info("validateHeaderCompliance: serviceType = " + serviceType);

	if((serviceType == "SCREENING" || serviceType == "SCREENING-WS" || serviceType == "AML-CHECK" || serviceType == "AML-SCREENING" 
		|| serviceType == "FRAUD" || serviceType == "FRAUD-SCREENING" || serviceType == "AML-FRAUD" || serviceType == "AML-SCREENING-FRAUD") 
		&& institutionId /*&& authorization*/ && uniqueMessageId) {
		setHeader(map, "PLCN_headerFlag", "true"); 
		logger.info("validateHeaderCompliance: headerFlag = " + getHeader(map, "PLCN_headerFlag"));
	}else {
		setHeader(map, "PLCN_headerFlag", "false"); 
		logger.info("validateHeaderCompliance: headerFlag = " + getHeader(map, "PLCN_headerFlag"));
		setHeader(map, "PLCN_sanctionFlag", "false");
		logger.info("validateHeaderCompliance: PLCN_sanctionFlag = " + getHeader(map, "PLCN_sanctionFlag"));
	}
}

function createOfacRequest(exchange) {
	var inMsg = exchange.getIn();
	var body = inMsg.getBody(java.lang.String.class);
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In createOfacRequest");
	logger.trace("createOfacRequest: original = " + body);
	//setHeader(map, "originalMsg", body);
	setHeader(map, "PLCN_sanctionFlag", false);

	var request = createXmlMessage(exchange);
	setHeader(map, "PLCNXML_request", request);
	setHeader(map, "PLCNAPI_request", request);
	inMsg.setBody(request);
	return request;
}

function enrichOFACMessage(exchange) {
	logger.info("In enrichOFACMessage");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var body = inMsg.getBody(java.lang.String.class);
	var response1 = body;
	logger.trace("enrichOFACMessage: response1 = " + response1);
	setHeader(map, "PLCNXML_response", response1);
	setHeader(map, "PLCNAPI_response", response1);

	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("enrichOFACMessage: custom13 = " + custom13);	
	ofacMxCalling(exchange);

	//var originalMessage = getHeader(map, "PLCNXML_originalMessage");
	//originalMessage = originalMessage.trim();
	//logger.info("enrichOFACMessage: originalMessage = " + originalMessage);
	//inMsg.setBody(originalMessage);

	custom13 = replacePattern(custom13, "SCANNING=Y", "SCANNING=D");
	logger.info("sanctionCheck: custom13 = " + custom13);
	setHeader(map, "PLCN_custom13", custom13);
	setHeader(map, "PLCNAPI_custom13", custom13);
	logger.info("enrichOFACMessage: PLCN_sanctionFlag = " + getHeader(map, "PLCN_sanctionFlag"));
	logger.info("enrichOFACMessage: PLCN_sanctionBlockFlag = " + getHeader(map, "PLCN_sanctionBlockFlag"));
	logger.info("enrichOFACMessage: PLCN_complianceCheckExit = " + getHeader(map, "PLCN_complianceCheckExit"));
	logger.info("enrichOFACMessage: PLCN_sanctionQueueId = " + getHeader(map, "PLCN_sanctionQueueId"));
	logger.info("enrichOFACMessage: PLCN_queueAudit = " + getHeader(map, "PLCN_queueAudit"));	
}

function ofacResponseErrorCodeExtraction(exchange,responseXml) {
	var resultStatus;
	var resultsTag;
	var resultEndTag;
	var resultTag;
	var errorCode;
	var errorSCode;
	var erroreCode;
	var errorValue;
	var errorDesc;
	var errorsDesc;
	var erroreDesc;
	var tempError;
	var msgBlocksComment;
	var msgComments1;
	var msgComments2;
	var retCnt;
	var tempXML = "";
	var errorlist = "";

	logger.info("In ofacResponseErrorCodeExtraction");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	
	resultTag = memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "RESPONSEOFACERRSTATUS"); //ResultStatus
	resultTag = resultTag.trim();
	logger.info("ofacResponseErrorCodeExtraction: resultTag: " + resultTag);
	logger.info("ofacResponseErrorCodeExtraction: responseXml in func: " + responseXml);

	resultsTag = "<" + resultTag.concat(">"); //<ResultStatus>
	resultEndTag = "</" + resultTag.concat(">"); //</ResultStatus>
	resultStatus = dataBetweenTokens(resultsTag,resultEndTag,responseXml); //CLEAN
	resultStatus = resultStatus.trim();
	logger.info("ofacResponseErrorCodeExtraction: resultStatus: " + resultStatus);
	tempXML = responseXml;
	logger.info("ofacResponseErrorCodeExtraction: tempXML:" + tempXML);
	errorCode = memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "RESPONSEOFACERRCODE"); //ErrorCode

	errorSCode = "<" + errorCode + ">"; //<ErrorCode>
	erroreCode = "</" + errorCode + ">"; //</ErrorCode>

	errorDesc = memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "RESPONSEOFACERRDESC"); //""

	errorsDesc = ("<".concat(errorDesc.concat(">"))); //<>
	erroreDesc = ("</".concat(errorDesc.concat(">"))); //</>

	while((isPatternPresent(tempXML, errorSCode)) && ((resultStatus.toUpperCase() != "SUCCESS"))) {
		errorCode = dataBetweenTokens(errorSCode,erroreCode,tempXML); //""
	   	errorValue = errorSCode.concat(errorCode.concat(erroreCode)); //<ErrorCode></ErrorCode>
	   	tempError = "";

		tempError = memTblGetTableValue(map, "ERROR_CODE_MAPPING",errorCode); //""

	   	if ((!(tempError)) || (tempError == "")) {
			tempError = memTblGetTableValue(map, "ERROR_CODE_MAPPING", "GenericError"); //8454
	   	}
	   	
		errorlist = errorlist + ":A00:00-" + tempError; //:A00:00-8454
		logger.info("ofacResponseErrorCodeExtraction: errorlist: " + errorlist);
		tempXML = replacePattern(tempXML, errorValue, "");
		logger.info("ofacResponseErrorCodeExtraction: tempxml: "+ tempXML);
	}
	return resultStatus;
}

function createXmlMessage(exchange) {
	var institutionId;
	var encodedMessage ;
	var uniqueMessageId;
	var msgFamily;
	var channelIdSource;
	var additionalruleinfo;
	var locationId;
	var responseMode;
	var intelligentScreening;
	var messageType;
	var channelId;
	var data;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In createXmlMessage");

	//ENCODING
	var helper = new JSHelperClass();
	var msgstr = convertDocumentToString(Document);
	var encodedMessage = Base64.getEncoder().encodeToString(helper.getBytes(msgstr));

	locationId = "AT";
	additionalruleinfo = "false";
	intelligentScreening = "false";
	responseMode = "SUMMARY";
	channelId = "Transaction Screening In";
	data = "";

	messageType = getHeader(map, "PLCN_msgType");
	logger.info("createXmlMessage: messageType: " + messageType);

	uniqueMessageId = getHeader(map, "PLCN_messageNo");
	logger.info("createXmlMessage: uniqueMessageId: " + uniqueMessageId);

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("createXmlMessage: institutionId: " + institutionId);

	msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("createXmlMessage:messageFamily: " + msgFamily);

	if(!msgFamily){
		var msgFamily = getHeader(map, "PLCN_msgFamily");
	}
	logger.info("createXmlMessage:messageFamily: " + msgFamily);
	channelIdSource = getHeader(map, "PLCN_channelIdSource");
	logger.info("createXmlMessage: channelIdSource: " + channelIdSource);

	var document = getDocument();
	var acew = createElement(document, "TransactionScreening");
	appendElementtoNode(document, acew);
	//createAttribute(document, acew, "xmlns:acew", "http://acewebservice.acesw.com/");

	var locationId1 = createElementwithTextNode(document, acew, "location_id", locationId);
	appendElementtoNode(acew, locationId1);

	var intelligentScreening1 = createElementwithTextNode(document, acew, "intelligent_screening", intelligentScreening);
	appendElementtoNode(acew, intelligentScreening1);

	var additionalruleinfo1 = createElementwithTextNode(document, acew, "additional_rule_info", additionalruleinfo);
	appendElementtoNode(acew, additionalruleinfo1);

	var responseMode1 = createElementwithTextNode(document, acew, "response_mode", responseMode);
	appendElementtoNode(acew, responseMode1);

	var msgFamily1 = createElementwithTextNode(document, acew, "message_family", msgFamily);
	appendElementtoNode(acew, msgFamily1);


	var messageType1 = createElementwithTextNode(document, acew, "message_type", messageType);
	appendElementtoNode(acew, messageType1);

	var channelId1 = createElementwithTextNode(document, acew, "channel_id", channelId);
	appendElementtoNode(acew, channelId1);


	var parameter1 = createElementwithTextNode(document, acew, "data", "");
	appendElementtoNode(acew, parameter1);

	var key1 = createElementwithTextNode(document, parameter1, "identification", uniqueMessageId);
	appendElementtoNode(parameter1, key1);

	var value1 = createElementwithTextNode(document, parameter1, "message_content", encodedMessage);
	appendElementtoNode(parameter1, value1);


	var request = convertDocumentToString(document);
	logger.info("createXmlMessage: request = " + request);
	setHeader(map, "PLCN_ofacRequest",request);

	/*var requestNew = "<TransactionScreening>" + "<location_id>" + locationId + "</location_id>" + "<intelligent_screening>" + intelligentScreening + "</intelligent_screening>" + "<additional_rule_info>" + additionalruleinfo + "</additional_rule_info>" +
	"<response_mode>" + responseMode + "</response_mode>" + "<message_family>" + msgFamily +"</message_family>" + "<message_type>" + messageType + "</message_type>" + "<channel_id>"+ channelId + "</channel_id>" + "<data>" + data + "<identification>" +
	uniqueMessageId + "</identification>" + "<message_content>"+ encodedMessage + "</message_content>" + "</data>" + "</TransactionScreening>";
	logger.info("createXmlMessage: requestNew = " + requestNew);*/

	return request;
}

function ofacMxCalling(exchange){
	var requestxml;
	var callMode;
	var retCodeCallWbSrvr;
	var responseXml;
	var mode;
	var webserviceName;
	var finalMessage;
	var tmpRetcod;
	var errDesc;
	var errDet;
	var referenceNo;
	var retCod;
	var errorVal;
	var module5;
	var module6;
	var action3;
	var action4;
	var queueID;
	var transqueueID;
	var finalStatusMessage;
	var retValue;
	var origMessage;
	var xmlNamespaceTag;
	var institutionID;
	var comments;
	var msgModeIn;
	var locationId;
	var retStatus;
	var custom13;
	var retErrorCode;
	var queueIdSql;

	logger.info("In ofacMxCalling");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var orgBody = inMsg.getBody(java.lang.String.class);
	var	hdrMap = inMsg.getHeaders();
	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

  	var executeRoute = new ExecuteCamelRoute();

	executeRoute.callRouteWithHeader('direct://sanctionSql', orgBody, hdrMap);

  	var outHdrMap = executeRoute.getOutputHeader();
  	var outmsg = executeRoute.getOutputBody(java.util.List.class);
  	logger.info("ofacMxCalling: Output Body = " + outmsg );
  	logger.info("ofacMxCalling: Headers = " + outHdrMap);
  	inMsg.setBody(outmsg);

	var rowMap = outmsg[0];
	queueIdSql = rowMap.get("QUEUEID");
	logger.info("ofacMxCalling: queueIdSql = " + queueIdSql);

  	inMsg.setBody(orgBody);

	institutionID = getHeader(map,"PLCN_institutionId");
	callMode = memTblGetTableValue(map, "FLAG-TABLE", "OFAC-CALL-MODE"); //PRODUCTION
	callMode = callMode.trim();
	logger.info("ofacMxCalling: callMode = " + callMode);	
	responseXml = getHeader(map, "PLCNXML_response");
	logger.info("ofacMxCalling: responseXml = " + responseXml);

	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("ofacMxCalling: custom13 = " + custom13);
	
	var lastsanctiondate = getDate();
	logger.info("ofacMxCalling: lastsanctiondate = " + lastsanctiondate);
	lastsanctiondate =  convertDateFormat(lastsanctiondate, "CCYYMMDD", "MMDDCCYY");
	logger.info("ofacMxCalling: lastsanctiondate = " + lastsanctiondate); //05222024
	lastsanctiondate = ((((lastsanctiondate.substr(0, 2)).concat("/")).concat((lastsanctiondate.substr(2, 2)))).concat("/")).concat(lastsanctiondate.substr(4, 4));
	logger.info("ofacMxCalling: lastsanctiondate = " + lastsanctiondate);
	
	module5 = "SCANNING";
	module6 = "SCANNING";
	action3 = "SEND";
	action4 = "RECEIVE";
	
	if(callMode == "PRODUCTION_IGNORE_RESPONSE") {
		origMessage = "Webservice call to Compliance made successfully in test MODE.";
		retCodeCallWbSrvr = 0;  //hardcoded
	}
	
	if(callMode == "PRODUCTION") {
		origMessage = "Webservice call to Compliance made successfully."; //audit1
		retCodeCallWbSrvr = 0;
		retCodeCallWbSrvr = 200; //hardcoded
		//retCodeCallWbSrvr = retCodeCallWbSrvr.toString();
	}
	
	xmlNamespaceTag = memTblGetTableValue(map, "FLAG-TABLE", "XMLNAMESPACE");
	logger.info("ofacMxCalling: xmlNamespaceTag = " + xmlNamespaceTag);
	
	if(retCodeCallWbSrvr === 200 || retCodeCallWbSrvr === 0){
		if(xmlNamespaceTag == "Y"){
		retCod = memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "RESPONSEERRCODE-MX");
		errDesc =((((memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "BODYBASEXML3").concat(".")).concat(memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "HEADERENDXML"))).concat(".")).concat(memTblGetTableValue(map, "XML_HEADER_SEQ_TABLE", "14")));
		errDet = ((((memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "BODYBASEXML3").concat (".")).concat(memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "HEADERENDXML"))).concat(".")).concat(memTblGetTableValue(map, "XML_HEADER_SEQ_TABLE", "15")));
		}
		else{
			//retCod = ofacResponseErrorCodeExtraction(exchange,responseXml);
			retCod = ofacResponseCode(exchange,responseXml); //BLOCKED
			logger.info("ofacMxCalling: retCod = " + retCod);
		}
	}
	
	retStatus = getHeader(map, "PLCN_scanStatus"); //SUCCESS
	logger.info("ofacMxCalling: retStatus = " + retStatus);
	retErrorCode = getHeader(map, "PLCN_retErrorCode");
	logger.info("ofacMxCalling: retErrorCode = " + retErrorCode);
	
	if(callMode == "PRODUCTION_IGNORE_RESPONSE") {
		responseXml = "";
		ofacResponseXml = "";
		setHeader(map, "ofacResponseXml", "");
		referenceNo =  getHeader(map, "PLCN_transRefNo");
		retCodeCallWbSrvr = 0;
		tmpRetcod = multiTestOfac(referenceNo);
		responseXml = ofacResponseXml;
		retCod = tmpRetcod;
		if(tmpRetcod == "SUCCESS") {
			retCod = "SUCCESS";
			responseXml = responseXml;
		}
		if(tmpRetcod == "OFAC BLOCKED") {
			retCod = "OFAC BLOCKED";
			responseXml = responseXml;
		}
		if (tmpRetcod == "AML") {
			retCod ="AML";
			responseXml = responseXml;
		}
		if(tmpRetcod = "AML BLOCKED") {
			retCod ="AML BLOCKED";
			responseXml = responseXml;
		}
		if(tmpRetcod == "SUSPECT") {
			retCod = "SUSPECT";
			responseXml = responseXml;
		}
		if(tmpRetcod == "OFAC BLOCKED + AML BLOCKED") {
			retCod = "OFAC BLOCKED + AML BLOCKED";
			responseXml = responseXml;
		}
		finalStatusMessage = "Webservice call made to OFAC/AML station successfully";
	}
	
	if((retCodeCallWbSrvr === 0) || retCodeCallWbSrvr === 200 || (callMode == "PRODUCTION_IGNORE_RESPONSE")){
		logger.info("ofacMxCalling: INSIDE LOOP 1");
		if(retStatus == "SUCCESS"){
			if(retCod == "CLEAN"){
				/* errorVal ="6700";
				gvComments = ":A00:00-" + errorVal;
				gvComments = gvComments + ":P00-1:A00:00-" + errorVal;
				comments = setCommentsForTransaction("00", "6700",map);
				logger.info("ofacMxCalling: comments = " + comments);
				setHeader(map, "PLCN_txnComments", comments); */
				setHeader(map, "PLCN_scanServiceFlag", "Y");				
				setHeader(map, "PLCN_complianceResponse", "CLEAN");
				custom13 = replacePattern(custom13, "SCANNING=Y", "SCANNING=D");
				logger.info("sanctionCheck: custom13 = " + custom13);
				setHeader(map, "PLCN_custom13", custom13);
				setHeader(map, "PLCNAPI_custom13", custom13);
                setHeader(map, "PLCN_validFlag", true);                
			}
			
			if(retCod == "BLOCKED" || retCod == "SUSPECT"){
				setHeader(map, "PLCN_sanctionFlag", true);
				errorVal ="8479";
				gvComments = ":A00:00-" + errorVal;
				gvComments = gvComments + ":P00-1:A00:00-" + errorVal;
				comments = setCommentsForTransaction("00", "8479",map);
				logger.info("ofacMxCalling: comments = " + comments);
				//setHeader(map, "PLCN_scanServiceFlag", "Y");
				setHeader(map, "PLCN_complianceResponse", "BLOCKED");
				setHeader(map, "PLCN_complianceCheckExit", true);
				setHeader(map, "PLCN_sanctionBlockFlag", true);
				setHeader(map, "PLCNAPI_sanctionBlockFlag", true);
				setHeader(map, "PLCNAPI_queueAudit", "OFAC-IN");
				setHeader(map, "PLCN_sanctionQueueId", "OFAC-IN");
				setHeader(map, "PLCNAPI_sanctionQueueId", "OFAC-IN");
				setHeader(map, "PLCN_lastSanctiondate", lastsanctiondate);
				setHeader(map, "PLCNAPI_lastSanctiondate", lastsanctiondate);
				custom13 = replacePattern(custom13, "SCANNING=Y", "SCANNING=F");
				logger.info("sanctionCheck: custom13 = " + custom13);
				setHeader(map, "PLCN_custom13", custom13);
				setHeader(map, "PLCNAPI_custom13", custom13);
				setHeader(map, "PLCN_validFlag", false);
				setHeader(map, "PLCN_queueAudit", "OFAC-IN");
			}
		}

		if((retStatus == "ERROR" && retErrorCode != "11126")|| retCod == "ERROR"){
			finalStatusMessage = "OFAC API Server not running.";
			logger.info("ofacMxCalling: OFAC API Server not running.");
			errorVal = "2082";
			gvComments = "P00-1:A00:00" + errorVal;
			setHeader(map, "EPC_CHECK_ENRICH_FLAG", "Y");
			comments = setCommentsForTransaction("00", "2082",map);
			setHeader(map, "PLCN_txnComments", comments);
			//setHeader(map, "PLCN_epcCheckEnrichFlag", "");	
			setHeader(map, "PLCN_complianceResponse", "NO RESPONSE");
			setHeader(map, "PLCN_complianceCheckExit", true);
			setHeader(map, "PLCN_sanctionBlockFlag", true);
			setHeader(map, "PLCNAPI_sanctionBlockFlag", true);
			setHeader(map, "PLCNAPI_sanctionQueueId", "OFACHLDQ");
			setHeader(map, "PLCN_sanctionQueueId", "OFACHLDQ");
			setHeader(map, "PLCN_queueAudit", "OFACHLDQ");
			setHeader(map, "PLCNAPI_queueAudit", "OFACHLDQ");
			setHeader(map, "PLCN_validFlag", false);
		}

		if((retStatus == "ERROR" && retErrorCode == "11126") && queueIdSql == 'OFAC-IN'){
			logger.info("ofacMxCalling: Updated queueID is OFAC-IN");
			setHeader(map, "PLCN_complianceCheckExit", true);
			setHeader(map, "PLCN_sanctionBlockFlag", true);
			setHeader(map, "PLCNAPI_sanctionBlockFlag", true);
			setHeader(map, "PLCNAPI_sanctionQueueId", "OFAC-IN");
			setHeader(map, "PLCN_sanctionQueueId", "OFAC-IN");
			setHeader(map, "PLCN_queueAudit", "OFAC-IN");
			setHeader(map, "PLCNAPI_queueAudit", "OFAC-IN");
			setHeader(map, "PLCN_validFlag", false);
		}
	}
	
	setHeader(map, "MODULE5", module5);
	setHeader(map, "MODULE6",module6);
	setHeader(map, "MODULE3",module5);
	setHeader(map, "MODULE4",module6);
	setHeader(map, "ACTION3",action3);
	setHeader(map, "ACTION4",action4);
	setHeader(map, "QUEUE_ID", queueID);
	setHeader(map, "PLCNXML_ofacXmlResponse" ,responseXml);
	
	if (retCodeCallWbSrvr == 0 || retCodeCallWbSrvr == 200) {

		if ((retCod == "SUCCESS") || (retCod == "CLEAN")) {
			finalStatusMessage = "Compliance check done successfully."; //audit2
			logger.info("ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "AML BLOCKED") {
			setHeader(map,"PLCN_sanctionFlag", true);
			finalStatusMessage = "AML has blocked the transaction";
			logger.info("ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "BLOCKED") {
			setHeader(map, "PLCN_sanctionFlag", true);
			finalStatusMessage = "Transaction has failed Compliance check"; //audit3
			logger.info("ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "SUSPECT") {
			finalStatusMessage = "Transaction has SUSPECT entry";
			logger.info("ofacMxCalling: ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "OFAC BLOCKED + AML BLOCKED") {
			setHeader(map,"PLCN_sanctionFlag", true);
			finalStatusMessage = "Transaction has failed Compliance check";
			logger.info("ofacMxCalling: finalStatusMessage: " + finalStatusMessage);
		}
	}else {
		finalStatusMessage = "Failed to Make Webservice Call"; //audit4
		errorVal = "2082";

		gvComments = "P00-1:A00:00-" + errorVal;
		logger.info("ofacMxCalling: gvComments = " + gvComments);
		comments = setCommentsForTransaction("00", "2082", map);
		setHeader(map, "PLCN_txnComments", comments);
		setHeader(map, "PLCN_complianceResponse", "NO RESPONSE");
		setHeader(map, "PLCN_complianceCheckExit", true);
		setHeader(map, "PLCN_sanctionQueueId", "OFACHLDQ");
	}
}

function ofacResponseCode(exchange,responseXml){
	var resultStatus;
	var resultSTag;
	var resultETag;
	var resultStatus;
	var status1;
	var statusSTag;
	var statusETag;
	var scanStatus;
	var errorSTag;
	var errorETag;
	var errorCode;
	var retErrorCode;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	//var body = inMsg.getBody(java.lang.String.class);
	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	if(isPatternPresent(responseXml, "code")){
		errorCode = "code";	
		errorSTag = "<" + errorCode.concat(">"); //<ResultStatus>
		errorETag = "</" + errorCode.concat(">"); //</ResultStatus>
		retErrorCode = dataBetweenTokens(errorSTag,errorETag,responseXml);
		setHeader(map, "PLCN_retErrorCode", retErrorCode);
		logger.info("ofacResponseCode:retErrorCode = " + retErrorCode);
		
		if(isPatternPresent(retErrorCode, "200") || isPatternPresent(retErrorCode, "40") || isPatternPresent(retErrorCode, "50") || isPatternPresent(retErrorCode, "111")){
			scanStatus = "ERROR";
			setHeader(map, "PLCN_scanStatus", scanStatus);
			return;
		}
	}
	//resultTag = "classification";
	
	resultStatus = dataBetweenTokens("<classification>","</classification>",responseXml); //BLOCKED/CLEAN
	logger.info("ofacResponseCode:resultStatus = " + resultStatus);

	if(resultStatus == 'ERROR'){
		var errorTag =  dataBetweenTokens("<error>","</error>",responseXml);
		var code1 = dataBetweenTokens("<code>","</code>",errorTag);
		logger.info("ofacResponseCode:code1 = " + code1);
		var errDesciption = dataBetweenTokens("<text>","</text>",errorTag);
		comments = setCommentsForTransaction("00", code1 ,map);
		logger.info("ofacResponseCode:errDesciption = " + errDesciption);
	}
	
	status1 = "status";
	statusSTag = "<" + status1.concat(">");
	statusETag = "</" + status1.concat(">");
	scanStatus = dataBetweenTokens(statusSTag,statusETag,responseXml); //SUCCESS OR ERROR
	logger.info("ofacResponseCode:scanStatus = " + scanStatus);

	var statusValue = dataBetweenTokens("<status>","</status>",scanStatus);
	logger.info("ofacResponseCode:statusValue = " + statusValue);
	setHeader(map, "PLCN_scanStatus", statusValue);
	return resultStatus;

}

/***
* multiTestOfac function
* @param {String} refno - reference no
* @returns {String} returns resultStatus if SUCCESS OR BLOCKED.
**/
function multiTestOfac(refno){
    var responseXml;
    if(IsPatternPresent(refno.toUpperCase(), "SUCCESS")){
        responseXml = "<UniqueMessageID>123456789</UniqueMessageID><PelicanRefID>M0000000123</PelicanRefID> <ResultStatus>SUCCESS</ResultStatus> <ErrorCode></ErrorCode> <MessageParameters> <Parameter> <Key>LOCATION_ID</Key> <Value>LONDON</Value> </Parameter><Parameter> <Key>INSTITUTIONID</Key> <Value>ACEAGB2L</Value> </Parameter> </MessageParameters> </ns2:PelicanWebServiceResponse>";
        return "SUCCESS";
    }
    if(IsPatternPresent(refno.toUpperCase(), "OFAC BLOCKED")){
        responseXml = "<UniqueMessageID>123456789</UniqueMessageID> <PelicanRefID>M0000000123</PelicanRefID> <CustomerID>776000008</CustomerID> <ResultStatus>OFAC BLOCKED</ResultStatus <ErrorCode></ErrorCode> <AMLScanResult> <ViolationInfo></ViolationInfo> <AMLErrorCode></AMLErrorCode> <AMLParameters/> </AMLScanResult> <OFACScanResult><BlacklistInfo>513+528+103+CONCLUSIVE+DJEU:625327+OSAMA BINLADEN|513+528+101+CONCLUSIVE+DJEU:40405+OSAMA BIN LADEN|</BlacklistInfo> <Classification>BLOCKED </Classification> <ClassificationOn>MSG</ClassificationOn> <ErrorCode></ErrorCode> <OFACParameters/> </OFACScanResult> <MessageParameters> <Parameter> <Key>RETURN_VALUE</Key> <Value>BLOCKED</Value> </Parameter> <Parameter> <Key>LOCATION_RETURN_VALUE</Key> <Value>LONDON</Value> </Parameter> <Parameter> <Key>PRIORITY</Key> <Value>5</Value> </Parameter> </MessageParameters> </ns2:PelicanWebServiceResponse>";
        return "OFAC BLOCKED";
    }
    if(IsPatternPresent(refno.toUpperCase(), "OFAC BLOCKED + AML BLOCKED")){
        responseXml = "<UniqueMessageID>123456789</UniqueMessageID> <PelicanRefID>M0000000123</PelicanRefID> <CustomerID>776000008</CustomerID> <ResultStatus>OFAC BLOCKED + AML BLOCKED</ResultStatus <ErrorCode></ErrorCode> <AMLScanResult> <ViolationInfo>401</ViolationInfo> <AMLErrorCode></AMLErrorCode> <AMLParameters/> </AMLScanResult> <OFACScanResult> <BlacklistInfo>513+528+103+CONCLUSIVE+DJEU:625327+OSAMA BIN LADEN|513+528+101+CONCLUSIVE+DJEU:40405+OSAMA BIN LADEN|</BlacklistInfo> <Classification>BLOCKED </Classification> <ClassificationOn>MSG</ClassificationOn> <ErrorCode></ErrorCode> <OFACParameters/> </OFACScanResult> <MessageParameters> <Parameter> <Key>RETURN_VALUE</Key> <Value>BLOCKED</Value> </Parameter> <Parameter> <Key>LOCATION_RETURN_VALUE</Key> <Value>LONDON</Value> </Parameter> <Parameter> <Key>PRIORITY</Key> <Value>5</Value> </Parameter> </MessageParameters> </ns2:PelicanWebServiceResponse>"
        return "OFAC BLOCKED + AML BLOCKED";
    }
    return "SUCCESS";
}


function setRequestCompliance(exchange){
	var inMsg;
	var map;
	var Document;
	var requestBody;

	logger.info("In setRequestCompliance");

    inMsg = exchange.getIn();
    map = inMsg.getHeaders();
  	body = inMsg.getBody(java.lang.String.class);
  	logger.trace("setRequestCompliance: body = " + body);

	logger.info("setRequestCompliance:setting original message");
	requestBody = getHeader(map,"PLCNXML_request");
	logger.trace("setRequestCompliance: orgnlBody = " + requestBody);
	inMsg.setBody(requestBody);
}

function originalMessageCompliance(exchange){
	var inMsg;
	var map;
	var Document;
	var orgnlBody;

	logger.info("In originalMessageCompliance");

    inMsg = exchange.getIn();
    map = inMsg.getHeaders();
  	body = inMsg.getBody(java.lang.String.class);
  	logger.trace("originalMessageCompliance: body = " + body);

  	if(!(isPatternPresent(body, "<Document>") && isPatternPresent(body, "</Document>"))){
  		logger.info("originalMessageCompliance: setting original message");
		orgnlBody = getHeader(map,"originalMsg");
		logger.trace("originalMessageCompliance: orgnlBody = " + orgnlBody);
		inMsg.setBody(orgnlBody);
  	}

  	//setHeader(map, "orgnlBody", "");
}
/*function ofacMxCalling(exchange) {
	var requestxml;
	var callMode;
	var retCodeCallWbSrvr;
	var responseXml;
	var mode;
	var webserviceName;
	var finalMessage;
	var tmpRetcod;
	var errDesc;
	var errDet;
	var referenceNo;
	var retCod;
	var errorVal;
	var module5;
	var module6;
	var action3;
	var action4;
	var queueID;
	var finalStatusMessage;
	var retValue;
	var origMessage;
	var xmlNamespaceTag;
	var institutionID;
	var comments;
	var gvComments;

	logger.info("In ofacMxCalling");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	//var body = inMsg.getBody(java.lang.String.class);
	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	institutionID = getHeader(map,"PLCN_institutionId");
	callMode = memTblGetTableValue(map, "FLAG-TABLE", "OFAC-CALL-MODE-MX"); //PRODUCTION
	callMode = callMode.trim();
	logger.info("ofacMxCalling: callMode = " + callMode);
	//webserviceName = memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "OFACWEBSERVICERESPONSE"); //Pelican_WS

	module5 = "SCANNING";
	module6 = "SCANNING";
	action3 = "SEND";
	action4 = "RECEIVE";

	if(callMode == "PRODUCTION_IGNORE_RESPONSE") {
		origMessage = "Webservice call to Compliance made successfully in test MODE.";
		retCodeCallWbSrvr = 0; 
	}

	if(callMode == "PRODUCTION") {
		origMessage = "Webservice call to Compliance made successfully."; //audit1
		retCodeCallWbSrvr = 0;
		//retCodeCallWbSrvr = retCodeCallWbSrvr.toString();
	}

	if(callMode == "PRODUCTION") {
		responseXml= getHeader(map, "PLCNXML_response");
		logger.info("ofacMxCalling: responseXml = " + responseXml);
		setHeader(map, "PLCNXML_ofacXmlResponse", responseXml);
	}
	xmlNamespaceTag = memTblGetTableValue(map, "FLAG-TABLE", "XMLNAMESPACE");
	logger.info("ofacMxCalling: xmlNamespaceTag = " + xmlNamespaceTag);

	if (xmlNamespaceTag == "Y") {
		retCod = memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "RESPONSEERRCODE-MX");
		errDesc =((((memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "BODYBASEXML3").concat(".")).concat(memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "HEADERENDXML"))).concat(".")).concat(memTblGetTableValue(map, "XML_HEADER_SEQ_TABLE", "14")));
		errDet = ((((memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "BODYBASEXML3").concat (".")).concat(memTblGetTableValue(map, "XML_GENERIC_PARAM_TABLE", "HEADERENDXML"))).concat(".")).concat(memTblGetTableValue(map, "XML_HEADER_SEQ_TABLE", "15")));
	}
	else {
		retCod = ofacResponseErrorCodeExtraction(exchange,responseXml);
		logger.info("ofacMxCalling: ofacResponseErrorCodeExtraction = " + retCod);
	}

	if(callMode == "PRODUCTION_IGNORE_RESPONSE") {
		responseXml = "";
		ofacResponseXml = "";
		setHeader(map, "ofacResponseXml", "");
		referenceNo =  getHeader(map, "PLCN_transRefNo");
		retCodeCallWbSrvr = 0;
		tmpRetcod = multiTestOfac(referenceNo);
		responseXml = ofacResponseXml;
		retCod = tmpRetcod;
		if(tmpRetcod == "SUCCESS") {
			retCod = "SUCCESS";
			responseXml = responseXml;
		}
		if(tmpRetcod == "OFAC BLOCKED") {
			retCod = "OFAC BLOCKED";
			responseXml = responseXml;
		}
		if (tmpRetcod == "AML") {
			retCod ="AML";
			responseXml = responseXml;
		}
		if(tmpRetcod = "AML BLOCKED") {
			retCod ="AML BLOCKED";
			responseXml = responseXml;
		}
		if(tmpRetcod == "SUSPECT") {
			retCod = "SUSPECT";
			responseXml = responseXml;
		}
		if(tmpRetcod == "OFAC BLOCKED + AML BLOCKED") {
			retCod = "OFAC BLOCKED + AML BLOCKED";
			responseXml = responseXml;
		}
		finalStatusMessage = "Webservice call made to OFAC/AML station successfully";
	}


	if((retCodeCallWbSrvr === 0) || (callMode == "PRODUCTION_IGNORE_RESPONSE")) {

		if((retCod != "SUCCESS") && (retCod != "CLEAN")) {

			if(retCod == "ERROR") {
				finalStatusMessage = "OFAC API Server not running.";
				errorVal = "2082";
				gvComments = "P00-1:A00:00" + errorVal;
				setHeader(map, "EPC_CHECK_ENRICH_FLAG", "Y");
				comments = setCommentsForTransaction("00", "2082",map);
				setHeader(map, "PLCN_txnComments", comments);
				setHeader(map, "EPC_CHECK_ENRICHFLAG", "");

			}else {
				setHeader(map, "PLCN_sanctionFlag", true);
				errorVal = "8479";
				gvComments ="P00-1:A00:00-" + errorVal;
				comments = setCommentsForTransaction("00", "8479",map);
				setHeader(map, "PLCN_txnComments", comments);
			}
		}else{
				errorVal ="6700";
				gvComments = ":A00:00-" + errorVal;
				gvComments = gvComments + ":P00-1:A00:00-" + errorVal;
				comments = setCommentsForTransaction("00", "6700",map);
				logger.info("ofacMxCalling: comments = " + comments);
				setHeader(map, "PLCN_txnComments", comments);
				setHeader(map, "scanServiceFlag", "Y");
			}
	}

	setHeader(map, "MODULE5", module5);
	setHeader(map, "MODULE6",module6);
	setHeader(map, "MODULE3",module5);
	setHeader(map, "MODULE4",module6);
	setHeader(map, "ACTION3",action3);
	setHeader(map, "ACTION4",action4);
	setHeader(map, "QUEUE_ID", queueID);
	setHeader(map, "PLCNXML_ofacXmlResponse" ,responseXml);

	if (retCodeCallWbSrvr == 0) {

		if ((retCod == "SUCCESS") || (retCod == "CLEAN")) {
			finalStatusMessage = "Compliance check done successfully."; //audit2
			logger.info("ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "AML BLOCKED") {
			setHeader(map,"PLCN_sanctionFlag", true);
			finalStatusMessage = "AML has blocked the transaction";
			logger.info("ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "OFAC BLOCKED") {
			setHeader(map, "PLCN_sanctionFlag", true);
			finalStatusMessage = "Transaction has failed Compliance check"; //audit3
			logger.info("ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "SUSPECT") {
			finalStatusMessage = "Transaction has SUSPECT entry";
			logger.info("ofacMxCalling: ofacMxCalling: finalStatusMessage = " + finalStatusMessage);
		}

		if(retCod == "OFAC BLOCKED + AML BLOCKED") {
			setHeader(map,"PLCN_sanctionFlag", true);
			finalStatusMessage = "Transaction has failed Compliance check";
			logger.info("ofacMxCalling: finalStatusMessage: " + finalStatusMessage);
		}
	}else {
		finalStatusMessage = "Failed to Make Webservice Call"; //audit4
		errorVal = "2082";

		gvComments = "P00-1:A00:00-" + errorVal;
		logger.info("ofacMxCalling: gvComments = " + gvComments);
		comments = setCommentsForTransaction("00", "2082", map);
		setHeader(map, "PLCN_txnComments", comments);
	}

	setHeader(map, "OFAC_ORIG_MESSAGE", origMessage);
	setHeader(map, "PLXN_ofacStatusMessage", finalStatusMessage);
	setHeader(map, "QUEUE_ID" ,queueID);
	logger.info("ofacMxCalling: flag value = " + getHeader(map,"PLCN_sanctionFlag"));
	return;
}*/

function createXmlMessageBak(exchange) {
	var institutionId;
	var encodedMessage ;
	var uniqueMessageId;
	var msgFamily;
	var channelIdSource;
	var additionalruleinfo;
	var locationId;
	var responseMode;
	var intelligentScreening;
	var messageType;
	var channelId;
	var data;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In createXmlMessage");

	//ENCODING
	var helper = new JSHelperClass();
	var msgstr = convertDocumentToString(Document);
	var encodedMessage = Base64.getEncoder().encodeToString(helper.getBytes(msgstr));

	locationId = "AT";
	additionalruleinfo = "false";
	intelligentScreening = "false";
	responseMode = "SUMMARY";
	channelId = "Transaction Screening In";
	data = "";

	messageType = getHeader(map, "PLCN_msgType");
	logger.info("createXmlMessage: messageType: " + messageType);

	uniqueMessageId = getHeader(map, "PLCN_messageNo");
	logger.info("createXmlMessage: uniqueMessageId: " + uniqueMessageId);

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("createXmlMessage: institutionId: " + institutionId);

	msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("createXmlMessage:messageFamily: " + msgFamily);

	channelIdSource = getHeader(map, "PLCN_channelIdSource");
	logger.info("createXmlMessage: channelIdSource: " + channelIdSource);

	var document = getDocument();
	var acew = createElement(document, "acew:PelicanWebServiceRequest");
	appendElementtoNode(document, acew);
	createAttribute(document, acew, "xmlns:acew", "http://acewebservice.acesw.com/");
	
	var message = createElementwithTextNode(document, acew, "Message", encodedMessage);
	appendElementtoNode(acew, message);

	var uniqueMessageID = createElementwithTextNode(document, acew, "UniqueMessageID", uniqueMessageId);
	appendElementtoNode(acew, uniqueMessageID);

	var possibleDuplicateEmission = createElementwithTextNode(document, acew, "PossibleDuplicateEmission", "NO");
	appendElementtoNode(acew, possibleDuplicateEmission);

	var institutionId = createElementwithTextNode(document, acew, "InstitutionId", institutionId);
	appendElementtoNode(acew, institutionId);

	var requestType = createElementwithTextNode(document, acew, "RequestType", "DEFAULT");
	appendElementtoNode(acew, requestType);

	var action = createElementwithTextNode(document, acew, "Action", "PROCESS");
	appendElementtoNode(acew, action);

	var serviceType = createElementwithTextNode(document, acew, "ServiceType", "SANCTION");
	appendElementtoNode(acew, serviceType);

	var messageParameters = createElementwithTextNode(document, acew, "MessageParameters", "");
	appendElementtoNode(acew, messageParameters);

	//1st parameter
	var parameter1 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter1);

	var key1 = createElementwithTextNode(document, parameter1, "KEY", "RULE_SET");
	appendElementtoNode(parameter1, key1);

	var value1 = createElementwithTextNode(document, parameter1, "VALUE", "");
	appendElementtoNode(parameter1, value1);

	//2nd
	var parameter2 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter2);

	var key2 = createElementwithTextNode(document, parameter2, "KEY", "MESSAGEFAMILY");
	appendElementtoNode(parameter2, key2);

	var value2 = createElementwithTextNode(document, parameter2, "VALUE", msgFamily);
	appendElementtoNode(parameter2, value2);

	//3rd
	var parameter3 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter3);

	var key3 = createElementwithTextNode(document, parameter3, "KEY", "LOCATION_ID");
	appendElementtoNode(parameter3, key3);

	var value3 = createElementwithTextNode(document, parameter3, "VALUE", "");
	appendElementtoNode(parameter3, value3);

	//4th
	var parameter4 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter4);

	var key4 = createElementwithTextNode(document, parameter4, "KEY", "PRIORITY_RULE");
	appendElementtoNode(parameter4, key4);

	var value4 = createElementwithTextNode(document, parameter4, "VALUE", "");
	appendElementtoNode(parameter4, value4);	

	//5th
	var parameter5 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter5);

	var key5 = createElementwithTextNode(document, parameter5, "KEY", "ROUTING_RULE");
	appendElementtoNode(parameter5, key5);

	var value5 = createElementwithTextNode(document, parameter5, "VALUE", "");
	appendElementtoNode(parameter5, value5);

	//6th
	var parameter6 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter6);

	var key6 = createElementwithTextNode(document, parameter5, "KEY", "LOCATION_RULE");
	appendElementtoNode(parameter6, key6);

	var value6 = createElementwithTextNode(document, parameter5, "VALUE", "");
	appendElementtoNode(parameter6, value6);

	//7th
	var parameter7 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter7);

	var key7 = createElementwithTextNode(document, parameter5, "KEY", "MESSAGE_PARAMETERS_IN_RESPONSE");
	appendElementtoNode(parameter7, key7);

	var value7 = createElementwithTextNode(document, parameter5, "VALUE", "");
	appendElementtoNode(parameter7, value7);

	//8th
	var parameter8 = createElementwithTextNode(document, messageParameters, "PARAMETER", "");
	appendElementtoNode(messageParameters, parameter8);

	var key8 = createElementwithTextNode(document, parameter5, "KEY", "CHANNEL_ID_SOURCE");
	appendElementtoNode(parameter8, key8);

	var value8 = createElementwithTextNode(document, parameter5, "VALUE", channelIdSource);
	appendElementtoNode(parameter8, value8);

	var request = convertDocumentToString(document);
	logger.info("createXmlMessage: request = " + request);

	var requestNew = "<TransactionScreening>" + "<location_id>" + locationId + "</location_id>" + "<intelligent_screening>" + intelligentScreening + "</intelligent_screening>" + "<additional_rule_info>" + additionalruleinfo + "</additional_rule_info>" +
	"<response_mode>" + responseMode + "</response_mode>" + "<message_family>" + msgFamily +"</message_family>" + "<message_type>" + messageType + "</message_type>" + "<channel_id>"+ channelId + "</channel_id>" + "<data>" + data + "<identification>" +
	uniqueMessageId + "</identification>" + "<message_content>"+ encodedMessage + "</message_content>" + "</data>" + "</TransactionScreening>";
	logger.info("createXmlMessage: requestNew = " + requestNew);

	return request;
}

function customSntdSanctionCheck(exchange){
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	var responseCd = getHeader(map, "PLCN_complianceResponse");	
	logger.info("customSntdSanctionCheck: responseCd = " + responseCd);

	var institutionID = getHeader(map,"PLCN_institutionId");
	logger.info("customSntdSanctionCheck: tenantName = " + tenantName);

	var tenantName = getHeader(map, "PLCN_tenantName");
	logger.info("customSntdSanctionCheck: tenantName = " + tenantName);

	if(!tenantName){
		var tenantNamePath = institutionID + ".INSTITUTION_DETAILS.TENANT_NAME";
		logger.info("customSntdSanctionCheck: tenantName = " + tenantNamePath);
		tenantName = memTblGetTableValue(map, "INST_PARAM",tenantNamePath);
		logger.info("customSntdSanctionCheck: tenantName = " + tenantName);
	}
	if(responseCd == 'BLOCKED'&& (tenantName == "SNTDBK")){
		logger.info("customSntdSanctionCheck: in santander tenant loop ");
		//customSntdSanctionRule(exchange);
		setHeader(map, "PLCN_sanctionsBlockStatus", "Y");
		setHeader(map, "PLCN_purposeTextFlag", "Y");
	}
}

function customSntdSanctionRule(exchange) {

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	logger.info("in customSntdSanctionRule");
	
	var sanctionsF001EodMsgDebt;
	var sanctionsF001EodMsgCebt;
	var sanctionsSubF001EodMsgDebt;
	var sanctionsSubF001EodMsgCred;
	var sanctionsSapDr;
	var sanctionsSapCr;
	var sanctionsSubSapCr;
	var sanctionsSubSapDr;
	
	sanctionsF001EodMsgDebt = getHeader(map, "PLCN_sanctionsF001EodMsgDebt");
	logger.info("customSntdSanctionRule: sanctionsF001EodMsgDebt = " + sanctionsF001EodMsgDebt);
	sanctionsF001EodMsgCred = getHeader(map, "PLCN_sanctionsF001EodMsgCred");
	logger.info("customSntdSanctionRule: sanctionsF001EodMsgCred = " + sanctionsF001EodMsgCred);
	sanctionsSubF001EodMsgDebt = getHeader(map, "PLCN_sanctionsSubF001EodMsgDebt");
	logger.info("customSntdSanctionRule: sanctionsSubF001EodMsgDebt = " + sanctionsSubF001EodMsgDebt);
	sanctionsSubF001EodMsgCred = getHeader(map, "PLCN_sanctionsSubF001EodMsgCred");
	logger.info("customSntdSanctionRule: sanctionsSubF001EodMsgCred = " + sanctionsSubF001EodMsgCred);
	sanctionsSapDr = getHeader(map, "PLCN_sanctionsSapDr");
	logger.info("customSntdSanctionRule: sanctionsSapDr = " + sanctionsSapDr);
	sanctionsSapCr = getHeader(map, "PLCN_sanctionsSapCr");
	logger.info("customSntdSanctionRule: sanctionsSapCr = " + sanctionsSapCr);
	sanctionsSubSapCr = getHeader(map, "PLCN_sanctionsSubSapCr");
	logger.info("customSntdSanctionRule: sanctionsSubSapCr = " + sanctionsSubSapCr);
	sanctionsSubSapDr = getHeader(map, "PLCN_sanctionsSubSapDr");
	logger.info("customSntdSanctionRule: sanctionsSubSapDr = " + sanctionsSubSapDr);
	
	 setHeader(map, "PLCN_sapDr", sanctionsSapDr);
	 setHeader(map, "PLCN_sapCr", sanctionsSapCr);
	 setHeader(map, "PLCN_subSapCr", sanctionsSubSapCr);
	 setHeader(map, "PLCN_subSapDr", sanctionsSubSapDr);
	 setHeader(map, "PLCN_f001EodMsgDebt", sanctionsF001EodMsgDebt);
	 setHeader(map, "PLCN_f001EodMsgCred", sanctionsF001EodMsgCred);
	 setHeader(map, "PLCN_subF001EodMsgDebt", sanctionsSubF001EodMsgDebt);
	 setHeader(map, "PLCN_subF001EodMsgCred", sanctionsSubF001EodMsgCred);
	 setHeader(map, "PLCN_f001EodStatus", "A");
	 setHeader(map, "PLCN_f0011EodStatus", "A");
	 setHeader(map, "PLCN_coreEodStatus", "A");

	 logger.info("customSntdSanctionRule: PLCN_f001EodMsgCred = " + getHeader(map, "PLCN_f001EodMsgCred"));
}