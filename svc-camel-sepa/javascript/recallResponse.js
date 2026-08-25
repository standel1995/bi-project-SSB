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
var InputSource = Java.type("org.xml.sax.InputSource");
var StringReader = Java.type("java.io.StringReader");
var OutputKeys = Java.type("javax.xml.transform.OutputKeys");
var GenerateMsgno = Java.type("ai.pelican.camel.component.aceq.GenerateMsgno");
var SimpleDateFormat=Java.type('java.text.SimpleDateFormat');

function setBody(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setBody");

	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.trace("setBody: messageBody = " + messageBody);
	setHeader(map, "ACEDB_originalBody", messageBody);
	setHeader(map, "PLCN_validResponse", "true");
}

function decodeRequest(exchange) {
	var decodedMessage = [];
	var invalidReq = true;
	var callValidationAPI;
	var callWFAPI;
	var flowID;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In decodeRequest");
	setHeader(map, "PLCN_recallResponseAPI", true);

	var jsonData = exchange.getIn().getBody(java.lang.String.class);
	setHeader(map, "ACEDB_reqBody", jsonData);
	setHeader(map, "ACEDB_originalBody", jsonData);	
	logger.info("decodeRequest: jsonData = " + jsonData);

	mydata = JSON.parse(jsonData);
	logger.info("decodeRequest: mydata = " + mydata);

	var paymentId = mydata["pelican_payment_id"];
	logger.info("decodeRequest: paymentId = " + paymentId);
	setHeader(map, "PLCN_paymentId", paymentId);

	var recallId = mydata["pelican_recall_id"];
	logger.info("decodeRequest: recallId = " + recallId);
	setHeader(map, "PLCN_recallId", recallId);
	
	var messageFamilyReq = mydata["message_family"];
	logger.info("decodeRequest: messageFamilyReq = " + messageFamilyReq);
	setHeader(map, "ACEDB_messageFamilyReq", messageFamilyReq);

	var recallResponse = mydata["recall_response"];
	logger.info("decodeRequest: recallResponse = " + recallResponse);
	setHeader(map, "PLCN_recallResponse", recallResponse);
	setHeader(map, "SRC_PaymentType", "SepainstCamt.056.001.08");

	if(recallResponse == "ACCEPTED") {
		setHeader(map, "TGT_PaymentType", "SepainstPacs.004.001.09");
		setHeader(map, "PLCN_msgType", "pacs.004.001.09");

		var returnIdentification = mydata["return_identification"];
		logger.info("decodeRequest: returnIdentification = " + returnIdentification);
		setHeader(map, "PLCN_returnIdentification", returnIdentification);

		var returnExecutionDate = mydata["return_execution_date"];
		logger.info("decodeRequest: returnExecutionDate = " + returnExecutionDate);
		setHeader(map, "PLCN_returnExecutionDate", returnExecutionDate);

		var settlementMethod = mydata["settlement_method"];
		logger.info("decodeRequest: settlementMethod = " + settlementMethod);
		setHeader(map, "PLCN_settlementMethod", settlementMethod);

		var settlementAccount = mydata["settlement_account"];
		logger.info("decodeRequest: settlementAccount = " + settlementAccount);
		setHeader(map, "PLCN_settlementAccount", settlementAccount);

		var clearingSystem = mydata["clearing_system"];
		logger.info("decodeRequest: clearingSystem = " + clearingSystem);
		setHeader(map, "PLCN_clearingSystem", clearingSystem);

		var additionalInfo = mydata["additional_info"];
		logger.info("decodeRequest: additionalInfo = " + additionalInfo);
		setHeader(map, "PLCN_additionalInfo", additionalInfo);

		var chargesCurrency = mydata["charges_currency"];
		logger.info("decodeRequest: chargesCurrency = " + chargesCurrency);
		setHeader(map, "PLCN_chargesCurrency", chargesCurrency);

		if(chargesCurrency) {
			var chargesAmount = mydata["charges_amount"];
			logger.info("decodeRequest: chargesAmount = " + chargesAmount);
			setHeader(map, "PLCN_chargesAmount", chargesAmount);

			var chargeBearer = mydata["charge_bearer"];
			logger.info("decodeRequest: chargeBearer = " + chargeBearer);
			setHeader(map, "PLCN_chargeBearer", chargeBearer);
		}

		var additionalInfo = mydata["additional_info"];
		logger.info("decodeRequest: additionalInfo = " + additionalInfo);
		additionalInfo = additionalInfo.substring(0, 98);
		logger.info("decodeRequest: additionalInfo till 98 char = " + additionalInfo);
		setHeader(map, "PLCN_additionalInfo", additionalInfo);

		var clearingSystem = mydata["clearing_system"];
		logger.info("decodeRequest: clearingSystem = " + clearingSystem);
		setHeader(map, "PLCN_clearingSystem", clearingSystem);	
	}else{
		setHeader(map, "TGT_PaymentType", "SepainstCamt.029.001.09");
		setHeader(map, "PLCN_msgType", "camt.029.001.09");

		var rejectReason = mydata["reject_reason"];
		logger.info("decodeRequest: rejectReason = " + rejectReason);
		setHeader(map, "PLCN_rejectReason", rejectReason);

		var additionalLegalInfo = mydata["additional_legal_info"];
		logger.info("decodeRequest: additionalLegalInfo = " + additionalLegalInfo);
		setHeader(map, "PLCN_additionalLegalInfo", additionalLegalInfo);

		var additionalInfo = mydata["additional_info"];
		logger.info("decodeRequest: additionalInfo = " + additionalInfo);
		setHeader(map, "PLCN_additionalInfo", additionalInfo);
	}

	var originatorName = mydata["originator_name"];
	logger.info("decodeRequest: originatorName = " + originatorName);
	setHeader(map, "PLCN_originatorName", originatorName);

	if(!originatorName) {
		var originatorBic = mydata["originator_bic"];
		logger.info("decodeRequest: originatorBic = " + originatorBic);
		setHeader(map, "PLCN_originatorBic", originatorBic);		
	}

	var message = '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.056.001.08"><FIToFIPmtCxlReq><Assgnmt><Id>ref-10</Id><Assgnr><Agt><FinInstnId><BICFI>NIBCNLNVXXX</BICFI></FinInstnId></Agt></Assgnr><Assgne><Agt><FinInstnId><BICFI>ACEABANKXXX</BICFI></FinInstnId></Agt></Assgne><CreDtTm>2024-06-12T13:29:05+05:30</CreDtTm></Assgnmt><CtrlData><NbOfTxs>1</NbOfTxs></CtrlData><Undrlyg><TxInf><CxlId>ref-10</CxlId><OrgnlGrpInf><OrgnlMsgId>DP:XYZ-144</OrgnlMsgId><OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId></OrgnlGrpInf><OrgnlInstrId>DP?XYZ-144</OrgnlInstrId><OrgnlEndToEndId>DP?XYZ-144</OrgnlEndToEndId><OrgnlTxId>DP-MSID432388-144</OrgnlTxId><OrgnlIntrBkSttlmAmt Ccy="EUR">144</OrgnlIntrBkSttlmAmt><OrgnlIntrBkSttlmDt>2024-06-19</OrgnlIntrBkSttlmDt><CxlRsnInf><Orgtr><Id><OrgId><AnyBIC>NIBCNLNVXXX</AnyBIC></OrgId></Id></Orgtr><Rsn><Cd>DUPL</Cd></Rsn></CxlRsnInf><OrgnlTxRef><SttlmInf><SttlmMtd>INGA</SttlmMtd></SttlmInf><PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl><LclInstrm><Cd>INST</Cd></LclInstrm></PmtTpInf><RmtInf><Ustrd>0000ABCDEFGHILMNOPQR</Ustrd></RmtInf><Dbtr><Pty><Nm>DebtorName</Nm></Pty></Dbtr><DbtrAcct><Id><IBAN>AT483200000012345864</IBAN></Id></DbtrAcct><DbtrAgt><FinInstnId><BICFI>PBBKITRRXXX</BICFI></FinInstnId></DbtrAgt><CdtrAgt><FinInstnId><BICFI>PBBKITRR002</BICFI></FinInstnId></CdtrAgt><Cdtr><Pty><Nm>BeneficiaryName</Nm></Pty></Cdtr><CdtrAcct><Id><IBAN>BE71096123456769</IBAN></Id></CdtrAcct></OrgnlTxRef></TxInf></Undrlyg></FIToFIPmtCxlReq></Document>';
	logger.info("decodeRequest: message = " + message);
	logger.info("decodeRequest: typeof message = " + typeof message);

	//testDecoder(exchange);
	
	//inMsg.setBody(message);	

	var messageFamily = messageFamilyReq;
	logger.info("decodeRequest: messageFamily = " + messageFamily);

	messageFamily = messageFamily.toUpperCase();

	setHeader(map, "PLCN_msgFamily", messageFamily);
}

