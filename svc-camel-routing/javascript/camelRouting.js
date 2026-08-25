load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.solution.ppay/svc-camel-routing/javascript/pelicanxmlutility.js');
load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.solution.ppay/svc-camel-routing/javascript/utility.js');
load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.solution.ppay/svc-camel-routing/javascript/messageRepair.js');
load('/pelapp/software/pas_BUAT/usr/local/clo/app/pel/pas/ace.solution.ppay/svc-camel-routing/javascript/authorizationCheck.js');

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
var TransformerFactory = Java.type('javax.xml.transform.TransformerFactory');
var StringWriter = Java.type('java.io.StringWriter');
var DOMSource = Java.type('javax.xml.transform.dom.DOMSource');
var Transformer = Java.type("javax.xml.transform.Transformer");
var OutputKeys = Java.type("javax.xml.transform.OutputKeys");
var StreamResult = Java.type('javax.xml.transform.stream.StreamResult');
var InterActFile = Java.type("ai.pelican.camel.interact.InterActFile");
var AuthCodeGenerator = Java.type("ai.pelican.camel.authentication.AuthCodeGenerator");
var AppHeaderHandler = Java.type("ai.pelican.camel.bah.AppHeaderHandler");
var DocumentBuilder = Java.type("javax.xml.parsers.DocumentBuilder");
var Document = Java.type("org.w3c.dom.Document");
var StringReader = Java.type("java.io.StringReader");
var InputSource = Java.type("org.xml.sax.InputSource");

const getMethods = (obj) => {
	let properties = new Set()
	let currentObj = obj
	do {
		Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
	} while ((currentObj = Object.getPrototypeOf(currentObj)))
	var items = [...properties.keys()].filter(item => typeof obj[item] === 'function');


	logger.trace("-------------- START --------------;")
	logger.trace("-Funnctions--");
	items.forEach(element => {
		logger.trace(element);
	});

	logger.trace("--KEYS--");
	var keys = obj.keySet();

	keys.forEach(element => {
		logger.trace(element + ": " + obj.get(element));
	});

	logger.trace("-------------- END --------------;")

}

function extractUsrHeader(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var receivedMsg = exchange.getIn().getBody(java.lang.String.class);

	logger.info("extractUsrHeader: receivedMsg = " + receivedMsg);

	if (receivedMsg.contains("<usr")) {
		//var payload = receivedMsg.substring(receivedMsg.indexOf("<Document"), receivedMsg.indexOf("</Body"));
		var payload = receivedMsg.substring(receivedMsg.indexOf("<usr"), receivedMsg.indexOf("</usr") + 6);
		logger.info("extractUsrHeader: usr = " + payload);
	}

	return payload;
}

/*
**
* This function extracts payload.
* @param {CamelExchange} exchange - The exchange.
*/
function extractPayload(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var receivedMsg = exchange.getIn().getBody(java.lang.String.class);

	logger.info("extractPayload: receivedMsg = " + receivedMsg);

	if (receivedMsg.contains("<Document")) {
		//var payload = receivedMsg.substring(receivedMsg.indexOf("<Document"), receivedMsg.indexOf("</Body"));
		var payload = receivedMsg.substring(receivedMsg.indexOf("<Document"), receivedMsg.indexOf("</Document") + 11);
		logger.info("extractPayload: payload = " + payload);
	}

	return payload;
}


/*
 ** This function return the message type reading from the Document xmlns attribute
 * @param {Fednow} exchange - The exchange.
 * @returns string
 */
function getMessageTypeFedNow(exchange) {

	logger.info("In getMessageType");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);


	var payload = extractPayload(exchange);
	var payLoadDoc = createDocument(payload);

	logger.info("In getMessageType : payload: " + payload);
	logger.info("In getMessageType : payload type: " + typeof payload);
	logger.info("In getMessageType : payloadDoc: " + payLoadDoc);
	logger.info("In getMessageType : payloadDoc type: " + typeof payloadDoc);


	var xmlnsValue = payLoadDoc.getDocumentElement().getAttribute("xmlns");

	var xmlnsMsgType = null;
	if (xmlnsValue != null) {
		logger.trace("xmlns value: " + xmlnsValue);

		var xmlnsSplitValues = xmlnsValue.split(":");
		xmlnsSplitValues.forEach(element => {
			logger.trace(element);
		});
		xmlnsMsgType = xmlnsSplitValues[xmlnsSplitValues.length - 1].toUpperCase();
		logger.trace(xmlnsMsgType);
	}

	return xmlnsMsgType;

}



/*
 ** This function is used to update the columns in Database
 * @param {Fednow} exchange - The exchange.
 */
function updateQueueIdFedNow(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var msgdbMap = new HashMap();
	var audit = new HashMap();
	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var queueStatus = 69;
	// Debug readMsgdb object
	getMethods(readMsgdb);
	logger.trace("readMsgdb");
	getMethods(map);
	logger.trace("map");
	// getMethods(inMsg);
	// logger.info("inmsg");


	logger.info("updateQueueId: MSGDB_ID = " + getHeader(map, "PLCN_msgDbId"));

	// var msgDirection = getHeader(map, "PLCN_msgDirection");
	// logger.info("dbOperation: msgDirection = " + msgDirection);

	// if(msgDirection == "I") {
	// 	msgdbMap.put("TRANSACTIONTYPE", "D");
	// }else {
	// 	msgdbMap.put("TRANSACTIONTYPE", "C");
	// } 


	var msgType = getMessageTypeFedNow(exchange);

	var payload = extractPayload(exchange);
	var payLoadDoc = createDocument(payload);

	logger.info("In updateQueueId : payload: " + payload);
	logger.info("In updateQueueId : payload type: " + typeof payload);
	logger.info("In updateQueueId : payloadDoc: " + payLoadDoc);
	logger.info("In updateQueueId : payloadDoc type: " + typeof payloadDoc);
	var Document = payLoadDoc;


	//var queueId = getHeader(map, "PLCN_queue");
	var messageNo = readMsgdb.get("MESSAGENO")
	var sourceChannelId = readMsgdb.get("CHANNEL_ID_SOURCE");
	var targetChannelId = readMsgdb.get("CHANNEL_ID_TARGET");
	logger.info("sourceChannelId :" + sourceChannelId);
	logger.info("targetChannelId :" + targetChannelId);
	msgdbMap.put("SOURCECHANNELID", sourceChannelId);

	logger.info("SOURCECHANNELID: " + sourceChannelId);

	// RAVITEJA
	var MESSAGECLASSTYPE
	var institutionId = readMsgdb.get("INSTITUTIONID");
	var processId = getHeader(map, "PLCN_processId");
	logger.info("updateQueueId: processId = " + processId);

	var msgTypeQueueMap = new HashMap();
	msgTypeQueueMap.put("PACS.008.001.08", "FEDNCTTQ");
	msgTypeQueueMap.put("PACS.004.001.10", "FEDNRTTQ");
	msgTypeQueueMap.put("CAMT.056.001.08", "FEDNRCTQ");
	msgTypeQueueMap.put("CAMT.029.001.09", "FEDNNRTQ");
	msgTypeQueueMap.put("PAIN.013.001.07", "FEDNRPTQ");
	msgTypeQueueMap.put("PAIN.014.001.07", "FEDNRRTQ");
	msgTypeQueueMap.put("PACS.002.001.10", "FEDNSTTQ");
	msgTypeQueueMap.put("PACS.028.001.03", "FEDNRPSQ");

	// var queueId = 'ERRORQ';
	var oQueueId = null;
	logger.info("msgType: " + msgType);

	if (msgType == null || msgType.trim() == '') {

		logger.info("No XMLNS found");
		queueStatus = 102;

	}
	else {
		//var oQueueId = msgTypeQueueMap.get(msgType.toUpperCase());
		/// CHECK FOR THE CHANNEL_ID_SOURCE from the DB
		/// append the mapping

		var messageTypeWIthSourceChannel = sourceChannelId.toUpperCase().trim() + "__" + msgType.toUpperCase().trim();
		logger.info('messageTypeWIthSourceChannel: ' + messageTypeWIthSourceChannel);
		oQueueId = memTblGetTableValue(map, "CAMEL-ROUTING", messageTypeWIthSourceChannel).trim().replace(/[\r\n]/gm, '');
		logger.info('updateQueueId: oQueueId' + oQueueId);
		logger.info('updateQueueId: msgType' + msgType);
		// tejadata
		//msgTypeQueueMap.put("MESSAGECLASSTYPE", msgType);


		msgdbMap.put("MESSAGECLASSTYPE", msgType.toLowerCase());
	}

	if (oQueueId != null) {
		queueId = oQueueId;
	}
	else {
		queueId = "ERRORQ";
	}

	if (sourceChannelId.toUpperCase() == "PELICAN" && msgType.toUpperCase() == "CAMT.056.001.08" ) {
		queueStatus = 79;
	}
	setHeader(map, "PLCN_XMLNS_PARSE_QUEUEID", queueId);
	setHeader(map, "PLCN_XMLNS_PARSE_STATUS", queueStatus);

	logger.info("updateQueueId: queueId = " + queueId);
	logger.info("updateQueueId: messageNo = " + messageNo);

	/*
		SOURCE_CHANNEL		TARGET_CHANNEL
		STP-COREBANKING-IN__SWIFT-FED-OUT-STP
		PELICAN__SWIFT-FED-OUT-STP

	*/


	if (
		(sourceChannelId.toUpperCase() == "STP-COREBANKING-IN" || sourceChannelId.toUpperCase() == "PELICAN") 
		// && (targetChannelId.toUpperCase() == "SWIFT-FED-OUT-STP" )
	) {
		msgdbMap.put("MESSAGEDIRECTION", "I");
	}
	else {
		msgdbMap.put("MESSAGEDIRECTION", "O");
	}

	if (queueId != "ERRORQ" && msgType != null) {
		// Teja
		if (msgType == "PACS.008.001.08") {
			logger.info("Inside pacs008");
			var priorityDatePath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
			var datepath = getValueFromPath(Document, priorityDatePath);


			if( datepath )
			{
				datepath = replaceAllPattern(datepath, "-", "");
				msgdbMap.put("PRIORITYDATE", datepath);
				logger.info("Date:" + datepath);
			}

			//senderPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI"; //WIP
			//receiverPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI"; //WIP
			var senderPath = "Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/ClrSysMmbId/MmbId";
			var senderPathValue = getValueFromPath(Document, senderPath);

			if( senderPathValue )
			{
				logger.info("sendPathValue" + senderPathValue);
			    msgdbMap.put("SENDER", senderPathValue);
			}

			var receiverPath = "Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/ClrSysMmbId/MmbId";
			var receiverPathValue = getValueFromPath(Document, receiverPath);

			if( receiverPathValue )
			{
				logger.info("receiverPathvalue" + receiverPathValue);
			    msgdbMap.put("RECEIVER", receiverPathValue);
			}

			
			var transRefNoPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/TxId";
			var transRefNoPathValue = getValueFromPath(Document, transRefNoPath);

			if( transRefNoPathValue )
			{
				
			logger.info("transRefNoPathValue" + transRefNoPathValue);
			msgdbMap.put("TRANSREFNO", transRefNoPathValue);
			}



			var currencyPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy";
			var currencyPathValue = getValueFromPath(Document, currencyPath);

			if( currencyPathValue )
			{
				
				logger.info("currencyPathValue" + currencyPathValue);
			    msgdbMap.put("CURRENCY", currencyPathValue);
			}

		
			var priorityAmountPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt";
			var priorityAmountPathValue = getValueFromPath(Document, priorityAmountPath);
			logger.info("priorityAmountPathValue" + priorityAmountPathValue);

			if( priorityAmountPathValue )
			{
			     msgdbMap.put("PRIORITYAMOUNT", priorityAmountPathValue);
			     msgdbMap.put("PRIORITYAMOUNTNUM", priorityAmountPathValue);
			}


			var priorityAmountNum = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt";
			var priorityAmountNumValue = getValueFromPath(Document, priorityAmountNum);
			if( priorityAmountNumValue )
			{
				
				msgdbMap.put("PRIORITYAMOUNTNUM", priorityAmountNumValue);
				// var  localCurrentAmount="/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt";
				// var localCurrentAmountValue= getValueFromPath(Document,localCurrentAmount);
				msgdbMap.put("LOCALCURRENCYAMOUNT", priorityAmountNumValue);
				// var  localCurrentAmountNum="/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt";
				// var localCurrentAmountValue= getValueFromPath(Document,localCurrentAmountNum);
				msgdbMap.put("LOCALCURRENCYAMOUNTNUM", priorityAmountNumValue);
			}

		
			var customer = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI";
			var customerValue = getValueFromPath(Document, customer);

			if( customerValue )
			{
				
			    msgdbMap.put("CUSTOMER", customerValue);
			// var custom48="Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
			// var custom48Value= getValueFromPath(Document,custom48);
			// // custom48Value = replaceAllPattern(custom48Value, "-", "");
			// msgdbMap.put("CUSTOM48",custom48Value);
			}
			

		}
		else if (msgType == "PACS.002.001.10") {
			logger.info("Inside pacs002")
			var priorityDatePath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/FctvIntrBkSttlmDt/Dt";
			var datepath = getValueFromPath(Document, priorityDatePath);
			if( datepath )
			{
				datepath = replaceAllPattern(datepath, "-", "");
				msgdbMap.put("PRIORITYDATE", datepath);
				logger.info("Date:" + datepath);
			}


		}
		else if (msgType == "CAMT.029.001.09") {
			logger.info("Inside Camt029");
			var priorityDatePath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/IntrBkSttlmDt";
			var datepath = getValueFromPath(Document, priorityDatePath);
			if( datepath )
			{
				datepath = replaceAllPattern(datepath, "-", "");
				msgdbMap.put("PRIORITYDATE", datepath);
				logger.info("Date:" + datepath);
			}
			var transStatus = 'Document/RsltnOfInvstgtn/Sts/Conf';
			transStatusValue= getValueFromPath(Document, transStatus);

			if( transStatusValue )
			{
				logger.info("CUSTOM12" + transStatusValue);
				msgdbMap.put("CUSTOM12",transStatusValue);
			}

			
		}
		else if (msgType == "PAIN.013.001.07") {
			logger.info("Inside Pain013");
			var transRefNoPath = "/Document/CdtrPmtActvtnReq/GrpHdr/MsgId";
			var transRefNoPathValue = getValueFromPath(Document, transRefNoPath);

			if( transRefNoPathValue )
			{
				logger.info("transRefNoPathValue" + transRefNoPathValue);
			    msgdbMap.put("TRANSREFNO", transRefNoPathValue);
			}

	
			var currencyPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Amt/InstdAmt/@Ccy";
			var currencyPathValue = getValueFromPath(Document, currencyPath);
			if( currencyPathValue )
			{
				logger.info("currencyPathValue" + currencyPathValue);
			    msgdbMap.put("CURRENCY", currencyPathValue);
			}

			
			var priorityAmount = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Amt/InstdAmt"
			var priorityAmountPathValue = getValueFromPath(Document, priorityAmount);
			if( priorityAmountPathValue )
			{
				
			logger.info("priorityAmountPath" + priorityAmountPathValue);
			msgdbMap.put("PRIORITYAMOUNT", priorityAmountPathValue);
			msgdbMap.put("PRIORITYAMOUNTNUM", priorityAmountPathValue);
			}

			var priorityDatePath = "/Document/CdtrPmtActvtnReq/PmtInf/ReqdExctnDt/Dt";
			var datepath = getValueFromPath(Document, priorityDatePath);
			
			if( datepath )
			{
				datepath = replaceAllPattern(datepath, "-", "");
				msgdbMap.put("PRIORITYDATE", datepath);
				logger.info("Date:" + datepath);
			}
			var senderPath = "/Document/CdtrPmtActvtnReq/PmtInf/DbtrAgt/FinInstnId/BICFI";
			var senderPathValue = getValueFromPath(Document, senderPath);

			if( senderPathValue )
			{
				logger.info("sendPathValue" + senderPathValue);
				msgdbMap.put("SENDER", senderPathValue);
			}
		
			var receiverPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/CdtrAgt/FinInstnId/BICFI";
			var receiverPathValue = getValueFromPath(Document, receiverPath);

			if( receiverPathValue )
			{
				logger.info("receiverPathvalue is" + receiverPathValue);
			    msgdbMap.put("RECEIVER", receiverPathValue)
			}
			

		}
		else if (msgType == "CAMT.056.001.08") 
		{

			var currencyPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
			var currencyPathValue = getValueFromPath(Document, currencyPath);

			if( currencyPathValue )
			{
				logger.info("currencyPathValue" + currencyPathValue);
			    msgdbMap.put("CURRENCY", currencyPathValue);	
			}
			
			var priorityAmountPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt";
			var priorityAmountPathValue = getValueFromPath(Document, priorityAmountPath);
			if( priorityAmountPathValue )
			{
				logger.info("priorityAmountPath" + priorityAmountPathValue);
				msgdbMap.put("PRIORITYAMOUNT", priorityAmountPathValue);
				msgdbMap.put("PRIORITYAMOUNTNUM", priorityAmountPathValue);
			}

			var priorityAmountNum = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt";
			var priorityAmountNumValue = getValueFromPath(Document, priorityAmountNum);
			if( priorityAmountNumValue )
			{
				logger.info("PRIORITYAMOUNTNUM" + priorityAmountNumValue);
				msgdbMap.put("PRIORITYAMOUNTNUM", priorityAmountNumValue);
			}
			
			
			var transRefNoPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlInstrId";
			var transRefNoPathValue = getValueFromPath(Document, transRefNoPath);
			if( transRefNoPathValue )
			{
				logger.info("transRefNoPathValue" + transRefNoPathValue);
			    msgdbMap.put("TRANSREFNO", transRefNoPathValue);
			}

			
			var priorityDatePath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmDt";
			var datepath = getValueFromPath(Document, priorityDatePath);
			if( datepath )
			{
				datepath = replaceAllPattern(datepath, "-", "");
				msgdbMap.put("PRIORITYDATE", datepath);
				logger.info("Date:" + datepath);
			}
			
		} else if(msgType == "PAIN.014.001.07") {
			var transStatus = '/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/TxSts';
			transStatusValue= getValueFromPath(Document, transStatus);
			if( transStatusValue )
			{
				logger.info("CUSTOM12" + transStatusValue);
				msgdbMap.put("CUSTOM12",transStatusValue);
			}
			
		}else if (msgType == "PACS.004.001.10" ) {
			var transRefNoPath ="/Document/PmtRtr/TxInf/OrgnlInstrId";
			var transRefNoPathValue = getValueFromPath(Document, transRefNoPath);
			if( transRefNoPathValue )
			{
				logger.info("transRefNoPathValue" + transRefNoPathValue);
			msgdbMap.put("TRANSREFNO", transRefNoPathValue);
			}


			
		}

		var hashCode;
		var encryptDecrypt;
		encryptDecrypt = new EncryptDecrypt();
		hashCode = encryptDecrypt.getMessageDigest("SHA-1", exchange.getIn().getBody(java.lang.String.class));
		logger.info("hashCode: " + hashCode);
		msgdbMap.put("CUSTOM44", hashCode);
		//  Hardcoded 
		msgdbMap.put("PRIORITY", 9);
		msgdbMap.put("LOCKSTATUS", 0);
		msgdbMap.put("NUMOFMESSAGES", 1);
		msgdbMap.put("CATEGORY", 1);
		msgdbMap.put("DUPLICATE_RECORD_KEY", "");
		msgdbMap.put("PROCESSING_STAGE", "FINL");
		msgdbMap.put("NEXT_WORKFLOW_QUEUE_ID", "");
		msgdbMap.put("NEXT_WORKFLOW_STATUS", "");
		msgdbMap.put("MSG_FAMILY","FEDNOW");
		// msgdbMap.put("MSGFAMILY","FEDNOW");
		// msgdbMap.put("ORG_MESSAGECLASSTYPE" , 103);


		logger.info("Msgdbmap Check " + msgdbMap);

		// msgdbMap.put("QUEUEID", queueId);
		// msgdbMap.put("DISPLAY_FLAG", "Y");
		// msgdbMap.put("INSTANCEID","PELICAN1");
		// msgdbMap.put("PROCESS_ID", processId);

	}
	else {
		queueId = "ERRORQ";
		queueStatus = 102;
		msgdbMap.put("PROCESSING_STAGE", "ERR");
		setHeader(map, "PLCN_XMLNS_PARSE_QUEUEID", queueId);
		setHeader(map, "PLCN_XMLNS_PARSE_STATUS", queueStatus);

	}
	var prevQueueId = readMsgdb.get("QUEUEID");
	logger.info("updateQueueId: prevQueueId = " + prevQueueId);

	audit.put("MESSAGENO", messageNo);
	audit.put("QUEUEID", queueId);
	//audit.put("USERNAME","ADMIN1");
	audit.put("APPLICATION", "ACEQ_CMP");
	audit.put("MODULENAME", "ACEQWRITE");
	audit.put("ACTION", "WRITE");
	audit.put("AUDITTEXT", "Message number " + "<" + messageNo + ">" + " read from " + "<"+ prevQueueId + ">" + "and written into Queue " + "<" + queueId + ">");
	audit.put("INSTITUTIONID", institutionId);

	setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
	setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
	setHeader(map, "GENAUDIT", audit);
	logger.info("updateQueueId completed");
}

