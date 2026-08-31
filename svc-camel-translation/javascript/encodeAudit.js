load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.product/svc-camel-translation/javascript/pelicanxmlutility.js');
load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.product/svc-camel-translation/javascript/utility.js');
load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.product/svc-camel-translation/javascript/mx2mx.js');
var Base64 = Java.type('java.util.Base64');

function encodeAudit(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var responseCode = inMsg.getBody(java.lang.String.class);

	var helper;
	var encodedMessage;
	var message;
	var inMsg;
	var header;
	var messagebody;
	logger.info("In encodeAudit function..");

	logger.trace("encodeAudit:Response code = " + responseCode);

	helper = new JSHelperClass();
	encodedMessage = Base64.getEncoder().encodeToString(helper.getBytes(responseCode));
	logger.info("encodeAudit: Encoded = " + encodedMessage);

	setHeader(map,"Audit",encodedMessage);

	var messageBody1;
 // inMsg = exchange.getIn();
    messagebody = getHeader(map,"ACEDB_originalBody");
    logger.trace("encodeAudit: Message Body = " +  messagebody);
    messageBody1 = Base64.getDecoder().decode(messagebody);
    //messageBody1 = atob(messagebody);
    inMsg.setBody(messageBody1);
    logger.trace("encodeAudit: Message Body = " +  messageBody1);
    //setHeader(map, "ACEDB_originalBody", "");

}

