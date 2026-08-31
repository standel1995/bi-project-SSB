//constraintsISORulesSEPAPacs008
function b2bIntrBnkSttltDate(Document, map) {
	var retVal;
	var ttlIntrBkSttlmAmt;
	var grpHdrIntrBkSttlmDt;
	var cdtrTrfinfintrBkStlDt;
	var msgType;

	retVal = 0;

	msgType = getHeader(map, "PLCN_msgType");
	logger.info("b2bIntrBnkSttltDate: msgType " + msgType);

	grpHdrIntrBkSttlmDt = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "GrpHdr", "<IntrBkSttlmDt>");
	logger.info("b2bIntrBnkSttltDate: grpHdrIntrBkSttlmDt " + grpHdrIntrBkSttlmDt);

	cdtrTrfinfintrBkStlDt = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "CdtTrfTxInf", "<IntrBkSttlmDt>");
	logger.info("b2bIntrBnkSttltDate: grpHdrIntrBkSttlmDt =" + cdtrTrfinfintrBkStlDt);

	ttlIntrBkSttlmAmt = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "GrpHdr", "<TtlIntrBkSttlmAmt>");
	logger.info("b2bIntrBnkSttltDate: grpHdrIntrBkSttlmDt =" + ttlIntrBkSttlmAmt);	


	if(grpHdrIntrBkSttlmDt && cdtrTrfinfintrBkStlDt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bIntrBnkSttltDate: Interbank Settlement Date present in both sequences");
		retVal = setCommentsForTransaction("324", "7042", map);
		return retVal;
	}

	if(!grpHdrIntrBkSttlmDt && !cdtrTrfinfintrBkStlDt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bIntrBnkSttltDate: If GrpHdr/IntrBkSttlmDt is not present, then transaction IntrBkSttlmDt must be present.");
		retVal = setCommentsForTransaction("324", "7043", map);
		return retVal;
	}

	if(ttlIntrBkSttlmAmt){
		if(!grpHdrIntrBkSttlmDt && !cdtrTrfinfintrBkStlDt){
				setHeader(map, "PLCN_validMessage",false);
				logger.info("b2bIntrBnkSttltDate: If TotalInterbankSettlementAmount is present, then InterbankSettlementDate must be present.");
				retVal = setCommentsForTransaction("324", "7043", map); //NEW violations to be defined..	
				return retVal;	 
		}
	}
	return retVal;
}

function b2bTtlIntrBkSttlmAmtCcy(Document, map,) {
	
	var ttlIntrBkSttlmtPath;
	var ttlIntrBkSttlmAmt;
	var ttlIntrBkSttlmAmtCcy;
	var intrBkSttlmtCcy;
	var intrBkSttlAmtPath;
	var retVal;

	retVal = 0;

	ttlIntrBkSttlmAmt = isXmlNodePresent(Document, "FIToFICstmrCdtTrf", "GrpHdr", "TtlIntrBkSttlmAmt");
	logger.info("b2bTtlIntrBkSttlmAmtCcy: ttlIntrBkSttlmAmt = " + ttlIntrBkSttlmAmt );	


	if(ttlIntrBkSttlmAmt){						//if(isGrpHdrSeq == 'N'){
		ttlIntrBkSttlmtPath = '/Document/FIToFICstmrCdtTrf/GrpHdr/TtlIntrBkSttlmAmt/@Ccy';
		ttlIntrBkSttlmAmtCcy = getValueFromPath(Document, ttlIntrBkSttlmtPath);
		logger.info("b2bTtlIntrBkSttlmAmtCcy: ttlIntrBkSttlmAmtCcy = " + ttlIntrBkSttlmAmtCcy);	
	}
	
	intrBkSttlAmtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy';
	intrBkSttlmtCcy = getValueFromPath(Document, intrBkSttlAmtPath);
	logger.info("b2bTtlIntrBkSttlmAmtCcy: intrBkSttlmtCcy = " + intrBkSttlmtCcy );	

	if(ttlIntrBkSttlmAmtCcy != intrBkSttlmtCcy){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bTtlIntrBkSttlmAmtCcy: Currency of Total Interbank Settlement Amount does not match the Interbank Settlement Amount" );	
		retVal = setCommentsForTransaction("322", "7041", map);
		return retVal;
	}

    return retVal;
}

function grpHdr_CdtTrfTxInf_FldCompRulePacs008(Document, map) {
	var retVal;
	var ttlIntrBkSttlmAmt;
	var grpHdrInstgAgt;
	var cdtrTrfinInstgAgt;
	var grpHdrInstdAgt;
	var cdtrTrfinInstdAgt;
	var grpHdrPmtTpInf;
	var cdtrTrfinPmtTpInf;

	retVal = 0;
	
	//InstructingAgent
	grpHdrInstgAgt = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "GrpHdr", "<InstgAgt>");
	logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: grpHdrInstgAgt " + grpHdrInstgAgt);

	cdtrTrfinInstgAgt = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "CdtTrfTxInf", "<InstgAgt>");
	logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: cdtrTrfinInstgAgt =" + cdtrTrfinInstgAgt);
	
	//InstructedAgent
	grpHdrInstdAgt = isXmlNodePresent2(Document,"FIToFICstmrCdtTrf", "GrpHdr", "<InstdAgt>");
	logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: grpHdrInstdAgt " + grpHdrInstdAgt);

	cdtrTrfinInstdAgt = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "CdtTrfTxInf", "<InstdAgt>");
	logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: cdtrTrfinInstdAgt =" + cdtrTrfinInstdAgt);
	
	//PaymentTypeInformation
	grpHdrPmtTpInf = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "GrpHdr", "<PmtTpInf>");
	logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: grpHdrPmtTpInf " + grpHdrPmtTpInf);

	cdtrTrfinPmtTpInf = isXmlNodePresent(Document,"FIToFICstmrCdtTrf", "CdtTrfTxInf", "<PmtTpInf>");
	logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: cdtrTrfinPmtTpInf =" + cdtrTrfinPmtTpInf);

	if(grpHdrInstgAgt && cdtrTrfinInstgAgt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: If GrpHdr/InstgAgt is present, then CdtTrfTxInf/InstgAgt is not allowed.");
		retVal = setCommentsForTransaction("523", "1111", map);
		return retVal;
	}

	if(grpHdrInstdAgt && cdtrTrfinInstdAgt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: If GrpHdr/InstdAgt is present, then CdtTrfTxInf/InstdAgt is not allowed.");
		retVal = setCommentsForTransaction("536", "1112", map);
		return retVal;
	}
	
	if(grpHdrPmtTpInf && cdtrTrfinPmtTpInf){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("grpHdr_CdtTrfTxInf_FldCompRulePacs008: If GroupHeader/PmtTpInf is present, then CdtTrfTxInf/PmtTpInf is not allowed.");
		retVal = setCommentsForTransaction("304", "1113", map);
		return retVal;
	}
	return retVal;
}

function b2bInstAmtExchRate(Document, map) {

	var retVal = 0;

	var instdAmtVal = isXmlNodePresent2(Document, "InstdAmt");
	logger.info("instructedAmountAndExchangeRate3RulePacs008: instdAmtVal = " + instdAmtVal);
	
	if(!instdAmtVal){
		var xchgRateVal = isXmlNodePresent2(Document, "XchgRate");
		logger.info("instructedAmountAndExchangeRate3RulePacs008: xchgRateVal = " + xchgRateVal);
		if(xchgRateVal){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("341", "7907", map);
			logger.info("If InstdAmt is not present, then XchgRate is not allowed.");
			return retVal;
		}
	}
	return retVal;
}

function dbtr_UltmtDbtrContentCheckPacs008(Document, map) {
	var retVal;
	var ultmtDbtrNm;
	var ultmtDbtrPstlAdr;
	var ultmtDbtrId;
	var ultmtDbtrCtryOfRes;
	var ultmtDbtrCtctDtls;
	var dbtrNm;
	var dbtrPstlAdr;
	var dbtrId;
	var dbtrCtryOfRes;
	var dbtrCtctDtl;
	retVal = 0;
	var documentString = convertDocumentToString(Document);
	logger.info("dbtr_UltmtDbtrContentCheckPacs008");
	
	if(isPatternPresent(documentString, "<Dbtr>")){
		var dbtrData = dataBetweenTokens("<Dbtr>", "</Dbtr>", documentString);
		dbtrNm = dataBetweenTokens("<Nm>", "</Nm>", dbtrData);
		logger.info("dbtrNm" + dbtrNm);
		dbtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", dbtrData);
		logger.info("dbtrPstlAdr" + dbtrPstlAdr);
		dbtrId = dataBetweenTokens("<Id>", "</Id>", dbtrData);
		dbtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", dbtrData);
		dbtrCtctDtl = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", dbtrData);
		
		if(isPatternPresent(documentString, "<UltmtDbtr>")){
			var ultmtDbtrData = dataBetweenTokens("<UltmtDbtr>", "</UltmtDbtr>", documentString);
			ultmtDbtrNm = dataBetweenTokens("<Nm>", "</Nm>", ultmtDbtrData);
			logger.info(" ultmtDbtrNm =" + ultmtDbtrNm);
			ultmtDbtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", ultmtDbtrData);
			logger.info("ultmtDbtrPstlAdr" + ultmtDbtrPstlAdr);
			ultmtDbtrId = dataBetweenTokens("<Id>", "</Id>", ultmtDbtrData);
			ultmtDbtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", ultmtDbtrData);
			ultmtDbtrCtctDtls = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", ultmtDbtrData);
			
			if(ultmtDbtrNm == dbtrNm || ultmtDbtrPstlAdr == dbtrPstlAdr || ultmtDbtrId == dbtrId || ultmtDbtrCtryOfRes == dbtrCtryOfRes || ultmtDbtrCtctDtls == dbtrCtctDtl){
				logger.info("dbtr_UltmtDbtrContentCheckPacs008: UltimateDebtor may only be present if different from Debtor.");
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("693", "5735", map);
				return retVal;
			}
		}
		
	}
	return retVal;
}