function dbOperationRecallResponse(exchange) {
	var inMsg = exchange.getIn();	
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var msgdbMap = new HashMap();
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var audit = new HashMap();
	var msgdbMap = new HashMap();
	var queueId;
	var msgBlockFamily;
	var msgBlock6;
	var institutionId;
	var senderPath;
	var receiverPath;
	var priorityAmountPath;
	var transRefNoPath;
	var customerAccNoPath;
	var customerAccNoPath2;
	var customerAccNo;
	var accountDr;
	var creditorAccPth;
	var creditorAccPth2;
	var valueDatePath;
	var cdtrPtyNmPath
	var accountCr;
	var priorityAmtNo;

	logger.info("In dbOperationRecallResponse");

	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.trace("dbOperationRecallResponse: messageBody = " + messageBody);

	var msgType = getHeader(map, "PLCN_msgType");	
	logger.info("dbOperationRecallResponse: msgType = " + msgType);

	if(msgType == "pacs.004.001.09") {
		senderPath = "Document/PmtRtr/GrpHdr/InstgAgt/FinInstnId/BICFI";
		receiverPath = "Document/PmtRtr/GrpHdr/InstdAgt/FinInstnId/BICFI";
		priorityAmountPath = "Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt";
		transRefNoPath = "Document/PmtRtr/TxInf/OrgnlEndToEndId";
		customerAccNoPath = "Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAcct/Id/IBAN";
		customerAccNoPath2 = "Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAcct/Othr/Id";
		creditorAccPth = "Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAcct/Id/IBAN";
		creditorAccPth2 = "Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAcct/Othr/Id";
		valueDatePath = "Document/PmtRtr/GrpHdr/IntrBkSttlmDt";
		cdtrPtyNmPath = "Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Nm";
	}else if(msgType == "camt.029.001.09") {
		senderPath = "Document/RsltnOfInvstgtn/Assgnmt/Assgnr/Agt/FinInstnId/BICFI";
		receiverPath = "Document/RsltnOfInvstgtn/Assgnmt/Assgne/Agt/FinInstnId/BICFI";
		priorityAmountPath = "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt";
		transRefNoPath = "Document/RsltnOfInvstgtn/Assgnmt/Id";
		customerAccNoPath = "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/DbtrAcct/Id/IBAN";
		customerAccNoPath2 = "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/DbtrAcct/Othr/Id";
		creditorAccPth = "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/CdtrAcct/Id/IBAN";
		creditorAccPth2 = "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/CdtrAcct/Othr/Id";
		valueDatePath = "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmDt";
		cdtrPtyNmPath = "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Nm";
	}

	if(customerAccNoPath) {
		customerAccNo = getValueFromPath(Document, customerAccNoPath);
		logger.info("dbOperationRecallResponse: customerAccNo = " + customerAccNo);

		if(!customerAccNo) {
			customerAccNo = getValueFromPath(Document, customerAccNoPath2);
			logger.info("dbOperationRecallResponse: customerAccNo = " + customerAccNo);		
		}

		accountDr = customerAccNo;
		msgdbMap.put("CUSTOMERACCNO", customerAccNo);
		msgdbMap.put("ACCOUNT_DR", accountDr);
	}

	if(creditorAccPth) {
		accountCr = getValueFromPath(Document, creditorAccPth);
		logger.info("dbOperationRecallResponse: accountCr = " + accountCr);

		if(!accountCr) {
			accountCr = getValueFromPath(Document, creditorAccPth2);
			logger.info("dbOperationRecallResponse: accountCr = " + accountCr);		
		}

		msgdbMap.put("ACCOUNT_CR", accountCr);
	}

	var cdtrPtyNm = getValueFromPath(Document, cdtrPtyNmPath);
	logger.info("dbOperationRecallResponse: cdtrPtyNm = " + cdtrPtyNm);

	if(cdtrPtyNm) {
		msgdbMap.put("OTHER_PARTY_DETAILS", cdtrPtyNm);
	}

	var sender = getValueFromPath(Document, senderPath);
	logger.info("dbOperationRecallResponse: sender = " + sender);
	msgdbMap.put("SENDER", sender);
	msgdbMap.put("INSTRUCTINGAGENT", sender);

	if(sender){
		institutionId = memTblGetTableValue(map, "BIC_INST_LOCMAP_MAP", sender);
		logger.info("dbOperationRecallResponse: institutionId from first BIC_INST_LOCMAP_MAP = " + institutionId);
	}

	if(!institutionId && isPatternPresent(sender, "XXX")) {
		sender = removePattern(sender, "XXX");
		institutionId = memTblGetTableValue(map, "BIC_INST_LOCMAP_MAP", sender);
		logger.info("dbOperationRecallResponse: institutionId from second BIC_INST_LOCMAP_MAP = " + institutionId);
	}

	var validMessage = getHeader(map, "PLCN_validMessage");
	logger.info("dbOperationRecallResponse: validMessage = " + validMessage);
	logger.info("dbOperationRecallResponse: typeof validMessage = " + typeof validMessage);

	var msgNo = getHeader(map, "ACEQ_MESSAGENO");
	logger.info("dbOperationRecallResponse: msgNo = " + msgNo);

	var msgFamily = "SEPAINST";
	logger.info("dbOperationRecallResponse: msgFamily = " + msgFamily);

	var currency = "EUR";
	logger.info("dbOperationRecallResponse: currency = " + currency);
	msgdbMap.put("CURRENCY", currency);

	var messageDirection = "I";
	logger.info("dbOperationRecallResponse: messageDirection = " + messageDirection);
	msgdbMap.put("MESSAGEDIRECTION", "I");

	var priorityAmt = getValueFromPath(Document, priorityAmountPath);
	logger.info("dbOperationRecallResponse: priorityAmt = " + priorityAmt);
	
	if(isPatternPresent(priorityAmt, ".")) {
		priorityAmt = removePattern(priorityAmt, ".", ",");
	}

	if(isPatternPresent(priorityAmt, ",")) {
		priorityAmtNo = removePattern(priorityAmt, ",", ".");
	}else{
		priorityAmtNo = priorityAmt;
	}

	logger.info("dbOperationRecallResponse: priorityAmt = " + priorityAmt);
	logger.info("dbOperationRecallResponse: priorityAmtNo = " + priorityAmtNo);
	msgdbMap.put("PRIORITYAMOUNTNUM", priorityAmtNo);
	msgdbMap.put("PRIORITYAMOUNT", priorityAmt);

	var receiver = getValueFromPath(Document, receiverPath)
	logger.info("dbOperationRecallResponse: receiver = " + receiver);
	msgdbMap.put("RECEIVER", receiver);
	msgdbMap.put("INSTRUCTEDAGENT", receiver);

	var transRef = getValueFromPath(Document, transRefNoPath)
	logger.info("dbOperationRecallResponse: transRef = " + transRef);
	msgdbMap.put("TRANSREFNO", transRef);

	var valueDate = getValueFromPath(Document, valueDatePath);
	logger.info("dbOperationRecallResponse: valueDate = " + valueDate);

	if(valueDate) {
		valueDate = replaceAllPattern(valueDate, "-", "");
		logger.info("dbOperationRecallResponse: valueDate = " + valueDate);
		msgdbMap.put("PRIORITYDATE", valueDate);
	}

	var clearingSystem = getHeader(map, "PLCN_clearingSystem");
	logger.info("dbOperationRecallResponse: clearingSystem = " + clearingSystem);

	if(!clearingSystem) {
		clearingSystem = getHeader(map, "CSM");
		logger.info("dbOperationRecallResponse: clearingSystem from CSM = " + clearingSystem);
	}

	//msgdbMap.put("CSM", "0000ABCDEFGHILMNOPQR");
	msgdbMap.put("CSM", clearingSystem);

	var custom5Camt056 = getHeader(map, "CUSTOM5");
	logger.info("dbOperationRecallResponse: custom5Camt056 = " + custom5Camt056);

	var msgDbId = getHeader(map, "ACEQ_MSGDBID");
	logger.info("dbOperationRecallResponse: msgDbId = " + msgDbId);

	var custom5Camt056 = custom5Camt056 + "NEXT=" + msgDbId + "|ORIT¿"
	logger.info("dbOperationRecallResponse: custom5Camt056 = " + custom5Camt056);
	setHeader(map, "CUSTOM5", custom5Camt056);
	//setHeader(map, "CUSTOM5", null);

	var msgDbIdCamt056 = getHeader(map, "MSGDB_ID");
	logger.info("dbOperationRecallResponse: msgDbIdCamt056 = " + msgDbIdCamt056);

	var custom5 = "PREV=" + msgDbIdCamt056 + "|ICRT¿";
	logger.info("dbOperationRecallResponse: custom5 = " + custom5);
	msgdbMap.put("CUSTOM5", custom5);

	var commentString = getHeader(map, "PLCN_txnComments");
	logger.info("dbOperationRecallResponse: commentString = " + commentString);
	msgdbMap.put("COMMENTS", commentString);

	var inputDate = new SimpleDateFormat("yyyyMMdd").format(new Date());
	logger.info("dbOperationRecallResponse: inputDate = " + inputDate);
	msgdbMap.put("INPUTDATE", inputDate);
	msgdbMap.put("PREVQUEUEINDATE", inputDate);

	var inputTime = new SimpleDateFormat("HHmmss").format(new Date());
	logger.info("dbOperationRecallResponse: inputTime = " + inputTime);
	msgdbMap.put("INPUTTIME", inputTime);
	msgdbMap.put("PREVQUEUEINTIME", inputTime);

	msgdbMap.put("PROCESSING_STAGE", "PEND");
	msgdbMap.put("TRANSACTIONGROUP", "ENI");
	msgdbMap.put("SOURCECHANNELID", "PELICAN");
	msgdbMap.put("CHANNEL_ID_SOURCE", "PELICAN");
	msgdbMap.put("DISPLAY_FLAG", "Y");
	msgdbMap.put("MSG_MODE_IN", "MANUAL");
	msgdbMap.put("MSGCLASS", "EPC");
	msgdbMap.put("MSG_FAMILY", "SEPAINST");	
	msgdbMap.put("MESSAGECLASSTYPE", msgType);
	msgdbMap.put("MSGSEGR", "DEFAULT");
	msgdbMap.put("CUSTOM3", "N");
	msgdbMap.put("INSTITUTIONID", institutionId);
	msgdbMap.put("RECORD_GROUP_TYPE", "M");
	msgdbMap.put("INSTANCEID", "PELICAN1");
	msgdbMap.put("RELATED_REFERENCE", transRef);
	msgdbMap.put("OTHER_ACCNO", "");
	msgdbMap.put("MSGCOUNT", "1");
	msgdbMap.put("ACCOUNT_NUMBER", "");
	msgdbMap.put("TRANSSUBTYPE", "SALA")

	var messageBody = inMsg.getBody(java.lang.String.class);
	//var messageBody = inMsg.getBody();
	logger.trace("dbOperationRecallResponse: messageBody = " + messageBody);

	var reqBody = getHeader(map, "ACEDB_decodedMessageString");
	logger.info("dbOperationRecallResponse: reqBody = " + reqBody);

	var hKey = msgType + "_"  + msgFamily + "-" + "I";
	logger.info('dbOperationRecallResponse: hKey = ' + hKey);
	var oQueueId = memTblGetTableValue(map, "SCT_QUEUEID", hKey);
	logger.info('dbOperationRecallResponse: oQueueId from SCT_QUEUEID = '+ oQueueId);
	setHeader(map, "PLCN_oQueueId", oQueueId);
	msgdbMap.put("QUEUEID", oQueueId);
	msgdbMap.put("STATUS", "69");
	//inMsg.setBody(reqBody);

	var msgBlock1 = messageBody;
	var msgBlock2 = messageBody; 
	
	//var msgBlock176 = getHeader(map, "ACEDB_reqBody");
	//var msgBlock1 = 'CAMEL_EXCHANGE_BODY';
	//logger.info("dbOperationRecallResponse: msgBlock176 = " + msgBlock176);
	////logger.info("dbOperationRecallResponse: typeof msgBlock176 = " + typeof msgBlock176);	

	//var msgBlock2 = 'CAMEL_EXCHANGE_BODY';

	//var msgBlock177 = getHeader(map, "ACEDB_response");
	//logger.info("dbOperationRecallResponse: msgBlock177 = " + msgBlock177);

	var helper = new JSHelperClass();
	var encodedMessage = Base64.getEncoder().encodeToString(helper.getBytes(messageBody));
	logger.info("dbOperationRecallResponse: Encoded = " + encodedMessage);

	if(msgFamily == "SWIFT") {
		msgBlock6 = commentString;
	}else{
		msgBlock6 = getHeader(map, "ACEDB_responseCdsDoc"); //getHeader(map, "ACEDB_responseCdsJSON");
	}

	logger.info("dbOperationRecallResponse: msgBlock6 = " + msgBlock6);

	var list = new ArrayList();

	var Msgblock1 = new HashMap();
	var Msgblock2 = new HashMap();
	//var Msgblock176 = new HashMap();
	//var Msgblock177 = new HashMap();
	//var Msgblock6 = new HashMap();

	msgBlockFamily = "XML";

	logger.info("dbOperationRecallResponse: msgBlockFamily = " + msgBlockFamily);
	logger.info("dbOperationRecallResponse: msgdbMap = " + msgdbMap);

	Msgblock1.put("MSGBLOCKTYPE", "1");	
	Msgblock1.put("MESSAGE", encodedMessage); //msgBlock1.getBytes());
	Msgblock1.put("MSGFAMILY", msgBlockFamily);

	Msgblock2.put("MSGBLOCKTYPE", "2");		
	Msgblock2.put("MESSAGE", encodedMessage); //msgBlock2.getBytes());
	Msgblock2.put("MSGFAMILY", msgBlockFamily);

	/*Msgblock176.put("MSGBLOCKTYPE", "176");	
	Msgblock176.put("MESSAGE", msgBlock176.getBytes());
	Msgblock176.put("MSGFAMILY", "JSON");

	Msgblock177.put("MSGBLOCKTYPE", "177");		
	Msgblock177.put("MESSAGE", msgBlock177.getBytes());
	Msgblock177.put("MSGFAMILY", "JSON");*/

	/*if(msgBlock6) {
		Msgblock6.put("MSGBLOCKTYPE", "6");
		Msgblock6.put("MESSAGE", msgBlock6.getBytes());
		Msgblock6.put("MSGFAMILY", msgBlockFamily);
		list.add(Msgblock6);
	}*/

	list.add(Msgblock1);
	list.add(Msgblock2);
	/*list.add(Msgblock176);
	list.add(Msgblock177);*/

	audit.put("QUEUEID", oQueueId);
	//audit.put("USERNAME","ADMIN1");
	audit.put("APPLICATION","RCLAPI");
	audit.put("MODULENAME","ACEQWRITE");
	audit.put("ACTION","WRITE");
	audit.put("AUDITTEXT","Message number " +  "<" + msgNo + ">" + " read from DB and written into Queue " +  "'" + oQueueId + "'");
	audit.put("INSTITUTIONID", institutionId);
	audit.put("MESSAGENO", msgNo);

	/*msgdbMap.put("MESSAGEDIRECTION", "");
	msgdbMap.put("MESSAGECLASSTYPE", "");
	msgdbMap.put("SENDER", "");
	msgdbMap.put("RECEIVER", "");
	msgdbMap.put("COUNTRYCODE", "");
	msgdbMap.put("CURRENCY", "");
	msgdbMap.put("PRIORITYAMOUNTNUM", "");
	msgdbMap.put("PRIORITYDATE", "");
	msgdbMap.put("TRANSREFNO", "");
	msgdbMap.put("MSG_FAMILY", "");
	msgdbMap.put("REMITTANCEINFO", "");
	msgdbMap.put("TRANSACTIONGROUP", "");*/

	setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
	//setHeader(map, "PLCN_MSGDB", msgdbMap);	
	setHeader(map, "ACEQ_WRITE_MSGBLOCKS", list);
	setHeader(map, "ACEQ_DB_OPERATION", "INSERT");
	setHeader(map, "GENAUDIT", audit);	
	logger.info("dbOperationRecallResponse: ACEQ_WRITE_MSGBLOCKS = " + getHeader(map, "ACEQ_WRITE_MSGBLOCKS"));
}

