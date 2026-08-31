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


function setInternalFlag(exchange) {
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();	

	logger.info("In setInternalFlag");

	var creationCall = getHeader(map, "PLCN_creationCall");
	logger.info("setInternalFlag: creationCall = " + creationCall);

	if(creationCall) {
		setHeader(map, "PLCN_call", true);
	}

	logger.info("setInternalFlag: PLCN_call = " + getHeader(map, "PLCN_call"));
}

function calculateHash(exchange) {
	var institutionId;
	var inMsg;
	var map;
	var body;
	var hdrMap;
	var duplicateCheck;
	var flag;
	var custom44;
	var result;
	var Document;

	logger.info("In calculateHash");

    inMsg = exchange.getIn();
    map = inMsg.getHeaders();
  	
	//var readMsgdb = exchange.getIn().getBody(java.util.List.class);
	body = inMsg.getBody(java.lang.String.class);
	logger.info("calculateHash: orgnlBody = " + body);

  	setHeader(map, "orgnlBody", body);
  	logger.trace("calculateHash: orgnlBody = " + getHeader(map, "orgnlBody"));

  	hdrMap = inMsg.getHeaders();
    //var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	setHeader(map, "PLCN_duplicateMessage", "false");

	var plcnInternalcall = getHeader(map,"PLCN_call");
	logger.info("plcnInternalcall = " + plcnInternalcall);
	plcnInternalcall = plcnInternalcall.toString();

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");

	if(!msgFamily){
		var msgFamily = getHeader(map, "PLCN_msgFamily");
	}
	if(msgFamily != "PSAR") {
		Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	}
	/* if(!msgFamily){
		var msgFamily = readMsgdb.get("MSG_FAMILY");
		logger.info("calculateHash: msgFamily = " + msgFamily);
	} */
	
	msgFamily = msgFamily.toUpperCase();
	logger.info("calculateHash: msgFamily = " + msgFamily);

	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("calculateHash: custom13 = " + custom13);

	institutionId = getHeader(map, "PLCN_institutionId"); //PLCNUSNY

	duplicateCheck = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.DUPLICATE_CHECK.BASED_ON_HASHCODE.DUP_CHK_TYP_HASH");

	flag = memTblGetTableValue(map, "INST_PARAM",duplicateCheck);
	
	var fircoRespDuplFlag = getHeader(map, "PLCN_fircoRespDuplFlagDB");

	if(!fircoRespDuplFlag){
		var fircoRespDuplFlag = getHeader(map, "PLCN_fircoRespDuplFlag");
	}
	logger.info("calculateHash: fircoRespDuplFlag = " + fircoRespDuplFlag);

	var IbsFlag = getHeader(map, "PLCN_IbsDuplFlag");
	logger.info("calculateHash: IbsFlag = " + IbsFlag);

	if(!IbsFlag) {
		IbsFlag = getHeader(map, "PLCNAPI_IbsDuplFlag");
		logger.info("calculateHash: IbsFlag = " + IbsFlag);
	}
	
	var creationCall = getHeader(map, "PLCN_creationCall");
	logger.info("creationCall = " + creationCall);

	if(creationCall == "true"){
		if(flag == "Y"){
		    deriveHashCodeMX(exchange);
		    custom44 = getHeader(map, 'PLCN_CUSTOM44');
		    logger.info("custom44 = " + custom44);
		    hdrMap.put("CUSTOM44", custom44);

		    logger.info("calculateHash: hdrMap = " + hdrMap);
		    logger.trace("calculateHash: body = " + body);

		   	// var hdrMap2 = new HashMap();
			//logger.info("calculateHash: typeof hdrMap2 = " + typeof hdrMap2);

			//hdrMap2.put("CUSTOM44", custom44);
			//logger.info("calculateHash: hdrMap2 = " + hdrMap);

		  	var executeRoute = new ExecuteCamelRoute();
			executeRoute.callRouteWithHeader('direct://HashCheck', body, hdrMap);
		  	var outHdrMap = executeRoute.getOutputHeader();
		  	var outmsg = executeRoute.getOutputBody(java.util.List.class);
		  	inMsg.setBody(outmsg);

		  	logger.trace("calculateHash: Output Body = " + outmsg );
		  	logger.trace("calculateHash: Headers = " + outHdrMap);

		  	var rowCount = getHeader(outHdrMap, "CamelSqlRowCount");
		  	logger.info("CamelSqlRowCount : " + rowCount);
		  	if(rowCount > 0) {
		  		hashCheck(exchange);
		  	}
		}	
	}else if((isPatternPresent(msgFamily,"SEPA") || isPatternPresent(msgFamily,"CBPR")) || (isPatternPresent(msgFamily,"TARGET2") && plcnInternalcall == "true" && isPatternPresent(custom13, "DUPLICATE=Y")) || (isPatternPresent(msgFamily,"XML") && fircoRespDuplFlag == "Y") || IbsFlag == "Y" ){
		if(flag == "Y"){
		    deriveHashCodeMX(exchange);
		    custom44 = getHeader(map, 'PLCN_CUSTOM44');
		    logger.info("custom44 = " + custom44);
		    hdrMap.put("CUSTOM44", custom44);

		    logger.info("calculateHash: hdrMap = " + hdrMap);
		    logger.trace("calculateHash: body = " + body);

		   	// var hdrMap2 = new HashMap();
			//logger.info("calculateHash: typeof hdrMap2 = " + typeof hdrMap2);

			//hdrMap2.put("CUSTOM44", custom44);
			//logger.info("calculateHash: hdrMap2 = " + hdrMap);

		  	var executeRoute = new ExecuteCamelRoute();
			executeRoute.callRouteWithHeader('direct://HashCheck', body, hdrMap);
		  	var outHdrMap = executeRoute.getOutputHeader();
		  	var outmsg = executeRoute.getOutputBody(java.util.List.class);
		  	inMsg.setBody(outmsg);

		  	logger.trace("calculateHash: Output Body = " + outmsg );
		  	logger.trace("calculateHash: Headers = " + outHdrMap);

		  	var rowCount = getHeader(outHdrMap, "CamelSqlRowCount");
		  	logger.info("calculateHash : " + rowCount);
		  	if(rowCount > 0) {
		  		hashCheck(exchange);
		  	}
			
			//if((isPatternPresent(msgFamily,"XML") && fircoRespDuplFlag == "Y") || IbsFlag == "Y") { 	//for SSBTC-312
				custom13 = replacePattern(custom13, "DUPLICATE=Y", "DUPLICATE=D");
				logger.info("calculateHash: custom13 = " + custom13);
				setHeader(map, "PLCN_custom13", custom13);
			//}

			//if(isPatternPresent(msgFamily,"XML")) { //for SSBTC-312
				//custom13 = replacePattern(custom13, "DUPLICATE=Y", "DUPLICATE=D");
				//logger.info("calculateHash: custom13 = " + custom13);
				//setHeader(map, "PLCN_custom13", custom13);				
			//}
		}
	}

	result = getHeader(map, "PLCN_duplicateMessage");
	logger.info("calculateHash: PLCN_duplicateMessage = " + result);
	logger.info("calculateHash: typeof PLCN_duplicateMessage = " + typeof result);

	if(result == "true") {
		setHeader(map, "status", "duplicate");
		setHeader(map, "PLCN_displayFlag", "Y");
		setHeader(map, "PLCN_processingStage", "DUPL");
		setHeader(map, "PLCN_currentAuthLevel", "DUPL=4");
		logger.info("calculateHash: duplicate message");
	}else {
		setHeader(map, "status", "not duplicate");
	}

	logger.info("calculateHash:PLCN_duplicateMessage in calculatehash = " + getHeader(map, "PLCN_duplicateMessage"));
}