function cdtr_UltmtCdtrContentCheckPacs008(Document, map) {
	var retVal;
	var ultmtCdtrNm;
	var ultmtCdtrPstlAdr;
	var ultmtCdtrId;
	var ultmtCdtrCtryOfRes;
	var ultmtCdtrCtctDtls;
	var cdtrNm;
	var cdtrPstlAdr;
	var cdtrId;
	var cdtrCtryOfRes;
	var cdtrCtctDtl;
	retVal = 0;
	var documentString = convertDocumentToString(Document);
	logger.info("cdtr_UltmtCdtrContentCheckPacs008");
	
	if(isPatternPresent(documentString, "<Cdtr>")){
		var cdtrData = dataBetweenTokens("<Cdtr>", "</Cdtr>", documentString);
		cdtrNm = dataBetweenTokens("<Nm>", "</Nm>", cdtrData);
		logger.info("cdtrNm" + cdtrNm);
		cdtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", cdtrData);
		logger.info("cdtrPstlAdr" + cdtrPstlAdr);
		cdtrId = dataBetweenTokens("<Id>", "</Id>", cdtrData);
		cdtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", cdtrData);
		cdtrCtctDtl = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", cdtrData);
		
		if(isPatternPresent(documentString, "<UltmtCdtr>")){
			var ultmtCdtrData = dataBetweenTokens("<UltmtCdtr>", "</UltmtCdtr>", documentString);
			ultmtCdtrNm = dataBetweenTokens("<Nm>", "</Nm>", ultmtCdtrData);
			logger.info(" ultmtCdtrNm =" + ultmtCdtrNm);
			ultmtCdtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", ultmtCdtrData);
			logger.info("ultmtCdtrPstlAdr" + ultmtCdtrPstlAdr);
			ultmtCdtrId = dataBetweenTokens("<Id>", "</Id>", ultmtCdtrData);
			ultmtCdtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", ultmtCdtrData);
			ultmtCdtrCtctDtls = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", ultmtCdtrData);
			
			if(ultmtCdtrNm == cdtrNm || ultmtCdtrPstlAdr == cdtrPstlAdr || ultmtCdtrId == cdtrId || ultmtCdtrCtryOfRes == cdtrCtryOfRes || ultmtCdtrCtctDtls == cdtrCtctDtl){
				logger.info("cdtr_UltmtCdtrContentCheckPacs008: UltimateDebtor may only be present if different from Debtor.");
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("1007", "5736", map);
				return retVal;
			}
		}	
	}
	return retVal;
}

function b2bChargesAmountCurrency(Document, map) {  
	logger.info("b2bChargesAmountCurrency");

	var chrgInfPath;
	var chrgInf;
	var intrBkSttlCcyPath;
	var intrBkSttlmtCcy;
	var chrgsAmtCcyPath;
	var chrgsAmtCcy;
	var retVal =0;

	intrBkSttlCcyPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy';
	intrBkSttlmtCcy = getValueFromPath(Document, intrBkSttlCcyPath);
	if(intrBkSttlmtCcy) {
		intrBkSttlmtCcy = intrBkSttlmtCcy.trim();
	}
	logger.info("b2bChargesAmountCurrency: intrBkSttlmtCcy = " + intrBkSttlmtCcy ); 

	chrgsAmtCcyPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Amt/@Ccy';
	chrgsAmtCcy = getValueFromPath(Document, chrgsAmtCcyPath);
	if(chrgsAmtCcy) {
		chrgsAmtCcychrgsAmtCcy = chrgsAmtCcy.trim();
	}
	logger.info("b2bChargesAmountCurrency: intrBkSttlmtCcy = " + intrBkSttlmtCcy );

	chrgInf = isXmlNodePresent2(Document, "ChrgsInf");

	if(chrgInf){
		if(intrBkSttlmtCcy != chrgsAmtCcy){
			logger.info("b2bChargeBearerChrgsInf: If ChrgsInf is persent then the Ccy of ChrgsInf/ChrgsAmnt must be the same as IntrbnkStlmtAmt/@Ccy.");
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("322", "7906", map);
			return retVal;			
		}
	}
	return retVal;
}


//constraintsISORulesSEPAPacs004

function b2bIntrBnkSttltDateRulePacs004(Document, map) {
	
	var retVal;
	var ttlIntrBkSttlmAmt;
	var grpHdrIntrBkSttlmDt;
	var TxInfintrBkStlDt;

	retVal = 0;

	grpHdrIntrBkSttlmDt = isXmlNodePresent(Document, "PmtRtr", "GrpHdr", "<IntrBkSttlmDt>");
	logger.info("b2bIntrBnkSttltDateRulePacs004: grpHdrIntrBkSttlmDt " + grpHdrIntrBkSttlmDt);
	
	txInfintrBkStlDt = isXmlNodePresent(Document, "PmtRtr", "TxInf", "<IntrBkSttlmDt>");
	logger.info("b2bIntrBnkSttltDateRulePacs004: grpHdrIntrBkSttlmDt =" + txInfintrBkStlDt);
	
	ttlIntrBkSttlmAmt = isXmlNodePresent(Document, "PmtRtr", "GrpHdr", "<TtlIntrBkSttlmAmt>");
	logger.info("b2bIntrBnkSttltDateRulePacs004: grpHdrIntrBkSttlmDt =" + ttlIntrBkSttlmAmt);


	if(grpHdrIntrBkSttlmDt && txInfintrBkStlDt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bIntrBnkSttltDateRulePacs004: If GroupHeader/InterbankSettlementDate is present, then TransactionInformation/InterbankSettlementDate is not allowed.");
		retVal = setCommentsForTransaction("181", "7111", map);
		return retVal;
	}

	if(!grpHdrIntrBkSttlmDt && !txInfintrBkStlDt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bIntrBnkSttltDateRulePacs004: If GroupHeader/InterbankSettlementDate is Not present, then TransactionInformation/InterbankSettlementDate must be present..");
		retVal = setCommentsForTransaction("181", "7112", map);
		return retVal;
	}

	if(ttlIntrBkSttlmAmt){
		if(!grpHdrIntrBkSttlmDt && !txInfintrBkStlDt){
				setHeader(map, "PLCN_validMessage",false);
				logger.info("b2bIntrBnkSttltDateRulePacs004: If TotalReturnedInterbankSettlementAmount is present, then InterbankSettlementDate must be present.");
				retVal = setCommentsForTransaction("181", "7113", map); 	
				return retVal;	 
		}
	}
	return retVal;
}


function genericMustPresentRulePacs004(Document, map) {
	
	var retVal;
	var instgRmbrsmntAgtAcct; 
	var instgRmbrsmntAgt;
	var instdRmbrsmntAgtAcct; 
	var instdRmbrsmntAgt;
	var thrdRmbrsmntAgtAcct;
	var thrdRmbrsmntAgt;
	
	logger.info("In genericMustPresentRulePacs004");

	retVal = 0;

	instgRmbrsmntAgtAcct = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstgRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRulePacs004: instgRmbrsmntAgtAcct = " + instgRmbrsmntAgtAcct);
	
	instgRmbrsmntAgt = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstgRmbrsmntAgt>");
	logger.info("genericMustPresentRulePacs004: instgRmbrsmntAgt = " + instgRmbrsmntAgt);
	
	instdRmbrsmntAgtAcct = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstdRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRulePacs004: instdRmbrsmntAgtAcct = " + instdRmbrsmntAgtAcct);
	
	instdRmbrsmntAgt = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstdRmbrsmntAgt>");
	logger.info("genericMustPresentRulePacs004: instdRmbrsmntAgt = " + instdRmbrsmntAgt);
	
	thrdRmbrsmntAgtAcct = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<ThrdRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRulePacs004: thrdRmbrsmntAgtAcct = " + thrdRmbrsmntAgtAcct);
	
	thrdRmbrsmntAgt = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<ThrdRmbrsmntAgt>");
	logger.info("genericMustPresentRulePacs004: thrdRmbrsmntAgt = " + thrdRmbrsmntAgt);

	if(instgRmbrsmntAgtAcct){
		if(!instgRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs004: If InstructingReimbursementAgentAccount is present, then InstructingReimbursementAgent must be present.");
			retVal = setCommentsForTransaction("153", "7114", map);		
			return retVal;	
		}
	}
	
	if(instdRmbrsmntAgtAcct){
		if(!instdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs004: If InstructedReimbursementAgentAccount is present, then InstructedReimbursementAgent must be present..");
			retVal = setCommentsForTransaction("156", "7115", map);		
			return retVal;	
		}
	}
	
	if(thrdRmbrsmntAgtAcct){
		if(!thrdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs004: If ThirdReimbursementAgentAccount is present, then ThirdReimbursementAgent must be present.");
			retVal = setCommentsForTransaction("159", "7771", map);		
			return retVal;	
		}
	}
	
	if(thrdRmbrsmntAgt){
		if(!instgRmbrsmntAgt && !instdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs004: If ThrdRmbrsmntAgt is prsnt then InstgRmbmntAgt and InstdRmbmntAgt is mandatory");
			retVal = setCommentsForTransaction("127", "7773", map);		
			return retVal;	
		}
	}
	return retVal;
}

function grpHdrsttlmtMtdRulePacs004(Document, map) {
	
	var sttlmtMtdPath1;
	var sttlmtMtd1;
	
	retVal = 0;
	logger.info("In grpHdrsttlmtMtdRulePacs004");
	
	sttlmtMtdPath1 = '/Document/PmtRtr/GrpHdr/SttlmInf/SttlmMtd';
	sttlmtMtd1 = getValueFromPath(Document, sttlmtMtdPath1);
	logger.info("grpHdrsttlmtMtdRulePacs004: sttlmtMtd1 = " + sttlmtMtd1 );
	
	
	if(sttlmtMtd1 == 'COVE'){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("grpHdrsttlmtMtdRulePacs004: SettlementMethod must be different");
			retVal = setCommentsForTransaction("128", "7116", map);	
			return retVal;			
		}
		return retVal;
}

function groupReturnAndNumberOfTransactionsTrueFalseRulePacs004(Document, map) {
	var retVal ;
	var count ;

	logger.info("In groupReturnAndNumberOfTransactionsTrueFalseRulePacs004");
	retVal = 0;

	var grpRtrPath = "/Document/PmtRtr/GrpHdr/GrpRtr";
	var grpRtr = getValueFromPath(Document, grpRtrPath);
	logger.info("grpRtr = "+ grpRtr);

	var nbOfTxsTag = Document.getElementsByTagName("NbOfTxs");
	var numOfTrans = nbOfTxsTag.item(0);
		
		for(var i=0; i<=numOfTrans; i++) {
			
			var res1 = isXmlNodePresent2(Document, "TxInf");
			if (res1){
				count++
			}
			logger.info("groupReturnAndNumberOfTransactionsTrueFalseRulePacs004: res1 = " + res1);
		}

	var nbOfTxsTag = Document.getElementsByTagName("NbOfTxs");
	var numOfTrans = nbOfTxsTag.item(0);
	
		for(var i=0; i<=numOfTrans; i++) {
		
			var res1 = isXmlNodePresent2(Document, "TxInf");
			if (res1){
				count++
			}
			logger.info("groupReturnAndNumberOfTransactionsTrueFalseRulePacs004: res1 = " + res1);
		}
		logger.info("groupReturnAndNumberOfTransactionsTrueFalseRulePacs004: count = " + count)
		
		var txInfTag = Document.getElementsByTagName("TxInf");
		if (grpRtr == false){
			if(numOfTrans != count)
			{
				setHeader(map, "PLCN_validMessage",false);
				logger.info("groupReturnAndNumberOfTransactionsTrueFalseRulePacs004 : If GroupHeader/GroupReturn is false, then GroupHeader/NumberOfTransactions must equal the number of occurrences of TransactionInformation.");
				retVal = setCommentsForTransaction("124", "7772", map);
				return retVal;
			}
			
		}
		
		if (grpRtr == true){
			if(numOfTrans != count)
			{
				setHeader(map, "PLCN_validMessage",false);
				logger.info("groupReturnAndNumberOfTransactionsTrueFalseRulePacs004: If GroupReturn is true, then NumberOfTransactions equals the number of transactions in the original message");
				retVal = setCommentsForTransaction("124", "7775", map);
				return retVal;
			}
	}
	return retVal;
}

