function schedulingCheck(exchange) {
	var inMsg;
	var map;
	var Document;
	var msgDirection;
	var schCheck;
	var priorityDate;

	logger.info("In schedulingCheck");
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	msgDirection = getHeaderWithLogging(map, "PLCN_msgDirection");

    priorityDate = getHeaderWithLogging(map, "PLCN_valueDate");

    var msgFamily = getHeaderWithLogging(map, "PLCN_msgFamily");

	var msgType = getHeaderWithLogging(map, "PLCN_msgType");

    var todaysDate = getDate();
    setHeader(map, "PLCN_todaysDate", todaysDate);

    extractHzlData(exchange);
    
    if(msgDirection == "O") {
    	if(msgFamily == "SEPA"){
			if(msgType != "pacs.008.001.08"){
				setSchedulingHeader(exchange);
				return; 
			}
		}else {
			setSchedulingHeader(exchange);
			return; 
		}
    }

    PLCN_prevQueueId = getHeaderWithLogging(map, "PLCN_prevQueueId");
    
	
	//added by SP for TBSEETHTY-8938
	var releaseflag = getHeader(map, "PLCNAPI_custom29");
	logger.info("schedulingCheck: PLCNAPI_custom29 = " + releaseflag);
	if((PLCN_prevQueueId == "MXHOLDQ" || PLCN_prevQueueId == "TXNHOLDQ") && releaseflag != "AUTO"){
		sntdManualRelease(exchange);
		return;
	}

    if(PLCN_prevQueueId == "MXHOLDQ" || PLCN_prevQueueId == "TXNHOLDQ") {
    	setHeader(map, "PLCN_custom24", "");
		setHeader(map, "PLCNAPI_custom24", "");
		setHeader(map, "PLCN_Bulkcustom24", "");
    	setHeader(map, "PLCN_schedulingReq", false);
        
        var custom24 = getHeaderWithLogging(map, "PLCN_custom24");
        var comments1 = getHeaderWithLogging(map, "PLCN_commentsForBlob6");
        var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
        if(!custom24 && comments1!="8993" && institutionId != "SBOSUS33"){
            sepaProprietaryBulkingConfiguration1(exchange);
            custom24 = getHeaderWithLogging(map, "PLCN_custom24");
            setHeader(map, "PLCN_Bulkcustom24", custom24);
            logger.info("schedulingCheck: PLCN_Bulkcustom24 = " + custom24);
        }
        
    	setSchedulingHeader(exchange);
    	return;	
    }

	//setHeader(map,"PLCN_schedulingReq", false);
	//retVal = applyScheduleRouteMx(exchange);
	//new development for scheduling check based on product code is required
	var preWrhsPath = institutionId.concat(".PROCESSING_STAGES.PRE_WAREHOUSE.PRODUCTS");
	logger.info("schedulingCheck: preWrhsPath = " + preWrhsPath);
	/*var preWrhsCode = memTblGetTableValue(map, "INST_PARAM", preWrhsPath);
	logger.info("schedulingCheck: preWrhsCode = " + preWrhsCode);*/
	var preWrhsCode = getHeaderWithLogging(map, "PLCN_preWrhsCode");

	var productCode = getHeaderWithLogging(map, "PLCN_productCode");

	if(isPatternPresent(preWrhsCode, productCode)) {
		schCheck = true;  //for testing
	}else {
		schCheck = false;
	}

	//schCheck = true; //scheduling turned off
	logger.info("schedulingCheck: schCheck from applyScheduleRouteMx = " + schCheck);

	var plcnInternalcall = getHeaderWithLogging(map,"PLCN_call");
	plcnInternalcall = plcnInternalcall.toString();

	if(!msgFamily){
		var msgFamily = getHeaderWithLogging(map, "PLCN_msgFamilyDB");
	}

	var custom13 = getHeaderWithLogging(map, "PLCN_custom13");

	var creationCall = getHeaderWithLogging(map, "PLCN_creationCall");

	if(creationCall == "true"){
	if(schCheck == true) {
		mainSchduleRouteMx(exchange);
	}
	}else if((isPatternPresent(msgFamily,"SEPA") || isPatternPresent(msgFamily,"CBPR") || isPatternPresent(msgFamily,"TARGET2")) && plcnInternalcall == "true" && isPatternPresent(custom13, "WAREHOUSE=Y")){
		//if(schCheck == true) {
			mainSchduleRouteMx(exchange);
		//}
		custom13 = replacePattern(custom13, "WAREHOUSE=Y", "WAREHOUSE=D");
		logger.info("schedulingCheck: custom13 = " + custom13);
		setHeader(map, "PLCN_custom13", custom13);
		setHeader(map, "PLCNAPI_custom13", custom13);
	}
	
	//added by SP for Custom24 population for bulking
	var custom24 = getHeaderWithLogging(map, "PLCN_custom24");
	var comments1 = getHeaderWithLogging(map, "PLCN_commentsForBlob6");
    var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");	
	if(!custom24 && comments1!="8993" && institutionId != "SBOSUS33"){
		sepaProprietaryBulkingConfiguration1(exchange);
		custom24 = getHeaderWithLogging(map, "PLCN_custom24");
		setHeader(map, "PLCN_Bulkcustom24", custom24);
		logger.info("schedulingCheck: PLCN_Bulkcustom24 = " + custom24);
	}
		
	setSchedulingHeader(exchange);
	
	logger.info("schedulingCheck: PLCN_custom24 = " + getHeader(map, "PLCN_custom24"));
}

function setSchedulingHeader(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

    var msgFamily = getHeaderWithLogging(map, "PLCN_msgFamily");

    msgFamily = msgFamily.toUpperCase();

	var schFlag = getHeaderWithLogging(map, "PLCN_schedulingReq");
	schFlag = schFlag.toString();

	var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	var repairReq = getHeaderWithLogging(map, "PLCN_repairReq");

	var comments = getHeaderWithLogging(map, "PLCN_txnComments");

	if(isPatternPresent(comments, "00-9506") && isPatternPresent(comments, "32-6013")) {

		if(repairReq == "true") {
			logger.info("setSchedulingHeader: deleting :A00:32-6013 from comments");
			comments = removePattern(comments, ":A00:32-6013");
		}else {
			logger.info("setSchedulingHeader: deleting :A00:32-6013 from comments");
			comments = removePattern(comments, ":A00:00-9506");
		}

		logger.info("setSchedulingHeader: comments = " + comments);
		setHeader(map, "PLCN_txnComments", comments);
	}

	/*if(isPatternPresent(comments, "32-9500") && !isPatternPresent(comments, "32-6012")) {
		logger.info("setSchedulingHeader: deleting :A00:32-6012 from comments");
		comments = removePattern(comments, ":A00:32-9500");
		logger.info("setSchedulingHeader: comments = " + comments);
		setHeader(map, "PLCN_txnComments", comments);
	}*/

    var mode = 	getHeaderWithLogging(map, "PLCN_mode");

   	var autoRepairFlag = memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_"+mode);
   	logger.info("setSchedulingHeader: autoRepairFlag = " + autoRepairFlag);

	if(autoRepairFlag == "YES" && repairReq == "true") {
		repairReq = 'false';
		setHeader(map, "PLCN_repairReq", repairReq);
		setHeader(map, "PLCN_setNewPriorityDate", "true");

		var setNewDate = getHeaderWithLogging(map, "PLCN_setNewDate");

		if(schFlag != "true" || setNewDate == true) {
			logger.info("setSchedulingHeader: calling setNewIntrBkSttlmDt for auto repair");
			setNewIntrBkSttlmDt(exchange);
		}
	}

	if(repairReq == "true") {
		setHeader(map, "PLCN_queueAudit", "MXREPRQ");
		authLevelKey = institutionId + "."+ "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL.STAGES.REPAIR" + "." + "STAGE_ACCESS_CONTROL";
    	logger.info("setSchedulingHeader: authLevelKey = " + authLevelKey);

    	var authLevelValue = memTblGetTableValue(map, "INST_PARAM", authLevelKey);
	    logger.info("setSchedulingHeader: authLevelValue = " + authLevelValue);

	    if(!authLevelValue) {
	        authLevelKey = institutionId + "."+ institutionId + "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL" + "." + "INSTITUTION_ACCESS_CONTROL";
	        logger.info("setSchedulingHeader: authLevelKey = " + authLevelKey);

	        authLevelValue = memTblGetTableValue(map, "INST_PARAM", authLevelKey);
	        logger.info("setSchedulingHeader: authLevelValue = " + authLevelValue);      
	    }

	    setHeader(map, "PLCN_displayFlag", "Y");
		setHeader(map, "PLCN_processingStage", "REPR");
		setHeader(map, "PLCN_currentAuthLevel", "REPR=" + textToNum(authLevelValue));
		setHeader(map, "PLCN_MXREPRQ", true);

		return;
	}

    var authLevelKey = institutionId + "." + "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL.STAGES.WAREHOUSE" + "." + "STAGE_ACCESS_CONTROL";
    logger.info("setSchedulingHeader: authLevelKey = " + authLevelKey);

    var authLevelValue = memTblGetTableValue(map, "INST_PARAM", authLevelKey);
    logger.info("setSchedulingHeader: authLevelValue = " + authLevelValue);

    if(!authLevelValue) {
        authLevelKey = institutionId + "." + "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL" + "." + "INSTITUTION_ACCESS_CONTROL";
        logger.info("setSchedulingHeader: authLevelKey = " + authLevelKey);

        authLevelValue = memTblGetTableValue(map, "INST_PARAM", authLevelKey);
        logger.info("setSchedulingHeader: authLevelValue = " + authLevelValue);      
    }

    authLevelValue = "WRHS=" + textToNum(authLevelValue);
    logger.info("setSchedulingHeader: authLevelValue = " + authLevelValue);

	var schFlag = getHeaderWithLogging(map, "PLCN_schedulingReq");

	schFlag = schFlag.toString();

	if(schFlag == "true") {
		var releaseDateMsg = getHeaderWithLogging(map, "PLCN_releaseDateMsg");
		setNewIntrBkSttlmDt(exchange);
		setHeader(map, "status", "scheduling required");
		setHeader(map, "PLCN_displayFlag", "Y");
		setHeader(map, "PLCN_processingStage", "WRHS");
		setHeader(map, "PLCN_currentAuthLevel", authLevelValue);
		
		//changes done by Priyanka W
		if(msgFamily == "SEPA" || msgFamily == "SEPAINST") {
			setHeader(map, "PLCN_queueAudit", "TXNHOLDQ");
		}else{
			setHeader(map, "PLCN_queueAudit", "MXHOLDQ");
		}

		setHeader(map, "PLCN_validFlag", "false");
		setHeader(map,"PLCN_schedulingReq", true);
		setHeader(map, "PLCN_schedulingCheckExit", true);
	}else {
		setHeader(map, "status", "no scheduling required");
		
		/* if(msgFamily != "SEPA") {
			setHeader(map, "PLCN_queueAudit", "TMPMSGQ");
		} */
		
		//START//added by SP for TBSEETHTY-7624
		var prevQueueId = getHeaderWithLogging(map, "PLCN_prevQueueId");
		//var todaysDate = getDate();
        var todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");
		var priorityDate = getHeaderWithLogging(map, "PLCN_priorityDate");
		
		if((prevQueueId == "TXNHOLDQ" || prevQueueId == "MXHOLDQ") && priorityDate>todaysDate){
			logger.info("setSchedulingHeader: not setting new priority date");
			//setHeader(map, "PLCN_newPriorityDate", todaysDate);
			//setHeader(map, "PLCN_newPrevMsgDate", priorityDate);
			//logger.info("setSchedulingHeader: PLCN_newPriorityDate = " + todaysDate);
			//logger.info("setSchedulingHeader: PLCN_newPrevMsgDate = " + priorityDate);
		}
		//END

		setHeader(map, "PLCN_validFlag", "true");
		setHeader(map,"PLCN_schedulingReq", false);
		setHeader(map, "PLCN_schedulingCheckExit", false);
		var custom24 = getHeaderWithLogging(map, "PLCN_custom24");
		logger.info("setSchedulingHeader: custom24 = " + custom24);
		if(!custom24){
			setHeader(map, "PLCN_custom24", "");
		}
	}

    //Added by Akshay
	var customSchFlag = getHeader(map, "PLCN_customSchedulingReq");
	logger.info("setSchedulingHeader: customSchFlag = " + customSchFlag);
	logger.info("setSchedulingHeader: typeof customSchFlag = " + typeof customSchFlag);
	customSchFlag = customSchFlag.toString();
	logger.info("setSchedulingHeader: typeof customSchFlag after toString = " + typeof customSchFlag);	
	
	if(customSchFlag == "true"){
		setNewIntrBkSttlmDt(exchange);	
        var dir = getHeaderWithLogging(map, "PLCN_msgDirection");
        var cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");
        if(mode == 'FILE' && msgFamily == 'CBPR' && dir == 'I' && cutoffFlag == 'N'){
            setHeader(map, "PLCN_validFlag", true);
        }
	}


	logger.info("setSchedulingHeader: status = " + getHeader(map, "status"));
	logger.info("setSchedulingHeader: PLCN_schedulingCheckExit = " + getHeader(map, "PLCN_schedulingCheckExit"));			
}

function applyScheduleRouteMx(exchange) {
	var institutionId;
	var schduleComponent;
	var comments;
	var valueDate;
	var todaysDate;
	var queueId;
	var productCode;
	var authPath;
	var authCode;
	var direction;
	var preWrhsPath;
	var preWrhsCode;
	var preWarehouseServiceValue;
	var authorizationServiceValue;
	var chkRelPath;
	var chkRelCode;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In applyScheduleRouteMx");

	//drveNibcProductCode(exchange);

	var fmtMsgDate = "N";

	queueId = getHeaderWithLogging(map, "PLCN_queueId");

	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	comments = getHeaderWithLogging(map, "PLCN_txnComments");

	valueDate = getHeaderWithLogging(map, "PLCN_valueDate");

	// todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	//(GETVALUEFROMHEADER GV_MSG_INPATH "MESSAGE_DETAILS" "MANUAL_MODE")
	if((getHeaderWithLogging(map, "PLCN_manualMode") == "repair") && (valueDate < todaysDate)) {
		commentsForBlob6 = setCommentsForTransaction("00", "8958", map);
	}

	direction = getHeaderWithLogging(map, "PLCN_msgDirection");

	if(direction == "I" && !(isPatternPresent(getHeaderWithLogging(map, "PLCN_txnComments"), "6013"))) {
		sendToReprNibc(exchange);
	}

	schduleComponent = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.SCHDULE_COMPONENT.APPLY_COMPONENT");
	logger.info("applyScheduleRouteMx: schduleComponent before memTblGetTableValue = " + schduleComponent);
	schduleComponent = getHeaderWithLogging(map, "PLCN_schduleComponent"); //memTblGetTableValue(map, "INST_PARAM", schduleComponent);
	//logger.info("applyScheduleRouteMx: schduleComponent = " + schduleComponent);

	authPath = institutionId.concat(".PROCESSING_STAGES.AUTHORIZE.PRODUCTS");
	logger.info("applyScheduleRouteMx: authPath = " + authPath);
	authCode = getHeaderWithLogging(map, "PLCN_authCode"); //memTblGetTableValue(map, "INST_PARAM", authPath);
	//logger.info("applyScheduleRouteMx: authCode = " + authCode);
	
	preWrhsPath = institutionId.concat(".PROCESSING_STAGES.PRE_WAREHOUSE.PRODUCTS");
	logger.info("applyScheduleRouteMx: preWrhsPath = " + preWrhsPath);
	preWrhsCode = getHeaderWithLogging(map, "PLCN_preWrhsCode"); //memTblGetTableValue(map, "INST_PARAM", preWrhsPath);
	logger.info("applyScheduleRouteMx: preWrhsCode = " + preWrhsCode);

	productCode = getHeaderWithLogging(map, "PLCN_productCode");

	if(isPatternPresent(preWrhsCode, productCode)) {
		preWarehouseServiceValue = "Y";
		logger.info("applyScheduleRouteMx: preWarehouseServiceValue = " + preWarehouseServiceValue);
	}else {
		preWarehouseServiceValue = "N";
		logger.info("applyScheduleRouteMx: preWarehouseServiceValue = " + preWarehouseServiceValue);
	}

	if(isPatternPresent(authCode, productCode)) {
		authorizationServiceValue = "Y";
		logger.info("applyScheduleRouteMx: authorizationServiceValue = " + authorizationServiceValue);
	}else {
		authorizationServiceValue = "N";
		logger.info("applyScheduleRouteMx: authorizationServiceValue = " + authorizationServiceValue);
	}

	setHeader(map, "PLCN_preWarehouseServiceValue", preWarehouseServiceValue);
	setHeader(map, "PLCN_authorizationServiceValue", authorizationServiceValue);

	if(getHeaderWithLogging(map, "PLCN_callFinalOutput") == "Y") {
		return false;
	}

	logger.info("applyScheduleRouteMx: comments = " + comments);

	if(queueId == "MXDUPLQ") {
		return false;
	}

	if(isPatternPresent(comments, "8053") || isPatternPresent(comments, "8894")) {
		return false;
	}

	if(isPatternPresent(comments, "6800")) {
		return false;
	}

	if(isPatternPresent(comments, "6011") || isPatternPresent(comments, "6012") || isPatternPresent(comments, "6013")) {
		//chkRelPath = institutionId.concat(".PROCESSING_STAGES.CHECK_AND_RELEASE.PRODUCTS");
		//chkRelPath = memTblGetTableValue(map, "INST_PARAM", preWrhsPath);

		authCode = memTblGetTableValue(map, "INST_PARAM", authCode);

		if(((chkRelCode) && isPatternPresent(chkRelCode, productCode) && isPatternPresent(comments, "7782")) || ((CHK_AUTH_CODE) && isPatternPresent(authCode, productCode) && isPatternPresent(comments , "7781") && !isPatternPresent(chkRelCode, productCode)) || (!isPatternPresent(chkRelCode , productCode) && !isPatternPresent(authCode, productCode))) {
			return true;
		}else {
			return false;
		}
	}else {

		if(schduleComponent == "Y") {

			if((authorizationServiceValue == "Y") && isPatternPresent(comments, "7781") && (preWarehouseServiceValue == "Y")) {
				return true;
			} 

			if((authorizationServiceValue == "Y") && (preWarehouseServiceValue == "Y")) {
				return true;
			}else {

				if((authorizationServiceValue == "N") && (preWarehouseServiceValue == "Y")) {
					return true;
				}else {
					return false;
				}
			}

		}else {
			return false;
		}  
	}
}

function sendToReprNibc(exchange) {
	var valueDate;
	var todaysDate;
	var stage;
	var tError;
	var mode;
	var sourceChnlId;
	var reprProductCode;
	var pattern;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In sendToReprNibc");

	tError = getHeaderWithLogging(map, "PLCN_transErrorFlag"); //memTblGetTableValue(map, "TransTable", "TransErrorFlag");

	valueDate = getHeaderWithLogging(map, "PLCN_valueDate");

	stage = getHeaderWithLogging(map, "PLCN_stage");

	mode = getHeaderWithLogging(map, "PLCN_msgModeIn"); //(GETVALUEFROMHEADER (STRING "IN.ROUTE_MESSAGE") "MESSAGE_DETAILS" "MANUAL_MODE")

	sourceChnlId = getHeaderWithLogging(map, "PLCN_sourceChannelId");

	// todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	/*if(!valueDate) {
		return;
	}*/

	if((valueDate < todaysDate) && (stage != 'ERR') && (tError != 'T')) {
		logger.info("sendToReprNibc: past valueDate");

		var pastDateCheckNotApplicableChannel = getHeader(map, "PLCN_pastDateCheckNotApplicableChannel"); //memTblGetTableValue(map, "FLAG-TABLE", "PASTDATE_CHECK_NOTAPPLICABLE_CHANNEL");
		//logger.info("sendToReprNibc: pastDateCheckNotApplicableChannel = " + pastDateCheckNotApplicableChannel);

		if(!(isPatternPresent(pastDateCheckNotApplicableChannel, sourceChnlId))) {

			if(mode != 'repair' && mode != 'MQ') {
				//setEnhcrViolation("00", "9506", Document, map);
				//commentsForBlob6 = fillViolation();
				setHeader(map, "PLCN_schedulingReq", true);
				commentsForBlob6 = setCommentsForTransaction("00", "9506", map);
				setHeader(map, "PLCN_queueId", "REPRQ");
				setHeader(map,"PLCN_schedulingReq", true);
			}

			/*if(memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_MQ") == "NO" && mode == "MQ") {
				//setEnhcrViolation("00", "9506", Document, map);
				//commentsForBlob6 = fillViolation();
				setHeader(map, "PLCN_schedulingReq", true);
				commentsForBlob6 = setCommentsForTransaction("00", "9506", map);
				setHeader(map, "PLCN_commentsForBlob6", commentsForBlob6);
				setHeader(map, "PLCN_queueId", "REPRQ");
				setHeader(map,"PLCN_schedulingReq", true);

				if(!reprProductCode){
					reprProductCode = getHeaderWithLogging(map, reprProductCode)
				}

				if(!reprProductCode) {
					reprProductCode = memTblGetTableValue(map, "STREAM_DETAILS", reprProductCode);
					pattern = searchNthPattern(reprProductCode, "-", -1);
					reprProductCode = reprProductCode.substr(1, pattern);
					reprProductCode = reprProductCode.concat("R");
					logger.info("sendToReprNibc: reprProductCode = " + reprProductCode);
					setHeader(map, "PLCN_derivedProduct", reprProductCode);
					setHeader(map, "PLCN_productCode", reprProductCode);
					setHeader(map, "PLCN_reprProductCode", reprProductCode);
				}
			}*/
		}
	}
}