function setResponseCds(exchange){
	var inMsg;
	var map;
	var orgnlBody;
	var responseCdsDoc;

    inMsg = exchange.getIn();
    map = inMsg.getHeaders();

    logger.info("In setResponseCds");

    responseCdsDoc = inMsg.getBody(java.lang.String.class);
    logger.trace("setResponseCds: body = " + responseCdsDoc);

    if(isPatternPresent(responseCdsDoc, "<ResponseCds>")) {
    	setHeader(map, "ACEDB_responseCdsDoc", responseCdsDoc);
    }

	orgnlBody = getHeader(map, "ACEDB_originalBody");
	logger.trace("setResponseCds: orgnlBody = " + orgnlBody);
	logger.trace("setResponseCds: responseCdsDoc = " + responseCdsDoc);
	//inMsg.setBody(orgnlBody);
  	//setHeader(map, "ACEDB_originalBody", "");
}

function createResponseRecallResponse(exchange) {
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

	logger.info("In createResponseRecallResponse");

	//var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	//logger.trace("createResponseRecallResponse: typeof Document = " + typeof Document);

	var validMessage = getHeader(map, "PLCN_validMessage");
	var msgType = getHeader(map, "PLCN_msgType");
	var msgFamily = getHeader(map, "PLCN_msgFamily");
	var status = getHeader(map, "status");

	var plcnFlag = getHeader(map, "PLCN_call");
	logger.info("createResponseRecallResponse: plcnFlag = " + plcnFlag);
	logger.info("createResponseRecallResponse: typeof plcnFlag = " + typeof plcnFlag);

	var xsdValid = getHeader(map, "XSD_VALID");
	logger.info("createResponseRecallResponse: xsdValid = " + xsdValid);
	logger.info("createResponseRecallResponse: typeof xsdValid = " + typeof xsdValid);

	/*var t2Valid = getHeader(map, "PLCN_t2Valid");
	logger.info("createResponseRecallResponse: t2Valid = " + t2Valid);
	logger.info("createResponseRecallResponse: typeof t2Valid = " + typeof t2Valid);*/


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

	logger.trace("createResponseRecallResponse: responseCdsString = " + responseCdsString);
	logger.info("createResponseRecallResponse: typeof responseCdsString = " + typeof responseCdsString);

	logger.trace("createResponseRecallResponse: validMessage = " + validMessage);
	logger.info("createResponseRecallResponse: typeof validMessage = " + typeof validMessage);
	logger.info("createResponseRecallResponse: status = " + status);
	logger.info("createResponseRecallResponse: msgType = " + msgType);
	logger.info("createResponseRecallResponse: msgFamily = " + msgFamily);

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

	    logger.info("createResponseRecallResponse: msgType = " + msgType);
	}

	var txnComments = getHeader(map, "PLCN_txnComments"); //"P00-1P32-1:A00:00-9505:A00:32-6012:A00:32-6013";
	var orgnlComments = getHeader(map, "PLCN_orgnlComments"); //"P00-1:A00:00-9505";
	var txnCommentsDB = txnComments;

	logger.info("createResponseRecallResponse: txnComments = " + txnComments);
	logger.info("createResponseRecallResponse: orgnlComments = " + orgnlComments);

	if(orgnlComments) {
		ovCount = (orgnlComments.match(/:A00:/g)).length;
	}
	var comments = txnComments + ":A00:";

	logger.info("createResponseRecallResponse: ovCount = " + ovCount);
	logger.info("createResponseRecallResponse: comments = " + comments);

	orgnlComments = orgnlComments + ":A00:";

	for(k = 0; k < ovCount; k++) {
		var otmp = dataBetweenTokens(":A00:", ":A00:", orgnlComments);
		logger.info("createResponseRecallResponse: otmp = " + otmp);
		ofldViolation[k] = otmp.substring(3, 7);
		comments = removePattern(comments, ":A00:" + otmp);
		orgnlComments = removePattern(orgnlComments, ":A00:" + tmp);
	}

	logger.info("createResponseRecallResponse: comments = " + comments);
	logger.info("createResponseRecallResponse: orgnlComments = " + orgnlComments);
	logger.info("createResponseRecallResponse: txnComments = " + txnComments);

	plcnCodesValues = comments.substring(0, comments.length - 5);
	logger.info("createResponseRecallResponse: plcnCodesValues = " + plcnCodesValues);

	logger.info("createResponseRecallResponse: txnComments = " + txnComments);
	logger.info("createResponseRecallResponse: txnComments length = " + txnComments.length);
	logger.info("createResponseRecallResponse: typeof txnComments = " + typeof txnComments);

	if(txnComments.length > 0) {
		vCount = (txnComments.match(/:A00:/g)).length;//(txnComments.match(/:A00:/g) || []).length;
		logger.info("createResponseRecallResponse: vCount = " + vCount);
	}

	for(i = 0; i < vCount; i++) {
		logger.info("createResponseRecallResponse: txnComments = " + txnComments);
		var tmp = dataBetweenTokens(":A00:", ":A00:", txnComments); //296-5770
		logger.info("createResponseRecallResponse: tmp = " + tmp);
		var tmp2 = ":A00:" + tmp + ":A00:" //:A00:296-5770:A00:
		logger.info("createResponseRecallResponse: tmp2 = " + tmp2);
		fldNo[i] = dataBetweenTokens(":A00:", "-", tmp2); //tmp.substring(0, 2);
		fldViolation[i] = dataBetweenTokens("-", ":A00:", tmp2); //tmp.substring(3, 7);
		txnComments = removePattern(txnComments, ":A00:" + tmp);
	}

	logger.info("createResponseRecallResponse: fldViolation = " + fldViolation);
	logger.info("createResponseRecallResponse: fldNo = " + fldNo);

	logger.info("createResponseRecallResponse: responseCdsString = " + responseCdsString);
	logger.info("createResponseRecallResponse: typeof responseCdsString = " + typeof responseCdsString);

	logger.info("createResponseRecallResponse: txnCommentsDB = " + txnCommentsDB);
	logger.info("createResponseRecallResponse: typeof txnCommentsDB = " + typeof txnCommentsDB);

	if(responseCdsString != null) {
		//append
		logger.info("createResponseRecallResponse: response code already generated");
		setHeader(map, "xsdStatus", "error");
		setHeader(map, "status", "error");

		if(plcnFlag == "true") {
			var responseDoc = createDocument(responseCdsString);
		}else {
			var responseDoc = responseCdsString;
		}

		logger.info("createResponseRecallResponse: typeof responseDoc = " + typeof responseDoc);

		var responseCdsPlcnFmt = responseDoc.getElementsByTagName("ResponseCdsPlcnFmt");
		var nextNode = responseCdsPlcnFmt.item(0);

		logger.info("createResponseRecallResponse: j = " + j);
		logger.info("createResponseRecallResponse: vCount = " + vCount);

		while(j < vCount) {
			fldTag = memTblGetTableValue(map, msgType + "FldTag", fldNo[j]);
			fldTag = fldTag.trim();
			fldName = memTblGetTableValue(map, msgType + "FldName", fldTag);
			fldName = fldName.trim();

			logger.info("createResponseRecallResponse: fldTag = " + fldTag);
			logger.info("createResponseRecallResponse: fldName = " + fldName);

			var responseCds = responseDoc.getElementsByTagName("ResponseCds"); //root element
			//logger.info("createResponseRecallResponse: responseCds = " + convertDocumentToString(responseCds));
			logger.trace("createResponseRecallResponse: typeof responseCds = " + typeof responseCds);

			var AddtlResponseCds = createElementwithTextNode2(responseDoc, "AddtlResponseCds", "");
			//logger.info("createResponseRecallResponse: AddtlResponseCds = " + convertDocumentToString(AddtlResponseCds));
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
			logger.info("createResponseRecallResponse: violationSeries = " + violationSeries);

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

			logger.info("createResponseRecallResponse: CdTpValue = " + CdTpValue);

			var CdTp = createElementwithTextNode2(responseDoc, "CdTp", CdTpValue);
			appendElementtoNode(AddtlResponseCds, CdTp);

			var Code = createElementwithTextNode2(responseDoc, "Cd", fldViolation[j]);
			appendElementtoNode(AddtlResponseCds, Code);

			var DescriptionValue = memTblGetTableValue(map, "LANGDESC", "PAYALY|" + fldViolation[j]);
			logger.info("createResponseRecallResponse: DescriptionValue from PAYALY = " + DescriptionValue);

			if(!DescriptionValue) {
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "ACEERR|" + fldViolation[j]);
				logger.info("createResponseRecallResponse: DescriptionValue from ACEERR = " + DescriptionValue);
			}

			if(!DescriptionValue) {
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "PLATERR|" + fldViolation[j]);
				logger.info("createResponseRecallResponse: langDescKey = " + langDescKey);
				logger.info("createResponseRecallResponse: DescriptionValue from PLATERR = " + DescriptionValue);
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
		logger.info("createResponseRecallResponse: retVal = " + retVal);
		setHeader(map, "PLCN_validMessage", "false");
	}else if(txnCommentsDB) {
		//create
		logger.info("createResponseRecallResponse: creating response code");
		var responseDoc = getDocument();
		logger.trace("createResponseRecallResponse: responseDoc = " + responseDoc);

		var responseCds = createElement(responseDoc, "ResponseCds");
		appendElementtoNode(responseDoc, responseCds);

		logger.info("createResponseRecallResponse: fldNo[j] = " + fldNo[j]);
		logger.info("createResponseRecallResponse: vCount = " + vCount);
		
		while(j < vCount) {
			logger.info("createResponseRecallResponse: j = " + j);
			fldTag = memTblGetTableValue(map, msgType + "FldTag", fldNo[j]);
			logger.info("createResponseRecallResponse: fldTag = " + fldTag);

			if(fldTag) {
				fldTag = fldTag.trim();
				fldName = memTblGetTableValue(map, msgType + "FldName", fldTag);
				logger.info("createResponseRecallResponse: fldName = " + fldName);

				if(fldName) {
					fldName = fldName.trim();
				}
			}else{
				var tmpValue1 = memTblGetTableValue(map, "VIOLATIONFAMILY_MAP", msgFamily);
				logger.info("createResponseRecallResponse: tmpValue1 = " + tmpValue1);

				fldName = memTblGetTableValue(map, tmpValue1 + "_MAP", fldNo[j]);
				logger.info("createResponseRecallResponse: fldName = " + fldName);
				//fldTag = fldName;
			}

			var AddtlResponseCds = createElementwithTextNode(responseDoc, responseCds, "AddtlResponseCds", "");
			appendElementtoNode(responseCds, AddtlResponseCds);

			var PlcnFldNum = createElementwithTextNode(responseDoc, responseCds, "PlcnFldNum", fldNo[j]);
			appendElementtoNode(AddtlResponseCds, PlcnFldNum);

			if(fldTag) {
				var FldTag = createElementwithTextNode(responseDoc, responseCds, "FldTag", fldTag);
				appendElementtoNode(AddtlResponseCds, FldTag);
			}

			var FldName = createElementwithTextNode(responseDoc, responseCds, "FldName", fldName);
			appendElementtoNode(AddtlResponseCds, FldName);

			var violationSeries = fldViolation[j].substring(0, 1);
			logger.info("createResponseRecallResponse: violationSeries = " + violationSeries);

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

			logger.info("createResponseRecallResponse: CdTpValue = " + CdTpValue);

			var CdTp = createElementwithTextNode2(responseDoc, "CdTp", CdTpValue[j]);
			appendElementtoNode(AddtlResponseCds, CdTp);
			
			var Code = createElementwithTextNode(responseDoc, responseCds, "Cd", fldViolation[j]);
			appendElementtoNode(AddtlResponseCds, Code);

			var langDescKey = "PAYALY|" + fldViolation[j];
			var DescriptionValue = memTblGetTableValue(map, "LANGDESC", langDescKey);
			logger.info("createResponseRecallResponse: langDescKey = " + langDescKey);
			logger.info("createResponseRecallResponse: DescriptionValue = " + DescriptionValue);

			if(!DescriptionValue) {
				langDescKey = "ACEERR|" + fldViolation[j];
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", langDescKey);
				logger.info("createResponseRecallResponse: langDescKey = " + langDescKey);
				logger.info("createResponseRecallResponse: DescriptionValue = " + DescriptionValue);
			}

			if(!DescriptionValue) {
				DescriptionValue = memTblGetTableValue(map, "LANGDESC", "PLATERR|" + fldViolation[j]);
				logger.info("createResponseRecallResponse: langDescKey = " + langDescKey);
				logger.info("createResponseRecallResponse: DescriptionValue from PLATERR = " + DescriptionValue);
			}

			if(!DescriptionValue) {
				DescriptionValue = "Unable to fetch description for given error/warning code. Please contact administrator.";
				logger.info("createResponseRecallResponse: DescriptionValue = " + DescriptionValue);
			}				

			var Description = createElementwithTextNode2(responseDoc, "Description", DescriptionValue);
			appendElementtoNode(AddtlResponseCds, Description);
			
			j++;
		}						

		//var ResponseCdsPlcnFmt = createElementwithTextNode(responseDoc, responseCds, "ResponseCdsPlcnFmt", "");
		//appendElementtoNode(responseCds, ResponseCdsPlcnFmt);

		//var PlcnCodes = createElementwithTextNode(responseDoc, responseCds, "PlcnCodes", getHeader(map, "PLCN_txnComments"));
		//appendElementtoNode(ResponseCdsPlcnFmt, PlcnCodes);
		for(j = 0; j < CdTpValue.length; j++) {
			logger.info("createResponseRecallResponse: CdTpValue = " + CdTpValue[j]);

			/*if(CdTpValue[j] == "Error") {
				setHeader(map, "status", "error");
			}else {
				setHeader(map, "status", "valid");
			}*/
		}
	}

	logger.trace("createResponseRecallResponse: responseDoc = " + responseDoc);
	logger.info("createResponseRecallResponse: status = " + getHeader(map, "status"));

	setHeader(map, "ACEDB_responseCdsDocFinal", responseDoc);

	if(responseDoc){
		logger.info("createResponseRecallResponse: responseDoc = " + responseDoc);
		logger.info("createResponseRecallResponse: typeof responseDoc = " + typeof responseDoc);
		var responseCdsString = getPrettyPrint(responseDoc);
		logger.info("createResponseRecallResponse: responseCdsString = " + responseCdsString);
		var internalFlag = getHeader(map, "PLCN_call");
		logger.info("createResponseRecallResponse: internalFlag = " + internalFlag);

		var responseDocJSON = xml2json(responseDoc, "");
		logger.info("createResponseRecallResponse: responseDocJSON = " + responseDocJSON);

		//if(!internalFlag){
			//inMsg.setBody(responseCdsString);
			inMsg.setBody(responseDocJSON);
			setHeader(map, "ACEDB_responseCdsJSON", responseDocJSON);
			setHeader(map, "ACEDB_responseCdsDoc", responseCdsString);
		//}else {
		//	setHeader(map, "ACEDB_responseCdsDoc", responseCdsString);
		//}		
	}
}

