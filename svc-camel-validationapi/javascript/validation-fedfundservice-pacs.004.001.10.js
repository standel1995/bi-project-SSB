function msgValidationFedPacs004(exchange)
{
	logger.trace("msgValidationFedPacs004");
	var result;
	var inMsg;
	var map;

	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	logger.trace("In msgValidationFedPacs004");

	setHeader(map, "txnForceStopCounter", 0);
	setHeader(map, "errorCountAdd", "Y"); //for testing
	logger.trace("errorCountAdd: " + getHeader(map,"errorCountAdd"));
	setHeader(map,"PLCN_validMessage", true);
	setHeader(map, "validFlag", true);

	wrprcbprPacs004Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));
	
	wrapperFedPacs004Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationFedPacs004: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "repair");
	}
}

function wrapperFedPacs004Mx(exchange) {
	var retVal = 0;
	var pacs04ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedPacs004Mx:In wrprcbprPacs004Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	pacs04ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS08_VALD_FLAG_MX");
	pacs04ValdFlagMx = pacs04ValdFlagMx.trim();
	logger.info("pacs04ValdFlagMx = " + pacs04ValdFlagMx);

	if(pacs04ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedPacs004Mx: Calling cbprValidationRulesPacs004");
		retVal = fedValidationRulesPacs004(pacs04ValdFlagMx, exchange);
		logger.info("wrapperFedPacs004Mx: retVal from cbprValidationRulesPacs004 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedPacs004Mx: txnComments = " + txnComments);

		if(retVal == 0) {
			logger.info("wrapperFedPacs004Mx: Calling externalCodelistValidationFedPacs004");
			retVal = externalCodelistValidationFedPacs004(exchange);		
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.info("txnComments from externalCodelistValidationFedPacs004 = " + txnComments);			
		}
	}

	if(pacs04ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedPacs004Mx: Calling fedValidationRulesPacs004");
		retVal = fedValidationRulesPacs004(pacs04ValdFlagMx, exchange);
		logger.info("wrapperFedPacs004Mx: retVal from fedValidationRulesPacs004 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedPacs004Mx: txnComments = " + txnComments);

		logger.info("wrapperFedPacs004Mx: Calling externalCodelistValidationFedPacs004");
		retVal = externalCodelistValidationFedPacs004(exchange);		
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("txnComments from externalCodelistValidationFedPacs004 = " + txnComments);			
		
	}
}

function fedValidationRulesPacs004(pacs04ValdFlagMx, exchange){
	logger.info("fedValidationRulesPacs004");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	if(pacs04ValdFlagMx == "ERROR") 
	{
		logger.info("In if loop");

		//pacs004 cbpr example below
		//retVal = orgnlMessageIdentificationPacs004(Document, map);
		//if(retVal != 0) {
		//	return retVal;
		//}
		
		//pacs004 fed start below
		
		retVal = validateMaximumAmountRuleFedPacs004(Document, map);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = validateFITransparencyRuleFedPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
		retVal = validatePostalAddressRule1FedPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
		retVal = validatePostalAddressRule2FedPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
		retVal = validatePostalAddressRule3FedPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
		retVal = validatePersonTransparency_IRSRuleFedPacs004(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
	}
	return retVal;
}


function validateMaximumAmountRuleFedPacs004(Document, map) {  //R3
	logger.info("In validateMaximumAmountRuleFedPacs004");
	var pathamount;
	var amount;
	
	var retVal = 0;
	pathamount = '/Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt';
	amount = getValueFromPath(Document, pathamount);
	logger.trace("validateMaximumAmountRuleFedPacs004: amount = " + amount);
	logger.info("validateMaximumAmountRuleFedPacs008: typeof amount = " + typeof amount);
	var amount1 = parseInt(amount);
	logger.info("validateMaximumAmountRuleFedPacs008: typeof amount = " + typeof amount1);
	if(amount1 < 0.00 || amount1 > 9999999999.99)
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("179", "7641", map);
		//if InstdAgt contains one of the Treasury tax payment RTNs, then name of the tax payer must be provided in the Creditor
		return retVal;
	}
	return retVal;
}

function externalCodelistValidationFedPacs004(exchange) {
	var val;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	logger.info("In externalCodelistValidationCbpr");

	//pacs004 cbpr example below
	val = externalReturnReasonCodeGuidelineFedPacs004(exchange);
	if(val) {
		retVal = val;
	}

	//pacs004 fed start below
	
	
	return retVal;
}

