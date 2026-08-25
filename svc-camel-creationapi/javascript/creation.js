load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.product/svc-camel-creationapi/javascript/utility.js');
load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.product/svc-camel-creationapi/javascript/pelicanxmlutility.js');
load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.product/svc-camel-creationapi/javascript/messageRepair.js');

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
var Base64 = Java.type('java.util.Base64');
var ExecuteCamelRoute = Java.type('ai.pelican.camel.js.processor.ExecuteCamelRoute');
var XMLParser = Java.type("ai.pelican.camel.convertor.XMLParser");

function setBody(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var creDtTmPath;
	var creDtTmValue;
	var messageBody;	

	logger.info("In setBody");

	var msgType = getHeader(map, "PaymentType");
	msgType = msgType.toLowerCase();
	logger.info("setBody: PaymentType = " + msgType);

	if(isPatternPresent(msgType, "target2")) {
		msgFamily = "target2";
	}else if(isPatternPresent(msgType, "cbpr")) {
		msgFamily = "cbpr";
	}else{
		msgFamily = "sepa"
	}

	var msgType = removePattern(msgType, msgFamily);
	logger.info("setBody: msgType = " + msgType);

	if(msgFamily == "cbpr"){
		if(msgType == "camt.057.001.06") {
			creDtTmPath = "Document/NtfctnToRcv/GrpHdr/CreDtTm";
		}

		if(msgType == "pacs.004.001.09") {
			creDtTmPath = "Document/PmtRtr/GrpHdr/CreDtTm";
		}

		if(msgType == "pacs.008.001.08") {
			creDtTmPath = "Document/FIToFICstmrCdtTrf/GrpHdr/CreDtTm";
		}

		if(msgType == "pacs.009.001.08") {
			creDtTmPath = "Document/FICdtTrf/GrpHdr/CreDtTm";
		}			

		logger.info("setBody: creDtTmPath = " + creDtTmPath);

		if(creDtTmPath) {
			creDtTmValue = getValueFromPath(Document, creDtTmPath);
			logger.info("setBody: creDtTmValue = " + creDtTmValue);

			if(creDtTmValue){
				var creDtTmValueLength = creDtTmValue.length;
				logger.info("setBody: creDtTmValueLength = " + creDtTmValueLength);

				if(creDtTmValueLength == 29){
					var tmp = creDtTmValue.substring(19, 23);
					creDtTmValue = replacePattern(creDtTmValue, tmp, "");
					logger.info("setBody: creDtTmValue = " + creDtTmValue);

					setValueInPath(Document, creDtTmPath, creDtTmValue);
					messageBody = convertDocumentToString(Document);
					inMsg.setBody(messageBody);
				}else {
				messageBody = inMsg.getBody(java.lang.String.class);
				}
			}
		}
	}else {
		messageBody = inMsg.getBody(java.lang.String.class);
	}	
	
	logger.trace("setBody: messageBody = " + messageBody);
	setHeader(map, "ACEDB_originalBody", messageBody);
	setHeader(map, "PLCN_validResponse", "true");
}

function setValidationResponse(exchange) {
	var messageBody;
	var status;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setValidationResponse");

	messageBody = getHeader(map, "ACEDB_originalBody");
	logger.trace("setBody: messageBody = " + messageBody);
	status = getHeader(map, "status"); //T2 business validation status
	logger.info("setValidationResponse: status = " + status);
	setHeader(map, "PLCN_setValidationStatus", status);
	setHeader(map, "PLCN_validationStatus", status);

	var txnComments = getHeader(map, "PLCN_txnComments");
	setHeader(map, "PLCN_validationViolations", txnComments);
	logger.info("setValidationResponse: txnComments = " + txnComments);

	var responseBody = inMsg.getBody(java.lang.String.class);
	logger.trace("setValidationResponse: responseBody = " + responseBody);

	if(isPatternPresent(responseBody, "<ResponseCds>")) {
		var responseCds = exchange.getIn().getBody(org.w3c.dom.Document.class);
		logger.info("setValidationResponse: responseCds = " + responseCds);
		//setHeader(map, "PLCN_validResponse", "false");
		setHeader(map, "ACEDB_responseCdsDoc", responseCds);
		//logger.info("setValidationResponse: PLCN_validResponse = " + getHeader(map, "PLCN_validResponse"));

		inMsg.setBody(messageBody);
		logger.trace("setBody: messageBody = " + messageBody);
	}else {
		setHeader(map, "ACEDB_responseCdsDoc", false);
	}

	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("setValidationResponse: msgType = " + msgType);

	/*if(isPatternPresent(msgType, "pacs")) {
		if(status == 'error' && !isPatternPresent(messageBody, "<SttlmMtd>")) {
			setHeader(map, "PLCN_validateMessage", true);
			setSttlmMtd(exchange)
		}
	}*/
}

function setDuplicateCheckResponse(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setDuplicateCheckResponse");

	var txnComments = getHeader(map, "PLCN_txnComments");
	logger.info("setDuplicateCheckResponse: txnComments = " + txnComments);

	var messageBody = getHeader(map, "ACEDB_originalBody");
	logger.trace("message Body = " + messageBody);

	var status = getHeader(map, "status");
	logger.info("setDuplicateCheckResponse: status = " + status);

	setHeader(map, "PLCN_duplicateCheckStatus", status);

	var txnComments = getHeader(map, "PLCN_txnComments");
	logger.info("setDuplicateCheckResponse: txnComments = " + txnComments);

	if(status == "duplicate") {
		var responseCds = exchange.getIn().getBody(org.w3c.dom.Document.class);
		logger.trace("setDuplicateCheckResponse: responseCds = " + responseCds);
		var responseBody = inMsg.getBody(java.lang.String.class);
		logger.trace("setDuplicateCheckResponse: responseBody = " + responseBody);
		var txnComments = getHeader(map, 'PLCN_txnComments');
		logger.info("setDuplicateCheckResponse: txnComments = " + txnComments);
		setHeader(map, "PLCN_validResponse", "false");
		logger.info("setDuplicateCheckResponse: PLCN_validResponse = " + getHeader(map, "PLCN_validResponse"));
	}

	//setInternalFlag(exchange);
}

function setSchedulingCheckResponse(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setSchedulingCheckResponse");

	var messageBody = getHeader(map, "ACEDB_originalBody");
	logger.trace("message Body = " + messageBody);

	var status = getHeader(map, "status");
	logger.info("setSchedulingCheckResponse: status = " + status);

	var txnComments = getHeader(map, "PLCN_txnComments");
	logger.info("setSchedulingCheckResponse: txnComments = " + txnComments);

    var mode = 	getHeader(map, "PLCN_mode");
   	logger.info("setSchedulingCheckResponse: mode = " + mode);

   	var autoRepairFlag = memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_"+mode);
   	logger.info("setSchedulingCheckResponse: autoRepairFlag = " + autoRepairFlag);

   	if(autoRepairFlag != "YES") {
		if(isPatternPresent(txnComments, "9506")) {
			setCommentsForTransaction("00", "8958", map);
		}
   	}

	setHeader(map, "PLCN_schedulingCheckStatus", status);

	if(status == "scheduling required") {
		var responseCds = exchange.getIn().getBody(org.w3c.dom.Document.class);
		logger.trace("setSchedulingCheckResponse: responseCds = " + responseCds);
		var responseBody = inMsg.getBody(java.lang.String.class);
		logger.trace("setSchedulingCheckResponse: responseBody = " + responseBody);
		var txnComments = getHeader(map, 'PLCN_txnComments');
		logger.info("setSchedulingCheckResponse: txnComments = " + txnComments);
		setHeader(map, "PLCN_validResponse", "false");
		logger.info("setSchedulingCheckResponse: PLCN_validResponse = " + getHeader(map, "PLCN_validResponse"));
	}
}

function enrichSttlmMtd(exchange) {
	var messageBody;
	var status;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	messageBody = getHeader(map, "ACEDB_originalBody");
	logger.trace("message Body = " + messageBody);

	status = getHeader(map, "status"); //T2 business validation status
	logger.info("enrichSttlmMtd: status = " + status);
	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("enrichSttlmMtd: msgType = " + msgType);

	var msgFamily = getHeader(map, "PLCN_msgFamily");
	logger.info("enrichSttlmMtd: msgFamily = " + msgFamily);

	if(msgFamily == "cbpr" && status == 'error' && !isPatternPresent(messageBody, "<SttlmMtd>")) {

		if(isPatternPresent(msgType, "pacs")) {
			setHeader(map, "PLCN_validateMessage", true);
			deriveSttlmMtd(exchange);
		}
	}
}

function deriveSttlmMtd(exchange) {
	var instgRmbrsmntAgt;
	var instdRmbrsmntAgt;
	var instgRmbrsmntAgtAcct1;
	var instdRmbrsmntAgtAcct1;
	var sttlmAcct;
	var sttlmAcctIBAN;
	var sttlmAcctOtherId;
	var sttlmAcctValue;
	var sttlmAcctIBANValue;
	var sttlmAcctOtherIdValue;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("deriveSttlmMtd: msgType = " + msgType);

	instgRmbrsmntAgt = isXmlNodePresent2(Document, "InstgRmbrsmntAgt");
	logger.info("deriveSttlmMtd: instgRmbrsmntAgt = " + instgRmbrsmntAgt);
	logger.info("deriveSttlmMtd: typeof instgRmbrsmntAgt = " + typeof instgRmbrsmntAgt);

	instdRmbrsmntAgt = isXmlNodePresent2(Document, "InstdRmbrsmntAgt");
	logger.info("deriveSttlmMtd: instdRmbrsmntAgt = " + instdRmbrsmntAgt);
	logger.info("deriveSttlmMtd: typeof instdRmbrsmntAgt = " + typeof instdRmbrsmntAgt);

	instgRmbrsmntAgtAcct1 = isXmlNodePresent2(Document, "InstgRmbrsmntAgtAcct");
	logger.info("deriveSttlmMtd: instgRmbrsmntAgtAcct1 = " + instgRmbrsmntAgtAcct1);
	logger.info("deriveSttlmMtd: typeof instgRmbrsmntAgtAcct1 = " + typeof instgRmbrsmntAgtAcct1);

	instdRmbrsmntAgtAcct1 = isXmlNodePresent2(Document, "InstdRmbrsmntAgtAcct");
	logger.info("deriveSttlmMtd: instdRmbrsmntAgtAcct1 = " + instdRmbrsmntAgtAcct1);
	logger.info("deriveSttlmMtd: typeof instdRmbrsmntAgtAcct1 = " + typeof instdRmbrsmntAgtAcct1);

	var thrdRmbrsmntAgt = isXmlNodePresent2(Document, "ThrdRmbrsmntAgt");
	logger.info("deriveSttlmMtd: thrdRmbrsmntAgt = " + thrdRmbrsmntAgt);
	logger.info("deriveSttlmMtd: typeof thrdRmbrsmntAgt = " + typeof thrdRmbrsmntAgt);

	var thrdRmbrsmntAgtAcct1 = isXmlNodePresent2(Document, "ThrdRmbrsmntAgtAcct");
	logger.info("deriveSttlmMtd: thrdRmbrsmntAgtAcct1 = " + thrdRmbrsmntAgtAcct1);
	logger.info("deriveSttlmMtd: typeof thrdRmbrsmntAgtAcct1 = " + typeof thrdRmbrsmntAgtAcct1);

	var sttlmAcct = isXmlNodePresent2(Document, "SttlmAcct");
	logger.info("deriveSttlmMtd: sttlmAcct = " + sttlmAcct);
	logger.info("deriveSttlmMtd: typeof sttlmAcct = " + typeof sttlmAcct);

	/*if(msgType == "pacs.008.001.08") {
		sttlmAcct = "/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/SttlmAcct";
		sttlmAcctIBAN = "/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/SttlmAcct/Id/IBAN";
		sttlmAcctOtherId = "/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/SttlmAcct/Id/Othr/Id";

		sttlmAcctValue = getValueFromPath(Document, sttlmAcct);
		logger.info("deriveSttlmMtd: sttlmAcctValue = " + sttlmAcctValue);

		sttlmAcctIBANValue = getValueFromPath(Document, sttlmAcctIBAN);
		logger.info("deriveSttlmMtd: sttlmAcctIBANValue = " + sttlmAcctIBANValue);

		sttlmAcctOtherIdValue = getValueFromPath(Document, sttlmAcctOtherId);
		logger.info("deriveSttlmMtd: sttlmAcctOtherIdValue = " + sttlmAcctOtherIdValue);
	}*/

	if(instgRmbrsmntAgt == true && instgRmbrsmntAgtAcct1 == true || instdRmbrsmntAgt == true && instdRmbrsmntAgtAcct1 == true || thrdRmbrsmntAgt == true && thrdRmbrsmntAgtAcct1 == true){
		logger.info("deriveSttlmMtd: RmbrsmntAgt is present");
		//if(!sttlmAcctIBANValue && !sttlmAcctOtherIdValue){
			setHeader(map, "PLCN_sttlmMtd", "COVE");
		//}
	}else if((instgRmbrsmntAgt == false && instgRmbrsmntAgtAcct1 == false) || (instdRmbrsmntAgt == false && instdRmbrsmntAgtAcct1 == false) || (thrdRmbrsmntAgt == false && thrdRmbrsmntAgtAcct1 == false)){
		if(sttlmAcct) {
			setHeader(map, "PLCN_sttlmMtd", "INDA");//INDA
		}
	}

	if(!getHeader(map, "PLCN_sttlmMtd")){
		logger.info("deriveSttlmMtd: PLCN_sttlmMtd is null");
		setHeader(map, "PLCN_sttlmMtd", "INDA");
	}

	logger.info("deriveSttlmMtd: sttlmMtdValue = " + getHeader(map, "PLCN_sttlmMtd"));
	setSttlmMtd(exchange);
}

function setSttlmMtd(exchange) {
	var instgRmbrsmntAgtAcct;
	var instdRmbrsmntAgtAcct;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.trace("setSttlmMtd: messageBody = " + messageBody);

	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("setSttlmMtd: msgType = " + msgType);

	var sttlmMtdValue = getHeader(map, "PLCN_sttlmMtd");
	logger.info("setSttlmMtd: sttlmMtdValue = " + sttlmMtdValue);

	if(sttlmMtdValue) {
		var sttlmInfPresenet = isXmlNodePresent2(Document, "SttlmInf");
		logger.info("setSttlmMtd: sttlmInfPresenet = " + sttlmInfPresenet);
		logger.info("setSttlmMtd: typeof Document = " + typeof Document);

		if(sttlmInfPresenet) {
			//var Document = createDocument(messageBody);
			var sttlmInf = Document.getElementsByTagName("SttlmInf"); //root element
			logger.info("setSttlmMtd: typeof sttlmInf = " + typeof sttlmInf);

			var sttlmMtd = createElementwithTextNode2(Document, "SttlmMtd", sttlmMtdValue);
			logger.info("setSttlmMtd: typeof sttlmMtd = " + typeof sttlmMtd);

			if(sttlmMtdValue == "CLRG") {
				var clrSys = Document.createElement("ClrSys");
				logger.info("setSttlmMtd: typeof clrSys = " + typeof clrSys);

				var cd = createElementwithTextNode2(Document, "Cd", "TGT");
				logger.info("setSttlmMtd: typeof cd = " + typeof cd);

				appendElementtoNode(clrSys, cd);
				appendElementtoNode(sttlmInf, clrSys);
			}

			var sttlmAcctPresent = isXmlNodePresent2(Document, "SttlmAcct");
			logger.info("setSttlmMtd: sttlmAcctPresent = " + sttlmAcctPresent);

			var instgRmbrsmntAgtPresent = isXmlNodePresent2(Document, "InstgRmbrsmntAgt");
			logger.info("setSttlmMtd: instgRmbrsmntAgtPresent = " + instgRmbrsmntAgtPresent);

			var instgRmbrsmntAgtAcctPresent = isXmlNodePresent2(Document, "InstgRmbrsmntAgtAcct");
			logger.info("setSttlmMtd: instgRmbrsmntAgtAcctPresent = " + instgRmbrsmntAgtAcctPresent);

			var instdRmbrsmntAgtPresent = isXmlNodePresent2(Document, "InstdRmbrsmntAgt");
			logger.info("setSttlmMtd: instdRmbrsmntAgtPresent = " + instdRmbrsmntAgtPresent);

			var instdRmbrsmntAgtAcctPresent = isXmlNodePresent2(Document, "InstdRmbrsmntAgtAcct");
			logger.info("setSttlmMtd: instdRmbrsmntAgtAcctPresent = " + instdRmbrsmntAgtAcctPresent);

			var thrdRmbrsmntAgtPresent = isXmlNodePresent2(Document, "ThrdRmbrsmntAgt");
			logger.info("setSttlmMtd: thrdRmbrsmntAgtPresent = " + thrdRmbrsmntAgtPresent);

			var thrdRmbrsmntAgtAcctPresent = isXmlNodePresent2(Document, "ThrdRmbrsmntAgtAcct");
			logger.info("setSttlmMtd: thrdRmbrsmntAgtAcctPresent = " + thrdRmbrsmntAgtAcctPresent);

			/*var sttlmInf1 = Document.getElementsByTagName("SttlmInf").item(0);
			logger.info("setSttlmMtd: sttlmInf1 = " + sttlmInf1);
			logger.info("setSttlmMtd: typeof sttlmInf1 = " + typeof sttlmInf1);
			var sttlmInfFirstChild = sttlmInf1.getFirstChild();
			logger.info("setSttlmMtd: sttlmInfFirstChild = " + sttlmInfFirstChild);
			logger.info("setSttlmMtd: typeof sttlmInfFirstChild = " + typeof sttlmInfFirstChild);
			logger.info("setSttlmMtd: sttlmInfFirstChild = " + convertDocumentToString(sttlmInfFirstChild));

			if(sttlmInfFirstChild) {
				logger.info("setSttlmMtd: sttlmInfFirstChild present");
				var sttlmInfFirstChildName = sttlmInfFirstChild.getNodeName();
				logger.info("setSttlmMtd: sttlmInfFirstChildName = " + sttlmInfFirstChildName.toString());
				logger.info("setSttlmMtd: typeof sttlmInfFirstChildName = " + typeof sttlmInfFirstChildName);
				var sttlmInfFirstChildNode = Document.getElementsByTagName(sttlmInfFirstChildName);
				//var sttlmInfFirstChildNode = Document.getElementsByTagName(sttlmInfFirstChild);
				var nextNode = sttlmInfFirstChildNode.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);
			}else {
				appendElementtoNode(sttlmInf, sttlmMtd);
			}*/

			if(sttlmAcctPresent) {
				var sttlmAcct = Document.getElementsByTagName("SttlmAcct");
				logger.info("setSttlmMtd: typeof sttlmAcct = " + typeof sttlmAcct);
				var nextNode = sttlmAcct.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);
			}else if(instgRmbrsmntAgtPresent) {
				var instgRmbrsmntAgt = Document.getElementsByTagName("InstgRmbrsmntAgt");
				logger.info("setSttlmMtd: typeof instgRmbrsmntAgt = " + typeof instgRmbrsmntAgt);
				var nextNode = instgRmbrsmntAgt.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);			
			}else if(instgRmbrsmntAgtAcctPresent) {
				var instgRmbrsmntAgtAcct = Document.getElementsByTagName("InstgRmbrsmntAgtAcct");
				logger.info("setSttlmMtd: typeof instgRmbrsmntAgtAcct = " + typeof instgRmbrsmntAgtAcct);
				var nextNode = instgRmbrsmntAgtAcct.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);			
			}else if(instdRmbrsmntAgtPresent) {
				var instdRmbrsmntAgt = Document.getElementsByTagName("InstdRmbrsmntAgt");
				logger.info("setSttlmMtd: typeof instdRmbrsmntAgt = " + typeof instdRmbrsmntAgt);
				var nextNode = instdRmbrsmntAgt.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);			
			}else if(instdRmbrsmntAgtAcctPresent) {
				var instdRmbrsmntAgtAcct = Document.getElementsByTagName("InstdRmbrsmntAgtAcct");
				logger.info("setSttlmMtd: typeof instdRmbrsmntAgtAcct = " + typeof instdRmbrsmntAgtAcct);
				var nextNode = instdRmbrsmntAgtAcct.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);			
			}else if(thrdRmbrsmntAgtPresent) {
				var thrdRmbrsmntAgt = Document.getElementsByTagName("ThrdRmbrsmntAgt");
				logger.info("setSttlmMtd: typeof thrdRmbrsmntAgt = " + typeof thrdRmbrsmntAgt);
				var nextNode = thrdRmbrsmntAgt.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);			
			}else if(thrdRmbrsmntAgtAcctPresent) {
				var thrdRmbrsmntAgtAcct = Document.getElementsByTagName("ThrdRmbrsmntAgtAcct");
				logger.info("setSttlmMtd: typeof thrdRmbrsmntAgtAcct = " + typeof thrdRmbrsmntAgtAcct);
				var nextNode = instgRmbrsmntAgt.item(0);
				logger.info("setSttlmMtd: typeof nextNode = " + typeof nextNode);
				var newNode = sttlmInf.item(0);
				logger.info("setSttlmMtd: typeof newNode = " + typeof newNode);
				newNode.insertBefore(sttlmMtd, nextNode);			
			}else {
				appendElementtoNode(sttlmInf, sttlmMtd);
			}
		}else {
			var nbOfTxs = Document.getElementsByTagName("NbOfTxs");
			var nextNode = nbOfTxs.item(0);

			var grpHdr = Document.getElementsByTagName("GrpHdr").item(0); //root element
			//logger.info("createResponseValidation: responseCds = " + convertDocumentToString(responseCds));
			logger.trace("setSttlmMtd: typeof grpHdr = " + typeof grpHdr);

			var sttlmInf = Document.createElement("SttlmInf"); //createElementwithTextNode2(Document, "SttlmInf", "");
			logger.info("setSttlmMtd: typeof sttlmInf = " + typeof sttlmInf);
			//var newNode = grpHdr.item(0);
			//newNode.insertBefore(sttlmInf, nextNode);
			appendElementtoNode(grpHdr, sttlmInf);
			//Document.getElementsByTagName("GrpHdr")[0].appendChild(sttlmInf);

			var sttlmMtd = createElementwithTextNode2(Document, "SttlmMtd", sttlmMtdValue);
			logger.info("setSttlmMtd: typeof sttlmMtd = " + typeof sttlmMtd);

			appendElementtoNode(sttlmInf, sttlmMtd);

			if(sttlmMtdValue == "CLRG") {
				var clrSys = Document.createElement("ClrSys");
				logger.info("setSttlmMtd: typeof clrSys = " + typeof clrSys);

				var cd = createElementwithTextNode2(Document, "Cd", "TGT");
				logger.info("setSttlmMtd: typeof cd = " + typeof cd);

				appendElementtoNode(clrSys, cd);
				appendElementtoNode(sttlmInf, clrSys);
			}
		}

		var DocumentString = convertDocumentToString(Document);
		logger.trace("setSttlmMtd: DocumentString = " + DocumentString);
		inMsg.setBody(DocumentString);
		setHeader(map, "ACEDB_originalBody", DocumentString);
		
	}
}