function invalidRequest(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In invalidRequest");
	setHeader(map, "PLCN_validMessage", false);
	setHeader(map, "status", "error");
	setCommentsForTransaction("00", "0000", map);
	//createResponse(exchange);
}

/*function populdateAudit(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();	
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	logger.info("In populdateAudit" +readMsgdb);

	var audit = new HashMap();

	var queueId = "PROCDQ";

	var writeMsgdb = inMsg.getHeaders().get("ACEQ_WRITE_MSGDB");
	logger.info("populdateAudit: writeMsgdb = " + writeMsgdb);
	logger.info("populdateAudit: typeof writeMsgdb = " + typeof writeMsgdb);

	var messageNo = writeMsgdb.get("MESSAGENO");
	logger.info("populdateAudit: messageNo = " + messageNo);

	var msgBlock177 = 'CAMEL_EXCHANGE_BODY';

	var list = new ArrayList();

	var Msgblock177 = new HashMap();
	//var Msgblock2 = new HashMap();
	Msgblock177.put("MSGBLOCKTYPE", "177");
	//Msgblock1.put("MESSAGE", msgblock1);
	//Msgblock1.put("MESSAGE", messageBody);
	Msgblock177.put("MESSAGE", msgBlock177);
	Msgblock177.put("MSGFAMILY", "JSON");		
	//var Msgblock153 = new HashMap();
	//var Msgblock154 = new HashMap();

	list.add(Msgblock177);	

	audit.put("QUEUEID", queueId);
	//audit.put("USERNAME","ADMIN1");
	audit.put("APPLICATION","ACEQ_CMP");
	audit.put("MODULENAME","ACEQWRITE");
	audit.put("ACTION","WRITE");
	audit.put("AUDITTEXT","Message number " +  "<" + messageNo + ">" + " read from Validate API and written into Queue " +  "'" + queueId + "'");

	setHeader(map, "ACEQ_WRITE_MSGDB", getHeader(map, "PLCN_MSGDB"));
	setHeader(map, "ACEQ_WRITE_MSGBLOCKS", list);
	setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
	setHeader(map, "GENAUDIT", audit);	
}*/