function mainSchduleRouteMx(exchange) {
	var currency;
	var valueDate; 
	var fld;
	var f57;
	var msgDirection;
	var vioCode1;
	var vioCode2;
	var vioCode3;
	var flag; 
	var productFlvr;
	var clrgIdCutoffFlag;
	var clrgId;
	var clrgIdStatus;
	var mode;
	var releaseDate;
	var origValueDate;
	var msgTypePrint;
	var currencyCutoffTime;
	var currClrgId;
	var todaysDate;
	var hh;
	var ss;
	var mm;
	var map;
	var directionCheck;
	var	currOffset;
	var block3Path;
	var path;
	var t2releaseDate;
	var t2ValueDate;
	var custom11;
	var commentsForBlob6;
	var custom24;
	var comments1;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In mainSchduleRouteMx");

	setHeader(map, "PLCN_pastValueDateFlag", "N");
	setHeader(map, "PLCN_futureValDateFlag", "N");
	setHeader(map, "PLCN_holidayFlag", "N");
	setHeader(map, "PLCN_dayFlagQueryHdl", "");
	setHeader(map, "PLCN_holidayQueryHdl", "");
	setHeader(map, "PLCN_cutoffFlag", "N");
	setHeader(map, "PLCN_valueDate", ""); 
	setHeader(map, "PLCN_sendToHold", "");
	setHeader(map, "PLCN_overrideCutoffFlag", ""); 

	currency = getHeaderWithLogging(map, "PLCN_currency");
	setHeader(map, "PLCN_msgCurrency", currency);

	valueDate = getHeaderWithLogging(map, "PLCN_priorityDate");

	setHeader(map, "PLCN_orgnlPriorityDate", valueDate);

	if(!valueDate) {
		valueDate = getValueFromPath(Document, getValueDatePath(exchange));
		logger.info("mainSchduleRouteMx: valueDate from xPath = " + valueDate);
		setHeader(map, "PLCN_priorityDate", valueDate);
	}

	setHeader(map, "PLCN_msgPriorityDate", valueDate);

	msgDirection = getHeaderWithLogging(map, "PLCN_msgDirection");

	//channelIdSource = memTblGetTableValue(map, "STREAM_DETAILS", "CHANNEL_ID_SOURCE");
	sourceChannelId = getHeaderWithLogging(map, "PLCN_sourceChannelId");

	fld = "00"; //setEnhcrViolation
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI";
	f57 = getValueFromPath(Document, path);
	logger.info("mainSchduleRouteMx: f57 = " + f57);
	
	if(sourceChannelId == "SWIFT_UPL_IN") { //WIP
		setHeader(map, "PLCN_msgModeIn", "UPLOAD");
		setHeader(map, "PLCN_QM", "UPLOAD");
	}
	
	vioCode1 = 6011;
	vioCode2 = 6012;
	vioCode3 = 6013;

	clrgId = mxClearingId(map);
	logger.info("mainSchduleRouteMx: clrgId = " + clrgId);
	
	deriveClgsysTableValuesMx(clrgId, map);
	
	clrgIdCutoffFlag = getHeaderWithLogging(map, "PLCN_clrgIdCutoffFlag"); //memTblGetTableValue(map, "FLAG-TABLE", "CLRG_ID_CUTOFF_REQD");
	//clrgIdCutoffFlag = clrgIdCutoffFlag.trim();
	//logger.info("mainSchduleRouteMx: clrgIdCutoffFlag from FLAG-TABLE = " + clrgIdCutoffFlag);

	if(getHeaderWithLogging(map, "PLCN_overrideCutoffFlag") == "Y"){ //Y or N value was not set for PLCN_gvOverrideCutoffFlag

		productFlvr = memTblGetTableValue(map, "FLAG-TABLE", "PRODUCT_FLVR");
		
		if(productFlvr == "CORP"){
			//setHeader(map, "PLCN_queueId", "CRPHOLDQ");
			setHeader(map, "PLCN_queueId", "MXHOLDQ");
			setHeader(map, "PLCN_STATUS", "69");
		}

		if(productFlvr == "PGTWY"){
			//setHeader(map, "PLCN_queueId", "PAYHOLDQ");
			setHeader(map, "PLCN_queueId", "MXHOLDQ");
			setHeader(map, "PLCN_STATUS", "69");
		}

	}else{

		if(clrgIdCutoffFlag == "Y"){
			flag = "N";
		}else{
			flag = vdFutureValDateInstrn(valueDate, fld, vioCode3, map);
			logger.info("mainSchduleRouteMx: flag = " + flag);
		}
		
		if(flag == "N"){
			ddCurrCheckInstrctn(map); //This function decides whether currency is local or not. (PLCN_currLocal = Y/N)
			ddDirectionChkInstrctnMx(map); //This function sets PLCN_directionChk value (INBOUND/OUTBOUND)
			vdCutoffTimeInstrctn(currency, fld, f57, msgDirection, vioCode1, map); //checks if the current time has exceeded the cutoff time for the currency
			
			//SNTDBANK-173
			var cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");
			
			var productCode = getHeaderWithLogging(map, "PLCN_productCode");
			

			directionCheck = getHeaderWithLogging(map, "PLCN_directionChk");

			pastValueDateFlag(valueDate, map);
			
			clrgId = getHeaderWithLogging(map, "PLCN_clearingId");
			clrgIdStatus = getHeaderWithLogging(map, "PLCN_cutoffTime");
			mode = getHeaderWithLogging(map, "PLCN_msgModeIn");

			if(!clrgId || clrgIdStatus == "clearingId_NOT_FOUND"){
				clrgId = "DEFAULT_CLEARING"; //????
			}
			
			setHeader(map, "PLCN_clrgIdSet", clrgId);
			logger.info("mainSchduleRouteMx: PLCN_clrgIdSet = " + clrgId);

			if(directionCheck == "OUTBOUND"){
				setHeader(map, "PLCN_custom8", clrgId);
				logger.info("mainSchduleRouteMx: PLCN_custom8 = " + clrgId);
				
				var clrgIdReleaseFlag = getHeaderWithLogging(map, "PLCN_clrgIdReleaseFlag");

				if(!clrgIdReleaseFlag){
					chkReleaseImmd(clrgId, map);
				}
				
				currOffset = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

				if(!currOffset){
					currOffset = chkCurrOffsetDay(clrgId, map);
				}

				drvNextValueDate(valueDate, clrgId, currOffset, currency, fld, vioCode2, map);
				valueDateDcsnRule(valueDate, fld, vioCode3, vioCode2, map);
				releasePymtDateRule(clrgId, map);
				
				releaseDate = getHeaderWithLogging(map, "PLCN_valueDate");
				origValueDate = getHeaderWithLogging(map, "PLCN_valueDate2");
				currencyCutoffTime = getHeaderWithLogging(map, "PLCN_cutoffTime");
				currClrgId = getHeaderWithLogging(map, "PLCN_clearingId");
				// todaysDate = getDate();
                todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

				hh = currencyCutoffTime.substr(0, 2);
				mm = currencyCutoffTime.substr(2, 2);
				ss = currencyCutoffTime.substr(4, 2);
				
				currencyCutoffTime = (((hh.concat(":")).concat(mm)).concat(":")).concat(ss);
				logger.info("mainSchduleRouteMx: currencyCutoffTime = " + currencyCutoffTime);

				var commentsForBlob6 = getHeaderWithLogging(map, "PLCN_commentsForBlob6");
				
				if(mode == "REPAIR" && (origValueDate < releaseDate) &&  commentsForBlob6 != "6013"){
					//setEnhcrViolation("00","8958", map);
					//commentsForBlob6 = fillViolation();
					setHeader(map, "PLCN_schedulingReq", true);
					commentsForBlob6 = setCommentsForTransaction("00","8958", map);
					msgTypePrint.info = (((((((("Message is considered of past value dated, considering its cut-off time as ".concat(currencyCutoffTime)).concat(" and Offset days as ")).concat(currOffset)).concat(" for the given Clearning ID ")).concat(currClrgId)).concat(" when Pelican system date was ")).concat(todaysDate)).concat(" and value date of payment was ")).concat(origValueDate);
					setHeader(map, "PLCN_TRANSCOMM", msgTypePrint);
					logger.info("mainSchduleRouteMx: msgTypePrint = " + msgTypePrint);
				}

				//commentsForBlob6 = getHeaderWithLogging(map, "PLCN_commentsForBlob6");
				commentsForBlob6 = getHeaderWithLogging(map, "PLCN_txnComments");
				logger.info("mainSchduleRouteMx: msgDirection = " + msgDirection);

				if(msgDirection == "I" && commentsForBlob6 != "6013"){
					sendToReprNibc1(map);
				}

				var holdQFlag = getHeaderWithLogging(map, "PLCN_holdQFlag");
				logger.info("mainSchduleRouteMx: block3Path = " + block3Path);

				if(holdQFlag == "Y" && block3Path == "TGT") {

					t2releaseDate = getHeaderWithLogging(map, "PLCN_calculatedReleaseDate");
					t2ValueDate = getHeaderWithLogging(map, "PLCN_valueDate");

					if(t2ValueDate > t2releaseDate){
						setHeader(map, "PLCN_greaterValueDate", t2ValueDate);
						logger.info("mainSchduleRouteMx: PLCN_greaterValueDate = " + t2ValueDate);
					}else{
						setHeader(map, "PLCN_greaterValueDate", t2releaseDate);
						logger.info("mainSchduleRouteMx: PLCN_greaterValueDate = " + t2releaseDate);
					}

					ruleTarget2DirectoryRoutingMx(map);
				}
			}

			logger.info("mainSchduleRouteMx: directionCheck = " + directionCheck);

			if(directionCheck == "INBOUND"){
				setHeader(map, "PLCN_custom8", clrgId);
				logger.info("mainSchduleRouteMx: PLCN_custom8 = " + clrgId);

				var clrgIdReleaseFlag = getHeaderWithLogging(map, "PLCN_clrgIdReleaseFlag");

				if(!clrgIdReleaseFlag){
					chkReleaseImmd(clrgId, map);
				}

				currOffset = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

				if(!currOffset){
					currOffset = chkCurrOffsetDay(clrgId, map);
					logger.info("mainSchduleRouteMx: currOffset = " + currOffset);
				}

				drvNextValueDate(valueDate, clrgId, currOffset, currency, fld, vioCode2, map);
				valueDateDcsnRule(valueDate, fld,vioCode3, vioCode2, map);
				releasePymtDateRule(clrgId, map);
			}
		}else{
			vdHolidayInstrcn(currency, valueDate, fld,vioCode2, map);
			ddNxtWrkingDayInstrcn(valueDate, currency, map);
			fmtNxtWrkingDayInstrn(valueDate, map);
			ddClrgInstParmInstrcn(map);
		}

		custom11 = getHeaderWithLogging(map, "PLCN_clrgIdSet");

		if(custom11){
			setHeader(map, "PLCN_clrgIdSet", custom11);
			logger.info("mainSchduleRouteMx: PLCN_clrgIdSet = " + custom11);
		}else{
			setHeader(map, "PLCN_clrgIdSet", "");
			logger.info("mainSchduleRouteMx: PLCN_clrgIdSet = ");
		}
	}

	//ruleCombineViolations(map); 
	custom24 = getHeaderWithLogging(map, "PLCN_custom24");
	comments1 = getHeaderWithLogging(map, "PLCN_commentsForBlob6");
	/* if(isPatternPresent(comments1, "9506") && isPatternPresent(comments1, "6011")){
		custom24 = "";
	} */
    var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	if(!custom24 && comments1!="8993" && institutionId != "SBOSUS33"){
		sepaProprietaryBulkingConfiguration1(exchange);
	}

	return true;
}

//This function derives mx clearing id
function mxClearingId(map){
	var tdKey;
	var tdValue;
	var currency;
	var clrgId;
	var msgFamily;
	var institutionId;

	logger.info("In mxClearingId");

	currency = getHeaderWithLogging(map, "PLCN_currency");
	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	tdKey = "Outbound_SWIFT_" + currency;
	logger.info("mxClearingId: tdKey = " + tdKey);
	logger.info("mxClearingId: tdKey length = " + tdKey.length);

	tdValue = memTblGetTableValue(map, "MX_CLG_ID_MAP", tdKey);
	logger.info("mxClearingId: tdValue = " + tdValue);

	if(tdValue == "Y") {
		clrgId = tdKey;
		logger.info("mxClearingId: clrgId from hazelcast = " + clrgId);
	}else {
		clrgId = "";
		logger.info("mxClearingId: clrgId = " + clrgId);
	}
	/* ;added by SP for SNTD */
	msgFamily = getHeaderWithLogging(map, "PLCN_msgFamily");
	
	if(msgFamily == "SEPA"){
		if(institutionId == "SBOSUS33") {
			clrgId = "BUBA"; //Added for SSBTC-317
		}else{
			clrgId = "TARGET2";	
		}
		logger.info("mxClearingId: clrgId for SEPA = " + clrgId);
	}else if(msgFamily == "SEPAINST"){
		clrgId = "SEPAINST";
		logger.info("mxClearingId: clrgId for SEPAINST = " + clrgId);
	}

	//tdKey = "Outbound_SWIFT_DEF";
	setHeader(map, "PLCN_clearingId", clrgId);

	return clrgId;
}

//This function derives clgsys table values
function deriveClgsysTableValuesMx(clearingId, map){
	var tableValue;
	var temp;
	var value;
	var msgType;

	logger.info("In deriveClgsysTableValuesMx");

	//count = 1;
	
	if(!clearingId){
		clearingId = drveNibcClySysDetails(map);
	}

	logger.info("deriveClgsysTableValuesMx: clearingId = " + clearingId);

	setHeader(map, "PLCN_clearingId", clearingId);
	setHeader(map, "PLCN_clrgIdSet", clearingId);

	//tableValue = "|10000|143000|N|N|Y|Y|0|N|";
	memTblGetTableValue(map, "CLGSYS", clearingId);
	logger.info("deriveClgsysTableValuesMx: ClgSys Map value = " + tableValue);
	temp = tableValue;

	value = dataBetweenTokens("|", "|", temp);
	value = value.trim();
	var clStartTime = checkClgsysTime(value);
	setHeader(map, "PLCN_clStartTime", clStartTime);
	logger.info("deriveClgsysTableValuesMx: clStartTime = " + clStartTime);
	temp = removePattern(temp, "|" + value);

	value = dataBetweenTokens("|", "|", temp);
	value = value.trim();
	var cutoffTime = checkClgsysTime(value);
	setHeader(map, "PLCN_cutoffTime", cutoffTime);
	logger.info("deriveClgsysTableValuesMx: cutoffTime = " + cutoffTime);
	temp = removePattern(temp, "|" + value);

	value = dataBetweenTokens("|", "|", temp);
	value = value.trim();
	setHeader(map, "PLCN_clThursday", value);
	logger.info("deriveClgsysTableValuesMx: clThursday = " + value);
	temp = removePattern(temp, "|" + value);

	value = dataBetweenTokens("|", "|", temp);
	value = value.trim();
	setHeader(map, "PLCN_clFriday", value);
	logger.info("deriveClgsysTableValuesMx: clFriday = " + value);
	temp = removePattern(temp, "|" + value);

	value = dataBetweenTokens("|", "|", temp);
	value = value.trim();
	setHeader(map, "PLCN_clSaturday", value);
	logger.info("deriveClgsysTableValuesMx: clSaturday = " + value);
	temp = removePattern(temp, "|" + value);

	value = dataBetweenTokens("|", "|", temp);
	value = value.trim();
	setHeader(map, "PLCN_clSunday", value);
	logger.info("deriveClgsysTableValuesMx: clSunday = " + value);
	temp = removePattern(temp, "|" + value);

	value = dataBetweenTokens("|", "|", temp); //WIP
	value = value.trim();
	setHeader(map, "PLCN_clrgIdOffsetDay", value);
	logger.info("deriveClgsysTableValuesMx: clrgIdOffsetDay = " + value);
	/* ;added by SP for SNTD */
	msgType = getHeaderWithLogging(map, "PLCN_msgType");
	if(isPatternPresent(msgType, "pacs.003")){
		setHeader(map, "PLCN_clrgIdOffsetDay", "1");
		//temp1 = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");
		//logger.info("deriveClgsysTableValuesMx: clrgIdOffsetDay = " + temp1);
	}
	temp = removePattern(temp, "|" + value);

	value = dataBetweenTokens("|", "|", temp); //Y, N, YES, No
	value = value.trim();
	setHeader(map, "PLCN_clrgIdReleaseFlag", value);
	logger.info("deriveClgsysTableValuesMx: clrgIdReleaseFlag = " + value);
	temp = removePattern(temp, "|" + value);
}

//This function checks if the value date is of future or past
//if msg date is of future then flag = "Y" is returned otherwise flag = "N"
function vdFutureValDateInstrn(valueDate, fld, vioCode3, map){
	var todaysDate;
	var msgDate;
	var flag;
	var comments;
	var commentsForBlob6;

	logger.info("In vdFutureValDateInstrn");

	msgDate = valueDate;
	logger.info("vdFutureValDateInstrn: msgDate = " + msgDate);

	//todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	if(msgDate > todaysDate){
		//PLCN_gvFutureValDateFlag = "Y";
		flag = "Y";
		setHeader(map, "PLCN_futureValDateFlag", flag);
		setHeader(map, "PLCN_futureDateFlag", flag);
		setHeader(map, "PLCN_overrideCutoffFlag", flag);
		//setEnhcrViolation(fld, vioCode3);
		//comments = fillViolation();
		//commentsForBlob6 = fillViolation();
		setHeader(map, "PLCN_schedulingReq", true);
		comments = setCommentsForTransaction(fld, vioCode3, map);
		commentsForBlob6 = comments;
		setHeader(map, "PLCN_commentsForBlob6", comments);
		setHeader(map, "PLCN_comments", comments);
	}else{
		flag = "N";
		setHeader(map, "PLCN_pastValueDateFlag", "Y");
	}
	
	logger.info("vdFutureValDateInstrn: PLCN_futureValDateFlag = " + getHeader(map, "PLCN_futureValDateFlag"));
	logger.info("vdFutureValDateInstrn: PLCN_pastValueDateFlag = " + getHeader(map, "PLCN_pastValueDateFlag"));

	return flag;
}

//This function decides whether currency is local or not. (PLCN_currLocal = Y/N)
function ddCurrCheckInstrctn(map){
	var curr;
	var institutionId;
	var lclCurr;

	logger.info("In ddCurrCheckInstrctn");

	curr = getHeaderWithLogging(map, "PLCN_msgCurrency");

	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	lclCurr = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.LOCAL_CURRENCY"); // PLCNUSNY.PAYMT_SWIFT.GEN_PARAMS.LOCAL_CURRENCY
	lclCurr = getHeaderWithLogging(map, "PLCN_lclCurr"); //memTblGetTableValue(map, "INST_PARAM", lclCurr);
	//logger.info("ddCurrCheckInstrctn: lclCurr = " + lclCurr);

	if(curr == lclCurr){
		setHeader(map, "PLCN_currLocal", "Y");
		logger.info("ddCurrCheckInstrctn: PLCN_currLocal = Y");
	}else{
		setHeader(map, "PLCN_currLocal", "N");
		logger.info("ddCurrCheckInstrctn: PLCN_currLocal = N");
	}
}

//This function sets PLCN_directionChk value (INBOUND/OUTBOUND)
function ddDirectionChkInstrctnMx(map){
	var direction;

	logger.info("In ddDirectionChkInstrctnMx");

	direction = getHeaderWithLogging(map, "PLCN_msgDirection");

	if(direction == "O"){
		setHeader(map, "PLCN_directionChk", "INBOUND");
		logger.info("ddDirectionChkInstrctnMx: directionChk = INBOUND");
	}else{
		if(direction == "I"){
			setHeader(map, "PLCN_directionChk", "OUTBOUND");
			logger.info("ddDirectionChkInstrctnMx: directionChk = OUTBOUND");
		}
	}
}

//This function checks if the current time has exceeded the cutoff time for the currency
function vdCutoffTimeInstrctn(currency, fld, f57, msgDirection, vioCode1, map){
	var cutoffTime;
	var currTime;
	var comments;
	var cutoffFlag;
	var sendToHold;

	logger.info("In vdCutoffTimeInstrctn");

	//derive the cut-off time
	cutoffTime = getHeaderWithLogging(map, "PLCN_cutoffTime");
	cutoffTime = parseInt(cutoffTime);

	if(!cutoffTime){
		cutoffTime = chkCutoffTimeInstrctn(currency, f57, msgDirection, map);
		logger.info("vdCutoffTimeInstrctn: cutoffTime from chkCutoffTimeInstrctn = " + cutoffTime);
	}

	currTime = localTime();
	currTime = replacePattern(currTime, ":", "");
	currTime = replacePattern(currTime, ":", "");
	logger.info("vdCutoffTimeInstrctn: currTime = " + currTime);
	currTime = parseInt(currTime);

	var now = new Date();
	var msgFamily = getHeaderWithLogging(map, "PLCN_msgFamily");
	var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	
	if(msgFamily == "SEPA"){
		if(institutionId == "SBOSUS33") {
			// Convert to UTC first (handles server's own DST automatically)
			var utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);

			var cetOffset = getCETOffset(now);
			var cetMs = utcMs + (cetOffset * 60000);
			var cetDate = new Date(cetMs);

			var hour   = cetDate.getHours();
			var minute = cetDate.getMinutes();
			var second = cetDate.getSeconds();

			logger.info("vdCutoffTimeInstrctn: CET offset applied (mins): " + cetOffset);
			logger.info("vdCutoffTimeInstrctn: CET time = " + hour + ":" + minute + ":" + second);			

			//currTime = (hour.toString()).concat((minute.toString()).concat(second.toString()));
			currTime = pad(cetDate.getHours()) + pad(cetDate.getMinutes()) + pad(cetDate.getSeconds());
			logger.info("vdCutoffTimeInstrctn: CET currTime = " + currTime);
			currTime = parseInt(currTime);
			logger.info("vdCutoffTimeInstrctn: CET currTime = " + currTime);
		}		
	}	

	if(cutoffTime){
		if(currTime > cutoffTime){
			setHeader(map, "PLCN_schedulingReq", true);
			cutoffFlag = "Y";
			logger.info("vdCutoffTimeInstrctn: cutoffFlag = " + cutoffFlag);
			setHeader(map, "PLCN_cutoffFlag", cutoffFlag);
			comments = setCommentsForTransaction(fld, vioCode1, map);
			setHeader(map, "PLCN_commentsForBlob6", comments);
			setHeader(map, "PLCN_comments", comments);
			sendToHold = "Y";
			setHeader(map, "PLCN_sendToHold", sendToHold);
			logger.info("vdCutoffTimeInstrctn: sendToHold = " + sendToHold);
		}else{
			cutoffFlag = "N";
			logger.info("vdCutoffTimeInstrctn: cutoffFlag = " + cutoffFlag);
		}
	}

	var startTime = getHeaderWithLogging(map, "PLCN_clStartTime");
	startTime = parseInt(startTime);

	if(startTime){
		if(currTime < startTime){
			setHeader(map, "PLCN_schedulingReq", true);
			setHeader(map, "PLCN_startTimeFlag", "Y");
			comments = setCommentsForTransaction(fld, vioCode1, map);
			setHeader(map, "PLCN_commentsForBlob6", comments);
			setHeader(map, "PLCN_comments", comments);
			logger.info("vdCutoffTimeInstrctn: PLCN_startTimeFlag = " + getHeader(map, "PLCN_startTimeFlag"));
		}
	}
}

//This function checks if value date is of past
function pastValueDateFlag(valueDate, map){
	var todaysDate;
	var msgDate;

	logger.info("In pastValueDateFlag");

	msgDate = valueDate;
	logger.info("pastValueDateFlag: msgDate = " + msgDate);

	//todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	currOffset = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

	if(msgDate < todaysDate){
		setHeader(map, "PLCN_pastValueDateFlag", "Y")
		logger.info("pastValueDateFlag: PLCN_pastValueDateFlag = Y");
		setCommentsForTransaction("00", "9506", map);
		setHeader(map, "PLCN_repairReq", "true");
	}else if(parseInt(currOffset) > 0 && msgDate <= todaysDate) {
		setHeader(map, "PLCN_pastValueDateFlag", "Y")
		logger.info("pastValueDateFlag: PLCN_pastValueDateFlag = Y");
		setCommentsForTransaction("00", "9506", map);
		setHeader(map, "PLCN_repairReq", "true");
		//4503setHeader(map, "PLCN_schedulingReq", true);	
	}
}

//This function derives value of clReleaseImmediate
//value is derived from header so no need of this function
function chkReleaseImmd(clrgId, map){
	var releaseFlag;

	logger.info("In chkReleaseImmd");
	
	//institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	
	releaseFlag = getHeaderWithLogging(map, "PLCN_clReleaseImmediate");
	setHeader(map, "PLCN_clrgIdReleaseFlag", releaseFlag);
}

//This function derives value of clClgSysIdOffset
//value is derived from header so no need of this function
function chkCurrOffsetDay(clrgId, map){
	var cutoffDay;

	logger.info("In chkCurrOffsetDay");

	//institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	cutoffDay = getHeaderWithLogging(map, "PLCN_clClgSysIdOffset");
	setHeader(map, "PLCN_clrgIdOffsetDay", cutoffDay);

	return cutoffDay;
}