function hashCheck(exchange) {
	var inMsg;
	var map;

    logger.info("In HashCheck");

    inMsg = exchange.getIn();
    map = inMsg.getHeaders();

	duplicateCheckCorpMX(exchange);
	logger.trace("og body = " + getHeader(map,"orgnlBody"));
	/*var orgnlBody = getHeader(map,"orgnlBody");
	inMsg.setBody(orgnlBody);*/
	//logger.info("hashCheck: orgnlBody = " + orgnlBody);
	logger.trace("hashCheck:PLCN_duplicateMessage = " + getHeader(map, "PLCN_duplicateMessage"));
}

function calculateBusiness(exchange) {
	var inMsg;
	var map;
	var duplicateCheck;
	var institutionId;
	var flag;
	var orgnlBody;
	var result;

	logger.info("In CalculateBusiness");
   	inMsg = exchange.getIn();
    map = inMsg.getHeaders();
	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("institutionId: " + institutionId);

	duplicateCheck = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.DUPLICATE_CHECK.DUP_CHK_TYP_BUSI_COND.REQUIRED");
	logger.info("calculateBusiness: duplicateCheck = " + duplicateCheck);
	
	flag =  memTblGetTableValue(map, "INST_PARAM",duplicateCheck);
	logger.info("calculateBusiness: flag value = " + flag);

	var plcnInternalcall = getHeader(map,"PLCN_call");
	logger.info("plcnInternalcall = " + plcnInternalcall);
	plcnInternalcall = plcnInternalcall.toString();

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("calculateBusiness: msgFamily = " + msgFamily);
	msgFamily = msgFamily.toUpperCase();

	if(!msgFamily){
		var msgFamily = getHeader(map, "PLCN_msgFamily");
	}
	logger.info("calculateBusiness: msgFamily = " + msgFamily);
	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("custom13 = " + custom13);

	var creationCall = getHeader(map, "PLCN_creationCall");
	logger.info("calculateBusiness:creationCall = " + creationCall);
	
	if(!creationCall){
		creationCall = getHeader(map, "PLCNAPI_creationCall");
		logger.info("calculateBusiness:creationCall = " + creationCall);
	}

	if(creationCall == "true" && isPatternPresent(custom13, "DUPLICATE=Y") && (isPatternPresent(msgFamily,"SEPA") || isPatternPresent(msgFamily,"CBPR")|| isPatternPresent(msgFamily,"TARGET2") || isPatternPresent(msgFamily,"SEPAINST"))){
		logger.info("calculateBusiness: INSIDE 1ST IF ");
		if(flag == "Y"){
			businessDuplicateMx(exchange);
			custom13 = replacePattern(custom13, "DUPLICATE=Y", "DUPLICATE=D");
			logger.info("calculateBusiness: custom13 = " + custom13);
			setHeader(map, "PLCN_custom13", custom13);
		}	
	}else if((isPatternPresent(msgFamily,"SEPA") || isPatternPresent(msgFamily,"CBPR") || isPatternPresent(msgFamily,"TARGET2")) || isPatternPresent(msgFamily,"SEPAINST") && plcnInternalcall == "true" && isPatternPresent(custom13, "DUPLICATE=Y")){
		logger.info("calculateBusiness: INSIDE 2ND IF ");
		if(flag == "Y"){
			businessDuplicateMx(exchange);
		}
		custom13 = replacePattern(custom13, "DUPLICATE=Y", "DUPLICATE=D");
		logger.info("calculateBusiness: custom13 = " + custom13);
		setHeader(map, "PLCN_custom13", custom13);
	}
	orgnlBody = getHeader(map,"orgnlBody");
	logger.trace("calculateBusiness: orgnlBody = " + orgnlBody);
	inMsg.setBody(orgnlBody);
	result = getHeader(map, "PLCN_duplicateMessage");
	logger.info("calculateBusiness: PLCN_duplicateMessage = " + result);
	logger.info("calculateBusiness: typeof PLCN_duplicateMessage = " + typeof result);

	if(result == "true") {
		setHeader(map, "status", "duplicate");
		setHeader(map, "PLCN_displayFlag", "Y");
		setHeader(map, "PLCN_processingStage", "DUPL");
		setHeader(map, "PLCN_currentAuthLevel", "DUPL=4");
		logger.info("calculateHash: duplicate message");
	}else {
		setHeader(map, "status", "not duplicate");
	}
}

function businessCheck(exchange) {
	var inMsg;
	var map;
	var orgnlBody;
	var mtchQueryVal;

	logger.info("In BusinessCheck");

  	inMsg = exchange.getIn();
    map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    logger.trace("BusinessCheck: PLCN_duplicateMessage before duplicateSelectQueryMX = " + exchange.getIn().getHeader("PLCN_duplicateMessage"));
    //mtchQueryVal = getHeader(map, "MTCH_QUERY_VAL"); 
	duplicateSelectQueryMX(exchange);
	/*var orgnlBody = getHeader(map,"orgnlBody");
	logger.info("businessCheck: originalbody = " + orgnlBody);
	inMsg.setBody(orgnlBody);*/
	logger.info("BusinessCheck: PLCN_duplicateMessage after duplicateSelectQueryMX = " + exchange.getIn().getHeader("PLCN_duplicateMessage"));
}

function deriveHashCodeMX(exchange) {

	var hashCode;
	var inMsg;
    var map;
    var encryptDecrypt;
    inMsg = exchange.getIn();
    map = inMsg.getHeaders();
    logger.info("In deriveHashCodeMX ");

	encryptDecrypt = new EncryptDecrypt();
	hashCode = encryptDecrypt.getMessageDigest("SHA-1",exchange.getIn().getBody(java.lang.String.class));
	logger.trace("hashCode: " + hashCode);

	setHeader(map, "PLCN_NEWCHECKSUM",hashCode);
	setHeader(map, "PLCN_CUSTOM44",hashCode);
	setHeader(map, "PLCN_hashCode",hashCode);
}