function validateFITransparencyRuleFedPacs004(exchange) {  //
	logger.info("In validateFITransparencyRuleFedPacs004");
	
	var path;
	var retVal = 0;
	
	logger.info('wrapperFedPacs004Mx:In wrprcbprPacs004Mx');
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	var message = inMsg.getBody(java.lang.String.class);
	
	if(isPatternPresent(message, "<ChrgsInf>"))
	{
		var bicCodePath;
		var bicCode;
		var name;
		var address;
		var chrgsInf;
		var chrgsInfPath;
		chrgsInfPath = '/Document/PmtRtr/TxInf/ChrgsInf';
		chrgsInf = getValueFromPath(Document, chrgsInfPath);
		
		bicCodePath = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/BICFI';
		bicCode = getValueFromPath(Document, bicCodePath);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/Nm';
		name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr';
		address = getValueFromPath(Document, path);
		
		if(!bicCode)
			{
				if((!name && !address) || (name && !address) || (!name && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("201", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrPath;
		var dbtrVal;
		var dbtrbicpath;
		var dbtrbicCode;
		var dbtrname;
		var dbtraddress;
		
		var dbtrPtyPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty';
		var dbtrPty = getValueFromPath(Document, dbtrPtyPath);
		
		var dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt';
		var dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		if(dbtrAgt)
		{
			dbtrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr';
			dbtrVal = getValueFromPath(Document, dbtrPath);
			
			dbtrbicpath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/BICFI';
			dbtrbicCode = getValueFromPath(Document, dbtrbicpath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/Nm';
			dbtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr';
			dbtraddress = getValueFromPath(Document, path);
			
			if(!dbtrbicCode)
			{
				if((!dbtrname && !dbtraddress) || (dbtrname && !dbtraddress) || (!dbtrname && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("304", "7927", map);
					return retVal;	
				}
			}
		}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgtVal;
		var dbtrAgtbicpath;
		var dbtrAgtbicCode;
		var dbtrAgtname;
		var dbtrAgtaddress;
		
		dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt';
		dbtrAgtVal = getValueFromPath(Document, dbtrAgtPath);
		
		dbtrAgtbicpath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/BICFI';
		dbtrAgtbicCode = getValueFromPath(Document, dbtrAgtbicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtaddress = getValueFromPath(Document, path);
		
		if(!dbtrAgtbicCode)
			{
				if((!dbtrAgtname && !dbtrAgtaddress) || (dbtrAgtname && !dbtrAgtaddress) || (!dbtrAgtname && dbtrAgtaddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("422", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1Val;
		var prvsInstgAgt1bicpath;
		var prvsInstgAgt1bicCode;
		var prvsInstgAgt1name;
		var prvsInstgAgt1address;
		
		prvsInstgAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1';
		prvsInstgAgt1Val = getValueFromPath(Document, prvsInstgAgt1Path);
		
		prvsInstgAgt1bicpath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/BICFI';
		prvsInstgAgt1bicCode = getValueFromPath(Document, prvsInstgAgt1bicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		if(!prvsInstgAgt1bicCode)
			{
				if((!prvsInstgAgt1name && !prvsInstgAgt1address) || (prvsInstgAgt1name && !prvsInstgAgt1address) || (!prvsInstgAgt1name && prvsInstgAgt1address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("451", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2Val;
		var prvsInstgAgt2bicpath;
		var prvsInstgAgt2bicCode;
		var prvsInstgAgt2name;
		var prvsInstgAgt2address;
		
		prvsInstgAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2';
		prvsInstgAgt2Val = getValueFromPath(Document, prvsInstgAgt2Path);
		
		prvsInstgAgt2bicpath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/BICFI';
		prvsInstgAgt2bicCode = getValueFromPath(Document, prvsInstgAgt2bicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		if(!prvsInstgAgt2bicCode)
			{
				if((!prvsInstgAgt2name && !prvsInstgAgt2address) || (prvsInstgAgt2name && !prvsInstgAgt2address) || (!prvsInstgAgt2name && prvsInstgAgt2address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("480", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3Val;
		var prvsInstgAgt3bicpath;
		var prvsInstgAgt3bicCode;
		var prvsInstgAgt3name;
		var prvsInstgAgt3address;
		
		prvsInstgAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3';
		prvsInstgAgt3Val = getValueFromPath(Document, prvsInstgAgt3Path);
		
		prvsInstgAgt3bicpath = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/BICFI';
		prvsInstgAgt3bicCode = getValueFromPath(Document, prvsInstgAgt3bicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		if(!prvsInstgAgt3bicCode)
			{
				if((!prvsInstgAgt3name && !prvsInstgAgt3address) || (prvsInstgAgt3name && !prvsInstgAgt3address) || (!prvsInstgAgt3name && prvsInstgAgt3address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("509", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1Val;
		var intrmyAgt1bicpath;
		var intrmyAgt1bicCode;
		var intrmyAgt1name;
		var intrmyAgt1address;
		
		intrmyAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1';
		intrmyAgt1Val = getValueFromPath(Document, intrmyAgt1Path);
		
		intrmyAgt1bicpath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/BICFI';
		intrmyAgt1bicCode = getValueFromPath(Document, intrmyAgt1bicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		if(!intrmyAgt1bicCode)
			{
				if((!intrmyAgt1name && !intrmyAgt1address) || (intrmyAgt1name && !intrmyAgt1address) || (!intrmyAgt1name && intrmyAgt1address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("538", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2Val;
		var intrmyAgt2bicpath;
		var intrmyAgt2bicCode;
		var intrmyAgt2name;
		var intrmyAgt2address;
		
		intrmyAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2';
		intrmyAgt2Val = getValueFromPath(Document, intrmyAgt2Path);
		
		intrmyAgt2bicpath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/BICFI';
		intrmyAgt2bicCode = getValueFromPath(Document, intrmyAgt2bicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		if(!intrmyAgt2bicCode)
			{
				if((!intrmyAgt2name && !intrmyAgt2address) || (intrmyAgt2name && !intrmyAgt2address) || (!intrmyAgt2name && intrmyAgt2address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("567", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3Val;
		var intrmyAgt3bicpath;
		var intrmyAgt3bicCode;
		var intrmyAgt3name;
		var intrmyAgt3address;
		
		intrmyAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3';
		intrmyAgt3Val = getValueFromPath(Document, intrmyAgt3Path);
		
		intrmyAgt3bicpath = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/BICFI';
		intrmyAgt3bicCode = getValueFromPath(Document, intrmyAgt3bicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		if(!intrmyAgt3bicCode)
			{
				if((!intrmyAgt3name && !intrmyAgt3address) || (intrmyAgt3name && !intrmyAgt3address) || (!intrmyAgt3name && intrmyAgt3address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("596", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgtVal;
		var cdtrAgtbicpath;
		var cdtrAgtbicCode;
		var cdtrAgtname;
		var cdtrAgtaddress;
		
		cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt';
		cdtrAgtVal = getValueFromPath(Document, cdtrAgtPath);
		
		cdtrAgtbicpath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/BICFI';
		cdtrAgtbicCode = getValueFromPath(Document, cdtrAgtbicpath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		if(!cdtrAgtbicCode)
			{
				if((!cdtrAgtname && !cdtrAgtaddress) || (cdtrAgtname && !cdtrAgtaddress) || (!cdtrAgtname && cdtrAgtaddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("625", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<RtrChain>") && isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrPath;
		var cdtrVal;
		var cdtrbicpath;
		var cdtrbicCode;
		var cdtrname;
		var cdtraddress;
		
		var cdtrPtyPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty';
		var cdtrPty = getValueFromPath(Document, cdtrPtyPath);
		
		var cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt';
		var cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		if(cdtrAgt)
		{
			cdtrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr';
			cdtrVal = getValueFromPath(Document, cdtrPath);
			
			cdtrbicpath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/BICFI';
			cdtrbicCode = getValueFromPath(Document, cdtrbicpath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/Nm';
			cdtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr';
			cdtraddress = getValueFromPath(Document, path);
			
			if(!cdtrbicCode)
			{
				if((!cdtrname && !cdtraddress) || (cdtrname && !cdtraddress) || (!cdtrname && cdtraddress))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("702", "7927", map);
					return retVal;	
				}
			}
		}	
	}
	
	return retVal;
	
}

function validatePostalAddressRule1FedPacs004(exchange) {  //
	logger.info("In validatePostalAddressRule1FedPacs004");

	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var message = inMsg.getBody(java.lang.String.class);
	if(isPatternPresent(message, "<ChrgsInf>"))
	{
		var chrgsInf;
		var chrgsInfPath;
		var name;
		var pstladdress;
		var address;
		
		chrgsInfPath = '/Document/PmtRtr/TxInf/ChrgsInf';
		chrgsInf = getValueFromPath(Document, chrgsInfPath);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/Nm';
		name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr';
		pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
		address = getValueFromPath(Document, path);
		
		if(pstladdress && !name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("198", "7950", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<UltmtDbtr>"))
	{
		var ultmtdbtrPath;
		var ultmtdbtr;
		var ultmtdbtrname;
		var ultmtdbtrpstladdress;
		var ultmtdbtraddress;
		
		ultmtdbtrPath = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr';
		ultmtdbtr = getValueFromPath(Document, ultmtdbtrPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/Nm';
		ultmtdbtrname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/PstlAdr';
		ultmtdbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/TxInf/RtrChain/UltmtDbtr/Pty/PstlAdr/AdrLine';
		ultmtdbtraddress = getValueFromPath(Document, path);
	
		if(ultmtdbtrpstladdress && !ultmtdbtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("258", "7950", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrPtyPath;
		var dbtrPty;
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrname;
		var dbtrpstladdress;
		var dbtraddress;
		
		dbtrPtyPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty';
		dbtrPty = getValueFromPath(Document, dbtrPtyPath);
		
		dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);		
		
		if(dbtrPty)
		{
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Nm';
			dbtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr';
			dbtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
			dbtraddress = getValueFromPath(Document, path);
			if(dbtrpstladdress && !dbtrname)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("304", "7950", map);
				return retVal;
			}
		}
		if(dbtrAgt)
		{
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/Nm';
			dbtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/PstlAdr';
			dbtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/PstlAdr/AdrLine';
			dbtraddress = getValueFromPath(Document, path);
			if(dbtrpstladdress && !dbtrname)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("348", "7950", map);
				return retVal;
			}
		}
		
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<InitgPty>"))
	{
		var initgPtyPath;
		var initgPty;
		var initgPtyname;
		var initgPtypstladdress;
		var initgPtyaddress;
		
		initgPtyPath = '/Document/PmtRtr/TxInf/RtrChain/InitgPty';
		initgPty = getValueFromPath(Document, initgPtyPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/Nm';
		initgPtyname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/PstlAdr';
		initgPtypstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/PstlAdr/AdrLine';
		initgPtyaddress = getValueFromPath(Document, path);
	
		if(initgPtypstladdress && !initgPtyname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("377", "7950", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrAgtname;
		var dbtrAgtpstladdress;
		var dbtrAgtaddress;
		
		dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		if(dbtrAgtpstladdress && !dbtrAgtname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("422", "7950", map);
			return retVal;
		}
	}

	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1;
		var prvsInstgAgt1name;
		var prvsInstgAgt1pstladdress;
		var prvsInstgAgt1address;
		
		prvsInstgAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1';
		prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		if(prvsInstgAgt1pstladdress && !prvsInstgAgt1name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("451", "7950", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2;
		var prvsInstgAgt2name;
		var prvsInstgAgt2pstladdress;
		var prvsInstgAgt2address;
		
		prvsInstgAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2';
		prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		if(prvsInstgAgt2pstladdress && !prvsInstgAgt2name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("480", "7950", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3;
		var prvsInstgAgt3name;
		var prvsInstgAgt3pstladdress;
		var prvsInstgAgt3address;
		
		prvsInstgAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3';
		prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		if(prvsInstgAgt3pstladdress && !prvsInstgAgt3name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("509", "7950", map);
			return retVal;
		}
	}

	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1;
		var intrmyAgt1name;
		var intrmyAgt1pstladdress;
		var intrmyAgt1address;
		
		intrmyAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1';
		intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
	
		if(intrmyAgt1pstladdress && !intrmyAgt1name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("538", "7950", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2;
		var intrmyAgt2name;
		var intrmyAgt2pstladdress;
		var intrmyAgt2address;
		
		intrmyAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2';
		intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		if(intrmyAgt2pstladdress && !intrmyAgt2name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("567", "7950", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3;
		var intrmyAgt3name;
		var intrmyAgt3pstladdress;
		var intrmyAgt3address;
		
		intrmyAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3';
		intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		if(intrmyAgt3pstladdress && !intrmyAgt3name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("596", "7950", map);
			return retVal;
		}
	}

	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrAgtname;
		var cdtrAgtpstladdress;
		var cdtrAgtaddress;
		
		cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		if(cdtrAgtpstladdress && !cdtrAgtname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("625", "7950", map);
			return retVal;
		}
	}

	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrPtyPath;
		var cdtrPty;
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrname;
		var cdtrpstladdress;
		var cdtraddress;
		
		cdtrPtyPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty';
		cdtrPty = getValueFromPath(Document, cdtrPtyPath);
		
		cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);		
		
		if(cdtrPty)
		{
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Nm';
			cdtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr';
			cdtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
			cdtraddress = getValueFromPath(Document, path);
			if(cdtrpstladdress && !cdtrname)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("658", "7950", map);
				return retVal;
			}
		}
		if(cdtrAgt)
		{
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/Nm';
			cdtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/PstlAdr';
			cdtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/PstlAdr/AdrLine';
			cdtraddress = getValueFromPath(Document, path);
			if(cdtrpstladdress && !cdtrname)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("658", "7950", map);
				return retVal;
			}
		}
		
	}

	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<UltmtCdtr>"))
	{
		var ultmtcdtrPath;
		var ultmtcdtr;
		var ultmtcdtrname;
		var ultmtcdtrpstladdress;
		var ultmtcdtraddress;
		
		ultmtcdtrPath = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr';
		ultmtcdtr = getValueFromPath(Document, ultmtcdtrPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/Nm';
		ultmtcdtrname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/PstlAdr';
		ultmtcdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/TxInf/RtrChain/UltmtCdtr/Pty/PstlAdr/AdrLine';
		ultmtcdtraddress = getValueFromPath(Document, path);
	
		if(ultmtcdtrpstladdress && !ultmtcdtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("731", "7950", map);
			return retVal;
		}
	}

	if(isPatternPresent(message, "<TxInf>") && isPatternPresent(message, "<Orgtr>"))
	{
		var orgtrPath;
		var orgtr;
		var orgtrname;
		var orgtrpstladdress;
		var orgtraddress;
		
		orgtrPath = '/Document/TxInf/RtrRsnInf/Orgtr';
		orgtr = getValueFromPath(Document, orgtrPath);
		
		path = '/Document/TxInf/RtrRsnInf/Orgtr/Nm';
		orgtrname = getValueFromPath(Document, path);
		
		path = '/Document/TxInf/RtrRsnInf/Orgtr/PstlAdr';
		orgtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/TxInf/RtrRsnInf/Orgtr/PstlAdr/AdrLine';
		orgtraddress = getValueFromPath(Document, path);
		if(orgtrpstladdress && !orgtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("778", "7950", map);
			return retVal;
		}
	}
	
	return retVal;
	
}

function validatePostalAddressRule2FedPacs004(exchange) {  //
	logger.info("In validatePostalAddressRule2FedPacs004");
	
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var message = inMsg.getBody(java.lang.String.class);
	if(isPatternPresent(message, "<ChrgsInf>"))
	{
		var chrgsInfPath;
		var chrgsInf;
		var name;
		var address;
		var dept;
		var strtnm;
		var bldgnm;
		var postbox;
		var room;
		var postlcd;
		var twnnm;
		var dstrctLocnm;
		var dstrctnm;
		var cntrySubdiv;
		var cntry;
		
		chrgsInfPath = '/Document/PmtRtr/TxInf/ChrgsInf';
		chrgsInf = getValueFromPath(Document, chrgsInfPath);		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
		address = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Dept';
		dept = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/StrtNm';
		strtnm = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/BldgNb';
		bldgnm = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstBx';
		postbox = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Room';
		room = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/PstCd';
		postlcd = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
		twnnm = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnLctnNm';
		dstrctLocnm = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/DstrctNm';
		dstrctnm = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
		cntrySubdiv = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
		cntry = getValueFromPath(Document, path);
		
		if(address && (dept || strtnm || bldgnm || postbox || room || postlcd || twnnm || dstrctLocnm || dstrctnm || cntrySubdiv || cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("198", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrPtyPath;
		var dbtrPty;
		var dbtrPath;
		var dbtr;
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
		
		dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		dbtrPtyPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty';
		dbtrPty = getValueFromPath(Document, dbtrPtyPath);
		
		if(dbtrAgt)
		{
			dbtrPath = '/Document/PmtRtr/TxInf/RtrChain//Dbtr';
			dbtr = getValueFromPath(Document, dbtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/Nm';
			dbtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/AdrLine';
			dbtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Dept';
			dbtrdept = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/StrtNm';
			dbtrstrtnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/BldgNb';
			dbtrbldgnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/PstBx';
			dbtrpostbox = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Room';
			dbtrroom = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/PstCd';
			dbtrpostlcd = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnNm';
			dbtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
			dbtrdstrctLocnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/DstrctNm';
			dbtrdstrctnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
			dbtrcntrySubdiv = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/FinInstnId/PstlAdr/Ctry';
			dbtrcntry = getValueFromPath(Document, path);
			
			if(dbtraddress && (dbtrdept || dbtrstrtnm || dbtrbldgnm || dbtrpostbox || dbtrroom || dbtrpostlcd || dbtrtwnnm || dbtrdstrctLocnm || dbtrdstrctnm || dbtrcntrySubdiv || dbtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1997", "7928", map);
				return retVal;
			}
		}
		
		if(dbtrPty)
		{
			dbtrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr';
			dbtr = getValueFromPath(Document, dbtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Nm';
			dbtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
			dbtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Dept';
			dbtrdept = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/StrtNm';
			dbtrstrtnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/BldgNb';
			dbtrbldgnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/PstBx';
			dbtrpostbox = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Room';
			dbtrroom = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/PstCd';
			dbtrpostlcd = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnNm';
			dbtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnLctnNm';
			dbtrdstrctLocnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/DstrctNm';
			dbtrdstrctnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/CtrySubDvsn';
			dbtrcntrySubdiv = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Ctry';
			dbtrcntry = getValueFromPath(Document, path);
		}
		
		if(dbtraddress && (dbtrdept || dbtrstrtnm || dbtrbldgnm || dbtrpostbox || dbtrroom || dbtrpostlcd || dbtrtwnnm || dbtrdstrctLocnm || dbtrdstrctnm || dbtrcntrySubdiv || dbtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1997", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
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
		
		dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Dept';
		dbtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
		dbtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
		dbtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/PstBx';
		dbtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Room';
		dbtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/PstCd';
		dbtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		dbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		dbtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
		dbtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		dbtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		dbtrAgtcntry = getValueFromPath(Document, path);
		
		if(dbtrAgtaddress && (dbtrAgtdept || dbtrAgtstrtnm || dbtrAgtbldgnm || dbtrAgtpostbox || dbtrAgtroom || dbtrAgtpostlcd || dbtrAgttwnnm || dbtrAgtdstrctLocnm || dbtrAgtdstrctnm || dbtrAgtcntrySubdiv || dbtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("422", "7928", map);
			return retVal;
		}
	}
		
	if(isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1;
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
		
		prvsInstgAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1';
		prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt1dept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt1strtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt1bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt1postbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
		prvsInstgAgt1room = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt1postlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt1dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt1dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt1cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt1cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt1address && (prvsInstgAgt1dept || prvsInstgAgt1strtnm || prvsInstgAgt1bldgnm || prvsInstgAgt1postbox || prvsInstgAgt1room || prvsInstgAgt1postlcd || prvsInstgAgt1twnnm || prvsInstgAgt1dstrctLocnm || prvsInstgAgt1dstrctnm || prvsInstgAgt1cntrySubdiv || prvsInstgAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("451", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2;
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
		
		prvsInstgAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2';
		prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt2dept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt2strtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt2bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
		prvsInstgAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt2cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt2address && (prvsInstgAgt2dept || prvsInstgAgt2strtnm || prvsInstgAgt2bldgnm || prvsInstgAgt2postbox || prvsInstgAgt2room || prvsInstgAgt2postlcd || prvsInstgAgt2twnnm || prvsInstgAgt2dstrctLocnm || prvsInstgAgt2dstrctnm || prvsInstgAgt2cntrySubdiv || prvsInstgAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("480", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3;
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
		
		prvsInstgAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3';
		prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
		prvsInstgAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt3cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt3address && (prvsInstgAgt3dept || prvsInstgAgt3strtnm || prvsInstgAgt3bldgnm || prvsInstgAgt3postbox || prvsInstgAgt3room || prvsInstgAgt3postlcd || prvsInstgAgt3twnnm || prvsInstgAgt3dstrctLocnm || prvsInstgAgt3dstrctnm || prvsInstgAgt3cntrySubdiv || prvsInstgAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("509", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1;
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
		
		intrmyAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1';
		intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
		intrmyAgt1dept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt1strtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt1bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
		intrmyAgt1postbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Room';
		intrmyAgt1room = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
		intrmyAgt1postlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt1dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt1dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt1cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		intrmyAgt1cntry = getValueFromPath(Document, path);
		
		if(intrmyAgt1address && (intrmyAgt1dept || intrmyAgt1strtnm || intrmyAgt1bldgnm || intrmyAgt1postbox || intrmyAgt1room || intrmyAgt1postlcd || intrmyAgt1twnnm || intrmyAgt1dstrctLocnm || intrmyAgt1dstrctnm || intrmyAgt1cntrySubdiv || intrmyAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("538", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2;
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
		
		intrmyAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2';
		intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
		intrmyAgt2dept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt2strtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt2bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
		intrmyAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Room';
		intrmyAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
		intrmyAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		intrmyAgt2cntry = getValueFromPath(Document, path);
		
		if(intrmyAgt2address && (intrmyAgt2dept || intrmyAgt2strtnm || intrmyAgt2bldgnm || intrmyAgt2postbox || intrmyAgt2room || intrmyAgt2postlcd || intrmyAgt2twnnm || intrmyAgt2dstrctLocnm || intrmyAgt2dstrctnm || intrmyAgt2cntrySubdiv || intrmyAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("567", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3;
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
		
		intrmyAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3';
		intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
		intrmyAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
		intrmyAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Room';
		intrmyAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
		intrmyAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		intrmyAgt3cntry = getValueFromPath(Document, path);
		
		if(intrmyAgt3address && (intrmyAgt3dept || intrmyAgt3strtnm || intrmyAgt3bldgnm || intrmyAgt3postbox || intrmyAgt3room || intrmyAgt3postlcd || intrmyAgt3twnnm || intrmyAgt3dstrctLocnm || intrmyAgt3dstrctnm || intrmyAgt3cntrySubdiv || intrmyAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("596", "7928", map);
			return retVal;
		}
	}
		
	if(isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
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
		
		cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Dept';
		cdtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
		cdtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
		cdtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/PstBx';
		cdtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Room';
		cdtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/PstCd';
		cdtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		cdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		cdtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
		cdtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		cdtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		cdtrAgtcntry = getValueFromPath(Document, path);
		
		if(cdtrAgtaddress && (cdtrAgtdept || cdtrAgtstrtnm || cdtrAgtbldgnm || cdtrAgtpostbox || cdtrAgtroom || cdtrAgtpostlcd || cdtrAgttwnnm || cdtrAgtdstrctLocnm || cdtrAgtdstrctnm || cdtrAgtcntrySubdiv || cdtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("625", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrPtyPath;
		var cdtrPty;
		var cdtrPath;
		var cdtr;
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
		
		cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		cdtrPtyPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty';
		cdtrPty = getValueFromPath(Document, cdtrPtyPath);
		
		if(cdtrAgt)
		{
			cdtrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr';
			cdtr = getValueFromPath(Document, cdtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/Nm';
			cdtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/AdrLine';
			cdtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Dept';
			cdtrdept = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/StrtNm';
			cdtrstrtnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/BldgNb';
			cdtrbldgnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/PstBx';
			cdtrpostbox = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Room';
			cdtrroom = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/PstCd';
			cdtrpostlcd = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnNm';
			cdtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/TwnLctnNm';
			cdtrdstrctLocnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/DstrctNm';
			cdtrdstrctnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/CtrySubDvsn';
			cdtrcntrySubdiv = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/FinInstnId/PstlAdr/Ctry';
			cdtrcntry = getValueFromPath(Document, path);
			
			if(cdtraddress && (cdtrdept || cdtrstrtnm || cdtrbldgnm || cdtrpostbox || cdtrroom || cdtrpostlcd || cdtrtwnnm || cdtrdstrctLocnm || cdtrdstrctnm || cdtrcntrySubdiv || cdtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("658", "7928", map);
				return retVal;
			}
		}
		
		if(cdtrPty)
		{
			cdtrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr';
			cdtr = getValueFromPath(Document, cdtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Nm';
			cdtrname = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
			cdtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Dept';
			cdtrdept = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/StrtNm';
			cdtrstrtnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/BldgNb';
			cdtrbldgnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/PstBx';
			cdtrpostbox = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Room';
			cdtrroom = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/PstCd';
			cdtrpostlcd = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnNm';
			cdtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnLctnNm';
			cdtrdstrctLocnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/DstrctNm';
			cdtrdstrctnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/CtrySubDvsn';
			cdtrcntrySubdiv = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Ctry';
			cdtrcntry = getValueFromPath(Document, path);
		}
		
		if(cdtraddress && (cdtrdept || cdtrstrtnm || cdtrbldgnm || cdtrpostbox || cdtrroom || cdtrpostlcd || cdtrtwnnm || cdtrdstrctLocnm || cdtrdstrctnm || cdtrcntrySubdiv || cdtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("658", "7928", map);
			return retVal;
		}
	}

	return retVal;
	
}

function validatePostalAddressRule3FedPacs004(exchange) {  //
	logger.info("In validatePostalAddressRule3FedPacs004");

	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var message = inMsg.getBody(java.lang.String.class);
	if(isPatternPresent(message, "<ChrgsInf>"))
	{
		var address;
		var chrgsInf;
		var chrgsInfPath;
		var twnnm;
		var cntry;
		var pstladdress;
		
		chrgsInfPath = '/Document/PmtRtr/TxInf/ChrgsInf';
		chrgsInf = getValueFromPath(Document, chrgsInfPath);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr';
		pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
		address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
		twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
		cntry = getValueFromPath(Document, path);
		if(pstladdress)
		{
			if(!address && (!twnnm || !cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("198", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrPath;
		var dbtr;
		var dbtrpstladdress;
		var dbtraddress;
		var dbtrtwnnm;
		var dbtrcntry;
		var dbtrPtyPath1;
		var dbtrPty1;
		var dbtrAgtPath1;
		var dbtrAgt1;
			
		dbtrPtyPath1 = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty';
		dbtrPty1 = getValueFromPath(Document, dbtrPtyPath1);
		
		dbtrAgtPath1 = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt';
		dbtrAgt1 = getValueFromPath(Document, dbtrAgtPath1);
		
		if(dbtrPty1)
		{
			dbtrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr';
			dbtr = getValueFromPath(Document, dbtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr';
			dbtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/AdrLine';
			dbtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/TwnNm';
			dbtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr/Ctry';
			dbtrcntry = getValueFromPath(Document, path);
		}
		if(dbtrAgt1)
		{
			dbtrPath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr';
			dbtr = getValueFromPath(Document, dbtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/PstlAdr';
			dbtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/PstlAdr/AdrLine';
			dbtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/PstlAdr/TwnNm';
			dbtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Agt/PstlAdr/Ctry';
			dbtrcntry = getValueFromPath(Document, path);
		}
		
		if(dbtrpstladdress)
		{
			if(!dbtraddress && (!dbtrtwnnm || !dbtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("304", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrAgtpstladdress;
		var dbtrAgtaddress;
		var dbtrAgttwnnm;
		var dbtrAgtcntry;
		
		dbtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		dbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		dbtrAgtcntry = getValueFromPath(Document, path);
		
		if(dbtrAgtpstladdress)
		{
			if(!dbtrAgtaddress && (!dbtrAgttwnnm || !dbtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("422", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1;
		var prvsInstgAgt1pstladdress;
		var prvsInstgAgt1address;
		var prvsInstgAgt1twnnm;
		var prvsInstgAgt1cntry;
		
		prvsInstgAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1';
		prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt1cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt1pstladdress)
		{
			if(!prvsInstgAgt1address && (!prvsInstgAgt1twnnm || !prvsInstgAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("451", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2;
		var prvsInstgAgt2pstladdress;
		var prvsInstgAgt2address;
		var prvsInstgAgt2twnnm;
		var prvsInstgAgt2cntry;
		
		prvsInstgAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2';
		prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt2cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt2pstladdress)
		{
			if(!prvsInstgAgt2address && (!prvsInstgAgt2twnnm || !prvsInstgAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("480", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3;
		var prvsInstgAgt3pstladdress;
		var prvsInstgAgt3address;
		var prvsInstgAgt3twnnm;
		var prvsInstgAgt3cntry;
		
		prvsInstgAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3';
		prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt3cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt3pstladdress)
		{
			if(!prvsInstgAgt3address && (!prvsInstgAgt3twnnm || !prvsInstgAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("509", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1;
		var intrmyAgt1pstladdress;
		var intrmyAgt1address;
		var intrmyAgt1twnnm;
		var intrmyAgt1cntry;
		
		intrmyAgt1Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1';
		intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		intrmyAgt1cntry = getValueFromPath(Document, path);
		
		if(intrmyAgt1pstladdress)
		{
			if(!intrmyAgt1address && (!intrmyAgt1twnnm || !intrmyAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("538", "7926", map);
				return retVal;
			}
		}
	}
		
	if(isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2;
		var intrmyAgt2pstladdress;
		var intrmyAgt2address;
		var intrmyAgt2twnnm;
		var intrmyAgt2cntry;
		
		intrmyAgt2Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2';
		intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		intrmyAgt2cntry = getValueFromPath(Document, path);
		
		if(intrmyAgt2pstladdress)
		{
			if(!intrmyAgt2address && (!intrmyAgt2twnnm || !intrmyAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("567", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3;
		var intrmyAgt3pstladdress;
		var intrmyAgt3address;
		var intrmyAgt3twnnm;
		var intrmyAgt3cntry;
		
		intrmyAgt3Path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3';
		intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		intrmyAgt3cntry = getValueFromPath(Document, path);
		
		if(intrmyAgt3pstladdress)
		{
			if(!intrmyAgt3address && (!intrmyAgt3twnnm || !intrmyAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("596", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrAgtpstladdress;
		var cdtrAgtaddress;
		var cdtrAgttwnnm;
		var cdtrAgtcntry;
		
		cdtrAgtPath = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		cdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/PmtRtr/TxInf/RtrChain/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		cdtrAgtcntry = getValueFromPath(Document, path);
		
		if(cdtrAgtpstladdress)
		{
			if(!cdtrAgtaddress && (!cdtrAgttwnnm || !cdtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("625", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrPath;
		var cdtr;
		var cdtrpstladdress;
		var cdtraddress;
		var cdtrtwnnm;
		var cdtrcntry;
		var cdtrPtyPath1;
		var cdtrPty1;
		var cdtrAgtPath1;
		var cdtrAgt1;
			
		cdtrPtyPath1 = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty';
		cdtrPty1 = getValueFromPath(Document, cdtrPtyPath1);
		
		cdtrAgtPath1 = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt';
		cdtrAgt1 = getValueFromPath(Document, cdtrAgtPath1);
		
		if(cdtrPty1)
		{
			cdtrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr';
			cdtr = getValueFromPath(Document, cdtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr';
			cdtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/AdrLine';
			cdtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/TwnNm';
			cdtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr/Ctry';
			cdtrcntry = getValueFromPath(Document, path);
		}
		if(cdtrAgt1)
		{
			cdtrPath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr';
			cdtr = getValueFromPath(Document, cdtrPath);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/PstlAdr';
			cdtrpstladdress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/PstlAdr/AdrLine';
			cdtraddress = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/PstlAdr/TwnNm';
			cdtrtwnnm = getValueFromPath(Document, path);
			
			path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Agt/PstlAdr/Ctry';
			cdtrcntry = getValueFromPath(Document, path);
		}
		
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

	return retVal;
	
}

function validatePersonTransparency_IRSRuleFedPacs004(exchange) {  //
	logger.info("In validatePersonTransparency_IRSRuleFedPacs004");
	var biccodePath;
	var biccode;
	var name;
	var address;
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var message = inMsg.getBody(java.lang.String.class);
	if(isPatternPresent(message, "<UltmtDbtr>"))
	{
		biccodePath = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtDbtr/Pty/PstlAdr';
		address = getValueFromPath(Document, path);
		
		if(!biccode)
			{
				if((!name && !address) || (name && !address) || (!name && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("280", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		biccodePath = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/RtrChain/Dbtr/Pty/PstlAdr';
		address = getValueFromPath(Document, path);
		logger.trace("validatePersonTransparency_IRSRuleFedPacs004: biccode = " + biccode);
		logger.trace("validatePersonTransparency_IRSRuleFedPacs004: name = " + name);
		logger.trace("validatePersonTransparency_IRSRuleFedPacs004: address = " + address);
		
		if(!biccode)
			{
				if((!name && !address) || (name && !address) || (!name && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("304", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<InitgPty>"))
	{
		biccodePath = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/RtrChain/InitgPty/Pty/PstlAdr';
		address = getValueFromPath(Document, path);
		
		if(!biccode)
			{
				if((!name && !address) || (name && !address) || (!name && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("377", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<Cdtr>"))
	{
		biccodePath = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/RtrChain/Cdtr/Pty/PstlAdr';
		address = getValueFromPath(Document, path);
		
		if(!biccode)
			{
				if((!name && !address) || (name && !address) || (!name && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("658", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<UltmtCdtr>"))
	{
		biccodePath = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/RtrChain/UltmtCdtr/Pty/PstlAdr';
		address = getValueFromPath(Document, path);
		
		if(!biccode)
			{
				if((!name && !address) || (name && !address) || (!name && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("731", "7927", map);
					return retVal;	
				}
			}
	}
	
	if(isPatternPresent(message, "<Orgtr>"))
	{
		biccodePath = '/Document/PmtRtr/TxInf/RtrRsnInf/Orgtr/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/PmtRtr/TxInf/Orgtr/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/PmtRtr/TxInf/RtrRsnInf/Orgtr/PstlAdr';
		address = getValueFromPath(Document, path);
		
		if(!biccode)
			{
				if((!name && !address) || (name && !address) || (!name && address))
				{
					setHeader(map, "PLCN_validMessage", false);
					retVal = setCommentsForTransaction("778", "7927", map);
					return retVal;	
				}
			}
	}
	
	return retVal;
	
}

function externalReturnReasonCodeGuidelineFedPacs004(exchange) {
	var path;
	var retVal = 0;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	path = '/Document/PmtRtr/TxInf/RtrRsnInf/Rsn/Cd';
	retVal = checkExternalCodelist(path, 'ExternalReturnReason1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("822", "1556", map);
		retVal = 1;
	}

	return retVal;
}