function checkT2EnrichmentFlag(exchange) {
	var T2Payment;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	
	logger.info("In checkT2EnrichmentFlag");

	var messageBody = exchange.getIn().getBody(org.w3c.dom.Document.class);
	logger.trace("setBody: messageBody = " + messageBody);

	var T2EnrichmentFlag = memTblGetTableValue(map, "FLAG-TABLE", "T2Enrichment"); //remove before release
	T2EnrichmentFlag = T2EnrichmentFlag.trim();
	logger.info("checkT2EnrichmentFlag: T2EnrichmentFlag = " + T2EnrichmentFlag);

	var target2MsgType = memTblGetTableValue(map, "FLAG-TABLE", "T2Enrichment_MSG_TYPE");
	target2MsgType = target2MsgType.trim();
	logger.info("checkT2EnrichmentFlag: target2MsgType = " + target2MsgType);

	var paymentType = getHeader(map, "PaymentType");
	paymentType = paymentType.toUpperCase();
	logger.info("checkT2EnrichmentFlag: paymentType = " + paymentType);
		
	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("checkT2EnrichmentFlag: msgType = " + msgType);

	if(isPatternPresent(paymentType, "TARGET2") || isPatternPresent(paymentType, "CBPR")) {
		//T2Payment = true;
		
		if(T2EnrichmentFlag == "Y") {
			if(isPatternPresent(target2MsgType, msgType)) {
				setHeader(map, "PLCN_T2EnrichmentFlag", true);
			}else{
				setHeader(map, "PLCN_T2EnrichmentFlag", false);
			}
			//messageBody = getPrettyPrint(messageBody);
			//inMsg.setBody(messageBody);
			//set headers for T2 Enrichment service call & pass violation string, same string should be used by ARL 
		}else {
			setHeader(map, "PLCN_T2EnrichmentFlag", false);
		}
	}else {
		setHeader(map, "PLCN_T2EnrichmentFlag", false); // For SEPA Testing
	}

	setHeader(map, "PLCN_T2EnrichmentFlag", false); // For SEPA Testing

	logger.info("checkT2EnrichmentFlag: PLCN_T2EnrichmentFlag = " + getHeader(map, "PLCN_T2EnrichmentFlag"));
}

function setT2EnrichmentResponse(exchange) {
	var arr = [];
	var fldViolation = [];
	var fldNo = [];
	var ovCount;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setT2EnrichmentResponse");

	var txnComments = getHeader(map, "PLCN_txnComments");
	logger.info("setT2EnrichmentResponse: txnComments = " + txnComments);

	var responseBody = inMsg.getBody(java.lang.String.class);
	logger.trace("setT2EnrichmentResponse: responseBody = " + responseBody);

	var comments = getHeader(map, "PLCN_COMMENTS");
	var t2Comments = getHeader(map, "PLCN_COMMENTS");
	logger.info("setT2EnrichmentResponse: comments = " + comments);

	if(comments) {
		ovCount = (comments.match(/:A00:/g)).length;
	}

	logger.info("setT2EnrichmentResponse: ovCount = " + ovCount);
	logger.info("setT2EnrichmentResponse: comments = " + comments);

	comments = comments + ":A00:";

	for(k = 0; k < ovCount; k++) {
		var otmp = dataBetweenTokens(":A00:", ":A00:", comments);
		logger.info("setT2EnrichmentResponse: otmp = " + otmp);
		fldNo[k] = otmp.substring(0, 2);
		fldViolation[k] = otmp.substring(3, 7);
		comments = removePattern(comments, ":A00:" + otmp);
		setCommentsForTransaction(fldNo[k], fldViolation[k], map);
	}

	logger.info("setT2EnrichmentResponse: fldNo = " + fldNo);
	logger.info("setT2EnrichmentResponse: fldViolation = " + fldViolation);
	//setHeader(map, "PLCN_txnComments", comments);

	var response = getHeader(map, "PLCN_TARGET2_TGT");
	logger.info("setT2EnrichmentResponse: PLCN_TARGET2_TGT = " + response);

	var flag = memTblGetTableValue(map, "FLAG-TABLE", "PROCESS_T2ONLY");
	flag = flag.trim();
	logger.info("setT2EnrichmentResponse: PROCESS_T2ONLY = " + flag);

	var paymentType = getHeader(map, "PaymentType");
	paymentType = paymentType.toUpperCase();
	logger.info("setT2EnrichmentResponse: paymentType = " + paymentType);

	if(isPatternPresent(paymentType, "TARGET2")) {
		if(response != "Y" && flag == "Y") {
			setCommentsForTransaction("00", "8184", map);
		}
	}else if(isPatternPresent(paymentType, "CBPR")) {

		/*if(isPatternPresent(t2Comments, "00-8182")) {
			//t2Comments = removePattern(t2Comments, ":A00:00-8182");
			logger.info("setT2EnrichmentResponse: Not Qualified");
			setCommentsForTransaction("00", "6184", map);
		}*/

		if(response == "Y") {
			logger.info("setT2EnrichmentResponse: Qualified AND BIC derived");
			setHeader(map, "MSG_FAMILY", "TARGET2");
			setHeader(map, "PLCN_validateMessage", true);
			setCommentsForTransaction("00", "9184", map);
			paymentType = replacePattern(paymentType, "CBPR", "TARGET2");
			setHeader(map, "PaymentType", paymentType);
			setHeader(map, "PLCN_msgFamily", "target2");
			setHeader(map, "PLCN_paymentTypeModified", true);
			logger.info("setT2EnrichmentResponse: MSG_FAMILY = TARGET2");
			logger.info("setT2EnrichmentResponse: paymentType = " + paymentType);
		}else {
			var haseValue = memTblGetTableValue(map, "FLAG-TABLE", "CBPR_T2_CHECK_VIOLATIONS");
			logger.info("setT2EnrichmentResponse: haseValue = " + haseValue);
			logger.info("setT2EnrichmentResponse: haseValue.length = " + haseValue.length);

			for(var j = 0; haseValue.length > 1 ; j++) {
				var value = dataBetweenTokens("|", "|", haseValue);
				logger.info("setT2EnrichmentResponse: value = " + haseValue);

				arr[j] = value;
				logger.info("setT2EnrichmentResponse: arr[j] = " + arr[j]);

				haseValue = removePattern(haseValue, "|" + value);
				logger.info("setT2EnrichmentResponse: haseValue = " + haseValue);
			}

			logger.info("setT2EnrichmentResponse: arr = " + arr);
			logger.info("setT2EnrichmentResponse: arr.length = " + arr.length);

			for(var i = 0; i < arr.length; i++) {
				logger.info("setT2EnrichmentResponse: arr.length = " + arr.length);
				logger.info("setT2EnrichmentResponse: comments = " + comments);
				logger.info("setT2EnrichmentResponse: t2Comments = " + t2Comments);
				var result = isPatternPresent(t2Comments, arr[i]);
				logger.info("setT2EnrichmentResponse: result = " + result);

				if(result == true) {
					logger.info("setT2EnrichmentResponse: Qualified BUT BIC not derived");
					setCommentsForTransaction("00", "7184", map);
				}else {
					logger.info("setT2EnrichmentResponse: Not Qualified");
					setCommentsForTransaction("00", "6184", map);
				}
			}
		}	
	}

	setHeader(map, "ACEDB_originalBody", responseBody);
	logger.trace("message Body = " + responseBody);
}

function generateResponse(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	/*var validResponse = getHeader(map, "PLCN_validResponse");
	logger.info("generateResponse: PLCN_validResponse = " + validResponse);

	if(validResponse == "false") {
		createResponse(exchange);
	}*/

	var txnComments = getHeader(map, "PLCN_txnComments");
	logger.info("generateResponse: txnComments = " + txnComments);

	if(isPatternPresent(txnComments, ":A00:")) {
		createResponse(exchange);
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
			//added by SP for TECHBULLS-30133
			if(!DescriptionValue) {
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "PLATERR|" + fldViolation[j]);
				logger.info("createResponse: langDescKey = " + langDescKey);
				logger.info("createResponse: DescriptionValue from PLATERR = " + DescriptionValue);
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
			//added by SP for TECHBULLS-30133
			if(!DescriptionValue) {
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "PLATERR|" + fldViolation[j]);
				logger.info("createResponse: langDescKey = " + langDescKey);
				logger.info("createResponse: DescriptionValue from PLATERR = " + DescriptionValue);
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

		var returnCdValue = getHeader(map, "PLCN_returnCode");
		logger.info("createResponse: vCount = " + vCount);

		if(returnCdValue) {
			var ReturnCode = createElementwithTextNode(responseDoc, responseCds, "ReturnCode", "");
			appendElementtoNode(responseCds, ReturnCode);

			var ReturnCd = createElementwithTextNode(responseDoc, responseCds, "Cd", returnCdValue);
			appendElementtoNode(ReturnCode, ReturnCd);

			var Description = createElementwithTextNode(responseDoc, responseCds, "Description", getHeader(map, "PLCN_returnCodeDes"));
			appendElementtoNode(ReturnCode, Description);
		}

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
		logger.info("createResponse: responseCdsString = " + responseCdsString);
		var internalFlag = getHeader(map, "PLCN_call");
		logger.info("createResponse: internalFlag = " + internalFlag);
		setHeader(map, "ACEDB_responseCdsDoc", responseCdsString);
		setHeader(map, "PLCN_responseCdsGenerated", true);
	}
}

function setResponse(exchange) {
	var messageBody;
	var status;
	var responseCds;
	var responseCdGenerated;
	var encodedMessage;
	var responseCdsType;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var helper = new JSHelperClass();

	logger.info("In setResponse");

	messageBody = getHeader(map, "ACEDB_originalBody");
	logger.trace("message Body = " + messageBody);

	//logger.info("setResponse: messageBody = " + messageBody);

	responseCds = getHeader(map, "ACEDB_responseCdsDoc");

	responseCdsType = typeof responseCds;
	logger.info("setResponse: responseCdsType = " + responseCdsType);

	if(responseCdsType == "object") {
		responseCds = convertDocumentToString(responseCds);
		logger.trace("setResponse: responseCds = " + responseCds);
		setHeader(map, "ACEDB_responseCdsDoc", responseCds);
	}

	if(typeof responseCds == "string") {
		responseCdGenerated = isPatternPresent(responseCds, "<ResponseCds>");
		logger.trace("setResponse: responseCdGenerated = " + responseCdGenerated);
		logger.trace("setResponse: typeof responseCdGenerated = " + typeof responseCdGenerated);
	}

	if(responseCdGenerated == true) {
		encodedMessage = Base64.getEncoder().encodeToString(helper.getBytes(responseCds));
		setHeader(map, "Audit", encodedMessage);
	}else {
		setHeader(map, "Audit", "");
	}

	setStatusFromResponse(exchange);

	logger.trace("setResponse: encodedMessage = " + encodedMessage);
	logger.info("setResponse: Audit = " + getHeader(map, "Audit"));
	logger.info("setResponse: status = " + getHeader(map, "status"));

	//inMsg.setBody(messageBody);
}

function setStatusFromResponse(exchange) {
	var responseCode;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setStatusFromResponse");

	responseCode = getHeader(map, "ACEDB_responseCdsDoc");	
	logger.trace("setStatusFromResponse: typeof responseCode = " + typeof responseCode);

	if(typeof responseCode == "string") {
		responseCode = responseCode.toUpperCase();
		logger.trace("setStatusFromResponse: responseCode = " + responseCode);

		if(isPatternPresent(responseCode, "<CDTP>ERROR</CDTP>")) {
			setHeader(map, "status", "error");	
		}else {
			setHeader(map, "status", "valid");
		}
	}else {
		setHeader(map, "status", "valid");
	}
}

function setWfHeader(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var body = inMsg.getBody(java.lang.String.class);

	logger.info("In setWfHeader");

	logger.info("setWfHeader: Document = " + Document);
	var msgType = getHeader(map, "PaymentType"); //PaymentType
	msgType = msgType.toLowerCase();
	logger.info("setWfHeader: PaymentType = " + msgType);

	var tmpStr = msgType.slice(-15);
	msgFamily = removePattern(msgType, tmpStr);
	logger.info("setWfHeader: msgFamily = " + msgFamily);

	msgFamily = msgFamily.toLowerCase();
	
	var msgType = removePattern(msgType, msgFamily);
	logger.info("setWfHeader: msgType = " + msgType);
	
	var channelIdSource = getHeader(map, "CHANNEL_ID_SOURCE");
	logger.info("setWfHeader: channelIdSource from request header = " + channelIdSource);

	if(msgType == "pacs.008.001.08" && channelIdSource == 'PELICAN' && msgFamily.toUpperCase() == "CBPR"){
		var correspondentPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI";
		var correspondent = getValueFromPath(Document, correspondentPath);
		logger.info("setWfHeader: correspondent = " + correspondent);
		setHeader(map, "CORRESPONDENT", correspondent);
	}

	var backoffice = getHeader(map, "PLCN_coresystem");
	logger.info("setWfHeader: backoffice " + backoffice);
	
	if(backoffice){
		setHeader(map, "BACKOFFICE", backoffice);
	}
	
	var purpose = getHeader(map, "PLCN_purpose");
	logger.info("setWfHeader: purpose " + purpose);
	
	if(purpose){
		setHeader(map, "PURPOSE", purpose);
	}
	
	setHeader(map, "DISPLAY_FLAG_MESSAGE", "Y");
	setHeader(map, "DISPLAY_FLAG_BATCH", "N"); //if msgFamily sepa Y else N
	setHeader(map, "CURRENT_AUTH_LEVEL_MESSAGE", "REPR=4");
	setHeader(map, "CURRENT_AUTH_LEVEL_BATCH", "REPR=4");
	setHeader(map, "CURRENT_AUTH_LEVEL_FILE", "REPR=4");
	setHeader(map, "FILE_REQUIRED", "N");
	setHeader(map, "BATCH_REQUIRED", "N");
	//Content-Type=text/plain; charset=utf-8
	//added by Akshay for testing 
	//var contentType = getHeader(map, "PLCNAPI_contentType");
	//logger.info("setWfHeader: contentType = " + contentType);
	//setHeader(map, "Content-Type", contentType);
	
	
	//var contentType2 = getHeader(map, "Content-Type");
	//logger.info("setWfHeader: contentType2 = " + contentType2);
	//setHeader(map, "Content-Type", contentType2);
	
	setHeader(map, "Content-Type", "text/plain; charset=utf-8");

	logger.info("setWfHeader: DISPLAY_FLAG_MESSAGE = " + getHeader(map, "DISPLAY_FLAG_MESSAGE"));
	logger.info("setWfHeader: DISPLAY_FLAG_BATCH = " + getHeader(map, "DISPLAY_FLAG_BATCH"));
	logger.info("setWfHeader: CURRENT_AUTH_LEVEL_MESSAGE = " + getHeader(map, "CURRENT_AUTH_LEVEL_MESSAGE"));
	logger.info("setWfHeader: CURRENT_AUTH_LEVEL_BATCH = " + getHeader(map, "CURRENT_AUTH_LEVEL_BATCH"));
	logger.info("setWfHeader: CURRENT_AUTH_LEVEL_FILE = " + getHeader(map, "CURRENT_AUTH_LEVEL_FILE"));
	logger.info("setWfHeader: FILE_REQUIRED = " + getHeader(map, "FILE_REQUIRED"));
	logger.info("setWfHeader: BATCH_REQUIRED = " + getHeader(map, "BATCH_REQUIRED"));
	logger.info("setWfHeader: Content-Type = " + getHeader(map, "Content-Type"));

	var datepath = getValueDatePath(exchange);
	logger.info("setWfHeader: datepath = " + datepath);
	logger.info("setWfHeader: typeof datepath = " + typeof datepath);

	if(datepath) {
	var dateValue = getValueFromPath(Document, datepath);
	logger.info("setWfHeader: dateValue = " + dateValue);
	}

	var flag = isPatternPresent(body, "<NtfctnToRcv>");
	logger.info("setWfHeader: flag = " + flag);

	if(!dateValue && isPatternPresent(body, "<NtfctnToRcv>")) {
		datepath = "/Document/NtfctnToRcv/Ntfctn/Itm/XpctdValDt";
		dateValue = getValueFromPath(Document, datepath);
		logger.info("setWfHeader: dateValue = " + dateValue);
	}

	if(!dateValue && isPatternPresent(body, "<PmtRtr>")) {
		datepath = "/Document/PmtRtr/GrpHdr/IntrBkSttlmDt";
		dateValue = getValueFromPath(Document, datepath);
		logger.info("setWfHeader: dateValue = " + dateValue);
	}

	if(dateValue == null && isPatternPresent(body, "<FIToFICstmrCdtTrf>")) {
		var datepath1 = "/Document/FIToFICstmrCdtTrf/GrpHdr/IntrBkSttlmDt";
		logger.info("setWfHeader: datepath1 = " + datepath1);
		dateValue = getValueFromPath(Document, datepath1);
		logger.info("setWfHeader: dateValue = " + dateValue);
	}

	if(dateValue) {
		dateValue = replaceAllPattern(dateValue, "-", "");
		logger.info("setWfHeader: dateValue = " + dateValue);
	}
	setHeader(map, "CALC_DATE", dateValue);
}