function duplicateCheckCorpMX(exchange) {

	var inMsg;
    var map;
	var errorCode;
	var duplicateCheck;
	var flag;
	var channelID;
	var channelIdSource;
	var channelIdTarget;
	var msgId;
	var orgMsgId;
	var custom5Dupl;
	var institutionId;
	var parentMsgDbId;
	var parentMsgNo;
	var custom44;
	var duplFlag = ""; 
	var custom44 = "";
	var Document;
	var rs;
	logger.info("In duplicateCheckCorpMX");

	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	rs = exchange.getIn().getBody(java.util.List.class);
	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	if(!msgFamily){
		 msgFamily = getHeader(map, "PLCN_msgFamily");
	}
	if(msgFamily != "PSAR") {
		Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	}

	// var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	// var rs = exchange.getIn().getBody(java.util.List.class);
	logger.info("rs:  " + rs);
	for(i = 0; i < 1; i++) {
	 	logger.info("inside for loop");
		 var rowMap = rs[i];
		 //logger.info(rowMap);
		 //logger.info(rowMap.get("MSGDB_ID"));

		var parentMsgDbId = rowMap.get("MSGDB_ID"); 
		logger.info("parentMsgDbId is " + parentMsgDbId);
		setHeader(map, "PLCN_parentMsgDbId", parentMsgDbId)

		var parentMsgNo = rowMap.get("MESSAGENO");
		logger.info("parentMsgNo is " + parentMsgNo);
		var custom44 = getHeader(map, "PLCN_CUSTOM44");
		logger.info("CUSTOM44 is " + custom44);
	}

 	logger.info("duplicateCheckCorpMX: parentMsgDbId is " + parentMsgDbId);
	custom5Dupl = "PREV=" + parentMsgDbId ;
	setHeader(map, "PLCN_custom5Dupl", custom5Dupl);
	logger.info("duplicateCheckCorpMX:custom5Dupl= " + custom5Dupl);

	msgId = getHeader(map, "PLCN_msgDbId"); 
	logger.info("msgId IS " + msgId);

	custom44 = getHeader(map, "PLCN_CUSTOM44");

	if(msgId && parentMsgDbId) {
		if(parentMsgDbId < msgId) {
			setHeader(map, "PLCN_duplicateMessage", "true");
			logger.trace("duplicateCheckCorpMX: PLCN_duplicateMessage = " + getHeader(map, "PLCN_duplicateMessage"));
			orgMsgId = parentMsgDbId;
			custom5Dupl = "PREV=" + orgMsgId;
			logger.info("duplicateCheckCorpMX: custom5Dupl is " + custom5Dupl); 
			setHeader(map, "PLCN_custom5Dupl", custom5Dupl);

			var custom5Prev = "NEXT=" + msgId + "|ADOR";
			setHeader(map, "PLCN_custom5ActualDupl", custom5Prev);

			errorCode = "7737";
			setHeader(map, "errorCode", errorCode); 
			duplFlag = "Y";
			setHeader(map, "DUPL_FLAG" , duplFlag); 
			setCommentsForTransaction("00" , "7737", map); 
			}
		else{
				setHeader(map, "custom5Dupl" , "");
				setHeader(map, "DUPL_FLAG" , "");
		}
	}
		logger.info("duplicateCheckCorpMX completed");
}