function genericNotAllowedRulePacs004(Document, map) {

	var retVal ;

	logger.info("In genericNotAllowedRulePacs004");
	retVal = 0;

	var orgnlGrpInf = isXmlNodePresent4(Document, "PmtRtr", "<OrgnlGrpInf>");
	logger.info("genericNotAllowedRulePacs004: orgnlGrpInf = " + orgnlGrpInf);
	
	var txInfOrgnlGrpInf = isXmlNodePresent4(Document, "TxInf", "<OrgnlGrpInf>");
	logger.info("genericNotAllowedRulePacs004: txInfOrgnlGrpInf = " + txInfOrgnlGrpInf );
	
	var grpHdrInstdAgt = isXmlNodePresent(Document, "PmtRtr", "GrpHdr", "<InstdAgt>");
	logger.info("genericNotAllowedRulePacs004: grpHdrInstdAgt = " + grpHdrInstdAgt);
	
	var txInfInstdAgt = isXmlNodePresent4(Document, "TxInf", "<InstdAgt>");
	logger.info("genericNotAllowedRulePacs004: txInfInstdAgt = " + txInfInstdAgt);
	
	var grpHdrInstgAgt = isXmlNodePresent(Document, "PmtRtr", "GrpHdr", "<InstgAgt>");
	logger.info("genericNotAllowedRulePacs004: grpHdrInstgAgt = " + grpHdrInstgAgt);
	
	var txInfInstgAgt = isXmlNodePresent4(Document, "TxInf", "<InstgAgt>");
	logger.info("genericNotAllowedRulePacs004: txInfInstgAgt = " + txInfInstgAgt);

	if(orgnlGrpInf)
	{
		if(txInfOrgnlGrpInf) {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("genericNotAllowedRulePacs004 : If OriginalGroupInformation is present, then TransactionInformation/OriginalGroupInformation is not allowed.");
			retVal = setCommentsForTransaction("167", "8881", map);
			return retVal;			
		}
	}
	
	if(grpHdrInstdAgt)
	{
		if(txInfInstdAgt) {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("genericNotAllowedRulePacs004 : If GroupHeader/InstructedAgent is present, then TransactionInformation/InstructedAgent is not allowed.");
			retVal = setCommentsForTransaction("244", "8882", map);
			return retVal;			
		}
	}
	
	if(grpHdrInstgAgt)
	{
		if(txInfInstgAgt) {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("genericNotAllowedRulePacs004 : If GroupHeader/InstructingAgent is present, then TransactionInformation/InstructingAgent is not allowed.");
			retVal = setCommentsForTransaction("231", "8883", map);
			return retVal;			
		}
	}
	return retVal;
}

function groupReturnAndReturnReasonRulePacs004(Document, map) {
	
    var retVal ;

	logger.info("In groupReturnAndReturnReasonRulePacs004");
	retVal = 0;

	var grpRtrPath = "/Document/PmtRtr/GrpHdr/GrpRtr";
	var grpRtr = getValueFromPath(Document, grpRtrPath);
	logger.info("grpRtr = "+ grpRtr);

	if(grpRtr == true)
	{
		var res1 = isXmlNodePresent(Document, "OrgnlGrpInf", "RtrRsnInf", "<RtrRsn>");
		logger.info("groupReturnAndReturnReasonRulePacs004: res1 = " + res1);

		if(res1 != true )
	    {
			setHeader(map, "PLCN_validMessage",false);
			logger.info("groupReturnAndReturnReasonRulePacs004 : If GroupHeader/GroupReturn is true, then OriginalGroupInformation/ReturnReasonInformation/ReturnReason must be present.");
			retVal = setCommentsForTransaction("164", "7812", map);
			return retVal;
		}
	}
	return retVal;
}

function groupHeaderGroupReturnFalseRulePacs004(Document, map){
	var grpHdrGrpRtrPath;
	var groupHeaderGroupreturnTrue;
	var retVal ;
	
	logger.info("In groupHeaderGroupReturnFalseRulePacs004");
	retVal = 0;
	
	grpHdrGrpRtrPath = "/Document/PmtRtr/GrpHdr/GrpRtr";
	grpHdrGrpRtrVal = getValueFromPath(Document, grpHdrGrpRtrPath);
	logger.info("grpHdrGrpRtrVal = "+grpHdrGrpRtrVal);
	
	if( grpHdrGrpRtrVal == false)
	{
		var res1 = isXmlNodePresent2(Document, "TxInf");
		logger.info("groupHeaderGroupReturnFalseRulePacs004: res1 = " + res1);

		if(res1 != true )
		{
			setHeader(map,"PLCN_validMessage",false);
			logger.info("groupHeaderGroupReturnFalseRulePacs004 : If GroupHeader/GroupReturn is false, then at least one occurrence of TransactionInformation must be present.");
			retVal = setCommentsForTransaction("165","7813", map);
			return retVal;
		}
	}
	return retVal;
}

function grpHdrTtlRtrIntrBkSttlmAmtRulePacs004(Document, map){
	var retVal;
	logger.info("In grpHdrTtlRtrIntrBkSttlmAmtRulePacs004");
	retVal = 0;
	var res;
	var resPath;
	var numbOfTxnPath;
	var numbOfTxn;
	var i;
	var totalAmountOfTxn = 0;
	var rtrIntrBkSttlmAmtPath;
	var rtrIntrBkSttlmAmt;

	resPath = '/Document/PmtRtr/GrpHdr/TtlRtrdIntrBkSttlmAmt';
	res = getValueFromPath(Document, resPath);
	logger.info(" grpHdrTtlRtrIntrBkSttlmAmtRulePacs004: res = " + res);
	numbOfTxnPath = '/Document/PmtRtr/GrpHdr/NbOfTxs';
	numbOfTxn = getValueFromPath(Document, numbOfTxnPath);
	logger.info("grpHdrTtlRtrIntrBkSttlmAmtRulePacs004: numbOfTxn = " + numbOfTxn);
	logger.info("grpHdrTtlRtrIntrBkSttlmAmtRulePacs004: typeof numbOfTxn = " + typeof numbOfTxn);

	numbOfTxn = Number(numbOfTxn);
	logger.info("grpHdrTtlRtrIntrBkSttlmAmtRulePacs004: typeof numbOfTxn = " + typeof numbOfTxn);

	for(i = 0; i < numbOfTxn; i++) {
		rtrIntrBkSttlmAmtPath = '/Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt';
		rtrIntrBkSttlmAmt = getValueFromPath(Document, rtrIntrBkSttlmAmtPath);
		rtrIntrBkSttlmAmt = Number(rtrIntrBkSttlmAmt);
		logger.info("grpHdrTtlRtrIntrBkSttlmAmtRulePacs004: rtrIntrBkSttlmAmt = " + rtrIntrBkSttlmAmt);
		totalAmountOfTxn = totalAmountOfTxn + rtrIntrBkSttlmAmt;
		totalAmountOfTxn = Number(totalAmountOfTxn);
		logger.info("grpHdrTtlRtrIntrBkSttlmAmtRulePacs004: totalAmountOfTxn = " + totalAmountOfTxn);
	}

	if(res != totalAmountOfTxn){
		setHeader(map,"PLCN_validMessage",false);
		logger.info("grpHdrTtlRtrIntrBkSttlmAmtRulePacs004: GroupHeader/TotalReturnedInterbankSettlementAmount must equal the sum of all occurrences of TransactionInformation/ReturnedInterbankSettlementAmount when present.");
		retVal = setCommentsForTransaction("179","7811", map);
		return retVal;
	}

	return retVal;
}

function reimbursementAgentRuleCamt056(Document, map) {
	var retVal ;

	logger.info("In thirdreimbursementAgentRuleCamt056");
	retVal = 0;
  
  	var thrdRmbrsmntAgtCheck = isXmlNodePresent2(Document, "ThrdRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: thrdRmbrsmntAgtCheck = " + thrdRmbrsmntAgtCheck);
	
	var thrdRmbrsmntAgtAcctCheck = isXmlNodePresent2(Document, "ThrdRmbrsmntAgtAcct");
	logger.info("thirdreimbursementAgentRuleCamt056: thrdRmbrsmntAgtAcctCheck = " + thrdRmbrsmntAgtAcctCheck);

	var instgRmbrsmntAgtCheck = isXmlNodePresent2(Document, "InstgRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: instgRmbrsmntAgtCheck = " + instgRmbrsmntAgtCheck);
	
	var instgRmbrsmntAgtAcctCheck = isXmlNodePresent2(Document, "InstgRmbrsmntAgtAcct");
	logger.info("thirdreimbursementAgentRuleCamt056: instgRmbrsmntAgtAcctCheck = " + instgRmbrsmntAgtAcctCheck);
	
	var instdRmbrsmntAgtCheck = isXmlNodePresent2(Document, "InstdRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: instdRmbrsmntAgtCheck = " + instdRmbrsmntAgtCheck);
	
	var instdRmbrsmntAgtAcctCheck = isXmlNodePresent2(Document, "InstdRmbrsmntAgtAcct");
	logger.info("thirdreimbursementAgentRuleCamt056: instdRmbrsmntAgtAcctCheck = " + instdRmbrsmntAgtAcctCheck);
	
	if(thrdRmbrsmntAgtCheck){
		if(!instgRmbrsmntAgtCheck || !instdRmbrsmntAgtCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("944", "7828", map);
			return retVal;
		}	
	}
	
	if(thrdRmbrsmntAgtAcctCheck){
		if(!thrdRmbrsmntAgtCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("944", "7833", map);
			return retVal;
		}	
	}
	
	if(instgRmbrsmntAgtAcctCheck){
		if(!instgRmbrsmntAgtCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("944", "7834", map);
			return retVal;
		}	
	}
	
	if(instdRmbrsmntAgtAcctCheck){
		if(!instdRmbrsmntAgtCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("992", "7835", map);
			return retVal;
		}	
	}
	return retVal;
}