function ruleGenerateKbPath(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var body = inMsg.getBody(java.lang.String.class);
	var priorityDatePath;
	var senderPath;
	var receiverPath;
	var transRefNoPath;
	var currencyPath;
	var priorityAmountPath;
	var priorityDate;
	var currencyPath1;
	var priorityAmount;
	var priorityDatePath1;

	var institutionId = getHeader(map, "INSTITUTION_ID");
	logger.info("ruleGenerateKbPath: institutionId from request header = " + institutionId);

	setHeader(map, "ACEDB_originalBody", body);

	if(!institutionId){
		institutionId = "PLCNGBWB";
		logger.info("ruleGenerateKbPath: institutionId = " + institutionId);
	}

	var channelIdSource = getHeader(map, "CHANNEL_ID_SOURCE");
	logger.info("ruleGenerateKbPath: channelIdSource from request header = " + channelIdSource);
	
	var manualMode = getHeader(map, "MANUAL_MODE");
	logger.info("ruleGenerateKbPath: manualMode from request header = " + manualMode);
	
	//var contentType = getHeader(map, "Content-Type");
	//logger.info("ruleGenerateKbPath: contentType from request header = " + contentType);
	
	var msgType = getHeader(map, "PaymentType");
	msgType = msgType.toLowerCase();
	logger.info("ruleGenerateKbPath: PaymentType = " + msgType);

	var tmpStr = msgType.slice(-15);
	msgFamily = removePattern(msgType, tmpStr);
	logger.info("ruleGenerateKbPath: msgFamily = " + msgFamily);

	msgFamily = msgFamily.toLowerCase();

	/*if(isPatternPresent(msgType, "target2")) {
		msgFamily = "target2";
	}else if(isPatternPresent(msgType, "cbpr")) {
		msgFamily = "cbpr";
	}*/

	var msgType = removePattern(msgType, msgFamily);
	logger.info("ruleGenerateKbPath: msgType = " + msgType);
	setHeader(map, "PLCNAPI_message_type", msgType);
	if(msgType == "pacs.008.001.08") {
		setHeader(map, "PLCNAPI_messageFamily", "SEPA CT");
	}else if(msgType == "pacs.003.001.08") {
		setHeader(map, "PLCNAPI_messageFamily", "SEPA DD");
	}else {
		setHeader(map, "PLCNAPI_messageFamily", "SEPA CT");
	}

	var sender = getHeader(map, "SENDER");
	logger.info("ruleGenerateKbPath: sender = " + sender);

	var receiver = getHeader(map, "RECEIVER");
	logger.info("ruleGenerateKbPath: receiver = " + receiver);	

	var tenantName = getHeader(map, "PLCN_tenantName");
	logger.info("ruleGenerateKbPath: tenantName = " + tenantName);
	if(!tenantName){
		var tenantNamePath = institutionId + ".INSTITUTION_DETAILS.TENANT_NAME";
		logger.info("ruleGenerateKbPath: tenantName = " + tenantNamePath);
		tenantName = memTblGetTableValue(map, "INST_PARAM",tenantNamePath);
		logger.info("ruleGenerateKbPath: tenantName = " + tenantName);
	}

	var Path = institutionId + ".MESSAGE_PROCESSING.FUNCTIONALITY.BICLOOKUP.ISBICOPTIONAL";
	logger.info("ruleGenerateKbPath: Path = " + Path);

	var bicOptionalFlag = memTblGetTableValue(map, "INST_PARAM", Path);
	logger.info("ruleGenerateKbPath: bicOptionalFlag = " + bicOptionalFlag);
	logger.info("ruleGenerateKbPath: Type of bicOptionalFlag = " + typeof bicOptionalFlag);

	if(bicOptionalFlag == "TRUE" && (msgType == "pacs.008.001.08" || msgType == "pacs.003.001.08")) {
		logger.info("ruleGenerateKbPath: Inside If loop");
		//ibanBicEnrichment(exchange);
		setHeader(map, "PLCN_IbanBicFlag",true)
	}else {
		setHeader(map, "PLCN_IbanBicFlag", false);
	}

	if(msgType == "pacs.004.001.09") {
		priorityDatePath = "/Document/PmtRtr/TxInf/IntrBkSttlmDt";
		priorityDatePath1 = "/Document/PmtRtr/GrpHdr/IntrBkSttlmDt";
		//senderPath = "/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/BICFI";
		//receiverPath = "/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/BICFI";
		senderPath = "/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/BICFI";
		receiverPath = "/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/BICFI";
		transRefNoPath = "/Document/PmtRtr/GrpHdr/MsgId";
		currencyPath = "/Document/PmtRtr/TxInf/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";	
		currencyPath1 = "/Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt/@Ccy";
		priorityAmountPath = "/Document/PmtRtr/TxInf/OrgnlTxRef/IntrBkSttlmAmt";
		priorityAmountPath1 = "/Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt";
	}else if(msgType == "pacs.008.001.08") {
		priorityDatePath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
		//senderPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI"; //WIP
		//receiverPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI"; //WIP
		senderPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
		receiverPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";
		transRefNoPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/InstrId";
		currencyPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy";
		priorityAmountPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt";
	}else if(msgType == "pacs.009.001.08") {
		priorityDatePath = "/Document/FICdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
		//senderPath = "/Document/FICdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
		//receiverPath = "/Document/FICdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";
		senderPath = "/Document/FICdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
		receiverPath = "/Document/FICdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";		
		transRefNoPath = "/Document/FICdtTrf/CdtTrfTxInf/PmtId/InstrId";
		currencyPath = "/Document/FICdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy";
		priorityAmountPath = "/Document/FICdtTrf/CdtTrfTxInf/IntrBkSttlmAmt";
	}else if(msgType == "camt.057.001.06") {
		priorityDatePath = "/Document/NtfctnToRcv/Ntfctn/XpctdValDt";
		priorityDatePath1 = "/Document/NtfctnToRcv/Ntfctn/Itm/XpctdValDt";
		transRefNoPath = "/Document/NtfctnToRcv/Ntfctn/Itm/Id";
		currencyPath = "/Document/NtfctnToRcv/Ntfctn/Itm/Amt/@Ccy";
		priorityAmountPath = "/Document/NtfctnToRcv/Ntfctn/Itm/Amt";

		sender = getHeader(map, "SENDER");
		receiver = getHeader(map, "RECEIVER");
		logger.info("ruleGenerateKbPath: sender from HTTP header = " + sender);
		logger.info("ruleGenerateKbPath: receiver from HTTP header = " + receiver);		
		setHeader(map, "PLCN_sender", sender);
		setHeader(map, "PLCN_receiver", receiver);
	}else if(msgType == "pain.001.001.09") {
		priorityDatePath = "/Document/CstmrCdtTrfInitn/PmtInf/ReqdExctnDt/Dt";
		priorityDatePath1 = "/Document/NtfctnToRcv/Ntfctn/Itm/XpctdValDt";
		transRefNoPath = "/Document/CstmrCdtTrfInitn/PmtInf/PmtInfId";
		currencyPath = "/Document/CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf/Amt/InstdAmt/@Ccy";
		senderPath = "/Document/CstmrCdtTrfInitn/GrpHdr/InitgPty/Id/OrgId/AnyBIC";
		receiverPath = "/Document/CstmrCdtTrfInitn/GrpHdr/FwdgAgt/FinInstnId/BICFI";
	}else if(msgType == "camt.056.001.08") {
		priorityDatePath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmDt'; 
		senderPath = "/Document/FIToFIPmtCxlReq/Assgnmt/Assgnr/Agt/FinInstnId/BICFI";
		receiverPath = "/Document/FIToFIPmtCxlReq/Assgnmt/Assgne/Agt/FinInstnId/BICFI";
		transRefNoPath = "/Document/FIToFIPmtCxlReq/Assgnmt/Id";
		currencyPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt/@Ccy';
		priorityAmountPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt';
	}else if(msgType == 'camt.029.001.09') {
		priorityDatePath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmDt';
		senderPath = "/Document/RsltnOfInvstgtn/Assgnmt/Assgnr/Agt/FinInstnId/BICFI";
		receiverPath = "/Document/RsltnOfInvstgtn/Assgnmt/Assgne/Agt/FinInstnId/BICFI";
		transRefNoPath = "/Document/RsltnOfInvstgtn/Assgnmt/Id";
		currencyPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy';
		priorityAmountPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt';
	}else if(msgType == 'pacs.003.001.08') {
		priorityDatePath = '/Document/FIToFICstmrDrctDbt/GrpHdr/IntrBkSttlmDt';
		senderPath = "/Document/FIToFICstmrDrctDbt/GrpHdr/InstgAgt/FinInstnId/BICFI";
		receiverPath = "/Document/FIToFICstmrDrctDbt/GrpHdr/InstdAgt/FinInstnId/BICFI";
		transRefNoPath = "/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/PmtId/TxId";
		currencyPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/IntrBkSttlmAmt/@Ccy';
		priorityAmountPath = '/Document/FIToFICstmrDrctDbt/GrpHdr/TtlIntrBkSttlmAmt';
	}else if(msgType == 'pacs.007.001.09') {
		priorityDatePath = '/Document/FIToFIPmtRvsl/GrpHdr/IntrBkSttlmDt';
		senderPath = "/Document/FIToFIPmtRvsl/GrpHdr/InstgAgt/FinInstnId/BICFI";
		receiverPath = "/Document/FIToFIPmtRvsl/GrpHdr/InstdAgt/FinInstnId/BICFI";
		transRefNoPath = "/Document/FIToFIPmtRvsl/TxInf/OrgnlTxId";
		currencyPath = '/Document/FIToFIPmtRvsl/GrpHdr/TtlRvsdIntrBkSttlmAmt/@Ccy';
		priorityAmountPath = '/Document/FIToFIPmtRvsl/GrpHdr/TtlRvsdIntrBkSttlmAmt';
	}

	if(priorityDatePath){
		priorityDate = getValueFromPath(Document, priorityDatePath);
		logger.info("ruleGenerateKbPath: priorityDate from xPath = " + priorityDate);
	}

	if(!priorityDate && (msgType == "camt.057.001.06" || msgType == "pacs.004.001.09")) {
		//priorityDatePath = "/Document/NtfctnToRcv/Ntfctn/Itm/XpctdValDt";
		priorityDate = getValueFromPath(Document, priorityDatePath1);
		logger.info("ruleGenerateKbPath: priorityDate from priorityDatePath1 = " + priorityDate);
	}

	if(!priorityDate && msgType == "pacs.008.001.08") {
		priorityDatePath = "/Document/FIToFICstmrCdtTrf/GrpHdr/IntrBkSttlmDt";
		priorityDate = getValueFromPath(Document, priorityDatePath);
	}

	if(priorityDate) {
		priorityDate = replaceAllPattern(priorityDate, "-", "");
		logger.info("ruleGenerateKbPath: priorityDate from xPath = " + priorityDate);
		setHeader(map, "PLCN_priorityDate", priorityDate);
		setHeader(map, "PLCN_valueDate", priorityDate);
	}

	if(senderPath) {
		if(!sender) {
			sender = getValueFromPath(Document, senderPath);
			logger.info("ruleGenerateKbPath: sender from xPath = " + sender);

			if(!sender && msgType == "camt.056.001.08"){
				senderPath = "/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/BICFI";
				sender = getValueFromPath(Document, senderPath);
				logger.info("ruleGenerateKbPath: sender from xPath = " + sender);
			}
		}

		setHeader(map, "PLCN_sender", sender);
	}

	if(receiverPath) {
		if(!receiver) {
			receiver = getValueFromPath(Document, receiverPath);
			logger.info("ruleGenerateKbPath: receiver from xPath = " + receiver);

			if(!receiver && msgType == "camt.056.001.08"){
				receiverPath = "/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/BICFI";
				receiver = getValueFromPath(Document, receiverPath);
				logger.info("ruleGenerateKbPath: receiver from xPath = " + receiver);
			}
		}

		setHeader(map, "PLCN_receiver", receiver);
	}

	if(transRefNoPath) {
		var transRefNo = getValueFromPath(Document, transRefNoPath);
		logger.info("ruleGenerateKbPath: transRefNo from xPath = " + transRefNo);
		setHeader(map, "PLCN_transRefNo", transRefNo);
	}

	if(currencyPath) {
		var currency = getValueFromPath(Document, currencyPath);
		logger.info("ruleGenerateKbPath: currency from xPath = " + currency);
		setHeader(map, "PLCN_currency", currency);
		logger.info("ruleGenerateKbPath: typeof currency from xPath = " + typeof currency);
		if(currency == null && msgType == "pacs.004.001.09") {
			logger.info("ruleGenerateKbPath: currency found null from first path" );
			currency = getValueFromPath(Document, currencyPath1);
			logger.info("ruleGenerateKbPath: currency from xPath = " + currency);
			setHeader(map, "PLCN_currency", currency);
		}
	}

	if(priorityAmountPath) {
		var priorityAmount = getValueFromPath(Document, priorityAmountPath);
		logger.info("ruleGenerateKbPath: priorityAmount from xPath = " + priorityAmount);
		priorityAmount = replacePattern(priorityAmount, ".", ",");
		setHeader(map, "PLCN_priorityAmount", priorityAmount);
	}

	if(!priorityAmount && msgType == "pacs.004.001.09") {
		priorityAmount = getValueFromPath(Document, priorityAmountPath1);
		logger.info("ruleGenerateKbPath: priorityAmount from priorityAmountPath1 = " + priorityAmount);
		priorityAmount = replacePattern(priorityAmount, ".", ",");
		setHeader(map, "PLCN_priorityAmount", priorityAmount);
	}

	if(msgType == "camt.057.001.06") {
		senderPath = "/Document/NtfctnToRcv/GrpHdr/MsgSndr/Agt/FinInstnId/BICFI";
		sender = getValueFromPath(Document, senderPath);
		logger.info("ruleGenerateKbPath: sender from MsgSndr = " + sender);

		if(!sender) {
			senderPath = "/Document/NtfctnToRcv/Ntfctn/AcctOwnr/Agt/FinInstnId/BICFI";
			sender = getValueFromPath(Document, senderPath);
			logger.info("ruleGenerateKbPath: sender from AcctOwnr = " + sender);
		}

		if(!sender) {
			senderPath = institutionId + "." + "MESSAGE_PROCESSING.FUNCTIONALITY.DEFAULT_BAH_VALUE.CAMT.057" + "." + "SENDER";
			sender = memTblGetTableValue(map, "INST_PARAM", senderPath);
			logger.info("ruleGenerateKbPath: sender from Institution Parameter = " + sender);
		}

		receiverPath = "/Document/NtfctnToRcv/Ntfctn/AcctSvcr/FinInstnId/BICFI";;
		receiver = getValueFromPath(Document, receiverPath);
		logger.info("ruleGenerateKbPath: receiver from AcctSvcr = " + receiver);

		if(!receiver) {
			receiverPath = institutionId + "." + "MESSAGE_PROCESSING.FUNCTIONALITY.DEFAULT_BAH_VALUE.CAMT.057" + "." + "RECEIVER";
			receiver = memTblGetTableValue(map, "INST_PARAM", receiverPath);
			logger.trace("ruleGenerateKbPath: receiver from Institution Parameter = " + receiver);
		}

		setHeader(map, "PLCN_sender", sender);
		setHeader(map, "PLCN_receiver", receiver);
	}

	var clrSysValue = getHeader(map, "CSM");
	logger.info("ruleGenerateKbPath: clrSysValue from CSM = " + clrSysValue);

	if(clrSysValue) {
		setHeader(map, "PLCNAPI_csm", clrSysValue);
	}

	if(msgFamily.toUpperCase() == "SEPA" && msgType == "camt.056.001.08") {
		var sttlmMtd = getValueFromPath(Document, "Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/SttlmInf/SttlmMtd");
		logger.info("ruleGenerateKbPath: sttlmMtd = " + sttlmMtd);

		if(sttlmMtd == "INDA") {
			setCommentsForTransaction("00", "8201", map);
			logger.info("ruleGenerateKbPath: This transaction cannot be recalled.");
		}
	}

	//PURPOSE CODE DEVELOPMENT
	if(msgType == "pacs.008.001.08" && channelIdSource == 'PELICAN' && msgFamily.toUpperCase() == "SEPA"){
		var purposePath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Purp/Cd";
		var purpose = getValueFromPath(Document, purposePath);
		logger.info("ruleGenerateKbPath: purpose = " + purpose);
		setHeader(map, "PLCN_purpose", purpose);
		setHeader(map, "PLCNAPI_purpose", purpose);
	}
	
	if(msgType == "pacs.003.001.08" && channelIdSource == 'PELICAN' && msgFamily.toUpperCase() == "SEPA"){
		var purposePath = "/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/Purp/Cd";
		var purpose = getValueFromPath(Document, purposePath);
		logger.info("ruleGenerateKbPath: purpose = " + purpose);
		setHeader(map, "PLCN_purpose", purpose);
		setHeader(map, "PLCNAPI_purpose", purpose);
	}
	
	if(msgType == "pacs.004.001.09" && channelIdSource == 'PELICAN' && msgFamily.toUpperCase() == "SEPA"){
		var purposePath = "/Document/PmtRtr/TxInf/OrgnlTxRef/Purp/Cd";
		var purpose = getValueFromPath(Document, purposePath);
		logger.info("ruleGenerateKbPath: purpose = " + purpose);
		setHeader(map, "PLCN_purpose", purpose);
		setHeader(map, "PLCNAPI_purpose", purpose);
	}
	
	if(msgType == "camt.029.001.09" && channelIdSource == 'PELICAN' && msgFamily.toUpperCase() == "SEPA"){
		var purposePath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Purp/Cd";
		var purpose = getValueFromPath(Document, purposePath);
		logger.info("ruleGenerateKbPath: purpose = " + purpose);
		setHeader(map, "PLCN_purpose", purpose);
		setHeader(map, "PLCNAPI_purpose", purpose);
	}

	if(msgType == "pacs.008.001.08" && channelIdSource == 'PELICAN' && msgFamily.toUpperCase() == "CBPR"){
		var purposePath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Purp/Cd";
		var purpose = getValueFromPath(Document, purposePath);
		logger.info("ruleGenerateKbPath: purpose = " + purpose);
		setHeader(map, "PLCN_purpose", purpose);
		setHeader(map, "PLCNAPI_purpose", purpose);
	}
	
	if(msgType == "pacs.009.001.08" && channelIdSource == 'PELICAN' && msgFamily.toUpperCase() == "CBPR"){
		var purposePath = "/Document/FICdtTrf/CdtTrfTxInf/Purp/Cd";
		var purpose = getValueFromPath(Document, purposePath);
		logger.info("ruleGenerateKbPath: purpose = " + purpose);
		setHeader(map, "PLCN_purpose", purpose);
		setHeader(map, "PLCNAPI_purpose", purpose);
	}
	
	setHeader(map, "PLCN_CURRENCY", currency);
	setHeader(map, "PLCN_MESSAGE_DIRECTION", "I");
	setHeader(map, "PLCN_INSTITUTIONID", institutionId);
	setHeader(map, "PLCN_call", true);
	setHeader(map, "PLCNAPI_call", true);
	setHeader(map, "PLCN_msgType", msgType);
	setHeader(map, "PLCNAPI_msgType", msgType);
	setHeader(map, "PLCN_direction", "I");
	setHeader(map, "PLCN_msgDirection", "I");
	setHeader(map, "PLCNAPI_msgDirection", "I");
	setHeader(map, "PLCN_institutionId", institutionId);
	setHeader(map, "PLCNAPI_institutionId", institutionId);
	setHeader(map, "PLCN_msgModeIn", "MANUAL");
	setHeader(map, "PLCNAPI_msgModeIn", "MANUAL");
	setHeader(map, "PLCN_mode", "MANUAL");
	setHeader(map, "PLCNAPI_mode", "MANUAL");
	setHeader(map, "PLCN_creationCall", "true");
	setHeader(map, "PLCNAPI_creationCall", "true");
	setHeader(map, "PLCN_msgFamily", msgFamily.toUpperCase());
	setHeader(map, "PLCNAPI_msgFamily", msgFamily.toUpperCase());	
	setHeader(map, "PLCNAPI_sender", sender);
	setHeader(map, "PLCNAPI_receiver", receiver);
	setHeader(map, "PLCNAPI_currency", currency);
	setHeader(map, "PLCNAPI_priorityDate", priorityDate);
	setHeader(map, "PLCNAPI_transRefNo", transRefNo);
	setHeader(map, "PLCNAPI_priorityAmount", priorityAmount);
	setHeader(map, "PLCNAPI_channelIdSource", channelIdSource);
	setHeader(map, "PLCN_channelIdSource", channelIdSource);
	setHeader(map, "PLCN_manualMode", manualMode);
	setHeader(map, "PLCNAPI_manualMode", manualMode);
	setHeader(map, "PLCN_sourceChannelId", channelIdSource);
	setHeader(map, "PLCNAPI_sourceChannelId", channelIdSource);
	//setHeader(map, "PLCNAPI_contentType", contentType);
	drveProductCodeCreation(exchange);
	deriveServiceConfigured(exchange);
}

function deriveServiceConfigured(exchange) {
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var msgdbMap = new HashMap();
	var audit = new HashMap();

	var productCode;
    var institutionId;
    var custom13;
	var channelIdSource;
    var cashForcasting;
    var scanning;
    var authorize
    var preWareHouse;
    var disposition;
	var matching;
	var review;

	//var custom13 = readMsgdb.get("CUSTOM13");
	//logger.info("deriveServiceConfigured: custom13 = " + custom13);

	productCode = getHeader(map, "PLCN_productCode");
	logger.info("deriveServiceConfigured: productCode = " + productCode);

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("deriveServiceConfigured: institutionId = " + institutionId);

	//For testing
	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("deriveServiceConfigured: msgType = " + msgType);

	if(productCode){
		productCode = productCode.trim();
		logger.info("deriveServiceConfigured: productCode after trim = " + productCode);
	}

	if(!productCode){
		productCode = getHeader(map, "PLCN_productCode");
		logger.info("deriveServiceConfigured: productCode after trim = " + productCode);
	}
	//productCode = getHeader(map, "PLCN_productCode");
	logger.info("deriveServiceConfigured: Product Code = " + productCode);

	var preWrhsPath = institutionId.concat(".PROCESSING_STAGES.PRE_WAREHOUSE.PRODUCTS");
	logger.info("deriveServiceConfigured: preWrhsPath = " + preWrhsPath);
	var preWrhsCode = memTblGetTableValue(map, "INST_PARAM", preWrhsPath);
	logger.info("deriveServiceConfigured: preWrhsCode = " + preWrhsCode);

	var matchingPath = institutionId.concat(".PROCESSING_STAGES.MATCHING.PRODUCTS");
	logger.info("deriveServiceConfigured: matchingPath = " + matchingPath);
	var matchingCode = memTblGetTableValue(map, "INST_PARAM", matchingPath);
	logger.info("deriveServiceConfigured: matchingCode = " + matchingCode);

	var scanningPath = institutionId.concat(".PROCESSING_STAGES.SANCTION_SCANNING.PRODUCTS");
	logger.info("deriveServiceConfigured: scanningPath = " + scanningPath);
	var scanningCd = memTblGetTableValue(map, "INST_PARAM", scanningPath);
	logger.info("deriveServiceConfigured: scanningCode = " + scanningCd);

	var cashForcastingPath = institutionId.concat(".PROCESSING_STAGES.CASH_FORECASTING.PRODUCTS");
	logger.info("deriveServiceConfigured: cashForcastingPath = " + cashForcastingPath);
	cashForcasting = memTblGetTableValue(map, "INST_PARAM", cashForcastingPath);
	logger.info("deriveServiceConfigured: cashForcasting Code = " + cashForcasting);

	var dispositionPath = institutionId.concat(".PROCESSING_STAGES.DISPOSITION.PRODUCTS");
	logger.info("deriveServiceConfigured: dispositionPath = " + dispositionPath);
	disposition = memTblGetTableValue(map, "INST_PARAM", dispositionPath);
	logger.info("deriveServiceConfigured: disposition code = " + disposition);

	var authorizePath = institutionId.concat(".PROCESSING_STAGES.AUTHORIZE.PRODUCTS");institutionId + "."+ "PROCESSING_STAGES.AUTHORIZE" + "." + "AMOUNT_CAP" + "." + "BASED_ON_SWIFT_PRODUCT_CODE";
	logger.info("deriveServiceConfigured: authorizePath = " + authorizePath);
	var authorizeCode = memTblGetTableValue(map, "INST_PARAM", authorizePath);
	logger.info("deriveServiceConfigured: authorize code = " + authorizeCode);

	var authorizePath1 = institutionId + "."+ "PROCESSING_STAGES.AUTHORIZE" + "." + "AMOUNT_CAP" + "." + "BASED_ON_SWIFT_PRODUCT_CODE";
	logger.info("deriveServiceConfigured: authorizePath = " + authorizePath1);
	var authorizeCode1 = memTblGetTableValue(map, "INST_PARAM", authorizePath1);
	logger.info("deriveServiceConfigured: authorize code = " + authorizeCode1);

	var duplicatePath = institutionId.concat(".PROCESSING_STAGES.DUPLICATE_CHECK.PRODUCTS");
	logger.info("deriveServiceConfigured: duplicatePath = " + duplicatePath);
	var duplicateCode = memTblGetTableValue(map, "INST_PARAM", duplicatePath);
	logger.info("deriveServiceConfigured: duplicate code = " + duplicateCode);

	/*var duplicatePath1 = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.DUPLICATE_CHECK.BASED_ON_HASHCODE.DUP_CHK_TYP_HASH");
	logger.info("deriveServiceConfigured: duplicatePath = " + duplicatePath1);
	var duplicateCode1 = memTblGetTableValue(map, "INST_PARAM", duplicatePath1);
	logger.info("deriveServiceConfigured: duplicate code hashcode check = " + duplicateCode1);*/

	var accountingPath = institutionId.concat(".PROCESSING_STAGES.ACCOUNTING_ENTRY.PRODUCTS");
	logger.info("deriveServiceConfigured: accountingPath = " + accountingPath);
	var accountingCode = memTblGetTableValue(map, "INST_PARAM", accountingPath);
	logger.info("deriveServiceConfigured: accounting code = " + accountingCode);

	var repairPath = institutionId.concat(".PROCESSING_STAGES.REPAIR.PRODUCTS");
	logger.info("deriveServiceConfigured: accountingPath = " + repairPath);
	var repairCode = memTblGetTableValue(map, "INST_PARAM", repairPath);
	logger.info("deriveServiceConfigured: repairCode code = " + repairCode);

	logger.info("deriveServiceConfigured: Type of repairCode code = " + typeof repairCode);
	logger.info("deriveServiceConfigured: Type of product code = " + typeof productCode);

	var reviewPath = institutionId.concat(".PROCESSING_STAGES.REVIEW.PRODUCTS");
	logger.info("deriveServiceConfigured: reviewPath = " + reviewPath);
	var reviewCode = memTblGetTableValue(map, "INST_PARAM", reviewPath);
	logger.info("deriveServiceConfigured: reviewCode code = " + reviewCode);

	if(!custom13){
		custom13 = "";
		if(isPatternPresent(matchingCode, productCode)){
			custom13 = custom13 + "MATCHING=Y|"; //for testing
		}
		else{
			custom13 = custom13 + "MATCHING=N|"; //for testing - CHANGE IT TO N after testing
		}

		if(isPatternPresent(cashForcasting, productCode)){
			custom13 = custom13 + "CASH_FORECASTING=Y|";
			//custom13 = custom13 + "CASH_FORECASTING=Y|"; //for testing
		}
		else{
			custom13 = custom13 + "CASH_FORECASTING=N|";
		}

		if(isPatternPresent(scanningCd, productCode)){
			custom13 = custom13 + "SCANNING=Y|"; //for testing - CHANGE IT TO Y after testing
		}
		else{
			custom13 = custom13 + "SCANNING=N|"; //for testing
		}

		if(isPatternPresent(preWrhsCode, productCode)){
			custom13 = custom13 + "WAREHOUSE=Y|";
		}
		else{
			custom13 = custom13 + "WAREHOUSE=N|"; //for testing
		}

		if(isPatternPresent(authorizeCode,productCode)|| isPatternPresent(authorizeCode1,productCode)){
			custom13 = custom13 + "AUTHORIZATION=Y|"; //for testing
		}
		else{
			custom13 = custom13 + "AUTHORIZATION=N|";
		}

		if(isPatternPresent(accountingCode, productCode)){
			custom13 = custom13 + "ACCOUNTING_ENTRY=Y|";
		}
		else{
			custom13 = custom13 + "ACCOUNTING_ENTRY=N|";
		}

		if(isPatternPresent(disposition, productCode)){
			custom13 = custom13 + "DISPOSITION=Y|";
			//custom13 = custom13 + "DISPOSITION=N|"; //for testing
		}
		else{
			custom13 = custom13 + "DISPOSITION=N|";
		}

		if(isPatternPresent(reviewCode, productCode)){
			//custom13 = custom13 + "DISPOSITION=Y|";
			custom13 = custom13 + "REVIEW=Y|"; //for testing
		}
		else{
			custom13 = custom13 + "REVIEW=N|";
		}

		if(isPatternPresent(duplicateCode,productCode)){
			custom13 = custom13 + "DUPLICATE=Y|"; //for etsting
		}
		else{
			custom13 = custom13 + "DUPLICATE=N|";
		}

		if(isPatternPresent(repairCode, productCode)){
			logger.info("deriveServiceConfigured: in repairCode.");
			custom13 = custom13 + "REPAIR=Y|";
		}
		else{
			logger.info("deriveServiceConfigured: in non-repairCode.");
			custom13 = custom13 + "REPAIR=N|"; //for testing - CHANGE IT TO N after testing
		}

		custom13 = custom13 + "VALIDATE=Y|";

	}
	setHeader(map, "PLCNAPI_custom13", custom13);
	setHeader(map, "PLCN_custom13", custom13);
	logger.info("deriveServiceConfigured: custom13 string = " + custom13);
}