function businessDuplicateMx(exchange) {
	var duplicateCheck;
	var tblValue;
	var matchNum;
	var mtchQueryVal;
	var value;
	var pattPos1;
	var pattPos2;
	var I;
	var J;
	var K;
	var P;
	var T;
	var count;
	var query1;
	var query2;
	var mode;
	var flag;
	var institutionId;
	var duplicateCheckValues;
	var msgModeIn;
	var priorityAmount;
	var messageClassType;
	var priorityDate;
	var messageDirection;
	var transrefno;
	var currency;
	var sender;
	var receiver;
	var commentsSetDb;
	var incrementRowCount;
	var msgFamily;
	var customDuplicateCheck;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
  	var body = inMsg.getBody(java.lang.String.class);
  	var hdrMap = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

  	var executeRoute = new ExecuteCamelRoute();

	priorityAmount= getHeader(map, "PLCN_priorityAmount");
	messageClassType = getHeader(map, "PLCN_msgType");
	logger.info("businessDuplicateMx: messageClassType = " + messageClassType);
	messageDirection = getHeader(map, "PLCN_direction");
	logger.info("businessDuplicateMx: messageDirection = " + messageDirection);
	if(!messageDirection) {
		messageDirection = getHeader(map, "PLCN_msgDirection");
		logger.info("businessDuplicateMx: messageDirection from second header= " + messageDirection);
	}
	priorityDate = getHeader(map, "PLCN_priorityDate");
	logger.info("priorityDate: " + priorityDate);
	transrefno = getHeader(map, "PLCN_transRefNo");
	logger.info("businessDuplicateMx: transrefno = " + transrefno);
	if(!transrefno) {
		transrefno = getHeader(map, "PLCNAPI_txnRefNo");
		logger.info("businessDuplicateMx: PLCNAPI_txnRefNo = " + transrefno);
	}
	if(!transrefno) {
		transrefno = getHeader(map, "PLCNAPI_transRefNo");
		logger.info("businessDuplicateMx: from PLCNAPI_transRefNo header = " + transrefno);
	}
	currency = getHeader(map, "PLCN_currency");
	sender = getHeader(map, "PLCN_sender");
	logger.info("businessDuplicateMx: sender = " + sender);
	receiver = getHeader(map, "PLCN_receiver");
	logger.info("businessDuplicateMx: receiver = " + receiver);
	mode = getHeader(map, "PLCN_msgModeIn"); //""
	logger.info("businessDuplicateMx: mode = " + mode);
	msgFamily = getHeader(map, "PLCN_msgFamily");
	logger.info("drveProductCode: msgFamily = " + msgFamily);

	len = sender.length;
	logger.info("businessDuplicateMx: len = " + len);

	if(len == 8) {
		var bic = sender.concat("XXX");
		logger.info("businessDuplicateMx: bic = " + bic);
	}

	institutionId = getHeader(map, "PLCN_institutionId");
	duplicateCheckValues = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.DUPLICATE_CHECK.DUP_CHK_TYP_BUSI_COND.BASED_ON");

	tblValue =  memTblGetTableValue(map, "INST_PARAM",duplicateCheckValues); //VALUE_DATE|CURRENCY|AMOUNT|SENDER|RECEIVER|TRANSACTION_REFERENCE
	logger.info("businessDuplicateMx: tblValue = " + tblValue);
	tblValue = tblValue + "|"; //VALUE_DATE|CURRENCY|AMOUNT|SENDER|RECEIVER|TRANSACTION_REFERENCE|
	I = 0 ;
	count = 1;

	if(msgFamily == "SEPA" || msgFamily == "SEPAINST") {
		if((messageClassType == 'pacs.004.001.09' && messageDirection == 'O') || messageClassType == 'camt.056.001.08') {
			customDuplicateCheck = true;

			if(messageClassType == 'pacs.004.001.09') {
				var orgnlMsgNmIdPath = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
				var orgnlTxIdPath = "/Document/PmtRtr/TxInf/OrgnlTxId";
			}

			if(messageClassType == 'camt.056.001.08') {
				var orgnlMsgNmIdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
				var orgnlTxIdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxId";
			}

			var orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
			logger.info("businessDuplicateMx: orgnlMsgNmId = " + orgnlMsgNmId);
			var orgnlTxId = getValueFromPath(Document, orgnlTxIdPath);
			logger.info("businessDuplicateMx: orgnlTxId = " + orgnlTxId);
 		}		
	}
	
	if(customDuplicateCheck) {
		mtchQueryVal = "ORIGINAL_MESSAGE_NAME_ID = '"+orgnlMsgNmId+"' AND ORIGINAL_TRANSACTION_ID = '"+orgnlTxId+"'";
	}else {
		while(I < count) {
			logger.info("In while loop");
			if(tblValue) {
				if(isPatternPresent(tblValue , "AMOUNT")) {
					tblValue = replacePattern(tblValue , "AMOUNT" , "PRIORITYAMOUNT = '".concat(priorityAmount).concat("'")); //VALUE_DATE|CURRENCY|PRIORITYAMOUNT = 2000|SENDER|RECEIVER|TRANSACTION_REFERENCE|
				}
				else{
					priorityAmount = "NULL";
					tblValue = replacePattern(tblValue, "AMOUNT","PRIORITYAMOUNT IS ".concat(priorityAmount));
				}
				if(isPatternPresent(tblValue , "MESSAGE_TYPE")) { //F
					tblValue = replacePattern(tblValue , "MESSAGE_TYPE" , "MESSAGECLASSTYPE = '".concat(messageClassType).concat("'"));
				}
				else{
					messageClassType = "NULL";
					tblValue = replacePattern(tblValue, "MESSAGE_TYPE","MESSAGECLASSTYPE IS ".concat(messageClassType));
				}
				if(isPatternPresent(tblValue , "MESSAGE_DIRECTION")) { //F
					tblValue = replacePattern(tblValue , "MESSAGE_DIRECTION" , "MESSAGEDIRECTION = '".concat(messageDirection).concat("'"));
				}
				else{
					messageDirection = "NULL";
					tblValue = replacePattern(tblValue, "MESSAGE_DIRECTION","MESSAGEDIRECTION IS ".concat(messageDirection));
				}
				if(isPatternPresent(tblValue , "VALUE_DATE")) {
					tblValue = replacePattern(tblValue , "VALUE_DATE","PRIORITYDATE = '".concat(priorityDate).concat("'")); //PRIORITYDATE|CURRENCY|PRIORITYAMOUNT|SENDER|RECEIVER|TRANSACTION_REFERENCE|
				}
				else{
					priorityDate = "NULL";
					tblValue = replacePattern(tblValue, "VALUE_DATE","PRIORITYDATE IS ".concat(priorityDate));
				}
				if(isPatternPresent(tblValue , "TRANSACTION_REFERENCE")) {
					tblValue = replacePattern(tblValue, "TRANSACTION_REFERENCE","TRANSREFNO = '".concat(transrefno).concat("'")); //PRIORITYDATE|CURRENCY|PRIORITYAMOUNT|SENDER|RECEIVER|TRANSREFNO|
				}
				else{
					transrefno = "NULL";
					tblValue = replacePattern(tblValue, "TRANSACTION_REFERENCE","TRANSREFNO IS ".concat(transrefno));
				}
				if(isPatternPresent(tblValue , "CURRENCY")) {
					tblValue = replacePattern(tblValue, "CURRENCY","CURRENCY = '".concat(currency).concat("'"));
				}
				else{
					currency = "NULL";
					tblValue = replacePattern(tblValue, "CURRENCY","CURRENCY IS ".concat(currency));
				}
				if(isPatternPresent(tblValue , "SENDER") && sender) {
					//tblValue = replacePattern(tblValue, "SENDER","SENDER = '".concat(sender).concat("'"));
					tblValue = replacePattern(tblValue, "SENDER","(SENDER = '".concat(sender).concat("'").concat(" OR ").concat("SENDER = '".concat(bic).concat("')")));
				}
				else{
					sender = "NULL";
					tblValue = replacePattern(tblValue, "SENDER","SENDER IS ".concat(sender));
				}
				if(isPatternPresent(tblValue , "RECEIVER") && receiver) {
					tblValue = replacePattern(tblValue, "RECEIVER","RECEIVER = '".concat(receiver).concat("'"));
				}
				else{
					receiver = "NULL";
					tblValue = replacePattern(tblValue, "RECEIVER","RECEIVER IS ".concat(receiver));
				}

				J = 0;
				K = 1;
				P = 1;
				T = 0;
				logger.info("businessDuplicateMx:TBL VALUE IS= " + tblValue);
					while(J < K) {
						logger.info("In while loop 2");
						tblValue = "|".concat(tblValue); //|PRIORITYDATE = '20160901'|CURRENCY = 'USD'|PRIORITYAMOUNT = '152,17'|SENDER = 'PGGMNL22XXX'|RECEIVER = 'BDCCBQBNXXX'|TRANSREFNO = '103TESTMSG8'|
						matchNum = dataBetweenTokens("|" , "|" , tblValue); //PRIORITYDATE
									
						if(matchNum){ 
							memTblSetTableValue(map, "MEM_TABLE_NAME_1", K , matchNum); //PRIORITYDATE

							K = K+1;
							while(matchNum) {
								if(T > 0) {
									query2 = query1.concat(matchNum.concat(" AND "));
									query1 = query2;
									mtchQueryVal = query2;
									query2 = "";
									T = T + 1;
									matchNum = "";
								}
								else{
									query1 = matchNum.concat(" AND "); //PRIORITYDATE = 202112839 AND 
									T = T + 1; //1
									matchNum = "";
								}
							}
							if(matchNum) {
								P = P + 1;
							}
							else{
								P= P + 1; //2
								P= P - 1; //1
							}
							pattPos1 = searchNthPattern(tblValue, "|" , 1); //1
							pattPos2 = searchNthPattern(tblValue, "|" , 2); //14
							value = tblValue.substr(pattPos1 - 1 , pattPos2); //|PRIORITYDATE|
							tblValue = removePattern(tblValue , value); //'CURRENCY|PRIORITYAMOUNT|SENDER|RECEIVER|TRANSREFNO|'
							logger.info("tblValue after removePattern: " + tblValue);
						}
					J = J + 1; //1
				}
			}
			I= I + 1; //1
		}
		mtchQueryVal = replaceNthPattern(mtchQueryVal, " AND " , "", -1);
	}

	setHeader(map, "MTCH_QUERY_VAL", mtchQueryVal);
	logger.info("MTCH_QUERY_VAL: " + mtchQueryVal);
	//hdrMap.put("MTCHQUERYVAL","MTCH_QUERY_VAL");

	executeRoute.callRouteWithHeader('direct://businessCheck', body, hdrMap);

  	var outHdrMap = executeRoute.getOutputHeader();
  	var outmsg = executeRoute.getOutputBody(java.util.List.class);
  	logger.trace("businessDuplicateMx: Output Body = " + outmsg );
  	logger.trace("businessDuplicateMx: Headers = " + outHdrMap);
  	inMsg.setBody(outmsg);
  	var rowCount = getHeader(outHdrMap, "CamelSqlRowCount");
  	logger.info("businessDuplicateMx: CamelSqlRowCount = " + rowCount);
	var prevQueueId = "";
	var creationCall = getHeader(map, "PLCN_creationCall");
	logger.info("businessDuplicateMx: creationCall = " + creationCall);
	logger.info("businessDuplicateMx: typeof creationCall = " + typeof creationCall);

	//TECHBULLS-20624
	//Duplicate payments we are not getting Payment Duplicate Violation while creating and Repairing payment
	
	/*if(creationCall == "true" && rowCount > 0) {
		logger.info("businessDuplicateMx: typeof CamelSqlRowCount = " + typeof rowCount);
		rowCount = rowCount + 1;
		logger.info("businessDuplicateMx: CamelSqlRowCount = " + rowCount);
		logger.info("businessDuplicateMx: typeof CamelSqlRowCount = " + typeof rowCount);
	}*/

  	if(rowCount >= 1 && outmsg){
  		logger.info("outmsg = " + outmsg);
  		if(mode == 'MANUAL'){
		  	for(i = 0; i < 1; i++) {
			 	logger.info("duplicateSelectQueryMX: inside for loop");
				var rowMap = outmsg[i];
				prevQueueId = rowMap.get("PREVQUEUEID");
				queueId = rowMap.get("QUEUEID");
				logger.info("businessDuplicateMx: PREVQUEUEID = " + prevQueueId);
				logger.info("businessDuplicateMx: queueId = " + queueId);
			}
  		}
  	}

	//TECHBULLS-20624
	//Duplicate payments we are not getting Payment Duplicate Violation while creating and Repairing payment
	if(creationCall == "true" && rowCount > 0 && queueId != 'MANUAL'&& queueId != 'MXREPRQ') {
		logger.info("businessDuplicateMx: typeof CamelSqlRowCount = " + typeof rowCount);
		rowCount = rowCount + 1;
		logger.info("businessDuplicateMx: CamelSqlRowCount = " + rowCount);
		logger.info("businessDuplicateMx: typeof CamelSqlRowCount = " + typeof rowCount);
	}

	/*var prevQueueId = getHeader(map, "PLCN_prevQueueId"); //MANVRFSP
	logger.info("businessDuplicateMx: prevQueueId = " + prevQueueId);
	logger.info("businessDuplicateMx: prevQueueIdtype = " + typeof prevQueueId);*/
 	
	/*if(prevQueueId.toString() == "MANVRFSP") {
		incrementRowCount = false;
	}else {
		incrementRowCount = true;
	}
	logger.info("businessDuplicateMx: incrementRowCount = " + incrementRowCount); */

	/*if(mode == 'MANUAL' && incrementRowCount == true){
  		//setHeader(map, "PLCN_createResponseDuplicate", true);
  		//logger.info("businessDuplicateMx: PLCN_createResponseDuplicate = " + getHeader(map, "PLCN_createResponseDuplicate"));
  		rowCount = rowCount + 1;
  		logger.info("businessDuplicateMx: CamelSqlRowCount = " + rowCount);
  	}*/

 	if(rowCount > 1){
		businessCheck(exchange);	 	
 	}

	logger.info("businessDuplicateMx: MTCH_QUERY_VAL = " + mtchQueryVal);

	/*if(mode == "REPAIR") {  
		msgModeIn = "MANUAL";
	}*/
	if(msgModeIn == "MANUAL") {
		commentsSetDb = "";
		duplicateSelectQuery1Mx(mtchQueryVal);
	}
	logger.info("businessDuplicateMx:func completed");
}