function dbOperationFedNow(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var msgdbMap = new HashMap();
	var audit = new HashMap();
	var CHANNEL_ID_TARGET;

	// Teja

	var priorityDatePath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
	var datepath = getValueFromPath(Document, priorityDatePath);
	logger.info("datepath" + datepath);
	msgdbMap.put("PRIORITYDATE", datepath);
	//senderPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI"; //WIP
	//receiverPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI"; //WIP
	var senderPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI";
	var senderPathValue = getValueFromPath(Document, senderPath);
	msgdbMap.put("SENDER", senderPathValue);
	var receiverPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI";
	var receiverPathValue = getValueFromPath(Document, receiverPath);
	msgdbMap.put("RECEIVER", receiverPathValue);
	// var	transRefNoPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/InstrId";
	// msgdbMap.put("PRIORITYDATE",priorityDatePath);
	var currencyPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy";
	var currencyPathValue = getValueFromPath(Document, currencyPath);
	msgdbMap.put("CURRENCY", currencyPathValue);
	var priorityAmountPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt";
	var priorityAmountPathValue = getValueFromPath(Document, priorityAmountPath);
	msgdbMap.put("PRIORITYAMOUNT", priorityAmountPathValue);


	//  Hardcoded 

	msgdbMap.put("PRIORITY", 9);
	msgdbMap.put("LOCKSTATUS", 0);
	msgdbMap.put("NUMOFMESSAGES", 1);
	msgdbMap.put("CATEGORY", 1);
	msgdbMap.put("DUPLICATE_RECORD_KEY", "");
	//msgdbMap.put("PROCESSING_STAGE", "FINL");
	msgdbMap.put("NEXT_WORKFLOW_QUEUE_ID", "");
	msgdbMap.put("NEXT_WORKFLOW_STATUS", "");



	// Teja


	var derivedProductCode = readMsgdb.get("DERIVED_PRODUCT");
	logger.info("ruleGenerateKbJs: derivedProductCode from db = " + derivedProductCode);

	if (!derivedProductCode) {
		derivedProductCode = drveNibcProductCode(exchange);
		logger.info("ruleGenerateKbJs: derivedProductCode from hazelcast = " + derivedProductCode);
		logger.info("ruleGenerateKbJs: typeof derivedProductCode from hazelcast = " + typeof derivedProductCode);
	} else {
		setHeader(map, "PLCN_productCode", derivedProductCode);
	}
}

function drveNibcProductCode(exchange) {
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

	logger.info("In drveNibcProductCode");

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("drveNibcProductCode: institutionId = " + institutionId);

	mode = getHeader(map, "PLCN_msgModeIn");
	logger.info("drveNibcProductCode: mode = " + mode);

	msgType = getHeader(map, "PLCN_msgType");
	logger.info("drveNibcProductCode: msgType = " + msgType);

	sourceChannelId = getHeader(map, "PLCN_sourceChannelId");
	logger.info("drveNibcProductCode: sourceChannelId = " + sourceChannelId);

	drveProductCodeFlagPath = institutionId + "." + "MESSAGE_PROCESSING.FUNCTIONALITY.CHANNEL_MSGTYPE_CONFIG" + "." + sourceChannelId;
	drveProductCodeFlag = memTblGetTableValue(map, "INST_PARAM", drveProductCodeFlagPath);

	if (isPatternPresent(drveProductCodeFlag, msgType)) {
		// if (mode == "MANUAL" || mode == "UPLOAD") {
		// key = mode + "-" + msgType;
		key = sourceChannelId + "-" + msgType;
		logger.info("drveNibcProductCode: key = " + key);
		productCode = memTblGetTableValue(map, "PPAY_PRODUCT_CODE", key);
		logger.info("drveNibcProductCode: productCode = " + productCode);
		// }

		if (productCode) {
			setHeader(map, "PLCN_productCode", productCode);
			return productCode;
		}
	}
}

/*
**
* This function checks whether headers are present in the message or not.
* @param {CamelExchange} exchange - The exchange.
*/
function checkHeader(exchange) {
	var payload;
	var bah;
	var interact;
	var msgType;
	var institutionId;
	var config;
	var key;

	logger.info("In checkHeader");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var message = inMsg.getBody(java.lang.String.class);

	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var readMsgBlocks = inMsg.getHeaders().get("ACEQ_READ_MSGBLOCKS");
	var msgBlock1 = readMsgBlocks.get("MSGBLOCK1");
	setHeader(map, "ACEDB_msgBlock1", msgBlock1);
	setHeader(map, "ACEDB_ORG", msgBlock1);
	logger.trace("checkHeader: msgBlock1 = " + msgBlock1);
	
	var msgId = readMsgdb.get("MSGDB_ID");
	logger.info("checkHeader: msgId = " + msgId);
	
	var msgFamily = readMsgdb.get("MSG_FAMILY");
	logger.info("checkHeader: msgFamily = " + msgFamily);
	
	var msgType = readMsgdb.get("MESSAGECLASSTYPE");
	logger.info("checkHeader: msgType = " + msgType);
	
	if(isPatternPresent(msgBlock1, "</usr>")) {
		setHeader(map, "PLCN_headerPresent", true);
		setHeader(map, "PLCN_createHeader", false);
	} else if(isPatternPresent(msgBlock1, "</DataPDU>")) {
		setHeader(map, "PLCN_headerPresent", true);
		setHeader(map, "PLCN_createHeader", false);
	}else if (isPatternPresent(msgBlock1, "</AppHdr>")) {
		truncateHeader(exchange);
		setHeader(map, "PLCN_headerPresent", false);
		setHeader(map, "PLCN_createHeader", true);
		setHeader(map, "PLCN_validLAU", true);
	} else {
		setHeader(map, "PLCN_headerPresent", false);
		setHeader(map, "PLCN_createHeader", false);
		setHeader(map, "PLCN_validLAU", true);
		logger.info("checkHeader: validLAU = true");
	}
	
	logger.info("checkHeader: headerPresent = " + getHeader(map, "PLCN_headerPresent"));
	logger.info("checkHeader: createHeader = " + getHeader(map, "PLCN_createHeader"));
	
	var msgtag = memTblGetTableValue(map, "MSGNAMESPACE_MAP", msgType);	//"FIToFIPmtCxlReq>";//
	logger.info("checkHeader: msgtag = " + msgtag);
	var availableTag = dataBetweenTokens ("Document", msgtag, message);
	logger.info("checkHeader: availableTag = " + availableTag);
		
	var tag1 = availableTag;
	
	if(isPatternPresent(message, ":Document") || isPatternPresent(message, ":Document>")){
		logger.info("checkHeader: Namespace present ");	
		var tempTag1 = availableTag;
		var count = 0;
		while(count == 0) {
			logger.info("checkHeader: count = " + count);
			var genericTag = dataBetweenTokens ("xmlns:", "=\"urn:iso", tempTag1);
			var tempTag2 = genericTag + ":";
			if(isPatternPresent(availableTag, tempTag2)) {
				count = 1;
				logger.info("checkHeader: count = " + count);
			} else {
				if (!genericTag){
					count = 1;	
					logger.info("checkHeader: count = " + count);
				} else {
					tempTag1 = genericTag + "=\"urn:iso";
					logger.info("checkHeader: tempTag1 = " + tempTag1);
				}
			}
			
			logger.info("checkHeader: genericTag = " + genericTag);	
		}
		
		if(genericTag){
			message = message.replaceAll("<"+genericTag+":", "<");
			logger.info("checkHeader: Message after replace half = " + message);
			message = message.replaceAll("</"+genericTag+":", "</");
			logger.info("checkHeader: Message after replace full = " + message);
			
			if(isPatternPresent(tag1, "xmlns=")){
				var flag = "Y";
				logger.info("checkHeader: flag" + flag);
			}else{
				var flag = "N";
				logger.info("checkHeader: flag" + flag);
			}
			
			if(isPatternPresent(tag1, "xmlns:"+genericTag)){
				var flag1 = "Y";
				logger.info("checkHeader: flag1" + flag1);
			}else{
				var flag1 = "N";
				logger.info("checkHeader: flag1" + flag1);
			}
			
			if(flag == "N" && flag1 == "Y"){
				logger.info("checkHeader: in xmlns loop");
			message = message.replaceAll("xmlns:"+genericTag, "xmlns");
			logger.info("checkHeader: Message after document replace full = " + message);
				setHeader(map, "PLCN_Xmlns", "Y");
			}
			
			inMsg.setBody(message);
			message = inMsg.getBody(java.lang.String.class);
			logger.info("checkHeader: Message = " + message);
			setHeader(map, "PLCN_NameSpace", "Y");
			setHeader(map, "PLCN_NameSpaceTag", genericTag);
		}
	}
}