function setValidationResponse(exchange) {
	var messageBody;
	var status;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setValidationResponse");

	var responseBody = inMsg.getBody(java.lang.String.class);	
	logger.info("setValidationResponse: responseBody = " + responseBody);

	var callValidationAPI = getHeader(map, "PLCN_callValidationAPI");
	logger.info("setValidationResponse: callValidationAPI = " + callValidationAPI);
	logger.info("setValidationResponse: typeof callValidationAPI = " + typeof callValidationAPI);

	var callWFAPI = getHeader(map, "PLCN_callWFAPI");
	logger.info("setValidationResponse: callWFAPI = " + callWFAPI);	
	logger.info("setValidationResponse: typeof callWFAPI = " + typeof callWFAPI);

	messageBody = getHeader(map, "ACEDB_originalBody");
	logger.trace("setBody: messageBody = " + messageBody);

	status = getHeader(map, "status"); //T2 business validation status
	logger.info("setValidationResponse: status = " + status);
	setHeader(map, "PLCN_setValidationStatus", status);
	setHeader(map, "PLCN_validationStatus", status);

	if(callValidationAPI == "true") {
		if(status == "valid") {
			setHeader(map, "PLCN_validMessage", true);
		}else {
			setHeader(map, "PLCN_validMessage", false);
		}
	}else {
		if(!responseBody) {
			setHeader(map, "PLCN_validMessage", true);
			setHeader(map, "status", "valid");
		}else{
			if(isPatternPresent(responseBody, "<flowexception>")){
				var commentString = dataBetweenTokens("<commentString>", "</commentString>", responseBody);
				logger.info("setValidationResponse: commentString = " + commentString);
				setHeader(map, "PLCN_txnComments", commentString);
				setHeader(map, "PLCN_validMessage", false);
				setHeader(map, "status", "Invalid");	
			}else{
				setHeader(map, "PLCN_validMessage", true);
				setHeader(map, "status", "valid");
			}	
		}
	}

	var txnComments = getHeader(map, "PLCN_txnComments");
	setHeader(map, "PLCN_validationViolations", txnComments);
	logger.info("setValidationResponse: txnComments = " + txnComments);

	var responseBody = inMsg.getBody(java.lang.String.class);
	logger.trace("setValidationResponse: responseBody = " + responseBody);

	if(isPatternPresent(responseBody, "<ResponseCds>")) {
		//var responseCds = exchange.getIn().getBody(org.w3c.dom.Document.class);
		var responseCds = inMsg.getBody(java.lang.String.class);
		logger.trace("setValidationResponse: responseCds = " + responseCds);
		//setHeader(map, "PLCN_validResponse", "false");
		setHeader(map, "ACEDB_responseCdsDoc", responseCds);
		//logger.info("setValidationResponse: PLCN_validResponse = " + getHeader(map, "PLCN_validResponse"));

		inMsg.setBody(messageBody);
		logger.trace("setValidationResponse: messageBody = " + messageBody);
	}else {
		setHeader(map, "ACEDB_responseCdsDoc", false);
	}

	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("setValidationResponse: msgType = " + msgType);
}

function createWFRequest(exchange){
	var inMsg;
	var map;

    inMsg = exchange.getIn();
    map = inMsg.getHeaders();

    logger.info("In createWFRequest");

	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.info("createWFRequest: messageBody = " + messageBody);

	var messageFamily = getHeader(map, "ACEDB_messageFamilyReq");
	logger.info("createWFRequest: messageFamily = " + messageFamily);

	var messageType = getHeader(map, "ACEDB_messageType");
	logger.info("createWFRequest: messageType = " + messageType);

	setHeader(map, "MANUAL_MODE", "REPAIR");
	setHeader(map, "INSTITUTION_ID", "NIBCNLNV");
	setHeader(map, "MSGCLASS", messageFamily);
	setHeader(map, "SOURCE_MSG_TYPE", messageType);
	//setHeader(map, "PLCN_flowID", "ManualCreationPayMT");

	if(messageFamily == "SWIFT") {
		setHeader(map, "sectionid", "MESSAGE_DETAILS");
	}else{
		setHeader(map, "sectionid", "STREAM_DETAILS");		
	}

	//var helper = new JSHelperClass();
	//var encodedMessage = Base64.getEncoder().encodeToString(helper.getBytes(messageBody));
	//logger.info("createWFRequest: Encoded = " + encodedMessage);

	//var xmlHeader = '<?xml version="1.0"?><HEADER><SECTIONS><SECTION><ID>MESSAGE_DETAILS</ID><SECTION_DETAILS><KEY>MANUAL_MODE</KEY><VALUE>REPAIR</VALUE><KEY>MSGDB_ID</KEY><VALUE>44154166</VALUE><KEY>MSG_NO</KEY><VALUE/><KEY>QUEUE_ID</KEY><VALUE/><KEY>PREVQUEUEID</KEY><VALUE/><KEY>INSTITUTION_ID</KEY><VALUE>SANTATWW</VALUE><KEY>MSGCLASS</KEY><VALUE>SWIFT</VALUE><KEY>TARGET_ENI_MSG_TYPE</KEY><VALUE>null</VALUE><KEY>SOURCE_MSG_TYPE</KEY><VALUE>103</VALUE><KEY>COMMENTS</KEY><VALUE/><KEY>CUSTOM11</KEY><VALUE/><KEY>DERIVED_PRODUCT</KEY><VALUE/></SECTION_DETAILS></SECTION></SECTIONS></HEADER>';

	//var reqBody = 'MANUAL-CREATION-PAYMT-FLOW~'+encodedMessage+'~'+xmlHeader;
	//logger.info("createWFRequest: reqBody = " + reqBody);

	//inMsg.setBody(reqBody);
}

function createJSONResponse(exchange) {
	var pelicanAudit;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	//var writeMsgdb = inMsg.getHeaders().get("ACEQ_WRITE_MSGDB");
	//logger.info("createJSONResponse: writeMsgdb = " + writeMsgdb);

	var vlidationStatus = getHeader(map, "status");	
	logger.info("createJSONResponse: vlidationStatus = " + vlidationStatus);

	var obj = new Object();
	obj.pelican_payment_id = getHeader(map, "PLCN_paymentId");
	obj.pelican_recall_id = getHeader(map, "PLCN_recallId");
	obj.message_family = getHeader(map, "ACEDB_messageFamilyReq");
	obj.recall_response = getHeader(map, "PLCN_recallResponse");
	obj.pelican_recall_response_id = getHeader(map, "ACEQ_MESSAGENO"); //writeMsgdb.get("MESSAGENO");

	var returnExecutionDate = getHeader(map, "PLCN_returnExecutionDate"); 
	logger.info("createJSONResponse: returnExecutionDate = " + returnExecutionDate);

	if(returnExecutionDate) {
		obj.return_execution_date = returnExecutionDate;
	}

	var rtrdIntrBkSttlmAmt = getHeader(map, "PLCN_rtrdIntrBkSttlmAmt"); 
	logger.info("createJSONResponse: rtrdIntrBkSttlmAmt = " + rtrdIntrBkSttlmAmt);

	if(rtrdIntrBkSttlmAmt) {
		obj.returned_amount = rtrdIntrBkSttlmAmt;
	}

	var rejectReason = getHeader(map, "PLCN_rejectReason");
	logger.info("createJSONResponse: rejectReason = " + rejectReason);

	if(rejectReason) {
		obj.reject_reason = rejectReason;
	}

	var chargesAmount = getHeader(map, "PLCN_chargesAmount"); 
	logger.info("createJSONResponse: chargesAmount = " + chargesAmount);

	if(chargesAmount) {
		var chargesCurrency = getHeader(map, "PLCN_chargesCurrency");
		logger.info("createJSONResponse: chargesCurrency = " + chargesCurrency);
		obj.charges_currency = chargesCurrency;
		obj.charges_amount = chargesAmount;
	}

	obj.status = "PENDING";

	/*if(vlidationStatus == "Invalid") {
		obj.pelican_audit = pelicanAudit;
	}*/

	/*if(vlidationStatus == "Invalid") {
		jsonString = removePattern(jsonString, "}");
		logger.info("createJSONResponse : jsonString = " + jsonString);

		jsonString = jsonString + pelicanAudit + "}";
		logger.info("createJSONResponse : jsonString = " + jsonString);
	}*/

	var responseDoc = getHeader(map, "ACEDB_responseCdsDocFinal");
	logger.info("createJSONResponse: responseDoc = " + responseDoc);
	logger.info("createJSONResponse: typeof responseDoc = " + typeof responseDoc);	
	
	if(responseDoc) {
		var responseDocString = responseDoc.toString();
		logger.info("createJSONResponse : responseDocString = " + responseDocString);

		//if(isPatternPresent(responseDocString, "<ResponseCds>")) {
			var pelicanAudit = xml2json(responseDoc, "");
			logger.info("createJSONResponse: pelicanAudit = " + pelicanAudit);
			logger.info("createJSONResponse: typeof pelicanAudit = " + typeof pelicanAudit);
			
			pelicanAudit = replaceAllPattern(pelicanAudit, "AddtlResponseCds", "additional_response_code");
			pelicanAudit = replaceAllPattern(pelicanAudit, "ResponseCds", "response_codes");
			pelicanAudit = replaceAllPattern(pelicanAudit, "PlcnFldNum", "pelican_field_number");
			pelicanAudit = replaceAllPattern(pelicanAudit, "FldName", "field_name");
			pelicanAudit = replaceAllPattern(pelicanAudit, "CdTp", "code_type");
			pelicanAudit = replaceAllPattern(pelicanAudit, "Cd", "code");
			pelicanAudit = replaceAllPattern(pelicanAudit, "Description", "description");
			obj.pelican_audit = ""; //pelicanAudit;
			//obj = replaceAllPattern(obj, "\\", "description");
			//pelicanAudit = replaceAllPattern(pelicanAudit, "ResponseCdsPlcnFmt", "response_codes");
			//pelicanAudit = replaceAllPattern(pelicanAudit, "PlcnCodes", "response_codes");
		//}
	}

   	var jsonString = JSON.stringify(obj);
	logger.info("createJSONResponse: jsonString = " + jsonString);

	if(pelicanAudit) {
		jsonString = removePattern(jsonString, '""}');
		logger.info("createJSONResponse : jsonString = " + jsonString);

		jsonString = jsonString + pelicanAudit + "}";
		logger.info("createJSONResponse : jsonString = " + jsonString);
	}

	inMsg.setBody(jsonString);

	//setHeader(map, "ACEDB_response", jsonString);
}