function drveProductCodeCreation(exchange) {
	var mode;
	var msgType;
	var productCode;
	var key;
	var institutionId;
	var drveProductCodeFlag;
	var drveProductCodeFlagPath;
	var sourceChannelId;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In drveProductCodeCreationCreation");

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("drveProductCodeCreation: institutionId = " + institutionId);

	mode = getHeader(map, "PLCN_msgModeIn");
	logger.info("drveProductCodeCreation: mode = " + mode);

	msgType = getHeader(map, "PLCN_msgType");
	logger.info("drveProductCodeCreation: msgType = " + msgType);

	sourceChannelId = getHeader(map, "PLCN_sourceChannelId");
	logger.info("drveProductCodeCreation: sourceChannelId = " + sourceChannelId);

	drveProductCodeFlagPath = institutionId + "." + "MESSAGE_PROCESSING.FUNCTIONALITY.CHANNEL_MSGTYPE_CONFIG" + "." + sourceChannelId;
	drveProductCodeFlag = memTblGetTableValue(map, "INST_PARAM", drveProductCodeFlagPath);
	logger.info("drveProductCodeCreation: drveProductCodeFlag = " + drveProductCodeFlag);
	
	if(isPatternPresent(drveProductCodeFlag, msgType)) {
		if(mode == "MANUAL" || mode == "UPLOAD") {
			key = mode + "-" + msgType;
			logger.info("drveProductCodeCreation: key = " + key);

			productCode = memTblGetTableValue(map, "PPAY_PRODUCT_CODE", key);
			logger.info("drveProductCodeCreation: productCode = " + productCode);
		}

		if(productCode) {
			setHeader(map, "PLCN_productCode", productCode);
			setHeader(map, "PLCNAPI_productCode", productCode);
			logger.info("drveProductCodeCreation: productCode in header = " + getHeader(map, "PLCNAPI_productCode"));
			return productCode;
		}		
	}
}

function enrichmentCreationRule(exchange) { 
	logger.info("In enrichmentCreationRule");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	logger.trace("enrichmentCreationRule: Document1 = " + Document1);

	var PaymentType = getHeader(map,"PaymentType");
	PaymentType = PaymentType.toUpperCase();
	logger.info("enrichmentCreationRule: PaymentType = " + PaymentType);

	//Debtor
	if(PaymentType == "TARGET2PACS.009.001.08") {
		logger.info("Target2Pacs009 EnrichmentCreationRule");
		var dbtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<PstlAdr>");
		logger.info("Target2Pacs009 EnrichmentCreationRule:dbtrPstlAdr = " + dbtrPstlAdr);

		var dbtrNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/Nm';
		var dbtrNm = getValueFromPath(Document, dbtrNmPath);
		logger.info("Target2Pacs009 EnrichmentCreationRule:dbtrNm = " + dbtrNm);

		if(isPatternPresent(Document1, "<Dbtr>")) {
			if(dbtrNm && !dbtrPstlAdr) {
				var dbtr = Document.getElementsByTagName("Dbtr");
				var nextNode = dbtr.item(0);
				logger.info("Target2Pacs009 EnrichmentCreationRule:nextNode = " + nextNode);
				
				dbtrPstlAdr = createElement(Document, "PstlAdr");
				
				var value = "NOTPROVIDED";

				var dbtrAdrLine =  createElementwithTextNode(Document , dbtrPstlAdr, "AdrLine" , value);
				dbtrPstlAdr.appendChild(dbtrAdrLine);
				logger.info("Target2Pacs009 EnrichmentCreationRule:dbtrPstlAdr = " + dbtrPstlAdr);
				//FinInstnId.appendChild(dbtrPstlAdr);
					          
				var FinInstnId = nextNode.getElementsByTagName("FinInstnId");
				logger.info("Target2Pacs009 EnrichmentCreationRule: FinInstnId = " + FinInstnId);
				var newNode = FinInstnId.item(0);
				logger.info("Target2Pacs009 EnrichmentCreationRule:newNode = " + newNode);
				//newNode.appendChild(dbtrPstlAdr);

				var Nm = newNode.getElementsByTagName("Nm");
				var NodeId = Nm.item(0);
				logger.info("enrichmentCreationRule:NodeId = " + NodeId); 

				newNode.insertBefore(dbtrPstlAdr, NodeId.nextSibling);
				var DocumentString = convertDocumentToString(Document);
				logger.trace("Target2Pacs009 EnrichmentCreationRule:Message Body = " + DocumentString);
				inMsg.setBody(DocumentString);
				setHeader(map, "ACEDB_originalBody", DocumentString);
				logger.trace("message Body = " + DocumentString);
			}
		}	

		//Creditor
		var cdtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<PstlAdr>");
		logger.info("Target2Pacs009 EnrichmentCreationRule:CdtrPstlAdr = " + cdtrPstlAdr);

		var cdtrNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/Nm';
		var cdtrNm = getValueFromPath(Document, cdtrNmPath);
		logger.info("Target2Pacs009 EnrichmentCreationRule:CdtrNm = " + cdtrNm);

		if(isPatternPresent(Document1, "<Cdtr>")) {
			if(cdtrNm && !cdtrPstlAdr) {
				var cdtr = Document.getElementsByTagName("Cdtr");
				var nextNode = cdtr.item(0);
				logger.info("Target2Pacs009 EnrichmentCreationRule:nextNode = " + nextNode);
				
				cdtrPstlAdr = createElement(Document, "PstlAdr");
				var value = "NOTPROVIDED";

				var cdtrAdrLine =  createElementwithTextNode(Document , cdtrPstlAdr, "AdrLine" , value);
				cdtrPstlAdr.appendChild(cdtrAdrLine);
				logger.info("Target2Pacs009 EnrichmentCreationRule:cdtrPstlAdr = " + cdtrPstlAdr);
				//FinInstnId.appendChild(dbtrPstlAdr);
					          
				var FinInstnId = nextNode.getElementsByTagName("FinInstnId");
				logger.info("Target2Pacs009 EnrichmentCreationRule: FinInstnId = " + FinInstnId);
				var newNode = FinInstnId.item(0);
				logger.info("Target2Pacs009 EnrichmentCreationRule:newNode = " + newNode);
				//newNode.appendChild(cdtrPstlAdr);

				var Nm = newNode.getElementsByTagName("Nm");
				var NodeId = Nm.item(0);
				logger.info("enrichmentCreationRule:NodeId = " + NodeId);

				newNode.insertBefore(cdtrPstlAdr, NodeId.nextSibling);
				var DocumentString = convertDocumentToString(Document);
				logger.trace("Target2Pacs009 EnrichmentCreationRule:Message Body = " + DocumentString); 
				inMsg.setBody(DocumentString);
				setHeader(map, "ACEDB_originalBody", DocumentString);
				logger.trace("message Body = " + DocumentString);
			}
		}	
	}

	//Debtor
	if(PaymentType == "TARGET2PACS.004.001.09") {
		logger.info("Target2Pacs004 EnrichmentCreationRule:Target2Pacs004");
		var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");
		logger.info("Target2Pacs004 EnrichmentCreationRule:dbtrPstlAdr = " + dbtrPstlAdr);

		var dbtrNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Nm';
		var dbtrNm = getValueFromPath(Document, dbtrNmPath);
		logger.info("Target2Pacs004 EnrichmentCreationRule:dbtrNm = " + dbtrNm);

		if(isPatternPresent(Document1, "<Dbtr>")) {
			if(dbtrNm && !dbtrPstlAdr) {
				var dbtr = Document.getElementsByTagName("Dbtr");
				var nextNode = dbtr.item(0);
				logger.info("Target2Pacs004 EnrichmentCreationRule:nextNode = " + nextNode);
				
				dbtrPstlAdr = createElement(Document, "PstlAdr");
				
				var value = "NOTPROVIDED";

				var dbtrAdrLine =  createElementwithTextNode(Document , dbtrPstlAdr, "AdrLine" , value);
				dbtrPstlAdr.appendChild(dbtrAdrLine);
				logger.info("Target2Pacs004 EnrichmentCreationRule:dbtrPstlAdr = " + dbtrPstlAdr);
				//FinInstnId.appendChild(dbtrPstlAdr);
					          
				var Pty = nextNode.getElementsByTagName("Pty");
				logger.info("Target2Pacs004 EnrichmentCreationRule: Pty = " + Pty);
				var newNode = Pty.item(0);
				logger.info("enrichmentCreationRule:newNode = " + newNode);

				var Nm = newNode.getElementsByTagName("Nm");
				var NodeId = Nm.item(0); 
				logger.info("Target2Pacs004 EnrichmentCreationRule:NodeId = " + NodeId);
				//newNode.appendChild(dbtrPstlAdr);

				newNode.insertBefore(dbtrPstlAdr, NodeId.nextSibling);
				var DocumentString = convertDocumentToString(Document);
				logger.trace("Target2Pacs004 EnrichmentCreationRule:Message Body = " + DocumentString);
				inMsg.setBody(DocumentString);
				setHeader(map, "ACEDB_originalBody", DocumentString);
				logger.trace("message Body = " + DocumentString);
			}
		}	
		
		//Creditor
		var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");
		logger.info("Target2Pacs004 EnrichmentCreationRule:CdtrPstlAdr = " + cdtrPstlAdr);

		var cdtrNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Nm';
		var cdtrNm = getValueFromPath(Document, cdtrNmPath);
		logger.info("Target2Pacs004 EnrichmentCreationRule:CdtrNm = " + cdtrNm);

		if(isPatternPresent(Document1, "<Cdtr>")) {
			if(cdtrNm && !cdtrPstlAdr) {
				var cdtr = Document.getElementsByTagName("Cdtr");
				var nextNode = cdtr.item(0);
				logger.info("Target2Pacs004 EnrichmentCreationRule:nextNode = " + nextNode);
				
				cdtrPstlAdr = createElement(Document, "PstlAdr");
				var value = "NOTPROVIDED";

				var cdtrAdrLine =  createElementwithTextNode(Document , cdtrPstlAdr, "AdrLine" , value);
				cdtrPstlAdr.appendChild(cdtrAdrLine);
				logger.info("Target2Pacs004 EnrichmentCreationRule:cdtrPstlAdr = " + cdtrPstlAdr);
				//FinInstnId.appendChild(dbtrPstlAdr);
					          
				var Pty = nextNode.getElementsByTagName("Pty");
				logger.info("enrichmentCreationRule: Pty = " + Pty);
				var newNode = Pty.item(0);
				logger.info("Target2Pacs004 EnrichmentCreationRule:newNode = " + newNode);
				//newNode.appendChild(cdtrPstlAdr);

				var Nm = newNode.getElementsByTagName("Nm");
				var NodeId = Nm.item(0); 
				logger.info("Target2Pacs004 EnrichmentCreationRule:NodeId = " + NodeId);
				//newNode.appendChild(dbtrPstlAdr);

				newNode.insertBefore(cdtrPstlAdr, NodeId.nextSibling);

				var DocumentString = convertDocumentToString(Document);
				logger.trace("Target2Pacs004 EnrichmentCreationRule:Message Body = " + DocumentString); 
				inMsg.setBody(DocumentString);
				setHeader(map, "ACEDB_originalBody", DocumentString);
				logger.trace("message Body = " + DocumentString);
			}
	    }
	}

	if(PaymentType == "TARGET2PACS.004.001.09") {
		logger.info("Target2Pacs004 EnrichmentCreationRule:Target2Pacs004");
		var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");
		logger.info("Target2Pacs004 EnrichmentCreationRule:dbtrPstlAdr = " + dbtrPstlAdr);

		var dbtrNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/Nm';
		var dbtrNm = getValueFromPath(Document, dbtrNmPath);
		logger.info("Target2Pacs004 EnrichmentCreationRule:dbtrNm = " + dbtrNm);

		if(isPatternPresent(Document1, "<Dbtr>")) {
			if(dbtrNm && !dbtrPstlAdr) {
				var dbtr = Document.getElementsByTagName("Dbtr");
				var nextNode = dbtr.item(0);
				logger.info("Target2Pacs004 EnrichmentCreationRule:nextNode = " + nextNode);
				
				dbtrPstlAdr = createElement(Document, "PstlAdr");
				
				var value = "NOTPROVIDED";

				var dbtrAdrLine =  createElementwithTextNode(Document , dbtrPstlAdr, "AdrLine" , value);
				dbtrPstlAdr.appendChild(dbtrAdrLine);
				logger.info("Target2Pacs004 EnrichmentCreationRule:dbtrPstlAdr = " + dbtrPstlAdr);
				//FinInstnId.appendChild(dbtrPstlAdr);
					          
				var FinInstnId = nextNode.getElementsByTagName("FinInstnId");
				logger.info("Target2Pacs004 EnrichmentCreationRule: FinInstnId = " + FinInstnId);
				var newNode = FinInstnId.item(0);
				logger.info("enrichmentCreationRule:newNode = " + newNode);

				var Nm = newNode.getElementsByTagName("Nm");
				var NodeId = Nm.item(0); 
				logger.info("Target2Pacs004 EnrichmentCreationRule:NodeId = " + NodeId);
				//newNode.appendChild(dbtrPstlAdr);

				newNode.insertBefore(dbtrPstlAdr, NodeId.nextSibling);
				var DocumentString = convertDocumentToString(Document);
				logger.trace("Target2Pacs004 EnrichmentCreationRule:Message Body = " + DocumentString);
				inMsg.setBody(DocumentString);
				setHeader(map, "ACEDB_originalBody", DocumentString);
				logger.trace("message Body = " + DocumentString);
			}
		}	
		
		//Creditor
		var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");
		logger.info("Target2Pacs004 EnrichmentCreationRule:CdtrPstlAdr = " + cdtrPstlAdr);

		var cdtrNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/Nm';
		var cdtrNm = getValueFromPath(Document, cdtrNmPath);
		logger.info("Target2Pacs004 EnrichmentCreationRule:CdtrNm = " + cdtrNm);

		if(isPatternPresent(Document1, "<Cdtr>")) {
			if(cdtrNm && !cdtrPstlAdr) {
				var cdtr = Document.getElementsByTagName("Cdtr");
				var nextNode = cdtr.item(0);
				logger.info("Target2Pacs004 EnrichmentCreationRule:nextNode = " + nextNode);
				
				cdtrPstlAdr = createElement(Document, "PstlAdr");
				var value = "NOTPROVIDED";

				var cdtrAdrLine =  createElementwithTextNode(Document , cdtrPstlAdr, "AdrLine" , value);
				cdtrPstlAdr.appendChild(cdtrAdrLine);
				logger.info("Target2Pacs004 EnrichmentCreationRule:cdtrPstlAdr = " + cdtrPstlAdr);
				//FinInstnId.appendChild(dbtrPstlAdr);
					          
				var FinInstnId = nextNode.getElementsByTagName("FinInstnId");
				logger.info("enrichmentCreationRule: FinInstnId = " + FinInstnId);
				var newNode = FinInstnId.item(0);
				logger.info("Target2Pacs004 EnrichmentCreationRule:newNode = " + newNode);
				//newNode.appendChild(cdtrPstlAdr);

				var Nm = newNode.getElementsByTagName("Nm");
				var NodeId = Nm.item(0); 
				logger.info("Target2Pacs004 EnrichmentCreationRule:NodeId = " + NodeId);
				//newNode.appendChild(dbtrPstlAdr);

				newNode.insertBefore(cdtrPstlAdr, NodeId.nextSibling);

				var DocumentString = convertDocumentToString(Document);
				logger.trace("Target2Pacs004 EnrichmentCreationRule:Message Body = " + DocumentString); 
				inMsg.setBody(DocumentString);
				setHeader(map, "ACEDB_originalBody", DocumentString);
				logger.trace("message Body = " + DocumentString);
			}
	    }
	}    	
}

function removeValidationViolations(exchange) {
	var ovCount;
	var fldNo = [];
	var fldViolation = [];
	var k;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	var validationViolations = getHeader(map, "PLCN_validationViolations");
	var txnComments = getHeader(map, "PLCN_txnComments");

	logger.info("removeValidationViolations: validationViolations = " + validationViolations);
	logger.info("removeValidationViolations: txnComments = " + txnComments);

	txnComments = removePattern(txnComments, validationViolations);
	logger.info("removeValidationViolations: txnComments = " + txnComments);

	if(validationViolations) {
		/*ovCount = (validationViolations.match(/:A00:/g)).length;

		logger.info("removeValidationViolations: ovCount = " + ovCount);
		logger.info("removeValidationViolations: validationViolations = " + validationViolations);

		validationViolations = validationViolations + ":A00:";

		for(k = 0; k < ovCount; k++) {
			logger.info("removeValidationViolations: k = " + k);
			var otmp = dataBetweenTokens(":A00:", ":A00:", validationViolations);
			logger.info("removeValidationViolations: otmp = " + otmp);
			fldNo[k] = otmp.substring(0, 2);
			fldViolation[k] = otmp.substring(3, 7);
			validationViolations = removePattern(validationViolations, ":A00:" + otmp);
			txnComments = removePattern(validationViolations, ":A00:" + fldNo[k] + "-" + fldViolation[k]);
			logger.info("removeValidationViolations: txnComments = " + txnComments);
			logger.info("removeValidationViolations: k = " + k);
		}*/

		txnComments = removePattern(txnComments, validationViolations);
		setHeader(map, "PLCN_txnComments", txnComments);
		logger.info("removeValidationViolations: txnComments = " + txnComments);
	}
}

function genericBicCheckLength(value){
	var bic;
	var len;
	logger.trace('genericBicCheckLength: value = ' + value);

		len = value.length;
		logger.trace('genericBicCheckLength: len = ' + len);
		if(len == 8){
			bic = value.concat("XXX");
			logger.trace('genericBicCheckLength: new bic = ' + bic);
			//setHeader(map, "PLCN_validateMessage", true);
		}
		else{
			bic = value;
		}
	return bic;	
}

function enrichBic(exchange){
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class); 

	var msgFamily = getHeader(map, "PLCN_msgFamily");
	logger.info("enrichBic: msgFamily = " + msgFamily);

	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("enrichBic: msgType = " + msgType);

	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.trace("enrichBic: messageBody = " + messageBody);

	if(msgFamily == "target2"){
		var target2BicCheck = memTblGetTableValue(map, "FLAG-TABLE", "T2_BIC_FMT_CHECK_REQ");
		target2BicCheck = target2BicCheck.trim();
		logger.info("enrichBic: target2BicCheck = " + target2BicCheck);
		if(target2BicCheck == "Y"){
			if(msgType == "pacs.004.001.09"){
				mxPacs004BicCheckLength(exchange);
			}else if(msgType == "pacs.008.001.08"){
				mxPacs008BicCheckLength(exchange);
			}
			else if(msgType == "pacs.009.001.08"){
				mxPacs009BicCheckLength(exchange);
			}
		}
	}else if(msgFamily == "cbpr"){
		var cbprBicCheck = memTblGetTableValue(map, "FLAG-TABLE", "CBPR_BIC_FMT_CHECK_REQ");
		cbprBicCheck = cbprBicCheck.trim();
		logger.info("enrichBic: cbprBicCheck = " + cbprBicCheck);
		if(cbprBicCheck == "Y"){
			if(msgType == "pacs.004.001.09"){
				mxPacs004BicCheckLength(exchange);
			}else if(msgType == "pacs.008.001.08"){
				mxPacs008BicCheckLength(exchange);
			}
			if(msgType == "pacs.009.001.08"){
				mxPacs009BicCheckLength(exchange);
			}
			if(msgType == "camt.057.001.06"){
				mxCamt057BicCheckLength(exchange);
			}
		}
	}

	var txnComments = getHeader(map, "PLCN_txnComments");
	logger.info("enrichBic: txnComments = " + txnComments);

	if(isPatternPresent(txnComments, "9185")) {
		setHeader(map, "PLCN_validateMessage", true);
		logger.info("enrichBic: PLCN_validateMessage = true");
	}
}