function sttlmMtdRuleCamt056(Document, map) {
	var sttlmMtdPath;
	var sttlmMtdValue;
	var retVal ;

	logger.info("In sttlmMtdRuleCamt056");
	retVal = 0;

	sttlmMtdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/SttlmInf/SttlmMtd";
	sttlmMtdValue = getValueFromPath(Document, sttlmMtdPath);
	logger.info("sttlmMtdValue = "+sttlmMtdValue);
	
	var thrdRmbrsmntAgtCheck = isXmlNodePresent2(Document, "ThrdRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: thrdRmbrsmntAgtCheck = " + thrdRmbrsmntAgtCheck);
	
	var instgRmbrsmntAgtCheck = isXmlNodePresent2(Document, "InstgRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: instgRmbrsmntAgtCheck = " + instgRmbrsmntAgtCheck);
	
	var instdRmbrsmntAgtCheck = isXmlNodePresent2(Document, "InstdRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: instdRmbrsmntAgtCheck = " + instdRmbrsmntAgtCheck);
	
	var clrSysCheck = isXmlNodePresent2(Document, "ClrSys");
	logger.info("sttlmMtdRuleCamt056: clrSysCheck = " + clrSysCheck);
	
	var sttlmAcctCheck = isXmlNodePresent2(Document, "SttlmAcct");
	logger.info("settlementMethodCoverRulePacs008: sttlmAcctCheck = " + sttlmAcctCheck);

	if(sttlmMtdValue == "INDA" || sttlmMtdValue == "INGA"){
		if(thrdRmbrsmntAgtCheck || instgRmbrsmntAgtCheck || instdRmbrsmntAgtCheck || clrSysCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("125", "7872", map);
			return retVal;
		}
	}
	
	if(sttlmMtdValue == "COVE"){
		if(sttlmAcctCheck || clrSysCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("125", "7870", map);
			return retVal;
		}
	}
	
	if(sttlmMtdValue == "COVE"){
		if(!instgRmbrsmntAgtCheck || !instdRmbrsmntAgtCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("125", "7871", map);
			return retVal;
		}
	}
	
	if(sttlmMtdValue == "CLRG"){
		if(thrdRmbrsmntAgtCheck || instgRmbrsmntAgtCheck || instdRmbrsmntAgtCheck || sttlmAcctCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("125", "7869", map);
			return retVal;
		}
	}
	return retVal;
}

function grpCxlAndRsnRuleCamt056(Document, map) {
	var grpCxlPath;
	var grpCxlValue;
	var rsnPath;
	var rsnValue;
	var txInfPath;
	var txInfValue;
	var retVal ;

	logger.info("In grpCxlAndRsnRuleCamt056");
	retVal = 0;

	grpCxlPath = "/Document/FIToFIPmtCxlReq/Undrlyg/OrgnlGrpInfAndCxl/GrpCxl";
	grpCxlValue = getValueFromPath(Document, grpCxlPath);
	logger.info("grpCxlValue = "+grpCxlValue);
	
	rsnPath = "/Document/FIToFIPmtCxlReq/Undrlyg/OrgnlGrpInfAndCxl/CxlRsnInf/Rsn";
	rsnValue = getValueFromPath(Document, rsnPath);
	logger.info("rsnValue = "+rsnValue);
	
	txInfPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf";
	txInfValue = getValueFromPath(Document, txInfPath);
	logger.info("txInfValue = "+txInfValue);

	if(grpCxlValue == "true"){
		if(rsnValue){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("125", "1111", map);
			return retVal;
		}
	}
	
	if(grpCxlValue == "false"){
		if(!txInfValue){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("125", "1112", map);
			return retVal;
		}
	}
	
	if(grpCxlValue == "true"){
		if(txInfValue){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("125", "1113", map);
			return retVal;
		}
	}
	return retVal;
}

function messageOrGroupCaseRuleCamt056(Document, map) {
	var casePath;
	var caseValue;
	var orgnlGrpInfAndCxlCasePath;
	var orgnlGrpInfAndCxlCaseValue;
	var txInfCasePath;
	var txInfCaseValue;
	var retVal ;

	logger.info("In messageOrGroupCaseRuleCamt056");
	retVal = 0;

	casePath = "/Document/FIToFIPmtCxlReq/Case/Id";
	caseValue = getValueFromPath(Document, casePath);
	logger.info("caseValue = "+caseValue);
	
	orgnlGrpInfAndCxlCasePath = "/Document/FIToFIPmtCxlReq/Undrlyg/OrgnlGrpInfAndCxl/Case/Id";
	orgnlGrpInfAndCxlCaseValue = getValueFromPath(Document, orgnlGrpInfAndCxlCasePath);
	logger.info("orgnlGrpInfAndCxlCaseValue = "+orgnlGrpInfAndCxlCaseValue);
	
	txInfCasePath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/Case/Id";
	txInfCaseValue = getValueFromPath(Document, txInfCasePath);
	logger.info("txInfCaseValue = "+txInfCaseValue);

	if(caseValue && orgnlGrpInfAndCxlCaseValue && txInfCaseValue){
		setHeader(map, "PLCN_validMessage",false);
		retVal = setCommentsForTransaction("125", "1121", map);
		return retVal;
	}
	
	if(!caseValue && !orgnlGrpInfAndCxlCaseValue && !txInfCaseValue){
		setHeader(map, "PLCN_validMessage",false);
		retVal = setCommentsForTransaction("125", "1131", map);
		return retVal;
	}
	return retVal;
}

//Camt029 IsoValidationRules

function amendmentIndicatorRuleCamt029(Document,map) {
	logger.info("In amendmentIndicatorRuleCamt029");
	
	var amdmntIndPath;
	var amdmntInd;
	var amdmntInfDtls;
	var retVal;

	retVal = 0;

	amdmntIndPath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/MndtRltdInf/AmdmntInd";
	amdmntInd = getValueFromPath(Document, amdmntIndPath);
	logger.info("amendmentIndicatorRuleCamt029 : amdmntInd = " + amdmntInd);
	
	amdmntInfDtls = isXmlNodePresent3(Document, "TxInfAndSts", "OrgnlTxRef", "MndtRltdInf", "<AmdmntInfDtls>");
	logger.info("amendmentIndicatorRuleCamt029: amdmntInfDtls = " + amdmntInfDtls);
	
	if(amdmntInd == "TRUE"){

		if(!amdmntInfDtls){
			
			setHeader(map, "PLCN_validMessage", false);
			logger.info("amendmentIndicatorRuleCamt029: If AmendmentIndicator is true, then AmendementInformationDetails must be present.");
			retVal = setCommentsForTransaction("1121", "7936", map);
			return retVal;
		}
	}
	
	if(amdmntInd == "FALSE"){

		if(amdmntInfDtls){
			
			setHeader(map, "PLCN_validMessage",false);
			logger.info("amendmentIndicatorRuleCamt029: If AmendmentIndicator is false, then AmendmentInformationDetails is not allowed.");
			retVal = setCommentsForTransaction("1121", "7937", map);
			return retVal;
		}
	}
	return retVal;
} 

function genericMustPresentRuleCamt029(Document, map) {
		logger.info("In genericMustPresentRuleCamt029");
		
	var retVal = 0;
	var instgRmbrsmntAgtAcct; 
	var instgRmbrsmntAgt;
	var instdRmbrsmntAgtAcct; 
	var instdRmbrsmntAgt;
	var thrdRmbrsmntAgtAcct;
	var thrdRmbrsmntAgt;
	
	instgRmbrsmntAgtAcct = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRuleCamt029: instgRmbrsmntAgtAcct = " + instgRmbrsmntAgtAcct);
	
	instgRmbrsmntAgt = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgt>");
	logger.info("genericMustPresentRuleCamt029: instgRmbrsmntAgt = " + instgRmbrsmntAgt);
	
	instdRmbrsmntAgtAcct = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRuleCamt029: instdRmbrsmntAgtAcct = " + instdRmbrsmntAgtAcct);
	
	instdRmbrsmntAgt = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgt>");
	logger.info("genericMustPresentRuleCamt029: instdRmbrsmntAgt = " + instdRmbrsmntAgt);
	
	thrdRmbrsmntAgtAcct = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRuleCamt029: thrdRmbrsmntAgtAcct = " + thrdRmbrsmntAgtAcct);
	
	thrdRmbrsmntAgt = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgt>");
	logger.info("genericMustPresentRuleCamt029: thrdRmbrsmntAgt = " + thrdRmbrsmntAgt);
	
	var grpCxlStsPath = "/Document/RsltnOfInvstgtn/CxlDtls/OrgnlGrpInfAndSts/GrpCxlSts";
	var grpCxlStsVal = getValueFromPath(Document, grpCxlStsPath);
	logger.info("grpCxlStsVal = "+grpCxlStsVal);
	
	var nbOfTxsPerCxlSts = isXmlNodePresent3(Document, "RsltnOfInvstgtn", "CxlDtls", "OrgnlGrpInfAndSts", "<NbOfTxsPerCxlSts>");
	logger.info("genericMustPresentRuleCamt029: nbOfTxsPerCxlSts = " + nbOfTxsPerCxlSts);
	
	var confPath = "/Document/RsltnOfInvstgtn/Sts/Conf";
	var confVal = getValueFromPath(Document, confPath);
	logger.info("confVal = "+confVal);
	
	var cxlDtls = isXmlNodePresent2(Document, "CxlDtls");
	logger.info("genericMustPresentRuleCamt029: cxlDtls = " + cxlDtls);

	if(instgRmbrsmntAgtAcct){
		if(!instgRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRuleCamt029: If InstructingReimbursementAgentAccount is present, then InstructingReimbursementAgent must be present.");
			retVal = setCommentsForTransaction("00", "7944", map);		
			return retVal;	
		}
	}
	
	if(instdRmbrsmntAgtAcct){
		if(!instdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRuleCamt029: If InstructedReimbursementAgentAccount is present, then InstructedReimbursementAgent must be present..");
			retVal = setCommentsForTransaction("00", "7945", map);		
			return retVal;	
		}
	}
	
	if(thrdRmbrsmntAgtAcct){
		if(!thrdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRuleCamt029: If ThirdReimbursementAgentAccount is present, then ThirdReimbursementAgent must be present.");
			retVal = setCommentsForTransaction("00", "7946", map);		
			return retVal;	
		}
	}
	
	if(thrdRmbrsmntAgt){
		if(!instgRmbrsmntAgt && !instdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRuleCamt029: If ThrdRmbrsmntAgt is prsnt then InstgRmbmntAgt and InstdRmbmntAgt is mandatory");
			retVal = setCommentsForTransaction("00", "7947", map);		
			return retVal;	
		}
	}
	
	if(grpCxlStsVal == "PACR"){
		if(!nbOfTxsPerCxlSts){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRuleCamt029: OriginalGroupInformationAndStatus/NumberOfTransactionsPerStatus should only be present if GroupCancellationStatus equals PACR.");
			retVal = setCommentsForTransaction("00", "7948", map);		
			return retVal;	
		}
	}
	
	if(confVal == "PECR" || confVal == "RJCR"){
		if(!cxlDtls){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRuleCamt029: If Status/Confirmation is present and equal to PECR or RJCR then CancellationDetails must be present.");
			retVal = setCommentsForTransaction("00", "7949", map);		
			return retVal;	
		}
	}
	return retVal;
}