//This function derives next value date
function drvNextValueDate(valueDate, clrgId, currOffset, currency, fld, vioCode2, map){	
	var sign;
	var noOfDays;
	var val;
	var signNoOfDays;
	var calculatedNextDate;
	var calculatedReleaseDate;
	var calcNoOfDays;
	var todaysDate;
	var J;
	var holidayFlag;
	var cutoffFlag;
	var tempFlag;
	var chgFlag;
	var futureValueDateFlag;
	var comments;
	var tmpCalcDate;
	var tmpPastFlag;
	var tmpHolidayFlag;
	var valueDate2;
	var d;
	var noOfDays1;
	var valueDateSameFlag;
	var todaysDateHoliday;
	var createHoliday;
	var todaysDay;
	var todaysDateHolidayCnvrt;
	var tbRealeaseFlag;
	var tmpValueDate;
	var tmpReleaseDate;
	var holidayFlag;
	var pastValueDateFlag;

	logger.info("In drvNextValueDate");
	
	tempFlag = "N";
	chgFlag = "N";
	futureValueDateFlag = "N";
	valueDateSameFlag = "N";
	valueDate2 = valueDate;
	setHeader(map, "PLCN_valueDate2", valueDate2); 
	//todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	logger.info("drvNextValueDate: valueDate = " + valueDate);
	logger.info("drvNextValueDate: clrgId = " + clrgId);
	logger.info("drvNextValueDate: currOffset = " + currOffset);
	logger.info("drvNextValueDate: currency = " + currency);
	logger.info("drvNextValueDate: fld = " + fld);
	logger.info("drvNextValueDate: vioCode2 = " + vioCode2);
	logger.info("drvNextValueDate: PLCN_valueDate2 = " + valueDate2);

	if(todaysDate){
		vdHolidayInstrcn(currency, todaysDate, fld, vioCode2, map);
		ddNxtWrkingDayInstrcn(todaysDate, currency, map);
		holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

		if(holidayFlag == "Y"){
			todaysDate = getHeaderWithLogging(map, "PLCN_valueDate");
			tmpHolidayFlag = "Y";
			holidayFlag = "N";
			setHeader(map, "PLCN_holidayFlag", holidayFlag);
			valueDate = todaysDate;
			logger.info("drvNextValueDate: tmpHolidayFlag = " + tmpHolidayFlag);
			logger.info("drvNextValueDate: PLCN_holidayFlag = " + holidayFlag);
			logger.info("drvNextValueDate: valueDate = " + valueDate);
		}
	}
	
	cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");
	pastValueDateFlag = getHeaderWithLogging(map, "PLCN_pastValueDateFlag");

	if(pastValueDateFlag == "Y"){
		valueDate = todaysDate;
		tmpPastFlag = "Y";
		pastValueDateFlag = "N";
		setHeader(map, "PLCN_pastValueDateFlag", pastValueDateFlag);
		logger.info("drvNextValueDate: PLCN_pastValueDateFlag = " + pastValueDateFlag);
	}

	logger.info("drvNextValueDate: tmpHolidayFlag = " + tmpHolidayFlag);

	if(tmpHolidayFlag == "Y" && cutoffFlag == "Y"){ //Message is received in system post cut off time and input date is holiday
		cutoffFlag = "N";
		logger.info("drvNextValueDate: PLCN_cutoffFlag = " + cutoffFlag);
		setHeader(map, "PLCN_cutoffFlag", cutoffFlag);
	}

	logger.info("drvNextValueDate: currOffset = " + currOffset);
	
	if(currOffset == ""){
		currOffset = 0;
	}

	if(currOffset){

		if(!isAllDigits(currOffset)){
			sign = currOffset.substr(1, 1);
			noOfDays = removePattern(currOffset, sign);
			noOfDays = noOfDays.trim();
			logger.info("drvNextValueDate: sign = " + sign);
			logger.info("drvNextValueDate: noOfDays = " + noOfDays);
		}else{
			noOfDays = currOffset.trim(); //1 or 0
			logger.info("drvNextValueDate: noOfDays = " + noOfDays);
		}

		noOfDays1 = noOfDays; // 1 or 0
		setHeader(map, "PLCN_offsetNoOfDays", noOfDays);
		logger.info("drvNextValueDate: PLCN_offsetNoOfDays = " + noOfDays);

		d = valueDate; //msg vala date
		logger.info("drvNextValueDate: d = " + d);
		logger.info("drvNextValueDate: sign = " + sign);

		if(isPatternPresent(sign, "-")){
			calcNoOfDays = noOfDays;
		}else{
			calcNoOfDays = "-".concat(noOfDays); //-1 or -0
		}

		logger.info("drvNextValueDate: calcNoOfDays = " + calcNoOfDays); //-1 or -0
		logger.info("drvNextValueDate: noOfDays1 = " + noOfDays1); //1 or 0
		
		if(parseInt(noOfDays1) == 0){
			tmpCalcDate = ddBusinessDate(todaysDate, "+", "BD", noOfDays1, map);
			logger.info("drvNextValueDate: tmpCalcDate from ddBusinessDate  = " + tmpCalcDate);
		}else{
			tmpCalcDate = ddBusinessDate1(todaysDate, "+", "BD", noOfDays1, map);
			logger.info("drvNextValueDate: tmpCalcDate from ddBusinessDate1 = " + tmpCalcDate);
		}

		logger.info("drvNextValueDate: valueDate2 = " + valueDate2);

		//todaysDateHoliday = getDate();
        todaysDateHoliday = getHeaderWithLogging(map, "PLCN_todaysDate");

		if(valueDate2 > tmpCalcDate){
			valueDate = valueDate2;
			futureValueDateFlag = "Y";
			setHeader(map, "PLCN_schedulingReq", true);
			comments = setCommentsForTransaction(fld, "6013", map);
			commentsForBlob6 = comments;
			setHeader(map, "PLCN_commentsForBlob6", comments);
			setHeader(map, "PLCN_comments", comments);
			setHeader(map, "PLCN_futureDateFlag", futureValueDateFlag);
			logger.info("drvNextValueDate: PLCN_futureDateFlag = " + futureValueDateFlag);

		}

		createHoliday = checkHolidayInstrcn(currency, todaysDateHoliday, map);
		todaysDateHolidayCnvrt = convertDateFormat(todaysDateHoliday, "CCYYMMDD", "DDMMCCYY");
		var tmpDateW = convertDateFormat(todaysDateHoliday, "CCYYMMDD", "MMDDCCYY");
		todaysDay = getWeekday(tmpDateW);

		logger.info("drvNextValueDate: createHoliday = " + createHoliday);
		logger.info("drvNextValueDate: todaysDay = " + todaysDay);

		if(createHoliday == 0){

			if((todaysDay == "Thursday" && getHeader(map, "PLCN_clThursday") == "Y") || (todaysDay == "Friday" && getHeader(map, "PLCN_clFriday") ==  "Y") || (todaysDay == "Saturday" && getHeader(map, "PLCN_clSaturday") == "Y") || (todaysDay == "Sunday" && getHeader(map, "PLCN_clSunday") == "Y")){
				createHoliday = 1;
				logger.info("drvNextValueDate: createHoliday = 1");
			}
		}

		setHeader(map, "PLCN_createHoliday", createHoliday);
		logger.info("drvNextValueDate: PLCN_createHoliday before setting 9500 = " + createHoliday);

		if(createHoliday > 0){
			logger.info("drvNextValueDate: valueDate2 = " + valueDate2);
			logger.info("drvNextValueDate: valueDate = " + valueDate);
			valueDate = valueDate2;
			logger.info("drvNextValueDate: valueDate = " + valueDate);
			//setEnhcrViolation(fld, "9500", map);
			//comments = fillViolation();
			//commentsForBlob6 = fillViolation();
			logger.info("drvNextValueDate: setting 9500");
			setHeader(map, "PLCN_schedulingReq", true);
			comments = setCommentsForTransaction(fld, "9500", map);
			commentsForBlob6 = comments;
			setHeader(map, "PLCN_commentsForBlob6", comments);
			setHeader(map, "PLCN_comments", comments);

		}

		if(isPatternPresent(comments, "6013")){
			setHeader(map, "PLCN_comments", comments);
			setHeader(map, "PLCN_commentsForBlob6", comments);
		}
		
		logger.info("drvNextValueDate: cutoffFlag = " + cutoffFlag);
		logger.info("drvNextValueDate: valueDate = " + valueDate);
		logger.info("drvNextValueDate: todaysDate = " + todaysDate);

		if(cutoffFlag == "Y"){

			if(todaysDate <= valueDate){
				logger.info("drvNextValueDate: todaysDate <= valueDate");
				calculatedReleaseDate = getDateFromNumOfDays(todaysDate, "1");
				tempFlag = "Y";
			}

			logger.info("drvNextValueDate: futureValueDateFlag = " + futureValueDateFlag);

			if(futureValueDateFlag == "Y"){
				logger.info("drvNextValueDate: futureValueDateFlag == Y");
				calculatedReleaseDate = getDateFromNumOfDays(valueDate2, calcNoOfDays);
				tempFlag = "Y";
			}

			logger.info("drvNextValueDate: calculatedReleaseDate = " + calculatedReleaseDate);
		}

		logger.info("drvNextValueDate: tempFlag = " + tempFlag);

		if(tempFlag == "N"){

			if(todaysDate < valueDate){
				logger.info("drvNextValueDate: d = " + d);
				logger.info("drvNextValueDate: calcNoOfDays = " + calcNoOfDays);
				calculatedReleaseDate = getDateFromNumOfDays(d, calcNoOfDays);
				logger.info("drvNextValueDate: calculatedReleaseDate when todaysDate < valueDate = " + calculatedReleaseDate);
			}

			logger.info("drvNextValueDate: futureValueDateFlag = " + futureValueDateFlag);

			if(futureValueDateFlag == "Y"){
				logger.info("drvNextValueDate: valueDate2 = " + valueDate2);
				logger.info("drvNextValueDate: calcNoOfDays = " + calcNoOfDays);
				calculatedReleaseDate = getDateFromNumOfDays(valueDate2, calcNoOfDays);
				logger.info("drvNextValueDate: calculatedReleaseDate when futureValueDateFlag is equal to Y = " + calculatedReleaseDate);	
			}

			logger.info("drvNextValueDate: calculatedReleaseDate = " + calculatedReleaseDate);
			setHeader(map, "PLCN_custom24rd", calculatedReleaseDate); //WIP OFFSET

			var tmpDate1;
			var tbRealeaseFlag;
			var tmpValueDate;
			var tmpReleaseDate;

			logger.info("drvNextValueDate: todaysDate = " + todaysDate);
			logger.info("drvNextValueDate: valueDate = " + valueDate);

			if(todaysDate < valueDate){
				logger.info("drvNextValueDate: todaysDate < valueDate");
				vdHolidayInstrcn(currency, valueDate, fld, vioCode2, map);
				holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");
				
				ddNxtWrkingDayInstrcn(valueDate, currency, map); 

				holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

				if(holidayFlag == "Y"){
					tmpValueDate = getHeaderWithLogging(map, "PLCN_valueDate");
					holidayFlag = "N";
					setHeader(map, "PLCN_holidayFlag", holidayFlag);
					logger.info("drvNextValueDate: PLCN_holidayFlag = " + holidayFlag);
				}else{
					tmpValueDate = valueDate;
					logger.info("drvNextValueDate: tmpValueDate from valueDate = " + tmpValueDate);
				}

				logger.info("drvNextValueDate: todaysDate = " + todaysDate);
				logger.info("drvNextValueDate: noOfDays1 = " + noOfDays1);				

				if(parseInt(noOfDays1) == 0){
					//tmpValueDate = ddBusinessDate(todaysDate, "+", "BD", noOfDays1, map);
					tmpValueDate = ddBusinessDate(tmpValueDate, "+", "BD", noOfDays1, map);
					tmpReleaseDate = tmpValueDate;
				}else{
					//tmpReleaseDate = ddBusinessDate1(todaysDate, "-", "BD", noOfDays1, map); WIP
					tmpReleaseDate = ddBusinessDate(tmpValueDate, "-", "BD", noOfDays1, map);
				}

				logger.info("drvNextValueDate: tmpReleaseDate from ddBusinessDate = " + tmpReleaseDate);

				tmpDate1 = getDateFromNumOfDays(tmpReleaseDate, "1");
				logger.info("drvNextValueDate: tmpDate1 = " + tmpDate1);
				logger.info("drvNextValueDate: todaysDate = " + todaysDate);

				var futureDateFlag = getHeaderWithLogging(map, "PLCN_futureDateFlag");

				if(tmpReleaseDate == todaysDate && futureDateFlag != "Y"){
					tbRealeaseFlag = "Y";
					setHeader(map, "PLCN_toBeReleasedFlag", tbRealeaseFlag);
					valueDateSameFlag = "Y";
				}

				if(tmpDate1 == todaysDate){
					tbRealeaseFlag = "Y";
					setHeader(map, "PLCN_toBeReleasedFlag", tbRealeaseFlag);
					d = todaysDate;
				}
			}

			logger.info("drvNextValueDate: tmpPastFlag = " + tmpPastFlag);
			logger.info("drvNextValueDate: tmpHolidayFlag = " + tmpHolidayFlag);
			
			if(tmpPastFlag == "Y" && todaysDate == valueDate && tmpHolidayFlag != "Y"){
				tbRealeaseFlag = "Y";
				setHeader(map, "PLCN_toBeReleasedFlag", tbRealeaseFlag);
				tmpPastFlag = "N";
			}

			logger.info("drvNextValueDate: tbRealeaseFlag = " + tbRealeaseFlag);
		}

		logger.info("drvNextValueDate: calculatedReleaseDate = " + calculatedReleaseDate);

		if(calculatedReleaseDate){
			vdHolidayInstrcn(currency, calculatedReleaseDate, fld, vioCode2, map);
			ddNxtWrkingDayInstrcn(calculatedReleaseDate, currency, map);
			
			holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

			if(holidayFlag == "Y"){
				calculatedReleaseDate = getHeaderWithLogging(map, "PLCN_valueDate");
				holidayFlag = "N";
				setHeader(map, "PLCN_holidayFlag", holidayFlag);
				logger.info("drvNextValueDate: PLCN_holidayFlag = " + holidayFlag);
			}else{
				calculatedReleaseDate = calculatedReleaseDate;
			}
		}

		setHeader(map, "PLCN_calculatedReleaseDate", calculatedReleaseDate);
		logger.info("drvNextValueDate: calculatedReleaseDate = " + calculatedReleaseDate);

		logger.info("drvNextValueDate: tempFlag = " + tempFlag);
		logger.info("drvNextValueDate: todaysDate = " + todaysDate);
		logger.info("drvNextValueDate: valueDate = " + valueDate);
		logger.info("drvNextValueDate: noOfDays = " + noOfDays);
		
		if(tempFlag == "N"){
			if(todaysDate < valueDate && noOfDays == 1){
				noOfDays = 0;
				chgFlag = "Y";
				logger.info("drvNextValueDate: chgFlag = " + chgFlag);
			}
		}
	}

	logger.info("drvNextValueDate: futureValueDateFlag = " + futureValueDateFlag);
	logger.info("drvNextValueDate: valueDateSameFlag = " + valueDateSameFlag);
	
	if(futureValueDateFlag == "Y" || valueDateSameFlag == "Y"){
		calculatedNextDate = valueDate;
		vdHolidayInstrcn(currency, calculatedNextDate, fld, vioCode2, map);
		ddNxtWrkingDayInstrcn(calculatedNextDate, currency, map);

		holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

		if(holidayFlag == "Y"){
			calculatedNextDate = getHeaderWithLogging(map, "PLCN_valueDate");
			holidayFlag = "N";
			setHeader(map, "PLCN_holidayFlag", holidayFlag);
			logger.info("drvNextValueDate: PLCN_holidayFlag = " + holidayFlag);
		}else{
			calculatedNextDate = calculatedNextDate;
			setHeader(map, "PLCN_valueDate", calculatedNextDate);
			logger.info("drvNextValueDate: PLCN_valueDate = " + calculatedNextDate);			  
		}

		logger.info("drvNextValueDate: calculatedNextDate = " + calculatedNextDate);
	}else{
		J = 0;
		logger.info("drvNextValueDate: noOfDays = " + noOfDays);

		while(J <= noOfDays){
			signNoOfDays = 0;

			logger.info("drvNextValueDate: todaysDate = " + todaysDate);
			logger.info("drvNextValueDate: valueDate = " + valueDate);
			logger.info("drvNextValueDate: cutoffFlag = " + cutoffFlag);
			logger.info("drvNextValueDate: chgFlag = " + chgFlag);
			logger.info("drvNextValueDate: signNoOfDays = " + signNoOfDays);

			if((J == noOfDays) && (todaysDate <= valueDate) && (cutoffFlag == "N" || cutoffFlag == "") && (chgFlag == "Y")){
				signNoOfDays = 1;
			}

			if(J == 0 && cutoffFlag == "Y"){
				if(todaysDate <= valueDate){
					d = todaysDate;
					signNoOfDays = 1;
				}
			}

			if((J <= noOfDays) && (todaysDate <= valueDate) && cutoffFlag == "Y"){
				signNoOfDays = 1;
			}

			if(J != 0 && (J <= noOfDays) && (cutoffFlag == "N" || cutoffFlag == "")){
				signNoOfDays = 1;
			}

			if(J != 0 && (J <= noOfDays) && cutoffFlag == "Y"){
				signNoOfDays = 1;
			}

			calculatedNextDate = getDateFromNumOfDays(d, signNoOfDays);
			logger.info("drvNextValueDate: calculatedNextDate = " + calculatedNextDate);

			if(calculatedNextDate == ""){
				calculatedNextDate = d;
			}

			vdHolidayInstrcn(currency, calculatedNextDate, fld, vioCode2, map);
			ddNxtWrkingDayInstrcn(calculatedNextDate, currency, map);

			holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

			if(holidayFlag == "Y"){
				calculatedNextDate = getHeaderWithLogging(map, "PLCN_valueDate");
				holidayFlag = "N";
				setHeader(map, "PLCN_holidayFlag", holidayFlag);
				logger.info("drvNextValueDate: PLCN_holidayFlag = " + holidayFlag);
			}else{
				calculatedNextDate = calculatedNextDate;
				setHeader(map, "PLCN_valueDate", calculatedNextDate);
				logger.info("drvNextValueDate: PLCN_valueDate = " + calculatedNextDate);
			}

			d = calculatedNextDate;
			J++; 

			logger.info("drvNextValueDate: d = " + d);
			logger.info("drvNextValueDate: J = " + J);
		}
	}

	calculatedNextDate = getHeaderWithLogging(map, "PLCN_valueDate");
	logger.info("drvNextValueDate: tempFlag = " + tempFlag);

	if(tempFlag == "N"){

		if(todaysDate == valueDate){
			calculatedReleaseDate = getDateFromNumOfDays(calculatedNextDate, calcNoOfDays);

			if(calculatedReleaseDate){
				vdHolidayInstrcn(currency, calculatedReleaseDate, fld, vioCode2, map);
				ddNxtWrkingDayInstrcn(calculatedReleaseDate, currency, map);

				holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

				if(holidayFlag == "Y"){
					calculatedReleaseDate = getHeaderWithLogging(map, "PLCN_valueDate");
					holidayFlag = "N";
					setHeader(map, "PLCN_holidayFlag", holidayFlag);
					logger.info("drvNextValueDate: PLCN_holidayFlag = " + holidayFlag);
				}else{
					calculatedReleaseDate = calculatedReleaseDate;
				}					 
			}
		}
	}
	
	logger.info("drvNextValueDate: calculatedNextDate = " + calculatedNextDate);
	logger.info("drvNextValueDate: valueDate = " + valueDate);

	if(calculatedNextDate == valueDate){
		calculatedNextDate = calculatedNextDate;
	}

	logger.info("drvNextValueDate: cutoffFlag = " + cutoffFlag);

	if(cutoffFlag == "Y"){
		calculatedNextDate = calculatedNextDate;
	}else{
		if(todaysDate == valueDate){
			calculatedNextDate = calculatedNextDate;
		}
	}

	logger.info("drvNextValueDate: calculatedNextDate = " + calculatedNextDate);
	setHeader(map, "PLCN_calculatedNextDate", calculatedNextDate);
	
	logger.info("drvNextValueDate: noOfDays1 = " + noOfDays1);

	if(parseInt(noOfDays1) == 0){
		calculatedNextDate = ddBusinessDate(calculatedNextDate, "+", "BD", noOfDays1, map);
		calculatedReleaseDate = calculatedNextDate;
	}else{
		calculatedReleaseDate = ddBusinessDate(calculatedNextDate, "-", "BD", noOfDays1, map);
	}

	logger.info("drvNextValueDate: calculatedReleaseDate from ddBusinessDate = " + calculatedReleaseDate);
	setHeader(map, "PLCN_calculatedReleaseDate", calculatedReleaseDate);

	return calculatedReleaseDate;
}

/*function drvNextValueDate(valueDate, clrgId, currOffset, currency, fld, vioCode2, map){
	var dateVal;
	var sign;
	var noOfDays;
	var val;
	var directionCheck;
	var d;
	var signNoOfDays;
	var calculatedNextDate;
	var calculatedReleaseDate;
	var calcNoOfDays;
	var todaysDate;
	var J;
	var holidayFlag;
	var cutoffFlag;
	var tempDate;
	var tempFlag;
	var releaseFlag;
	var chgFlag;
	var tempReleaseDate;
	var futureValueDateFlag;
	var comments;
	var tmpCalNoOfDays;
	var tmpCalcDate;
	var tmpPastFlag;
	var tmpHolidayFlag;
	var valueDate2;
	var noOfDays1;
	var valueDateSameFlag;
	var todaysDateHoliday;
	var createHoliday;
	var todaysDay;
	var todaysDateHolidayCnvrt;
	var tmpDate1;
	var tmpDate2;
	var tbRealeaseFlag;
	var tmpValueDate;
	var tmpReleaseDate;
	var holidayFlag;
	var pastValueDateFlag;
	var nextValueDate;

	logger.info("In drvNextValueDate");
	
	tempFlag = "N";
	chgFlag = "N";
	futureValueDateFlag = "N";
	valueDateSameFlag = "N";
	valueDate2 = valueDate;
	setHeader(map, "PLCN_valueDate2", valueDate2); 
	todaysDate = getDate();
	nextValueDate = valueDate;

	logger.info("drvNextValueDate: todaysDate = " + todaysDate);
	logger.info("drvNextValueDate: valueDate = " + valueDate);
	logger.info("drvNextValueDate: clrgId = " + clrgId);
	logger.info("drvNextValueDate: currOffset = " + currOffset);
	logger.info("drvNextValueDate: currency = " + currency);
	logger.info("drvNextValueDate: fld = " + fld);
	logger.info("drvNextValueDate: vioCode2 = " + vioCode2);
	logger.info("drvNextValueDate: PLCN_valueDate2 = " + valueDate2);
	logger.info("drvNextValueDate: nextValueDate = " + nextValueDate);

	vdHolidayInstrcn(currency, valueDate, fld, vioCode2, map);
	ddNxtWrkingDayInstrcn(valueDate, currency, map);
	holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

	clrgIdOffsetDay = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

	var clrgIdOffsetDayNumber = parseInt(clrgIdOffsetDay);

	if(clrgIdOffsetDayNumber > 0) {
		noOfDays = "-".concat(clrgIdOffsetDay);
		logger.info("drvNextValueDate: noOfDays = " + noOfDays);
	}else {
		noOfDays = "1";
		logger.info("drvNextValueDate: noOfDays = " + noOfDays);
	}

	while(holidayFlag == "Y" && valueDate >= todaysDate) {
		nextValueDate = getDateFromNumOfDays(nextValueDate, noOfDays);
		logger.info("drvNextValueDate: nextValueDate = " + nextValueDate);
		vdHolidayInstrcn(currency, nextValueDate, fld, vioCode2, map);
		ddNxtWrkingDayInstrcn(nextValueDate, currency, map);
		holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");
		logger.info("drvNextValueDate: holidayFlag = " + holidayFlag + " for nextValueDate = " + nextValueDate);
	}

	//past
	if(nextValueDate < todaysDate) {
		pastValueDateFlag = "Y";
		setHeader(map, "PLCN_schedulingReq", true);
		comments = setCommentsForTransaction(fld, "6013", map);
		commentsForBlob6 = comments;
		setHeader(map, "PLCN_commentsForBlob6", comments);
		setHeader(map, "PLCN_comments", comments);
		setHeader(map, "PLCN_pastValueDateFlag", pastValueDateFlag);
		logger.info("drvNextValueDate: PLCN_pastValueDateFlag = " + pastValueDateFlag);
	}else if(valueDate > todaysDate) {
		futureValueDateFlag = "Y";
		setHeader(map, "PLCN_schedulingReq", true);
		comments = setCommentsForTransaction(fld, "6013", map);
		commentsForBlob6 = comments;
		setHeader(map, "PLCN_commentsForBlob6", comments);
		setHeader(map, "PLCN_comments", comments);
		setHeader(map, "PLCN_futureDateFlag", futureValueDateFlag);
		logger.info("drvNextValueDate: PLCN_futureDateFlag = " + futureValueDateFlag);		
	}

	setHeader(map, "PLCN_calculatedReleaseDate", nextValueDate);
	logger.info("drvNextValueDate: nextValueDate = " + nextValueDate);
}*/

//This function extracts country code from BIC
function xtF57CntryCodeInstrcn(bic, map){
	var cntryCode;
	var len;

	logger.info("In xtF57CntryCodeInstrcn");
	
	if(bic){
		len = bic.length;
	}

	if(len == 8 || len == 11){
		cntryCode = bic.substr(5, 2);
		setHeader(map, "PLCN_cuCodeAccWithInst", cntryCode);
	}
}

function ddCstmrNoncstmrInstrcn(map){
	var institutionId;
	var instCntryCode;
	var currencyLocal;
	var directionCheck;
	var cuCodeAccWithInst;
	var isAcctInstDef;

	logger.info("In ddCstmrNoncstmrInstrcn");
	
	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	isAcctInstDef = getHeaderWithLogging(map, "PLCN_isAcctInstDef");

	if(isAcctInstDef == "Y"){
		setHeader(map, "PLCN_customerFlag", "Y");
	}else{
		setHeader(map, "PLCN_customerFlag", "N");
	}

	currencyLocal = getHeaderWithLogging(map, "PLCN_currLocal");
	cuCodeAccWithInst = getHeaderWithLogging(map, "PLCN_cuCodeAccWithInst");
	logger.info("ddCstmrNoncstmrInstrcn: cuCodeAccWithInst = " + cuCodeAccWithInst);
	directionCheck = getHeaderWithLogging(map, "PLCN_directionChk");
	instCntryCode =  institutionId + ".PAYMT_SWIFT.GEN_PARAMS.INSTITUTION_DETAILS.LOCAL_COUNTRY_CODE";     

	instCntryCode = getHeaderWithLogging(map, "PLCN_instCntryCode"); //memTblGetTableValue(map, "INST_PARAM", instCntryCode);
	//logger.info("ddCstmrNoncstmrInstrcn: instCntryCode = " + instCntryCode);

	if(currencyLocal == "Y"){

		if(directionCheck == "OUTBOUND"){
			if(instCntryCode == cuCodeAccWithInst){
				setHeader(map, "PLCN_localPay", "Y");
			}else{
				setHeader(map, "PLCN_localPay", "N");
			}
		}
	}
}
//This function derives value of clStartTime
//value is derived from header so no need of this function
/* function retrieveReleasetimeInst(map){
	var releaseTime;

	logger.info("In retrieveReleasetimeInst");

 	releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime");
 	logger.info("retrieveReleasetimeInst: releaseTime = " + releaseTime);

 	return releaseTime;
} */

function drveNibcClySysDetails(map){
 	var clrgId;
 	var clrgIdStatus;
 	var mode;
 	var msgType;
 	var msgPriority;
 	var currency;
 	var msgDirection;
 	var currencyList;
 	var clrgIdReleaseFlag;
 	var comments;
 	var comments1;
 	var comments2;

 	logger.info("In drveNibcClySysDetails");

 	clrgId = getHeaderWithLogging(map, "PLCN_clearingId");
 	comments = getHeaderWithLogging(map, "PLCN_txnComments");
 	//comments2 = getHeaderWithLogging(map, "PLCN_commentsSetDb");
 	//comments1 = commentsForBlob6;
 	currency = getHeaderWithLogging(map, "PLCN_msgCurrency");

 	/*if(comments == ""){
 		comments = comments1;
 	}*/

 	if(clrgId == ""){
 		clrgId = getHeaderWithLogging(map, "PLCN_clrgIdSet");
 	}

 	if(clrgId && comments != 9505 /*&& comments1 != 9505 && comments2 != 9505*/ && clrgId != "DEFAULT_CLEARING" && clrgId == currency){
 		setHeader(map, "PLCN_clrgIdSet", clrgId);
 		return clrgId;
 	}

 	clrgIdStatus = getHeaderWithLogging(map, "PLCN_cutoffTime");
 	
 	currencyList = memTblGetTableValue(map, "TABLEDETAILS_CURR", currency);
 	logger.info("drveNibcClySysDetails: currencyList = " + currencyList);

 	if(!currency){
 		currency = getHeaderWithLogging(map, "PLCN_currency");
 	}

 	mode = getHeaderWithLogging(map, "PLCN_manualMode");
 	if(!mode){
 		mode = getHeaderWithLogging(map, "PLCN_msgModeIn");
 	}

 	if(!mode){
 		mode = getHeaderWithLogging(map, "PLCN_QM");
 	}

 	msgType = getHeaderWithLogging(map, "PLCN_msgType");
    logger.info("drveNibcClySysDetails: msgType = " + msgType);

 	msgDirection = getHeaderWithLogging(map, "PLCN_msgDirection");

 	msgPriority = getHeaderWithLogging(map, "PLCN_msgPriority");
 	if(msgDirection == "O"){
 		if(currencyList == currency){
 			clrgId = currency.concat("_IN");
 		}else{
 			clrgId = "";
            logger.info("drveNibcClySysDetails: blank clrgId set");
 		}
 		if(isPatternPresent(msgType, "PACS.008") || isPatternPresent(msgType, "pacs.008")){
 			clrgId = "TARGET2_IN";
            logger.info("drveNibcClySysDetails: TARGET2_IN set");
 		}
 		clrgIdReleaseFlag = "NO";
 	}

 	if((isPatternPresent(msgType, "PACS.008") || isPatternPresent(msgType, "pacs.008")) && (msgDirection == "I")){
 		clrgId = "TARGET2_STD";
 		clrgIdReleaseFlag = "NO";
        logger.info("drveNibcClySysDetails: TARGET2_STD set");
 	}

 	/*if((isPatternPresent(msgType, "CAMT.029") || isPatternPresent(msgType, "camt.029")) && (msgDirection == "I")){
 		clrgId = "TARGET2";
 		clrgIdReleaseFlag = "NO";
 	}

 	if((isPatternPresent(msgType, "CAMT.056") || isPatternPresent(msgType, "camt.056")) && (msgDirection == "I")){
 		clrgId = "TARGET2";
 		clrgIdReleaseFlag = "NO";
 	}*/

 	if((isPatternPresent(msgType, "PACS.004") || isPatternPresent(msgType, "pacs.004")) && (msgDirection == "I")){
 		clrgId = "TARGET2";
 		clrgIdReleaseFlag = "NO";
        logger.info("drveNibcClySysDetails: TARGET2 set");
 	}

 	if(mode == "REPAIR" || mode == "MANUAL" || mode == "UPLOAD" || mode == "MQ" || mode == "FILE"){
 		/*if(msgDirection == "I" && "101|103|103+|202|210" == msgType){
 			if(comments == "9505" || comments1 == "9505" || comments2 == "9505"){
 				clrgId = "Outbound_SWIFT_".concat("TARGET2");
 				clrgIdReleaseFlag = "NO";
 			}else{
 				clrgId = "Outbound_SWIFT_".concat(currency);
 				clrgIdReleaseFlag = "NO";
 			}
 		}else{
 			if(msgType == "103"){
 				clrgId = currency.concat("_URG");
 				clrgIdReleaseFlag = "YES";
 			}
 			if(msgType == "202"){
 				if(msgPriority == "U"){
 					clrgId = currency.concat("_URG");
 					clrgIdReleaseFlag = "YES";
 				}
 				if(msgPriority == "N"){
 					clrgId = currency.concat("_STD");
 					clrgIdReleaseFlag = "NO";
 				}
 			}*/

 			if((msgType == "PACS.008" || msgType == "pacs.008") && msgDirection == "I"){
 				clrgId = "TARGET2";
 				clrgIdReleaseFlag = "NO";
                logger.info("drveNibcClySysDetails: TARGET2 inside IF loop set");
 			}

 			if(!clrgId){
 				clrgId = getHeaderWithLogging(map, "PLCN_clrgIdSet");
 			}
 		//}	
 	}

 	//msgScheme = memTblGetTableValue(map, "StreamTable", "MSG_SCHEME");

 	/*if(msgScheme == "INST" && msgType != "101|103|103+|202|210"){
 		clrgId = "TARGET2_INSTA";
 		clrgIdReleaseFlag = "NO";
 	}*/

 	if((currency != "AUD|CAD|CHF|CZK|DKK|GBP|HUF|JPY|NOK|NZD|PLN|SAR|SEK|USD|ZAR|HKD|SGD|RON|TRY|EUR" && clrgId != "Outbound_SWIFT_TARGET2") || clrgIdStatus == "clearingId_NOT_FOUND"){
 		clrgId = "Outbound_SWIFT_DEF";
        logger.info("drveNibcClySysDetails: clrgId (currencyCheck)= " + clrgId);
 	}

 	if(clrgId == "" || clrgIdStatus == "clearingId_NOT_FOUND"){
 		clrgId = "DEFAULT_CLEARING";
        logger.info("drveNibcClySysDetails: clrgId (clearingId_NOT_FOUND)= " + clrgId);
 	}

 	logger.info("drveNibcClySysDetails: clrgId = " + clrgId);
 	logger.info("drveNibcClySysDetails: clrgIdReleaseFlag = " + clrgIdReleaseFlag);

 	//setHeader(map, "PLCN_clrgIdSet", clrgId);
 	//setHeader(map, "PLCN_clearingId", clrgId);
 	setHeader(map, "PLCN_clrgIdReleaseFlag", clrgIdReleaseFlag);

 	return clrgId;	
}