/*
**
* This function truncates header.
* @param {CamelExchange} exchange - The exchange.
*/
function truncateHeader(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var receivedMsg = exchange.getIn().getBody(java.lang.String.class);
	
	var orgnlMessage = getHeader(map, "ACEDB_msgBlock1"); //inMsg.getBody(java.lang.String.class);
	logger.info("truncateHeader: orgnlMessage = " + orgnlMessage);

	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");

	var institutionId = readMsgdb.get("INSTITUTIONID");
	logger.info("truncateHeader: institutionId = " + institutionId);
	setHeader(map, "PLCN_institutionId", institutionId);

	var msgType = readMsgdb.get("MESSAGECLASSTYPE");
	logger.info("truncateHeader: msgType = " + msgType);
	setHeader(map, "PLCN_msgType", msgType);
	
	if(receivedMsg.contains("<usr")) {
		var usr = extractUsrHeader(exchange);
		logger.info("truncateHeader: usr = " + usr);
		
		var payload = removePattern(receivedMsg, usr);
		logger.info("truncateHeader: payload = " + payload);		
	}else {
		var payload = extractPayload(exchange);
		logger.info("truncateHeader: payload = " + payload);		
	}

	var BAH = extractBAH(exchange);
	setHeader(map, "PLCN_bahFrMsg", BAH);

	setHeader(map, "ACEDB_MSGBLOCK1", payload);
	setHeader(map, "ACEDB_MSGBLOCK153", orgnlMessage);
	setHeader(map, "ACEDB_MSGBLOCK154", orgnlMessage);

	if (msgType == "pacs.002.001.10") {
		institutionId = getHeader(map, "PLCN_institutionId");
		key = institutionId + "." + "OUTPUT_CONFIGURATION" + "." + "PACS002_FORMAT"; //to decide block154 value
		config = memTblGetTableValue(map, "INST_PARAM", key);
		logger.info("truncateHeader: config = " + config);

		if (config == "header") {
			setHeader(map, "ACEDB_MSGBLOCK154", orgnlMessage);
		} else if (config == "payload") {
			setHeader(map, "ACEDB_MSGBLOCK154", payload);
		}
	} else {
		setHeader(map, "ACEDB_MSGBLOCK154", orgnlMessage);
	}

	if(msgType == "ACK") {
		payload = orgnlMessage;
	}

	inMsg.setBody(payload);
}


function extractBAH(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var receivedMsg = exchange.getIn().getBody(java.lang.String.class);

	logger.info("extractBAH: receivedMsg = " + receivedMsg);

	if (receivedMsg.contains("<AppHdr")) {
		var BAH = receivedMsg.substring(receivedMsg.indexOf("<AppHdr"), receivedMsg.indexOf("</AppHdr") + 9);
		logger.info("extractBAH: BAH = " + BAH);
	}

	return BAH;
}

function setMsgBlocksData(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setMsgBlocksData");

	var payload = inMsg.getBody(java.lang.String.class);
	logger.trace("setMsgBlocksData: payload = " + payload);

	setHeader(map, "PLCN_createHeader", true);
	setHeader(map, "PLCN_validLAU", true);

	setHeader(map, "ACEDB_MSGBLOCK1", payload);
	setHeader(map, "ACEDB_MSGBLOCK153", payload);
	setHeader(map, "ACEDB_MSGBLOCK154", payload);
	logger.trace("setMsgBlocksData: ACEDB_MSGBLOCK1 = " + getHeader(map, "ACEDB_MSGBLOCK1"));
	logger.trace("setMsgBlocksData: ACEDB_MSGBLOCK153 = " + getHeader(map, "ACEDB_MSGBLOCK153"));
	logger.trace("setMsgBlocksData: ACEDB_MSGBLOCK154 = " + getHeader(map, "ACEDB_MSGBLOCK154"));
}

/*
**
* This function validates LAU.
* @param {CamelExchange} exchange - The exchange.
*/
function validateLAU(exchange) {
	var validLAU;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	var lau = new AuthCodeGenerator();
	var jsHelper = new JSHelperClass();

	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var sourceChannelId = readMsgdb.get("SOURCECHANNELID");
	logger.info("validateLAU: sourceChannelId = " + sourceChannelId);

	var lauFlag = memTblGetTableValue(map, "FLAG-TABLE", "IB_FEDNOW_LAU");
	lauFlag = lauFlag.trim();
	logger.info("validateLAU: lauFlag = " + lauFlag);

	var readMsgBlocks = inMsg.getHeaders().get("ACEQ_READ_MSGBLOCKS");
	var msgBlock1 = readMsgBlocks.get("MSGBLOCK1");
	logger.info("validateLAU: msgBlock1 = " + msgBlock1);

	logger.info("validateLAU: msgBlock1 = " + msgBlock1);
	logger.info("validateLAU: typeof msgBlock1 = " + typeof msgBlock1);
	
	/* if(isPatternPresent(msgBlock1, "<usr>")) {
		logger.info("validateLAU: validating Swift AGI HMAC");
		validLAU = validateHMAC(exchange);
	}else { */
		if (lauFlag == "Y") {
			logger.info("validateLAU: calling LAU validator ");
			var key = jsHelper.getHzlMapValue(exchange.getIn().getHeaders(), "CH_CHANNEL_KEY", sourceChannelId);
			validLAU = lau.validatePayloadSingnature(msgBlock1, key);
			logger.info("validateLAU: valid LAU = " + validLAU);
		} else {
			validLAU = true;
			logger.info("validateLAU: valid LAU = " + validLAU);
		}

		if (validLAU == false) {
			setHeader(map, "PLCN_queue", "ERRORQ");
			setHeader(map, "PLCN_displayFlag", "Y");
			setHeader(map, "PLCN_processingStage", "ERR");
			//setHeader(map,"PLCN_currentAuthLevel", "ERR=4");
			setHeader(map, "PLCN_ERRORQ", true);
			setHeader(map, "PLCN_validFlag", "false");
			setHeader(map, "PLCN_validMessage", false);
			setCommentsForTransaction("00", "5847", map);
		}
	//}

	setHeader(map, "PLCN_validLAU", validLAU);
}

function validateHMAC(exchange) {
	var validLAU;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var i = 0;
	var swiftAGI = "";
	var lau = new AuthCodeGenerator();
	var jsHelper = new JSHelperClass();
	
	logger.info("In validateHMAC");
	
	var readMsgBlocks = inMsg.getHeaders().get("ACEQ_READ_MSGBLOCKS");
	var msgBlock1 = readMsgBlocks.get("MSGBLOCK1");
	logger.info("validateHMAC: msgBlock1 = " + msgBlock1);
	
	var count = memTblGetTableValue(map, "SWIFT_AGI_MAP", "COUNT")
	logger.info("validateHMAC: msgBlock1 = " + msgBlock1);
	count = parseInt(count);
	
	while(i<count) {
		var field = memTblGetTableValue(map, "SWIFT_AGI_MAP", "FIELD"+i);
		logger.info("validateHMAC: field = " + field);
		swiftAGI = swiftAGI + field;
		logger.info("validateHMAC: swiftAGI = " + swiftAGI);
	}
	
	logger.info("validateHMAC: Complete swiftAGI = " + swiftAGI);
	
	return true;
}

function getMessageType(exchange){
	logger.info("In getMessageType");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var xmlnsMsgType=null;

	var isXml = isXmlNodePresent2(Document, "Document");

	if(isXml != true) {
		xmlnsMsgType = "MT";
	}else {
		var xmlnsValue = Document.getDocumentElement().getAttribute("xmlns");
		if (xmlnsValue != null) {
			logger.info("xmlns value: " + xmlnsValue);

			var xmlnsSplitValues = xmlnsValue.split(":");
			xmlnsSplitValues.forEach(element => {
			 logger.info(element);
			});
			xmlnsMsgType = xmlnsSplitValues[xmlnsSplitValues.length - 1].toUpperCase();
			logger.info(xmlnsMsgType);
		}
	}
 
	 return xmlnsMsgType; 
}

