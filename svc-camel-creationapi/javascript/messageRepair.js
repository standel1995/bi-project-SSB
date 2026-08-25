var Base64 = Java.type('java.util.Base64');
function messageRepair(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var priorityDate;
	var currentDate;
	var pastDateFlag = "false";
	var ibanBicConsistent;
	var mode;
	var autoRepairFlag;
	
	logger.info("In messageRepair");

    institutionId = getHeader(map, "PLCN_institutionId");
    logger.info("messageRepair: institutionId = " + institutionId);

    productCode = getHeader(map, "PLCN_productCode");
    logger.info("messageRepair: productCode = " + productCode);
    
    key = institutionId + "."+ "PROCESSING_STAGES.REPAIR" + "." + "PRODUCTS";
    logger.info("messageRepair: key = " + key);

    value = memTblGetTableValue(map, "INST_PARAM", key);
    logger.info("messageRepair: value = " + value);

    mode = 	getHeader(map, "PLCN_mode");
   	logger.info("messageRepair: mode = " + mode);

   	autoRepairFlag = memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_"+mode);
   	logger.info("messageRepair: autoRepairFlag = " + autoRepairFlag);

    var key2 = institutionId + "."+ "PROCESSING_STAGES.ENRICHMENT" + "." + "PRODUCTS";
    logger.info("messageRepair: key2 = " + key2);

    var value2 = memTblGetTableValue(map, "INST_PARAM", key2);
    logger.info("messageRepair: value2 = " + value2);

    if(!productCode) {
    	var msgType = getHeader(map, "PaymentType");
    	msgType = msgType.toLowerCase();
    	logger.info("messageRepair: PaymentType = " + msgType);

    	if(isPatternPresent(msgType, "target2")) {
    		msgFamily = "target2";
    	}else if(isPatternPresent(msgType, "cbpr")) {
    		msgFamily = "cbpr";
    	}else if(isPatternPresent(msgType, "sepa")){
			msgFamily = "sepa";
    	}

    	msgType = removePattern(msgType, msgFamily);
    	logger.info("messageRepair: msgType = " + msgType);

    	setHeader(map, "PLCN_msgType", msgType);

    	productCode = drveNibcProductCode(exchange);
    	logger.info("messageRepair: productCode from drveNibcProductCode = " + productCode);
    }

    if(productCode) {
        if(isPatternPresent(value2, productCode)) {
        	setHeader(map, "PLCN_callRepairAPI", "true");
			priorityDate = getHeader(map,"PLCN_priorityDate");
			logger.info("messageRepair: priorityDate = " + priorityDate);

			currentDate = getDate();
			logger.info("messageRepair: currentDate = " + currentDate);

			if(priorityDate < currentDate) {
				if(autoRepairFlag != "YES") {
					pastDateFlag = "true";
				}
				
				var path = getValueDatePath(exchange);
				logger.info("messageRepair: path = " + path);
				var newPriorityDate = currentDate.substring(0, 4) + "-" + currentDate.substring(4, 6) + "-"  + currentDate.substring(6, 8);
				logger.info("messageRepair: newPriorityDate = " + newPriorityDate);				
				Document = setValueInPath(Document, path, newPriorityDate);
				logger.info("messageRepair: typeof Document = " + typeof Document);
				setCommentsForTransaction("32", "9011", map);
				setCommentsForTransaction("00", "9506", map);
				setHeader(map, "PLCN_newPriorityDate", currentDate);
			}else {
				pastDateFlag = "false";
			}
        }else {
        	pastDateFlag = "false";
            setHeader(map, "PLCN_repairReq", "false");
        }
    }

    var returnCode = "";

   	var key1 = institutionId + "."+ "MESSAGE_PROCESSING.FUNCTIONALITY.REPAIR" + "." + "ROUTE_TO_REPAIR";
    logger.info("messageRepair: key1 = " + key1);

    var value1 = memTblGetTableValue(map, "INST_PARAM", key1);
    logger.info("messageRepair: value1 = " + value1);

    if(isPatternPresent(value1, "Yes")) {
   		logger.info("messageRepair: Manual Intervention required");
   		setHeader(map, "PLCN_routeToRepair", "true");
    }

	setHeader(map, "PLCN_pastDateFlag", pastDateFlag);
	logger.info("messageRepair: pastDateFlag = " + pastDateFlag);
}

function getValueDatePath(exchange) {
	var path;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var body = inMsg.getBody(java.lang.String.class);

	if(isPatternPresent(body, "<PmtRtr>")) {
		path = "/Document/PmtRtr/TxInf/IntrBkSttlmDt";
	}else if(isPatternPresent(body, "<FIToFICstmrCdtTrf>")) {
		path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmDt"
	}else if(isPatternPresent(body, "<FICdtTrf>")) {
		path = "/Document/FICdtTrf/CdtTrfTxInf/IntrBkSttlmDt";
	}else if(isPatternPresent(body, "<NtfctnToRcv>")) {
		path = "/Document/NtfctnToRcv/Ntfctn/XpctdValDt";
	}

	return path;
}