//mtchQueryVal = "PRIORITYDATE = '20211030' AND CURRENCY = EUR AND PRIORITYAMOUNT = 2000 AND SENDER = XYZ AND RECEIVER = ABC AND TRANSREFNO = XXXXX"

function duplicateSelectQueryMX(exchange) {
	logger.info("in duplicateSelectQueryMX");

	var j;
	var k;
	var parentMsgDbId;
	var parentMessageNo;
	var queueId;
	var mode;
	var custom5Dupl;
	var msgDbId;
	var custom5;
	var msgType;
	var custom5Id;
	var sender1;
	var receiver1;
	var currency1;
	var messageClassType1;
	var messageDirection1;
	var priorityAmount1;
	var priorityDate1;
	var priorityDate2;
	var error;
	var transrefno1;
	var errorCode;
	var custom5DuplPrev;
	var msgTypeprint;
	var custom5Dupl1;

	logger.info("In duplicateSelectQueryMX");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");

	var rs = exchange.getIn().getBody(java.util.List.class);
	logger.trace("rs = " + rs);
	custom5 = getHeader(map, "custom5");
	logger.info("duplicateSelectQueryMX:CUSTOM5 = " + custom5); //""
	msgDbId = getHeader(map, "PLCN_msgDbId");
	logger.info("duplicateSelectQueryMX:msgDbId = " + msgDbId);  //DUPLICATEMESSAGEID

	 for(i = 0; i < 1; i++) {
	 	logger.info("duplicateSelectQueryMX: inside for loop");
		 var rowMap = rs[i];
		 
		var parentMsgDbId = rowMap.get("MSGDB_ID"); 
		logger.info("duplicateSelectQueryMX:parentMsgDbId is " + parentMsgDbId);
		var parentMessageNo = rowMap.get("MESSAGENO");
		logger.info("parentMsgNo is " + parentMessageNo);

		if(parentMsgDbId.toString() != msgDbId.toString()){
			//custom5Dupl = "PREV=" + parentMsgDbId;
			custom5Dupl = "PREV=" + parentMsgDbId;
			setHeader(map, "PLCN_custom5Dupl", custom5Dupl);
			
			custom5Dupl = "NEXT=" + msgDbId + "|ADOR";
			setHeader(map, "PLCN_custom5ActualDupl", custom5Dupl);
			setHeader(map, "PLCN_parentMsgDbId", parentMsgDbId);
			logger.info("duplicateSelectQueryMX:custom5Dupl= " + custom5Dupl);
		}
	 }

	custom5Id = getHeader(map, "custom5Dupl");
	custom5DuplPrev = getHeader(map, "custom5Dupl"); 
	logger.info("duplicateSelectQueryMX:custom5DuplPrev= " + custom5DuplPrev);


	if(custom5Id) {
		custom5Id = dataBetweenTokens("=", "|BDOR?", custom5Id);
	}
	if(parentMsgDbId && parentMessageNo) {
		logger.info("duplicateSelectQueryMX: parentMsgDbId in loop " + parentMsgDbId);
		logger.info("duplicateSelectQueryMX: MsgDbId in loop " + msgDbId);
		logger.info("duplicateSelectQueryMX: MsgDbId type " + typeof msgDbId);
		logger.info("duplicateSelectQueryMX: parentMsgDbId type " + typeof parentMsgDbId);
		if(parentMsgDbId.toString() != msgDbId.toString()){
			logger.info("duplicateSelectQueryMX:In if loop");
			msgTypeprint = ((("<".concat("This Message is considered as duplicate payment against original payment in Pelican with Pelican ID as ")).concat(parentMessageNo)).concat(".")).concat(">");
			setHeader(map, "TRANSCOMM", msgTypeprint);
			logger.info("msgTypeprint: " + msgTypeprint);
			queueId = "MXDUPLQ";
		}
	}
	if(queueId == "MXDUPLQ") {
		logger.info("duplicateSelectQueryMX: queueId = DUPLQ");
		setHeader(map, "PLCN_duplicateMessage", "true");
		logger.trace("duplicateSelectQueryMX: PLCN_duplicateMessage = " + getHeader(map, "PLCN_duplicateMessage"));
		if(mode != "WS"){
			setHeader(map, "OUTPUT_CHANNEL","DB_TRANSACTION_MX_OUT");
		}
		errorCode = "7737";
		setHeader(map, "PLCN_COMMENTS",errorCode);
		duplFlag = "Y";
		setHeader(map, "DUPL_FLAG" , duplFlag);
		setCommentsForTransaction("00" , errorCode, map);
		custom5Dupl = "PREV=" + parentMsgDbId + "|" + "BDORxBF" + "";
		logger.info("custom5Dupl" + custom5Dupl);
		
		if(custom5DuplPrev) {
			logger.info("duplicateSelectQueryMX:In custom5DuplPrev");
			custom5Dupl1 = custom5DuplPrev.concat(custom5Dupl);
			logger.info("duplicateSelectQueryMX:custom5Dupl1= " + custom5Dupl1);
		}
		setHeader(map, "PLCN_Custom5" , custom5Dupl1);
		logger.info("custom5 value in DUPLCUSTOM5 = " + getHeader(map, "PLCN_Custom5"));
	}
	else{
		setHeader(map, "MATCH_REQ_FLAG" , "Y");
		if(custom5DuplPrev) {
			custom5Dupl = custom5DuplPrev.concat(custom5Dupl);
		}
		else{
			custom5Dupl = "";
		}
		setHeader(map, "custom5DuplPrev" , custom5Dupl);
		logger.info("custom5 value in custom5DuplPrev = " + getHeader(map, "custom5DuplPrev"));
		setHeader(map, "DUPLFLAG" , "");
	}
	exchange.getIn().getHeaders().putAll(map);
	logger.info("duplicateSelectQueryMX completed");
}