function updateQueueIdMx(exchange){
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var msgdbMap = new HashMap();
	var audit = new HashMap();
	var priorityDatePath;
	var senderPath;
	var receiverPath;
	var transRefNoPath;
	var hashCode;
	var encryptDecrypt;
	var msgFamily;
	var message = inMsg.getBody(java.lang.String.class);
	var tgtCode;
	var msgType1;
	
	logger.trace("updateQueueIdMx: message = " + message);
	// Debug readMsgdb object
	//getMethods(readMsgdb);
	//getMethods(map);

	var mode = readMsgdb.get("MSG_MODE_IN");
	logger.info("updateQueueIdMx: mode = " + mode);
	setHeader(map, "PLCN_mode", mode);
	setHeader(map, "PLCN_msgModeIn", mode);

	var institutionId =  readMsgdb.get("INSTITUTIONID");
	logger.info("updateQueueIdMx: institutionId = " + institutionId);
	setHeader(map, "PLCN_institutionId", institutionId);
	
	logger.info("updateQueueIdMx: MSGDB_ID = " + readMsgdb.get("MSGDB_ID"));
	
	var sourceChannelId = readMsgdb.get("CHANNEL_ID_SOURCE");
	logger.info("updateQueueIdMx: sourceChannelId = " + sourceChannelId);
	msgdbMap.put("SOURCECHANNELID", sourceChannelId);
	setHeader(map, "PLCN_sourceChannelId", sourceChannelId);

	var msgType = readMsgdb.get("MESSAGECLASSTYPE"); //msgType = getMessageType(exchange);
	logger.info("updateQueueIdMx: msgType from MSGDB = " + msgType);

	if(!msgType){
		msgType = getMessageType(exchange);	
		logger.info("updateQueueIdMx: msgType from getMessageType = " + msgType);
	}

	if(msgType){
		if(msgType == 'pacs009.001.08'){
			msgType = "pacs.009.001.08";
		}else if(msgType == 'pacs009.001.08c'){
			msgType = "pacs.009.001.08";
			msgType1 = "pacs009.001.08C";
		}else if(msgType == 'pacs009.001.08a'){
			msgType = "pacs.009.001.08";
			msgType1 = "pacs009.001.08A";
		}
	}
	
	logger.info("updateQueueIdMx: msgType = " + msgType);
	logger.info("updateQueueIdMx: msgType1 = " + msgType1);

	var messageNo = readMsgdb.get("MESSAGENO");
	logger.info("updateQueueIdMx: messageNo = " + messageNo);
	setHeader(map, "PLCN_messageNo", messageNo);
	
	if(msgType == "UNKNOWN" || !msgType) {
		logger.info("updateQueueIdMx: UNKNOWN msgType");
	
		var inputDate = readMsgdb.get("INPUTDATE");
		logger.info("updateQueueIdMx: inputDate = " + inputDate);
		
		var loc = memTblGetTableValue(map, "CHNL_TO_LOC_MAP", sourceChannelId);
		logger.info("updateQueueIdMx: loc = " + loc);
		
		if(loc){
			msgdbMap.put("MSGSEGR", loc);
			logger.info("updateQueueIdMx: derived location = " + loc);
		}

		var comments = setCommentsForTransaction("00", "11563", map);
		queueId = "PROCDQ";
		msgdbMap.put("COMMENTS", comments);
		msgdbMap.put("PROCESSING_STAGE", "FINL");
		msgdbMap.put("DISPLAY_FLAG", "Y");
		msgdbMap.put("PRIORITYDATE", inputDate);

		var prevQueueId = readMsgdb.get("QUEUEID");
		logger.info("updateQueueId: prevQueueId = " + prevQueueId);
		
		audit.put("MESSAGENO", messageNo);
		audit.put("QUEUEID", queueId);
		audit.put("APPLICATION","ACEQ_CMP");
		audit.put("MODULENAME","ACEQWRITE");
		audit.put("ACTION","UPDATE");
		audit.put("AUDITTEXT", "Message number " + "<" + messageNo + ">" + " read from " + "<"+ prevQueueId + ">" + "and written into Queue " + "<" + queueId + ">");
		audit.put("INSTITUTIONID", institutionId);
		
		setHeader(map, "GENAUDIT", audit);
		setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
		setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
		setHeader(map, "PLCN_XMLNS_PARSE_QUEUEID", "PROCDQ");
		setHeader(map, "PLCN_XMLNS_PARSE_STATUS", "102");
		
		logger.info("updateQueueIdMx: msgdbMap = " + msgdbMap);
		logger.info("updateQueueIdMx: audit = " + audit);
		return;
	}else{
		setHeader(map, "PLCN_XMLNS_PARSE_STATUS", "69");
	}
	
	if(!msgType){
		msgType = getMessageType(exchange);	
		logger.info("updateQueueIdMx: msgType from getMessageType = " + msgType);
	}

	if(msgType != "ACK" || msgType != "ACKX"){
		msgType = msgType.toLowerCase();
		setHeader(map, "PLCN_msgType", msgType);
	}
	
	/* sourceChannelId = getHeader(map, "PLCN_sourceChannelId"); */
	var userConfigVal = memTblGetTableValue(map, "SEPAINST_CONFIG_MAP", sourceChannelId);
	logger.info('updateQueueIdMx: userConfigVal = ' + userConfigVal);
	var csm = userConfigVal;
	logger.info('updateQueueIdMx: csm = ' + csm);

	// Added for SSBTC-279,284
	var directionChkKey = sourceChannelId + "-"  + msgType;
	logger.info('updateQueueIdMx: directionChkKey = ' + directionChkKey);
	msgDirection = memTblGetTableValue(map, "DIRECTION_CHK_MAP", directionChkKey);
	logger.info("updateQueueIdMx: msgDirection using directionChkKey = " + msgDirection);

	if(!msgDirection){
		msgDirection = memTblGetTableValue(map, "DIRECTION_CHK_MAP", sourceChannelId);
		logger.info("updateQueueIdMx: msgDirection = " + msgDirection);
	}
	setHeader(map, "PLCN_msgDirection", msgDirection);

	/* if(sourceChannelId == "PEL-SEPA-OB-IN" && msgDirection == "I" && msgType == "pacs.002.001.10") {
		msgDirection = "O";
		logger.info("updateQueueIdMx: msgDirection = " + msgDirection);
		setHeader(map, "PLCN_msgDirection", msgDirection);
	} */

	// RAVITEJA
	var institutionId =  readMsgdb.get("INSTITUTIONID");
	var processId = getHeader(map,"PLCN_processId");
	logger.info("updateQueueIdMx: processId = " + processId);


	if(msgType == 'pacs.008.001.08'){
		var svcLvlPath = 'Document/FIToFICstmrCdtTrf/GrpHdr/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		if(!svcLvl){
			var svcLvlPath = 'Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/SvcLvl/Cd';
			var svcLvl = getValueFromPath(Document, svcLvlPath);
			logger.info("updateQueueIdMx: svcLvl = " + svcLvl);
		}

		var lclInstrmPath = 'Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);

		if(!lclInstrm){
			var lclInstrmPath = 'Document/FIToFICstmrCdtTrf/GrpHdr/PmtTpInf/LclInstrm/Cd';
			var lclInstrm = getValueFromPath(Document, lclInstrmPath);
			logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);
			
			var tgtCodePath = 'Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/ClrSys/Cd';
			var tgtCode = getValueFromPath(Document, tgtCodePath);
			logger.info("updateQueueIdMx: tgtCode = " + tgtCode);
		}
	}

	if(msgType == 'pacs.004.001.09'){
		var svcLvlPath = 'Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		var lclInstrmPath = 'Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);
	}

	if(msgType == 'camt.056.001.08'){
		var svcLvlPath = 'Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		var lclInstrmPath = 'Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);
	}

	if(msgType == 'camt.029.001.09'){
		var svcLvlPath = 'Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		var lclInstrmPath = 'Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);
	}

	if(msgType == 'pacs.028.001.03'){
		var svcLvlPath = 'Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		var lclInstrmPath = 'Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);
	}

	if(msgType == 'pacs.002.001.10'){
		if(isPatternPresent(message, "FIToFIPmtStsRpt")) {
			var svcLvlPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
			var svcLvl = getValueFromPath(Document, svcLvlPath);
			logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

			var lclInstrmPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
			var lclInstrm = getValueFromPath(Document, lclInstrmPath);
			logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);			
		}else if(isPatternPresent(message, "FIToFIPmtStsRptSCL")) {
			var svcLvlPath = '/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
			var svcLvl = getValueFromPath(Document, svcLvlPath);
			logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

			var lclInstrmPath = '/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
			var lclInstrm = getValueFromPath(Document, lclInstrmPath);
			logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);			
		}
	}

	if(msgType == 'pacs.003.001.08'){
		var svcLvlPath = 'Document/FIToFICstmrDrctDbt/GrpHdr/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		if(!svcLvl){
			var svcLvlPath = 'Document/FIToFICstmrDrctDbt/CdtTrfTxInf/PmtTpInf/SvcLvl/Cd';
			var svcLvl = getValueFromPath(Document, svcLvlPath);
			logger.info("updateQueueIdMx: svcLvl = " + svcLvl);
		}

		var lclInstrmPath = 'Document/FIToFICstmrDrctDbt/CdtTrfTxInf/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);

		if(!lclInstrm){
			var lclInstrmPath = 'Document/FIToFICstmrDrctDbt/GrpHdr/PmtTpInf/LclInstrm/Cd';
			var lclInstrm = getValueFromPath(Document, lclInstrmPath);
			logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);		
		}
	}

	if(msgType == 'pacs.007.001.09'){
		var svcLvlPath = 'Document/FIToFIPmtRvsl/TxInf/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		var lclInstrmPath = 'Document/FIToFIPmtRvsl/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);
	}
	
	/*if(msgType == 'ackx' || msgType == 'nakx'){
		var svcLvlPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		var lclInstrmPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
		var lclInstrm = getValueFromPath(Document, lclInstrmPath);
		logger.info("updateQueueIdMx: lclInstrm = " + lclInstrm);
	}*/
	
	if(msgType == 'pacs.009.001.08'){
		var tgtCodePath = 'Document/FICdtTrf/GrpHdr/SttlmInf/ClrSys/Cd';
		var tgtCode = getValueFromPath(Document, tgtCodePath);
		logger.info("updateQueueIdMx: tgtCode = " + tgtCode);
	}
	
	var msgFamily = memTblGetTableValue(map, "CHANNEL_MSGFAMILY_CONFIG", sourceChannelId);
	logger.info('updateQueueIdMx: msgFamily from CHANNEL_MSGFAMILY_CONFIG = '+ msgFamily);

	var msgTypeQueueMap = new HashMap();
	
	if(!msgFamily) {
		if(msgType == null ){
			logger.info("updateQueueIdMx: No XMLNS found");
		}else{
			//var oQueueId = msgTypeQueueMap.get(msgType.toUpperCase());
			//logger.info('updateQueueIdMx: oQueueId = '+ oQueueId);
			//logger.info('updateQueueIdMx: msgType = '+msgType);
			// tejadata
			//msgTypeQueueMap.put("MESSAGECLASSTYPE", msgType);
			if(msgType != "ACK" || msgType != "ACKX") {
				msgType = msgType.toLowerCase();
			}

			if(msgType != "MT") {
				if(msgType != "ackx" || msgType != "nakx") {
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				}

				if(tgtCode == "TGT"){
					msgdbMap.put("MSG_FAMILY", "XML");
					msgFamily = "TARGET2";
					var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + "TARGET2" + "-" + msgDirection);
					logger.info('updateQueueIdMx: oQueueId in TARGET2 loop = '+ oQueueId);
					logger.info('updateQueueIdMx: msgType = ' + msgType);				
				}else{
					if(msgType == "ACK") {
						logger.info('updateQueueIdMx: Inside ACK loop');
						msgFamily = "SEPAINST";
						var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
						logger.info('updateQueueIdMx: oQueueId = '+ oQueueId);
						logger.info('updateQueueIdMx: msgType = ' + msgType);
						msgdbMap.put("MSG_FAMILY", msgFamily);
						setHeader(map, "PLCN_msgType", msgType);
					}else {
						msgdbMap.put("MSG_FAMILY", "XML");
						msgFamily = "CBPR";
						var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + "CBPR" + "-" + msgDirection);
						logger.info('updateQueueIdMx: oQueueId in CBPR loop = '+ oQueueId);
						logger.info('updateQueueIdMx: msgType = ' + msgType);
						setHeader(map, "PLCN_msgType", msgType);
					}	
				}
			}else{
				var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + "MT" + "-" + msgDirection);
				logger.info('updateQueueIdMx: oQueueId = '+ oQueueId);
				logger.info('updateQueueIdMx: msgType = ' + msgType);
				msgdbMap.put("MSG_FAMILY", "SWIFT");
			}

			//if(lclInstrm == 'INST' && svcLvl == 'SEPA'){
			//if(isPatternPresent(lclInstrm, 'INST') && isPatternPresent(svcLvl, 'SEPA')){
			if((isPatternPresent(csm, 'RT1') || isPatternPresent(csm, 'TIPS')) && isPatternPresent(svcLvl, 'SEPA')){
				msgFamily = 'SEPAINST';
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				msgdbMap.put("MSG_FAMILY", msgFamily);
				//var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
				var hKey = msgType + "_"  + msgFamily + "-" + msgDirection;
				logger.info('updateQueueIdMx: hKey = ' + hKey);
				var oQueueId = memTblGetTableValue(map, "SCT_QUEUEID", hKey);
				logger.info('updateQueueIdMx: oQueueId from SCT_QUEUEID = '+ oQueueId);
				logger.info('updateQueueIdMx: msgType = ' + msgType);
			//}else if(isPatternPresent(svcLvl, 'SEPA') && lclInstrm != 'INST'){
			}else if(isPatternPresent(svcLvl, 'SEPA') && isPatternPresent(csm, 'SEPA')){
				msgFamily = 'SEPA';
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				msgdbMap.put("MSG_FAMILY", msgFamily);
				var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
				logger.info('updateQueueIdMx: oQueueId Sepa = '+ oQueueId);
				logger.info('updateQueueIdMx: msgType = ' + msgType);
			}else if((msgType == "ackx") || (msgType == "nakx")){
				logger.info('inside 2nd loop');
				msgType = msgType.toUpperCase();
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				msgdbMap.put("MSG_FAMILY", "CBPR");
				msgFamily = 'CBPR';
				logger.info('updateQueueIdMx: msgFamily1 = '+msgFamily);
			}/* else if(sourceChannelId == 'PEL-TIPS-OB-IN' || sourceChannelId == 'TIPS-FIN-IN'){
				logger.info('inside 3rd loop');
				msgFamily = 'SEPAINST';
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				msgdbMap.put("MSG_FAMILY", "SEPAINST");
				var hKey = msgType + "_"  + msgFamily + "-" + msgDirection;
				logger.info('updateQueueIdMx: hKey = ' + hKey);
				var oQueueId = memTblGetTableValue(map, "SCT_QUEUEID", hKey);
				logger.info('updateQueueIdMx: oQueueId from SCT_QUEUEID = '+ oQueueId);
				logger.info('updateQueueIdMx: msgType = ' + msgType);
			} */
			if(csm){
				logger.info('inside 3rd loop');
				logger.info('updateQueueIdMx: csm = ' + csm);
				logger.info('updateQueueIdMx: msgFamily = ' + msgFamily);
				if(msgFamily == 'CBPR'){
					msgFamily = 'CBPR';
					logger.info('CBPR loop');
				if(msgType1 == 'pacs009.001.08C'){
					msgdbMap.put("MESSAGECLASSTYPE", msgType1);
				}else if(msgType1 == 'pacs009.001.08A'){
					msgdbMap.put("MESSAGECLASSTYPE", msgType1);
				}else {
					msgdbMap.put("MESSAGECLASSTYPE", msgType);
				}
					msgdbMap.put("MSG_FAMILY", "XML");
					logger.info('updateQueueIdMx: msgType = ' + msgType);
					var hKey =  msgType + "-"  + "CBPR" + "-" + msgDirection;
					logger.info('updateQueueIdMx: hKey = ' + hKey);
					var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + "CBPR" + "-" + msgDirection);
					logger.info('updateQueueIdMx: oQueueId in CBPR loop = '+ oQueueId);
					logger.info('updateQueueIdMx: msgType = ' + msgType);
				}else if(msgFamily == 'SEPA'){
					msgFamily = 'SEPA';
					msgdbMap.put("MESSAGECLASSTYPE", msgType);
					msgdbMap.put("MSG_FAMILY", "SEPA");
					var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
					logger.info('updateQueueIdMx: oQueueId Sepa = '+ oQueueId);
					logger.info('updateQueueIdMx: msgType = ' + msgType);
					logger.info('updateQueueIdMx: oQueueId in SEPA loop = '+ oQueueId);
				}else if((csm == 'TIPS' || csm == 'RT1') && msgFamily == 'SEPAINST'){
					msgFamily = 'SEPAINST';
					msgdbMap.put("MESSAGECLASSTYPE", msgType);
					msgdbMap.put("MSG_FAMILY", "SEPAINST");
					var hKey = msgType + "_"  + msgFamily + "-" + msgDirection;
					logger.info('updateQueueIdMx: hKey = ' + hKey);
					var oQueueId = memTblGetTableValue(map, "SCT_QUEUEID", hKey);
					logger.info('updateQueueIdMx: oQueueId from SCT_QUEUEID = '+ oQueueId);
					logger.info('updateQueueIdMx: msgType = ' + msgType);
				}
			}

			if(msgType == 'pain.001.001.09' ){
				msgdbMap.put("MSG_FAMILY", "CBPR");
			}

			logger.info('updateQueueIdMx: msgFamily = '+ msgFamily);

			if(msgFamily) {
				setHeader(map, "PLCN_msgFamily", msgFamily);
			}
			if(msgFamily != 'CBPR' && msgFamily != 'SEPA' && msgFamily != 'SEPAINST' && msgFamily != 'SWIFT' && msgFamily != 'TARGET2'){
				var comments = setCommentsForTransaction("00", "8181", map);
				oQueueId = 'ERRORQ';
				setHeader(map, "PLCN_XMLNS_PARSE_QUEUEID", oQueueId);
				return;
			}
			if(oQueueId != null){
				queueId = oQueueId;
			}
		}
	}else {
		msgdbMap.put("MESSAGECLASSTYPE", msgType);
		msgdbMap.put("MSG_FAMILY", msgFamily);
		
		//var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
		//SSBTC-331
		var tenantNamePath = institutionId + ".INSTITUTION_DETAILS.TENANT_NAME";
		logger.info("updateQueueIdMx: tenantName = " + tenantNamePath);
		var tenantName = memTblGetTableValue(map, "INST_PARAM",tenantNamePath);
		logger.info("updateQueueIdMx: tenantName = " + tenantName);
		
		if(tenantName == "SSB" & msgType === 'pacs.002.001.10' && msgFamily == "SEPA"){
			var ACKPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
			var ACKPathValue = getValueFromPath(Document, ACKPath);
		}
		var hKey = msgType + "_"  + msgFamily + "-" + msgDirection;
		logger.info('updateQueueIdMx: hKey = ' + hKey);
		
		if(ACKPathValue){
			if(isPatternPresent(ACKPathValue, "{451:")){
				hKey = msgType + "_"  + msgFamily + "_ACK" + "-" + msgDirection;//pacs.002.001.10_SEPA_ACK-O
				logger.info('updateQueueIdMx: hKey = ' + hKey);
			}
		}
		var oQueueId = memTblGetTableValue(map, "SCT_QUEUEID", hKey);
		queueId = oQueueId;
		logger.info('updateQueueIdMx: oQueueId from SCT_QUEUEID = '+ oQueueId);
		logger.info('updateQueueIdMx: msgType = ' + msgType);		
	}

	if(msgType == "pain.001.001.09") {
		priorityDatePath = "/Document/CstmrCdtTrfInitn/PmtInf/ReqdExctnDt/Dt";

		if(msgDirection == "I") {
			senderPath = "/Document/CstmrCdtTrfInitn/GrpHdr/InitgPty/Id/OrgId/AnyBIC";
			receiverPath = "/Document/CstmrCdtTrfInitn/GrpHdr/FwdgAgt/FinInstnId/BICFI";
		}
		else{
			senderPath = "/Document/AppHdr/Fr/FIId/FinInstnId/BICFI";
			receiverPath = "/Document/AppHdr/To/FIId/FinInstnId/BICFI";
		}
	}

	if(msgType == "pain.002.001.10") {
		if(msgDirection == "I") {
			receiverPath = "/Document/AppHdr/Fr/FIId/FinInstnId/BICFI";
			senderPath = "/Document/AppHdr/To/FIId/FinInstnId/BICFI";
		}
		else{
			receiverPath = "/Document/CstmrPmtStsRpt/GrpHdr/InitgPty/Id/OrgId/AnyBIC";
			senderPath = "/Document/CstmrPmtStsRpt/GrpHdr/FwdgAgt/FinInstnId/BICFI";
		}

		transRefNoPath = "/Document/CstmrPmtStsRpt/GrpHdr/MsgId";
	}

	if(msgType === 'pacs.004.001.09') {
		sender = getHeader(map, "PLCN_sender");
		logger.info("extractMetaData: sender = " + sender);		

		//if(!sender){
			var senderPath = "/Document/PmtRtr/GrpHdr/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!sender){
			var senderPath1 = "/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!receiver){
			var receiverPath = "/Document/PmtRtr/GrpHdr/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}

		//if(!receiver){
			var receiverPath1 = "/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}


 		var amountPath = '/Document/PmtRtr/GrpHdr/TtlRtrdIntrBkSttlmAmt';

 		var priorityDatePath = "/Document/PmtRtr/GrpHdr/IntrBkSttlmDt";

 		//if(!currency){
			var intrBkSttmtCcyPath = '/Document/PmtRtr/GrpHdr/TtlRtrdIntrBkSttlmAmt/@Ccy';
			var currency = getValueFromPath(Document, intrBkSttmtCcyPath);
			logger.info("extractMetaData:intrBkSttlmtCcy = " + currency);
			msgdbMap.put("CURRENCY", currency);
	}

	if(msgType === 'pacs.008.001.08') {
		sender = getHeader(map, "PLCN_sender");
		logger.info("updateQueueIdMx: sender = " + sender);		

		//if(!sender){
			var senderPath = "/Document/FIToFICstmrCdtTrf/GrpHdr/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!sender){
			var senderPath1 = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		var senderPath2 = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI";

		//if(!receiver){
			var receiverPath = "/Document/FIToFICstmrCdtTrf/GrpHdr/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}

		//if(!receiver){
			var receiverPath1 = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}

		var receiverPath2 = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI";

 		var amountPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt';

 		var priorityDatePath = "/Document/FIToFICstmrCdtTrf/GrpHdr/IntrBkSttlmDt";

 		//if(!currency){
			var intrBkSttmtCcyPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy';
			var currency = getValueFromPath(Document, intrBkSttmtCcyPath);
			logger.info("updateQueueIdMx:intrBkSttlmtCcy = " + currency);
			msgdbMap.put("CURRENCY", currency);

		//}
	}

	if(msgType === 'ACKX' || msgType === 'NAKX') {
		
		logger.info("updateQueueIdMx: msgType = " + msgType);	
		sender = getHeader(map, "PLCN_sender");
		logger.info("updateQueueIdMx: sender = " + sender);		
		/* if(sourceChannelId.toUpperCase() == "SWF-FIN-IN") {
		msgdbMap.put("MESSAGEDIRECTION", "O");
		}
		else {
			msgdbMap.put("MESSAGEDIRECTION", "O");
		} */
		
		msgdbMap.put("MESSAGEDIRECTION", "O");
		var senderReferencePath = "/DataPDU/Header/TransmissionReport/SenderReference";
		var senderReference = getValueFromPath(Document, senderReferencePath);	
		logger.info("updateQueueIdMx:senderReference = " + senderReference);
		msgdbMap.put("SENDER_REF", senderReference);
		
	}

	if(msgType === 'pacs.028.001.03') {
		sender = getHeader(map, "PLCN_sender");
		logger.info("extractMetaData: sender = " + sender);		

		//if(!sender){
			var senderPath = "/Document/FIToFIPmtStsReq/GrpHdr/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!receiver){
			var receiverPath = "/Document/FIToFIPmtStsReq/GrpHdr/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}

		priorityDatePath = "/Document/FIToFIPmtStsReq/TxInf/AccptncDtTm";
		transRefNoPath = "/Document/FIToFIPmtStsReq/TxInf/StsReqId";
	}

	if(msgType === 'pacs.002.001.10'){
		sender = getHeader(map, "PLCN_sender");
		logger.info("extractMetaData: sender = " + sender);		

		if(msgDirection == "I") {
			if(isPatternPresent(message, "FIToFIPmtStsRpt")) {
				var receiverPath = "/Document/FIToFIPmtStsRpt/GrpHdr/InstgAgt/FinInstnId/BICFI";
				var senderPath = "/Document/FIToFIPmtStsRpt/GrpHdr/InstdAgt/FinInstnId/BICFI";

			}else if(isPatternPresent(message, "FIToFIPmtStsRptSCL")) {
				var receiverPath = "/Document/FIToFIPmtStsRptSCL/GrpHdr/InstgAgt/FinInstnId/BICFI";
				var senderPath = "/Document/FIToFIPmtStsRptSCL/GrpHdr/InstdAgt/FinInstnId/BICFI";

			}
		}else {
			if(isPatternPresent(message, "FIToFIPmtStsRpt")) {
				var senderPath = "/Document/FIToFIPmtStsRpt/GrpHdr/InstgAgt/FinInstnId/BICFI";
				var receiverPath = "/Document/FIToFIPmtStsRpt/GrpHdr/InstdAgt/FinInstnId/BICFI";

			}else if(isPatternPresent(message, "FIToFIPmtStsRptSCL")) {
				var senderPath = "/Document/FIToFIPmtStsRptSCL/GrpHdr/InstgAgt/FinInstnId/BICFI";
				var receiverPath = "/Document/FIToFIPmtStsRptSCL/GrpHdr/InstdAgt/FinInstnId/BICFI";

			}
		}
		
		if(isPatternPresent(message, "FIToFIPmtStsRpt")) {
			priorityDatePath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/AccptncDtTm";
			transRefNoPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsId";

		}else if(isPatternPresent(message, "FIToFIPmtStsRptSCL")) {
			priorityDatePath = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/AccptncDtTm";
			transRefNoPath = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/StsId";
		}
	}

	if(msgType === 'camt.056.001.08') {
		var currency = getHeader(map, "PLCN_currency");
		logger.info("updateQueueIdMx: currency = " + currency);

		if(!currency){
			var intrBkSttmtCcyPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt/@Ccy';
			currency = getValueFromPath(Document, intrBkSttmtCcyPath);
			logger.info("updateQueueIdMx: intrBkSttlmtCcy = " + currency);	
			msgdbMap.put("CURRENCY", currency);	
		}

		var amountPath = getHeader(map, "PLCN_priorityAmount");
		logger.info("updateQueueIdMx: amountPath = " + amountPath);

		if(!amountPath){
			var amountPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt';
		}

		var priorityDate = getHeader(map, "PLCN_priorityDate");
		logger.info("updateQueueIdMx: priorityDate = " + priorityDate);

		if(!priorityDate){
			priorityDate = getHeader(map, "PLCN_valueDate");
			logger.info("updateQueueIdMx: priorityDate = " + priorityDate);
		}

		if(!priorityDate){
			var priorityDatePath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmDt';
			priorityDate = getValueFromPath(Document, priorityDatePath);
			logger.info("updateQueueIdMx: intrBkSttlmtDt = " + priorityDate);	
		}

		if(priorityDate){
			priorityDate = replaceAllPattern(priorityDate, "-", "");
		}
		
		
		logger.info("updateQueueIdMx: priorityDate = " + priorityDate);		

		setHeader(map, "PLCN_priorityDate", priorityDate);
		setHeader(map, "PLCN_valueDate", priorityDate);
		setHeader(map, "PLCNAPI_priorityDate", priorityDate);

		var transRefNo = getHeader(map, "PLCN_transRefNo");
		logger.info("updateQueueIdMx: transRefNo = " + transRefNo);		

		if(!transRefNo){
			var transRefNoPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlId';		
		}

		var sender = getHeader(map, "PLCN_sender");
		logger.info("updateQueueIdMx: sender = " + sender);	
		
		if(!sender){
			var senderPath = "/Document/FIToFIPmtCxlReq/Assgnmt/Assgnr/Agt/FinInstnId/BICFI";
		}


		var receiver = getHeader(map, "PLCN_receiver");
		logger.info("updateQueueIdMx: receiver = " + receiver);

		if(!receiver){
			var receiverPath = "/Document/FIToFIPmtCxlReq/Assgnmt/Assgne/Agt/FinInstnId/BICFI";
		}
	}

	if(msgType === 'camt.029.001.09') {
		var currency = getHeader(map, "PLCN_currency");
		logger.info("updateQueueIdMx: currency = " + currency);

		if(!currency){
			var intrBkSttmtCcyPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy';			
			currency = getValueFromPath(Document, intrBkSttmtCcyPath);
			logger.info("updateQueueIdMx: intrBkSttlmtCcy = " + currency);	
			msgdbMap.put("CURRENCY", currency);	
		}

		if(!currency){
			currency = 'EUR';
		}

		var amountPath = getHeader(map, "PLCN_priorityAmount");
		logger.info("updateQueueIdMx: amount = " + amountPath);

		if(!amountPath){
			var amountPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt';
		}

		var priorityDate = getHeader(map, "PLCN_priorityDate");
		logger.info("updateQueueIdMx: priorityDate from header = " + priorityDate);

		if(!priorityDate){
			priorityDate = getHeader(map, "PLCN_valueDate");
			logger.info("updateQueueIdMx: priorityDate from header = " + priorityDate);
		}

		if(!priorityDate){
			var priorityDatePath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmDt';
			//priorityDate = getValueFromPath(Document, intrBkSttmtDtPath);
			//logger.info("updateQueueIdMx: intrBkSttlmtDt = " + priorityDate);	
		}

		if(priorityDate){
			priorityDate = replaceAllPattern(priorityDate, "-", "");
		}
		
		
		logger.info("updateQueueIdMx: priorityDate = " + priorityDate);		

		setHeader(map, "PLCN_priorityDate", priorityDate);
		setHeader(map, "PLCN_valueDate", priorityDate);
		setHeader(map, "PLCNAPI_priorityDate", priorityDate);

		var transRefNo = getHeader(map, "PLCN_transRefNo");
		logger.info("updateQueueIdMx: transRefNo = " + transRefNo);		

		if(!transRefNo){
			var transRefNoPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsId';		
		}

		var sender = getHeader(map, "PLCN_sender");
		logger.info("updateQueueIdMx: sender = " + sender);	
		
		if(!sender){
			var senderPath = "/Document/RsltnOfInvstgtn/Assgnmt/Assgnr/Agt/FinInstnId/BICFI";
		}

		var receiver = getHeader(map, "PLCN_receiver");
		logger.info("updateQueueIdMx: receiver = " + receiver);

		if(!receiver){
			var receiverPath = "/Document/RsltnOfInvstgtn/Assgnmt/Assgne/Agt/FinInstnId/BICFI";
		}
	}

	if(msgType === 'pacs.003.001.08') {
		sender = getHeader(map, "PLCN_sender");
		logger.info("updateQueueIdMx: sender = " + sender);		

		//if(!sender){
			var senderPath = "/Document/FIToFICstmrDrctDbt/GrpHdr/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!sender){
			var senderPath1 = "/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!receiver){
			var receiverPath = "/Document/FIToFICstmrDrctDbt/GrpHdr/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}

		//if(!receiver){
			var receiverPath1 = "/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}

 		var amountPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/IntrBkSttlmAmt';

 		var priorityDatePath = "/Document/FIToFICstmrDrctDbt/GrpHdr/IntrBkSttlmDt";

		var intrBkSttmtCcyPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/IntrBkSttlmAmt/@Ccy';
		var currency = getValueFromPath(Document, intrBkSttmtCcyPath);
		logger.info("updateQueueIdMx:intrBkSttlmtCcy = " + currency);
		msgdbMap.put("CURRENCY", currency);
	}

	if(msgType === 'pacs.007.001.09') {
		sender = getHeader(map, "PLCN_sender");
		logger.info("extractMetaData: sender = " + sender);		

		//if(!sender){
			var senderPath = "/Document/FIToFIPmtRvsl/GrpHdr/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!sender){
			var senderPath1 = "/Document/FIToFIPmtRvsl/TxInf/InstgAgt/FinInstnId/BICFI";
			//sender = getValueFromPath(Document, senderPath);
		//}

		//if(!receiver){
			var receiverPath = "/Document/FIToFIPmtRvsl/GrpHdr/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}

		//if(!receiver){
			var receiverPath1 = "/Document/FIToFIPmtRvsl/TxInf/InstdAgt/FinInstnId/BICFI";
			//receiver = getValueFromPath(Document, receiverPath);		
		//}


 		var amountPath = '/Document/FIToFIPmtRvsl/GrpHdr/TtlRtrdIntrBkSttlmAmt';

 		var priorityDatePath = "/Document/FIToFIPmtRvsl/GrpHdr/IntrBkSttlmDt";

		var intrBkSttmtCcyPath = '/Document/FIToFIPmtRvsl/GrpHdr/TtlRtrdIntrBkSttlmAmt/@Ccy';
		var currency = getValueFromPath(Document, intrBkSttmtCcyPath);
		logger.info("extractMetaData:intrBkSttlmtCcy = " + currency);
		msgdbMap.put("CURRENCY", currency);
	}

	if(priorityDatePath) {
		var priorityDate = getValueFromPath(Document, priorityDatePath);
		logger.info("updateQueueIdMx: priorityDate = " + priorityDate);
		if(msgType === 'pacs.028.001.03' || msgType === 'pacs.002.001.10') {
			if(priorityDate) {
			priorityDate = priorityDate.substring(0, 10);
			}
		}

		if(priorityDate) {
			priorityDate = replaceAllPattern(priorityDate, "-", "");
			logger.info("updateQueueIdMx: priorityDate = " + priorityDate);
			msgdbMap.put("PRIORITYDATE", priorityDate);
		}
	}

	if(senderPath) {
		var sender = getValueFromPath(Document, senderPath);
		logger.info("updateQueueIdMx: sender = " + sender);
		if(!sender && senderPath1){
			var sender = getValueFromPath(Document, senderPath1);
			logger.info("updateQueueIdMx: sender from senderPath1 = " + sender);

			if(!sender && senderPath2){
				var sender = getValueFromPath(Document, senderPath2);
				logger.info("updateQueueIdMx: sender from senderPath2 = " + sender);
			}
		}
		msgdbMap.put("SENDER", sender);
	}

	if(receiverPath) {
		var receiver = getValueFromPath(Document, receiverPath);
		if(!receiver && receiverPath1){
			var receiver = getValueFromPath(Document, receiverPath1);
			logger.info("updateQueueIdMx: receiver from receiverPath1 = " + receiver);

			if(!receiver && receiverPath2){
				var receiver = getValueFromPath(Document, receiverPath2);
				logger.info("updateQueueIdMx: receiver from receiverPath2 = " + receiver);
			}
		}
		logger.info("updateQueueIdMx: receiver = " + receiver);
		msgdbMap.put("RECEIVER", receiver);
	}

	if(transRefNoPath) {
		var transRefNo = getValueFromPath(Document, transRefNoPath);
		logger.info("updateQueueIdMx: transRefNo = " + transRefNo);
		msgdbMap.put("TRANSREFNO", transRefNo);	
	}

	if(amountPath) {
		var txnAmount = getValueFromPath(Document, amountPath);
		logger.info("updateQueueIdMx: txnAmount = " + txnAmount);
		msgdbMap.put("PRIORITYAMOUNT", txnAmount);	
		msgdbMap.put("PRIORITYAMOUNTNUM", txnAmount);	
	}

	setHeader(map, "PLCN_XMLNS_PARSE_QUEUEID", queueId);

	logger.info("updateQueueIdMx: queueId = " + queueId);
	logger.info("updateQueueIdMx: messageNo = " + messageNo);
	
	var derivedProductCode = drveProductCode(exchange);
	logger.info("updateQueueIdMx: derivedProductCode = " + derivedProductCode);

	if(derivedProductCode) {
		logger.info("updateQueueIdMx: derivedProductCode = " + derivedProductCode);
		msgdbMap.put("DERIVED_PRODUCT", derivedProductCode);
	}

	institutionDerivation(exchange);

	var institutionId1 = getHeader(map, "PLCN_drvInstitutionId");
	logger.info("updateQueueIdMx: institutionId derived= " + institutionId1);

	if(!institutionId1){
		logger.info("updateQueueIdMx: inside if loop of !institutionId1");
		institutionId1 = getHeader(map, "PLCN_institutionId");
	}
	
	if(institutionId1){
		logger.info("updateQueueIdMx: inside if loop of institutionId1");
		msgdbMap.put("INSTITUTIONID", institutionId1);
	}
	
	logger.info("updateQueueIdMx: msgFamily = " + msgFamily);
	
	var orgXml = inMsg.getBody(java.lang.String.class);
	logger.info("updateQueueIdMx: orgXml = " + orgXml);
		
	var orgmsg = getHeader(map, "ACEDB_ORG");
  	logger.info("updateQueueIdMx: orgmsg = " + orgmsg);
	
	var nameSpace = getHeader(map, "PLCN_NameSpace");
  	logger.info("updateQueueIdMx: nameSpace present = " + nameSpace);
	
	var genericTag = getHeader(map, "PLCN_NameSpaceTag");
  	logger.info("updateQueueIdMx: genericTag present = " + genericTag);
	
	orgmsg = orgmsg.toString();
	logger.info("updateQueueIdMx: orgmsg = " + orgmsg);
	
	var len = orgmsg.length;
	logger.info("updateQueueIdMx: len = " + len);

	if (nameSpace == "Y"){
		if (genericTag) {
			if(isPatternPresent(orgmsg, "<"+genericTag+":Document")){	
		
				var startPoss = searchNthPattern (orgmsg, "<"+genericTag+":Document", 1);
				logger.info("updateQueueIdMx: startPoss = " + startPoss);
				
				var endPoss = searchNthPattern (orgmsg, ":Document>", 1);
				logger.info("updateQueueIdMx: endPoss = " + endPoss);
				
				var startPoss = startPoss - 1 ;
				var endPoss = endPoss + 9 ; 
				
				logger.info("updateQueueIdMx: startPoss = " + startPoss);
				logger.info("updateQueueIdMx: endPoss = " + endPoss);
				
				var startData = orgmsg.substr(0, startPoss);
				logger.info("updateQueueIdMx: startData = " + startData);
				
				var endData = orgmsg.substr(endPoss, len);
				logger.info("updateQueueIdMx: endData = " + endData);
				
				var startData1 = startData.toString();
				logger.info("updateQueueIdMx: startData1 = " + startData1);
				
				var endData1 = endData.toString();
				logger.info("updateQueueIdMx: endData1 = " + endData1);
			}
			
			if(isPatternPresent(orgmsg, "<Document")){	
		
				var startPoss = searchNthPattern (orgmsg, "<Document", 1);
				logger.info("updateQueueIdMx: startPoss = " + startPoss);
				
				var endPoss = searchNthPattern (orgmsg, "</Document>", 1);
				logger.info("updateQueueIdMx: endPoss = " + endPoss);
				
				var startPoss = startPoss - 1 ;
				var endPoss = endPoss + 10 ; 
				
				logger.info("updateQueueIdMx: startPoss = " + startPoss);
				logger.info("updateQueueIdMx: endPoss = " + endPoss);
				
				var startData = orgmsg.substr(0, startPoss);
				logger.info("updateQueueIdMx: startData = " + startData);
				
				var endData = orgmsg.substr(endPoss, len);
				logger.info("updateQueueIdMx: endData = " + endData);
				
				var startData1 = startData.toString();
				logger.info("updateQueueIdMx: startData1 = " + startData1);
				
				var endData1 = endData.toString();
				logger.info("updateQueueIdMx: endData1 = " + endData1);
				
				var docNmeSpace = "Y";
			
			}
		
			if(orgXml && orgXml != null){
		
				orgXml = orgXml.replaceAll("<", "<"+genericTag+":");
				logger.info("updateQueueIdMx: Message after replace half = " + orgXml);
				
				orgXml = orgXml.replaceAll("<"+genericTag+":/", "</"+genericTag+":");
				logger.info("updateQueueIdMx: Message after replace full = " + orgXml);
				
				var xmlnsTag = getHeader(map, "PLCN_Xmlns");
				logger.info("updateQueueIdMx: xmlnsTag present = " + xmlnsTag);
				
				if(xmlnsTag == "Y"){
					orgXml = orgXml.replaceAll("xmlns=", "xmlns:"+genericTag+"=");
					logger.info("updateQueueIdMx: Message after replace full xmlns tag = " + orgXml);						
				}
				
				if(docNmeSpace == "Y"){
					orgXml = orgXml.replace("<"+genericTag+":Document", "<Document");
					logger.info("updateQueueIdMx: after document replace = " + orgXml);
					orgXml = orgXml.replace("</"+genericTag+":Document", "</Document");
					logger.info("updateQueueIdMx: after document replace = " + orgXml);
				}
			}
		}			
	}
	
	if(msgFamily == "SEPAINST") {
		var list = new ArrayList();

		var Msgblock1 = new HashMap();
		var Msgblock2 = new HashMap();
		var Msgblock153 = new HashMap();
		var Msgblock154 = new HashMap();

		var msgBlock1 = getHeader(map, "ACEDB_MSGBLOCK1");
		logger.info("dbOperation: msgBlock1 = " + msgBlock1);
		Msgblock1.put("MESSAGE", msgBlock1);
		Msgblock1.put("MSGFAMILY", "XML");
		Msgblock1.put("MSGBLOCKTYPE", "1");
		list.add(Msgblock1);

		Msgblock2.put("MESSAGE", "CAMEL_EXCHANGE_BODY");
		//Msgblock2.put("MESSAGE", orgXml);
		Msgblock2.put("MSGFAMILY", "XML");
		Msgblock2.put("MSGBLOCKTYPE", "2");
		list.add(Msgblock2);
		
		var msgBlock153 = getHeader(map, "ACEDB_MSGBLOCK153");
		logger.info("dbOperation: msgBlock153 = " + msgBlock153);
		Msgblock153.put("MESSAGE", msgBlock153);
		Msgblock153.put("MSGFAMILY", "XML");
		Msgblock153.put("DISPLAY_FLAG", "Y");
		Msgblock153.put("MSGBLOCKTYPE", "153");
		list.add(Msgblock153);
		
		var msgBlock154 = getHeader(map, "ACEDB_MSGBLOCK154");
		logger.info("dbOperation: msgBlock154 = " + msgBlock154);
		Msgblock154.put("MESSAGE", msgBlock154);
		Msgblock154.put("MSGFAMILY", "XML");
		Msgblock154.put("DISPLAY_FLAG", "Y");
		Msgblock154.put("MSGBLOCKTYPE", "154");
		list.add(Msgblock154);
		
		setHeader(map, "ACEQ_WRITE_MSGBLOCKS", list);
	}
	
	encryptDecrypt = new EncryptDecrypt();
	hashCode = encryptDecrypt.getMessageDigest("SHA-1", exchange.getIn().getBody(java.lang.String.class));
	logger.info("updateQueueIdMx: hashCode = " + hashCode);

	msgdbMap.put("CUSTOM44", hashCode);
	msgdbMap.put("MESSAGEDIRECTION", msgDirection);
	//msgdbMap.put("INSTITUTIONID", "ACEABANK"); //for testing
	msgdbMap.put("PRIORITY", 9);
	msgdbMap.put("LOCKSTATUS", 0);
	msgdbMap.put("NUMOFMESSAGES", 1);
	msgdbMap.put("CATEGORY", 1);
	msgdbMap.put("DUPLICATE_RECORD_KEY", "");
	msgdbMap.put("PROCESSING_STAGE", "PEND");
	msgdbMap.put("NEXT_WORKFLOW_QUEUE_ID", "");
	msgdbMap.put("NEXT_WORKFLOW_STATUS", "");

	audit.put("MESSAGENO", messageNo);

	if(getHeader(map, "PLCN_isXML") == true) {
		audit.put("QUEUEID", queueId);
	}else {
		audit.put("QUEUEID", "MQINPIN");
	}

	//audit.put("USERNAME","ADMIN1");
	audit.put("APPLICATION","ACEQ_CMP");
	audit.put("MODULENAME","ACEQWRITE");
	audit.put("ACTION","UPDATE");
	audit.put("AUDITTEXT","Pelican ID " +  "<" + messageNo + ">" + " read from DB and written into Queue " +  "<" + queueId + ">");
	audit.put("INSTITUTIONID", institutionId1);

	setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
	setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
	setHeader(map, "GENAUDIT", audit);

	logger.info("updateQueueIdMx: msgdbMap = " + msgdbMap);
	logger.info("updateQueueIdMx: audit = " + audit);
	
	queueId = getHeader(map, "PLCN_XMLNS_PARSE_QUEUEID");
	
	if(!queueId) {
		logger.info("updateQueueIdMx: UNKNOWN queueId");
	
		var inputDate = readMsgdb.get("INPUTDATE");
		logger.info("updateQueueIdMx: inputDate = " + inputDate);
		
		var loc = memTblGetTableValue(map, "CHNL_TO_LOC_MAP", sourceChannelId);
		logger.info("updateQueueIdMx: loc = " + loc);
		
		if(loc){
			msgdbMap.put("MSGSEGR", loc);
			logger.info("updateQueueIdMx: derived location = " + loc);
		}

		var comments = setCommentsForTransaction("00", "10381", map);
		queueId = "PROCDQ";
		msgdbMap.put("COMMENTS", comments);
		msgdbMap.put("PROCESSING_STAGE", "FINL");
		msgdbMap.put("DISPLAY_FLAG", "Y");
		msgdbMap.put("PRIORITYDATE", inputDate);
		
		if(msgType == "ackx") {
			msgType = msgType.toUpperCase();
			msgdbMap.put("MESSAGECLASSTYPE", msgType);
		}
		
		audit.put("MESSAGENO", messageNo);
		audit.put("QUEUEID", queueId);
		audit.put("APPLICATION","ACEQ_CMP");
		audit.put("MODULENAME","ACEQWRITE");
		audit.put("ACTION","UPDATE");
		audit.put("AUDITTEXT","Pelican ID " +  "<" + messageNo + ">" + " read from DB and written into Queue " +  "<" + queueId + ">");
		audit.put("INSTITUTIONID", institutionId);
		
		setHeader(map, "GENAUDIT", audit);
		setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
		setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
		setHeader(map, "PLCN_XMLNS_PARSE_QUEUEID", "PROCDQ");
		setHeader(map, "PLCN_XMLNS_PARSE_STATUS", "102");
		
		logger.info("updateQueueIdMx: msgdbMap = " + msgdbMap);
		logger.info("updateQueueIdMx: audit = " + audit);
		return;		
	}
}