function createRepairRequest(exchange) {
	logger.info("In createRepairRequest");

	var inMsg = exchange.getIn();
	
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	var messageString = inMsg.getBody(java.lang.String.class);
	logger.info("createRepairRequest: messageString = " + messageString);
	var encodedValue;
	var helper;

	var msgFamily = getHeader(map, "PLCN_msgFamily");
	logger.info("createRepairRequest: msgFamily = " + msgFamily);

	if(msgFamily) {
		msgFamily = msgFamily.toUpperCase();
	}

	var msgType = getHeader(map, "PLCN_msgType");
	logger.info("createRepairRequest: msgType = " + msgType);

	var messageNo = "141414444"; //getHeader(map, "PLCN_messageNo");
	logger.info("createRepairRequest: messageNo = " + messageNo);
	
	if(!messageNo) {
		messageNo = getHeader(map, "PLCNAPI_messageNo");
		logger.info("createRepairRequest: messageNo from PLCNAPI = " + messageNo);
	}

	var institutionId = getHeader(map, "PLCN_institutionId");
    logger.info("createRepairRequest: institutionId = " + institutionId);

    setHeader(map, "Institution-id", "ACEABANK");

	logger.info("createRepairRequest: Body Before messageString = " + messageString);

	var outerJSON ={
	    "unique_identification": messageNo,
	    "message_family": msgFamily,
	    "message_type": msgType
	};
	helper = new JSHelperClass();
	encodedValue = Base64.getEncoder().encodeToString(helper.getBytes(messageString));
	logger.info("createRepairRequest: encodedValue = " + encodedValue);

	var jsonWithMap = convertToJSONWithMap(encodedValue);
	logger.info("createRepairRequest: jsonWithMap = " + jsonWithMap);

	var resultJSON = appendJSON(outerJSON, jsonWithMap);
	logger.info("createRepairRequest: resultJSON = " + resultJSON);

	var jsonString = JSON.stringify(resultJSON);
	logger.info("createRepairRequest: jsonString = " + jsonString);
	logger.info("createRepairRequest: typeof jsonString = " + typeof jsonString);
	inMsg.setBody(jsonString); //for testing	
}

function convertToJSONWithMap(singleValue) {
	logger.info("In convertToJSONWithMap rule");
    var innerMap = new Map();
    innerMap.set("message", singleValue);

    var jsonWithMap = {};
    jsonWithMap["payment"] = Object.fromEntries(innerMap.entries());

    return jsonWithMap;
}

function appendJSON(outerJSON, innerJSON) {
	logger.info("In appendJSON");
    for (var key in innerJSON) {
        outerJSON[key] = innerJSON[key];
    }
    return outerJSON;
}