function getMsgNo(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In getMsgNo");	
	var generateMsgno = new GenerateMsgno();

	generateMsgno.getMsgNo("",exchange);
	var msgNo = getHeader(map, "ACEQ_MESSAGENO");
	logger.info("getMsgNo: msgNo = " + msgNo);
	logger.info("getMsgNo: typeof msgNo = " + typeof msgNo);
}

function setAPIViolation() {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In setAPIViolation");
	setCommentsForTransaction("117", "7389", map);
}

function copyExtractorHeader(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In copyExtractorHeader");

	var amount = getHeader(map, "amount");
	logger.info("copyExtractorHeader: amount = " + amount);
	setHeader(map, "ACEDB_amount", amount);

	var country = getHeader(map, "country");
	logger.info("copyExtractorHeader: country = " + country);
	setHeader(map, "ACEDB_country", country);

	var currency = getHeader(map, "currency");
	logger.info("copyExtractorHeader: currency = " + currency);
	setHeader(map, "ACEDB_currency", currency);

	var priorityAmtNo = getHeader(map, "priorityAmtNo");
	logger.info("copyExtractorHeader: priorityAmtNo = " + priorityAmtNo);
	setHeader(map, "ACEDB_priorityAmtNo", priorityAmtNo);

	var receiver = getHeader(map, "receiver");
	logger.info("copyExtractorHeader: receiver = " + receiver);
	setHeader(map, "ACEDB_receiver", receiver);

	var sender = getHeader(map, "sender");
	logger.info("copyExtractorHeader: sender = " + sender);
	setHeader(map, "ACEDB_sender", sender);

	var transRef = getHeader(map, "transRef");
	logger.info("copyExtractorHeader: transRef = " + transRef);
	setHeader(map, "ACEDB_transRef", transRef);

	var valueDate = getHeader(map, "valueDate");
	logger.info("copyExtractorHeader: valueDate = " + valueDate);
	setHeader(map, "ACEDB_valueDate", valueDate);						
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
	
	logger.trace("updateQueueIdMx: message = " + message);
	// Debug readMsgdb object
	//getMethods(readMsgdb);
	//getMethods(map);

	var mode = "MANUAL";
	logger.info("updateQueueIdMx: mode = " + mode);
	setHeader(map, "PLCN_mode", mode);
	setHeader(map, "PLCN_msgModeIn", mode);

	var institutionId =  "PLCNGBWB";
	logger.info("updateQueueIdMx: institutionId = " + institutionId);
	setHeader(map, "PLCN_institutionId", institutionId);
	
	logger.info("updateQueueIdMx: MSGDB_ID = " + getHeader(map, "ACEQ_MSGDBID"));

	var msgType = getHeader(map, "PLCN_msgType")
	logger.info("updateQueueIdMx: msgType from MSGDB = " + msgType);
	
	if(!msgType){
		msgType = getMessageType(exchange);	
		logger.info("updateQueueIdMx: msgType from getMessageType = " + msgType);
	}

	if(msgType){
	msgType = msgType.toLowerCase();
		setHeader(map, "PLCN_msgType", msgType);
	}
	
	var messageNo = getHeader(map, "ACEQ_MESSAGENO");
	logger.info("updateQueueIdMx: messageNo = " + messageNo);
	setHeader(map, "PLCN_messageNo", messageNo);

	var sourceChannelId = "PELICAN";
	logger.info("updateQueueIdMx: sourceChannelId = " + sourceChannelId);
	msgdbMap.put("SOURCECHANNELID", sourceChannelId);
	setHeader(map, "PLCN_sourceChannelId", sourceChannelId);
	
	/* sourceChannelId = getHeader(map, "PLCN_sourceChannelId"); */
	var userConfigVal = memTblGetTableValue(map, "SEPAINST_CONFIG_MAP", sourceChannelId);
	logger.info('updateQueueIdMx: userConfigVal = ' + userConfigVal);
	var msgFamilyValue = "SEPAINST" //userConfigVal;
	logger.info('updateQueueIdMx: msgFamilyValue = ' + msgFamilyValue);

	msgDirection = "I" //memTblGetTableValue(map, "DIRECTION_CHK_MAP", sourceChannelId);
	logger.info("updateQueueIdMx: msgDirection = " + msgDirection);
	setHeader(map, "PLCN_msgDirection", msgDirection);

	// RAVITEJA
	var institutionId =  "PLCNGBWB";
	var processId = getHeader(map,"PLCN_processId");
	logger.info("updateQueueIdMx: processId = " + processId);

	if(msgType == 'pacs.004.001.09'){
		var svcLvlPath = 'Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
		var svcLvl = getValueFromPath(Document, svcLvlPath);
		logger.info("updateQueueIdMx: svcLvl = " + svcLvl);

		var lclInstrmPath = 'Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
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

	var msgTypeQueueMap = new HashMap();

	if(msgType == null ){
		logger.info("updateQueueIdMx: No XMLNS found");
	}
	else{
		//var oQueueId = msgTypeQueueMap.get(msgType.toUpperCase());
		//logger.info('updateQueueIdMx: oQueueId = '+ oQueueId);
		//logger.info('updateQueueIdMx: msgType = '+msgType);
		// tejadata
		//msgTypeQueueMap.put("MESSAGECLASSTYPE", msgType);

		msgType = msgType.toLowerCase()

		//if(lclInstrm == 'INST' && svcLvl == 'SEPA'){
		if(isPatternPresent(lclInstrm, 'INST') && isPatternPresent(svcLvl, 'SEPA')){
			msgFamily = 'SEPAINST';
			msgdbMap.put("MESSAGECLASSTYPE", msgType);
			msgdbMap.put("MSG_FAMILY", msgFamily);
			//var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
			var hKey = msgType + "_"  + msgFamily + "-" + msgDirection;
			logger.info('updateQueueIdMx: hKey = ' + hKey);
			var oQueueId = memTblGetTableValue(map, "SCT_QUEUEID", hKey);
			logger.info('updateQueueIdMx: oQueueId from SCT_QUEUEID = '+ oQueueId);
			logger.info('updateQueueIdMx: msgType = ' + msgType);
		}else if(isPatternPresent(svcLvl, 'SEPA') && lclInstrm != 'INST'){
			msgFamily = 'SEPA';
			msgdbMap.put("MESSAGECLASSTYPE", msgType);
			msgdbMap.put("MSG_FAMILY", msgFamily);
			var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
			logger.info('updateQueueIdMx: oQueueId Sepa = '+ oQueueId);
			logger.info('updateQueueIdMx: msgType = ' + msgType);
		}

		/*if(msgFamilyValue){
			logger.info('inside 3rd loop');
			if(msgFamilyValue == 'TIPS' || msgFamilyValue == 'RT1'){
				msgFamily = 'SEPAINST';
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				msgdbMap.put("MSG_FAMILY", "SEPAINST");
				var hKey = msgType + "_"  + msgFamily + "-" + msgDirection;
				logger.info('updateQueueIdMx: hKey = ' + hKey);
				var oQueueId = memTblGetTableValue(map, "SCT_QUEUEID", hKey);
				logger.info('updateQueueIdMx: oQueueId from SCT_QUEUEID = '+ oQueueId);
				logger.info('updateQueueIdMx: msgType = ' + msgType);
			}
			else if(msgFamilyValue == 'CBPR'){
				msgFamily = 'CBPR';
				logger.info('CBPR loop');
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				msgdbMap.put("MSG_FAMILY", "XML");
				logger.info('updateQueueIdMx: msgType = ' + msgType);
				var hKey =  msgType + "-"  + "CBPR" + "-" + msgDirection;
				logger.info('updateQueueIdMx: hKey = ' + hKey);
				var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + "CBPR" + "-" + msgDirection);
				logger.info('updateQueueIdMx: oQueueId in CBPR loop = '+ oQueueId);
				logger.info('updateQueueIdMx: msgType = ' + msgType);
			}
			else if(msgFamilyValue == 'SEPA'){
				msgFamily = 'SEPA';
				msgdbMap.put("MESSAGECLASSTYPE", msgType);
				msgdbMap.put("MSG_FAMILY", "SEPA");
				var oQueueId = memTblGetTableValue(map, "QUEUEROUTING", msgType + "-"  + msgFamily + "-" + msgDirection);
				logger.info('updateQueueIdMx: oQueueId Sepa = '+ oQueueId);
				logger.info('updateQueueIdMx: msgType = ' + msgType);
				logger.info('updateQueueIdMx: oQueueId in SEPA loop = '+ oQueueId);
			}
		}*/

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

	if(institutionId1){
		logger.info("updateQueueIdMx: inside if loop of institutionId1");
		msgdbMap.put("INSTITUTIONID", institutionId1);
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

	//if(getHeader(map, "PLCN_isXML") == true) {
		audit.put("QUEUEID", queueId);
	//}

	//audit.put("USERNAME","ADMIN1");
	audit.put("APPLICATION","ACEQ_CMP");
	audit.put("MODULENAME","ACEQWRITE");
	audit.put("ACTION","WRITE");
	audit.put("AUDITTEXT","Message number " +  "<" + messageNo + ">" + " read from DB and written into Queue " +  "'" + queueId + "'");
	audit.put("INSTITUTIONID", institutionId1);

	setHeader(map, "ACEQ_WRITE_MSGDB", msgdbMap);
	setHeader(map, "ACEQ_DB_OPERATION", "UPDATE");
	setHeader(map, "GENAUDIT", audit);

	logger.info("updateQueueIdMx: msgdbMap = " + msgdbMap);
	logger.info("updateQueueIdMx: audit = " + audit);
	logger.info("updateQueueIdMx: PLCN_XMLNS_PARSE_QUEUEID = " + getHeader(map, "PLCN_XMLNS_PARSE_QUEUEID"));
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

	msgDirection = getHeader(map, "PLCN_msgDirection");
	logger.info("drveProductCode: msgDirection = " + msgDirection);
	
	drveProductCodeFlagPath = institutionId + "." + "MESSAGE_PROCESSING.FUNCTIONALITY.CHANNEL_MSGTYPE_CONFIG" + "." + sourceChannelId;
	drveProductCodeFlag = memTblGetTableValue(map, "INST_PARAM", drveProductCodeFlagPath);
	logger.info("drveProductCode: drveProductCodeFlag = " + drveProductCodeFlag);

	
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

		var productCdKey1 = msgFamily + "-" + sourceChannelId + "-" + msgDirection + "-" + msgType;
		logger.info("drveProductCode: productCdKey1 = " + productCdKey1);
	
		var queueId = getHeader(map, "PLCN_queueId");
		var transRefNo = getHeader(map, "PLCN_transRefNo");
	
		var tenantName = getHeader(map, "PLCN_tenantName");
		logger.info("drveProductCode: tenantName = " + tenantName);
		if(!tenantName){
			var tenantNamePath = institutionId + ".INSTITUTION_DETAILS.TENANT_NAME";
			logger.info("drveProductCode: tenantName = " + tenantNamePath);
			tenantName = memTblGetTableValue(map, "INST_PARAM",tenantNamePath);
			logger.info("drveProductCode: tenantName = " + tenantName);
		}
		
		if(tenantName == "SSB" && msgType == "pacs.002.001.10" && msgFamily == "SEPA" && mode == "MQ"){
			if(transRefNo == "NetworkAcked" || transRefNo == "NetworkNacked"){
				productCdKey1 = msgFamily + "-" + sourceChannelId + "-" + msgDirection + "-" + msgType + "ACK";//SEPA-PEL-SEPA-OB-IN-O-pacs.002.001.10ACK
				logger.info("drveProductCode: productCdKey1 = " + productCdKey1);
			}else {
			if(queueId == "SEPAANKQ"){
				productCdKey1 = msgFamily + "-" + sourceChannelId + "-" + msgDirection + "-" + msgType + "ACK";//SEPA-PEL-SEPA-OB-IN-O-pacs.002.001.10ACK
				logger.info("drveProductCode: productCdKey1 = " + productCdKey1);
			}
		}
		}
		
		var P4SEPADD = getHeader(map, "PLCN_P4SEPADD");
		if(!P4SEPADD){
			P4SEPADD = getHeader(map, "PLCNAPI_P4SEPADD");
		}
		
		if(tenantName == "SSB" && msgType == "pacs.004.001.09" && msgFamily == "SEPA" && mode == "MANUAL" && P4SEPADD == "YES"){
			productCdKey1 = msgFamily + "DD" + "-" + sourceChannelId + "-" + msgDirection + "-" + msgType;
			logger.info("drveProductCode: productCdKey1 = " + productCdKey1);
		}
		productCode = memTblGetTableValue(map, "PPAY_PRODUCT_CODE", productCdKey1);
	
		if(!productCode){
			productCode = memTblGetTableValue(map, "PPAY_PRODUCT_CODE", key);
		}
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
	
	var msgType = getHeader(map, "PLCN_msgType");
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
	
	if(isPatternPresent(message, "FIToFIPmtStsRpt")){
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
			sender = "ACEABANK";
		}
		logger.info("institutionDerivation: sender = " + sender);
	}

	logger.info("institutionDerivation: sender = " + sender);
	
	if(!sender){
		sender = "ACEABANK";
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
		institutionCheck = memTblGetTableValue(map, "BIC_INST_LOCMAP_MAP", "ACEABANK");
		logger.info("institutionDerivation: institutionCheck from third BIC_INST_LOCMAP_MAP = " + institutionCheck);
	}

	setHeader(map, "PLCN_drvInstitutionId", institutionCheck);
	setHeader(map, "PLCNAPI_drvInstitutionId", institutionCheck);
}

function extractRecallData(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In extractRecallData");

	var recallReason = getValueFromPath(Document, "Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Rsn/Cd")
	logger.info("extractRecallData: recallReason = " + recallReason);
	setHeader(map, "PLCN_recallReason", recallReason); //for testing
}

function enrichTranslationResponseRR(exchange){
	var rejectReferencePrefix;
	var addtlInfPrefix;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In enrichTranslationResponseRR");

	var recallResponse = getHeader(map, "PLCN_recallResponse");
	logger.info("enrichTranslationResponseRR: recallResponse = " + recallResponse);

	var uId = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
	logger.info("enrichTranslationResponseRR: uId = " + uId);

	if(recallResponse == "ACCEPTED") {
		logger.info("enrichTranslationResponseRR: enrichment for Accepted");

		var returnIdentification = getHeader(map, "PLCN_returnIdentification");
		logger.info("enrichTranslationResponseRR: returnIdentification = " + returnIdentification);

		returnIdentificationMsg = getValueFromPath(Document, "Document/PmtRtr/TxInf/RtrId")
		logger.info("enrichTranslationResponseRR: returnIdentificationMsg = " + returnIdentificationMsg);

		setValueInTxtNode(Document, "Document/PmtRtr/GrpHdr/MsgId", uId);

		if(returnIdentification) {
			setValueInTxtNode(Document, "Document/PmtRtr/TxInf/RtrId", returnIdentification);
		}

		var returnExecutionDate = getHeader(map, "PLCN_returnExecutionDate");
		logger.info("enrichTranslationResponseRR: returnExecutionDate = " + returnExecutionDate);

		if(returnExecutionDate) {
			setValueInTxtNode(Document, "Document/PmtRtr/GrpHdr/IntrBkSttlmDt", returnExecutionDate)
		}else {
			var intrBkSttlmDt = getValueFromPath(Document, "Document/PmtRtr/GrpHdr/IntrBkSttlmDt");
			setHeader(map, "PLCN_returnExecutionDate", intrBkSttlmDt);
		}

		var orgtr = Document.createElement("Orgtr");
		logger.info("enrichTranslationResponseRR: typeof orgtr = " + typeof orgtr);

		var originatorName = getHeader(map, "PLCN_originatorName");
		logger.info("enrichTranslationResponseRR: originatorName = " + originatorName);

		if(!originatorName) {
			var originatorBic = getHeader(map, "PLCN_originatorBic");
			logger.info("enrichTranslationResponseRR: originatorBic = " + originatorBic);

			var bic = createElementwithTextNode2(Document, "AnyBIC", originatorBic);
			logger.info("enrichTranslationResponseRR: typeof bic = " + typeof bic);
			appendElementtoNode(orgtr, bic);
			addtlInfPrefix = "ATR053/";
		}else {
			var nm = createElementwithTextNode2(Document, "Nm", originatorName);
			logger.info("enrichTranslationResponseRR: typeof nm = " + typeof nm);
			appendElementtoNode(orgtr, nm);
			addtlInfPrefix = "ATR072/";
		}

		//var txInf = Document.getElementsByTagName("TxInf"); //root element
		//logger.info("enrichTranslationResponseRR: typeof txInf = " + typeof txInf);

		var rtrRsnInf = Document.createElement("RtrRsnInf");
		logger.info("enrichTranslationResponseRR: typeof rtrRsnInf = " + typeof rtrRsnInf);

		var rsn = Document.createElement("Rsn");
		logger.info("enrichTranslationResponseRR: typeof rsn = " + typeof rsn);

		var cd = createElementwithTextNode2(Document, "Cd", "FOCR");
		logger.info("enrichTranslationResponseRR: typeof cd = " + typeof cd);

		var additionalInfo = getHeader(map, "PLCN_additionalInfo");
		logger.info("enrichTranslationResponseRR: additionalInfo = " + additionalInfo);

		var addtlInf = createElementwithTextNode2(Document, "AddtlInf", addtlInfPrefix + additionalInfo);
		//var addtlInf = createElementwithTextNode2(Document, "AddtlInf", "ATR053/okay");
		logger.info("enrichTranslationResponseRR: typeof addtlInf = " + typeof addtlInf);

		appendElementtoNode(rsn, cd);

		/*if(originatorName) {
			appendElementtoNode(orgtr, nm);
		}else {
			appendElementtoNode(orgtr, bic);	
		}*/
		
		appendElementtoNode(rtrRsnInf, orgtr);
		appendElementtoNode(rtrRsnInf, rsn);
		appendElementtoNode(rtrRsnInf, addtlInf);
		
		var rtrId = Document.getElementsByTagName("RtrId");
		var nextNode = rtrId.item(0);

		var txInf = Document.getElementsByTagName("TxInf").item(0); //root element
		//appendElementtoNode(txInf, rtrRsnInf);

		var orgnlTxRef = Document.getElementsByTagName("OrgnlTxRef");
		logger.info("enrichTranslationResponseRR: typeof orgnlTxRef = " + typeof orgnlTxRef);
		var nextNode = orgnlTxRef.item(0);
		txInf.insertBefore(rtrRsnInf, nextNode);

		var orgnlIntrBkSttlmAmt = getValueFromPath(Document, "Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt");
		logger.info("enrichTranslationResponseRR: orgnlIntrBkSttlmAmt = " + orgnlIntrBkSttlmAmt);

		var chrgsInfVal = getHeader(map, "PLCN_chargesAmount");
		logger.info("enrichTranslationResponseRR: chrgsInfVal = " + chrgsInfVal);

		if(chrgsInfVal) {
			var rtrdIntrBkSttlmAmt = parseFloat(orgnlIntrBkSttlmAmt) - parseFloat(chrgsInfVal);
			logger.info("enrichTranslationResponseRR: typeof rtrdIntrBkSttlmAmt = " + typeof rtrdIntrBkSttlmAmt);
			rtrdIntrBkSttlmAmt = rtrdIntrBkSttlmAmt.toString();
		}else {
			var rtrdIntrBkSttlmAmt = orgnlIntrBkSttlmAmt;
			logger.info("enrichTranslationResponseRR: typeof rtrdIntrBkSttlmAmt = " + typeof rtrdIntrBkSttlmAmt);
		}

		logger.info("enrichTranslationResponseRR: rtrdIntrBkSttlmAmt = " + rtrdIntrBkSttlmAmt);
		setHeader(map, "PLCN_rtrdIntrBkSttlmAmt", rtrdIntrBkSttlmAmt)

		setValueInTxtNode(Document, "Document/PmtRtr/GrpHdr/TtlRtrdIntrBkSttlmAmt", rtrdIntrBkSttlmAmt);
		setValueInTxtNode(Document, "Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt", rtrdIntrBkSttlmAmt);

		if(chrgsInfVal) {	
			var chrgsInf = Document.createElement("ChrgsInf");
			logger.info("enrichTranslationResponseRR: typeof chrgsInf = " + typeof chrgsInf);

			var amt = createElementwithTextNode2(Document, "Amt", chrgsInfVal);
			logger.info("enrichTranslationResponseRR: typeof amt = " + typeof amt);

			createAttribute(Document, amt, "Ccy", "EUR");

			var bicfi = createElementwithTextNode2(Document, "BICFI", getHeader(map, "PLCN_chargeBearer"));
			logger.info("enrichTranslationResponseRR: typeof bicfi = " + typeof bicfi);

			var finInstnId = Document.createElement("FinInstnId");
			logger.info("enrichTranslationResponseRR: typeof finInstnId = " + typeof finInstnId);

			var agt = Document.createElement("Agt");
			logger.info("enrichTranslationResponseRR: typeof agt = " + typeof agt);

			appendElementtoNode(chrgsInf, amt);
			appendElementtoNode(finInstnId, bicfi);
			appendElementtoNode(agt, finInstnId);
			appendElementtoNode(chrgsInf, agt);
		
			var rtrRsnInf = Document.getElementsByTagName("RtrRsnInf");
			logger.info("enrichTranslationResponseRR: typeof rtrRsnInf = " + typeof rtrRsnInf);
			var nextNode = rtrRsnInf.item(0);
			txInf.insertBefore(chrgsInf, nextNode);
		}

		var sttlmInf = Document.getElementsByTagName("SttlmInf").item(0); //Document.getElementsByTagName("SttlmInf");
		logger.info("enrichTranslationResponseRR: typeof sttlmInf = " + typeof sttlmInf);

		var settlementMethod = getHeader(map, "PLCN_settlementMethod");
		logger.info("enrichTranslationResponseRR: settlementMethod = " + settlementMethod);

		if(!settlementMethod) {
			settlementMethod = "CLRG";
		}

		setValueInTxtNode(Document, "Document/PmtRtr/GrpHdr/SttlmInf/SttlmMtd", settlementMethod);

		if(settlementMethod == "INGA" || settlementMethod == "INDA") {
			var settlementAccount = getHeader(map, "PLCN_settlementAccount");
			logger.info("enrichTranslationResponseRR: settlementAccount = " + settlementAccount);

			var sttlmAcct = Document.createElement("SttlmAcct");
			logger.info("enrichTranslationResponseRR: typeof sttlmAcct = " + typeof sttlmAcct);

			var id = Document.createElement("Id");
			logger.info("enrichTranslationResponseRR: typeof id = " + typeof id);

			var iban = createElementwithTextNode2(Document, "IBAN", settlementAccount);
			logger.info("enrichTranslationResponseRR: typeof iban = " + typeof iban);

			appendElementtoNode(sttlmInf, sttlmAcct);
			appendElementtoNode(sttlmAcct, id);
			appendElementtoNode(id, iban);
			//appendElementtoNode(chrgsInf, agt);
		}else {
			var clearingSystem = getHeader(map, "PLCN_clearingSystem");
			logger.info("enrichTranslationResponseRR: clearingSystem = " + clearingSystem);

			if(clearingSystem) {
				var clrSys = Document.createElement("ClrSys");
				logger.info("enrichTranslationResponseRR: typeof clrSys = " + typeof clrSys);

				var prtry = createElementwithTextNode2(Document, "Prtry", clearingSystem);
				logger.info("enrichTranslationResponseRR: typeof prtry = " + typeof prtry);

				appendElementtoNode(sttlmInf, clrSys);
				appendElementtoNode(clrSys, prtry);
			}	
		}

		var clearingSystem = getHeader(map, "PLCN_clearingSystem");
		logger.info("enrichTranslationResponseRR: clearingSystem = " + clearingSystem);

		if(!clearingSystem) {
			clearingSystem = getHeader(map, "CSM");
			logger.info("enrichTranslationResponseRR: clearingSystem from CSM = " + clearingSystem);
		}

		if(clearingSystem == "RT1") {

			var orgnlIntrBkSttlmAmtValue = getValueFromPath(Document, "Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt");
			logger.info("enrichTranslationResponseRR: orgnlIntrBkSttlmAmtValue = " + orgnlIntrBkSttlmAmtValue);

			if(orgnlIntrBkSttlmAmtValue) {
				orgnlIntrBkSttlmAmtValue = parseFloat(orgnlIntrBkSttlmAmtValue);
			}

			if(chrgsInfVal) {
				chrgsInfVal = parseFloat(chrgsInfVal);
			}else {
				chrgsInfVal = 0.0;
			}

			logger.info("enrichTranslationResponseRR: chrgsInfVal = " + chrgsInfVal);
			var rtrdInstdAmtValue = chrgsInfVal + orgnlIntrBkSttlmAmtValue;
			logger.info("enrichTranslationResponseRR: rtrdInstdAmtValue = " + rtrdInstdAmtValue);
			var rtrdInstdAmt = createElementwithTextNode2(Document, "RtrdInstdAmt", rtrdInstdAmtValue.toString());
			logger.info("enrichTranslationResponseRR: typeof rtrdInstdAmt = " + typeof rtrdInstdAmt);
			createAttribute(Document, rtrdInstdAmt, "Ccy", "EUR");
			txInf.insertBefore(rtrdInstdAmt, chrgsInf);		
		}
	}else {
		logger.info("enrichTranslationResponseRR: enrichment for Rejected");

		var assgnmtId = createElementwithTextNode2(Document, "Id", uId);
		logger.info("enrichTranslationResponseRR: typeof assgnmtId = " + typeof assgnmtId);

		var assgnmt = Document.getElementsByTagName("Assgnmt").item(0);
		logger.info("enrichTranslationResponseRR: typeof assgnmt = " + typeof assgnmt);

		var assgnr = Document.getElementsByTagName("Assgnr").item(0);
		logger.info("enrichTranslationResponseRR: typeof assgnr = " + typeof assgnr);

		//appendElementtoNode(assgnmt, assgnmtId);
		assgnmt.insertBefore(assgnmtId, assgnr);

		var cxlStsId = createElementwithTextNode2(Document, "CxlStsId", uId);
		logger.info("enrichTranslationResponseRR: typeof cxlStsId = " + typeof cxlStsId);

		var txInfAndSts = Document.getElementsByTagName("TxInfAndSts").item(0);
		logger.info("enrichTranslationResponseRR: typeof txInfAndSts = " + typeof txInfAndSts);

		var orgnlGrpInf = Document.getElementsByTagName("OrgnlGrpInf").item(0);
		logger.info("enrichTranslationResponseRR: typeof orgnlGrpInf = " + typeof orgnlGrpInf);

		//appendElementtoNode(txInfAndSts, cxlStsId);
		txInfAndSts.insertBefore(cxlStsId, orgnlGrpInf);

		var recallReason = getHeader(map, "PLCN_recallReason");
		logger.info("enrichTranslationResponseRR: recallReason = " + recallReason);

		if(recallReason == "DUPL" || recallReason == "TECH" || recallReason == "FRAD") {
			rejectReferencePrefix = "ATR053/";
		}else if(recallReason == "AC03" || recallReason == "AM09" || recallReason == "CUST") {
			rejectReferencePrefix = "ATR072/";
		}

		var rejectReference = getValueFromPath(Document, "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/AddtlInf");
		logger.info("enrichTranslationResponseRR: rejectReference = " + rejectReference);

		setValueInTxtNode(Document, "Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/AddtlInf", rejectReferencePrefix + rejectReference);

		var rejectReason = getHeader(map, "PLCN_rejectReason");
		logger.info("enrichTranslationResponseRR: rejectReason = " + rejectReason);

		var originatorName = getHeader(map, "PLCN_originatorName");
		logger.info("enrichTranslationResponseRR: originatorName = " + originatorName);

		var orgtr = Document.createElement("Orgtr");
		logger.info("enrichTranslationResponseRR: typeof orgtr = " + typeof orgtr);

		if(!originatorName) {
			var originatorBic = getHeader(map, "PLCN_originatorBic");
			logger.info("enrichTranslationResponseRR: originatorBic = " + originatorBic);

			var bic = createElementwithTextNode2(Document, "BIC", originatorBic);
			logger.info("enrichTranslationResponseRR: typeof bic = " + typeof bic);
			appendElementtoNode(orgtr, bic);	
		}else {
			var nm = createElementwithTextNode2(Document, "Nm", originatorName);
			logger.info("enrichTranslationResponseRR: typeof nm = " + typeof nm);
			appendElementtoNode(orgtr, nm);
		}

		var rsn = Document.createElement("Rsn");
		logger.info("enrichTranslationResponseRR: typeof rsn = " + typeof rsn);

		var cd = createElementwithTextNode2(Document, "Cd", rejectReason);
		logger.info("enrichTranslationResponseRR: typeof cd = " + typeof cd);

		var additionalInfo = getHeader(map, "PLCN_additionalInfo");
		logger.info("enrichTranslationResponseRR: additionalInfo = " + additionalInfo);

		var cxlStsRsnInf = Document.getElementsByTagName("CxlStsRsnInf").item(0);
		logger.info("enrichTranslationResponseRR: typeof cxlStsRsnInf = " + typeof cxlStsRsnInf);

		var addtlInf01 = Document.getElementsByTagName("AddtlInf").item(0);
		logger.info("enrichTranslationResponseRR: typeof addtlInf01 = " + typeof addtlInf01);

		appendElementtoNode(rsn, cd);
		cxlStsRsnInf.insertBefore(orgtr, addtlInf01);
		cxlStsRsnInf.insertBefore(rsn, addtlInf01);		

		var additionalInfoArr = new ArrayList();
		var additionalInfoArrTmp = new ArrayList();
		additionalInfoArr = exchange.getIn().getHeader("Additional_Info", java.util.List.class); //getHeader(map, "Additional_Info");
		additionalInfoArrTmp = getHeader(map, "Additional_Info");
		logger.info("enrichTranslationResponseRR: additionalInfoArr = " + additionalInfoArr);
		logger.info("enrichTranslationResponseRR: additionalInfoArr.length = " + additionalInfoArr.length);
		logger.info("enrichTranslationResponseRR: typeof additionalInfoArr = " + typeof additionalInfoArr);

		logger.info("enrichTranslationResponseRR: additionalInfoArrTmp = " + additionalInfoArrTmp);
		logger.info("enrichTranslationResponseRR: additionalInfoArrTmp.length = " + additionalInfoArrTmp.length);
		logger.info("enrichTranslationResponseRR: typeof additionalInfoArrTmp = " + typeof additionalInfoArrTmp);
		var additionalInfoNodeArr =  new ArrayList();

		var i = 0;

		if(additionalInfoArr) {
			while(i < additionalInfoArr.length && i < 12) {
				logger.info("enrichTranslationResponseRR: additionalInfoArr = " + additionalInfoArr[i]);
				var addtlInfNode = createElementwithTextNode2(Document, "AddtlInf", additionalInfoArr[i]);
				//var addtlInf = createElementwithTextNode2(Document, "AddtlInf", "ATR053/okay");
				logger.info("enrichTranslationResponseRR: typeof addtlInfNode = " + typeof addtlInfNode);
				appendElementtoNode(cxlStsRsnInf, addtlInfNode);
				i++;
			}
		}
	}

	var DocumentString = convertDocumentToString(Document);
	logger.info("enrichTranslationResponseRR: DocumentString = " + DocumentString);
	inMsg.setBody(DocumentString);
}