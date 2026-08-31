/* This function calls wrapperFedPacs009 Mx function. */

function msgValidationFedPacs009(exchange) {
	var result;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var orgDocument = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var documentString = inMsg.getBody(java.lang.String.class);

	logger.info("In msgValidationFedPacs009");
	logger.trace("msgValidationFedPacs009: documentString = " + documentString);

	setHeader(map, "PLCN_txnForceStopCounter", 0);
	setHeader(map, "PLCN_errorCountAdd", "Y"); //for testing
	logger.info("errorCountAdd: " + getHeader(map, "PLCN_errorCountAdd"));
	setHeader(map, "PLCN_validMessage", true);
	setHeader(map, "PLCN_validFlag", true);

	wrapperCbprPacs009Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	wrapperFedPacs009Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationFedPacs008: PLCN_validMessage = " + result);

	result = getHeader(map, "PLCN_validMessage");
	logger.info("In msgValidationFedPacs009: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "error");
		//setCommentsForTransaction("00", "8183", map);
	}

	inMsg.setBody(orgDocument);
}

function wrapperFedPacs009Mx(exchange) {
	var retVal = 0;
	var pacs09ValdFlag;
	var manualMode;
	var tenantName;

	logger.info('wrapperFedPacs009Mx:In wrapperFedPacs009Mx');
	
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	pacs09ValdFlag = memTblGetTableValue(map, "FLAG-TABLE", "PACS09_VALD_FLAG_MX");
	
	if(pacs09ValdFlag = "ERROR") 
	{
		retVal = fedValidationRulesPacs009(pacs09ValdFlag, exchange);

		if(retVal == 0) {
			logger.info("wrapperFedPacs009Mx: Calling externalCodelistValidation");
			//retVal = externalCodelistValidationCbprPacs009(Document, map);		
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.info("txnComments from externalCodelistValidation = " + txnComments);			
		}

	}

	if(pacs09ValdFlag = "WARNING") {
		retVal = fedValidationRulesPacs009(pacs09ValdFlag, exchange);
		//retVal = externalCodelistValidationCbprPacs009(Document, map);
	}
}

function fedValidationRulesPacs009(pacs09ValdFlag, exchange){
	logger.info("fedValidationRulesPacs009");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var MsgTypecheck;
	MsgTypecheck = getHeader(map, "PLCN_MsgType");
	logger.info("fedValidationRulesPacs009:MsgTypecheck = "+MsgTypecheck);
	retVal = 0;

	if(pacs09ValdFlag == "ERROR") 
	{
		if(MsgTypecheck && MsgTypecheck !=="LynxPacs009")
		{
			retVal = interbankSettlementCurrencyRulePacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
		}
		if(MsgTypecheck =="FedPacs009")
		{
			
			retVal = validateMaximumAmountRuleFedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateCoverPaymentRule1FedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateCoverPaymentRule2FedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateMaximumAmountRuleFedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateFITransparencyRuleFedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			
			retVal = validatePostalAddressRule1FedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePostalAddressRule2FedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePostalAddressRule3FedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePersonTransparency_IRSRuleFedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateRemittanceInformationRule1FedPacs009(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
		}
	}
	return retVal;
}

function validateMaximumAmountRuleFedPacs009(Document, map) {  //R3
	logger.info("In validateMaximumAmountRuleFedPacs009");
	var pathamount;
	var amount;
	
	var retVal = 0;
	pathamount = '/Document/FICdtTrf/CdtTrfTxInf/IntrBkSttlmAmt';
	amount = getValueFromPath(Document, pathamount);
	logger.trace("validateMaximumAmountRuleFedPacs009: amount = " + amount);
	logger.info("validateMaximumAmountRuleFedPacs008: typeof amount = " + typeof amount);
	var amount1 = parseInt(amount);
	logger.info("validateMaximumAmountRuleFedPacs008: typeof amount = " + typeof amount1);
	if(amount1 < 0.00 || amount1 > 9999999999.99)
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("184", "7641", map);
		//if InstdAgt contains one of the Treasury tax payment RTNs, then name of the tax payer must be provided in the Creditor
		return retVal;
	}
	return retVal;
}


function validateCoverPaymentRule1FedPacs009(Document, map) {  //R3
	logger.info("In validateCoverPaymentRule1FedPacs009");
	
	var prtryPath;
	var prtry;
	var undrlygCstmrPath;
	var undrlygCstmr;
	var retVal = 0;
	
	prtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PmtTpInf/LclInstrm/Prtry';
	prtry = getValueFromPath(Document, prtryPath);
	
	undrlygCstmrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf';
	undrlygCstmr = getValueFromPath(Document, undrlygCstmrPath);
	
	var message = inMsg.getBody(java.lang.String.class);
	
	if((prtry == "COVC" || prtry == "COVS") && !(isPatternPresent(message, "<UndrlygCstmrCdtTrf>")))
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("720", "7174", map);
		//If payment is cover then UndrlygCstmrCdtTrf must be present.
		return retVal;
	}
	return retVal;
}

function validateCoverPaymentRule2FedPacs009(Document, map) {  //R4
	logger.info("In validateCoverPaymentRule2FedPacs009");
	
	var prtryPath;
	var prtry;
	var undrlygCstmrPath;
	var undrlygCstmr;
	var retVal = 0;
	
	prtryPath = '/Document/FICdtTrf/CdtTrfTxInf/PmtTpInf/LclInstrm/Prtry';
	prtry = getValueFromPath(Document, prtryPath);
	logger.info("In validateCoverPaymentRule2FedPacs009: prtry = " + prtry);
	
	undrlygCstmrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf';
	undrlygCstmr = getValueFromPath(Document, undrlygCstmrPath);
	logger.info("In validateCoverPaymentRule2FedPacs009: undrlygCstmr = " + undrlygCstmr);
	
	var message = inMsg.getBody(java.lang.String.class);
	logger.info("In validateCoverPaymentRule2FedPacs009: message = " + message);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>")) 
	{
		logger.info("In validateCoverPaymentRule2FedPacs009: Check code COVC/COVS");
		logger.info("In validateCoverPaymentRule2FedPacs009: prtry = " + prtry);
		if(prtry != "COVC" && prtry != "COVS")
		{
			logger.info("In validateCoverPaymentRule2FedPacs009: prtry = " + prtry);
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("180", "7175", map);
			//If UndrlygCstmrCdtTrf is present then COVC/COVS is ony allowed.
			return retVal;
		}
	}
	return retVal;
}

function validateMaximumAmountRuleFedPacs009(Document, map) {  //R5 already handled in XSD
	logger.info("In validateMaximumAmountRuleFedPacs009");
	var retVal = 0;
	
	return retVal;
}