function processRepairResponse(exchange) {
	var decodedMessage = [];
	var invalidReq = true;
	var callValidationAPI;
	var callWFAPI;
	var flowID;
	var ofldViolation = [];
	var fldNo = [];
	var fldViolation = [];

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In processRepairResponse");
	var jsonDataStr = exchange.getIn().getBody(java.lang.String.class);
	var jsonData = exchange.getIn().getBody(java.lang.String.class);
	setHeader(map, "ACEDB_reqBody", jsonData);
	setHeader(map, "ACEDB_originalBody", jsonData);	
	logger.info("processRepairResponse: jsonDataStr = " + jsonDataStr);

	var institutionId = getHeader(map, "InstitutionId");
	logger.info("processRepairResponse: institutionId = " + institutionId);
	setHeader(map, "ACEDB_institutionId", institutionId);

	var msgType = getHeader(map, "PLCN_MSGCLASSTYPE");
	logger.info("processRepairResponse: msgType from Repair = " + msgType);
 
	var messageType = getHeader(map, "PLCN_MsgType");
	logger.info("processRepairResponse: messageType = " + messageType);
 
	setHeader(map, "PLCN_msgType", msgType);
	setHeader(map, "PLCNAPI_msgType", msgType);
 
	if(!msgType) {
		if(isPatternPresent(messageType, "Pacs008")) {
			msgType = 'Pacs.008.001.08';
			setHeader(map, "PLCN_msgType", msgType);
			setHeader(map, "PLCNAPI_msgType", msgType);
		}else if(isPatternPresent(messageType, "Pacs009")) {
			msgType = 'Pacs.009.001.08';
			setHeader(map, "PLCN_msgType", msgType);
			setHeader(map, "PLCNAPI_msgType", msgType);
		}
	}

	responseData = JSON.parse(jsonData);
	logger.info("processRepairResponse: responseData = " + responseData);
	logger.info("processRepairResponse: typeof responseData = " + typeof responseData);

	var uniqueIdentification = responseData["unique_identification"];
	logger.info("processRepairResponse: uniqueIdentification = " + uniqueIdentification);

	var pelicanRefID = responseData["pelican_reference_identification"];
	logger.info("processRepairResponse: pelicanRefID = " + pelicanRefID);
	
	var status = responseData["status"];
	logger.info("processRepairResponse: status = " + status);

	/*var repairCode = responseData.pelican_audit.return_code["code"];
	logger.info("processRepairResponse: repairCode = " + repairCode);

	var flag = getHeader(map, "PLCN_routeToRepair");

	if((repairCode == "1" || repairCode == "2") && flag == "true") {
		logger.info("processRepairResponse: Manual Intervention Required");
		setHeader(map, "PLCN_repairReq", "true");
	}*/

	var message = responseData.payment["message"];
	logger.info("processRepairResponse: message = " + message);
	logger.info("processRepairResponse: typeof message = " + typeof message);

	//testDecoder(exchange);

	decodedMessage = Base64.getDecoder().decode(message);
	logger.info("processRepairResponse: decodedMessage = " + decodedMessage);

	var strMessage = String.fromCharCode.apply(String, decodedMessage);
	logger.trace("processRepairResponse: strMessage = " + strMessage);
	
	logger.info("processRepairResponse: typeof decodedMessage = " + typeof decodedMessage);

	var decodedMessageString = String.fromCharCode.apply(String, decodedMessage); //base64 decoded string
	logger.info("processRepairResponse: decodedMessageString = " + decodedMessageString);
	logger.info("processRepairResponse: typeof decodedMessageString = " + typeof decodedMessageString);
	setHeader(map, "ACEDB_decodedMessageString", decodedMessageString);
	
    var payload = decodedMessageString.substring(decodedMessageString.indexOf("<Document"), decodedMessageString.indexOf("</Document") + 11);
    logger.info("processRepairResponse: payload = " + payload);

	if(isPatternPresent(decodedMessageString, "<Audit")) {
		var value = dataBetweenTokens("<PlcnCodes>", "</PlcnCodes>", decodedMessageString);
		logger.info("processRepairResponse: value = " + value);
		
		var returnCodeXml = dataBetweenTokens("<ReturnCode>", "</ReturnCode>", decodedMessageString);
		logger.info("processRepairResponse: returnCodeXml = " + returnCodeXml);

		var returnCode = dataBetweenTokens("<Cd>", "</Cd>", returnCodeXml);
		logger.info("processRepairResponse: returnCode = " + returnCode);

		var returnCodeDes = dataBetweenTokens("<Description>", "</Description>", returnCodeXml);
		logger.info("processRepairResponse: returnCodeDes = " + returnCodeDes);

		setHeader(map, "PLCN_returnCode", returnCode);
		setHeader(map, "PLCN_returnCodeDes", returnCodeDes);

		var txnComments = getHeader(map, "PLCN_txnComments"); //"P00-1P32-1:A00:00-9505:A00:32-6012:A00:32-6013";
		var orgnlComments = value //"P00-1:A00:00-9505";
		var txnCommentsDB = txnComments;

		logger.info("processRepairResponse: txnComments = " + txnComments);
		logger.info("processRepairResponse: orgnlComments = " + orgnlComments);

		if(orgnlComments) {
			var ovCount = (orgnlComments.match(/:A00:/g)).length;
		}

		var comments = txnComments + ":A00:";

		logger.info("processRepairResponse: ovCount = " + ovCount);
		logger.info("processRepairResponse: comments = " + comments);

		orgnlComments = orgnlComments + ":A00:";

		for(k = 0; k < ovCount; k++) {
			var otmp = dataBetweenTokens(":A00:", ":A00:", orgnlComments);
			logger.info("processRepairResponse: otmp = " + otmp);
			ofldViolation[k] = otmp.substring(3, 7);
			comments = removePattern(comments, ":A00:" + otmp);
			orgnlComments = removePattern(orgnlComments, ":A00:" + tmp);
		}

		logger.info("processRepairResponse: comments = " + comments);
		logger.info("processRepairResponse: orgnlComments = " + orgnlComments);
		logger.info("processRepairResponse: txnComments = " + txnComments);

		plcnCodesValues = comments.substring(0, comments.length - 5);
		logger.info("processRepairResponse: plcnCodesValues = " + plcnCodesValues);

		logger.info("processRepairResponse: txnComments = " + txnComments);
		logger.info("processRepairResponse: txnComments length = " + txnComments.length);
		logger.info("processRepairResponse: typeof txnComments = " + typeof txnComments);

		if(txnComments.length > 0) {
			vCount = (txnComments.match(/:A00:/g)).length;//(txnComments.match(/:A00:/g) || []).length;
			logger.info("processRepairResponse: vCount = " + vCount);
		}

		for(i = 0; i < ovCount; i++) {
			logger.info("processRepairResponse: orgnlComments = " + orgnlComments);
			var tmp = dataBetweenTokens(":A00:", ":A00:", orgnlComments); //296-5770
			logger.info("processRepairResponse: tmp = " + tmp);
			var tmp2 = ":A00:" + tmp + ":A00:" //:A00:296-5770:A00:
			logger.info("processRepairResponse: tmp2 = " + tmp2);
			fldNo[i] = dataBetweenTokens(":A00:", "-", tmp2); //tmp.substring(0, 2);
			fldViolation[i] = dataBetweenTokens("-", ":A00:", tmp2); //tmp.substring(3, 7);
			orgnlComments = removePattern(orgnlComments, ":A00:" + tmp);
			setCommentsForTransaction(fldNo[i], fldViolation[i], map);
		}

		logger.info("processRepairResponse: fldViolation = " + fldViolation);
		logger.info("processRepairResponse: fldNo = " + fldNo);	
	}

	inMsg.setBody(payload);	

	/*var decodedMessageDoc = createDocument(decodedMessageString);
	logger.info("processRepairResponse: typeof decodedMessageDoc = " + typeof decodedMessageDoc);*/

	/*var messageFamily = memTblGetTableValue(map, "MESSAGEFAMILY", messageFamilyReq);
	messageFamily = messageFamily.trim();
	logger.info("processRepairResponse: messageFamily = " + messageFamily);*/

	//var config = memTblGetTableValue(map, "INST_PARAM", path);
	//logger.info("drveProductCode: config = " + config);

	//if(isPatternPresent(jsonDataStr, "pelican_field_number")) {
		//var count = countOccurrences(responseData, "pelican_field_number");
		//logger.info("drveProductCode: count = " + count);
	//}
}