function genericNotAllowedRuleCamt029(Document, map){
	logger.info("In genericNotAllowedRuleCamt029");
	
	var retVal ;
	retVal = 0;
	
	var grpCxlStsPath = "/Document/RsltnOfInvstgtn/CxlDtls/OrgnlGrpInfAndSts/GrpCxlSts";
	var grpCxlStsVal = getValueFromPath(Document, grpCxlStsPath);
	logger.info("genericNotAllowedRuleCamt029: grpCxlStsVal = "+grpCxlStsVal);
	
	var addtlInf = isXmlNodePresent3(Document, "CxlDtls", "TxInfAndSts", "CxlStsRsnInf", "<AddtlInf>");
	logger.info("genericNotAllowedRuleCamt029: addtlInf = "+addtlInf);
	
	var pmtInfCxlStsPath = "/Document/RsltnOfInvstgtn/CxlDtls/OrgnlPmtInfAndSts/PmtInfCxlSts";
	var pmtInfCxlStsVal = getValueFromPath(Document, pmtInfCxlStsPath);
	logger.info("genericNotAllowedRuleCamt029: pmtInfCxlStsVal = "+pmtInfCxlStsVal);
	
	if(grpCxlStsVal != null){
		if(grpCxlStsVal != "RJCR" || grpCxlStsVal != "PNCR"){
			
			if(addtlInf) {
				setHeader(map, "PLCN_validMessage", false);
				logger.info("genericNotAllowedRuleCamt029 : If GroupCancellationStatus is present and is different from RJCR or PNCR, then CancellationStatusReasonInformation/AdditionalInformation is not allowed.");
				retVal = setCommentsForTransaction("00", "7951", map);
				return retVal;			
			}
		}
	}
	
	if(pmtInfCxlStsVal != null){
		if(pmtInfCxlStsVal != "RJCR" || pmtInfCxlStsVal != "PNCR"){
			
			if(addtlInf) {
				setHeader(map, "PLCN_validMessage", false);
				logger.info("genericNotAllowedRuleCamt029 : If PaymentInformationCancellationStatus is present and is different from RJCR or PNCR, then CancellationStatusReasonInformation/AdditionalInformation is not allowed.");
				retVal = setCommentsForTransaction("00", "7952", map);
				return retVal;			
			}
		}
	}
	return retVal;
}

function settlementMethodRuleCamt029(Document, map) {
		logger.info("In settlementMethodRuleCamt029");
		
	var retVal;

	retVal = 0;
	
	var instgRmbrsmntAgtAcct = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgtAcct>");
	logger.info("settlementMethodRuleCamt029: instgRmbrsmntAgtAcct = " + instgRmbrsmntAgtAcct);
	
	var instgRmbrsmntAgt = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstgRmbrsmntAgt>");
	logger.info("settlementMethodRuleCamt029: instgRmbrsmntAgt = " + instgRmbrsmntAgt);
	
	var instdRmbrsmntAgtAcct = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgtAcct>");
	logger.info("settlementMethodRuleCamt029: instdRmbrsmntAgtAcct = " + instdRmbrsmntAgtAcct);
	
	var instdRmbrsmntAgt = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<InstdRmbrsmntAgt>");
	logger.info("settlementMethodRuleCamt029: instdRmbrsmntAgt = " + instdRmbrsmntAgt);
	
	var thrdRmbrsmntAgtAcct = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgtAcct>");
	logger.info("settlementMethodRuleCamt029: thrdRmbrsmntAgtAcct = " + thrdRmbrsmntAgtAcct);
	
	var thrdRmbrsmntAgt = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<ThrdRmbrsmntAgt>");
	logger.info("settlementMethodRuleCamt029: thrdRmbrsmntAgt = " + thrdRmbrsmntAgt);
	
	var clrSys = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<ClrSys>");
	logger.info("settlementMethodRuleCamt029: clrSys = " + clrSys);
	
	var sttlmtAcct = isXmlNodePresent3(Document, "CxlDtls", "OrgnlTxRef", "SttlmInf", "<SttlmAcct>");
	logger.info("settlementMethodRuleCamt029: sttlmtAcct = " + sttlmtAcct);

	var sttlmtMtdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/SttlmInf/SttlmMtd';
	sttlmtMtd = getValueFromPath(Document, sttlmtMtdPath);
	logger.info("settlementMethodRuleCamt029: sttlmtMtd = " + sttlmtMtd);
	
	if(sttlmtMtd) {
		sttlmtMtd = sttlmtMtd.trim();
	}
	
	if(sttlmtMtd == 'INDA' || sttlmtMtd == 'INGA'){
		if(instgRmbrsmntAgt || instdRmbrsmntAgt || thrdRmbrsmntAgt || instdRmbrsmntAgtAcct || instgRmbrsmntAgtAcct || thrdRmbrsmntAgtAcct || clrSys){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("settlementMethodRuleCamt029: If SttlmntMtd is INDA,INGA then Reimbursement Agts and ClrgSys not allowed");
			retVal = setCommentsForTransaction("00", "7829", map);	
			return retVal;
		}
	}

	if(sttlmtMtd == 'COVE'){
		if(sttlmtAcct || clrSys){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("settlementMethodRuleCamt029: If SttlmntMtd is COVE then SttlmntAcct and ClrgSystem not allowed");
			retVal = setCommentsForTransaction("00", "7830", map);	
			return retVal;			
		}

	}

	if(sttlmtMtd == 'COVE'){
		if(!instdRmbrsmntAgt || !instgRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("settlementMethodRuleCamt029: If SttlmntMtd is COVE then InstdRmbrsmntAgt or InstgRmbrsmntAgt is mandatory");
			retVal = setCommentsForTransaction("00", "7831", map);	
			return retVal;			
		}

	}

	if(sttlmtMtd == 'CLRG'){
		if(sttlmtAcct || instgRmbrsmntAgt || instdRmbrsmntAgt || thrdRmbrsmntAgt || instdRmbrsmntAgtAcct || instgRmbrsmntAgtAcct || thrdRmbrsmntAgtAcct){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("settlementMethodRuleCamt029: If SttlmntMtd is CLRG then Reimbursement Agts and SttlmntAcct not allowed");
			retVal = setCommentsForTransaction("00", "7832", map);	
			return retVal;		
		}
	}
	return retVal;
}

function genericEitherFieldPresentRuleCamt029(Document, map){
	logger.info("In genericEitherFieldPresentRuleCamt029"); 
	
	var retVal ;
	
	retVal = 0;

	var crrctnTx = isXmlNodePresent2(Document, "CrrctnTx");
	
	var instrId = isXmlNodePresent(Document, "CrrctnTx", "Initn", "<InstrId>");
	logger.info("genericEitherFieldPresentRuleCamt029: instrId = " + instrId);
	
	var endToEndId = isXmlNodePresent(Document, "CrrctnTx", "Initn", "<EndToEndId>");
	logger.info("genericEitherFieldPresentRuleCamt029: endToEndId = " + endToEndId);
	
	var txId = isXmlNodePresent(Document, "CrrctnTx", "IntrBk", "<TxId>");
	logger.info("genericEitherFieldPresentRuleCamt029: txId = " + txId);
	
	var reqdExctnDt = isXmlNodePresent(Document, "CrrctnTx", "Initn", "<ReqdExctnDt>");
	logger.info("genericEitherFieldPresentRuleCamt029: reqdExctnDt = " + reqdExctnDt);
	
	var reqdColltnDt = isXmlNodePresent(Document, "CrrctnTx", "Initn", "<ReqdColltnDt>");
	logger.info("genericEitherFieldPresentRuleCamt029: reqdColltnDt = " + reqdColltnDt);
	
	var rslvdCase = isXmlNodePresent2(Document, "<RslvdCase>");
	logger.info("genericMustPresentRuleCamt029: rslvdCase = " + rslvdCase);
	
	var rslvdCase1 = isXmlNodePresent(Document, "CxlDtls", "OrgnlGrpInfAndSts", "<RslvdCase>");
	logger.info("genericEitherFieldPresentRuleCamt029: rslvdCase1 = " + rslvdCase1);
	
	var rslvdCase2 = isXmlNodePresent(Document, "CxlDtls", "TxInfAndSts", "<RslvdCase>");
	logger.info("genericEitherFieldPresentRuleCamt029: rslvdCase2 = " + rslvdCase2);

	if(crrctnTx){
		if(!instrId && !endToEndId){
		
			setHeader(map,"PLCN_validMessage",false);
			logger.info("genericEitherFieldPresentRuleCamt029 : Either InstructionIdentification or EndToEndIdentification or both must be present.");
			retVal = setCommentsForTransaction("1121","7941", map);
			return retVal;
		}
		
		if(!instrId && !endToEndId && !txId){
		
			setHeader(map,"PLCN_validMessage",false);
			logger.info("genericEitherFieldPresentRuleCamt029 : Either InstructionIdentification, EndToEndIdentification, TransactionIdentification or any combination of the three must be present.");
			retVal = setCommentsForTransaction("1121","7942", map);
			return retVal;
		}
		
		if(!reqdExctnDt && !reqdColltnDt){
		
			setHeader(map,"PLCN_validMessage",false);
			logger.info("genericEitherFieldPresentRuleCamt029 : Either RequestedExecutionDate or RequestedCollectionDate must be present.");
			retVal = setCommentsForTransaction("1121","7943", map);
			return retVal;
		}
	}
	
/*	if(!rslvdCase && !rslvdCase1 && !rslvdCase2){
	
		setHeader(map,"PLCN_validMessage",false);
		logger.info("genericEitherFieldPresentRuleCamt029 : ResolvedCase may be present at either ResolvedCase, OriginalGroupInformationAndStatuslevel, OriginalPaymentInformationAndStatus or TransactionInformationAndStatus level.");
		retVal = setCommentsForTransaction("1121","7944", map);
		return retVal;
	}*/
	return retVal;
}


//Pacs003