function setBody(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	logger.info("In setBody");
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	logger.info("setBody: Document " + Document);
	var documenttag = isXmlNodePresent2(Document, "Document");
 
	if(documenttag){
		var messageBody = inMsg.getBody(java.lang.String.class);
		logger.info("setBody: messageBody = " + messageBody);
	}else{
		logger.info("setBody: else loop ");
		messagebody = exchange.getIn().getHeader("MSG_BLOCK81");
		logger.info("setBody: Message Body = " +  messagebody);
		messageBody = Base64.getDecoder().decode(messagebody);
		inMsg.setBody(messageBody);
		logger.info("setBody: Message Body = " +  messageBody);
	}
		setHeader(map, "ACEDB_originalBody", messageBody);
}

	
function setStatus(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var status;
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	status = getHeader(map,"status");
	logger.info("setStatus: status = " + status);
	if(status == 'valid') {
		setHeader(map, "ACEDB_Status",true);
	}
	else {
		setHeader(map,"ACEDB_Status",false);
	}

	//Shifa new dev
   var srcPaymentType = getHeader(map, "SRC_PaymentType");
   logger.info("setStatus: srcPaymentType = " + srcPaymentType);

   var tgtPaymentType = getHeader(map, "TGT_PaymentType");
   logger.info("setStatus: tgtPaymentType = " + tgtPaymentType);

   if(srcPaymentType == "SepaCamt.056.001.08" && tgtPaymentType == "SepaPacs.004.001.09"){
   	setHeader(map, "EOD_ORG_MESSAGECLASSTYPE", "camt.056.001.08");
   	logger.info("setStatus: EOD_ORG_MESSAGECLASSTYPE = camt.056.001.08");
   }

   if(srcPaymentType == "SepainstCamt.056.001.08" && tgtPaymentType == "SepainstPacs.028.001.03"){
   	var sender = getValueFromPath(Document, "Document/FIToFIPmtStsReq/GrpHdr/InstgAgt/FinInstnId/BICFI");
   	var receiver = getValueFromPath(Document, "Document/FIToFIPmtStsReq/GrpHdr/InstdAgt/FinInstnId/BICFI");

   	setHeader(map, "SENDER", sender);
   	logger.info("setStatus: SENDER = " + sender);
   	setHeader(map, "RECEIVER", receiver);
   	logger.info("setStatus: RECEIVER = " + receiver);
   }  
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
	var setErrorStatus = false;

	logger.info("In createResponse");

	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	logger.trace("createResponse: typeof Document = " + typeof Document);

	var validMessage = getHeader(map, "PLCN_validMessage");
	var msgType = getHeader(map, "PLCN_msgType");
	var status = getHeader(map, "status");

	var plcnFlag = "false"; //getHeader(map, "PLCN_call");
	logger.info("createResponse: plcnFlag = " + plcnFlag);
	logger.info("createResponse: typeof plcnFlag = " + typeof plcnFlag);

	var xsdValid = getHeader(map, "XSD_VALID");
	logger.info("createResponse: xsdValid = " + xsdValid);
	logger.info("createResponse: typeof xsdValid = " + typeof xsdValid);

	var validResponse = getHeader(map, "PLCN_validResponse");
	logger.trace("createResponse: validResponse = " + validResponse);
	logger.trace("createResponse: typeof validResponse = " + typeof validResponse);

	responseCdsString = getHeader(map, "ACEDB_responseCdsDoc");
	logger.trace("createResponse: responseCdsString = " + responseCdsString);
	logger.trace("createResponse: typeof responseCdsString = " + typeof responseCdsString);

	if(responseCdsString == false) {
		responseCdsString = null;
	}

	logger.info("createResponse: validMessage = " + validMessage);
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
	    }else if (isPatternPresent(documentString, "<FIToFIPmtStsReq>")) {
	        msgType = "pacs.028.001.03";
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

	logger.info("createResponse: responseCdsString = " + responseCdsString);
	logger.info("createResponse: typeof responseCdsString = " + typeof responseCdsString);

	logger.info("createResponse: txnCommentsDB = " + txnCommentsDB);
	logger.info("createResponse: typeof txnCommentsDB = " + typeof txnCommentsDB);

	if(responseCdsString != null) {
		//append
		logger.info("createResponse: response code already generated");
		setHeader(map, "xsdStatus", "error");
		//setHeader(map, "status", "error");

		if(plcnFlag == "true") {
			var responseDoc = createDocument(responseCdsString);
		}else {
			var responseDoc = responseCdsString;
		}

		logger.info("createResponse: responseDoc = " + responseDoc);
		logger.info("createResponse: typeof responseDoc = " + typeof responseDoc);

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
			}else if(violationSeries == "9") {
				CdTpValue = "Repair";
			}else if(violationSeries == "6") {
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
		var plcnCodesValuesWF = getValueFromPath(responseDoc, responseCdsPath);
		logger.info("createResponse: plcnCodesValuesWF = " + plcnCodesValuesWF);

		if(plcnCodesValuesWF) {
			plcnCodesValues = plcnCodesValuesWF + plcnCodesValues;
		}

		var retVal = setValueInTxtNode(responseDoc, responseCdsPath, plcnCodesValues);

		/*logger.info("createResponse: CdTpValue = " + CdTpValue);
		logger.info("createResponse: CdTpValue.length = " + CdTpValue.length);
		
		for(j = 0; j < CdTpValue.length; j++) {
			logger.info("createResponse: array CdTpValue = " + CdTpValue[j]);
			CdTpValue = CdTpValue[j].trim();
			logger.info("createResponse: typeof CdTpValue = " + typeof CdTpValue[j]);

			if(CdTpValue[j].toString() == "Error") {
				setErrorStatus = true;
			}
		}*/

		setHeader(map, "PLCN_validMessage", "false");
	}else if(txnCommentsDB) {
		//create
		logger.info("createResponse: creating response code");
		var responseDoc = getDocument();
		logger.info("createResponse: responseDoc = " + responseDoc);

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
			}else if(violationSeries == "9") {
				CdTpValue[j] = "Repair";
			}else if(violationSeries == "6") {
				CdTpValue[j] = "Info";
			}else {
				CdTpValue[j] = "Info";
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
		}						

		var ResponseCdsPlcnFmt = createElementwithTextNode(responseDoc, responseCds, "ResponseCdsPlcnFmt", "");
		appendElementtoNode(responseCds, ResponseCdsPlcnFmt);

		var PlcnCodes = createElementwithTextNode(responseDoc, responseCds, "PlcnCodes", getHeader(map, "PLCN_txnComments"));
		appendElementtoNode(ResponseCdsPlcnFmt, PlcnCodes);

		/*logger.info("createResponse: CdTpValue = " + CdTpValue);
		logger.info("createResponse: CdTpValue.length = " + CdTpValue.length);
		
		for(j = 0; j < CdTpValue.length; j++) {
			logger.info("createResponse: array CdTpValue = " + CdTpValue[j]);
			logger.info("createResponse: typeof CdTpValue = " + typeof CdTpValue[j]);

			if(CdTpValue[j].toString() == "Error") {
				setErrorStatus = true;
			}
		}*/
	}

	// if(setErrorStatus == true) {
	// 	setHeader(map, "status", "error");
	// }else {
	// 	setHeader(map, "status", "valid");
	// }

	logger.info("createResponse: responseDoc = " + responseDoc);
	logger.info("createResponse: status from header = " + getHeader(map, "status"));

	if(responseDoc){
		logger.info("createResponse: responseDoc = " + responseDoc);
		logger.info("createResponse: typeof responseDoc = " + typeof responseDoc);
		var responseCdsString = convertDocumentToString(responseDoc);
		//var responseCdsString = getPrettyPrint(responseDoc);
		logger.trace("createResponse: responseCdsString = " + responseCdsString);
		var internalFlag = getHeader(map, "PLCN_call");
		logger.info("createResponse: internalFlag = " + internalFlag);
		setHeader(map, "ACEDB_responseCdsDoc", responseCdsString);
		setHeader(map, "PLCN_responseCdsGenerated", true);
		inMsg.setBody(responseCdsString);
	}
}