function setRepairApiResponse(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	logger.info("In setRepairApiResponse");
	//var res1 = '{"unique_identification":"141414444","pelican_reference_identification":"000023470296","status":"OK","payment":{"message":"PERvY3VtZW50IHhtbG5zPSJ1cm46aXNvOnN0ZDppc286MjAwMjI6dGVjaDp4c2Q6cGFjcy4wMDguMDAxLjA4IiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIj4NCiAgIDxGSVRvRklDc3RtckNkdFRyZj4NCiAgICAgIDxHcnBIZHI+DQogICAgICAgICA8TXNnSWQ+MjAyNDAzMDQxOTM1MzM1NjU8L01zZ0lkPg0KICAgICAgICAgPENyZUR0VG0+MjAyNC0wMy0wNFQxOTozNTozMy41NjUrMDU6MzA8L0NyZUR0VG0+DQogICAgICAgICA8TmJPZlR4cz4xPC9OYk9mVHhzPg0KICAgICAgICAgPFN0dGxtSW5mPg0KICAgICAgICAgICAgPFN0dGxtTXRkPklOREE8L1N0dGxtTXRkPg0KICAgICAgICAgPC9TdHRsbUluZj4NCiAgICAgIDwvR3JwSGRyPg0KICAgICAgPENkdFRyZlR4SW5mPg0KICAgICAgICAgPFBtdElkPg0KICAgICAgICAgICAgPEluc3RySWQ+SU5TUFcyPC9JbnN0cklkPg0KICAgICAgICAgICAgPEVuZFRvRW5kSWQ+MjAyNDAzMDQxOTIxNDgxODwvRW5kVG9FbmRJZD4NCiAgICAgICAgICAgIDxUeElkPjIwMjQwMzA0MTkyMTQ4MTg8L1R4SWQ+DQogICAgICAgICAgICA8VUVUUj4zYWQ1MTJmYS0wYmZiLTQ4NzYtOGYwNC0wZGQ3NmVhNDM0MGE8L1VFVFI+DQogICAgICAgICA8L1BtdElkPg0KICAgICAgICAgPEludHJCa1N0dGxtQW10IENjeT0iVVNEIj41MDAuMDA8L0ludHJCa1N0dGxtQW10Pg0KICAgICAgICAgPEludHJCa1N0dGxtRHQ+MjAyNC0wMy0wNDwvSW50ckJrU3R0bG1EdD4NCiAgICAgICAgIDxTdHRsbVBydHk+Tk9STTwvU3R0bG1QcnR5Pg0KICAgICAgICAgPENocmdCcj5TSEFSPC9DaHJnQnI+DQogICAgICAgICA8SW5zdGdBZ3Q+DQogICAgICAgICAgICA8RmluSW5zdG5JZD4NCiAgICAgICAgICAgICAgIDxCSUNGST5TQU5UQVRXV1hYWDwvQklDRkk+DQogICAgICAgICAgICA8L0Zpbkluc3RuSWQ+DQogICAgICAgICA8L0luc3RnQWd0Pg0KICAgICAgICAgPEluc3RkQWd0Pg0KICAgICAgICAgICAgPEZpbkluc3RuSWQ+DQogICAgICAgICAgICAgICA8QklDRkk+UlpCQUFUV1dYWFg8L0JJQ0ZJPg0KICAgICAgICAgICAgPC9GaW5JbnN0bklkPg0KICAgICAgICAgPC9JbnN0ZEFndD4NCiAgICAgICAgIDxEYnRyPg0KICAgICAgICAgICAgPE5tPk9yZGVyaW5nIFBhcnR5IE5hbWU8L05tPg0KICAgICAgICAgICAgPFBzdGxBZHI+DQogICAgICAgICAgICAgICA8VHduTm0+TXVtYmFpPC9Ud25ObT4NCiAgICAgICAgICAgICAgIDxDdHJ5PkFUPC9DdHJ5Pg0KICAgICAgICAgICAgPC9Qc3RsQWRyPg0KICAgICAgICAgPC9EYnRyPg0KICAgICAgICAgPERidHJBY2N0Pg0KICAgICAgICAgICAgPElkPg0KICAgICAgICAgICAgICAgPElCQU4+QUwzNTIwMjExMTA5MDAwMDAwMDAwMTIzNDU2NzwvSUJBTj4NCiAgICAgICAgICAgIDwvSWQ+DQogICAgICAgICA8L0RidHJBY2N0Pg0KICAgICAgICAgPERidHJBZ3Q+DQogICAgICAgICAgICA8RmluSW5zdG5JZD4NCiAgICAgICAgICAgICAgIDxCSUNGST5TQU5UQVRXV1hYWDwvQklDRkk+DQogICAgICAgICAgICA8L0Zpbkluc3RuSWQ+DQogICAgICAgICA8L0RidHJBZ3Q+DQogICAgICAgICA8Q2R0ckFndD4NCiAgICAgICAgICAgIDxGaW5JbnN0bklkPg0KICAgICAgICAgICAgICAgPEJJQ0ZJPkFCTkFOTDJBWFhYPC9CSUNGST4NCiAgICAgICAgICAgIDwvRmluSW5zdG5JZD4NCiAgICAgICAgIDwvQ2R0ckFndD4NCiAgICAgICAgIDxDZHRyPg0KICAgICAgICAgICAgPE5tPkJlbmVmaWNpYXJ5IE5hbWU8L05tPg0KICAgICAgICAgICAgPFBzdGxBZHI+DQogICAgICAgICAgICAgICA8VHduTm0+THVja25vdzwvVHduTm0+DQogICAgICAgICAgICAgICA8Q3RyeT5OTDwvQ3RyeT4NCiAgICAgICAgICAgIDwvUHN0bEFkcj4NCiAgICAgICAgIDwvQ2R0cj4NCiAgICAgICAgIDxDZHRyQWNjdD4NCiAgICAgICAgICAgIDxJZD4NCiAgICAgICAgICAgICAgIDxJQkFOPkFUNDgzMjAwMDAwMDEyMzQ1ODY0PC9JQkFOPg0KICAgICAgICAgICAgPC9JZD4NCiAgICAgICAgIDwvQ2R0ckFjY3Q+DQogICAgICA8L0NkdFRyZlR4SW5mPg0KICAgPC9GSVRvRklDc3RtckNkdFRyZj4NCjwvRG9jdW1lbnQ+"},"return_code":{"code":"2"}}';
	//var res2 = '{"unique_identification":"141414444","pelican_reference_identification":"000023470296","status":"OK","pelican_audit":{"response_codes":{"pelican_field_number":"00","field_tag":"","field_name":"","code_type":"Repair","code":"9506","description":"Message with past value date"},"additional_response_codes":{"pelican_code":"P00-1:A00:00-9506:A00:00-9011"},"return_code":{"code":"2","description":"Some Repair"}},"payment":{"message":"PERvY3VtZW50IHhtbG5zPSJ1cm46aXNvOnN0ZDppc286MjAwMjI6dGVjaDp4c2Q6cGFjcy4wMDguMDAxLjA4IiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIj4NCiAgIDxGSVRvRklDc3RtckNkdFRyZj4NCiAgICAgIDxHcnBIZHI+DQogICAgICAgICA8TXNnSWQ+MjAyNDAzMDQxOTM1MzM1NjU8L01zZ0lkPg0KICAgICAgICAgPENyZUR0VG0+MjAyNC0wMy0wNFQxOTozNTozMy41NjUrMDU6MzA8L0NyZUR0VG0+DQogICAgICAgICA8TmJPZlR4cz4xPC9OYk9mVHhzPg0KICAgICAgICAgPFN0dGxtSW5mPg0KICAgICAgICAgICAgPFN0dGxtTXRkPklOREE8L1N0dGxtTXRkPg0KICAgICAgICAgPC9TdHRsbUluZj4NCiAgICAgIDwvR3JwSGRyPg0KICAgICAgPENkdFRyZlR4SW5mPg0KICAgICAgICAgPFBtdElkPg0KICAgICAgICAgICAgPEluc3RySWQ+SU5TUFcyPC9JbnN0cklkPg0KICAgICAgICAgICAgPEVuZFRvRW5kSWQ+MjAyNDAzMDQxOTIxNDgxODwvRW5kVG9FbmRJZD4NCiAgICAgICAgICAgIDxUeElkPjIwMjQwMzA0MTkyMTQ4MTg8L1R4SWQ+DQogICAgICAgICAgICA8VUVUUj4zYWQ1MTJmYS0wYmZiLTQ4NzYtOGYwNC0wZGQ3NmVhNDM0MGE8L1VFVFI+DQogICAgICAgICA8L1BtdElkPg0KICAgICAgICAgPEludHJCa1N0dGxtQW10IENjeT0iVVNEIj41MDAuMDA8L0ludHJCa1N0dGxtQW10Pg0KICAgICAgICAgPEludHJCa1N0dGxtRHQ+MjAyNC0wMy0wNDwvSW50ckJrU3R0bG1EdD4NCiAgICAgICAgIDxTdHRsbVBydHk+Tk9STTwvU3R0bG1QcnR5Pg0KICAgICAgICAgPENocmdCcj5TSEFSPC9DaHJnQnI+DQogICAgICAgICA8SW5zdGdBZ3Q+DQogICAgICAgICAgICA8RmluSW5zdG5JZD4NCiAgICAgICAgICAgICAgIDxCSUNGST5TQU5UQVRXV1hYWDwvQklDRkk+DQogICAgICAgICAgICA8L0Zpbkluc3RuSWQ+DQogICAgICAgICA8L0luc3RnQWd0Pg0KICAgICAgICAgPEluc3RkQWd0Pg0KICAgICAgICAgICAgPEZpbkluc3RuSWQ+DQogICAgICAgICAgICAgICA8QklDRkk+UlpCQUFUV1dYWFg8L0JJQ0ZJPg0KICAgICAgICAgICAgPC9GaW5JbnN0bklkPg0KICAgICAgICAgPC9JbnN0ZEFndD4NCiAgICAgICAgIDxEYnRyPg0KICAgICAgICAgICAgPE5tPk9yZGVyaW5nIFBhcnR5IE5hbWU8L05tPg0KICAgICAgICAgICAgPFBzdGxBZHI+DQogICAgICAgICAgICAgICA8VHduTm0+TXVtYmFpPC9Ud25ObT4NCiAgICAgICAgICAgICAgIDxDdHJ5PkFUPC9DdHJ5Pg0KICAgICAgICAgICAgPC9Qc3RsQWRyPg0KICAgICAgICAgPC9EYnRyPg0KICAgICAgICAgPERidHJBY2N0Pg0KICAgICAgICAgICAgPElkPg0KICAgICAgICAgICAgICAgPElCQU4+QUwzNTIwMjExMTA5MDAwMDAwMDAwMTIzNDU2NzwvSUJBTj4NCiAgICAgICAgICAgIDwvSWQ+DQogICAgICAgICA8L0RidHJBY2N0Pg0KICAgICAgICAgPERidHJBZ3Q+DQogICAgICAgICAgICA8RmluSW5zdG5JZD4NCiAgICAgICAgICAgICAgIDxCSUNGST5TQU5UQVRXV1hYWDwvQklDRkk+DQogICAgICAgICAgICA8L0Zpbkluc3RuSWQ+DQogICAgICAgICA8L0RidHJBZ3Q+DQogICAgICAgICA8Q2R0ckFndD4NCiAgICAgICAgICAgIDxGaW5JbnN0bklkPg0KICAgICAgICAgICAgICAgPEJJQ0ZJPkFCTkFOTDJBWFhYPC9CSUNGST4NCiAgICAgICAgICAgIDwvRmluSW5zdG5JZD4NCiAgICAgICAgIDwvQ2R0ckFndD4NCiAgICAgICAgIDxDZHRyPg0KICAgICAgICAgICAgPE5tPkJlbmVmaWNpYXJ5IE5hbWU8L05tPg0KICAgICAgICAgICAgPFBzdGxBZHI+DQogICAgICAgICAgICAgICA8VHduTm0+THVja25vdzwvVHduTm0+DQogICAgICAgICAgICAgICA8Q3RyeT5OTDwvQ3RyeT4NCiAgICAgICAgICAgIDwvUHN0bEFkcj4NCiAgICAgICAgIDwvQ2R0cj4NCiAgICAgICAgIDxDZHRyQWNjdD4NCiAgICAgICAgICAgIDxJZD4NCiAgICAgICAgICAgICAgIDxJQkFOPkFUNDgzMjAwMDAwMDEyMzQ1ODY0PC9JQkFOPg0KICAgICAgICAgICAgPC9JZD4NCiAgICAgICAgIDwvQ2R0ckFjY3Q+DQogICAgICA8L0NkdFRyZlR4SW5mPg0KICAgPC9GSVRvRklDc3RtckNkdFRyZj4NCjwvRG9jdW1lbnQ+DQo8QXVkaXQ+DQoJPFJlc3BvbnNlQ2RzPg0KCQk8QWRkdGxSZXNwb25zZUNkcz4NCgkJCTxQbGNuRmxkTnVtPjUyMzwvUGxjbkZsZE51bT4NCgkJCTxGbGRUYWc+L0ZJVG9GSUNzdG1yQ2R0VHJmL0NkdFRyZlR4SW5mL0luc3RnQWd0PC9GbGRUYWc+DQoJCQk8RmxkTmFtZT5JbnN0cnVjdGluZyBBZ2VudDwvRmxkTmFtZT4NCgkJCTxDZFRwPkluZm88L0NkVHA+DQoJCQk8Q2Q+NjAzMzwvQ2Q+DQoJCQk8RGVzY3JpcHRpb24+QklDIGV4dHJhY3RlZCBmcm9tIGZpZWxkPC9EZXNjcmlwdGlvbj4NCgkJPC9BZGR0bFJlc3BvbnNlQ2RzPg0KCQk8QWRkdGxSZXNwb25zZUNkcz4NCgkJCTxQbGNuRmxkTnVtPjUzNjwvUGxjbkZsZE51bT4NCgkJCTxGbGRUYWc+L0ZJVG9GSUNzdG1yQ2R0VHJmL0NkdFRyZlR4SW5mL0luc3RkQWd0PC9GbGRUYWc+DQoJCQk8RmxkTmFtZT5JbnN0cnVjdGVkIEFnZW50PC9GbGROYW1lPg0KCQkJPENkVHA+SW5mbzwvQ2RUcD4NCgkJCTxDZD42MDMzPC9DZD4NCgkJCTxEZXNjcmlwdGlvbj5CSUMgZXh0cmFjdGVkIGZyb20gZmllbGQ8L0Rlc2NyaXB0aW9uPg0KCQk8L0FkZHRsUmVzcG9uc2VDZHM+DQoJCTxBZGR0bFJlc3BvbnNlQ2RzPg0KCQkJPFBsY25GbGROdW0+ODIyPC9QbGNuRmxkTnVtPg0KCQkJPEZsZFRhZz4vRklUb0ZJQ3N0bXJDZHRUcmYvQ2R0VHJmVHhJbmYvRGJ0ckFjY3Q8L0ZsZFRhZz4NCgkJCTxGbGROYW1lPkRlYnRvciBBY2NvdW50PC9GbGROYW1lPg0KCQkJPENkVHA+SW5mbzwvQ2RUcD4NCgkJCTxDZD42NzIwPC9DZD4NCgkJCTxEZXNjcmlwdGlvbj5BY2NvdW50IG51bWJlciBmb3VuZCBpbiBBY2NvdW50IG51bWJlciBsaW5lLjwvRGVzY3JpcHRpb24+DQoJCTwvQWRkdGxSZXNwb25zZUNkcz4NCgkJPEFkZHRsUmVzcG9uc2VDZHM+DQoJCQk8UGxjbkZsZE51bT44ODk8L1BsY25GbGROdW0+DQoJCQk8RmxkVGFnPi9GSVRvRklDc3RtckNkdFRyZi9DZHRUcmZUeEluZi9DZHRyQWd0PC9GbGRUYWc+DQoJCQk8RmxkTmFtZT5DcmVkaXRvciBBZ2VudDwvRmxkTmFtZT4NCgkJCTxDZFRwPldhcm5pbmc8L0NkVHA+DQoJCQk8Q2Q+NzAxNTwvQ2Q+DQoJCQk8RGVzY3JpcHRpb24+TmFycmF0aXZlIHByZXNlbnQuPC9EZXNjcmlwdGlvbj4NCgkJPC9BZGR0bFJlc3BvbnNlQ2RzPg0KCQk8QWRkdGxSZXNwb25zZUNkcz4NCgkJCTxQbGNuRmxkTnVtPjk4ODwvUGxjbkZsZE51bT4NCgkJCTxGbGRUYWc+L0ZJVG9GSUNzdG1yQ2R0VHJmL0NkdFRyZlR4SW5mL0NkdHJBY2N0PC9GbGRUYWc+DQoJCQk8RmxkTmFtZT5DcmVkaXRvciBBY2NvdW50PC9GbGROYW1lPg0KCQkJPENkVHA+SW5mbzwvQ2RUcD4NCgkJCTxDZD42NzIwPC9DZD4NCgkJCTxEZXNjcmlwdGlvbj5BY2NvdW50IG51bWJlciBmb3VuZCBpbiBBY2NvdW50IG51bWJlciBsaW5lLjwvRGVzY3JpcHRpb24+DQoJCTwvQWRkdGxSZXNwb25zZUNkcz4NCgkJPEFkZHRsUmVzcG9uc2VDZHM+DQoJCQk8UGxjbkZsZE51bT44ODk8L1BsY25GbGROdW0+DQoJCQk8RmxkVGFnPi9GSVRvRklDc3RtckNkdFRyZi9DZHRUcmZUeEluZi9DZHRyQWd0PC9GbGRUYWc+DQoJCQk8RmxkTmFtZT5DcmVkaXRvciBBZ2VudDwvRmxkTmFtZT4NCgkJCTxDZFRwPldhcm5pbmc8L0NkVHA+DQoJCQk8Q2Q+NzAwMDwvQ2Q+DQoJCQk8RGVzY3JpcHRpb24+QklDIGNvdWxkIG5vdCBiZSBkZXJpdmVkPC9EZXNjcmlwdGlvbj4NCgkJPC9BZGR0bFJlc3BvbnNlQ2RzPg0KCQk8QWRkdGxSZXNwb25zZUNkcz4NCgkJCTxQbGNuRmxkTnVtPjk0NTwvUGxjbkZsZE51bT4NCgkJCTxGbGRUYWc+L0ZJVG9GSUNzdG1yQ2R0VHJmL0NkdFRyZlR4SW5mL0NkdHI8L0ZsZFRhZz4NCgkJCTxGbGROYW1lPkNyZWRpdG9yPC9GbGROYW1lPg0KCQkJPENkVHA+V2FybmluZzwvQ2RUcD4NCgkJCTxDZD43MDAwPC9DZD4NCgkJCTxEZXNjcmlwdGlvbj5CSUMgY291bGQgbm90IGJlIGRlcml2ZWQ8L0Rlc2NyaXB0aW9uPg0KCQk8L0FkZHRsUmVzcG9uc2VDZHM+DQoJCTxBZGR0bFJlc3BvbnNlQ2RzPg0KCQkJPFBsY25GbGROdW0+ODg5PC9QbGNuRmxkTnVtPg0KCQkJPEZsZFRhZz4vRklUb0ZJQ3N0bXJDZHRUcmYvQ2R0VHJmVHhJbmYvQ2R0ckFndDwvRmxkVGFnPg0KCQkJPEZsZE5hbWU+Q3JlZGl0b3IgQWdlbnQ8L0ZsZE5hbWU+DQoJCQk8Q2RUcD5JbmZvPC9DZFRwPg0KCQkJPENkPjYwNTg8L0NkPg0KCQkJPERlc2NyaXB0aW9uPk5vIG1hdGNoIGZvdW5kIGluIFN0YW5kYXJkIFNldHRsZW1lbnQgSW5zdHJ1Y3Rpb25zIFRhYmxlPC9EZXNjcmlwdGlvbj4NCgkJPC9BZGR0bFJlc3BvbnNlQ2RzPg0KCQk8QWRkdGxSZXNwb25zZUNkcz4NCgkJCTxQbGNuRmxkTnVtPjg4OTwvUGxjbkZsZE51bT4NCgkJCTxGbGRUYWc+L0ZJVG9GSUNzdG1yQ2R0VHJmL0NkdFRyZlR4SW5mL0NkdHJBZ3Q8L0ZsZFRhZz4NCgkJCTxGbGROYW1lPkNyZWRpdG9yIEFnZW50PC9GbGROYW1lPg0KCQkJPENkVHA+UmVwYWlyPC9DZFRwPg0KCQkJPENkPjk5MzU8L0NkPg0KCQkJPERlc2NyaXB0aW9uPkFjY291bnQgbnVtYmVyIGxpbmUgcmVwYWlyZWQgYnkgTkNIIGNvZGUuPC9EZXNjcmlwdGlvbj4NCgkJPC9BZGR0bFJlc3BvbnNlQ2RzPg0KCQk8QWRkdGxSZXNwb25zZUNkcz4NCgkJCTxQbGNuRmxkTnVtPjg4OTwvUGxjbkZsZE51bT4NCgkJCTxGbGRUYWc+L0ZJVG9GSUNzdG1yQ2R0VHJmL0NkdFRyZlR4SW5mL0NkdHJBZ3Q8L0ZsZFRhZz4NCgkJCTxGbGROYW1lPkNyZWRpdG9yIEFnZW50PC9GbGROYW1lPg0KCQkJPENkVHA+UmVwYWlyPC9DZFRwPg0KCQkJPENkPjk5OTk8L0NkPg0KCQkJPERlc2NyaXB0aW9uPkZpZWxkIFJlcGFpcmVkPC9EZXNjcmlwdGlvbj4NCgkJPC9BZGR0bFJlc3BvbnNlQ2RzPg0KCQk8UmVzcG9uc2VDZHNQbGNuRm10Pg0KCQkJPFBsY25Db2Rlcz5QNTIzLTFQNTM2LTFQODIyLTFQODg5LTFQOTg4LTFQOTQ1LTE6QTAwOjUyMy02MDMzOkEwMDo1MzYtNjAzMzpBMDA6ODIyLTY3MjA6QTAwOjg4OS03MDE1OkEwMDo5ODgtNjcyMDpBMDA6ODg5LTcwMDA6QTAwOjk0NS03MDAwOkEwMDo4ODktNjA1ODpBMDA6ODg5LTk5MzU6QTAwOjg4OS05OTk5PC9QbGNuQ29kZXM+DQoJCTwvUmVzcG9uc2VDZHNQbGNuRm10Pg0KCTwvUmVzcG9uc2VDZHM+DQoJPFJldHVybkNvZGU+DQoJCTxDZD4zPC9DZD4NCgkJPERlc2NyaXB0aW9uPkZ1bGwgUmVwYWlyPC9EZXNjcmlwdGlvbj4NCgk8L1JldHVybkNvZGU+DQo8L0F1ZGl0Pg"}}';
	var res2 = exchange.getIn().getBody(java.lang.String.class);
	logger.info("setRepairApiResponse: res2 = " + res2);
	inMsg.setBody(res2);
}

function drveNibcProductCode(exchange) {
	var mode;
	var msgType;
	var productCode;
	var key;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In drveNibcProductCode");

	mode = getHeader(map, "PLCN_msgModeIn");
	logger.info("drveNibcProductCode: mode = " + mode);
	msgType = getHeader(map, "PLCN_msgType");
	logger.info("drveNibcProductCode: msgType = " + msgType);

	if(mode == "MANUAL" || mode == "UPLOAD") {
		key = mode + "-" + msgType;
		logger.info("drveNibcProductCode: key = " + key);

		productCode = memTblGetTableValue(map, "PPAY_PRODUCT_CODE", key);
		productCode = productCode.trim();
		logger.info("drveNibcProductCode: productCode = " + productCode);
	}

	if(productCode) {
		setHeader(map, "PLCN_productCode", productCode);
		return productCode;
	}
}