/**
* This function is used to validate date.
* @param {String} fld - date
* @returns {String} return 0 otherwise returns 5713 error code.
*/
function validate_date(fld) {
	logger.info("inside validate_date");
	var yy;
	var mm;
	var dd;
	var yyyy;
	var date;
	if(!(fld)){
		return "0";
	}
	date = replaceAllPattern(fld, "-", "");
	if(!(isAllDigits(date)) || (isPatternPresent(date, "."))) {
		return "5713";
	}
	if((date.length < 6) && (date.length > 8)){
		return "5713";
	}
	if(date.length == 8){
		yyyy =date.substr(0,4);
		mm = date.substr(4,2);
		dd = date.length(6,2);
		if(yyyy == "0000"){
			return "5713";
		}
	}
	else{
		yy = date.length(0,2);
		mm = date.length(2,2);
		dd = date.length(4,2);
		
		if((yy > 60) && (yy < 80)){
			return "5713";
		}
		
		if(yy<61){
			yyyy = 20 + yy;
		}
		else{
			yyyy = 19 + yy;
		}
	}
	if((mm > 1) || (mm > 12)){
		return "5713";
	}
	if(((dd < 1)|| (dd > 30)&& ((mm == 4)||( mm == 6)||( mm == 9)||( mm == 11)))
		||((dd > 31)&&(( mm == 1)||(mm ==3)||(mm == 5)||(mm == 7)||(mm == 8)||(mm == 10)||(mm == 12)))
		||
		(( dd > 29)&&(mm == 2)&&((Math.ceil(yyyy/4) - Math.ceil(yyyy/4)) == 0))
		||
		(( dd > 28)&&(mm == 2)&&((Math.ceil(yyyy/4) - Math.ceil(yyyy/4)) != 0))){
		return "5713";
	}
}

function originalMessage(exchange){
	var inMsg;
	var map;
	var Document;
	var orgnlBody;

	logger.info("In originalMessage");

    inMsg = exchange.getIn();
    map = inMsg.getHeaders();
  	body = inMsg.getBody(java.lang.String.class);
  	logger.trace("originalMessage: body = " + body);

  	var createResponseDuplicate = getHeader(map, "PLCN_createResponseDuplicate");
  	logger.trace("originalMessage: createResponseDuplicate = " + createResponseDuplicate);
  	logger.info("originalMessage: typeof createResponseDuplicate = " + typeof createResponseDuplicate);

  	if(!(isPatternPresent(body, "<Document>") && isPatternPresent(body, "</Document>"))){
  		logger.info("originalMessage: setting original message");
		orgnlBody = getHeader(map,"orgnlBody");
		logger.trace("originalMessage: orgnlBody = " + orgnlBody);
		inMsg.setBody(orgnlBody);
  	}

  	//setHeader(map, "orgnlBody", "");
}