function drveProductCode(exchange) {
	var mode;
	var msgType;
	var productCode;
	var key;
	var institutionId;
	var drveProductCodeFlag;
	var drveProductCodeFlagPath;
	var sourceChannelId;
	var msgFamilyFlag;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In drveProductCode");

	institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("drveProductCode: institutionId = " + institutionId);

	mode = getHeader(map, "PLCN_msgModeIn");
	logger.info("drveProductCode: mode = " + mode);

	msgType = getHeader(map, "PLCN_msgType");
	logger.info("drveProductCode: msgType = " + msgType);

	if(msgType ==  "ackx" || msgType ==  "nakx"){
		msgType = msgType.toUpperCase();
	}

	msgFamily = getHeader(map, "PLCN_msgFamily");
	logger.info("drveProductCode: msgFamily = " + msgFamily);

	sourceChannelId = getHeader(map, "PLCN_sourceChannelId");
	logger.info("drveProductCode: sourceChannelId = " + sourceChannelId);

	drveProductCodeFlagPath = institutionId + "." + "MESSAGE_PROCESSING.FUNCTIONALITY.CHANNEL_MSGTYPE_CONFIG" + "." + sourceChannelId;
	drveProductCodeFlag = memTblGetTableValue(map, "INST_PARAM", drveProductCodeFlagPath);
	logger.info("drveProductCode: drveProductCodeFlag = " + drveProductCodeFlag);

	drveProductCodeFlag = "pacs.008.001.08|pacs.002.001.10";//for testing 260 BID

	
	//if(mode == "MANUAL" || mode == "UPLOAD") {
		//key = mode + "-" + msgType;
	//}

	mode = getHeader(map, "PLCN_msgModeIn");
	if(!mode) {
		mode = getHeader(map, "PLCN_mode")
	}
	logger.info("drveProductCode: mode = " + mode);

	if(msgFamily){
		if(mode == "MANUAL" || mode == "UPLOAD" || mode == "API") {
			key = msgFamily + "-" + mode + "-" + msgType;
		}else{
		key = msgFamily + "-" + sourceChannelId + "-" + msgType;
		}
		
		logger.info("drveProductCode: key = " + key);

		productCode = memTblGetTableValue(map, "PPAY_PRODUCT_CODE", key);
		logger.info("drveProductCode: productCode = " + productCode);
	}

	if(!productCode){
		key = sourceChannelId + "-" + msgType;
		logger.info("drveProductCode: key = " + key);

		productCode = memTblGetTableValue(map, "PPAY_PRODUCT_CODE", key);
		logger.info("drveProductCode: productCode = " + productCode);
	}

	if(!isPatternPresent(drveProductCodeFlag, msgType)) {
		productCode = "";
	}

	if(productCode) {
		setHeader(map, "PLCN_productCode", productCode);
		return productCode;
	}		
}