function mxPacs004BicCheckLength(exchange){
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var bic1;

	logger.info("In mxPacs004BicCheckLength");

	var instgRmbAgtPath = '/Document/PmtRtr/GrpHdr/SttlmInf/InstgRmbrsmntAgt/FinInstnId/BICFI';
	var instgRmbAgt = getValueFromPath(Document, instgRmbAgtPath);

	var instdRmbAgtPath = '/Document/PmtRtr/GrpHdr/SttlmInf/InstdRmbrsmntAgt/FinInstnId/BICFI';
	var instdRmbAgt = getValueFromPath(Document, instdRmbAgtPath);

	var	thrdRmbAgtPath = '/Document/PmtRtr/GrpHdr/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/BICFI';
	var thrdRmbAgt = getValueFromPath(Document, thrdRmbAgtPath);

	var grpInstgAgtPath= '/Document/PmtRtr/GrpHdr/InstgAgt/FinInstnId/BICFI';
	var grpInstgAgt = getValueFromPath(Document, grpInstgAgtPath);

	var grpInstdAgtPath = '/Document/PmtRtr/GrpHdr/InstdAgt/FinInstnId/BICFI';
	var grpInstdAgt = getValueFromPath(Document, grpInstdAgtPath);

	var orgtrAnyBicPath = '/Document/PmtRtr/OrgnlGrpInf/RtrRsnInf/Orgtr/Id/OrgId/AnyBIC';
	var orgtrAnyBic = getValueFromPath(Document, orgtrAnyBicPath);
	
	var chrgsInfPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/BICFI';
	var chrgsInf = getValueFromPath(Document, chrgsInfPath);

	var instgAgtPath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/BICFI';
	var instgAgt = getValueFromPath(Document, instgAgtPath);

	var	instdAgtPath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/BICFI';
	var instdAgt = getValueFromPath(Document, instdAgtPath);

	var rtrChainAnyBicPath = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
	var rtrChainAnyBic = getValueFromPath(Document, rtrChainAnyBicPath);

	var rtrUlDbtrAgtPath = "/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Agt/FinInstnId/BICFI";
	var rtrUlDbtrAgt = getValueFromPath(Document, rtrUlDbtrAgtPath);

	var dbtrAnyBicPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Id/OrgId/AnyBIC';
	var dbtrAnyBic = getValueFromPath(Document, dbtrAnyBicPath);

	var dbtrBicfiPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/BICFI';
	var dbtrBicfi = getValueFromPath(Document, dbtrBicfiPath);

	var initgPtyAnyBicPath = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/Id/OrgId/AnyBIC';
	var initgPtyAnyBic = getValueFromPath(Document, initgPtyAnyBicPath);

	var initgPtyBicfiPath = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Agt/FinInstnId/BICFI';
	var initgPtyBicfi = getValueFromPath(Document, initgPtyBicfiPath);

	var dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/BICFI';
	var dbtrAgt =  getValueFromPath(Document, dbtrAgtPath);

	var prvsInstgAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/BICFI';
	var prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);

	var prvsInstgAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/BICFI';
	var prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
	
	var prvsInstgAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/BICFI';
	var prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);

	var intrmyAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/BICFI';
	var intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);

	var intrmyAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/BICFI';
	var intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);

	var intrmyAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/BICFI';
	var intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);

	var cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/BICFI';
	var cdtrAgt = getValueFromPath(Document, cdtrAgtPath);

	var cdtrAnyBicPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Id/OrgId/AnyBIC';
	var cdtrAnyBic = getValueFromPath(Document, cdtrAnyBicPath);

	var cdtrBicfiPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/BICFI';
	var cdtrBicfi = getValueFromPath(Document, cdtrBicfiPath);

	var ultmtCdtrAnyBicPath = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
	var ultmtCdtrAnyBic =  getValueFromPath(Document, ultmtCdtrAnyBicPath);

	var ultmtCdtr2Path = "/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Agt/FinInstnId/BICFI";
	var ultmtCdtr2 = getValueFromPath(Document, ultmtCdtr2Path);

	var rtrRsnInfAnyBicPath = '/Document/PmtRtr/TxInf/RtrRsnInf/Orgtr/Id/OrgId/AnyBIC';
	var rtrRsnInfAnyBic = getValueFromPath(Document, rtrRsnInfAnyBicPath);

	var cdtrSchIdAnyBicPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrSchmeId/Id/OrgId/AnyBIC';
	var cdtrSchIdAnyBic = getValueFromPath(Document, cdtrSchIdAnyBicPath);

	var instgRmbOrgPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/BICFI';
	var instgRmbOrg = getValueFromPath(Document, instgRmbOrgPath);

	var instdRmbOrgPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/BICFI';
	var instdRmbOrg = getValueFromPath(Document, instdRmbOrgPath);

	var thrdRmbOrgPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/BICFI';
	var thrdRmbOrg = getValueFromPath(Document, thrdRmbOrgPath);

	var orgCdtrSchIdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/MndtRltdInf/AmdmntInfDtls/OrgnlCdtrSchmeId/Id/OrgId/AnyBIC';
	var orgCdtrSchId = getValueFromPath(Document, orgCdtrSchIdPath);

	var orgCdtrAgtPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/MndtRltdInf/AmdmntInfDtls/OrgnlCdtrAgt/FinInstnId/BICFI';
	var orgCdtrAgt = getValueFromPath(Document, orgCdtrAgtPath);

	var orgnlDbtrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/MndtRltdInf/AmdmntInfDtls/OrgnlDbtr/Id/OrgId/AnyBIC';
	var orgnlDbtr = getValueFromPath(Document, orgnlDbtrPath);

	var orgnlDbtrAgtBicfiPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/MndtRltdInf/AmdmntInfDtls/OrgnlDbtrAgt/FinInstnId/BICFI';
	var orgnlDbtrAgtBicfi = getValueFromPath(Document, orgnlDbtrAgtBicfiPath);

	var orgnlInvcrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/Invcr/Id/OrgId/AnyBIC';
	var orgnlInvcr = getValueFromPath(Document, orgnlInvcrPath);

	var orgnlInvceePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/Invcee/Id/OrgId/AnyBIC';
	var orgnlInvcee = getValueFromPath(Document, orgnlInvceePath);

	var orgnlGrnsheePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/AnyBIC';
	var orgnlGrnshee = getValueFromPath(Document, orgnlGrnsheePath);

	var orgnlGrnAdmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/AnyBIC';
	var orgnlGrnAdm = getValueFromPath(Document, orgnlGrnAdmPath);

	var orgnlUltmDbtrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
	var orgnlUltmDbtr = getValueFromPath(Document, orgnlUltmDbtrPath);

	var orgnlUlDbtrAgtPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Agt/FinInstnId/BICFI';
	var orgnlUlDbtrAgt = getValueFromPath(Document, orgnlUlDbtrAgtPath);

	var orgnlDbtrPtyPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
	var orgnlDbtrPty = getValueFromPath(Document, orgnlDbtrPtyPath);

	var orgnlDbtrAgt2Path = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/BICFI';
	var orgnlDbtrAgt2 = getValueFromPath(Document, orgnlDbtrAgt2Path);

	var orgnlDbtr1AgtPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/BICFI';
	var orgnlDbtr1Agt = getValueFromPath(Document, orgnlDbtr1AgtPath);

	var orgnlCdtr1AgtPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/BICFI';
	var orgnlCdtr1Agt = getValueFromPath(Document, orgnlCdtr1AgtPath);

	var orgnlCdtrPty1Path = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/AnyBIC';
	var orgnlCdtrPty1Agt = getValueFromPath(Document, orgnlCdtrPty1Path);

	var orgnlCdtrAgt2Path = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/BICFI';
	var orgnlCdtrAgt2 = getValueFromPath(Document, orgnlCdtrAgt2Path);

	var orgnlUlCdtrPtyPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
	var orgnlUlCdtrPty = getValueFromPath(Document, orgnlUlCdtrPtyPath);

	var orgnlUlCdtrAgt1Path = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Agt/FinInstnId/BICFI';
	var orgnlUlCdtrAgt1 = getValueFromPath(Document, orgnlUlCdtrAgt1Path);

	if(instgRmbAgt){
		bic1=genericBicCheckLength(instgRmbAgt);
		if(instgRmbAgt != bic1) {
			setValueInTxtNode(Document,instgRmbAgtPath,bic1);
			setCommentsForTransaction("153", "9185", map);
		}
	}

	if(instdRmbAgt){
		bic1=genericBicCheckLength(instdRmbAgt);
		if(instdRmbAgt != bic1) {
			setValueInTxtNode(Document,instdRmbAgtPath,bic1);
			setCommentsForTransaction("156", "9185", map);
		}
	}

	if(thrdRmbAgt){
		bic1=genericBicCheckLength(thrdRmbAgt);
		if(thrdRmbAgt != bic1) {
			setValueInTxtNode(Document,thrdRmbAgtPath,bic1);
			setCommentsForTransaction("159", "9185", map);
		}
	}

	if(grpInstgAgt){
		bic1=genericBicCheckLength(grpInstgAgt);
		if(grpInstgAgt != bic1) {
			setValueInTxtNode(Document,grpInstgAgtPath,bic1);
			setCommentsForTransaction("162", "9185", map);
		}
	}

	if(grpInstdAgt){
		bic1=genericBicCheckLength(grpInstdAgt);
		if(grpInstdAgt != bic1) {
			setValueInTxtNode(Document,grpInstdAgtPath,bic1);
			setCommentsForTransaction("163", "9185", map);
		}
	}

	if(orgtrAnyBic){
		bic1=genericBicCheckLength(orgtrAnyBic);
		if(orgtrAnyBic != bic1) {
			setValueInTxtNode(Document,orgtrAnyBicPath,bic1);
			setCommentsForTransaction("00", "9185", map);
		}
	}

	if(chrgsInf){
		bic1=genericBicCheckLength(chrgsInf);
		if(chrgsInf != bic1) {
			setValueInTxtNode(Document,chrgsInfPath,bic1);
			setCommentsForTransaction("201", "9185", map);
		}
	}

	if(instgAgt){
		bic1=genericBicCheckLength(instgAgt);
		if(instgAgt != bic1) {
			setValueInTxtNode(Document,instgAgtPath,bic1);
			setCommentsForTransaction("231", "9185", map);
		}
	}

	if(instdAgt){
		bic1=genericBicCheckLength(instdAgt);
		if(instdAgt != bic1) {
			setValueInTxtNode(Document,instdAgtPath,bic1);
			setCommentsForTransaction("244", "9185", map);
		}
	}

	if(rtrChainAnyBic){
		bic1=genericBicCheckLength(rtrChainAnyBic);
		if(rtrChainAnyBic != bic1) {
			setValueInTxtNode(Document,rtrChainAnyBicPath,bic1);
			setCommentsForTransaction("259", "9185", map);
		}
	}

	if(rtrUlDbtrAgt){
		bic1=genericBicCheckLength(rtrUlDbtrAgt);
		if(rtrUlDbtrAgt != bic1) {
			setValueInTxtNode(Document,rtrUlDbtrAgtPath,bic1);
			setCommentsForTransaction("302", "9185", map);
		}
	}

	if(dbtrAnyBic){
		bic1=genericBicCheckLength(dbtrAnyBic);
		if(dbtrAnyBic != bic1) {
			setValueInTxtNode(Document,dbtrAnyBicPath,bic1);
			setCommentsForTransaction("305", "9185", map);
		}
	}

	if(dbtrBicfi){
		bic1=genericBicCheckLength(dbtrBicfi);
		if(dbtrBicfi != bic1) {
			setValueInTxtNode(Document,dbtrBicfiPath,bic1);
			setCommentsForTransaction("348", "9185", map);
		}
	}

	if(initgPtyAnyBic){
		bic1=genericBicCheckLength(initgPtyAnyBic);
		if(initgPtyAnyBic != bic1) {
			setValueInTxtNode(Document,initgPtyAnyBicPath,bic1);
			setCommentsForTransaction("378", "9185", map);
		}
	}

	if(initgPtyBicfi){
		bic1=genericBicCheckLength(initgPtyBicfi);
		if(initgPtyBicfi != bic1) {
			setValueInTxtNode(Document,initgPtyBicfiPath,bic1);
			setCommentsForTransaction("421", "9185", map);
		}
	}

	if(dbtrAgt){
		bic1=genericBicCheckLength(dbtrAgt);
		if(dbtrAgt != bic1) {
			setValueInTxtNode(Document,dbtrAgtPath,bic1);
			setCommentsForTransaction("422", "9185", map);
		}
	}

	if(prvsInstgAgt1){
		bic1=genericBicCheckLength(prvsInstgAgt1);
		if(prvsInstgAgt1 != bic1) {
			setValueInTxtNode(Document,prvsInstgAgt1Path,bic1);
			setCommentsForTransaction("451", "9185", map);
		}
	}

	if(prvsInstgAgt2){
		bic1=genericBicCheckLength(prvsInstgAgt2);
		if(prvsInstgAgt2 != bic1) {
			setValueInTxtNode(Document,prvsInstgAgt2Path,bic1);
			setCommentsForTransaction("480", "9185", map);
		}
	}

	if(prvsInstgAgt3){
		bic1=genericBicCheckLength(prvsInstgAgt3);
		if(prvsInstgAgt3 != bic1) {
			setValueInTxtNode(Document,prvsInstgAgt3Path,bic1);
			setCommentsForTransaction("509", "9185", map);
		}
	}

	if(intrmyAgt1){
		bic1=genericBicCheckLength(intrmyAgt1);
		if(intrmyAgt1 != bic1) {
			setValueInTxtNode(Document,intrmyAgt1Path,bic1);
			setCommentsForTransaction("538", "9185", map);
		}
	}

	if(intrmyAgt2){
		bic1=genericBicCheckLength(intrmyAgt2);
		if(intrmyAgt2 != bic1) {
			setValueInTxtNode(Document,intrmyAgt2Path,bic1);
			setCommentsForTransaction("567", "9185", map);
		}
	}

	if(intrmyAgt3){
		bic1=genericBicCheckLength(intrmyAgt3);
		if(intrmyAgt3 != bic1) {
			setValueInTxtNode(Document,intrmyAgt3Path,bic1);
			setCommentsForTransaction("596", "9185", map);
		}
	}

	if(cdtrAgt){
		bic1=genericBicCheckLength(cdtrAgt);
		if(cdtrAgt != bic1) {
			setValueInTxtNode(Document,cdtrAgtPath,bic1);
			setCommentsForTransaction("625", "9185", map);
		}
	}

	if(cdtrAnyBic){
		bic1=genericBicCheckLength(cdtrAnyBic);
		if(cdtrAnyBic != bic1) {
			setValueInTxtNode(Document,cdtrAnyBicPath,bic1);
			setCommentsForTransaction("659", "9185", map);
		}
	}

	if(cdtrBicfi){
		bic1=genericBicCheckLength(cdtrBicfi);
		if(cdtrBicfi != bic1) {
			setValueInTxtNode(Document,cdtrBicfiPath,bic1);
			setCommentsForTransaction("702", "9185", map);
		}
	}

	if(ultmtCdtrAnyBic){
		bic1=genericBicCheckLength(ultmtCdtrAnyBic);
		if(ultmtCdtrAnyBic != bic1) {
			setValueInTxtNode(Document,ultmtCdtrAnyBicPath,bic1);
			setCommentsForTransaction("732", "9185", map);
		}
	}

	if(ultmtCdtr2){
		bic1=genericBicCheckLength(ultmtCdtr2);
		if(ultmtCdtr2 != bic1) {
			setValueInTxtNode(Document,ultmtCdtr2Path,bic1);
			setCommentsForTransaction("775", "9185", map);
		}
	}

	if(rtrRsnInfAnyBic){
		bic1=genericBicCheckLength(rtrRsnInfAnyBic);
		if(rtrRsnInfAnyBic != bic1) {
			setValueInTxtNode(Document,rtrRsnInfAnyBicPath,bic1);
			setCommentsForTransaction("778", "9185", map);
		}
	}

	if(cdtrSchIdAnyBic){
		bic1=genericBicCheckLength(cdtrSchIdAnyBic);
		if(cdtrSchIdAnyBic != bic1) {
			setValueInTxtNode(Document,cdtrSchIdAnyBicPath,bic1);
			setCommentsForTransaction("840", "9185", map);
		}
	}

	if(instgRmbOrg){
		bic1=genericBicCheckLength(instgRmbOrg);
		if(instgRmbOrg != bic1) {
			setValueInTxtNode(Document,instgRmbOrgPath,bic1);
			setCommentsForTransaction("944", "9185", map);
		}
	}

	if(instdRmbOrg){
		bic1=genericBicCheckLength(instdRmbOrg);
		if(instdRmbOrg != bic1) {
			setValueInTxtNode(Document,instdRmbOrgPath,bic1);
			setCommentsForTransaction("992", "9185", map);
		}
	}

	if(thrdRmbOrg){
		bic1=genericBicCheckLength(thrdRmbOrg);
		if(thrdRmbOrg != bic1) {
			setValueInTxtNode(Document,thrdRmbOrgPath,bic1);
			setCommentsForTransaction("1040", "9185", map);
		}
	}

	if(orgCdtrSchId){
		bic1=genericBicCheckLength(orgCdtrSchId);
		if(orgCdtrSchId != bic1) {
			setValueInTxtNode(Document,orgCdtrSchIdPath,bic1);
			setCommentsForTransaction("1123", "9185", map);
		}
	}

	if(orgCdtrAgt){
		bic1=genericBicCheckLength(orgCdtrAgt);
		if(orgCdtrAgt != bic1) {
			setValueInTxtNode(Document,orgCdtrAgtPath,bic1);
			setCommentsForTransaction("1201", "9185", map);
		}
	}

	if(orgnlDbtr){
		bic1=genericBicCheckLength(orgnlDbtr);
		if(orgnlDbtr != bic1) {
			setValueInTxtNode(Document,orgnlDbtrPath,bic1);
			setCommentsForTransaction("1296", "9185", map);
		}
	}

	if(orgnlDbtrAgtBicfi){
		bic1=genericBicCheckLength(ognlDbtrAgt);
		if(orgnlDbtrAgtBicfi != bic1) {
			setValueInTxtNode(Document,orgnlDbtrAgtBicfiPath,bic1);
			setCommentsForTransaction("1393", "9185", map);
		}
	}

	if(orgnlInvcr){
		bic1=genericBicCheckLength(orgnlInvcr);
		if(orgnlInvcr != bic1) {
			setValueInTxtNode(Document,orgnlInvcrPath,bic1);
			setCommentsForTransaction("1674", "9185", map);
		}
	}

	if(orgnlInvcee){
		bic1=genericBicCheckLength(orgnlInvcee);
		if(orgnlInvcee != bic1) {
			setValueInTxtNode(Document,orgCdtrSchIdPath,bic1);
			setCommentsForTransaction("1717", "9185", map);
		}
	}

	if(orgnlGrnshee){
		bic1=genericBicCheckLength(orgnlGrnshee);
		if(orgnlGrnshee != bic1) {
			setValueInTxtNode(Document,orgnlGrnsheePath,bic1);
			setCommentsForTransaction("1859", "9185", map);
		}
	}

	if(orgnlGrnAdm){
		bic1=genericBicCheckLength(orgnlGrnAdm);
		if(orgnlGrnAdm != bic1) {
			setValueInTxtNode(Document,orgnlGrnAdmPath,bic1);
			setCommentsForTransaction("1902", "9185", map);
		}
	}

	if(orgnlUltmDbtr){
		bic1=genericBicCheckLength(orgnlUltmDbtr);
		if(orgnlUltmDbtr != bic1) {
			setValueInTxtNode(Document,orgnlUltmDbtrPath,bic1);
			setCommentsForTransaction("1953", "9185", map);
		}
	}

	if(orgnlUlDbtrAgt){
		bic1=genericBicCheckLength(orgnlUlDbtrAgt);
		if(orgnlUlDbtrAgt != bic1) {
			setValueInTxtNode(Document,orgnlUlDbtrAgtPath,bic1);
			setCommentsForTransaction("1996", "9185", map);
		}
	}

	if(orgnlDbtrPty){
		bic1=genericBicCheckLength(orgnlDbtrPty);
		if(orgnlDbtrPty != bic1) {
			setValueInTxtNode(Document,orgnlDbtrPtyPath,bic1);
			setCommentsForTransaction("1998", "9185", map);
		}
	}

	if(orgnlDbtrAgt2){
		bic1=genericBicCheckLength(orgnlDbtrAgt2);
		if(orgnlDbtrAgt2 != bic1) {
			setValueInTxtNode(Document,orgnlDbtrAgt2Path,bic1);
			setCommentsForTransaction("2041", "9185", map);
		}
	}

	if(orgnlDbtr1Agt){
		bic1=genericBicCheckLength(orgnlDbtr1Agt);
		if(orgnlDbtr1Agt != bic1) {
			setValueInTxtNode(Document,orgnlDbtr1AgtPath,bic1);
			setCommentsForTransaction("2094", "9185", map);
		}
	}

	if(orgnlCdtr1Agt){
		bic1=genericBicCheckLength(orgnlCdtr1Agt);
		if(orgnlCdtr1Agt != bic1) {
			setValueInTxtNode(Document,orgnlCdtr1AgtPath,bic1);
			setCommentsForTransaction("2142", "9185", map);
		}
	}

	if(orgnlCdtrPty1Agt){
		bic1=genericBicCheckLength(orgnlCdtrPty1Agt);
		if(orgnlCdtrPty1Agt != bic1) {
			setValueInTxtNode(Document,orgnlCdtrPty1AgtPath,bic1);
			setCommentsForTransaction("2195", "9185", map);
		}
	}

	if(orgnlCdtrAgt2){
		bic1=genericBicCheckLength(orgnlCdtrAgt2);
		if(orgnlCdtrAgt2 != bic1) {
			setValueInTxtNode(Document,orgnlCdtrAgt2Path,bic1);
			setCommentsForTransaction("2238", "9185", map);
		}
	}

	if(orgnlUlCdtrPty){
		bic1=genericBicCheckLength(orgnlUlCdtrPty);
		if(orgnlUlCdtrPty != bic1) {
			setValueInTxtNode(Document,orgnlUlCdtrPtyPath,bic1);
			setCommentsForTransaction("2292", "9185", map);
		}
	}

	if(orgnlUlCdtrAgt1){
		bic1=genericBicCheckLength(orgnlUlCdtrAgt1);
		if(orgnlUlCdtrAgt1 != bic1) {
			setValueInTxtNode(Document,orgnlUlCdtrAgt1Path,bic1);
			setCommentsForTransaction("2335", "9185", map);
		}
	}

	var DocumentString = convertDocumentToString(Document);
	logger.trace("mxPacs004BicCheckLength: DocumentString = " + DocumentString);
	inMsg.setBody(DocumentString);
	setHeader(map, "ACEDB_originalBody", DocumentString);
	logger.trace("message Body = " + DocumentString);
}