function createResponse(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var i;
	var j = 0;
	var k;
	var fldNo = [];
	var fldViolation = [];
	var ofldViolation = [];
	var fldTag;
	var fldName;
	var plcnCodesValues;
	var ovCount = 0;
	var vCount = 0;
	var responseCdsString;
	var CdTpValue = [];
	var t2Status;

	logger.info("In createResponse");

	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	logger.trace("createResponse: typeof Document = " + typeof Document);

	var validMessage = getHeader(map, "PLCN_validMessage");
	var msgType = getHeader(map, "PLCN_msgType");
	var status = getHeader(map, "status");

	var plcnFlag = getHeader(map, "PLCN_call");
	logger.info("createResponse: plcnFlag = " + plcnFlag);
	logger.info("createResponse: typeof plcnFlag = " + typeof plcnFlag);

	var xsdValid = getHeader(map, "XSD_VALID");
	logger.info("createResponse: xsdValid = " + xsdValid);
	logger.info("createResponse: typeof xsdValid = " + typeof xsdValid);

	var t2Valid = getHeader(map, "PLCN_t2Valid");
	logger.info("createResponse: t2Valid = " + t2Valid);
	logger.info("createResponse: typeof t2Valid = " + typeof t2Valid);


	//if its an internal call response code is stored in ACEDB_responseCdsDoc (in T2 & CBPR server) otherwise PLCN_responseCdsDoc 
	if(plcnFlag.toString() == "true") {
		if(xsdValid.toString() == "false") {
			responseCdsString = getHeader(map, "ACEDB_responseCdsDoc");
		}else {
			responseCdsString = null;
		}
	}else {
		if(xsdValid.toString() == "false" || t2Valid.toString() == "false") {
			responseCdsString = getHeader(map, "PLCN_responseCdsDoc");
		}else {
			responseCdsString = null;
		}
	}

	logger.trace("createResponse: responseCdsString = " + responseCdsString);
	logger.info("createResponse: typeof responseCdsString = " + typeof responseCdsString);

	logger.trace("createResponse: validMessage = " + validMessage);
	logger.info("createResponse: typeof validMessage = " + typeof validMessage);
	logger.info("createResponse: status = " + status);
	logger.info("createResponse: msgType = " + msgType);

	if(!msgType) {
		var documentString = inMsg.getBody(java.lang.String.class);

		if(isPatternPresent(documentString, "<FIToFIPmtStsRpt>")) {
			msgType = "pacs.002.001.10";
		}else if(isPatternPresent(documentString, "<PmtRtr>")) {
			msgType = "pacs.004.001.09";
		}else if(isPatternPresent(documentString, "<FIToFICstmrCdtTrf>")){
			msgType = "pacs.008.001.08";
		}else if (isPatternPresent(documentString, "<FICdtTrf>")) {
			msgType = "pacs.009.001.08";
		}else if (isPatternPresent(documentString, "<NtfctnToRcv>")) {
	        msgType = "camt.057.001.06";
	    }

	    logger.info("createResponse: msgType = " + msgType);
	}

	var txnComments = getHeader(map, "PLCN_txnComments"); //"P00-1P32-1:A00:00-9505:A00:32-6012:A00:32-6013";
	var orgnlComments = getHeader(map, "PLCN_orgnlComments"); //"P00-1:A00:00-9505";
	var txnCommentsDB = txnComments;

	logger.info("createResponse: txnComments = " + txnComments);
	logger.info("createResponse: orgnlComments = " + orgnlComments);

	if(orgnlComments) {
		ovCount = (orgnlComments.match(/:A00:/g)).length;
	}
	var comments = txnComments + ":A00:";

	logger.info("createResponse: ovCount = " + ovCount);
	logger.info("createResponse: comments = " + comments);

	orgnlComments = orgnlComments + ":A00:";

	for(k = 0; k < ovCount; k++) {
		var otmp = dataBetweenTokens(":A00:", ":A00:", orgnlComments);
		logger.info("createResponse: otmp = " + otmp);
		ofldViolation[k] = otmp.substring(3, 7);
		comments = removePattern(comments, ":A00:" + otmp);
		orgnlComments = removePattern(orgnlComments, ":A00:" + tmp);
	}

	logger.info("createResponse: comments = " + comments);
	logger.info("createResponse: orgnlComments = " + orgnlComments);
	logger.info("createResponse: txnComments = " + txnComments);

	plcnCodesValues = comments.substring(0, comments.length - 5);
	logger.info("createResponse: plcnCodesValues = " + plcnCodesValues);

	logger.info("createResponse: txnComments = " + txnComments);
	logger.info("createResponse: txnComments length = " + txnComments.length);
	logger.info("createResponse: typeof txnComments = " + typeof txnComments);

	if(txnComments.length > 0) {
		vCount = (txnComments.match(/:A00:/g)).length;//(txnComments.match(/:A00:/g) || []).length;
		logger.info("createResponse: vCount = " + vCount);
	}

	for(i = 0; i < vCount; i++) {
		logger.info("createResponse: txnComments = " + txnComments);
		var tmp = dataBetweenTokens(":A00:", ":A00:", txnComments); //296-5770
		logger.info("createResponse: tmp = " + tmp);
		var tmp2 = ":A00:" + tmp + ":A00:" //:A00:296-5770:A00:
		logger.info("createResponse: tmp2 = " + tmp2);
		fldNo[i] = dataBetweenTokens(":A00:", "-", tmp2); //tmp.substring(0, 2);
		fldViolation[i] = dataBetweenTokens("-", ":A00:", tmp2); //tmp.substring(3, 7);
		txnComments = removePattern(txnComments, ":A00:" + tmp);
	}

	logger.info("createResponse: fldViolation = " + fldViolation);
	logger.info("createResponse: fldNo = " + fldNo);

	logger.trace("createResponse: responseCdsString = " + responseCdsString);
	logger.info("createResponse: typeof responseCdsString = " + typeof responseCdsString);

	logger.info("createResponse: txnCommentsDB = " + txnCommentsDB);
	logger.info("createResponse: typeof txnCommentsDB = " + typeof txnCommentsDB);

	if(responseCdsString != null) {
		//append
		logger.trace("createResponse: response code already generated duplicate");
		setHeader(map, "xsdStatus", "error");
		//setHeader(map, "status", "error"); //WIP

		if(plcnFlag == "true") {
			var responseDoc = createDocument(responseCdsString);
		}else {
			var responseDoc = responseCdsString;
		}

		logger.trace("createResponse: typeof responseDoc = " + typeof responseDoc);

		var responseCdsPlcnFmt = responseDoc.getElementsByTagName("ResponseCdsPlcnFmt");
		var nextNode = responseCdsPlcnFmt.item(0);

		//responseDoc = createResponseXml(responseDoc, nextNode, fldNo, fldViolation);

		while(j < vCount) {
			fldTag = memTblGetTableValue(map, msgType + "FldTag", fldNo[j]);
			fldTag = fldTag.trim();
			fldName = memTblGetTableValue(map, msgType + "FldName", fldTag);
			fldName = fldName.trim();

			logger.info("createResponse: fldTag = " + fldTag);
			logger.info("createResponse: fldName = " + fldName);

			var responseCds = responseDoc.getElementsByTagName("ResponseCds"); //root element
			//logger.info("createResponse: responseCds = " + convertDocumentToString(responseCds));
			logger.trace("createResponse: typeof responseCds = " + typeof responseCds);

			var AddtlResponseCds = createElementwithTextNode2(responseDoc, "AddtlResponseCds", "");
			//logger.info("createResponse: AddtlResponseCds = " + convertDocumentToString(AddtlResponseCds));
			//appendElementtoNode(responseCds, AddtlResponseCds);
			var newNode = responseCds.item(0);
			newNode.insertBefore(AddtlResponseCds, nextNode);

			var PlcnFldNum = createElementwithTextNode2(responseDoc, "PlcnFldNum", fldNo[j]);
			appendElementtoNode(AddtlResponseCds, PlcnFldNum);

			var FldTag = createElementwithTextNode2(responseDoc, "FldTag", fldTag);
			appendElementtoNode(AddtlResponseCds, FldTag);

			var FldName = createElementwithTextNode2(responseDoc, "FldName", fldName);
			appendElementtoNode(AddtlResponseCds, FldName);

			var violationSeries = fldViolation[j].substring(0, 1);
			logger.info("createResponse: violationSeries = " + violationSeries);

			if(violationSeries == "8" || violationSeries == "1") {
				CdTpValue = "Error";
			}else if(violationSeries == "7") {
				CdTpValue = "Warning";
			}else if(violationSeries == "6" || violationSeries == "9") {
				CdTpValue = "Info";
			}else {
				CdTpValue = "Info";
			}

			logger.info("createResponse: CdTpValue = " + CdTpValue);

			var CdTp = createElementwithTextNode2(responseDoc, "CdTp", CdTpValue);
			appendElementtoNode(AddtlResponseCds, CdTp);

			var Code = createElementwithTextNode2(responseDoc, "Cd", fldViolation[j]);
			appendElementtoNode(AddtlResponseCds, Code);

			var DescriptionValue = memTblGetTableValue(map, "LANGDESC", "PAYALY|" + fldViolation[j]);
			logger.info("createResponse: DescriptionValue from PAYALY = " + DescriptionValue);

			if(!DescriptionValue) {
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "ACEERR|" + fldViolation[j]);
				logger.info("createResponse: DescriptionValue from ACEERR = " + DescriptionValue);
			}

			if(!DescriptionValue) {
				DescriptionValue = "Unable to fetch description for given error/warning code. Please contact administrator.";
			}				

			var Description = createElementwithTextNode2(responseDoc, "Description", DescriptionValue);
			appendElementtoNode(AddtlResponseCds, Description);

			j++;
		}

		var responseCdsPath = "/ResponseCds/ResponseCdsPlcnFmt/PlcnCodes"
		var retVal = setValueInTxtNode(responseDoc, responseCdsPath, plcnCodesValues);
		logger.info("createResponse: retVal = " + retVal);

		/*var fldViolationArray = getHeader(map, "fldViolationArray");

		for(i == 0; i < fldViolationArray.length; i++) {
			if(fldViolationArray[i].substring(0, 1) == "7"  || fldViolationArray[i].substring(0, 1) == "8") {
				setHeader(map, "status", "error");

				t2Status = "error";
			}
		}*/

		/*if(t2Status = "error") {
			var t2FldNo[] = "00";
			var t2FldViolation[] = "8001";

			nextNode = responseCdsPlcnFmt.item(0);	
			responseDoc = createResponseXml(responseDoc, nextNode, t2FldNo, t2FldViolation);
		}*/

		setHeader(map, "PLCN_validMessage", "false");
	}else if(txnCommentsDB) {
		//create
		logger.trace("createResponse: creating response code");
		var responseDoc = getDocument();
		logger.trace("createResponse: responseDoc = " + responseDoc);

		var responseCds = createElement(responseDoc, "ResponseCds");
		appendElementtoNode(responseDoc, responseCds);

		logger.info("createResponse: j = " + j);
		logger.info("createResponse: vCount = " + vCount);
		
		while(j < vCount) {
			fldTag = memTblGetTableValue(map, msgType + "FldTag", fldNo[j]);
			fldTag = fldTag.trim();
			fldName = memTblGetTableValue(map, msgType + "FldName", fldTag);
			fldName = fldName.trim();

			logger.info("createResponse: fldTag = " + fldTag);
			logger.info("createResponse: fldName = " + fldName);

			var AddtlResponseCds = createElementwithTextNode(responseDoc, responseCds, "AddtlResponseCds", "");
			appendElementtoNode(responseCds, AddtlResponseCds);

			var PlcnFldNum = createElementwithTextNode(responseDoc, responseCds, "PlcnFldNum", fldNo[j]);
			appendElementtoNode(AddtlResponseCds, PlcnFldNum);

			var FldTag = createElementwithTextNode(responseDoc, responseCds, "FldTag", fldTag);
			appendElementtoNode(AddtlResponseCds, FldTag);

			var FldName = createElementwithTextNode(responseDoc, responseCds, "FldName", fldName);
			appendElementtoNode(AddtlResponseCds, FldName);

			var violationSeries = fldViolation[j].substring(0, 1);
			logger.info("createResponse: violationSeries = " + violationSeries);

			if(violationSeries == "8" || violationSeries == "1") {
				CdTpValue[j] = "Error";
			}else if(violationSeries == "7") {
				CdTpValue[j] = "Warning";
			}else if(violationSeries == "6" || violationSeries == "9") {
				CdTpValue[j] = "Info";
			}else {
				CdTpValue[j] = "Warning";
			}

			logger.info("createResponse: CdTpValue = " + CdTpValue);

			var CdTp = createElementwithTextNode2(responseDoc, "CdTp", CdTpValue[j]);
			appendElementtoNode(AddtlResponseCds, CdTp);
			
			var Code = createElementwithTextNode(responseDoc, responseCds, "Cd", fldViolation[j]);
			appendElementtoNode(AddtlResponseCds, Code);

			var langDescKey = "PAYALY|" + fldViolation[j];
			var DescriptionValue = memTblGetTableValue(map, "LANGDESC", langDescKey);
			logger.info("createResponse: langDescKey = " + langDescKey);
			logger.info("createResponse: DescriptionValue = " + DescriptionValue);

			if(!DescriptionValue) {
				langDescKey = "ACEERR|" + fldViolation[j];
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", langDescKey);
				logger.info("createResponse: langDescKey = " + langDescKey);
				logger.info("createResponse: DescriptionValue = " + DescriptionValue);
			}

			if(!DescriptionValue) {
				DescriptionValue = "Unable to fetch description for given error/warning code. Please contact administrator.";
				logger.info("createResponse: DescriptionValue = " + DescriptionValue);
			}				

			var Description = createElementwithTextNode2(responseDoc, "Description", DescriptionValue);
			appendElementtoNode(AddtlResponseCds, Description);
			
			j++;
			logger.info("createResponse: j count = " + j);
		}						

		var ResponseCdsPlcnFmt = createElementwithTextNode(responseDoc, responseCds, "ResponseCdsPlcnFmt", "");
		appendElementtoNode(responseCds, ResponseCdsPlcnFmt);

		var PlcnCodes = createElementwithTextNode(responseDoc, responseCds, "PlcnCodes", getHeader(map, "PLCN_txnComments"));
		appendElementtoNode(ResponseCdsPlcnFmt, PlcnCodes);

		logger.info("createResponse: CdTpValue length = " + CdTpValue.length);

		for(j = 0; j < CdTpValue.length; j++) {
			logger.info("createResponse: CdTpValue = " + CdTpValue[j]);

			if(CdTpValue[j] == "Error") {
				setHeader(map, "status", "error");
			}else{
				setHeader(map, "status", status);
			}
		}
	}

	logger.trace("createResponse: responseDoc = " + responseDoc);
	logger.trace("createResponse: status = " + getHeader(map, "status"));

	if(responseDoc){
		logger.info("createResponse: responseDoc = " + responseDoc);
		var responseCdsString = getPrettyPrint(responseDoc);
		logger.info("createResponse: responseCdsString = " + responseCdsString);
		var internalFlag = getHeader(map, "PLCN_call");
		logger.info("createResponse: internalFlag = " + internalFlag);

		if(!internalFlag){
			inMsg.setBody(responseCdsString);
		}else {
			setHeader(map, "ACEDB_responseCdsDoc", responseCdsString);
		}
	}
}