function checkMsgFamily(exchange) {
	var inMsg;
	var map;
	var readMsgdb;
	var Document;
	var msgFamily;

	logger.info("In checkMsgFamily");

	inMsg = exchange.getIn();
	map = inMsg.getHeaders();

	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.info("checkMsgFamily: messageBody = " + messageBody);

	if(isPatternPresent(messageBody, '<Document xmlns=') || isPatternPresent(messageBody, '<Document xmlns')  || isPatternPresent(messageBody, '<Document') || isPatternPresent(messageBody, '<usr>')) {
		setHeader(map, "PLCN_isXML", true);
		logger.info("checkMsgFamily: MX Message");
	}else{
		readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
		msgFamily = readMsgdb.get("MSG_FAMILY");
		
		if(msgFamily == "XML") {
			setHeader(map, "PLCN_isXML", true);
			logger.info("checkMsgFamily: MX Message");			
		}else {
			setHeader(map, "PLCN_isXML", false);
			logger.info("checkMsgFamily: MT Message");			
		}

	}	
}

function institutionDerivation(exchange){
	var sourceChannelId;
	var msgDirection;
	var queueid;
	var validInstitutionId;
	var institutionCheck;
	var senderPath;
	var sender = '';
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var map = inMsg.getHeaders();
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var msgdbMap = new HashMap();
	var audit = new HashMap();

	logger.info("In institutionDerivation");
	
	var msgType = readMsgdb.get("MESSAGECLASSTYPE"); //msgType = getMessageType(exchange);
	logger.info("institutionDerivation: msgType from MSGDB = " + msgType);
	
	var message = inMsg.getBody(java.lang.String.class);
	sourceChannelId = getHeader(map, "PLCN_channelIdSource");
	msgDirection = getHeader(map, "PLCN_msgDirection");
	logger.info("institutionDerivation: channelSource = " + sourceChannelId);
	logger.trace("institutionDerivation: message = " + message);
	logger.info("institutionDerivation: msgDirection = " + msgDirection);
	
	 if(isPatternPresent(message, "FIToFICstmrCdtTrf") || isPatternPresent(message, "FICdtTrf")){
		if(isPatternPresent(msgDirection, "I")){
			sender = dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
		}else if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<InstdAgt>", "</InstdAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);		
		}
	}
	
	if(isPatternPresent(message, "PmtRtr")){
		if(isPatternPresent(msgDirection, "I")){
			sender = dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
		}else if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<InstdAgt>", "</InstdAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);		
		}
	}
	
	if(isPatternPresent(message, "NtfctnToRcv")){
		sender = dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
		sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
	}

	if(isPatternPresent(message, "FIToFIPmtCxlReq")){
		if(isPatternPresent(msgDirection, "I")){
			//sender = dataBetweenTokens("<Assgnr>", "</Assgnr>", message);
			//sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
			senderPath = "/Document/FIToFIPmtCxlReq/Assgnmt/Assgnr/Agt/FinInstnId/BICFI";
			sender = getValueFromPath(Document, senderPath);
			logger.info("institutionDerivation of camt056: sender = " + sender);
		}else if(isPatternPresent(msgDirection, "O")){
			senderPath = "/Document/FIToFIPmtCxlReq/Assgnmt/Assgne/Agt/FinInstnId/BICFI";
			sender = getValueFromPath(Document, senderPath);
			logger.info("institutionDerivation of camt056 O: sender = " + sender);		
		}
	}

	if(isPatternPresent(message, "RsltnOfInvstgtn")){
		if(isPatternPresent(msgDirection, "I")){
			//sender = dataBetweenTokens("<Assgnr>", "</Assgnr>", message);
		//sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
			senderPath = "/Document/RsltnOfInvstgtn/Assgnmt/Assgnr/Agt/FinInstnId/BICFI";
			sender = getValueFromPath(Document, senderPath);
			logger.info("institutionDerivation of camt056: sender = " + sender);
		}else if(isPatternPresent(msgDirection, "O")){
			senderPath = "/Document/RsltnOfInvstgtn/Assgnmt/Assgne/Agt/FinInstnId/BICFI";
			sender = getValueFromPath(Document, senderPath);
			logger.info("institutionDerivation of camt056 O: sender = " + sender);		
		}
	}

	if(isPatternPresent(message, "FIToFIPmtStsReq")){
		if(isPatternPresent(msgDirection, "I")){
			sender = dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
		}else if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<InstdAgt>", "</InstdAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);		
		}
	}
	
	if(isPatternPresent(message, "FIToFIPmtStsRpt" || isPatternPresent(message, "FIToFIPmtStsRptSCL"))){
		if(isPatternPresent(msgDirection, "I")){
			sender = dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
		}else if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<InstdAgt>", "</InstdAgt>", message);
			logger.info("institutionDerivation: sender = " + sender);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
			logger.info("institutionDerivation: sender = " + sender);		
		}
	}

	if(isPatternPresent(message, "FIToFICstmrDrctDbt")){
		if(isPatternPresent(msgDirection, "I")){
			sender = dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
		}else if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<InstdAgt>", "</InstdAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);		
		}
	}

	if(isPatternPresent(message, "FIToFIPmtRvsl")){
		if(isPatternPresent(msgDirection, "I")){
			sender = dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
		}else if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<InstdAgt>", "</InstdAgt>", message);
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);		
		}
	}

	if(isPatternPresent(message, "CstmrCdtTrfInitn")){
		//if(isPatternPresent(msgDirection, "I")){
		//	sender = 'Document/CstmrCdtTrfInitn/GrpHdr/InitgPty/Id/OrgId/AnyBIC'//dataBetweenTokens("<InstgAgt>", "</InstgAgt>", message);
		//	sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
		//}else if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<FwdgAgt>", "</FwdgAgt>", message); //'Document/CstmrCdtTrfInitn/GrpHdr/FwdgAgt/FinInstnId/BICFI'
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);		
		//}
	}
	
	if(msgType == 'ACKX' || msgType == 'NAKX'){
		if(isPatternPresent(msgDirection, "O")){
			sender = dataBetweenTokens("<InstdAgt>", "</InstdAgt>", message); //to be check 
			sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
			logger.info("institutionDerivation: sender = " + sender);
		}
		if(!sender){
			if(isPatternPresent(msgDirection, "O")){
				sender = dataBetweenTokens("<From>", "</From>", message);
				sender =  dataBetweenTokens("<BICFI>", "</BICFI>", sender);
			}
		}else{
			sender = "ACEBBANK";
		}
		logger.info("institutionDerivation: sender = " + sender);
	}

	logger.info("institutionDerivation: sender = " + sender);
	
	if(!sender){
		sender = "ACEBBANK";
		logger.info("institutionDerivation: Default sender = " + sender);
	}

	if(sender){
		institutionCheck = memTblGetTableValue(map, "BIC_INST_LOCMAP_MAP", sender);
		logger.info("institutionDerivation: institutionCheck from first BIC_INST_LOCMAP_MAP = " + institutionCheck);
	}

	if(!institutionCheck && isPatternPresent(sender, "XXX")) {
		sender = removePattern(sender, "XXX");
		institutionCheck = memTblGetTableValue(map, "BIC_INST_LOCMAP_MAP", sender);
		logger.info("institutionDerivation: institutionCheck from second BIC_INST_LOCMAP_MAP = " + institutionCheck);
	}

	if(!institutionCheck) {
		institutionCheck = memTblGetTableValue(map, "BIC_INST_LOCMAP_MAP", "ACEBBANK");
		logger.info("institutionDerivation: institutionCheck from third BIC_INST_LOCMAP_MAP = " + institutionCheck);
	}

	setHeader(map, "PLCN_drvInstitutionId", institutionCheck);
	setHeader(map, "PLCNAPI_drvInstitutionId", institutionCheck);
}