function mxPacs008BicCheckLength(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var bic1;

	logger.info("In mxPacs008BicCheckLength");

	logger.info("mxPacs008BicCheckLength: typeof Document = " + typeof Document);

	var instgRmbAgtPath = '/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/InstgRmbrsmntAgt/FinInstnId/BICFI';
	var instgRmbAgt = getValueFromPath(Document, instgRmbAgtPath);

	var instdRmbAgtPath = '/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/InstdRmbrsmntAgt/FinInstnId/BICFI';
	var instdRmbAgt = getValueFromPath(Document, instdRmbAgtPath);

	var thrdRmbAgtPath = '/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/BICFI';
	var thrdRmbAgt = getValueFromPath(Document, thrdRmbAgtPath);

	var grpInstgPath = '/Document/FIToFICstmrCdtTrf/GrpHdr/InstgAgt/FinInstnId/BICFI';
	var grpInstg = getValueFromPath(Document, grpInstgPath);

	var grpInstdPath = '/Document/FIToFICstmrCdtTrf/GrpHdr/InstdAgt/FinInstnId/BICFI';
	var grpInstd = getValueFromPath(Document, grpInstdPath);
	
	var chrgsInfBicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/BICFI';
	var chrgsInfBicfi = getValueFromPath(Document, chrgsInfBicfiPath);

	var prvsInstgAgt1BicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/BICFI';
	var prvsInstgAgt1Bicfi= getValueFromPath(Document, prvsInstgAgt1BicfiPath);

	var prvsInstgAgt2BicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/BICFI';
	var prvsInstgAgt2Bicfi = getValueFromPath(Document, prvsInstgAgt2BicfiPath);

	var prvsInstgAgt3BicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/BICFI';
	var prvsInstgAgt3Bicfi = getValueFromPath(Document, prvsInstgAgt3BicfiPath);

	var instgAgtBicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI';
	logger.info("mxPacs008BicCheckLength: instgAgtBicfiPath = " + instgAgtBicfiPath);

	var instgAgtBicfi = getValueFromPath(Document, instgAgtBicfiPath);
	logger.info("mxPacs008BicCheckLength: instgAgtBicfi = " + instgAgtBicfi);

	var instdAgtBicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI';
	var instdAgtBicfi = getValueFromPath(Document, instdAgtBicfiPath);

	var intrmyAgt1BicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/BICFI';
	var intrmyAgt1Bicfi = getValueFromPath(Document, intrmyAgt1BicfiPath);

	var intrmyAgt2BicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/BICFI';
	var intrmyAgt2Bicfi = getValueFromPath(Document, intrmyAgt2BicfiPath);

	var intrmyAgt3BicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/BICFI';
	var intrmyAgt3Bicfi = getValueFromPath(Document, intrmyAgt3BicfiPath);

	var ultmtDbtrAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Id/OrgId/AnyBIC';
	var ultmtDbtrAnyBic = getValueFromPath(Document, ultmtDbtrAnyBicPath);

	var initgPtyAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/Id/OrgId/AnyBIC';
	var initgPtyAnyBic = getValueFromPath(Document, initgPtyAnyBicPath);

	var dbtrAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Id/OrgId/AnyBIC';
	var dbtrAnyBic = getValueFromPath(Document, dbtrAnyBicPath);

	var dbtrAgtBicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI';
	var dbtrAgtBicfi = getValueFromPath(Document, dbtrAgtBicfiPath);

	var cdtrAgtBicfiPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
	var cdtrAgtBicfi = getValueFromPath(Document, cdtrAgtBicfiPath);

	var cdtrAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Id/OrgId/AnyBIC';
	var cdtrAnyBic = getValueFromPath(Document, cdtrAnyBicPath);

	var ultmtCdtrAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Id/OrgId/AnyBIC';
	var ultmtCdtrAnyBic = getValueFromPath(Document, ultmtCdtrAnyBicPath);

	var rmtInfInvcrAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Id/OrgId/AnyBIC';
	var rmtInfInvcrAnyBic = getValueFromPath(Document, rmtInfInvcrAnyBicPath);

	var rmtInfInvceeAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Id/OrgId/AnyBIC';
	var rmtInfInvceeAnyBic = getValueFromPath(Document, rmtInfInvceeAnyBicPath);

	var rmtInfGrnsheeAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/AnyBIC';
	var rmtInfGrnsheeAnyBic = getValueFromPath(Document, rmtInfGrnsheeAnyBicPath);

	var rmtInfGrnshmtAdmstrAnyBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/AnyBIC';
	var rmtInfGrnshmtAdmstrAnyBic = getValueFromPath(Document, rmtInfGrnshmtAdmstrAnyBicPath);

	if(instgRmbAgt){
		bic1=genericBicCheckLength(instgRmbAgt);
		if(instgRmbAgt != bic1) {
			setValueInTxtNode(Document,instgRmbAgtPath,bic1);
			setCommentsForTransaction("150", "9185", map);
		}
	}

	if(instdRmbAgt){
		bic1=genericBicCheckLength(instdRmbAgt);
		if(instdRmbAgt != bic1) {
			setValueInTxtNode(Document,instdRmbAgtPath,bic1);
			setCommentsForTransaction("198", "9185", map);
		}
	}

	if(thrdRmbAgt){
		bic1=genericBicCheckLength(thrdRmbAgt);
		if(thrdRmbAgt != bic1) {
			setValueInTxtNode(Document,thrdRmbAgtPath,bic1);
			setCommentsForTransaction("246", "9185", map);
		}
	}

	if(grpInstg){
		bic1=genericBicCheckLength(grpInstg);
		if(grpInstg != bic1) {
			setValueInTxtNode(Document,grpInstgPath,bic1);
			setCommentsForTransaction("295", "9185", map);
		}
	}

	if(grpInstd){
		bic1=genericBicCheckLength(grpInstd);
		if(grpInstd != bic1) {
			setValueInTxtNode(Document,grpInstdPath,bic1);
			setCommentsForTransaction("296", "9185", map);
		}
	}

	if(chrgsInfBicfi){
		bic1=genericBicCheckLength(chrgsInfBicfi);
		if(chrgsInfBicfi != bic1) {
			setValueInTxtNode(Document,chrgsInfBicfiPath,bic1);
			setCommentsForTransaction("347", "9185", map);
		}
	}

	if(prvsInstgAgt1Bicfi){
		bic1=genericBicCheckLength(prvsInstgAgt1Bicfi);
		if(prvsInstgAgt1Bicfi != bic1) {
			setValueInTxtNode(Document,prvsInstgAgt1BicfiPath,bic1);
			setCommentsForTransaction("379", "9185", map);
		}
	}

	if(prvsInstgAgt2Bicfi){
		bic1=genericBicCheckLength(prvsInstgAgt2Bicfi);
		if(prvsInstgAgt2Bicfi != bic1) {
			setValueInTxtNode(Document,prvsInstgAgt2BicfiPath,bic1);
			setCommentsForTransaction("427", "9185", map);
		}
	}

	if(prvsInstgAgt3Bicfi){
		bic1=genericBicCheckLength(prvsInstgAgt3Bicfi);
		if(prvsInstgAgt3Bicfi != bic1) {
			setValueInTxtNode(Document,prvsInstgAgt3BicfiPath,bic1);
			setCommentsForTransaction("475", "9185", map);
		}
	}

	if(instgAgtBicfi){
		bic1=genericBicCheckLength(instgAgtBicfi);
		if(instgAgtBicfi != bic1) {
			setValueInTxtNode(Document,instgAgtBicfiPath,bic1);
			setCommentsForTransaction("523", "9185", map);
		}
	}

	if(instdAgtBicfi){
		bic1=genericBicCheckLength(instdAgtBicfi);
		if(instdAgtBicfi != bic1) {
		setValueInTxtNode(Document,instdAgtBicfiPath,bic1);
		setCommentsForTransaction("536", "9185", map);
		}
	}

	if(intrmyAgt1Bicfi){
		bic1=genericBicCheckLength(intrmyAgt1Bicfi);
		if(intrmyAgt1Bicfi != bic1) {
		setValueInTxtNode(Document,intrmyAgt1BicfiPath,bic1);
		setCommentsForTransaction("549", "9185", map);
		}
	}

	if(intrmyAgt2Bicfi){
		bic1=genericBicCheckLength(intrmyAgt2Bicfi);
		if(intrmyAgt2Bicfi != bic1) {
		setValueInTxtNode(Document,intrmyAgt2BicfiPath,bic1);
		setCommentsForTransaction("597", "9185", map);
		}
	}

	if(intrmyAgt3Bicfi){
		bic1=genericBicCheckLength(intrmyAgt3Bicfi);
		if(intrmyAgt3Bicfi != bic1) {
		setValueInTxtNode(Document,intrmyAgt3BicfiPath,bic1);
		setCommentsForTransaction("645", "9185", map);
		}
	}

	if(ultmtDbtrAnyBic){
		bic1=genericBicCheckLength(ultmtDbtrAnyBic);
		if(ultmtDbtrAnyBic != bic1) {
		setValueInTxtNode(Document,ultmtDbtrAnyBicPath,bic1);
		setCommentsForTransaction("693", "9185", map);
		}
	}

	if(initgPtyAnyBic){
		bic1=genericBicCheckLength(initgPtyAnyBic);
		if(initgPtyAnyBic != bic1) {
		setValueInTxtNode(Document,initgPtyAnyBicPath,bic1);
		setCommentsForTransaction("736", "9185", map);
		}
	}

	if(dbtrAnyBic){
		bic1=genericBicCheckLength(dbtrAnyBic);
		if(dbtrAnyBic != bic1) {
		setValueInTxtNode(Document,dbtrAnyBicPath,bic1);
		setCommentsForTransaction("779", "9185", map);
		}
	}

	if(dbtrAgtBicfi){
		bic1=genericBicCheckLength(dbtrAgtBicfi);
		if(dbtrAgtBicfi != bic1) {
		setValueInTxtNode(Document,dbtrAgtBicfiPath,bic1);
		setCommentsForTransaction("841", "9185", map);
		}
	}

	if(cdtrAgtBicfi){
		bic1=genericBicCheckLength(cdtrAgtBicfi);
		if(cdtrAgtBicfi != bic1) {
		setValueInTxtNode(Document,cdtrAgtBicfiPath,bic1);
		setCommentsForTransaction("889", "9185", map);
		}
	}

	if(cdtrAnyBic){
		bic1=genericBicCheckLength(cdtrAnyBic);
		if(cdtrAnyBic != bic1) {
		setValueInTxtNode(Document,cdtrAnyBicPath,bic1);
		setCommentsForTransaction("945", "9185", map);
		}
	}

	if(ultmtCdtrAnyBic){
		bic1=genericBicCheckLength(ultmtCdtrAnyBic);
		if(ultmtCdtrAnyBic != bic1) {
		setValueInTxtNode(Document,ultmtCdtrAnyBicPath,bic1);
		setCommentsForTransaction("1007", "9185", map);
		}
	}

	if(rmtInfInvcrAnyBic){
		bic1=genericBicCheckLength(rmtInfInvcrAnyBic);
		if(rmtInfInvcrAnyBic != bic1) {
		setValueInTxtNode(Document,rmtInfInvcrAnyBicPath,bic1);
		setCommentsForTransaction("1214", "9185", map);
		}
	}

	if(rmtInfInvceeAnyBic){
		bic1=genericBicCheckLength(rmtInfInvceeAnyBic);
		if(rmtInfInvceeAnyBic != bic1) {
		setValueInTxtNode(Document,rmtInfInvceeAnyBicPath,bic1);
		setCommentsForTransaction("1257", "9185", map);
		}
	}

	if(rmtInfGrnsheeAnyBic){
		bic1=genericBicCheckLength(rmtInfGrnsheeAnyBic);
		if(rmtInfGrnsheeAnyBic != bic1) {
		setValueInTxtNode(Document,rmtInfGrnsheeAnyBicPath,bic1);
		setCommentsForTransaction("1399", "9185", map);
		}
	}

	if(rmtInfGrnshmtAdmstrAnyBic){
		bic1=genericBicCheckLength(rmtInfGrnshmtAdmstrAnyBic);
		if(rmtInfGrnshmtAdmstrAnyBic != bic1) {
		setValueInTxtNode(Document,rmtInfGrnshmtAdmstrAnyBicPath,bic1);
		setCommentsForTransaction("1442", "9185", map);
		}
	}

	var DocumentString = convertDocumentToString(Document);
	logger.trace("mxPacs008BicCheckLength: DocumentString = " + DocumentString);
	inMsg.setBody(DocumentString);
	setHeader(map, "ACEDB_originalBody", DocumentString);
}

function mxPacs009BicCheckLength(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var bic1;

	logger.info("In mxPacs009BicCheckLength");

	var instgRmbAgtBicfiPath = "/Document/FICdtTrf/GrpHdr/SttlmInf/InstgRmbrsmntAgt/FinInstnId/BICFI";
	var instgRmbAgtBicfi = getValueFromPath(Document, instgRmbAgtBicfiPath);

	var instdRmbAgtBicfiPath = "/Document/FICdtTrf/GrpHdr/SttlmInf/InstdRmbrsmntAgt/FinInstnId/BICFI";
	var instdRmbAgtBicfi = getValueFromPath(Document, instdRmbAgtBicfiPath);

	var thrdRmbAgtBicfiPath = "/Document/FICdtTrf/GrpHdr/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/BICFI";
	var thrdRmbAgtBicfi = getValueFromPath(Document, thrdRmbAgtBicfiPath);

	var grpInstgAgtBicfiPath = "/Document/FICdtTrf/GrpHdr/InstgAgt/FinInstnId/BICFI";
	var grpInstgAgtBicfi = getValueFromPath(Document, grpInstgAgtBicfiPath);

	var grpInstdAgtBicfiPath = "/Document/FICdtTrf/GrpHdr/InstdAgt/FinInstnId/BICFI";
	var grpInstdAgtBicfi = getValueFromPath(Document, grpInstdAgtBicfiPath);

	var prvsInstgAgt1BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/BICFI';
	var prvsInstgAgt1Bicfi = getValueFromPath(Document, prvsInstgAgt1BicfiPath);
	
	var prvsInstgAgt2BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/BICFI';
	var prvsInstgAgt2Bicfi = getValueFromPath(Document, prvsInstgAgt2BicfiPath);
	
	var prvsInstgAgt3BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/BICFI';
	var prvsInstgAgt3Bicfi = getValueFromPath(Document, prvsInstgAgt3BicfiPath);
	
	var instgAgtBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI';
	var instgAgtBicfi = getValueFromPath(Document, instgAgtBicfiPath);

	var instdAgtBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI';
	var instdAgtBicfi = getValueFromPath(Document, instdAgtBicfiPath);

	var intrmyAgt1BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/BICFI';
	var intrmyAgt1Bicfi = getValueFromPath(Document, intrmyAgt1BicfiPath);

	var intrmyAgt2BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/BICFI';
	var intrmyAgt2Bicfi = getValueFromPath(Document, intrmyAgt2BicfiPath);

	var intrmyAgt3BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/BICFI';
	var intrmyAgt3Bicfi = getValueFromPath(Document, intrmyAgt3BicfiPath);

	var ultmtDbtrBicfiPath = "/Document/FICdtTrf/CdtTrfTxInf/UltmtDbtr/FinInstnId/BICFI";
	var ultmtDbtrBicfi = getValueFromPath(Document, ultmtDbtrBicfiPath);

	var dbtrBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/BICFI';
	var dbtrBicfi = getValueFromPath(Document, dbtrBicfiPath);

	var dbtrAgtBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI';
	var dbtrAgtBicfi = getValueFromPath(Document, dbtrAgtBicfiPath);

	var cdtrAgtBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
	var cdtrAgtBicfi = getValueFromPath(Document, cdtrAgtBicfiPath);

	var cdtrBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/BICFI';
	var cdtrBicfi = getValueFromPath(Document, cdtrBicfiPath);

	var ultmtCdtrBicfiPath = "/Document/FICdtTrf/CdtTrfTxInf/UltmtCdtr/FinInstnId/BICFI";
	var ultmtCdtrBicfi = getValueFromPath(Document, ultmtCdtrBicfiPath);

	//Field Value Consider From "pacs.009.001.08.COV_UserFriendly_scripts"
	var ultmtDbtrAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/Id/OrgId/AnyBIC';
	var ultmtDbtrAnyBic = getValueFromPath(Document, ultmtDbtrAnyBicPath);

	var initgPtyAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/Id/OrgId/AnyBIC';
	var initgPtyAnyBic = getValueFromPath(Document, initgPtyAnyBicPath);

	var dbtrAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Id/OrgId/AnyBIC';
	var dbtrAnyBic = getValueFromPath(Document, dbtrAnyBicPath);

	var undrDbtrAgtBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/BICFI';
	var undrDbtrAgtBicfi = getValueFromPath(Document,undrDbtrAgtBicfiPath);

	var undrPrvsInstgAgt1BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/BICFI';
	var undrPrvsInstgAgt1Bicfi = getValueFromPath(Document,undrPrvsInstgAgt1BicfiPath);

	var undrPrvsInstgAgt2BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/BICFI';
	var undrPrvsInstgAgt2Bicfi = getValueFromPath(Document,undrPrvsInstgAgt2BicfiPath);

	var undrPrvsInstgAgt3BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/BICFI';
	var undrPrvsInstgAgt3Bicfi = getValueFromPath(Document,undrPrvsInstgAgt3BicfiPath);

	var undrIntrmyAgt1BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/BICFI';
	var undrIntrmyAgt1Bicfi = getValueFromPath(Document,undrIntrmyAgt1BicfiPath);

	var undrIntrmyAgt2BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/BICFI';
	var undrIntrmyAgt2Bicfi = getValueFromPath(Document,undrIntrmyAgt2BicfiPath);

	var undrIntrmyAgt3BicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/BICFI';
	var undrIntrmyAgt3Bicfi = getValueFromPath(Document,undrIntrmyAgt3BicfiPath);

	var undrCdtrAgtBicfiPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/BICFI';
	var undrCdtrAgtBicfi = getValueFromPath(Document,undrCdtrAgtBicfiPath);

	var undrCdtrAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/Id/OrgId/AnyBIC';
	var undrCdtrAnyBic = getValueFromPath(Document, undrCdtrAnyBicPath);

	var undrUltmtCdtrAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/Id/OrgId/AnyBIC';
	var undrUltmtCdtrAnyBic = getValueFromPath(Document, undrUltmtCdtrAnyBicPath);

	var undrInvcrAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcr/Id/OrgId/AnyBIC';
	var undrInvcrAnyBic = getValueFromPath(Document, undrInvcrAnyBicPath);

	var undrInvceeAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcee/Id/OrgId/AnyBIC';
	var undrInvceeAnyBic = getValueFromPath(Document, undrInvceeAnyBicPath);

	var undrGrnsheeAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/AnyBIC';
	var undrGrnsheeAnyBic = getValueFromPath(Document, undrGrnsheeAnyBicPath);

	var undrGrnshmtAdmstrAnyBicPath= '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/AnyBIC';
	var undrGrnshmtAdmstrAnyBic = getValueFromPath(Document, undrGrnshmtAdmstrAnyBicPath);

	if(instgRmbAgtBicfi){
		bic1=genericBicCheckLength(instgRmbAgtBicfi);
		if(instgRmbAgtBicfi != bic1) {
			setValueInPath(Document1,instgRmbAgtBicfiPath,bic1);
			setCommentsForTransaction("150", "9185", map);
		}
	}

	if(instdRmbAgtBicfi){
		bic1=genericBicCheckLength(instdRmbAgtBicfi);
		if(instdRmbAgtBicfi != bic1) {
			setValueInPath(Document1, instdRmbAgtBicfiPath, bic1);
			setCommentsForTransaction("152", "9185", map);
		}
	}

	if(thrdRmbAgtBicfi){
		bic1=genericBicCheckLength(thrdRmbAgtBicfi);
		if(thrdRmbAgtBicfi != bic1) {
			setValueInPath(Document1,thrdRmbAgtBicfiPath,bic1);
			setCommentsForTransaction("154", "9185", map);
		}
	}

	if(grpInstgAgtBicfi){
		bic1=genericBicCheckLength(grpInstgAgtBicfi);
		if(grpInstgAgtBicfi != bic1) {
			setValueInPath(Document1,grpInstgAgtBicfiPath,bic1);
			setCommentsForTransaction("157", "9185", map);
		}
	}

	if(grpInstdAgtBicfi){
		bic1=genericBicCheckLength(grpInstdAgtBicfi);
		if(grpInstdAgtBicfi != bic1) {
			setValueInPath(Document1,grpInstdAgtBicfiPath,bic1);
			setCommentsForTransaction("158", "9185", map);
		}
	}

	if(prvsInstgAgt1Bicfi){
		bic1=genericBicCheckLength(prvsInstgAgt1Bicfi);
		if(prvsInstgAgt1Bicfi != bic1) {
			setValueInPath(Document1,prvsInstgAgt1BicfiPath,bic1);
			setCommentsForTransaction("199", "9185", map);
		}

	}
	
	if(prvsInstgAgt2Bicfi){
		bic1=genericBicCheckLength(prvsInstgAgt2Bicfi);
		if(prvsInstgAgt2Bicfi != bic1) {
			setValueInPath(Document1,prvsInstgAgt2BicfiPath,bic1);
			setCommentsForTransaction("247", "9185", map);
		}
	}
	
	if(prvsInstgAgt3Bicfi){
		bic1=genericBicCheckLength(prvsInstgAgt3Bicfi);
		if(prvsInstgAgt3Bicfi != bic1) {
			setValueInPath(Document1,prvsInstgAgt3BicfiPath,bic1);
			setCommentsForTransaction("295", "9185", map);
		}
	}
	
	if(instgAgtBicfi){
		bic1=genericBicCheckLength(instgAgtBicfi);
		if(instgAgtBicfi != bic1) {
			setValueInPath(Document1,instgAgtBicfiPath,bic1);
			setCommentsForTransaction("343", "9185", map);
		}
	}

	if(instdAgtBicfi){
		bic1=genericBicCheckLength(instdAgtBicfi);
		if(instdAgtBicfi != bic1) {
			setValueInPath(Document1,instdAgtBicfiPath,bic1);
			setCommentsForTransaction("356", "9185", map);
		}
	}

	if(intrmyAgt1Bicfi){
		bic1=genericBicCheckLength(intrmyAgt1Bicfi);
		if(intrmyAgt1Bicfi != bic1) {
			setValueInPath(Document1,intrmyAgt1BicfiPath,bic1);
			setCommentsForTransaction("369", "9185", map);
		}
	}

	if(intrmyAgt2Bicfi){
		bic1=genericBicCheckLength(intrmyAgt2Bicfi);
		if(intrmyAgt2Bicfi != bic1) {
			setValueInPath(Document1,intrmyAgt2BicfiPath,bic1);
			setCommentsForTransaction("417", "9185", map);
		}
	}

	if(intrmyAgt3Bicfi){
		bic1=genericBicCheckLength(intrmyAgt3Bicfi);
		if(intrmyAgt3Bicfi != bic1) {
			setValueInPath(Document1,intrmyAgt3BicfiPath,bic1);
			setCommentsForTransaction("465", "9185", map);
		}
	}

	if(ultmtDbtrBicfi){
		bic1=genericBicCheckLength(ultmtDbtrBicfi);
		if(ultmtDbtrBicfi != bic1) {
			setValueInPath(Document1,ultmtDbtrBicfiPath,bic1);
			setCommentsForTransaction("513", "9185", map);
		}
	}

	if(dbtrBicfi){
		bic1=genericBicCheckLength(dbtrBicfi);
		if(dbtrBicfi != bic1) {
			setValueInPath(Document1,dbtrBicfiPath,bic1);
			setCommentsForTransaction("514", "9185", map);
		}
	}

	if(dbtrAgtBicfi){
		bic1=genericBicCheckLength(dbtrAgtBicfi);
		if(dbtrAgtBicfi != bic1) {
			setValueInPath(Document1,dbtrAgtBicfiPath,bic1);
			setCommentsForTransaction("562", "9185", map);
		}
	}

	if(cdtrAgtBicfi){
		bic1=genericBicCheckLength(cdtrAgtBicfi);
		if(cdtrAgtBicfi != bic1) {
			setValueInPath(Document1,cdtrAgtBicfiPath,bic1);
			setCommentsForTransaction("610", "9185", map);
		}
	}

	if(cdtrBicfi){
		bic1=genericBicCheckLength(cdtrBicfi);
		if(cdtrBicfi != bic1) {
			setValueInPath(Document1,cdtrBicfiPath,bic1);
			setCommentsForTransaction("658", "9185", map);
		}
	}

	if(ultmtCdtrBicfi){
		bic1=genericBicCheckLength(ultmtCdtrBicfi);
		if(ultmtCdtrBicfi != bic1) {
			setValueInPath(Document1,ultmtCdtrBicfiPath,bic1);
			setCommentsForTransaction("706", "9185", map);
		}
	}

	//Field Value Consider From "pacs.009.001.08.COV_UserFriendly_scripts"
	if(ultmtDbtrAnyBic){
		bic1=genericBicCheckLength(ultmtDbtrAnyBic);
		if(ultmtDbtrAnyBic != bic1) {
			setValueInPath(Document1,ultmtDbtrAnyBicPath,bic1);
			setCommentsForTransaction("723", "9185", map);
		}
	}

	if(initgPtyAnyBic){
		bic1=genericBicCheckLength(initgPtyAnyBic);
		if(initgPtyAnyBic != bic1) {
			setValueInPath(Document1,initgPtyAnyBicPath,bic1);
			setCommentsForTransaction("766", "9185", map);
		}
	}

	if(dbtrAnyBic){
		bic1=genericBicCheckLength(dbtrAnyBic);
		if(dbtrAnyBic != bic1) {
			setValueInPath(Document1,dbtrAnyBicPath,bic1);
			setCommentsForTransaction("809", "9185", map);
		}
	}

	if(undrDbtrAgtBicfi){
		bic1=genericBicCheckLength(undrDbtrAgtBicfi);
		if(undrDbtrAgtBicfi != bic1) {
			setValueInPath(Document1,undrDbtrAgtBicfiPath,bic1);
			setCommentsForTransaction("871", "9185", map);
		}
	}

	if(undrPrvsInstgAgt1Bicfi){
		bic1=genericBicCheckLength(undrPrvsInstgAgt1Bicfi);
		if(undrPrvsInstgAgt1Bicfi != bic1) {
			setValueInPath(Document1,undrPrvsInstgAgt1BicfiPath,bic1);
			setCommentsForTransaction("919", "9185", map);
		}
	}

	if(undrPrvsInstgAgt2Bicfi){
		bic1=genericBicCheckLength(undrPrvsInstgAgt2Bicfi);
		if(undrPrvsInstgAgt2Bicfi != bic1) {
			setValueInPath(Document1,undrPrvsInstgAgt2BicfiPath,bic1);
			setCommentsForTransaction("967", "9185", map);
		}
	}

	if(undrPrvsInstgAgt3Bicfi){
		bic1=genericBicCheckLength(undrPrvsInstgAgt3Bicfi);
		if(undrPrvsInstgAgt3Bicfi != bic1) {
			setValueInPath(Document1,undrPrvsInstgAgt3BicfiPath,bic1);
			setCommentsForTransaction("1015", "9185", map);
		}
	}

	if(undrIntrmyAgt1Bicfi){
		bic1=genericBicCheckLength(undrIntrmyAgt1Bicfi);
		if(undrIntrmyAgt1Bicfi != bic1) {
			setValueInPath(Document1,undrIntrmyAgt1BicfiPath,bic1);
			setCommentsForTransaction("1063", "9185", map);
		}
	}

	if(undrIntrmyAgt2Bicfi){
		bic1=genericBicCheckLength(undrIntrmyAgt2Bicfi);
		if(undrIntrmyAgt2Bicfi != bic1) {
			setValueInPath(Document1,undrIntrmyAgt2BicfiPath,bic1);
			setCommentsForTransaction("1111", "9185", map);
		}
	}

	if(undrIntrmyAgt3Bicfi){
		bic1=genericBicCheckLength(undrIntrmyAgt3Bicfi);
		if(undrIntrmyAgt3Bicfi != bic1) {
			setValueInPath(Document1,undrIntrmyAgt3BicfiPath,bic1);
			setCommentsForTransaction("1159", "9185", map);
		}
	}

	if(undrCdtrAgtBicfi){
		bic1=genericBicCheckLength(undrCdtrAgtBicfi);
		if(undrCdtrAgtBicfi != bic1) {
			setValueInPath(Document1,undrCdtrAgtBicfiPath,bic1);
			setCommentsForTransaction("1207", "9185", map);
		}
	}

	if(undrCdtrAnyBic){
		bic1=genericBicCheckLength(undrCdtrAnyBic);
		if(undrCdtrAnyBic != bic1) {
			setValueInPath(Document1,undrCdtrAnyBicPath,bic1);
			setCommentsForTransaction("1263", "9185", map);
		}
	}

	if(undrUltmtCdtrAnyBic){
		bic1=genericBicCheckLength(undrUltmtCdtrAnyBic);
		if(undrUltmtCdtrAnyBic != bic1) {
			setValueInPath(Document1,undrUltmtCdtrAnyBicPath,bic1);
			setCommentsForTransaction("1325", "9185", map);
		}
	}

	if(undrInvcrAnyBic){
		bic1=genericBicCheckLength(undrInvcrAnyBic);
		if(undrInvcrAnyBic != bic1) {
			setValueInPath(Document1,undrInvcrAnyBicPath,bic1);
			setCommentsForTransaction("1479", "9185", map);
		}
	}

	if(undrInvceeAnyBic){
		bic1=genericBicCheckLength(undrInvceeAnyBic);
		if(undrInvceeAnyBic != bic1) {
			setValueInPath(Document1,undrInvceeAnyBicPath,bic1);
			setCommentsForTransaction("1522", "9185", map);
		}
	}

	if(undrGrnsheeAnyBic){
		bic1=genericBicCheckLength(undrGrnsheeAnyBic);
		if(undrGrnsheeAnyBic != bic1) {
			setValueInPath(Document1,undrGrnsheeAnyBicPath,bic1);
			setCommentsForTransaction("1664", "9185", map);
		}
	}

	if(undrGrnshmtAdmstrAnyBic){
		bic1=genericBicCheckLength(undrGrnshmtAdmstrAnyBic);
		if(undrGrnshmtAdmstrAnyBic != bic1) {
			setValueInPath(Document1,undrGrnshmtAdmstrAnyBicPath,bic1);
			setCommentsForTransaction("1707", "9185", map);
		}
	}

	var DocumentString = convertDocumentToString(Document1);
	logger.trace("mxPacs009BicCheckLength: DocumentString = " + DocumentString);
	inMsg.setBody(DocumentString);
	setHeader(map, "ACEDB_originalBody", DocumentString);
}