//This function sets violation in case of expetion
function setExceptionViolation(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setExceptionViolation");

	var authenticationException = getHeader(map,"PLCN_authenticationException");
	logger.info("setExceptionViolation: authenticationException = " + authenticationException);

	if(authenticationException != "") {
		authenticationException = authenticationException.toString();

		if(authenticationException == "true") {
			setCommentsForTransaction("00", "10650", map);
		}
	}

	var polyglotException = getHeader(map,"PLCN_polyglotException");
	logger.info("setExceptionViolation: polyglotException = " + polyglotException);

	if(polyglotException != "") {
		polyglotException = polyglotException.toString();

		if(polyglotException == "true") {
			setCommentsForTransaction("00", "11708", map);
		}
	}

	var genericException = getHeader(map,"PLCN_genericException");
	logger.info("setExceptionViolation: genericException = " + genericException);

	if(genericException != "") {
		genericException = genericException.toString();

		if(genericException == "true") {
			setCommentsForTransaction("00", "11708", map);
		}
	}

	var httpException = getHeader(map,"PLCN_httpException");
	logger.info("setExceptionViolation: httpException = " + httpException);

	if(httpException != "") {
		httpException = httpException.toString();

		if(httpException == "true") {
			setCommentsForTransaction("00", "11708", map);
		}
	}		

	setHeader(map,"PLCN_processingStage", "ERR");
}

function setWfHeaderPacs028(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var body = inMsg.getBody(java.lang.String.class);

	logger.info("In setWfHeaderPacs028");

	logger.info("setWfHeaderPacs028: Document = " + Document);

	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("setWfHeaderPacs028: msgType = " + msgType);

	if(msgType == 'pacs.028.001.03'){
		setHeader(map, "DISPLAY_FLAG_MESSAGE", "Y");
		setHeader(map, "DISPLAY_FLAG_BATCH", "N"); //if msgFamily sepa Y else N
		setHeader(map, "FILE_REQUIRED", "N");
		setHeader(map, "BATCH_REQUIRED", "N");
	}


	logger.info("setWfHeaderPacs028: DISPLAY_FLAG_MESSAGE = " + getHeader(map, "DISPLAY_FLAG_MESSAGE"));
	logger.info("setWfHeaderPacs028: DISPLAY_FLAG_BATCH = " + getHeader(map, "DISPLAY_FLAG_BATCH"));
	logger.info("setWfHeaderPacs028: FILE_REQUIRED = " + getHeader(map, "FILE_REQUIRED"));
	logger.info("setWfHeaderPacs028: BATCH_REQUIRED = " + getHeader(map, "BATCH_REQUIRED"));

	/*	var datepath = getValueDatePath(exchange);
	logger.info("setWfHeaderPacs028: datepath = " + datepath);
	logger.info("setWfHeaderPacs028: typeof datepath = " + typeof datepath);

	var dateValue = getValueFromPath(Document, datepath);
	logger.info("setWfHeaderPacs028: dateValue = " + dateValue);

	if(!dateValue && isPatternPresent(body, "<FIToFIPmtStsReq>")) {
		datepath = "/Document/FIToFIPmtStsReq/TxInf/AccptncDtTm";
		dateValue = getValueFromPath(Document, datepath);
		logger.info("setWfHeaderPacs028: dateValue = " + dateValue);
	}


	if(dateValue) {
		dateValue = replaceAllPattern(dateValue, "-", "");
		logger.info("setWfHeaderPacs028: dateValue = " + dateValue);
	}
	setHeader(map, "CALC_DATE", dateValue);*/
}