function grpHdrDrctDbtTxInfFldCompRulePacs003(Document, map) {
	var retVal;
	var ttlIntrBkSttlmAmt;
	var grpHdrInstgAgt;
	var cdtrTrfinInstgAgt;
	var grpHdrInstdAgt;
	var cdtrTrfinInstdAgt;
	var grpHdrPmtTpInf;
	var cdtrTrfinPmtTpInf;

	retVal = 0;
	
	//InstructingAgent
	grpHdrInstgAgt = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "GrpHdr", "<InstgAgt>");
	logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: grpHdrInstgAgt " + grpHdrInstgAgt);

	cdtrTrfinInstgAgt = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "DrctDbtTxInf", "<InstgAgt>");
	logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: cdtrTrfinInstgAgt =" + cdtrTrfinInstgAgt);
	
	//InstructedAgent
	grpHdrInstdAgt = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "GrpHdr", "<InstdAgt>");
	logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: grpHdrInstdAgt " + grpHdrInstdAgt);

	cdtrTrfinInstdAgt = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "DrctDbtTxInf", "<InstdAgt>");
	logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: cdtrTrfinInstdAgt =" + cdtrTrfinInstdAgt);
	
	//PaymentTypeInformation
	grpHdrPmtTpInf = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "GrpHdr", "<PmtTpInf>");
	logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: grpHdrPmtTpInf " + grpHdrPmtTpInf);

	cdtrTrfinPmtTpInf = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "DrctDbtTxInf", "<PmtTpInf>");
	logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: cdtrTrfinPmtTpInf =" + cdtrTrfinPmtTpInf);

	if(grpHdrInstgAgt && cdtrTrfinInstgAgt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: If GrpHdr/InstgAgt is present, then DrctDbtTxInf/InstgAgt is not allowed.");
		retVal = setCommentsForTransaction("138", "1111", map);
		return retVal;
	}

	if(grpHdrInstdAgt && cdtrTrfinInstdAgt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: If GrpHdr/InstdAgt is present, then DrctDbtTxInf/InstdAgt is not allowed.");
		retVal = setCommentsForTransaction("139", "1112", map);
		return retVal;
	}
	
	if(grpHdrPmtTpInf && cdtrTrfinPmtTpInf){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("grpHdrDrctDbtTxInfFldCompRulePacs003: If GroupHeader/PmtTpInf is present, then DrctDbtTxInf/PmtTpInf is not allowed.");
		retVal = setCommentsForTransaction("037", "1113", map);
		return retVal;
	}
	return retVal;
}


function b2bInstAmtExchRateSepaPacs003(Document, map) {
	var intrBkSttlAmtPath;
	var intrBkSttlmtCcy;
	var msgType;
	var instdAmtVal;
	var instdAmtCurrPath;
	var instdAmtCcy;
	var retVal = 0;


	msgType = getHeader(map, "PLCN_msgType");
	logger.info("b2bInstAmtExchRateSepaPacs003: msgType " + msgType);

	instdAmtVal = isXmlNodePresent(Document, "FIToFICstmrDrctDbt", "DrctDbtTxInf", "<InstdAmt>");
	logger.info("b2bInstAmtExchRateSepaPacs003: instdAmtVal = " + instdAmtVal);

	instdAmtCurrPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/InstdAmt/@Ccy';
	instdAmtCcy = getValueFromPath(Document, instdAmtCurrPath);
	logger.info("b2bInstAmtExchRateSepaPacs003: instdAmtCcy = " + instdAmtCcy);	

	intrBkSttlAmtPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/IntrBkSttlmAmt/@Ccy';
	intrBkSttlmtCcy = getValueFromPath(Document, intrBkSttlAmtPath);
	logger.info("b2bInstAmtExchRateSepaPacs003: intrBkSttlmtCcy = " + intrBkSttlmtCcy);

	if(!intrBkSttlmtCcy){
		intrBkSttlAmtPath = '/Document/FIToFICstmrDrctDbt/GrpHdr/IntrBkSttlmAmt/@Ccy';
		intrBkSttlmtCcy = getValueFromPath(Document, intrBkSttlAmtPath);
		logger.info("b2bInstAmtExchRateSepaPacs003: intrBkSttlmtCcy = " + intrBkSttlmtCcy);
	}
	var xchgRateVal = isXmlNodePresent2(Document, "XchgRate");
	logger.info("b2bInstAmtExchRateSepaPacs003: xchgRateVal = " + xchgRateVal);

	if(instdAmtVal){
		if((instdAmtCcy == intrBkSttlmtCcy) && xchgRateVal){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("056", "7924", map);
			logger.info("b2bInstAmtExchRateSepaPacs003:If InstructedAmount is present and the currency is the same as the currency in InterbankSettlementAmount, then ExchangeRate is not allowed.");
			return retVal;		
		}
		if((instdAmtCcy != intrBkSttlmtCcy) && !xchgRateVal){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("056", "7923", map);
			logger.info("b2bInstAmtExchRateSepaPacs003:If InstructedAmount is present and the currency is different from the currency in InterbankSettlementAmount, then ExchangeRate must be present.");
			return retVal;		
		}
	}
	
	if(!instdAmtVal){		
		if(xchgRateVal){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("056", "7907", map);
			logger.info("b2bInstAmtExchRateSepaPacs003:If InstdAmt is not present, then XchgRate is not allowed.");
			return retVal;
		}
	}
	return retVal;
}


 function grpHdrTtlintrBkSttlmAmtRulePacs003(Document, map){
	var retVal;
	logger.info("In grpHdrTtlintrBkSttlmAmtRulePacs003");
	retVal = 0;
	var res;
	var resPath;
	var numbOfTxnPath;
	var numbOfTxn;
	var i;
	var totalAmountOfTxn = 0;
	var intrBkSttlmAmtPath;
	var intrBkSttlmAmt;
	var sum = 0;

	resPath = '/Document/FIToFICstmrDrctDbt/GrpHdr/TtlIntrBkSttlmAmt';
	res = getValueFromPath(Document, resPath);
	logger.info(" grpHdrTtlintrBkSttlmAmtRulePacs003: res = " + res);
	numbOfTxnPath = '/Document/FIToFICstmrDrctDbt/GrpHdr/NbOfTxs';
	numbOfTxn = getValueFromPath(Document, numbOfTxnPath);
	logger.info("grpHdrTtlintrBkSttlmAmtRulePacs003: numbOfTxn = " + numbOfTxn);
	logger.info("grpHdrTtlintrBkSttlmAmtRulePacs003: typeof numbOfTxn = " + typeof numbOfTxn);

	numbOfTxn = Number(numbOfTxn);
	logger.info("grpHdrTtlintrBkSttlmAmtRulePacs003: typeof numbOfTxn = " + typeof numbOfTxn);

	//for(i = 0; i < numbOfTxn; i++) {
		intrBkSttlmAmtPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/IntrBkSttlmAmt';
		intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
		//intrBkSttlmAmt = Number(intrBkSttlmAmt);
		logger.info("grpHdrTtlintrBkSttlmAmtRulePacs003: intrBkSttlmAmt = " + intrBkSttlmAmt);
		//sum = sum + intrBkSttlmAmt;
		//logger.info("grpHdrTtlintrBkSttlmAmtRulePacs003: sum = " + sum);
	//}

	if(res){
		if(res != intrBkSttlmAmt){
				setHeader(map,"PLCN_validMessage",false);
				logger.info("grpHdrTtlintrBkSttlmAmtRulePacs003: If GroupHeader/TotalInterbankSettlementAmount is present,then it must equal the sum of all occurrences of DrctDbtTxInf/InterbankSettlementAmount.");
				retVal = setCommentsForTransaction("050","1222", map);
				return retVal;
			}		
	}
	

	return retVal;
} 

function b2bIntrBnkSttltDateSepaPacs003(Document, map) {
	var retVal;
	var ttlIntrBkSttlmAmt;
	var grpHdrIntrBkSttlmDt;
	var cstmrDrctDbtintrBkStlDt;
	var msgType;

	retVal = 0;

	msgType = getHeader(map, "PLCN_msgType");
	logger.info("b2bIntrBnkSttltDateSepaPacs003: msgType " + msgType);


	grpHdrIntrBkSttlmDt = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "GrpHdr", "<IntrBkSttlmDt>");
	logger.info("b2bIntrBnkSttltDateSepaPacs003: grpHdrIntrBkSttlmDt " + grpHdrIntrBkSttlmDt);

	cstmrDrctDbtintrBkStlDt = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "DrctDbtTxInf", "<IntrBkSttlmDt>");
	logger.info("b2bIntrBnkSttltDateSepaPacs003: grpHdrIntrBkSttlmDt =" + cstmrDrctDbtintrBkStlDt);

	ttlIntrBkSttlmAmt = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "GrpHdr", "<TtlIntrBkSttlmAmt>");
	logger.info("b2bIntrBnkSttltDateSepaPacs003: grpHdrIntrBkSttlmDt =" + ttlIntrBkSttlmAmt);



	if(grpHdrIntrBkSttlmDt && cstmrDrctDbtintrBkStlDt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bIntrBnkSttltDateSepaPacs003: Interbank Settlement Date present in both sequences");
		retVal = setCommentsForTransaction("051", "7042", map);
		return retVal;
	}

	if(!grpHdrIntrBkSttlmDt && !cstmrDrctDbtintrBkStlDt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bIntrBnkSttltDateSepaPacs003: If GrpHdr/IntrBkSttlmDt is not present, then transaction IntrBkSttlmDt must be present.");
		retVal = setCommentsForTransaction("051", "7043", map);
		return retVal;
	}

	if(ttlIntrBkSttlmAmt){
		if(!grpHdrIntrBkSttlmDt && !cstmrDrctDbtintrBkStlDt){
				setHeader(map, "PLCN_validMessage",false);
				logger.info("b2bIntrBnkSttltDateSepaPacs003: If TotalInterbankSettlementAmount is present, then InterbankSettlementDate must be present.");
				retVal = setCommentsForTransaction("051", "7043", map); //NEW violations to be defined..	
				return retVal;	 
		}
	}
	return retVal;
}

function b2bTtlIntrBkSttlmAmtCcySepaPacs003(Document, map,) {
	
	var ttlIntrBkSttlmtPath;
	var ttlIntrBkSttlmAmt;
	var ttlIntrBkSttlmAmtCcy;
	var intrBkSttlmtCcy;
	var intrBkSttlAmtPath;
	var retVal;

	retVal = 0;

	ttlIntrBkSttlmAmt = isXmlNodePresent(Document, "FIToFICstmrDrctDbt", "GrpHdr", "TtlIntrBkSttlmAmt");
	logger.info("b2bTtlIntrBkSttlmAmtCcySepaPacs003: ttlIntrBkSttlmAmt = " + ttlIntrBkSttlmAmt );	


	if(ttlIntrBkSttlmAmt){						//if(isGrpHdrSeq == 'N'){
		ttlIntrBkSttlmtPath = '/Document/FIToFICstmrDrctDbt/GrpHdr/TtlIntrBkSttlmAmt/@Ccy';
		ttlIntrBkSttlmAmtCcy = getValueFromPath(Document, ttlIntrBkSttlmtPath);
		logger.info("b2bTtlIntrBkSttlmAmtCcySepaPacs003: ttlIntrBkSttlmAmtCcy = " + ttlIntrBkSttlmAmtCcy);	
	}
	
	intrBkSttlAmtPath = '/Document/FIToFICstmrDrctDbt/DrctDbtTxInf/IntrBkSttlmAmt/@Ccy';
	intrBkSttlmtCcy = getValueFromPath(Document, intrBkSttlAmtPath);
	logger.info("b2bTtlIntrBkSttlmAmtCcySepaPacs003: intrBkSttlmtCcy = " + intrBkSttlmtCcy );	

	if(ttlIntrBkSttlmAmtCcy != intrBkSttlmtCcy){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("b2bTtlIntrBkSttlmAmtCcySepaPacs003: Currency of Total Interbank Settlement Amount does not match the Interbank Settlement Amount" );	
		retVal = setCommentsForTransaction("050", "7041", map);
		return retVal;
	}

    return retVal;
}