//needs to be checked
function ruleTarget2DirectoryRoutingMx(map) {
	var tError;
	var retVal;
	var mode;
	var comments;
	var routeTarget2PaytoSwift;

	logger.info("In ruleTarget2DirectoryRoutingMx");

	tError = memTblGetTableValue(map, "TransTable", "TransErrorFlag");
	
	if(tError = "T") {
		return true;
	} 

	mode = getHeaderWithLogging(map, "PLCN_manualMode");

	if(mode == "REPAIR") {
		comments = getHeaderWithLogging(map, "PLCN_comments");
	}else {
		comments = getHeaderWithLogging(map, "PLCN_CommentsFrmDb");
	}

	retVal = target2DirectoryRoutingApplyMx(map);//TARGET2_DIRECTORY_ROUTING_APPLY_MX(map);
	routeTarget2PaytoSwift = memTblGetTableValue(map, "USER_CONFIG_MAP", "ROUTE_TARGET2_PAY_TO_SWIFT");

	if(((comments == "7778")||(comments == "7915")||(comments == "7858")||(comments == "7862")) && (routeTarget2PaytoSwift == "YES")) {
		target2InfoTgtMx();
	}

	return retVal;
}

function target2InfoTgtMx(Document, map) {
	var comments;
	var block3Path;
	var errorCode;
	var fieldCode;
	var block3Path;
	var block3;
	var mode;
	var errorCode1;

	logger.info("In target2InfoTgtMx");

	mode = getHeaderWithLogging(map, "PLCN_QM");

	if(mode == "REPAIR") {
		comments = getHeaderWithLogging(map, "PLCN_comments");
	}else {
		comments = getHeaderWithLogging(map, "PLCN_CommentsFrmDb");
	}

	fieldCode = getHeaderWithLogging(map, "PLCN_fld");

	if(!fieldCode) {
		fieldCode = "00";
	}

	if(isPatternPresent(comments, "7915") || isPatternPresent(comments, "7862") || isPatternPresent(comments, "7858") || isPatternPresent(comments, "7778")) {
		errorCode = "6876";
		//setEnhcrViolation(fieldCode, errorCode);
		//commentsForBlob6 = fillViolation();
		setHeader(map, "PLCN_schedulingReq", true);
		commentsForBlob6 = setCommentsForTransaction(fieldCode, errorCode, map);
		setHeader(map, "PLCN_TGT_FLAG1", "Y");
		block3Path = "/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/ClrSys/Cd";
		block3 = getValueFromPath(Document,block3Path);
	}

	if(block3 == "TGT" && isPatternPresent(errorCode, "6876")) {
		errorCode1 = "6906";
		//setEnhcrViolation (fieldCode, errorCode1);
		//commentsForBlob6 = fillViolation();
		setHeader(map, "PLCN_schedulingReq", true);
		commentsForBlob6 = setCommentsForTransaction(fieldCode, errorCode1, map);
	}

	setHeader(map, "PLCN_comments", commentsForBlob6);
}

function chkCutoffTimeInstrctn(currency, f57, msgDirection, map) {
	var clgSys;
	var cutoffTime;
	var clrgIdCutoffFlag;
	var clrgIdStatus;
	var bic1;

	logger.info("In chkCutoffTimeInstrctn");
	
	//bic1 = GetBICPresent(f57);
	xtF57CntryCodeInstrcn(f57, map);
	ddCstmrNoncstmrInstrcn(map);

	institutionId = getHeader(map, "PLCN_institutionId");
	clrgIdCutoffFlag = getHeaderWithLogging(map, "PLCN_clrgIdCutoffFlag"); //memTblGetTableValue(map, "FLAG-TABLE", "CLRG_ID_CUTOFF_REQD");
	//clrgIdCutoffFlag = clrgIdCutoffFlag.trim();

	if(clrgIdCutoffFlag == "Y") {
		clgSys = getHeaderWithLogging(map, "PLCN_clearingId");

		if(msgDirection == 'O') {
			clgSys = drveNibcClySysDetails(map);
		}

		if(!clgSys || clrgIdStatus == "CLEARINGID_NOT_FOUND") {
			clgSys = "DEFAULT_CLEARING";
		}else {
			clgSys = ddClrgInstParmInstrcn(map);
		}
	}

	//cutoffTime = getHeaderWithLogging(map, "PLCN_CL_cutoffTime");
	cutoffTime = getHeaderWithLogging(map, "PLCN_cutoffTime");

	return cutoffTime;
}

