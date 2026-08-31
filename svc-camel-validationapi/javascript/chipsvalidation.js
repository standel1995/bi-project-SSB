function msgValidationChipsPacs009(exchange) {

	var result;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.trace("In msgValidationChipsPacs009");

	setHeader(map, "txnForceStopCounter", 0);
	setHeader(map, "errorCountAdd", "Y"); //for testing
	logger.trace("errorCountAdd: " + getHeader(map,"errorCountAdd"));
	setHeader(map,"PLCN_validMessage", true);
	setHeader(map, "validFlag", true);

	wrapperChipsPacs009Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationChipsPacs009: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "repair");
	}
}

function wrapperChipsPacs009Mx(exchange) {
	var retVal = 0;
	var pacs09ValdFlag;
	var txnComments;

	logger.trace('wrapperChipsPacs009Mx:In wrapperChipsPacs009Mx');
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	pacs09ValdFlag = memTblGetTableValue(map, "FLAG-TABLE", "PACS09_VALD_FLAG_MX");
	logger.trace("wrapperChipsPacs009Mx: pacs09ValdFlag = " + pacs09ValdFlag);

	if(pacs09ValdFlag == "ERROR") {
		logger.trace("In error loop");
		retVal = chipsValidationRulesPacs009(pacs09ValdFlag, exchange);
		logger.trace("wrapperChipsPacs009Mx: chipsValidationRulesPacs009 = " + retVal);
		  if(retVal == 0) {
			logger.trace("wrapperChipsPacs009Mx: Calling externalCodelistValidation");
			retVal = externalCodelistValidationCbprPacs009(Document, map);		
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.trace("txnComments from externalCodelistValidation = " + txnComments);			
		} 
		logger.trace("wrapperChipsPacs009Mx: before ibanValidationCbprPacs009 = " + retVal);
		if(retVal == 0) {				//copy of CBPR IBAN RULES
			logger.trace("wrapperChipsPacs009Mx: Calling ibanValidationChipsPacs009");
			retVal = ibanValidationCbprPacs009(exchange);
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.trace("wrapperChipsPacs009Mx: txnComments from ibanValidationCbprPacs009 = " + txnComments);
		}

		if(retVal == 0) {	
			logger.trace("wrapperChipsPacs009Mx: Calling ibanValidationChipsPacs009");
			retVal = ibanValidationChipsPacs009(Document, map);
			logger.trace("wrapperChipsPacs009Mx: out of  ibanValidationChipsPacs009 retVal = " + retVal);
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.trace("wrapperChipsPacs009Mx: txnComments from ibanValidationChipsPacs009 = " + txnComments);
		}
		logger.trace("out of error loop");
	}

	if(pacs09ValdFlag == "WARNING") {
		logger.trace("In WARNING loop");
		retVal = chipsValidationRulesPacs009(pacs09ValdFlag, exchange);
		retVal = externalCodelistValidationCbprPacs009(Document, map);
		retVal = ibanValidationCbprPacs009(Document, map);
		retVal = ibanValidationChipsPacs009(Document, map);
	}
	logger.trace('wrapperChipsPacs009Mx:Out wrapperChipsPacs009Mx');
}

function chipsValidationRulesPacs009(pacs09ValdFlag, exchange){
	logger.trace("chipsValidationRulesPacs009");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	retVal = 0;

	if(pacs09ValdFlag == "ERROR") {
		logger.trace("inside if loop");

		retVal = townNameAndCountryRulePacs009(exchange);	//same as cbprpacs009
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = townNameAndCountryRuleChipsPacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}

        // commented out for hybrid PstlAdr
		/*
        retVal = structuredvsUnstructuredRulePacs009(exchange);	//same as cbprpacs009
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = structuredvsUnstructuredRuleChipsPacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}
        */
		
		retVal = chipsPartyNamePstlAdrRulePacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = chipsPartiesRulePacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = chipsnameAnyBICRulePacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = chipsAgentsRulePacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}
		retVal = crossElementComplexRulePacs009(pacs09ValdFlag,Document, map);
		if(retVal != 0) {
			return retVal;
		}
        
        retVal = gracePeriodHybridFormalRuleChipsPacs9(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = gracePeriodUnstructuredFormalRuleChipsPacs9(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = chipsAgentNamePstlAdrRulePacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = instructingAgent1RuleChipsPacs009(exchange);
		if(retVal != 0) {
			return retVal;
		}
	}
	return retVal;
}

function townNameAndCountryRuleChipsPacs009(exchange) {  
	logger.trace("inside townNameAndCountryRuleChipsPacs009");
	var retVal = 0;
	var cdtrAgtPstlAdrPath;
	var cdtrAgtPstlAdr;
	var cdtrAgtAddrLinePath;
	var cdtrAgtAddrLine;
	var cdtrAgtTwnNmPath;
	var cdtrAgtTwnNm;
	var cdtrAgtCtryPath;
	var cdtrAgtCtry;
	var dbtrAgtAddrPath;
	var dbtrAgtAddr;
	var dbtrAgtPstlAdrPath;
	var dbtrAgtPstlAdr;
	var dbtrAgtTwnNmPath;
	var dbtrAgtTwnNm;
	var dbtrAgtCtryPath;
	var dbtrAgtCtry;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
    
    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        var Document2 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
        Document2 = "<UndrlygCstmrCdtTrf>".concat(Document2).concat("</UndrlygCstmrCdtTrf>");
    } else {
        return retVal;
    }

	//UndrlygCstmrCdtTrf CreditorAgent	
	//cdtrAgtPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr';
	//cdtrAgtPstlAdr = getValueFromPath(Document, cdtrAgtPstlAdrPath);
    cdtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");

	cdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);

	cdtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	cdtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);
	
    //UndrlygCstmrCdtTrf DebtorAgent
	//dbtrAgtPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr';
	//dbtrAgtPstlAdr = getValueFromPath(Document, dbtrAgtPstlAdrPath);
    dbtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");

	dbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

	dbtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	dbtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	//UndrlygCstmrCdtTrf CREDITOR
	//var cdtrPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/FinInstnId/PstlAdr';
	//var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);
    cdtrPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");

	var cdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

	var cdtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

	var cdtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

	//UndrlygCstmrCdtTrf DEBTOR
	//var dbtrPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/FinInstnId/PstlAdr';
	//var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);
	var dbtrPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");

	var dbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

	var dbtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

	var dbtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

	//UndrlygCstmrCdtTrf IntermediaryAgent1
	//var intrmyAgt1PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr';
	//var intrmyAgt1PstlAdr =  getValueFromPath(Document, intrmyAgt1PstlAdrPath);
	var intrmyAgt1PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");

	var intrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	//UndrlygCstmrCdtTrf IntermediaryAgent2
	//var intrmyAgt2PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr';
	//var intrmyAgt2PstlAdr =  getValueFromPath(Document, intrmyAgt2PstlAdrPath);
	var intrmyAgt2PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");

	var intrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	//UndrlygCstmrCdtTrf IntermediaryAgent3
	//var intrmyAgt3PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr';
	//var intrmyAgt3PstlAdr =  getValueFromPath(Document, intrmyAgt3PstlAdrPath);
	var intrmyAgt3PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");

	var intrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	//UndrlygCstmrCdtTrf PreviousInstructingAgent1
	//var prvsInstgAgt1PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr';
	//var prvsInstgAgt1PstlAdr =  getValueFromPath(Document, prvsInstgAgt1PstlAdrPath);
	var prvsInstgAgt1PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");

	var prvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	//UndrlygCstmrCdtTrf PreviousInstructingAgent2
	//var prvsInstgAgt2PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr';
	//var prvsInstgAgt2PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);
	var prvsInstgAgt2PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");

	var prvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	//UndrlygCstmrCdtTrf PreviousInstructingAgent3
	//var prvsInstgAgt3PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr';
	//var prvsInstgAgt3PstlAdr =  getValueFromPath(Document, prvsInstgAgt3PstlAdrPath);
	var prvsInstgAgt3PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");

	var prvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

	if(isPatternPresent(Document2, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(!cdtrAgtAddrLine && (!cdtrAgtTwnNm || !cdtrAgtCtry)) {
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("CdtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document2, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(!dbtrAgtAddrLine && (!dbtrAgtTwnNm || !dbtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("DbtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document2, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(!cdtrAddrLine && (!cdtrTwnNm || !cdtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("cdtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}
	}


	if(isPatternPresent(Document2, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(!dbtrAddrLine && (!dbtrTwnNm || !dbtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("dbtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}

	}

	if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(!prvsInstgAgt3AddrLine && (!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("PrvsInstgAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}	
	}

	if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
			if(prvsInstgAgt2PstlAdr){
		if(!prvsInstgAgt2AddrLine && (!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry)){
			setHeader(map,"PLCN_validMessage", false);
			logger.trace("PrvsInstgAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
			retVal = setCommentsForTransaction("720", "7926", map);
			return retVal;
			}
		}
	}

	if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(!prvsInstgAgt1AddrLine && (!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("PrvsInstgAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}
	}
    
	if(isPatternPresent(Document2, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(!intrmyAgt3AddrLine && (!intrmyAgt3TwnNm || !intrmyAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document2, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(!intrmyAgt2AddrLine && (!intrmyAgt2TwnNm || !intrmyAgt2Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document2, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(!intrmyAgt1AddrLine && (!intrmyAgt1TwnNm || !intrmyAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("720", "7926", map);
				return retVal;
			}
		}
	}
    
	return retVal;
}

function structuredvsUnstructuredRuleChipsPacs009(exchange) { 
	logger.trace("In structuredvsUnstructuredRuleChipsPacs009");
	var cdtrAgtPstlAdrPath;
	var cdtrAgtPstlAdr;
	var cdtrAgtAddrLinePath;
	var cdtrAgtAddrLine;
	var cdtrAgtTwnNmPath;
	var cdtrAgtTwnNm;
	var cdtrAgtCtryPath;
	var cdtrAgtCtry;
	var dbtrAgtAddrPath;
	var dbtrAgtAddr;
	var dbtrAgtPstlAdrPath;
	var dbtrAgtPstlAdr;
	var dbtrAgtTwnNmPath;
	var dbtrAgtTwnNm;
	var dbtrAgtCtryPath;
	var dbtrAgtCtry;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	//CreditorAgent
	cdtrAgtPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtPstlAdr = getValueFromPath(Document, cdtrAgtPstlAdrPath);

	cdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
	logger.trace("cdtrAgtAddrLine:" + cdtrAgtAddrLine);

	cdtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	cdtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(cdtrAgtAddrLine && (cdtrAgtTwnNm || cdtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//DebtorAgent
	dbtrAgtPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtPstlAdr = getValueFromPath(Document, dbtrAgtPstlAdrPath);

	dbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

	dbtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	dbtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(dbtrAgtAddrLine && (dbtrAgtTwnNm || dbtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//CREDITOR
	var cdtrPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/FinInstnId/PstlAdr/AdrLine';
	var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);
	logger.trace("cdtrPstlAdr:" + cdtrPstlAdr);

	var cdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/FinInstnId/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
	logger.trace("cdtrAddrLine:" + cdtrAddrLine);

	var cdtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/FinInstnId/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);
	logger.trace("cdtrTwnNm:" + cdtrTwnNm);

	var cdtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/FinInstnId/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);
	logger.trace("cdtrCtry:" + cdtrCtry);

	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(cdtrAddrLine && (cdtrTwnNm || cdtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("cdtr-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//DEBTOR
	var dbtrPstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/FinInstnId/PstlAdr/AdrLine';
	var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);

	var dbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/FinInstnId/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

	var dbtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/FinInstnId/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

	var dbtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/FinInstnId/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(dbtrAddrLine && (dbtrTwnNm || dbtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("dbtr-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}

	}

	//IntermediaryAgent1
	var intrmyAgt1PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1PstlAdr =  getValueFromPath(Document, intrmyAgt1PstlAdrPath);

	var intrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(intrmyAgt1AddrLine && (intrmyAgt1TwnNm || intrmyAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt1-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//IntermediaryAgent2
	var intrmyAgt2PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2PstlAdr =  getValueFromPath(Document, intrmyAgt2PstlAdrPath);

	var intrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(intrmyAgt2AddrLine && (intrmyAgt2TwnNm || intrmyAgt2Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt2-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//IntermediaryAgent3
	var intrmyAgt3PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3PstlAdr =  getValueFromPath(Document, intrmyAgt3PstlAdrPath);

	var intrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(intrmyAgt3AddrLine && (intrmyAgt3TwnNm || intrmyAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt3-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1PstlAdr =  getValueFromPath(Document, prvsInstgAgt1PstlAdrPath);

	var prvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(prvsInstgAgt1AddrLine && (prvsInstgAgt1TwnNm || prvsInstgAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("PrvsInstgAgt1-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);

	var prvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
		if(prvsInstgAgt2PstlAdr){
			if(prvsInstgAgt2AddrLine && (prvsInstgAgt2TwnNm || prvsInstgAgt2Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("PrvsInstgAgt2-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3PstlAdr =  getValueFromPath(Document, prvsInstgAgt3PstlAdrPath);

	var prvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(prvsInstgAgt3AddrLine && (prvsInstgAgt3TwnNm || prvsInstgAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("PrvsInstgAgt3-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	return retVal;

}

function chipsPartyNamePstlAdrRulePacs009(exchange) { 
	logger.info("in chipsPartyNamePstlAdrRulePacs009");	
	
    var retVal= 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        var Document2 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
        Document2 = "<UndrlygCstmrCdtTrf>".concat(Document2).concat("</UndrlygCstmrCdtTrf>");
        
        // Underlying Ultimate Debtor
        var undrlygUltmtDbtrPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "UltmtDbtr", "<PstlAdr>");
        var undrlygUltmtDbtrNm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "UltmtDbtr", "<Nm>");
        
        if(isPatternPresent(Document2, "<UltmtDbtr>")){
            if(undrlygUltmtDbtrPstlAdr && !undrlygUltmtDbtrNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("720", "7950", map);
                return retVal;
            }
        }
        
        // Underlying Ultimate Creditor
        var undrlygUltmtCdtrPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "UltmtCdtr", "<PstlAdr>");
        var undrlygUltmtCdtrNm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "UltmtCdtr", "<Nm>");
        
        if(isPatternPresent(Document2, "<UltmtCdtr>")){
            if(undrlygUltmtCdtrPstlAdr && !undrlygUltmtCdtrNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("720", "7950", map);
                return retVal;
            }
        }
        
        // Underlying Initiating Party
        var undrlygUltmtInitgPtyPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "InitgPty", "<PstlAdr>");
        var undrlygUltmtInitgPtyNm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "InitgPty", "<Nm>");
        
        if(isPatternPresent(Document2, "<InitgPty>")){
            if(undrlygUltmtInitgPtyPstlAdr && !undrlygUltmtInitgPtyNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("720", "7950", map);
                return retVal;
            }
        }
        
    }
     
    return retVal;
}

function chipsAgentNamePstlAdrRulePacs009(exchange) { 
	logger.info("in chipsAgentNamePstlAdrRulePacs009");	
	
    var retVal= 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        var Document2 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
        Document2 = "<UndrlygCstmrCdtTrf>".concat(Document2).concat("</UndrlygCstmrCdtTrf>");
    }

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
    
        // Underlying Creditor
        var undrlygCdtrPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");
        var undrlygCdtrNm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Cdtr", "<Nm>");

        if(isPatternPresent(Document2, "<Cdtr>")){
            if( (undrlygCdtrPstlAdr && !undrlygCdtrNm) || (undrlygCdtrNm && !undrlygCdtrPstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Underlying Debtor
        var undrlygDbtrPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");
        var undrlygDbtrNm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Dbtr", "<Nm>");

        if(isPatternPresent(Document2, "<Dbtr>")){
            if( (undrlygDbtrPstlAdr && !undrlygDbtrNm) || (undrlygDbtrNm && !undrlygDbtrPstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
    
        // Underlying Creditor Agent
        var undrlygCdtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");
        var undrlygCdtrAgtNm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "CdtrAgt", "<Nm>");
        
        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if( (undrlygCdtrAgtPstlAdr && !undrlygCdtrAgtNm) || (undrlygCdtrAgtNm && !undrlygCdtrAgtPstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Underlying Debtor Agent
        var undrlygDbtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");
        var undrlygDbtrAgtNm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "DbtrAgt", "<Nm>");
        
        if(isPatternPresent(Document2, "<DbtrAgt>")){
            if( (undrlygDbtrAgtPstlAdr && !undrlygDbtrAgtNm) || (undrlygDbtrAgtNm && !undrlygDbtrAgtPstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Intermediary Agent 1
        var undrlygIntrmyAgt1PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");
        var undrlygIntrmyAgt1Nm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<Nm>");        
        
        if(isPatternPresent(Document2, "<IntrmyAgt1>")){
            if( (undrlygIntrmyAgt1PstlAdr && !undrlygIntrmyAgt1Nm) || (undrlygIntrmyAgt1Nm && !undrlygIntrmyAgt1PstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Intermediary Agent 2
        var undrlygIntrmyAgt2PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");
        var undrlygIntrmyAgt2Nm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<Nm>");

        if(isPatternPresent(Document2, "<IntrmyAgt2>")){
            if( (undrlygIntrmyAgt2PstlAdr && !undrlygIntrmyAgt2Nm) || (undrlygIntrmyAgt2Nm && !undrlygIntrmyAgt2PstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Intermediary Agent 3
        var undrlygIntrmyAgt3PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");
        var undrlygIntrmyAgt3Nm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<Nm>");

        if(isPatternPresent(Document2, "<IntrmyAgt3>")){
            if( (undrlygIntrmyAgt3PstlAdr && !undrlygIntrmyAgt3Nm) || (undrlygIntrmyAgt3Nm && !undrlygIntrmyAgt3PstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Previous Instructing Agent 1
        var undrlygPrvsInstgAgt1PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");
        var undrlygPrvsInstgAgt1Nm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<Nm>");

        if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
            if( (undrlygPrvsInstgAgt1PstlAdr && !undrlygPrvsInstgAgt1Nm) || (undrlygPrvsInstgAgt1Nm && !undrlygPrvsInstgAgt1PstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Previous Instructing Agent 2
        var undrlygPrvsInstgAgt2PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");
        var undrlygPrvsInstgAgt2Nm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<Nm>");

        if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
            if( (undrlygPrvsInstgAgt2PstlAdr && !undrlygPrvsInstgAgt2Nm) || (undrlygPrvsInstgAgt2Nm && !undrlygPrvsInstgAgt2PstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
        // Previous Instructing Agent 3
        var undrlygPrvsInstgAgt3PstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");
        var undrlygPrvsInstgAgt3Nm = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<Nm>");

        if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
            if( (undrlygPrvsInstgAgt3PstlAdr && !undrlygPrvsInstgAgt3Nm) || (undrlygPrvsInstgAgt3Nm && !undrlygPrvsInstgAgt3PstlAdr)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("720", "7948", map);
                return retVal;
            }
        }
        
    }
    
	// Creditor
	var cdtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<PstlAdr>");
    var cdtrNm = isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<Nm>");

	if(isPatternPresent(Document1, "<Cdtr>")){
		if( (cdtrPstlAdr && !cdtrNm) || (cdtrNm && !cdtrPstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("658", "7948", map);
            return retVal;
		}
	}
    
    // Debtor
	var dbtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<PstlAdr>");
    var dbtrNm = isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<Nm>");

	if(isPatternPresent(Document1, "<Dbtr>")){
		if( (dbtrPstlAdr && !dbtrNm) || (dbtrNm && !dbtrPstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("610", "7948", map);
            return retVal;
		}
	}
    
	// Creditor Agent
	var cdtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<PstlAdr>");
    var cdtrAgtNm = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<Nm>");

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if( (cdtrAgtPstlAdr && !cdtrAgtNm) || (cdtrAgtNm && !cdtrAgtPstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("514", "7948", map);
            return retVal;
		}
	}
    
    // Debtor Agent
	var dbtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<PstlAdr>");
    var dbtrAgtNm = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<Nm>");

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if( (dbtrAgtPstlAdr && !dbtrAgtNm) || (dbtrAgtNm && !dbtrAgtPstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("562", "7948", map);
            return retVal;
		}
	}
    
    // Intermediary Agent 1
	var intrmyAgt1PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<PstlAdr>");
    var intrmyAgt1Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<Nm>");

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if( (intrmyAgt1PstlAdr && !intrmyAgt1Nm) || (intrmyAgt1Nm && !intrmyAgt1PstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("369", "7948", map);
            return retVal;
		}
	}
    
    // Intermediary Agent 2
	var intrmyAgt2PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<PstlAdr>");
    var intrmyAgt2Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<Nm>");

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if( (intrmyAgt2PstlAdr && !intrmyAgt2Nm) || (intrmyAgt2Nm && !intrmyAgt2PstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("417", "7948", map);
            return retVal;
		}
	}
    
    // Intermediary Agent 3
	var intrmyAgt3PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<PstlAdr>");
    var intrmyAgt3Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<Nm>");

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if( (intrmyAgt3PstlAdr && !intrmyAgt3Nm) || (intrmyAgt3Nm && !intrmyAgt3PstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("465", "7948", map);
            return retVal;
		}
	}
    
    // Previous Instructing Agent 1
	var prvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");
    var prvsInstgAgt1Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<Nm>");

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if( (prvsInstgAgt1PstlAdr && !prvsInstgAgt1Nm) || (prvsInstgAgt1Nm && !prvsInstgAgt1PstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("199", "7948", map);
            return retVal;
		}
	}
    
    // Previous Instructing Agent 2
	var prvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<PstlAdr>");
    var prvsInstgAgt2Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<Nm>");

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
		if( (prvsInstgAgt2PstlAdr && !prvsInstgAgt2Nm) || (prvsInstgAgt2Nm && !prvsInstgAgt2PstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("247", "7948", map);
            return retVal;
		}
	}
    
    // Previous Instructing Agent 3
	var prvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<PstlAdr>");
    var prvsInstgAgt3Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<Nm>");

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if( (prvsInstgAgt3PstlAdr && !prvsInstgAgt3Nm) || (prvsInstgAgt3Nm && !prvsInstgAgt3PstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("295", "7948", map);
            return retVal;
		}
	}
    
    return retVal;
}

function chipsPartiesRulePacs009(exchange) { 
	logger.trace("in chipsPartiesRulePacs009");
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	var retVal= 0;
	
	var ultmtDbtrBicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/Id/OrgId/AnyBIC';
	var ultmtDbtrBic = getValueFromPath(Document, ultmtDbtrBicpath);
	logger.trace("ultmtDbtrBic:" + ultmtDbtrBic);
	
	var ultmtDbtrNamepath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/Nm';
	var ultmtDbtrName = getValueFromPath(Document, ultmtDbtrNamepath);
	logger.trace("ultmtDbtrName:" + ultmtDbtrName);
	
	var ultmtDbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/PstlAdr/AdrLine';
	var ultmtDbtrAddrLine = getValueFromPath(Document, ultmtDbtrAddrLinePath);
	logger.trace("ultmtDbtrAddrLine:" + ultmtDbtrAddrLine);

	var ultmtDbtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/PstlAdr/TwnNm';
	var ultmtDbtrTwnNm = getValueFromPath(Document, ultmtDbtrTwnNmPath);
	logger.trace("ultmtDbtrAddrLine:" + ultmtDbtrTwnNm);
	
	var ultmtDbtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/PstlAdr/Ctry';
	var ultmtDbtrCtry = getValueFromPath(Document, ultmtDbtrCtryPath);
	logger.trace("ultmtDbtrAddrLine:" + ultmtDbtrCtry);
	
	
	var initgPtyBicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/Id/OrgId/AnyBIC';
	var initgPtyBic = getValueFromPath(Document, initgPtyBicpath);
	logger.trace("initgPtyBic:" + initgPtyBic);
	
	var initgPtyNamepath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/Nm';
	var initgPtyName = getValueFromPath(Document, initgPtyNamepath);
	logger.trace("initgPtyName:" + initgPtyName);
	
	var initgPtyAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/PstlAdr/AdrLine';
	var initgPtyAddrLine = getValueFromPath(Document, initgPtyAddrLinePath);
	logger.trace("initgPtyAddrLine:" + initgPtyAddrLine);

	var initgPtyTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/PstlAdr/TwnNm';
	var initgPtyTwnNm = getValueFromPath(Document, initgPtyTwnNmPath);
	logger.trace("initgPtyTwnNm:" + initgPtyTwnNm);
	
	var initgPtyCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/PstlAdr/Ctry';
	var initgPtyCtry = getValueFromPath(Document, initgPtyCtryPath);
	logger.trace("initgPtyCtry:" + initgPtyCtry);
	
	
	var ultmtCdtrBicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/Id/OrgId/AnyBIC';
	var ultmtCdtrBic = getValueFromPath(Document, ultmtCdtrBicpath);
	logger.trace("ultmtCdtrBic:" + ultmtCdtrBic);
	
	var ultmtCdtrNamepath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/Nm';
	var ultmtCdtrName = getValueFromPath(Document, ultmtCdtrNamepath);
	logger.trace("ultmtCdtrName:" + ultmtCdtrName);
	
	var ultmtCdtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/PstlAdr/TwnNm';
	var ultmtCdtrTwnNm = getValueFromPath(Document, ultmtCdtrTwnNmPath);
	logger.trace("ultmtCdtrTwnNm:" + ultmtCdtrTwnNm);
	
	var ultmtCdtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/PstlAdr/Ctry';
	var ultmtCdtrCtry = getValueFromPath(Document, ultmtCdtrCtryPath);
	logger.trace("ultmtCdtrCtry:" + ultmtCdtrCtry);
	
	
	
	if((isPatternPresent(Document1, "<UltmtDbtr>"))	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!ultmtDbtrBic){
			if(!ultmtDbtrName && (!ultmtDbtrAddrLine && (!ultmtDbtrTwnNm || !ultmtDbtrCtry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either AnyBIC or Name and Address must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}
	
	if((isPatternPresent(Document1, "<InitgPty>"))	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!initgPtyBic){
			if(!initgPtyName && (!initgPtyAddrLine && (!initgPtyTwnNm || !initgPtyCtry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either AnyBIC or Name and Address must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}
	
	if((isPatternPresent(Document1, "<UltmtCdtr>")) &&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!ultmtCdtrBic){
			if(!ultmtCdtrName && (!ultmtCdtrTwnNm && !ultmtCdtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either AnyBIC or Name and Address must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}
	return retVal;
}

function chipsnameAnyBICRulePacs009(exchange) {
	logger.trace("in chipsnameAnyBICRulePacs009");
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	var creditorPathNm;
	var cdtrNm;
	var dbtrPathNm;
	var dbtrNm;
	
	var creditorAnyBicPath;
	var creditorAnyBic;
	var dbtrAnyBicPath;
	var dbtrAnyBic;
	var retVal= 0;
	
	creditorPathNm = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/Nm';
	cdtrNm = getValueFromPath(Document, creditorPathNm);
	logger.trace("chipsPartyNamePstlAdrRulePacs009: cdtrNm: " + cdtrNm);
	
	creditorAnyBicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/Id/OrgId/AnyBIC';
	creditorAnyBic = getValueFromPath(Document, creditorAnyBicPath);
	logger.trace("chipsPartyNamePstlAdrRulePacs009: creditorAnyBic: " + creditorAnyBic);
	
	dbtrPathNm = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Nm';
	dbtrNm = getValueFromPath(Document, dbtrPathNm);
	logger.trace("chipsPartyNamePstlAdrRulePacs009: dbtrNm: " + dbtrNm);
	
	dbtrAnyBicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Id/OrgId/AnyBIC';
	dbtrAnyBic = getValueFromPath(Document, dbtrAnyBicPath);
	logger.trace("chipsPartyNamePstlAdrRulePacs009: dbtrAnyBic: " + dbtrAnyBic);
	
	if((isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")) && (isPatternPresent(Document1, "<Cdtr>"))){
		if(!creditorAnyBic)
		{
			if(!cdtrNm){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If AnyBIC is Absent Then Name is mandatory.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}
	
	
	if((isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")) && (isPatternPresent(Document1, "<Dbtr>"))){
		if(!dbtrAnyBic)
		{
			if(!dbtrNm){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If AnyBIC is Absent Then Name is mandatory.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}
	return retVal;
}

function chipsAgentsRulePacs009(exchange) {
	logger.trace("in chipsAgentsRulePacs009");
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var retVal= 0;
	
	
	var cdtrAgtBicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/BICFI';
	var cdtrAgtBic = getValueFromPath(Document, cdtrAgtBicPath);
	logger.trace("cdtrAgtAddrLine:" + cdtrAgtBic);
	
	var cdtrAgtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/Nm';
	var cdtrAgtNm = getValueFromPath(Document, cdtrAgtNmPath);
	logger.trace("cdtrAgtNm:" + cdtrAgtNm);

	var cdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
	logger.trace("cdtrAgtAddrLine:" + cdtrAgtAddrLine);

	var cdtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	var cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);
	logger.trace("cdtrAgtTwnNm:" + cdtrAgtTwnNm);

	var cdtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	var cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);
	logger.trace("cdtrAgtCtry:" + cdtrAgtCtry);
	
	var dbtrAgtBicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/BICFI';
	var dbtrAgtBic = getValueFromPath(Document, dbtrAgtBicPath);
	logger.trace("dbtrAgtBic:" + dbtrAgtBic);
	
	var dbtrAgtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/Nm';
	var dbtrAgtNm = getValueFromPath(Document, dbtrAgtNmPath);
	logger.trace("dbtrAgtNm:" + dbtrAgtNm);

	var dbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);
	logger.trace("dbtrAgtAddrLine:" + dbtrAgtAddrLine);

	var dbtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	var dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);
	logger.trace("dbtrAgtTwnNm:" + dbtrAgtTwnNm);

	var dbtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	var dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);
	logger.trace("dbtrAgtCtry:" + dbtrAgtCtry);
	
	var intrmyAgt1BicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/BICFI';
	var intrmyAgt1Bic =  getValueFromPath(Document, intrmyAgt1BicPath);
	logger.trace("intrmyAgt1Bic:" + intrmyAgt1Bic);
	
	var intrmyAgt1NmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/Nm';
	var intrmyAgt1Nm =  getValueFromPath(Document, intrmyAgt1NmPath);
	logger.trace("intrmyAgt1Nm:" + intrmyAgt1Nm);

	var intrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);
	logger.trace("intrmyAgt1AddrLine:" + intrmyAgt1AddrLine);

	var intrmyAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);
	logger.trace("intrmyAgt1TwnNm:" + intrmyAgt1TwnNm);

	var intrmyAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);
	logger.trace("intrmyAgt1Ctry:" + intrmyAgt1Ctry);
	
	var intrmyAgt2BicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/BICFI';
	var intrmyAgt2Bic =  getValueFromPath(Document, intrmyAgt2BicPath);
	logger.trace("intrmyAgt2Bic:" + intrmyAgt2Bic);
	
	var intrmyAgt2NmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/Nm';
	var intrmyAgt2Nm =  getValueFromPath(Document, intrmyAgt2NmPath);
	logger.trace("intrmyAgt2Nm:" + intrmyAgt2Nm);

	var intrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);
	logger.trace("intrmyAgt2AddrLine:" + intrmyAgt2AddrLine);

	var intrmyAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);
	logger.trace("intrmyAgt2TwnNm:" + intrmyAgt2TwnNm);

	var intrmyAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);
	logger.trace("intrmyAgt2Ctry:" + intrmyAgt2Ctry);
	
	var intrmyAgt3BicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/BICFI';
	var intrmyAgt3Bic =  getValueFromPath(Document, intrmyAgt3BicPath);
	logger.trace("intrmyAgt3Bic:" + intrmyAgt3Bic);
	
	var intrmyAgt3NmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/Nm';
	var intrmyAgt3Nm =  getValueFromPath(Document, intrmyAgt3NmPath);
	logger.trace("intrmyAgt3Nm:" + intrmyAgt3Nm);

	var intrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);
	logger.trace("intrmyAgt3AddrLine:" + intrmyAgt3AddrLine);

	var intrmyAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);
	logger.trace("intrmyAgt3TwnNm:" + intrmyAgt3TwnNm);

	var intrmyAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);
	logger.trace("intrmyAgt3Ctry:" + intrmyAgt3Ctry);
		
	var prvsInstgAgt1BicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/BICFI';
	var prvsInstgAgt1Bic =  getValueFromPath(Document, prvsInstgAgt1BicPath);
	logger.trace("prvsInstgAgt1Bic:" + prvsInstgAgt1Bic);
	
	var prvsInstgAgt1NmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/Nm';
	var prvsInstgAgt1Nm =  getValueFromPath(Document, prvsInstgAgt1NmPath);
	logger.trace("prvsInstgAgt1Nm:" + prvsInstgAgt1Nm);

	var prvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);
	logger.trace("prvsInstgAgt1AddrLine:" + prvsInstgAgt1AddrLine);

	var prvsInstgAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);
	logger.trace("prvsInstgAgt1TwnNm:" + prvsInstgAgt1TwnNm);

	var prvsInstgAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);
	logger.trace("prvsInstgAgt1Ctry:" + prvsInstgAgt1Ctry);
		
	var prvsInstgAgt2BicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/BICFI';
	var prvsInstgAgt2Bic =  getValueFromPath(Document, prvsInstgAgt2BicPath);
	logger.trace("prvsInstgAgt2Bic:" + prvsInstgAgt2Bic);
	
	var prvsInstgAgt2NmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/Nm';
	var prvsInstgAgt2Nm =  getValueFromPath(Document, prvsInstgAgt2NmPath);
	logger.trace("prvsInstgAgt2Nm:" + prvsInstgAgt2Nm);

	var prvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);
	logger.trace("prvsInstgAgt2AddrLine:" + prvsInstgAgt2AddrLine);

	var prvsInstgAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);
	logger.trace("prvsInstgAgt2TwnNm:" + prvsInstgAgt2TwnNm);

	var prvsInstgAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);
	logger.trace("prvsInstgAgt2Ctry:" + prvsInstgAgt2Ctry);
		
	var prvsInstgAgt3BicPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/BICFI';
	var prvsInstgAgt3Bic =  getValueFromPath(Document, prvsInstgAgt3BicPath);
	logger.trace("prvsInstgAgt3Bic:" + prvsInstgAgt3Bic);
	
	var prvsInstgAgt3NmePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/Nm';
	var prvsInstgAgt3Nme =  getValueFromPath(Document, prvsInstgAgt3NmePath);
	logger.trace("prvsInstgAgt3Nme:" + prvsInstgAgt3Nme);

	var prvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);
	logger.trace("prvsInstgAgt3AddrLine:" + prvsInstgAgt3AddrLine);

	var prvsInstgAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);
	logger.trace("prvsInstgAgt3TwnNm:" + prvsInstgAgt3TwnNm);


	var prvsInstgAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);
	logger.trace("prvsInstgAgt3TwnNm:" + prvsInstgAgt3Ctry);
	
	logger.trace("CdtrAgt check");
	var CdtrAgtValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt';
	var CdtrAgtVal =  getValueFromPath(Document, CdtrAgtValPath);
	logger.trace("CdtrAgtVal:" + CdtrAgtVal);
	if((CdtrAgtVal)	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!cdtrAgtBic){
			if(!cdtrAgtNm && (!cdtrAgtAddrLine && (!cdtrAgtTwnNm || !cdtrAgtCtry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	logger.trace("DbtrAgt check");
	var DbtrAgtValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt';
	var DbtrAgtVal =  getValueFromPath(Document, DbtrAgtValPath);
	logger.trace("DbtrAgtVal:" + DbtrAgtVal);
	if((DbtrAgtVal)	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!dbtrAgtBic){
			if(!dbtrAgtNm && (!dbtrAgtAddrLine && (!dbtrAgtTwnNm || !dbtrAgtCtry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	logger.trace("IntrmyAgt1 check");
	var intrmyAgt1ValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1';
	var intrmyAgt1Val =  getValueFromPath(Document, intrmyAgt1ValPath);
	logger.trace("intrmyAgt1Val:" + intrmyAgt1Val);
	if((intrmyAgt1Val) && (isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!intrmyAgt1Bic){
			if(!intrmyAgt1Nm && (!intrmyAgt1AddrLine && (!intrmyAgt1TwnNm || !intrmyAgt1Ctry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	logger.trace("IntrmyAgt2 check");
	var intrmyAgt2ValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2';
	var intrmyAgt2Val =  getValueFromPath(Document, intrmyAgt2ValPath);
	logger.trace("intrmyAgt2Val:" + intrmyAgt2Val);
	if((intrmyAgt2Val)	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!intrmyAgt2Bic){
			if(!intrmyAgt2Nm && (!intrmyAgt2AddrLine && (!intrmyAgt2TwnNm || !intrmyAgt2Ctry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	logger.trace("IntrmyAgt3 check");
	var intrmyAgt3ValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3';
	var intrmyAgt3Val =  getValueFromPath(Document, intrmyAgt3ValPath);
	logger.trace("intrmyAgt3Val:" + intrmyAgt3Val);
	if((intrmyAgt3Val)	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!intrmyAgt3Bic){
			if(!intrmyAgt3Nm && (!intrmyAgt3AddrLine && (!intrmyAgt3TwnNm || !intrmyAgt3Ctry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	logger.trace("PrvsInstgAgt1 check");
	var PrvsInstgAgt1ValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1';
	var PrvsInstgAgt1Val =  getValueFromPath(Document, PrvsInstgAgt1ValPath);
	logger.trace("PrvsInstgAgt1Val:" + PrvsInstgAgt1Val);
	if((PrvsInstgAgt1Val)	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!prvsInstgAgt1Bic){
			if(!prvsInstgAgt1Nm && (!prvsInstgAgt1AddrLine && (!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	logger.trace("PrvsInstgAgt2 check");
	var PrvsInstgAgt2ValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2';
	var PrvsInstgAgt2Val =  getValueFromPath(Document, PrvsInstgAgt2ValPath);
	logger.trace("PrvsInstgAgt2Val:" + PrvsInstgAgt2Val);
	if((PrvsInstgAgt2Val)	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!prvsInstgAgt2Bic){
			if(!prvsInstgAgt2Nm && (!prvsInstgAgt2AddrLine && (!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	logger.trace("PrvsInstgAgt3 check");
	var PrvsInstgAgt3ValPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3';
	var PrvsInstgAgt3Val =  getValueFromPath(Document, PrvsInstgAgt3ValPath);
	logger.trace("PrvsInstgAgt3Val:" + PrvsInstgAgt3Val);
	if((PrvsInstgAgt3Val)	&&	(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>"))){
		if(!prvsInstgAgt3Bic){
			if(!prvsInstgAgt3Nme && (!prvsInstgAgt3AddrLine && (!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry))){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}
	return retVal;	
}


function ibanValidationChipsPacs009(Document, map) {
	var val;
	var retVal = 0;

	logger.trace("In ibanValidationChipsPacs009");

	val = validatePrvsInstgAgt1AcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = val;
	}

	val = validatePrvsInstgAgt2AcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validatePrvsInstgAgt3AcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt1AcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt2AcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt3AcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateDbtrAcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateDbtrAgtAcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateCdtrAgtAcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateCdtrAcctIbanChipsPacs009(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	return retVal;
}

function validatePrvsInstgAgt1AcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt1AcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt1AcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt1AcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validatePrvsInstgAgt2AcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt2AcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt2AcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt2AcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validatePrvsInstgAgt3AcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt3AcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt3AcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt3AcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt1AcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt1AcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt1AcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateIntrmyAgt1AcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("48", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt2AcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt2AcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt2AcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateIntrmyAgt2AcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("50", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt3AcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt3AcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt3AcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("52", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateDbtrAcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateDbtrAcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateDbtrAcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateDbtrAcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("65", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateDbtrAgtAcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateDbtrAgtAcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgtAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateDbtrAgtAcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateDbtrAgtAcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("67", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateCdtrAgtAcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateCdtrAgtAcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgtAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateCdtrAgtAcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateCdtrAgtAcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("69", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateCdtrAcctIbanChipsPacs009(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateCdtrAcctIbanChipsPacs009");
	path = "/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateCdtrAcctIbanChipsPacs009: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateCdtrAcctIbanChipsPacs009: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("76", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function msgValidationChipsPacs008(exchange) {
	logger.trace("msgValidationChipsPacs008");
	var result;
	var inMsg;
	var map;

	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	logger.trace("In msgValidationChipsPacs008");

	setHeader(map, "txnForceStopCounter", 0);
	setHeader(map, "errorCountAdd", "Y"); //for testing
	logger.trace("errorCountAdd: " + getHeader(map,"errorCountAdd"));
	setHeader(map,"PLCN_validMessage", true);
	setHeader(map, "validFlag", true);

	wrapperChipsPacs008Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationChipsPacs008: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "repair");
	}
}

function wrapperChipsPacs008Mx(exchange) {
	logger.trace("In wrapperChipsPacs008Mx");
	var retVal;
	var commentsB2b;
	var pacs08ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;
	retVal = 0;
	logger.trace('wrapperChipsPacs008Mx:In wrapperChipsPacs008Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	pacs08ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS08_VALD_FLAG_MX");
	pacs08ValdFlagMx = pacs08ValdFlagMx.trim();
	logger.trace("pacs08ValdFlagMx = " + pacs08ValdFlagMx);

	if(pacs08ValdFlagMx == 'ERROR') {

		logger.trace("wrapperChipsPacs008Mx: Calling chipsValidationRulesPacs008");
		retVal = chipsValidationRulesPacs008(pacs08ValdFlagMx, exchange);
		logger.trace("wrapperChipsPacs008Mx: retVal from chipsValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperChipsPacs008Mx: txnComments = " + txnComments);

		if(retVal == 0) {
			logger.trace("wrapperChipsPacs008Mx: Calling externalCodelistValidationCbprPacs008");
			retVal = externalCodelistValidationCbprPacs008(Document, map);		
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.trace("txnComments from externalCodelistValidationCbprPacs008 = " + txnComments);			
		}

		if(retVal == 0) {
			logger.trace("wrapperChipsPacs008Mx: Calling ibanValidationChipsPacs008");
			retVal = ibanValidationChipsPacs008(Document, map);
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.trace("wrapperChipsPacs008Mx: txnComments from ibanValidationChipsPacs008 = " + txnComments);
		}
	}

	if(pacs08ValdFlagMx == 'WARNING') {

		logger.trace("wrapperChipsPacs008Mx: Calling chipsValidationRulesPacs008");
		retVal = chipsValidationRulesPacs008(pacs08ValdFlagMx, exchange);
		logger.trace("wrapperChipsPacs008Mx: retVal from chipsValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperChipsPacs008Mx: txnComments = " + txnComments);

		logger.trace("wrapperChipsPacs008Mx: Calling externalCodelistValidationChipsPacs008");
		retVal = externalCodelistValidationCbprPacs008(Document, map);		
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("txnComments from externalCodelistValidationChipsPacs008 = " + txnComments);			
		

		logger.trace("wrapperChipsPacs008Mx: Calling ibanValidationChipsPacs008");
		ibanValidationChipsPacs008(Document, map);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperChipsPacs008Mx: txnComments from ibanValidationChipsPacs008 = " + txnComments);
	}
}


function chipsValidationRulesPacs008(pacs08ValdFlagMx, exchange){
	logger.trace("chipsValidationRulesPacs008");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var MsgTypecheck;
	MsgTypecheck = getHeader(map, "PLCN_MsgType");
	logger.trace("chipsValidationRulesPacs008:MsgTypecheck = "+MsgTypecheck);
	retVal = 0;

	if(pacs08ValdFlagMx == "ERROR") {
		logger.trace("inside if loop");
        // commented out for hybrid address
		/*retVal = structuredvsUnstructuredRuleChipsPacs8(exchange);
		if(retVal != 0) {
			return retVal;
		}*/

		retVal = agentsRuleChipsPacs8(exchange);
		if(retVal != 0) {
			return retVal;
		}
		retVal = townNameAndCountryRuleChipsPacs8(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = crossElementComplexRulePacs008(pacs08ValdFlagMx,Document, map);
		if(retVal != 0) {
			return retVal;
		} 
        
        retVal = chrgBrMultipleOccurenceChipsPacs008(exchange);
		if(retVal != 0) {
			return retVal;
        }
        retVal = chrgBrPrepaidChargesRuleChipsPacs008(exchange);
		if(retVal != 0) {
			return retVal;
        }
        retVal = gracePeriodHybridFormalRuleChipsPacs8(exchange);
		if(retVal != 0) {
			return retVal;
        }
        retVal = gracePeriodUnstructuredFormalRuleChipsPacs8(exchange);
		if(retVal != 0) {
			return retVal;
        }
        retVal = agentNamePstlAdrRuleChipsPacs008(exchange);
		if(retVal != 0) {
			return retVal;
        }
        retVal = partyNamePstlAdrRuleChipsPacs008(exchange);
		if(retVal != 0) {
			return retVal;
        }
        retVal = instrForCdtrAgtMutualCodeRuleChipsPacs008(exchange);
		if(retVal != 0) {
			return retVal;
        }
        
	}
	return retVal;
}

function townNameAndCountryRuleChipsPacs8(exchange) { 
	logger.trace("townNameAndCountryRuleChipsPacs8");
	var retVal = 0;
	var cdtrAgtPstlAdrPath;
	var cdtrAgtPstlAdr;
	var cdtrAgtAddrLinePath;
	var cdtrAgtAddrLine;
	var cdtrAgtTwnNmPath;
	var cdtrAgtTwnNm;
	var cdtrAgtCtryPath;
	var cdtrAgtCtry;
	var dbtrAgtAddrPath;
	var dbtrAgtAddr;
	var dbtrAgtPstlAdrPath;
	var dbtrAgtPstlAdr;
	var dbtrAgtTwnNmPath;
	var dbtrAgtTwnNm;
	var dbtrAgtCtryPath;
	var dbtrAgtCtry;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	//CreditorAgent
	//cdtrAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr';
	//cdtrAgtPstlAdr = getValueFromPath(Document, cdtrAgtPstlAdrPath);
    cdtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<PstlAdr>");

	cdtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);

	cdtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	cdtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(!cdtrAgtAddrLine && (!cdtrAgtTwnNm || !cdtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("CdtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("889", "7926", map);
			return retVal;
			}
		}
	}

	//DebtorAgent
	// dbtrAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr';
	// dbtrAgtPstlAdr = getValueFromPath(Document, dbtrAgtPstlAdrPath);
    dbtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<PstlAdr>");

	dbtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

	dbtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	dbtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(!dbtrAgtAddrLine && (!dbtrAgtTwnNm || !dbtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("DbtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("841", "7926", map);
				return retVal;
			}
		}
	}

	//InstructedAgent
	// var instdAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr';
	// var instdAgtPstlAdr =  getValueFromPath(Document, instdAgtPstlAdrPath);
    var instdAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "InstdAgt", "<PstlAdr>");

	var instdAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr/AdrLine';
	var instdAgtAddrLine = getValueFromPath(Document, instdAgtAddrLinePath);

	var instdAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr/TwnNm';
	var instdAgtTwnNm = getValueFromPath(Document, instdAgtTwnNmPath);

	var instdAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr/Ctry';
	var instdAgtCtry = getValueFromPath(Document, instdAgtCtryPath);

	if(isPatternPresent(Document1, "<InstdAgt>")){
		if(instdAgtPstlAdr){
			if(!instdAgtAddrLine && (!instdAgtTwnNm || !instdAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstdAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("536", "7926", map);
				return retVal;
			}
		}
	}

	//InstructingAgent
	// var instgAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr';
	// var instgAgtPstlAdr =  getValueFromPath(Document, instgAgtPstlAdrPath);
    var instgAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "InstgAgt", "<PstlAdr>");

	var instgAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr/AdrLine';
	var instgAgtAddrLine = getValueFromPath(Document, instgAgtAddrLinePath);

	var instgAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr/TwnNm';
	var instgAgtTwnNm = getValueFromPath(Document, instgAgtTwnNmPath);

	var instgAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr/Ctry';
	var instgAgtCtry = getValueFromPath(Document, instgAgtCtryPath);

	if(isPatternPresent(Document1, "<InstgAgt>")){
		if(instgAgtPstlAdr){
			if(!instgAgtAddrLine && (!instgAgtTwnNm || !instgAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstgAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("523", "7926", map);
				return retVal;
			}
		}
	}

	//CREDITOR
	// var cdtrPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr';
	// var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);
    var cdtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<PstlAdr>");

	var cdtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

	var cdtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

	var cdtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(!cdtrAddrLine && (!cdtrTwnNm || !cdtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Cdtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("945", "7926", map);
				return retVal;
			}
		}
	}

	//DEBTOR
	// var dbtrPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr';
	// var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);
    var dbtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<PstlAdr>");

	var dbtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

	var dbtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

	var dbtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(!dbtrAddrLine && (!dbtrTwnNm || !dbtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("DBTR-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("779", "7926", map);
				return retVal;
			}
		}
	}	

	//IntermediaryAgent1
	// var intrmyAgt1PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr';
	// var intrmyAgt1PstlAdr =  getValueFromPath(Document, intrmyAgt1PstlAdrPath);
    var intrmyAgt1PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<PstlAdr>");

	var intrmyAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(!intrmyAgt1AddrLine && (!intrmyAgt1TwnNm || !intrmyAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("549", "7926", map);
				return retVal;
			}
		}
	}

	//IntermediaryAgent2
	// var intrmyAgt2PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr';
	// var intrmyAgt2PstlAdr =  getValueFromPath(Document, intrmyAgt2PstlAdrPath);
    var intrmyAgt2PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<PstlAdr>");

	var intrmyAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(!intrmyAgt2AddrLine && (!intrmyAgt2TwnNm || !intrmyAgt2Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("597", "7926", map);
				return retVal;
			}
		}
	}
	//IntermediaryAgent3
	// var intrmyAgt3PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr';
	// var intrmyAgt3PstlAdr =  getValueFromPath(Document, intrmyAgt3PstlAdrPath);
    var intrmyAgt3PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<PstlAdr>");

	var intrmyAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(!intrmyAgt3AddrLine && (!intrmyAgt3TwnNm || !intrmyAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("IntrmyAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("645", "7926", map);
				return retVal;
			}
		}
	}


	//PreviousInstructingAgent1
	// var prvsInstgAgt1PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr';
	// var prvsInstgAgt1PstlAdr =  getValueFromPath(Document, prvsInstgAgt1PstlAdrPath);
    var prvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");

	var prvsInstgAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(!prvsInstgAgt1AddrLine && (!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("PrvsInstgAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("379", "7926", map);
				return retVal;
			}
		}
	}

	//PreviousInstructingAgent2
	// var prvsInstgAgt2PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr';
	// var prvsInstgAgt2PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);
    var prvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<PstlAdr>");

	var prvsInstgAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
			if(prvsInstgAgt2PstlAdr){
		if(!prvsInstgAgt2AddrLine && (!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry)){
			setHeader(map,"PLCN_validMessage", false);
			logger.trace("PrvsInstgAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
			retVal = setCommentsForTransaction("427", "7926", map);
			return retVal;
			}
		}
	}

	//PreviousInstructingAgent3
	// var prvsInstgAgt2PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr';
	// var prvsInstgAgt2PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);
    var prvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<PstlAdr>");

	var prvsInstgAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(!prvsInstgAgt3AddrLine && (!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("PrvsInstgAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("475", "7926", map);
				return retVal;
			}
		}	
	}

	//ChargesInformation
	// var chrgsInfPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	// var chrgsInfPstlAdr =  getValueFromPath(Document, chrgsInfPstlAdrPath);
    var chrgsInfPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "ChrgsInf", "<PstlAdr>");

	var chrgsInfAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);

	var chrgsInfTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);

	var chrgsInfCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(!chrgsInfAddrLine && (!chrgsInfTwnNm || !chrgsInfCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("ChrgsInf-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("347", "7926", map);
				return retVal;
			}
		}
	}
    
	// Ultimate Debtor
    var ultmtDbtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "UltmtDbtr", "<PstlAdr>");

	var ultmtDbtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/PstlAdr/AdrLine';
	var ultmtDbtrAddrLine = getValueFromPath(Document, ultmtDbtrAddrLinePath);

	var ultmtDbtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/PstlAdr/TwnNm';
	var ultmtDbtrTwnNm = getValueFromPath(Document, ultmtDbtrTwnNmPath);

	var ultmtDbtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/PstlAdr/Ctry';
	var ultmtDbtrCtry = getValueFromPath(Document, ultmtDbtrCtryPath);

	if(isPatternPresent(Document1, "<UltmtDbtr>")){
		if(ultmtDbtrPstlAdr){
			if(!ultmtDbtrAddrLine && (!ultmtDbtrTwnNm || !ultmtDbtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("UltmtDbtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("693", "7926", map);
				return retVal;
			}
		}
	}
    
	// Ultimate Creditor
    var ultmtCdtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "UltmtCdtr", "<PstlAdr>");

	var ultmtCdtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/PstlAdr/AdrLine';
	var ultmtCdtrAddrLine = getValueFromPath(Document, ultmtCdtrAddrLinePath);

	var ultmtCdtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/PstlAdr/TwnNm';
	var ultmtCdtrTwnNm = getValueFromPath(Document, ultmtCdtrTwnNmPath);

	var ultmtCdtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/PstlAdr/Ctry';
	var ultmtCdtrCtry = getValueFromPath(Document, ultmtCdtrCtryPath);

	if(isPatternPresent(Document1, "<UltmtCdtr>")){
		if(ultmtCdtrPstlAdr){
			if(!ultmtCdtrAddrLine && (!ultmtCdtrTwnNm || !ultmtCdtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("UltmtCdtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("1007", "7926", map);
				return retVal;
			}
		}
	}
    
	// Initiating Party
    var initgPtyPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "InitgPty", "<PstlAdr>");

	var initgPtyAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/PstlAdr/AdrLine';
	var initgPtyAddrLine = getValueFromPath(Document, initgPtyAddrLinePath);

	var initgPtyTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/PstlAdr/TwnNm';
	var initgPtyTwnNm = getValueFromPath(Document, initgPtyTwnNmPath);

	var initgPtyCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/PstlAdr/Ctry';
	var initgPtyCtry = getValueFromPath(Document, initgPtyCtryPath);

	if(isPatternPresent(Document1, "<InitgPty>")){
		if(initgPtyPstlAdr){
			if(!initgPtyAddrLine && (!initgPtyTwnNm || !initgPtyCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InitgPty-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("736", "7926", map);
				return retVal;
			}
		}
	}
    
    return retVal;
}

function structuredvsUnstructuredRuleChipsPacs8(exchange){ 
	logger.trace("structuredvsUnstructuredRuleChipsPacs8");
	var cdtrAgtPstlAdrPath;
	var cdtrAgtPstlAdr;
	var cdtrAgtAddrLinePath;
	var cdtrAgtAddrLine;
	var cdtrAgtTwnNmPath;
	var cdtrAgtTwnNm;
	var cdtrAgtCtryPath;
	var cdtrAgtCtry;

	var dbtrAgtAddrPath;
	var dbtrAgtAddr;
	var dbtrAgtPstlAdrPath;
	var dbtrAgtPstlAdr;
	var dbtrAgtTwnNmPath;
	var dbtrAgtTwnNm;
	var dbtrAgtCtryPath;
	var dbtrAgtCtry;
	
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	//CreditorAgent	
	cdtrAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtPstlAdr = getValueFromPath(Document, cdtrAgtPstlAdrPath);

	cdtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
	logger.trace("cdtrAgtAddrLine:" + cdtrAgtAddrLine);

	cdtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	cdtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

	//DebtorAgent
	dbtrAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtPstlAdr = getValueFromPath(Document, dbtrAgtPstlAdrPath);

	dbtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

	dbtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	dbtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	//InstructedAgent
	var instdAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr/AdrLine';
	var instdAgtPstlAdr =  getValueFromPath(Document, instdAgtPstlAdrPath);

	var instdAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr/AdrLine';
	var instdAgtAddrLine = getValueFromPath(Document, instdAgtAddrLinePath);

	var instdAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr/TwnNm';
	var instdAgtTwnNm = getValueFromPath(Document, instdAgtTwnNmPath);

	var instdAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/PstlAdr/Ctry';
	var instdAgtCtry = getValueFromPath(Document, instdAgtCtryPath);

	//InstructingAgent
	var instgAgtPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr/AdrLine';
	var instgAgtPstlAdr =  getValueFromPath(Document, instgAgtPstlAdrPath);

	var instgAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr/AdrLine';
	var instgAgtAddrLine = getValueFromPath(Document, instgAgtAddrLinePath);

	var instgAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr/TwnNm';
	var instgAgtTwnNm = getValueFromPath(Document, instgAgtTwnNmPath);

	var instgAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/PstlAdr/Ctry';
	var instgAgtCtry = getValueFromPath(Document, instgAgtCtryPath);

	//CREDITOR
	var cdtrPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine';
	var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);

	var cdtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

	var cdtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

	var cdtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);	

	//DEBTOR

	var dbtrPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine';
	var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);

	var dbtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

	var dbtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

	var dbtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

	//IntermediaryAgent1
	var intrmyAgt1PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1PstlAdr =  getValueFromPath(Document, intrmyAgt1PstlAdrPath);

	var intrmyAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	//IntermediaryAgent2
	var intrmyAgt2PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2PstlAdr =  getValueFromPath(Document, intrmyAgt2PstlAdrPath);

	var intrmyAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	//IntermediaryAgent3
	var intrmyAgt3PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3PstlAdr =  getValueFromPath(Document, intrmyAgt3PstlAdrPath);

	var intrmyAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1PstlAdr =  getValueFromPath(Document, prvsInstgAgt1PstlAdrPath);

	var prvsInstgAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);

	var prvsInstgAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);

	var prvsInstgAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	//ChargesInformation
	 /*var chrgsInfPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfPstlAdr =  getValueFromPath(Document, chrgsInfPstlAdrPath);

	var chrgsInfAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);

	var chrgsInfTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);

	var chrgsInfCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(cdtrAgtAddrLine && (cdtrAgtTwnNm || cdtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("CdtrAgt-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(dbtrAgtAddrLine && (dbtrAgtTwnNm || dbtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("DbtrAgt-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<InstdAgt>")){
		if(instdAgtPstlAdr){
			if(instdAgtAddrLine && (instdAgtTwnNm || instdAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstdAgt-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}


	if(isPatternPresent(Document1, "<InstgAgt>")){
		if(instgAgtPstlAdr){
			if(instgAgtAddrLine && (instgAgtTwnNm || instgAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstgAgt-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}


	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(cdtrAddrLine && (cdtrTwnNm || cdtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Cdtr-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}


	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(dbtrAddrLine && (dbtrTwnNm || dbtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Dbtr-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}

	}

	 /*if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(chrgsInfAddrLine && (chrgsInfTwnNm || chrgsInfCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("ChrgsInf-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("347", "7928", map);
				return retVal;
			}
		}
	} */
	if(isPatternPresent(Document1, "<ChrgsInf>"))
	{
			var res = Document1.match(/<ChrgsInf>/g).length;
			logger.trace("structuredvsUnstructuredRuleChipsPacs8: res = " + res);
			
			if(res >= 1)
			{
				var j=1;
				while(j <= res){
						
						var chrgsInfPstlAdrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf[' + j + ']/Agt/FinInstnId/PstlAdr/AdrLine';
						var chrgsInfPstlAdr =  getValueFromPath(Document, chrgsInfPstlAdrPath);
	                    logger.trace("chrgsInfPstlAdr: "+ chrgsInfPstlAdr);
						
						var chrgsInfAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf[' + j + ']/Agt/FinInstnId/PstlAdr/AdrLine';
						var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);
						logger.trace("chrgsInfAddrLine: "+ chrgsInfAddrLine);
	
						var chrgsInfTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf[' + j + ']/Agt/FinInstnId/PstlAdr/TwnNm';
						var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);
						logger.trace("chrgsInfTwnNm: "+ chrgsInfTwnNm);
	
						var chrgsInfCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf[' + j + ']/Agt/FinInstnId/PstlAdr/Ctry';
						var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);
						logger.trace("chrgsInfCtry: "+ chrgsInfCtry);
	
	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(chrgsInfAddrLine && (chrgsInfTwnNm || chrgsInfCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("ChrgsInf-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}
						j++;
					}
			}
	}
	

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(prvsInstgAgt3AddrLine && (prvsInstgAgt3TwnNm || prvsInstgAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
			if(prvsInstgAgt2PstlAdr){
		if(prvsInstgAgt2AddrLine && (prvsInstgAgt2TwnNm || prvsInstgAgt2Ctry)){
			setHeader(map,"PLCN_validMessage", false);
			logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
			retVal = setCommentsForTransaction("15", "111", map);
			return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(prvsInstgAgt1AddrLine && (prvsInstgAgt1TwnNm || prvsInstgAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(intrmyAgt3AddrLine && (intrmyAgt3TwnNm || intrmyAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(intrmyAgt2AddrLine && (intrmyAgt2TwnNm || intrmyAgt2Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(intrmyAgt1AddrLine && (intrmyAgt1TwnNm || intrmyAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}

	}
	return retVal;	
}


function agentsRuleChipsPacs8(exchange){
	
	logger.trace("agentsRuleChipsPacs8");
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	var retVal = 0;
	
	var chrgsInfBicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/BICFI';
	var chrgsInfBicValue =  getValueFromPath(Document, chrgsInfBicPath);
	logger.trace("agentsRuleChipsPacs8:chrgsInfBicValue  = " + chrgsInfBicValue);
	
	var chrgsInfNmePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/BICFI/Nm';
	var chrgsInfNmeValue =  getValueFromPath(Document, chrgsInfNmePath);
	logger.trace("agentsRuleChipsPacs8:chrgsInfNmeValue  = " + chrgsInfNmeValue);

	var chrgsInfAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);
	logger.trace("agentsRuleChipsPacs8:chrgsInfAddrLine = " + chrgsInfAddrLine);

	var chrgsInfTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);
	logger.trace("agentsRuleChipsPacs8:chrgsInfTwnNm = " + chrgsInfTwnNm);

	var chrgsInfCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);
	logger.trace("agentsRuleChipsPacs8:chrgsInfCtry = " + chrgsInfCtry);
	
    var chrgsInfPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "ChrgsInf", "<PstlAdr>");
    logger.trace("agentsRuleChipsPacs8:chrgsInfPstlAdr present = " + chrgsInfPstlAdr);
    
	if(isPatternPresent(Document1, "<ChrgsInf>"))
	{
		if(!chrgsInfBicValue)
		{
		//if(!chrgsInfNmeValue && (!chrgsInfAddrLine && (!chrgsInfTwnNm || !chrgsInfCtry))){
        if(!chrgsInfNmeValue && !chrgsInfPstlAdr){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
		}
	}
		return retVal;
}
	return retVal;
}

function ibanValidationChipsPacs008(Document, map) {
	var val;
	var retVal = 0;

	logger.trace("In ibanValidationChipsPacs008");

	val = validatePrvsInstgAgt1AcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = val;
	}

	val = validatePrvsInstgAgt2AcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validatePrvsInstgAgt3AcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt1AcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt2AcctIbanChipsPacs008(Document, map);	
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt3AcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateDbtrAcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateDbtrAgtAcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateCdtrAgtAcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateCdtrAcctIbanChipsPacs008(Document, map);
	if(val) {
		retVal = retVal + val;
	}
}

function validatePrvsInstgAgt1AcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt1AcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt1AcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt1AcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validatePrvsInstgAgt2AcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt2AcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt2AcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt2AcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validatePrvsInstgAgt3AcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt3AcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt3AcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt3AcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt1AcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt1AcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt1AcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateIntrmyAgt1AcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("48", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt2AcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt2AcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt2AcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateIntrmyAgt2AcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("50", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt3AcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt3AcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt3AcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("52", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateDbtrAcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateDbtrAcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateDbtrAcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateDbtrAcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("65", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateDbtrAgtAcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateDbtrAgtAcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgtAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateDbtrAgtAcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateDbtrAgtAcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("67", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateCdtrAgtAcctIbanChipsPacs008(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateCdtrAgtAcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgtAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateCdtrAgtAcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateCdtrAgtAcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("69", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateCdtrAcctIbanChipsPacs008(Document, map) {
	logger.trace("validateCdtrAcctIbanChipsPacs008");
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateCdtrAcctIbanChipsPacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateCdtrAcctIbanChipsPacs008: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateCdtrAcctIbanChipsPacs008: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("76", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}


function msgValidationChipsPacs004(exchange) {
	logger.trace("msgValidationChipsPacs004");
	var result;
	var inMsg;
	var map;

	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	logger.trace("In msgValidationChipsPacs004");

	setHeader(map, "txnForceStopCounter", 0);
	setHeader(map, "errorCountAdd", "Y"); //for testing
	logger.trace("errorCountAdd: " + getHeader(map,"errorCountAdd"));
	setHeader(map,"PLCN_validMessage", true);
	setHeader(map, "validFlag", true);

	wrapperChipsPacs004Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationChipsPacs004: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "repair");
	}
}

function wrapperChipsPacs004Mx(exchange) {
	logger.trace("In wrapperChipsPacs004Mx");
	var retVal;
	var commentsB2b;
	var pacs08ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.trace('wrapperChipsPacs004Mx:In wrapperChipsPacs004Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	pacs08ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS08_VALD_FLAG_MX");	//need to check flag
	pacs08ValdFlagMx = pacs08ValdFlagMx.trim();
	logger.trace("pacs08ValdFlagMx = " + pacs08ValdFlagMx);

	if(pacs08ValdFlagMx == 'ERROR') {

		logger.trace("wrapperChipsPacs004Mx: Calling chipsValidationRulesPacs004");
		retVal = chipsValidationRulesPacs004(pacs08ValdFlagMx, exchange);
		logger.trace("wrapperChipsPacs004Mx: retVal from chipsValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperChipsPacs004Mx: txnComments = " + txnComments);

		if(retVal == 0) {
			logger.trace("wrapperChipsPacs004Mx: Calling externalCodelistValidationChipsPacs004");
			retVal = externalCodelistValidationChipsPacs004(Document, map);		
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.trace("txnComments from externalCodelistValidationChipsPacs004 = " + txnComments);			
		}

		if(retVal == 0) {
			logger.trace("wrapperChipsPacs004Mx: Calling ibanValidationChipsPacs004");
			retVal = ibanValidationChipsPacs004(Document, map);
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.trace("wrapperChipsPacs004Mx: txnComments from ibanValidationChipsPacs004 = " + txnComments);
		}
	}

	if(pacs08ValdFlagMx == 'WARNING') {

		logger.trace("wrapperChipsPacs004Mx: Calling chipsValidationRulesPacs008");
		retVal = chipsValidationRulesPacs004(pacs08ValdFlagMx, exchange);
		logger.trace("wrapperChipsPacs004Mx: retVal from chipsValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperChipsPacs004Mx: txnComments = " + txnComments);

		logger.trace("wrapperChipsPacs004Mx: Calling externalCodelistValidationChipsPacs004");
		retVal = externalCodelistValidationChipsPacs004(Document, map);		
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("txnComments from externalCodelistValidationChipsPacs004 = " + txnComments);			
		

		logger.trace("wrapperChipsPacs004Mx: Calling ibanValidationChipsPacs004");
		ibanValidationChipsPacs004(Document, map);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperChipsPacs004Mx: txnComments from ibanValidationChipsPacs004 = " + txnComments);
	}
}

function chipsValidationRulesPacs004(pacs08ValdFlagMx, exchange){
	logger.trace("chipsValidationRulesPacs004");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	retVal = 0;

	if(pacs08ValdFlagMx == "ERROR") {
		logger.trace("inside if loop");
        // commented out for hybrid address
        /*
		retVal = structuredvsUnstructuredRuleChipsPacs4(exchange);
		if(retVal != 0) {
			return retVal;
		}
        */

		retVal = townNameAndCountryRuleChipsPacs4(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = agentsRuleChipsPacs4(exchange);
		if(retVal != 0) {
			return retVal;
		}
        
        retVal = gracePeriodHybridFormalRuleChipsPacs4(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = gracePeriodUnstructuredFormalRuleChipsPacs4(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = agentNamePstlAdrRuleChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = partyNamePstlAdrRuleChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = chrgBrChrgsInfMandatoryRuleChipsPacs008(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = validateReasonCodeChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = intrBkSttlmAmtOccurenceRuleChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = orgnlTxRefSttlmInfCodeRuleChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = orgnlTxRefRmbrsmntAgtRuleChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = orgnlTxRefRmbrsmntAgtAccountPresenceRuleChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
        retVal = partyNameAnyBICRuleChipsPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
	}
	return retVal;
}

function townNameAndCountryRuleChipsPacs4(exchange) {
	logger.trace("townNameAndCountryRuleChipsPacs4");
	var retVal = 0;
	var cdtrAgtPstlAdrPath;
	var cdtrAgtPstlAdr;
	var cdtrAgtAddrLinePath;
	var cdtrAgtAddrLine;
	var cdtrAgtTwnNmPath;
	var cdtrAgtTwnNm;
	var cdtrAgtCtryPath;
	var cdtrAgtCtry;
	var dbtrAgtAddrPath;
	var dbtrAgtAddr;
	var dbtrAgtPstlAdrPath;
	var dbtrAgtPstlAdr;
	var dbtrAgtTwnNmPath;
	var dbtrAgtTwnNm;
	var dbtrAgtCtryPath;
	var dbtrAgtCtry;
	var orgnlMsgNmIdPath;
	var orgnlMsgNmId;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

    if(isPatternPresent(Document1, "<RtrChain>")){
        var Document2 = dataBetweenTokens("<RtrChain>", "</RtrChain>", Document1);
        Document2 = "<RtrChain>".concat(Document2).concat("</RtrChain>");
    }
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        var Document4 = dataBetweenTokens("<OrgnlTxRef>", "</OrgnlTxRef>", Document1);
        Document4 = "<OrgnlTxRef>".concat(Document4).concat("</OrgnlTxRef>");
        logger.info("Document4 = " + Document4);

        if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
            var Document3 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
            Document3 = "<UndrlygCstmrCdtTrf>".concat(Document3).concat("</UndrlygCstmrCdtTrf>");
            logger.info("Document3 = " + Document3);
            Document4 = removePattern(Document4, Document3);
            logger.info("Document4 without undrlyg = " + Document4);
        }
    
    }
    
	//InstructedAgent
	//var instdAgtPstlAdrPath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/AdrLine';
	//var instdAgtPstlAdr =  getValueFromPath(Document, instdAgtPstlAdrPath);
    var instdAgtPstlAdr = isXmlNodePresent(Document, "TxInf", "InstdAgt", "<PstlAdr>");
	logger.trace("instdAgtPstlAdr = "+instdAgtPstlAdr);

	var instdAgtAddrLinePath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/AdrLine';
	var instdAgtAddrLine = getValueFromPath(Document, instdAgtAddrLinePath);
	logger.trace("instdAgtAddrLine = "+instdAgtAddrLine);

	var instdAgtTwnNmPath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/TwnNm';
	var instdAgtTwnNm = getValueFromPath(Document, instdAgtTwnNmPath);
	logger.trace("instdAgtTwnNm = "+instdAgtTwnNm);

	var instdAgtCtryPath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/Ctry';
	var instdAgtCtry = getValueFromPath(Document, instdAgtCtryPath);
	logger.trace("instdAgtCtry = "+instdAgtCtry);

	if(isPatternPresent(Document1, "<InstdAgt>")){
		if(instdAgtPstlAdr){
			if(!instdAgtAddrLine && (!instdAgtTwnNm || !instdAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstdAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("244", "7926", map);
				return retVal;
			}
		}
	}

	//InstructingAgent
	//var instgAgtPstlAdrPath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/AdrLine';
	//var instgAgtPstlAdr =  getValueFromPath(Document, instgAgtPstlAdrPath);
    var instgAgtPstlAdr = isXmlNodePresent(Document, "TxInf", "InstgAgt", "<PstlAdr>");
	logger.trace("instgAgtPstlAdr = "+instgAgtPstlAdr);

	var instgAgtAddrLinePath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/AdrLine';
	var instgAgtAddrLine = getValueFromPath(Document, instgAgtAddrLinePath);
	logger.trace("instgAgtAddrLine = "+instgAgtAddrLine);

	var instgAgtTwnNmPath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/TwnNm';
	var instgAgtTwnNm = getValueFromPath(Document, instgAgtTwnNmPath);
	logger.trace("instgAgtTwnNm = "+instgAgtTwnNm);

	var instgAgtCtryPath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/Ctry';
	var instgAgtCtry = getValueFromPath(Document, instgAgtCtryPath);
	logger.trace("instgAgtCtry = "+instgAgtCtry);

	if(isPatternPresent(Document1, "<InstgAgt>")){
		if(instgAgtPstlAdr){
			if(!instgAgtAddrLine && (!instgAgtTwnNm || !instgAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstgAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("231", "7926", map);
				return retVal;
			}
		}
	}
    
	// ChargesInformation
	//var chrgsInfPstlAdrPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	//var chrgsInfPstlAdr =  getValueFromPath(Document, chrgsInfPstlAdrPath);
    var chrgsInfPstlAdr =  isXmlNodePresent(Document, "TxInf", "ChrgsInf", "<PstlAdr>");
	logger.trace("chrgsInfPstlAdr = "+chrgsInfPstlAdr);

	var chrgsInfAddrLinePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);
	logger.trace("chrgsInfAddrLine = "+chrgsInfAddrLine);

	var chrgsInfTwnNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);
	logger.trace("chrgsInfTwnNm = "+chrgsInfTwnNm);

	var chrgsInfCtryPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);
	logger.trace("chrgsInfCtry = "+chrgsInfCtry);

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(!chrgsInfAddrLine && (!chrgsInfTwnNm || !chrgsInfCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("ChrgsInf-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
				retVal = setCommentsForTransaction("198", "7926", map);
				return retVal;
			}
		}
	}
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        // CreditorAgent
        //cdtrAgtPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr';
        //cdtrAgtPstlAdr = getValueFromPath(Document, cdtrAgtPstlAdrPath);
        var cdtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "CdtrAgt", "<PstlAdr>");
        logger.trace("cdtrAgtPstlAdr = "+cdtrAgtPstlAdr);

        cdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
        logger.trace("cdtrAgtAddrLine = "+cdtrAgtAddrLine);

        cdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);
        logger.trace("cdtrAgtTwnNm = "+cdtrAgtTwnNm);

        cdtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);
        logger.trace("cdtrAgtCtry = "+cdtrAgtCtry);

        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if(cdtrAgtPstlAdr){
                if(!cdtrAgtAddrLine && (!cdtrAgtTwnNm || !cdtrAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("CdtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("625", "7926", map);
                return retVal;
                }
            }
        }

        //DebtorAgent
        //dbtrAgtPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        //dbtrAgtPstlAdr = getValueFromPath(Document, dbtrAgtPstlAdrPath);
        var dbtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "DbtrAgt", "<PstlAdr>");
        logger.trace("dbtrAgtPstlAdr = "+dbtrAgtPstlAdr);

        dbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);
        logger.trace("dbtrAgtAddrLine = "+dbtrAgtAddrLine);

        dbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);
        logger.trace("dbtrAgtTwnNm = "+dbtrAgtTwnNm);

        dbtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);
        logger.trace("dbtrAgtCtry = "+dbtrAgtCtry);

        if(isPatternPresent(Document1, "<DbtrAgt>")){
            if(dbtrAgtPstlAdr){
                if(!dbtrAgtAddrLine && (!dbtrAgtTwnNm || !dbtrAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("DbtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("422", "7926", map);
                    return retVal;
                }
            }
        }

        orgnlMsgNmIdPath = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
        orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
        logger.trace("orgnlMsgNmId = "+orgnlMsgNmId);
        
        // Creditor
        if(orgnlMsgNmId == 'pacs.008.001.08'){	
            //var cdtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
            //var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);
            var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");
            logger.trace("cdtrPstlAdr = "+cdtrPstlAdr);

            var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
            var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
            logger.trace("cdtrAddrLine = "+cdtrAddrLine);

            var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnNm';
            var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);
            logger.trace("cdtrTwnNm = "+cdtrTwnNm);

            var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Ctry';
            var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);
            logger.trace("cdtrCtry = "+cdtrCtry);
        }
        
        else if(orgnlMsgNmId == 'pacs.009.001.08'){
            //var cdtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
            //var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);
            var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");
            logger.trace("cdtrPstlAdr = "+cdtrPstlAdr);

            var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
            logger.trace("cdtrAddrLine = "+cdtrAddrLine);

            var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);
            logger.trace("cdtrTwnNm = "+cdtrTwnNm);

            var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
            var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);
            logger.trace("cdtrCtry = "+cdtrCtry);
        }

        if(isPatternPresent(Document2, "<Cdtr>")){
            if(cdtrPstlAdr){
                if(!cdtrAddrLine && (!cdtrTwnNm || !cdtrCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("Cdtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("658", "7926", map);
                    return retVal;
                }
            }
        }

        orgnlMsgNmIdPath = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
        orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
        logger.trace("orgnlMsgNmId = "+orgnlMsgNmId);
        
        // Debtor
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            //var dbtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
            //var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);
            var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");
            logger.trace("dbtrPstlAdr = "+dbtrPstlAdr);

            var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
            var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
            logger.trace("dbtrAddrLine = "+dbtrAddrLine);

            var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnNm';
            var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
            logger.trace("dbtrTwnNm = "+dbtrTwnNm);

            var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Ctry';
            var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
            logger.trace("dbtrCtry = "+dbtrCtry);
        }
        
        else if(orgnlMsgNmId == 'pacs.009.001.08'){
            //var dbtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
            //var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);
            var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");
            logger.trace("dbtrPstlAdr = "+dbtrPstlAdr);

            var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
            logger.trace("dbtrAddrLine = "+dbtrAddrLine);

            var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
            logger.trace("dbtrTwnNm = "+dbtrTwnNm);

            var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
            var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
            logger.trace("dbtrCtry = "+dbtrCtry);
            
        }

        if(isPatternPresent(Document2, "<Dbtr>")){
            if(dbtrPstlAdr){
                if(!dbtrAddrLine && (!dbtrTwnNm || !dbtrCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("DBTR-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("304", "7926", map);
                    return retVal;
                }
            }
        }	

        // IntermediaryAgent1
        //var intrmyAgt1PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        //var intrmyAgt1PstlAdr =  getValueFromPath(Document, intrmyAgt1PstlAdrPath);
        var intrmyAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt1", "<PstlAdr>");
        logger.trace("intrmyAgt1PstlAdr = "+intrmyAgt1PstlAdr);

        var intrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);
        logger.trace("intrmyAgt1AddrLine = "+intrmyAgt1AddrLine);

        var intrmyAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);
        logger.trace("intrmyAgt1TwnNm = "+intrmyAgt1TwnNm);

        var intrmyAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);
        logger.trace("intrmyAgt1Ctry = "+intrmyAgt1Ctry);

        if(isPatternPresent(Document2, "<IntrmyAgt1>")){
            if(intrmyAgt1PstlAdr){
                if(!intrmyAgt1AddrLine && (!intrmyAgt1TwnNm || !intrmyAgt1Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("538", "7926", map);
                    return retVal;
                }
            }
        }

        // IntermediaryAgent2
        //var intrmyAgt2PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        //var intrmyAgt2PstlAdr =  getValueFromPath(Document, intrmyAgt2PstlAdrPath);
        var intrmyAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt2", "<PstlAdr>");
        logger.trace("intrmyAgt2PstlAdr = "+intrmyAgt2PstlAdr);

        var intrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);
        logger.trace("intrmyAgt2AddrLine = "+intrmyAgt2AddrLine);

        var intrmyAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);
        logger.trace("intrmyAgt2TwnNm = "+intrmyAgt2TwnNm);

        var intrmyAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);
        logger.trace("intrmyAgt2Ctry = "+intrmyAgt2Ctry);

        if(isPatternPresent(Document2, "<IntrmyAgt2>")){
            if(intrmyAgt2PstlAdr){
                if(!intrmyAgt2AddrLine && (!intrmyAgt2TwnNm || !intrmyAgt2Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("567", "7926", map);
                    return retVal;
                }
            }
        }
        // IntermediaryAgent3
        //var intrmyAgt3PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        //var intrmyAgt3PstlAdr =  getValueFromPath(Document, intrmyAgt3PstlAdrPath);
        var intrmyAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt3", "<PstlAdr>");
        logger.trace("intrmyAgt3PstlAdr = "+intrmyAgt3PstlAdr);

        var intrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);
        logger.trace("intrmyAgt3AddrLine = "+intrmyAgt3AddrLine);

        var intrmyAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);
        logger.trace("intrmyAgt3TwnNm = "+intrmyAgt3TwnNm);

        var intrmyAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);
        logger.trace("intrmyAgt3Ctry = "+intrmyAgt3Ctry);

        if(isPatternPresent(Document2, "<IntrmyAgt3>")){
            if(intrmyAgt3PstlAdr){
                if(!intrmyAgt3AddrLine && (!intrmyAgt3TwnNm || !intrmyAgt3Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("596", "7926", map);
                    return retVal;
                }
            }
        }


        // PreviousInstructingAgent1
        //var prvsInstgAgt1PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        //var prvsInstgAgt1PstlAdr =  getValueFromPath(Document, prvsInstgAgt1PstlAdrPath);
        var prvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt1", "<PstlAdr>");
        logger.trace("prvsInstgAgt1PstlAdr = "+prvsInstgAgt1PstlAdr);

        var prvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);
        logger.trace("prvsInstgAgt1AddrLine = "+prvsInstgAgt1AddrLine);

        var prvsInstgAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);
        logger.trace("prvsInstgAgt1TwnNm = "+prvsInstgAgt1TwnNm);

        var prvsInstgAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);
        logger.trace("prvsInstgAgt1Ctry = "+prvsInstgAgt1Ctry);

        if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
            if(prvsInstgAgt1PstlAdr){
                if(!prvsInstgAgt1AddrLine && (!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("PrvsInstgAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("451", "7926", map);
                    return retVal;
                }
            }
        }

        // PreviousInstructingAgent2
        //var prvsInstgAgt2PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        //var prvsInstgAgt2PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);
        var prvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt2", "<PstlAdr>");
        logger.trace("prvsInstgAgt2PstlAdr = "+prvsInstgAgt2PstlAdr);

        var prvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);
        logger.trace("prvsInstgAgt2AddrLine = "+prvsInstgAgt2AddrLine);

        var prvsInstgAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);
        logger.trace("prvsInstgAgt2TwnNm = "+prvsInstgAgt2TwnNm);
        
        var prvsInstgAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);
        logger.trace("prvsInstgAgt2Ctry = "+prvsInstgAgt2Ctry);

        if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
            if(prvsInstgAgt2PstlAdr){
                if(!prvsInstgAgt2AddrLine && (!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("PrvsInstgAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("480", "7926", map);
                    return retVal;
                }	
            }
        }
        
        // PreviousInstructingAgent3
        //var prvsInstgAgt3PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        //var prvsInstgAgt3PstlAdr =  getValueFromPath(Document, prvsInstgAgt3PstlAdrPath);
        var prvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt3", "<PstlAdr>");
        logger.trace("prvsInstgAgt3PstlAdr = "+prvsInstgAgt3PstlAdr);

        var prvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);
        logger.trace("prvsInstgAgt3AddrLine = "+prvsInstgAgt3AddrLine);

        var prvsInstgAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);
        logger.trace("prvsInstgAgt3TwnNm = "+prvsInstgAgt3TwnNm);

        var prvsInstgAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);
        logger.trace("prvsInstgAgt3Ctry = "+prvsInstgAgt3Ctry);

        if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
            if(prvsInstgAgt3PstlAdr){
                if(!prvsInstgAgt3AddrLine && (!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("PrvsInstgAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("509", "7926", map);
                    return retVal;
                }
            }
        }
    }
    
    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        // Underlying CreditorAgent
        var undrlygCdtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");
        logger.trace("undrlygCdtrAgtPstlAdr = "+undrlygCdtrAgtPstlAdr);

        undrlygCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        undrlygCdtrAgtAddrLine = getValueFromPath(Document, undrlygCdtrAgtAddrLinePath);
        logger.trace("undrlygCdtrAgtAddrLine = "+undrlygCdtrAgtAddrLine);

        undrlygCdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        undrlygCdtrAgtTwnNm = getValueFromPath(Document, undrlygCdtrAgtTwnNmPath);
        logger.trace("undrlygCdtrAgtTwnNm = "+undrlygCdtrAgtTwnNm);

        undrlygCdtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        undrlygCdtrAgtCtry = getValueFromPath(Document, undrlygCdtrAgtCtryPath);
        logger.trace("undrlygCdtrAgtCtry = "+undrlygCdtrAgtCtry);

        if(isPatternPresent(Document3, "<CdtrAgt>")){
            if(undrlygCdtrAgtPstlAdr){
                if(!undrlygCdtrAgtAddrLine && (!undrlygCdtrAgtTwnNm || !undrlygCdtrAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("CdtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                return retVal;
                }
            }
        }

        // Underlying DebtorAgent
        var undrlygDbtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");
        logger.trace("undrlygDbtrAgtPstlAdr = "+undrlygDbtrAgtPstlAdr);

        undrlygDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        undrlygDbtrAgtAddrLine = getValueFromPath(Document, undrlygDbtrAgtAddrLinePath);
        logger.trace("undrlygDbtrAgtAddrLine = "+undrlygDbtrAgtAddrLine);

        undrlygDbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        undrlygDbtrAgtTwnNm = getValueFromPath(Document, undrlygDbtrAgtTwnNmPath);
        logger.trace("undrlygDbtrAgtTwnNm = "+undrlygDbtrAgtTwnNm);

        undrlygDbtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        undrlygDbtrAgtCtry = getValueFromPath(Document, undrlygDbtrAgtCtryPath);
        logger.trace("undrlygDbtrAgtCtry = "+undrlygDbtrAgtCtry);

        if(isPatternPresent(Document3, "<DbtrAgt>")){
            if(undrlygDbtrAgtPstlAdr){
                if(!undrlygDbtrAgtAddrLine && (!undrlygDbtrAgtTwnNm || !undrlygDbtrAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("DbtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying Creditor
        var undrlygCdtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");
        logger.trace("undrlygCdtrPstlAdr = "+undrlygCdtrPstlAdr);

        var undrlygCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
        var undrlygCdtrAddrLine = getValueFromPath(Document, undrlygCdtrAddrLinePath);
        logger.trace("undrlygCdtrAddrLine = "+undrlygCdtrAddrLine);

        var undrlygCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
        var undrlygCdtrTwnNm = getValueFromPath(Document, undrlygCdtrTwnNmPath);
        logger.trace("undrlygCdtrTwnNm = "+undrlygCdtrTwnNm);

        var undrlygCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
        var undrlygCdtrCtry = getValueFromPath(Document, undrlygCdtrCtryPath);
        logger.trace("undrlygCdtrCtry = "+undrlygCdtrCtry);

        if(isPatternPresent(Document3, "<Cdtr>")){
            if(undrlygCdtrPstlAdr){
                if(!undrlygCdtrAddrLine && (!undrlygCdtrTwnNm || !undrlygCdtrCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("Cdtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying Debtor
        var undrlygDbtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");
        logger.trace("undrlygDbtrPstlAdr = "+undrlygDbtrPstlAdr);

        var undrlygDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
        var undrlygDbtrAddrLine = getValueFromPath(Document, undrlygDbtrAddrLinePath);
        logger.trace("undrlygDbtrAddrLine = "+undrlygDbtrAddrLine);

        var undrlygDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
        var undrlygDbtrTwnNm = getValueFromPath(Document, undrlygDbtrTwnNmPath);
        logger.trace("undrlygDbtrTwnNm = "+undrlygDbtrTwnNm);

        var undrlygDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
        var undrlygDbtrCtry = getValueFromPath(Document, undrlygDbtrCtryPath);
        logger.trace("undrlygDbtrCtry = "+undrlygDbtrCtry);

        if(isPatternPresent(Document3, "<Dbtr>")){
            if(undrlygDbtrPstlAdr){
                if(!undrlygDbtrAddrLine && (!undrlygDbtrTwnNm || !undrlygDbtrCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("Cdtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying PreviousInstructingAgent1
        var undrlygPrvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");
        logger.trace("undrlygPrvsInstgAgt1PstlAdr = "+undrlygPrvsInstgAgt1PstlAdr);

        var undrlygPrvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt1AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt1AddrLinePath);
        logger.trace("undrlygPrvsInstgAgt1AddrLine = "+undrlygPrvsInstgAgt1AddrLine);

        var undrlygPrvsInstgAgt1TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt1TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt1TwnNmPath);
        logger.trace("undrlygPrvsInstgAgt1TwnNm = "+undrlygPrvsInstgAgt1TwnNm);

        var undrlygPrvsInstgAgt1CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt1Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt1CtryPath);
        logger.trace("undrlygPrvsInstgAgt1Ctry = "+undrlygPrvsInstgAgt1Ctry);

        if(isPatternPresent(Document3, "<PrvsInstgAgt1>")){
            if(undrlygPrvsInstgAgt1PstlAdr){
                if(!undrlygPrvsInstgAgt1AddrLine && (!undrlygPrvsInstgAgt1TwnNm || !undrlygPrvsInstgAgt1Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("PrvsInstgAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying PreviousInstructingAgent2
        var undrlygPrvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");
        logger.trace("undrlygPrvsInstgAgt2PstlAdr = "+undrlygPrvsInstgAgt2PstlAdr);

        var undrlygPrvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt2AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt2AddrLinePath);
        logger.trace("undrlygPrvsInstgAgt2AddrLine = "+undrlygPrvsInstgAgt2AddrLine);

        var undrlygPrvsInstgAgt2TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt2TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt2TwnNmPath);
        logger.trace("undrlygPrvsInstgAgt2TwnNm = "+undrlygPrvsInstgAgt2TwnNm);

        var undrlygPrvsInstgAgt2CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt2Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt2CtryPath);
        logger.trace("undrlygPrvsInstgAgt2Ctry = "+undrlygPrvsInstgAgt2Ctry);

        if(isPatternPresent(Document3, "<PrvsInstgAgt2>")){
            if(undrlygPrvsInstgAgt2PstlAdr){
                if(!undrlygPrvsInstgAgt2AddrLine && (!undrlygPrvsInstgAgt2TwnNm || !undrlygPrvsInstgAgt2Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("PrvsInstgAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying PreviousInstructingAgent3
        var undrlygPrvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");
        logger.trace("undrlygPrvsInstgAgt3PstlAdr = "+undrlygPrvsInstgAgt3PstlAdr);

        var undrlygPrvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt3AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt3AddrLinePath);
        logger.trace("undrlygPrvsInstgAgt3AddrLine = "+undrlygPrvsInstgAgt3AddrLine);

        var undrlygPrvsInstgAgt3TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt3TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt3TwnNmPath);
        logger.trace("undrlygPrvsInstgAgt3TwnNm = "+undrlygPrvsInstgAgt3TwnNm);

        var undrlygPrvsInstgAgt3CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt3Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt3CtryPath);
        logger.trace("undrlygPrvsInstgAgt3Ctry = "+undrlygPrvsInstgAgt3Ctry);

        if(isPatternPresent(Document3, "<PrvsInstgAgt3>")){
            if(undrlygPrvsInstgAgt3PstlAdr){
                if(!undrlygPrvsInstgAgt3AddrLine && (!undrlygPrvsInstgAgt3TwnNm || !undrlygPrvsInstgAgt3Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("PrvsInstgAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying IntermediaryAgent1
        var undrlygIntrmyAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");
        logger.trace("undrlygIntrmyAgt1PstlAdr = "+undrlygIntrmyAgt1PstlAdr);

        var undrlygIntrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt1AddrLine = getValueFromPath(Document, undrlygIntrmyAgt1AddrLinePath);
        logger.trace("undrlygIntrmyAgt1AddrLine = "+undrlygIntrmyAgt1AddrLine);

        var undrlygIntrmyAgt1TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt1TwnNm = getValueFromPath(Document, undrlygIntrmyAgt1TwnNmPath);
        logger.trace("undrlygIntrmyAgt1TwnNm = "+undrlygIntrmyAgt1TwnNm);

        var undrlygIntrmyAgt1CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt1Ctry = getValueFromPath(Document, undrlygIntrmyAgt1CtryPath);
        logger.trace("undrlygIntrmyAgt1Ctry = "+undrlygIntrmyAgt1Ctry);

        if(isPatternPresent(Document3, "<IntrmyAgt1>")){
            if(undrlygIntrmyAgt1PstlAdr){
                if(!undrlygIntrmyAgt1AddrLine && (!undrlygIntrmyAgt1TwnNm || !undrlygIntrmyAgt1Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt1-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying IntermediaryAgent2
        var undrlygIntrmyAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");
        logger.trace("undrlygIntrmyAgt2PstlAdr = "+undrlygIntrmyAgt2PstlAdr);

        var undrlygIntrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt2AddrLine = getValueFromPath(Document, undrlygIntrmyAgt2AddrLinePath);
        logger.trace("undrlygIntrmyAgt2AddrLine = "+undrlygIntrmyAgt2AddrLine);

        var undrlygIntrmyAgt2TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt2TwnNm = getValueFromPath(Document, undrlygIntrmyAgt2TwnNmPath);
        logger.trace("undrlygIntrmyAgt2TwnNm = "+undrlygIntrmyAgt2TwnNm);

        var undrlygIntrmyAgt2CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt2Ctry = getValueFromPath(Document, undrlygIntrmyAgt2CtryPath);
        logger.trace("undrlygIntrmyAgt2Ctry = "+undrlygIntrmyAgt2Ctry);

        if(isPatternPresent(Document3, "<IntrmyAgt2>")){
            if(undrlygIntrmyAgt2PstlAdr){
                if(!undrlygIntrmyAgt2AddrLine && (!undrlygIntrmyAgt2TwnNm || !undrlygIntrmyAgt2Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt2-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
        // Underlying IntermediaryAgent3
        var undrlygIntrmyAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");
        logger.trace("undrlygIntrmyAgt3PstlAdr = "+undrlygIntrmyAgt3PstlAdr);

        var undrlygIntrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt3AddrLine = getValueFromPath(Document, undrlygIntrmyAgt3AddrLinePath);
        logger.trace("undrlygIntrmyAgt3AddrLine = "+undrlygIntrmyAgt3AddrLine);

        var undrlygIntrmyAgt3TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt3TwnNm = getValueFromPath(Document, undrlygIntrmyAgt3TwnNmPath);
        logger.trace("undrlygIntrmyAgt3TwnNm = "+undrlygIntrmyAgt3TwnNm);

        var undrlygIntrmyAgt3CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt3Ctry = getValueFromPath(Document, undrlygIntrmyAgt3CtryPath);
        logger.trace("undrlygIntrmyAgt3Ctry = "+undrlygIntrmyAgt3Ctry);

        if(isPatternPresent(Document3, "<IntrmyAgt3>")){
            if(undrlygIntrmyAgt3PstlAdr){
                if(!undrlygIntrmyAgt3AddrLine && (!undrlygIntrmyAgt3TwnNm || !undrlygIntrmyAgt3Ctry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("825", "7926", map);
                    return retVal;
                }
            }
        }
        
    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        // OrgnlTxRef SttlmInf InstgRmbrsmntAgt
        var instgRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstgRmbrsmntAgt", "<PstlAdr>");

        var instgRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var instgRmbrsmntAgtAddrLine = getValueFromPath(Document, instgRmbrsmntAgtAddrLinePath);

        var instgRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var instgRmbrsmntAgtTwnNm = getValueFromPath(Document, instgRmbrsmntAgtTwnNmPath);

        var instgRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var instgRmbrsmntAgtCtry = getValueFromPath(Document, instgRmbrsmntAgtCtryPath);

        if(isPatternPresent(Document4, "<InstgRmbrsmntAgt>")){
            if(instgRmbrsmntAgtPstlAdr){
                if(!instgRmbrsmntAgtAddrLine && (!instgRmbrsmntAgtTwnNm || !instgRmbrsmntAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("944", "7926", map);
                    return retVal;
                }
            }
        }
        
        // OrgnlTxRef SttlmInf InstdRmbrsmntAgt
        var instdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstdRmbrsmntAgt", "<PstlAdr>");

        var instdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var instdRmbrsmntAgtAddrLine = getValueFromPath(Document, instdRmbrsmntAgtAddrLinePath);

        var instdRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var instdRmbrsmntAgtTwnNm = getValueFromPath(Document, instdRmbrsmntAgtTwnNmPath);

        var instdRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var instdRmbrsmntAgtCtry = getValueFromPath(Document, instdRmbrsmntAgtCtryPath);

        if(isPatternPresent(Document4, "<InstdRmbrsmntAgt>")){
            if(instdRmbrsmntAgtPstlAdr){
                if(!instdRmbrsmntAgtAddrLine && (!instdRmbrsmntAgtTwnNm || !instdRmbrsmntAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("992", "7926", map);
                    return retVal;
                }
            }
        }
        
        // OrgnlTxRef SttlmInf ThrdRmbrsmntAgt
        var thrdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "ThrdRmbrsmntAgt", "<PstlAdr>");

        var thrdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var thrdRmbrsmntAgtAddrLine = getValueFromPath(Document, thrdRmbrsmntAgtAddrLinePath);

        var thrdRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var thrdRmbrsmntAgtTwnNm = getValueFromPath(Document, thrdRmbrsmntAgtTwnNmPath);

        var thrdRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var thrdRmbrsmntAgtCtry = getValueFromPath(Document, thrdRmbrsmntAgtCtryPath);

        if(isPatternPresent(Document4, "<ThrdRmbrsmntAgt>")){
            if(thrdRmbrsmntAgtPstlAdr){
                if(!thrdRmbrsmntAgtAddrLine && (!thrdRmbrsmntAgtTwnNm || !thrdRmbrsmntAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("IntrmyAgt3-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("1040", "7926", map);
                    return retVal;
                }
            }
        }
        
        // OrgnlTxRef Creditor
        if(orgnlMsgNmId == 'pacs.008.001.08'){	
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");
            logger.trace("orgnlTxRefCdtrPstlAdr = "+orgnlTxRefCdtrPstlAdr);

            var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/AdrLine';
            var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);
            logger.trace("orgnlTxRefCdtrAddrLine = "+orgnlTxRefCdtrAddrLine);

            var orgnlTxRefCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/TwnNm';
            var orgnlTxRefCdtrTwnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnNmPath);
            logger.trace("orgnlTxRefCdtrTwnNm = "+orgnlTxRefCdtrTwnNm);

            var orgnlTxRefCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Ctry';
            var orgnlTxRefCdtrCtry = getValueFromPath(Document, orgnlTxRefCdtrCtryPath);
            logger.trace("orgnlTxRefCdtrCtry = "+orgnlTxRefCdtrCtry);
        }
        
        else if(orgnlMsgNmId == 'pacs.009.001.08'){
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");
            logger.trace("orgnlTxRefCdtrPstlAdr = "+orgnlTxRefCdtrPstlAdr);

            var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);
            logger.trace("orgnlTxRefCdtrAddrLine = "+orgnlTxRefCdtrAddrLine);

            var orgnlTxRefCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var orgnlTxRefCdtrTwnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnNmPath);
            logger.trace("orgnlTxRefCdtrTwnNm = "+orgnlTxRefCdtrTwnNm);

            var orgnlTxRefCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
            var orgnlTxRefCdtrCtry = getValueFromPath(Document, orgnlTxRefCdtrCtryPath);
            logger.trace("orgnlTxRefCdtrCtry = "+orgnlTxRefCdtrCtry);
        }

        if(isPatternPresent(Document4, "<Cdtr>")){
            if(orgnlTxRefCdtrPstlAdr){
                if(!orgnlTxRefCdtrAddrLine && (!orgnlTxRefCdtrTwnNm || !orgnlTxRefCdtrCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("Cdtr-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("2194", "7926", map);
                    return retVal;
                }
            }
        }

        // OrgnlTxRef Debtor
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");
            logger.trace("orgnlTxRefDbtrPstlAdr = "+orgnlTxRefDbtrPstlAdr);

            var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/AdrLine';
            var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);
            logger.trace("orgnlTxRefDbtrAddrLine = "+orgnlTxRefDbtrAddrLine);

            var orgnlTxRefDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/TwnNm';
            var orgnlTxRefDbtrTwnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnNmPath);
            logger.trace("orgnlTxRefDbtrTwnNm = "+orgnlTxRefDbtrTwnNm);

            var orgnlTxRefDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Ctry';
            var orgnlTxRefDbtrCtry = getValueFromPath(Document, orgnlTxRefDbtrCtryPath);
            logger.trace("orgnlTxRefDbtrCtry = "+orgnlTxRefDbtrCtry);
        }
        
        else if(orgnlMsgNmId == 'pacs.009.001.08'){
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");
            logger.trace("orgnlTxRefDbtrPstlAdr = "+orgnlTxRefDbtrPstlAdr);

            var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);
            logger.trace("orgnlTxRefDbtrAddrLine = "+orgnlTxRefDbtrAddrLine);

            var orgnlTxRefDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var orgnlTxRefDbtrTwnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnNmPath);
            logger.trace("orgnlTxRefDbtrTwnNm = "+orgnlTxRefDbtrTwnNm);

            var orgnlTxRefDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
            var orgnlTxRefDbtrCtry = getValueFromPath(Document, orgnlTxRefDbtrCtryPath);
            logger.trace("orgnlTxRefDbtrCtry = "+orgnlTxRefDbtrCtry);
            
        }

        if(isPatternPresent(Document4, "<Dbtr>")){
            if(orgnlTxRefDbtrPstlAdr){
                if(!orgnlTxRefDbtrAddrLine && (!orgnlTxRefDbtrTwnNm || !orgnlTxRefDbtrCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("DBTR-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("1997", "7926", map);
                    return retVal;
                }
            }
        }
        
        // OrgnlTxRef Creditor Agent
        var orgnlTxRefCdtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "CdtrAgt", "<PstlAdr>");
        logger.trace("orgnlTxRefCdtrAgtPstlAdr = "+orgnlTxRefCdtrAgtPstlAdr);

        var orgnlTxRefCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var orgnlTxRefCdtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAgtAddrLinePath);
        logger.trace("orgnlTxRefCdtrAgtAddrLine = "+orgnlTxRefCdtrAgtAddrLine);

        var orgnlTxRefCdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var orgnlTxRefCdtrAgtTwnNm = getValueFromPath(Document, orgnlTxRefCdtrAgtTwnNmPath);
        logger.trace("orgnlTxRefCdtrAgtTwnNm = "+orgnlTxRefCdtrAgtTwnNm);

        var orgnlTxRefCdtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var orgnlTxRefCdtrAgtCtry = getValueFromPath(Document, orgnlTxRefCdtrAgtCtryPath);
        logger.trace("orgnlTxRefCdtrAgtCtry = "+orgnlTxRefCdtrAgtCtry);
            
        if(isPatternPresent(Document4, "<CdtrAgt>")){
            if(orgnlTxRefCdtrAgtPstlAdr){
                if(!orgnlTxRefCdtrAgtAddrLine && (!orgnlTxRefCdtrAgtTwnNm || !orgnlTxRefCdtrAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("CdtrAgt-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("2142", "7926", map);
                    return retVal;
                }
            }
        }

        // OrgnlTxRef Debtor Agent
        var orgnlTxRefDbtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "DbtrAgt", "<PstlAdr>");
        logger.trace("orgnlTxRefDbtrAgtPstlAdr = "+orgnlTxRefDbtrAgtPstlAdr);

        var orgnlTxRefDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var orgnlTxRefDbtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAgtAddrLinePath);
        logger.trace("orgnlTxRefDbtrAgtAddrLine = "+orgnlTxRefDbtrAgtAddrLine);

        var orgnlTxRefDbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var orgnlTxRefDbtrAgtTwnNm = getValueFromPath(Document, orgnlTxRefDbtrAgtTwnNmPath);
        logger.trace("orgnlTxRefDbtrAgtTwnNm = "+orgnlTxRefDbtrAgtTwnNm);

        var orgnlTxRefDbtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var orgnlTxRefDbtrAgtCtry = getValueFromPath(Document, orgnlTxRefDbtrAgtCtryPath);
        logger.trace("orgnlTxRefDbtrAgtCtry = "+orgnlTxRefDbtrAgtCtry);

        if(isPatternPresent(Document4, "<DbtrAgt>")){
            if(orgnlTxRefDbtrAgtPstlAdr){
                if(!orgnlTxRefDbtrAgtAddrLine && (!orgnlTxRefDbtrAgtTwnNm || !orgnlTxRefDbtrAgtCtry)){
                    setHeader(map,"PLCN_validMessage", false);
                    logger.trace("DBTR-If PostalAddress is used & if AddressLine is absent then Country and Town name must be present");
                    retVal = setCommentsForTransaction("2094", "7926", map);
                    return retVal;
                }
            }
        }
        
    }
    
	return retVal;
}

function agentsRuleChipsPacs4(exchange) {
	logger.trace("agentsRuleChipsPacs4");
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	var retVal = 0;
	
	var chrgsInfBicPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/BICFI';
	var chrgsInfBicValue =  getValueFromPath(Document, chrgsInfBicPath);
	logger.trace("agentsRuleChipsPacs4:chrgsInfBicValue  = " + chrgsInfBicValue);
	
	var chrgsInfNmePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/Nm';
	var chrgsInfNme =  getValueFromPath(Document, chrgsInfNmePath);
	logger.trace("agentsRuleChipsPacs4:chrgsInfNme  = " + chrgsInfNme);
	
	var chrgsInfAddrLinePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine =  getValueFromPath(Document, chrgsInfAddrLinePath);
	logger.trace("agentsRuleChipsPacs4:chrgsInfAddrLine  = " + chrgsInfAddrLine);
	
	var chrgsInfTwnNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm =  getValueFromPath(Document, chrgsInfTwnNmPath);
	logger.trace("agentsRuleChipsPacs4:chrgsInfTwnNm  = " + chrgsInfTwnNm);
	
	var chrgsInfCtryPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry =  getValueFromPath(Document, chrgsInfCtryPath);
	logger.trace("agentsRuleChipsPacs4:chrgsInfCtry  = " + chrgsInfCtry);
	
	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(!chrgsInfBicValue){
			if(!chrgsInfNme && (!chrgsInfAddrLine && (!chrgsInfTwnNm || !chrgsInfCtry))){
					setHeader(map,"PLCN_validMessage", false);
					logger.trace("Either BIC or (Name and Postal Address) must be present and both can be present. Other elements remain optional.");
					retVal = setCommentsForTransaction("15", "111", map);
					return retVal;
			}
		}
	}
    
    return retVal;
}

function structuredvsUnstructuredRuleChipsPacs4(exchange){
	logger.trace("structuredvsUnstructuredRuleChipsPacs4");
	var cdtrAgtPstlAdrPath;
	var cdtrAgtPstlAdr;
	var cdtrAgtAddrLinePath;
	var cdtrAgtAddrLine;
	var cdtrAgtTwnNmPath;
	var cdtrAgtTwnNm;
	var cdtrAgtCtryPath;
	var cdtrAgtCtry;

	var dbtrAgtAddrPath;
	var dbtrAgtAddr;
	var dbtrAgtPstlAdrPath;
	var dbtrAgtPstlAdr;
	var dbtrAgtTwnNmPath;
	var dbtrAgtTwnNm;
	var dbtrAgtCtryPath;
	var dbtrAgtCtry;
	var orgnlMsgNmIdPath;
	var orgnlMsgNmId;
	
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	//CreditorAgent	
	cdtrAgtPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtPstlAdr = getValueFromPath(Document, cdtrAgtPstlAdrPath);
	logger.trace("cdtrAgtPstlAdr:" + cdtrAgtPstlAdr);

	cdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
	logger.trace("cdtrAgtAddrLine:" + cdtrAgtAddrLine);

	cdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);
	logger.trace("cdtrAgtTwnNm:" + cdtrAgtTwnNm);

	cdtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);
	logger.trace("cdtrAgtCtry:" + cdtrAgtCtry);

	//DebtorAgent
	dbtrAgtPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtPstlAdr = getValueFromPath(Document, dbtrAgtPstlAdrPath);
	logger.trace("dbtrAgtPstlAdr:" + dbtrAgtPstlAdr);

	dbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);
	logger.trace("dbtrAgtAddrLine:" + dbtrAgtAddrLine);

	dbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);
	logger.trace("dbtrAgtTwnNm:" + dbtrAgtTwnNm);

	dbtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);
	logger.trace("dbtrAgtCtry:" + dbtrAgtCtry);

	//InstructedAgent
	var instdAgtPstlAdrPath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/AdrLine';
	var instdAgtPstlAdr =  getValueFromPath(Document, instdAgtPstlAdrPath);
	logger.trace("instdAgtPstlAdr:" + instdAgtPstlAdr);

	var instdAgtAddrLinePath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/AdrLine';
	var instdAgtAddrLine = getValueFromPath(Document, instdAgtAddrLinePath);
	logger.trace("instdAgtAddrLine:" + instdAgtAddrLine);

	var instdAgtTwnNmPath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/TwnNm';
	var instdAgtTwnNm = getValueFromPath(Document, instdAgtTwnNmPath);
	logger.trace("instdAgtTwnNm:" + instdAgtTwnNm);

	var instdAgtCtryPath = '/Document/PmtRtr/TxInf/InstdAgt/FinInstnId/PstlAdr/Ctry';
	var instdAgtCtry = getValueFromPath(Document, instdAgtCtryPath);
	logger.trace("instdAgtCtry:" + instdAgtCtry);

	//InstructingAgent
	var instgAgtPstlAdrPath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/AdrLine';
	var instgAgtPstlAdr =  getValueFromPath(Document, instgAgtPstlAdrPath);
	logger.trace("instgAgtPstlAdr:" + instgAgtPstlAdr);

	var instgAgtAddrLinePath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/AdrLine';
	var instgAgtAddrLine = getValueFromPath(Document, instgAgtAddrLinePath);
	logger.trace("instgAgtAddrLine:" + instgAgtAddrLine);

	var instgAgtTwnNmPath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/TwnNm';
	var instgAgtTwnNm = getValueFromPath(Document, instgAgtTwnNmPath);
	logger.trace("instgAgtTwnNm:" + instgAgtTwnNm);

	var instgAgtCtryPath = '/Document/PmtRtr/TxInf/InstgAgt/FinInstnId/PstlAdr/Ctry';
	var instgAgtCtry = getValueFromPath(Document, instgAgtCtryPath);
	logger.trace("instgAgtCtry:" + instgAgtCtry);
	
	orgnlMsgNmIdPath = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
	orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
	logger.trace("orgnlMsgNmId = "+orgnlMsgNmId);
	
	if(orgnlMsgNmId == 'pacs.008.001.08'){
		var cdtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
		var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);
		logger.trace("cdtrPstlAdr = "+cdtrPstlAdr);

		var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
		var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
		logger.trace("cdtrAddrLine = "+cdtrAddrLine);

		var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnNm';
		var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);
		logger.trace("cdtrTwnNm = "+cdtrTwnNm);

		var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Ctry';
		var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);
		logger.trace("cdtrCtry = "+cdtrCtry);
		
	}
	
	if(orgnlMsgNmId == 'pacs.009.001.08'){
		var cdtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
		var cdtrPstlAdr =  getValueFromPath(Document, cdtrPstlAdrPath);
		logger.trace("cdtrPstlAdr = "+cdtrPstlAdr);

		var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
		var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
		logger.trace("cdtrAddrLine = "+cdtrAddrLine);

		var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
		var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);
		logger.trace("cdtrTwnNm = "+cdtrTwnNm);

		var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
		var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);
		logger.trace("cdtrCtry = "+cdtrCtry);
		
	}
	
	//DEBTOR
	if(orgnlMsgNmId == 'pacs.008.001.08'){
		var dbtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
		var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);
		logger.trace("dbtrPstlAdr = "+dbtrPstlAdr);

		var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
		var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
		logger.trace("dbtrAddrLine = "+dbtrAddrLine);

		var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnNm';
		var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
		logger.trace("dbtrTwnNm = "+dbtrTwnNm);

		var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Ctry';
		var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
		logger.trace("dbtrCtry = "+dbtrCtry);
		
	}
	
	if(orgnlMsgNmId == 'pacs.009.001.08'){
		var dbtrPstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
		var dbtrPstlAdr =  getValueFromPath(Document, dbtrPstlAdrPath);
		logger.trace("dbtrPstlAdr = "+dbtrPstlAdr);

		var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
		var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
		logger.trace("dbtrAddrLine = "+dbtrAddrLine);

		var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
		var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
		logger.trace("dbtrTwnNm = "+dbtrTwnNm);

		var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
		var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
		logger.trace("dbtrCtry = "+dbtrCtry);
		
	}
	

	//IntermediaryAgent1
	var intrmyAgt1PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1PstlAdr =  getValueFromPath(Document, intrmyAgt1PstlAdrPath);
	logger.trace("intrmyAgt1PstlAdr:" + intrmyAgt1PstlAdr);

	var intrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);
	logger.trace("intrmyAgt1AddrLine:" + intrmyAgt1AddrLine);

	var intrmyAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);
	logger.trace("intrmyAgt1TwnNm:" + intrmyAgt1TwnNm);

	var intrmyAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);
	logger.trace("intrmyAgt1Ctry:" + intrmyAgt1Ctry);

	//IntermediaryAgent2
	var intrmyAgt2PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2PstlAdr =  getValueFromPath(Document, intrmyAgt2PstlAdrPath);
	logger.trace("intrmyAgt2PstlAdr:" + intrmyAgt2PstlAdr);

	var intrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);
	logger.trace("intrmyAgt2AddrLine:" + intrmyAgt2AddrLine);

	var intrmyAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);
	logger.trace("intrmyAgt2TwnNm:" + intrmyAgt2TwnNm);

	var intrmyAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);
	logger.trace("intrmyAgt2Ctry:" + intrmyAgt2Ctry);

	//IntermediaryAgent3
	var intrmyAgt3PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3PstlAdr =  getValueFromPath(Document, intrmyAgt3PstlAdrPath);
	logger.trace("intrmyAgt3PstlAdr:" + intrmyAgt3PstlAdr);

	var intrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);
	logger.trace("intrmyAgt3AddrLine:" + intrmyAgt3AddrLine);

	var intrmyAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);
	logger.trace("intrmyAgt3TwnNm:" + intrmyAgt3TwnNm);

	var intrmyAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);
	logger.trace("intrmyAgt3Ctry:" + intrmyAgt3Ctry);

	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1PstlAdr =  getValueFromPath(Document, prvsInstgAgt1PstlAdrPath);
	logger.trace("prvsInstgAgt1PstlAdr:" + prvsInstgAgt1PstlAdr);

	var prvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);
	logger.trace("prvsInstgAgt1AddrLine:" + prvsInstgAgt1AddrLine);

	var prvsInstgAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);
	logger.trace("prvsInstgAgt1TwnNm:" + prvsInstgAgt1TwnNm);

	var prvsInstgAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);
	logger.trace("prvsInstgAgt1Ctry:" + prvsInstgAgt1Ctry);

	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2PstlAdr =  getValueFromPath(Document, prvsInstgAgt2PstlAdrPath);
	logger.trace("prvsInstgAgt2PstlAdr:" + prvsInstgAgt2PstlAdr);

	var prvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);
	logger.trace("prvsInstgAgt2AddrLine:" + prvsInstgAgt2AddrLine);

	var prvsInstgAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);
	logger.trace("prvsInstgAgt2TwnNm:" + prvsInstgAgt2TwnNm);

	var prvsInstgAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);
	logger.trace("prvsInstgAgt2Ctry:" + prvsInstgAgt2Ctry);

	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3PstlAdr =  getValueFromPath(Document, prvsInstgAgt3PstlAdrPath);
	logger.trace("prvsInstgAgt3PstlAdr:" + prvsInstgAgt3PstlAdr);

	var prvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);
	logger.trace("prvsInstgAgt3PstlAdr:" + prvsInstgAgt3PstlAdr);

	var prvsInstgAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);
	logger.trace("prvsInstgAgt3PstlAdr:" + prvsInstgAgt3PstlAdr);

	var prvsInstgAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);
	logger.trace("prvsInstgAgt3PstlAdr:" + prvsInstgAgt3PstlAdr);

	//ChargesInformation
	var chrgsInfPstlAdrPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfPstlAdr =  getValueFromPath(Document, chrgsInfPstlAdrPath);
	logger.trace("chrgsInfPstlAdr:" + chrgsInfPstlAdr);

	var chrgsInfAddrLinePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);
	logger.trace("chrgsInfAddrLine:" + chrgsInfAddrLine);

	var chrgsInfTwnNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);
	logger.trace("chrgsInfTwnNm:" + chrgsInfTwnNm);

	var chrgsInfCtryPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);
	logger.trace("chrgsInfCtry:" + chrgsInfCtry);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(cdtrAgtAddrLine && (cdtrAgtTwnNm || cdtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(dbtrAgtAddrLine && (dbtrAgtTwnNm || dbtrAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("DbtrAgt-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<InstdAgt>")){
		if(instdAgtPstlAdr){
			if(instdAgtAddrLine && (instdAgtTwnNm || instdAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstdAgt-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}


	if(isPatternPresent(Document1, "<InstgAgt>")){
		if(instgAgtPstlAdr){
			if(instgAgtAddrLine && (instgAgtTwnNm || instgAgtCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("InstgAgt-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}


	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(cdtrAddrLine && (cdtrTwnNm || cdtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Cdtr-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}


	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(dbtrAddrLine && (dbtrTwnNm || dbtrCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("Dbtr-If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}

	}

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(chrgsInfAddrLine && (chrgsInfTwnNm || chrgsInfCtry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(prvsInstgAgt3AddrLine && (prvsInstgAgt3TwnNm || prvsInstgAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}	
	}

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
			if(prvsInstgAgt2PstlAdr){
		if(prvsInstgAgt2AddrLine && (prvsInstgAgt2TwnNm || prvsInstgAgt2Ctry)){
			setHeader(map,"PLCN_validMessage", false);
			logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
			retVal = setCommentsForTransaction("15", "111", map);
			return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(prvsInstgAgt1AddrLine && (prvsInstgAgt1TwnNm || prvsInstgAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(intrmyAgt3AddrLine && (intrmyAgt3TwnNm || intrmyAgt3Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(intrmyAgt2AddrLine && (intrmyAgt2TwnNm || intrmyAgt2Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}
	}

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(intrmyAgt1AddrLine && (intrmyAgt1TwnNm || intrmyAgt1Ctry)){
				setHeader(map,"PLCN_validMessage", false);
				logger.trace("If PstlAddr is used & if Adrline is present then all other optional elements in PostalAddress must be absent");
				retVal = setCommentsForTransaction("15", "111", map);
				return retVal;
			}
		}

	}
	return retVal;	
}

function ibanValidationChipsPacs004(Document, map) {
	var val;
	var retVal = 0;

	logger.trace("In ibanValidationChipsPacs004");

	val = validatePrvsInstgAgt1AcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = val;
	}

	val = validatePrvsInstgAgt2AcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validatePrvsInstgAgt3AcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt1AcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt2AcctIbanChipsPacs004(Document, map);	
	if(val) {
		retVal = retVal + val;
	}

	val = validateIntrmyAgt3AcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateDbtrAcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateDbtrAgtAcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateCdtrAgtAcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}

	val = validateCdtrAcctIbanChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
}

function validatePrvsInstgAgt1AcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt1AcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt1AcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt1AcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validatePrvsInstgAgt2AcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt2AcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt2AcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt2AcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validatePrvsInstgAgt3AcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validatePrvsInstgAgt3AcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validatePrvsInstgAgt3AcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validatePrvsInstgAgt3AcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("46", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt1AcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt1AcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt1AcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateIntrmyAgt1AcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("48", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt2AcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt2AcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt2AcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateIntrmyAgt2AcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("50", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateIntrmyAgt3AcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateIntrmyAgt3AcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3Acct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateIntrmyAgt3AcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("52", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateDbtrAcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateDbtrAcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/DbtrAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateDbtrAcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateDbtrAcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("65", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateDbtrAgtAcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateDbtrAgtAcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/DbtrAgtAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateDbtrAgtAcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateDbtrAgtAcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("67", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateCdtrAgtAcctIbanChipsPacs004(Document, map) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateCdtrAgtAcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/CdtrAgtAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateCdtrAgtAcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateCdtrAgtAcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("69", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function validateCdtrAcctIbanChipsPacs004(Document, map) {
	logger.trace("validateCdtrAcctIbanChipsPacs004");
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	logger.trace("In validateCdtrAcctIbanChipsPacs004");
	path = "/Document/PmtRtr/TxInf/RtrChain/CdtrAcct/Id/IBAN";
	value = getValueFromPath(Document, path);
	logger.trace("validateCdtrAcctIbanChipsPacs004: IBAN value = " + value);

	if(value) {
		validFlag = IBAN.isValid(value);
		logger.trace("validateCdtrAcctIbanChipsPacs004: validFlag value = " + validFlag);

		if(validFlag == false) {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("76", "5714", map);
			retVal = 1;
		}
	}
	return retVal;
}

function externalCodelistValidationChipsPacs004(Document, map) {
	var val;
	var retVal = 0;
	var MsgTypecheck;

	logger.trace("In externalCodelistValidationChipsPacs004");

	val = externalAccountIdentification1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = val;
	}
	
	val = externalClearingSystemIdentification1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	val = externalDiscountAmountType1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	val = externalDocumentLineType1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	val = externalGarnishmentType1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	val = externalOrganisationIdentification1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	val = externalPersonIdentification1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	val = externalProxyAccountType1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
		
	val = externalServiceLevel1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	val = externalTaxAmountType1CodeChipsPacs004(Document, map);
	if(val) {
		retVal = retVal + val;
	}
	
	return retVal;
}

function externalAccountIdentification1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAcct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgtAcct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAcct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgtAcct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1Acct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2Acct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3Acct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1Acct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2Acct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3Acct/Id/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalAccountIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1", "5251", map);
		retVal = 1;
	}
	return retVal;
}

function externalClearingSystemIdentification1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;
	
	
	path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}
	
	path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}
	
	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	
	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	
	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	
	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	
	path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	
	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/ClrSysMmbId/ClrSysId/Cd';
	retVal = checkExternalCodelist(path, 'ExternalClearingSystemIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("4", "5251", map);
		retVal = 1;
	}

	return retVal;
}

function externalDocumentLineType1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/RfrdDocInf/LineDtls/Id/Tp/CdOrPrtry/Cd';
	retVal = checkExternalCodelist(path, 'ExternalDocumentLineType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("6", "5251", map);
		retVal = 1;
	}
	
	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/RmtInf/Strd/RfrdDocInf/LineDtls/Id/Tp/CdOrPrtry/Cd';
	retVal = checkExternalCodelist(path, 'ExternalDocumentLineType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("6", "5251", map);
		retVal = 1;
	}
	
	return retVal;	
}

function externalDiscountAmountType1CodeChipsPacs004(Document, map) {
	
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/DscntApldAmt/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalDiscountAmountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("5", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/RfrdDocAmt/DscntApldAmt/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalDiscountAmountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("5", "5251", map);
		retVal = 1;

	}
	
	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/DscntApldAmt/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalDiscountAmountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("5", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/RmtInf/Strd/RfrdDocAmt/DscntApldAmt/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalDiscountAmountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("5", "5251", map);
		retVal = 1;

	}
	
	return retVal;
}

function externalGarnishmentType1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/GrnshmtRmt/Tp/CdOrPrtry/Cd';
	retVal = checkExternalCodelist(path, 'ExternalGarnishmentType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("7", "5251", map);
		retVal = 1;
	}
	
	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/Tp/CdOrPrtry/Cd';
	retVal = checkExternalCodelist(path, 'ExternalGarnishmentType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("7", "5251", map);
		retVal = 1;
	}
	
	return retVal;	
}

function externalOrganisationIdentification1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/Invcee/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/Invcr/Id/OrgId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalOrganisationIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("9", "5251", map);
		retVal = 1;

	}
	return retVal;
}

function externalPersonIdentification1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/Invcr/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/Invcee/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/PrvtId/Othr/SchmeNm/Cd';
	retVal = checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("10", "5251", map);
		retVal = 1;

	}
	return retVal;	
}

function externalProxyAccountType1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;


	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1Acct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2Acct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3Acct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1Acct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2Acct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3Acct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAcct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgtAcct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgtAcct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;

	}

	path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAcct/Prxy/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("11", "5251", map);
		retVal = 1;
	}
	return retVal;	
}

function externalServiceLevel1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/SvcLvl/Cd';
	retVal = checkExternalCodelist(path, 'ExternalServiceLevel1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("13", "5251", map);
		retVal = 1;
	}
	return retVal;	
}

function externalTaxAmountType1CodeChipsPacs004(Document, map) {
	var path;
	var retVal = 0;

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/TaxAmt/Tp/Cd';
	retVal = checkExternalCodelist(path, 'ExternalTaxAmountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("14", "5251", map);
		retVal = 1;
	}

	path = '/Document/PmtRtr/TxInf/OrgnlTxRef/RmtInf/Strd/RfrdDocAmt/TaxAmt/Tp/Cd ';
	retVal = checkExternalCodelist(path, 'ExternalTaxAmountType1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("14", "5251", map);
		retVal = 1;
	}
	return retVal;
}

function chrgBrMultipleOccurenceChipsPacs008(exchange){
	logger.info("In chrgBrMultipleOccurenceChipsPacs008");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    var chrgBrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgBr';
    var chrgBr = getValueFromPath(Document, chrgBrPath);
    
    var chrgsInfCount = countXmlNodes(Document, "CdtTrfTxInf", "ChrgsInf");
    logger.info("chrgsInfCount = " + chrgsInfCount);
    
	if(chrgBr == "DEBT" && chrgsInfCount > 1){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If ChargeBearer contains DEBT then only one occurence of ChargesInformation is allowed");
        retVal = setCommentsForTransaction("342", "7070", map); // new error code
        return retVal;
    }    

    return retVal;
}

function chrgBrPrepaidChargesRuleChipsPacs008(exchange){
	logger.info("In chrgBrPrepaidChargesRuleChipsPacs008");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    var intrBkSttlmAmtCcyPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy';
    var intrBkSttlmAmtCcy = getValueFromPath(Document, intrBkSttlmAmtCcyPath);

    var intrBkSttlmAmtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt';
    var intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
    
    var instdAmtCcyPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAmt/@Ccy';
    var instdAmtCcy = getValueFromPath(Document, instdAmtCcyPath);

    var instdAmtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAmt';
    var instdAmt = getValueFromPath(Document, instdAmtPath);
    
    var chrgsInfCount = countXmlNodes(Document, "CdtTrfTxInf", "ChrgsInf");
    logger.info("chrgsInfCount = " + chrgsInfCount);
    
    var chrgsInfAmtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Amt'
    var chrgsInfAmt = getValueFromPath(Document, chrgsInfAmtPath);
    
    var chrgBrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgBr';
    var chrgBr = getValueFromPath(Document, chrgBrPath);
    
	if(chrgBr == "DEBT"){
        if(instdAmtCcy == intrBkSttlmAmtCcy){
            if(intrBkSttlmAmt > instdAmt && (chrgsInfCount < 1 || !(parseFloat(chrgsInfAmt) > 0)) ){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If ChargeBearer contains DEBT and charges are prepaid then Charges Information is not optional and amount must not be zero");
                retVal = setCommentsForTransaction("342", "7071", map); // new error code
            }
        }
        if(instdAmtCcy != intrBkSttlmAmtCcy){
            // raise a violation for currency mismatch as discussed with Avinash
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Instructed Amount and Interbank Settlement amount currency mismatch");
                retVal = setCommentsForTransaction("342", "7074", map); // new error code
        }
    }    

    return retVal;
}

function gracePeriodHybridFormalRuleChipsPacs8(exchange){ 
	logger.info("In gracePeriodHybridFormalRuleChipsPacs8");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	logger.info("gracePeriodHybridFormalRuleChipsPacs8: Document1 = " + Document1);

	//CreditorAgent	
	var cdtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<PstlAdr>");

	var cdtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
	logger.info("gracePeriodHybridFormalRuleChipsPacs8: cdtrAgtAddrLine:" + cdtrAgtAddrLine);

	var cdtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	var cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	var cdtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	var cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

	var cdtrAgtDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Dept';
	var cdtrAgtDept = getValueFromPath(Document, cdtrAgtDeptPath);

	var cdtrAgtSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
	var cdtrAgtSubDept = getValueFromPath(Document, cdtrAgtSubDeptPath);

	var cdtrAgtStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
	var cdtrAgtStrtNm = getValueFromPath(Document, cdtrAgtStrtNmPath);

	var cdtrAgtBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
	var cdtrAgtBldgNb = getValueFromPath(Document, cdtrAgtBldgNbPath);

	var cdtrAgtBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
	var cdtrAgtBldgNm = getValueFromPath(Document, cdtrAgtBldgNmPath);

	var cdtrAgtFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Flr';
	var cdtrAgtFlr = getValueFromPath(Document, cdtrAgtFlrPath);

	var cdtrAgtPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
	var cdtrAgtPstBx = getValueFromPath(Document, cdtrAgtPstBxPath);

	var cdtrAgtRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Room';
	var cdtrAgtRoom = getValueFromPath(Document, cdtrAgtRoomPath);

	var cdtrAgtPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
	var cdtrAgtPstCd = getValueFromPath(Document, cdtrAgtPstCdPath);

	var cdtrAgtTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var cdtrAgtTwnLctnNm = getValueFromPath(Document, cdtrAgtTwnLctnNmPath);

	var cdtrAgtDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var cdtrAgtDstrctNm = getValueFromPath(Document, cdtrAgtDstrctNmPath);

	var cdtrAgtCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var cdtrAgtCtrySubDvsn = getValueFromPath(Document, cdtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(cdtrAgtAddrLine && (cdtrAgtTwnNm || cdtrAgtCtry || cdtrAgtDept||cdtrAgtSubDept||cdtrAgtStrtNm||cdtrAgtBldgNb||cdtrAgtBldgNm||cdtrAgtFlr||cdtrAgtPstBx||cdtrAgtRoom||cdtrAgtPstCd||cdtrAgtTwnLctnNm||cdtrAgtDstrctNm||cdtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "CdtrAgt", "AdrLine");
				if(!cdtrAgtTwnNm || !cdtrAgtCtry || count > 2) { //hybrid
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("889", "7528", map);
					return retVal;
				}			
			}
		}
	}

	//DebtorAgent
	var dbtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<PstlAdr>");

	var dbtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

	var dbtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	var dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	var dbtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	var dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	var dbtrAgtDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Dept';
	var dbtrAgtDept = getValueFromPath(Document, dbtrAgtDeptPath);

	var dbtrAgtSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
	var dbtrAgtSubDept = getValueFromPath(Document, dbtrAgtSubDeptPath);

	var dbtrAgtStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
	var dbtrAgtStrtNm = getValueFromPath(Document, dbtrAgtStrtNmPath);

	var dbtrAgtBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
	var dbtrAgtBldgNb = getValueFromPath(Document, dbtrAgtBldgNbPath);

	var dbtrAgtBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
	var dbtrAgtBldgNm = getValueFromPath(Document, dbtrAgtBldgNmPath);

	var dbtrAgtFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Flr';
	var dbtrAgtFlr = getValueFromPath(Document, dbtrAgtFlrPath);

	var dbtrAgtPstBXPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
	var dbtrAgtPstBx = getValueFromPath(Document, dbtrAgtPstBXPath);

	var dbtrAgtRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Room';
	var dbtrAgtRoom = getValueFromPath(Document, dbtrAgtRoomPath);

	var dbtrAgtPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
	var dbtrAgtPstCd = getValueFromPath(Document, dbtrAgtPstCdPath);

	var dbtrAgtTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var dbtrAgtTwnLctnNm = getValueFromPath(Document, dbtrAgtTwnLctnNmPath);

	var dbtrAgtDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var dbtrAgtDstrctNm = getValueFromPath(Document, dbtrAgtDstrctNmPath);

	var dbtrAgtCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var dbtrAgtCtrySubDvsn = getValueFromPath(Document, dbtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(dbtrAgtAddrLine && (dbtrAgtTwnNm || dbtrAgtCtry || dbtrAgtDept||dbtrAgtSubDept||dbtrAgtStrtNm||dbtrAgtBldgNb||dbtrAgtBldgNm||dbtrAgtFlr||dbtrAgtPstBx||dbtrAgtRoom||dbtrAgtPstCd ||dbtrAgtTwnLctnNm||dbtrAgtDstrctNm||dbtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "DbtrAgt", "AdrLine");
				if(!dbtrAgtTwnNm || !dbtrAgtCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("841", "7528", map);
					return retVal;
				}
			}
		}
	}

	//CREDITOR
	var cdtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<PstlAdr>");

	var cdtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

	var cdtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

	var cdtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

	var cdtrDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Dept';
	var cdtrDept = getValueFromPath(Document, cdtrDeptPath);

	var cdtrSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/SubDept';
	var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

	var cdtrStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/StrtNm';
	var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

	var cdtrBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/BldgNb';
	var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

	var cdtrBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/BldgNm';
	var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

	var cdtrFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Flr';
	var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

	var cdtrPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/PstBx';
	var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

	var cdtrRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Room';
	var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

	var cdtrPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/PstCd';
	var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

	var cdtrTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnLctnNm';
	var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

	var cdtrDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/DstrctNm';
	var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

	var cdtrCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/CtrySubDvsn';
	var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(cdtrAddrLine && (cdtrTwnNm || cdtrCtry || cdtrDept||cdtrSubDept||cdtrStrtNm||cdtrBldgNb||cdtrBldgNm||cdtrFlr||cdtrPstBx||cdtrRoom||cdtrPstCd||cdtrTwnLctnNm ||cdtrDstrctNm||cdtrCtrySubDvsn)){
				var count = countXmlNodes(Document, "Cdtr", "AdrLine");
				if(!cdtrTwnNm || !cdtrCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("945", "7528", map);
					return retVal;
				}
			}
		}
	}	

	//DEBTOR
	var dbtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<PstlAdr>");
	
	var dbtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
	
	var dbtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
	
	var dbtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
	
	var dbtrDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Dept';
	var dbtrDept = getValueFromPath(Document, dbtrDeptPath);
	
	var dbtrSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/SubDept';
	var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);
	
	var dbtrStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/StrtNm';
	var dbtrStrNm = getValueFromPath(Document, dbtrStrtNmPath);
	
	var dbtrBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/BldgNb';
	var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);
	
	var dbtrBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/BldgNm';
	var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);
	
	var dbtrFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Flr';
	var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);
	
	var dbtrPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/PstBx';
	var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);
	
	var dbtrRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Room';
	var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);
	
	var dbtrPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/PstCd';
	var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);
	
	var dbtrTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnLctnNm';
	var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);
	
	var dbtrDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/DstrctNm';
	var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);
	
	var dbtrCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/CtrySubDvsn';
	var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);
	
	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(dbtrAddrLine && (dbtrTwnNm||dbtrCtry||dbtrDept||dbtrSubDept||dbtrStrNm||dbtrBldgNb||dbtrBldgNm||dbtrFlr||dbtrPstBx||dbtrRoom||dbtrPstCd||dbtrTwnLctnNm||dbtrDstrctNm||dbtrCtrySubDvsn)){
				var count = countXmlNodes(Document, "Dbtr", "AdrLine");
				if(!dbtrTwnNm || !dbtrCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("779", "7528", map);
					return retVal;
				}
			}
		}
	}

	//IntermediaryAgent1
	var intrmyAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<PstlAdr>");

	var intrmyAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	var intrmyAgt1DepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
	var intrmyAgt1Depart = getValueFromPath(Document, intrmyAgt1DepartPath);

	var intrmyAgt1SubDepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt1SubDepart = getValueFromPath(Document, intrmyAgt1SubDepartPath);

	var intrmyAgt1StrtNamePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt1StrtName = getValueFromPath(Document, intrmyAgt1StrtNamePath);

	var intrmyAgt1BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt1BldgNb = getValueFromPath(Document, intrmyAgt1BldgNbPath);

	var intrmyAgt1BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt1BldgNm = getValueFromPath(Document, intrmyAgt1BldgNmPath);

	var intrmyAgt1FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
	var intrmyAgt1Flr = getValueFromPath(Document, intrmyAgt1FlrPath);

	var intrmyAgt1PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt1PstBx = getValueFromPath(Document, intrmyAgt1PstBxPath);

	var intrmyAgt1RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
	var intrmyAgt1Room = getValueFromPath(Document, intrmyAgt1RoomPath);

	var intrmyAgt1PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt1PstCd = getValueFromPath(Document, intrmyAgt1PstCdPath);

	var intrmyAgt1TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt1TwnLctnNm = getValueFromPath(Document, intrmyAgt1TwnLctnNmPath);

	var intrmyAgt1DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt1DstrctNm = getValueFromPath(Document, intrmyAgt1DstrctNmPath);

	var intrmyAgt1CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt1CtrySubDvsn = getValueFromPath(Document, intrmyAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(intrmyAgt1AddrLine && (intrmyAgt1TwnNm||intrmyAgt1Ctry||intrmyAgt1Depart || intrmyAgt1SubDepart || intrmyAgt1StrtName || intrmyAgt1BldgNb || intrmyAgt1BldgNm || intrmyAgt1Flr || intrmyAgt1PstBx || intrmyAgt1Room || intrmyAgt1PstCd || intrmyAgt1TwnLctnNm || intrmyAgt1DstrctNm  || intrmyAgt1CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt1", "AdrLine");
				if(!intrmyAgt1TwnNm || !intrmyAgt1Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("549", "7528", map);
					return retVal;
				}
			}
		}
	}

	//IntermediaryAgent2
	var intrmyAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<PstlAdr>");

	var intrmyAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	var intrmyAgt2DepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
	var intrmyAgt2Depart = getValueFromPath(Document, intrmyAgt2DepartPath);

	var intrmyAgt2SubDepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt2SubDepart = getValueFromPath(Document, intrmyAgt2SubDepartPath);

	var intrmyAgt2StrtNamePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt2StrtName = getValueFromPath(Document, intrmyAgt2StrtNamePath);

	var intrmyAgt2BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt2BldgNb = getValueFromPath(Document, intrmyAgt2BldgNbPath);

	var intrmyAgt2BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt2BldgNm = getValueFromPath(Document, intrmyAgt2BldgNmPath);

	var intrmyAgt2FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
	var intrmyAgt2Flr = getValueFromPath(Document, intrmyAgt2FlrPath);

	var intrmyAgt2PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt2PstBx = getValueFromPath(Document, intrmyAgt2PstBxPath);

	var intrmyAgt2RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
	var intrmyAgt2Room = getValueFromPath(Document, intrmyAgt2RoomPath);

	var intrmyAgt2PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt2PstCd = getValueFromPath(Document, intrmyAgt2PstCdPath);

	var intrmyAgt2TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt2TwnLctnNm = getValueFromPath(Document, intrmyAgt2TwnLctnNmPath);

	var intrmyAgt2DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt2DstrctNm = getValueFromPath(Document, intrmyAgt2DstrctNmPath);

	var intrmyAgt2CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt2CtrySubDvsn = getValueFromPath(Document, intrmyAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(intrmyAgt2AddrLine && (intrmyAgt2TwnNm || intrmyAgt2Ctry || intrmyAgt2Depart || intrmyAgt2SubDepart || intrmyAgt2StrtName || intrmyAgt2BldgNb || intrmyAgt2BldgNm || intrmyAgt2Flr || intrmyAgt2PstBx || intrmyAgt2Room || intrmyAgt2PstCd || intrmyAgt2TwnLctnNm || intrmyAgt2DstrctNm  || intrmyAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt2", "AdrLine");
				if(!intrmyAgt2TwnNm || !intrmyAgt2Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("597", "7528", map);
					return retVal;
				}
			}
		}
	}

	//IntermediaryAgent3
	var intrmyAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<PstlAdr>");

	var intrmyAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	var intrmyAgt3DepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
	var intrmyAgt3Depart = getValueFromPath(Document, intrmyAgt3DepartPath);

	var intrmyAgt3SubDepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt3SubDepart = getValueFromPath(Document, intrmyAgt3SubDepartPath);

	var intrmyAgt3StrtNamePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt3StrtName = getValueFromPath(Document, intrmyAgt3StrtNamePath);

	var intrmyAgt3BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt3BldgNb = getValueFromPath(Document, intrmyAgt3BldgNbPath);

	var intrmyAgt3BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt3BldgNm = getValueFromPath(Document, intrmyAgt3BldgNmPath);

	var intrmyAgt3FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
	var intrmyAgt3Flr = getValueFromPath(Document, intrmyAgt3FlrPath);

	var intrmyAgt3PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt3PstBx = getValueFromPath(Document, intrmyAgt3PstBxPath);

	var intrmyAgt3RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
	var intrmyAgt3Room = getValueFromPath(Document, intrmyAgt3RoomPath);

	var intrmyAgt3PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt3PstCd = getValueFromPath(Document, intrmyAgt3PstCdPath);

	var intrmyAgt3TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt3TwnLctnNm = getValueFromPath(Document, intrmyAgt3TwnLctnNmPath);

	var intrmyAgt3DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt3DstrctNm = getValueFromPath(Document, intrmyAgt3DstrctNmPath);

	var intrmyAgt3CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt3CtrySubDvsn = getValueFromPath(Document, intrmyAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(intrmyAgt3AddrLine && (intrmyAgt3TwnNm || intrmyAgt3Ctry || intrmyAgt3Depart || intrmyAgt3SubDepart || intrmyAgt3StrtName || intrmyAgt3BldgNb || intrmyAgt3BldgNm || intrmyAgt3Flr || intrmyAgt3PstBx || intrmyAgt3Room || intrmyAgt3PstCd || intrmyAgt3TwnLctnNm || intrmyAgt3DstrctNm  || intrmyAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt3", "AdrLine");
				if(!intrmyAgt3TwnNm || !intrmyAgt3Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("645", "7528", map);
					return retVal;
				}
			}
		}
	}

	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");

	var prvsInstgAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	var prvsInstgAgt1DeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt1Dept = getValueFromPath(Document, prvsInstgAgt1DeptPath);

	var prvsInstgAgt1SubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt1SubDept = getValueFromPath(Document, prvsInstgAgt1SubDeptPath);

	var prvsInstgAgt1StrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt1StrtNm = getValueFromPath(Document, prvsInstgAgt1StrtNmPath);

	var prvsInstgAgt1BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt1BldgNb = getValueFromPath(Document, prvsInstgAgt1BldgNbPath);

	var prvsInstgAgt1BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt1BldgNm = getValueFromPath(Document, prvsInstgAgt1BldgNmPath);

	var prvsInstgAgt1FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt1Flr = getValueFromPath(Document, prvsInstgAgt1FlrPath);

	var prvsInstgAgt1PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt1PstBx = getValueFromPath(Document, prvsInstgAgt1PstBxPath);

	var prvsInstgAgt1RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt1Room = getValueFromPath(Document, prvsInstgAgt1RoomPath);

	var prvsInstgAgt1PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt1PstCd = getValueFromPath(Document, prvsInstgAgt1PstCdPath);

	var prvsInstgAgt1TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt1TwnLctnNm = getValueFromPath(Document, prvsInstgAgt1TwnLctnNmPath);

	var prvsInstgAgt1DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt1DstrctNm = getValueFromPath(Document, prvsInstgAgt1DstrctNmPath);

	var prvsInstgAgt1CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(prvsInstgAgt1AddrLine && (prvsInstgAgt1TwnNm || prvsInstgAgt1Ctry || prvsInstgAgt1Dept || prvsInstgAgt1SubDept || prvsInstgAgt1StrtNm || prvsInstgAgt1BldgNb || prvsInstgAgt1BldgNm || prvsInstgAgt1Flr || prvsInstgAgt1PstBx || prvsInstgAgt1Room || prvsInstgAgt1PstCd || prvsInstgAgt1TwnLctnNm || prvsInstgAgt1DstrctNm || prvsInstgAgt1CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt1", "AdrLine");
				if(!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("379", "7528", map);
					return retVal;
				}
			}
		}
	}

	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<PstlAdr>");

	var prvsInstgAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	var prvsInstgAgt2DeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt2Dept = getValueFromPath(Document, prvsInstgAgt2DeptPath);

	var prvsInstgAgt2SubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt2SubDept = getValueFromPath(Document, prvsInstgAgt2SubDeptPath);

	var prvsInstgAgt2StrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt2StrtNm = getValueFromPath(Document, prvsInstgAgt2StrtNmPath);

	var prvsInstgAgt2BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt2BldgNb = getValueFromPath(Document, prvsInstgAgt2BldgNbPath);

	var prvsInstgAgt2BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt2BldgNm = getValueFromPath(Document, prvsInstgAgt2BldgNmPath);

	var prvsInstgAgt2FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt2Flr = getValueFromPath(Document, prvsInstgAgt2FlrPath);

	var prvsInstgAgt2PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt2PstBx = getValueFromPath(Document, prvsInstgAgt2PstBxPath);

	var prvsInstgAgt2RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt2Room = getValueFromPath(Document, prvsInstgAgt2RoomPath);

	var prvsInstgAgt2PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt2PstCd = getValueFromPath(Document, prvsInstgAgt2PstCdPath);

	var prvsInstgAgt2TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt2TwnLctnNm = getValueFromPath(Document, prvsInstgAgt2TwnLctnNmPath);

	var prvsInstgAgt2DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt2DstrctNm = getValueFromPath(Document, prvsInstgAgt2DstrctNmPath);

	var prvsInstgAgt2CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
		if(prvsInstgAgt2PstlAdr){
			if(prvsInstgAgt2AddrLine && (prvsInstgAgt2TwnNm || prvsInstgAgt2Ctry || prvsInstgAgt2Dept || prvsInstgAgt2SubDept || prvsInstgAgt2StrtNm || prvsInstgAgt2BldgNb || prvsInstgAgt2BldgNm || prvsInstgAgt2Flr || prvsInstgAgt2PstBx || prvsInstgAgt2Room || prvsInstgAgt2PstCd || prvsInstgAgt2TwnLctnNm || prvsInstgAgt2DstrctNm || prvsInstgAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt2", "AdrLine");
				if(!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("427", "7528", map);
					return retVal;
				}
			}
		}
	}

	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<PstlAdr>");

	var prvsInstgAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

	var prvsInstgAgt3DeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt3Dept = getValueFromPath(Document, prvsInstgAgt3DeptPath);

	var prvsInstgAgt3SubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt3SubDept = getValueFromPath(Document, prvsInstgAgt3SubDeptPath);

	var prvsInstgAgt3StrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt3StrtNm = getValueFromPath(Document, prvsInstgAgt3StrtNmPath);

	var prvsInstgAgt3BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt3BldgNb = getValueFromPath(Document, prvsInstgAgt3BldgNbPath);

	var prvsInstgAgt3BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt3BldgNm = getValueFromPath(Document, prvsInstgAgt3BldgNmPath);

	var prvsInstgAgt3FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt3Flr = getValueFromPath(Document, prvsInstgAgt3FlrPath);

	var prvsInstgAgt3PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt3PstBx = getValueFromPath(Document, prvsInstgAgt3PstBxPath);

	var prvsInstgAgt3RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt3Room = getValueFromPath(Document, prvsInstgAgt3RoomPath);

	var prvsInstgAgt3PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt3PstCd = getValueFromPath(Document, prvsInstgAgt3PstCdPath);

	var prvsInstgAgt3TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt3TwnLctnNm = getValueFromPath(Document, prvsInstgAgt3TwnLctnNmPath);

	var prvsInstgAgt3DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt3DstrctNm = getValueFromPath(Document, prvsInstgAgt3DstrctNmPath);

	var prvsInstgAgt3CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(prvsInstgAgt3AddrLine && (prvsInstgAgt3TwnNm || prvsInstgAgt3Ctry || prvsInstgAgt3Dept || prvsInstgAgt3SubDept || prvsInstgAgt3StrtNm || prvsInstgAgt3BldgNb || prvsInstgAgt3BldgNm || prvsInstgAgt3Flr || prvsInstgAgt3PstBx || prvsInstgAgt3Room || prvsInstgAgt3PstCd || prvsInstgAgt3TwnLctnNm || prvsInstgAgt3DstrctNm || prvsInstgAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt3", "AdrLine");
				if(!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("475", "7528", map);
					return retVal;
				}
			}
		}
	}

	//ChargesInformation
	var chrgsInfPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "ChrgsInf", "<PstlAdr>");

	var chrgsInfAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);

	var chrgsInfTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);

	var chrgsInfCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);

	var chrgsInfDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Dept';
	var chrgsInfDept = getValueFromPath(Document, chrgsInfDeptPath);

	var chrgsInfSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/SubDept';
	var chrgsInfSubDept = getValueFromPath(Document, chrgsInfSubDeptPath);

	var chrgsInfStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/StrtNm';
	var chrgsInfStrtNm = getValueFromPath(Document, chrgsInfStrtNmPath);

	var chrgsInfBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNb';
	var chrgsInfBldgNb = getValueFromPath(Document, chrgsInfBldgNbPath);

	var chrgsInfBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNm';
	var chrgsInfBldgNm = getValueFromPath(Document, chrgsInfBldgNmPath);

	var chrgsInfFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Flr';
	var chrgsInfFlr = getValueFromPath(Document, chrgsInfFlrPath);

	var chrgsInfPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstBx';
	var chrgsInfPstBX = getValueFromPath(Document, chrgsInfPstBxPath);

	var chrgsInfRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Room';
	var chrgsInfRoom = getValueFromPath(Document, chrgsInfRoomPath);

	var chrgsInfPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstCd';
	var chrgsInfPstCd = getValueFromPath(Document, chrgsInfPstCdPath);

	var chrgsInfTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnLctnNm';
	var chrgsInfTwnLctnNm = getValueFromPath(Document, chrgsInfTwnLctnNmPath);

	var chrgsInfDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/DstrctNm';
	var chrgsInfDstrctNm = getValueFromPath(Document, chrgsInfDstrctNmPath);

	var chrgsInfCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
	var chrgsInfCtrySubDvsn = getValueFromPath(Document, chrgsInfCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(chrgsInfAddrLine && (chrgsInfTwnNm || chrgsInfCtry || chrgsInfDept || chrgsInfSubDept || chrgsInfStrtNm || chrgsInfBldgNb || chrgsInfBldgNm || chrgsInfFlr|| chrgsInfPstBX|| chrgsInfRoom|| chrgsInfPstCd || chrgsInfTwnLctnNm|| chrgsInfDstrctNm || chrgsInfCtrySubDvsn)){
				var count = countXmlNodes(Document, "ChrgsInf", "AdrLine");
				if(!chrgsInfTwnNm || !chrgsInfCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs8: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("347", "7528", map);
					return retVal;
				}
			}
		}
	}
	logger.info("gracePeriodHybridFormalRuleChipsPacs8 completed");
	return retVal;	
}

function gracePeriodUnstructuredFormalRuleChipsPacs8(exchange){ 
	logger.info("In gracePeriodUnstructuredFormalRuleChipsPacs8");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);


	//CreditorAgent	
	var cdtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<PstlAdr>");

	var cdtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
	logger.info("cdtrAgtAddrLine:" + cdtrAgtAddrLine);

	var cdtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	var cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	var cdtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	var cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

	var cdtrAgtDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Dept';
	var cdtrAgtDept = getValueFromPath(Document, cdtrAgtDeptPath);

	var cdtrAgtSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
	var cdtrAgtSubDept = getValueFromPath(Document, cdtrAgtSubDeptPath);

	var cdtrAgtStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
	var cdtrAgtStrtNm = getValueFromPath(Document, cdtrAgtStrtNmPath);

	var cdtrAgtBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
	var cdtrAgtBldgNb = getValueFromPath(Document, cdtrAgtBldgNbPath);

	var cdtrAgtBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
	var cdtrAgtBldgNm = getValueFromPath(Document, cdtrAgtBldgNmPath);

	var cdtrAgtFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Flr';
	var cdtrAgtFlr = getValueFromPath(Document, cdtrAgtFlrPath);

	var cdtrAgtPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
	var cdtrAgtPstBx = getValueFromPath(Document, cdtrAgtPstBxPath);

	var cdtrAgtRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Room';
	var cdtrAgtRoom = getValueFromPath(Document, cdtrAgtRoomPath);

	var cdtrAgtPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
	var cdtrAgtPstCd = getValueFromPath(Document, cdtrAgtPstCdPath);

	var cdtrAgtTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var cdtrAgtTwnLctnNm = getValueFromPath(Document, cdtrAgtTwnLctnNmPath);

	var cdtrAgtDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var cdtrAgtDstrctNm = getValueFromPath(Document, cdtrAgtDstrctNmPath);

	var cdtrAgtCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var cdtrAgtCtrySubDvsn = getValueFromPath(Document, cdtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(cdtrAgtAddrLine && (!cdtrAgtCtry&& !cdtrAgtTwnNm&& !cdtrAgtDept&& !cdtrAgtSubDept&& !cdtrAgtStrtNm&& !cdtrAgtBldgNb&& !cdtrAgtBldgNm&& !cdtrAgtFlr&& !cdtrAgtPstBx&& !cdtrAgtRoom&& !cdtrAgtPstCd&& !cdtrAgtTwnLctnNm&& !cdtrAgtDstrctNm&& !cdtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "CdtrAgt", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var cdtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
						var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
						var adrLineLength = cdtrAgtAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("889", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//DebtorAgent
	var dbtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<PstlAdr>");

	var dbtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

	var dbtrAgtTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	var dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	var dbtrAgtCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	var dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	var dbtrAgtDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Dept';
	var dbtrAgtDept = getValueFromPath(Document, dbtrAgtDeptPath);

	var dbtrAgtSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
	var dbtrAgtSubDept = getValueFromPath(Document, dbtrAgtSubDeptPath);

	var dbtrAgtStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
	var dbtrAgtStrtNm = getValueFromPath(Document, dbtrAgtStrtNmPath);

	var dbtrAgtBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
	var dbtrAgtBldgNb = getValueFromPath(Document, dbtrAgtBldgNbPath);

	var dbtrAgtBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
	var dbtrAgtBldgNm = getValueFromPath(Document, dbtrAgtBldgNmPath);

	var dbtrAgtFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Flr';
	var dbtrAgtFlr = getValueFromPath(Document, dbtrAgtFlrPath);

	var dbtrAgtPstBXPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
	var dbtrAgtPstBx = getValueFromPath(Document, dbtrAgtPstBXPath);

	var dbtrAgtRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Room';
	var dbtrAgtRoom = getValueFromPath(Document, dbtrAgtRoomPath);

	var dbtrAgtPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
	var dbtrAgtPstCd = getValueFromPath(Document, dbtrAgtPstCdPath);

	var dbtrAgtTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var dbtrAgtTwnLctnNm = getValueFromPath(Document, dbtrAgtTwnLctnNmPath);

	var dbtrAgtDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var dbtrAgtDstrctNm = getValueFromPath(Document, dbtrAgtDstrctNmPath);

	var dbtrAgtCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var dbtrAgtCtrySubDvsn = getValueFromPath(Document, dbtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(dbtrAgtAddrLine && (!dbtrAgtCtry&& !dbtrAgtTwnNm&& !dbtrAgtDept&& !dbtrAgtSubDept&& !dbtrAgtStrtNm&& !dbtrAgtBldgNb&& !dbtrAgtBldgNm&& !dbtrAgtFlr&& !dbtrAgtPstBx&& !dbtrAgtRoom&& !dbtrAgtPstCd && !dbtrAgtTwnLctnNm&& !dbtrAgtDstrctNm&& !dbtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "DbtrAgt", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var dbtrAgtAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
						var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);
						var adrLineLength = dbtrAgtAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("841", "7527", map);
							return retVal;							
						}	
					}
				}
			}
		}
	}


	//CREDITOR
	var cdtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<PstlAdr>");

	var cdtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

	var cdtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

	var cdtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

	var cdtrDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Dept';
	var cdtrDept = getValueFromPath(Document, cdtrDeptPath);

	var cdtrSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/SubDept';
	var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

	var cdtrStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/StrtNm';
	var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

	var cdtrBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/BldgNb';
	var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

	var cdtrBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/BldgNm';
	var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

	var cdtrFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Flr';
	var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

	var cdtrPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/PstBx';
	var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

	var cdtrRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Room';
	var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

	var cdtrPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/PstCd';
	var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

	var cdtrTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnLctnNm';
	var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

	var cdtrDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/DstrctNm';
	var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

	var cdtrCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/CtrySubDvsn';
	var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(cdtrAddrLine && (!cdtrCtry&& !cdtrTwnNm&& !cdtrDept&& !cdtrSubDept&& !cdtrStrtNm&& !cdtrBldgNb&& !cdtrBldgNm&& !cdtrFlr&& !cdtrPstBx&& !cdtrRoom&& !cdtrPstCd&& !cdtrTwnLctnNm && !cdtrDstrctNm&& !cdtrCtrySubDvsn)){
				var count = countXmlNodes(Document, "Cdtr", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var cdtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/AdrLine['+i+']';
						var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
						var adrLineLength = cdtrAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("945", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}	

	//DEBTOR
	var dbtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<PstlAdr>");
	
	var dbtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
	
	var dbtrTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
	
	var dbtrCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
	
	var dbtrDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Dept';
	var dbtrDept = getValueFromPath(Document, dbtrDeptPath);
	
	var dbtrSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/SubDept';
	var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);
	
	var dbtrStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/StrtNm';
	var dbtrStrNm = getValueFromPath(Document, dbtrStrtNmPath);
	
	var dbtrBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/BldgNb';
	var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);
	
	var dbtrBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/BldgNm';
	var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);
	
	var dbtrFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Flr';
	var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);
	
	var dbtrPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/PstBx';
	var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);
	
	var dbtrRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Room';
	var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);
	
	var dbtrPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/PstCd';
	var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);
	
	var dbtrTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnLctnNm';
	var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);
	
	var dbtrDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/DstrctNm';
	var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);
	
	var dbtrCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/CtrySubDvsn';
	var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);
	
	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(dbtrAddrLine && (!dbtrCtry&& !dbtrTwnNm&& !dbtrDept&& !dbtrSubDept&& !dbtrStrNm&& !dbtrBldgNb&& !dbtrBldgNm&& !dbtrFlr&& !dbtrPstBx&& !dbtrRoom&& !dbtrPstCd&& !dbtrTwnLctnNm&& !dbtrDstrctNm&& !dbtrCtrySubDvsn)){
				var count = countXmlNodes(Document, "Dbtr", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var dbtrAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/AdrLine['+i+']';
						var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
						var adrLineLength = dbtrAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("779", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}


	//IntermediaryAgent1
	var intrmyAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<PstlAdr>");

	var intrmyAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	var intrmyAgt1DepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
	var intrmyAgt1Depart = getValueFromPath(Document, intrmyAgt1DepartPath);

	var intrmyAgt1SubDepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt1SubDepart = getValueFromPath(Document, intrmyAgt1SubDepartPath);

	var intrmyAgt1StrtNamePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt1StrtName = getValueFromPath(Document, intrmyAgt1StrtNamePath);

	var intrmyAgt1BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt1BldgNb = getValueFromPath(Document, intrmyAgt1BldgNbPath);

	var intrmyAgt1BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt1BldgNm = getValueFromPath(Document, intrmyAgt1BldgNmPath);

	var intrmyAgt1FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
	var intrmyAgt1Flr = getValueFromPath(Document, intrmyAgt1FlrPath);

	var intrmyAgt1PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt1PstBx = getValueFromPath(Document, intrmyAgt1PstBxPath);

	var intrmyAgt1RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
	var intrmyAgt1Room = getValueFromPath(Document, intrmyAgt1RoomPath);

	var intrmyAgt1PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt1PstCd = getValueFromPath(Document, intrmyAgt1PstCdPath);

	var intrmyAgt1TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt1TwnLctnNm = getValueFromPath(Document, intrmyAgt1TwnLctnNmPath);

	var intrmyAgt1DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt1DstrctNm = getValueFromPath(Document, intrmyAgt1DstrctNmPath);

	var intrmyAgt1CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt1CtrySubDvsn = getValueFromPath(Document, intrmyAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(intrmyAgt1AddrLine && (!intrmyAgt1Ctry && !intrmyAgt1TwnNm && !intrmyAgt1Depart && !intrmyAgt1SubDepart && !intrmyAgt1StrtName && !intrmyAgt1BldgNb && !intrmyAgt1BldgNm && !intrmyAgt1Flr && !intrmyAgt1PstBx && !intrmyAgt1Room && !intrmyAgt1PstCd && !intrmyAgt1TwnLctnNm && !intrmyAgt1DstrctNm  && !intrmyAgt1CtrySubDvsn)){
			var count = countXmlNodes(Document, "IntrmyAgt1", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var intrmyAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
						var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);
						var adrLineLength = intrmyAgt1AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("549", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//IntermediaryAgent2
	var intrmyAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<PstlAdr>");

	var intrmyAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	var intrmyAgt2DepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
	var intrmyAgt2Depart = getValueFromPath(Document, intrmyAgt2DepartPath);

	var intrmyAgt2SubDepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt2SubDepart = getValueFromPath(Document, intrmyAgt2SubDepartPath);

	var intrmyAgt2StrtNamePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt2StrtName = getValueFromPath(Document, intrmyAgt2StrtNamePath);

	var intrmyAgt2BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt2BldgNb = getValueFromPath(Document, intrmyAgt2BldgNbPath);

	var intrmyAgt2BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt2BldgNm = getValueFromPath(Document, intrmyAgt2BldgNmPath);

	var intrmyAgt2FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
	var intrmyAgt2Flr = getValueFromPath(Document, intrmyAgt2FlrPath);

	var intrmyAgt2PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt2PstBx = getValueFromPath(Document, intrmyAgt2PstBxPath);

	var intrmyAgt2RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
	var intrmyAgt2Room = getValueFromPath(Document, intrmyAgt2RoomPath);

	var intrmyAgt2PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt2PstCd = getValueFromPath(Document, intrmyAgt2PstCdPath);

	var intrmyAgt2TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt2TwnLctnNm = getValueFromPath(Document, intrmyAgt2TwnLctnNmPath);

	var intrmyAgt2DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt2DstrctNm = getValueFromPath(Document, intrmyAgt2DstrctNmPath);

	var intrmyAgt2CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt2CtrySubDvsn = getValueFromPath(Document, intrmyAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(intrmyAgt2AddrLine && (!intrmyAgt2Ctry && !intrmyAgt2TwnNm && !intrmyAgt2Depart && !intrmyAgt2SubDepart && !intrmyAgt2StrtName && !intrmyAgt2BldgNb && !intrmyAgt2BldgNm && !intrmyAgt2Flr && !intrmyAgt2PstBx && !intrmyAgt2Room && !intrmyAgt2PstCd && !intrmyAgt2TwnLctnNm && !intrmyAgt2DstrctNm  && !intrmyAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt2", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var intrmyAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
						var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);
						var adrLineLength = intrmyAgt2AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("597", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//IntermediaryAgent3
	var intrmyAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<PstlAdr>");

	var intrmyAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	var intrmyAgt3DepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
	var intrmyAgt3Depart = getValueFromPath(Document, intrmyAgt3DepartPath);

	var intrmyAgt3SubDepartPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt3SubDepart = getValueFromPath(Document, intrmyAgt3SubDepartPath);

	var intrmyAgt3StrtNamePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt3StrtName = getValueFromPath(Document, intrmyAgt3StrtNamePath);

	var intrmyAgt3BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt3BldgNb = getValueFromPath(Document, intrmyAgt3BldgNbPath);

	var intrmyAgt3BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt3BldgNm = getValueFromPath(Document, intrmyAgt3BldgNmPath);

	var intrmyAgt3FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
	var intrmyAgt3Flr = getValueFromPath(Document, intrmyAgt3FlrPath);

	var intrmyAgt3PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt3PstBx = getValueFromPath(Document, intrmyAgt3PstBxPath);

	var intrmyAgt3RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
	var intrmyAgt3Room = getValueFromPath(Document, intrmyAgt3RoomPath);

	var intrmyAgt3PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt3PstCd = getValueFromPath(Document, intrmyAgt3PstCdPath);

	var intrmyAgt3TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt3TwnLctnNm = getValueFromPath(Document, intrmyAgt3TwnLctnNmPath);

	var intrmyAgt3DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt3DstrctNm = getValueFromPath(Document, intrmyAgt3DstrctNmPath);

	var intrmyAgt3CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt3CtrySubDvsn = getValueFromPath(Document, intrmyAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(intrmyAgt3AddrLine && (!intrmyAgt3Ctry && !intrmyAgt3TwnNm && !intrmyAgt3Depart && !intrmyAgt3SubDepart && !intrmyAgt3StrtName && !intrmyAgt3BldgNb && !intrmyAgt3BldgNm && !intrmyAgt3Flr && !intrmyAgt3PstBx && !intrmyAgt3Room && !intrmyAgt3PstCd && !intrmyAgt3TwnLctnNm && !intrmyAgt3DstrctNm  && !intrmyAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt3", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var intrmyAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
						var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);
						var adrLineLength = intrmyAgt3AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("645", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");

	var prvsInstgAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	var prvsInstgAgt1DeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt1Dept = getValueFromPath(Document, prvsInstgAgt1DeptPath);

	var prvsInstgAgt1SubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt1SubDept = getValueFromPath(Document, prvsInstgAgt1SubDeptPath);

	var prvsInstgAgt1StrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt1StrtNm = getValueFromPath(Document, prvsInstgAgt1StrtNmPath);

	var prvsInstgAgt1BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt1BldgNb = getValueFromPath(Document, prvsInstgAgt1BldgNbPath);

	var prvsInstgAgt1BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt1BldgNm = getValueFromPath(Document, prvsInstgAgt1BldgNmPath);

	var prvsInstgAgt1FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt1Flr = getValueFromPath(Document, prvsInstgAgt1FlrPath);

	var prvsInstgAgt1PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt1PstBx = getValueFromPath(Document, prvsInstgAgt1PstBxPath);

	var prvsInstgAgt1RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt1Room = getValueFromPath(Document, prvsInstgAgt1RoomPath);

	var prvsInstgAgt1PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt1PstCd = getValueFromPath(Document, prvsInstgAgt1PstCdPath);

	var prvsInstgAgt1TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt1TwnLctnNm = getValueFromPath(Document, prvsInstgAgt1TwnLctnNmPath);

	var prvsInstgAgt1DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt1DstrctNm = getValueFromPath(Document, prvsInstgAgt1DstrctNmPath);

	var prvsInstgAgt1CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(prvsInstgAgt1AddrLine && (!prvsInstgAgt1Ctry && !prvsInstgAgt1TwnNm && !prvsInstgAgt1Dept && !prvsInstgAgt1SubDept && !prvsInstgAgt1StrtNm && !prvsInstgAgt1BldgNb && !prvsInstgAgt1BldgNm && !prvsInstgAgt1Flr && !prvsInstgAgt1PstBx && !prvsInstgAgt1Room && !prvsInstgAgt1PstCd && !prvsInstgAgt1TwnLctnNm && !prvsInstgAgt1DstrctNm && !prvsInstgAgt1CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt1", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var prvsInstgAgt1AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
						var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);
						var adrLineLength = prvsInstgAgt1AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("379", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<PstlAdr>");

	var prvsInstgAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	var prvsInstgAgt2DeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt2Dept = getValueFromPath(Document, prvsInstgAgt2DeptPath);

	var prvsInstgAgt2SubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt2SubDept = getValueFromPath(Document, prvsInstgAgt2SubDeptPath);

	var prvsInstgAgt2StrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt2StrtNm = getValueFromPath(Document, prvsInstgAgt2StrtNmPath);

	var prvsInstgAgt2BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt2BldgNb = getValueFromPath(Document, prvsInstgAgt2BldgNbPath);

	var prvsInstgAgt2BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt2BldgNm = getValueFromPath(Document, prvsInstgAgt2BldgNmPath);

	var prvsInstgAgt2FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt2Flr = getValueFromPath(Document, prvsInstgAgt2FlrPath);

	var prvsInstgAgt2PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt2PstBx = getValueFromPath(Document, prvsInstgAgt2PstBxPath);

	var prvsInstgAgt2RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt2Room = getValueFromPath(Document, prvsInstgAgt2RoomPath);

	var prvsInstgAgt2PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt2PstCd = getValueFromPath(Document, prvsInstgAgt2PstCdPath);

	var prvsInstgAgt2TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt2TwnLctnNm = getValueFromPath(Document, prvsInstgAgt2TwnLctnNmPath);

	var prvsInstgAgt2DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt2DstrctNm = getValueFromPath(Document, prvsInstgAgt2DstrctNmPath);

	var prvsInstgAgt2CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
		if(prvsInstgAgt2PstlAdr){
			if(prvsInstgAgt2AddrLine && (!prvsInstgAgt2Ctry && !prvsInstgAgt2TwnNm && !prvsInstgAgt2Dept && !prvsInstgAgt2SubDept && !prvsInstgAgt2StrtNm && !prvsInstgAgt2BldgNb && !prvsInstgAgt2BldgNm && !prvsInstgAgt2Flr && !prvsInstgAgt2PstBx && !prvsInstgAgt2Room && !prvsInstgAgt2PstCd && !prvsInstgAgt2TwnLctnNm && !prvsInstgAgt2DstrctNm && !prvsInstgAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt2", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var prvsInstgAgt2AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
						var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);
						var adrLineLength = prvsInstgAgt2AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("427", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<PstlAdr>");

	var prvsInstgAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

	var prvsInstgAgt3DeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt3Dept = getValueFromPath(Document, prvsInstgAgt3DeptPath);

	var prvsInstgAgt3SubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt3SubDept = getValueFromPath(Document, prvsInstgAgt3SubDeptPath);

	var prvsInstgAgt3StrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt3StrtNm = getValueFromPath(Document, prvsInstgAgt3StrtNmPath);

	var prvsInstgAgt3BldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt3BldgNb = getValueFromPath(Document, prvsInstgAgt3BldgNbPath);

	var prvsInstgAgt3BldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt3BldgNm = getValueFromPath(Document, prvsInstgAgt3BldgNmPath);

	var prvsInstgAgt3FlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt3Flr = getValueFromPath(Document, prvsInstgAgt3FlrPath);

	var prvsInstgAgt3PstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt3PstBx = getValueFromPath(Document, prvsInstgAgt3PstBxPath);

	var prvsInstgAgt3RoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt3Room = getValueFromPath(Document, prvsInstgAgt3RoomPath);

	var prvsInstgAgt3PstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt3PstCd = getValueFromPath(Document, prvsInstgAgt3PstCdPath);

	var prvsInstgAgt3TwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt3TwnLctnNm = getValueFromPath(Document, prvsInstgAgt3TwnLctnNmPath);

	var prvsInstgAgt3DstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt3DstrctNm = getValueFromPath(Document, prvsInstgAgt3DstrctNmPath);

	var prvsInstgAgt3CtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(prvsInstgAgt3AddrLine && (!prvsInstgAgt3Ctry && !prvsInstgAgt3TwnNm && !prvsInstgAgt3Dept && !prvsInstgAgt3SubDept && !prvsInstgAgt3StrtNm && !prvsInstgAgt3BldgNb && !prvsInstgAgt3BldgNm && !prvsInstgAgt3Flr && !prvsInstgAgt3PstBx && !prvsInstgAgt3Room && !prvsInstgAgt3PstCd && !prvsInstgAgt3TwnLctnNm && !prvsInstgAgt3DstrctNm && !prvsInstgAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt3", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var prvsInstgAgt3AddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
						var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);
						var adrLineLength = prvsInstgAgt3AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("475", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//ChargesInformation
	var chrgsInfPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "ChrgsInf", "<PstlAdr>");

	var chrgsInfAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);

	var chrgsInfTwnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);

	var chrgsInfCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);

	var chrgsInfDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Dept';
	var chrgsInfDept = getValueFromPath(Document, chrgsInfDeptPath);

	var chrgsInfSubDeptPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/SubDept';
	var chrgsInfSubDept = getValueFromPath(Document, chrgsInfSubDeptPath);

	var chrgsInfStrtNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/StrtNm';
	var chrgsInfStrtNm = getValueFromPath(Document, chrgsInfStrtNmPath);

	var chrgsInfBldgNbPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNb';
	var chrgsInfBldgNb = getValueFromPath(Document, chrgsInfBldgNbPath);

	var chrgsInfBldgNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNm';
	var chrgsInfBldgNm = getValueFromPath(Document, chrgsInfBldgNmPath);

	var chrgsInfFlrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Flr';
	var chrgsInfFlr = getValueFromPath(Document, chrgsInfFlrPath);

	var chrgsInfPstBxPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstBx';
	var chrgsInfPstBX = getValueFromPath(Document, chrgsInfPstBxPath);

	var chrgsInfRoomPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Room';
	var chrgsInfRoom = getValueFromPath(Document, chrgsInfRoomPath);

	var chrgsInfPstCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstCd';
	var chrgsInfPstCd = getValueFromPath(Document, chrgsInfPstCdPath);

	var chrgsInfTwnLctnNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnLctnNm';
	var chrgsInfTwnLctnNm = getValueFromPath(Document, chrgsInfTwnLctnNmPath);

	var chrgsInfDstrctNmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/DstrctNm';
	var chrgsInfDstrctNm = getValueFromPath(Document, chrgsInfDstrctNmPath);

	var chrgsInfCtrySubDvsnPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
	var chrgsInfCtrySubDvsn = getValueFromPath(Document, chrgsInfCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(chrgsInfAddrLine && (!chrgsInfCtry && !chrgsInfTwnNm && !chrgsInfDept && !chrgsInfSubDept && !chrgsInfStrtNm && !chrgsInfBldgNb && !chrgsInfBldgNm && !chrgsInfFlr&& !chrgsInfPstBX&& !chrgsInfRoom&& !chrgsInfPstCd && !chrgsInfTwnLctnNm&& !chrgsInfDstrctNm && !chrgsInfCtrySubDvsn)){
				var count = countXmlNodes(Document, "ChrgsInf", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var chrgsInfAddrLinePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine['+i+']';
						var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);
						var adrLineLength = chrgsInfAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("347", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}
	logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8 completed");
	return retVal;	
}

function agentNamePstlAdrRuleChipsPacs008(exchange){ 
	logger.info("In agentNamePstlAdrRuleChipsPacs008");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);


	//CreditorAgent	
	var cdtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<PstlAdr>");
    var cdtAgtNm = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<Nm>");

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if( (cdtrAgtPstlAdr && !cdtAgtNm) || (cdtAgtNm && !cdtrAgtPstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("889", "7948", map);
            return retVal;
		}
	}

	//DebtorAgent
	var dbtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<PstlAdr>");
    var dbtrAgtNm = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<Nm>");

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if( (dbtrAgtPstlAdr && !dbtrAgtNm) || (dbtrAgtNm && !dbtrAgtPstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("841", "7948", map);
            return retVal;
		}
	}


	//IntermediaryAgent1
	var intrmyAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<PstlAdr>");
	var intrmyAgt1Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<Nm>");

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if( (intrmyAgt1Nm && !intrmyAgt1PstlAdr) || (intrmyAgt1PstlAdr && !intrmyAgt1Nm)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("549", "7948", map);
            return retVal;
		}
	}
    
	//IntermediaryAgent2
	var IntrmyAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<PstlAdr>");
	var IntrmyAgt2Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<Nm>");

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if( (IntrmyAgt2Nm && !IntrmyAgt2PstlAdr) || (IntrmyAgt2PstlAdr && !IntrmyAgt2Nm)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("597", "7948", map);
            return retVal;
		}
	}
    
	//IntermediaryAgent3
	var IntrmyAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<PstlAdr>");
	var IntrmyAgt3Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<Nm>");

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if( (IntrmyAgt3Nm && !IntrmyAgt3PstlAdr) || (IntrmyAgt3PstlAdr && !IntrmyAgt3Nm)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("645", "7948", map);
            return retVal;
		}
	}
    
	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");
	var prvsInstgAgt1Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<Nm>");

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if( (prvsInstgAgt1Nm && !prvsInstgAgt1PstlAdr) || (prvsInstgAgt1PstlAdr && !prvsInstgAgt1Nm)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("379", "7948", map);
            return retVal;
		}
	}
    
	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<PstlAdr>");
	var prvsInstgAgt2Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<Nm>");

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
		if( (prvsInstgAgt2Nm && !prvsInstgAgt2PstlAdr) || (prvsInstgAgt2PstlAdr && !prvsInstgAgt2Nm)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("427", "7948", map);
            return retVal;
		}
	}
    
	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<PstlAdr>");
	var PrvsInstgAgt3Nm = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<Nm>");

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if( (PrvsInstgAgt3Nm && !prvsInstgAgt3PstlAdr) || (prvsInstgAgt3PstlAdr && !PrvsInstgAgt3Nm)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("475", "7948", map);
            return retVal;
		}
	}
    
	//ChargesInfo	
	var chrgsInfPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "ChrgsInf", "<PstlAdr>");
    var chrgsInfNm = isXmlNodePresent(Document, "CdtTrfTxInf", "ChrgsInf", "<Nm>");

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if( (chrgsInfPstlAdr && !chrgsInfNm) || (chrgsInfNm && !chrgsInfPstlAdr)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("347", "7948", map);
            return retVal;
		}
	}
    
	logger.info("agentNamePstlAdrRuleChipsPacs008 completed");
	return retVal;
}

function partyNamePstlAdrRuleChipsPacs008(exchange){ 
	logger.info("In partyNamePstlAdrRuleChipsPacs008");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);


	//Ultimate Creditor	
	var ultmtCdtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "UltmtCdtr", "<PstlAdr>");
    var ultmtCdtrNm = isXmlNodePresent(Document, "CdtTrfTxInf", "UltmtCdtr", "<Nm>");

	if(isPatternPresent(Document1, "<UltmtCdtr>")){
		if(ultmtCdtrPstlAdr && !ultmtCdtrNm){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If postal address is provided then name must be present.");
            retVal = setCommentsForTransaction("1007", "7950", map);
            return retVal;
		}
	}

	//Ultimate Debtor
	var ultmtDbtrPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "UltmtDbtr", "<PstlAdr>");
    var ultmtDbtrNm = isXmlNodePresent(Document, "CdtTrfTxInf", "UltmtDbtr", "<Nm>");

	if(isPatternPresent(Document1, "<UltmtDbtr>")){
		if(ultmtDbtrPstlAdr && !ultmtDbtrNm){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If postal address is provided then name must be present.");
            retVal = setCommentsForTransaction("693", "7950", map);
            return retVal;
		}
	}


	//Initiating Party
	var initgPtyPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "InitgPty", "<PstlAdr>");
	var initgPtyNm = isXmlNodePresent(Document, "CdtTrfTxInf", "InitgPty", "<Nm>");

	if(isPatternPresent(Document1, "<InitgPty>")){
        if(initgPtyPstlAdr && !initgPtyNm){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If postal address is provided then name must be present.");
            retVal = setCommentsForTransaction("736", "7950", map);
            return retVal;
		}
	}
    
	logger.info("partyNamePstlAdrRuleChipsPacs008 completed");
	return retVal;	
}


function instrForCdtrAgtMutualCodeRuleChipsPacs008(exchange){
	logger.info("In instrForCdtrAgtMutualCodeRuleChipsPacs008");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    var count = countXmlNodes(Document, "CdtTrfTxInf", "InstrForCdtrAgt");
    logger.info("instrForCdtrAgtCount = " + count);
    
    var flag1 = false;
    var flag2 = false;
    var flag3 = false;
    var flag4 = false;
    
	if(count > 1){
        for(i=1; i<=count; i++) {
            var instrForCdtrAgtCdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstrForCdtrAgt['+i+']/Cd';
            var instrForCdtrAgtCd = getValueFromPath(Document, instrForCdtrAgtCdPath);

            if(instrForCdtrAgtCd == "HOLD") {
                flag1 = true;
            }
            if(instrForCdtrAgtCd == "CHQB") {
                flag2 = true;
            }
            if(instrForCdtrAgtCd == "PHOB") {
                flag3 = true;
            }
            if(instrForCdtrAgtCd == "TELB") {
                flag4 = true;
            }
        }
        
        if(flag1 && flag2){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If Instruction for Creditor Agent is repeated, HOLDQ and CHQB are mutually exclusive and cannot be present together.");
            retVal = setCommentsForTransaction("841", "7072", map); // new error code
            return retVal;
        }
        else if(flag3 && flag4){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If Instruction for Creditor Agent is repeated, PHOB and TELB are mutually exclusive and cannot be present together.");
            retVal = setCommentsForTransaction("841", "7073", map); // new error code
            return retVal;
        }
    }

    return retVal;
}

function gracePeriodHybridFormalRuleChipsPacs9(exchange){ 
	logger.info("In gracePeriodHybridFormalRuleChipsPacs9");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
    
    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        var Document2 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
        Document2 = "<UndrlygCstmrCdtTrf>".concat(Document2).concat("</UndrlygCstmrCdtTrf>");
        var parser = new XMLParser();
        Document3 = parser.parseXML(Document2);
    }
    
	//CreditorAgent	
	var cdtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<PstlAdr>");

	var cdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
	logger.info("cdtrAgtAddrLine:" + cdtrAgtAddrLine);

	var cdtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	var cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	var cdtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	var cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

	var cdtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Dept';
	var cdtrAgtDept = getValueFromPath(Document, cdtrAgtDeptPath);

	var cdtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
	var cdtrAgtSubDept = getValueFromPath(Document, cdtrAgtSubDeptPath);

	var cdtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
	var cdtrAgtStrtNm = getValueFromPath(Document, cdtrAgtStrtNmPath);

	var cdtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
	var cdtrAgtBldgNb = getValueFromPath(Document, cdtrAgtBldgNbPath);

	var cdtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
	var cdtrAgtBldgNm = getValueFromPath(Document, cdtrAgtBldgNmPath);

	var cdtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Flr';
	var cdtrAgtFlr = getValueFromPath(Document, cdtrAgtFlrPath);

	var cdtrAgtPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
	var cdtrAgtPstBx = getValueFromPath(Document, cdtrAgtPstBxPath);

	var cdtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Room';
	var cdtrAgtRoom = getValueFromPath(Document, cdtrAgtRoomPath);

	var cdtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
	var cdtrAgtPstCd = getValueFromPath(Document, cdtrAgtPstCdPath);

	var cdtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var cdtrAgtTwnLctnNm = getValueFromPath(Document, cdtrAgtTwnLctnNmPath);

	var cdtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var cdtrAgtDstrctNm = getValueFromPath(Document, cdtrAgtDstrctNmPath);

	var cdtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var cdtrAgtCtrySubDvsn = getValueFromPath(Document, cdtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(cdtrAgtAddrLine && (cdtrAgtCtry||cdtrAgtTwnNm||cdtrAgtDept||cdtrAgtSubDept||cdtrAgtStrtNm||cdtrAgtBldgNb||cdtrAgtBldgNm||cdtrAgtFlr||cdtrAgtPstBx||cdtrAgtRoom||cdtrAgtPstCd||cdtrAgtTwnLctnNm||cdtrAgtDstrctNm||cdtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "CdtrAgt", "AdrLine");
				if(!cdtrAgtTwnNm || !cdtrAgtCtry || count > 2) { //hybrid
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("610", "7528", map);
					return retVal;
				}			
			}
		}
	}

	//DebtorAgent
	var dbtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<PstlAdr>");

	var dbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

	var dbtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	var dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	var dbtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	var dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	var dbtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Dept';
	var dbtrAgtDept = getValueFromPath(Document, dbtrAgtDeptPath);

	var dbtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
	var dbtrAgtSubDept = getValueFromPath(Document, dbtrAgtSubDeptPath);

	var dbtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
	var dbtrAgtStrtNm = getValueFromPath(Document, dbtrAgtStrtNmPath);

	var dbtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
	var dbtrAgtBldgNb = getValueFromPath(Document, dbtrAgtBldgNbPath);

	var dbtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
	var dbtrAgtBldgNm = getValueFromPath(Document, dbtrAgtBldgNmPath);

	var dbtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Flr';
	var dbtrAgtFlr = getValueFromPath(Document, dbtrAgtFlrPath);

	var dbtrAgtPstBXPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
	var dbtrAgtPstBx = getValueFromPath(Document, dbtrAgtPstBXPath);

	var dbtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Room';
	var dbtrAgtRoom = getValueFromPath(Document, dbtrAgtRoomPath);

	var dbtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
	var dbtrAgtPstCd = getValueFromPath(Document, dbtrAgtPstCdPath);

	var dbtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var dbtrAgtTwnLctnNm = getValueFromPath(Document, dbtrAgtTwnLctnNmPath);

	var dbtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var dbtrAgtDstrctNm = getValueFromPath(Document, dbtrAgtDstrctNmPath);

	var dbtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var dbtrAgtCtrySubDvsn = getValueFromPath(Document, dbtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(dbtrAgtAddrLine && (dbtrAgtTwnNm||dbtrAgtCtry||dbtrAgtDept||dbtrAgtSubDept||dbtrAgtStrtNm||dbtrAgtBldgNb||dbtrAgtBldgNm||dbtrAgtFlr||dbtrAgtPstBx||dbtrAgtRoom||dbtrAgtPstCd ||dbtrAgtTwnLctnNm||dbtrAgtDstrctNm||dbtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "DbtrAgt", "AdrLine");
				if(!dbtrAgtTwnNm || !dbtrAgtCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("562", "7528", map);
					return retVal;
				}
			}
		}
	}

	//CREDITOR
	var cdtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<PstlAdr>");

	var cdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

	var cdtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

	var cdtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

	var cdtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Dept';
	var cdtrDept = getValueFromPath(Document, cdtrDeptPath);
    
	var cdtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/SubDept';
	var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

	var cdtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/StrtNm';
	var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

	var cdtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/BldgNb';
	var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

	var cdtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/BldgNm';
	var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

	var cdtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Flr';
	var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

	var cdtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/PstBx';
	var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

	var cdtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Room';
	var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

	var cdtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/PstCd';
	var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

	var cdtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnLctnNm';
	var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

	var cdtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/DstrctNm';
	var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

	var cdtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/CtrySubDvsn';
	var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			logger.info("1st if");
			if(cdtrAddrLine && (cdtrTwnNm||cdtrCtry||cdtrDept||cdtrSubDept||cdtrStrtNm||cdtrBldgNb||cdtrBldgNm||cdtrFlr||cdtrPstBx||cdtrRoom||cdtrPstCd||cdtrTwnLctnNm ||cdtrDstrctNm||cdtrCtrySubDvsn)){
				logger.info("2nd if");
				var count = countXmlNodes(Document, "Cdtr", "AdrLine");
				if(!cdtrTwnNm || !cdtrCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("658", "7528", map);
					return retVal;
				}
			}
		}
	}	

	//DEBTOR
	var dbtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<PstlAdr>");
	
	var dbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
	
	var dbtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
	
	var dbtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
	
	var dbtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Dept';
	var dbtrDept = getValueFromPath(Document, dbtrDeptPath);
	
	var dbtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/SubDept';
	var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);
	
	var dbtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/StrtNm';
	var dbtrStrNm = getValueFromPath(Document, dbtrStrtNmPath);
	
	var dbtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/BldgNb';
	var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);
	
	var dbtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/BldgNm';
	var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);
	
	var dbtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Flr';
	var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);
	
	var dbtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/PstBx';
	var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);
	
	var dbtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Room';
	var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);
	
	var dbtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/PstCd';
	var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);
	
	var dbtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnLctnNm';
	var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);
	
	var dbtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/DstrctNm';
	var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);
	
	var dbtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/CtrySubDvsn';
	var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);
	
	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(dbtrAddrLine && (dbtrTwnNm||dbtrCtry||dbtrDept||dbtrSubDept||dbtrStrNm||dbtrBldgNb||dbtrBldgNm||dbtrFlr||dbtrPstBx||dbtrRoom||dbtrPstCd||dbtrTwnLctnNm||dbtrDstrctNm||dbtrCtrySubDvsn)){
				var count = countXmlNodes(Document, "Dbtr", "AdrLine");
				if(!dbtrTwnNm || !dbtrCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("514", "7528", map);
					return retVal;
				}
			}
		}
	}

	//IntermediaryAgent1
	var intrmyAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<PstlAdr>");

	var intrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	var intrmyAgt1DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
	var intrmyAgt1Depart = getValueFromPath(Document, intrmyAgt1DepartPath);

	var intrmyAgt1SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt1SubDepart = getValueFromPath(Document, intrmyAgt1SubDepartPath);

	var intrmyAgt1StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt1StrtName = getValueFromPath(Document, intrmyAgt1StrtNamePath);

	var intrmyAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt1BldgNb = getValueFromPath(Document, intrmyAgt1BldgNbPath);

	var intrmyAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt1BldgNm = getValueFromPath(Document, intrmyAgt1BldgNmPath);

	var intrmyAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
	var intrmyAgt1Flr = getValueFromPath(Document, intrmyAgt1FlrPath);

	var intrmyAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt1PstBx = getValueFromPath(Document, intrmyAgt1PstBxPath);

	var intrmyAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
	var intrmyAgt1Room = getValueFromPath(Document, intrmyAgt1RoomPath);

	var intrmyAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt1PstCd = getValueFromPath(Document, intrmyAgt1PstCdPath);

	var intrmyAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt1TwnLctnNm = getValueFromPath(Document, intrmyAgt1TwnLctnNmPath);

	var intrmyAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt1DstrctNm = getValueFromPath(Document, intrmyAgt1DstrctNmPath);

	var intrmyAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt1CtrySubDvsn = getValueFromPath(Document, intrmyAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(intrmyAgt1AddrLine && (intrmyAgt1TwnNm||intrmyAgt1Ctry||intrmyAgt1Depart || intrmyAgt1SubDepart || intrmyAgt1StrtName || intrmyAgt1BldgNb || intrmyAgt1BldgNm || intrmyAgt1Flr || intrmyAgt1PstBx || intrmyAgt1Room || intrmyAgt1PstCd || intrmyAgt1TwnLctnNm || intrmyAgt1DstrctNm  || intrmyAgt1CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt1", "AdrLine");
				if(!intrmyAgt1TwnNm || !intrmyAgt1Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("369", "7528", map);
					return retVal;
				}
			}
		}
	}

	//IntermediaryAgent2
	var intrmyAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<PstlAdr>");

	var intrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	var intrmyAgt2DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
	var intrmyAgt2Depart = getValueFromPath(Document, intrmyAgt2DepartPath);

	var intrmyAgt2SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt2SubDepart = getValueFromPath(Document, intrmyAgt2SubDepartPath);

	var intrmyAgt2StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt2StrtName = getValueFromPath(Document, intrmyAgt2StrtNamePath);

	var intrmyAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt2BldgNb = getValueFromPath(Document, intrmyAgt2BldgNbPath);

	var intrmyAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt2BldgNm = getValueFromPath(Document, intrmyAgt2BldgNmPath);

	var intrmyAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
	var intrmyAgt2Flr = getValueFromPath(Document, intrmyAgt2FlrPath);

	var intrmyAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt2PstBx = getValueFromPath(Document, intrmyAgt2PstBxPath);

	var intrmyAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
	var intrmyAgt2Room = getValueFromPath(Document, intrmyAgt2RoomPath);

	var intrmyAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt2PstCd = getValueFromPath(Document, intrmyAgt2PstCdPath);

	var intrmyAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt2TwnLctnNm = getValueFromPath(Document, intrmyAgt2TwnLctnNmPath);

	var intrmyAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt2DstrctNm = getValueFromPath(Document, intrmyAgt2DstrctNmPath);

	var intrmyAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt2CtrySubDvsn = getValueFromPath(Document, intrmyAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(intrmyAgt2AddrLine && (intrmyAgt2TwnNm || intrmyAgt2Ctry ||intrmyAgt2Depart || intrmyAgt2SubDepart || intrmyAgt2StrtName || intrmyAgt2BldgNb || intrmyAgt2BldgNm || intrmyAgt2Flr || intrmyAgt2PstBx || intrmyAgt2Room || intrmyAgt2PstCd || intrmyAgt2TwnLctnNm || intrmyAgt2DstrctNm  || intrmyAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt2", "AdrLine");
				if(!intrmyAgt2TwnNm || !intrmyAgt2Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("417", "7528", map);
					return retVal;
				}
			}
		}
	}

	//IntermediaryAgent3
	var intrmyAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<PstlAdr>");

	var intrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	var intrmyAgt3DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
	var intrmyAgt3Depart = getValueFromPath(Document, intrmyAgt3DepartPath);

	var intrmyAgt3SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt3SubDepart = getValueFromPath(Document, intrmyAgt3SubDepartPath);

	var intrmyAgt3StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt3StrtName = getValueFromPath(Document, intrmyAgt3StrtNamePath);

	var intrmyAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt3BldgNb = getValueFromPath(Document, intrmyAgt3BldgNbPath);

	var intrmyAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt3BldgNm = getValueFromPath(Document, intrmyAgt3BldgNmPath);

	var intrmyAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
	var intrmyAgt3Flr = getValueFromPath(Document, intrmyAgt3FlrPath);

	var intrmyAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt3PstBx = getValueFromPath(Document, intrmyAgt3PstBxPath);

	var intrmyAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
	var intrmyAgt3Room = getValueFromPath(Document, intrmyAgt3RoomPath);

	var intrmyAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt3PstCd = getValueFromPath(Document, intrmyAgt3PstCdPath);

	var intrmyAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt3TwnLctnNm = getValueFromPath(Document, intrmyAgt3TwnLctnNmPath);

	var intrmyAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt3DstrctNm = getValueFromPath(Document, intrmyAgt3DstrctNmPath);

	var intrmyAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt3CtrySubDvsn = getValueFromPath(Document, intrmyAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(intrmyAgt3AddrLine && (intrmyAgt3TwnNm || intrmyAgt3Ctry ||intrmyAgt3Depart || intrmyAgt3SubDepart || intrmyAgt3StrtName || intrmyAgt3BldgNb || intrmyAgt3BldgNm || intrmyAgt3Flr || intrmyAgt3PstBx || intrmyAgt3Room || intrmyAgt3PstCd || intrmyAgt3TwnLctnNm || intrmyAgt3DstrctNm  || intrmyAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt3", "AdrLine");
				if(!intrmyAgt3TwnNm || !intrmyAgt3Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("465", "7528", map);
					return retVal;
				}
			}
		}
	}

	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");

	var prvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	var prvsInstgAgt1DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt1Dept = getValueFromPath(Document, prvsInstgAgt1DeptPath);

	var prvsInstgAgt1SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt1SubDept = getValueFromPath(Document, prvsInstgAgt1SubDeptPath);

	var prvsInstgAgt1StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt1StrtNm = getValueFromPath(Document, prvsInstgAgt1StrtNmPath);

	var prvsInstgAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt1BldgNb = getValueFromPath(Document, prvsInstgAgt1BldgNbPath);

	var prvsInstgAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt1BldgNm = getValueFromPath(Document, prvsInstgAgt1BldgNmPath);

	var prvsInstgAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt1Flr = getValueFromPath(Document, prvsInstgAgt1FlrPath);

	var prvsInstgAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt1PstBx = getValueFromPath(Document, prvsInstgAgt1PstBxPath);

	var prvsInstgAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt1Room = getValueFromPath(Document, prvsInstgAgt1RoomPath);

	var prvsInstgAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt1PstCd = getValueFromPath(Document, prvsInstgAgt1PstCdPath);

	var prvsInstgAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt1TwnLctnNm = getValueFromPath(Document, prvsInstgAgt1TwnLctnNmPath);

	var prvsInstgAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt1DstrctNm = getValueFromPath(Document, prvsInstgAgt1DstrctNmPath);

	var prvsInstgAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(prvsInstgAgt1AddrLine && (prvsInstgAgt1TwnNm || prvsInstgAgt1Ctry || prvsInstgAgt1Dept || prvsInstgAgt1SubDept || prvsInstgAgt1StrtNm || prvsInstgAgt1BldgNb || prvsInstgAgt1BldgNm || prvsInstgAgt1Flr || prvsInstgAgt1PstBx || prvsInstgAgt1Room || prvsInstgAgt1PstCd || prvsInstgAgt1TwnLctnNm || prvsInstgAgt1DstrctNm || prvsInstgAgt1CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt1", "AdrLine");
				if(!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("199", "7528", map);
					return retVal;
				}
			}
		}
	}

	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<PstlAdr>");

	var prvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	var prvsInstgAgt2DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt2Dept = getValueFromPath(Document, prvsInstgAgt2DeptPath);

	var prvsInstgAgt2SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt2SubDept = getValueFromPath(Document, prvsInstgAgt2SubDeptPath);

	var prvsInstgAgt2StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt2StrtNm = getValueFromPath(Document, prvsInstgAgt2StrtNmPath);

	var prvsInstgAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt2BldgNb = getValueFromPath(Document, prvsInstgAgt2BldgNbPath);

	var prvsInstgAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt2BldgNm = getValueFromPath(Document, prvsInstgAgt2BldgNmPath);

	var prvsInstgAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt2Flr = getValueFromPath(Document, prvsInstgAgt2FlrPath);

	var prvsInstgAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt2PstBx = getValueFromPath(Document, prvsInstgAgt2PstBxPath);

	var prvsInstgAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt2Room = getValueFromPath(Document, prvsInstgAgt2RoomPath);

	var prvsInstgAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt2PstCd = getValueFromPath(Document, prvsInstgAgt2PstCdPath);

	var prvsInstgAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt2TwnLctnNm = getValueFromPath(Document, prvsInstgAgt2TwnLctnNmPath);

	var prvsInstgAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt2DstrctNm = getValueFromPath(Document, prvsInstgAgt2DstrctNmPath);

	var prvsInstgAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
		if(prvsInstgAgt2PstlAdr){
			if(prvsInstgAgt2AddrLine && (prvsInstgAgt2TwnNm || prvsInstgAgt2Ctry || prvsInstgAgt2Dept || prvsInstgAgt2SubDept || prvsInstgAgt2StrtNm || prvsInstgAgt2BldgNb || prvsInstgAgt2BldgNm || prvsInstgAgt2Flr || prvsInstgAgt2PstBx || prvsInstgAgt2Room || prvsInstgAgt2PstCd || prvsInstgAgt2TwnLctnNm || prvsInstgAgt2DstrctNm || prvsInstgAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt2", "AdrLine");
				if(!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("247", "7528", map);
					return retVal;
				}
			}
		}
	}

	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<PstlAdr>");

	var prvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

	var prvsInstgAgt3DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt3Dept = getValueFromPath(Document, prvsInstgAgt3DeptPath);

	var prvsInstgAgt3SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt3SubDept = getValueFromPath(Document, prvsInstgAgt3SubDeptPath);

	var prvsInstgAgt3StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt3StrtNm = getValueFromPath(Document, prvsInstgAgt3StrtNmPath);

	var prvsInstgAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt3BldgNb = getValueFromPath(Document, prvsInstgAgt3BldgNbPath);

	var prvsInstgAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt3BldgNm = getValueFromPath(Document, prvsInstgAgt3BldgNmPath);

	var prvsInstgAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt3Flr = getValueFromPath(Document, prvsInstgAgt3FlrPath);

	var prvsInstgAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt3PstBx = getValueFromPath(Document, prvsInstgAgt3PstBxPath);

	var prvsInstgAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt3Room = getValueFromPath(Document, prvsInstgAgt3RoomPath);

	var prvsInstgAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt3PstCd = getValueFromPath(Document, prvsInstgAgt3PstCdPath);

	var prvsInstgAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt3TwnLctnNm = getValueFromPath(Document, prvsInstgAgt3TwnLctnNmPath);

	var prvsInstgAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt3DstrctNm = getValueFromPath(Document, prvsInstgAgt3DstrctNmPath);

	var prvsInstgAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(prvsInstgAgt3AddrLine && (prvsInstgAgt3TwnNm || prvsInstgAgt3Ctry || prvsInstgAgt3Dept || prvsInstgAgt3SubDept || prvsInstgAgt3StrtNm || prvsInstgAgt3BldgNb || prvsInstgAgt3BldgNm || prvsInstgAgt3Flr || prvsInstgAgt3PstBx || prvsInstgAgt3Room || prvsInstgAgt3PstCd || prvsInstgAgt3TwnLctnNm || prvsInstgAgt3DstrctNm || prvsInstgAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt3", "AdrLine");
				if(!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("295", "7528", map);
					return retVal;
				}
			}
		}
	}

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        //Underlying Creditor Agent
        var undrlygCdtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");

        var undrlygCdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygCdtrAgtAddrLine = getValueFromPath(Document, undrlygCdtrAgtAddrLinePath);
        logger.info("undrlygCdtrAgtAddrLine:" + undrlygCdtrAgtAddrLine);

        var undrlygCdtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygCdtrAgtTwnNm = getValueFromPath(Document, undrlygCdtrAgtTwnNmPath);

        var undrlygCdtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygCdtrAgtCtry = getValueFromPath(Document, undrlygCdtrAgtCtryPath);

        var undrlygCdtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygCdtrAgtDept = getValueFromPath(Document, undrlygCdtrAgtDeptPath);

        var undrlygCdtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygCdtrAgtSubDept = getValueFromPath(Document, undrlygCdtrAgtSubDeptPath);

        var undrlygCdtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygCdtrAgtStrtNm = getValueFromPath(Document, undrlygCdtrAgtStrtNmPath);

        var undrlygCdtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygCdtrAgtBldgNb = getValueFromPath(Document, undrlygCdtrAgtBldgNbPath);

        var undrlygCdtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygCdtrAgtBldgNm = getValueFromPath(Document, undrlygCdtrAgtBldgNmPath);

        var undrlygCdtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygCdtrAgtFlr = getValueFromPath(Document, undrlygCdtrAgtFlrPath);

        var undrlygCdtrAgtPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygCdtrAgtPstBx = getValueFromPath(Document, undrlygCdtrAgtPstBxPath);

        var undrlygCdtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygCdtrAgtRoom = getValueFromPath(Document, undrlygCdtrAgtRoomPath);

        var undrlygCdtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygCdtrAgtPstCd = getValueFromPath(Document, undrlygCdtrAgtPstCdPath);

        var undrlygCdtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygCdtrAgtTwnLctnNm = getValueFromPath(Document, undrlygCdtrAgtTwnLctnNmPath);

        var undrlygCdtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygCdtrAgtDstrctNm = getValueFromPath(Document, undrlygCdtrAgtDstrctNmPath);

        var undrlygCdtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygCdtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygCdtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if(undrlygCdtrAgtPstlAdr){
                if(undrlygCdtrAgtAddrLine && (undrlygCdtrAgtCtry||undrlygCdtrAgtTwnNm||undrlygCdtrAgtDept||undrlygCdtrAgtSubDept||undrlygCdtrAgtStrtNm||undrlygCdtrAgtBldgNb||undrlygCdtrAgtBldgNm||undrlygCdtrAgtFlr||undrlygCdtrAgtPstBx||undrlygCdtrAgtRoom||undrlygCdtrAgtPstCd||undrlygCdtrAgtTwnLctnNm||undrlygCdtrAgtDstrctNm||undrlygCdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes(Document3, "CdtrAgt", "AdrLine");
                    if(!undrlygCdtrAgtTwnNm || !undrlygCdtrAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        //Underlying Debtor Agent
        var undrlygDbtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");

        var undrlygDbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygDbtrAgtAddrLine = getValueFromPath(Document, undrlygDbtrAgtAddrLinePath);

        var undrlygDbtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygDbtrAgtTwnNm = getValueFromPath(Document, undrlygDbtrAgtTwnNmPath);

        var undrlygDbtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygDbtrAgtCtry = getValueFromPath(Document, undrlygDbtrAgtCtryPath);

        var undrlygDbtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygDbtrAgtDept = getValueFromPath(Document, undrlygDbtrAgtDeptPath);

        var undrlygDbtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygDbtrAgtSubDept = getValueFromPath(Document, undrlygDbtrAgtSubDeptPath);

        var undrlygDbtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygDbtrAgtStrtNm = getValueFromPath(Document, undrlygDbtrAgtStrtNmPath);

        var undrlygDbtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygDbtrAgtBldgNb = getValueFromPath(Document, undrlygDbtrAgtBldgNbPath);

        var undrlygDbtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygDbtrAgtBldgNm = getValueFromPath(Document, undrlygDbtrAgtBldgNmPath);

        var undrlygDbtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygDbtrAgtFlr = getValueFromPath(Document, undrlygDbtrAgtFlrPath);

        var undrlygDbtrAgtPstBXPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygDbtrAgtPstBx = getValueFromPath(Document, undrlygDbtrAgtPstBXPath);

        var undrlygDbtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygDbtrAgtRoom = getValueFromPath(Document, undrlygDbtrAgtRoomPath);

        var undrlygDbtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygDbtrAgtPstCd = getValueFromPath(Document, undrlygDbtrAgtPstCdPath);

        var undrlygDbtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygDbtrAgtTwnLctnNm = getValueFromPath(Document, undrlygDbtrAgtTwnLctnNmPath);

        var undrlygDbtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygDbtrAgtDstrctNm = getValueFromPath(Document, undrlygDbtrAgtDstrctNmPath);

        var undrlygDbtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygDbtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygDbtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<DbtrAgt>")){
            if(undrlygDbtrAgtPstlAdr){
                if(undrlygDbtrAgtAddrLine && (undrlygDbtrAgtTwnNm||undrlygDbtrAgtCtry||undrlygDbtrAgtDept||undrlygDbtrAgtSubDept||undrlygDbtrAgtStrtNm||undrlygDbtrAgtBldgNb||undrlygDbtrAgtBldgNm||undrlygDbtrAgtFlr||undrlygDbtrAgtPstBx||undrlygDbtrAgtRoom||undrlygDbtrAgtPstCd ||undrlygDbtrAgtTwnLctnNm||undrlygDbtrAgtDstrctNm||undrlygDbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes(Document3, "DbtrAgt", "AdrLine");
                    if(!undrlygDbtrAgtTwnNm || !undrlygDbtrAgtCtry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }
        
        //Underlying Creditor
        var undrlygCdtrPstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");

        var undrlygCdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
        var undrlygCdtrAddrLine = getValueFromPath(Document, undrlygCdtrAddrLinePath);

        var undrlygCdtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
        var undrlygCdtrTwnNm = getValueFromPath(Document, undrlygCdtrTwnNmPath);

        var undrlygCdtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
        var undrlygCdtrCtry = getValueFromPath(Document, undrlygCdtrCtryPath);

        var undrlygCdtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Dept';
        var undrlygCdtrDept = getValueFromPath(Document, undrlygCdtrDeptPath);
        
        var undrlygCdtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/SubDept';
        var undrlygCdtrSubDept = getValueFromPath(Document, undrlygCdtrSubDeptPath);

        var undrlygCdtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/StrtNm';
        var undrlygCdtrStrtNm = getValueFromPath(Document, undrlygCdtrStrtNmPath);

        var undrlygCdtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNb';
        var undrlygCdtrBldgNb = getValueFromPath(Document, undrlygCdtrBldgNbPath);

        var undrlygCdtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNm';
        var undrlygCdtrBldgNm = getValueFromPath(Document, undrlygCdtrBldgNmPath);

        var undrlygCdtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Flr';
        var undrlygCdtrFlr = getValueFromPath(Document, undrlygCdtrFlrPath);

        var undrlygCdtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstBx';
        var undrlygCdtrPstBx = getValueFromPath(Document, undrlygCdtrPstBxPath);

        var undrlygCdtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Room';
        var undrlygCdtrRoom = getValueFromPath(Document, undrlygCdtrRoomPath);

        var undrlygCdtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstCd';
        var undrlygCdtrPstCd = getValueFromPath(Document, undrlygCdtrPstCdPath);

        var undrlygCdtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnLctnNm';
        var undrlygCdtrTwnLctnNm = getValueFromPath(Document, undrlygCdtrTwnLctnNmPath);

        var undrlygCdtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/DstrctNm';
        var undrlygCdtrDstrctNm = getValueFromPath(Document, undrlygCdtrDstrctNmPath);

        var undrlygCdtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/CtrySubDvsn';
        var undrlygCdtrCtrySubDvsn = getValueFromPath(Document, undrlygCdtrCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<Cdtr>")){
            if(undrlygCdtrPstlAdr){
                logger.info("1st if");
                if(undrlygCdtrAddrLine && (undrlygCdtrTwnNm||undrlygCdtrCtry||undrlygCdtrDept||undrlygCdtrSubDept||undrlygCdtrStrtNm||undrlygCdtrBldgNb||undrlygCdtrBldgNm||undrlygCdtrFlr||undrlygCdtrPstBx||undrlygCdtrRoom||undrlygCdtrPstCd||undrlygCdtrTwnLctnNm ||undrlygCdtrDstrctNm||undrlygCdtrCtrySubDvsn)){
                    logger.info("2nd if");
                    var count = countXmlNodes(Document3, "Cdtr", "AdrLine");
                    if(!undrlygCdtrTwnNm || !undrlygCdtrCtry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }	

        //Underlying Debtor
        var undrlygDbtrPstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");
        
        var undrlygDbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
        var undrlygDbtrAddrLine = getValueFromPath(Document, undrlygDbtrAddrLinePath);
        
        var undrlygDbtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
        var undrlygDbtrTwnNm = getValueFromPath(Document, undrlygDbtrTwnNmPath);
        
        var undrlygDbtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
        var undrlygDbtrCtry = getValueFromPath(Document, undrlygDbtrCtryPath);
        
        var undrlygDbtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Dept';
        var undrlygDbtrDept = getValueFromPath(Document, undrlygDbtrDeptPath);
        
        var undrlygDbtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/SubDept';
        var undrlygDbtrSubDept = getValueFromPath(Document, undrlygDbtrSubDeptPath);
        
        var undrlygDbtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/StrtNm';
        var undrlygDbtrStrNm = getValueFromPath(Document, undrlygDbtrStrtNmPath);
        
        var undrlygDbtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNb';
        var undrlygDbtrBldgNb = getValueFromPath(Document, undrlygDbtrBldgNbPath);
        
        var undrlygDbtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNm';
        var undrlygDbtrBldgNm = getValueFromPath(Document, undrlygDbtrBldgNmPath);
        
        var undrlygDbtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Flr';
        var undrlygDbtrFlr = getValueFromPath(Document, undrlygDbtrFlrPath);
        
        var undrlygDbtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstBx';
        var undrlygDbtrPstBx = getValueFromPath(Document, undrlygDbtrPstBxPath);
        
        var undrlygDbtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Room';
        var undrlygDbtrRoom = getValueFromPath(Document, undrlygDbtrRoomPath);
        
        var undrlygDbtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstCd';
        var undrlygDbtrPstCd = getValueFromPath(Document, undrlygDbtrPstCdPath);
        
        var undrlygDbtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnLctnNm';
        var undrlygDbtrTwnLctnNm = getValueFromPath(Document, undrlygDbtrTwnLctnNmPath);
        
        var undrlygDbtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/DstrctNm';
        var undrlygDbtrDstrctNm = getValueFromPath(Document, undrlygDbtrDstrctNmPath);
        
        var undrlygDbtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/CtrySubDvsn';
        var undrlygDbtrCtrySubDvsn = getValueFromPath(Document, undrlygDbtrCtrySubDvsnPath);
        
        if(isPatternPresent(Document2, "<Dbtr>")){
            if(undrlygDbtrPstlAdr){
                if(undrlygDbtrAddrLine && (undrlygDbtrTwnNm||undrlygDbtrCtry||undrlygDbtrDept||undrlygDbtrSubDept||undrlygDbtrStrNm||undrlygDbtrBldgNb||undrlygDbtrBldgNm||undrlygDbtrFlr||undrlygDbtrPstBx||undrlygDbtrRoom||undrlygDbtrPstCd||undrlygDbtrTwnLctnNm||undrlygDbtrDstrctNm||undrlygDbtrCtrySubDvsn)){
                    var count = countXmlNodes(Document3, "Dbtr", "AdrLine");
                    if(!undrlygDbtrTwnNm || !undrlygDbtrCtry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }
        
        //Underlying IntermediaryAgent1
        var undrlygIntrmyAgt1PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");

        var undrlygIntrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt1AddrLine = getValueFromPath(Document, undrlygIntrmyAgt1AddrLinePath);

        var undrlygIntrmyAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt1TwnNm = getValueFromPath(Document, undrlygIntrmyAgt1TwnNmPath);

        var undrlygIntrmyAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt1Ctry = getValueFromPath(Document, undrlygIntrmyAgt1CtryPath);

        var undrlygIntrmyAgt1DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt1Depart = getValueFromPath(Document, undrlygIntrmyAgt1DepartPath);

        var undrlygIntrmyAgt1SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt1SubDepart = getValueFromPath(Document, undrlygIntrmyAgt1SubDepartPath);

        var undrlygIntrmyAgt1StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt1StrtName = getValueFromPath(Document, undrlygIntrmyAgt1StrtNamePath);

        var undrlygIntrmyAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt1BldgNb = getValueFromPath(Document, undrlygIntrmyAgt1BldgNbPath);

        var undrlygIntrmyAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt1BldgNm = getValueFromPath(Document, undrlygIntrmyAgt1BldgNmPath);

        var undrlygIntrmyAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt1Flr = getValueFromPath(Document, undrlygIntrmyAgt1FlrPath);

        var undrlygIntrmyAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt1PstBx = getValueFromPath(Document, undrlygIntrmyAgt1PstBxPath);

        var undrlygIntrmyAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt1Room = getValueFromPath(Document, undrlygIntrmyAgt1RoomPath);

        var undrlygIntrmyAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt1PstCd = getValueFromPath(Document, undrlygIntrmyAgt1PstCdPath);

        var undrlygIntrmyAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt1TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt1TwnLctnNmPath);

        var undrlygIntrmyAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt1DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt1DstrctNmPath);

        var undrlygIntrmyAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt1CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt1>")){
            if(undrlygIntrmyAgt1PstlAdr){
                if(undrlygIntrmyAgt1AddrLine && (undrlygIntrmyAgt1TwnNm||undrlygIntrmyAgt1Ctry||undrlygIntrmyAgt1Depart || undrlygIntrmyAgt1SubDepart || undrlygIntrmyAgt1StrtName || undrlygIntrmyAgt1BldgNb || undrlygIntrmyAgt1BldgNm || undrlygIntrmyAgt1Flr || undrlygIntrmyAgt1PstBx || undrlygIntrmyAgt1Room || undrlygIntrmyAgt1PstCd || undrlygIntrmyAgt1TwnLctnNm || undrlygIntrmyAgt1DstrctNm  || undrlygIntrmyAgt1CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "IntrmyAgt1", "AdrLine");
                    if(!undrlygIntrmyAgt1TwnNm || !undrlygIntrmyAgt1Ctry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }

        //Underlying IntermediaryAgent2
        var undrlygIntrmyAgt2PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");

        var undrlygIntrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt2AddrLine = getValueFromPath(Document, undrlygIntrmyAgt2AddrLinePath);

        var undrlygIntrmyAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt2TwnNm = getValueFromPath(Document, undrlygIntrmyAgt2TwnNmPath);

        var undrlygIntrmyAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt2Ctry = getValueFromPath(Document, undrlygIntrmyAgt2CtryPath);

        var undrlygIntrmyAgt2DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt2Depart = getValueFromPath(Document, undrlygIntrmyAgt2DepartPath);

        var undrlygIntrmyAgt2SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt2SubDepart = getValueFromPath(Document, undrlygIntrmyAgt2SubDepartPath);

        var undrlygIntrmyAgt2StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt2StrtName = getValueFromPath(Document, undrlygIntrmyAgt2StrtNamePath);

        var undrlygIntrmyAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt2BldgNb = getValueFromPath(Document, undrlygIntrmyAgt2BldgNbPath);

        var undrlygIntrmyAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt2BldgNm = getValueFromPath(Document, undrlygIntrmyAgt2BldgNmPath);

        var undrlygIntrmyAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt2Flr = getValueFromPath(Document, undrlygIntrmyAgt2FlrPath);

        var undrlygIntrmyAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt2PstBx = getValueFromPath(Document, undrlygIntrmyAgt2PstBxPath);

        var undrlygIntrmyAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt2Room = getValueFromPath(Document, undrlygIntrmyAgt2RoomPath);

        var undrlygIntrmyAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt2PstCd = getValueFromPath(Document, undrlygIntrmyAgt2PstCdPath);

        var undrlygIntrmyAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt2TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt2TwnLctnNmPath);

        var undrlygIntrmyAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt2DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt2DstrctNmPath);

        var undrlygIntrmyAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt2CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt2>")){
            if(undrlygIntrmyAgt2PstlAdr){
                if(undrlygIntrmyAgt2AddrLine && (undrlygIntrmyAgt2TwnNm || undrlygIntrmyAgt2Ctry ||undrlygIntrmyAgt2Depart || undrlygIntrmyAgt2SubDepart || undrlygIntrmyAgt2StrtName || undrlygIntrmyAgt2BldgNb || undrlygIntrmyAgt2BldgNm || undrlygIntrmyAgt2Flr || undrlygIntrmyAgt2PstBx || undrlygIntrmyAgt2Room || undrlygIntrmyAgt2PstCd || undrlygIntrmyAgt2TwnLctnNm || undrlygIntrmyAgt2DstrctNm  || undrlygIntrmyAgt2CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "IntrmyAgt2", "AdrLine");
                    if(!undrlygIntrmyAgt2TwnNm || !undrlygIntrmyAgt2Ctry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }

        //Underlying IntermediaryAgent3
        var undrlygIntrmyAgt3PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");

        var undrlygIntrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt3AddrLine = getValueFromPath(Document, undrlygIntrmyAgt3AddrLinePath);

        var undrlygIntrmyAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt3TwnNm = getValueFromPath(Document, undrlygIntrmyAgt3TwnNmPath);

        var undrlygIntrmyAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt3Ctry = getValueFromPath(Document, undrlygIntrmyAgt3CtryPath);

        var undrlygIntrmyAgt3DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt3Depart = getValueFromPath(Document, undrlygIntrmyAgt3DepartPath);

        var undrlygIntrmyAgt3SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt3SubDepart = getValueFromPath(Document, undrlygIntrmyAgt3SubDepartPath);

        var undrlygIntrmyAgt3StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt3StrtName = getValueFromPath(Document, undrlygIntrmyAgt3StrtNamePath);

        var undrlygIntrmyAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt3BldgNb = getValueFromPath(Document, undrlygIntrmyAgt3BldgNbPath);

        var undrlygIntrmyAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt3BldgNm = getValueFromPath(Document, undrlygIntrmyAgt3BldgNmPath);

        var undrlygIntrmyAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt3Flr = getValueFromPath(Document, undrlygIntrmyAgt3FlrPath);

        var undrlygIntrmyAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt3PstBx = getValueFromPath(Document, undrlygIntrmyAgt3PstBxPath);

        var undrlygIntrmyAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt3Room = getValueFromPath(Document, undrlygIntrmyAgt3RoomPath);

        var undrlygIntrmyAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt3PstCd = getValueFromPath(Document, undrlygIntrmyAgt3PstCdPath);

        var undrlygIntrmyAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt3TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt3TwnLctnNmPath);

        var undrlygIntrmyAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt3DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt3DstrctNmPath);

        var undrlygIntrmyAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt3CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt3>")){
            if(undrlygIntrmyAgt3PstlAdr){
                if(undrlygIntrmyAgt3AddrLine && (undrlygIntrmyAgt3TwnNm || undrlygIntrmyAgt3Ctry ||undrlygIntrmyAgt3Depart || undrlygIntrmyAgt3SubDepart || undrlygIntrmyAgt3StrtName || undrlygIntrmyAgt3BldgNb || undrlygIntrmyAgt3BldgNm || undrlygIntrmyAgt3Flr || undrlygIntrmyAgt3PstBx || undrlygIntrmyAgt3Room || undrlygIntrmyAgt3PstCd || undrlygIntrmyAgt3TwnLctnNm || undrlygIntrmyAgt3DstrctNm  || undrlygIntrmyAgt3CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "IntrmyAgt3", "AdrLine");
                    if(!undrlygIntrmyAgt3TwnNm || !undrlygIntrmyAgt3Ctry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }
        
        //Underlying PreviousInstructingAgent1
        var undrlygPrvsInstgAgt1PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");

        var undrlygPrvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt1AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt1AddrLinePath);

        var undrlygPrvsInstgAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt1TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt1TwnNmPath);

        var undrlygPrvsInstgAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt1Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt1CtryPath);

        var undrlygPrvsInstgAgt1DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt1Dept = getValueFromPath(Document, undrlygPrvsInstgAgt1DeptPath);

        var undrlygPrvsInstgAgt1SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt1SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt1SubDeptPath);

        var undrlygPrvsInstgAgt1StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt1StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt1StrtNmPath);

        var undrlygPrvsInstgAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt1BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt1BldgNbPath);

        var undrlygPrvsInstgAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt1BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt1BldgNmPath);

        var undrlygPrvsInstgAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt1Flr = getValueFromPath(Document, undrlygPrvsInstgAgt1FlrPath);

        var undrlygPrvsInstgAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt1PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt1PstBxPath);

        var undrlygPrvsInstgAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt1Room = getValueFromPath(Document, undrlygPrvsInstgAgt1RoomPath);

        var undrlygPrvsInstgAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt1PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt1PstCdPath);

        var undrlygPrvsInstgAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt1TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt1TwnLctnNmPath);

        var undrlygPrvsInstgAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt1DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt1DstrctNmPath);

        var undrlygPrvsInstgAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
            if(undrlygPrvsInstgAgt1PstlAdr){
                if(undrlygPrvsInstgAgt1AddrLine && (undrlygPrvsInstgAgt1TwnNm || undrlygPrvsInstgAgt1Ctry || undrlygPrvsInstgAgt1Dept || undrlygPrvsInstgAgt1SubDept || undrlygPrvsInstgAgt1StrtNm || undrlygPrvsInstgAgt1BldgNb || undrlygPrvsInstgAgt1BldgNm || undrlygPrvsInstgAgt1Flr || undrlygPrvsInstgAgt1PstBx || undrlygPrvsInstgAgt1Room || undrlygPrvsInstgAgt1PstCd || undrlygPrvsInstgAgt1TwnLctnNm || undrlygPrvsInstgAgt1DstrctNm || undrlygPrvsInstgAgt1CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "PrvsInstgAgt1", "AdrLine");
                    if(!undrlygPrvsInstgAgt1TwnNm || !undrlygPrvsInstgAgt1Ctry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }

        //Underlying PreviousInstructingAgent2
        var undrlygPrvsInstgAgt2PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");

        var undrlygPrvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt2AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt2AddrLinePath);

        var undrlygPrvsInstgAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt2TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt2TwnNmPath);

        var undrlygPrvsInstgAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt2Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt2CtryPath);

        var undrlygPrvsInstgAgt2DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt2Dept = getValueFromPath(Document, undrlygPrvsInstgAgt2DeptPath);

        var undrlygPrvsInstgAgt2SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt2SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt2SubDeptPath);

        var undrlygPrvsInstgAgt2StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt2StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt2StrtNmPath);

        var undrlygPrvsInstgAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt2BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt2BldgNbPath);

        var undrlygPrvsInstgAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt2BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt2BldgNmPath);

        var undrlygPrvsInstgAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt2Flr = getValueFromPath(Document, undrlygPrvsInstgAgt2FlrPath);

        var undrlygPrvsInstgAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt2PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt2PstBxPath);

        var undrlygPrvsInstgAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt2Room = getValueFromPath(Document, undrlygPrvsInstgAgt2RoomPath);

        var undrlygPrvsInstgAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt2PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt2PstCdPath);

        var undrlygPrvsInstgAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt2TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt2TwnLctnNmPath);

        var undrlygPrvsInstgAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt2DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt2DstrctNmPath);

        var undrlygPrvsInstgAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
            if(undrlygPrvsInstgAgt2PstlAdr){
                if(undrlygPrvsInstgAgt2AddrLine && (undrlygPrvsInstgAgt2TwnNm || undrlygPrvsInstgAgt2Ctry || undrlygPrvsInstgAgt2Dept || undrlygPrvsInstgAgt2SubDept || undrlygPrvsInstgAgt2StrtNm || undrlygPrvsInstgAgt2BldgNb || undrlygPrvsInstgAgt2BldgNm || undrlygPrvsInstgAgt2Flr || undrlygPrvsInstgAgt2PstBx || undrlygPrvsInstgAgt2Room || undrlygPrvsInstgAgt2PstCd || undrlygPrvsInstgAgt2TwnLctnNm || undrlygPrvsInstgAgt2DstrctNm || undrlygPrvsInstgAgt2CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "PrvsInstgAgt2", "AdrLine");
                    if(!undrlygPrvsInstgAgt2TwnNm || !undrlygPrvsInstgAgt2Ctry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }

        //Underlying PreviousInstructingAgent3
        var undrlygPrvsInstgAgt3PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");

        var undrlygPrvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt3AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt3AddrLinePath);

        var undrlygPrvsInstgAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt3TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt3TwnNmPath);

        var undrlygPrvsInstgAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt3Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt3CtryPath);

        var undrlygPrvsInstgAgt3DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt3Dept = getValueFromPath(Document, undrlygPrvsInstgAgt3DeptPath);

        var undrlygPrvsInstgAgt3SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt3SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt3SubDeptPath);

        var undrlygPrvsInstgAgt3StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt3StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt3StrtNmPath);

        var undrlygPrvsInstgAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt3BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt3BldgNbPath);

        var undrlygPrvsInstgAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt3BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt3BldgNmPath);

        var undrlygPrvsInstgAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt3Flr = getValueFromPath(Document, undrlygPrvsInstgAgt3FlrPath);

        var undrlygPrvsInstgAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt3PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt3PstBxPath);

        var undrlygPrvsInstgAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt3Room = getValueFromPath(Document, undrlygPrvsInstgAgt3RoomPath);

        var undrlygPrvsInstgAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt3PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt3PstCdPath);

        var undrlygPrvsInstgAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt3TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt3TwnLctnNmPath);

        var undrlygPrvsInstgAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt3DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt3DstrctNmPath);

        var undrlygPrvsInstgAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
            if(undrlygPrvsInstgAgt3PstlAdr){
                if(undrlygPrvsInstgAgt3AddrLine && (undrlygPrvsInstgAgt3TwnNm || undrlygPrvsInstgAgt3Ctry || undrlygPrvsInstgAgt3Dept || undrlygPrvsInstgAgt3SubDept || undrlygPrvsInstgAgt3StrtNm || undrlygPrvsInstgAgt3BldgNb || undrlygPrvsInstgAgt3BldgNm || undrlygPrvsInstgAgt3Flr || undrlygPrvsInstgAgt3PstBx || undrlygPrvsInstgAgt3Room || undrlygPrvsInstgAgt3PstCd || undrlygPrvsInstgAgt3TwnLctnNm || undrlygPrvsInstgAgt3DstrctNm || undrlygPrvsInstgAgt3CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "PrvsInstgAgt3", "AdrLine");
                    if(!undrlygPrvsInstgAgt3TwnNm || !undrlygPrvsInstgAgt3Ctry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs9: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("720", "7528", map);
                        return retVal;
                    }
                }
            }
        }        
    }
	return retVal;	
}

function gracePeriodUnstructuredFormalRuleChipsPacs9(exchange){ 
	logger.info("In gracePeriodUnstructuredFormalRuleChipsPacs9");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        var Document2 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
        Document2 = "<UndrlygCstmrCdtTrf>".concat(Document2).concat("</UndrlygCstmrCdtTrf>");
        var parser = new XMLParser();
        Document3 = parser.parseXML(Document2);
    }

	//CreditorAgent
	var cdtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "CdtrAgt", "<PstlAdr>");

	var cdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
	var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);

	var cdtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
	var cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

	var cdtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
	var cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

	var cdtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Dept';
	var cdtrAgtDept = getValueFromPath(Document, cdtrAgtDeptPath);

	var cdtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
	var cdtrAgtSubDept = getValueFromPath(Document, cdtrAgtSubDeptPath);

	var cdtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
	var cdtrAgtStrtNm = getValueFromPath(Document, cdtrAgtStrtNmPath);

	var cdtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
	var cdtrAgtBldgNb = getValueFromPath(Document, cdtrAgtBldgNbPath);

	var cdtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
	var cdtrAgtBldgNm = getValueFromPath(Document, cdtrAgtBldgNmPath);

	var cdtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Flr';
	var cdtrAgtFlr = getValueFromPath(Document, cdtrAgtFlrPath);

	var cdtrAgtPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
	var cdtrAgtPstBx = getValueFromPath(Document, cdtrAgtPstBxPath);

	var cdtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Room';
	var cdtrAgtRoom = getValueFromPath(Document, cdtrAgtRoomPath);

	var cdtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
	var cdtrAgtPstCd = getValueFromPath(Document, cdtrAgtPstCdPath);

	var cdtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var cdtrAgtTwnLctnNm = getValueFromPath(Document, cdtrAgtTwnLctnNmPath);

	var cdtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var cdtrAgtDstrctNm = getValueFromPath(Document, cdtrAgtDstrctNmPath);

	var cdtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var cdtrAgtCtrySubDvsn = getValueFromPath(Document, cdtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<CdtrAgt>")){
		if(cdtrAgtPstlAdr){
			if(cdtrAgtAddrLine && (!cdtrAgtCtry&& !cdtrAgtTwnNm&& !cdtrAgtDept&& !cdtrAgtSubDept&& !cdtrAgtStrtNm&& !cdtrAgtBldgNb&& !cdtrAgtBldgNm&& !cdtrAgtFlr&& !cdtrAgtPstBx&& !cdtrAgtRoom&& !cdtrAgtPstCd&& !cdtrAgtTwnLctnNm&& !cdtrAgtDstrctNm&& !cdtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "CdtrAgt", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var cdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
						var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
						var adrLineLength = cdtrAgtAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("610", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//DebtorAgent
    var dbtrAgtPstlAdr = isXmlNodePresent(Document, "CdtTrfTxInf", "DbtrAgt", "<PstlAdr>");
	
	var dbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
	var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);
	
	var dbtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
	var dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

	var dbtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
	var dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

	var dbtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Dept';
	var dbtrAgtDept = getValueFromPath(Document, dbtrAgtDeptPath);

	var dbtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
	var dbtrAgtSubDept = getValueFromPath(Document, dbtrAgtSubDeptPath);

	var dbtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
	var dbtrAgtStrtNm = getValueFromPath(Document, dbtrAgtStrtNmPath);

	var dbtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
	var dbtrAgtBldgNb = getValueFromPath(Document, dbtrAgtBldgNbPath);

	var dbtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
	var dbtrAgtBldgNm = getValueFromPath(Document, dbtrAgtBldgNmPath);

	var dbtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Flr';
	var dbtrAgtFlr = getValueFromPath(Document, dbtrAgtFlrPath);

	var dbtrAgtPstBXPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
	var dbtrAgtPstBx = getValueFromPath(Document, dbtrAgtPstBXPath);

	var dbtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Room';
	var dbtrAgtRoom = getValueFromPath(Document, dbtrAgtRoomPath);

	var dbtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
	var dbtrAgtPstCd = getValueFromPath(Document, dbtrAgtPstCdPath);

	var dbtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
	var dbtrAgtTwnLctnNm = getValueFromPath(Document, dbtrAgtTwnLctnNmPath);

	var dbtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
	var dbtrAgtDstrctNm = getValueFromPath(Document, dbtrAgtDstrctNmPath);

	var dbtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
	var dbtrAgtCtrySubDvsn = getValueFromPath(Document, dbtrAgtCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<DbtrAgt>")){
		if(dbtrAgtPstlAdr){
			if(dbtrAgtAddrLine && (!dbtrAgtCtry&& !dbtrAgtTwnNm&& !dbtrAgtDept&& !dbtrAgtSubDept&& !dbtrAgtStrtNm&& !dbtrAgtBldgNb&& !dbtrAgtBldgNm&& !dbtrAgtFlr&& !dbtrAgtPstBx&& !dbtrAgtRoom&& !dbtrAgtPstCd && !dbtrAgtTwnLctnNm&& !dbtrAgtDstrctNm&& !dbtrAgtCtrySubDvsn)){
				var count = countXmlNodes(Document, "DbtrAgt", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var dbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
						var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);
						var adrLineLength = dbtrAgtAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("562", "7527", map);
							return retVal;							
						}	
					}
				}
			}
		}
	}


	//CREDITOR
    var cdtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Cdtr", "<PstlAdr>");

	var cdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine';
	var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

	var cdtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnNm';
	var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

	var cdtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Ctry';
	var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

	var cdtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Dept';
	var cdtrDept = getValueFromPath(Document, cdtrDeptPath);

	var cdtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/SubDept';
	var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

	var cdtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/StrtNm';
	var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

	var cdtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/BldgNb';
	var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

	var cdtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/BldgNm';
	var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

	var cdtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Flr';
	var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

	var cdtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/PstBx';
	var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

	var cdtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Room';
	var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

	var cdtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/PstCd';
	var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

	var cdtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnLctnNm';
	var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

	var cdtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/DstrctNm';
	var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

	var cdtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/CtrySubDvsn';
	var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<Cdtr>")){
		if(cdtrPstlAdr){
			if(cdtrAddrLine && (!cdtrCtry&& !cdtrTwnNm&& !cdtrDept&& !cdtrSubDept&& !cdtrStrtNm&& !cdtrBldgNb&& !cdtrBldgNm&& !cdtrFlr&& !cdtrPstBx&& !cdtrRoom&& !cdtrPstCd&& !cdtrTwnLctnNm && !cdtrDstrctNm&& !cdtrCtrySubDvsn)){
				var count = countXmlNodes(Document, "Cdtr", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var cdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine['+i+']';
						var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
						logger.info("gracePeriodUnstructuredFormalRulePacs9: cdtrAddrLine = " + cdtrAddrLine);
						var adrLineLength = cdtrAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("658", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}	

	//DEBTOR
	var dbtrPstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "Dbtr", "<PstlAdr>");
	
	var dbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine';
	var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
	
	var dbtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnNm';
	var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);
	
	var dbtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Ctry';
	var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);
	
	var dbtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Dept';
	var dbtrDept = getValueFromPath(Document, dbtrDeptPath);
	
	var dbtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/SubDept';
	var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);
	
	var dbtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/StrtNm';
	var dbtrStrNm = getValueFromPath(Document, dbtrStrtNmPath);
	
	var dbtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/BldgNb';
	var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);
	
	var dbtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/BldgNm';
	var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);
	
	var dbtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Flr';
	var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);
	
	var dbtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/PstBx';
	var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);
	
	var dbtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Room';
	var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);
	
	var dbtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/PstCd';
	var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);
	
	var dbtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnLctnNm';
	var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);
	
	var dbtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/DstrctNm';
	var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);
	
	var dbtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/CtrySubDvsn';
	var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);
	
	if(isPatternPresent(Document1, "<Dbtr>")){
		if(dbtrPstlAdr){
			if(dbtrAddrLine && (!dbtrCtry&& !dbtrTwnNm&& !dbtrDept&& !dbtrSubDept&& !dbtrStrNm&& !dbtrBldgNb&& !dbtrBldgNm&& !dbtrFlr&& !dbtrPstBx&& !dbtrRoom&& !dbtrPstCd&& !dbtrTwnLctnNm&& !dbtrDstrctNm&& !dbtrCtrySubDvsn)){
				var count = countXmlNodes(Document, "Dbtr", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var dbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine['+i+']';
						var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
						var adrLineLength = dbtrAddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("514", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}


	//IntermediaryAgent1
	var intrmyAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt1", "<PstlAdr>");

	var intrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

	var intrmyAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

	var intrmyAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

	var intrmyAgt1DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
	var intrmyAgt1Depart = getValueFromPath(Document, intrmyAgt1DepartPath);

	var intrmyAgt1SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt1SubDepart = getValueFromPath(Document, intrmyAgt1SubDepartPath);

	var intrmyAgt1StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt1StrtName = getValueFromPath(Document, intrmyAgt1StrtNamePath);

	var intrmyAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt1BldgNb = getValueFromPath(Document, intrmyAgt1BldgNbPath);

	var intrmyAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt1BldgNm = getValueFromPath(Document, intrmyAgt1BldgNmPath);

	var intrmyAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
	var intrmyAgt1Flr = getValueFromPath(Document, intrmyAgt1FlrPath);

	var intrmyAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt1PstBx = getValueFromPath(Document, intrmyAgt1PstBxPath);

	var intrmyAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
	var intrmyAgt1Room = getValueFromPath(Document, intrmyAgt1RoomPath);

	var intrmyAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt1PstCd = getValueFromPath(Document, intrmyAgt1PstCdPath);

	var intrmyAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt1TwnLctnNm = getValueFromPath(Document, intrmyAgt1TwnLctnNmPath);

	var intrmyAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt1DstrctNm = getValueFromPath(Document, intrmyAgt1DstrctNmPath);

	var intrmyAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt1CtrySubDvsn = getValueFromPath(Document, intrmyAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt1>")){
		if(intrmyAgt1PstlAdr){
			if(intrmyAgt1AddrLine && (!intrmyAgt1Ctry&& !intrmyAgt1TwnNm&& !intrmyAgt1Depart && !intrmyAgt1SubDepart && !intrmyAgt1StrtName && !intrmyAgt1BldgNb && !intrmyAgt1BldgNm && !intrmyAgt1Flr && !intrmyAgt1PstBx && !intrmyAgt1Room && !intrmyAgt1PstCd && !intrmyAgt1TwnLctnNm && !intrmyAgt1DstrctNm  && !intrmyAgt1CtrySubDvsn)){
			var count = countXmlNodes(Document, "IntrmyAgt1", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var intrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
						var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);
						var adrLineLength = intrmyAgt1AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("369", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//IntermediaryAgent2
	var intrmyAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt2", "<PstlAdr>");

	var intrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

	var intrmyAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

	var intrmyAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

	var intrmyAgt2DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
	var intrmyAgt2Depart = getValueFromPath(Document, intrmyAgt2DepartPath);

	var intrmyAgt2SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt2SubDepart = getValueFromPath(Document, intrmyAgt2SubDepartPath);

	var intrmyAgt2StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt2StrtName = getValueFromPath(Document, intrmyAgt2StrtNamePath);

	var intrmyAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt2BldgNb = getValueFromPath(Document, intrmyAgt2BldgNbPath);

	var intrmyAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt2BldgNm = getValueFromPath(Document, intrmyAgt2BldgNmPath);

	var intrmyAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
	var intrmyAgt2Flr = getValueFromPath(Document, intrmyAgt2FlrPath);

	var intrmyAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt2PstBx = getValueFromPath(Document, intrmyAgt2PstBxPath);

	var intrmyAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
	var intrmyAgt2Room = getValueFromPath(Document, intrmyAgt2RoomPath);

	var intrmyAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt2PstCd = getValueFromPath(Document, intrmyAgt2PstCdPath);

	var intrmyAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt2TwnLctnNm = getValueFromPath(Document, intrmyAgt2TwnLctnNmPath);

	var intrmyAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt2DstrctNm = getValueFromPath(Document, intrmyAgt2DstrctNmPath);

	var intrmyAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt2CtrySubDvsn = getValueFromPath(Document, intrmyAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt2>")){
		if(intrmyAgt2PstlAdr){
			if(intrmyAgt2AddrLine && (!intrmyAgt2Ctry&& !intrmyAgt2TwnNm&& !intrmyAgt2Depart && !intrmyAgt2SubDepart && !intrmyAgt2StrtName && !intrmyAgt2BldgNb && !intrmyAgt2BldgNm && !intrmyAgt2Flr && !intrmyAgt2PstBx && !intrmyAgt2Room && !intrmyAgt2PstCd && !intrmyAgt2TwnLctnNm && !intrmyAgt2DstrctNm  && !intrmyAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt2", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var intrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
						var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);
						var adrLineLength = intrmyAgt2AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("417", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//IntermediaryAgent3
	var intrmyAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "IntrmyAgt3", "<PstlAdr>");

	var intrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
	var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

	var intrmyAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
	var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

	var intrmyAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
	var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

	var intrmyAgt3DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
	var intrmyAgt3Depart = getValueFromPath(Document, intrmyAgt3DepartPath);

	var intrmyAgt3SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
	var intrmyAgt3SubDepart = getValueFromPath(Document, intrmyAgt3SubDepartPath);

	var intrmyAgt3StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
	var intrmyAgt3StrtName = getValueFromPath(Document, intrmyAgt3StrtNamePath);

	var intrmyAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
	var intrmyAgt3BldgNb = getValueFromPath(Document, intrmyAgt3BldgNbPath);

	var intrmyAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
	var intrmyAgt3BldgNm = getValueFromPath(Document, intrmyAgt3BldgNmPath);

	var intrmyAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
	var intrmyAgt3Flr = getValueFromPath(Document, intrmyAgt3FlrPath);

	var intrmyAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
	var intrmyAgt3PstBx = getValueFromPath(Document, intrmyAgt3PstBxPath);

	var intrmyAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
	var intrmyAgt3Room = getValueFromPath(Document, intrmyAgt3RoomPath);

	var intrmyAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
	var intrmyAgt3PstCd = getValueFromPath(Document, intrmyAgt3PstCdPath);

	var intrmyAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var intrmyAgt3TwnLctnNm = getValueFromPath(Document, intrmyAgt3TwnLctnNmPath);

	var intrmyAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
	var intrmyAgt3DstrctNm = getValueFromPath(Document, intrmyAgt3DstrctNmPath);

	var intrmyAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var intrmyAgt3CtrySubDvsn = getValueFromPath(Document, intrmyAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<IntrmyAgt3>")){
		if(intrmyAgt3PstlAdr){
			if(intrmyAgt3AddrLine && (!intrmyAgt3Ctry&& !intrmyAgt3TwnNm&& !intrmyAgt3Depart && !intrmyAgt3SubDepart && !intrmyAgt3StrtName && !intrmyAgt3BldgNb && !intrmyAgt3BldgNm && !intrmyAgt3Flr && !intrmyAgt3PstBx && !intrmyAgt3Room && !intrmyAgt3PstCd && !intrmyAgt3TwnLctnNm && !intrmyAgt3DstrctNm  && !intrmyAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "IntrmyAgt3", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var intrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
						var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);
						var adrLineLength = intrmyAgt3AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("465", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//PreviousInstructingAgent1
	var prvsInstgAgt1PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");

	var prvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

	var prvsInstgAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

	var prvsInstgAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

	var prvsInstgAgt1DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt1Dept = getValueFromPath(Document, prvsInstgAgt1DeptPath);

	var prvsInstgAgt1SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt1SubDept = getValueFromPath(Document, prvsInstgAgt1SubDeptPath);

	var prvsInstgAgt1StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt1StrtNm = getValueFromPath(Document, prvsInstgAgt1StrtNmPath);

	var prvsInstgAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt1BldgNb = getValueFromPath(Document, prvsInstgAgt1BldgNbPath);

	var prvsInstgAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt1BldgNm = getValueFromPath(Document, prvsInstgAgt1BldgNmPath);

	var prvsInstgAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt1Flr = getValueFromPath(Document, prvsInstgAgt1FlrPath);

	var prvsInstgAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt1PstBx = getValueFromPath(Document, prvsInstgAgt1PstBxPath);

	var prvsInstgAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt1Room = getValueFromPath(Document, prvsInstgAgt1RoomPath);

	var prvsInstgAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt1PstCd = getValueFromPath(Document, prvsInstgAgt1PstCdPath);

	var prvsInstgAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt1TwnLctnNm = getValueFromPath(Document, prvsInstgAgt1TwnLctnNmPath);

	var prvsInstgAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt1DstrctNm = getValueFromPath(Document, prvsInstgAgt1DstrctNmPath);

	var prvsInstgAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt1CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt1>")){
		if(prvsInstgAgt1PstlAdr){
			if(prvsInstgAgt1AddrLine && (!prvsInstgAgt1Ctry&& !prvsInstgAgt1TwnNm&& !prvsInstgAgt1Dept && !prvsInstgAgt1SubDept && !prvsInstgAgt1StrtNm && !prvsInstgAgt1BldgNb && !prvsInstgAgt1BldgNm && !prvsInstgAgt1Flr && !prvsInstgAgt1PstBx && !prvsInstgAgt1Room && !prvsInstgAgt1PstCd && !prvsInstgAgt1TwnLctnNm && !prvsInstgAgt1DstrctNm && !prvsInstgAgt1CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt1", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var prvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
						var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);
						var adrLineLength = prvsInstgAgt1AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("199", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//PreviousInstructingAgent2
	var prvsInstgAgt2PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt2", "<PstlAdr>");

	var prvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

	var prvsInstgAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

	var prvsInstgAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

	var prvsInstgAgt2DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt2Dept = getValueFromPath(Document, prvsInstgAgt2DeptPath);

	var prvsInstgAgt2SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt2SubDept = getValueFromPath(Document, prvsInstgAgt2SubDeptPath);

	var prvsInstgAgt2StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt2StrtNm = getValueFromPath(Document, prvsInstgAgt2StrtNmPath);

	var prvsInstgAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt2BldgNb = getValueFromPath(Document, prvsInstgAgt2BldgNbPath);

	var prvsInstgAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt2BldgNm = getValueFromPath(Document, prvsInstgAgt2BldgNmPath);

	var prvsInstgAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt2Flr = getValueFromPath(Document, prvsInstgAgt2FlrPath);

	var prvsInstgAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt2PstBx = getValueFromPath(Document, prvsInstgAgt2PstBxPath);

	var prvsInstgAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt2Room = getValueFromPath(Document, prvsInstgAgt2RoomPath);

	var prvsInstgAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt2PstCd = getValueFromPath(Document, prvsInstgAgt2PstCdPath);

	var prvsInstgAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt2TwnLctnNm = getValueFromPath(Document, prvsInstgAgt2TwnLctnNmPath);

	var prvsInstgAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt2DstrctNm = getValueFromPath(Document, prvsInstgAgt2DstrctNmPath);

	var prvsInstgAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt2CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt2>")){
		if(prvsInstgAgt2PstlAdr){
			if(prvsInstgAgt2AddrLine && (!prvsInstgAgt2Ctry&& !prvsInstgAgt2TwnNm&& !prvsInstgAgt2Dept && !prvsInstgAgt2SubDept && !prvsInstgAgt2StrtNm && !prvsInstgAgt2BldgNb && !prvsInstgAgt2BldgNm && !prvsInstgAgt2Flr && !prvsInstgAgt2PstBx && !prvsInstgAgt2Room && !prvsInstgAgt2PstCd && !prvsInstgAgt2TwnLctnNm && !prvsInstgAgt2DstrctNm && !prvsInstgAgt2CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt2", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var prvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
						var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);
						var adrLineLength = prvsInstgAgt2AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("247", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

	//PreviousInstructingAgent3
	var prvsInstgAgt3PstlAdr =  isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt3", "<PstlAdr>");

	var prvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
	var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

	var prvsInstgAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
	var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

	var prvsInstgAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
	var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

	var prvsInstgAgt3DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
	var prvsInstgAgt3Dept = getValueFromPath(Document, prvsInstgAgt3DeptPath);

	var prvsInstgAgt3SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
	var prvsInstgAgt3SubDept = getValueFromPath(Document, prvsInstgAgt3SubDeptPath);

	var prvsInstgAgt3StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
	var prvsInstgAgt3StrtNm = getValueFromPath(Document, prvsInstgAgt3StrtNmPath);

	var prvsInstgAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
	var prvsInstgAgt3BldgNb = getValueFromPath(Document, prvsInstgAgt3BldgNbPath);

	var prvsInstgAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
	var prvsInstgAgt3BldgNm = getValueFromPath(Document, prvsInstgAgt3BldgNmPath);

	var prvsInstgAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
	var prvsInstgAgt3Flr = getValueFromPath(Document, prvsInstgAgt3FlrPath);

	var prvsInstgAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
	var prvsInstgAgt3PstBx = getValueFromPath(Document, prvsInstgAgt3PstBxPath);

	var prvsInstgAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
	var prvsInstgAgt3Room = getValueFromPath(Document, prvsInstgAgt3RoomPath);

	var prvsInstgAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
	var prvsInstgAgt3PstCd = getValueFromPath(Document, prvsInstgAgt3PstCdPath);

	var prvsInstgAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
	var prvsInstgAgt3TwnLctnNm = getValueFromPath(Document, prvsInstgAgt3TwnLctnNmPath);

	var prvsInstgAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
	var prvsInstgAgt3DstrctNm = getValueFromPath(Document, prvsInstgAgt3DstrctNmPath);

	var prvsInstgAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
	var prvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt3CtrySubDvsnPath);

	if(isPatternPresent(Document1, "<PrvsInstgAgt3>")){
		if(prvsInstgAgt3PstlAdr){
			if(prvsInstgAgt3AddrLine && (!prvsInstgAgt3Ctry&& !prvsInstgAgt3TwnNm&& !prvsInstgAgt3Dept && !prvsInstgAgt3SubDept && !prvsInstgAgt3StrtNm && !prvsInstgAgt3BldgNb && !prvsInstgAgt3BldgNm && !prvsInstgAgt3Flr && !prvsInstgAgt3PstBx && !prvsInstgAgt3Room && !prvsInstgAgt3PstCd && !prvsInstgAgt3TwnLctnNm && !prvsInstgAgt3DstrctNm && !prvsInstgAgt3CtrySubDvsn)){
				var count = countXmlNodes(Document, "PrvsInstgAgt3", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var prvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
						var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);
						var adrLineLength = prvsInstgAgt3AddrLine.length;
						logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("295", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        //Underlying Creditor Agent
        var undrlygCdtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");

        var undrlygCdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygCdtrAgtAddrLine = getValueFromPath(Document, undrlygCdtrAgtAddrLinePath);
        logger.info("undrlygCdtrAgtAddrLine:" + undrlygCdtrAgtAddrLine);

        var undrlygCdtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygCdtrAgtTwnNm = getValueFromPath(Document, undrlygCdtrAgtTwnNmPath);

        var undrlygCdtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygCdtrAgtCtry = getValueFromPath(Document, undrlygCdtrAgtCtryPath);

        var undrlygCdtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygCdtrAgtDept = getValueFromPath(Document, undrlygCdtrAgtDeptPath);

        var undrlygCdtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygCdtrAgtSubDept = getValueFromPath(Document, undrlygCdtrAgtSubDeptPath);

        var undrlygCdtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygCdtrAgtStrtNm = getValueFromPath(Document, undrlygCdtrAgtStrtNmPath);

        var undrlygCdtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygCdtrAgtBldgNb = getValueFromPath(Document, undrlygCdtrAgtBldgNbPath);

        var undrlygCdtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygCdtrAgtBldgNm = getValueFromPath(Document, undrlygCdtrAgtBldgNmPath);

        var undrlygCdtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygCdtrAgtFlr = getValueFromPath(Document, undrlygCdtrAgtFlrPath);

        var undrlygCdtrAgtPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygCdtrAgtPstBx = getValueFromPath(Document, undrlygCdtrAgtPstBxPath);

        var undrlygCdtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygCdtrAgtRoom = getValueFromPath(Document, undrlygCdtrAgtRoomPath);

        var undrlygCdtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygCdtrAgtPstCd = getValueFromPath(Document, undrlygCdtrAgtPstCdPath);

        var undrlygCdtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygCdtrAgtTwnLctnNm = getValueFromPath(Document, undrlygCdtrAgtTwnLctnNmPath);

        var undrlygCdtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygCdtrAgtDstrctNm = getValueFromPath(Document, undrlygCdtrAgtDstrctNmPath);

        var undrlygCdtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygCdtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygCdtrAgtCtrySubDvsnPath);
        
        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if(undrlygCdtrAgtPstlAdr){
                if(undrlygCdtrAgtAddrLine && (!undrlygCdtrAgtCtry&& !undrlygCdtrAgtTwnNm&& !undrlygCdtrAgtDept&& !undrlygCdtrAgtSubDept&& !undrlygCdtrAgtStrtNm&& !undrlygCdtrAgtBldgNb&& !undrlygCdtrAgtBldgNm&& !undrlygCdtrAgtFlr&& !undrlygCdtrAgtPstBx&& !undrlygCdtrAgtRoom&& !undrlygCdtrAgtPstCd&& !undrlygCdtrAgtTwnLctnNm&& !undrlygCdtrAgtDstrctNm&& !undrlygCdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes(Document3, "CdtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygCdtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygCdtrAgtAddrLine = getValueFromPath(Document, undrlygCdtrAgtAddrLinePath);
                            var adrLineLength = undrlygCdtrAgtAddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        //Underlying Debtor Agent
        var undrlygDbtrAgtPstlAdr = isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");

        var undrlygDbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygDbtrAgtAddrLine = getValueFromPath(Document, undrlygDbtrAgtAddrLinePath);

        var undrlygDbtrAgtTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygDbtrAgtTwnNm = getValueFromPath(Document, undrlygDbtrAgtTwnNmPath);

        var undrlygDbtrAgtCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygDbtrAgtCtry = getValueFromPath(Document, undrlygDbtrAgtCtryPath);

        var undrlygDbtrAgtDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygDbtrAgtDept = getValueFromPath(Document, undrlygDbtrAgtDeptPath);

        var undrlygDbtrAgtSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygDbtrAgtSubDept = getValueFromPath(Document, undrlygDbtrAgtSubDeptPath);

        var undrlygDbtrAgtStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygDbtrAgtStrtNm = getValueFromPath(Document, undrlygDbtrAgtStrtNmPath);

        var undrlygDbtrAgtBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygDbtrAgtBldgNb = getValueFromPath(Document, undrlygDbtrAgtBldgNbPath);

        var undrlygDbtrAgtBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygDbtrAgtBldgNm = getValueFromPath(Document, undrlygDbtrAgtBldgNmPath);

        var undrlygDbtrAgtFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygDbtrAgtFlr = getValueFromPath(Document, undrlygDbtrAgtFlrPath);

        var undrlygDbtrAgtPstBXPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygDbtrAgtPstBx = getValueFromPath(Document, undrlygDbtrAgtPstBXPath);

        var undrlygDbtrAgtRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygDbtrAgtRoom = getValueFromPath(Document, undrlygDbtrAgtRoomPath);

        var undrlygDbtrAgtPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygDbtrAgtPstCd = getValueFromPath(Document, undrlygDbtrAgtPstCdPath);

        var undrlygDbtrAgtTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygDbtrAgtTwnLctnNm = getValueFromPath(Document, undrlygDbtrAgtTwnLctnNmPath);

        var undrlygDbtrAgtDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygDbtrAgtDstrctNm = getValueFromPath(Document, undrlygDbtrAgtDstrctNmPath);

        var undrlygDbtrAgtCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygDbtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygDbtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<DbtrAgt>")){
            if(undrlygDbtrAgtPstlAdr){
                if(undrlygDbtrAgtAddrLine && (!undrlygDbtrAgtCtry&& !undrlygDbtrAgtTwnNm&& !undrlygDbtrAgtDept&& !undrlygDbtrAgtSubDept&& !undrlygDbtrAgtStrtNm&& !undrlygDbtrAgtBldgNb&& !undrlygDbtrAgtBldgNm&& !undrlygDbtrAgtFlr&& !undrlygDbtrAgtPstBx&& !undrlygDbtrAgtRoom&& !undrlygDbtrAgtPstCd && !undrlygDbtrAgtTwnLctnNm&& !undrlygDbtrAgtDstrctNm&& !undrlygDbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes(Document3, "DbtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygDbtrAgtAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygDbtrAgtAddrLine = getValueFromPath(Document, undrlygDbtrAgtAddrLinePath);
                            var adrLineLength = undrlygDbtrAgtAddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }	
                        }
                    }
                }
            }
        }
        
        //Underlying Creditor
        var undrlygCdtrPstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");

        var undrlygCdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
        var undrlygCdtrAddrLine = getValueFromPath(Document, undrlygCdtrAddrLinePath);

        var undrlygCdtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
        var undrlygCdtrTwnNm = getValueFromPath(Document, undrlygCdtrTwnNmPath);

        var undrlygCdtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
        var undrlygCdtrCtry = getValueFromPath(Document, undrlygCdtrCtryPath);

        var undrlygCdtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Dept';
        var undrlygCdtrDept = getValueFromPath(Document, undrlygCdtrDeptPath);
        
        var undrlygCdtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/SubDept';
        var undrlygCdtrSubDept = getValueFromPath(Document, undrlygCdtrSubDeptPath);

        var undrlygCdtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/StrtNm';
        var undrlygCdtrStrtNm = getValueFromPath(Document, undrlygCdtrStrtNmPath);

        var undrlygCdtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNb';
        var undrlygCdtrBldgNb = getValueFromPath(Document, undrlygCdtrBldgNbPath);

        var undrlygCdtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNm';
        var undrlygCdtrBldgNm = getValueFromPath(Document, undrlygCdtrBldgNmPath);

        var undrlygCdtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Flr';
        var undrlygCdtrFlr = getValueFromPath(Document, undrlygCdtrFlrPath);

        var undrlygCdtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstBx';
        var undrlygCdtrPstBx = getValueFromPath(Document, undrlygCdtrPstBxPath);

        var undrlygCdtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Room';
        var undrlygCdtrRoom = getValueFromPath(Document, undrlygCdtrRoomPath);

        var undrlygCdtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstCd';
        var undrlygCdtrPstCd = getValueFromPath(Document, undrlygCdtrPstCdPath);

        var undrlygCdtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnLctnNm';
        var undrlygCdtrTwnLctnNm = getValueFromPath(Document, undrlygCdtrTwnLctnNmPath);

        var undrlygCdtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/DstrctNm';
        var undrlygCdtrDstrctNm = getValueFromPath(Document, undrlygCdtrDstrctNmPath);

        var undrlygCdtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/CtrySubDvsn';
        var undrlygCdtrCtrySubDvsn = getValueFromPath(Document, undrlygCdtrCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<Cdtr>")){
            if(undrlygCdtrPstlAdr){
                if(undrlygCdtrAddrLine && (!undrlygCdtrCtry&& !undrlygCdtrTwnNm&& !undrlygCdtrDept&& !undrlygCdtrSubDept&& !undrlygCdtrStrtNm&& !undrlygCdtrBldgNb&& !undrlygCdtrBldgNm&& !undrlygCdtrFlr&& !undrlygCdtrPstBx&& !undrlygCdtrRoom&& !undrlygCdtrPstCd&& !undrlygCdtrTwnLctnNm && !undrlygCdtrDstrctNm&& !undrlygCdtrCtrySubDvsn)){
                    var count = countXmlNodes(Document3, "Cdtr", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygCdtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine['+i+']';
                            var undrlygCdtrAddrLine = getValueFromPath(Document, undrlygCdtrAddrLinePath);
                            var adrLineLength = undrlygCdtrAddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }

        //Underlying Debtor
        var undrlygDbtrPstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");
        
        var undrlygDbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
        var undrlygDbtrAddrLine = getValueFromPath(Document, undrlygDbtrAddrLinePath);
        
        var undrlygDbtrTwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
        var undrlygDbtrTwnNm = getValueFromPath(Document, undrlygDbtrTwnNmPath);
        
        var undrlygDbtrCtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
        var undrlygDbtrCtry = getValueFromPath(Document, undrlygDbtrCtryPath);
        
        var undrlygDbtrDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Dept';
        var undrlygDbtrDept = getValueFromPath(Document, undrlygDbtrDeptPath);
        
        var undrlygDbtrSubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/SubDept';
        var undrlygDbtrSubDept = getValueFromPath(Document, undrlygDbtrSubDeptPath);
        
        var undrlygDbtrStrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/StrtNm';
        var undrlygDbtrStrNm = getValueFromPath(Document, undrlygDbtrStrtNmPath);
        
        var undrlygDbtrBldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNb';
        var undrlygDbtrBldgNb = getValueFromPath(Document, undrlygDbtrBldgNbPath);
        
        var undrlygDbtrBldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNm';
        var undrlygDbtrBldgNm = getValueFromPath(Document, undrlygDbtrBldgNmPath);
        
        var undrlygDbtrFlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Flr';
        var undrlygDbtrFlr = getValueFromPath(Document, undrlygDbtrFlrPath);
        
        var undrlygDbtrPstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstBx';
        var undrlygDbtrPstBx = getValueFromPath(Document, undrlygDbtrPstBxPath);
        
        var undrlygDbtrRoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Room';
        var undrlygDbtrRoom = getValueFromPath(Document, undrlygDbtrRoomPath);
        
        var undrlygDbtrPstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstCd';
        var undrlygDbtrPstCd = getValueFromPath(Document, undrlygDbtrPstCdPath);
        
        var undrlygDbtrTwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnLctnNm';
        var undrlygDbtrTwnLctnNm = getValueFromPath(Document, undrlygDbtrTwnLctnNmPath);
        
        var undrlygDbtrDstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/DstrctNm';
        var undrlygDbtrDstrctNm = getValueFromPath(Document, undrlygDbtrDstrctNmPath);
        
        var undrlygDbtrCtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/CtrySubDvsn';
        var undrlygDbtrCtrySubDvsn = getValueFromPath(Document, undrlygDbtrCtrySubDvsnPath);
        
        if(isPatternPresent(Document2, "<Dbtr>")){
            if(undrlygDbtrPstlAdr){
                if(undrlygDbtrAddrLine && (!undrlygDbtrCtry&& !undrlygDbtrTwnNm&& !undrlygDbtrDept&& !undrlygDbtrSubDept&& !undrlygDbtrStrNm&& !undrlygDbtrBldgNb&& !undrlygDbtrBldgNm&& !undrlygDbtrFlr&& !undrlygDbtrPstBx&& !undrlygDbtrRoom&& !undrlygDbtrPstCd&& !undrlygDbtrTwnLctnNm&& !undrlygDbtrDstrctNm&& !undrlygDbtrCtrySubDvsn)){
                    var count = countXmlNodes(Document3, "Dbtr", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygDbtrAddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine['+i+']';
                            var undrlygDbtrAddrLine = getValueFromPath(Document, undrlygDbtrAddrLinePath);
                            var adrLineLength = undrlygDbtrAddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        //Underlying IntermediaryAgent1
        var undrlygIntrmyAgt1PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");

        var undrlygIntrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt1AddrLine = getValueFromPath(Document, undrlygIntrmyAgt1AddrLinePath);

        var undrlygIntrmyAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt1TwnNm = getValueFromPath(Document, undrlygIntrmyAgt1TwnNmPath);

        var undrlygIntrmyAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt1Ctry = getValueFromPath(Document, undrlygIntrmyAgt1CtryPath);

        var undrlygIntrmyAgt1DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt1Depart = getValueFromPath(Document, undrlygIntrmyAgt1DepartPath);

        var undrlygIntrmyAgt1SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt1SubDepart = getValueFromPath(Document, undrlygIntrmyAgt1SubDepartPath);

        var undrlygIntrmyAgt1StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt1StrtName = getValueFromPath(Document, undrlygIntrmyAgt1StrtNamePath);

        var undrlygIntrmyAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt1BldgNb = getValueFromPath(Document, undrlygIntrmyAgt1BldgNbPath);

        var undrlygIntrmyAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt1BldgNm = getValueFromPath(Document, undrlygIntrmyAgt1BldgNmPath);

        var undrlygIntrmyAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt1Flr = getValueFromPath(Document, undrlygIntrmyAgt1FlrPath);

        var undrlygIntrmyAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt1PstBx = getValueFromPath(Document, undrlygIntrmyAgt1PstBxPath);

        var undrlygIntrmyAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt1Room = getValueFromPath(Document, undrlygIntrmyAgt1RoomPath);

        var undrlygIntrmyAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt1PstCd = getValueFromPath(Document, undrlygIntrmyAgt1PstCdPath);

        var undrlygIntrmyAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt1TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt1TwnLctnNmPath);

        var undrlygIntrmyAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt1DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt1DstrctNmPath);

        var undrlygIntrmyAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt1CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt1>")){
            if(undrlygIntrmyAgt1PstlAdr){
                if(undrlygIntrmyAgt1AddrLine && (!undrlygIntrmyAgt1Ctry&& !undrlygIntrmyAgt1TwnNm&& !undrlygIntrmyAgt1Depart && !undrlygIntrmyAgt1SubDepart && !undrlygIntrmyAgt1StrtName && !undrlygIntrmyAgt1BldgNb && !undrlygIntrmyAgt1BldgNm && !undrlygIntrmyAgt1Flr && !undrlygIntrmyAgt1PstBx && !undrlygIntrmyAgt1Room && !undrlygIntrmyAgt1PstCd && !undrlygIntrmyAgt1TwnLctnNm && !undrlygIntrmyAgt1DstrctNm  && !undrlygIntrmyAgt1CtrySubDvsn)){
                var count = countXmlNodes(Document3, "IntrmyAgt1", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygIntrmyAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygIntrmyAgt1AddrLine = getValueFromPath(Document, undrlygIntrmyAgt1AddrLinePath);
                            var adrLineLength = undrlygIntrmyAgt1AddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }

        //Underlying IntermediaryAgent2
        var undrlygIntrmyAgt2PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");

        var undrlygIntrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt2AddrLine = getValueFromPath(Document, undrlygIntrmyAgt2AddrLinePath);

        var undrlygIntrmyAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt2TwnNm = getValueFromPath(Document, undrlygIntrmyAgt2TwnNmPath);

        var undrlygIntrmyAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt2Ctry = getValueFromPath(Document, undrlygIntrmyAgt2CtryPath);

        var undrlygIntrmyAgt2DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt2Depart = getValueFromPath(Document, undrlygIntrmyAgt2DepartPath);

        var undrlygIntrmyAgt2SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt2SubDepart = getValueFromPath(Document, undrlygIntrmyAgt2SubDepartPath);

        var undrlygIntrmyAgt2StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt2StrtName = getValueFromPath(Document, undrlygIntrmyAgt2StrtNamePath);

        var undrlygIntrmyAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt2BldgNb = getValueFromPath(Document, undrlygIntrmyAgt2BldgNbPath);

        var undrlygIntrmyAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt2BldgNm = getValueFromPath(Document, undrlygIntrmyAgt2BldgNmPath);

        var undrlygIntrmyAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt2Flr = getValueFromPath(Document, undrlygIntrmyAgt2FlrPath);

        var undrlygIntrmyAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt2PstBx = getValueFromPath(Document, undrlygIntrmyAgt2PstBxPath);

        var undrlygIntrmyAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt2Room = getValueFromPath(Document, undrlygIntrmyAgt2RoomPath);

        var undrlygIntrmyAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt2PstCd = getValueFromPath(Document, undrlygIntrmyAgt2PstCdPath);

        var undrlygIntrmyAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt2TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt2TwnLctnNmPath);

        var undrlygIntrmyAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt2DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt2DstrctNmPath);

        var undrlygIntrmyAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt2CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt2>")){
            if(undrlygIntrmyAgt2PstlAdr){
                if(undrlygIntrmyAgt2AddrLine && (!undrlygIntrmyAgt2Ctry&& !undrlygIntrmyAgt2TwnNm&& !undrlygIntrmyAgt2Depart && !undrlygIntrmyAgt2SubDepart && !undrlygIntrmyAgt2StrtName && !undrlygIntrmyAgt2BldgNb && !undrlygIntrmyAgt2BldgNm && !undrlygIntrmyAgt2Flr && !undrlygIntrmyAgt2PstBx && !undrlygIntrmyAgt2Room && !undrlygIntrmyAgt2PstCd && !undrlygIntrmyAgt2TwnLctnNm && !undrlygIntrmyAgt2DstrctNm  && !undrlygIntrmyAgt2CtrySubDvsn)){
                var count = countXmlNodes(Document3, "IntrmyAgt2", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygIntrmyAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygIntrmyAgt2AddrLine = getValueFromPath(Document, undrlygIntrmyAgt2AddrLinePath);
                            var adrLineLength = undrlygIntrmyAgt2AddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }

        //Underlying IntermediaryAgent3
        var undrlygIntrmyAgt3PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");

        var undrlygIntrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt3AddrLine = getValueFromPath(Document, undrlygIntrmyAgt3AddrLinePath);

        var undrlygIntrmyAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt3TwnNm = getValueFromPath(Document, undrlygIntrmyAgt3TwnNmPath);

        var undrlygIntrmyAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt3Ctry = getValueFromPath(Document, undrlygIntrmyAgt3CtryPath);

        var undrlygIntrmyAgt3DepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt3Depart = getValueFromPath(Document, undrlygIntrmyAgt3DepartPath);

        var undrlygIntrmyAgt3SubDepartPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt3SubDepart = getValueFromPath(Document, undrlygIntrmyAgt3SubDepartPath);

        var undrlygIntrmyAgt3StrtNamePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt3StrtName = getValueFromPath(Document, undrlygIntrmyAgt3StrtNamePath);

        var undrlygIntrmyAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt3BldgNb = getValueFromPath(Document, undrlygIntrmyAgt3BldgNbPath);

        var undrlygIntrmyAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt3BldgNm = getValueFromPath(Document, undrlygIntrmyAgt3BldgNmPath);

        var undrlygIntrmyAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt3Flr = getValueFromPath(Document, undrlygIntrmyAgt3FlrPath);

        var undrlygIntrmyAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt3PstBx = getValueFromPath(Document, undrlygIntrmyAgt3PstBxPath);

        var undrlygIntrmyAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt3Room = getValueFromPath(Document, undrlygIntrmyAgt3RoomPath);

        var undrlygIntrmyAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt3PstCd = getValueFromPath(Document, undrlygIntrmyAgt3PstCdPath);

        var undrlygIntrmyAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt3TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt3TwnLctnNmPath);

        var undrlygIntrmyAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt3DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt3DstrctNmPath);

        var undrlygIntrmyAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt3CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt3>")){
            if(undrlygIntrmyAgt3PstlAdr){
                if(undrlygIntrmyAgt3AddrLine && (!undrlygIntrmyAgt3Ctry&& !undrlygIntrmyAgt3TwnNm&& !undrlygIntrmyAgt3Depart && !undrlygIntrmyAgt3SubDepart && !undrlygIntrmyAgt3StrtName && !undrlygIntrmyAgt3BldgNb && !undrlygIntrmyAgt3BldgNm && !undrlygIntrmyAgt3Flr && !undrlygIntrmyAgt3PstBx && !undrlygIntrmyAgt3Room && !undrlygIntrmyAgt3PstCd && !undrlygIntrmyAgt3TwnLctnNm && !undrlygIntrmyAgt3DstrctNm  && !undrlygIntrmyAgt3CtrySubDvsn)){
                var count = countXmlNodes(Document3, "IntrmyAgt3", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygIntrmyAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygIntrmyAgt3AddrLine = getValueFromPath(Document, undrlygIntrmyAgt3AddrLinePath);
                            var adrLineLength = undrlygIntrmyAgt3AddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        //Underlying PreviousInstructingAgent1
        var undrlygPrvsInstgAgt1PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");

        var undrlygPrvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt1AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt1AddrLinePath);

        var undrlygPrvsInstgAgt1TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt1TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt1TwnNmPath);

        var undrlygPrvsInstgAgt1CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt1Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt1CtryPath);

        var undrlygPrvsInstgAgt1DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt1Dept = getValueFromPath(Document, undrlygPrvsInstgAgt1DeptPath);

        var undrlygPrvsInstgAgt1SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt1SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt1SubDeptPath);

        var undrlygPrvsInstgAgt1StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt1StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt1StrtNmPath);

        var undrlygPrvsInstgAgt1BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt1BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt1BldgNbPath);

        var undrlygPrvsInstgAgt1BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt1BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt1BldgNmPath);

        var undrlygPrvsInstgAgt1FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt1Flr = getValueFromPath(Document, undrlygPrvsInstgAgt1FlrPath);

        var undrlygPrvsInstgAgt1PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt1PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt1PstBxPath);

        var undrlygPrvsInstgAgt1RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt1Room = getValueFromPath(Document, undrlygPrvsInstgAgt1RoomPath);

        var undrlygPrvsInstgAgt1PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt1PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt1PstCdPath);

        var undrlygPrvsInstgAgt1TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt1TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt1TwnLctnNmPath);

        var undrlygPrvsInstgAgt1DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt1DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt1DstrctNmPath);

        var undrlygPrvsInstgAgt1CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
            if(undrlygPrvsInstgAgt1PstlAdr){
                if(undrlygPrvsInstgAgt1AddrLine && (!undrlygPrvsInstgAgt1Ctry&& !undrlygPrvsInstgAgt1TwnNm&& !undrlygPrvsInstgAgt1Dept && !undrlygPrvsInstgAgt1SubDept && !undrlygPrvsInstgAgt1StrtNm && !undrlygPrvsInstgAgt1BldgNb && !undrlygPrvsInstgAgt1BldgNm && !undrlygPrvsInstgAgt1Flr && !undrlygPrvsInstgAgt1PstBx && !undrlygPrvsInstgAgt1Room && !undrlygPrvsInstgAgt1PstCd && !undrlygPrvsInstgAgt1TwnLctnNm && !undrlygPrvsInstgAgt1DstrctNm && !undrlygPrvsInstgAgt1CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "PrvsInstgAgt1", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygPrvsInstgAgt1AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygPrvsInstgAgt1AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt1AddrLinePath);
                            var adrLineLength = undrlygPrvsInstgAgt1AddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }

        //Underlying PreviousInstructingAgent2
        var undrlygPrvsInstgAgt2PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");

        var undrlygPrvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt2AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt2AddrLinePath);

        var undrlygPrvsInstgAgt2TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt2TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt2TwnNmPath);

        var undrlygPrvsInstgAgt2CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt2Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt2CtryPath);

        var undrlygPrvsInstgAgt2DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt2Dept = getValueFromPath(Document, undrlygPrvsInstgAgt2DeptPath);

        var undrlygPrvsInstgAgt2SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt2SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt2SubDeptPath);

        var undrlygPrvsInstgAgt2StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt2StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt2StrtNmPath);

        var undrlygPrvsInstgAgt2BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt2BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt2BldgNbPath);

        var undrlygPrvsInstgAgt2BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt2BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt2BldgNmPath);

        var undrlygPrvsInstgAgt2FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt2Flr = getValueFromPath(Document, undrlygPrvsInstgAgt2FlrPath);

        var undrlygPrvsInstgAgt2PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt2PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt2PstBxPath);

        var undrlygPrvsInstgAgt2RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt2Room = getValueFromPath(Document, undrlygPrvsInstgAgt2RoomPath);

        var undrlygPrvsInstgAgt2PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt2PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt2PstCdPath);

        var undrlygPrvsInstgAgt2TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt2TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt2TwnLctnNmPath);

        var undrlygPrvsInstgAgt2DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt2DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt2DstrctNmPath);

        var undrlygPrvsInstgAgt2CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
            if(undrlygPrvsInstgAgt2PstlAdr){
                if(undrlygPrvsInstgAgt2AddrLine && (!undrlygPrvsInstgAgt2Ctry&& !undrlygPrvsInstgAgt2TwnNm&& !undrlygPrvsInstgAgt2Dept && !undrlygPrvsInstgAgt2SubDept && !undrlygPrvsInstgAgt2StrtNm && !undrlygPrvsInstgAgt2BldgNb && !undrlygPrvsInstgAgt2BldgNm && !undrlygPrvsInstgAgt2Flr && !undrlygPrvsInstgAgt2PstBx && !undrlygPrvsInstgAgt2Room && !undrlygPrvsInstgAgt2PstCd && !undrlygPrvsInstgAgt2TwnLctnNm && !undrlygPrvsInstgAgt2DstrctNm && !undrlygPrvsInstgAgt2CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "PrvsInstgAgt2", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygPrvsInstgAgt2AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygPrvsInstgAgt2AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt2AddrLinePath);
                            var adrLineLength = undrlygPrvsInstgAgt2AddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }

        //Underlying PreviousInstructingAgent3
        var undrlygPrvsInstgAgt3PstlAdr =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");

        var undrlygPrvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt3AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt3AddrLinePath);

        var undrlygPrvsInstgAgt3TwnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt3TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt3TwnNmPath);

        var undrlygPrvsInstgAgt3CtryPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt3Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt3CtryPath);

        var undrlygPrvsInstgAgt3DeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt3Dept = getValueFromPath(Document, undrlygPrvsInstgAgt3DeptPath);

        var undrlygPrvsInstgAgt3SubDeptPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt3SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt3SubDeptPath);

        var undrlygPrvsInstgAgt3StrtNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt3StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt3StrtNmPath);

        var undrlygPrvsInstgAgt3BldgNbPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt3BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt3BldgNbPath);

        var undrlygPrvsInstgAgt3BldgNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt3BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt3BldgNmPath);

        var undrlygPrvsInstgAgt3FlrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt3Flr = getValueFromPath(Document, undrlygPrvsInstgAgt3FlrPath);

        var undrlygPrvsInstgAgt3PstBxPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt3PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt3PstBxPath);

        var undrlygPrvsInstgAgt3RoomPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt3Room = getValueFromPath(Document, undrlygPrvsInstgAgt3RoomPath);

        var undrlygPrvsInstgAgt3PstCdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt3PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt3PstCdPath);

        var undrlygPrvsInstgAgt3TwnLctnNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt3TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt3TwnLctnNmPath);

        var undrlygPrvsInstgAgt3DstrctNmPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt3DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt3DstrctNmPath);

        var undrlygPrvsInstgAgt3CtrySubDvsnPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
            if(undrlygPrvsInstgAgt3PstlAdr){
                if(undrlygPrvsInstgAgt3AddrLine && (!undrlygPrvsInstgAgt3Ctry&& !undrlygPrvsInstgAgt3TwnNm&& !undrlygPrvsInstgAgt3Dept && !undrlygPrvsInstgAgt3SubDept && !undrlygPrvsInstgAgt3StrtNm && !undrlygPrvsInstgAgt3BldgNb && !undrlygPrvsInstgAgt3BldgNm && !undrlygPrvsInstgAgt3Flr && !undrlygPrvsInstgAgt3PstBx && !undrlygPrvsInstgAgt3Room && !undrlygPrvsInstgAgt3PstCd && !undrlygPrvsInstgAgt3TwnLctnNm && !undrlygPrvsInstgAgt3DstrctNm && !undrlygPrvsInstgAgt3CtrySubDvsn)){
                    var count = countXmlNodes(Document3, "PrvsInstgAgt3", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygPrvsInstgAgt3AddrLinePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygPrvsInstgAgt3AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt3AddrLinePath);
                            var adrLineLength = undrlygPrvsInstgAgt3AddrLine.length;
                            logger.info("gracePeriodUnstructuredFormalRulePacs9: adrLineLength = " + adrLineLength);

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRulePacs9: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("720", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }

    }
 
	return retVal;
}

function instructingAgent1RuleChipsPacs009(exchange) {
	var retVal = 0;
    var res1 = false;
    var res = false;
    
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	logger.info("In instructingAgent1RuleChipsPacs009");

    res = isXmlNodePresent2(Document, "PrvsInstgAgt1");
        if(res){
            res1 = isXmlNodePresent2(Document, "DbtrAgt");
            if(!res1){
                setHeader(map, "PLCN_validMessage", false);
                retVal = setCommentsForTransaction("199", "7075", map); // new error code
                return retVal;
            }
        }
    
    return retVal;
}

// sid
function countXmlNodes2(Document, parentNodeName, childNodeName, targetNodeName) {
    logger.info("countXmlNodes2: parentNodeName = " + parentNodeName);
    logger.info("countXmlNodes2: childNodeName = " + childNodeName);
    logger.info("countXmlNodes2: targetNodeName = " + targetNodeName);
    
    var parentNode = Document.getElementsByTagName(parentNodeName);
    if (!parentNode || parentNode.length === 0) {
        logger.info("countXmlNode2: Parent node not found.");
        return 0;
    }

    var childNode = parentNode.item(0).getElementsByTagName(childNodeName);
    if (!childNode || childNode.length === 0) {
        logger.info("countXmlNodes2: Child node not found.");
        return 0;
    }

    var targetNodes = childNode.item(0).getElementsByTagName(targetNodeName);
    var count = targetNodes ? targetNodes.length : 0;

    logger.info("countXmlNodes2: Found " + count + " <" + targetNodeName + "> nodes.");
    return count;
}

function countXmlNodes3(Document, parentNodeName, childNodeName, intermediateNodeName, targetNodeName) {
    logger.info("countXmlNodes3: parentNodeName = " + parentNodeName);
    logger.info("countXmlNodes3: childNodeName = " + childNodeName);
    logger.info("countXmlNodes3: intermediateNodeName = " + intermediateNodeName);
    logger.info("countXmlNodes3: targetNodeName = " + targetNodeName);

    var parentNode = Document.getElementsByTagName(parentNodeName);
    if (!parentNode || parentNode.length === 0) {
        logger.info("countXmlNodes3: Parent node not found.");
        return 0;
    }

    var childNode = parentNode.item(0).getElementsByTagName(childNodeName);
    if (!childNode || childNode.length === 0) {
        logger.info("countXmlNodes3: Child node not found.");
        return 0;
    }

    var intermediateNode = childNode.item(0).getElementsByTagName(intermediateNodeName);
    if (!intermediateNode || intermediateNode.length === 0) {
        logger.info("countXmlNodes3: Intermediate node not found.");
        return 0;
    }

    var targetNodes = intermediateNode.item(0).getElementsByTagName(targetNodeName);
    var count = targetNodes ? targetNodes.length : 0;

    logger.info("countXmlNodes3: Found " + count + " <" + targetNodeName + "> nodes.");
    return count;
}

function gracePeriodHybridFormalRuleChipsPacs4(exchange){ 
	logger.info("In gracePeriodHybridFormalRuleChipsPacs4");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	orgnlMsgNmIdPath = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
	orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
	logger.trace("orgnlMsgNmId = " + orgnlMsgNmId);
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        var Document2 = dataBetweenTokens("<RtrChain>", "</RtrChain>", Document1);
        Document2 = "<RtrChain>".concat(Document2).concat("</RtrChain>");
        logger.info("Document2 = " + Document2);
    }

    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        var Document4 = dataBetweenTokens("<OrgnlTxRef>", "</OrgnlTxRef>", Document1);
        Document4 = "<OrgnlTxRef>".concat(Document4).concat("</OrgnlTxRef>");
        logger.info("Document4 = " + Document4);

        if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
            var Document3 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
            Document3 = "<UndrlygCstmrCdtTrf>".concat(Document3).concat("</UndrlygCstmrCdtTrf>");
            logger.info("Document3 = " + Document3);
            Document4 = removePattern(Document4, Document3);
            logger.info("Document4 without undrlyg = " + Document4);
        }
    
    }
	//ChargesInformation
	var chrgsInfPstlAdr =  isXmlNodePresent(Document, "TxInf", "ChrgsInf", "<PstlAdr>");

	var chrgsInfAddrLinePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);

	var chrgsInfTwnNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);

	var chrgsInfCtryPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);

	var chrgsInfDeptPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Dept';
	var chrgsInfDept = getValueFromPath(Document, chrgsInfDeptPath);

	var chrgsInfSubDeptPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/SubDept';
	var chrgsInfSubDept = getValueFromPath(Document, chrgsInfSubDeptPath);

	var chrgsInfStrtNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/StrtNm';
	var chrgsInfStrtNm = getValueFromPath(Document, chrgsInfStrtNmPath);

	var chrgsInfBldgNbPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNb';
	var chrgsInfBldgNb = getValueFromPath(Document, chrgsInfBldgNbPath);

	var chrgsInfBldgNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNm';
	var chrgsInfBldgNm = getValueFromPath(Document, chrgsInfBldgNmPath);

	var chrgsInfFlrPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Flr';
	var chrgsInfFlr = getValueFromPath(Document, chrgsInfFlrPath);

	var chrgsInfPstBxPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstBx';
	var chrgsInfPstBX = getValueFromPath(Document, chrgsInfPstBxPath);

	var chrgsInfRoomPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Room';
	var chrgsInfRoom = getValueFromPath(Document, chrgsInfRoomPath);

	var chrgsInfPstCdPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstCd';
	var chrgsInfPstCd = getValueFromPath(Document, chrgsInfPstCdPath);

	var chrgsInfTwnLctnNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnLctnNm';
	var chrgsInfTwnLctnNm = getValueFromPath(Document, chrgsInfTwnLctnNmPath);

	var chrgsInfDstrctNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/DstrctNm';
	var chrgsInfDstrctNm = getValueFromPath(Document, chrgsInfDstrctNmPath);

	var chrgsInfCtrySubDvsnPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
	var chrgsInfCtrySubDvsn = getValueFromPath(Document, chrgsInfCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(chrgsInfAddrLine && (chrgsInfTwnNm || chrgsInfCtry || chrgsInfDept || chrgsInfSubDept || chrgsInfStrtNm || chrgsInfBldgNb || chrgsInfBldgNm || chrgsInfFlr|| chrgsInfPstBX|| chrgsInfRoom|| chrgsInfPstCd || chrgsInfTwnLctnNm|| chrgsInfDstrctNm || chrgsInfCtrySubDvsn)){
				var count = countXmlNodes2(Document, "RtrChain", "ChrgsInf", "AdrLine");
				if(!chrgsInfTwnNm || !chrgsInfCtry || count > 2) {
					setHeader(map, "PLCN_validMessage", false);
					logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
					retVal = setCommentsForTransaction("198", "7528", map);
					return retVal;
				}
			}
		}
	}
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        
        // Creditor Agent
        var cdtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "CdtrAgt", "<PstlAdr>");

        var cdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);

        var cdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

        var cdtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

        var cdtrAgtDeptPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var cdtrAgtDept = getValueFromPath(Document, cdtrAgtDeptPath);

        var cdtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var cdtrAgtSubDept = getValueFromPath(Document, cdtrAgtSubDeptPath);

        var cdtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var cdtrAgtStrtNm = getValueFromPath(Document, cdtrAgtStrtNmPath);

        var cdtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var cdtrAgtBldgNb = getValueFromPath(Document, cdtrAgtBldgNbPath);

        var cdtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var cdtrAgtBldgNm = getValueFromPath(Document, cdtrAgtBldgNmPath);

        var cdtrAgtFlrPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var cdtrAgtFlr = getValueFromPath(Document, cdtrAgtFlrPath);

        var cdtrAgtPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var cdtrAgtPstBx = getValueFromPath(Document, cdtrAgtPstBxPath);

        var cdtrAgtRoomPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Room';
        var cdtrAgtRoom = getValueFromPath(Document, cdtrAgtRoomPath);

        var cdtrAgtPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var cdtrAgtPstCd = getValueFromPath(Document, cdtrAgtPstCdPath);

        var cdtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var cdtrAgtTwnLctnNm = getValueFromPath(Document, cdtrAgtTwnLctnNmPath);

        var cdtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var cdtrAgtDstrctNm = getValueFromPath(Document, cdtrAgtDstrctNmPath);

        var cdtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var cdtrAgtCtrySubDvsn = getValueFromPath(Document, cdtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if(cdtrAgtPstlAdr){
                if(cdtrAgtAddrLine && (cdtrAgtCtry||cdtrAgtTwnNm||cdtrAgtDept||cdtrAgtSubDept||cdtrAgtStrtNm||cdtrAgtBldgNb||cdtrAgtBldgNm||cdtrAgtFlr||cdtrAgtPstBx||cdtrAgtRoom||cdtrAgtPstCd||cdtrAgtTwnLctnNm||cdtrAgtDstrctNm||cdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "CdtrAgt", "AdrLine");
                    if(!cdtrAgtTwnNm || !cdtrAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("625", "7528", map);
                        return retVal;
                    }			
                }
            }
        }

        // Debtor Agent
        var dbtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "DbtrAgt", "<PstlAdr>");

        var dbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

        var dbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

        var dbtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

        var dbtrAgtDeptPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var dbtrAgtDept = getValueFromPath(Document, dbtrAgtDeptPath);

        var dbtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var dbtrAgtSubDept = getValueFromPath(Document, dbtrAgtSubDeptPath);

        var dbtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var dbtrAgtStrtNm = getValueFromPath(Document, dbtrAgtStrtNmPath);

        var dbtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var dbtrAgtBldgNb = getValueFromPath(Document, dbtrAgtBldgNbPath);

        var dbtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var dbtrAgtBldgNm = getValueFromPath(Document, dbtrAgtBldgNmPath);

        var dbtrAgtFlrPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var dbtrAgtFlr = getValueFromPath(Document, dbtrAgtFlrPath);

        var dbtrAgtPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var dbtrAgtPstBx = getValueFromPath(Document, dbtrAgtPstBxPath);

        var dbtrAgtRoomPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Room';
        var dbtrAgtRoom = getValueFromPath(Document, dbtrAgtRoomPath);

        var dbtrAgtPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var dbtrAgtPstCd = getValueFromPath(Document, dbtrAgtPstCdPath);

        var dbtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var dbtrAgtTwnLctnNm = getValueFromPath(Document, dbtrAgtTwnLctnNmPath);

        var dbtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var dbtrAgtDstrctNm = getValueFromPath(Document, dbtrAgtDstrctNmPath);

        var dbtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var dbtrAgtCtrySubDvsn = getValueFromPath(Document, dbtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<DbtrAgt>")){
            if(dbtrAgtPstlAdr){
                if(dbtrAgtAddrLine && (dbtrAgtCtry||dbtrAgtTwnNm||dbtrAgtDept||dbtrAgtSubDept||dbtrAgtStrtNm||dbtrAgtBldgNb||dbtrAgtBldgNm||dbtrAgtFlr||dbtrAgtPstBx||dbtrAgtRoom||dbtrAgtPstCd||dbtrAgtTwnLctnNm||dbtrAgtDstrctNm||dbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "DbtrAgt", "AdrLine");
                    if(!dbtrAgtTwnNm || !dbtrAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("422", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            // Creditor/Pty
            var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");

            var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
            var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

            var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnNm';
            var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

            var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Ctry';
            var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

            var cdtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Dept';
            var cdtrDept = getValueFromPath(Document, cdtrDeptPath);

            var cdtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/SubDept';
            var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

            var cdtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/StrtNm';
            var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

            var cdtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/BldgNb';
            var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

            var cdtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/BldgNm';
            var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

            var cdtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Flr';
            var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

            var cdtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/PstBx';
            var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

            var cdtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Room';
            var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

            var cdtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/PstCd';
            var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

            var cdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnLctnNm';
            var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

            var cdtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/DstrctNm';
            var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

            var cdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/CtrySubDvsn';
            var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);

            if(isPatternPresent(Document2, "<Cdtr>")){
                if(cdtrPstlAdr){
                    if(cdtrAddrLine && (cdtrCtry||cdtrTwnNm||cdtrDept||cdtrSubDept||cdtrStrtNm||cdtrBldgNb||cdtrBldgNm||cdtrFlr||cdtrPstBx||cdtrRoom||cdtrPstCd||cdtrTwnLctnNm||cdtrDstrctNm||cdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Cdtr", "AdrLine");
                        if(!cdtrTwnNm || !cdtrCtry || count > 2) { //hybrid
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("658", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
            
            // Debtor/Pty
            var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");

            var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
            var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

            var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnNm';
            var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

            var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Ctry';
            var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

            var dbtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Dept';
            var dbtrDept = getValueFromPath(Document, dbtrDeptPath);

            var dbtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/SubDept';
            var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);

            var dbtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/StrtNm';
            var dbtrStrtNm = getValueFromPath(Document, dbtrStrtNmPath);

            var dbtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/BldgNb';
            var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);

            var dbtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/BldgNm';
            var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);

            var dbtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Flr';
            var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);

            var dbtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/PstBx';
            var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);

            var dbtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Room';
            var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);

            var dbtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/PstCd';
            var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);

            var dbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnLctnNm';
            var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);

            var dbtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/DstrctNm';
            var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);

            var dbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/CtrySubDvsn';
            var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);

            if(isPatternPresent(Document2, "<Dbtr>")){
                if(dbtrPstlAdr){
                    if(dbtrAddrLine && (dbtrCtry||dbtrTwnNm||dbtrDept||dbtrSubDept||dbtrStrtNm||dbtrBldgNb||dbtrBldgNm||dbtrFlr||dbtrPstBx||dbtrRoom||dbtrPstCd||dbtrTwnLctnNm||dbtrDstrctNm||dbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Dbtr", "AdrLine");
                        if(!dbtrTwnNm || !dbtrCtry || count > 2) { //hybrid
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("304", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
            
        } else if(orgnlMsgNmId == 'pacs.009.001.08'){
            // Creditor/Agt
            var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");

            var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

            var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

            var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
            var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

            var cdtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Dept';
            var cdtrDept = getValueFromPath(Document, cdtrDeptPath);

            var cdtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/SubDept';
            var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

            var cdtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

            var cdtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

            var cdtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

            var cdtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Flr';
            var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

            var cdtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/PstBx';
            var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

            var cdtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Room';
            var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

            var cdtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/PstCd';
            var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

            var cdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

            var cdtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

            var cdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);

            if(isPatternPresent(Document2, "<Cdtr>")){
                if(cdtrPstlAdr){
                    if(cdtrAddrLine && (cdtrCtry||cdtrTwnNm||cdtrDept||cdtrSubDept||cdtrStrtNm||cdtrBldgNb||cdtrBldgNm||cdtrFlr||cdtrPstBx||cdtrRoom||cdtrPstCd||cdtrTwnLctnNm||cdtrDstrctNm||cdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Cdtr", "AdrLine");
                        if(!cdtrTwnNm || !cdtrCtry || count > 2) { //hybrid
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("658", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
            
            // Debtor/Agt
            var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");

            var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

            var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

            var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
            var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

            var dbtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Dept';
            var dbtrDept = getValueFromPath(Document, dbtrDeptPath);

            var dbtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/SubDept';
            var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);

            var dbtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var dbtrStrtNm = getValueFromPath(Document, dbtrStrtNmPath);

            var dbtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);

            var dbtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);

            var dbtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Flr';
            var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);

            var dbtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/PstBx';
            var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);

            var dbtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Room';
            var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);

            var dbtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/PstCd';
            var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);

            var dbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);

            var dbtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);

            var dbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);

            if(isPatternPresent(Document2, "<Dbtr>")){
                if(dbtrPstlAdr){
                    if(dbtrAddrLine && (dbtrCtry||dbtrTwnNm||dbtrDept||dbtrSubDept||dbtrStrtNm||dbtrBldgNb||dbtrBldgNm||dbtrFlr||dbtrPstBx||dbtrRoom||dbtrPstCd||dbtrTwnLctnNm||dbtrDstrctNm||dbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Dbtr", "AdrLine");
                        if(!dbtrTwnNm || !dbtrCtry || count > 2) { //hybrid
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("304", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
        }
        
        // Previous Instructing Agent1
        var prvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt1", "<PstlAdr>");

        var prvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

        var prvsInstgAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

        var prvsInstgAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

        var prvsInstgAgt1DeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt1Dept = getValueFromPath(Document, prvsInstgAgt1DeptPath);

        var prvsInstgAgt1SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt1SubDept = getValueFromPath(Document, prvsInstgAgt1SubDeptPath);

        var prvsInstgAgt1StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt1StrtNm = getValueFromPath(Document, prvsInstgAgt1StrtNmPath);

        var prvsInstgAgt1BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt1BldgNb = getValueFromPath(Document, prvsInstgAgt1BldgNbPath);

        var prvsInstgAgt1BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt1BldgNm = getValueFromPath(Document, prvsInstgAgt1BldgNmPath);

        var prvsInstgAgt1FlrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt1Flr = getValueFromPath(Document, prvsInstgAgt1FlrPath);

        var prvsInstgAgt1PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt1PstBx = getValueFromPath(Document, prvsInstgAgt1PstBxPath);

        var prvsInstgAgt1RoomPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt1Room = getValueFromPath(Document, prvsInstgAgt1RoomPath);

        var prvsInstgAgt1PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt1PstCd = getValueFromPath(Document, prvsInstgAgt1PstCdPath);

        var prvsInstgAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt1TwnLctnNm = getValueFromPath(Document, prvsInstgAgt1TwnLctnNmPath);

        var prvsInstgAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt1DstrctNm = getValueFromPath(Document, prvsInstgAgt1DstrctNmPath);

        var prvsInstgAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
            if(prvsInstgAgt1PstlAdr){
                if(prvsInstgAgt1AddrLine && (prvsInstgAgt1Ctry||prvsInstgAgt1TwnNm||prvsInstgAgt1Dept||prvsInstgAgt1SubDept||prvsInstgAgt1StrtNm||prvsInstgAgt1BldgNb||prvsInstgAgt1BldgNm||prvsInstgAgt1Flr||prvsInstgAgt1PstBx||prvsInstgAgt1Room||prvsInstgAgt1PstCd||prvsInstgAgt1TwnLctnNm||prvsInstgAgt1DstrctNm||prvsInstgAgt1CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "PrvsInstgAgt1", "AdrLine");
                    if(!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("451", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Previous Instructing Agent2
        var prvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt2", "<PstlAdr>");

        var prvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

        var prvsInstgAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

        var prvsInstgAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

        var prvsInstgAgt2DeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt2Dept = getValueFromPath(Document, prvsInstgAgt2DeptPath);

        var prvsInstgAgt2SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt2SubDept = getValueFromPath(Document, prvsInstgAgt2SubDeptPath);

        var prvsInstgAgt2StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt2StrtNm = getValueFromPath(Document, prvsInstgAgt2StrtNmPath);

        var prvsInstgAgt2BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt2BldgNb = getValueFromPath(Document, prvsInstgAgt2BldgNbPath);

        var prvsInstgAgt2BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt2BldgNm = getValueFromPath(Document, prvsInstgAgt2BldgNmPath);

        var prvsInstgAgt2FlrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt2Flr = getValueFromPath(Document, prvsInstgAgt2FlrPath);

        var prvsInstgAgt2PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt2PstBx = getValueFromPath(Document, prvsInstgAgt2PstBxPath);

        var prvsInstgAgt2RoomPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt2Room = getValueFromPath(Document, prvsInstgAgt2RoomPath);

        var prvsInstgAgt2PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt2PstCd = getValueFromPath(Document, prvsInstgAgt2PstCdPath);

        var prvsInstgAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt2TwnLctnNm = getValueFromPath(Document, prvsInstgAgt2TwnLctnNmPath);

        var prvsInstgAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt2DstrctNm = getValueFromPath(Document, prvsInstgAgt2DstrctNmPath);

        var prvsInstgAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
            if(prvsInstgAgt2PstlAdr){
                if(prvsInstgAgt2AddrLine && (prvsInstgAgt2Ctry||prvsInstgAgt2TwnNm||prvsInstgAgt2Dept||prvsInstgAgt2SubDept||prvsInstgAgt2StrtNm||prvsInstgAgt2BldgNb||prvsInstgAgt2BldgNm||prvsInstgAgt2Flr||prvsInstgAgt2PstBx||prvsInstgAgt2Room||prvsInstgAgt2PstCd||prvsInstgAgt2TwnLctnNm||prvsInstgAgt2DstrctNm||prvsInstgAgt2CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "PrvsInstgAgt2", "AdrLine");
                    if(!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("480", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Previous Instructing Agent3
        var prvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt3", "<PstlAdr>");

        var prvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

        var prvsInstgAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

        var prvsInstgAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

        var prvsInstgAgt3DeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt3Dept = getValueFromPath(Document, prvsInstgAgt3DeptPath);

        var prvsInstgAgt3SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt3SubDept = getValueFromPath(Document, prvsInstgAgt3SubDeptPath);

        var prvsInstgAgt3StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt3StrtNm = getValueFromPath(Document, prvsInstgAgt3StrtNmPath);

        var prvsInstgAgt3BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt3BldgNb = getValueFromPath(Document, prvsInstgAgt3BldgNbPath);

        var prvsInstgAgt3BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt3BldgNm = getValueFromPath(Document, prvsInstgAgt3BldgNmPath);

        var prvsInstgAgt3FlrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt3Flr = getValueFromPath(Document, prvsInstgAgt3FlrPath);

        var prvsInstgAgt3PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt3PstBx = getValueFromPath(Document, prvsInstgAgt3PstBxPath);

        var prvsInstgAgt3RoomPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt3Room = getValueFromPath(Document, prvsInstgAgt3RoomPath);

        var prvsInstgAgt3PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt3PstCd = getValueFromPath(Document, prvsInstgAgt3PstCdPath);

        var prvsInstgAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt3TwnLctnNm = getValueFromPath(Document, prvsInstgAgt3TwnLctnNmPath);

        var prvsInstgAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt3DstrctNm = getValueFromPath(Document, prvsInstgAgt3DstrctNmPath);

        var prvsInstgAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
            if(prvsInstgAgt3PstlAdr){
                if(prvsInstgAgt3AddrLine && (prvsInstgAgt3Ctry||prvsInstgAgt3TwnNm||prvsInstgAgt3Dept||prvsInstgAgt3SubDept||prvsInstgAgt3StrtNm||prvsInstgAgt3BldgNb||prvsInstgAgt3BldgNm||prvsInstgAgt3Flr||prvsInstgAgt3PstBx||prvsInstgAgt3Room||prvsInstgAgt3PstCd||prvsInstgAgt3TwnLctnNm||prvsInstgAgt3DstrctNm||prvsInstgAgt3CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "PrvsInstgAgt3", "AdrLine");
                    if(!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("509", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
    
        // Intermediary Agent1
        var intrmyAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt1", "<PstlAdr>");

        var intrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

        var intrmyAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

        var intrmyAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

        var intrmyAgt1DeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
        var intrmyAgt1Dept = getValueFromPath(Document, intrmyAgt1DeptPath);

        var intrmyAgt1SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt1SubDept = getValueFromPath(Document, intrmyAgt1SubDeptPath);

        var intrmyAgt1StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt1StrtNm = getValueFromPath(Document, intrmyAgt1StrtNmPath);

        var intrmyAgt1BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt1BldgNb = getValueFromPath(Document, intrmyAgt1BldgNbPath);

        var intrmyAgt1BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt1BldgNm = getValueFromPath(Document, intrmyAgt1BldgNmPath);

        var intrmyAgt1FlrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
        var intrmyAgt1Flr = getValueFromPath(Document, intrmyAgt1FlrPath);

        var intrmyAgt1PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt1PstBx = getValueFromPath(Document, intrmyAgt1PstBxPath);

        var intrmyAgt1RoomPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Room';
        var intrmyAgt1Room = getValueFromPath(Document, intrmyAgt1RoomPath);

        var intrmyAgt1PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt1PstCd = getValueFromPath(Document, intrmyAgt1PstCdPath);

        var intrmyAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt1TwnLctnNm = getValueFromPath(Document, intrmyAgt1TwnLctnNmPath);

        var intrmyAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt1DstrctNm = getValueFromPath(Document, intrmyAgt1DstrctNmPath);

        var intrmyAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt1CtrySubDvsn = getValueFromPath(Document, intrmyAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt1>")){
            if(intrmyAgt1PstlAdr){
                if(intrmyAgt1AddrLine && (intrmyAgt1Ctry||intrmyAgt1TwnNm||intrmyAgt1Dept||intrmyAgt1SubDept||intrmyAgt1StrtNm||intrmyAgt1BldgNb||intrmyAgt1BldgNm||intrmyAgt1Flr||intrmyAgt1PstBx||intrmyAgt1Room||intrmyAgt1PstCd||intrmyAgt1TwnLctnNm||intrmyAgt1DstrctNm||intrmyAgt1CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "IntrmyAgt1", "AdrLine");
                    if(!intrmyAgt1TwnNm || !intrmyAgt1Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("538", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Intermediary Agent2
        var intrmyAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt2", "<PstlAdr>");

        var intrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

        var intrmyAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

        var intrmyAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

        var intrmyAgt2DeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
        var intrmyAgt2Dept = getValueFromPath(Document, intrmyAgt2DeptPath);

        var intrmyAgt2SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt2SubDept = getValueFromPath(Document, intrmyAgt2SubDeptPath);

        var intrmyAgt2StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt2StrtNm = getValueFromPath(Document, intrmyAgt2StrtNmPath);

        var intrmyAgt2BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt2BldgNb = getValueFromPath(Document, intrmyAgt2BldgNbPath);

        var intrmyAgt2BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt2BldgNm = getValueFromPath(Document, intrmyAgt2BldgNmPath);

        var intrmyAgt2FlrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
        var intrmyAgt2Flr = getValueFromPath(Document, intrmyAgt2FlrPath);

        var intrmyAgt2PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt2PstBx = getValueFromPath(Document, intrmyAgt2PstBxPath);

        var intrmyAgt2RoomPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Room';
        var intrmyAgt2Room = getValueFromPath(Document, intrmyAgt2RoomPath);

        var intrmyAgt2PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt2PstCd = getValueFromPath(Document, intrmyAgt2PstCdPath);

        var intrmyAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt2TwnLctnNm = getValueFromPath(Document, intrmyAgt2TwnLctnNmPath);

        var intrmyAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt2DstrctNm = getValueFromPath(Document, intrmyAgt2DstrctNmPath);

        var intrmyAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt2CtrySubDvsn = getValueFromPath(Document, intrmyAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt2>")){
            if(intrmyAgt2PstlAdr){
                if(intrmyAgt2AddrLine && (intrmyAgt2Ctry||intrmyAgt2TwnNm||intrmyAgt2Dept||intrmyAgt2SubDept||intrmyAgt2StrtNm||intrmyAgt2BldgNb||intrmyAgt2BldgNm||intrmyAgt2Flr||intrmyAgt2PstBx||intrmyAgt2Room||intrmyAgt2PstCd||intrmyAgt2TwnLctnNm||intrmyAgt2DstrctNm||intrmyAgt2CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "IntrmyAgt2", "AdrLine");
                    if(!intrmyAgt2TwnNm || !intrmyAgt2Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("567", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Intermediary Agent2
        var intrmyAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt3", "<PstlAdr>");

        var intrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

        var intrmyAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

        var intrmyAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

        var intrmyAgt3DeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
        var intrmyAgt3Dept = getValueFromPath(Document, intrmyAgt3DeptPath);

        var intrmyAgt3SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt3SubDept = getValueFromPath(Document, intrmyAgt3SubDeptPath);

        var intrmyAgt3StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt3StrtNm = getValueFromPath(Document, intrmyAgt3StrtNmPath);

        var intrmyAgt3BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt3BldgNb = getValueFromPath(Document, intrmyAgt3BldgNbPath);

        var intrmyAgt3BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt3BldgNm = getValueFromPath(Document, intrmyAgt3BldgNmPath);

        var intrmyAgt3FlrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
        var intrmyAgt3Flr = getValueFromPath(Document, intrmyAgt3FlrPath);

        var intrmyAgt3PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt3PstBx = getValueFromPath(Document, intrmyAgt3PstBxPath);

        var intrmyAgt3RoomPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Room';
        var intrmyAgt3Room = getValueFromPath(Document, intrmyAgt3RoomPath);

        var intrmyAgt3PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt3PstCd = getValueFromPath(Document, intrmyAgt3PstCdPath);

        var intrmyAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt3TwnLctnNm = getValueFromPath(Document, intrmyAgt3TwnLctnNmPath);

        var intrmyAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt3DstrctNm = getValueFromPath(Document, intrmyAgt3DstrctNmPath);

        var intrmyAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt3CtrySubDvsn = getValueFromPath(Document, intrmyAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt3>")){
            if(intrmyAgt3PstlAdr){
                if(intrmyAgt3AddrLine && (intrmyAgt3Ctry||intrmyAgt3TwnNm||intrmyAgt3Dept||intrmyAgt3SubDept||intrmyAgt3StrtNm||intrmyAgt3BldgNb||intrmyAgt3BldgNm||intrmyAgt3Flr||intrmyAgt3PstBx||intrmyAgt3Room||intrmyAgt3PstCd||intrmyAgt3TwnLctnNm||intrmyAgt3DstrctNm||intrmyAgt3CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "IntrmyAgt3", "AdrLine");
                    if(!intrmyAgt3TwnNm || !intrmyAgt3Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("596", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
    }
    
    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        
        //Underlying Creditor Agent
        var undrlygCdtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");

        var undrlygCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygCdtrAgtAddrLine = getValueFromPath(Document, undrlygCdtrAgtAddrLinePath);

        var undrlygCdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygCdtrAgtTwnNm = getValueFromPath(Document, undrlygCdtrAgtTwnNmPath);

        var undrlygCdtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygCdtrAgtCtry = getValueFromPath(Document, undrlygCdtrAgtCtryPath);

        var undrlygCdtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygCdtrAgtDept = getValueFromPath(Document, undrlygCdtrAgtDeptPath);

        var undrlygCdtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygCdtrAgtSubDept = getValueFromPath(Document, undrlygCdtrAgtSubDeptPath);

        var undrlygCdtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygCdtrAgtStrtNm = getValueFromPath(Document, undrlygCdtrAgtStrtNmPath);

        var undrlygCdtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygCdtrAgtBldgNb = getValueFromPath(Document, undrlygCdtrAgtBldgNbPath);

        var undrlygCdtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygCdtrAgtBldgNm = getValueFromPath(Document, undrlygCdtrAgtBldgNmPath);

        var undrlygCdtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygCdtrAgtFlr = getValueFromPath(Document, undrlygCdtrAgtFlrPath);

        var undrlygCdtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygCdtrAgtPstBx = getValueFromPath(Document, undrlygCdtrAgtPstBxPath);

        var undrlygCdtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygCdtrAgtRoom = getValueFromPath(Document, undrlygCdtrAgtRoomPath);

        var undrlygCdtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygCdtrAgtPstCd = getValueFromPath(Document, undrlygCdtrAgtPstCdPath);

        var undrlygCdtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygCdtrAgtTwnLctnNm = getValueFromPath(Document, undrlygCdtrAgtTwnLctnNmPath);

        var undrlygCdtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygCdtrAgtDstrctNm = getValueFromPath(Document, undrlygCdtrAgtDstrctNmPath);

        var undrlygCdtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygCdtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygCdtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<CdtrAgt>")){
            if(undrlygCdtrAgtPstlAdr){
                if(undrlygCdtrAgtAddrLine && (undrlygCdtrAgtCtry||undrlygCdtrAgtTwnNm||undrlygCdtrAgtDept||undrlygCdtrAgtSubDept||undrlygCdtrAgtStrtNm||undrlygCdtrAgtBldgNb||undrlygCdtrAgtBldgNm||undrlygCdtrAgtFlr||undrlygCdtrAgtPstBx||undrlygCdtrAgtRoom||undrlygCdtrAgtPstCd||undrlygCdtrAgtTwnLctnNm||undrlygCdtrAgtDstrctNm||undrlygCdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "CdtrAgt", "AdrLine");
                    if(!undrlygCdtrAgtTwnNm || !undrlygCdtrAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Debtor Agent
        var undrlygDbtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");

        var undrlygDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygDbtrAgtAddrLine = getValueFromPath(Document, undrlygDbtrAgtAddrLinePath);

        var undrlygDbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygDbtrAgtTwnNm = getValueFromPath(Document, undrlygDbtrAgtTwnNmPath);

        var undrlygDbtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygDbtrAgtCtry = getValueFromPath(Document, undrlygDbtrAgtCtryPath);

        var undrlygDbtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygDbtrAgtDept = getValueFromPath(Document, undrlygDbtrAgtDeptPath);

        var undrlygDbtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygDbtrAgtSubDept = getValueFromPath(Document, undrlygDbtrAgtSubDeptPath);

        var undrlygDbtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygDbtrAgtStrtNm = getValueFromPath(Document, undrlygDbtrAgtStrtNmPath);

        var undrlygDbtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygDbtrAgtBldgNb = getValueFromPath(Document, undrlygDbtrAgtBldgNbPath);

        var undrlygDbtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygDbtrAgtBldgNm = getValueFromPath(Document, undrlygDbtrAgtBldgNmPath);

        var undrlygDbtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygDbtrAgtFlr = getValueFromPath(Document, undrlygDbtrAgtFlrPath);

        var undrlygDbtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygDbtrAgtPstBx = getValueFromPath(Document, undrlygDbtrAgtPstBxPath);

        var undrlygDbtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygDbtrAgtRoom = getValueFromPath(Document, undrlygDbtrAgtRoomPath);

        var undrlygDbtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygDbtrAgtPstCd = getValueFromPath(Document, undrlygDbtrAgtPstCdPath);

        var undrlygDbtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygDbtrAgtTwnLctnNm = getValueFromPath(Document, undrlygDbtrAgtTwnLctnNmPath);

        var undrlygDbtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygDbtrAgtDstrctNm = getValueFromPath(Document, undrlygDbtrAgtDstrctNmPath);

        var undrlygDbtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygDbtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygDbtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<DbtrAgt>")){
            if(undrlygDbtrAgtPstlAdr){
                if(undrlygDbtrAgtAddrLine && (undrlygDbtrAgtCtry||undrlygDbtrAgtTwnNm||undrlygDbtrAgtDept||undrlygDbtrAgtSubDept||undrlygDbtrAgtStrtNm||undrlygDbtrAgtBldgNb||undrlygDbtrAgtBldgNm||undrlygDbtrAgtFlr||undrlygDbtrAgtPstBx||undrlygDbtrAgtRoom||undrlygDbtrAgtPstCd||undrlygDbtrAgtTwnLctnNm||undrlygDbtrAgtDstrctNm||undrlygDbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "DbtrAgt", "AdrLine");
                    if(!undrlygDbtrAgtTwnNm || !undrlygDbtrAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        //Underlying Creditor
        var undrlygCdtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");

        var undrlygCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
        var undrlygCdtrAddrLine = getValueFromPath(Document, undrlygCdtrAddrLinePath);

        var undrlygCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
        var undrlygCdtrTwnNm = getValueFromPath(Document, undrlygCdtrTwnNmPath);

        var undrlygCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
        var undrlygCdtrCtry = getValueFromPath(Document, undrlygCdtrCtryPath);

        var undrlygCdtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Dept';
        var undrlygCdtrDept = getValueFromPath(Document, undrlygCdtrDeptPath);

        var undrlygCdtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/SubDept';
        var undrlygCdtrSubDept = getValueFromPath(Document, undrlygCdtrSubDeptPath);

        var undrlygCdtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/StrtNm';
        var undrlygCdtrStrtNm = getValueFromPath(Document, undrlygCdtrStrtNmPath);

        var undrlygCdtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNb';
        var undrlygCdtrBldgNb = getValueFromPath(Document, undrlygCdtrBldgNbPath);

        var undrlygCdtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNm';
        var undrlygCdtrBldgNm = getValueFromPath(Document, undrlygCdtrBldgNmPath);

        var undrlygCdtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Flr';
        var undrlygCdtrFlr = getValueFromPath(Document, undrlygCdtrFlrPath);

        var undrlygCdtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstBx';
        var undrlygCdtrPstBx = getValueFromPath(Document, undrlygCdtrPstBxPath);

        var undrlygCdtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Room';
        var undrlygCdtrRoom = getValueFromPath(Document, undrlygCdtrRoomPath);

        var undrlygCdtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstCd';
        var undrlygCdtrPstCd = getValueFromPath(Document, undrlygCdtrPstCdPath);

        var undrlygCdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnLctnNm';
        var undrlygCdtrTwnLctnNm = getValueFromPath(Document, undrlygCdtrTwnLctnNmPath);

        var undrlygCdtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/DstrctNm';
        var undrlygCdtrDstrctNm = getValueFromPath(Document, undrlygCdtrDstrctNmPath);

        var undrlygCdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/CtrySubDvsn';
        var undrlygCdtrCtrySubDvsn = getValueFromPath(Document, undrlygCdtrCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<Cdtr>")){
            if(undrlygCdtrPstlAdr){
                if(undrlygCdtrAddrLine && (undrlygCdtrCtry||undrlygCdtrTwnNm||undrlygCdtrDept||undrlygCdtrSubDept||undrlygCdtrStrtNm||undrlygCdtrBldgNb||undrlygCdtrBldgNm||undrlygCdtrFlr||undrlygCdtrPstBx||undrlygCdtrRoom||undrlygCdtrPstCd||undrlygCdtrTwnLctnNm||undrlygCdtrDstrctNm||undrlygCdtrCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "Cdtr", "AdrLine");
                    if(!undrlygCdtrTwnNm || !undrlygCdtrCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Debtor
        var undrlygDbtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");

        var undrlygDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
        var undrlygDbtrAddrLine = getValueFromPath(Document, undrlygDbtrAddrLinePath);

        var undrlygDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
        var undrlygDbtrTwnNm = getValueFromPath(Document, undrlygDbtrTwnNmPath);

        var undrlygDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
        var undrlygDbtrCtry = getValueFromPath(Document, undrlygDbtrCtryPath);

        var undrlygDbtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Dept';
        var undrlygDbtrDept = getValueFromPath(Document, undrlygDbtrDeptPath);

        var undrlygDbtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/SubDept';
        var undrlygDbtrSubDept = getValueFromPath(Document, undrlygDbtrSubDeptPath);

        var undrlygDbtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/StrtNm';
        var undrlygDbtrStrtNm = getValueFromPath(Document, undrlygDbtrStrtNmPath);

        var undrlygDbtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNb';
        var undrlygDbtrBldgNb = getValueFromPath(Document, undrlygDbtrBldgNbPath);

        var undrlygDbtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNm';
        var undrlygDbtrBldgNm = getValueFromPath(Document, undrlygDbtrBldgNmPath);

        var undrlygDbtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Flr';
        var undrlygDbtrFlr = getValueFromPath(Document, undrlygDbtrFlrPath);

        var undrlygDbtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstBx';
        var undrlygDbtrPstBx = getValueFromPath(Document, undrlygDbtrPstBxPath);

        var undrlygDbtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Room';
        var undrlygDbtrRoom = getValueFromPath(Document, undrlygDbtrRoomPath);

        var undrlygDbtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstCd';
        var undrlygDbtrPstCd = getValueFromPath(Document, undrlygDbtrPstCdPath);

        var undrlygDbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnLctnNm';
        var undrlygDbtrTwnLctnNm = getValueFromPath(Document, undrlygDbtrTwnLctnNmPath);

        var undrlygDbtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/DstrctNm';
        var undrlygDbtrDstrctNm = getValueFromPath(Document, undrlygDbtrDstrctNmPath);

        var undrlygDbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/CtrySubDvsn';
        var undrlygDbtrCtrySubDvsn = getValueFromPath(Document, undrlygDbtrCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<Dbtr>")){
            if(undrlygDbtrPstlAdr){
                if(undrlygDbtrAddrLine && (undrlygDbtrCtry||undrlygDbtrTwnNm||undrlygDbtrDept||undrlygDbtrSubDept||undrlygDbtrStrtNm||undrlygDbtrBldgNb||undrlygDbtrBldgNm||undrlygDbtrFlr||undrlygDbtrPstBx||undrlygDbtrRoom||undrlygDbtrPstCd||undrlygDbtrTwnLctnNm||undrlygDbtrDstrctNm||undrlygDbtrCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "Dbtr", "AdrLine");
                    if(!undrlygDbtrTwnNm || !undrlygDbtrCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Previous Instructing Agent1
        var prvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");

        var prvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

        var prvsInstgAgt1TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

        var prvsInstgAgt1CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

        var prvsInstgAgt1DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt1Dept = getValueFromPath(Document, prvsInstgAgt1DeptPath);

        var prvsInstgAgt1SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt1SubDept = getValueFromPath(Document, prvsInstgAgt1SubDeptPath);

        var prvsInstgAgt1StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt1StrtNm = getValueFromPath(Document, prvsInstgAgt1StrtNmPath);

        var prvsInstgAgt1BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt1BldgNb = getValueFromPath(Document, prvsInstgAgt1BldgNbPath);

        var prvsInstgAgt1BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt1BldgNm = getValueFromPath(Document, prvsInstgAgt1BldgNmPath);

        var prvsInstgAgt1FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt1Flr = getValueFromPath(Document, prvsInstgAgt1FlrPath);

        var prvsInstgAgt1PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt1PstBx = getValueFromPath(Document, prvsInstgAgt1PstBxPath);

        var prvsInstgAgt1RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt1Room = getValueFromPath(Document, prvsInstgAgt1RoomPath);

        var prvsInstgAgt1PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt1PstCd = getValueFromPath(Document, prvsInstgAgt1PstCdPath);

        var prvsInstgAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt1TwnLctnNm = getValueFromPath(Document, prvsInstgAgt1TwnLctnNmPath);

        var prvsInstgAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt1DstrctNm = getValueFromPath(Document, prvsInstgAgt1DstrctNmPath);

        var prvsInstgAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<PrvsInstgAgt1>")){
            if(prvsInstgAgt1PstlAdr){
                if(prvsInstgAgt1AddrLine && (prvsInstgAgt1Ctry||prvsInstgAgt1TwnNm||prvsInstgAgt1Dept||prvsInstgAgt1SubDept||prvsInstgAgt1StrtNm||prvsInstgAgt1BldgNb||prvsInstgAgt1BldgNm||prvsInstgAgt1Flr||prvsInstgAgt1PstBx||prvsInstgAgt1Room||prvsInstgAgt1PstCd||prvsInstgAgt1TwnLctnNm||prvsInstgAgt1DstrctNm||prvsInstgAgt1CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "AdrLine");
                    if(!prvsInstgAgt1TwnNm || !prvsInstgAgt1Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Previous Instructing Agent2
        var prvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");

        var prvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

        var prvsInstgAgt2TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

        var prvsInstgAgt2CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

        var prvsInstgAgt2DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt2Dept = getValueFromPath(Document, prvsInstgAgt2DeptPath);

        var prvsInstgAgt2SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt2SubDept = getValueFromPath(Document, prvsInstgAgt2SubDeptPath);

        var prvsInstgAgt2StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt2StrtNm = getValueFromPath(Document, prvsInstgAgt2StrtNmPath);

        var prvsInstgAgt2BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt2BldgNb = getValueFromPath(Document, prvsInstgAgt2BldgNbPath);

        var prvsInstgAgt2BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt2BldgNm = getValueFromPath(Document, prvsInstgAgt2BldgNmPath);

        var prvsInstgAgt2FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt2Flr = getValueFromPath(Document, prvsInstgAgt2FlrPath);

        var prvsInstgAgt2PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt2PstBx = getValueFromPath(Document, prvsInstgAgt2PstBxPath);

        var prvsInstgAgt2RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt2Room = getValueFromPath(Document, prvsInstgAgt2RoomPath);

        var prvsInstgAgt2PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt2PstCd = getValueFromPath(Document, prvsInstgAgt2PstCdPath);

        var prvsInstgAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt2TwnLctnNm = getValueFromPath(Document, prvsInstgAgt2TwnLctnNmPath);

        var prvsInstgAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt2DstrctNm = getValueFromPath(Document, prvsInstgAgt2DstrctNmPath);

        var prvsInstgAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<PrvsInstgAgt2>")){
            if(prvsInstgAgt2PstlAdr){
                if(prvsInstgAgt2AddrLine && (prvsInstgAgt2Ctry||prvsInstgAgt2TwnNm||prvsInstgAgt2Dept||prvsInstgAgt2SubDept||prvsInstgAgt2StrtNm||prvsInstgAgt2BldgNb||prvsInstgAgt2BldgNm||prvsInstgAgt2Flr||prvsInstgAgt2PstBx||prvsInstgAgt2Room||prvsInstgAgt2PstCd||prvsInstgAgt2TwnLctnNm||prvsInstgAgt2DstrctNm||prvsInstgAgt2CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "AdrLine");
                    if(!prvsInstgAgt2TwnNm || !prvsInstgAgt2Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Previous Instructing Agent3
        var prvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");

        var prvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

        var prvsInstgAgt3TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

        var prvsInstgAgt3CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

        var prvsInstgAgt3DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt3Dept = getValueFromPath(Document, prvsInstgAgt3DeptPath);

        var prvsInstgAgt3SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt3SubDept = getValueFromPath(Document, prvsInstgAgt3SubDeptPath);

        var prvsInstgAgt3StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt3StrtNm = getValueFromPath(Document, prvsInstgAgt3StrtNmPath);

        var prvsInstgAgt3BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt3BldgNb = getValueFromPath(Document, prvsInstgAgt3BldgNbPath);

        var prvsInstgAgt3BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt3BldgNm = getValueFromPath(Document, prvsInstgAgt3BldgNmPath);

        var prvsInstgAgt3FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt3Flr = getValueFromPath(Document, prvsInstgAgt3FlrPath);

        var prvsInstgAgt3PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt3PstBx = getValueFromPath(Document, prvsInstgAgt3PstBxPath);

        var prvsInstgAgt3RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt3Room = getValueFromPath(Document, prvsInstgAgt3RoomPath);

        var prvsInstgAgt3PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt3PstCd = getValueFromPath(Document, prvsInstgAgt3PstCdPath);

        var prvsInstgAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt3TwnLctnNm = getValueFromPath(Document, prvsInstgAgt3TwnLctnNmPath);

        var prvsInstgAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt3DstrctNm = getValueFromPath(Document, prvsInstgAgt3DstrctNmPath);

        var prvsInstgAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<PrvsInstgAgt3>")){
            if(prvsInstgAgt3PstlAdr){
                if(prvsInstgAgt3AddrLine && (prvsInstgAgt3Ctry||prvsInstgAgt3TwnNm||prvsInstgAgt3Dept||prvsInstgAgt3SubDept||prvsInstgAgt3StrtNm||prvsInstgAgt3BldgNb||prvsInstgAgt3BldgNm||prvsInstgAgt3Flr||prvsInstgAgt3PstBx||prvsInstgAgt3Room||prvsInstgAgt3PstCd||prvsInstgAgt3TwnLctnNm||prvsInstgAgt3DstrctNm||prvsInstgAgt3CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "AdrLine");
                    if(!prvsInstgAgt3TwnNm || !prvsInstgAgt3Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Intermediary Agent1
        var intrmyAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");

        var intrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

        var intrmyAgt1TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

        var intrmyAgt1CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

        var intrmyAgt1DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
        var intrmyAgt1Dept = getValueFromPath(Document, intrmyAgt1DeptPath);

        var intrmyAgt1SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt1SubDept = getValueFromPath(Document, intrmyAgt1SubDeptPath);

        var intrmyAgt1StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt1StrtNm = getValueFromPath(Document, intrmyAgt1StrtNmPath);

        var intrmyAgt1BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt1BldgNb = getValueFromPath(Document, intrmyAgt1BldgNbPath);

        var intrmyAgt1BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt1BldgNm = getValueFromPath(Document, intrmyAgt1BldgNmPath);

        var intrmyAgt1FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
        var intrmyAgt1Flr = getValueFromPath(Document, intrmyAgt1FlrPath);

        var intrmyAgt1PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt1PstBx = getValueFromPath(Document, intrmyAgt1PstBxPath);

        var intrmyAgt1RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
        var intrmyAgt1Room = getValueFromPath(Document, intrmyAgt1RoomPath);

        var intrmyAgt1PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt1PstCd = getValueFromPath(Document, intrmyAgt1PstCdPath);

        var intrmyAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt1TwnLctnNm = getValueFromPath(Document, intrmyAgt1TwnLctnNmPath);

        var intrmyAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt1DstrctNm = getValueFromPath(Document, intrmyAgt1DstrctNmPath);

        var intrmyAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt1CtrySubDvsn = getValueFromPath(Document, intrmyAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<IntrmyAgt1>")){
            if(intrmyAgt1PstlAdr){
                if(intrmyAgt1AddrLine && (intrmyAgt1Ctry||intrmyAgt1TwnNm||intrmyAgt1Dept||intrmyAgt1SubDept||intrmyAgt1StrtNm||intrmyAgt1BldgNb||intrmyAgt1BldgNm||intrmyAgt1Flr||intrmyAgt1PstBx||intrmyAgt1Room||intrmyAgt1PstCd||intrmyAgt1TwnLctnNm||intrmyAgt1DstrctNm||intrmyAgt1CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt1", "AdrLine");
                    if(!intrmyAgt1TwnNm || !intrmyAgt1Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Intermediary Agent2
        var intrmyAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");

        var intrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

        var intrmyAgt2TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

        var intrmyAgt2CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

        var intrmyAgt2DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
        var intrmyAgt2Dept = getValueFromPath(Document, intrmyAgt2DeptPath);

        var intrmyAgt2SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt2SubDept = getValueFromPath(Document, intrmyAgt2SubDeptPath);

        var intrmyAgt2StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt2StrtNm = getValueFromPath(Document, intrmyAgt2StrtNmPath);

        var intrmyAgt2BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt2BldgNb = getValueFromPath(Document, intrmyAgt2BldgNbPath);

        var intrmyAgt2BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt2BldgNm = getValueFromPath(Document, intrmyAgt2BldgNmPath);

        var intrmyAgt2FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
        var intrmyAgt2Flr = getValueFromPath(Document, intrmyAgt2FlrPath);

        var intrmyAgt2PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt2PstBx = getValueFromPath(Document, intrmyAgt2PstBxPath);

        var intrmyAgt2RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
        var intrmyAgt2Room = getValueFromPath(Document, intrmyAgt2RoomPath);

        var intrmyAgt2PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt2PstCd = getValueFromPath(Document, intrmyAgt2PstCdPath);

        var intrmyAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt2TwnLctnNm = getValueFromPath(Document, intrmyAgt2TwnLctnNmPath);

        var intrmyAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt2DstrctNm = getValueFromPath(Document, intrmyAgt2DstrctNmPath);

        var intrmyAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt2CtrySubDvsn = getValueFromPath(Document, intrmyAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<IntrmyAgt2>")){
            if(intrmyAgt2PstlAdr){
                if(intrmyAgt2AddrLine && (intrmyAgt2Ctry||intrmyAgt2TwnNm||intrmyAgt2Dept||intrmyAgt2SubDept||intrmyAgt2StrtNm||intrmyAgt2BldgNb||intrmyAgt2BldgNm||intrmyAgt2Flr||intrmyAgt2PstBx||intrmyAgt2Room||intrmyAgt2PstCd||intrmyAgt2TwnLctnNm||intrmyAgt2DstrctNm||intrmyAgt2CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt2", "AdrLine");
                    if(!intrmyAgt2TwnNm || !intrmyAgt2Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // Underlying Intermediary Agent3
        var intrmyAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");

        var intrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

        var intrmyAgt3TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

        var intrmyAgt3CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

        var intrmyAgt3DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
        var intrmyAgt3Dept = getValueFromPath(Document, intrmyAgt3DeptPath);

        var intrmyAgt3SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt3SubDept = getValueFromPath(Document, intrmyAgt3SubDeptPath);

        var intrmyAgt3StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt3StrtNm = getValueFromPath(Document, intrmyAgt3StrtNmPath);

        var intrmyAgt3BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt3BldgNb = getValueFromPath(Document, intrmyAgt3BldgNbPath);

        var intrmyAgt3BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt3BldgNm = getValueFromPath(Document, intrmyAgt3BldgNmPath);

        var intrmyAgt3FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
        var intrmyAgt3Flr = getValueFromPath(Document, intrmyAgt3FlrPath);

        var intrmyAgt3PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt3PstBx = getValueFromPath(Document, intrmyAgt3PstBxPath);

        var intrmyAgt3RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
        var intrmyAgt3Room = getValueFromPath(Document, intrmyAgt3RoomPath);

        var intrmyAgt3PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt3PstCd = getValueFromPath(Document, intrmyAgt3PstCdPath);

        var intrmyAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt3TwnLctnNm = getValueFromPath(Document, intrmyAgt3TwnLctnNmPath);

        var intrmyAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt3DstrctNm = getValueFromPath(Document, intrmyAgt3DstrctNmPath);

        var intrmyAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt3CtrySubDvsn = getValueFromPath(Document, intrmyAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<IntrmyAgt3>")){
            if(intrmyAgt3PstlAdr){
                if(intrmyAgt3AddrLine && (intrmyAgt3Ctry||intrmyAgt3TwnNm||intrmyAgt3Dept||intrmyAgt3SubDept||intrmyAgt3StrtNm||intrmyAgt3BldgNb||intrmyAgt3BldgNm||intrmyAgt3Flr||intrmyAgt3PstBx||intrmyAgt3Room||intrmyAgt3PstCd||intrmyAgt3TwnLctnNm||intrmyAgt3DstrctNm||intrmyAgt3CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt3", "AdrLine");
                    if(!intrmyAgt3TwnNm || !intrmyAgt3Ctry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("825", "7528", map);
                        return retVal;
                    }			
                }
            }
        }

    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        // OrgnlTxRef SttlmInf InstgRmbrsmntAgt
        var instgRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstgRmbrsmntAgt", "<PstlAdr>");

        var instgRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var instgRmbrsmntAgtAddrLine = getValueFromPath(Document, instgRmbrsmntAgtAddrLinePath);

        var instgRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var instgRmbrsmntAgtTwnNm = getValueFromPath(Document, instgRmbrsmntAgtTwnNmPath);

        var instgRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var instgRmbrsmntAgtCtry = getValueFromPath(Document, instgRmbrsmntAgtCtryPath);

        var instgRmbrsmntAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Dept';
        var instgRmbrsmntAgtDept = getValueFromPath(Document, instgRmbrsmntAgtDeptPath);

        var instgRmbrsmntAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/SubDept';
        var instgRmbrsmntAgtSubDept = getValueFromPath(Document, instgRmbrsmntAgtSubDeptPath);

        var instgRmbrsmntAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/StrtNm';
        var instgRmbrsmntAgtStrtNm = getValueFromPath(Document, instgRmbrsmntAgtStrtNmPath);

        var instgRmbrsmntAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/BldgNb';
        var instgRmbrsmntAgtBldgNb = getValueFromPath(Document, instgRmbrsmntAgtBldgNbPath);

        var instgRmbrsmntAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/BldgNm';
        var instgRmbrsmntAgtBldgNm = getValueFromPath(Document, instgRmbrsmntAgtBldgNmPath);

        var instgRmbrsmntAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Flr';
        var instgRmbrsmntAgtFlr = getValueFromPath(Document, instgRmbrsmntAgtFlrPath);

        var instgRmbrsmntAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/PstBx';
        var instgRmbrsmntAgtPstBx = getValueFromPath(Document, instgRmbrsmntAgtPstBxPath);

        var instgRmbrsmntAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Room';
        var instgRmbrsmntAgtRoom = getValueFromPath(Document, instgRmbrsmntAgtRoomPath);

        var instgRmbrsmntAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/PstCd';
        var instgRmbrsmntAgtPstCd = getValueFromPath(Document, instgRmbrsmntAgtPstCdPath);

        var instgRmbrsmntAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var instgRmbrsmntAgtTwnLctnNm = getValueFromPath(Document, instgRmbrsmntAgtTwnLctnNmPath);

        var instgRmbrsmntAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/DstrctNm';
        var instgRmbrsmntAgtDstrctNm = getValueFromPath(Document, instgRmbrsmntAgtDstrctNmPath);

        var instgRmbrsmntAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var instgRmbrsmntAgtCtrySubDvsn = getValueFromPath(Document, instgRmbrsmntAgtCtrySubDvsnPath);

        if(isPatternPresent(Document4, "<InstgRmbrsmntAgt>")){
            if(instgRmbrsmntAgtPstlAdr){
                if(instgRmbrsmntAgtAddrLine && (instgRmbrsmntAgtCtry||instgRmbrsmntAgtTwnNm||instgRmbrsmntAgtDept||instgRmbrsmntAgtSubDept||instgRmbrsmntAgtStrtNm||instgRmbrsmntAgtBldgNb||instgRmbrsmntAgtBldgNm||instgRmbrsmntAgtFlr||instgRmbrsmntAgtPstBx||instgRmbrsmntAgtRoom||instgRmbrsmntAgtPstCd||instgRmbrsmntAgtTwnLctnNm||instgRmbrsmntAgtDstrctNm||instgRmbrsmntAgtCtrySubDvsn)){
                    var count = countXmlNodes3(Document, "OrgnlTxRef", "SttlmInf", "InstgRmbrsmntAgt", "AdrLine");
                    logger.info("count3 = " + count);
                    if(!instgRmbrsmntAgtTwnNm || !instgRmbrsmntAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("944", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // OrgnlTxRef SttlmInf InstdRmbrsmntAgt
        var instdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstdRmbrsmntAgt", "<PstlAdr>");

        var instdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var instdRmbrsmntAgtAddrLine = getValueFromPath(Document, instdRmbrsmntAgtAddrLinePath);

        var instdRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var instdRmbrsmntAgtTwnNm = getValueFromPath(Document, instdRmbrsmntAgtTwnNmPath);

        var instdRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var instdRmbrsmntAgtCtry = getValueFromPath(Document, instdRmbrsmntAgtCtryPath);

        var instdRmbrsmntAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Dept';
        var instdRmbrsmntAgtDept = getValueFromPath(Document, instdRmbrsmntAgtDeptPath);

        var instdRmbrsmntAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/SubDept';
        var instdRmbrsmntAgtSubDept = getValueFromPath(Document, instdRmbrsmntAgtSubDeptPath);

        var instdRmbrsmntAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/StrtNm';
        var instdRmbrsmntAgtStrtNm = getValueFromPath(Document, instdRmbrsmntAgtStrtNmPath);

        var instdRmbrsmntAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNb';
        var instdRmbrsmntAgtBldgNb = getValueFromPath(Document, instdRmbrsmntAgtBldgNbPath);

        var instdRmbrsmntAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNm';
        var instdRmbrsmntAgtBldgNm = getValueFromPath(Document, instdRmbrsmntAgtBldgNmPath);

        var instdRmbrsmntAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Flr';
        var instdRmbrsmntAgtFlr = getValueFromPath(Document, instdRmbrsmntAgtFlrPath);

        var instdRmbrsmntAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/PstBx';
        var instdRmbrsmntAgtPstBx = getValueFromPath(Document, instdRmbrsmntAgtPstBxPath);

        var instdRmbrsmntAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Room';
        var instdRmbrsmntAgtRoom = getValueFromPath(Document, instdRmbrsmntAgtRoomPath);

        var instdRmbrsmntAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/PstCd';
        var instdRmbrsmntAgtPstCd = getValueFromPath(Document, instdRmbrsmntAgtPstCdPath);

        var instdRmbrsmntAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var instdRmbrsmntAgtTwnLctnNm = getValueFromPath(Document, instdRmbrsmntAgtTwnLctnNmPath);

        var instdRmbrsmntAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/DstrctNm';
        var instdRmbrsmntAgtDstrctNm = getValueFromPath(Document, instdRmbrsmntAgtDstrctNmPath);

        var instdRmbrsmntAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var instdRmbrsmntAgtCtrySubDvsn = getValueFromPath(Document, instdRmbrsmntAgtCtrySubDvsnPath);

        if(isPatternPresent(Document4, "<InstdRmbrsmntAgt>")){
            if(instdRmbrsmntAgtPstlAdr){
                if(instdRmbrsmntAgtAddrLine && (instdRmbrsmntAgtCtry||instdRmbrsmntAgtTwnNm||instdRmbrsmntAgtDept||instdRmbrsmntAgtSubDept||instdRmbrsmntAgtStrtNm||instdRmbrsmntAgtBldgNb||instdRmbrsmntAgtBldgNm||instdRmbrsmntAgtFlr||instdRmbrsmntAgtPstBx||instdRmbrsmntAgtRoom||instdRmbrsmntAgtPstCd||instdRmbrsmntAgtTwnLctnNm||instdRmbrsmntAgtDstrctNm||instdRmbrsmntAgtCtrySubDvsn)){
                    var count = countXmlNodes3(Document, "OrgnlTxRef", "SttlmInf", "InstdRmbrsmntAgt", "AdrLine");
                    logger.info("count3 = " + count);
                    if(!instdRmbrsmntAgtTwnNm || !instdRmbrsmntAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("992", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        // OrgnlTxRef SttlmInf ThrdRmbrsmntAgt
        var thrdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "ThrdRmbrsmntAgt", "<PstlAdr>");

        var thrdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var thrdRmbrsmntAgtAddrLine = getValueFromPath(Document, thrdRmbrsmntAgtAddrLinePath);

        var thrdRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var thrdRmbrsmntAgtTwnNm = getValueFromPath(Document, thrdRmbrsmntAgtTwnNmPath);

        var thrdRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var thrdRmbrsmntAgtCtry = getValueFromPath(Document, thrdRmbrsmntAgtCtryPath);

        var thrdRmbrsmntAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Dept';
        var thrdRmbrsmntAgtDept = getValueFromPath(Document, thrdRmbrsmntAgtDeptPath);

        var thrdRmbrsmntAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/SubDept';
        var thrdRmbrsmntAgtSubDept = getValueFromPath(Document, thrdRmbrsmntAgtSubDeptPath);

        var thrdRmbrsmntAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/StrtNm';
        var thrdRmbrsmntAgtStrtNm = getValueFromPath(Document, thrdRmbrsmntAgtStrtNmPath);

        var thrdRmbrsmntAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNb';
        var thrdRmbrsmntAgtBldgNb = getValueFromPath(Document, thrdRmbrsmntAgtBldgNbPath);

        var thrdRmbrsmntAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNm';
        var thrdRmbrsmntAgtBldgNm = getValueFromPath(Document, thrdRmbrsmntAgtBldgNmPath);

        var thrdRmbrsmntAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Flr';
        var thrdRmbrsmntAgtFlr = getValueFromPath(Document, thrdRmbrsmntAgtFlrPath);

        var thrdRmbrsmntAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/PstBx';
        var thrdRmbrsmntAgtPstBx = getValueFromPath(Document, thrdRmbrsmntAgtPstBxPath);

        var thrdRmbrsmntAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Room';
        var thrdRmbrsmntAgtRoom = getValueFromPath(Document, thrdRmbrsmntAgtRoomPath);

        var thrdRmbrsmntAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/PstCd';
        var thrdRmbrsmntAgtPstCd = getValueFromPath(Document, thrdRmbrsmntAgtPstCdPath);

        var thrdRmbrsmntAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var thrdRmbrsmntAgtTwnLctnNm = getValueFromPath(Document, thrdRmbrsmntAgtTwnLctnNmPath);

        var thrdRmbrsmntAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/DstrctNm';
        var thrdRmbrsmntAgtDstrctNm = getValueFromPath(Document, thrdRmbrsmntAgtDstrctNmPath);

        var thrdRmbrsmntAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var thrdRmbrsmntAgtCtrySubDvsn = getValueFromPath(Document, thrdRmbrsmntAgtCtrySubDvsnPath);

        if(isPatternPresent(Document4, "<ThrdRmbrsmntAgt>")){
            if(thrdRmbrsmntAgtPstlAdr){
                if(thrdRmbrsmntAgtAddrLine && (thrdRmbrsmntAgtCtry||thrdRmbrsmntAgtTwnNm||thrdRmbrsmntAgtDept||thrdRmbrsmntAgtSubDept||thrdRmbrsmntAgtStrtNm||thrdRmbrsmntAgtBldgNb||thrdRmbrsmntAgtBldgNm||thrdRmbrsmntAgtFlr||thrdRmbrsmntAgtPstBx||thrdRmbrsmntAgtRoom||thrdRmbrsmntAgtPstCd||thrdRmbrsmntAgtTwnLctnNm||thrdRmbrsmntAgtDstrctNm||thrdRmbrsmntAgtCtrySubDvsn)){
                    var count = countXmlNodes3(Document, "OrgnlTxRef", "SttlmInf", "ThrdRmbrsmntAgt", "AdrLine");
                    logger.info("count3 = " + count);
                    if(!thrdRmbrsmntAgtTwnNm || !thrdRmbrsmntAgtCtry || count > 2) { //hybrid
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("1040", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            // OrgnlTxRef Debtor/Pty
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");

            var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/AdrLine';
            var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);

            var orgnlTxRefDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/TwnNm';
            var orgnlTxRefDbtrTwnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnNmPath);

            var orgnlTxRefDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Ctry';
            var orgnlTxRefDbtrCtry = getValueFromPath(Document, orgnlTxRefDbtrCtryPath);

            var orgnlTxRefDbtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Dept';
            var orgnlTxRefDbtrDept = getValueFromPath(Document, orgnlTxRefDbtrDeptPath);

            var orgnlTxRefDbtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/SubDept';
            var orgnlTxRefDbtrSubDept = getValueFromPath(Document, orgnlTxRefDbtrSubDeptPath);

            var orgnlTxRefDbtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/StrtNm';
            var orgnlTxRefDbtrStrtNm = getValueFromPath(Document, orgnlTxRefDbtrStrtNmPath);

            var orgnlTxRefDbtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/BldgNb';
            var orgnlTxRefDbtrBldgNb = getValueFromPath(Document, orgnlTxRefDbtrBldgNbPath);

            var orgnlTxRefDbtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/BldgNm';
            var orgnlTxRefDbtrBldgNm = getValueFromPath(Document, orgnlTxRefDbtrBldgNmPath);

            var orgnlTxRefDbtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Flr';
            var orgnlTxRefDbtrFlr = getValueFromPath(Document, orgnlTxRefDbtrFlrPath);

            var orgnlTxRefDbtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/PstBx';
            var orgnlTxRefDbtrPstBx = getValueFromPath(Document, orgnlTxRefDbtrPstBxPath);

            var orgnlTxRefDbtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Room';
            var orgnlTxRefDbtrRoom = getValueFromPath(Document, orgnlTxRefDbtrRoomPath);

            var orgnlTxRefDbtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/PstCd';
            var orgnlTxRefDbtrPstCd = getValueFromPath(Document, orgnlTxRefDbtrPstCdPath);

            var orgnlTxRefDbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/TwnLctnNm';
            var orgnlTxRefDbtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnLctnNmPath);

            var orgnlTxRefDbtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/DstrctNm';
            var orgnlTxRefDbtrDstrctNm = getValueFromPath(Document, orgnlTxRefDbtrDstrctNmPath);

            var orgnlTxRefDbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/CtrySubDvsn';
            var orgnlTxRefDbtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefDbtrCtrySubDvsnPath);

            if(isPatternPresent(Document4, "<Dbtr>")){
                if(orgnlTxRefDbtrPstlAdr){
                    if(orgnlTxRefDbtrAddrLine && (orgnlTxRefDbtrCtry||orgnlTxRefDbtrTwnNm||orgnlTxRefDbtrDept||orgnlTxRefDbtrSubDept||orgnlTxRefDbtrStrtNm||orgnlTxRefDbtrBldgNb||orgnlTxRefDbtrBldgNm||orgnlTxRefDbtrFlr||orgnlTxRefDbtrPstBx||orgnlTxRefDbtrRoom||orgnlTxRefDbtrPstCd||orgnlTxRefDbtrTwnLctnNm||orgnlTxRefDbtrDstrctNm||orgnlTxRefDbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Dbtr", "AdrLine");
                        if(!orgnlTxRefDbtrTwnNm || !orgnlTxRefDbtrCtry || count > 2) {
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("1997", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
            
            // OrgnlTxRef Creditor/Pty
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");

            var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/AdrLine';
            var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);

            var orgnlTxRefCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/TwnNm';
            var orgnlTxRefCdtrTwnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnNmPath);

            var orgnlTxRefCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Ctry';
            var orgnlTxRefCdtrCtry = getValueFromPath(Document, orgnlTxRefCdtrCtryPath);

            var orgnlTxRefCdtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Dept';
            var orgnlTxRefCdtrDept = getValueFromPath(Document, orgnlTxRefCdtrDeptPath);

            var orgnlTxRefCdtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/SubDept';
            var orgnlTxRefCdtrSubDept = getValueFromPath(Document, orgnlTxRefCdtrSubDeptPath);

            var orgnlTxRefCdtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/StrtNm';
            var orgnlTxRefCdtrStrtNm = getValueFromPath(Document, orgnlTxRefCdtrStrtNmPath);

            var orgnlTxRefCdtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/BldgNb';
            var orgnlTxRefCdtrBldgNb = getValueFromPath(Document, orgnlTxRefCdtrBldgNbPath);

            var orgnlTxRefCdtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/BldgNm';
            var orgnlTxRefCdtrBldgNm = getValueFromPath(Document, orgnlTxRefCdtrBldgNmPath);

            var orgnlTxRefCdtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Flr';
            var orgnlTxRefCdtrFlr = getValueFromPath(Document, orgnlTxRefCdtrFlrPath);

            var orgnlTxRefCdtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/PstBx';
            var orgnlTxRefCdtrPstBx = getValueFromPath(Document, orgnlTxRefCdtrPstBxPath);

            var orgnlTxRefCdtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Room';
            var orgnlTxRefCdtrRoom = getValueFromPath(Document, orgnlTxRefCdtrRoomPath);

            var orgnlTxRefCdtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/PstCd';
            var orgnlTxRefCdtrPstCd = getValueFromPath(Document, orgnlTxRefCdtrPstCdPath);

            var orgnlTxRefCdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/TwnLctnNm';
            var orgnlTxRefCdtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnLctnNmPath);

            var orgnlTxRefCdtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/DstrctNm';
            var orgnlTxRefCdtrDstrctNm = getValueFromPath(Document, orgnlTxRefCdtrDstrctNmPath);

            var orgnlTxRefCdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/CtrySubDvsn';
            var orgnlTxRefCdtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefCdtrCtrySubDvsnPath);

            if(isPatternPresent(Document4, "<Cdtr>")){
                if(orgnlTxRefCdtrPstlAdr){
                    if(orgnlTxRefCdtrAddrLine && (orgnlTxRefCdtrCtry||orgnlTxRefCdtrTwnNm||orgnlTxRefCdtrDept||orgnlTxRefCdtrSubDept||orgnlTxRefCdtrStrtNm||orgnlTxRefCdtrBldgNb||orgnlTxRefCdtrBldgNm||orgnlTxRefCdtrFlr||orgnlTxRefCdtrPstBx||orgnlTxRefCdtrRoom||orgnlTxRefCdtrPstCd||orgnlTxRefCdtrTwnLctnNm||orgnlTxRefCdtrDstrctNm||orgnlTxRefCdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Cdtr", "AdrLine");
                        if(!orgnlTxRefCdtrTwnNm || !orgnlTxRefCdtrCtry || count > 2) {
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("2194", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
            
        } else if(orgnlMsgNmId == 'pacs.009.001.08'){
            
            // OrgnlTxRef Debtor/Agt
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");

            var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);

            var orgnlTxRefDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var orgnlTxRefDbtrTwnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnNmPath);

            var orgnlTxRefDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
            var orgnlTxRefDbtrCtry = getValueFromPath(Document, orgnlTxRefDbtrCtryPath);

            var orgnlTxRefDbtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Dept';
            var orgnlTxRefDbtrDept = getValueFromPath(Document, orgnlTxRefDbtrDeptPath);

            var orgnlTxRefDbtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/SubDept';
            var orgnlTxRefDbtrSubDept = getValueFromPath(Document, orgnlTxRefDbtrSubDeptPath);

            var orgnlTxRefDbtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var orgnlTxRefDbtrStrtNm = getValueFromPath(Document, orgnlTxRefDbtrStrtNmPath);

            var orgnlTxRefDbtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var orgnlTxRefDbtrBldgNb = getValueFromPath(Document, orgnlTxRefDbtrBldgNbPath);

            var orgnlTxRefDbtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var orgnlTxRefDbtrBldgNm = getValueFromPath(Document, orgnlTxRefDbtrBldgNmPath);

            var orgnlTxRefDbtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Flr';
            var orgnlTxRefDbtrFlr = getValueFromPath(Document, orgnlTxRefDbtrFlrPath);

            var orgnlTxRefDbtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/PstBx';
            var orgnlTxRefDbtrPstBx = getValueFromPath(Document, orgnlTxRefDbtrPstBxPath);

            var orgnlTxRefDbtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Room';
            var orgnlTxRefDbtrRoom = getValueFromPath(Document, orgnlTxRefDbtrRoomPath);

            var orgnlTxRefDbtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/PstCd';
            var orgnlTxRefDbtrPstCd = getValueFromPath(Document, orgnlTxRefDbtrPstCdPath);

            var orgnlTxRefDbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var orgnlTxRefDbtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnLctnNmPath);

            var orgnlTxRefDbtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var orgnlTxRefDbtrDstrctNm = getValueFromPath(Document, orgnlTxRefDbtrDstrctNmPath);

            var orgnlTxRefDbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var orgnlTxRefDbtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefDbtrCtrySubDvsnPath);

            if(isPatternPresent(Document4, "<Dbtr>")){
                if(orgnlTxRefDbtrPstlAdr){
                    if(orgnlTxRefDbtrAddrLine && (orgnlTxRefDbtrCtry||orgnlTxRefDbtrTwnNm||orgnlTxRefDbtrDept||orgnlTxRefDbtrSubDept||orgnlTxRefDbtrStrtNm||orgnlTxRefDbtrBldgNb||orgnlTxRefDbtrBldgNm||orgnlTxRefDbtrFlr||orgnlTxRefDbtrPstBx||orgnlTxRefDbtrRoom||orgnlTxRefDbtrPstCd||orgnlTxRefDbtrTwnLctnNm||orgnlTxRefDbtrDstrctNm||orgnlTxRefDbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Dbtr", "AdrLine");
                        if(!orgnlTxRefDbtrTwnNm || !orgnlTxRefDbtrCtry || count > 2) {
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("1997", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
            
            // OrgnlTxRef Creditor/Agt
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");

            var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);

            var orgnlTxRefCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var orgnlTxRefCdtrTwnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnNmPath);

            var orgnlTxRefCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
            var orgnlTxRefCdtrCtry = getValueFromPath(Document, orgnlTxRefCdtrCtryPath);

            var orgnlTxRefCdtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Dept';
            var orgnlTxRefCdtrDept = getValueFromPath(Document, orgnlTxRefCdtrDeptPath);

            var orgnlTxRefCdtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/SubDept';
            var orgnlTxRefCdtrSubDept = getValueFromPath(Document, orgnlTxRefCdtrSubDeptPath);

            var orgnlTxRefCdtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var orgnlTxRefCdtrStrtNm = getValueFromPath(Document, orgnlTxRefCdtrStrtNmPath);

            var orgnlTxRefCdtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var orgnlTxRefCdtrBldgNb = getValueFromPath(Document, orgnlTxRefCdtrBldgNbPath);

            var orgnlTxRefCdtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var orgnlTxRefCdtrBldgNm = getValueFromPath(Document, orgnlTxRefCdtrBldgNmPath);

            var orgnlTxRefCdtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Flr';
            var orgnlTxRefCdtrFlr = getValueFromPath(Document, orgnlTxRefCdtrFlrPath);

            var orgnlTxRefCdtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/PstBx';
            var orgnlTxRefCdtrPstBx = getValueFromPath(Document, orgnlTxRefCdtrPstBxPath);

            var orgnlTxRefCdtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Room';
            var orgnlTxRefCdtrRoom = getValueFromPath(Document, orgnlTxRefCdtrRoomPath);

            var orgnlTxRefCdtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/PstCd';
            var orgnlTxRefCdtrPstCd = getValueFromPath(Document, orgnlTxRefCdtrPstCdPath);

            var orgnlTxRefCdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var orgnlTxRefCdtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnLctnNmPath);

            var orgnlTxRefCdtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var orgnlTxRefCdtrDstrctNm = getValueFromPath(Document, orgnlTxRefCdtrDstrctNmPath);

            var orgnlTxRefCdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var orgnlTxRefCdtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefCdtrCtrySubDvsnPath);

            if(isPatternPresent(Document4, "<Cdtr>")){
                if(orgnlTxRefCdtrPstlAdr){
                    if(orgnlTxRefCdtrAddrLine && (orgnlTxRefCdtrCtry||orgnlTxRefCdtrTwnNm||orgnlTxRefCdtrDept||orgnlTxRefCdtrSubDept||orgnlTxRefCdtrStrtNm||orgnlTxRefCdtrBldgNb||orgnlTxRefCdtrBldgNm||orgnlTxRefCdtrFlr||orgnlTxRefCdtrPstBx||orgnlTxRefCdtrRoom||orgnlTxRefCdtrPstCd||orgnlTxRefCdtrTwnLctnNm||orgnlTxRefCdtrDstrctNm||orgnlTxRefCdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Cdtr", "AdrLine");
                        if(!orgnlTxRefCdtrTwnNm || !orgnlTxRefCdtrCtry || count > 2) {
                            setHeader(map, "PLCN_validMessage", false);
                            logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                            retVal = setCommentsForTransaction("2194", "7528", map);
                            return retVal;
                        }			
                    }
                }
            }
        }
        
        // OrgnlTxRef Creditor Agent
        var orgnlTxRefCdtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "CdtrAgt", "<PstlAdr>");

        var orgnlTxRefCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var orgnlTxRefCdtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAgtAddrLinePath);

        var orgnlTxRefCdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var orgnlTxRefCdtrAgtTwnNm = getValueFromPath(Document, orgnlTxRefCdtrAgtTwnNmPath);

        var orgnlTxRefCdtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var orgnlTxRefCdtrAgtCtry = getValueFromPath(Document, orgnlTxRefCdtrAgtCtryPath);

        var orgnlTxRefCdtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var orgnlTxRefCdtrAgtDept = getValueFromPath(Document, orgnlTxRefCdtrAgtDeptPath);

        var orgnlTxRefCdtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var orgnlTxRefCdtrAgtSubDept = getValueFromPath(Document, orgnlTxRefCdtrAgtSubDeptPath);

        var orgnlTxRefCdtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var orgnlTxRefCdtrAgtStrtNm = getValueFromPath(Document, orgnlTxRefCdtrAgtStrtNmPath);

        var orgnlTxRefCdtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var orgnlTxRefCdtrAgtBldgNb = getValueFromPath(Document, orgnlTxRefCdtrAgtBldgNbPath);

        var orgnlTxRefCdtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var orgnlTxRefCdtrAgtBldgNm = getValueFromPath(Document, orgnlTxRefCdtrAgtBldgNmPath);

        var orgnlTxRefCdtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var orgnlTxRefCdtrAgtFlr = getValueFromPath(Document, orgnlTxRefCdtrAgtFlrPath);

        var orgnlTxRefCdtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var orgnlTxRefCdtrAgtPstBx = getValueFromPath(Document, orgnlTxRefCdtrAgtPstBxPath);

        var orgnlTxRefCdtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Room';
        var orgnlTxRefCdtrAgtRoom = getValueFromPath(Document, orgnlTxRefCdtrAgtRoomPath);

        var orgnlTxRefCdtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var orgnlTxRefCdtrAgtPstCd = getValueFromPath(Document, orgnlTxRefCdtrAgtPstCdPath);

        var orgnlTxRefCdtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var orgnlTxRefCdtrAgtTwnLctnNm = getValueFromPath(Document, orgnlTxRefCdtrAgtTwnLctnNmPath);

        var orgnlTxRefCdtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var orgnlTxRefCdtrAgtDstrctNm = getValueFromPath(Document, orgnlTxRefCdtrAgtDstrctNmPath);

        var orgnlTxRefCdtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var orgnlTxRefCdtrAgtCtrySubDvsn = getValueFromPath(Document, orgnlTxRefCdtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if(orgnlTxRefCdtrAgtPstlAdr){
                if(orgnlTxRefCdtrAgtAddrLine && (orgnlTxRefCdtrAgtCtry||orgnlTxRefCdtrAgtTwnNm||orgnlTxRefCdtrAgtDept||orgnlTxRefCdtrAgtSubDept||orgnlTxRefCdtrAgtStrtNm||orgnlTxRefCdtrAgtBldgNb||orgnlTxRefCdtrAgtBldgNm||orgnlTxRefCdtrAgtFlr||orgnlTxRefCdtrAgtPstBx||orgnlTxRefCdtrAgtRoom||orgnlTxRefCdtrAgtPstCd||orgnlTxRefCdtrAgtTwnLctnNm||orgnlTxRefCdtrAgtDstrctNm||orgnlTxRefCdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "OrgnlTxRef", "CdtrAgt", "AdrLine");
                    if(!orgnlTxRefCdtrAgtTwnNm || !orgnlTxRefCdtrAgtCtry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("2142", "7528", map);
                        return retVal;
                    }			
                }
            }
        }

        // OrgnlTxRef Debtor Agent
        var orgnlTxRefDbtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "DbtrAgt", "<PstlAdr>");

        var orgnlTxRefDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var orgnlTxRefDbtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAgtAddrLinePath);

        var orgnlTxRefDbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var orgnlTxRefDbtrAgtTwnNm = getValueFromPath(Document, orgnlTxRefDbtrAgtTwnNmPath);

        var orgnlTxRefDbtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var orgnlTxRefDbtrAgtCtry = getValueFromPath(Document, orgnlTxRefDbtrAgtCtryPath);

        var orgnlTxRefDbtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var orgnlTxRefDbtrAgtDept = getValueFromPath(Document, orgnlTxRefDbtrAgtDeptPath);

        var orgnlTxRefDbtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var orgnlTxRefDbtrAgtSubDept = getValueFromPath(Document, orgnlTxRefDbtrAgtSubDeptPath);

        var orgnlTxRefDbtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var orgnlTxRefDbtrAgtStrtNm = getValueFromPath(Document, orgnlTxRefDbtrAgtStrtNmPath);

        var orgnlTxRefDbtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var orgnlTxRefDbtrAgtBldgNb = getValueFromPath(Document, orgnlTxRefDbtrAgtBldgNbPath);

        var orgnlTxRefDbtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var orgnlTxRefDbtrAgtBldgNm = getValueFromPath(Document, orgnlTxRefDbtrAgtBldgNmPath);

        var orgnlTxRefDbtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var orgnlTxRefDbtrAgtFlr = getValueFromPath(Document, orgnlTxRefDbtrAgtFlrPath);

        var orgnlTxRefDbtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var orgnlTxRefDbtrAgtPstBx = getValueFromPath(Document, orgnlTxRefDbtrAgtPstBxPath);

        var orgnlTxRefDbtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Room';
        var orgnlTxRefDbtrAgtRoom = getValueFromPath(Document, orgnlTxRefDbtrAgtRoomPath);

        var orgnlTxRefDbtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var orgnlTxRefDbtrAgtPstCd = getValueFromPath(Document, orgnlTxRefDbtrAgtPstCdPath);

        var orgnlTxRefDbtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var orgnlTxRefDbtrAgtTwnLctnNm = getValueFromPath(Document, orgnlTxRefDbtrAgtTwnLctnNmPath);

        var orgnlTxRefDbtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var orgnlTxRefDbtrAgtDstrctNm = getValueFromPath(Document, orgnlTxRefDbtrAgtDstrctNmPath);

        var orgnlTxRefDbtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var orgnlTxRefDbtrAgtCtrySubDvsn = getValueFromPath(Document, orgnlTxRefDbtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<DbtrAgt>")){
            if(orgnlTxRefDbtrAgtPstlAdr){
                if(orgnlTxRefDbtrAgtAddrLine && (orgnlTxRefDbtrAgtCtry||orgnlTxRefDbtrAgtTwnNm||orgnlTxRefDbtrAgtDept||orgnlTxRefDbtrAgtSubDept||orgnlTxRefDbtrAgtStrtNm||orgnlTxRefDbtrAgtBldgNb||orgnlTxRefDbtrAgtBldgNm||orgnlTxRefDbtrAgtFlr||orgnlTxRefDbtrAgtPstBx||orgnlTxRefDbtrAgtRoom||orgnlTxRefDbtrAgtPstCd||orgnlTxRefDbtrAgtTwnLctnNm||orgnlTxRefDbtrAgtDstrctNm||orgnlTxRefDbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "OrgnlTxRef", "DbtrAgt", "AdrLine");
                    if(!orgnlTxRefDbtrAgtTwnNm || !orgnlTxRefDbtrAgtCtry || count > 2) {
                        setHeader(map, "PLCN_validMessage", false);
                        logger.info("gracePeriodHybridFormalRuleChipsPacs4: If Address Line is present and any other Postal Address element(s) are present, then Town Name and Country are mandatory in Postal Address and a maximum of two occurrences of Address Line are allowed.");
                        retVal = setCommentsForTransaction("2094", "7528", map);
                        return retVal;
                    }			
                }
            }
        }
        
    }
    
	return retVal;
}

function gracePeriodUnstructuredFormalRuleChipsPacs4(exchange){ 
	logger.info("In gracePeriodUnstructuredFormalRuleChipsPacs4");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	orgnlMsgNmIdPath = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
	orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
	logger.trace("orgnlMsgNmId = " + orgnlMsgNmId);
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        var Document2 = dataBetweenTokens("<RtrChain>", "</RtrChain>", Document1);
        Document2 = "<RtrChain>".concat(Document2).concat("</RtrChain>");
    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        var Document4 = dataBetweenTokens("<OrgnlTxRef>", "</OrgnlTxRef>", Document1);
        Document4 = "<OrgnlTxRef>".concat(Document4).concat("</OrgnlTxRef>");
        logger.info("Document4 = " + Document4);

        if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
            var Document3 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
            Document3 = "<UndrlygCstmrCdtTrf>".concat(Document3).concat("</UndrlygCstmrCdtTrf>");
            logger.info("Document3 = " + Document3);
            Document4 = removePattern(Document4, Document3);
            logger.info("Document4 without undrlyg = " + Document4);
        }
    
    }
    
	//ChargesInformation
	var chrgsInfPstlAdr =  isXmlNodePresent(Document, "TxInf", "ChrgsInf", "<PstlAdr>");

	var chrgsInfAddrLinePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);

	var chrgsInfTwnNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	var chrgsInfTwnNm = getValueFromPath(Document, chrgsInfTwnNmPath);

	var chrgsInfCtryPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	var chrgsInfCtry = getValueFromPath(Document, chrgsInfCtryPath);

	var chrgsInfDeptPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Dept';
	var chrgsInfDept = getValueFromPath(Document, chrgsInfDeptPath);

	var chrgsInfSubDeptPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/SubDept';
	var chrgsInfSubDept = getValueFromPath(Document, chrgsInfSubDeptPath);

	var chrgsInfStrtNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/StrtNm';
	var chrgsInfStrtNm = getValueFromPath(Document, chrgsInfStrtNmPath);

	var chrgsInfBldgNbPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNb';
	var chrgsInfBldgNb = getValueFromPath(Document, chrgsInfBldgNbPath);

	var chrgsInfBldgNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNm';
	var chrgsInfBldgNm = getValueFromPath(Document, chrgsInfBldgNmPath);

	var chrgsInfFlrPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Flr';
	var chrgsInfFlr = getValueFromPath(Document, chrgsInfFlrPath);

	var chrgsInfPstBxPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstBx';
	var chrgsInfPstBX = getValueFromPath(Document, chrgsInfPstBxPath);

	var chrgsInfRoomPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Room';
	var chrgsInfRoom = getValueFromPath(Document, chrgsInfRoomPath);

	var chrgsInfPstCdPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstCd';
	var chrgsInfPstCd = getValueFromPath(Document, chrgsInfPstCdPath);

	var chrgsInfTwnLctnNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnLctnNm';
	var chrgsInfTwnLctnNm = getValueFromPath(Document, chrgsInfTwnLctnNmPath);

	var chrgsInfDstrctNmPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/DstrctNm';
	var chrgsInfDstrctNm = getValueFromPath(Document, chrgsInfDstrctNmPath);

	var chrgsInfCtrySubDvsnPath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
	var chrgsInfCtrySubDvsn = getValueFromPath(Document, chrgsInfCtrySubDvsnPath);

	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if(chrgsInfPstlAdr){
			if(chrgsInfAddrLine && (!chrgsInfCtry && !chrgsInfTwnNm && !chrgsInfDept && !chrgsInfSubDept && !chrgsInfStrtNm && !chrgsInfBldgNb && !chrgsInfBldgNm && !chrgsInfFlr&& !chrgsInfPstBX&& !chrgsInfRoom&& !chrgsInfPstCd && !chrgsInfTwnLctnNm&& !chrgsInfDstrctNm && !chrgsInfCtrySubDvsn)){
				var count = countXmlNodes(Document, "ChrgsInf", "AdrLine");

				if(count > 0) {
					for(i=1; i<=count; i++) {
						var chrgsInfAddrLinePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine['+i+']';
						var chrgsInfAddrLine = getValueFromPath(Document, chrgsInfAddrLinePath);
						var adrLineLength = chrgsInfAddrLine.length;

						if(adrLineLength > 35 || count > 3) {
							setHeader(map, "PLCN_validMessage", false);
							logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
							retVal = setCommentsForTransaction("198", "7527", map);
							return retVal;							
						}
					}
				}
			}
		}
	}	

    if(isPatternPresent(Document1, "<RtrChain>")){
        
        // Creditor Agent
        var cdtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "CdtrAgt", "<PstlAdr>");

        var cdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);

        var cdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var cdtrAgtTwnNm = getValueFromPath(Document, cdtrAgtTwnNmPath);

        var cdtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var cdtrAgtCtry = getValueFromPath(Document, cdtrAgtCtryPath);

        var cdtrAgtDeptPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var cdtrAgtDept = getValueFromPath(Document, cdtrAgtDeptPath);

        var cdtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var cdtrAgtSubDept = getValueFromPath(Document, cdtrAgtSubDeptPath);

        var cdtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var cdtrAgtStrtNm = getValueFromPath(Document, cdtrAgtStrtNmPath);

        var cdtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var cdtrAgtBldgNb = getValueFromPath(Document, cdtrAgtBldgNbPath);

        var cdtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var cdtrAgtBldgNm = getValueFromPath(Document, cdtrAgtBldgNmPath);

        var cdtrAgtFlrPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var cdtrAgtFlr = getValueFromPath(Document, cdtrAgtFlrPath);

        var cdtrAgtPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var cdtrAgtPstBx = getValueFromPath(Document, cdtrAgtPstBxPath);

        var cdtrAgtRoomPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Room';
        var cdtrAgtRoom = getValueFromPath(Document, cdtrAgtRoomPath);

        var cdtrAgtPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var cdtrAgtPstCd = getValueFromPath(Document, cdtrAgtPstCdPath);

        var cdtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var cdtrAgtTwnLctnNm = getValueFromPath(Document, cdtrAgtTwnLctnNmPath);

        var cdtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var cdtrAgtDstrctNm = getValueFromPath(Document, cdtrAgtDstrctNmPath);

        var cdtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var cdtrAgtCtrySubDvsn = getValueFromPath(Document, cdtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if(cdtrAgtPstlAdr){
                if(cdtrAgtAddrLine && (!cdtrAgtCtry&& !cdtrAgtTwnNm&& !cdtrAgtDept&& !cdtrAgtSubDept&& !cdtrAgtStrtNm&& !cdtrAgtBldgNb&& !cdtrAgtBldgNm&& !cdtrAgtFlr&& !cdtrAgtPstBx&& !cdtrAgtRoom&& !cdtrAgtPstCd&& !cdtrAgtTwnLctnNm&& !cdtrAgtDstrctNm&& !cdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "CdtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var cdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var cdtrAgtAddrLine = getValueFromPath(Document, cdtrAgtAddrLinePath);
                            var adrLineLength = cdtrAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("625", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Debtor Agent
        var dbtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "DbtrAgt", "<PstlAdr>");

        var dbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);

        var dbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var dbtrAgtTwnNm = getValueFromPath(Document, dbtrAgtTwnNmPath);

        var dbtrAgtCtryPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var dbtrAgtCtry = getValueFromPath(Document, dbtrAgtCtryPath);

        var dbtrAgtDeptPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var dbtrAgtDept = getValueFromPath(Document, dbtrAgtDeptPath);

        var dbtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var dbtrAgtSubDept = getValueFromPath(Document, dbtrAgtSubDeptPath);

        var dbtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var dbtrAgtStrtNm = getValueFromPath(Document, dbtrAgtStrtNmPath);

        var dbtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var dbtrAgtBldgNb = getValueFromPath(Document, dbtrAgtBldgNbPath);

        var dbtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var dbtrAgtBldgNm = getValueFromPath(Document, dbtrAgtBldgNmPath);

        var dbtrAgtFlrPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var dbtrAgtFlr = getValueFromPath(Document, dbtrAgtFlrPath);

        var dbtrAgtPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var dbtrAgtPstBx = getValueFromPath(Document, dbtrAgtPstBxPath);

        var dbtrAgtRoomPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Room';
        var dbtrAgtRoom = getValueFromPath(Document, dbtrAgtRoomPath);

        var dbtrAgtPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var dbtrAgtPstCd = getValueFromPath(Document, dbtrAgtPstCdPath);

        var dbtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var dbtrAgtTwnLctnNm = getValueFromPath(Document, dbtrAgtTwnLctnNmPath);

        var dbtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var dbtrAgtDstrctNm = getValueFromPath(Document, dbtrAgtDstrctNmPath);

        var dbtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var dbtrAgtCtrySubDvsn = getValueFromPath(Document, dbtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document2, "<DbtrAgt>")){
            if(dbtrAgtPstlAdr){
                if(dbtrAgtAddrLine && (!dbtrAgtCtry&& !dbtrAgtTwnNm&& !dbtrAgtDept&& !dbtrAgtSubDept&& !dbtrAgtStrtNm&& !dbtrAgtBldgNb&& !dbtrAgtBldgNm&& !dbtrAgtFlr&& !dbtrAgtPstBx&& !dbtrAgtRoom&& !dbtrAgtPstCd && !dbtrAgtTwnLctnNm&& !dbtrAgtDstrctNm&& !dbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "DbtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var dbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var dbtrAgtAddrLine = getValueFromPath(Document, dbtrAgtAddrLinePath);
                            var adrLineLength = dbtrAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("422", "7527", map);
                                return retVal;							
                            }	
                        }
                    }
                }
            }
        }
        
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            // Creditor/Pty
            var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");

            var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
            var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

            var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnNm';
            var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

            var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Ctry';
            var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

            var cdtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Dept';
            var cdtrDept = getValueFromPath(Document, cdtrDeptPath);

            var cdtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/SubDept';
            var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

            var cdtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/StrtNm';
            var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

            var cdtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/BldgNb';
            var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

            var cdtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/BldgNm';
            var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

            var cdtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Flr';
            var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

            var cdtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/PstBx';
            var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

            var cdtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Room';
            var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

            var cdtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/PstCd';
            var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

            var cdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnLctnNm';
            var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

            var cdtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/DstrctNm';
            var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

            var cdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/CtrySubDvsn';
            var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);

            if(isPatternPresent(Document2, "<Cdtr>")){
                if(cdtrPstlAdr){
                    if(cdtrAddrLine && (!cdtrCtry&& !cdtrTwnNm&& !cdtrDept&& !cdtrSubDept&& !cdtrStrtNm&& !cdtrBldgNb&& !cdtrBldgNm&& !cdtrFlr&& !cdtrPstBx&& !cdtrRoom&& !cdtrPstCd&& !cdtrTwnLctnNm && !cdtrDstrctNm&& !cdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Cdtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine['+i+']';
                                var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
                                var adrLineLength = cdtrAddrLine.length;
                                
                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("658", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }
            
            // Debtor/Pty
            var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");

            var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
            var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

            var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnNm';
            var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

            var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Ctry';
            var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

            var dbtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Dept';
            var dbtrDept = getValueFromPath(Document, dbtrDeptPath);

            var dbtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/SubDept';
            var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);

            var dbtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/StrtNm';
            var dbtrStrtNm = getValueFromPath(Document, dbtrStrtNmPath);

            var dbtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/BldgNb';
            var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);

            var dbtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/BldgNm';
            var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);

            var dbtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Flr';
            var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);

            var dbtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/PstBx';
            var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);

            var dbtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Room';
            var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);

            var dbtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/PstCd';
            var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);

            var dbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnLctnNm';
            var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);

            var dbtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/DstrctNm';
            var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);

            var dbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/CtrySubDvsn';
            var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);
            
            if(isPatternPresent(Document2, "<Dbtr>")){
                if(dbtrPstlAdr){
                    if(dbtrAddrLine && (!dbtrCtry&& !dbtrTwnNm&& !dbtrDept&& !dbtrSubDept&& !dbtrStrtNm&& !dbtrBldgNb&& !dbtrBldgNm&& !dbtrFlr&& !dbtrPstBx&& !dbtrRoom&& !dbtrPstCd&& !dbtrTwnLctnNm&& !dbtrDstrctNm&& !dbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Dbtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine['+i+']';
                                var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
                                var adrLineLength = dbtrAddrLine.length;

                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("304", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }
            
        } else if(orgnlMsgNmId == 'pacs.009.001.08'){
            // Creditor/Agt
            var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");

            var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);

            var cdtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var cdtrTwnNm = getValueFromPath(Document, cdtrTwnNmPath);

            var cdtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
            var cdtrCtry = getValueFromPath(Document, cdtrCtryPath);

            var cdtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Dept';
            var cdtrDept = getValueFromPath(Document, cdtrDeptPath);

            var cdtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/SubDept';
            var cdtrSubDept = getValueFromPath(Document, cdtrSubDeptPath);

            var cdtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var cdtrStrtNm = getValueFromPath(Document, cdtrStrtNmPath);

            var cdtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var cdtrBldgNb = getValueFromPath(Document, cdtrBldgNbPath);

            var cdtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var cdtrBldgNm = getValueFromPath(Document, cdtrBldgNmPath);

            var cdtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Flr';
            var cdtrFlr = getValueFromPath(Document, cdtrFlrPath);

            var cdtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/PstBx';
            var cdtrPstBx = getValueFromPath(Document, cdtrPstBxPath);

            var cdtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Room';
            var cdtrRoom = getValueFromPath(Document, cdtrRoomPath);

            var cdtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/PstCd';
            var cdtrPstCd = getValueFromPath(Document, cdtrPstCdPath);

            var cdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var cdtrTwnLctnNm = getValueFromPath(Document, cdtrTwnLctnNmPath);

            var cdtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var cdtrDstrctNm = getValueFromPath(Document, cdtrDstrctNmPath);

            var cdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var cdtrCtrySubDvsn = getValueFromPath(Document, cdtrCtrySubDvsnPath);
            
            if(isPatternPresent(Document2, "<Cdtr>")){
                if(cdtrPstlAdr){
                    if(cdtrAddrLine && (!cdtrCtry&& !cdtrTwnNm&& !cdtrDept&& !cdtrSubDept&& !cdtrStrtNm&& !cdtrBldgNb&& !cdtrBldgNm&& !cdtrFlr&& !cdtrPstBx&& !cdtrRoom&& !cdtrPstCd&& !cdtrTwnLctnNm && !cdtrDstrctNm&& !cdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Cdtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var cdtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine['+i+']';
                                var cdtrAddrLine = getValueFromPath(Document, cdtrAddrLinePath);
                                var adrLineLength = cdtrAddrLine.length;

                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("658", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }
            
            // Debtor/Agt
            var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");

            var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);

            var dbtrTwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var dbtrTwnNm = getValueFromPath(Document, dbtrTwnNmPath);

            var dbtrCtryPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
            var dbtrCtry = getValueFromPath(Document, dbtrCtryPath);

            var dbtrDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Dept';
            var dbtrDept = getValueFromPath(Document, dbtrDeptPath);

            var dbtrSubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/SubDept';
            var dbtrSubDept = getValueFromPath(Document, dbtrSubDeptPath);

            var dbtrStrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var dbtrStrtNm = getValueFromPath(Document, dbtrStrtNmPath);

            var dbtrBldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var dbtrBldgNb = getValueFromPath(Document, dbtrBldgNbPath);

            var dbtrBldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var dbtrBldgNm = getValueFromPath(Document, dbtrBldgNmPath);

            var dbtrFlrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Flr';
            var dbtrFlr = getValueFromPath(Document, dbtrFlrPath);

            var dbtrPstBxPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/PstBx';
            var dbtrPstBx = getValueFromPath(Document, dbtrPstBxPath);

            var dbtrRoomPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Room';
            var dbtrRoom = getValueFromPath(Document, dbtrRoomPath);

            var dbtrPstCdPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/PstCd';
            var dbtrPstCd = getValueFromPath(Document, dbtrPstCdPath);

            var dbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var dbtrTwnLctnNm = getValueFromPath(Document, dbtrTwnLctnNmPath);

            var dbtrDstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var dbtrDstrctNm = getValueFromPath(Document, dbtrDstrctNmPath);

            var dbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var dbtrCtrySubDvsn = getValueFromPath(Document, dbtrCtrySubDvsnPath);
            
            if(isPatternPresent(Document2, "<Dbtr>")){
                if(dbtrPstlAdr){
                    if(dbtrAddrLine && (!dbtrCtry&& !dbtrTwnNm&& !dbtrDept&& !dbtrSubDept&& !dbtrStrtNm&& !dbtrBldgNb&& !dbtrBldgNm&& !dbtrFlr&& !dbtrPstBx&& !dbtrRoom&& !dbtrPstCd&& !dbtrTwnLctnNm&& !dbtrDstrctNm&& !dbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "RtrChain", "Dbtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var dbtrAddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine['+i+']';
                                var dbtrAddrLine = getValueFromPath(Document, dbtrAddrLinePath);
                                var adrLineLength = dbtrAddrLine.length;

                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("304", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }
            
        }
        
        // Previous Instructing Agent1
        var prvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt1", "<PstlAdr>");

        var prvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);

        var prvsInstgAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt1TwnNm = getValueFromPath(Document, prvsInstgAgt1TwnNmPath);

        var prvsInstgAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt1Ctry = getValueFromPath(Document, prvsInstgAgt1CtryPath);

        var prvsInstgAgt1DeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt1Dept = getValueFromPath(Document, prvsInstgAgt1DeptPath);

        var prvsInstgAgt1SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt1SubDept = getValueFromPath(Document, prvsInstgAgt1SubDeptPath);

        var prvsInstgAgt1StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt1StrtNm = getValueFromPath(Document, prvsInstgAgt1StrtNmPath);

        var prvsInstgAgt1BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt1BldgNb = getValueFromPath(Document, prvsInstgAgt1BldgNbPath);

        var prvsInstgAgt1BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt1BldgNm = getValueFromPath(Document, prvsInstgAgt1BldgNmPath);

        var prvsInstgAgt1FlrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt1Flr = getValueFromPath(Document, prvsInstgAgt1FlrPath);

        var prvsInstgAgt1PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt1PstBx = getValueFromPath(Document, prvsInstgAgt1PstBxPath);

        var prvsInstgAgt1RoomPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt1Room = getValueFromPath(Document, prvsInstgAgt1RoomPath);

        var prvsInstgAgt1PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt1PstCd = getValueFromPath(Document, prvsInstgAgt1PstCdPath);

        var prvsInstgAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt1TwnLctnNm = getValueFromPath(Document, prvsInstgAgt1TwnLctnNmPath);

        var prvsInstgAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt1DstrctNm = getValueFromPath(Document, prvsInstgAgt1DstrctNmPath);

        var prvsInstgAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt1CtrySubDvsnPath);
        
        if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
            if(prvsInstgAgt1PstlAdr){
                if(prvsInstgAgt1AddrLine && (!prvsInstgAgt1Ctry && !prvsInstgAgt1TwnNm && !prvsInstgAgt1Dept && !prvsInstgAgt1SubDept && !prvsInstgAgt1StrtNm && !prvsInstgAgt1BldgNb && !prvsInstgAgt1BldgNm && !prvsInstgAgt1Flr && !prvsInstgAgt1PstBx && !prvsInstgAgt1Room && !prvsInstgAgt1PstCd && !prvsInstgAgt1TwnLctnNm && !prvsInstgAgt1DstrctNm && !prvsInstgAgt1CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "PrvsInstgAgt1", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var prvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var prvsInstgAgt1AddrLine = getValueFromPath(Document, prvsInstgAgt1AddrLinePath);
                            var adrLineLength = prvsInstgAgt1AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("451", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Previous Instructing Agent2
        var prvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt2", "<PstlAdr>");

        var prvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);

        var prvsInstgAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt2TwnNm = getValueFromPath(Document, prvsInstgAgt2TwnNmPath);

        var prvsInstgAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt2Ctry = getValueFromPath(Document, prvsInstgAgt2CtryPath);

        var prvsInstgAgt2DeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt2Dept = getValueFromPath(Document, prvsInstgAgt2DeptPath);

        var prvsInstgAgt2SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt2SubDept = getValueFromPath(Document, prvsInstgAgt2SubDeptPath);

        var prvsInstgAgt2StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt2StrtNm = getValueFromPath(Document, prvsInstgAgt2StrtNmPath);

        var prvsInstgAgt2BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt2BldgNb = getValueFromPath(Document, prvsInstgAgt2BldgNbPath);

        var prvsInstgAgt2BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt2BldgNm = getValueFromPath(Document, prvsInstgAgt2BldgNmPath);

        var prvsInstgAgt2FlrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt2Flr = getValueFromPath(Document, prvsInstgAgt2FlrPath);

        var prvsInstgAgt2PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt2PstBx = getValueFromPath(Document, prvsInstgAgt2PstBxPath);

        var prvsInstgAgt2RoomPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt2Room = getValueFromPath(Document, prvsInstgAgt2RoomPath);

        var prvsInstgAgt2PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt2PstCd = getValueFromPath(Document, prvsInstgAgt2PstCdPath);

        var prvsInstgAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt2TwnLctnNm = getValueFromPath(Document, prvsInstgAgt2TwnLctnNmPath);

        var prvsInstgAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt2DstrctNm = getValueFromPath(Document, prvsInstgAgt2DstrctNmPath);

        var prvsInstgAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt2CtrySubDvsnPath);
        
        if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
            if(prvsInstgAgt2PstlAdr){
                if(prvsInstgAgt2AddrLine && (!prvsInstgAgt2Ctry && !prvsInstgAgt2TwnNm && !prvsInstgAgt2Dept && !prvsInstgAgt2SubDept && !prvsInstgAgt2StrtNm && !prvsInstgAgt2BldgNb && !prvsInstgAgt2BldgNm && !prvsInstgAgt2Flr && !prvsInstgAgt2PstBx && !prvsInstgAgt2Room && !prvsInstgAgt2PstCd && !prvsInstgAgt2TwnLctnNm && !prvsInstgAgt2DstrctNm && !prvsInstgAgt2CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "PrvsInstgAgt2", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var prvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var prvsInstgAgt2AddrLine = getValueFromPath(Document, prvsInstgAgt2AddrLinePath);
                            var adrLineLength = prvsInstgAgt2AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("480", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Previous Instructing Agent3
        var prvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt3", "<PstlAdr>");

        var prvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);

        var prvsInstgAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var prvsInstgAgt3TwnNm = getValueFromPath(Document, prvsInstgAgt3TwnNmPath);

        var prvsInstgAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var prvsInstgAgt3Ctry = getValueFromPath(Document, prvsInstgAgt3CtryPath);

        var prvsInstgAgt3DeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
        var prvsInstgAgt3Dept = getValueFromPath(Document, prvsInstgAgt3DeptPath);

        var prvsInstgAgt3SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
        var prvsInstgAgt3SubDept = getValueFromPath(Document, prvsInstgAgt3SubDeptPath);

        var prvsInstgAgt3StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
        var prvsInstgAgt3StrtNm = getValueFromPath(Document, prvsInstgAgt3StrtNmPath);

        var prvsInstgAgt3BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
        var prvsInstgAgt3BldgNb = getValueFromPath(Document, prvsInstgAgt3BldgNbPath);

        var prvsInstgAgt3BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
        var prvsInstgAgt3BldgNm = getValueFromPath(Document, prvsInstgAgt3BldgNmPath);

        var prvsInstgAgt3FlrPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
        var prvsInstgAgt3Flr = getValueFromPath(Document, prvsInstgAgt3FlrPath);

        var prvsInstgAgt3PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
        var prvsInstgAgt3PstBx = getValueFromPath(Document, prvsInstgAgt3PstBxPath);

        var prvsInstgAgt3RoomPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
        var prvsInstgAgt3Room = getValueFromPath(Document, prvsInstgAgt3RoomPath);

        var prvsInstgAgt3PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
        var prvsInstgAgt3PstCd = getValueFromPath(Document, prvsInstgAgt3PstCdPath);

        var prvsInstgAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var prvsInstgAgt3TwnLctnNm = getValueFromPath(Document, prvsInstgAgt3TwnLctnNmPath);

        var prvsInstgAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
        var prvsInstgAgt3DstrctNm = getValueFromPath(Document, prvsInstgAgt3DstrctNmPath);

        var prvsInstgAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var prvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, prvsInstgAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
            if(prvsInstgAgt3PstlAdr){
                if(prvsInstgAgt3AddrLine && (!prvsInstgAgt3Ctry && !prvsInstgAgt3TwnNm && !prvsInstgAgt3Dept && !prvsInstgAgt3SubDept && !prvsInstgAgt3StrtNm && !prvsInstgAgt3BldgNb && !prvsInstgAgt3BldgNm && !prvsInstgAgt3Flr && !prvsInstgAgt3PstBx && !prvsInstgAgt3Room && !prvsInstgAgt3PstCd && !prvsInstgAgt3TwnLctnNm && !prvsInstgAgt3DstrctNm && !prvsInstgAgt3CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "RtrChain", "PrvsInstgAgt3", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var prvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var prvsInstgAgt3AddrLine = getValueFromPath(Document, prvsInstgAgt3AddrLinePath);
                            var adrLineLength = prvsInstgAgt3AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("509", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
    
        // Intermediary Agent1
        var intrmyAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt1", "<PstlAdr>");

        var intrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);

        var intrmyAgt1TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt1TwnNm = getValueFromPath(Document, intrmyAgt1TwnNmPath);

        var intrmyAgt1CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt1Ctry = getValueFromPath(Document, intrmyAgt1CtryPath);

        var intrmyAgt1DeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
        var intrmyAgt1Dept = getValueFromPath(Document, intrmyAgt1DeptPath);

        var intrmyAgt1SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt1SubDept = getValueFromPath(Document, intrmyAgt1SubDeptPath);

        var intrmyAgt1StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt1StrtNm = getValueFromPath(Document, intrmyAgt1StrtNmPath);

        var intrmyAgt1BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt1BldgNb = getValueFromPath(Document, intrmyAgt1BldgNbPath);

        var intrmyAgt1BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt1BldgNm = getValueFromPath(Document, intrmyAgt1BldgNmPath);

        var intrmyAgt1FlrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
        var intrmyAgt1Flr = getValueFromPath(Document, intrmyAgt1FlrPath);

        var intrmyAgt1PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt1PstBx = getValueFromPath(Document, intrmyAgt1PstBxPath);

        var intrmyAgt1RoomPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Room';
        var intrmyAgt1Room = getValueFromPath(Document, intrmyAgt1RoomPath);

        var intrmyAgt1PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt1PstCd = getValueFromPath(Document, intrmyAgt1PstCdPath);

        var intrmyAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt1TwnLctnNm = getValueFromPath(Document, intrmyAgt1TwnLctnNmPath);

        var intrmyAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt1DstrctNm = getValueFromPath(Document, intrmyAgt1DstrctNmPath);

        var intrmyAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt1CtrySubDvsn = getValueFromPath(Document, intrmyAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document2, "<IntrmyAgt1>")){
            if(intrmyAgt1PstlAdr){
                if(intrmyAgt1AddrLine && (!intrmyAgt1Ctry && !intrmyAgt1TwnNm && !intrmyAgt1Dept && !intrmyAgt1SubDept && !intrmyAgt1StrtNm && !intrmyAgt1BldgNb && !intrmyAgt1BldgNm && !intrmyAgt1Flr && !intrmyAgt1PstBx && !intrmyAgt1Room && !intrmyAgt1PstCd && !intrmyAgt1TwnLctnNm && !intrmyAgt1DstrctNm  && !intrmyAgt1CtrySubDvsn)){
                var count = countXmlNodes2(Document, "RtrChain", "IntrmyAgt1", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var intrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var intrmyAgt1AddrLine = getValueFromPath(Document, intrmyAgt1AddrLinePath);
                            var adrLineLength = intrmyAgt1AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("538", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Intermediary Agent2
        var intrmyAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt2", "<PstlAdr>");

        var intrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);

        var intrmyAgt2TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt2TwnNm = getValueFromPath(Document, intrmyAgt2TwnNmPath);

        var intrmyAgt2CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt2Ctry = getValueFromPath(Document, intrmyAgt2CtryPath);

        var intrmyAgt2DeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
        var intrmyAgt2Dept = getValueFromPath(Document, intrmyAgt2DeptPath);

        var intrmyAgt2SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt2SubDept = getValueFromPath(Document, intrmyAgt2SubDeptPath);

        var intrmyAgt2StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt2StrtNm = getValueFromPath(Document, intrmyAgt2StrtNmPath);

        var intrmyAgt2BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt2BldgNb = getValueFromPath(Document, intrmyAgt2BldgNbPath);

        var intrmyAgt2BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt2BldgNm = getValueFromPath(Document, intrmyAgt2BldgNmPath);

        var intrmyAgt2FlrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
        var intrmyAgt2Flr = getValueFromPath(Document, intrmyAgt2FlrPath);

        var intrmyAgt2PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt2PstBx = getValueFromPath(Document, intrmyAgt2PstBxPath);

        var intrmyAgt2RoomPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Room';
        var intrmyAgt2Room = getValueFromPath(Document, intrmyAgt2RoomPath);

        var intrmyAgt2PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt2PstCd = getValueFromPath(Document, intrmyAgt2PstCdPath);

        var intrmyAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt2TwnLctnNm = getValueFromPath(Document, intrmyAgt2TwnLctnNmPath);

        var intrmyAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt2DstrctNm = getValueFromPath(Document, intrmyAgt2DstrctNmPath);

        var intrmyAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt2CtrySubDvsn = getValueFromPath(Document, intrmyAgt2CtrySubDvsnPath);
        
        if(isPatternPresent(Document2, "<IntrmyAgt2>")){
            if(intrmyAgt2PstlAdr){
                if(intrmyAgt2AddrLine && (!intrmyAgt2Ctry && !intrmyAgt2TwnNm && !intrmyAgt2Dept && !intrmyAgt2SubDept && !intrmyAgt2StrtNm && !intrmyAgt2BldgNb && !intrmyAgt2BldgNm && !intrmyAgt2Flr && !intrmyAgt2PstBx && !intrmyAgt2Room && !intrmyAgt2PstCd && !intrmyAgt2TwnLctnNm && !intrmyAgt2DstrctNm  && !intrmyAgt2CtrySubDvsn)){
                var count = countXmlNodes2(Document, "RtrChain", "IntrmyAgt2", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var intrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var intrmyAgt2AddrLine = getValueFromPath(Document, intrmyAgt2AddrLinePath);
                            var adrLineLength = intrmyAgt2AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("567", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Intermediary Agent3
        var intrmyAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt3", "<PstlAdr>");

        var intrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);

        var intrmyAgt3TwnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var intrmyAgt3TwnNm = getValueFromPath(Document, intrmyAgt3TwnNmPath);

        var intrmyAgt3CtryPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var intrmyAgt3Ctry = getValueFromPath(Document, intrmyAgt3CtryPath);

        var intrmyAgt3DeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
        var intrmyAgt3Dept = getValueFromPath(Document, intrmyAgt3DeptPath);

        var intrmyAgt3SubDeptPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
        var intrmyAgt3SubDept = getValueFromPath(Document, intrmyAgt3SubDeptPath);

        var intrmyAgt3StrtNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
        var intrmyAgt3StrtNm = getValueFromPath(Document, intrmyAgt3StrtNmPath);

        var intrmyAgt3BldgNbPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
        var intrmyAgt3BldgNb = getValueFromPath(Document, intrmyAgt3BldgNbPath);

        var intrmyAgt3BldgNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
        var intrmyAgt3BldgNm = getValueFromPath(Document, intrmyAgt3BldgNmPath);

        var intrmyAgt3FlrPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
        var intrmyAgt3Flr = getValueFromPath(Document, intrmyAgt3FlrPath);

        var intrmyAgt3PstBxPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
        var intrmyAgt3PstBx = getValueFromPath(Document, intrmyAgt3PstBxPath);

        var intrmyAgt3RoomPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Room';
        var intrmyAgt3Room = getValueFromPath(Document, intrmyAgt3RoomPath);

        var intrmyAgt3PstCdPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
        var intrmyAgt3PstCd = getValueFromPath(Document, intrmyAgt3PstCdPath);

        var intrmyAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var intrmyAgt3TwnLctnNm = getValueFromPath(Document, intrmyAgt3TwnLctnNmPath);

        var intrmyAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
        var intrmyAgt3DstrctNm = getValueFromPath(Document, intrmyAgt3DstrctNmPath);

        var intrmyAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var intrmyAgt3CtrySubDvsn = getValueFromPath(Document, intrmyAgt3CtrySubDvsnPath);
        
        if(isPatternPresent(Document2, "<IntrmyAgt3>")){
            if(intrmyAgt3PstlAdr){
                if(intrmyAgt3AddrLine && (!intrmyAgt3Ctry && !intrmyAgt3TwnNm && !intrmyAgt3Dept && !intrmyAgt3SubDept && !intrmyAgt3StrtNm && !intrmyAgt3BldgNb && !intrmyAgt3BldgNm && !intrmyAgt3Flr && !intrmyAgt3PstBx && !intrmyAgt3Room && !intrmyAgt3PstCd && !intrmyAgt3TwnLctnNm && !intrmyAgt3DstrctNm  && !intrmyAgt3CtrySubDvsn)){
                var count = countXmlNodes2(Document, "RtrChain", "IntrmyAgt3", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var intrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var intrmyAgt3AddrLine = getValueFromPath(Document, intrmyAgt3AddrLinePath);
                            var adrLineLength = intrmyAgt3AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("596", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
    }

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        
        //Underlying Creditor Agent
        var undrlygCdtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");

        var undrlygCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygCdtrAgtAddrLine = getValueFromPath(Document, undrlygCdtrAgtAddrLinePath);

        var undrlygCdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygCdtrAgtTwnNm = getValueFromPath(Document, undrlygCdtrAgtTwnNmPath);

        var undrlygCdtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygCdtrAgtCtry = getValueFromPath(Document, undrlygCdtrAgtCtryPath);

        var undrlygCdtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygCdtrAgtDept = getValueFromPath(Document, undrlygCdtrAgtDeptPath);

        var undrlygCdtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygCdtrAgtSubDept = getValueFromPath(Document, undrlygCdtrAgtSubDeptPath);

        var undrlygCdtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygCdtrAgtStrtNm = getValueFromPath(Document, undrlygCdtrAgtStrtNmPath);

        var undrlygCdtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygCdtrAgtBldgNb = getValueFromPath(Document, undrlygCdtrAgtBldgNbPath);

        var undrlygCdtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygCdtrAgtBldgNm = getValueFromPath(Document, undrlygCdtrAgtBldgNmPath);

        var undrlygCdtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygCdtrAgtFlr = getValueFromPath(Document, undrlygCdtrAgtFlrPath);

        var undrlygCdtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygCdtrAgtPstBx = getValueFromPath(Document, undrlygCdtrAgtPstBxPath);

        var undrlygCdtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygCdtrAgtRoom = getValueFromPath(Document, undrlygCdtrAgtRoomPath);

        var undrlygCdtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygCdtrAgtPstCd = getValueFromPath(Document, undrlygCdtrAgtPstCdPath);

        var undrlygCdtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygCdtrAgtTwnLctnNm = getValueFromPath(Document, undrlygCdtrAgtTwnLctnNmPath);

        var undrlygCdtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygCdtrAgtDstrctNm = getValueFromPath(Document, undrlygCdtrAgtDstrctNmPath);

        var undrlygCdtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygCdtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygCdtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<CdtrAgt>")){
            if(undrlygCdtrAgtPstlAdr){
                if(undrlygCdtrAgtAddrLine && (!undrlygCdtrAgtCtry&& !undrlygCdtrAgtTwnNm&& !undrlygCdtrAgtDept&& !undrlygCdtrAgtSubDept&& !undrlygCdtrAgtStrtNm&& !undrlygCdtrAgtBldgNb&& !undrlygCdtrAgtBldgNm&& !undrlygCdtrAgtFlr&& !undrlygCdtrAgtPstBx&& !undrlygCdtrAgtRoom&& !undrlygCdtrAgtPstCd&& !undrlygCdtrAgtTwnLctnNm&& !undrlygCdtrAgtDstrctNm&& !undrlygCdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "CdtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygCdtrAgtAddrLine = getValueFromPath(Document, undrlygCdtrAgtAddrLinePath);
                            var adrLineLength = undrlygCdtrAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Debtor Agent
        var undrlygDbtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");

        var undrlygDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var undrlygDbtrAgtAddrLine = getValueFromPath(Document, undrlygDbtrAgtAddrLinePath);

        var undrlygDbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var undrlygDbtrAgtTwnNm = getValueFromPath(Document, undrlygDbtrAgtTwnNmPath);

        var undrlygDbtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var undrlygDbtrAgtCtry = getValueFromPath(Document, undrlygDbtrAgtCtryPath);

        var undrlygDbtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var undrlygDbtrAgtDept = getValueFromPath(Document, undrlygDbtrAgtDeptPath);

        var undrlygDbtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var undrlygDbtrAgtSubDept = getValueFromPath(Document, undrlygDbtrAgtSubDeptPath);

        var undrlygDbtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var undrlygDbtrAgtStrtNm = getValueFromPath(Document, undrlygDbtrAgtStrtNmPath);

        var undrlygDbtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var undrlygDbtrAgtBldgNb = getValueFromPath(Document, undrlygDbtrAgtBldgNbPath);

        var undrlygDbtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var undrlygDbtrAgtBldgNm = getValueFromPath(Document, undrlygDbtrAgtBldgNmPath);

        var undrlygDbtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var undrlygDbtrAgtFlr = getValueFromPath(Document, undrlygDbtrAgtFlrPath);

        var undrlygDbtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var undrlygDbtrAgtPstBx = getValueFromPath(Document, undrlygDbtrAgtPstBxPath);

        var undrlygDbtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Room';
        var undrlygDbtrAgtRoom = getValueFromPath(Document, undrlygDbtrAgtRoomPath);

        var undrlygDbtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var undrlygDbtrAgtPstCd = getValueFromPath(Document, undrlygDbtrAgtPstCdPath);

        var undrlygDbtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygDbtrAgtTwnLctnNm = getValueFromPath(Document, undrlygDbtrAgtTwnLctnNmPath);

        var undrlygDbtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var undrlygDbtrAgtDstrctNm = getValueFromPath(Document, undrlygDbtrAgtDstrctNmPath);

        var undrlygDbtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygDbtrAgtCtrySubDvsn = getValueFromPath(Document, undrlygDbtrAgtCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<DbtrAgt>")){
            if(undrlygDbtrAgtPstlAdr){
                if(undrlygDbtrAgtAddrLine && (!undrlygDbtrAgtCtry&& !undrlygDbtrAgtTwnNm&& !undrlygDbtrAgtDept&& !undrlygDbtrAgtSubDept&& !undrlygDbtrAgtStrtNm&& !undrlygDbtrAgtBldgNb&& !undrlygDbtrAgtBldgNm&& !undrlygDbtrAgtFlr&& !undrlygDbtrAgtPstBx&& !undrlygDbtrAgtRoom&& !undrlygDbtrAgtPstCd && !undrlygDbtrAgtTwnLctnNm&& !undrlygDbtrAgtDstrctNm&& !undrlygDbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "DbtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygDbtrAgtAddrLine = getValueFromPath(Document, undrlygDbtrAgtAddrLinePath);
                            var adrLineLength = undrlygDbtrAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }	
                        }
                    }
                }
            }
        }
        
        //Underlying Creditor
        var undrlygCdtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");

        var undrlygCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
        var undrlygCdtrAddrLine = getValueFromPath(Document, undrlygCdtrAddrLinePath);

        var undrlygCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
        var undrlygCdtrTwnNm = getValueFromPath(Document, undrlygCdtrTwnNmPath);

        var undrlygCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
        var undrlygCdtrCtry = getValueFromPath(Document, undrlygCdtrCtryPath);

        var undrlygCdtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Dept';
        var undrlygCdtrDept = getValueFromPath(Document, undrlygCdtrDeptPath);

        var undrlygCdtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/SubDept';
        var undrlygCdtrSubDept = getValueFromPath(Document, undrlygCdtrSubDeptPath);

        var undrlygCdtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/StrtNm';
        var undrlygCdtrStrtNm = getValueFromPath(Document, undrlygCdtrStrtNmPath);

        var undrlygCdtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNb';
        var undrlygCdtrBldgNb = getValueFromPath(Document, undrlygCdtrBldgNbPath);

        var undrlygCdtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNm';
        var undrlygCdtrBldgNm = getValueFromPath(Document, undrlygCdtrBldgNmPath);

        var undrlygCdtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Flr';
        var undrlygCdtrFlr = getValueFromPath(Document, undrlygCdtrFlrPath);

        var undrlygCdtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstBx';
        var undrlygCdtrPstBx = getValueFromPath(Document, undrlygCdtrPstBxPath);

        var undrlygCdtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Room';
        var undrlygCdtrRoom = getValueFromPath(Document, undrlygCdtrRoomPath);

        var undrlygCdtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstCd';
        var undrlygCdtrPstCd = getValueFromPath(Document, undrlygCdtrPstCdPath);

        var undrlygCdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnLctnNm';
        var undrlygCdtrTwnLctnNm = getValueFromPath(Document, undrlygCdtrTwnLctnNmPath);

        var undrlygCdtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/DstrctNm';
        var undrlygCdtrDstrctNm = getValueFromPath(Document, undrlygCdtrDstrctNmPath);

        var undrlygCdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/CtrySubDvsn';
        var undrlygCdtrCtrySubDvsn = getValueFromPath(Document, undrlygCdtrCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<Cdtr>")){
            if(undrlygCdtrPstlAdr){
                if(undrlygCdtrAddrLine && (!undrlygCdtrCtry&& !undrlygCdtrTwnNm&& !undrlygCdtrDept&& !undrlygCdtrSubDept&& !undrlygCdtrStrtNm&& !undrlygCdtrBldgNb&& !undrlygCdtrBldgNm&& !undrlygCdtrFlr&& !undrlygCdtrPstBx&& !undrlygCdtrRoom&& !undrlygCdtrPstCd&& !undrlygCdtrTwnLctnNm && !undrlygCdtrDstrctNm&& !undrlygCdtrCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "Cdtr", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine['+i+']';
                            var undrlygCdtrAddrLine = getValueFromPath(Document, undrlygCdtrAddrLinePath);
                            var adrLineLength = undrlygCdtrAddrLine.length;
                            
                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Debtor
        var undrlygDbtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");

        var undrlygDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
        var undrlygDbtrAddrLine = getValueFromPath(Document, undrlygDbtrAddrLinePath);

        var undrlygDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
        var undrlygDbtrTwnNm = getValueFromPath(Document, undrlygDbtrTwnNmPath);

        var undrlygDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
        var undrlygDbtrCtry = getValueFromPath(Document, undrlygDbtrCtryPath);

        var undrlygDbtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Dept';
        var undrlygDbtrDept = getValueFromPath(Document, undrlygDbtrDeptPath);

        var undrlygDbtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/SubDept';
        var undrlygDbtrSubDept = getValueFromPath(Document, undrlygDbtrSubDeptPath);

        var undrlygDbtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/StrtNm';
        var undrlygDbtrStrtNm = getValueFromPath(Document, undrlygDbtrStrtNmPath);

        var undrlygDbtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNb';
        var undrlygDbtrBldgNb = getValueFromPath(Document, undrlygDbtrBldgNbPath);

        var undrlygDbtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNm';
        var undrlygDbtrBldgNm = getValueFromPath(Document, undrlygDbtrBldgNmPath);

        var undrlygDbtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Flr';
        var undrlygDbtrFlr = getValueFromPath(Document, undrlygDbtrFlrPath);

        var undrlygDbtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstBx';
        var undrlygDbtrPstBx = getValueFromPath(Document, undrlygDbtrPstBxPath);

        var undrlygDbtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Room';
        var undrlygDbtrRoom = getValueFromPath(Document, undrlygDbtrRoomPath);

        var undrlygDbtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstCd';
        var undrlygDbtrPstCd = getValueFromPath(Document, undrlygDbtrPstCdPath);

        var undrlygDbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnLctnNm';
        var undrlygDbtrTwnLctnNm = getValueFromPath(Document, undrlygDbtrTwnLctnNmPath);

        var undrlygDbtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/DstrctNm';
        var undrlygDbtrDstrctNm = getValueFromPath(Document, undrlygDbtrDstrctNmPath);

        var undrlygDbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/CtrySubDvsn';
        var undrlygDbtrCtrySubDvsn = getValueFromPath(Document, undrlygDbtrCtrySubDvsnPath);

        if(isPatternPresent(Document3, "<Dbtr>")){
            if(undrlygDbtrPstlAdr){
                if(undrlygDbtrAddrLine && (!undrlygDbtrCtry&& !undrlygDbtrTwnNm&& !undrlygDbtrDept&& !undrlygDbtrSubDept&& !undrlygDbtrStrtNm&& !undrlygDbtrBldgNb&& !undrlygDbtrBldgNm&& !undrlygDbtrFlr&& !undrlygDbtrPstBx&& !undrlygDbtrRoom&& !undrlygDbtrPstCd&& !undrlygDbtrTwnLctnNm&& !undrlygDbtrDstrctNm&& !undrlygDbtrCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "Dbtr", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine['+i+']';
                            var undrlygDbtrAddrLine = getValueFromPath(Document, undrlygDbtrAddrLinePath);
                            var adrLineLength = undrlygDbtrAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Previous Instructing Agent1
        var undrlygPrvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");

        var undrlygPrvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt1AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt1AddrLinePath);

        var undrlygPrvsInstgAgt1TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt1TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt1TwnNmPath);

        var undrlygPrvsInstgAgt1CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt1Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt1CtryPath);

        var undrlygPrvsInstgAgt1DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt1Dept = getValueFromPath(Document, undrlygPrvsInstgAgt1DeptPath);

        var undrlygPrvsInstgAgt1SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt1SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt1SubDeptPath);

        var undrlygPrvsInstgAgt1StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt1StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt1StrtNmPath);

        var undrlygPrvsInstgAgt1BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt1BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt1BldgNbPath);

        var undrlygPrvsInstgAgt1BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt1BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt1BldgNmPath);

        var undrlygPrvsInstgAgt1FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt1Flr = getValueFromPath(Document, undrlygPrvsInstgAgt1FlrPath);

        var undrlygPrvsInstgAgt1PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt1PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt1PstBxPath);

        var undrlygPrvsInstgAgt1RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt1Room = getValueFromPath(Document, undrlygPrvsInstgAgt1RoomPath);

        var undrlygPrvsInstgAgt1PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt1PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt1PstCdPath);

        var undrlygPrvsInstgAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt1TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt1TwnLctnNmPath);

        var undrlygPrvsInstgAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt1DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt1DstrctNmPath);

        var undrlygPrvsInstgAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt1CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt1CtrySubDvsnPath);
       
        if(isPatternPresent(Document3, "<PrvsInstgAgt1>")){
            if(undrlygPrvsInstgAgt1PstlAdr){
                if(undrlygPrvsInstgAgt1AddrLine && (!undrlygPrvsInstgAgt1Ctry && !undrlygPrvsInstgAgt1TwnNm && !undrlygPrvsInstgAgt1Dept && !undrlygPrvsInstgAgt1SubDept && !undrlygPrvsInstgAgt1StrtNm && !undrlygPrvsInstgAgt1BldgNb && !undrlygPrvsInstgAgt1BldgNm && !undrlygPrvsInstgAgt1Flr && !undrlygPrvsInstgAgt1PstBx && !undrlygPrvsInstgAgt1Room && !undrlygPrvsInstgAgt1PstCd && !undrlygPrvsInstgAgt1TwnLctnNm && !undrlygPrvsInstgAgt1DstrctNm && !undrlygPrvsInstgAgt1CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygPrvsInstgAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygPrvsInstgAgt1AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt1AddrLinePath);
                            var adrLineLength = undrlygPrvsInstgAgt1AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Previous Instructing Agent2
        var undrlygPrvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");

        var undrlygPrvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt2AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt2AddrLinePath);

        var undrlygPrvsInstgAgt2TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt2TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt2TwnNmPath);

        var undrlygPrvsInstgAgt2CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt2Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt2CtryPath);

        var undrlygPrvsInstgAgt2DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt2Dept = getValueFromPath(Document, undrlygPrvsInstgAgt2DeptPath);

        var undrlygPrvsInstgAgt2SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt2SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt2SubDeptPath);

        var undrlygPrvsInstgAgt2StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt2StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt2StrtNmPath);

        var undrlygPrvsInstgAgt2BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt2BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt2BldgNbPath);

        var undrlygPrvsInstgAgt2BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt2BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt2BldgNmPath);

        var undrlygPrvsInstgAgt2FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt2Flr = getValueFromPath(Document, undrlygPrvsInstgAgt2FlrPath);

        var undrlygPrvsInstgAgt2PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt2PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt2PstBxPath);

        var undrlygPrvsInstgAgt2RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt2Room = getValueFromPath(Document, undrlygPrvsInstgAgt2RoomPath);

        var undrlygPrvsInstgAgt2PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt2PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt2PstCdPath);

        var undrlygPrvsInstgAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt2TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt2TwnLctnNmPath);

        var undrlygPrvsInstgAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt2DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt2DstrctNmPath);

        var undrlygPrvsInstgAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt2CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<PrvsInstgAgt2>")){
            if(undrlygPrvsInstgAgt2PstlAdr){
                if(undrlygPrvsInstgAgt2AddrLine && (!undrlygPrvsInstgAgt2Ctry && !undrlygPrvsInstgAgt2TwnNm && !undrlygPrvsInstgAgt2Dept && !undrlygPrvsInstgAgt2SubDept && !undrlygPrvsInstgAgt2StrtNm && !undrlygPrvsInstgAgt2BldgNb && !undrlygPrvsInstgAgt2BldgNm && !undrlygPrvsInstgAgt2Flr && !undrlygPrvsInstgAgt2PstBx && !undrlygPrvsInstgAgt2Room && !undrlygPrvsInstgAgt2PstCd && !undrlygPrvsInstgAgt2TwnLctnNm && !undrlygPrvsInstgAgt2DstrctNm && !undrlygPrvsInstgAgt2CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygPrvsInstgAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygPrvsInstgAgt2AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt2AddrLinePath);
                            var adrLineLength = undrlygPrvsInstgAgt2AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Previous Instructing Agent3
        var undrlygPrvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");

        var undrlygPrvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygPrvsInstgAgt3AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt3AddrLinePath);

        var undrlygPrvsInstgAgt3TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygPrvsInstgAgt3TwnNm = getValueFromPath(Document, undrlygPrvsInstgAgt3TwnNmPath);

        var undrlygPrvsInstgAgt3CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygPrvsInstgAgt3Ctry = getValueFromPath(Document, undrlygPrvsInstgAgt3CtryPath);

        var undrlygPrvsInstgAgt3DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
        var undrlygPrvsInstgAgt3Dept = getValueFromPath(Document, undrlygPrvsInstgAgt3DeptPath);

        var undrlygPrvsInstgAgt3SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/SubDept';
        var undrlygPrvsInstgAgt3SubDept = getValueFromPath(Document, undrlygPrvsInstgAgt3SubDeptPath);

        var undrlygPrvsInstgAgt3StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
        var undrlygPrvsInstgAgt3StrtNm = getValueFromPath(Document, undrlygPrvsInstgAgt3StrtNmPath);

        var undrlygPrvsInstgAgt3BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
        var undrlygPrvsInstgAgt3BldgNb = getValueFromPath(Document, undrlygPrvsInstgAgt3BldgNbPath);

        var undrlygPrvsInstgAgt3BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNm';
        var undrlygPrvsInstgAgt3BldgNm = getValueFromPath(Document, undrlygPrvsInstgAgt3BldgNmPath);

        var undrlygPrvsInstgAgt3FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Flr';
        var undrlygPrvsInstgAgt3Flr = getValueFromPath(Document, undrlygPrvsInstgAgt3FlrPath);

        var undrlygPrvsInstgAgt3PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
        var undrlygPrvsInstgAgt3PstBx = getValueFromPath(Document, undrlygPrvsInstgAgt3PstBxPath);

        var undrlygPrvsInstgAgt3RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
        var undrlygPrvsInstgAgt3Room = getValueFromPath(Document, undrlygPrvsInstgAgt3RoomPath);

        var undrlygPrvsInstgAgt3PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
        var undrlygPrvsInstgAgt3PstCd = getValueFromPath(Document, undrlygPrvsInstgAgt3PstCdPath);

        var undrlygPrvsInstgAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygPrvsInstgAgt3TwnLctnNm = getValueFromPath(Document, undrlygPrvsInstgAgt3TwnLctnNmPath);

        var undrlygPrvsInstgAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
        var undrlygPrvsInstgAgt3DstrctNm = getValueFromPath(Document, undrlygPrvsInstgAgt3DstrctNmPath);

        var undrlygPrvsInstgAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygPrvsInstgAgt3CtrySubDvsn = getValueFromPath(Document, undrlygPrvsInstgAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<PrvsInstgAgt3>")){
            if(undrlygPrvsInstgAgt3PstlAdr){
                if(undrlygPrvsInstgAgt3AddrLine && (!undrlygPrvsInstgAgt3Ctry && !undrlygPrvsInstgAgt3TwnNm && !undrlygPrvsInstgAgt3Dept && !undrlygPrvsInstgAgt3SubDept && !undrlygPrvsInstgAgt3StrtNm && !undrlygPrvsInstgAgt3BldgNb && !undrlygPrvsInstgAgt3BldgNm && !undrlygPrvsInstgAgt3Flr && !undrlygPrvsInstgAgt3PstBx && !undrlygPrvsInstgAgt3Room && !undrlygPrvsInstgAgt3PstCd && !undrlygPrvsInstgAgt3TwnLctnNm && !undrlygPrvsInstgAgt3DstrctNm && !undrlygPrvsInstgAgt3CtrySubDvsn)){
                    var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygPrvsInstgAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygPrvsInstgAgt3AddrLine = getValueFromPath(Document, undrlygPrvsInstgAgt3AddrLinePath);
                            var adrLineLength = undrlygPrvsInstgAgt3AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Intermediary Agent1
        var undrlygIntrmyAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");

        var undrlygIntrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt1AddrLine = getValueFromPath(Document, undrlygIntrmyAgt1AddrLinePath);

        var undrlygIntrmyAgt1TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt1TwnNm = getValueFromPath(Document, undrlygIntrmyAgt1TwnNmPath);

        var undrlygIntrmyAgt1CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt1Ctry = getValueFromPath(Document, undrlygIntrmyAgt1CtryPath);

        var undrlygIntrmyAgt1DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt1Dept = getValueFromPath(Document, undrlygIntrmyAgt1DeptPath);

        var undrlygIntrmyAgt1SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt1SubDept = getValueFromPath(Document, undrlygIntrmyAgt1SubDeptPath);

        var undrlygIntrmyAgt1StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt1StrtNm = getValueFromPath(Document, undrlygIntrmyAgt1StrtNmPath);

        var undrlygIntrmyAgt1BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt1BldgNb = getValueFromPath(Document, undrlygIntrmyAgt1BldgNbPath);

        var undrlygIntrmyAgt1BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt1BldgNm = getValueFromPath(Document, undrlygIntrmyAgt1BldgNmPath);

        var undrlygIntrmyAgt1FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt1Flr = getValueFromPath(Document, undrlygIntrmyAgt1FlrPath);

        var undrlygIntrmyAgt1PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt1PstBx = getValueFromPath(Document, undrlygIntrmyAgt1PstBxPath);

        var undrlygIntrmyAgt1RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt1Room = getValueFromPath(Document, undrlygIntrmyAgt1RoomPath);

        var undrlygIntrmyAgt1PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt1PstCd = getValueFromPath(Document, undrlygIntrmyAgt1PstCdPath);

        var undrlygIntrmyAgt1TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt1TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt1TwnLctnNmPath);

        var undrlygIntrmyAgt1DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt1DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt1DstrctNmPath);

        var undrlygIntrmyAgt1CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt1CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt1CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<IntrmyAgt1>")){
            if(undrlygIntrmyAgt1PstlAdr){
                if(undrlygIntrmyAgt1AddrLine && (!undrlygIntrmyAgt1Ctry && !undrlygIntrmyAgt1TwnNm && !undrlygIntrmyAgt1Dept && !undrlygIntrmyAgt1SubDept && !undrlygIntrmyAgt1StrtNm && !undrlygIntrmyAgt1BldgNb && !undrlygIntrmyAgt1BldgNm && !undrlygIntrmyAgt1Flr && !undrlygIntrmyAgt1PstBx && !undrlygIntrmyAgt1Room && !undrlygIntrmyAgt1PstCd && !undrlygIntrmyAgt1TwnLctnNm && !undrlygIntrmyAgt1DstrctNm  && !undrlygIntrmyAgt1CtrySubDvsn)){
                var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt1", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygIntrmyAgt1AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygIntrmyAgt1AddrLine = getValueFromPath(Document, undrlygIntrmyAgt1AddrLinePath);
                            var adrLineLength = undrlygIntrmyAgt1AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Intermediary Agent2
        var undrlygIntrmyAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");

        var undrlygIntrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt2AddrLine = getValueFromPath(Document, undrlygIntrmyAgt2AddrLinePath);

        var undrlygIntrmyAgt2TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt2TwnNm = getValueFromPath(Document, undrlygIntrmyAgt2TwnNmPath);

        var undrlygIntrmyAgt2CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt2Ctry = getValueFromPath(Document, undrlygIntrmyAgt2CtryPath);

        var undrlygIntrmyAgt2DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt2Dept = getValueFromPath(Document, undrlygIntrmyAgt2DeptPath);

        var undrlygIntrmyAgt2SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt2SubDept = getValueFromPath(Document, undrlygIntrmyAgt2SubDeptPath);

        var undrlygIntrmyAgt2StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt2StrtNm = getValueFromPath(Document, undrlygIntrmyAgt2StrtNmPath);

        var undrlygIntrmyAgt2BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt2BldgNb = getValueFromPath(Document, undrlygIntrmyAgt2BldgNbPath);

        var undrlygIntrmyAgt2BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt2BldgNm = getValueFromPath(Document, undrlygIntrmyAgt2BldgNmPath);

        var undrlygIntrmyAgt2FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt2Flr = getValueFromPath(Document, undrlygIntrmyAgt2FlrPath);

        var undrlygIntrmyAgt2PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt2PstBx = getValueFromPath(Document, undrlygIntrmyAgt2PstBxPath);

        var undrlygIntrmyAgt2RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt2Room = getValueFromPath(Document, undrlygIntrmyAgt2RoomPath);

        var undrlygIntrmyAgt2PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt2PstCd = getValueFromPath(Document, undrlygIntrmyAgt2PstCdPath);

        var undrlygIntrmyAgt2TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt2TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt2TwnLctnNmPath);

        var undrlygIntrmyAgt2DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt2DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt2DstrctNmPath);

        var undrlygIntrmyAgt2CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt2CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt2CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<IntrmyAgt2>")){
            if(undrlygIntrmyAgt2PstlAdr){
                if(undrlygIntrmyAgt2AddrLine && (!undrlygIntrmyAgt2Ctry && !undrlygIntrmyAgt2TwnNm && !undrlygIntrmyAgt2Dept && !undrlygIntrmyAgt2SubDept && !undrlygIntrmyAgt2StrtNm && !undrlygIntrmyAgt2BldgNb && !undrlygIntrmyAgt2BldgNm && !undrlygIntrmyAgt2Flr && !undrlygIntrmyAgt2PstBx && !undrlygIntrmyAgt2Room && !undrlygIntrmyAgt2PstCd && !undrlygIntrmyAgt2TwnLctnNm && !undrlygIntrmyAgt2DstrctNm  && !undrlygIntrmyAgt2CtrySubDvsn)){
                var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt2", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygIntrmyAgt2AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygIntrmyAgt2AddrLine = getValueFromPath(Document, undrlygIntrmyAgt2AddrLinePath);
                            var adrLineLength = undrlygIntrmyAgt2AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // Underlying Intermediary Agent2
        var undrlygIntrmyAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");

        var undrlygIntrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
        var undrlygIntrmyAgt3AddrLine = getValueFromPath(Document, undrlygIntrmyAgt3AddrLinePath);

        var undrlygIntrmyAgt3TwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
        var undrlygIntrmyAgt3TwnNm = getValueFromPath(Document, undrlygIntrmyAgt3TwnNmPath);

        var undrlygIntrmyAgt3CtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
        var undrlygIntrmyAgt3Ctry = getValueFromPath(Document, undrlygIntrmyAgt3CtryPath);

        var undrlygIntrmyAgt3DeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
        var undrlygIntrmyAgt3Dept = getValueFromPath(Document, undrlygIntrmyAgt3DeptPath);

        var undrlygIntrmyAgt3SubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/SubDept';
        var undrlygIntrmyAgt3SubDept = getValueFromPath(Document, undrlygIntrmyAgt3SubDeptPath);

        var undrlygIntrmyAgt3StrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
        var undrlygIntrmyAgt3StrtNm = getValueFromPath(Document, undrlygIntrmyAgt3StrtNmPath);

        var undrlygIntrmyAgt3BldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
        var undrlygIntrmyAgt3BldgNb = getValueFromPath(Document, undrlygIntrmyAgt3BldgNbPath);

        var undrlygIntrmyAgt3BldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNm';
        var undrlygIntrmyAgt3BldgNm = getValueFromPath(Document, undrlygIntrmyAgt3BldgNmPath);

        var undrlygIntrmyAgt3FlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Flr';
        var undrlygIntrmyAgt3Flr = getValueFromPath(Document, undrlygIntrmyAgt3FlrPath);

        var undrlygIntrmyAgt3PstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
        var undrlygIntrmyAgt3PstBx = getValueFromPath(Document, undrlygIntrmyAgt3PstBxPath);

        var undrlygIntrmyAgt3RoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
        var undrlygIntrmyAgt3Room = getValueFromPath(Document, undrlygIntrmyAgt3RoomPath);

        var undrlygIntrmyAgt3PstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
        var undrlygIntrmyAgt3PstCd = getValueFromPath(Document, undrlygIntrmyAgt3PstCdPath);

        var undrlygIntrmyAgt3TwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
        var undrlygIntrmyAgt3TwnLctnNm = getValueFromPath(Document, undrlygIntrmyAgt3TwnLctnNmPath);

        var undrlygIntrmyAgt3DstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
        var undrlygIntrmyAgt3DstrctNm = getValueFromPath(Document, undrlygIntrmyAgt3DstrctNmPath);

        var undrlygIntrmyAgt3CtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
        var undrlygIntrmyAgt3CtrySubDvsn = getValueFromPath(Document, undrlygIntrmyAgt3CtrySubDvsnPath);

        if(isPatternPresent(Document3, "<IntrmyAgt3>")){
            if(undrlygIntrmyAgt3PstlAdr){
                if(undrlygIntrmyAgt3AddrLine && (!undrlygIntrmyAgt3Ctry && !undrlygIntrmyAgt3TwnNm && !undrlygIntrmyAgt3Dept && !undrlygIntrmyAgt3SubDept && !undrlygIntrmyAgt3StrtNm && !undrlygIntrmyAgt3BldgNb && !undrlygIntrmyAgt3BldgNm && !undrlygIntrmyAgt3Flr && !undrlygIntrmyAgt3PstBx && !undrlygIntrmyAgt3Room && !undrlygIntrmyAgt3PstCd && !undrlygIntrmyAgt3TwnLctnNm && !undrlygIntrmyAgt3DstrctNm  && !undrlygIntrmyAgt3CtrySubDvsn)){
                var count = countXmlNodes2(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt3", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var undrlygIntrmyAgt3AddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var undrlygIntrmyAgt3AddrLine = getValueFromPath(Document, undrlygIntrmyAgt3AddrLinePath);
                            var adrLineLength = undrlygIntrmyAgt3AddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("825", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }

    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        // OrgnlTxRef SttlmInf InstgRmbrsmntAgt
        var instgRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstgRmbrsmntAgt", "<PstlAdr>");

        var instgRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var instgRmbrsmntAgtAddrLine = getValueFromPath(Document, instgRmbrsmntAgtAddrLinePath);

        var instgRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var instgRmbrsmntAgtTwnNm = getValueFromPath(Document, instgRmbrsmntAgtTwnNmPath);

        var instgRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var instgRmbrsmntAgtCtry = getValueFromPath(Document, instgRmbrsmntAgtCtryPath);

        var instgRmbrsmntAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Dept';
        var instgRmbrsmntAgtDept = getValueFromPath(Document, instgRmbrsmntAgtDeptPath);

        var instgRmbrsmntAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/SubDept';
        var instgRmbrsmntAgtSubDept = getValueFromPath(Document, instgRmbrsmntAgtSubDeptPath);

        var instgRmbrsmntAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/StrtNm';
        var instgRmbrsmntAgtStrtNm = getValueFromPath(Document, instgRmbrsmntAgtStrtNmPath);

        var instgRmbrsmntAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/BldgNb';
        var instgRmbrsmntAgtBldgNb = getValueFromPath(Document, instgRmbrsmntAgtBldgNbPath);

        var instgRmbrsmntAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/BldgNm';
        var instgRmbrsmntAgtBldgNm = getValueFromPath(Document, instgRmbrsmntAgtBldgNmPath);

        var instgRmbrsmntAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Flr';
        var instgRmbrsmntAgtFlr = getValueFromPath(Document, instgRmbrsmntAgtFlrPath);

        var instgRmbrsmntAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/PstBx';
        var instgRmbrsmntAgtPstBx = getValueFromPath(Document, instgRmbrsmntAgtPstBxPath);

        var instgRmbrsmntAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/Room';
        var instgRmbrsmntAgtRoom = getValueFromPath(Document, instgRmbrsmntAgtRoomPath);

        var instgRmbrsmntAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/PstCd';
        var instgRmbrsmntAgtPstCd = getValueFromPath(Document, instgRmbrsmntAgtPstCdPath);

        var instgRmbrsmntAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var instgRmbrsmntAgtTwnLctnNm = getValueFromPath(Document, instgRmbrsmntAgtTwnLctnNmPath);

        var instgRmbrsmntAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/DstrctNm';
        var instgRmbrsmntAgtDstrctNm = getValueFromPath(Document, instgRmbrsmntAgtDstrctNmPath);

        var instgRmbrsmntAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var instgRmbrsmntAgtCtrySubDvsn = getValueFromPath(Document, instgRmbrsmntAgtCtrySubDvsnPath);
        
        if(isPatternPresent(Document4, "<InstgRmbrsmntAgt>")){
            if(instgRmbrsmntAgtPstlAdr){
                if(instgRmbrsmntAgtAddrLine && (!instgRmbrsmntAgtCtry && !instgRmbrsmntAgtTwnNm && !instgRmbrsmntAgtDept && !instgRmbrsmntAgtSubDept && !instgRmbrsmntAgtStrtNm && !instgRmbrsmntAgtBldgNb && !instgRmbrsmntAgtBldgNm && !instgRmbrsmntAgtFlr && !instgRmbrsmntAgtPstBx && !instgRmbrsmntAgtRoom && !instgRmbrsmntAgtPstCd && !instgRmbrsmntAgtTwnLctnNm && !instgRmbrsmntAgtDstrctNm  && !instgRmbrsmntAgtCtrySubDvsn)){
                var count = countXmlNodes3(Document, "OrgnlTxRef", "SttlmInf", "InstgRmbrsmntAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var instgRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstgRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var instgRmbrsmntAgtAddrLine = getValueFromPath(Document, instgRmbrsmntAgtAddrLinePath);
                            var adrLineLength = instgRmbrsmntAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("944", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // OrgnlTxRef SttlmInf InstdRmbrsmntAgt
        var instdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstdRmbrsmntAgt", "<PstlAdr>");

        var instdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var instdRmbrsmntAgtAddrLine = getValueFromPath(Document, instdRmbrsmntAgtAddrLinePath);

        var instdRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var instdRmbrsmntAgtTwnNm = getValueFromPath(Document, instdRmbrsmntAgtTwnNmPath);

        var instdRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var instdRmbrsmntAgtCtry = getValueFromPath(Document, instdRmbrsmntAgtCtryPath);

        var instdRmbrsmntAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Dept';
        var instdRmbrsmntAgtDept = getValueFromPath(Document, instdRmbrsmntAgtDeptPath);

        var instdRmbrsmntAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/SubDept';
        var instdRmbrsmntAgtSubDept = getValueFromPath(Document, instdRmbrsmntAgtSubDeptPath);

        var instdRmbrsmntAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/StrtNm';
        var instdRmbrsmntAgtStrtNm = getValueFromPath(Document, instdRmbrsmntAgtStrtNmPath);

        var instdRmbrsmntAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNb';
        var instdRmbrsmntAgtBldgNb = getValueFromPath(Document, instdRmbrsmntAgtBldgNbPath);

        var instdRmbrsmntAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNm';
        var instdRmbrsmntAgtBldgNm = getValueFromPath(Document, instdRmbrsmntAgtBldgNmPath);

        var instdRmbrsmntAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Flr';
        var instdRmbrsmntAgtFlr = getValueFromPath(Document, instdRmbrsmntAgtFlrPath);

        var instdRmbrsmntAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/PstBx';
        var instdRmbrsmntAgtPstBx = getValueFromPath(Document, instdRmbrsmntAgtPstBxPath);

        var instdRmbrsmntAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/Room';
        var instdRmbrsmntAgtRoom = getValueFromPath(Document, instdRmbrsmntAgtRoomPath);

        var instdRmbrsmntAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/PstCd';
        var instdRmbrsmntAgtPstCd = getValueFromPath(Document, instdRmbrsmntAgtPstCdPath);

        var instdRmbrsmntAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var instdRmbrsmntAgtTwnLctnNm = getValueFromPath(Document, instdRmbrsmntAgtTwnLctnNmPath);

        var instdRmbrsmntAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/DstrctNm';
        var instdRmbrsmntAgtDstrctNm = getValueFromPath(Document, instdRmbrsmntAgtDstrctNmPath);

        var instdRmbrsmntAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var instdRmbrsmntAgtCtrySubDvsn = getValueFromPath(Document, instdRmbrsmntAgtCtrySubDvsnPath);
        
        if(isPatternPresent(Document4, "<InstdRmbrsmntAgt>")){
            if(instdRmbrsmntAgtPstlAdr){
                if(instdRmbrsmntAgtAddrLine && (!instdRmbrsmntAgtCtry && !instdRmbrsmntAgtTwnNm && !instdRmbrsmntAgtDept && !instdRmbrsmntAgtSubDept && !instdRmbrsmntAgtStrtNm && !instdRmbrsmntAgtBldgNb && !instdRmbrsmntAgtBldgNm && !instdRmbrsmntAgtFlr && !instdRmbrsmntAgtPstBx && !instdRmbrsmntAgtRoom && !instdRmbrsmntAgtPstCd && !instdRmbrsmntAgtTwnLctnNm && !instdRmbrsmntAgtDstrctNm  && !instdRmbrsmntAgtCtrySubDvsn)){
                var count = countXmlNodes3(Document, "OrgnlTxRef", "SttlmInf", "InstdRmbrsmntAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var instdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/InstdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var instdRmbrsmntAgtAddrLine = getValueFromPath(Document, instdRmbrsmntAgtAddrLinePath);
                            var adrLineLength = instdRmbrsmntAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("992", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // OrgnlTxRef SttlmInf ThrdRmbrsmntAgt
        var thrdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "ThrdRmbrsmntAgt", "<PstlAdr>");

        var thrdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine';
        var thrdRmbrsmntAgtAddrLine = getValueFromPath(Document, thrdRmbrsmntAgtAddrLinePath);

        var thrdRmbrsmntAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/TwnNm';
        var thrdRmbrsmntAgtTwnNm = getValueFromPath(Document, thrdRmbrsmntAgtTwnNmPath);

        var thrdRmbrsmntAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Ctry';
        var thrdRmbrsmntAgtCtry = getValueFromPath(Document, thrdRmbrsmntAgtCtryPath);

        var thrdRmbrsmntAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Dept';
        var thrdRmbrsmntAgtDept = getValueFromPath(Document, thrdRmbrsmntAgtDeptPath);

        var thrdRmbrsmntAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/SubDept';
        var thrdRmbrsmntAgtSubDept = getValueFromPath(Document, thrdRmbrsmntAgtSubDeptPath);

        var thrdRmbrsmntAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/StrtNm';
        var thrdRmbrsmntAgtStrtNm = getValueFromPath(Document, thrdRmbrsmntAgtStrtNmPath);

        var thrdRmbrsmntAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNb';
        var thrdRmbrsmntAgtBldgNb = getValueFromPath(Document, thrdRmbrsmntAgtBldgNbPath);

        var thrdRmbrsmntAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/BldgNm';
        var thrdRmbrsmntAgtBldgNm = getValueFromPath(Document, thrdRmbrsmntAgtBldgNmPath);

        var thrdRmbrsmntAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Flr';
        var thrdRmbrsmntAgtFlr = getValueFromPath(Document, thrdRmbrsmntAgtFlrPath);

        var thrdRmbrsmntAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/PstBx';
        var thrdRmbrsmntAgtPstBx = getValueFromPath(Document, thrdRmbrsmntAgtPstBxPath);

        var thrdRmbrsmntAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/Room';
        var thrdRmbrsmntAgtRoom = getValueFromPath(Document, thrdRmbrsmntAgtRoomPath);

        var thrdRmbrsmntAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/PstCd';
        var thrdRmbrsmntAgtPstCd = getValueFromPath(Document, thrdRmbrsmntAgtPstCdPath);

        var thrdRmbrsmntAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var thrdRmbrsmntAgtTwnLctnNm = getValueFromPath(Document, thrdRmbrsmntAgtTwnLctnNmPath);

        var thrdRmbrsmntAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/DstrctNm';
        var thrdRmbrsmntAgtDstrctNm = getValueFromPath(Document, thrdRmbrsmntAgtDstrctNmPath);

        var thrdRmbrsmntAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var thrdRmbrsmntAgtCtrySubDvsn = getValueFromPath(Document, thrdRmbrsmntAgtCtrySubDvsnPath);
        
        if(isPatternPresent(Document4, "<ThrdRmbrsmntAgt>")){
            if(thrdRmbrsmntAgtPstlAdr){
                if(thrdRmbrsmntAgtAddrLine && (!thrdRmbrsmntAgtCtry && !thrdRmbrsmntAgtTwnNm && !thrdRmbrsmntAgtDept && !thrdRmbrsmntAgtSubDept && !thrdRmbrsmntAgtStrtNm && !thrdRmbrsmntAgtBldgNb && !thrdRmbrsmntAgtBldgNm && !thrdRmbrsmntAgtFlr && !thrdRmbrsmntAgtPstBx && !thrdRmbrsmntAgtRoom && !thrdRmbrsmntAgtPstCd && !thrdRmbrsmntAgtTwnLctnNm && !thrdRmbrsmntAgtDstrctNm  && !thrdRmbrsmntAgtCtrySubDvsn)){
                var count = countXmlNodes3(Document, "OrgnlTxRef", "SttlmInf", "ThrdRmbrsmntAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var thrdRmbrsmntAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/ThrdRmbrsmntAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var thrdRmbrsmntAgtAddrLine = getValueFromPath(Document, thrdRmbrsmntAgtAddrLinePath);
                            var adrLineLength = thrdRmbrsmntAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("1040", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            // OrgnlTxRef Creditor/Pty
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");

            var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/AdrLine';
            var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);

            var orgnlTxRefCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/TwnNm';
            var orgnlTxRefCdtrTwnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnNmPath);

            var orgnlTxRefCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Ctry';
            var orgnlTxRefCdtrCtry = getValueFromPath(Document, orgnlTxRefCdtrCtryPath);

            var orgnlTxRefCdtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Dept';
            var orgnlTxRefCdtrDept = getValueFromPath(Document, orgnlTxRefCdtrDeptPath);

            var orgnlTxRefCdtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/SubDept';
            var orgnlTxRefCdtrSubDept = getValueFromPath(Document, orgnlTxRefCdtrSubDeptPath);

            var orgnlTxRefCdtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/StrtNm';
            var orgnlTxRefCdtrStrtNm = getValueFromPath(Document, orgnlTxRefCdtrStrtNmPath);

            var orgnlTxRefCdtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/BldgNb';
            var orgnlTxRefCdtrBldgNb = getValueFromPath(Document, orgnlTxRefCdtrBldgNbPath);

            var orgnlTxRefCdtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/BldgNm';
            var orgnlTxRefCdtrBldgNm = getValueFromPath(Document, orgnlTxRefCdtrBldgNmPath);

            var orgnlTxRefCdtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Flr';
            var orgnlTxRefCdtrFlr = getValueFromPath(Document, orgnlTxRefCdtrFlrPath);

            var orgnlTxRefCdtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/PstBx';
            var orgnlTxRefCdtrPstBx = getValueFromPath(Document, orgnlTxRefCdtrPstBxPath);

            var orgnlTxRefCdtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/Room';
            var orgnlTxRefCdtrRoom = getValueFromPath(Document, orgnlTxRefCdtrRoomPath);

            var orgnlTxRefCdtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/PstCd';
            var orgnlTxRefCdtrPstCd = getValueFromPath(Document, orgnlTxRefCdtrPstCdPath);

            var orgnlTxRefCdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/TwnLctnNm';
            var orgnlTxRefCdtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnLctnNmPath);

            var orgnlTxRefCdtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/DstrctNm';
            var orgnlTxRefCdtrDstrctNm = getValueFromPath(Document, orgnlTxRefCdtrDstrctNmPath);

            var orgnlTxRefCdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/CtrySubDvsn';
            var orgnlTxRefCdtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefCdtrCtrySubDvsnPath);

            if(isPatternPresent(Document4, "<Cdtr>")){
                if(orgnlTxRefCdtrPstlAdr){
                    if(orgnlTxRefCdtrAddrLine && (!orgnlTxRefCdtrCtry&& !orgnlTxRefCdtrTwnNm&& !orgnlTxRefCdtrDept&& !orgnlTxRefCdtrSubDept&& !orgnlTxRefCdtrStrtNm&& !orgnlTxRefCdtrBldgNb&& !orgnlTxRefCdtrBldgNm&& !orgnlTxRefCdtrFlr&& !orgnlTxRefCdtrPstBx&& !orgnlTxRefCdtrRoom&& !orgnlTxRefCdtrPstCd&& !orgnlTxRefCdtrTwnLctnNm && !orgnlTxRefCdtrDstrctNm&& !orgnlTxRefCdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Cdtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/PstlAdr/AdrLine['+i+']';
                                var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);
                                var adrLineLength = orgnlTxRefCdtrAddrLine.length;
                                
                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs8: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("2194", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }
            
            // OrgnlTxRef Debtor/Pty
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");

            var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/AdrLine';
            var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);

            var orgnlTxRefDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/TwnNm';
            var orgnlTxRefDbtrTwnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnNmPath);

            var orgnlTxRefDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Ctry';
            var orgnlTxRefDbtrCtry = getValueFromPath(Document, orgnlTxRefDbtrCtryPath);

            var orgnlTxRefDbtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Dept';
            var orgnlTxRefDbtrDept = getValueFromPath(Document, orgnlTxRefDbtrDeptPath);

            var orgnlTxRefDbtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/SubDept';
            var orgnlTxRefDbtrSubDept = getValueFromPath(Document, orgnlTxRefDbtrSubDeptPath);

            var orgnlTxRefDbtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/StrtNm';
            var orgnlTxRefDbtrStrtNm = getValueFromPath(Document, orgnlTxRefDbtrStrtNmPath);

            var orgnlTxRefDbtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/BldgNb';
            var orgnlTxRefDbtrBldgNb = getValueFromPath(Document, orgnlTxRefDbtrBldgNbPath);

            var orgnlTxRefDbtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/BldgNm';
            var orgnlTxRefDbtrBldgNm = getValueFromPath(Document, orgnlTxRefDbtrBldgNmPath);

            var orgnlTxRefDbtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Flr';
            var orgnlTxRefDbtrFlr = getValueFromPath(Document, orgnlTxRefDbtrFlrPath);

            var orgnlTxRefDbtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/PstBx';
            var orgnlTxRefDbtrPstBx = getValueFromPath(Document, orgnlTxRefDbtrPstBxPath);

            var orgnlTxRefDbtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/Room';
            var orgnlTxRefDbtrRoom = getValueFromPath(Document, orgnlTxRefDbtrRoomPath);

            var orgnlTxRefDbtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/PstCd';
            var orgnlTxRefDbtrPstCd = getValueFromPath(Document, orgnlTxRefDbtrPstCdPath);

            var orgnlTxRefDbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/TwnLctnNm';
            var orgnlTxRefDbtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnLctnNmPath);

            var orgnlTxRefDbtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/DstrctNm';
            var orgnlTxRefDbtrDstrctNm = getValueFromPath(Document, orgnlTxRefDbtrDstrctNmPath);

            var orgnlTxRefDbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/CtrySubDvsn';
            var orgnlTxRefDbtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefDbtrCtrySubDvsnPath);
            
            if(isPatternPresent(Document4, "<Dbtr>")){
                if(orgnlTxRefDbtrPstlAdr){
                    if(orgnlTxRefDbtrAddrLine && (!orgnlTxRefDbtrCtry&& !orgnlTxRefDbtrTwnNm&& !orgnlTxRefDbtrDept&& !orgnlTxRefDbtrSubDept&& !orgnlTxRefDbtrStrtNm&& !orgnlTxRefDbtrBldgNb&& !orgnlTxRefDbtrBldgNm&& !orgnlTxRefDbtrFlr&& !orgnlTxRefDbtrPstBx&& !orgnlTxRefDbtrRoom&& !orgnlTxRefDbtrPstCd&& !orgnlTxRefDbtrTwnLctnNm&& !orgnlTxRefDbtrDstrctNm&& !orgnlTxRefDbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Dbtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/PstlAdr/AdrLine['+i+']';
                                var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);
                                var adrLineLength = orgnlTxRefDbtrAddrLine.length;

                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("1997", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }
            
        } else if(orgnlMsgNmId == 'pacs.009.001.08'){
            // OrgnlTxRef Creditor/Agt
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");

            var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);

            var orgnlTxRefCdtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var orgnlTxRefCdtrTwnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnNmPath);

            var orgnlTxRefCdtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
            var orgnlTxRefCdtrCtry = getValueFromPath(Document, orgnlTxRefCdtrCtryPath);

            var orgnlTxRefCdtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Dept';
            var orgnlTxRefCdtrDept = getValueFromPath(Document, orgnlTxRefCdtrDeptPath);

            var orgnlTxRefCdtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/SubDept';
            var orgnlTxRefCdtrSubDept = getValueFromPath(Document, orgnlTxRefCdtrSubDeptPath);

            var orgnlTxRefCdtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var orgnlTxRefCdtrStrtNm = getValueFromPath(Document, orgnlTxRefCdtrStrtNmPath);

            var orgnlTxRefCdtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var orgnlTxRefCdtrBldgNb = getValueFromPath(Document, orgnlTxRefCdtrBldgNbPath);

            var orgnlTxRefCdtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var orgnlTxRefCdtrBldgNm = getValueFromPath(Document, orgnlTxRefCdtrBldgNmPath);

            var orgnlTxRefCdtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Flr';
            var orgnlTxRefCdtrFlr = getValueFromPath(Document, orgnlTxRefCdtrFlrPath);

            var orgnlTxRefCdtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/PstBx';
            var orgnlTxRefCdtrPstBx = getValueFromPath(Document, orgnlTxRefCdtrPstBxPath);

            var orgnlTxRefCdtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/Room';
            var orgnlTxRefCdtrRoom = getValueFromPath(Document, orgnlTxRefCdtrRoomPath);

            var orgnlTxRefCdtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/PstCd';
            var orgnlTxRefCdtrPstCd = getValueFromPath(Document, orgnlTxRefCdtrPstCdPath);

            var orgnlTxRefCdtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var orgnlTxRefCdtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefCdtrTwnLctnNmPath);

            var orgnlTxRefCdtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var orgnlTxRefCdtrDstrctNm = getValueFromPath(Document, orgnlTxRefCdtrDstrctNmPath);

            var orgnlTxRefCdtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var orgnlTxRefCdtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefCdtrCtrySubDvsnPath);
            
            if(isPatternPresent(Document4, "<Cdtr>")){
                if(orgnlTxRefCdtrPstlAdr){
                    if(orgnlTxRefCdtrAddrLine && (!orgnlTxRefCdtrCtry&& !orgnlTxRefCdtrTwnNm&& !orgnlTxRefCdtrDept&& !orgnlTxRefCdtrSubDept&& !orgnlTxRefCdtrStrtNm&& !orgnlTxRefCdtrBldgNb&& !orgnlTxRefCdtrBldgNm&& !orgnlTxRefCdtrFlr&& !orgnlTxRefCdtrPstBx&& !orgnlTxRefCdtrRoom&& !orgnlTxRefCdtrPstCd&& !orgnlTxRefCdtrTwnLctnNm && !orgnlTxRefCdtrDstrctNm&& !orgnlTxRefCdtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Cdtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var orgnlTxRefCdtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine['+i+']';
                                var orgnlTxRefCdtrAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAddrLinePath);
                                var adrLineLength = orgnlTxRefCdtrAddrLine.length;

                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("2194", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }
            
            // OrgnlTxRef Debtor/Agt
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");

            var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
            var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);

            var orgnlTxRefDbtrTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
            var orgnlTxRefDbtrTwnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnNmPath);

            var orgnlTxRefDbtrCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
            var orgnlTxRefDbtrCtry = getValueFromPath(Document, orgnlTxRefDbtrCtryPath);

            var orgnlTxRefDbtrDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Dept';
            var orgnlTxRefDbtrDept = getValueFromPath(Document, orgnlTxRefDbtrDeptPath);

            var orgnlTxRefDbtrSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/SubDept';
            var orgnlTxRefDbtrSubDept = getValueFromPath(Document, orgnlTxRefDbtrSubDeptPath);

            var orgnlTxRefDbtrStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/StrtNm';
            var orgnlTxRefDbtrStrtNm = getValueFromPath(Document, orgnlTxRefDbtrStrtNmPath);

            var orgnlTxRefDbtrBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/BldgNb';
            var orgnlTxRefDbtrBldgNb = getValueFromPath(Document, orgnlTxRefDbtrBldgNbPath);

            var orgnlTxRefDbtrBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/BldgNm';
            var orgnlTxRefDbtrBldgNm = getValueFromPath(Document, orgnlTxRefDbtrBldgNmPath);

            var orgnlTxRefDbtrFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Flr';
            var orgnlTxRefDbtrFlr = getValueFromPath(Document, orgnlTxRefDbtrFlrPath);

            var orgnlTxRefDbtrPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/PstBx';
            var orgnlTxRefDbtrPstBx = getValueFromPath(Document, orgnlTxRefDbtrPstBxPath);

            var orgnlTxRefDbtrRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/Room';
            var orgnlTxRefDbtrRoom = getValueFromPath(Document, orgnlTxRefDbtrRoomPath);

            var orgnlTxRefDbtrPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/PstCd';
            var orgnlTxRefDbtrPstCd = getValueFromPath(Document, orgnlTxRefDbtrPstCdPath);

            var orgnlTxRefDbtrTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
            var orgnlTxRefDbtrTwnLctnNm = getValueFromPath(Document, orgnlTxRefDbtrTwnLctnNmPath);

            var orgnlTxRefDbtrDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/DstrctNm';
            var orgnlTxRefDbtrDstrctNm = getValueFromPath(Document, orgnlTxRefDbtrDstrctNmPath);

            var orgnlTxRefDbtrCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
            var orgnlTxRefDbtrCtrySubDvsn = getValueFromPath(Document, orgnlTxRefDbtrCtrySubDvsnPath);
            
            if(isPatternPresent(Document4, "<Dbtr>")){
                if(orgnlTxRefDbtrPstlAdr){
                    if(orgnlTxRefDbtrAddrLine && (!orgnlTxRefDbtrCtry&& !orgnlTxRefDbtrTwnNm&& !orgnlTxRefDbtrDept&& !orgnlTxRefDbtrSubDept&& !orgnlTxRefDbtrStrtNm&& !orgnlTxRefDbtrBldgNb&& !orgnlTxRefDbtrBldgNm&& !orgnlTxRefDbtrFlr&& !orgnlTxRefDbtrPstBx&& !orgnlTxRefDbtrRoom&& !orgnlTxRefDbtrPstCd&& !orgnlTxRefDbtrTwnLctnNm&& !orgnlTxRefDbtrDstrctNm&& !orgnlTxRefDbtrCtrySubDvsn)){
                        var count = countXmlNodes2(Document, "OrgnlTxRef", "Dbtr", "AdrLine");

                        if(count > 0) {
                            for(i=1; i<=count; i++) {
                                var orgnlTxRefDbtrAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine['+i+']';
                                var orgnlTxRefDbtrAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAddrLinePath);
                                var adrLineLength = orgnlTxRefDbtrAddrLine.length;

                                if(adrLineLength > 35 || count > 3) {
                                    setHeader(map, "PLCN_validMessage", false);
                                    logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                    retVal = setCommentsForTransaction("1997", "7527", map);
                                    return retVal;							
                                }
                            }
                        }
                    }
                }
            }   
        }
        
        // OrgnlTxRef Creditor Agent
        var orgnlTxRefCdtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "CdtrAgt", "<PstlAdr>");

        var orgnlTxRefCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
        var orgnlTxRefCdtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAgtAddrLinePath);

        var orgnlTxRefCdtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
        var orgnlTxRefCdtrAgtTwnNm = getValueFromPath(Document, orgnlTxRefCdtrAgtTwnNmPath);

        var orgnlTxRefCdtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Ctry';
        var orgnlTxRefCdtrAgtCtry = getValueFromPath(Document, orgnlTxRefCdtrAgtCtryPath);

        var orgnlTxRefCdtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Dept';
        var orgnlTxRefCdtrAgtDept = getValueFromPath(Document, orgnlTxRefCdtrAgtDeptPath);

        var orgnlTxRefCdtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/SubDept';
        var orgnlTxRefCdtrAgtSubDept = getValueFromPath(Document, orgnlTxRefCdtrAgtSubDeptPath);

        var orgnlTxRefCdtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
        var orgnlTxRefCdtrAgtStrtNm = getValueFromPath(Document, orgnlTxRefCdtrAgtStrtNmPath);

        var orgnlTxRefCdtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
        var orgnlTxRefCdtrAgtBldgNb = getValueFromPath(Document, orgnlTxRefCdtrAgtBldgNbPath);

        var orgnlTxRefCdtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/BldgNm';
        var orgnlTxRefCdtrAgtBldgNm = getValueFromPath(Document, orgnlTxRefCdtrAgtBldgNmPath);

        var orgnlTxRefCdtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Flr';
        var orgnlTxRefCdtrAgtFlr = getValueFromPath(Document, orgnlTxRefCdtrAgtFlrPath);

        var orgnlTxRefCdtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/PstBx';
        var orgnlTxRefCdtrAgtPstBx = getValueFromPath(Document, orgnlTxRefCdtrAgtPstBxPath);

        var orgnlTxRefCdtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/Room';
        var orgnlTxRefCdtrAgtRoom = getValueFromPath(Document, orgnlTxRefCdtrAgtRoomPath);

        var orgnlTxRefCdtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/PstCd';
        var orgnlTxRefCdtrAgtPstCd = getValueFromPath(Document, orgnlTxRefCdtrAgtPstCdPath);

        var orgnlTxRefCdtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var orgnlTxRefCdtrAgtTwnLctnNm = getValueFromPath(Document, orgnlTxRefCdtrAgtTwnLctnNmPath);

        var orgnlTxRefCdtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var orgnlTxRefCdtrAgtDstrctNm = getValueFromPath(Document, orgnlTxRefCdtrAgtDstrctNmPath);

        var orgnlTxRefCdtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var orgnlTxRefCdtrAgtCtrySubDvsn = getValueFromPath(Document, orgnlTxRefCdtrAgtCtrySubDvsnPath);
        
        if(isPatternPresent(Document4, "<CdtrAgt>")){
            if(orgnlTxRefCdtrAgtPstlAdr){
                if(orgnlTxRefCdtrAgtAddrLine && (!orgnlTxRefCdtrAgtCtry&& !orgnlTxRefCdtrAgtTwnNm&& !orgnlTxRefCdtrAgtDept&& !orgnlTxRefCdtrAgtSubDept&& !orgnlTxRefCdtrAgtStrtNm&& !orgnlTxRefCdtrAgtBldgNb&& !orgnlTxRefCdtrAgtBldgNm&& !orgnlTxRefCdtrAgtFlr&& !orgnlTxRefCdtrAgtPstBx&& !orgnlTxRefCdtrAgtRoom&& !orgnlTxRefCdtrAgtPstCd&& !orgnlTxRefCdtrAgtTwnLctnNm && !orgnlTxRefCdtrAgtDstrctNm&& !orgnlTxRefCdtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "OrgnlTxRef", "CdtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var orgnlTxRefCdtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var orgnlTxRefCdtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefCdtrAgtAddrLinePath);
                            var adrLineLength = orgnlTxRefCdtrAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("2142", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
        // OrgnlTxRef Debtor Agent
        var orgnlTxRefDbtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "DbtrAgt", "<PstlAdr>");

        var orgnlTxRefDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
        var orgnlTxRefDbtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAgtAddrLinePath);

        var orgnlTxRefDbtrAgtTwnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
        var orgnlTxRefDbtrAgtTwnNm = getValueFromPath(Document, orgnlTxRefDbtrAgtTwnNmPath);

        var orgnlTxRefDbtrAgtCtryPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Ctry';
        var orgnlTxRefDbtrAgtCtry = getValueFromPath(Document, orgnlTxRefDbtrAgtCtryPath);

        var orgnlTxRefDbtrAgtDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Dept';
        var orgnlTxRefDbtrAgtDept = getValueFromPath(Document, orgnlTxRefDbtrAgtDeptPath);

        var orgnlTxRefDbtrAgtSubDeptPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/SubDept';
        var orgnlTxRefDbtrAgtSubDept = getValueFromPath(Document, orgnlTxRefDbtrAgtSubDeptPath);

        var orgnlTxRefDbtrAgtStrtNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
        var orgnlTxRefDbtrAgtStrtNm = getValueFromPath(Document, orgnlTxRefDbtrAgtStrtNmPath);

        var orgnlTxRefDbtrAgtBldgNbPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
        var orgnlTxRefDbtrAgtBldgNb = getValueFromPath(Document, orgnlTxRefDbtrAgtBldgNbPath);

        var orgnlTxRefDbtrAgtBldgNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/BldgNm';
        var orgnlTxRefDbtrAgtBldgNm = getValueFromPath(Document, orgnlTxRefDbtrAgtBldgNmPath);

        var orgnlTxRefDbtrAgtFlrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Flr';
        var orgnlTxRefDbtrAgtFlr = getValueFromPath(Document, orgnlTxRefDbtrAgtFlrPath);

        var orgnlTxRefDbtrAgtPstBxPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/PstBx';
        var orgnlTxRefDbtrAgtPstBx = getValueFromPath(Document, orgnlTxRefDbtrAgtPstBxPath);

        var orgnlTxRefDbtrAgtRoomPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/Room';
        var orgnlTxRefDbtrAgtRoom = getValueFromPath(Document, orgnlTxRefDbtrAgtRoomPath);

        var orgnlTxRefDbtrAgtPstCdPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/PstCd';
        var orgnlTxRefDbtrAgtPstCd = getValueFromPath(Document, orgnlTxRefDbtrAgtPstCdPath);

        var orgnlTxRefDbtrAgtTwnLctnNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
        var orgnlTxRefDbtrAgtTwnLctnNm = getValueFromPath(Document, orgnlTxRefDbtrAgtTwnLctnNmPath);

        var orgnlTxRefDbtrAgtDstrctNmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
        var orgnlTxRefDbtrAgtDstrctNm = getValueFromPath(Document, orgnlTxRefDbtrAgtDstrctNmPath);

        var orgnlTxRefDbtrAgtCtrySubDvsnPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
        var orgnlTxRefDbtrAgtCtrySubDvsn = getValueFromPath(Document, orgnlTxRefDbtrAgtCtrySubDvsnPath);
        
        if(isPatternPresent(Document4, "<DbtrAgt>")){
            if(orgnlTxRefDbtrAgtPstlAdr){
                if(orgnlTxRefDbtrAgtAddrLine && (!orgnlTxRefDbtrAgtCtry&& !orgnlTxRefDbtrAgtTwnNm&& !orgnlTxRefDbtrAgtDept&& !orgnlTxRefDbtrAgtSubDept&& !orgnlTxRefDbtrAgtStrtNm&& !orgnlTxRefDbtrAgtBldgNb&& !orgnlTxRefDbtrAgtBldgNm&& !orgnlTxRefDbtrAgtFlr&& !orgnlTxRefDbtrAgtPstBx&& !orgnlTxRefDbtrAgtRoom&& !orgnlTxRefDbtrAgtPstCd&& !orgnlTxRefDbtrAgtTwnLctnNm&& !orgnlTxRefDbtrAgtDstrctNm&& !orgnlTxRefDbtrAgtCtrySubDvsn)){
                    var count = countXmlNodes2(Document, "OrgnlTxRef", "DbtrAgt", "AdrLine");

                    if(count > 0) {
                        for(i=1; i<=count; i++) {
                            var orgnlTxRefDbtrAgtAddrLinePath = '/Document/PmtRtr/TxInf/OrgnlTxRef/DbtrAgt/FinInstnId/PstlAdr/AdrLine['+i+']';
                            var orgnlTxRefDbtrAgtAddrLine = getValueFromPath(Document, orgnlTxRefDbtrAgtAddrLinePath);
                            var adrLineLength = orgnlTxRefDbtrAgtAddrLine.length;

                            if(adrLineLength > 35 || count > 3) {
                                setHeader(map, "PLCN_validMessage", false);
                                logger.info("gracePeriodUnstructuredFormalRuleChipsPacs4: If Postal Address is present and if no other element than Address Line is present then every occurrence of Address Line must not exceed 35 characters and a maximum of three occurrences of Address Line are allowed.");
                                retVal = setCommentsForTransaction("2094", "7527", map);
                                return retVal;							
                            }
                        }
                    }
                }
            }
        }
        
    }
    
	return retVal;
}

function agentNamePstlAdrRuleChipsPacs004(exchange){
	logger.info("In agentNamePstlAdrRuleChipsPacs004");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	orgnlMsgNmIdPath = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
	orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
	logger.trace("orgnlMsgNmId = " + orgnlMsgNmId);
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        var Document2 = dataBetweenTokens("<RtrChain>", "</RtrChain>", Document1);
        Document2 = "<RtrChain>".concat(Document2).concat("</RtrChain>");
    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        var Document4 = dataBetweenTokens("<OrgnlTxRef>", "</OrgnlTxRef>", Document1);
        Document4 = "<OrgnlTxRef>".concat(Document4).concat("</OrgnlTxRef>");
        logger.info("Document4 = " + Document4);

        if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
            var Document3 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
            Document3 = "<UndrlygCstmrCdtTrf>".concat(Document3).concat("</UndrlygCstmrCdtTrf>");
            logger.info("Document3 = " + Document3);
            Document4 = removePattern(Document4, Document3);
            logger.info("Document4 without undrlyg = " + Document4);
        }
    
    }
    
	//ChargesInformation
	var chrgsInfPstlAdr =  isXmlNodePresent(Document, "TxInf", "ChrgsInf", "<PstlAdr>");
	var chrgsInfNm =  isXmlNodePresent(Document, "TxInf", "ChrgsInf", "<Nm>");
    
	if(isPatternPresent(Document1, "<ChrgsInf>")){
		if((chrgsInfPstlAdr && !chrgsInfNm) || (!chrgsInfPstlAdr && chrgsInfNm)){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("Name and postal address must be always be present together.");
            retVal = setCommentsForTransaction("198", "7948", map);
            return retVal;							
        }
    }
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        
        // Creditor Agent
        var cdtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "CdtrAgt", "<PstlAdr>");
        var cdtrAgtNm = isXmlNodePresent(Document, "RtrChain", "CdtrAgt", "<Nm>");

        if(isPatternPresent(Document2, "<CdtrAgt>")){
            if((cdtrAgtPstlAdr && !cdtrAgtNm) || (!cdtrAgtPstlAdr && cdtrAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("625", "7948", map);
                return retVal;							
            }
        }
        
        // Debtor Agent
        var dbtrAgtPstlAdr = isXmlNodePresent(Document, "RtrChain", "DbtrAgt", "<PstlAdr>");
        var dbtrAgtNm = isXmlNodePresent(Document, "RtrChain", "DbtrAgt", "<Nm>");
        
        if(isPatternPresent(Document2, "<DbtrAgt>")){
            if((dbtrAgtPstlAdr && !dbtrAgtNm) || (!dbtrAgtPstlAdr && dbtrAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("422", "7948", map);
                return retVal;							
            }
        }
        
        // Creditor
        var cdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<PstlAdr>");
        var cdtrNm = isXmlNodePresent(Document, "RtrChain", "Cdtr", "<Nm>");

        if(isPatternPresent(Document2, "<Cdtr>")){
            if((cdtrPstlAdr && !cdtrNm) || (!cdtrPstlAdr && cdtrNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("658", "7948", map);
                return retVal;							
            }
        }
        
        // Debtor
        var dbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<PstlAdr>");
        var dbtrNm = isXmlNodePresent(Document, "RtrChain", "Dbtr", "<Nm>");
        
        if(isPatternPresent(Document2, "<Dbtr>")){
            if((dbtrPstlAdr && !dbtrNm) || (!dbtrPstlAdr && dbtrNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("304", "7948", map);
                return retVal;							
            }
        }
        
        // Previous Instructing Agent1
        var prvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt1", "<PstlAdr>");
        var prvsInstgAgt1Nm = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt1", "<Nm>");
        
        if(isPatternPresent(Document2, "<PrvsInstgAgt1>")){
            if((prvsInstgAgt1PstlAdr && !prvsInstgAgt1Nm) || (!prvsInstgAgt1PstlAdr && prvsInstgAgt1Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("451", "7948", map);
                return retVal;							
            }
        }
        
        // Previous Instructing Agent2
        var prvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt2", "<PstlAdr>");
        var prvsInstgAgt2Nm = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt2", "<Nm>");
        
        if(isPatternPresent(Document2, "<PrvsInstgAgt2>")){
            if((prvsInstgAgt2PstlAdr && !prvsInstgAgt2Nm) || (!prvsInstgAgt2PstlAdr && prvsInstgAgt2Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("480", "7948", map);
                return retVal;							
            }
        }
        
        // Previous Instructing Agent3
        var prvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt3", "<PstlAdr>");
        var prvsInstgAgt3Nm = isXmlNodePresent(Document, "RtrChain", "PrvsInstgAgt3", "<Nm>");
        
        if(isPatternPresent(Document2, "<PrvsInstgAgt3>")){
            if((prvsInstgAgt3PstlAdr && !prvsInstgAgt3Nm) || (!prvsInstgAgt3PstlAdr && prvsInstgAgt3Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("509", "7948", map);
                return retVal;							
            }
        }
    
        // Intermediary Agent1
        var intrmyAgt1PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt1", "<PstlAdr>");
        var intrmyAgt1Nm = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt1", "<Nm>");
        
        if(isPatternPresent(Document2, "<IntrmyAgt1>")){
            if((intrmyAgt1PstlAdr && !intrmyAgt1Nm) || (!intrmyAgt1PstlAdr && intrmyAgt1Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("538", "7948", map);
                return retVal;							
            }
        }
        
        // Intermediary Agent2
        var intrmyAgt2PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt2", "<PstlAdr>");
        var intrmyAgt2Nm = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt2", "<Nm>");
        
        if(isPatternPresent(Document2, "<IntrmyAgt2>")){
            if((intrmyAgt2PstlAdr && !intrmyAgt2Nm) || (!intrmyAgt2PstlAdr && intrmyAgt2Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("567", "7948", map);
                return retVal;							
            }
        }

        // Intermediary Agent3
        var intrmyAgt3PstlAdr = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt3", "<PstlAdr>");
        var intrmyAgt3Nm = isXmlNodePresent(Document, "RtrChain", "IntrmyAgt3", "<Nm>");
        
        if(isPatternPresent(Document2, "<IntrmyAgt3>")){
            if((intrmyAgt3PstlAdr && !intrmyAgt3Nm) || (!intrmyAgt3PstlAdr && intrmyAgt3Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("596", "7948", map);
                return retVal;							
            }
        }
    }

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        
        //Underlying Creditor Agent
        var undrlygCdtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "CdtrAgt", "<PstlAdr>");
        var undrlygCdtrAgtNm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "CdtrAgt", "<Nm>");
        
        if(isPatternPresent(Document3, "<CdtrAgt>")){
            if((undrlygCdtrAgtPstlAdr && !undrlygCdtrAgtNm) || (!undrlygCdtrAgtPstlAdr && undrlygCdtrAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        // Underlying Debtor Agent
        var undrlygDbtrAgtPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "DbtrAgt", "<PstlAdr>");
        var undrlygDbtrAgtNm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "DbtrAgt", "<Nm>");
        
        if(isPatternPresent(Document3, "<DbtrAgt>")){
            if((undrlygDbtrAgtPstlAdr && !undrlygDbtrAgtNm) || (!undrlygDbtrAgtPstlAdr && undrlygDbtrAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        //Underlying Creditor
        var undrlygCdtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Cdtr", "<PstlAdr>");
        var undrlygCdtrNm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Cdtr", "<Nm>");
        
        if(isPatternPresent(Document3, "<Cdtr>")){
            if((undrlygCdtrPstlAdr && !undrlygCdtrNm) || (!undrlygCdtrPstlAdr && undrlygCdtrNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        // Underlying Debtor
        var undrlygDbtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Dbtr", "<PstlAdr>");
        var undrlygDbtrNm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "Dbtr", "<Nm>");
        
        if(isPatternPresent(Document3, "<Dbtr>")){
            if((undrlygDbtrPstlAdr && !undrlygDbtrNm) || (!undrlygDbtrPstlAdr && undrlygDbtrNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        
        // Underlying Previous Instructing Agent1
        var undrlygPrvsInstgAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<PstlAdr>");
        var undrlygPrvsInstgAgt1Nm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt1", "<Nm>");
        
        if(isPatternPresent(Document3, "<PrvsInstgAgt1>")){
            if((undrlygPrvsInstgAgt1PstlAdr && !undrlygPrvsInstgAgt1Nm) || (!undrlygPrvsInstgAgt1PstlAdr && undrlygPrvsInstgAgt1Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        // Underlying Previous Instructing Agent2
        var undrlygPrvsInstgAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<PstlAdr>");
        var undrlygPrvsInstgAgt2Nm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt2", "<Nm>");
        
        if(isPatternPresent(Document3, "<PrvsInstgAgt2>")){
            if((undrlygPrvsInstgAgt2PstlAdr && !undrlygPrvsInstgAgt2Nm) || (!undrlygPrvsInstgAgt2PstlAdr && undrlygPrvsInstgAgt2Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        // Underlying Previous Instructing Agent3
        var undrlygPrvsInstgAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<PstlAdr>");
        var undrlygPrvsInstgAgt3Nm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "PrvsInstgAgt3", "<Nm>");
        
        if(isPatternPresent(Document3, "<PrvsInstgAgt3>")){
            if((undrlygPrvsInstgAgt3PstlAdr && !undrlygPrvsInstgAgt3Nm) || (!undrlygPrvsInstgAgt3PstlAdr && undrlygPrvsInstgAgt3Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        // Underlying Intermediary Agent1
        var undrlygIntrmyAgt1PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<PstlAdr>");
        var undrlygIntrmyAgt1Nm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt1", "<Nm>");

        if(isPatternPresent(Document3, "<IntrmyAgt1>")){
            if((undrlygIntrmyAgt1PstlAdr && !undrlygIntrmyAgt1Nm) || (!undrlygIntrmyAgt1PstlAdr && undrlygIntrmyAgt1Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        // Underlying Intermediary Agent2
        var undrlygIntrmyAgt2PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<PstlAdr>");
        var undrlygIntrmyAgt2Nm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt2", "<Nm>");

        if(isPatternPresent(Document3, "<IntrmyAgt2>")){
            if((undrlygIntrmyAgt2PstlAdr && !undrlygIntrmyAgt2Nm) || (!undrlygIntrmyAgt2PstlAdr && undrlygIntrmyAgt2Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }
        
        // Underlying Intermediary Agent3
        var undrlygIntrmyAgt3PstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<PstlAdr>");
        var undrlygIntrmyAgt3Nm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "IntrmyAgt3", "<Nm>");

        if(isPatternPresent(Document3, "<IntrmyAgt3>")){
            if((undrlygIntrmyAgt3PstlAdr && !undrlygIntrmyAgt3Nm) || (!undrlygIntrmyAgt3PstlAdr && undrlygIntrmyAgt3Nm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("825", "7948", map);
                return retVal;							
            }
        }

    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        // OrgnlTxRef SttlmInf InstgRmbrsmntAgt
        var instgRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstgRmbrsmntAgt", "<PstlAdr>");
        var instgRmbrsmntAgtNm = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstgRmbrsmntAgt", "<Nm>");

        if(isPatternPresent(Document4, "<InstgRmbrsmntAgt>")){
            if((instgRmbrsmntAgtPstlAdr && !instgRmbrsmntAgtNm) || (!instgRmbrsmntAgtPstlAdr && instgRmbrsmntAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("944", "7948", map);
                return retVal;							
            }
        }
        
        // OrgnlTxRef SttlmInf InstdRmbrsmntAgt
        var instdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstdRmbrsmntAgt", "<PstlAdr>");
        var instdRmbrsmntAgtNm = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "InstdRmbrsmntAgt", "<Nm>");

        if(isPatternPresent(Document4, "<InstdRmbrsmntAgt>")){
            if((instdRmbrsmntAgtPstlAdr && !instdRmbrsmntAgtNm) || (!instdRmbrsmntAgtPstlAdr && instdRmbrsmntAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("992", "7948", map);
                return retVal;							
            }
        }
        
        // OrgnlTxRef SttlmInf ThrdRmbrsmntAgt
        var thrdRmbrsmntAgtPstlAdr = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "ThrdRmbrsmntAgt", "<PstlAdr>");
        var thrdRmbrsmntAgtNm = isXmlNodePresent3(Document, "OrgnlTxRef", "SttlmInf", "ThrdRmbrsmntAgt", "<Nm>");

        if(isPatternPresent(Document4, "<ThrdRmbrsmntAgt>")){
            if((thrdRmbrsmntAgtPstlAdr && !thrdRmbrsmntAgtNm) || (!thrdRmbrsmntAgtPstlAdr && thrdRmbrsmntAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("Name and postal address must be always be present together.");
                retVal = setCommentsForTransaction("1040", "7948", map);
                return retVal;							
            }
        }
        
        // OrgnlTxRef Debtor Agent
        var orgnlTxRefDbtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "DbtrAgt", "<PstlAdr>");
        var orgnlTxRefDbtrAgtNm = isXmlNodePresent(Document, "OrgnlTxRef", "DbtrAgt", "<Nm>");

        if(isPatternPresent(Document4, "<DbtrAgt>")){
            if((orgnlTxRefDbtrAgtPstlAdr && !orgnlTxRefDbtrAgtNm) || (!orgnlTxRefDbtrAgtPstlAdr && orgnlTxRefDbtrAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("2094", "7948", map);
                return retVal;							
            }
        }
        
        // OrgnlTxRef Creditor Agent
        var orgnlTxRefCdtrAgtPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "CdtrAgt", "<PstlAdr>");
        var orgnlTxRefCdtrAgtNm = isXmlNodePresent(Document, "OrgnlTxRef", "CdtrAgt", "<Nm>");

        if(isPatternPresent(Document4, "<CdtrAgt>")){
            if((orgnlTxRefCdtrAgtPstlAdr && !orgnlTxRefCdtrAgtNm) || (!orgnlTxRefCdtrAgtPstlAdr && orgnlTxRefCdtrAgtNm)){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("2142", "7948", map);
                return retVal;							
            }
        }
        
        if(orgnlMsgNmId == 'pacs.009.001.08'){
            // OrgnlTxRef Debtor/Agt
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");
            var orgnlTxRefDbtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<Nm>");

            if(isPatternPresent(Document4, "<Dbtr>")){
                if((orgnlTxRefDbtrPstlAdr && !orgnlTxRefDbtrNm) || (!orgnlTxRefDbtrPstlAdr && orgnlTxRefDbtrNm)){
                    setHeader(map, "PLCN_validMessage", false);
                    logger.info("If postal address is provided then name must be present.");
                    retVal = setCommentsForTransaction("1997", "7948", map);
                    return retVal;							
                }
            }
            
            // OrgnlTxRef Creditor/Agt
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");
            var orgnlTxRefCdtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<Nm>");

            if(isPatternPresent(Document4, "<Cdtr>")){
                if((orgnlTxRefCdtrPstlAdr && !orgnlTxRefCdtrNm) || (!orgnlTxRefCdtrPstlAdr && orgnlTxRefCdtrNm)){
                    setHeader(map, "PLCN_validMessage", false);
                    logger.info("If postal address is provided then name must be present.");
                    retVal = setCommentsForTransaction("2194", "7948", map);
                    return retVal;							
                }
            }
        }
        
    }
    
    return retVal;

}

function partyNamePstlAdrRuleChipsPacs004(exchange){
	logger.info("In agentNamePstlAdrRuleChipsPacs004");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        var Document2 = dataBetweenTokens("<RtrChain>", "</RtrChain>", Document1);
        Document2 = "<RtrChain>".concat(Document2).concat("</RtrChain>");
    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        var Document4 = dataBetweenTokens("<OrgnlTxRef>", "</OrgnlTxRef>", Document1);
        Document4 = "<OrgnlTxRef>".concat(Document4).concat("</OrgnlTxRef>");
        logger.info("Document4 = " + Document4);

        if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
            var Document3 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
            Document3 = "<UndrlygCstmrCdtTrf>".concat(Document3).concat("</UndrlygCstmrCdtTrf>");
            logger.info("Document3 = " + Document3);
            Document4 = removePattern(Document4, Document3);
            logger.info("Document4 without undrlyg = " + Document4);
        }
    
    }
    
	//Originator
	var orgtrPstlAdr =  isXmlNodePresent(Document, "TxInf", "RtrRsnInf", "<PstlAdr>");
	var orgtrInfNm =  isXmlNodePresent(Document, "TxInf", "RtrRsnInf", "<Nm>");
    
	if(isPatternPresent(Document1, "<RtrRsnInf>")){
		if(orgtrPstlAdr && !orgtrInfNm){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If postal address is provided then name must be present.");
            retVal = setCommentsForTransaction("778", "7950", map);
            return retVal;							
        }
    }
    
    if(isPatternPresent(Document1, "<RtrChain>")){
        
        // Ultimate Debtor
        var ultmtDbtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "UltmtDbtr", "<PstlAdr>");
        var ultmtDbtrAgtNm = isXmlNodePresent(Document, "RtrChain", "UltmtDbtr", "<Nm>");

        if(isPatternPresent(Document2, "<UltmtDbtr>")){
            if(ultmtDbtrPstlAdr && !ultmtDbtrAgtNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("258", "7950", map);
                return retVal;							
            }
        }
        
        // Ultimate Creditor
        var ultmtCdtrPstlAdr = isXmlNodePresent(Document, "RtrChain", "UltmtCdtr", "<PstlAdr>");
        var ultmtCdtrAgtNm = isXmlNodePresent(Document, "RtrChain", "UltmtCdtr", "<Nm>");

        if(isPatternPresent(Document2, "<UltmtCdtr>")){
            if(ultmtCdtrPstlAdr && !ultmtCdtrAgtNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("731", "7950", map);
                return retVal;							
            }
        }
        
        // Initating Party
        var initgPtyPstlAdr = isXmlNodePresent(Document, "RtrChain", "InitgPty", "<PstlAdr>");
        var initgPtyAgtNm = isXmlNodePresent(Document, "RtrChain", "InitgPty", "<Nm>");

        if(isPatternPresent(Document2, "<InitgPty>")){
            if(initgPtyPstlAdr && !initgPtyAgtNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("377", "7950", map);
                return retVal;							
            }
        }
        
        
    }

    if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
        // Underlying Ultimate Debtor
        var undrlygUltmtDbtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "UltmtDbtr", "<PstlAdr>");
        var undrlygUltmtDbtrAgtNm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "UltmtDbtr", "<Nm>");

        if(isPatternPresent(Document3, "<UltmtDbtr>")){
            if(undrlygUltmtDbtrPstlAdr && !undrlygUltmtDbtrAgtNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("825", "7950", map);
                return retVal;							
            }
        }
        
        // Underlying Ultimate Creditor
        var undrlygUltmtCdtrPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "UltmtCdtr", "<PstlAdr>");
        var undrlygUltmtCdtrAgtNm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "UltmtCdtr", "<Nm>");

        if(isPatternPresent(Document3, "<UltmtCdtr>")){
            if(undrlygUltmtCdtrPstlAdr && !undrlygUltmtCdtrAgtNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("825", "7950", map);
                return retVal;							
            }
        }
        
        // Underlying Initating Party
        var undrlygInitgPtyPstlAdr = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "InitgPty", "<PstlAdr>");
        var undrlygInitgPtyAgtNm = isXmlNodePresent(Document, "UndrlygCstmrCdtTrf", "InitgPty", "<Nm>");

        if(isPatternPresent(Document3, "<InitgPty>")){
            if(undrlygInitgPtyPstlAdr && !undrlygInitgPtyAgtNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("825", "7950", map);
                return retVal;							
            }
        }
    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        // OrgnlTxRef Ultimate Debtor
        var orgnlTxRefUltmtDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "UltmtDbtr", "<PstlAdr>");
        var orgnlTxRefUltmtDbtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "UltmtDbtr", "<Nm>");

        if(isPatternPresent(Document4, "<UltmtDbtr>")){
            if(orgnlTxRefUltmtDbtrPstlAdr && !orgnlTxRefUltmtDbtrNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("1952", "7950", map);
                return retVal;							
            }
        }
        
        // OrgnlTxRef Ultimate Creditor
        var orgnlTxRefUltmtCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "UltmtCdtr", "<PstlAdr>");
        var orgnlTxRefUltmtCdtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "UltmtCdtr", "<Nm>");

        if(isPatternPresent(Document4, "<UltmtCdtr>")){
            if(orgnlTxRefUltmtCdtrPstlAdr && !orgnlTxRefUltmtCdtrNm){
                setHeader(map, "PLCN_validMessage", false);
                logger.info("If postal address is provided then name must be present.");
                retVal = setCommentsForTransaction("2291", "7950", map);
                return retVal;							
            }
        }
        
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            // OrgnlTxRef Debtor/Pty
            var orgnlTxRefDbtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<PstlAdr>");
            var orgnlTxRefDbtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<Nm>");

            if(isPatternPresent(Document4, "<Dbtr>")){
                if(orgnlTxRefDbtrPstlAdr && !orgnlTxRefDbtrNm){
                    setHeader(map, "PLCN_validMessage", false);
                    logger.info("If postal address is provided then name must be present.");
                    retVal = setCommentsForTransaction("1997", "7950", map);
                    return retVal;							
                }
            }
            
            // OrgnlTxRef Creditor/Pty
            var orgnlTxRefCdtrPstlAdr = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<PstlAdr>");
            var orgnlTxRefCdtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<Nm>");

            if(isPatternPresent(Document4, "<Cdtr>")){
                if(orgnlTxRefCdtrPstlAdr && !orgnlTxRefCdtrNm){
                    setHeader(map, "PLCN_validMessage", false);
                    logger.info("If postal address is provided then name must be present.");
                    retVal = setCommentsForTransaction("2194", "7950", map);
                    return retVal;
                }
            }
        }
        
    }
    
    return retVal;

}

function chrgBrChrgsInfMandatoryRuleChipsPacs008(exchange){
	logger.info("In chrgBrChrgsInfMandatoryRuleChipsPacs008");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    var Document1 = inMsg.getBody(java.lang.String.class);
    
    var chrgBrPath = '/Document/PmtRtr/TxInf/ChrgBr';
    var chrgBr = getValueFromPath(Document, chrgBrPath);
    
    if(isPatternPresent(Document1, "<ChrgBr>") && chrgBr == "CRED"){
		if(!isPatternPresent(Document1, "<ChrgsInf>")){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If ChrgBr contains CRED, then at least one occurrence of ChrgsInf must be present.");
            retVal = setCommentsForTransaction("193", "7909", map);
            return retVal;
        }
    }
    
    return retVal;
}

function validateReasonCodeChipsPacs004(exchange) {
	var reasonCodePath;
	var reasonCode;
    var addtlInfPath;
    var addtlInf;
	var message;
	var retVal = 0;

	logger.info("In validateReasonCodeChipsPacs004");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	reasonCodePath = "/Document/PmtRtr/TxInf/RtrRsnInf/Rsn/Cd";
	reasonCode = getValueFromPath(Document, reasonCodePath);

	addtlInfPath = "/Document/PmtRtr/TxInf/RtrRsnInf/AddtlInf";
	addtlInf = getValueFromPath(Document, addtlInfPath);
    
	if(reasonCode == "NARR" && !addtlInf){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If ReturnReasonInformation code is NARR then additional information is mandatory");
        retVal = setCommentsForTransaction("822", "7076", map); // new error code
        return retVal;   
	}

	return retVal;
}

function intrBkSttlmAmtOccurenceRuleChipsPacs004(exchange){
	logger.info("In intrBkSttlmAmtOccurenceRuleChipsPacs004");
    
	var orgnlTxRefAmtPath;
	var orgnlTxRefAmt;
    var txInfAmtPath;
    var txInfAmt;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	orgnlTxRefAmtPath = "/Document/PmtRtr/TxInf/OrgnlTxRef/IntrBkSttlmAmt";
	orgnlTxRefAmt = getValueFromPath(Document, orgnlTxRefAmtPath);
	logger.info("intrBkSttlmAmtOccurenceRuleChipsPacs004: orgnlTxRefAmt = " + orgnlTxRefAmt);

	txInfAmtPath = "/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt";
	txInfAmt = getValueFromPath(Document, txInfAmtPath);
	logger.info("intrBkSttlmAmtOccurenceRuleChipsPacs004: txInfAmt = " + txInfAmt);
    
	if(txInfAmt && orgnlTxRefAmt){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If OrgnlTxRef/IntrBkSttlmAmt is present then TxInf/OrgnlIntrBkSttlmAmt cannot be present");
        retVal = setCommentsForTransaction("826", "7077", map); // new error code
        return retVal;   
	}

	return retVal;
}

function orgnlTxRefSttlmInfCodeRuleChipsPacs004(exchange){
	logger.info("In orgnlTxRefSttlmInfCodeRuleChipsPacs004");

	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    var Document1 = inMsg.getBody(java.lang.String.class);

    var sttlmMtdPresent = isXmlNodePresent(Document, "TxInf", "OrgnlTxRef", "<SttlmInf>");
    logger.info("sttlmMtdPresent = " + sttlmMtdPresent);
    if(!sttlmMtdPresent){
        return retVal;
    }
    
	var sttlmMtdPath = "/Document/PmtRtr/TxInf/OrgnlTxRef/SttlmInf/SttlmMtd";
	var sttlmMtd = getValueFromPath(Document, sttlmMtdPath);
	logger.info("intrBkSttlmAmtOccurenceRuleChipsPacs004: sttlmMtd = " + sttlmMtd);
    
	var instgRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgt>");
    var instdRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgt>");
    var thrdRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgt>");
    var clrSys = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<ClrSys>");
    var sttlmAcct = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<SttlmAcct>");
    
	if( (sttlmMtd == "INDA" || sttlmMtd == "INGA") && (instgRmbrsmntAgt || instdRmbrsmntAgt || thrdRmbrsmntAgt || clrSys) ){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If SttlmntMtd is INDA,INGA then Reimbursement Agts and ClrgSys not allowed");
        retVal = setCommentsForTransaction("826", "7829", map);
        return retVal;   
	} else if( (sttlmMtd == "CLRG") && (instgRmbrsmntAgt || instdRmbrsmntAgt || thrdRmbrsmntAgt || sttlmAcct) ){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If SttlmntMtd is CLRG then Reimbursement Agts and SttlmntAcct not allowed");
        retVal = setCommentsForTransaction("826", "7832", map);
        return retVal;   
	} else if(sttlmMtd == "COVE"){
        if(!instgRmbrsmntAgt && !instdRmbrsmntAgt){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If SttlmntMtd is COVE then InstdRmbrsmntAgt or InstgRmbrsmntAgt is mandatory");
            retVal = setCommentsForTransaction("826", "7831", map);
            return retVal;
        }
        if(clrSys || sttlmAcct){
            setHeader(map, "PLCN_validMessage", false);
            logger.info("If SttlmntMtd is COVE then SttlmntAcct and ClrgSystem not allowed");
            retVal = setCommentsForTransaction("826", "7830", map);
            return retVal;
        }
	}
	return retVal;    
}

function orgnlTxRefRmbrsmntAgtRuleChipsPacs004(exchange){
	logger.info("In orgnlTxRefRmbrsmntAgtRuleChipsPacs004");

	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    var Document1 = inMsg.getBody(java.lang.String.class);

    var sttlmMtdPresent = isXmlNodePresent(Document, "TxInf", "OrgnlTxRef", "<SttlmInf>");
    logger.info("sttlmMtdPresent = " + sttlmMtdPresent);
    if(!sttlmMtdPresent){
        return retVal;
    }
    
	var instgRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgt>");
    var instdRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgt>");
    var thrdRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgt>");
    
    if(thrdRmbrsmntAgt && (!instgRmbrsmntAgt || !instdRmbrsmntAgt) ){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("ThrdRmbrsmntAgt is prsnt then InstgRmbmntAgt and InstdRmbmntAgt is mandtry");
        retVal = setCommentsForTransaction("1040", "7828", map);
        return retVal;
    }
    
	return retVal;
}

function orgnlTxRefRmbrsmntAgtAccountPresenceRuleChipsPacs004(exchange){
	logger.info("In orgnlTxRefRmbrsmntAgtAccountPresenceRuleChipsPacs004");

	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    var Document1 = inMsg.getBody(java.lang.String.class);

    var sttlmMtdPresent = isXmlNodePresent(Document, "TxInf", "OrgnlTxRef", "<SttlmInf>");
    logger.info("sttlmMtdPresent = " + sttlmMtdPresent);
    if(!sttlmMtdPresent){
        return retVal;
    }
    
	var instgRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgt>");
    var instdRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgt>");
    var thrdRmbrsmntAgt = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgt>");
	var instgRmbrsmntAgtAcct = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgtAcct>");
    var instdRmbrsmntAgtAcct = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgtAcct>");
    var thrdRmbrsmntAgtAcct = isXmlNodePresent(Document, "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgtAcct>");
    
    if(instgRmbrsmntAgtAcct && !instgRmbrsmntAgt ){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If InstgRmbrsmntAgtAcct is present then InstgRmbrsmntAgt is mandatory");
        retVal = setCommentsForTransaction("944", "7834", map);
        return retVal;
    }

    if(instdRmbrsmntAgtAcct && !instdRmbrsmntAgt ){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If InstdRmbrsmntAgtAcct is present then InstdRmbrsmntAgt is mandatory");
        retVal = setCommentsForTransaction("992", "7835", map);
        return retVal;
    }
    
    if(thrdRmbrsmntAgtAcct && !thrdRmbrsmntAgt ){
        setHeader(map, "PLCN_validMessage", false);
        logger.info("If ThrdRmbrsmntAgtAcct is present then ThrdRmbrsmntAgt is mandatory");
        retVal = setCommentsForTransaction("1040", "7833", map);
        return retVal;
    }
    
	return retVal;    
}

function partyNameAnyBICRuleChipsPacs004(exchange){
	logger.info("In agentNamePstlAdrRuleChipsPacs004");

	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        var Document4 = dataBetweenTokens("<OrgnlTxRef>", "</OrgnlTxRef>", Document1);
        Document4 = "<OrgnlTxRef>".concat(Document4).concat("</OrgnlTxRef>");
        logger.info("Document4 = " + Document4);

        if(isPatternPresent(Document1, "<UndrlygCstmrCdtTrf>")){
            var Document3 = dataBetweenTokens("<UndrlygCstmrCdtTrf>", "</UndrlygCstmrCdtTrf>", Document1);
            Document3 = "<UndrlygCstmrCdtTrf>".concat(Document3).concat("</UndrlygCstmrCdtTrf>");
            logger.info("Document3 = " + Document3);
            Document4 = removePattern(Document4, Document3);
            logger.info("Document4 without undrlyg = " + Document4);
        }
    }
    
    if(isPatternPresent(Document1, "<OrgnlTxRef>")){
        if(orgnlMsgNmId == 'pacs.008.001.08'){
            // OrgnlTxRef Debtor/Pty
            var orgnlTxRefDbtrAnyBIC = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<AnyBIC>");
            var orgnlTxRefDbtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<Nm>");

            if(isPatternPresent(Document4, "<Dbtr>")){
                if(!orgnlTxRefDbtrAnyBIC && !orgnlTxRefDbtrNm){
                    setHeader(map, "PLCN_validMessage", false);
                    logger.info("If AnyBIC is absent then Name is mandatory and it is recommended to also provide the Postal Address.");
                    retVal = setCommentsForTransaction("1997", "7949", map);
                    return retVal;							
                }
            }
            
            // OrgnlTxRef Creditor/Pty
            var orgnlTxRefCdtrAnyBIC = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<AnyBIC>");
            var orgnlTxRefCdtrNm = isXmlNodePresent(Document, "OrgnlTxRef", "Cdtr", "<Nm>");

            if(isPatternPresent(Document4, "<Cdtr>")){
                if(!orgnlTxRefCdtrAnyBIC && !orgnlTxRefCdtrNm){
                    setHeader(map, "PLCN_validMessage", false);
                    logger.info("If AnyBIC is absent then Name is mandatory and it is recommended to also provide the Postal Address.");
                    retVal = setCommentsForTransaction("2194", "7949", map);
                    return retVal;
                }
            }
        }
        
    }
    
    return retVal;

}