function genericMustPresentRulePacs003(Document, map) {
	logger.info("In genericMustPresentRulePacs003");

	var retval;
	
	retVal = 0;
	
	var intrmyAgt1Acct = isXmlNodePresent(Document, "FIToFICstmrDrctDbt", "DrctDbtTxInf", "<IntrmyAgt1Acct>");
	logger.info("genericMustPresentRulePacs003: intrmyAgt1Acct = " + intrmyAgt1Acct);
	
	var intrmyAgt1 = isXmlNodePresent(Document, "FIToFICstmrDrctDbt","DrctDbtTxInf", "<IntrmyAgt1>");
	logger.info("genericMustPresentRulePacs003: intrmyAgt1 = " + intrmyAgt1);
	
	var intrmyAgt2Acct = isXmlNodePresent(Document,"FIToFICstmrDrctDbt", "DrctDbtTxInf", "<IntrmyAgt2Acct>");
	logger.info("genericMustPresentRulePacs003: intrmyAgt2Acct = " + intrmyAgt2Acct);
	
	var intrmyAgt2 = isXmlNodePresent(Document, "FIToFICstmrDrctDbt", "DrctDbtTxInf", "<IntrmyAgt2>");
	logger.info("genericMustPresentRulePacs003: intrmyAgt2 = " + intrmyAgt2);
	
	var intrmyAgt3Acct = isXmlNodePresent(Document, "FIToFICstmrDrctDbt", "DrctDbtTxInf", "<IntrmyAgt3Acct>");
	logger.info("genericMustPresentRulePacs003: intrmyAgt3Acct = " + intrmyAgt3Acct);
	
	var intrmyAgt3 = isXmlNodePresent(Document, "FIToFICstmrDrctDbt", "DrctDbtTxInf", "<IntrmyAgt3>");
	logger.info("genericMustPresentRulePacs003: intrmyAgt3 = " + intrmyAgt3);
	
	if(intrmyAgt1Acct){
		if(!intrmyAgt1){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs003: If intrmyAgt1Acct is present, then intrmyAgt1 must be present.");
			retVal = setCommentsForTransaction("140", "7111", map);		
			return retVal;	
		}
	}
	
	if(intrmyAgt2Acct){
		if(!intrmyAgt2){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs003: If intrmyAgt2Acct is present, then intrmyAgt2 must be present.");
			retVal = setCommentsForTransaction("142", "7112", map);		
			return retVal;	
		}
	}
	
	if(intrmyAgt2){
		if(!intrmyAgt1){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs003: If intrmyAgt2 is present, then intrmyAgt1 must be present.");
			retVal = setCommentsForTransaction("140", "7113", map);		
			return retVal;	
		}
	}
	
	if(intrmyAgt3Acct){
		if(!intrmyAgt3){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs003: If intrmyAgt3Acct is present, then intrmyAgt3 must be present.");
			retVal = setCommentsForTransaction("144", "7114", map);		
			return retVal;	
		}
	}
	
	if(intrmyAgt3){
		if(!intrmyAgt2){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs003: If intrmyAgt3 is present, then intrmyAgt2 must be present.");
			retVal = setCommentsForTransaction("142", "7115", map);		
			return retVal;	
		}
	}
	
	return retVal;
}

function settlementMethodRulePacs003(Document, map) {
		logger.info("In settlementMethodRulePacs003");
		
	var retVal;

	retVal = 0;
	
	var clrSys = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<ClrSys>");
	logger.info("settlementMethodRulePacs003: clrSys = " + clrSys);
	
	var sttlmtAcct = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<SttlmAcct>");
	logger.info("settlementMethodRulePacs003: sttlmtAcct = " + sttlmtAcct);

	var sttlmtMtdPath = '/Document/FIToFICstmrDrctDbt/GrpHdr/SttlmInf/SttlmMtd';
	sttlmtMtd = getValueFromPath(Document, sttlmtMtdPath);
	logger.info("settlementMethodRulePacs003: sttlmtMtd = " + sttlmtMtd);
	
	if(sttlmtMtd) {
		sttlmtMtd = sttlmtMtd.trim();
	}
	
	if(sttlmtMtd == 'INDA' || sttlmtMtd == 'INGA'){
		if(clrSys){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("settlementMethodRulePacs003: If SttlmntMtd is INDA,INGA then ClrgSys not allowed");
			retVal = setCommentsForTransaction("012", "7829", map);	
			return retVal;
		}
	}

	if(sttlmtMtd == 'CLRG'){
		if(!clrSys && sttlmtAcct){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("settlementMethodRulePacs003: If SttlmntMtd is CLRG then clrSys must present and SttlmntAcct not allowed");
			retVal = setCommentsForTransaction("012", "7832", map);	
			return retVal;		
		}
	}
	return retVal;
}

function dbtrUltmtDbtrContentCheckPacs003(Document, map) {
	var retVal;
	var ultmtDbtrNm;
	var ultmtDbtrPstlAdr;
	var ultmtDbtrId;
	var ultmtDbtrCtryOfRes;
	var ultmtDbtrCtctDtls;
	var dbtrNm;
	var dbtrPstlAdr;
	var dbtrId;
	var dbtrCtryOfRes;
	var dbtrCtctDtl;
	retVal = 0;
	var documentString = convertDocumentToString(Document);
	logger.info("dbtrUltmtDbtrContentCheckPacs003");
	
	if(isPatternPresent(documentString, "<Dbtr>")){
		var dbtrData = dataBetweenTokens("<Dbtr>", "</Dbtr>", documentString);
		dbtrNm = dataBetweenTokens("<Nm>", "</Nm>", dbtrData);
		logger.info("dbtrUltmtDbtrContentCheckPacs003: dbtrNm= " + dbtrNm);
		dbtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", dbtrData);
		logger.info("dbtrUltmtDbtrContentCheckPacs003: dbtrPstlAdr= " + dbtrPstlAdr);
		dbtrId = dataBetweenTokens("<Id>", "</Id>", dbtrData);
		dbtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", dbtrData);
		dbtrCtctDtl = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", dbtrData);
		
		if(isPatternPresent(documentString, "<UltmtDbtr>")){
			var ultmtDbtrData = dataBetweenTokens("<UltmtDbtr>", "</UltmtDbtr>", documentString);
			ultmtDbtrNm = dataBetweenTokens("<Nm>", "</Nm>", ultmtDbtrData);
			logger.info(" ultmtDbtrNm =" + ultmtDbtrNm);
			ultmtDbtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", ultmtDbtrData);
			logger.info("ultmtDbtrPstlAdr" + ultmtDbtrPstlAdr);
			ultmtDbtrId = dataBetweenTokens("<Id>", "</Id>", ultmtDbtrData);
			ultmtDbtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", ultmtDbtrData);
			ultmtDbtrCtctDtls = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", ultmtDbtrData);
			
			if(ultmtDbtrNm == dbtrNm || ultmtDbtrPstlAdr == dbtrPstlAdr || ultmtDbtrId == dbtrId || ultmtDbtrCtryOfRes == dbtrCtryOfRes || ultmtDbtrCtctDtls == dbtrCtctDtl){
				logger.info("dbtrUltmtDbtrContentCheckPacs003: UltimateDebtor may only be present if different from Debtor.");
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("173", "5745", map);
				return retVal;
			}
		}
		
	}
	return retVal;
}

function cdtrUltmtCdtrContentCheckPacs003(Document, map) {
		logger.info("cdtrUltmtCdtrContentCheckPacs003");
		
	var retVal;
	var ultmtCdtrNm;
	var ultmtCdtrPstlAdr;
	var ultmtCdtrId;
	var ultmtCdtrCtryOfRes;
	var ultmtCdtrCtctDtls;
	var cdtrNm;
	var cdtrPstlAdr;
	var cdtrId;
	var cdtrCtryOfRes;
	var cdtrCtctDtl;
	retVal = 0;
	var documentString = convertDocumentToString(Document);
	
	if(isPatternPresent(documentString, "<Cdtr>")){
		var cdtrData = dataBetweenTokens("<Cdtr>", "</Cdtr>", documentString);
		cdtrNm = dataBetweenTokens("<Nm>", "</Nm>", cdtrData);
		logger.info("cdtrNm" + cdtrNm);
		cdtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", cdtrData);
		logger.info("cdtrPstlAdr" + cdtrPstlAdr);
		cdtrId = dataBetweenTokens("<Id>", "</Id>", cdtrData);
		cdtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", cdtrData);
		cdtrCtctDtl = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", cdtrData);
		
		if(isPatternPresent(documentString, "<UltmtCdtr>")){
			var ultmtCdtrData = dataBetweenTokens("<UltmtCdtr>", "</UltmtCdtr>", documentString);
			ultmtCdtrNm = dataBetweenTokens("<Nm>", "</Nm>", ultmtCdtrData);
			logger.info(" ultmtCdtrNm =" + ultmtCdtrNm);
			ultmtCdtrPstlAdr = dataBetweenTokens("<PstlAdr>", "</PstlAdr>", ultmtCdtrData);
			logger.info("ultmtCdtrPstlAdr" + ultmtCdtrPstlAdr);
			ultmtCdtrId = dataBetweenTokens("<Id>", "</Id>", ultmtCdtrData);
			ultmtCdtrCtryOfRes = dataBetweenTokens("<CtryOfRes>", "</CtryOfRes>", ultmtCdtrData);
			ultmtCdtrCtctDtls = dataBetweenTokens("<CtctDtls>", "</CtctDtls>", ultmtCdtrData);
			
			if(ultmtCdtrNm == cdtrNm || ultmtCdtrPstlAdr == cdtrPstlAdr || ultmtCdtrId == cdtrId || ultmtCdtrCtryOfRes == cdtrCtryOfRes || ultmtCdtrCtctDtls == cdtrCtctDtl){
				logger.info("cdtrUltmtCdtrContentCheckPacs003: UltimateDebtor may only be present if different from Debtor.");
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("129", "5746", map);
				return retVal;
			}
		}	
	}
	return retVal;
}