function mxCamt057BicCheckLength(exchange){
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var bic1;

	logger.info("In mxCamt057BicCheckLength");
	
	var msgSndrAnyBicPath = '/Document/NtfctnToRcv/GrpHdr/MsgSndr/Pty/Id/OrgId/AnyBIC';
	var msgSndrAnyBic = getValueFromPath(Document, msgSndrAnyBicPath);

	var msgSndrBicfiPath = "/Document/NtfctnToRcv/GrpHdr/MsgSndr/Agt/FinInstnId/BICFI";
	var msgSndrBicfi = getValueFromPath(Document, msgSndrBicfiPath);

	var acctOwnrAnyBicPath = "/Document/NtfctnToRcv/Ntfctn/AcctOwnr/Pty/Id/OrgId/AnyBIC";
	var acctOwnrAnyBic = getValueFromPath(Document, acctOwnrAnyBicPath);

	var acctOwnrPath = "/Document/NtfctnToRcv/Ntfctn/AcctOwnr/Agt/FinInstnId/BICFI";
	var acctOwnr = getValueFromPath(Document, acctOwnrPath);

	var acctSvcrPath = "/Document/NtfctnToRcv/Ntfctn/AcctSvcr/FinInstnId/BICFI";
	var acctSvcr = getValueFromPath(Document, acctSvcrPath);

	var dbtrAnyBicPath = "/Document/NtfctnToRcv/Ntfctn/Dbtr/Pty/Id/OrgId/AnyBIC";
	var dbtrAnyBic = getValueFromPath(Document, dbtrAnyBicPath);

	var dbtrAgt1Path = "/Document/NtfctnToRcv/Ntfctn/Dbtr/Agt/FinInstnId/BICFI";
	var dbtrAgt1 = getValueFromPath(Document, dbtrAgt1Path);

	var dbtrAgtPath = "/Document/NtfctnToRcv/Ntfctn/DbtrAgt/FinInstnId/BICFI";
	var dbtrAgt = getValueFromPath(Document, dbtrAgtPath);

	var intrmyAgtPath = "/Document/NtfctnToRcv/Ntfctn/IntrmyAgt/FinInstnId/BICFI";
	var intrmyAgt = getValueFromPath(Document, intrmyAgtPath);

	var itmAcctOwnrAnyBicPath = "/Document/NtfctnToRcv/Ntfctn/Itm/AcctOwnr/Pty/Id/OrgId/AnyBIC";
	var itmAcctOwnrAnyBic = getValueFromPath(Document, itmAcctOwnrAnyBicPath);

	var itmAcctOwnrPath = "/Document/NtfctnToRcv/Ntfctn/Itm/AcctOwnr/Agt/FinInstnId/BICFI";
	var itmAcctOwnr = getValueFromPath(Document, itmAcctOwnrPath);

	var itmAcctSvcrPath = "/Document/NtfctnToRcv/Ntfctn/Itm/AcctSvcr/FinInstnId/BICFI";
	var itmAcctSvcr = getValueFromPath(Document, itmAcctSvcrPath);

	var itmDbtrAnybicPath = "/Document/NtfctnToRcv/Ntfctn/Itm/Dbtr/Pty/Id/OrgId/AnyBIC";
	var itmDbtrAnybic = getValueFromPath(Document, itmDbtrAnybicPath);

	var itmDbtrPath = "/Document/NtfctnToRcv/Ntfctn/Itm/Dbtr/Agt/FinInstnId/BICFI";
	var itmDbtr = getValueFromPath(Document, itmDbtrPath);

	var itmDbtrAgtPath = "/Document/NtfctnToRcv/Ntfctn/Itm/DbtrAgt/FinInstnId/BICFI";
	var itmDbtrAgt = getValueFromPath(Document, itmDbtrAgtPath);

	var itmAgtPath = "/Document/NtfctnToRcv/Ntfctn/Itm/Agt/FinInstnId/BICFI";
	var itmAgt = getValueFromPath(Document, itmAgtPath);

	var itmInvcrAnybicPath = "/Document/NtfctnToRcv/Ntfctn/Itm/RmtInf/Strd/Invcr/Id/OrgId/AnyBIC";
	var itmInvcrAnybic = getValueFromPath(Document, itmInvcrAnybicPath);

	var itmInvceeAnybicPath = "/Document/NtfctnToRcv/Ntfctn/Itm/RmtInf/Strd/Invcee/Id/OrgId/AnyBIC";
	var itmInvceeAnybic = getValueFromPath(Document, itmInvceeAnybicPath);

	var itmGrnsheeAnybicPath = "/Document/NtfctnToRcv/Ntfctn/Itm/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/AnyBIC";
	var itmGrnsheeAnybic = getValueFromPath(Document, itmGrnsheeAnybicPath);

	var itmGrnshmtAnybicPath = "/Document/NtfctnToRcv/Ntfctn/Itm/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/AnyBIC";
	var itmGrnshmtAnybic = getValueFromPath(Document, itmGrnshmtAnybicPath);
	
	if(msgSndrAnyBic){
		bic1=genericBicCheckLength(msgSndrAnyBic);
		if(msgSndrAnyBic != bic1) {
			setValueInTxtNode(Document,msgSndrAnyBicPath,bic1);
			setCommentsForTransaction("119", "9185", map);
		}
	}

	if(msgSndrBicfi){
		bic1=genericBicCheckLength(msgSndrBicfi);
		if(msgSndrBicfi != bic1) {
			setValueInTxtNode(Document,msgSndrBicfiPath,bic1);
			setCommentsForTransaction("162", "9185", map);
		}
	}

	if(acctOwnrAnyBic){
		bic1=genericBicCheckLength(acctOwnrAnyBic);
		if(acctOwnrAnyBic != bic1) {
			setValueInTxtNode(Document,acctOwnrAnyBicPath,bic1);
			setCommentsForTransaction("213", "9185", map);
		}
	}

	if(acctOwnr){
		bic1=genericBicCheckLength(acctOwnr);
		if(acctOwnr != bic1) {
			setValueInTxtNode(Document,acctOwnrPath,bic1);
			setCommentsForTransaction("256", "9185", map);
		}
	}
	
	if(acctSvcr){
		bic1=genericBicCheckLength(acctSvcr);
		if(acctSvcr != bic1) {
			setValueInTxtNode(Document,acctSvcrPath,bic1);
			setCommentsForTransaction("285", "9185", map);
		}
	}

	if(dbtrAnyBic){
		bic1=genericBicCheckLength(dbtrAnyBic);
		if(dbtrAnyBic != bic1) {
			setValueInTxtNode(Document,dbtrAnyBicPath,bic1);
			setCommentsForTransaction("337", "9185", map);
		}
	}

	if(dbtrAgt1){
		bic1=genericBicCheckLength(dbtrAgt1);
		if(dbtrAgt1 != bic1) {
			setValueInTxtNode(Document,dbtrAgt1Path,bic1);
			setCommentsForTransaction("380", "9185", map);
		}
	}	

	if(dbtrAgt){
		bic1=genericBicCheckLength(dbtrAgt);
		if(dbtrAgt != bic1) {
			setValueInTxtNode(Document,dbtrAgtPath,bic1);
			setCommentsForTransaction("409", "9185", map);
		}
	}

	if(intrmyAgt){
		bic1=genericBicCheckLength(intrmyAgt);
		if(intrmyAgt != bic1) {
			setValueInTxtNode(Document,intrmyAgtPath,bic1);
			setCommentsForTransaction("438", "9185", map);
		}
	}

	if(itmAcctOwnrAnyBic){
		bic1=genericBicCheckLength(itmAcctOwnrAnyBic);
		if(itmAcctOwnrAnyBic != bic1) {
			setValueInTxtNode(Document,itmAcctOwnrAnyBicPath,bic1);
			setCommentsForTransaction("472", "9185", map);
		}
	}

	if(itmAcctOwnr){
		bic1=genericBicCheckLength(itmAcctOwnr);
		if(itmAcctOwnr != bic1) {
			setValueInTxtNode(Document,itmAcctOwnrPath,bic1);
			setCommentsForTransaction("472", "9185", map);
		}
	}

	if(itmAcctSvcr){
		bic1=genericBicCheckLength(itmAcctSvcr);
		if(itmAcctSvcr != bic1) {
			setValueInTxtNode(Document,itmAcctSvcrPath,bic1);
			setCommentsForTransaction("473", "9185", map);
		}
	}

	if(itmDbtrAnybic){
		bic1=genericBicCheckLength(itmDbtrAnybic);
		if(itmDbtrAnybic != bic1) {
			setValueInTxtNode(Document,itmDbtrAnybicPath,bic1);
			setCommentsForTransaction("497", "9185", map);
		}
	}

	if(itmDbtr){
		bic1=genericBicCheckLength(itmDbtr);
		if(itmDbtr != bic1) {
			setValueInTxtNode(Document,itmDbtrPath,bic1);
			setCommentsForTransaction("540", "9185", map);
		}
	}

	if(itmDbtrAgt){
		bic1=genericBicCheckLength(itmDbtrAgt);
		if(itmDbtrAgt != bic1) {
			setValueInTxtNode(Document,itmDbtrAgtPath,bic1);
			setCommentsForTransaction("569", "9185", map);
		}
	}

	if(itmAgt){
		bic1=genericBicCheckLength(itmAgt);
		if(itmAgt != bic1) {
			setValueInTxtNode(Document,itmAgtPath,bic1);
			setCommentsForTransaction("00", "9185", map);
		}
	}

	if(itmInvcrAnybic){
		bic1=genericBicCheckLength(itmInvcrAnybic);
		if(itmInvcrAnybic != bic1) {
			setValueInTxtNode(Document,itmInvcrAnybicPath,bic1);
			setCommentsForTransaction("00", "9185", map);
		}
	}

	if(itmInvceeAnybic){
		bic1=genericBicCheckLength(itmInvceeAnybic);
		if(itmInvceeAnybic != bic1) {
			setValueInTxtNode(Document,itmInvceeAnybicPath,bic1);
			setCommentsForTransaction("00", "9185", map);
		}
	}

	if(itmGrnsheeAnybic){
		bic1=genericBicCheckLength(itmGrnsheeAnybic);
		if(itmGrnsheeAnybic != bic1) {
			setValueInTxtNode(Document,itmGrnsheeAnybicPath,bic1);
			setCommentsForTransaction("00", "9185", map);
		}
	}

	if(itmGrnshmtAnybic){
		bic1=genericBicCheckLength(itmGrnshmtAnybic);
		if(itmGrnshmtAnybic != bic1) {
			setValueInTxtNode(Document,itmGrnshmtAnybicPath,bic1);
			setCommentsForTransaction("00", "9185", map);
		}
	}

	var DocumentString = convertDocumentToString(Document);
	logger.trace("mxCamt57BicCheckLength: DocumentString = " + DocumentString);
	inMsg.setBody(DocumentString);
	setHeader(map, "ACEDB_originalBody", DocumentString);
}

function getValueDatePath(exchange) {
	var path;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var body = inMsg.getBody(java.lang.String.class);
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	if(isPatternPresent(body, "<PmtRtr>")) {
		path = "/Document/PmtRtr/TxInf/IntrBkSttlmDt";
		var priorityDate = getValueFromPath(Document, path);
		logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);		

		if(!priorityDate){
			path = '/Document/PmtRtr/GrpHdr/IntrBkSttlmDt';
			priorityDate = getValueFromPath(Document, path);
			logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);		
		}
	}else if(isPatternPresent(body, "<FIToFICstmrCdtTrf>")) {
		path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
		var priorityDate = getValueFromPath(Document, path);
		logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);		

		if(!priorityDate){
			path = '/Document/FIToFICstmrCdtTrf/GrpHdr/IntrBkSttlmDt';
			priorityDate = getValueFromPath(Document, path);
			logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);		
		}
	}else if(isPatternPresent(body, "<FICdtTrf>")) {
		path = "/Document/FICdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
	}else if(isPatternPresent(body, "<NtfctnToRcv>")) {
		path = "/Document/NtfctnToRcv/Ntfctn/XpctdValDt";
	}else if(isPatternPresent(body, "<CstmrCdtTrfInitn>")) {
		path = "/Document/CstmrCdtTrfInitn/PmtInf/ReqdExctnDt/Dt";
	}else if(isPatternPresent(body, "<FIToFICstmrDrctDbt>")) {
		path = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/IntrBkSttlmDt';

		var priorityDate = getValueFromPath(Document, path);
		logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);		

		if(!priorityDate){
			path = '/Document/FIToFICstmrDrctDbt/GrpHdr/IntrBkSttlmDt';
			priorityDate = getValueFromPath(Document, path);
			logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);		
		}
	}else if(isPatternPresent(body, "<FIToFIPmtRvsl>")) {
		path = '/Document//FIToFIPmtRvsl/TxInf/IntrBkSttlmDt';

		var priorityDate = getValueFromPath(Document, path);
		logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);		
		if(!priorityDate){
			path = '/Document/FIToFIPmtRvsl/GrpHdr/IntrBkSttlmDt';
		}
	}else if(isPatternPresent(body, "<RsltnOfInvstgtn>")) {
		path = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmDt';
		var priorityDate = getValueFromPath(Document, path);
		logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);
	}else if(isPatternPresent(body, "<FIToFIPmtCxlReq>")) {
		path = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmDt';
		var priorityDate = getValueFromPath(Document, path);
		logger.info("getValueDatePath: intrBkSttlmtDt = " + priorityDate);
	}
	logger.info("getValueDatePath: path = " + path);
	return path;	
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