function validateFITransparencyRuleFedPacs009(Document, map) {  //R17 R22 R26 R30
	logger.info("In validateFITransparencyRuleFedPacs008");
	var path;
	var retVal = 0;
	
	var message = inMsg.getBody(java.lang.String.class);
	
	var prvsInstgAgt1Path;
	var prvsInstgAgt1Val;
	prvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
	prvsInstgAgt1Val = getValueFromPath(Document, prvsInstgAgt1Path);
	logger.info("validateFITransparencyRuleFedPacs009 : prvsInstgAgt1Val: " + prvsInstgAgt1Val);
	if(isPatternPresent(message, "<PrvsInstgAgt1>") && prvsInstgAgt1Val)
	{
		var prvsInstgAgt1bicpath;
		var prvsInstgAgt1bicCode;
		var prvsInstgAgt1name;
		var prvsInstgAgt1address;
		
		prvsInstgAgt1bicpath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/BICFI';
		prvsInstgAgt1bicCode = getValueFromPath(Document, prvsInstgAgt1bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		prvsInstgAgt1address = isXmlNodePresent(Document, "CdtTrfTxInf", "PrvsInstgAgt1", "<PstlAdr>");
		logger.info("dbtrAgtAddr: " + prvsInstgAgt1address);
		
		logger.info("validateFITransparencyRuleFedPacs008: prvsInstgAgt1Val = " + prvsInstgAgt1Val);
		logger.info("validateFITransparencyRuleFedPacs008: prvsInstgAgt1bicCode = " + prvsInstgAgt1bicCode);
		logger.info("validateFITransparencyRuleFedPacs008: prvsInstgAgt1name = " + prvsInstgAgt1name);
		logger.info("validateFITransparencyRuleFedPacs008: prvsInstgAgt1address = " + prvsInstgAgt1address);
	
		if(!prvsInstgAgt1bicCode)
			{
				if((!prvsInstgAgt1name && !prvsInstgAgt1address) || (prvsInstgAgt1name && !prvsInstgAgt1address) || (!prvsInstgAgt1name && prvsInstgAgt1address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("199", "7927", map);
					return retVal;
				}
			}
	}
		
	var prvsInstgAgt2Path;
	var prvsInstgAgt2Val;
	prvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
	prvsInstgAgt2Val = getValueFromPath(Document, prvsInstgAgt2Path);
	logger.info("validateFITransparencyRuleFedPacs009 : prvsInstgAgt2Val: " + prvsInstgAgt2Val);
	if(isPatternPresent(message, "<PrvsInstgAgt2>") && prvsInstgAgt2Val)
	{
		
		var prvsInstgAgt2bicpath;
		var prvsInstgAgt2bicCode;
		var prvsInstgAgt2name;
		var prvsInstgAgt2address;
			
		prvsInstgAgt2bicpath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/BICFI';
		prvsInstgAgt2bicCode = getValueFromPath(Document, prvsInstgAgt2bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		if(!prvsInstgAgt2bicCode)
			{
				if((!prvsInstgAgt2name && !prvsInstgAgt2address) || (prvsInstgAgt2name && !prvsInstgAgt2address) || (!prvsInstgAgt2name && prvsInstgAgt2address))
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("247", "7927", map);
				return retVal;
			}
	}
	
	var prvsInstgAgt3Path;
	var prvsInstgAgt3Val;
	prvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
	prvsInstgAgt3Val = getValueFromPath(Document, prvsInstgAgt3Path);
	logger.info("validateFITransparencyRuleFedPacs009 : prvsInstgAgt3Val: " + prvsInstgAgt3Val);
	if(isPatternPresent(message, "<PrvsInstgAgt3>") && prvsInstgAgt3Val)
	{	
		var prvsInstgAgt3bicpath;
		var prvsInstgAgt3bicCode;
		var prvsInstgAgt3name;
		var prvsInstgAgt3address;
			
		prvsInstgAgt3bicpath = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/BICFI';
		prvsInstgAgt3bicCode = getValueFromPath(Document, prvsInstgAgt3bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		if(!prvsInstgAgt3bicCode)
			{
				if((!prvsInstgAgt3name && !prvsInstgAgt3address) || (prvsInstgAgt3name && !prvsInstgAgt3address) || (!prvsInstgAgt3name && prvsInstgAgt3address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("295", "7927", map);
					return retVal;
				}
			}
	}
	
	var intrmyAgt1Path;
	var intrmyAgt1Val;
	intrmyAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1';
	intrmyAgt1Val = getValueFromPath(Document, intrmyAgt1Path);	
	if(isPatternPresent(message, "<IntrmyAgt1>") && intrmyAgt1Val)
	{
		
		var intrmyAgt1bicpath;
		var intrmyAgt1bicCode;
		var intrmyAgt1name;
		var intrmyAgt1address;
			
		intrmyAgt1bicpath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/BICFI';
		intrmyAgt1bicCode = getValueFromPath(Document, intrmyAgt1bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		if(!intrmyAgt1bicCode)
			{
				if((!intrmyAgt1name && !intrmyAgt1address) || (intrmyAgt1name && !intrmyAgt1address) || (!intrmyAgt1name && intrmyAgt1address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("369", "7927", map);
					return retVal;
				}
			}
	}
		
	var intrmyAgt2Path;
	var intrmyAgt2Val;
	intrmyAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2';
	intrmyAgt2Val = getValueFromPath(Document, intrmyAgt2Path);
	if(isPatternPresent(message, "<IntrmyAgt2>") && intrmyAgt2Val)
	{	
		var intrmyAgt2bicpath;
		var intrmyAgt2bicCode;
		var intrmyAgt2name;
		var intrmyAgt2address;

		intrmyAgt2bicpath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/BICFI';
		intrmyAgt2bicCode = getValueFromPath(Document, intrmyAgt2bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		if(!intrmyAgt2bicCode )
			{
				if((!intrmyAgt2name && !intrmyAgt2address) || (intrmyAgt2name && !intrmyAgt2address) || (!intrmyAgt2name && intrmyAgt2address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("417", "7927", map);
					return retVal;
				}
			}
	}
		
	var intrmyAgt3Path;
	var intrmyAgt3Val;
	intrmyAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3';
	intrmyAgt3Val = getValueFromPath(Document, intrmyAgt3Path);
	if(isPatternPresent(message, "<IntrmyAgt3>") && intrmyAgt3Val)
	{		
		var intrmyAgt3bicpath;
		var intrmyAgt3bicCode;
		var intrmyAgt3name;
		var intrmyAgt3address;

		intrmyAgt3bicpath = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/BICFI';
		intrmyAgt3bicCode = getValueFromPath(Document, intrmyAgt3bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		if(!intrmyAgt3bicCode)
			{
				if((!intrmyAgt3name && !intrmyAgt3address) || (intrmyAgt3name && !intrmyAgt3address) || (!intrmyAgt3name && intrmyAgt3address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("465", "7927", map);
					return retVal;
				}				
			}
	}
	
	var dbtrPath;
	var dbtrVal;
	dbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr';
	dbtrVal = getValueFromPath(Document, dbtrPath);
	logger.info("validateFITransparencyRuleFedPacs009 : dbtrVal: " + dbtrVal);
	if(isPatternPresent(message, "<Dbtr>") && dbtrVal)
	{
		logger.info("validateFITransparencyRuleFedPacs009 : in Dbtr: ");
		
		var dbtrbicpath;
		var dbtrbicCode;
		var dbtrname;
		var dbtraddress;
		
		dbtrbicpath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/BICFI';
		dbtrbicCode = getValueFromPath(Document, dbtrbicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/Nm';
		dbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr';
		dbtraddress = getValueFromPath(Document, path);
		
		if(!dbtrbicCode)
			{
				if((!dbtrname && !dbtraddress) || (dbtrname && !dbtraddress) || (!dbtrname && dbtraddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("514", "7927", map);
					return retVal;
				}
			}
	}
	
	var dbtrAgtPath;
	var dbtrAgtVal;
	dbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt';
	dbtrAgtVal = getValueFromPath(Document, dbtrAgtPath);
	logger.info("validateFITransparencyRuleFedPacs008: dbtrAgtVal Path: " + dbtrAgtVal); 	
	
	if(isPatternPresent(message, "<DbtrAgt>") && dbtrAgtVal)
	{
		
		var dbtrAgtbicpath;
		var dbtrAgtbicCode;
		var dbtrAgtname;
		var dbtrAgtaddress;
		
		dbtrAgtbicpath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI';
		dbtrAgtbicCode = getValueFromPath(Document, dbtrAgtbicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtaddress = getValueFromPath(Document, path);
		logger.info("validateFITransparencyRuleFedPacs008 : dbtrAgtaddress Path: " + dbtrAgtaddress);
		
		logger.trace("validateFITransparencyRuleFedPacs008: dbtrAgtVal = " + dbtrAgtVal);
		logger.trace("validateFITransparencyRuleFedPacs008: dbtrAgtbicCode = " + dbtrAgtbicCode);
		logger.trace("validateFITransparencyRuleFedPacs008: dbtrAgtname = " + dbtrAgtname);
		logger.trace("validateFITransparencyRuleFedPacs008: dbtrAgtaddress = " + dbtrAgtaddress);
		
		if(dbtrAgtVal)
		{
			if(!dbtrAgtbicCode)
			{
				if((!dbtrAgtname && !dbtrAgtaddress) || (dbtrAgtname && !dbtrAgtaddress) || (!dbtrAgtname && dbtrAgtaddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("562", "7927", map);
					return retVal;
				}
				
			}
		}
		
	}

	var cdtrAgtPath;
	var cdtrAgtVal;		
	cdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt';
	cdtrAgtVal = getValueFromPath(Document, cdtrAgtPath);		
	if(isPatternPresent(message, "<CdtrAgt>") && cdtrAgtVal)
	{
		var cdtrAgtbicpath;
		var cdtrAgtbicCode;
		var cdtrAgtname;
		var cdtrAgtaddress;
		
		cdtrAgtbicpath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
		cdtrAgtbicCode = getValueFromPath(Document, cdtrAgtbicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		if(!cdtrAgtbicCode)
			{
				if((!cdtrAgtname && !cdtrAgtaddress) || (cdtrAgtname && !cdtrAgtaddress) || (!cdtrAgtname && cdtrAgtaddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("610", "7927", map);
					return retVal;
				}				
			}
	}

	var cdtrPath;
	var cdtrVal;
	cdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr';
	cdtrVal = getValueFromPath(Document, cdtrPath);	
	if(isPatternPresent(message, "<Cdtr>") && cdtrVal)
	{
		var cdtrbicpath;
		var cdtrbicCode;
		var cdtrname;
		var cdtraddress;
			
		cdtrbicpath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/BICFI';
		cdtrbicCode = getValueFromPath(Document, cdtrbicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/Nm';
		cdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr';
		cdtraddress = getValueFromPath(Document, path);
		
		if(!cdtrbicCode)
			{
				if((!cdtrname && !cdtraddress) || (cdtrname && !cdtraddress) || (!cdtrname && cdtraddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("658", "7927", map);
					return retVal;
				}
			}
	}
		
	var undrCstdbtrAgtPath;
	var undrCstdbtrAgtVal;
	undrCstdbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt';
	undrCstdbtrAgtVal = getValueFromPath(Document, undrCstdbtrAgtPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<DbtrAgt>") && undrCstdbtrAgtVal)
	{
		var undrCstdbtrAgtbicpath;
		var undrCstdbtrAgtbicCode;
		var undrCstdbtrAgtname;
		var undrCstdbtrAgtaddress;
			
		undrCstdbtrAgtbicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/BICFI';
		undrCstdbtrAgtbicCode = getValueFromPath(Document, undrCstdbtrAgtbicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/Nm';
		undrCstdbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr';
		undrCstdbtrAgtaddress = getValueFromPath(Document, path);
		
		if(!undrCstdbtrAgtbicCode)
			{
				if((!undrCstdbtrAgtname && !undrCstdbtrAgtaddress) || (undrCstdbtrAgtname && !undrCstdbtrAgtaddress) || (!undrCstdbtrAgtname && undrCstdbtrAgtaddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("871", "7927", map);
					return retVal;
				}
			}
	}
		
	var undrCstdbtrPath;
	var undrCstdbtrVal;		
	undrCstdbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr';
	undrCstdbtrVal = getValueFromPath(Document, undrCstdbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Dbtr>") && undrCstdbtrVal)
	{
		var undrCstdbtrbicpath;
		var undrCstdbtrbicCode;
		var undrCstdbtrname;
		var undrCstdbtraddress;
		
		undrCstdbtrbicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/BICFI';
		undrCstdbtrbicCode = getValueFromPath(Document, undrCstdbtrbicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Nm';
		undrCstdbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr';
		undrCstdbtrAgtaddress = getValueFromPath(Document, path);
		
		if(!undrCstdbtrbicCode)
			{
				if((!undrCstdbtrname && !undrCstdbtrAgtaddress) || (undrCstdbtrname && !undrCstdbtrAgtaddress) || (!undrCstdbtrname && undrCstdbtrAgtaddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("809", "7927", map);
					return retVal;
				}				
			}
	}
	
	var undrCstprvsInstgAgt1Path;
	var undrCstprvsInstgAgt1Val;
	undrCstprvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1';
	undrCstprvsInstgAgt1Val = getValueFromPath(Document, undrCstprvsInstgAgt1Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt1>") && undrCstprvsInstgAgt1Val)
	{
		var undrCstprvsInstgAgt1bicpath;
		var undrCstprvsInstgAgt1bicCode;
		var undrCstprvsInstgAgt1name;
		var undrCstprvsInstgAgt1address;
			
		undrCstprvsInstgAgt1bicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/BICFI';
		undrCstprvsInstgAgt1bicCode = getValueFromPath(Document, undrCstprvsInstgAgt1bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/Nm';
		undrCstprvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt1address = getValueFromPath(Document, path);
		
		if(!undrCstprvsInstgAgt1bicCode)
			{
				if((!undrCstprvsInstgAgt1name && !undrCstprvsInstgAgt1address) || (undrCstprvsInstgAgt1name && !undrCstprvsInstgAgt1address) || (!undrCstprvsInstgAgt1name && undrCstprvsInstgAgt1address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("919", "7927", map);
					return retVal;
				}
			}
	}

	var undrCstprvsInstgAgt2Path;
	var undrCstprvsInstgAgt2Val;
	undrCstprvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2';
	undrCstprvsInstgAgt2Val = getValueFromPath(Document, undrCstprvsInstgAgt2Path);		
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt2>") && undrCstprvsInstgAgt2Val)
	{
		var undrCstprvsInstgAgt2bicpath;
		var undrCstprvsInstgAgt2bicCode;
		var undrCstprvsInstgAgt2name;
		var undrCstprvsInstgAgt2address;
		
		undrCstprvsInstgAgt2bicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/BICFI';
		undrCstprvsInstgAgt2bicCode = getValueFromPath(Document, undrCstprvsInstgAgt2bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/Nm';
		undrCstprvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt2address = getValueFromPath(Document, path);
		
		if(!undrCstprvsInstgAgt2bicCode)
			{
				if((!undrCstprvsInstgAgt2name && !undrCstprvsInstgAgt2address) || (undrCstprvsInstgAgt2name && !undrCstprvsInstgAgt2address) || (!undrCstprvsInstgAgt2name && undrCstprvsInstgAgt2address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("967", "7927", map);
					return retVal;
				}
			}
	}

		
	var undrCstprvsInstgAgt3Path;
	var undrCstprvsInstgAgt3Val;
	undrCstprvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3';
	undrCstprvsInstgAgt3Val = getValueFromPath(Document, undrCstprvsInstgAgt3Path);		
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt3>") && undrCstprvsInstgAgt3Val)
	{
		var undrCstprvsInstgAgt3bicpath;
		var undrCstprvsInstgAgt3bicCode;
		var undrCstprvsInstgAgt3name;
		var undrCstprvsInstgAgt3address;

		undrCstprvsInstgAgt3bicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/BICFI';
		undrCstprvsInstgAgt3bicCode = getValueFromPath(Document, undrCstprvsInstgAgt3bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/Nm';
		undrCstprvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt3address = getValueFromPath(Document, path);
		
		if(!undrCstprvsInstgAgt3bicCode)
			{
				if((!undrCstprvsInstgAgt3name && !undrCstprvsInstgAgt3address) || (undrCstprvsInstgAgt3name && !undrCstprvsInstgAgt3address) || (!undrCstprvsInstgAgt3name && undrCstprvsInstgAgt3address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("1015", "7927", map);
					return retVal;
				}				
			}
	}
	
	var undrCstintrmyAgt1Path;
	var undrCstintrmyAgt1Val;
	undrCstintrmyAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1';
	undrCstintrmyAgt1Val = getValueFromPath(Document, undrCstintrmyAgt1Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt1>") && undrCstintrmyAgt1Val)
	{	
		var undrCstintrmyAgt1bicpath;
		var undrCstintrmyAgt1bicCode;
		var undrCstintrmyAgt1name;
		var undrCstintrmyAgt1address;
	
		undrCstintrmyAgt1bicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/BICFI';
		undrCstintrmyAgt1bicCode = getValueFromPath(Document, undrCstintrmyAgt1bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/Nm';
		undrCstintrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr';
		undrCstintrmyAgt1address = getValueFromPath(Document, path);
		
		if(!undrCstintrmyAgt1bicCode)
			{
				if((!undrCstintrmyAgt1name && !undrCstintrmyAgt1address) || (undrCstintrmyAgt1name && !undrCstintrmyAgt1address) || (!undrCstintrmyAgt1name && undrCstintrmyAgt1address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("1063", "7927", map);
					return retVal;
				}
			}
	}
	
	var undrCstintrmyAgt2Path;
	var undrCstintrmyAgt2Val;
	undrCstintrmyAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2';
	undrCstintrmyAgt2Val = getValueFromPath(Document, undrCstintrmyAgt2Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt2>") && undrCstintrmyAgt2Val)
	{	
		var undrCstintrmyAgt2bicpath;
		var undrCstintrmyAgt2bicCode;
		var undrCstintrmyAgt2name;
		var undrCstintrmyAgt2address;

		undrCstintrmyAgt2bicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/BICFI';
		undrCstintrmyAgt2bicCode = getValueFromPath(Document, undrCstintrmyAgt2bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/Nm';
		undrCstintrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr';
		undrCstintrmyAgt2address = getValueFromPath(Document, path);
		
		if(!undrCstintrmyAgt2bicCode)
			{
				if((!undrCstintrmyAgt2name && !undrCstintrmyAgt2address) || (undrCstintrmyAgt2name && !undrCstintrmyAgt2address) || (!undrCstintrmyAgt2name && undrCstintrmyAgt2address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("1111", "7927", map);
					return retVal;
				}
				
			}
	}
	
	var undrCstintrmyAgt3Path;
	var undrCstintrmyAgt3Val;
	undrCstintrmyAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3';
	undrCstintrmyAgt3Val = getValueFromPath(Document, undrCstintrmyAgt3Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt3>") && undrCstintrmyAgt3Val)
	{
		var undrCstintrmyAgt3bicpath;
		var undrCstintrmyAgt3bicCode;
		var undrCstintrmyAgt3name;
		var undrCstintrmyAgt3address;
			
		undrCstintrmyAgt3bicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/BICFI';
		undrCstintrmyAgt3bicCode = getValueFromPath(Document, undrCstintrmyAgt3bicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/Nm';
		undrCstintrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr';
		undrCstintrmyAgt3address = getValueFromPath(Document, path);
		
		if(!undrCstintrmyAgt3bicCode)
			{
				if((!undrCstintrmyAgt3name && !undrCstintrmyAgt3address) || (undrCstintrmyAgt3name && !undrCstintrmyAgt3address) || (!undrCstintrmyAgt3name && undrCstintrmyAgt3address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("1159", "7927", map);
					return retVal;
				}
			}
	}
	
	var undrCstcdtrAgtPath;
	var undrCstcdtrAgtVal;
	undrCstcdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt';
	undrCstcdtrAgtVal = getValueFromPath(Document, undrCstcdtrAgtPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<CdtrAgt>") && undrCstcdtrAgtVal)
	{
		var undrCstcdtrAgtbicpath;
		var undrCstcdtrAgtbicCode;
		var undrCstcdtrAgtname;
		var undrCstcdtrAgtaddress;
			
		undrCstcdtrAgtbicpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/BICFI';
		undrCstcdtrAgtbicCode = getValueFromPath(Document, undrCstcdtrAgtbicpath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/Nm';
		undrCstcdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr';
		undrCstcdtrAgtaddress = getValueFromPath(Document, path);
		
		if(!undrCstcdtrAgtbicCode)
			{
				if((!undrCstcdtrAgtname && !undrCstcdtrAgtaddress) || (undrCstcdtrAgtname && !undrCstcdtrAgtaddress) || (!undrCstcdtrAgtname && undrCstcdtrAgtaddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("1207", "7927", map);
					return retVal;
				}
			}
	}
	
	return retVal;
	
}

function validatePostalAddressRule1FedPacs009(Document, map) {  
	logger.info("In validatePostalAddressRule1FedPacs009");

	var path;
	var retVal = 0;
	var message = inMsg.getBody(java.lang.String.class);
	/* if(isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1;
		var prvsInstgAgt1name;
		var prvsInstgAgt1pstladdress;
		var prvsInstgAgt1address;
		
		prvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
		prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		if(prvsInstgAgt1pstladdress && !prvsInstgAgt1name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("21", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2;
		var prvsInstgAgt2name;
		var prvsInstgAgt2pstladdress;
		var prvsInstgAgt2address;
		
		prvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
		prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		if(prvsInstgAgt2pstladdress && !prvsInstgAgt2name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("22", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3;
		var prvsInstgAgt3name;
		var prvsInstgAgt3pstladdress;
		var prvsInstgAgt3address;
		
		prvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
		prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		if(prvsInstgAgt3pstladdress && !prvsInstgAgt3name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("23", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1;
		var intrmyAgt1name;
		var intrmyAgt1pstladdress;
		var intrmyAgt1address;
		
		intrmyAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1';
		intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
	
		if(intrmyAgt1pstladdress && !intrmyAgt1name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("24", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2;
		var intrmyAgt2name;
		var intrmyAgt2pstladdress;
		var intrmyAgt2address;
		
		intrmyAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2';
		intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		if(intrmyAgt2pstladdress && !intrmyAgt2name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("25", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3;
		var intrmyAgt3name;
		var intrmyAgt3pstladdress;
		var intrmyAgt3address;
		
		intrmyAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3';
		intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		if(intrmyAgt3pstladdress && !intrmyAgt3name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("26", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrPath;
		var dbtr;
		var dbtrname;
		var dbtrpstladdress;
		var dbtraddress;
		
		dbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr';
		dbtr = getValueFromPath(Document, dbtrPath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/Nm';
		dbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr';
		dbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine';
		dbtraddress = getValueFromPath(Document, path);
		if(dbtrpstladdress && !dbtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("27", "XXXX", map);
			return retVal;
		}
	}
		
	if(isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrAgtname;
		var dbtrAgtpstladdress;
		var dbtrAgtaddress;
		
		dbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		if(dbtrAgtpstladdress && !dbtrAgtname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("28", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrAgtname;
		var cdtrAgtpstladdress;
		var cdtrAgtaddress;
		
		cdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		if(cdtrAgtpstladdress && !cdtrAgtname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("29", "XXXX", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrPath;
		var cdtr;
		var cdtrname;
		var cdtrpstladdress;
		var cdtraddress;
		
		cdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr';
		cdtr = getValueFromPath(Document, cdtrPath);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/Nm';
		cdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr';
		cdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine';
		cdtraddress = getValueFromPath(Document, path);
		
		if(cdtrpstladdress && !cdtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("30", "XXXX", map);
			return retVal;
		}
	}
	 */
	 
	var undrCstultmtdbtrPath;
	var undrCstultmtdbtr;
	undrCstultmtdbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr';
	undrCstultmtdbtr = getValueFromPath(Document, undrCstultmtdbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<UltmtDbtr>") && undrCstultmtdbtr)
	{	
		var undrCstultmtdbtrname;
		var undrCstultmtdbtrpstladdress;
		var undrCstultmtdbtraddress;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/Nm';
		undrCstultmtdbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/PstlAdr';
		undrCstultmtdbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/PstlAdr/AdrLine';
		undrCstultmtdbtraddress = getValueFromPath(Document, path);
	
		//if((undrCstultmtdbtrpstladdress && !undrCstultmtdbtrname) || (!undrCstultmtdbtrpstladdress && undrCstultmtdbtrname))
		if(undrCstultmtdbtrpstladdress && !undrCstultmtdbtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("723", "7948", map);
			return retVal;
		}
	}
		
		
	var undrCstinitgPtyPath;
	var undrCstinitgPty;
	undrCstinitgPtyPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty';
	undrCstinitgPty = getValueFromPath(Document, undrCstinitgPtyPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<InitgPty>") && undrCstinitgPty)
	{
		var undrCstinitgPtyname;
		var undrCstinitgPtypstladdress;
		var undrCstinitgPtyaddress;

		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/Nm';
		undrCstinitgPtyname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/PstlAdr';
		undrCstinitgPtypstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/PstlAdr/AdrLine';
		undrCstinitgPtyaddress = getValueFromPath(Document, path);
		if((undrCstinitgPtypstladdress && !undrCstinitgPtyname) || (!undrCstinitgPtypstladdress && undrCstinitgPtyname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("766", "7948", map);
			return retVal;
		}
	}
	
	var undrCstdbtrPath;
	var undrCstdbtr;
	undrCstdbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr';
	undrCstdbtr = getValueFromPath(Document, undrCstdbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Dbtr>") && undrCstdbtr)
	{
		var undrCstdbtrname;
		var undrCstdbtrpstladdress;
		var undrCstdbtraddress;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Nm';
		undrCstdbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr';
		undrCstdbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
		undrCstdbtraddress = getValueFromPath(Document, path);
		if((undrCstdbtrpstladdress && !undrCstdbtrname) || (!undrCstdbtrpstladdress && undrCstdbtrname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("809", "7948", map);
			return retVal;
		}
	}
		
	var undrCstdbtrAgtPath;
	var undrCstdbtrAgt;
	undrCstdbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt';
	undrCstdbtrAgt = getValueFromPath(Document, undrCstdbtrAgtPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<DbtrAgt>") && undrCstdbtrAgt)
	{
		var undrCstdbtrAgtname;
		var undrCstdbtrAgtpstladdress;
		var undrCstdbtrAgtaddress;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/Nm';
		undrCstdbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr';
		undrCstdbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		undrCstdbtrAgtaddress = getValueFromPath(Document, path);
		if((undrCstdbtrAgtpstladdress && !undrCstdbtrAgtname) || (!undrCstdbtrAgtpstladdress && undrCstdbtrAgtname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("871", "7948", map);
			return retVal;
		}
	}
		
	var undrCstprvsInstgAgt1Path;
	var undrCstprvsInstgAgt1;
	undrCstprvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1';
	undrCstprvsInstgAgt1 = getValueFromPath(Document, undrCstprvsInstgAgt1Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt1>") && undrCstprvsInstgAgt1)
	{
		var undrCstprvsInstgAgt1name;
		var undrCstprvsInstgAgt1pstladdress;
		var undrCstprvsInstgAgt1address;
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/Nm';
		undrCstprvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt1address = getValueFromPath(Document, path);
		if((undrCstprvsInstgAgt1pstladdress && !undrCstprvsInstgAgt1name) || (!undrCstprvsInstgAgt1pstladdress && undrCstprvsInstgAgt1name))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("919", "7948", map);
			return retVal;
		}
	}
	
	var undrCstprvsInstgAgt2Path;
	var undrCstprvsInstgAgt2;
	undrCstprvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2';
	undrCstprvsInstgAgt2 = getValueFromPath(Document, undrCstprvsInstgAgt2Path);	
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt2>") && undrCstprvsInstgAgt2)
	{	
		var undrCstprvsInstgAgt2name;
		var undrCstprvsInstgAgt2pstladdress;
		var undrCstprvsInstgAgt2address;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/Nm';
		undrCstprvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt2address = getValueFromPath(Document, path);
		if((undrCstprvsInstgAgt2pstladdress && !undrCstprvsInstgAgt2name) || (!undrCstprvsInstgAgt2pstladdress && undrCstprvsInstgAgt2name))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("967", "7948", map);
			return retVal;
		}
	}
		
	var undrCstprvsInstgAgt3Path;
	var undrCstprvsInstgAgt3;
	undrCstprvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3';
	undrCstprvsInstgAgt3 = getValueFromPath(Document, undrCstprvsInstgAgt3Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt3>") && undrCstprvsInstgAgt3)
	{	
		var undrCstprvsInstgAgt3name;
		var undrCstprvsInstgAgt3pstladdress;
		var undrCstprvsInstgAgt3address;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/Nm';
		undrCstprvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt3address = getValueFromPath(Document, path);
		if((undrCstprvsInstgAgt3pstladdress && !undrCstprvsInstgAgt3name) || (!undrCstprvsInstgAgt3pstladdress && undrCstprvsInstgAgt3name))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1015", "7948", map);
			return retVal;
		}
	}
		
	var undrCstintrmyAgt11Path;
	var undrCstintrmyAgt11;
	undrCstintrmyAgt11Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1';
	undrCstintrmyAgt11 = getValueFromPath(Document, undrCstintrmyAgt11Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt1>") && undrCstintrmyAgt11)
	{	
		var undrCstintrmyAgt11name;
		var undrCstintrmyAgt11pstladdress;
		var undrCstintrmyAgt11address;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/Nm';
		undrCstintrmyAgt11name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr';
		undrCstintrmyAgt11pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt11address = getValueFromPath(Document, path);
		if((undrCstintrmyAgt11pstladdress && !undrCstintrmyAgt11name) || (!undrCstintrmyAgt11pstladdress && undrCstintrmyAgt11name))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1063", "7948", map);
			return retVal;
		}
	}
		
	var undrCstintrmyAgt12Path;
	var undrCstintrmyAgt12;
	undrCstintrmyAgt12Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2';
	undrCstintrmyAgt12 = getValueFromPath(Document, undrCstintrmyAgt12Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt2>") && undrCstintrmyAgt12)
	{
		var undrCstintrmyAgt12name;
		var undrCstintrmyAgt12pstladdress;
		var undrCstintrmyAgt12address;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/Nm';
		undrCstintrmyAgt12name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr';
		undrCstintrmyAgt12pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt12address = getValueFromPath(Document, path);
		if((undrCstintrmyAgt12pstladdress && !undrCstintrmyAgt12name) || (!undrCstintrmyAgt12pstladdress && undrCstintrmyAgt12name))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1111", "7948", map);
			return retVal;
		}
	}
		
	var undrCstintrmyAgt13Path;
	var undrCstintrmyAgt13;
	undrCstintrmyAgt13Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3';
	undrCstintrmyAgt13 = getValueFromPath(Document, undrCstintrmyAgt13Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt3>") && undrCstintrmyAgt13)
	{
		var undrCstintrmyAgt13name;
		var undrCstintrmyAgt13pstladdress;
		var undrCstintrmyAgt13address;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/Nm';
		undrCstintrmyAgt13name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr';
		undrCstintrmyAgt13pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt13address = getValueFromPath(Document, path);
		
		if((undrCstintrmyAgt13pstladdress && !undrCstintrmyAgt13name) || (!undrCstintrmyAgt13pstladdress && undrCstintrmyAgt13name))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1159", "7948", map);
			return retVal;
		}
	}
		
	var undrCstcdtrAgtPath;
	var undrCstcdtrAgt;
	undrCstcdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt';
	undrCstcdtrAgt = getValueFromPath(Document, undrCstcdtrAgtPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<CdtrAgt>"))
	{	
		var undrCstcdtrAgtname;
		var undrCstcdtrAgtpstladdress;
		var undrCstcdtrAgtaddress;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/Nm';
		undrCstcdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr';
		undrCstcdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		undrCstcdtrAgtaddress = getValueFromPath(Document, path);
		
		if((undrCstcdtrAgtpstladdress && !undrCstcdtrAgtname) || (!undrCstcdtrAgtpstladdress && undrCstcdtrAgtname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1207", "7948", map);
			return retVal;
		}
	}
		
	var undrCstdbtrPath;
	var undrCstdbtr;
	undrCstdbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr';
	undrCstdbtr = getValueFromPath(Document, undrCstdbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Dbtr>") && undrCstdbtr)
	{	
		var undrCstdbtrname;
		var undrCstdbtrpstladdress;
		var undrCstdbtraddress;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Nm';
		undrCstdbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr';
		undrCstdbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
		undrCstdbtraddress = getValueFromPath(Document, path);
		
		if((undrCstdbtrpstladdress && !undrCstdbtrname) || (!undrCstdbtrpstladdress && undrCstdbtrname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("809", "7948", map);
			return retVal;
		}
	}
		
	var undrCstultmtCdtrPath;
	var undrCstultmtCdtr;
	undrCstultmtCdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr';
	undrCstultmtCdtr = getValueFromPath(Document, undrCstultmtCdtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<UltmtCdtr>") && undrCstultmtCdtr)
	{	
		var undrCstultmtCdtrname;
		var undrCstultmtCdtrpstladdress;
		var undrCstultmtCdtraddress;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/Nm';
		undrCstultmtCdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/PstlAdr';
		undrCstultmtCdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/PstlAdr/AdrLine';
		undrCstultmtCdtraddress = getValueFromPath(Document, path);
		
		if((undrCstultmtCdtrpstladdress && !undrCstultmtCdtrname) || (!undrCstultmtCdtrpstladdress && undrCstultmtCdtrname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1325", "7948", map);
			return retVal;
		}
	}
		
	var invcrPath;
	var invcr;
	invcrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcr';
	invcr = getValueFromPath(Document, invcrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Invcr>") && invcr)
	{
		var invcrname;
		var invcrpstladdress;
		var invcraddress;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcr/Nm';
		invcrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcr/PstlAdr';
		invcrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcr/PstlAdr/AdrLine';
		invcraddress = getValueFromPath(Document, path);
		if((invcrpstladdress && !invcrname) || (!invcrpstladdress && invcrname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1472", "7948", map);
			return retVal;
		}
	}
		
	var invceePath;
	var invcee;
	invceePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcee';
	invcee = getValueFromPath(Document, invceePath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Invcee>") && invcee)
	{
		var invceename;
		var invceepstladdress;
		var invceeaddress;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcee/Nm';
		invceename = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcee/PstlAdr';
		invceepstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/Invcee/PstlAdr/AdrLine';
		invceeaddress = getValueFromPath(Document, path);
		
		if((invceepstladdress && !invceename) || (!invceepstladdress && invceename))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1515", "7948", map);
			return retVal;
		}
	}
		
	var grnsheePath;
	var grnshee;
	grnsheePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/Grnshee';
	grnshee = getValueFromPath(Document, grnsheePath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Grnshee>") && grnshee)
	{	
		var grnsheename;
		var grnsheepstladdress;
		var grnsheeaddress;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/Grnshee/Nm';
		grnsheename = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr';
		grnsheepstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/AdrLine';
		grnsheeaddress = getValueFromPath(Document, path);
		if((grnsheepstladdress && !grnsheename) || (!grnsheepstladdress && grnsheename))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1657", "7948", map);
			return retVal;
		}
	}
		
	var grnshmtAdmstrPath;
	var grnshmtAdmstr;
	grnshmtAdmstrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr';
	grnshmtAdmstr = getValueFromPath(Document, grnshmtAdmstrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<GrnshmtAdmstr>") && grnshmtAdmstr)
	{	
		var grnshmtAdmstrname;
		var grnshmtAdmstrpstladdress;
		var grnshmtAdmstraddress;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Nm';
		grnshmtAdmstrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr';
		grnshmtAdmstrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/AdrLine';
		grnshmtAdmstraddress = getValueFromPath(Document, path);
		
		if((grnshmtAdmstrpstladdress && !grnshmtAdmstrname) || (!grnshmtAdmstrpstladdress && grnshmtAdmstrname))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1700", "7948", map);
			return retVal;
		}
	}
	
	return retVal;
	
}

function validatePostalAddressRule2FedPacs009(Document, map) {  //
	logger.info("In validatePostalAddressRule2FedPacs009");
	
	var path;
	var retVal = 0;
	
	var message = inMsg.getBody(java.lang.String.class);
	
	var prvsInstgAgt1Path;
	var prvsInstgAgt1;
	prvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
	prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);	
	if(isPatternPresent(message, "<PrvsInstgAgt1>") && prvsInstgAgt1)
	{
		var prvsInstgAgt1name;
		var prvsInstgAgt1address;
		var prvsInstgAgt1dept;
		var prvsInstgAgt1strtnm;
		var prvsInstgAgt1bldgnm;
		var prvsInstgAgt1postbox;
		var prvsInstgAgt1room;
		var prvsInstgAgt1postlcd;
		var prvsInstgAgt1twnnm;
		var prvsInstgAgt1dstrctLocnm;
		var prvsInstgAgt1dstrctnm;
		var prvsInstgAgt1cntrySubdiv;
		var prvsInstgAgt1cntry;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt1dept = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt1strtnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt1bldgnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt1postbox = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
		prvsInstgAgt1room = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt1postlcd = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt1twnnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt1dstrctLocnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt1dstrctnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt1cntrySubdiv = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt1cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt1address && (prvsInstgAgt1dept || prvsInstgAgt1strtnm || prvsInstgAgt1bldgnm || prvsInstgAgt1postbox && prvsInstgAgt1room || prvsInstgAgt1postlcd || prvsInstgAgt1twnnm || prvsInstgAgt1dstrctLocnm || prvsInstgAgt1dstrctnm || prvsInstgAgt1cntrySubdiv || prvsInstgAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("199", "7928", map);
			return retVal;
		}
	}
		
	var prvsInstgAgt2Path;
	var prvsInstgAgt2;
	prvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
	prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
	if(isPatternPresent(message, "<PrvsInstgAgt2>") && prvsInstgAgt2)
	{	
		var prvsInstgAgt2name;
		var prvsInstgAgt2address;
		var prvsInstgAgt2dept;
		var prvsInstgAgt2strtnm;
		var prvsInstgAgt2bldgnm;
		var prvsInstgAgt2postbox;
		var prvsInstgAgt2room;
		var prvsInstgAgt2postlcd;
		var prvsInstgAgt2twnnm;
		var prvsInstgAgt2dstrctLocnm;
		var prvsInstgAgt2dstrctnm;
		var prvsInstgAgt2cntrySubdiv;
		var prvsInstgAgt2cntry;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt2dept = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt2strtnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt2bldgnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
		prvsInstgAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt2cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt2address && (prvsInstgAgt2dept || prvsInstgAgt2strtnm || prvsInstgAgt2bldgnm || prvsInstgAgt2postbox || prvsInstgAgt2room || prvsInstgAgt2postlcd || prvsInstgAgt2twnnm || prvsInstgAgt2dstrctLocnm || prvsInstgAgt2dstrctnm || prvsInstgAgt2cntrySubdiv || prvsInstgAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("247", "7928", map);
			return retVal;
		}
	}
	
	var prvsInstgAgt3Path;
	var prvsInstgAgt3;
	prvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
	prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
	if(isPatternPresent(message, "<PrvsInstgAgt3>") && prvsInstgAgt3)
	{	
		var prvsInstgAgt3name;
		var prvsInstgAgt3address;
		var prvsInstgAgt3dept;
		var prvsInstgAgt3strtnm;
		var prvsInstgAgt3bldgnm;
		var prvsInstgAgt3postbox;
		var prvsInstgAgt3room;
		var prvsInstgAgt3postlcd;
		var prvsInstgAgt3twnnm;
		var prvsInstgAgt3dstrctLocnm;
		var prvsInstgAgt3dstrctnm;
		var prvsInstgAgt3cntrySubdiv;
		var prvsInstgAgt3cntry;

		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
		prvsInstgAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt3cntry = getValueFromPath(Document, path);
		if(prvsInstgAgt3address && (prvsInstgAgt3dept || prvsInstgAgt3strtnm || prvsInstgAgt3bldgnm || prvsInstgAgt3postbox || prvsInstgAgt3room || prvsInstgAgt3postlcd || prvsInstgAgt3twnnm || prvsInstgAgt3dstrctLocnm || prvsInstgAgt3dstrctnm || prvsInstgAgt3cntrySubdiv || prvsInstgAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("295", "7928", map);
			return retVal;
		}
	}
	
	var intrmyAgt1Path;
	var intrmyAgt1;
	intrmyAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1';
	intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
	if(isPatternPresent(message, "<IntrmyAgt1>") && intrmyAgt1)
	{	
		var intrmyAgt1name;
		var intrmyAgt1address;
		var intrmyAgt1dept;
		var intrmyAgt1strtnm;
		var intrmyAgt1bldgnm;
		var intrmyAgt1postbox;
		var intrmyAgt1room;
		var intrmyAgt1postlcd;
		var intrmyAgt1twnnm;
		var intrmyAgt1dstrctLocnm;
		var intrmyAgt1dstrctnm;
		var intrmyAgt1cntrySubdiv;
		var intrmyAgt1cntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
		intrmyAgt1dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt1strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt1bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
		intrmyAgt1postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
		intrmyAgt1room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
		intrmyAgt1postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt1dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt1dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt1cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		intrmyAgt1cntry = getValueFromPath(Document, path);
		if(intrmyAgt1address && (intrmyAgt1dept || intrmyAgt1strtnm || intrmyAgt1bldgnm || intrmyAgt1postbox || intrmyAgt1room || intrmyAgt1postlcd || intrmyAgt1twnnm || intrmyAgt1dstrctLocnm || intrmyAgt1dstrctnm || intrmyAgt1cntrySubdiv || intrmyAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("369", "7928", map);
			return retVal;
		}
	}
	
	var intrmyAgt2Path;
	var intrmyAgt2;
	intrmyAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2';
	intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
	if(isPatternPresent(message, "<IntrmyAgt2>") && intrmyAgt2)
	{
		var intrmyAgt2name;
		var intrmyAgt2address;
		var intrmyAgt2dept;
		var intrmyAgt2strtnm;
		var intrmyAgt2bldgnm;
		var intrmyAgt2postbox;
		var intrmyAgt2room;
		var intrmyAgt2postlcd;
		var intrmyAgt2twnnm;
		var intrmyAgt2dstrctLocnm;
		var intrmyAgt2dstrctnm;
		var intrmyAgt2cntrySubdiv;
		var intrmyAgt2cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
		intrmyAgt2dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt2strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt2bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
		intrmyAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
		intrmyAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
		intrmyAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		intrmyAgt2cntry = getValueFromPath(Document, path);
		if(intrmyAgt2address && (intrmyAgt2dept || intrmyAgt2strtnm || intrmyAgt2bldgnm || intrmyAgt2postbox || intrmyAgt2room || intrmyAgt2postlcd || intrmyAgt2twnnm || intrmyAgt2dstrctLocnm || intrmyAgt2dstrctnm || intrmyAgt2cntrySubdiv || intrmyAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("417", "7928", map);
			return retVal;
		}
	}
		
	var intrmyAgt3Path;
	var intrmyAgt3;
	intrmyAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3';
	intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
	if(isPatternPresent(message, "<IntrmyAgt3>") && intrmyAgt3)
	{
		var intrmyAgt3name;
		var intrmyAgt3address;
		var intrmyAgt3dept;
		var intrmyAgt3strtnm;
		var intrmyAgt3bldgnm;
		var intrmyAgt3postbox;
		var intrmyAgt3room;
		var intrmyAgt3postlcd;
		var intrmyAgt3twnnm;
		var intrmyAgt3dstrctLocnm;
		var intrmyAgt3dstrctnm;
		var intrmyAgt3cntrySubdiv;
		var intrmyAgt3cntry;

		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
		intrmyAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
		intrmyAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
		intrmyAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
		intrmyAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		intrmyAgt3cntry = getValueFromPath(Document, path);
		if(intrmyAgt3address && (intrmyAgt3dept || intrmyAgt3strtnm || intrmyAgt3bldgnm || intrmyAgt3postbox || intrmyAgt3room || intrmyAgt3postlcd || intrmyAgt3twnnm || intrmyAgt3dstrctLocnm || intrmyAgt3dstrctnm || intrmyAgt3cntrySubdiv || intrmyAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("465", "7928", map);
			return retVal;
		}
	}
		
	var dbtrPath;
	var dbtr;
	dbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr';
	dbtr = getValueFromPath(Document, dbtrPath);
	if(isPatternPresent(message, "<Dbtr>") && dbtr)
	{	
		var dbtrname;
		var dbtraddress;
		var dbtrdept;
		var dbtrstrtnm;
		var dbtrbldgnm;
		var dbtrpostbox;
		var dbtrroom;
		var dbtrpostlcd;
		var dbtrtwnnm;
		var dbtrdstrctLocnm;
		var dbtrdstrctnm;
		var dbtrcntrySubdiv;
		var dbtrcntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/Nm';
		dbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine';
		dbtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Dept';
		dbtrdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/StrtNm';
		dbtrstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/BldgNb';
		dbtrbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/PstBx';
		dbtrpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Room';
		dbtrroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/PstCd';
		dbtrpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnNm';
		dbtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnLctnNm';
		dbtrdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/DstrctNm';
		dbtrdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/CtrySubDvsn';
		dbtrcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Ctry';
		dbtrcntry = getValueFromPath(Document, path);
		if(dbtraddress && (dbtrdept || dbtrstrtnm || dbtrbldgnm || dbtrpostbox || dbtrroom || dbtrpostlcd || dbtrtwnnm || dbtrdstrctLocnm || dbtrdstrctnm || dbtrcntrySubdiv || dbtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("514", "7928", map);
			return retVal;
		}
	}
	
	var dbtrAgtPath;
	var dbtrAgt;
	dbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt';
	dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
	if(isPatternPresent(message, "<DbtrAgt>") && dbtrAgt)
	{
		var dbtrAgtname;
		var dbtrAgtaddress;
		var dbtrAgtdept;
		var dbtrAgtstrtnm;
		var dbtrAgtbldgnm;
		var dbtrAgtpostbox;
		var dbtrAgtroom;
		var dbtrAgtpostlcd;
		var dbtrAgttwnnm;
		var dbtrAgtdstrctLocnm;
		var dbtrAgtdstrctnm;
		var dbtrAgtcntrySubdiv;
		var dbtrAgtcntry;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Dept';
		dbtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
		dbtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
		dbtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
		dbtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Room';
		dbtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
		dbtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		dbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		dbtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
		dbtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		dbtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		dbtrAgtcntry = getValueFromPath(Document, path);
		
		if(dbtrAgtaddress && (dbtrAgtdept || dbtrAgtstrtnm || dbtrAgtbldgnm || dbtrAgtpostbox || dbtrAgtroom || dbtrAgtpostlcd || dbtrAgttwnnm || dbtrAgtdstrctLocnm || dbtrAgtdstrctnm || dbtrAgtcntrySubdiv || dbtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("562", "7928", map);
			return retVal;
		}
	}
	
	var cdtrAgtPath;
	var cdtrAgt;
	cdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt';
	cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
	if(isPatternPresent(message, "<CdtrAgt>") && cdtrAgt)
	{
		var cdtrAgtname;
		var cdtrAgtaddress;
		var cdtrAgtdept;
		var cdtrAgtstrtnm;
		var cdtrAgtbldgnm;
		var cdtrAgtpostbox;
		var cdtrAgtroom;
		var cdtrAgtpostlcd;
		var cdtrAgttwnnm;
		var cdtrAgtdstrctLocnm;
		var cdtrAgtdstrctnm;
		var cdtrAgtcntrySubdiv;
		var cdtrAgtcntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Dept';
		cdtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
		cdtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
		cdtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
		cdtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Room';
		cdtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
		cdtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		cdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		cdtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
		cdtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		cdtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		cdtrAgtcntry = getValueFromPath(Document, path);
		if(cdtrAgtaddress && (cdtrAgtdept || cdtrAgtstrtnm || cdtrAgtbldgnm || cdtrAgtpostbox || cdtrAgtroom || cdtrAgtpostlcd || cdtrAgttwnnm || cdtrAgtdstrctLocnm || cdtrAgtdstrctnm || cdtrAgtcntrySubdiv || cdtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("610", "7928", map);
			return retVal;
		}
	}
	
	var cdtrPath;
	var cdtr;
	cdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr';
	cdtr = getValueFromPath(Document, cdtrPath);
	if(isPatternPresent(message, "<Cdtr>") && cdtr)
	{	
		var cdtrname;
		var cdtraddress;
		var cdtrdept;
		var cdtrstrtnm;
		var cdtrbldgnm;
		var cdtrpostbox;
		var cdtrroom;
		var cdtrpostlcd;
		var cdtrtwnnm;
		var cdtrdstrctLocnm;
		var cdtrdstrctnm;
		var cdtrcntrySubdiv;
		var cdtrcntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/Nm';
		cdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine';
		cdtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Dept';
		cdtrdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/StrtNm';
		cdtrstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/BldgNb';
		cdtrbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/PstBx';
		cdtrpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Room';
		cdtrroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/PstCd';
		cdtrpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnNm';
		cdtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnLctnNm';
		cdtrdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/DstrctNm';
		cdtrdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/CtrySubDvsn';
		cdtrcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Ctry';
		cdtrcntry = getValueFromPath(Document, path);
		
		if(cdtraddress && (cdtrdept || cdtrstrtnm || cdtrbldgnm || cdtrpostbox || cdtrroom || cdtrpostlcd || cdtrtwnnm || cdtrdstrctLocnm || cdtrdstrctnm || cdtrcntrySubdiv || cdtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("658", "7928", map);
			return retVal;
		}
	}
	
	var undrCstdbtrPath;
	var undrCstdbtr;
	undrCstdbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr';
	undrCstdbtr = getValueFromPath(Document, undrCstdbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Dbtr>") && undrCstdbtr)
	{
		var undrCstdbtrname;
		var undrCstdbtraddress;
		var undrCstdbtrdept;
		var undrCstdbtrstrtnm;
		var undrCstdbtrbldgnm;
		var undrCstdbtrpostbox;
		var undrCstdbtrroom;
		var undrCstdbtrpostlcd;
		var undrCstdbtrtwnnm;
		var undrCstdbtrdstrctLocnm;
		var undrCstdbtrdstrctnm;
		var undrCstdbtrcntrySubdiv;
		var undrCstdbtrcntry;

		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Nm';
		undrCstdbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
		undrCstdbtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Dept';
		undrCstdbtrdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/StrtNm';
		undrCstdbtrstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/BldgNb';
		undrCstdbtrbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstBx';
		undrCstdbtrpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Room';
		undrCstdbtrroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/PstCd';
		undrCstdbtrpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
		undrCstdbtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnLctnNm';
		undrCstdbtrdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/DstrctNm';
		undrCstdbtrdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/CtrySubDvsn';
		undrCstdbtrcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
		undrCstdbtrcntry = getValueFromPath(Document, path);
		if(undrCstdbtraddress && (undrCstdbtrdept || undrCstdbtrstrtnm || undrCstdbtrbldgnm || undrCstdbtrpostbox || undrCstdbtrroom || undrCstdbtrpostlcd || undrCstdbtrtwnnm || undrCstdbtrdstrctLocnm || undrCstdbtrdstrctnm || undrCstdbtrcntrySubdiv || undrCstdbtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("809", "7928", map);
			return retVal;
		}
	}
	
	var undrCstdbtrAgtPath;
	var undrCstdbtrAgt;
	undrCstdbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt';
	undrCstdbtrAgt = getValueFromPath(Document, undrCstdbtrAgtPath);	
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<DbtrAgt>") && undrCstdbtrAgt)
	{
		var undrCstdbtrAgtname;
		var undrCstdbtrAgtaddress;
		var undrCstdbtrAgtdept;
		var undrCstdbtrAgtstrtnm;
		var undrCstdbtrAgtbldgnm;
		var undrCstdbtrAgtpostbox;
		var undrCstdbtrAgtroom;
		var undrCstdbtrAgtpostlcd;
		var undrCstdbtrAgttwnnm;
		var undrCstdbtrAgtdstrctLocnm;
		var undrCstdbtrAgtdstrctnm;
		var undrCstdbtrAgtcntrySubdiv;
		var undrCstdbtrAgtcntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/Nm';
		undrCstdbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		undrCstdbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Dept';
		undrCstdbtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
		undrCstdbtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
		undrCstdbtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
		undrCstdbtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Room';
		undrCstdbtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
		undrCstdbtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		undrCstdbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstdbtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
		undrCstdbtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstdbtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		undrCstdbtrAgtcntry = getValueFromPath(Document, path);
		
		if(undrCstdbtrAgtaddress && (undrCstdbtrAgtdept || undrCstdbtrAgtstrtnm || undrCstdbtrAgtbldgnm || undrCstdbtrAgtpostbox || undrCstdbtrAgtroom || undrCstdbtrAgtpostlcd || undrCstdbtrAgttwnnm || undrCstdbtrAgtdstrctLocnm || undrCstdbtrAgtdstrctnm || undrCstdbtrAgtcntrySubdiv || undrCstdbtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("871", "7928", map);
			return retVal;
		}
	}

	var undrCstprvsInstgAgt1Path;
	var undrCstprvsInstgAgt1;
	undrCstprvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1';
	undrCstprvsInstgAgt1 = getValueFromPath(Document, undrCstprvsInstgAgt1Path);	
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt1>") && undrCstprvsInstgAgt1)
	{
		var undrCstprvsInstgAgt1name;
		var undrCstprvsInstgAgt1address;
		var undrCstprvsInstgAgt1dept;
		var undrCstprvsInstgAgt1strtnm;
		var undrCstprvsInstgAgt1bldgnm;
		var undrCstprvsInstgAgt1postbox;
		var undrCstprvsInstgAgt1room;
		var undrCstprvsInstgAgt1postlcd;
		var undrCstprvsInstgAgt1twnnm;
		var undrCstprvsInstgAgt1dstrctLocnm;
		var undrCstprvsInstgAgt1dstrctnm;
		var undrCstprvsInstgAgt1cntrySubdiv;
		var undrCstprvsInstgAgt1cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/Nm';
		undrCstprvsInstgAgt1name = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt1address = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
		undrCstprvsInstgAgt1dept = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
		undrCstprvsInstgAgt1strtnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
		undrCstprvsInstgAgt1bldgnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
		undrCstprvsInstgAgt1postbox = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
		undrCstprvsInstgAgt1room = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
		undrCstprvsInstgAgt1postlcd = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		undrCstprvsInstgAgt1twnnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstprvsInstgAgt1dstrctLocnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
		undrCstprvsInstgAgt1dstrctnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstprvsInstgAgt1cntrySubdiv = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		undrCstprvsInstgAgt1cntry = getValueFromPath(Document, path);
	
		if(undrCstprvsInstgAgt1address && (undrCstprvsInstgAgt1dept || undrCstprvsInstgAgt1strtnm || undrCstprvsInstgAgt1bldgnm || undrCstprvsInstgAgt1postbox || undrCstprvsInstgAgt1room || undrCstprvsInstgAgt1postlcd || undrCstprvsInstgAgt1twnnm || undrCstprvsInstgAgt1dstrctLocnm || undrCstprvsInstgAgt1dstrctnm || undrCstprvsInstgAgt1cntrySubdiv || undrCstprvsInstgAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("919", "7928", map);
			return retVal;
		}
	}
	
	var undrCstprvsInstgAgt2Path;
	var undrCstprvsInstgAgt2;
	undrCstprvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2';
	undrCstprvsInstgAgt2 = getValueFromPath(Document, undrCstprvsInstgAgt2Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt2>") && undrCstprvsInstgAgt2)
	{
		
		var undrCstprvsInstgAgt2name;
		var undrCstprvsInstgAgt2address;
		var undrCstprvsInstgAgt2dept;
		var undrCstprvsInstgAgt2strtnm;
		var undrCstprvsInstgAgt2bldgnm;
		var undrCstprvsInstgAgt2postbox;
		var undrCstprvsInstgAgt2room;
		var undrCstprvsInstgAgt2postlcd;
		var undrCstprvsInstgAgt2twnnm;
		var undrCstprvsInstgAgt2dstrctLocnm;
		var undrCstprvsInstgAgt2dstrctnm;
		var undrCstprvsInstgAgt2cntrySubdiv;
		var undrCstprvsInstgAgt2cntry;
		
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/Nm';
		undrCstprvsInstgAgt2name = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt2address = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
		undrCstprvsInstgAgt2dept = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
		undrCstprvsInstgAgt2strtnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
		undrCstprvsInstgAgt2bldgnm = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
		undrCstprvsInstgAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
		undrCstprvsInstgAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
		undrCstprvsInstgAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		undrCstprvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstprvsInstgAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
		undrCstprvsInstgAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstprvsInstgAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		undrCstprvsInstgAgt2cntry = getValueFromPath(Document, path);
		
		if(undrCstprvsInstgAgt2address && (undrCstprvsInstgAgt2dept || undrCstprvsInstgAgt2strtnm || undrCstprvsInstgAgt2bldgnm || undrCstprvsInstgAgt2postbox || undrCstprvsInstgAgt2room || undrCstprvsInstgAgt2postlcd || undrCstprvsInstgAgt2twnnm || undrCstprvsInstgAgt2dstrctLocnm || undrCstprvsInstgAgt2dstrctnm || undrCstprvsInstgAgt2cntrySubdiv || undrCstprvsInstgAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("967", "7928", map);
			return retVal;
		}
	}
	
	var undrCstprvsInstgAgt3Path;
	var undrCstprvsInstgAgt3;
	undrCstprvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3';
	undrCstprvsInstgAgt3 = getValueFromPath(Document, undrCstprvsInstgAgt3Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt3>") && undrCstprvsInstgAgt3)
	{
		
		var undrCstprvsInstgAgt3name;
		var undrCstprvsInstgAgt3address;
		var undrCstprvsInstgAgt3dept;
		var undrCstprvsInstgAgt3strtnm;
		var undrCstprvsInstgAgt3bldgnm;
		var undrCstprvsInstgAgt3postbox;
		var undrCstprvsInstgAgt3room;
		var undrCstprvsInstgAgt3postlcd;
		var undrCstprvsInstgAgt3twnnm;
		var undrCstprvsInstgAgt3dstrctLocnm;
		var undrCstprvsInstgAgt3dstrctnm;
		var undrCstprvsInstgAgt3cntrySubdiv;
		var undrCstprvsInstgAgt3cntry;
		
		
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/Nm';
		undrCstprvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
		undrCstprvsInstgAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
		undrCstprvsInstgAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
		undrCstprvsInstgAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
		undrCstprvsInstgAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
		undrCstprvsInstgAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
		undrCstprvsInstgAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		undrCstprvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstprvsInstgAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
		undrCstprvsInstgAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstprvsInstgAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		undrCstprvsInstgAgt3cntry = getValueFromPath(Document, path);
		
		if(undrCstprvsInstgAgt3address && (undrCstprvsInstgAgt3dept || undrCstprvsInstgAgt3strtnm || undrCstprvsInstgAgt3bldgnm || undrCstprvsInstgAgt3postbox || undrCstprvsInstgAgt3room || undrCstprvsInstgAgt3postlcd || undrCstprvsInstgAgt3twnnm || undrCstprvsInstgAgt3dstrctLocnm || undrCstprvsInstgAgt3dstrctnm || undrCstprvsInstgAgt3cntrySubdiv || undrCstprvsInstgAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1015", "7928", map);
			return retVal;
		}
	}
	
	var undrCstintrmyAgt1Path;
	var undrCstintrmyAgt1;
	undrCstintrmyAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1';
	undrCstintrmyAgt1 = getValueFromPath(Document, undrCstintrmyAgt1Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt1>") && undrCstintrmyAgt1)
	{
		
		var undrCstintrmyAgt1name;
		var undrCstintrmyAgt1address;
		var undrCstintrmyAgt1dept;
		var undrCstintrmyAgt1strtnm;
		var undrCstintrmyAgt1bldgnm;
		var undrCstintrmyAgt1postbox;
		var undrCstintrmyAgt1room;
		var undrCstintrmyAgt1postlcd;
		var undrCstintrmyAgt1twnnm;
		var undrCstintrmyAgt1dstrctLocnm;
		var undrCstintrmyAgt1dstrctnm;
		var undrCstintrmyAgt1cntrySubdiv;
		var undrCstintrmyAgt1cntry;
		
		
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/Nm';
		undrCstintrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
		undrCstintrmyAgt1dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
		undrCstintrmyAgt1strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
		undrCstintrmyAgt1bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
		undrCstintrmyAgt1postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
		undrCstintrmyAgt1room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
		undrCstintrmyAgt1postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		undrCstintrmyAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstintrmyAgt1dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
		undrCstintrmyAgt1dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstintrmyAgt1cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		undrCstintrmyAgt1cntry = getValueFromPath(Document, path);
		
		if(undrCstintrmyAgt1address && (undrCstintrmyAgt1dept || undrCstintrmyAgt1strtnm || undrCstintrmyAgt1bldgnm || undrCstintrmyAgt1postbox || undrCstintrmyAgt1room || undrCstintrmyAgt1postlcd || undrCstintrmyAgt1twnnm || undrCstintrmyAgt1dstrctLocnm || undrCstintrmyAgt1dstrctnm || undrCstintrmyAgt1cntrySubdiv || undrCstintrmyAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1063", "7928", map);
			return retVal;
		}
	}
		
	var undrCstintrmyAgt2Path;
	var undrCstintrmyAgt2;
	undrCstintrmyAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2';
	undrCstintrmyAgt2 = getValueFromPath(Document, undrCstintrmyAgt2Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt2>") && undrCstintrmyAgt2)
	{	
		var undrCstintrmyAgt2name;
		var undrCstintrmyAgt2address;
		var undrCstintrmyAgt2dept;
		var undrCstintrmyAgt2strtnm;
		var undrCstintrmyAgt2bldgnm;
		var undrCstintrmyAgt2postbox;
		var undrCstintrmyAgt2room;
		var undrCstintrmyAgt2postlcd;
		var undrCstintrmyAgt2twnnm;
		var undrCstintrmyAgt2dstrctLocnm;
		var undrCstintrmyAgt2dstrctnm;
		var undrCstintrmyAgt2cntrySubdiv;
		var undrCstintrmyAgt2cntry;

		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/Nm';
		undrCstintrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
		undrCstintrmyAgt2dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
		undrCstintrmyAgt2strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
		undrCstintrmyAgt2bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
		undrCstintrmyAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
		undrCstintrmyAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
		undrCstintrmyAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		undrCstintrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstintrmyAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
		undrCstintrmyAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstintrmyAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		undrCstintrmyAgt2cntry = getValueFromPath(Document, path);
		
		if(undrCstintrmyAgt2address && (undrCstintrmyAgt2dept || undrCstintrmyAgt2strtnm || undrCstintrmyAgt2bldgnm || undrCstintrmyAgt2postbox || undrCstintrmyAgt2room || undrCstintrmyAgt2postlcd || undrCstintrmyAgt2twnnm || undrCstintrmyAgt2dstrctLocnm || undrCstintrmyAgt2dstrctnm || undrCstintrmyAgt2cntrySubdiv || undrCstintrmyAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1111", "7928", map);
			return retVal;
		}
	}
		
	var undrCstintrmyAgt3Path;
	var undrCstintrmyAgt3;
	undrCstintrmyAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3';
	undrCstintrmyAgt3 = getValueFromPath(Document, undrCstintrmyAgt3Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt3>") && undrCstintrmyAgt3)
	{
		
		var undrCstintrmyAgt3name;
		var undrCstintrmyAgt3address;
		var undrCstintrmyAgt3dept;
		var undrCstintrmyAgt3strtnm;
		var undrCstintrmyAgt3bldgnm;
		var undrCstintrmyAgt3postbox;
		var undrCstintrmyAgt3room;
		var undrCstintrmyAgt3postlcd;
		var undrCstintrmyAgt3twnnm;
		var undrCstintrmyAgt3dstrctLocnm;
		var undrCstintrmyAgt3dstrctnm;
		var undrCstintrmyAgt3cntrySubdiv;
		var undrCstintrmyAgt3cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/Nm';
		undrCstintrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
		undrCstintrmyAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
		undrCstintrmyAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
		undrCstintrmyAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
		undrCstintrmyAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
		undrCstintrmyAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
		undrCstintrmyAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		undrCstintrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstintrmyAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
		undrCstintrmyAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstintrmyAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		undrCstintrmyAgt3cntry = getValueFromPath(Document, path);
		
		if(undrCstintrmyAgt3address && (undrCstintrmyAgt3dept || undrCstintrmyAgt3strtnm || undrCstintrmyAgt3bldgnm || undrCstintrmyAgt3postbox || undrCstintrmyAgt3room || undrCstintrmyAgt3postlcd || undrCstintrmyAgt3twnnm || undrCstintrmyAgt3dstrctLocnm || undrCstintrmyAgt3dstrctnm || undrCstintrmyAgt3cntrySubdiv || undrCstintrmyAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1159", "7928", map);
			return retVal;
		}
	}
	
	var undrCstcdtrAgtPath;
	var undrCstcdtrAgt;
	undrCstcdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt';
	undrCstcdtrAgt = getValueFromPath(Document, undrCstcdtrAgtPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<CdtrAgt>") && undrCstcdtrAgt)
	{	
		var undrCstcdtrAgtname;
		var undrCstcdtrAgtaddress;
		var undrCstcdtrAgtdept;
		var undrCstcdtrAgtstrtnm;
		var undrCstcdtrAgtbldgnm;
		var undrCstcdtrAgtpostbox;
		var undrCstcdtrAgtroom;
		var undrCstcdtrAgtpostlcd;
		var undrCstcdtrAgttwnnm;
		var undrCstcdtrAgtdstrctLocnm;
		var undrCstcdtrAgtdstrctnm;
		var undrCstcdtrAgtcntrySubdiv;
		var undrCstcdtrAgtcntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/Nm';
		undrCstcdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		undrCstcdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Dept';
		undrCstcdtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
		undrCstcdtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
		undrCstcdtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
		undrCstcdtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Room';
		undrCstcdtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
		undrCstcdtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		undrCstcdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		undrCstcdtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
		undrCstcdtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		undrCstcdtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		undrCstcdtrAgtcntry = getValueFromPath(Document, path);
		if(undrCstcdtrAgtaddress && (undrCstcdtrAgtdept || undrCstcdtrAgtstrtnm || undrCstcdtrAgtbldgnm || undrCstcdtrAgtpostbox || undrCstcdtrAgtroom || undrCstcdtrAgtpostlcd || undrCstcdtrAgttwnnm || undrCstcdtrAgtdstrctLocnm || undrCstcdtrAgtdstrctnm || undrCstcdtrAgtcntrySubdiv || undrCstcdtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1207", "7928", map);
			return retVal;
		}
	}
	
	var undrCstcdtrPath;
	var undrCstcdtr;
	undrCstcdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr';
	undrCstcdtr = getValueFromPath(Document, undrCstcdtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Cdtr>") && undrCstcdtr)
	{
		var undrCstcdtrname;
		var undrCstcdtraddress;
		var undrCstcdtrdept;
		var undrCstcdtrstrtnm;
		var undrCstcdtrbldgnm;
		var undrCstcdtrpostbox;
		var undrCstcdtrroom;
		var undrCstcdtrpostlcd;
		var undrCstcdtrtwnnm;
		var undrCstcdtrdstrctLocnm;
		var undrCstcdtrdstrctnm;
		var undrCstcdtrcntrySubdiv;
		var undrCstcdtrcntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/Nm';
		undrCstcdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
		undrCstcdtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Dept';
		undrCstcdtrdept = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/StrtNm';
		undrCstcdtrstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/BldgNb';
		undrCstcdtrbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstBx';
		undrCstcdtrpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Room';
		undrCstcdtrroom = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/PstCd';
		undrCstcdtrpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
		undrCstcdtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnLctnNm';
		undrCstcdtrdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/DstrctNm';
		undrCstcdtrdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/CtrySubDvsn';
		undrCstcdtrcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
		undrCstcdtrcntry = getValueFromPath(Document, path);
		
		if(undrCstcdtraddress && (undrCstcdtrdept || undrCstcdtrstrtnm || undrCstcdtrbldgnm || undrCstcdtrpostbox || undrCstcdtrroom || undrCstcdtrpostlcd || undrCstcdtrtwnnm || undrCstcdtrdstrctLocnm || undrCstcdtrdstrctnm || undrCstcdtrcntrySubdiv || undrCstcdtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1263", "7928", map);
			return retVal;
		}
	}
	
	return retVal;
	
}

function validatePostalAddressRule3FedPacs009(Document, map) {  //
	logger.info("In validatePostalAddressRule3FedPacs009");

	var path;
	var retVal = 0;
	
	var message = inMsg.getBody(java.lang.String.class);
	
	var prvsInstgAgt1Path;
	var prvsInstgAgt1;
	prvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
	prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
	if(isPatternPresent(message, "<PrvsInstgAgt1>") && prvsInstgAgt1)
	{	
		var prvsInstgAgt1pstladdress;
		var prvsInstgAgt1address;
		var prvsInstgAgt1twnnm;
		var prvsInstgAgt1cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt1cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt1pstladdress)
		{
			if(!prvsInstgAgt1address && (!prvsInstgAgt1twnnm || !prvsInstgAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("199", "7926", map);
				return retVal;
			}
		}
	}
	
	var prvsInstgAgt2Path;
	var prvsInstgAgt2;
	prvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
	prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
	if(isPatternPresent(message, "<PrvsInstgAgt2>") && prvsInstgAgt2)
	{	
		var prvsInstgAgt2pstladdress;
		var prvsInstgAgt2address;
		var prvsInstgAgt2twnnm;
		var prvsInstgAgt2cntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt2cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt2pstladdress)
		{
			if(!prvsInstgAgt2address && (!prvsInstgAgt2twnnm || !prvsInstgAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("247", "7926", map);
				return retVal;
			}
		}
	}
	
	var prvsInstgAgt3Path;
	var prvsInstgAgt3;
	prvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
	prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
	if(isPatternPresent(message, "<PrvsInstgAgt3>") && prvsInstgAgt3)
	{
		var prvsInstgAgt3pstladdress;
		var prvsInstgAgt3address;
		var prvsInstgAgt3twnnm;
		var prvsInstgAgt3cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt3cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt3pstladdress)
		{
			if(!prvsInstgAgt3address && (!prvsInstgAgt3twnnm || !prvsInstgAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("295", "7926", map);
				return retVal;
			}
		}
	}
	
	var intrmyAgt1Path;
	var intrmyAgt1;
	intrmyAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1';
	intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
	if(isPatternPresent(message, "<IntrmyAgt1>") && intrmyAgt1)
	{	
		var intrmyAgt1pstladdress;
		var intrmyAgt1address;
		var intrmyAgt1twnnm;
		var intrmyAgt1cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		intrmyAgt1cntry = getValueFromPath(Document, path);
	
		if(intrmyAgt1pstladdress)
		{
			if(!intrmyAgt1address && (!intrmyAgt1twnnm || !intrmyAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("369", "7926", map);
				return retVal;
			}
		}
	}
		
	var intrmyAgt2Path;
	var intrmyAgt2;
	intrmyAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2';
	intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
	if(isPatternPresent(message, "<IntrmyAgt2>") && intrmyAgt2)
	{	
		var intrmyAgt2pstladdress;
		var intrmyAgt2address;
		var intrmyAgt2twnnm;
		var intrmyAgt2cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		intrmyAgt2cntry = getValueFromPath(Document, path);
	
		if(intrmyAgt2pstladdress)
		{
			if(!intrmyAgt2address && (!intrmyAgt2twnnm || !intrmyAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("417", "7926", map);
				return retVal;
			}
		}
	}
	
	var intrmyAgt3Path;
	var intrmyAgt3;
	intrmyAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3';
	intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
	if(isPatternPresent(message, "<IntrmyAgt3>") && intrmyAgt3)
	{	
		var intrmyAgt3pstladdress;
		var intrmyAgt3address;
		var intrmyAgt3twnnm;
		var intrmyAgt3cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		intrmyAgt3cntry = getValueFromPath(Document, path);
	
		if(intrmyAgt3pstladdress)
		{
			if(!intrmyAgt3address && (!intrmyAgt3twnnm || !intrmyAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("465", "7926", map);
				return retVal;
			}
		}
	}
	
	var dbtrPath;
	var dbtr;
	dbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr';
	dbtr = getValueFromPath(Document, dbtrPath);
	if(isPatternPresent(message, "<Dbtr>") && dbtr)
	{	
		var dbtrpstladdress;
		var dbtraddress;
		var dbtrtwnnm;
		var dbtrcntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr';
		dbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/AdrLine';
		dbtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/TwnNm';
		dbtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/PstlAdr/Ctry';
		dbtrcntry = getValueFromPath(Document, path);
		
		if(dbtrpstladdress)
		{
			if(!dbtraddress && (!dbtrtwnnm || !dbtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("514", "7926", map);
				return retVal;
			}
		}
	}
	
	var dbtrAgtPath;
	var dbtrAgt;
	dbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt';
	dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
	if(isPatternPresent(message, "<DbtrAgt>") && dbtrAgt)
	{
		var dbtrAgtpstladdress;
		var dbtrAgtaddress;
		var dbtrAgttwnnm;
		var dbtrAgtcntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		dbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		dbtrAgtcntry = getValueFromPath(Document, path);
		
		if(dbtrAgtpstladdress)
		{
			if(!dbtrAgtaddress && (!dbtrAgttwnnm || !dbtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("562", "7926", map);
				return retVal;
			}
		}
	}
	
	var cdtrAgtPath;
	var cdtrAgt;
	cdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt';
	cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
	if(isPatternPresent(message, "<CdtrAgt>") && cdtrAgt)
	{
		var cdtrAgtpstladdress;
		var cdtrAgtaddress;
		var cdtrAgttwnnm;
		var cdtrAgtcntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		cdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		cdtrAgtcntry = getValueFromPath(Document, path);
	
		if(cdtrAgtpstladdress)
		{
			if(!cdtrAgtaddress && (!cdtrAgttwnnm || !cdtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("610", "7926", map);
				return retVal;
			}
		}
	}
	
	var cdtrPath;
	var cdtr;
	cdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr';
	cdtr = getValueFromPath(Document, cdtrPath);
	if(isPatternPresent(message, "<Cdtr>") && cdtr)
	{
		var cdtrpstladdress;
		var cdtraddress;
		var cdtrtwnnm;
		var cdtrcntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr';
		cdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/AdrLine';
		cdtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/TwnNm';
		cdtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/PstlAdr/Ctry';
		cdtrcntry = getValueFromPath(Document, path);
	
		if(cdtrpstladdress)
		{
			if(!cdtraddress && (!cdtrtwnnm || !cdtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("658", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstdbtrPath;
	var undrCstdbtr;
	undrCstdbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr';
	undrCstdbtr = getValueFromPath(Document, dbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Dbtr>") && undrCstdbtr)
	{
		var undrCstdbtrpstladdress;
		var undrCstdbtraddress;
		var undrCstdbtrtwnnm;
		var undrCstdbtrcntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr';
		undrCstdbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/AdrLine';
		undrCstdbtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/TwnNm';
		undrCstdbtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr/Ctry';
		undrCstdbtrcntry = getValueFromPath(Document, path);
		
		if(undrCstdbtrpstladdress)
		{
			if(!undrCstdbtraddress && (!undrCstdbtrtwnnm || !undrCstdbtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("809", "7926", map);
				return retVal;
			}
		}
	}

	var undrCstdbtrAgtPath;
	var undrCstdbtrAgt;
	undrCstdbtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt';
	undrCstdbtrAgt = getValueFromPath(Document, undrCstdbtrAgtPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<DbtrAgt>") && undrCstdbtrAgt)
	{
		var undrCstdbtrAgtpstladdress;
		var undrCstdbtrAgtaddress;
		var undrCstdbtrAgttwnnm;
		var undrCstdbtrAgtcntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr';
		undrCstdbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		undrCstdbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		undrCstdbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		undrCstdbtrAgtcntry = getValueFromPath(Document, path);
		
		if(undrCstdbtrAgtpstladdress)
		{
			if(!undrCstdbtrAgtaddress && (!undrCstdbtrAgttwnnm || !undrCstdbtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("871", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstprvsInstgAgt1Path;
	var undrCstprvsInstgAgt1;
	undrCstprvsInstgAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
	undrCstprvsInstgAgt1 = getValueFromPath(Document, undrCstprvsInstgAgt1Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt1>") && undrCstprvsInstgAgt1)
	{
		var undrCstprvsInstgAgt1pstladdress;
		var undrCstprvsInstgAgt1address;
		var undrCstprvsInstgAgt1twnnm;
		var undrCstprvsInstgAgt1cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		undrCstprvsInstgAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		undrCstprvsInstgAgt1cntry = getValueFromPath(Document, path);
		
		if(undrCstprvsInstgAgt1pstladdress)
		{
			if(!undrCstprvsInstgAgt1address && (!undrCstprvsInstgAgt1twnnm || !undrCstprvsInstgAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("919", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstprvsInstgAgt2Path;
	var undrCstprvsInstgAgt2;
	undrCstprvsInstgAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2';
	undrCstprvsInstgAgt2 = getValueFromPath(Document, undrCstprvsInstgAgt2Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt2>") && undrCstprvsInstgAgt2)
	{	
		var undrCstprvsInstgAgt2pstladdress;
		var undrCstprvsInstgAgt2address;
		var undrCstprvsInstgAgt2twnnm;
		var undrCstprvsInstgAgt2cntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		undrCstprvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		undrCstprvsInstgAgt2cntry = getValueFromPath(Document, path);
	
		if(undrCstprvsInstgAgt2pstladdress)
		{
			if(!undrCstprvsInstgAgt2address && (!undrCstprvsInstgAgt2twnnm || !undrCstprvsInstgAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("967", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstprvsInstgAgt3Path;
	var undrCstprvsInstgAgt3;
	undrCstprvsInstgAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3';
	undrCstprvsInstgAgt3 = getValueFromPath(Document, undrCstprvsInstgAgt3Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<PrvsInstgAgt3>") && undrCstprvsInstgAgt3)
	{	
		var undrCstprvsInstgAgt3pstladdress;
		var undrCstprvsInstgAgt3address;
		var undrCstprvsInstgAgt3twnnm;
		var undrCstprvsInstgAgt3cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		undrCstprvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		undrCstprvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		undrCstprvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		undrCstprvsInstgAgt3cntry = getValueFromPath(Document, path);
	
		if(undrCstprvsInstgAgt3pstladdress)
		{
			if(!undrCstprvsInstgAgt3address && (!undrCstprvsInstgAgt3twnnm || !undrCstprvsInstgAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1015", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstintrmyAgt1Path;
	var undrCstintrmyAgt1;
	undrCstintrmyAgt1Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1';
	undrCstintrmyAgt1 = getValueFromPath(Document, undrCstintrmyAgt1Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt1>") && undrCstintrmyAgt1)
	{	
		var undrCstintrmyAgt1pstladdress;
		var undrCstintrmyAgt1address;
		var undrCstintrmyAgt1twnnm;
		var undrCstintrmyAgt1cntry;
	
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr';
		undrCstintrmyAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		undrCstintrmyAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		undrCstintrmyAgt1cntry = getValueFromPath(Document, path);
	
		if(undrCstintrmyAgt1pstladdress)
		{
			if(!undrCstintrmyAgt1address && (!undrCstintrmyAgt1twnnm || !undrCstintrmyAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1063", "7926", map);
				return retVal;
			}
		}
	}
		
	var undrCstintrmyAgt2Path;
	var undrCstintrmyAgt2;
	undrCstintrmyAgt2Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2';
	undrCstintrmyAgt2 = getValueFromPath(Document, undrCstintrmyAgt2Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt2>") && undrCstintrmyAgt2)
	{
		var undrCstintrmyAgt2pstladdress;
		var undrCstintrmyAgt2address;
		var undrCstintrmyAgt2twnnm;
		var undrCstintrmyAgt2cntry;
			
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr';
		undrCstintrmyAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		undrCstintrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		undrCstintrmyAgt2cntry = getValueFromPath(Document, path);
	
		if(undrCstintrmyAgt2pstladdress)
		{
			if(!undrCstintrmyAgt2address && (!undrCstintrmyAgt2twnnm || !undrCstintrmyAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1111", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstintrmyAgt3Path;
	var undrCstintrmyAgt3;
	undrCstintrmyAgt3Path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3';
	undrCstintrmyAgt3 = getValueFromPath(Document, undrCstintrmyAgt3Path);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<IntrmyAgt3>") && undrCstintrmyAgt3)
	{	
		var undrCstintrmyAgt3pstladdress;
		var undrCstintrmyAgt3address;
		var undrCstintrmyAgt3twnnm;
		var undrCstintrmyAgt3cntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr';
		undrCstintrmyAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		undrCstintrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		undrCstintrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		undrCstintrmyAgt3cntry = getValueFromPath(Document, path);
	
		if(undrCstintrmyAgt3pstladdress)
		{
			if(!undrCstintrmyAgt3address && (!undrCstintrmyAgt3twnnm || !undrCstintrmyAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1159", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstcdtrAgtPath;
	var undrCstcdtrAgt;
	undrCstcdtrAgtPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt';
	undrCstcdtrAgt = getValueFromPath(Document, undrCstcdtrAgtPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<CdtrAgt>") && undrCstcdtrAgt)
	{
		var undrCstcdtrAgtpstladdress;
		var undrCstcdtrAgtaddress;
		var undrCstcdtrAgttwnnm;
		var undrCstcdtrAgtcntry;
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr';
		undrCstcdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		undrCstcdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		undrCstcdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		undrCstcdtrAgtcntry = getValueFromPath(Document, path);
	
		if(undrCstcdtrAgtpstladdress)
		{
			if(!undrCstcdtrAgtaddress && (!undrCstcdtrAgttwnnm || !undrCstcdtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1207", "7926", map);
				return retVal;
			}
		}
	}
	
	var undrCstcdtrPath;
	var undrCstcdtr;
	undrCstcdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr';
	undrCstcdtr = getValueFromPath(Document, undrCstcdtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Cdtr>") && undrCstcdtr)
	{
		
		var undrCstcdtrpstladdress;
		var undrCstcdtraddress;
		var undrCstcdtrtwnnm;
		var undrCstcdtrcntry;
		
		
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr';
		undrCstcdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/AdrLine';
		undrCstcdtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/TwnNm';
		undrCstcdtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr/Ctry';
		undrCstcdtrcntry = getValueFromPath(Document, path);
	
		if(undrCstcdtrpstladdress)
		{
			if(!undrCstcdtraddress && (!undrCstcdtrtwnnm || !undrCstcdtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1263", "7926", map);
				return retVal;
			}
		}
	}
	
	return retVal;
	
}

function validatePersonTransparency_IRSRuleFedPacs009(Document, map) {  //
	logger.info("In validatePersonTransparency_IRSRuleFedPacs009");

	var path;
	var retVal = 0;
	var message = inMsg.getBody(java.lang.String.class);
	
	var ultmtDbtrPath;
	var ultmtDbtr;
	ultmtDbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr';
	ultmtDbtr = getValueFromPath(Document, ultmtDbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<UltmtDbtr>") && ultmtDbtr)
	{
		var biccodePath;
		var biccode;
		var name;
		var address;
		biccodePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtDbtr/PstlAdr';
		address = getValueFromPath(Document, path);
		
		/* if(!biccode)
		{
			if((!name && !address) || (name && !address) || (!name && address))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("723", "7948", map);
				return retVal;
			}			
		} */
		if(!biccode && !name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("723", "7948", map);
			return retVal;
		}
	}
	
	var initgPtyPath;
	var initgPty;
	initgPtyPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty';
	initgPty = getValueFromPath(Document, initgPtyPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<InitgPty>") && initgPty)
	{
		var initgPtybiccodePath;
		var initgPtybiccode;
		var initgPtyname;
		var initgPtyaddress;
		
		initgPtybiccodePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/Id/OrgId/AnyBIC';
		initgPtybiccode = getValueFromPath(Document, initgPtybiccodePath);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/Nm';
		initgPtyname = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/InitgPty/PstlAdr';
		initgPtyaddress = getValueFromPath(Document, path);
		/* if(!initgPtybiccode)
		{
			if((!initgPtyname && !initgPtyaddress) || (initgPtyname && !initgPtyaddress) || (!initgPtyname && initgPtyaddress))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("766", "7948", map);
				return retVal;
			}
		} */
		if(!initgPtybiccode && !initgPtyname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("766", "7948", map);
			return retVal;
		}
		
	}
	
	var dbtrPath;
	var dbtr;
	dbtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr';
	dbtr = getValueFromPath(Document, dbtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Dbtr>") && dbtr)
	{
		var dbtrbiccodePath;
		var dbtrbiccode;
		var dbtryname;
		var dbtraddress;
		dbtrbiccodePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Id/OrgId/AnyBIC';
		dbtrbiccode = getValueFromPath(Document, dbtrbiccodePath);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/Nm';
		dbtrname = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Dbtr/PstlAdr';
		dbtraddress = getValueFromPath(Document, path);
		/* if(!dbtrbiccode)
		{
			if((!dbtrname && !dbtraddress) || (dbtrname && !dbtraddress) || (!dbtrname && dbtraddress))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("809", "7948", map);
				return retVal;
			}
		} */
		if(!dbtrbiccode && !dbtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("809", "7948", map);
			return retVal;
		}
	}
	
	var cdtrPath;
	var cdtr;
	cdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr';
	cdtr = getValueFromPath(Document, cdtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<Cdtr>") && cdtr)
	{
		var cdtrbiccodePath;
		var cdtrbiccode;
		var cdtrname;
		var cdtraddress;
		cdtrbiccodePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/Id/OrgId/AnyBIC';
		cdtrbiccode = getValueFromPath(Document, cdtrbiccodePath);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/Nm';
		cdtrname = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/Cdtr/PstlAdr';
		cdtraddress = getValueFromPath(Document, path);
		/* if(!cdtrbiccode)
		{
			if((!cdtrname && !cdtraddress) || (cdtrname && !cdtraddress) || (!cdtrname && cdtraddress))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1263", "7948", map);
				return retVal;
			}
		} */
		if(!cdtrbiccode && !cdtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1263", "7948", map);
			return retVal;
		}
	}
	
	var ultmtCdtrPath;
	var ultmtCdtr;
	ultmtCdtrPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr';
	ultmtCdtr = getValueFromPath(Document, ultmtCdtrPath);
	if(isPatternPresent(message, "<UndrlygCstmrCdtTrf>") && isPatternPresent(message, "<UltmtCdtr>") && ultmtCdtr)
	{
		var ultmtCdtrbiccodePath;
		var ultmtCdtrbiccode;
		var ultmtCdtrname;
		var ultmtCdtraddress;
		ultmtCdtrbiccodePath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/Id/OrgId/AnyBIC';
		ultmtCdtrbiccode = getValueFromPath(Document, ultmtCdtrbiccodePath);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/Nm';
		ultmtCdtrname = getValueFromPath(Document, path);
		path = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/UltmtCdtr/PstlAdr';
		ultmtCdtraddress = getValueFromPath(Document, path);
		/* if(!ultmtCdtrbiccode)
		{
			if((!ultmtCdtrname && !ultmtCdtraddress) || ultmtCdtrname && !ultmtCdtraddress || !ultmtCdtrname && ultmtCdtraddress)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1325", "7948", map);
				return retVal;
			}
		} */
		if(!ultmtCdtrbiccode && !ultmtCdtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1325", "7948", map);
			return retVal;
		}
	}
	
	return retVal;
	
}

function validateRemittanceInformationRule1FedPacs009(Document, map) {  //R71
	logger.info("In validateRemittanceInformationRule1FedPacs009");
	
	var ustrdPath;
	var ustrd;
	var strdpath;
	var strd;
	var retVal = 0;
	
	ustrdPath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Ustrd';
	ustrd = getValueFromPath(Document, ustrdPath);
	
	strdpath = '/Document/FICdtTrf/CdtTrfTxInf/UndrlygCstmrCdtTrf/RmtInf/Strd';
	strd = getValueFromPath(Document, strdpath);
	
	if(ustrd && strd) 
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1368", "7635", map);
		return retVal;
	}
	return retVal;
}