function eitherFieldPresentRulePacs003(Document, map){
	logger.info("In eitherFieldPresentRulePacs003"); 
	
	var retVal ;
	
	retVal = 0;
	
	var txId = isXmlNodePresent(Document, "DrctDbtTxInf", "PmtId", "<TxId>");
	logger.info("eitherFieldPresentRulePacs003: txId = " + txId);
	
	var uetr = isXmlNodePresent(Document, "DrctDbtTxInf", "PmtId", "<UETR>");
	logger.info("eitherFieldPresentRulePacs003: uetr = " + uetr);

	if(!txId && !uetr){
		
		setHeader(map,"PLCN_validMessage",false);
		logger.info("eitherFieldPresentRulePacs003 : TransactionIdentification or UETR must be present. Both may be present.");
		retVal = setCommentsForTransaction("031","7941", map);
		return retVal;
	}
	return retVal;
}

//SEPA PACS007

function AmdmntIndSepaPacs007Rule(Document,map){
	var retVal;
	var amdmntIndPath;
	var amdmntInd;
	var amdmntInfDtls;

	amdmntIndPath = '/Document/FIToFIPmtRvsl/TxInf/OrgnlTxRef/MndtRltdInf/AmdmntInd';
	amdmntInd = getValueFromPath(Document, amdmntIndPath);
	amdmntInd = amdmntInd.toUpperCase();

	amdmntInfDtls = isXmlNodePresent3(Document, "TxInf", "OrgnlTxRef", "MndtRltdInf", "AmdmntInfDtls");

	if(amdmntInd == "FALSE" && amdmntInfDtls){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("AmdmntIndSepaPacs007Rule: If AmendmentIndicator is false, then AmendmentInformationDetails is not allowed.");
		retVal = setCommentsForTransaction("076", "7829", map);	
		return retVal;
	}else if(amdmntInd == "TRUE" && !amdmntInfDtls){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("AmdmntIndSepaPacs007Rule: If AmendmentIndicator is true, then AmendmentInformationDetails must be present.");
		retVal = setCommentsForTransaction("076", "7829", map);	
		return retVal;		
	}
	return retVal;
}

function chargesInfoSepaPacs007Rule(Document,map){
	var retVal;
	var rvsdInstdAmt;
	var chrgsInf;

	retVal = 0;

	chrgsInf = isXmlNodePresent(Document, "FIToFIPmtRvsl","TxInf", "ChrgsInf");

	rvsdInstdAmt = isXmlNodePresent(Document, "FIToFIPmtRvsl","TxInf", "RvsdInstdAmt");

	if(chrgsInf && !rvsdInstdAmt){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("chargesInfoSepaPacs007Rule: If ChargesInformation is present, then ReversedInstructedAmount must be present.");
		retVal = setCommentsForTransaction("049", "7829", map);	
		return retVal;
	}
	return retVal;
}

function OrgnlGrpInfoSepaPacs007Rule(Document,map){
	var retVal;
	var orgnlGrpInf2;
	var orgnlGrpInf;
	retVal = 0;


	orgnlGrpInf = isXmlNodePresent4(Document, "FIToFIPmtRvsl","OrgnlGrpInf");

	orgnlGrpInf2 = isXmlNodePresent(Document, "FIToFIPmtRvsl","TxInf", "OrgnlGrpInf");

	if(orgnlGrpInf && orgnlGrpInf2){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("OrgnlGrpInfoSepaPacs007Rule: If OriginalGroupInformation is present, then TransactionInformation/OriginalGroupInformation is not allowed.");
		retVal = setCommentsForTransaction("038", "7829", map);	
		return retVal;
	}
	return retVal;
}

function sttlmMtdRuleSepaPacs007(Document, map) {
	var sttlmMtdPath;
	var sttlmMtdValue;
	var retVal ;

	logger.info("In sttlmMtdRuleSepaPacs007");
	retVal = 0;

	sttlmMtdPath = "/Document/FIToFIPmtRvsl/GrpHdr/SttlmInf/SttlmMtd";
	sttlmMtdValue = getValueFromPath(Document, sttlmMtdPath);
	logger.info("sttlmMtdValue = "+ sttlmMtdValue);
	
	var thrdRmbrsmntAgtCheck = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "ThrdRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: thrdRmbrsmntAgtCheck = " + thrdRmbrsmntAgtCheck);
	
	var instgRmbrsmntAgtCheck = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "InstgRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: instgRmbrsmntAgtCheck = " + instgRmbrsmntAgtCheck);
	
	var instdRmbrsmntAgtCheck = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "InstgRmbrsmntAgt");
	logger.info("thirdreimbursementAgentRuleCamt056: instdRmbrsmntAgtCheck = " + instdRmbrsmntAgtCheck);
	
	var clrSysCheck = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "ClrSys"); 
	logger.info("sttlmMtdRuleSepaPacs007: clrSysCheck = " + clrSysCheck);
	
	var sttlmAcctCheck = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "SttlmAcct");
	logger.info("settlementMethodCoverRulePacs008: sttlmAcctCheck = " + sttlmAcctCheck);

	if(sttlmMtdValue == "INDA" || sttlmMtdValue == "INGA"){
		if(thrdRmbrsmntAgtCheck || instgRmbrsmntAgtCheck || instdRmbrsmntAgtCheck || clrSysCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("013", "7872", map);
			logger.info("settlementMethodCoverRulePacs008: If SettlementMethod is equal to INDA or INGA, then ReimbursementAgent(s) and ClearingSystem are not allowed.");
			return retVal;
		}
	}
	
	if(sttlmMtdValue == "COVE"){
		if(sttlmAcctCheck || clrSysCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("013", "7870", map);
			logger.info("settlementMethodCoverRulePacs008:If SettlementMethod is equal to COVE, then SettlementAccount and ClearingSystem are not allowed.");
			return retVal;
		}
	}
	
	if(sttlmMtdValue == "COVE"){
		if(!instgRmbrsmntAgtCheck && !instdRmbrsmntAgtCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("013", "7871", map);
			logger.info("settlementMethodCoverRulePacs008:If SettlementMethod is equal to COVE, then InstructedReimbursementAgent or InstructingReimbursementAgent must be present");
			return retVal;
		}
	}
	
	if(sttlmMtdValue == "CLRG"){
		if(thrdRmbrsmntAgtCheck || instgRmbrsmntAgtCheck || instdRmbrsmntAgtCheck || sttlmAcctCheck){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("013", "7869", map);
			logger.info("If SettlementMethod is equal to CLRG, then SettlementAccount and ReimbursementAgent(s) are not allowed.")
			return retVal;
		}
	}
	return retVal;
}


function genericMustPresentRulePacs007(Document, map) {
	
	var retVal;
	var instgRmbrsmntAgtAcct; 
	var instgRmbrsmntAgt;
	var instdRmbrsmntAgtAcct; 
	var instdRmbrsmntAgt;
	var thrdRmbrsmntAgtAcct;
	var thrdRmbrsmntAgt;
	
	logger.info("In genericMustPresentRulePacs007");

	retVal = 0;

	instgRmbrsmntAgtAcct = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstgRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRulePacs007: instgRmbrsmntAgtAcct = " + instgRmbrsmntAgtAcct);
	
	instgRmbrsmntAgt = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstgRmbrsmntAgt>");
	logger.info("genericMustPresentRulePacs007: instgRmbrsmntAgt = " + instgRmbrsmntAgt);
	
	instdRmbrsmntAgtAcct = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstdRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRulePacs007: instdRmbrsmntAgtAcct = " + instdRmbrsmntAgtAcct);
	
	instdRmbrsmntAgt = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<InstdRmbrsmntAgt>");
	logger.info("genericMustPresentRulePacs007: instdRmbrsmntAgt = " + instdRmbrsmntAgt);
	
	thrdRmbrsmntAgtAcct = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<ThrdRmbrsmntAgtAcct>");
	logger.info("genericMustPresentRulePacs007: thrdRmbrsmntAgtAcct = " + thrdRmbrsmntAgtAcct);
	
	thrdRmbrsmntAgt = isXmlNodePresent(Document, "GrpHdr", "SttlmInf", "<ThrdRmbrsmntAgt>");
	logger.info("genericMustPresentRulePacs007: thrdRmbrsmntAgt = " + thrdRmbrsmntAgt);

	if(instgRmbrsmntAgtAcct){
		if(!instgRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs007: If InstructingReimbursementAgentAccount is present, then InstructingReimbursementAgent must be present.");
			retVal = setCommentsForTransaction("018", "7114", map);		
			return retVal;	
		}
	}
	
	if(instdRmbrsmntAgtAcct){
		if(!instdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs007: If InstructedReimbursementAgentAccount is present, then InstructedReimbursementAgent must be present..");
			retVal = setCommentsForTransaction("020", "7115", map);		
			return retVal;	
		}
	}
	
	if(thrdRmbrsmntAgtAcct){
		if(!thrdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs007: If ThirdReimbursementAgentAccount is present, then ThirdReimbursementAgent must be present.");
			retVal = setCommentsForTransaction("022", "7771", map);		
			return retVal;	
		}
	}
	
	if(thrdRmbrsmntAgt){
		if(!instgRmbrsmntAgt && !instdRmbrsmntAgt){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("genericMustPresentRulePacs007: If ThirdReimbursementAgent is present, then InstructingReimbursementAgent and InstructedReimbursementAgent must both be present.");
			retVal = setCommentsForTransaction("012", "7773", map);		
			return retVal;	
		}
	}
	return retVal;
}

function intrBnkSttltDateSepaPacs007(Document, map) {
	var retVal;
	var ttlIntrBkSttlmAmt;
	var grpHdrIntrBkSttlmDt;

	retVal = 0;

	grpHdrIntrBkSttlmDt = isXmlNodePresent(Document,"FIToFIPmtRvsl", "GrpHdr", "<IntrBkSttlmDt>");
	logger.info("intrBnkSttltDateSepaPacs007: grpHdrIntrBkSttlmDt " + grpHdrIntrBkSttlmDt);

	ttlIntrBkSttlmAmt = isXmlNodePresent(Document,"FIToFIPmtRvsl", "GrpHdr", "<TtlRvsdIntrBkSttlmAmt>");
	logger.info("intrBnkSttltDateSepaPacs007: grpHdrIntrBkSttlmDt =" + ttlIntrBkSttlmAmt);	

	if(ttlIntrBkSttlmAmt){
		if(!grpHdrIntrBkSttlmDt){
				setHeader(map, "PLCN_validMessage",false);
				logger.info("intrBnkSttltDateSepaPacs007:If TotalReversedInterbankSettlementAmount is present, then InterbankSettlementDate must be present.");
				retVal = setCommentsForTransaction("011", "7043", map); //NEW violations to be defined..	
				return retVal;	 
		}
	}
	return retVal;
}