function ibanBicEnrichment(exchange){
	var baseIban;
	var fld
	var flag;
	var secLvl;
	var runEnv;
	var accounttype;
	var receipient;
	var value;
	var temp;
		
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var body = inMsg.getBody(java.lang.String.class);
	logger.info("In ibanBicEnrichment Rule");
	logger.info("ibanBicEnrichment: Body after Wfapi service Call = " + body);

	//logger.info("ibanBicEnrichment: headers after Wfapi service Call = " + map);
	//setHeader(map, "ACEDB_originalBody", body);

	// var hdrMap = inMsg.getHeaders();
	// var executeRoute = new ExecuteCamelRoute();
	// executeRoute.callRouteWithHeader('direct://IBAN-BIC-Enrich', parseRequest, new HashMap());
	// var outHdrMap = executeRoute.getOutputHeader();
	// var outmsg = executeRoute.getOutputBody(java.util.List.class);
	//var body = executeRoute.getOutputBody(org.w3c.dom.Document.class);
// 	var responseBody = `<?xml version="1.0"?>
// <ReprMsg><MsgInfo><IntrBkSttlmAmt Ccy="EUR">500</IntrBkSttlmAmt><IntrBkSttlmDt>2023-09-25</IntrBkSttlmDt><InstrId>SP292916674516-5</InstrId><RmtInf><Ustrd>Contract ZZ/JO/164794</Ustrd></RmtInf></MsgInfo><PtyInfo><PrtyType>Agent</PrtyType><PrtyFldNm>InstructingAgent</PrtyFldNm><RequestCode>MXSTP</RequestCode><Agt><FinInstnId><BICFI>GABKDE3E</BICFI></FinInstnId></Agt></PtyInfo><PtyInfo><PrtyType>Agent</PrtyType><PrtyFldNm>InstructedAgent</PrtyFldNm><RequestCode>MXSTP</RequestCode><Agt><FinInstnId><BICFI>SANTATWWXXX</BICFI></FinInstnId></Agt></PtyInfo><PtyInfo><PrtyType>Agent</PrtyType><PrtyFldNm>DebtorAgent</PrtyFldNm><RequestCode>MXSTP</RequestCode><Agt><FinInstnId><BICFI>BUKBGB22XXX</BICFI></FinInstnId></Agt></PtyInfo><PtyInfo><PrtyType>Party</PrtyType><PrtyFldNm>Debtor</PrtyFldNm><RequestCode>MXSTP</RequestCode><Pty><Nm>ABC Corporation</Nm><PstlAdr><StrtNm>Times Square</StrtNm><BldgNb>7</BldgNb><PstCd>NY 10036</PstCd><TwnNm>New York</TwnNm><Ctry>US</Ctry></PstlAdr></Pty></PtyInfo><PtyInfo><PrtyType>Account</PrtyType><PrtyFldNm>DebtorAccount</PrtyFldNm><RequestCode>MXSTP</RequestCode><Acct><Id><IBAN>AT231981001299085104</IBAN></Id></Acct></PtyInfo><PtyInfo><PrtyType>Agent</PrtyType><PrtyFldNm>CreditorAgent</PrtyFldNm><RequestCode>MXSTP</RequestCode><Agt><FinInstnId><BICFI>BKAUATWWXXX</BICFI></FinInstnId></Agt></PtyInfo><PtyInfo><PrtyType>Party</PrtyType><PrtyFldNm>Creditor</PrtyFldNm><RequestCode>MXSTP</RequestCode><Pty><Nm>GHI Semiconductors</Nm><PstlAdr><StrtNm>Avenue Brugmann</StrtNm><BldgNb>415</BldgNb><PstCd>1180</PstCd><TwnNm>New York</TwnNm><Ctry>US</Ctry></PstlAdr></Pty></PtyInfo><PtyInfo><PrtyType>Account</PrtyType><PrtyFldNm>CreditorAccount</PrtyFldNm><RequestCode>MXSTP</RequestCode><Acct><Id><IBAN>GB46BARB60938412345678</IBAN></Id></Acct></PtyInfo></ReprMsg>
// `
	var responseBody = inMsg.getBody(java.lang.String.class);
	//var messageBody = convertDocumentToString(body);
	//const { DOMParser } = require('xmldom');
	//const parser = new DOMSource();
	inMsg.setBody(responseBody);
	var DocumentRes = inMsg.getBody(org.w3c.dom.Document.class);
	logger.info("ibanBicEnrichment: DocumentRes =" + DocumentRes);
	//var messageBody = parser.parseFromString(responseBody, 'text/xml');

	logger.info("ibanBicEnrichment: responseBody type = "+ typeof responseBody);
	//logger.info("ibanBicEnrichment: Output responseBody = " + responseBody );

	var messageType = getHeader(map, "PLCNAPI_msgType");
	logger.info("ibanBicEnrichment: messageType = " + messageType );

	var creditorAgent_Prtyinfo = getHeader(map, "CreditorAgent_Prtyinfo");
	logger.info("ibanBicEnrichment:creditorAgent_Prtyinfo = " + creditorAgent_Prtyinfo);
	if(!creditorAgent_Prtyinfo) {
		if(messageType == 'pacs.008.001.08') {
			creditorAgent_Prtyinfo = 6;
		}else if(messageType == 'pacs.003.001.08') {
			creditorAgent_Prtyinfo = 5;
		}
	}

	var cdtrAgtBICCodePath = "/ReprMsg/PtyInfo[" +creditorAgent_Prtyinfo+ "]/Agt/FinInstnId/BICFI";
	logger.info("cdtrAgtBICCodePath = " + cdtrAgtBICCodePath);
	var cdtrAgtBICCode =  getValueFromPath(DocumentRes, cdtrAgtBICCodePath);
	logger.info("cdtrAgtBICCode = " + cdtrAgtBICCode);
	setHeader(map, "PLCN_credtorAgent", cdtrAgtBICCode)

	var debtorAgent_Prtyinfo = getHeader(map, "DebtorAgent_Prtyinfo");
	logger.info("ibanBicEnrichment:debtorAgent_Prtyinfo = " + debtorAgent_Prtyinfo);

	if(!debtorAgent_Prtyinfo) {
		debtorAgent_Prtyinfo = 3;
	}
	var debtorAgtBICCodePath = "/ReprMsg/PtyInfo[" +debtorAgent_Prtyinfo+ "]/Agt/FinInstnId/BICFI";
	logger.info("ibanBicEnrichment:debtorAgtBICCodePath = " + debtorAgtBICCodePath);
	var debtorAgtBICCode =  getValueFromPath(DocumentRes, debtorAgtBICCodePath);
	logger.info("ibanBicEnrichment:debtorAgtBICCode = " + debtorAgtBICCode);
	setHeader(map, "PLCN_debtorAgent", debtorAgtBICCode);

	//bicEnrichment(exchange);

	
	var Msgbody = getHeader(map, "ACEDB_originalBody");
	logger.info("ibanBicEnrichment: Msg body = " + Msgbody);
	inMsg.setBody(Msgbody);

	Document = inMsg.getBody(org.w3c.dom.Document.class);

	var msgType = getHeader(map, "PLCNAPI_message_type");
	var paymentType = getHeader(map, "PLCN_msgType");;
	if(isPatternPresent(msgType, "Cbpr") || isPatternPresent(msgType, "Sepa")) {
		paymentType = replacePattern(msgType, "Cbpr", "Sepa");
		msgType = replacePattern(paymentType, "Sepa", "");
	}
	if(!msgType){
		if(isPatternPresent(paymentType, "Pacs008")){
			msgType = "pacs.008.001.08";
		}else if(isPatternPresent(paymentType, "Pacs003")) {
			msgType = "pacs.003.001.08";
		}
	}
	logger.info("ibanBicEnrichment: paymentType = " + paymentType);
	logger.info("ibanBicEnrichment: msgType = " + msgType);
	setHeader(map, "PLCN_msgType", msgType);
	//Added by SP for TECHBULLS-30134
	if(messageType){
		logger.info("ibanBicEnrichment: Inside messageType if condition");
		setHeader(map, "PLCN_msgType" , messageType);
		//setHeader(map, "PaymentType" , messageType);
		setHeader(map, "PaymentTypeFamily" , ("Sepa" + messageType));
		logger.info("ibanBicEnrichment: TEST 4 messageType = " + messageType);
	}
	//setHeader(map, "PaymentType" , paymentType);//commented by SP for TECHBULLS-30134

	var CdtrAgt;
	var FinInstnId;
	var BICFI;
	var DbtrAgt;

	var parser = new XMLParser();
	//var Msgbody = inMsg.getBody(java.lang.String.class);
	parser.parseXML(Msgbody);
	Document = parser.parseXML(Msgbody);

	var creditorAgentPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
	//setValueInTxtNode(Document, creditorAgentPath, cdtrAgtBICCode);
	var bicCode = getValueFromPath(Document, creditorAgentPath);
	logger.info(" ibanBicEnrichment BicCode = " + bicCode);

	var debtorAgentPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/DbtrAgt/FinInstnId/BICFI';
	var dbtrBicCode = getValueFromPath(Document, debtorAgentPath);
	logger.info(" ibanBicEnrichment Pacs003 dbtrBicCode = " + dbtrBicCode);
		//setValueInPath(Document, debtorAgentPath, debtorAgent);

	if(msgType == 'pacs.008.001.08') {

	 if(cdtrAgtBICCode){
			logger.info(" ibanBicEnrichment pacs008:else part.");		
			FinInstnId =  createElement(Document, "FinInstnId" );

			BICFI =  createElementwithTextNode(Document , FinInstnId,"BICFI" , cdtrAgtBICCode);
			FinInstnId.appendChild(BICFI);
			//appendElementtoNode(FinInstnId, BICFI )
			CdtrAgt = Document.getElementsByTagName("CdtrAgt");
			var newNode = CdtrAgt.item(0);
			var StringNode = convertDocumentToString(newNode);
			logger.info(" ibanBicEnrichment pacs008: StringNode = " + StringNode);
			if(isPatternPresent(StringNode ,"<FinInstnId/>")) {
				FinInstnId = newNode.getElementsByTagName("FinInstnId");
				var newSubNode = FinInstnId.item(0);
				newSubNode.insertBefore(BICFI, newSubNode.lastChild);	
			}else {
			//appendElementtoNode(CdtrAgt, FinInstnId )
				newNode.insertBefore(FinInstnId, newNode.lastChild);
			}
		}
		//setValueInPath(Document, creditorAgentPath, creditorAgent);
	}else if(msgType == 'pacs.003.001.08') {
		if(cdtrAgtBICCode) {
			logger.info(" ibanBicEnrichment pacs003:else part.");		
			FinInstnId =  createElement(Document, "FinInstnId" );

			BICFI =  createElementwithTextNode(Document , FinInstnId,"BICFI" , cdtrAgtBICCode);
			FinInstnId.appendChild(BICFI);

			DbtrAgt = Document.getElementsByTagName("DbtrAgt");
			var newNode = DbtrAgt.item(0);
			var StringNode = convertDocumentToString(newNode);
			logger.info(" ibanBicEnrichment pacs003: StringNode = " + StringNode);
			if(isPatternPresent(StringNode ,"<FinInstnId/>")) {
				FinInstnId = newNode.getElementsByTagName("FinInstnId");
				var newSubNode = FinInstnId.item(0);
				newSubNode.insertBefore(BICFI, newSubNode.lastChild);	
			}else {
			//appendElementtoNode(CdtrAgt, FinInstnId )
				newNode.insertBefore(FinInstnId, newNode.lastChild);
			}
		}
	}

	// var parser = new XMLParser();
	// var Msgbody = inMsg.getBody(java.lang.String.class);
	// parser.parseXML(Msgbody);
	// Document = parser.parseXML(Msgbody);

	if(cdtrAgtBICCode) {
		setCommentsForTransaction("00", "6087", map);
	}else if(!cdtrAgtBICCode){
		setCommentsForTransaction("00", "8285", map);
		// var CdtrAgt = Document.getElementsByTagName("CdtrAgt");
		// logger.info("ibanBicEnrichment: CdtrAgt = " + CdtrAgt);
		// if(CdtrAgt) {
		// 	CdtrAgt.item(0).parentNode.removeChild(CdtrAgt.item(0));
		// }
	}

	var stringBody = convertDocumentToString(Document);
	logger.info(" ibanBicEnrichment: String Body = " + stringBody);
	inMsg.setBody(stringBody);
	setHeader(map, "ACEDB_originalBody", stringBody);  

	var msgType = getHeader(map, "PaymentType");
	msgType = msgType.toLowerCase();
	logger.info("ibanBicEnrichment: msgType = " + msgType);
	setHeader(map, "PLCN_msgType", msgType);
	setHeader(map, "PLCNAPI_msgType", msgType);

	var tmpStr = msgType.slice(-15);
	var msgFamily = removePattern(msgType, tmpStr);
	logger.info("ibanBicEnrichment: msgFamily = " + msgFamily);
	msgFamily = msgFamily.toLowerCase();
	setHeader(map, "PLCN_msgFamily", msgFamily);
	setHeader(map, "PLCNAPI_msgFamily", msgFamily)

	var comments = getHeader(map, "PLCN_txnComments");
	logger.info("ibanBicEnrichment: comments = " + comments);

	setHeader(map, "PLCNAPI_txnComments", comments);
	logger.info("ibanBicEnrichment Rule completed..");
}

function wfapiRequestHeaders(exchange) {
	logger.info("In wfapiRequestHeaders Rule");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var body = inMsg.getBody(java.lang.String.class);
	//logger.info("wfapiRequestHeaders: Body before Wfapi service Call = " + body);

	var msgFamily = getHeader(map, "PLCNAPI_messageFamily");
	logger.info("wfapiRequestHeaders: msgFamily = " + msgFamily);
	setHeader(map, "plcn_msg_family", "XML");

	var msgType = getHeader(map, "PLCNAPI_message_type");
	logger.info("wfapiRequestHeaders: msgType = " + msgType);
	if(msgType == "pacs.008.001.08" || msgType == "pacs.003.001.08") {
		setHeader(map, "msgclasstype", "PACS008");
		setHeader(map, "plcn_msgtype", "CbprPacs008");
	 }
	//else if(msgType == "pacs.003.001.08"){
	// 	setHeader(map,"msgclasstype", "PACS003");
	// 	setHeader(map, "plcn_msgtype", "CbprPacs003");
	// }
	else {
		logger.info("wfapiRequestHeaders:messageType not supported for enrichment..")
	}
	var institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("wfapiRequestHeaders: institutionId = " + institutionId);
	setHeader(map, "institutionid", institutionId);

	var StringBody =  convertDocumentToString(Document);

	logger.info("wfapiRequestHeaders: body before character change = " + StringBody);

	if(StringBody) {

		const replacements = {
		  'Ä': 'A',
		  'Ö': 'O',
		  'Ü': 'U',
		  'ä': 'a',
		  'ö': 'o',
		  'ü': 'u',
		  'ß': 's'
		};

		StringBody = StringBody.replace(/[äöüßÄÖÜ]/g, function(match) {
	    	return replacements[match];
	  	});
	}

	logger.info("wfapiRequestHeaders: body after character change = " + StringBody);
	inMsg.setBody(StringBody);

	logger.info("wfapiRequestHeaders Rule completed..");
}
function tagEnrichment(exchange){
	var baseIban;
	var fld
	var flag;
	var secLvl;
	var runEnv;
	var accounttype;
	var receipient;
	var value;
	var temp;
		
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var body = inMsg.getBody(java.lang.String.class);
	setHeader(map, "ACEDB_originalBody", body);

	logger.info("In tagEnrichment Rule");
	logger.trace("tagEnrichment: Body before translation sepa service Call = " + body);
	
	var responseBody = inMsg.getBody(java.lang.String.class);
	//var messageBody = convertDocumentToString(body);
	//const { DOMParser } = require('xmldom');
	//const parser = new DOMSource();
	inMsg.setBody(responseBody);
	var DocumentRes = inMsg.getBody(org.w3c.dom.Document.class);
	logger.trace("tagEnrichment: DocumentRes =" + DocumentRes);
	//var messageBody = parser.parseFromString(responseBody, 'text/xml');

	logger.info("tagEnrichment: responseBody type = "+ typeof responseBody);
	//logger.info("tagEnrichment: Output responseBody = " + responseBody );

	var msgType = getHeader(map, "PLCNAPI_message_type");
	var paymentType = getHeader(map, "PLCN_msgType");;
	if(isPatternPresent(msgType, "Cbpr") || isPatternPresent(msgType, "Sepa")) {
		paymentType = replacePattern(msgType, "Cbpr", "Sepa");
		msgType = replacePattern(paymentType, "Sepa", "");
	}
	if(!msgType){
		if(isPatternPresent(paymentType, "Pacs008")){
			msgType = "pacs.008.001.08";
		}else if(isPatternPresent(paymentType, "Pacs003")) {
			msgType = "pacs.003.001.08";
		}
	}
	logger.info("tagEnrichment: paymentType = " + paymentType);
	logger.info("tagEnrichment: msgType = " + msgType);
	//commented by Akshay S for TECHBULLS-28968. 
	//Had a discussion with Sameer P. 
	//setHeader(map, "PaymentType" , paymentType);
	setHeader(map, "PLCN_msgType", msgType);

	var CdtrAgt;
	var FinInstnId;
	var BICFI;
	var DbtrAgt;

	if(msgType == 'pacs.008.001.08') {
		var creditorAgentPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
		//setValueInTxtNode(Document, creditorAgentPath, cdtrAgtBICCode);
		if(!(isPatternPresent(body, "</CdtrAgt>"))) {
			var Cdtr = Document.getElementsByTagName("Cdtr");
			var nextNode = Cdtr.item(0);
			logger.info("tagEnrichment If part:nextNode = " + nextNode);
				      
			CdtrAgt = createElement(Document, "CdtrAgt");
			FinInstnId = createElement(Document,"FinInstnId");
				          
			//BICFI =  createElementwithTextNode(Document , FinInstnId, "BICFI" , "");
			//FinInstnId =  createElementwithTextNode(Document , CdtrAgt, "FinInstnId" , "");
			//FinInstnId.appendChild(BICFI);
			CdtrAgt.appendChild(FinInstnId);
			//appendElementtoNode(CdtrAgt, FinInstnId);	          
			var CdtTrfTxInf = Document.getElementsByTagName("CdtTrfTxInf");
			var newNode = CdtTrfTxInf.item(0);
			newNode.insertBefore(CdtrAgt, nextNode);
			//replacePattern(body, "<FinInstnId/>", "");
			setHeader(map, "PLCN_bicEnrichmentFlag", true);		       		
		}else {
			logger.info("tagEnrichment: CdtrAgt tag is present in message..");
			setHeader(map, "PLCN_bicEnrichmentFlag", false);
		}

		var stringBody = convertDocumentToString(Document);
		logger.trace("tagEnrichment: String Body = " + stringBody);
		inMsg.setBody(stringBody);
		setHeader(map, "ACEDB_originalBody", stringBody);
		//setValueInPath(Document, creditorAgentPath, creditorAgent);
	}else if(msgType == 'pacs.003.001.08') {
		//var debtorAgentPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/DbtrAgt/FinInstnId/BICFI';
		//setValueInPath(Document, debtorAgentPath, debtorAgent);
		if(!(isPatternPresent(body, "</DbtrAgt>"))) {
			var dbtrAcct = Document.getElementsByTagName("DbtrAcct");
			var nextNode = dbtrAcct.item(0);
			logger.info("tagEnrichment If part:nextNode = " + nextNode);
				      
			DbtrAgt = createElement(Document, "DbtrAgt");
			FinInstnId = createElement(Document,"FinInstnId");
				          
			//BICFI =  createElementwithTextNode(Document , FinInstnId, "BICFI" , debtorAgtBICCode);
			//FinInstnId.appendChild(BICFI);
			DbtrAgt.appendChild(FinInstnId);
				          
			var DrctDbtTxInf = Document.getElementsByTagName("DrctDbtTxInf");
			var newNode = DrctDbtTxInf.item(0);
            newNode.insertBefore(DbtrAgt, nextNode.nextSibling); 
			setHeader(map, "PLCN_bicEnrichmentFlag", true);		       		
		}else {
			logger.info("tagEnrichment: DbtrAgt tag is present in message..");
			setHeader(map, "PLCN_bicEnrichmentFlag", false);
		}
		var stringBody = convertDocumentToString(Document);
		logger.info("tagEnrichment: String Body = " + stringBody);
		inMsg.setBody(stringBody);
		setHeader(map, "ACEDB_originalBody", stringBody);
	}

	var parser = new XMLParser();
	var Msgbody = inMsg.getBody(java.lang.String.class);
	parser.parseXML(Msgbody);
	Document = parser.parseXML(Msgbody);

	//var Document = inMsg.getBody(org.w3c.dom.Document.class);
	var bicEnrichmentFlag = getHeader(map, "PLCN_bicEnrichmentFlag");
	logger.info("tagEnrichment: bicEnrichmentFlag = " + bicEnrichmentFlag);
	
	if(msgType == 'pacs.003.001.08' && bicEnrichmentFlag == true) {
		logger.info("tagEnrichment: Inside pacs003 for swapping...");
		var dbtrAcctPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/DbtrAcct/Id/IBAN';
		var dbtrAcct = getValueFromPath(Document, dbtrAcctPath);
		logger.info("tagEnrichment: dbtrAcct from first path = " + dbtrAcct);

		if(!dbtrAcct){
			dbtrAcctPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/DbtrAcct/Id/Othr/Id';
			dbtrAcct = getValueFromPath(Document, dbtrAcctPath);
			logger.info("tagEnrichment: dbtrAcct from second path = " + dbtrAcct);

		}
		var cdtrAcctPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/CdtrAcct/Id/IBAN';
		var cdtrAcct = getValueFromPath(Document, cdtrAcctPath);
		logger.info("tagEnrichment: cdtrAcct from first path = " + cdtrAcct);
		if(!cdtrAcct){
			var cdtrAcctPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/CdtrAcct/Id/Othr/Id';
			var cdtrAcct = getValueFromPath(Document, cdtrAcctPath);
			logger.info("tagEnrichment:  creditorAcc second path = " + cdtrAcct);
			}

		if(cdtrAcct) {
			setValueInPath(Document, dbtrAcctPath, cdtrAcct);
		}

		if(dbtrAcct) {
			setValueInPath(Document, cdtrAcctPath, dbtrAcct);
		}

		var cdtrAgtPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/CdtrAgt/FinInstnId/BICFI';
		var cdtrAgt = getValueFromPath(Document, cdtrAgtPath);

		if(cdtrAgt) {
			setValueInPath(Document, cdtrAgtPath, "");
		}
	}

	var messageBody = convertDocumentToString(Document);
	logger.info("tagEnrichment:  messageBody  = " + messageBody);

	inMsg.setBody(messageBody);

	//setHeader(map, "PLCN_bicEnrichmentFlag", false);

	logger.info("tagEnrichment Rule completed..");
}