function ddClrgInstParmInstrcn(map) {
	var institutionId;
	var currencyLocal;
	var currency;
	var localPay;
	var directionCheck;
	var currBsdClrgIdLookupOb;
	var lclObNonCustmrLclPay;
	var lclObNonCustmrOthPay;
	var fcyObCurrBsdClrgId;
	var fcyObNonCurrBsdDefClrgId;
	var clrgIdDerived;
	var comments;
	var releaseTime;
	var releaseDate;
	var releaseDateTime;
	var valueDate;

	logger.info("In ddClrgInstParmInstrcn");

	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	currency = getHeaderWithLogging(map, "PLCN_msgCurrency");
	currencyLocal = getHeaderWithLogging(map, "PLCN_currLocal");
	directionCheck = getHeaderWithLogging(map, "PLCN_directionChk");
	localPay = getHeaderWithLogging(map, "PLCN_localPay");
	valueDate = getHeaderWithLogging(map, "PLCN_valueDate");

	if(currencyLocal == 'Y') {

		if(directionCheck == 'OUTBOUND') {

			if(localPay == 'Y') {
				lclObNonCustmrLclPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-LOCAL-CURRENCY.CLEARING-ID.OUTBOUND.LOCAL_PAY");
				lclObNonCustmrLclPay = getHeader(map, "PLCN_lclObNonCustmrLclPay"); //memTblGetTableValue(map, "INST_PARAM", lclObNonCustmrLclPay);
				//logger.info("ddClrgInstParmInstrcn: lclObNonCustmrLclPay = " + lclObNonCustmrLclPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", lclObNonCustmrLclPay);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime");
				releaseTime = lPadChar(releaseTime, 6, "0");
				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = ((((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return lclObNonCustmrLclPay;
			}else {
				lclObNonCustmrOthPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-LOCAL-CURRENCY.CLEARING-ID.OUTBOUND.OTHER_PAY");
				lclObNonCustmrOthPay = getHeader(map, "PLCN_lclObNonCustmrOthPay"); //memTblGetTableValue(map, "INST_PARAM", lclObNonCustmrOthPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", lclObNonCustmrOthPay);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime");
				releaseTime = lPadChar(releaseTime, 6, "0");
				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = ((((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return lclObNonCustmrOthPay;				
			}
		}
	}

	if(currencyLocal != 'Y') {

		if(directionCheck == 'OUTBOUND') {
			currBsdClrgIdLookupOb = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-FOREIGN-CURRENCY.CLEARING-ID.OUTBOUND.CURRENCY_BASED_CLEARING_ID_LOOKUP");
			currBsdClrgIdLookupOb = getHeader(map, "PLCN_currBsdClrgIdLookupOb"); //memTblGetTableValue(map, "INST_PARAM", currBsdClrgIdLookupOb);

			if(currBsdClrgIdLookupOb == 'Y') {
				fcyObCurrBsdClrgId = ddCurrClrgIdInstrctn(currency, map);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", fcyObCurrBsdClrgId)
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime");
				releaseTime = lPadChar(releaseTime, 6, "0");
				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = ((((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return fcyObCurrBsdClrgId;
			}else {
				fcyObNonCurrBsdDefClrgId = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-FOREIGN-CURRENCY.CLEARING-ID.OUTBOUND.NON_CURRENCY_BASED_DEFAULT-CLEARING-ID");
				fcyObNonCurrBsdDefClrgId = getHeader(map, "PLCN_fcyObNonCurrBsdDefClrgId"); //memTblGetTableValue(map, "INST_PARAM", fcyObNonCurrBsdDefClrgId);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", fcyObNonCurrBsdDefClrgId)
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime");
				releaseTime = lPadChar(releaseTime, 6, "0");
				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = ((((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return fcyObNonCurrBsdDefClrgId;
			}

		}
	}

	if(clrgIdDerived =='N') {
		//setEnhcrViolation("00", "7369");
		//comments = fillViolation();
		comments = setCommentsForTransaction("00", "7369", map);
		setHeader(map, "PLCN_commentsForBlob6", comments);
	}
}

//This function checks if the message date is a holiday for the message currency
function vdHolidayInstrcn(currency, valueDate, fld, vioCode2, map) {
	var holiday;
	var tempDate;
	var temp1Date;
	var thuFlag;
	var friFlag;
	var satFlag;
	var sunFlag;
	var dayTag;
	var comments;
	var actualValDate;
	var holidayActVaDate;
	var actValDay;
	var actualValDateCnvrt;
	var holidayFlag;

	logger.info("In vdHolidayInstrcn");

	currency = getHeaderWithLogging(map, "PLCN_clearingId");

	logger.info("vdHolidayInstrcn: currency = " + currency);
	logger.info("vdHolidayInstrcn: valueDate = " + valueDate);

	var pastValueDateFlag = getHeaderWithLogging(map, "PLCN_pastValueDateFlag");

	if(pastValueDateFlag == 'Y') {
		//tempDate = getDate(); //20210902
        tempDate = getHeaderWithLogging(map, "PLCN_todaysDate");
	}else if(pastValueDateFlag == 'N') {
		tempDate = valueDate;
	}else{
	    tempDate = getHeaderWithLogging(map, "PLCN_todaysDate");
	}
	
	logger.info("vdHolidayInstrcn: tempDate = " + tempDate);

	actualValDate = getHeaderWithLogging(map, "PLCN_valueDate2");

	holiday = checkHoliday(currency, tempDate, map);
	logger.info("vdHolidayInstrcn: holiday from checkHoliday = " + holiday);

	if(holiday === null) {
		logger.info("vdHolidayInstrcn: holiday is empty");
		holiday = checkHolidayInstrcn(currency, tempDate, map);
	}

	if(holiday > 0) {
		logger.info("vdHolidayInstrcn: holiday > 0");
		holidayFlag = "Y";
		setHeader(map, "PLCN_holidayFlag", holidayFlag);
		logger.info("vdHolidayInstrcn: holidayFlag = Y");

		logger.info("vdHolidayInstrcn: actualValDate = " + actualValDate);
		logger.info("vdHolidayInstrcn: tempDate = " + tempDate);

		if(actualValDate == tempDate) {
			//setEnhcrViolation(fld, vioCode2)
			//commentsForBlob6 = fillViolation();
			setHeader(map, "PLCN_schedulingReq", true);
			commentsForBlob6 = setCommentsForTransaction(fld, vioCode2, map);
			//ruleCombineViolations(map);
		}

		if(actualValDate != tempDate) {
			holidayActVaDate = checkHolidayInstrcn(currency, actualValDate, map);
			logger.info("vdHolidayInstrcn: holidayActVaDate = " + holidayActVaDate);

			actualValDateCnvrt = convertDateFormat(actualValDate, "CCYYMMDD", "DDMMCCYY");
			var tmpDateW = convertDateFormat(actualValDate, "CCYYMMDD", "MMDDCCYY");
			
			actValDay = getWeekday(tmpDateW);
			logger.info("vdHolidayInstrcn: actValDay = " + actValDay);

			if(holidayActVaDate == 0) {
				if((actValDay == "Thursday" && getHeader(map, "PLCN_clThursday") == "Y") || (actValDay == "Friday" && getHeader(map, "PLCN_clFriday") == "Y") || (actValDay == "Saturday" && getHeader(map, "PLCN_clSaturday") == "Y") || (actValDay == "Sunday" && getHeader(map, "PLCN_clSunday") == "Y")) {
					holidayActVaDate = 1;
					logger.info("vdHolidayInstrcn: holidayActVaDate = " + holidayActVaDate);
				}
			}

			if(holidayActVaDate > 0) {
				//setEnhcrViolation(fld, vioCode2)
				//commentsForBlob6 = fillViolation();
				setHeader(map, "PLCN_schedulingReq", true);
				commentsForBlob6 = setCommentsForTransaction(fld, vioCode2, map);
				//ruleCombineViolations(map);
			}
		}
	}

	holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");
	logger.info("vdHolidayInstrcn: holidayFlag = " + holidayFlag);

	if(holidayFlag != 'Y') {
		/*thuFlag = checkDayFlagInstrcn(currency, "Thursday", map);
		friFlag = checkDayFlagInstrcn(currency, "Friday", map);
		satFlag = checkDayFlagInstrcn(currency, "Saturday", map);
		sunFlag = checkDayFlagInstrcn(currency, "Sunday", map);*/
        thuFlag = getHeader(map, "PLCN_thuFlag");
        if(thuFlag){
            friFlag = getHeader(map, "PLCN_friFlag");
            satFlag = getHeader(map, "PLCN_satFlag");
            sunFlag = getHeader(map, "PLCN_sunFlag");
        }else{
		thuFlag = checkDayFlagInstrcn(currency, "Thursday", map);
		friFlag = checkDayFlagInstrcn(currency, "Friday", map);
		satFlag = checkDayFlagInstrcn(currency, "Saturday", map);
		sunFlag = checkDayFlagInstrcn(currency, "Sunday", map);
            setHeader(map, "PLCN_thuFlag", thuFlag);
            setHeader(map, "PLCN_friFlag", friFlag);
            setHeader(map, "PLCN_satFlag", satFlag);
            setHeader(map, "PLCN_sunFlag", sunFlag);
        }
		temp1Date = convertDateFormat(tempDate, "CCYYMMDD", "DDMMCCYY");
		var tmpDateW = convertDateFormat(tempDate, "CCYYMMDD", "MMDDCCYY");
		dayTag = getWeekday(tmpDateW);

		logger.info("vdHolidayInstrcn: thuFlag = " + thuFlag);
		logger.info("vdHolidayInstrcn: friFlag = " + friFlag);
		logger.info("vdHolidayInstrcn: satFlag = " + satFlag);
		logger.info("vdHolidayInstrcn: sunFlag = " + sunFlag);
		logger.info("vdHolidayInstrcn: dayTag = " + dayTag);

		if((dayTag == "Thursday" && thuFlag == 'Y') || (dayTag == "Friday" && friFlag == 'Y') || (dayTag == "Saturday" && satFlag == 'Y') || (dayTag == "Sunday" && sunFlag == 'Y')) {
			holidayFlag = "Y";
			setHeader(map, "PLCN_holidayFlag", holidayFlag);
			logger.info("vdHolidayInstrcn: holidayFlag = " + holidayFlag);

			logger.info("vdHolidayInstrcn: actualValDate = " + actualValDate);
			logger.info("vdHolidayInstrcn: tempDate = " + tempDate);

			if(actualValDate == tempDate) {
				//setEnhcrViolation(fld, vioCode2);
				//commentsForBlob6 = fillViolation();
				setHeader(map, "PLCN_schedulingReq", true);
				commentsForBlob6 = setCommentsForTransaction(fld, vioCode2, map);
				//ruleCombineViolations(map);
			}
		}
	}
}

function ddBusinessDate(reqdColltnDate, sign, qual, noOfDays, map) {
	var x;
	var d;
	var signNoOfDays;
	var calculatedNextDate;
	var holiday;
	var currency;
	var holidayFlag;
	var thuFlag;
	var friFlag;
	var satFlag;
	var sunFlag;
	var dayTag;
	var x1 = 0;
	var x2;
	var hldyNoOfDays;
	var signNoOfDaysNxt;
	

	logger.info("In ddBusinessDate");

	logger.info("ddBusinessDate: reqdColltnDate = " + reqdColltnDate);
	logger.info("ddBusinessDate: sign = " + sign);
	logger.info("ddBusinessDate: qual = " + qual);
	logger.info("ddBusinessDate: noOfDays = " + noOfDays);

	currency = getHeaderWithLogging(map, "PLCN_clearingId");

	holiday = checkHoliday(currency, reqdColltnDate, map);
	logger.info("ddBusinessDate: holiday = " + holiday);

	/*if(holiday > 0) { //WIP
		x1 = 1;
	}else {*/
		x1 = 0;
	//}

	if(qual == "BD") {
		x = 1;
		d = reqdColltnDate;
		hldyNoOfDays = 0;

		logger.info("ddBusinessDate: d = " + d);
		logger.info("ddBusinessDate: x = " + x); //1
		logger.info("ddBusinessDate: noOfDays = " + noOfDays); //1
		logger.info("ddBusinessDate: x1 = " + x1);
		logger.info("ddBusinessDate: hldyNoOfDays = " + hldyNoOfDays);		

		while(x <= noOfDays || x1 == hldyNoOfDays) {

			logger.info("ddBusinessDate: x = " + x); //1
			logger.info("ddBusinessDate: noOfDays = " + noOfDays); //1
			logger.info("ddBusinessDate: x1 = " + x1);
			logger.info("ddBusinessDate: hldyNoOfDays = " + hldyNoOfDays);
				
			logger.info("ddBusinessDate: sign = " + sign);

			if(isPatternPresent(sign, "-")) {
				signNoOfDays = sign.concat(x.toString());
				logger.info("ddBusinessDate: signNoOfDays = " + signNoOfDays);
			}/*else{
				signNoOfDays = x;
				logger.info("ddBusinessDate: signNoOfDays in else = " + signNoOfDays);
			}*/

			if(x1 == 1 && hldyNoOfDays == 1) {
				logger.info("ddBusinessDate: x1 = 1");
				hldyNoOfDays = "-".concat(x1.toString());
				logger.info("ddBusinessDate: hldyNoOfDays = " + hldyNoOfDays);
				calculatedNextDate = getDateFromNumOfDays(d, hldyNoOfDays);
			}else {

				if(x2 == 1) {
					logger.info("ddBusinessDate: x2 = 1");
					signNoOfDaysNxt = "-".concat(x2.toString());
					logger.info("ddBusinessDate: signNoOfDaysNxt = " + signNoOfDaysNxt);
					calculatedNextDate = getDateFromNumOfDays(d, signNoOfDaysNxt);
				}else {
					logger.info("ddBusinessDate: x1 != 1 & x2 != 1");
					logger.info("ddBusinessDate: hldyNoOfDays = " + hldyNoOfDays);
					logger.info("ddBusinessDate: signNoOfDays = " + signNoOfDays);

					/*if(parseInt(hldyNoOfDays) > 0) {
						calculatedNextDate = getDateFromNumOfDays(d, hldyNoOfDays); //WIP OFFSET	
					}else if(parseInt(signNoOfDays) > 0) {*/
						calculatedNextDate = getDateFromNumOfDays(d, signNoOfDays);	
					//}
					
				}
			}

			logger.info("ddBusinessDate: calculatedNextDate = " + calculatedNextDate);

			holiday = checkHoliday(currency, calculatedNextDate, map);
			logger.info("ddBusinessDate: holiday = " + holiday);

			if(holiday > 0) {
				holidayFlag = 'Y';
			}else {
				holidayFlag = 'N';
			}

			logger.info("ddBusinessDate: holidayFlag = " + holidayFlag);

			if(holidayFlag == 'N') {
				thuFlag = checkDayFlag(currency, "Thursday", map);
				friFlag = checkDayFlag(currency, "Friday", map);
				satFlag = checkDayFlag(currency, "Saturday", map);
				sunFlag = checkDayFlag(currency, "Sunday", map);

				//calculatedNextDate = convertDateFormat(calculatedNextDate, "CCYYMMDD", "DDMMCCYY");
				var tmpDateW = convertDateFormat(calculatedNextDate, "CCYYMMDD", "MMDDCCYY");
				logger.info("ddBusinessDate: tmpDateW = " + tmpDateW);
				dayTag = getWeekday(tmpDateW);

				logger.info("ddBusinessDate: dayTag = " + dayTag);
				logger.info("ddBusinessDate: thuFlag = " + thuFlag);
				logger.info("ddBusinessDate: friFlag = " + friFlag);
				logger.info("ddBusinessDate: satFlag = " + satFlag);
				logger.info("ddBusinessDate: sunFlag = " + sunFlag);

				if((dayTag == "Thursday" && thuFlag == 'Y') || (dayTag == "Friday" && friFlag == 'Y') || (dayTag == "Saturday" && satFlag == 'Y') || (dayTag == "Sunday" && sunFlag == 'Y')) {
					holidayFlag = "Y";
				}

				//calculatedNextDate = convertDateFormat(calculatedNextDate, "DDMMCCYY", "CCYYMMDD");
				logger.info("ddBusinessDate: calculatedNextDate = " + calculatedNextDate);
			}

			if(holidayFlag == 'N') {
				x++;
				x1 = 0;
				x2 = 1;
				hldyNoOfDays = -1;
				d = calculatedNextDate;
			}

			if(holidayFlag == 'Y') {
				d = calculatedNextDate;
				x1 = 1;
				hldyNoOfDays = 1;
			}
		}
	}

	return calculatedNextDate;
}

function ddBusinessDate1(reqdColltnDate, sign, qual, noOfDays, map) {
	var x;
	var d;
	var signNoOfDays;
	var calculatedNextDate;
	var holiday;
	var currency;
	var holidayFlag;
	var thuFlag;
	var friFlag;
	var satFlag;
	var sunFlag;
	var dayTag;
	var x1 = 0;
	var x2;
	var hldyNoOfDays;
	var signNoOfDaysNxt;

	logger.info("In ddBusinessDate1");

	currency = getHeaderWithLogging(map, "PLCN_clearingId");

	holiday = checkHoliday(currency, reqdColltnDate, map);
	logger.info("ddBusinessDate1: holiday = " + holiday);

	if(holiday > 0) { //WIP
		x1 = 1;
	}else {
		x1 = 0;
	}

	if(qual == "BD") {
		x = 1;
		d = reqdColltnDate;
		hldyNoOfDays = 0;

		logger.info("ddBusinessDate1: d = " + d);
		logger.info("ddBusinessDate1: x = " + x); //1
		logger.info("ddBusinessDate1: noOfDays = " + noOfDays); //1
		logger.info("ddBusinessDate1: x1 = " + x1);
		logger.info("ddBusinessDate1: hldyNoOfDays = " + hldyNoOfDays);

		while(x <= noOfDays || x1 == hldyNoOfDays) {

			logger.info("ddBusinessDate1: x = " + x); //1
			logger.info("ddBusinessDate1: noOfDays = " + noOfDays); //1
			logger.info("ddBusinessDate1: x1 = " + x1);
			logger.info("ddBusinessDate1: hldyNoOfDays = " + hldyNoOfDays);

			logger.info("ddBusinessDate1: sign = " + sign);

			if(isPatternPresent(sign, "[+]")) {
				signNoOfDays = sign.concat(x.toString());
				logger.info("ddBusinessDate1: signNoOfDays = " + signNoOfDays);
			}

			if(x1 == 1 && hldyNoOfDays == 1) {
				logger.info("ddBusinessDate1: x1 = 1");
				hldyNoOfDays = "+".concat(x1.toString());
				logger.info("ddBusinessDate1: hldyNoOfDays = " + hldyNoOfDays);
				calculatedNextDate = getDateFromNumOfDays(d, hldyNoOfDays);
			}else {
				if(x2 == 1) {
					logger.info("ddBusinessDate1: x2 = 1");
					signNoOfDaysNxt = "+".concat(x2.toString());
					logger.info("ddBusinessDate1: signNoOfDaysNxt = " + signNoOfDaysNxt);
					calculatedNextDate = getDateFromNumOfDays(d, signNoOfDaysNxt);
				}else {
					logger.info("ddBusinessDate1: x1 != 1 & x2 != 1");
					logger.info("ddBusinessDate1: signNoOfDays = " + signNoOfDays);
					calculatedNextDate = getDateFromNumOfDays(d, signNoOfDays);
				}
			}

			logger.info("ddBusinessDate1: calculatedNextDate = " + calculatedNextDate);

			holiday = checkHoliday(currency, calculatedNextDate, map);
			logger.info("ddBusinessDate1: holiday = " + holiday);

			if(holiday > 0) {
				holidayFlag = 'Y';
			}else {
				holidayFlag = 'N';
			}

			logger.info("ddBusinessDate1: holidayFlag = " + holidayFlag);

			if(holidayFlag == 'N') {
				thuFlag = checkDayFlag(currency, "Thursday", map);
				friFlag = checkDayFlag(currency, "Friday", map);
				satFlag = checkDayFlag(currency, "Saturday", map);
				sunFlag = checkDayFlag(currency, "Sunday", map);

				//calculatedNextDate = convertDateFormat(calculatedNextDate, "CCYYMMDD", "DDMMCCYY" );
				var tmpDateW = convertDateFormat(calculatedNextDate, "CCYYMMDD", "MMDDCCYY");
				logger.info("ddBusinessDate1: tmpDateW = " + tmpDateW);
				dayTag = getWeekday(tmpDateW);

				logger.info("ddBusinessDate1: dayTag = " + dayTag);
				logger.info("ddBusinessDate1: thuFlag = " + thuFlag);
				logger.info("ddBusinessDate1: friFlag = " + friFlag);
				logger.info("ddBusinessDate1: satFlag = " + satFlag);
				logger.info("ddBusinessDate1: sunFlag = " + sunFlag);

				if((dayTag == "Thursday" && thuFlag == 'Y') || (dayTag == "Friday" && friFlag == 'Y') || (dayTag == "Saturday" && satFlag == 'Y') || (dayTag == "Sunday" && sunFlag == 'Y')) {
					holidayFlag = "Y";
					logger.info("ddBusinessDate1: holidayFlag = " + holidayFlag);
				}

				//calculatedNextDate = convertDateFormat(calculatedNextDate, "DDMMCCYY", "CCYYMMDD");
				logger.info("ddBusinessDate1: calculatedNextDate = " + calculatedNextDate);
			}

			logger.info("ddBusinessDate1: holidayFlag = " + holidayFlag);

			if(holidayFlag == 'N') {
				x++;
				x1 = 0;
				x2 = 1;
				hldyNoOfDays = -1;
				d = calculatedNextDate;
			}

			if(holidayFlag == 'Y') {
				d = calculatedNextDate;
				x1 = 1;
				hldyNoOfDays = 1;
			}	
		}
	}

	return calculatedNextDate;
}

function checkHoliday(currency, date, map) {
	var holiday;
	var tempDate;
	var temp2;
	var temp3;
	var temp4;

	logger.info("In checkHoliday");

	tempDate = date;
	logger.info("checkHoliday: tempDate = " + tempDate);
	logger.info("checkHoliday: currency = " + currency);

	currency = getHeaderWithLogging(map, "PLCN_clearingId");

	//if(tempDate) { WIP
		var ccyy = tempDate.substring(0, 4);
		var mm = tempDate.substring(4, 6);
		var dd = tempDate.substring(6, 8);
	//}

	tempDate = [ccyy, mm, dd].join('-');

	logger.info("checkHoliday: tempDate = " + tempDate);

	var institutionId = getHeaderWithLogging(map, "PLCN_institutionId")

	temp2 = institutionId.concat("_");
	temp2 = ((((temp2.concat(currency)).concat("_"))).concat(tempDate)).concat(" 00:00:00.0");
	logger.info("checkHoliday: temp2 = " + temp2); //NIBCNLNV_EUR_20211127
	holiday = memTblGetTableValue(map, "CHL_HOLIDAY", temp2);
	logger.info("checkHoliday: holiday = " + holiday);

	//clearingID = getHeaderWithLogging(map, "PLCN_clearingId");
	//holidayCheck = clearingID + " " + date;

	//holiday = memTblGetTableValue(map, "CHL_HOLIDAY", holidayCheck);

	if(!holiday) {
		var parentInstitutionId = getHeaderWithLogging(map, "PLCN_parentInstitutionId"); //memTblGetTableValue(map, "INST_HIERARCHY", institutionId);
		//logger.info("checkHoliday: parent parentInstitutionId = " + parentInstitutionId);

		temp3 = parentInstitutionId.concat("_");
		temp3 = ((((temp3.concat(currency)).concat("_"))).concat(tempDate)).concat(" 00:00:00.0");
		logger.info("checkHoliday: temp3 = " + temp3); //NIBCNLNV_EUR_20211127
		holiday = memTblGetTableValue(map, "CHL_HOLIDAY", temp3);
		logger.info("checkHoliday: holiday = " + holiday);

		//added by SP TECHBULLS-28812
		if(!holiday) {
			var grandparentInstitutionId = getHeaderWithLogging(map, "PLCN_grandparentInstitutionId"); //memTblGetTableValue(map, "INST_HIERARCHY", parentInstitutionId);
			//logger.info("checkHoliday: grandparent grandparentInstitutionId = " + grandparentInstitutionId);

			temp4 = grandparentInstitutionId.concat("_");
			temp4 = ((((temp4.concat(currency)).concat("_"))).concat(tempDate)).concat(" 00:00:00.0");
			logger.info("checkHoliday: temp4 = " + temp4); //NIBCNLNV_EUR_20211127
			holiday = memTblGetTableValue(map, "CHL_HOLIDAY", temp4);
			logger.info("checkHoliday: holiday = " + holiday);
			
			if(!holiday) {
				return 0;
			}else {
				return 1;
			}
		}		
	}else {
		return 1;
	}
}

function ddClrgIdInstParamPath(map) {
	var institutionId;
	var currencyLocal;
	var localPay;
	var localOutPay;
	var directionCheck;
	var customerFlag;
	var currBsdClrgIdLookupOb;
	var currBsdClrgIDLookupOnw;
	var lclIbCustmrPay;
	var lclIbNonCustmrLclPay;
	var lclObNonCustmrLclPay;
	var lclObNonCustmrOthPay;
	var lclOnwNonCustmrLclPay;
	var lclOnwNonCustmrOthPay;
	var fcyIbCustmrPay;
	var fcyIbNonCustmrLclPay;
	var fcyObCurrBsdClrgId;
	var fcyObNonCurrBsdDefClrgId;
	var fcyOnwCurrBsdClrgId;
	var fcyOnwNonCurrBsdDefClrgId;
	var clrgIdDerived;
	var comments;
	var releaseTime;
	var releaseDate;
	var releaseDateTime;
	var valueDate;
	var jerseyTransaction;
	var clrgId;

	logger.info("In ddClrgIdInstParamPath");
	
	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	currencyLocal = getHeaderWithLogging(map, "PLCN_currLocal");
	directionCheck = getHeaderWithLogging(map, "PLCN_directionChk");
	customerFlag = getHeaderWithLogging(map, "PLCN_customerFlag");
	localPay = getHeaderWithLogging(map, "PLCN_localPay");
	localOutPay = getHeaderWithLogging(map, "PLCN_LOCAL_ONWD_PAY");
	valueDate = getHeaderWithLogging(map, "PLCN_valueDate");
	jerseyTransaction = getHeaderWithLogging(map, "PLCN_jerseyTransaction");


	if(jerseyTransaction =='Y') {
		clrgId = deriveClrgIdForJerseyAccount(currencyLocal, directionCheck);
		return clrgId;
	}

	if(currencyLocal == 'Y') {

		if(directionCheck == 'INBOUND') {

			if(customerFlag == 'Y') {
				lclIbCustmrPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-LOCAL-currency.CLEARING-ID.INBOUND.CUSTOMER_PAY");
				lclIbCustmrPay = memTblGetTableValue(map, "INST_PARAM", lclIbCustmrPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", lclIbCustmrPay);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
				releaseTime = lPadChar(releaseTime, 6, "0");

				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return lclIbCustmrPay;
			}else {
				if(localPay == 'Y') {
					lclIbNonCustmrLclPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-LOCAL-currency.CLEARING-ID.INBOUND.NON_CUSTOMER_LOCAL_PAY");
					lclIbNonCustmrLclPay = memTblGetTableValue(map, "INST_PARAM",  lclIbNonCustmrLclPay);
					clrgIdDerived = "Y";
					setHeader(map, "PLCN_custom8", lclIbNonCustmrLclPay);
					releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
					releaseTime = lPadChar(releaseTime, 6, "0");

					releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
					releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));				
					releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
					//setHeader(map, "PLCN_custom24", releaseDateTime);
					setCustom24(map, releaseDate, releaseTime);
					return lclIbNonCustmrLclPay;
				}
			}
		}

		if(directionCheck == 'OUTBOUND') {

			if(customerFlag == 'Y') {
				lclObNonCustmrLclPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-LOCAL-currency.CLEARING-ID.OUTBOUND.localPay");
				lclObNonCustmrLclPay = memTblGetTableValue(map, "INST_PARAM",  lclObNonCustmrLclPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", lclObNonCustmrLclPay);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
				releaseTime = lPadChar(releaseTime, 6, "0");

				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return lclObNonCustmrLclPay;
			}else {
				if(localPay == 'Y') {
					lclObNonCustmrOthPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-LOCAL-currency.CLEARING-ID.INBOUND.NON_CUSTOMER_LOCAL_PAY");
					lclObNonCustmrOthPay = memTblGetTableValue(map, "INST_PARAM",  lclObNonCustmrOthPay);
					clrgIdDerived = "Y";
					setHeader(map, "PLCN_custom8", lclObNonCustmrOthPay);
					releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
					releaseTime = lPadChar(releaseTime, 6, "0");

					releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
					releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));				
					releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
					//setHeader(map, "PLCN_custom24", releaseDateTime);
					setCustom24(map, releaseDate, releaseTime);
					return lclObNonCustmrOthPay;
				}
			}
		}

		if(directionCheck == 'ONWARD') {

			if(localOutPay == 'Y') {
				lclOnwNonCustmrLclPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-LOCAL-currency.CLEARING-ID.OUTBOUND.localPay");
				lclOnwNonCustmrLclPay = memTblGetTableValue(map, "INST_PARAM",  lclOnwNonCustmrLclPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", lclOnwNonCustmrLclPay);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
				releaseTime = lPadChar(releaseTime, 6, "0");

				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return lclOnwNonCustmrLclPay;
			}else {
				if(localPay == 'Y') {
					lclOnwNonCustmrOthPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-LOCAL-currency.CLEARING-ID.INBOUND.NON_CUSTOMER_LOCAL_PAY");
					lclOnwNonCustmrOthPay = memTblGetTableValue(map, "INST_PARAM",  lclOnwNonCustmrOthPay);
					clrgIdDerived = "Y";
					setHeader(map, "PLCN_custom8", lclOnwNonCustmrOthPay);
					releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
					releaseTime = lPadChar(releaseTime, 6, "0");

					releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
					releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));				
					releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
					//setHeader(map, "PLCN_custom24", releaseDateTime);
					setCustom24(map, releaseDate, releaseTime);
					return lclOnwNonCustmrOthPay;
				}
			}
		}
	}

	if(currencyLocal != 'Y') {

		if(directionCheck == 'INBOUND') {

			if(customerFlag == 'Y') {
				fcyIbCustmrPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-FOREIGN-currency.CLEARING-ID.INBOUND.CUSTOMER_PAY");
				fcyIbCustmrPay = memTblGetTableValue(map, "INST_PARAM",  fcyIbCustmrPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", fcyIbCustmrPay);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
				releaseTime = lPadChar(releaseTime, 6, "0");

				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return fcyIbCustmrPay;
			}else {
				if(localPay == 'Y') {
					fcyIbNonCustmrLclPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-FOREIGN-currency.CLEARING-ID.INBOUND.NON_CUSTOMER_LOCAL_PAY");
					fcyIbNonCustmrLclPay = memTblGetTableValue(map, "INST_PARAM",  fcyIbNonCustmrLclPay);
					clrgIdDerived = "Y";
					setHeader(map, "PLCN_custom8", fcyIbNonCustmrLclPay);
					releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
					releaseTime = lPadChar(releaseTime, 6, "0");

					releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
					releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));				
					releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
					//setHeader(map, "PLCN_custom24", releaseDateTime);
					setCustom24(map, releaseDate, releaseTime);
					return fcyIbNonCustmrLclPay;
				}
			}
		}

		if(directionCheck == 'OUTBOUND') {
			currBsdClrgIdLookupOb = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-FOREIGN-currency.CLEARING-ID.OUTBOUND.CURRENCY_BASED_clearingId_LOOKUP");
			currBsdClrgIdLookupOb = memTblGetTableValue(map, "INST_PARAM",  currBsdClrgIdLookupOb);

			if(currBsdClrgIdLookupOb == 'Y') {
				fcyObCurrBsdClrgId = ddCurrClrgId();
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", fcyObCurrBsdClrgId);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
				releaseTime = lPadChar(releaseTime, 6, "0");

				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return fcyObCurrBsdClrgId;
			}else {
				if(localPay == 'Y') {
					fcyObNonCurrBsdDefClrgId = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-FOREIGN-currency.CLEARING-ID.OUTBOUND.NON_CURRENCY_BASED_DEFAULT-CLEARING-ID");
					fcyObNonCurrBsdDefClrgId = memTblGetTableValue(map, "INST_PARAM",  fcyObNonCurrBsdDefClrgId);
					clrgIdDerived = "Y";
					setHeader(map, "PLCN_custom8", fcyObNonCurrBsdDefClrgId);
					releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
					releaseTime = lPadChar(releaseTime, 6, "0");

					releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
					releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));				
					releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
					//setHeader(map, "PLCN_custom24", releaseDateTime);
					setCustom24(map, releaseDate, releaseTime);
					return fcyObNonCurrBsdDefClrgId;
				}
			}
		}

		if(directionCheck == 'ONWARD') {
			currBsdClrgIDLookupOnw = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-FOREIGN-currency.CLEARING-ID.ONWARD.CURRENCY_BASED_clearingId_LOOKUP");
			currBsdClrgIDLookupOnw = memTblGetTableValue(map, "INST_PARAM",  currBsdClrgIDLookupOnw);

			if(currBsdClrgIDLookupOnw == 'Y') {
				fcyOnwCurrBsdClrgId = ddCurrClrgId();
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", fcyOnwCurrBsdClrgId);
				releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
				releaseTime = lPadChar(releaseTime, 6, "0");

				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime);
				setCustom24(map, releaseDate, releaseTime);
				return fcyOnwCurrBsdClrgId;
			}else {

				if(localPay == 'Y') {
					fcyOnwNonCurrBsdDefClrgId = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.value-date-CHECK.FOR-FOREIGN-currency.CLEARING-ID.OUTBOUND.NON_CURRENCY_BASED_DEFAULT-CLEARING-ID");
					fcyOnwNonCurrBsdDefClrgId = memTblGetTableValue(map, "INST_PARAM",  fcyOnwNonCurrBsdDefClrgId);
					clrgIdDerived = "Y";
					setHeader(map, "PLCN_custom8", fcyOnwNonCurrBsdDefClrgId);
					releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime")
					releaseTime = lPadChar(releaseTime, 6, "0");

					releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
					releaseDate = (((releaseDate.substr(1, 2)).concat("/")).concat((releaseDate.substr(3, 2)).concat("/"))).concat(releaseDate.substr(5, 4));				
					releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
					//setHeader(map, "PLCN_custom24", releaseDateTime);
					setCustom24(map, releaseDate, releaseTime);
					return fcyOnwNonCurrBsdDefClrgId;
				}
			}
		}
	}

	if(clrgIdDerived == 'N') {
		//setEnhcrViolation("20", "7369");
		//comments = fillViolation();
		comments = setCommentsForTransaction("20", "7369", map);
		setHeader(map, "PLCN_commentsForBlob6", comments);
	}
}

function ddCurrClrgIdInstrctn(currency, map) {
	var clrgId;

	logger.info("In ddCurrClrgIdInstrctn");

	clrgId = getHeaderWithLogging(map, "PLCN_chlClgsysId");

	return clrgId;
}

function fmtNxtWrkingDayInstrn(valueDate, map) {
	var retVal;
	var cutoffFlag;
	var holidayFlag

	logger.info("In fmtNxtWrkingDayInstrn");

	logger.info("fmtNxtWrkingDayInstrn: valueDate = " + valueDate);
	setHeader(map, "PLCN_valueDate", valueDate);

	//retVal = GETVALFROMDFD(GetCurrBusinessElement(), "NEXT-WORKING-DATE");
	retVal = getHeaderWithLogging(map, "PLCN_nextWorkingDate");

	cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");
	holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

	if(cutoffFlag == 'Y' || holidayFlag == 'Y') {
		return valueDate;
	}else {
		if(retVal) {
			valueDate = convertDateFormat(retVal, "YYMMDD", "CCYYMMDD");
			logger.info("fmtNxtWrkingDayInstrn: valueDate = " + valueDate);
			setHeader(map, "PLCN_valueDate", valueDate);
			return retVal;
		}else {
			return valueDate;
		}
	}

	return valueDate;
}

function ddCurrClrgId(map) { //???
	var clrgId;
	//var currency;

	logger.info("In ddCurrClrgId");

	//currency = "IN.PAYMSG.F32A.DT-AMT-A.currency";
	//currency = getHeaderWithLogging(map, "PLCN_currency");

	clrgId = getHeaderWithLogging(map, "PLCN_chlClgsysId");
	return clrgId;
}

//This function looks up the database to derive the clearing system from the currency of the
//message and then derives the value of the non-working day i.e. Y if the day passed as parameter
//is a working day and N if it is a non-working day
function checkDayFlag(clearingId, day, map) {
	var clgSys;
	var dayFlag;
	var clrgIdCutoffReqd;	

	logger.info("In checkDayFlag");

	logger.info("checkDayFlag: day = " + day);

	//var hazelCastInstance = getHeaderWithLogging(map, "PLCN_hazelCastInstance");
	//var FLAG_TABLE = hazelCastInstance.getMap("FLAG-TABLE");

	clrgIdCutoffReqd = getHeaderWithLogging(map, "PLCN_clrgIdCutoffFlag"); //memTblGetTableValue(map, "FLAG-TABLE", "CLRG_ID_CUTOFF_REQD");
	//logger.info("checkDayFlag: day = " + day);
	
	clgSys = ddClrgIdInstParamPath(map);
	logger.info("checkDayFlag: clgSys from ddClrgIdInstParamPath = " + clgSys);

	if(!clgSys && clrgIdCutoffReqd == "Y") {
		clgSys = drveNibcClySysDetails(map);
		logger.info("checkDayFlag: clgSys from drveNibcClySysDetails = " + clgSys);
	}

	dayFlag = getHeaderWithLogging(map, "PLCN_cl".concat(day));
	return dayFlag;
}

function sendToReprNibc1(map) {
	var releaseDate;
	var origValueDate;
	var todaysDate;
	var stage;
	var tError;
	var mode;
	var sourceChnlId;
	var reprProductCode;
	var pattern;

	logger.info("In sendToReprNibc1");

	tError = "F"//memTblGetTableValue(map, "TransTable", "TransErrorFlag");
	releaseDate = getHeaderWithLogging(map, "PLCN_valueDate");
	origValueDate = getHeaderWithLogging(map, "PLCN_valueDate2");
	stage = getHeaderWithLogging(map, "PLCN_stage");
	mode = getHeaderWithLogging(map, "PLCN_manualMode");
	sourceChnlId = getHeaderWithLogging(map, "PLCN_channelIdSource");


	//todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	if(!origValueDate) {
		return;
	}

	if(releaseDate != origValueDate) {
		setHeader(map, "PLCN_setNewDate", true);
	}

	if((origValueDate < todaysDate || origValueDate < releaseDate)  && (stage != 'ERR' && tError != 'T')) {

		var pcncValue = getHeader(map, "PLCN_pastDateCheckNotApplicableChannel"); //memTblGetTableValue(map, "FLAG-TABLE", "PASTDATE_CHECK_NOTAPPLICABLE_CHANNEL");
		//logger.info("sendToReprNibc1: pcncValue = " + pcncValue);

		if(!(isPatternPresent(pcncValue, sourceChnlId))) {

			if(mode != 'REPAIR' && mode != 'MQ') {
				//setEnhcrViolation("00", "9506")
				//commentsForBlob6 = fillViolation();
				setHeader(map, "PLCN_schedulingReq", true);
				commentsForBlob6 = setCommentsForTransaction("00", "9506", map);
				setHeader(map, "PLCN_commentsForBlob6", commentsForBlob6)
				setHeader(map, "PLCN_queueId", "REPRQ");
				setHeader(map, "PLCN_schedulingReq", "true");
			}

			var avmValue = getHeaderWithLogging(map, "PLCN_avmValue"); //memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_MQ");
			//logger.info("sendToReprNibc1: avmValue = " + avmValue);

			/*if(avmValue == "NO" && mode == "MQ") {
				//setEnhcrViolation("00", "9506");
				//commentsForBlob6 = fillViolation();
				setHeader(map, "PLCN_schedulingReq", true);
				comments = setCommentsForTransaction("00", "9506", map);
				//setHeader(map, "PLCN_commentsForBlob6", commentsForBlob6);
				setHeader(map, "PLCN_queueId", "REPRQ");
				setHeader(map, "PLCN_schedulingReq", "true");

				var reprProductCodeHdr = getHeaderWithLogging(map, "PLCN_reprProductCode");
				logger.info("sendToReprNibc1: reprProductCodeHdr = " + reprProductCodeHdr);

				if(!reprProductCodeHdr) {
					reprProductCode = getHeaderWithLogging(map, "PLCN_derivedProduct");
					logger.info("sendToReprNibc1: reprProductCode = " + reprProductCode);

					pattern = searchNthPattern(reprProductCode, "-", -1);
					logger.info("sendToReprNibc1: pattern = " + pattern);

					reprProductCode = reprProductCode.substr(0, pattern);
					logger.info("sendToReprNibc1: reprProductCode = " + reprProductCode);

					reprProductCode = reprProductCode.concat("R");
					logger.info("sendToReprNibc1: reprProductCode = " + reprProductCode);

					setHeader(map, "PLCN_derivedProduct", reprProductCode);
					setHeader(map, "PLCN_productCode", reprProductCode);
					setHeader(map, "PLCN_reprProductCode", reprProductCode);
				}
			}*/
		}
	}
}

function deriveClrgIdForJerseyAccount(currencyLocal, directionCheck, map) {
	var lclIbJerseyCustmrPay;
	var lclOnwJerseyAcctPay;
	var lclOnwNonJerseyAcctPay;
	var fcyIbJerseyCustmrPay;
	var institutionId;
	var clrgIdDerived;
	var releaseTime;
	var releaseDate;
	var releaseDateTime;
	var valueDate;
	var priority;

	logger.info("In deriveClrgIdForJerseyAccount");

	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	valueDate = getHeaderWithLogging(map, "PLCN_valueDate");
	priority = getHeaderWithLogging(map, "PLCN_Priority");

	if(currencyLocal == "Y") {

		if(directionCheck == "INBOUND" && priority == "2") {
			lclIbJerseyCustmrPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-LOCAL-CURRENCY.CLEARING-ID.INBOUND.JERSEY_CUSTOMER_PAY");
			lclIbJerseyCustmrPay = memTblGetTableValue(map, "INST_PARAM",  lclIbJerseyCustmrPay);
			clrgIdDerived = "Y";
			setHeader(map, "PLCN_custom8", lclIbJerseyCustmrPay)
			releaseTime = retrievReleasetime(map);
			releaseTime = lPadChar(releaseTime, 6, "0");
			releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
			releaseDate = ((((releaseDate.substr(1, 2).concat("/"))).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
			releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
			//setHeader(map, "PLCN_custom24", releaseDateTime)
			setCustom24(map, releaseDate, releaseTime);
			return lclIbJerseyCustmrPay;
		}

		if(directionCheck == "INBOUND" && priority == "1") {
			lclOnwNonJerseyAcctPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-LOCAL-CURRENCY.CLEARING-ID.ONWARD.NON_JERSEY_PAY");
			lclOnwNonJerseyAcctPay = memTblGetTableValue(map, "INST_PARAM",  lclOnwNonJerseyAcctPay);
			clrgIdDerived = "Y";
			setHeader(map, "PLCN_custom8", lclOnwNonJerseyAcctPay)
			releaseTime = retrievReleasetime(map);
			releaseTime = lPadChar(releaseTime, 6, "0");
			releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
			releaseDate = ((((releaseDate.substr(1, 2).concat("/"))).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
			releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
			//setHeader(map, "PLCN_custom24", releaseDateTime)
			setCustom24(map, releaseDate, releaseTime);
			return lclOnwNonJerseyAcctPay;
		}

		if(directionCheck == "INBOUND" && priority == "8") {
			lclOnwJerseyAcctPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-LOCAL-CURRENCY.CLEARING-ID.ONWARD.JERSEY_PAY");
			lclOnwJerseyAcctPay = memTblGetTableValue(map, "INST_PARAM",  lclOnwJerseyAcctPay);
			clrgIdDerived = "Y";
			setHeader(map, "PLCN_custom8", lclOnwJerseyAcctPay)
			releaseTime = retrievReleasetime(map);
			releaseTime = lPadChar(releaseTime, 6, "0");
			releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
			releaseDate = ((((releaseDate.substr(1, 2).concat("/"))).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
			releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
			//setHeader(map, "PLCN_custom24", releaseDateTime)
			setCustom24(map, releaseDate, releaseTime);
			return lclOnwJerseyAcctPay;
		}
	}

	if(currencyLocal != "Y") {

		if(directionCheck = "INBOUND") {

			if(priority == "5") {
				fcyIbJerseyCustmrPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-FOREIGN-CURRENCY.CLEARING-ID.INBOUND.JERSEY_CUSTOMER_PAY_GBP");
				fcyIbJerseyCustmrPay = memTblGetTableValue(map, "INST_PARAM",  fcyIbJerseyCustmrPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", fcyIbJerseyCustmrPay)
				releaseTime = retrievReleasetime(map);
				releaseTime = lPadChar(releaseTime, 6, "0");
				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = ((((releaseDate.substr(1, 2).concat("/"))).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime)
				setCustom24(map, releaseDate, releaseTime);
				return fcyIbJerseyCustmrPay;	
			}

			if(priority == "6") {
				fcyIbJerseyCustmrPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-FOREIGN-CURRENCY.CLEARING-ID.INBOUND.JERSEY_CUSTOMER_PAY");
				fcyIbJerseyCustmrPay = memTblGetTableValue(map, "INST_PARAM",  fcyIbJerseyCustmrPay);
				clrgIdDerived = "Y";
				setHeader(map, "PLCN_custom8", fcyIbJerseyCustmrPay)
				releaseTime = retrievReleasetime(map);
				releaseTime = lPadChar(releaseTime, 6, "0");
				releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
				releaseDate = ((((releaseDate.substr(1, 2).concat("/"))).concat((releaseDate.substr(3, 2)))).concat("/")).concat(releaseDate.substr(5, 4));
				releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
				//setHeader(map, "PLCN_custom24", releaseDateTime)
				setCustom24(map, releaseDate, releaseTime);
				return fcyIbJerseyCustmrPay;	
			}
		}
	}
}

function checkDayFlagInstrcn(currency, day, map) {
	var clgSys;
	var dayFlag;
	var clrgIdCutoffFlag;
	var clrgIdStatus;
	var msgDirection;

	logger.info("In checkDayFlagInstrcn");
	//logger.info("checkDayFlagInstrcn: map = " + map);
	logger.info("checkDayFlagInstrcn: day = " + day);

	dayFlag = getHeaderWithLogging(map, "PLCN_cl" + day.toLowerCase());

	if(dayFlag){
		return dayFlag;
	}

	msgDirection = getHeaderWithLogging(map, "PLCN_msgDirection");

	clrgIdCutoffFlag = getHeaderWithLogging(map, "PLCN_clrgIdCutoffFlag"); //memTblGetTableValue(map, "FLAG-TABLE", "CLRG_ID_CUTOFF_REQD");
	//logger.info("checkDayFlagInstrcn: clrgIdCutoffFlag = " + clrgIdCutoffFlag);

	if(clrgIdCutoffFlag == "Y"){
		clgSys = getHeaderWithLogging(map, "PLCN_clearingId");
		clrgIdStatus = getHeaderWithLogging(map, "PLCN_cutoffTime");
	
		if(msgDirection == "O"){
			clgSys = drveNibcClySysDetails();
		}

		if((!(clgSys)) ||(clrgIdStatus == "CLEARINGID_NOT_FOUND")){
			clgSys = "DEFAULT_CLEARING";
		}

	}else {
		clgSys = ddClrgInstParmInstrcn(map);
	}

	logger.info("checkDayFlagInstrcn: day = " + day);
	dayFlag = getHeaderWithLogging(map, "PLCN_cl".concat(day));

	return dayFlag;
}

//derives next wworking date
function ddNxtWrkingDayInstrcn(valueDate, currency, map){
	var nxtWorkingDate;
	var workingDaysToAdd;
	var thuFlag;
	var friFlag;
	var satFlag;
	var sunFlag;
	var tempDate;
	var clrgIdCutoffFlag;
	var holidayFlag;
	var holidayConfirmFlag;
	var cutoffFlag;
	var pastValueDateFlag;

	logger.info("In ddNxtWrkingDayInstrcn");

	//tempDate = getDate();
    tempDate = todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");
	cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");
	holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");


	if(cutoffFlag == 'Y' || holidayFlag == 'Y') {
		workingDaysToAdd = 1;
		/*thuFlag = checkDayFlagInstrcn(currency, "Thursday", map);
		friFlag = checkDayFlagInstrcn(currency, "Friday", map);
		satFlag = checkDayFlagInstrcn(currency, "Saturday", map);
		sunFlag = checkDayFlagInstrcn(currency, "Sunday", map);*/
        thuFlag = getHeader(map, "PLCN_thuFlag");
        if(thuFlag){
            friFlag = getHeader(map, "PLCN_friFlag");
            satFlag = getHeader(map, "PLCN_satFlag");
            sunFlag = getHeader(map, "PLCN_sunFlag");
        }else{
		thuFlag = checkDayFlagInstrcn(currency, "Thursday", map);
		friFlag = checkDayFlagInstrcn(currency, "Friday", map);
		satFlag = checkDayFlagInstrcn(currency, "Saturday", map);
		sunFlag = checkDayFlagInstrcn(currency, "Sunday", map);
            setHeader(map, "PLCN_thuFlag", thuFlag);
            setHeader(map, "PLCN_friFlag", friFlag);
            setHeader(map, "PLCN_satFlag", satFlag);
            setHeader(map, "PLCN_sunFlag", sunFlag);
        }

		logger.info("ddNxtWrkingDayInstrcn: thuFlag = " + thuFlag);
		logger.info("ddNxtWrkingDayInstrcn: friFlag = " + friFlag);
		logger.info("ddNxtWrkingDayInstrcn: satFlag = " + satFlag);
		logger.info("ddNxtWrkingDayInstrcn: sunFlag = " + sunFlag);

		pastValueDateFlag = getHeaderWithLogging(map, "PLCN_pastValueDateFlag");

		if(pastValueDateFlag == 'Y') {
			//tempDate = getDate();
            tempDate = getHeaderWithLogging(map, "PLCN_todaysDate");
			nxtWorkingDate = getNxtWrkingDayInstrn(workingDaysToAdd, tempDate, currency, thuFlag, friFlag, satFlag, sunFlag, map);
			logger.info("ddNxtWrkingDayInstrcn: nxtWorkingDate = " + nxtWorkingDate);
		}else {
			clrgIdCutoffFlag = getHeaderWithLogging(map, "PLCN_clrgIdCutoffFlag"); //memTblGetTableValue(map, "FLAG-TABLE", "CLRG_ID_CUTOFF_REQD");
			//clrgIdCutoffFlag = clrgIdCutoffFlag.trim();
			//logger.info("ddNxtWrkingDayInstrcn: clrgIdCutoffFlag = " + clrgIdCutoffFlag);

			if(clrgIdCutoffFlag == 'Y') {
				holidayFlag = getHeaderWithLogging(map, "PLCN_holidayFlag");

				if(holidayFlag == 'Y') {
					logger.info("ddNxtWrkingDayInstrcn: valueDate = " + valueDate);
					holidayConfirmFlag = "Y";
					setHeader(map, "PLCN_holidayConfirmFlag", "Y");
					logger.info("ddNxtWrkingDayInstrcn: PLCN_holidayConfirmFlag = Y");
					nxtWorkingDate = getNxtWrkingDayInstrn(workingDaysToAdd, valueDate, currency, thuFlag, friFlag, satFlag, sunFlag, map);
					logger.info("ddNxtWrkingDayInstrcn: nxtWorkingDate = " + nxtWorkingDate);

					if(holidayFlag == 'Y') {
						setHeader(map, "PLCN_holidayFlag", "N");
						logger.info("ddNxtWrkingDayInstrcn: PLCN_holidayFlag = N");	
					}
				}else {
					nxtWorkingDate = valueDate;
					logger.info("ddNxtWrkingDayInstrcn: nxtWorkingDate = " + nxtWorkingDate);
				}
			}else {
				if(valueDate != tempDate) {
					nxtWorkingDate = getNxtWrkingDayInstrn(workingDaysToAdd, valueDate, currency, thuFlag, friFlag, satFlag, sunFlag, map);	
				}else {
					nxtWorkingDate = valueDate;
					logger.info("ddNxtWrkingDayInstrcn: valueDate = " + valueDate);
					logger.info("ddNxtWrkingDayInstrcn: nxtWorkingDate = " + nxtWorkingDate);
				}

			}
		}

		valueDate = nxtWorkingDate;
		//nxtWorkingDate = convertDateFormat(nxtWorkingDate, "CCYYMMDD", "YYMMDD");
		//PLCN_valueDate = convertDateFormat(PLCN_valueDate, "YYMMDD", "CCYYMMDD");

		logger.info("ddNxtWrkingDayInstrcn: nxtWorkingDate = " + nxtWorkingDate);
		
		setHeader(map, "PLCN_valueDate", valueDate);
		setHeader(map, "PLCN_nextWorkingDate", nxtWorkingDate);

		logger.info("ddNxtWrkingDayInstrcn: PLCN_valueDate = " + getHeader(map, "PLCN_valueDate"));
		logger.info("ddNxtWrkingDayInstrcn: PLCN_nextWorkingDate = " + getHeader(map, "PLCN_nextWorkingDate"));

		return;	
	}

	logger.info("ddNxtWrkingDayInstrcn: nxtWorkingDate = " + nxtWorkingDate);
}

function getNxtWrkingDayInstrn(workDaysToAdd, originalDate, currency, thuFlag, friFlag, satFlag, sunFlag, map){
	var x;
	var holiday;
	var holidayFlag;
	var tempDate;
	var temp1Date;
	var dayTag;
	var currWorkDay;

	logger.info("In getNxtWrkingDayInstrn");

	x = 1;
	currWorkDay = 0;
	tempDate = originalDate;

	logger.info("getNxtWrkingDayInstrn: workDaysToAdd = " + workDaysToAdd);
	logger.info("getNxtWrkingDayInstrn: originalDate = " + originalDate);
	logger.info("getNxtWrkingDayInstrn: currency = " + currency);
	logger.info("getNxtWrkingDayInstrn: thuFlag = " + thuFlag);
	logger.info("getNxtWrkingDayInstrn: friFlag = " + friFlag);
	logger.info("getNxtWrkingDayInstrn: satFlag = " + satFlag);
	logger.info("getNxtWrkingDayInstrn: sunFlag = " + sunFlag);

	while(currWorkDay < workDaysToAdd){
		holidayFlag = "N";
		temp1Date = getDateFromNumOfDays(tempDate, x);
		logger.info("getNxtWrkingDayInstrn: temp1Date = " + temp1Date);
		//temp2 = getHeaderWithLogging(map, "PLCN_institutionId") + "_";
		//temp2 = temp2 + currency + "_" + temp1Date;
		//holiday = memTblGetTableValue(map, "CHL_HOLIDAY", temp2);

		holiday = checkHoliday(currency, temp1Date, map);
		logger.info("getNxtWrkingDayInstrn: holiday = " + holiday);

		if(!(holiday)){
			holiday = checkHolidayInstrcn(currency, temp1Date, map);
			logger.info("getNxtWrkingDayInstrn: holiday = " + holiday);
		}

		if(holiday > 0){
			holidayFlag = "Y";
		}

		logger.info("getNxtWrkingDayInstrn: holidayFlag = " + holidayFlag);

		if(holidayFlag == "N"){
			temp1Date = convertDateFormat(temp1Date, "CCYYMMDD", "DDMMCCYY");
			logger.info("getNxtWrkingDayInstrn: temp1Date = " + temp1Date);
			var tmpDateW = convertDateFormat(temp1Date, "DDMMCCYY", "MMDDCCYY");
			logger.info("getNxtWrkingDayInstrn: tmpDateW = " + tmpDateW);
			dayTag = getWeekday(tmpDateW);
			logger.info("getNxtWrkingDayInstrn: dayTag = " + dayTag);

			if((dayTag == "Thursday" && thuFlag == "Y") || (dayTag == "Friday" && friFlag == "Y") || (dayTag == "Saturday" && satFlag == "Y") || (dayTag  == "Sunday" && sunFlag == "Y")) {
				holidayFlag = "Y";
			}

			temp1Date = convertDateFormat(temp1Date, "DDMMCCYY", "CCYYMMDD");
			logger.info("getNxtWrkingDayInstrn: temp1Date = " + temp1Date);
		}

		x++;

		logger.info("getNxtWrkingDayInstrn: holidayFlag = " + holidayFlag);

		if(holidayFlag == "N") {
			currWorkDay++;
			logger.info("getNxtWrkingDayInstrn: currWorkDay = " + currWorkDay);
		}
	}

	logger.info("getNxtWrkingDayInstrn: temp1Date = " + temp1Date);

	return temp1Date;
}

function checkHolidayInstrcn(currency, date, map){
	var clgSys;
	var holiday;
	var clrgIdCutoffFlag;
	var clrgIdStatus;
	var msgDirection;

	logger.info("In checkHolidayInstrcn");

	logger.info("checkHolidayInstrcn: currency = " + currency);
	logger.info("checkHolidayInstrcn: date = " + date);

	msgDirection = getHeaderWithLogging(map, "PLCN_msgDirection");

	clrgIdCutoffFlag = getHeaderWithLogging(map, "PLCN_clrgIdCutoffFlag"); //memTblGetTableValue(map, "FLAG-TABLE", "CLRG_ID_CUTOFF_REQD");
	//clrgIdCutoffFlag = clrgIdCutoffFlag.trim();
	//logger.info("checkHolidayInstrcn: clrgIdCutoffFlag = " + clrgIdCutoffFlag);

	if(clrgIdCutoffFlag == "Y"){
		clgSys = getHeaderWithLogging(map, "PLCN_clearingId");

		if(!(clgSys)){
			clgSys = getHeaderWithLogging(map, "PLCN_clrgIdSet");
		}

		//clgSys = getHeaderWithLogging(map, "PLCN_clearingId");
		clrgIdStatus = getHeaderWithLogging(map, "PLCN_cutoffTime");

		if(msgDirection == "O"){
			clgSys = drveNibcClySysDetails(map);
			logger.info("checkHolidayInstrcn: clgSys = " + clgSys);
		}

		if(!clgSys || clrgIdStatus == "clearingId_NOT_FOUND"){
			clgSys = "DEFAULT_CLEARING";
			logger.info("checkHolidayInstrcn: clgSys = " + clgSys);
		}
	}else{
		clgSys = ddClrgInstParmInstrcn(map);
		logger.info("checkHolidayInstrcn: clgSys = " + clgSys);
	}

	logger.info("checkHolidayInstrcn: clgSys = " + clgSys);

	if(clgSys) {
		holiday = checkHoliday(clgSys, date, map);
		logger.info("checkHolidayInstrcn: holiday = " + holiday);
	}

	return holiday;
}

function releasePymtDateRule(clrgId, map) {
	var valueDate;
	var releaseTime;
	var releaseDate;
	var startTimeFlag;
	var todaysDate;
	var cutoffFlag;

	logger.info("In releasePymtDateRule");

	logger.info("releasePymtDateRule: clrgId = " + clrgId);
	logger.trace("releasePymtDateRule: map = " + map);		

	startTimeFlag = getHeaderWithLogging(map, "PLCN_startTimeFlag");

	cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");

	var tmp3 = getHeaderWithLogging(map, "PLCN_nextWorkingDate");
		

	var clrgIdOffsetDay = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

	//todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	if(startTimeFlag == "Y" || parseInt(clrgIdOffsetDay) > 0) {
		valueDate = getHeaderWithLogging(map, "PLCN_calculatedReleaseDate");

		if(valueDate < todaysDate) {
			valueDate = tmp3;
			logger.info("releasePymtDateRule: valueDate from PLCN_nextWorkingDate = " + valueDate);
		}
		//valueDate = tmp5;
		//logger.info("releasePymtDateRule: valueDate from PLCN_calculatedNextDate = " + valueDate); //CCYYMMDD
	}else {

    	//var todaysDate = getDate();
        var todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

		var holidayCheck = checkHoliday(clrgId, todaysDate, map);
		logger.info("releasePymtDateRule: holidayCheck = " + holidayCheck);

		if(holidayCheck == 1) {
			//valueDate = tmp4;
			valueDate = tmp3;
			logger.info("releasePymtDateRule: valueDate from PLCN_custom24rd = " + valueDate);			
		}else{
			valueDate = getHeaderWithLogging(map, "PLCN_nextWorkingDate");
		}

		if(!valueDate) {
			valueDate = getHeaderWithLogging(map, "PLCN_calculatedReleaseDate"); //CCYYMMDD			
		}
	}

	logger.info("releasePymtDateRule: valueDate = " + valueDate); //CCYYMMDD

	if(valueDate == todaysDate && parseInt(clrgIdOffsetDay) > 0) {
		logger.info("releasePymtDateRule: valueDate == todaysDate");
		
		if(cutoffFlag == "Y"){
			valueDate = ddBusinessDate1(valueDate, "+", "BD", clrgIdOffsetDay, map); //drvNextValueDate(nextWorkingDate, clrgId, "0", currency, "00", "6012", map);
			logger.info("releasePymtDateRule: valueDate from ddBusinessDate1 = " + valueDate);
		}
	}

	var valueDateHdr = getHeaderWithLogging(map, "PLCN_valueDate");

	if(valueDateHdr > valueDate && parseInt(clrgIdOffsetDay) == 0) {
		valueDate = getHeaderWithLogging(map, "PLCN_nextWorkingDate");
		logger.info("releasePymtDateRule: valueDate from PLCN_nextWorkingDate = " + valueDate);
	}	
	
	setHeader(map, "PLCN_releaseDateMsg", valueDate);

	releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime");
	logger.info("releasePymtDateRule: releaseTime = " + releaseTime);
	releaseTime = lPadChar(releaseTime, 6, "0");
	logger.info("releasePymtDateRule: releaseTime = " + releaseTime);
	releaseDate = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
	logger.info("releasePymtDateRule: releaseDate = " + releaseDate); //09062021
	releaseDate = releaseDate.substr(0, 2) + "/" + releaseDate.substr(2, 2) + "/" + releaseDate.substr(4, 8);
	logger.info("releasePymtDateRule: releaseDate = " + releaseDate);
	releaseDateTime = (releaseDate.concat(", ")).concat(releaseTime);
	logger.info("releasePymtDateRule: releaseDateTime = " + releaseDateTime);
	//setHeader(map, "PLCN_custom24", releaseDateTime);
	setCustom24(map, releaseDate, releaseTime);
}

/* function retrieveReleaseTimeClrgId(clrgId, map) {
	var releaseTime;

	logger.info("In retrieveReleaseTimeClrgId");
	logger.info("retrieveReleaseTimeClrgId: clrgId = " + clrgId);
	releaseTime = getHeaderWithLogging(map, "PLCN_clStartTime"); //memTblGetTableValue(map, "CL_START_TIME_MAP", clrgId);

	return releaseTime;
} */

function valueDateDcsnRule(valueDate, fld, vioCode3, vioCode2, map) {
	var todaysDate;
	var comments;
	var releaseFlag;
	var newValueDate;
	var cutoffFlag;
	var holdQFlag;
	var releaseDate;
	var calculatedReleaseDate;
	var tbReleasedFlag;

	logger.info("In valueDateDcsnRule");

	cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");
	releaseDate = getHeaderWithLogging(map, "PLCN_calculatedReleaseDate");
	setHeader(map, "PLCN_createHolidayReleaseDate", releaseDate);
	tbReleasedFlag = getHeaderWithLogging(map, "PLCN_toBeReleasedFlag");

	logger.info("valueDateDcsnRule: cutoffFlag = " + cutoffFlag);
	logger.info("valueDateDcsnRule: releaseDate = " + releaseDate);
	logger.info("valueDateDcsnRule: tbReleasedFlag = " + tbReleasedFlag);

	//todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	if(todaysDate < releaseDate) {
		releaseFlag = getHeaderWithLogging(map, "PLCN_clrgIdReleaseFlag");

		if(releaseFlag.toUpperCase() == 'YES') {

			if(!cutoffFlag || cutoffFlag == 'N') {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);
			}else {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);
			}
		}else {

			if(!cutoffFlag || cutoffFlag == 'N') {

				if(tbReleasedFlag == 'Y') {
					newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
					setHeader(map, "PLCN_valueDate", newValueDate);
					holdQFlag = "N";
					setHeader(map, "PLCN_holdQFlag", holdQFlag);

					if(releaseDate) {
						setHeader(map, "PLCN_calculatedReleaseDate", releaseDate);
					}

					newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
					setHeader(map, "PLCN_valueDate", newValueDate);
					setHeader(map, "PLCN_earlyDateFlag", "Y");
				}
			}else {
				setHeader(map, "PLCN_overrideCutoffFlag", "Y");
				holdQFlag = "Y";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);

				if(releaseDate) {
					setHeader(map, "PLCN_calculatedReleaseDate", releaseDate);
				}

				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				setHeader(map, "PLCN_earlyDateFlag", "Y");
			}
		}
	}

	if(todaysDate > releaseDate) {
		//setEnhcrViolation(fld, vioCode3, map);
		//comments = fillViolation();
		setHeader(map, "PLCN_schedulingReq", true);
		comments = setCommentsForTransaction(fld, vioCode3, map);
		setHeader(map, "PLCN_commentsForBlob6", comments);
		setHeader(map, "PLCN_comments", comments);
		releaseFlag = getHeaderWithLogging(map, "PLCN_clrgIdReleaseFlag");

		if(releaseFlag.toUpperCase() == "YES") {

			if(!cutoffFlag || cutoffFlag == 'N') {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);
			}else {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);	
			}		
		}else {
			if(!cutoffFlag || cutoffFlag == 'N') {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);
			}else {

				if(releaseDate) {
					setHeader(map, "PLCN_calculatedReleaseDate", releaseDate);	
				}
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				setHeader(map, "PLCN_overrideCutoffFlag", "Y");
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);
			}
		}
	}

	if(todaysDate == releaseDate) {
		releaseFlag = getHeaderWithLogging(map, "PLCN_clrgIdReleaseFlag");

		if(releaseFlag.toUpperCase() == "YES") {

			if(!cutoffFlag || cutoffFlag == 'N') {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);
			}else {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);	
			}		
		}else {

			if(!cutoffFlag || cutoffFlag == 'N') {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);
			}else {
				newValueDate = getHeaderWithLogging(map, "PLCN_calculatedNextDate");
				setHeader(map, "PLCN_valueDate", newValueDate);
				holdQFlag = "N";
				setHeader(map, "PLCN_holdQFlag", holdQFlag);	
			}
		}	
	}

	if((isPatternPresent(getHeader(map, "PLCN_commentsForBlob6"), "9500") || isPatternPresent(getHeader(map, "PLCN_commentsForBlob6"),  "6013") && getHeader(map, "PLCN_createHoliday") == 1)) {
		setHeader(map, "PLCN_createHolidayFlag", "Y");	
	}

	logger.info("valueDateDcsnRule: newValueDate = " + newValueDate);
}
function ruleCombineViolations(map){
	var commentsStrCurrProcess;
	var vioStrAftPreenceInfo;
	var vioStrBefPresenceInfo;
	var tmpStr;
	var tmpVioStrAftPresenceInfo;
	var tmpVioStrBefPresenceInfo;
	var finalCmntStrCurrProcess;
	var serverMode;

	logger.info("In ruleCombineViolations");
	
	serverMode = memTblGetTableValue(map, "FLAG_TABLE", "SERVER-MODE");
	
	if(serverMode == "INTERFACE" ){
		commentsStrCurrProcess = getHeaderWithLogging(map, "PLCN_commentsForBlob6");	
	}else {
		commentsStrCurrProcess = commentsStrCurrProcess;
	}
	tmpVioStrAftPresenceInfo = strStr(commentsStrCurrProcess,":A00:");
	tmpVioStrBefPresenceInfo = removePattern(commentsStrCurrProcess , tmpVioStrAftPresenceInfo );
	
	//tmpStr = fillViolation();

	tmpVioStrAftPresenceInfo = strStr(tmpStr,":A00:");
	tmpVioStrBefPresenceInfo = removePattern(tmpStr , tmpVioStrAftPresenceInfo );

	finalCmntStrCurrProcess = vioStrBefPresenceInfo + tmpVioStrBefPresenceInfo + vioStrAftPreenceInfo + tmpVioStrAftPresenceInfo;
	finalCmntStrCurrProcess = cleanupComments(finalCmntStrCurrProcess);

	if(serverMode == "INTERFACE") {
		setHeader(map, "PLCN_commentsForBlob6", finalCmntStrCurrProcess);
		
	}else {
		commentsForBlob6 = finalCmntStrCurrProcess;
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

function setNewIntrBkSttlmDt(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var releaseDateMsg;
	var newPriorityDate;
	var nextWorkingDate;
	var weekendCheck;

	logger.info("In setNewIntrBkSttlmDt");

    var mode = 	getHeaderWithLogging(map, "PLCN_mode");

   	var autoRepairFlag = getHeaderWithLogging(map, "PLCN_autoRepairFlag"); //memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_"+mode);
   	//logger.info("setNewIntrBkSttlmDt: autoRepairFlag = " + autoRepairFlag);

	releaseDateMsg = getHeaderWithLogging(map, "PLCN_releaseDateMsg");
	newPriorityDate = releaseDateMsg;

	var valueDate = getHeaderWithLogging(map, "PLCN_valueDate");

	var actualValDate = getHeaderWithLogging(map, "PLCN_valueDate2");

	var offSet = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

	var nextWorkingDateHdr = getHeaderWithLogging(map, "PLCN_nextWorkingDate");

	var clrgId = getHeaderWithLogging(map, "PLCN_clearingId");

	
	var msgType = getHeaderWithLogging(map, "PLCN_msgType");

    var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	if(autoRepairFlag == "YES") {
		if(offSet != "0") {

			if(valueDate == releaseDateMsg && offSet != "0") {
				logger.info("setNewIntrBkSttlmDt: valueDate == releaseDateMsg && offSet != 0");
				valueDate = ddBusinessDate1(valueDate, "+", "BD", offSet, map); //drvNextValueDate(nextWorkingDate, clrgId, "0", currency, "00", "6012", map);
				logger.info("setNewIntrBkSttlmDt: valueDate from ddBusinessDate1 = " + valueDate);
			}

			var holidayCheck = checkHoliday(clrgId, valueDate, map);
			logger.info("setNewIntrBkSttlmDt: holidayCheck = " + holidayCheck);

			/*var thuFlag = checkDayFlagInstrcn(clrgId, "Thursday", map);
			var friFlag = checkDayFlagInstrcn(clrgId, "Friday", map);
			var satFlag = checkDayFlagInstrcn(clrgId, "Saturday", map);
			var sunFlag = checkDayFlagInstrcn(clrgId, "Sunday", map);*/
            var thuFlag = getHeader(map, "PLCN_thuFlag");
            if(thuFlag){
                var friFlag = getHeader(map, "PLCN_friFlag");
                var satFlag = getHeader(map, "PLCN_satFlag");
                var sunFlag = getHeader(map, "PLCN_sunFlag");
            }else{
			var thuFlag = checkDayFlagInstrcn(clrgId, "Thursday", map);
			var friFlag = checkDayFlagInstrcn(clrgId, "Friday", map);
			var satFlag = checkDayFlagInstrcn(clrgId, "Saturday", map);
			var sunFlag = checkDayFlagInstrcn(clrgId, "Sunday", map);
                setHeader(map, "PLCN_thuFlag", thuFlag);
                setHeader(map, "PLCN_friFlag", friFlag);
                setHeader(map, "PLCN_satFlag", satFlag);
                setHeader(map, "PLCN_sunFlag", sunFlag);
            }
			var tmpDateW = convertDateFormat(valueDate, "CCYYMMDD", "MMDDCCYY");
			var dayTag = getWeekday(tmpDateW);
			
			if((dayTag == "Thursday" && thuFlag == 'Y') || (dayTag == "Friday" && friFlag == 'Y') || (dayTag == "Saturday" && satFlag == 'Y') || (dayTag == "Sunday" && sunFlag == 'Y')) {
				weekendCheck = 1;
			}	

			logger.info("setNewIntrBkSttlmDt: weekendCheck = " + weekendCheck);		

			if(holidayCheck == 1 || weekendCheck == 1) {
				nextWorkingDate = nextWorkingDateHdr;
				logger.info("setNewIntrBkSttlmDt: nextWorkingDate from nextWorkingDateHdr = " + nextWorkingDate);
				logger.info("setNewIntrBkSttlmDt: nextWorkingDateHdr = " + nextWorkingDateHdr);
				logger.info("setNewIntrBkSttlmDt: offSet = " + offSet);
				var currency = getHeaderWithLogging(map, "PLCN_currency");

				//4503
				if(nextWorkingDate == releaseDateMsg && offSet != "0") {
					logger.info("setNewIntrBkSttlmDt: nextWorkingDate == releaseDateMsg && offSet != 0");
					nextWorkingDate = ddBusinessDate1(nextWorkingDate, "+", "BD", offSet, map); //drvNextValueDate(nextWorkingDate, clrgId, "0", currency, "00", "6012", map);
					logger.info("setNewIntrBkSttlmDt: nextWorkingDate from drvNextValueDate = " + nextWorkingDate);
				}				
			}else {
				nextWorkingDate = valueDate;
				logger.info("setNewIntrBkSttlmDt: nextWorkingDate from valueDate = " + nextWorkingDate);
			}							
		}else {
			nextWorkingDate = releaseDateMsg;
			logger.info("setNewIntrBkSttlmDt: nextWorkingDate from releaseDateMsg = " + nextWorkingDate);		
		}
	}else {
		nextWorkingDate = nextWorkingDateHdr;
		logger.info("setNewIntrBkSttlmDt: nextWorkingDate from nextWorkingDateHdr = " + nextWorkingDate);		
	}

	newPriorityDate = nextWorkingDate;
	logger.info("setNewIntrBkSttlmDt: PLCN_nextWorkingDate = " + nextWorkingDate);
	logger.info("setNewIntrBkSttlmDt: newPriorityDate = " + newPriorityDate);

	//releaseDateMsg = releaseDateMsg.substring(0, 4) + "-" + releaseDateMsg.substring(4, 6) + "-"  + releaseDateMsg.substring(6, 8);
	nextWorkingDate = nextWorkingDate.substring(0, 4) + "-" + nextWorkingDate.substring(4, 6) + "-"  + nextWorkingDate.substring(6, 8);
	logger.info("setNewIntrBkSttlmDt: nextWorkingDate = " + nextWorkingDate);

	var clrgIdOffsetDay = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

	var txnComments = getHeaderWithLogging(map, 'PLCN_txnComments');

    var startTimeFlag = getHeaderWithLogging(map, "PLCN_startTimeFlag");

	//when the value date is holiday or if the payment is processed before start or after cut off update the new value date in message
	if((startTimeFlag != "Y" && isPatternPresent(txnComments, "6011")) || isPatternPresent(txnComments, "6012") || (autoRepairFlag == "YES" && isPatternPresent(txnComments, "9506"))) {
		path = getValueDatePath(exchange);
		logger.info("setNewIntrBkSttlmDt: setting new date in message = " + nextWorkingDate);
		setValueInPath(Document, path, nextWorkingDate);
		if(msgType == "pacs.003.001.08"){
			var path1 = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/ReqdColltnDt';
			logger.info("setNewIntrBkSttlmDt: Auto repaired setting new ReqdColltnDt in message = " + nextWorkingDate);
			setValueInPath(Document, path1, nextWorkingDate);
		}
		if(actualValDate < newPriorityDate){
			logger.info("setNewIntrBkSttlmDt: inside set comments for transaction");
			setCommentsForTransaction("00", "9011", map);
		}

		if(newPriorityDate < valueDate) {
			setHeader(map, "PLCN_newPriorityDate", nextWorkingDateHdr);//if newPriorityDate<PLCN_valueDate then use PLCN_nextWorkingDate
			logger.info("setNewIntrBkSttlmDt: setting nextWorkingDateHdr as PLCN_newPriorityDate");
		}else {
			setHeader(map, "PLCN_newPriorityDate", newPriorityDate);
			logger.info("setNewIntrBkSttlmDt: setting newPriorityDate as PLCN_newPriorityDate");
		}
	}

	var setNewPriorityDate = getHeaderWithLogging(map, "PLCN_setNewPriorityDate");

	if(autoRepairFlag == "YES" && setNewPriorityDate == "true") {
		path = getValueDatePath(exchange);
		logger.info("setNewIntrBkSttlmDt: Auto repaired setting new date in message = " + nextWorkingDate);
		setValueInPath(Document, path, nextWorkingDate);
		if(msgType == "pacs.003.001.08"){
			path = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/ReqdColltnDt';
			logger.info("setNewIntrBkSttlmDt: Auto repaired setting new ReqdColltnDt in message = " + nextWorkingDate);
			setValueInPath(Document, path, nextWorkingDate);
		}
		setCommentsForTransaction("00", "9011", map);
		setHeader(map, "PLCN_newPriorityDate", newPriorityDate);

		//var todaysDate = getDate();
        var todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

		//SSBTC-337
		/* if(releaseDateMsg == todaysDate) {
			setHeader(map, "PLCN_schedulingReq", "false");
		} */
		
		if(releaseDateMsg == todaysDate && startTimeFlag != "Y") {
			setHeader(map, "PLCN_schedulingReq", "false");
		}
	}

	/*if(parseInt(clrgIdOffsetDay) > 0) {
		return;
	}

	path = getValueDatePath(exchange);
	setValueInPath(Document, path, releaseDateMsg);
	setCommentsForTransaction("00", "9011", map);*/
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
	}
	logger.info("getValueDatePath: path = " + path);
	return path;	
}



function setCustom24(map, releaseDate, releaseTime) {
	var releaseDateTime;
	var todaysDate;
	var zero = "0";

	logger.info("In setCustom24");

	logger.info("setCustom24: releaseDate = " + releaseDate);
	logger.info("setCustom24: releaseTime = " + releaseTime);

	//todaysDate = getDate();
    todaysDate = getHeaderWithLogging(map, "PLCN_todaysDate");

	var releaseDateMsg = getHeaderWithLogging(map, "PLCN_releaseDateMsg");

    var clrgIdOffsetDay = getHeaderWithLogging(map, "PLCN_clrgIdOffsetDay");

    var orgnlPriorityDate = getHeaderWithLogging(map, "PLCN_orgnlPriorityDate");

    var startTimeFlag = getHeaderWithLogging(map, "PLCN_startTimeFlag");

    var txnComments = getHeaderWithLogging(map, 'PLCN_txnComments');

 	var schFlag = getHeaderWithLogging(map, "PLCN_schedulingReq");

	schFlag = schFlag.toString();
    
    var mode = 	getHeaderWithLogging(map, "PLCN_mode");

	
	//Akshay for testing
	var productCode = getHeaderWithLogging(map, "PLCN_productCode");
	
	var cutoffFlag = getHeaderWithLogging(map, "PLCN_cutoffFlag");
	
	var clStartTime = getHeaderWithLogging(map, "PLCN_clStartTime");
	if(clStartTime.length == 5) {
		clStartTime = zero.concat(clStartTime);
	}
	logger.info("setCustom24: clStartTime = " + clStartTime);
	
	//added by SP for SNTDBANK-173
	var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	
	var tenantName = getHeaderWithLogging(map, "PLCN_tenantName");
	
	if(!tenantName){
		var tenantNamePath = institutionId + ".INSTITUTION_DETAILS.TENANT_NAME";
		logger.info("setCustom24: tenantName = " + tenantNamePath);
		tenantName = memTblGetTableValue(map, "INST_PARAM",tenantNamePath);
		logger.info("setCustom24: tenantName = " + tenantName);
	}
	
	if(tenantName == "SNTDBK"){
		if(cutoffFlag == "N"){
				logger.info("setCustom24: inside product Code loop ");
				sendToHold = "";
				setHeader(map, "PLCN_sendToHold", sendToHold);
				setHeader(map, "PLCN_custom24", "");
				setHeader(map, "PLCNAPI_custom24", "");
				setHeader(map,"PLCN_schedulingReq", false);
				setHeader(map, "PLCN_schedulingCheckExit", true);
				setHeader(map, "PLCN_customSchedulingReq", true);
				return;
			}else{
				setHeader(map, "PLCN_customSchedulingReq", true);
				setHeader(map, "PLCN_schedulingEodReq", "Y");
				//var currDate = getDate();
                var currDate = getHeader(map, "PLCN_todaysDate");
				var custom24Date = getDateFromNumOfDays(currDate, "1");
				custom24Date = convertDateFormat(custom24Date, "CCYYMMDD", "MMDDCCYY");
				logger.info("setCustom24: custom24Date date format changed = " + custom24Date);
				custom24Date = ((((custom24Date.substr(0, 2)).concat("/")).concat((custom24Date.substr(2, 2)))).concat("/")).concat(custom24Date.substr(4, 4));
				logger.info("setCustom24: custom24Date after formatting = " + custom24Date);
				custom24Time = custom24Date.concat(" ", clStartTime);
				logger.info("setCustom24: custom24Time = " + custom24Time);
				setHeader(map, "PLCN_custom24", custom24Time);
				return;
		}
	}

   	var autoRepairFlag = getHeaderWithLogging(map, "PLCN_autoRepairFlag"); //memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_"+mode);
   	//logger.info("setCustom24: autoRepairFlag = " + autoRepairFlag);

	releaseTime = releaseTime.toString();
	logger.info("setCustom24: releaseTime.length = " + releaseTime.length);

	if(releaseTime.length == 5) {
		releaseTime = "0" + releaseTime;
	}

	logger.info("setCustom24: releaseTime.length = " + releaseTime.length);

	if(releaseTime.length == 6) {
		releaseTime = releaseTime.substring(0, 2) + ":" + releaseTime.substring(2, 4) + ":" + releaseTime.substring(4, 6);
	}

	logger.info("setCustom24: releaseTime = " + releaseTime);

	var msgFamily = getHeaderWithLogging(map, "PLCN_msgFamily");
	var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

	if(msgFamily == "SEPA"){
		if(institutionId == "SBOSUS33") {
			// Parse date parts
			var dateParts = releaseDate.split("/");
			var month     = parseInt(dateParts[0], 10) - 1; // months are 0-indexed in JS
			var day       = parseInt(dateParts[1], 10);
			var year      = parseInt(dateParts[2], 10);

			// Parse time parts
			var timeParts = releaseTime.split(":");
			var hour      = parseInt(timeParts[0], 10);
			var minute    = parseInt(timeParts[1], 10);
			var second    = parseInt(timeParts[2], 10);

			// Build a full UTC Date using provided CET date + time
			var cetDate = new Date(Date.UTC(year, month, day, hour, minute, second));			

			// Convert CET -> UTC -> EDT
			var cetOffset = getCETOffset(cetDate);
			var utcMs     = cetDate.getTime() - (cetOffset * 60000); // CET -> UTC
			var estOffset = getESTOffset(new Date(utcMs));
			var edtMs     = utcMs + (estOffset * 60000);             // UTC -> EDT
			var edtDate   = new Date(edtMs);

			//SSBTC-337
			// Fix: if the computed release instant has already elapsed (e.g. request
			// processed after today's configured start time has passed, or the
			// message's value date is backdated), roll the release date forward a
			// day at a time until it is in the future, so the message waits for the
			// next occurrence of the start-time window instead of releasing immediately.
			var nowMs = new Date().getTime();
			var rollGuard = 0;
			while (utcMs <= nowMs && rollGuard < 7) {
				day = day + 1;
				cetDate   = new Date(Date.UTC(year, month, day, hour, minute, second));
				utcMs     = cetDate.getTime() - (cetOffset * 60000);
				estOffset = getESTOffset(new Date(utcMs));
				edtMs     = utcMs + (estOffset * 60000);
				edtDate   = new Date(edtMs);
				rollGuard++;
			}
			if (rollGuard > 0) {
				releaseDate = pad(cetDate.getUTCMonth() + 1) + "/" + pad(cetDate.getUTCDate()) + "/" + cetDate.getUTCFullYear();
				logger.info("setCustom24: releaseDate rolled forward " + rollGuard + " day(s) to = " + releaseDate);
			}

			var edtTimeStr = pad(edtDate.getUTCHours()) + ":" + pad(edtDate.getUTCMinutes()) + ":" + pad(edtDate.getUTCSeconds());

			logger.info("setCustom24: CET date = " + releaseDate);
			logger.info("setCustom24: CET time = " + releaseTime);
			logger.info("setCustom24: CET offset = " + cetOffset + " mins (CEST if 120, CET if 60)");
			logger.info("setCustom24: EDT offset = " + estOffset + " mins (EDT if -240, EST if -300)");
			logger.info("setCustom24: EDT output = " + edtTimeStr);

			releaseTime = edtTimeStr;		
		}
	}		

	releaseDateTime = (releaseDate.concat(" ")).concat(releaseTime);
	logger.info("setCustom24: releaseDateTime = " + releaseDateTime);

	if(schFlag != "true") {
		return;
	}else if(autoRepairFlag == "YES") {
		setHeader(map, "PLCN_custom24", releaseDateTime);
	}
    
	if(releaseDateMsg <= todaysDate || orgnlPriorityDate <= todaysDate) {
		logger.info("setCustom24: In 1st if");
		if(parseInt(clrgIdOffsetDay) > 0 || releaseDateMsg < todaysDate) {

			if((releaseDateMsg == todaysDate || orgnlPriorityDate == todaysDate) && parseInt(clrgIdOffsetDay) > 0) {
				setCommentsForTransaction("00", "9506", map);
				setHeader(map, "PLCN_repairReq", "true");
				return;
			}else {
				setCommentsForTransaction("00", "9506", map);
				setHeader(map, "PLCN_repairReq", "true");
				return;
			}
		}else if(parseInt(clrgIdOffsetDay) == 0) {

			if(startTimeFlag != "Y" && (isPatternPresent(txnComments, "6011") || isPatternPresent(txnComments, "6012") || isPatternPresent(txnComments, "6013"))) {
				
				if(schFlag == "false" && releaseDateMsg == todaysDate) {
					return;
				}else {
					if(isPatternPresent(txnComments, "6012") && isPatternPresent(txnComments, "9500")) {
						if(isPatternPresent(txnComments, "6013")) {
							txnComments = removePattern(txnComments, ":A00:32-6013");
							setHeader(map, "PLCN_txnComments", txnComments);
						}
						setHeader(map, "PLCN_repairReq", "true");
						return;						
					}
					setCommentsForTransaction("00", "9506", map);
					setHeader(map, "PLCN_repairReq", "true");
					return;
				}
			}
		}
	}else if(orgnlPriorityDate - releaseDateMsg/* - todaysDate*/ == parseInt(clrgIdOffsetDay)) {
		logger.info("setCustom24: In 2nd if");		
		var clrgId = getHeaderWithLogging(map, "PLCN_clearingId");
		
		var holidayFlag = checkHoliday(clrgId, releaseDateMsg, map);
		logger.info("setCustom24: holidayFlag = " + holidayFlag);

		if(holidayFlag != 1) {
			var holidayActVaDate = checkHolidayInstrcn(clrgId, releaseDateMsg, map);
			logger.info("setCustom24: holidayActVaDate = " + holidayActVaDate);

			//var actualValDateCnvrt = convertDateFormat(todaysDate, "CCYYMMDD", "DDMMCCYY");
			var tmpDateW = convertDateFormat(releaseDateMsg, "CCYYMMDD", "MMDDCCYY");

			var actValDay = getWeekday(tmpDateW);
			logger.info("setCustom24: actValDay = " + actValDay);

			if(holidayActVaDate == 0) {
				if((actValDay == "Thursday" && getHeader(map, "PLCN_clThursday") == "Y") || (actValDay == "Friday" && getHeader(map, "PLCN_clFriday") == "Y") || (actValDay == "Saturday" && getHeader(map, "PLCN_clSaturday") == "Y") || (actValDay == "Sunday" && getHeader(map, "PLCN_clSunday") == "Y")) {
					setCommentsForTransaction("00", "9506", map);
					setHeader(map, "PLCN_repairReq", "true");
					logger.info("setCustom24: holiday");
					return;
				}else if(startTimeFlag != "Y" && isPatternPresent(txnComments, "6011") && releaseDateMsg == todaysDate) {
					setCommentsForTransaction("00", "9506", map);
					setHeader(map, "PLCN_repairReq", "true");
					logger.info("setCustom24: after cutoff time");
					return;
				}
			}
		}else if(holidayFlag == 1) {
			setCommentsForTransaction("00", "9506", map);
			setHeader(map, "PLCN_repairReq", "true");
			return;			
		}
	}else if(orgnlPriorityDate == releaseDateMsg && parseInt(clrgIdOffsetDay) > 0) {
		logger.info("setCustom24: In 3rd if");
		if(isPatternPresent(txnComments, "6011")) {
			setCommentsForTransaction("00", "9506", map);
			setHeader(map, "PLCN_repairReq", "true");
			//var newComments = removePattern(txnComments, ":A00:32-6011");
			//logger.info("setSchedulingHeader: newComments = " + newComments);
			//setHeader(map, "PLCN_txnComments", newComments);	
		}
	}

	logger.info("setCustom24: PLCN_custom24 = " + releaseDateTime);
	setHeader(map, "PLCN_custom24", releaseDateTime);
	setHeader(map, "PLCNAPI_custom24", releaseDateTime);		
}

function checkClgsysTime(time) {
	var firstChar;
	var hh;
	var mm;
	var ss;

	logger.info("checkClgsysTime: time = " + time);

	if(time.length == 5) {
		firstChar = time.substring(0, 1);
		logger.info("checkClgsysTime: hour = " + firstChar);

		if(firstChar == "0") {
			logger.info("checkClgsysTime: Invalid time, new time is 000000");
			return "000000";
		}

	}else if(time.length == 6) {
		hh = time.substring(0, 2);
		logger.info("checkClgsysTime: hh = " + hh);

		mm = time.substring(2, 4);
		logger.info("checkClgsysTime: mm = " + mm);

		ss = time.substring(4, 6);
		logger.info("checkClgsysTime: ss = " + ss);

		if(parseInt(hh) > 23 || parseInt(mm) > 59 || parseInt(ss) > 59)	{
			logger.info("checkClgsysTime: Invalid, time new time is 000000");
			return "000000";
		}
	}else {
		logger.info("checkClgsysTime: Invalid time, new time is 000000");
		return "000000";
	}

	return time;
}

function sepaProprietaryBulkingConfiguration1(exchange) {
	var startTime;
	var tempStartTime;
	var endTime;
	var messageTime;
	var custom24Time;
	var currDate;
	var custom24Date;
	var bulkingTime;
	var institutionid;
	var frequency;
	var hours;
	var minutes;
	var seconds;
	var clearingId;
	var clStartTime;
	var cutoffTime;
	var sepaFixedTime;
	var currentTime;
	var frequency1;
	var frequency2;
	var frequency3;
	var sepaBulking;
	var currTime;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	logger.info("In sepaProprietaryBulkingConfiguration1");
	
	institutionId = getHeaderWithLogging(map, "PLCN_institutionId");
	
    var msgFamily = getHeaderWithLogging(map, "PLCN_msgFamily");
	msgFamily = msgFamily.toUpperCase();
    logger.info("sepaProprietaryBulkingConfiguration1: msgFamily = " + msgFamily);
	
	clearingId = getHeaderWithLogging(map, "PLCN_clearingId");
    deriveClgsysTableValuesMx(clearingId, map); // Sid
	cutoffTime = getHeaderWithLogging(map, "PLCN_cutoffTime");


	
   	if(msgFamily == "CBPR"){
		logger.info("sepaProprietaryBulkingConfiguration1: inside CBPR msgfamily loop ");
		sepaBulking = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.CBPR_BULKING_CONFIG.FREQUENCY");
		sepaBulking = memTblGetTableValue(map, "INST_PARAM",  sepaBulking);
		clStartTime = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.CBPR_BULKING_CONFIG.DEFAULT_START_TIME");
		clStartTime = memTblGetTableValue(map, "INST_PARAM",  clStartTime);
		endTime = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.CBPR_BULKING_CONFIG.DEFAULT_END_TIME");
		endTime = memTblGetTableValue(map, "INST_PARAM",  endTime);
		cutoffTime = endTime;
		startTime = clStartTime;
		if(startTime.length == 5) {
			startTime = "0" + startTime;
		}
		logger.info("sepaProprietaryBulkingConfiguration1: clStartTime in loop = " + clStartTime);
		logger.info("sepaProprietaryBulkingConfiguration1: endTime in loop= " + endTime);
		logger.info("sepaProprietaryBulkingConfiguration1: clStartTime in loop = " + clStartTime);
		logger.info("sepaProprietaryBulkingConfiguration1: endTime in loop= " + endTime);
	}else{
		sepaBulking = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.SEPA_BULKING_CONFIG.BULKING_CHECK");	
		sepaBulking = memTblGetTableValue(map, "INST_PARAM",  sepaBulking);
		clStartTime = getHeader(map, "PLCN_clStartTime");
		endTime = cutoffTime;
	}
	logger.info("sepaProprietaryBulkingConfiguration1: sepaBulking = " + sepaBulking);	
	if(!sepaBulking){
		logger.info("sepaProprietaryBulkingConfiguration1: bulking configuration not found");
		//currDate = getDate();
        currDate = getHeaderWithLogging(map, "PLCN_todaysDate");
		setHeader(map, "PLCN_custom24DateManRel", currDate);
		custom24Date = convertDateFormat(currDate, "CCYYMMDD", "MMDDCCYY");
		custom24Date = ((((custom24Date.substr(0, 2)).concat("/")).concat((custom24Date.substr(2, 2)))).concat("/")).concat(custom24Date.substr(4, 4));
		logger.info("sepaProprietaryBulkingConfiguration1: custom24Date = " + custom24Date);	
		currTime = localTime();
		currTime = replacePattern(currTime, ":", "");
		currTime = replacePattern(currTime, ":", "");
		logger.info("sepaProprietaryBulkingConfiguration1: currTime = " + currTime);
		bulkingTime = custom24Date.concat(" ", currTime);
		logger.info("sepaProprietaryBulkingConfiguration1: bulkingTime = " + bulkingTime);
		setHeader(map, "PLCN_custom24", bulkingTime);
		return true;
	}
	
	sepaFixedTime = sepaBulking;
	logger.info("sepaProprietaryBulkingConfiguration1: sepaFixedTime = " + sepaFixedTime);
	
	messageTime = localTime();
	messageTime = replacePattern(messageTime, ":", "");
	messageTime = replacePattern(messageTime, ":", "");
	logger.info("sepaProprietaryBulkingConfiguration1: messageTime = " + messageTime);
	
	if(clearingId){
		startTime = clStartTime;
		if(startTime.length == 5) {
		startTime = "0" + startTime;
		}
	}
	tempStartTime = startTime;
	logger.info("sepaProprietaryBulkingConfiguration1: tempStartTime = " + tempStartTime);
	
	if(isPatternPresent(sepaFixedTime, "FIX"))
	{
		logger.info("sepaProprietaryBulkingConfiguration1: Inside FIX If condition");
		currentTime = localTime();
		currentTime = replacePattern(currentTime, ":", "");
		currentTime = replacePattern(currentTime, ":", "");
        //currentTime = "130000";
		logger.info("sepaProprietaryBulkingConfiguration1: currTime = " + currentTime);
		frequency1 = sepaFixedTime.substr(4, 6);
		frequency2 = sepaFixedTime.substr(11, 6);
		frequency3 = sepaFixedTime.substr(18, 6);
		frequency4 = sepaFixedTime.substr(25, 6);
        logger.info("sepaProprietaryBulkingConfiguration1: frequency1 = " + frequency1);
		logger.info("sepaProprietaryBulkingConfiguration1: frequency2 = " + frequency2);
		logger.info("sepaProprietaryBulkingConfiguration1: frequency3 = " + frequency3);
		
		if(currentTime >= frequency4){
			custom24Time = frequency1;
			//currDate = getDate();
            custom24Date = getHeaderWithLogging(map, "PLCN_todaysDate");
			
			custom24Date = getDateFromNumOfDays(custom24Date, "1");
		}
        else if(currentTime >= frequency3){
			custom24Time = frequency4;
			//currDate = getDate();
            custom24Date = getHeader(map, "PLCN_todaysDate");
		}
        else if(currentTime >= frequency2){
			custom24Time = frequency3;
			//custom24Date = getDate();
            custom24Date = getHeaderWithLogging(map, "PLCN_todaysDate");
		}
        else if(currentTime >= frequency1){
			custom24Time = frequency2;
			//custom24Date = getDate();
            custom24Date = getHeaderWithLogging(map, "PLCN_todaysDate");
		}
        else if(currentTime < frequency1){
			custom24Time = frequency1;
			//custom24Date = getDate();
            custom24Date = getHeaderWithLogging(map, "PLCN_todaysDate");
		}
		logger.info("sepaProprietaryBulkingConfiguration1: custom24Time = " + custom24Time);
		logger.info("sepaProprietaryBulkingConfiguration1: custom24Date = " + custom24Date);
		setHeader(map, "PLCN_custom24DateManRel", custom24Date);
		custom24Date = convertDateFormat(custom24Date, "CCYYMMDD", "MMDDCCYY");
		logger.info("sepaProprietaryBulkingConfiguration1: custom24Date MMDDCCYY = " + custom24Date);
		custom24Date = ((((custom24Date.substr(0, 2)).concat("/")).concat((custom24Date.substr(2, 2)))).concat("/")).concat(custom24Date.substr(4, 4));
		logger.info("sepaProprietaryBulkingConfiguration1: custom24Date = " + custom24Date);
		bulkingTime = custom24Date.concat(" ", custom24Time);
		setHeader(map, "PLCN_custom24", bulkingTime);
		logger.info("sepaProprietaryBulkingConfiguration1: PLCN_custom24 = " + bulkingTime);
		
	}else{
		logger.info("sepaProprietaryBulkingConfiguration1: Inside FIX Else condition");
		frequency = removePattern(sepaFixedTime, "FREQUENCY|");
		//frequency = "000500";
		logger.info("sepaProprietaryBulkingConfiguration1: FIX time frequency = " + frequency);
		messageTime = parseInt(messageTime);
		cutoffTime = parseInt(cutoffTime);
		tempStartTime = parseInt(tempStartTime);
		frequency = parseInt(frequency);
		
		if(messageTime > clStartTime){
			logger.info("sepaProprietaryBulkingConfiguration1: Inside 1 If loop");
			if(messageTime < cutoffTime){
				//logger.info("sepaProprietaryBulkingConfiguration1: Inside messageTime > clStartTime && messageTime < cutoffTime ");
				while(messageTime > tempStartTime){
					tempStartTime = parseInt(tempStartTime);
					tempStartTime = tempStartTime + frequency;
					//logger.info("sepaProprietaryBulkingConfiguration1:while tempStartTime = " + tempStartTime);
					tempStartTime = tempStartTime.toString();
					//logger.info("sepaProprietaryBulkingConfiguration1:while tempStartTime length = " + tempStartTime.length);
					if(tempStartTime.length == 5){
						//logger.info("sepaProprietaryBulkingConfiguration1: inside tempStartTime lenght is 5");
						tempStartTime = "0" + tempStartTime;
						//logger.info("sepaProprietaryBulkingConfiguration1:if tempStartTime = " + tempStartTime);
					}
					tempStartTime = tempStartTime.toString();
					hours = tempStartTime.substr(0, 2);
					minutes = tempStartTime.substr(2, 2);
					seconds = tempStartTime.substr(4, 2);
					//logger.info("sepaProprietaryBulkingConfiguration1: hours = " + hours);
					//logger.info("sepaProprietaryBulkingConfiguration1: minutes = " + minutes);
					//logger.info("sepaProprietaryBulkingConfiguration1: seconds = " + seconds);
					
					if(minutes > "59"){
						//logger.info("sepaProprietaryBulkingConfiguration1: minutes is greater than 59");
						minutes = "00";
						hours = parseInt(hours);
						hours = hours + 1;
						//logger.info("sepaProprietaryBulkingConfiguration1: hours+1 = " + hours);
						hours = hours.toString();
						if(hours.length == "1"){
							//logger.info("sepaProprietaryBulkingConfiguration1: hours length is equal to 1");
							hours = "0" + hours;
						}
					}
					logger.info("sepaProprietaryBulkingConfiguration1: hours after while loop= " + hours);
					logger.info("sepaProprietaryBulkingConfiguration1: minutes after while loop= " + minutes);
					logger.info("sepaProprietaryBulkingConfiguration1: seconds after while loop= " + seconds);
					
					hours = hours.toString();
					minutes = minutes.toString();
					seconds = seconds.toString();
					
					tempStartTime = hours + minutes + seconds;
					logger.info("sepaProprietaryBulkingConfiguration1: tempStartTime = " + tempStartTime);
					if(messageTime < tempStartTime){
						custom24Time = tempStartTime;
						//currDate = getDate();
                        currDate = getHeaderWithLogging(map, "PLCN_todaysDate");
						setHeader(map, "PLCN_custom24DateManRel", currDate);
						custom24Date = convertDateFormat(currDate, "CCYYMMDD", "MMDDCCYY");
						logger.info("sepaProprietaryBulkingConfiguration1: custom24Date = " + custom24Date);
						custom24Date = ((((custom24Date.substr(0, 2)).concat("/")).concat((custom24Date.substr(2, 2)))).concat("/")).concat(custom24Date.substr(4, 4));
						bulkingTime = custom24Date.concat(" ", custom24Time);
						setHeader(map, "PLCN_custom24", bulkingTime);
						logger.info("sepaProprietaryBulkingConfiguration1: PLCN_custom24 = " + bulkingTime);
						return;
					}
				}
			}else{
				logger.info("sepaProprietaryBulkingConfiguration1: messageTime > cutoffTime ");
				clStartTime = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.CBPR_BULKING_CONFIG.DEFAULT_START_TIME");
				clStartTime = memTblGetTableValue(map, "INST_PARAM",  clStartTime);
				logger.info("sepaProprietaryBulkingConfiguration1: clStartTime = " + clStartTime);
				if(clStartTime.length == 5) {
					clStartTime = "0" + clStartTime;
				}
				logger.info("sepaProprietaryBulkingConfiguration1: clStartTime after adding 0 = " + clStartTime);
				custom24Date = getHeader(map, "PLCN_todaysDate");
				logger.info("sepaProprietaryBulkingConfiguration1: custom24Date = " + custom24Date);
				custom24Date = getDateFromNumOfDays(custom24Date, "1");
				logger.info("sepaProprietaryBulkingConfiguration1: custom24Date + 1 = " + custom24Date);
				setHeader(map, "PLCN_custom24DateManRel", custom24Date);
				custom24Date = convertDateFormat(custom24Date, "CCYYMMDD", "MMDDCCYY");
				custom24Date = ((((custom24Date.substr(0, 2)).concat("/")).concat((custom24Date.substr(2, 2)))).concat("/")).concat(custom24Date.substr(4, 4));
				logger.info("sepaProprietaryBulkingConfiguration1: custom24Date formatted = " + custom24Date);
				bulkingTime = custom24Date.concat(" ", clStartTime);
				logger.info("sepaProprietaryBulkingConfiguration1: bulkingTime = " + bulkingTime);
				setHeader(map, "PLCN_custom24", bulkingTime);
			}
		}else{
			custom24Time = tempStartTime.toString();
            if(custom24Time.length == 5) {
                custom24Time = "0" + custom24Time;
            }
            logger.info("sepaProprietaryBulkingConfiguration1: custom24Time = " + custom24Time);
			//currDate = getDate();
			currDate = getHeader(map, "PLCN_todaysDate");
			logger.info("sepaProprietaryBulkingConfiguration1: currDate = " + currDate);
			setHeader(map, "PLCN_custom24DateManRel", currDate);
			custom24Date = convertDateFormat(currDate, "CCYYMMDD", "MMDDCCYY");
			logger.info("sepaProprietaryBulkingConfiguration1: custom24Date = " + custom24Date);
			custom24Date = ((((custom24Date.substr(0, 2)).concat("/")).concat((custom24Date.substr(2, 2)))).concat("/")).concat(custom24Date.substr(4, 4));
			bulkingTime = custom24Date.concat(" ", custom24Time);
			setHeader(map, "PLCN_custom24", bulkingTime);
			logger.info("sepaProprietaryBulkingConfiguration1: PLCN_custom24 = " + bulkingTime);
			return;
		}
	}
}

function sntdCustomSchedulingCheck(exchange)
{
	logger.info("In sntdCustomSchedulingCheck");
	var comments;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var sendToHold;
	var custom24Time;
	var zero = "0";
	//var currDate = getDate();
    var currDate = getHeader(map, "PLCN_todaysDate");
	var path;
	var nextWorkingDate;
	var valueDate;
	var custom24Date = getDateFromNumOfDays(currDate, "1");
	nextWorkingDate = custom24Date;
	var clStartTime = getHeader(map, "PLCN_clStartTime");
	if(clStartTime.length == 5) {
		clStartTime = zero.concat(clStartTime);
	}
	
	logger.info("sntdCustomSchedulingCheck: clStartTime = " + clStartTime);
	logger.info("sntdCustomSchedulingCheck: currDate = " + currDate);
	logger.info("sntdCustomSchedulingCheck: next date to current date = " + custom24Date);
	
	var valueDate = getHeader(map, "PLCN_priorityDate");
	logger.info("sntdCustomSchedulingCheck: valueDate = " + valueDate);
	
	custom24Date = convertDateFormat(custom24Date, "CCYYMMDD", "MMDDCCYY");
	logger.info("sntdCustomSchedulingCheck: custom24Date date format changed = " + custom24Date);
	custom24Date = ((((custom24Date.substr(0, 2)).concat("/")).concat((custom24Date.substr(2, 2)))).concat("/")).concat(custom24Date.substr(4, 4));
	logger.info("sntdCustomSchedulingCheck: custom24Date after formatting = " + custom24Date);
	custom24Time = custom24Date.concat(" ", clStartTime);
	logger.info("sntdCustomSchedulingCheck: custom24Time = " + custom24Time);
	setHeader(map, "PLCN_custom24", custom24Time);
	
	if(valueDate < currDate || valueDate == currDate){
		nextWorkingDate = nextWorkingDate.substring(0, 4) + "-" + nextWorkingDate.substring(4, 6) + "-"  + nextWorkingDate.substring(6, 8);
		path = getValueDatePath(exchange);
		logger.info("sntdCustomSchedulingCheck: new date in message = " + nextWorkingDate);
		logger.info("sntdCustomSchedulingCheck: path = " + path);
		setValueInPath(Document, path, nextWorkingDate);
	}
	
	var fld = "00"; 
	var vioCode1 = 6011;

	
	comments = setCommentsForTransaction(fld, vioCode1, map);
	setHeader(map, "PLCN_commentsForBlob6", comments);
	setHeader(map, "PLCN_comments", comments);
	sendToHold = "Y";
	setHeader(map, "PLCN_sendToHold", sendToHold);
	setHeader(map,"PLCN_schedulingReq", true);
	setHeader(map, "PLCN_schedulingCheckExit", true);
	
	return;
}

function sntdManualRelease(exchange) {
	
	logger.info("In sntdManualRelease");
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	var fld = "00";
	var vioCode2 = 6012;
	var path;
	var body;
	var currDate;
	var firstprioritydate;
	var priorityDate;
	var currency;
	var prevMsgDate;
	var clearingId;
	var currOffset;
	var nextCalenderDate;
	var orgnlmsgnmid;
	var orgnlmsgnmidPath;
	var custom24DateManRel;
	
	body = inMsg.getBody(java.lang.String.class);
	logger.info("sntdManualRelease: body = " + body);
	
	currDate = getDate();
	logger.info("sntdManualRelease: currDate = " + currDate);
	nextCalenderDate = getDateFromNumOfDays(currDate, "1");
    logger.info("sntdManualRelease: nextCalenderDate = " + nextCalenderDate);
	
	sepaProprietaryBulkingConfiguration1(exchange);
	custom24DateManRel = getHeader(map, "PLCN_custom24DateManRel");
	logger.info("sntdManualRelease: custom24DateManRel = " + custom24DateManRel);
	
	if(custom24DateManRel > currDate){
		logger.info("sntdManualRelease: custom24DateManRel > currDate");
		setHeader(map, "PLCN_schedulingReq", false);
		setHeader(map, "PLCN_schedulingCheckExit", false);
		return;
	}
	
	firstprioritydate = getHeader(map, "PLCNAPI_firstprioritydate");//message original date-CHECK
	logger.info("sntdManualRelease: firstprioritydate = " + firstprioritydate);
	
	if(firstprioritydate){
		logger.info("sntdManualRelease: formatting Firstprioritydate.");
		formattedFirstprioritydate = firstprioritydate.substring(0, 4) + "-" + firstprioritydate.substring(4, 6) + "-"  + firstprioritydate.substring(6, 8);
	}
	logger.info("sntdManualRelease: formatted Firstprioritydate = " + formattedFirstprioritydate);
	
	currency = getHeader(map, "PLCN_currency");
	logger.info("sntdManualRelease: currency = " + currency);

	var msgType = getHeader(map, "PLCN_msgType");
    logger.info("sntdManualRelease: msgType = " + msgType);
	
	path = getValueDatePath(exchange);
	logger.info("sntdManualRelease: path = " + path);
	priorityDate = getValueFromPath(Document, path);
	logger.info("sntdManualRelease: priorityDate = " + priorityDate);
	
	clearingId = getHeader(map, "PLCNAPI_clearingId");
	logger.info("sntdManualRelease: clearingId = " + clearingId);
	
	if(!clearingId){
		clearingId = drveNibcClySysDetails(map);
	}
	logger.info("sntdManualRelease: clearingId = " + clearingId);
	
	currOffset = getHeader(map, "PLCN_clrgIdOffsetDay");
	logger.info("sntdManualRelease: currOffset = " + currOffset);
	
	deriveClgsysTableValuesMx(clearingId, map);
	
	vdHolidayInstrcn(currency, currDate, fld, vioCode2, map);
	holidayFlag = getHeader(map, "PLCN_holidayFlag");
	logger.info("sntdManualRelease: holidayFlag = " + holidayFlag);

	path = getValueDatePath(exchange);
	logger.info("sntdManualRelease: path = " + path);
	
 	if(isPatternPresent(msgType, "PACS.004") || isPatternPresent(msgType, "pacs.004")){

		logger.info("sntdManualRelease:pacs004 loop ");
		orgnlmsgnmidPath = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
		orgnlmsgnmid = getValueFromPath(Document, orgnlmsgnmidPath);
		logger.info("sntdManualRelease: orgnlmsgnmid from path = " + orgnlmsgnmid);
 	}
	
	if( firstprioritydate == currDate){
		logger.info("sntdManualRelease: current date - released today");
		if(holidayFlag == "Y"){
			logger.info("sntdManualRelease: Today is a holiday");
		}else {
			logger.info("sntdManualRelease: Today not holiday");
			if(isPatternPresent(msgType, "pacs.008") || (isPatternPresent(msgType, "pacs.004") && isPatternPresent(orgnlmsgnmid, "pacs.008")) ){
				logger.info("sntdManualRelease: currentdate - releasedtoday - not holiday - pacs008");
				setValueInPath(Document, path, formattedFirstprioritydate);
				setHeader(map, "PLCN_priorityDate", firstprioritydate);	
				setHeader(map, "PLCN_newPriorityDate", firstprioritydate);
			}
			if(isPatternPresent(msgType, "pacs.003") || (isPatternPresent(msgType, "pacs.004") && isPatternPresent(orgnlmsgnmid, "pacs.003"))  ){
				logger.info("sntdManualRelease: currentdate - releasedtoday - not holiday - pacs003");
				priorityDate = drvNextValueDate(firstprioritydate, clearingId, currOffset, currency, fld, vioCode2, map);
				formattedpriorityDate = priorityDate.substring(0, 4) + "-" + priorityDate.substring(4, 6) + "-"  + priorityDate.substring(6, 8);
				setValueInPath(Document, path, formattedpriorityDate);
				setHeader(map, "PLCN_priorityDate", priorityDate);	
				setHeader(map, "PLCN_newPriorityDate", priorityDate);
			}
		}
	}else{
		logger.info("sntdManualRelease: future date - released today");
		if(firstprioritydate == nextCalenderDate){
			vdHolidayInstrcn(currency, nextCalenderDate, fld, vioCode2, map);
			holidayFlag = getHeader(map, "PLCN_holidayFlag");
			logger.info("sntdManualRelease: holidayFlag for tomorrow = " + holidayFlag);
			if(holidayFlag == "Y"){
				logger.info("sntdManualRelease: future date is holiday");
				if(isPatternPresent(msgType, "pacs.003") || (isPatternPresent(msgType, "pacs.004") && isPatternPresent(orgnlmsgnmid, "pacs.003"))  ){
					priorityDate = drvNextValueDate(firstprioritydate, clearingId, currOffset, currency, fld, vioCode2, map);
					formattedpriorityDate = priorityDate.substring(0, 4) + "-" + priorityDate.substring(4, 6) + "-"  + priorityDate.substring(6, 8);
					setValueInPath(Document, path, formattedpriorityDate);
					setHeader(map, "PLCN_priorityDate", priorityDate);	
					setHeader(map, "PLCN_newPriorityDate", priorityDate);	
				}
			}else {
				logger.info("sntdManualRelease: future date is not holiday");
				if(isPatternPresent(msgType, "pacs.003") || (isPatternPresent(msgType, "pacs.004") && isPatternPresent(orgnlmsgnmid, "pacs.003"))  ){
					setValueInPath(Document, path, formattedFirstprioritydate);
					setHeader(map, "PLCN_priorityDate", firstprioritydate);	
					setHeader(map, "PLCN_newPriorityDate", firstprioritydate);	
				}
			}
		}
	}
	
    var msgFamily = getHeaderWithLogging(map, "PLCN_msgFamily");
	msgFamily = msgFamily.toUpperCase();
    logger.info("sepaProprietaryBulkingConfiguration1: msgFamily = " + msgFamily);
    if((isPatternPresent(msgType, "pacs.008") || (isPatternPresent(msgType, "pacs.004") && isPatternPresent(orgnlmsgnmid, "pacs.008"))) && msgFamily == "SEPAINST" ){
        logger.info("sntdManualRelease: SEPAINST CT");
        logger.info("sntdManualRelease: not a holiday");
        var formattedCurrDate = currDate.substring(0, 4) + "-" + currDate.substring(4, 6) + "-"  + currDate.substring(6, 8);
        setValueInPath(Document, path, formattedCurrDate);
        setHeader(map, "PLCN_priorityDate", currDate);	
        setHeader(map, "PLCN_newPriorityDate", currDate);
        setHeader(map, "PLCN_dateEnriched", true);
    }
    var msgBody = inMsg.getBody(java.lang.String.class);
    logger.info("sntdManualRelease: body after replace = " + msgBody);
    
	setHeader(map, "PLCN_schedulingReq", false);
	setHeader(map, "PLCN_schedulingCheckExit", false);
	return true;
}

function getHeaderWithLogging(map, key) {
	var value;

	value = map.get(key);
	logger.trace("getHeader: key = " + key + " value = " + value);
	if(value === null) {
		key = replacePattern(key, "PLCN_", "PLCNAPI_");
		logger.trace("getHeader: key = " + key);
		value = map.get(key);
		logger.trace("getHeader: key = " + key + " value = " + value);
		//logger.trace("getHeader: value = " + value);

		if(value === null) {
			return "";
		}
	}
	logger.info("getHeader: key = " + key + " value = " + value);
	return value;
}

function getHeaderWithLogging2(map, headerName, fnName) {
    const headerValue = getHeader(map, "headerName") || null;     
    logger.info("getHeader: ${fnName}: ${headerName} = ${headerValue}");
	return headerValue;
}

function extractHzlData(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In extractHzlData");

	var institutionId = getHeaderWithLogging(map, "PLCN_institutionId");

    var mode = 	getHeaderWithLogging(map, "PLCN_mode");

	var preWrhsPath = institutionId.concat(".PROCESSING_STAGES.PRE_WAREHOUSE.PRODUCTS");
	logger.info("extractHzlData: preWrhsPath = " + preWrhsPath);
	var preWrhsCode = memTblGetTableValue(map, "INST_PARAM", preWrhsPath);
	logger.info("extractHzlData: preWrhsCode = " + preWrhsCode);
	setHeader(map, "PLCN_preWrhsCode", preWrhsCode);

   	var autoRepairFlag = memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_"+mode);
	setHeader(map, "PLCN_autoRepairFlag", autoRepairFlag);
   	logger.info("extractHzlData: autoRepairFlag = " + autoRepairFlag);

   	var authLevelKey = institutionId + "."+ "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL.STAGES.REPAIR" + "." + "STAGE_ACCESS_CONTROL";
    logger.info("extractHzlData: authLevelKey = " + authLevelKey);

	var authLevelValue = memTblGetTableValue(map, "INST_PARAM", authLevelKey);
    logger.info("extractHzlData: authLevelValue = " + authLevelValue);
    setHeader(map, "PLCN_authLevelValueStage", authLevelValue);

    var authLevelKey2 = institutionId + "."+ institutionId + "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL" + "." + "INSTITUTION_ACCESS_CONTROL";
    logger.info("extractHzlData: authLevelKey2 = " + authLevelKey2);

    var authLevelValueInst = memTblGetTableValue(map, "INST_PARAM", authLevelKey2);
    logger.info("extractHzlData: authLevelValueInst = " + authLevelValueInst); 
    setHeader(map, "PLCN_authLevelValueInst", authLevelValueInst);

	var schduleComponent = institutionId.concat(".MESSAGE_PROCESSING.FUNCTIONALITY.SCHDULE_COMPONENT.APPLY_COMPONENT");
	logger.info("extractHzlData: schduleComponent before memTblGetTableValue = " + schduleComponent);
	schduleComponent = memTblGetTableValue(map, "INST_PARAM", schduleComponent);
	logger.info("extractHzlData: schduleComponent = " + schduleComponent);
	setHeader(map, "PLCN_schduleComponent", schduleComponent);

	var authPath = institutionId.concat(".PROCESSING_STAGES.AUTHORIZE.PRODUCTS");
	logger.info("extractHzlData: authPath = " + authPath);
	authCode = memTblGetTableValue(map, "INST_PARAM", authPath);
	logger.info("extractHzlData: authCode = " + authCode);
	setHeader(map, "PLCN_authCode", authCode);

	var preWrhsPath = institutionId.concat(".PROCESSING_STAGES.PRE_WAREHOUSE.PRODUCTS");
	logger.info("extractHzlData: preWrhsPath = " + preWrhsPath);
	var preWrhsCode = memTblGetTableValue(map, "INST_PARAM", preWrhsPath);
	logger.info("extractHzlData: preWrhsCode = " + preWrhsCode);
	setHeader(map, "PLCN_preWrhsCode", preWrhsCode);

	var pastDateCheckNotApplicableChannel = memTblGetTableValue(map, "FLAG-TABLE", "PASTDATE_CHECK_NOTAPPLICABLE_CHANNEL");
	logger.info("extractHzlData: pastDateCheckNotApplicableChannel = " + pastDateCheckNotApplicableChannel);
	setHeader(map, "PLCN_pastDateCheckNotApplicableChannel", pastDateCheckNotApplicableChannel);

	var clrgIdCutoffFlag = memTblGetTableValue(map, "FLAG-TABLE", "CLRG_ID_CUTOFF_REQD");
	clrgIdCutoffFlag = clrgIdCutoffFlag.trim();
	logger.info("mainSchduleRouteMx: clrgIdCutoffFlag from FLAG-TABLE = " + clrgIdCutoffFlag);
	setHeader(map, "PLCN_clrgIdCutoffFlag", clrgIdCutoffFlag);

	var lclCurr = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.LOCAL_CURRENCY"); // PLCNUSNY.PAYMT_SWIFT.GEN_PARAMS.LOCAL_CURRENCY
	lclCurr = memTblGetTableValue(map, "INST_PARAM", lclCurr);
	logger.info("ddCurrCheckInstrctn: lclCurr = " + lclCurr);
	setHeader(map, "PLCN_lclCurr", lclCurr);

	var instCntryCode =  institutionId + ".PAYMT_SWIFT.GEN_PARAMS.INSTITUTION_DETAILS.LOCAL_COUNTRY_CODE";     
	instCntryCode = memTblGetTableValue(map, "INST_PARAM", instCntryCode);
	logger.info("ddCstmrNoncstmrInstrcn: instCntryCode = " + instCntryCode);
	setHeader(map, "PLCN_instCntryCode", instCntryCode);

	var msgScheme = memTblGetTableValue(map, "StreamTable", "MSG_SCHEME");
	setHeader(map, "PLCN_msgScheme", msgScheme);

	var lclObNonCustmrLclPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-LOCAL-CURRENCY.CLEARING-ID.OUTBOUND.LOCAL_PAY");
	lclObNonCustmrLclPay = memTblGetTableValue(map, "INST_PARAM", lclObNonCustmrLclPay);
	setHeader(map, "PLCN_lclObNonCustmrLclPay", lclObNonCustmrLclPay);

	var lclObNonCustmrOthPay = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-LOCAL-CURRENCY.CLEARING-ID.OUTBOUND.OTHER_PAY");
	lclObNonCustmrOthPay = memTblGetTableValue(map, "INST_PARAM", lclObNonCustmrOthPay);
	setHeader(map, "PLCN_lclObNonCustmrOthPay", lclObNonCustmrOthPay);

	var currBsdClrgIdLookupOb = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-FOREIGN-CURRENCY.CLEARING-ID.OUTBOUND.CURRENCY_BASED_CLEARING_ID_LOOKUP");
	currBsdClrgIdLookupOb = memTblGetTableValue(map, "INST_PARAM", currBsdClrgIdLookupOb);
	setHeader(map, "PLCN_currBsdClrgIdLookupOb", currBsdClrgIdLookupOb);

	var fcyObNonCurrBsdDefClrgId = institutionId.concat(".PAYMT_SWIFT.GEN_PARAMS.FUNCTIONALITY.VALUE-DATE-CHECK.FOR-FOREIGN-CURRENCY.CLEARING-ID.OUTBOUND.NON_CURRENCY_BASED_DEFAULT-CLEARING-ID");
	fcyObNonCurrBsdDefClrgId = memTblGetTableValue(map, "INST_PARAM", fcyObNonCurrBsdDefClrgId);
	setHeader(map, "PLCN_fcyObNonCurrBsdDefClrgId", fcyObNonCurrBsdDefClrgId);

	var parentInstitutionId = memTblGetTableValue(map, "INST_HIERARCHY", institutionId);
	logger.info("checkHoliday: parent parentInstitutionId = " + parentInstitutionId);
	setHeader(map, "PLCN_parentInstitutionId", parentInstitutionId);

	var grandparentInstitutionId = memTblGetTableValue(map, "INST_HIERARCHY", parentInstitutionId);
	logger.info("checkHoliday: grandparent grandparentInstitutionId = " + grandparentInstitutionId);
	setHeader(map, "PLCN_grandparentInstitutionId", grandparentInstitutionId);

	var avmValue = memTblGetTableValue(map, "USER_CONFIG_MAP", "AUTOREPAIR_VALUEDATE_MQ");
	logger.info("sendToReprNibc1: avmValue = " + avmValue);
	setHeader(map, "PLCN_avmValue", avmValue);
}

// Determine if CET is in DST (CEST = UTC+2) or not (CET = UTC+1)
function getCETOffset(date) {
	logger.info("In getCETOffset");	
	logger.info("getCETOffset: date = " + date);		
	var year = date.getUTCFullYear();

	// DST starts: last Sunday of March at 01:00 UTC
	var dstStart = new Date(Date.UTC(year, 2, 31)); // March 31
	dstStart.setUTCDate(31 - dstStart.getUTCDay()); // roll back to last Sunday
	dstStart.setUTCHours(1, 0, 0, 0);

	// DST ends: last Sunday of October at 01:00 UTC
	var dstEnd = new Date(Date.UTC(year, 9, 31)); // October 31
	dstEnd.setUTCDate(31 - dstEnd.getUTCDay()); // roll back to last Sunday
	dstEnd.setUTCHours(1, 0, 0, 0);

	var isCEST = date.getTime() >= dstStart.getTime() && date.getTime() < dstEnd.getTime();
	return isCEST ? 2 * 60 : 1 * 60; // CEST = UTC+2, CET = UTC+1
}

// Determine EDT or EST offset
function getESTOffset(date) {
	logger.info("In getESTOffset");
	logger.info("getESTOffset: date = " + date);	
	var year = date.getUTCFullYear();

	var dstStart = new Date(Date.UTC(year, 2, 1));
	dstStart.setUTCDate(1 + (7 - dstStart.getUTCDay()) % 7 + 7);
	dstStart.setUTCHours(7, 0, 0, 0);

	var dstEnd = new Date(Date.UTC(year, 10, 1));
	dstEnd.setUTCDate(1 + (7 - dstEnd.getUTCDay()) % 7);
	dstEnd.setUTCHours(6, 0, 0, 0);

	var isEDT = date.getTime() >= dstStart.getTime() && date.getTime() < dstEnd.getTime();
	return isEDT ? -4 * 60 : -5 * 60;
}

// Format output as HH:MM:SS
function pad(n) { return n < 10 ? "0" + n : "" + n; }