function validateXmlInput(exchange) {
	var inMsg = exchange.getIn();
	var body = inMsg.getBody(java.lang.String.class);
	var map = inMsg.getHeaders();
	
	logger.info("validateXmlInput: Checking if body is XML");
	
	if (!isValidXmlJava(body)) {
		setHeader(map, "PLCN_validXMLBody", "false");
		logger.info("validateXmlInput: Body is not valid XML");
	}else {
		logger.info("validateXmlInput: Body is valid XML");
		setHeader(map, "PLCN_validXMLBody", "true");
	}
}

function isValidXmlJava(str) {
	if (!str || typeof str !== 'string') {
		return false;
	}
	
	try {
		// Use Java's DocumentBuilderFactory to parse
		var DocumentBuilderFactory = Java.type("javax.xml.parsers.DocumentBuilderFactory");
		var StringReader = Java.type("java.io.StringReader");
		var InputSource = Java.type("org.xml.sax.InputSource");
		
		var factory = DocumentBuilderFactory.newInstance();
		var builder = factory.newDocumentBuilder();
		var inputSource = new InputSource(new StringReader(str));
		
		builder.parse(inputSource);
		
		return true;
	} catch (e) {
		logger.warn("isValidXmlJava: Not valid XML - " + e.message);
		return false;
	}
}