function dbOperation(exchange) {
	logger.info("In dbOperation rule..");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var msgdbMap = new HashMap();
	var genaudit = new HashMap();
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");

	var status = "69";
	var comments = setCommentsForTransaction("00", "8000", map);

	var processingStage = getHeader(map, "PLCN_processingStage");
	logger.info("dbOperation: processingStage = " + processingStage);
	if(processingStage) {
		setHeader(map, "PLCN_processingStage", processingStage);
	}else {
		setHeader(map, "PLCN_processingStage", "FINL");
		msgdbMap.put("PROCESSING_STAGE", "FINL");
		msgdbMap.put("DISPLAY_FLAG", "Y");
	}

	var msgdbId = getHeader(map, "PLCN_msgDbId");
	logger.info("dbOperation: msgdbId = " + msgdbId);

	var messageNo = getHeader(map, "PLCN_messageNo");
	logger.info("dbOperation: messageNo = " + messageNo);	
	if(messageNo) {
		genaudit.put("MESSAGENO", messageNo);
	}

	var institutionId = getHeader(map, "PLCN_institutionId");
	//institutionId = getHeader(map, "PLCN_institutionId1");
	logger.info("dbOperation: institutionId = " + institutionId);
	if(institutionId) {
		genaudit.put("INSTITUTIONID", institutionId);
	}

	var msgFamily = getHeader(map, "PLCN_msgFamily");
	logger.info("dbOperation: institutionId = " + institutionId);
	
	msgdbMap.put("QUEUEID", "PROCDQ");
	msgdbMap.put("COMMENTS", comments);

	var sourceChannelId = readMsgdb.get("CHANNEL_ID_SOURCE");
	logger.info("dbOperation: sourceChannelId = " + sourceChannelId);
    var loc = memTblGetTableValue(map, "CHNL_TO_LOC_MAP", sourceChannelId);
	logger.info("dbOperation: loc = " + loc);
	
    if(loc){
        setHeader(map, "PLCN_msgSegr", loc);
        logger.info("dbOperation: derived location = " + loc);
    }else{
		loc = "DEFAULT";
		logger.info("dbOperation: no location derived from channel");
	}
	
	msgdbMap.put("PRIORITYDATE", inputdate);
	msgdbMap.put("MSGSEGR", loc);

	var inputdate =  readMsgdb.get("INPUTDATE");
	logger.info("dbOperation: inputdate = " + inputdate);
	msgdbMap.put("PRIORITYDATE", inputdate);
	
	var audit = new HashMap();

	audit.put("MESSAGENO", messageNo);
	audit.put("SEQUENCENO", 123)
	audit.put("QUEUEID", "PROCDQ");
	audit.put("APPLICATION","CROUTE");
	audit.put("MODULENAME","DEBULK");
	audit.put("ACTION","DEBULK");
	audit.put("AUDITTEXT","Message Moved to '<PROCDQ'>");
	audit.put("INSTITUTIONID", institutionId);

	var txnStatus = "66";

	msgdbMap.put("STATUS", txnStatus);
	
	if(msgFamily) {
		msgdbMap.put("MSG_FAMILY", msgFamily);		
	}

	var recordGroupType = "B";

	setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
	//setHeader(map, "ACEQ_WRITE_MSGBLOCKS", msgBlocksMap);
	setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
	setHeader(map, "GENAUDIT", audit);

	logger.info("dbOperation rule completed..")
}

function dbOperationErrorQ(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var msgdbMap = new HashMap();
	var audit = new HashMap();
	var sourceChannelId;
	var channelIdTarget;
	var queueId;

	logger.info("In dbOperationErrorQ");
	
	var institutionId =  readMsgdb.get("INSTITUTIONID");
	logger.info("dbOperationErrorQ: institutionId = " + institutionId);
	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	//logger.info("dbOperationErrorQ: Document = " + Document);
	
	var message = inMsg.getBody(java.lang.String.class);
	logger.info("dbOperationErrorQ: message = " + message);
	
	var inputdate =  readMsgdb.get("INPUTDATE");
	logger.info("dbOperationErrorQ: inputdate = " + inputdate);

	var sourceChannelId = readMsgdb.get("CHANNEL_ID_SOURCE");
	channelIdTarget = memTblGetTableValue(map, "MQ_CHANNEL_CONF_MAP", sourceChannelId);
	logger.info("dbOperationErrorQ: sourceChannelId = " + sourceChannelId);
	logger.info("dbOperationErrorQ: channelIdTarget = " + channelIdTarget);
	
	var msgType = readMsgdb.get("MESSAGECLASSTYPE");
	logger.info("dbOperationErrorQ: msgType from MSGDB = " + msgType);
	
	var directionChkKey = sourceChannelId + "-"  + msgType;
	logger.info('dbOperationErrorQ: directionChkKey = ' + directionChkKey);
	var msgDirection = memTblGetTableValue(map, "DIRECTION_CHK_MAP", directionChkKey);
	logger.info("dbOperationErrorQ: msgDirection using directionChkKey = " + msgDirection);

	if(!msgDirection){
		msgDirection = memTblGetTableValue(map, "DIRECTION_CHK_MAP", sourceChannelId);
		logger.info("dbOperationErrorQ: msgDirection = " + msgDirection);
	}
	
	if(msgDirection == "I") {
		logger.info("dbOperationErrorQ: msgDirection = I");
		//msgdbMap.put("NEXT_WORKFLOW_QUEUE_ID", "PROCDQ");
		//msgdbMap.put("NEXT_WORKFLOW_STATUS", "102");
		//SSBTC-342
		msgdbMap.put("NEXT_WORKFLOW_QUEUE_ID", "ERRORQ");
		msgdbMap.put("NEXT_WORKFLOW_STATUS", "304");
		queueId = "TMPMSGQ";
		setHeader(map, "PLCN_status", 69);
	}else{
		logger.info("dbOperationErrorQ: msgDirection = O");
		/* queueId = "PROCDQ";
		setHeader(map, "PLCN_status", 102); */
		//SSBTC-342
		queueId = "ERRORQ";
		setHeader(map, "PLCN_status", 304);
	}
	
	var tenantNamePath = institutionId + ".INSTITUTION_DETAILS.TENANT_NAME";
	logger.info("dbOperationErrorQ: tenantName = " + tenantNamePath);
	tenantName = memTblGetTableValue(map, "INST_PARAM",tenantNamePath);
	logger.info("dbOperationErrorQ: tenantName = " + tenantName);
	
	//channelIdSource = getHeader(map, "PLCN_channelIdSource");
    loc = memTblGetTableValue(map, "CHNL_TO_LOC_MAP", sourceChannelId);
    if(loc){
        setHeader(map, "PLCN_msgSegr", loc);
        logger.info("dbOperationErrorQ: derived location = " + loc);
    }else{
		loc = "DEFAULT";
		logger.info("dbOperationErrorQ: no location derived from channel");
	}
	/* const DOMParser();
	
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, "application/xml");

	const ns = "urn:iso:std:iso:20022:tech:xsd:"; */
	/* const xmlString = inMsg.getBody(java.lang.String.class);
	const amountEl = xmlString.getElementsByTagName(xmlString, "IntrBkSttlmAmt")[0];

	if (amountEl) {
	  const amount = amountEl.textContent;
	  const currency = amountEl.getAttribute("Ccy");
	  logger.info("dbOperationErrorQ: amount = " + amount);
	} else {
	  logger.info("dbOperationErrorQ: Amount not found ");
	} */
	
	/* var amountPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt';
 	var txnAmount = getValueFromPath(Document, amountPath);
	logger.info("dbOperationErrorQ: txnAmount = " + txnAmount); */
	
	
	/* var Amount = dataBetweenTokens("<InstrId>", "<InstrId>", message);
	logger.info("dbOperationErrorQ: Amount = " + Amount); */
	var amount;
	var amtMatch = message.match(/<IntrBkSttlmAmt[^>]*>(.*?)<\/IntrBkSttlmAmt>/);
	logger.info("dbOperationErrorQ: amtMatch = " + amtMatch);
	
	if (amtMatch) {
     var amount = amtMatch[1];
	 logger.info("dbOperationErrorQ: amount = " + amount);
    }

	if(amount){
		msgdbMap.put("PRIORITYAMOUNT", amount);
		msgdbMap.put("PRIORITYAMOUNTNUM", amount);
	}
	
	setHeader(map, "PLCN_queueId", queueId);
	setHeader(map, "PLCN_call", true);
	//msgdbMap.put("PROCESSING_STAGE", "FINL");
	msgdbMap.put("PROCESSING_STAGE", "ERR");
	msgdbMap.put("DISPLAY_FLAG", "Y");
	msgdbMap.put("CHANNEL_ID_TARGET", channelIdTarget);
	msgdbMap.put("SOURCECHANNELID", sourceChannelId);
	msgdbMap.put("TENANT_NAME", tenantName);
	msgdbMap.put("PRIORITYDATE", inputdate);
	msgdbMap.put("MSGSEGR", loc);

	setCommentsForTransaction("00", "17283", map);
	var comments = getHeader(map, "PLCN_txnComments");
	logger.info("dbOperationErrorQ: comments = " + comments);
	msgdbMap.put("COMMENTS", comments);
		
	createResponse(exchange);
	
	var responseCdsDoc = getHeader(map, "ACEDB_responseCdsDoc");
	logger.trace("dbOperationErrorQ: typeof responseCdsDoc = " + typeof responseCdsDoc);
	logger.info("dbOperationErrorQ: responseCdsDoc = " + responseCdsDoc);

	var list = new ArrayList();
	var msgblock6 = new HashMap();
	msgblock6.put("MSGBLOCKTYPE", "6");
	msgblock6.put("MESSAGE", responseCdsDoc);
	msgblock6.put("MSGFAMILY", "XML");
	list.add(msgblock6);
	logger.info("dbOperationErrorQ: msgblock6 = " + msgblock6);
	logger.info("dbOperationErrorQ: msgblock6 inserted");
	
	var readMsgBlocks = inMsg.getHeaders().get("ACEQ_READ_MSGBLOCKS");
	var msgBlock154DB = readMsgBlocks.get("MSGBLOCK154");
	logger.info("dbOperationErrorQ: msgBlock154DB = " + msgBlock154DB);
	
	if(!msgBlock154DB) {
		var msgblock154 = new HashMap();
		msgblock154.put("MSGBLOCKTYPE", "154");
		msgblock154.put("MESSAGE", "CAMEL_EXCHANGE_BODY");
		msgblock154.put("MSGFAMILY", "XML");
		list.add(msgblock154);	
		logger.info("dbOperationErrorQ: msgblock154 inserted");
	}
	
	logger.trace("dbOperationErrorQ: list = " + list);
	logger.info("dbOperationErrorQ: msgdbMap = " + msgdbMap);

	var messageNo = readMsgdb.get("MESSAGENO");
	logger.info("dbOperationErrorQ: messageNo = " + messageNo);

	audit.put("MESSAGENO", messageNo);
	audit.put("QUEUEID", queueId);
	//audit.put("USERNAME","ADMIN1");
	audit.put("APPLICATION","CROUTE");
	audit.put("MODULENAME","ACEQWRITE");
	audit.put("ACTION","WRITE");
	audit.put("AUDITTEXT","Pelican ID " +  "<" + messageNo + ">" + " read from DB and written into Queue " +  "<" + queueId + ">");
	audit.put("INSTITUTIONID", institutionId);

	setHeader(map, "GENAUDIT", audit);
	setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
	setHeader(map, "ACEQ_WRITE_MSGBLOCKS", list);
	setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
	
	logger.info("dbOperationErrorQ completed");
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

	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	//logger.trace("createResponse: typeof Document = " + typeof Document);

	var validMessage = getHeader(map, "PLCN_validMessage");
	var msgType = getHeader(map, "PLCN_msgType");
	var status = getHeader(map, "status");

	var plcnFlag = getHeader(map, "PLCN_call");
	logger.info("createResponse: plcnFlag = " + plcnFlag);
	logger.info("createResponse: typeof plcnFlag = " + typeof plcnFlag);
	plcnFlag = plcnFlag.toString();
	logger.info("createResponse: typeof plcnFlag = " + typeof plcnFlag);

	var xsdValid = getHeader(map, "XSD_VALID");
	logger.info("createResponse: xsdValid = " + xsdValid);
	logger.info("createResponse: typeof xsdValid = " + typeof xsdValid);

	/*var t2Valid = getHeader(map, "PLCN_t2Valid");
	logger.info("createResponse: t2Valid = " + t2Valid);
	logger.info("createResponse: typeof t2Valid = " + typeof t2Valid);*/


	//if its an internal call response code is stored in ACEDB_responseCdsDoc (in T2 & CBPR server) otherwise PLCN_responseCdsDoc 
	if(plcnFlag.toString() == "true") {
		if(xsdValid.toString() == "false") {
			responseCdsString = getHeader(map, "ACEDB_responseCdsDoc");
		}else {
			responseCdsString = null;
		}
	}else {
		if(xsdValid.toString() == "false" /*|| t2Valid.toString() == "false"*/) {
			responseCdsString = getHeader(map, "PLCN_responseCdsDoc");
		}else {
			responseCdsString = null;
		}
	}

	//logger.trace("createResponse: responseCdsString = " + responseCdsString);
	logger.info("createResponse: typeof responseCdsString = " + typeof responseCdsString);

	logger.trace("createResponse: validMessage = " + validMessage);
	logger.info("createResponse: typeof validMessage = " + typeof validMessage);
	logger.info("createResponse: status = " + status);
	logger.info("createResponse: msgType = " + msgType);

	if(!msgType) {
		var documentString = inMsg.getBody(java.lang.String.class);

		if(isPatternPresent(documentString, "<FIToFIPmtStsRpt>") || isPatternPresent(documentString, "FIToFIPmtStsRptSCL")) {
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
		setHeader(map, "status", "error");

		if(plcnFlag == "true") {
			var responseDoc = createDocument(responseCdsString);
		}else {
			var responseDoc = responseCdsString;
		}

		logger.info("createResponse: typeof responseDoc = " + typeof responseDoc);

		var responseCdsPlcnFmt = responseDoc.getElementsByTagName("ResponseCdsPlcnFmt");
		var nextNode = responseCdsPlcnFmt.item(0);

		logger.info("createResponse: j = " + j);
		logger.info("createResponse: vCount = " + vCount);

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
			logger.info("createResponse: langDescKey = " + langDescKey);
			logger.info("createResponse: DescriptionValue from PAYALY = " + DescriptionValue);

			if(!DescriptionValue) {
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "ACEERR|" + fldViolation[j]);
				logger.info("createResponse: langDescKey = " + langDescKey);
				logger.info("createResponse: DescriptionValue from ACEERR = " + DescriptionValue);
			}

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
		var retVal = setValueInTxtNode(responseDoc, responseCdsPath, plcnCodesValues);
		logger.info("createResponse: retVal = " + retVal);
		setHeader(map, "PLCN_validMessage", "false");
	}else if(txnCommentsDB) {
		//create
		logger.info("createResponse: creating response code");
		var responseDoc = getDocument();
		//logger.trace("createResponse: responseDoc = " + responseDoc);

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
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "PLATERR|" + fldViolation[j]);
				logger.info("createResponse: langDescKey = " + "PLATERR|" + fldViolation[j]);
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
		for(j = 0; j < CdTpValue.length; j++) {
			logger.info("createResponse: CdTpValue = " + CdTpValue[j]);

			if(CdTpValue[j] == "Error") {
				setHeader(map, "status", "error");
			}else {
				setHeader(map, "status", "valid");
			}
		}
	}

	//logger.trace("createResponse: responseDoc = " + responseDoc);
	logger.info("createResponse: status = " + getHeader(map, "status"));

	if(responseDoc){
		//logger.trace("createResponse: responseDoc = " + responseDoc);
		logger.info("createResponse: typeof responseDoc = " + typeof responseDoc);
		var responseCdsString = getPrettyPrint(responseDoc);
		//logger.trace("createResponse: responseCdsString = " + responseCdsString);
		var internalFlag = getHeader(map, "PLCN_call");
		logger.info("createResponse: internalFlag = " + internalFlag);

		if(!internalFlag){
			inMsg.setBody(responseCdsString);
		}else {
			setHeader(map, "ACEDB_responseCdsDoc", responseCdsString);
		}
	}	
}