function genericNoOfTxnCheckSepaInstRule(exchange) {
	var retVal;
	var numbOfTxnPath;
	var numbOfTxn;

	retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);

	if(isPatternPresent(messageBody, "</PmtRtr>")) {
	numbOfTxnPath = '/Document/PmtRtr/GrpHdr/NbOfTxs';
	numbOfTxn = getValueFromPath(Document, numbOfTxnPath);
		logger.info("genericNoOfTxnCheckSepaInstRule: numbOfTxn = " + numbOfTxn);
		if(!numbOfTxn) {
			numbOfTxn = Document.getElementsByTagName("TxInf").length;
			logger.info("genericNoOfTxnCheckSepaInstRule: numbOfTxn = " + numbOfTxn);
		}
	}

	if(isPatternPresent(messageBody, "</RsltnOfInvstgtn>")) {
		numbOfTxn = Document.getElementsByTagName("TxInfAndSts").length;
		logger.info("genericNoOfTxnCheckSepaInstRule: numbOfTxn = " + numbOfTxn);
	}
	

	if(numbOfTxn != 1){
				setHeader(map, "PLCN_validMessage", false);
			logger.info("genericNoOfTxnCheckSepaInstRule:numbOfTxn Must be equal to 1");
				retVal = setCommentsForTransaction("122", "7058", map);	
				return retVal;	 
	}
	return retVal;
}

/* function nonAllowedFieldsGenericRule(exchange) {

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var retVal = 0;
	logger.info('In nonAllowedFieldsGenericRule');
	
	//loop for pacs.004
	if(isPatternPresent(Document1, "<PmtRtr>")){
		//Clearing system
		var clrSysCheck =  isXmlNodePresent3(Document, "PmtRtr","GrpHdr", "SttlmInf", "<ClrSys>");

		if(clrSysCheck){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("PmtRtr-ClrSys is not allowed");
			retVal = setCommentsForTransaction("945", "7136", map);
			return retVal;
		}	
	}
	return retVal;
} */

function mandatoryValueGenericRule(exchange) {

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var retVal = 0;
	var prtryPath;
	var prtryValue;
	var clrSysCheck;

	logger.info('In mandatoryValueGenericRule');
	
	//loop for pacs.004
	if(isPatternPresent(Document1, "<PmtRtr>")){
		//Clearing system
		clrSysCheck =  isXmlNodePresent3(Document, "PmtRtr","GrpHdr", "SttlmInf", "<ClrSys>");
		
		prtryPath = "/Document/PmtRtr/GrpHdr/SttlmInf/ClrSys/Prtry";
		prtryValue = getValueFromPath(Document, prtryPath);
		logger.info("prtryValue = "+ prtryValue);

		if(clrSysCheck){
			if(prtryValue && prtryValue != "RT1"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("PmtRtr-ClrSys is not allowed");
				retVal = setCommentsForTransaction("152", "7488", map);
				return retVal;
			}
		}	
	}
	
	//loop for pacs008
	if(isPatternPresent(Document1, "<FIToFICstmrCdtTrf>")){
		//Clearing system
		clrSysCheck =  isXmlNodePresent3(Document, "PmtRtr","GrpHdr", "SttlmInf", "<ClrSys>");
		
		prtryPath = "/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/ClrSys/Prtry";
		prtryValue = getValueFromPath(Document, prtryPath);

		if(clrSysCheck){
			if(prtryValue && prtryValue != "RT1"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("PmtRtr-Prtry only RT1 is allowed");
				retVal = setCommentsForTransaction("149", "7488", map); //field no is not present
				return retVal;
			}
		}	
	}
	
	//loop added for pacs028
	if(isPatternPresent(Document1, "<FIToFIPmtStsReq>")){
		var clrSysPrtryPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/SttlmInf/ClrSys/Prtry";
		var clrSysPrtry = getValueFromPath(Document, clrSysPrtryPath);
		logger.info("clrSysPrtrySepaInstPacs028Rule:clrSysPrtry = "+ clrSysPrtry);
	 
		if(clrSysPrtry){
			if(clrSysPrtry != "RT1"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("clrSysPrtrySepaInstPacs028Rule: Only the value “RT1” is supported."); //field no is not present
				retVal = setCommentsForTransaction("004", "7058", map);
				return retVal;
			}
		}
	}
	return retVal;
}

function chrgsInfAndRtrdInstdAmtSepaInstPacs004(Document, map) {
	var retVal ;

	logger.info("In chrgsInfAndRtrdInstdAmtSepaInstPacs004");
	retVal = 0;
  
  	var res = isXmlNodePresent2(Document, "ChrgsInf");
	logger.info("chrgsInfAndRtrdInstdAmtSepaInstPacs004: res = " + res);

	if(res == true){
		var res1 = isXmlNodePresent2(Document, "RtrdInstdAmt");
		logger.info("chrgsInfAndRtrdInstdAmtSepaInstPacs004: res1 = " + res1);
		
		if(res1 != true){
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("189", "7925", map);
			logger.info("chrgsInfAndRtrdInstdAmtSepaInstPacs004: RtrdInstdAmt must be present if ‘Charges Information is present’,");
			return retVal;
		}
	}
	return retVal;
}

function rtrdInstdAmtAndrsnCdSepaInstPacs004(Document, map) {
	
	logger.info("In rtrdInstdAmtAndrsnCdSepaInstPacs004");
	retVal = 0;
	

	//var rtrdInstdAmtPath = "/Document/PmtRtr/TxInf/RtrdInstdAmt";
	var rtrdInstdAmt = isXmlNodePresent2(Document, "RtrdInstdAmt");
	logger.info("rtrdInstdAmtAndrsnCdSepaInstPacs004: rtrdInstdAmt = " + rtrdInstdAmt);

	var rsnCdPath = '/Document/PmtRtr/TxInf/RtrRsnInf/Rsn/Cd';
	var rsnCd = getValueFromPath(Document, rsnCdPath);
	logger.info("rtrdInstdAmtAndrsnCdSepaInstPacs004: rsnCd = " + rsnCd);

	if(rsnCd != 'FOCR' && rtrdInstdAmt){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("rtrdInstdAmtAndrsnCdSepaInstPacs004: rtrdInstdAmt is only allowed when RtrRsnInf Code is 'FOCR'");
		retVal = setCommentsForTransaction("00", "1223", map);
		return retVal;
	}
	return retVal;
}

function chrgsInfAmtAndrsnCdSepaInstPacs004(Document, map) {
	
	logger.info("In chrgsInfAmtAndrsnCdSepaInstPacs004");
	retVal = 0;	

	//var rtrdInstdAmtPath = "/Document/PmtRtr/TxInf/RtrdInstdAmt";
	var chrgsInfAmt = isXmlNodePresent(Document,"TxInf", "ChrgsInf", "<Amt>");
	logger.info("chrgsInfAmtAndrsnCdSepaInstPacs004: chrgsInf = " + chrgsInfAmt);

	var rsnCdPath = '/Document/PmtRtr/TxInf/RtrRsnInf/Rsn/Cd';
	var rsnCd = getValueFromPath(Document, rsnCdPath);
	logger.info("chrgsInfAmtAndrsnCdSepaInstPacs004: rsnCd = " + rsnCd);

	if(rsnCd != 'FOCR' && chrgsInfAmt){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("chrgsInfAmtAndrsnCdSepaInstPacs004: chrgsInf Amount is only allowed when RtrRsnInf Code is 'FOCR'");
		retVal = setCommentsForTransaction("00", "1224", map);
		return retVal;
	}
	return retVal;
}

function lclInstrmCdSepaInstPacs004Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In lclInstrmCdSepaInstPacs004Rule");
 
	var lclInstrmPath = "/Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd";
	var lclInstrmCd = getValueFromPath(Document, lclInstrmPath);
	logger.info("lclInstrmCdSepaInstPacs004Rule: lclInstrmCd = "+ lclInstrmCd);
 
	if(lclInstrmCd){
		if(lclInstrmCd != "INST"){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("lclInstrmCdSepaInstPacs004Rule: Only the value INST is supported.");
			retVal = setCommentsForTransaction("037", "7063", map);
			return retVal;
		}
	}
	return retVal;
}

function dtAndPlcOfBirthOthrGenericRule(exchange) {

	var retVal = 0;
	var dtAndPlcOfBirthPath;
	var othrPath;
	var dtAndPlcOfBirthVar;
	var othrVar;
	var fld;
	var subFld;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	logger.info('In DtAndPlcOfBirthOthrFromPathRule');
	
	//loop added for pacs.008
	if(isPatternPresent(Document1, "<FIToFICstmrCdtTrf>")){
		//CREDITOR
		var cdtrPrvtId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "Cdtr","Id", "<PrvtId>");

		var cdtrPrvtIdAnyBICPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Id/PrvtId/DtAndPlcOfBirth';
		var cdtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, cdtrPrvtIdAnyBICPath);

		var cdtrPrvtIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Id/PrvtId/Othr';
		var cdtrPrvtIdOthr = getValueFromPath(Document, cdtrPrvtIdOthrPath);

		var cdtrPrvtIdDATA = dataBetweenTokens("<Cdtr>" , "</Cdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrPrvtIdDATA = " + cdtrPrvtIdDATA);
		var cdtrDtAndPlcOfBirth1 = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , cdtrPrvtIdDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrDtAndPlcOfBirth1 = " + cdtrDtAndPlcOfBirth1);

		if(isPatternPresent(Document1, "<Cdtr>") && cdtrPrvtId){
			if((isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>")) || (!isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& !isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>"))){
				logger.info("DtAndPlcOfBirthOthrFromPathRule: inside second if.." );
					setHeader(map, "PLCN_validMessage", false);
				logger.info("Cdtr-Either ?DtAndPlcOfBirth? or ?Othr? is allowed");
					retVal = setCommentsForTransaction("945", "7136", map);
					return retVal;
				}
			}

		//DEBTOR
		var dbtrPrvtId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "Dbtr","Id", "<PrvtId>");

		var dbtrPrvtIdDtAndPlcOfBirthPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Id/PrvtId/DtAndPlcOfBirth';
		var dbtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, dbtrPrvtIdDtAndPlcOfBirthPath);

		var dbtrPrvtIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Id/PrvtId/Othr';
		var dbtrPrvtIdOthr = getValueFromPath(Document, dbtrPrvtIdOthrPath); 

		var dbtrDATA = dataBetweenTokens("<Dbtr>" , "</Dbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrDATA = " + dbtrDATA);
		var dbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , dbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrPrvtIdDATA = " + dbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<Dbtr>") && dbtrPrvtId){
			if((isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(dbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(dbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-if PrvtId is present then Either ‘DtAndPlcOfBirth', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("779", "7136", map);
					return retVal;
				}
			}
		
		//ULTIMATEDEBTOR
		var ultmtDbtrPrvtId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UltmtDbtr","Id", "<PrvtId>");

		var ultmtDbtrPrvtIdDtAndPlcOfBirthPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtDbtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, ultmtDbtrPrvtIdDtAndPlcOfBirthPath);

		var ultmtDbtrPrvtIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Id/PrvtId/Othr';
		var ultmtDbtrPrvtIdOthr = getValueFromPath(Document, ultmtDbtrPrvtIdOthrPath);

		var ultmtDbtrDATA = dataBetweenTokens("<UltmtDbtr>" , "</UltmtDbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrDATA = " + ultmtDbtrDATA);
		var ultmtDbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtDbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrPrvtIdDATA = " + ultmtDbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtDbtr>") && ultmtDbtrPrvtId){
			if((isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("693", "7136", map);
					return retVal;
				}
			}
		
		//ULTIMATECREDITOR
		var ultmtCdtrPrvtId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UltmtCdtr","Id", "<PrvtId>");

		var ultmtCdtrPrvtIdAnyBICPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtCdtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, ultmtCdtrPrvtIdAnyBICPath);

		var ultmtCdtrPrvtIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Id/PrvtId/Othr';
		var ultmtCdtrPrvtIdOthr = getValueFromPath(Document, ultmtCdtrPrvtIdOthrPath);

		var ultmtcdtrDATA = dataBetweenTokens("<UltmtCdtr>" , "</UltmtCdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtcdtrDATA = " + ultmtcdtrDATA);
		var ultmtCdtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtcdtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtCdtrPrvtIdDATA = " + ultmtCdtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtCdtr>") && ultmtCdtrPrvtId){
			if((isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1007", "7136", map);
					return retVal;
				}
			}
		}
	
	//loop for pacs.004
	if(isPatternPresent(Document1, "<PmtRtr>")){
		//CREDITOR
		var cdtrPrvtId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<PrvtId>");

		var cdtrDtAndPlcOfBirthPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var cdtrDtAndPlcOfBirth = getValueFromPath(Document, cdtrDtAndPlcOfBirthPath);

		var cdtrPrvtIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/Othr';
		var cdtrPrvtIdOthr = getValueFromPath(Document, cdtrPrvtIdOthrPath);

		var cdtrPrvtIdDATA = dataBetweenTokens("<Cdtr>" , "</Cdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrPrvtIdDATA = " + cdtrPrvtIdDATA);
		var cdtrDtAndPlcOfBirth1 = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , cdtrPrvtIdDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrDtAndPlcOfBirth1 = " + cdtrDtAndPlcOfBirth1);

		if(isPatternPresent(Document1, "<Cdtr>") && cdtrPrvtId){
			if((isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>")) || (!isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& !isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>"))){
				logger.info("DtAndPlcOfBirthOthrFromPathRule: inside second if.." );
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
					retVal = setCommentsForTransaction("2194", "7136", map);//field not present
					return retVal;
				}
			}

		//DEBTOR
		var dbtrPrvtId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<PrvtId>");

		var dbtrPrvtIdDtAndPlcOfBirthPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var dbtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, dbtrPrvtIdDtAndPlcOfBirthPath);

		var dbtrPrvtIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/Othr';
		var dbtrPrvtIdOthr = getValueFromPath(Document, dbtrPrvtIdOthrPath); 

		var dbtrDATA = dataBetweenTokens("<Dbtr>" , "</Dbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrDATA = " + dbtrDATA);
		var dbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , dbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrPrvtIdDATA = " + dbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<Dbtr>") && dbtrPrvtId){
			if((isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(dbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(dbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
					retVal = setCommentsForTransaction("1997", "7136", map);//field not present
					return retVal;
				}
			}
		
		//ULTIMATECREDITOR
		var ultmtcdtrPrvtId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<PrvtId>");

		var ultmtcdtrDtAndPlcOfBirthPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtcdtrDtAndPlcOfBirth = getValueFromPath(Document, ultmtcdtrDtAndPlcOfBirthPath);

		var ultmtcdtrPrvtIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/Othr';
		var ultmtcdtrPrvtIdOthr = getValueFromPath(Document, ultmtcdtrPrvtIdOthrPath);

		var ultmtcdtrDATA = dataBetweenTokens("<UltmtCdtr>" , "</UltmtCdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtcdtrDATA = " + ultmtcdtrDATA);
		var ultmtCdtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtcdtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtCdtrPrvtIdDATA = " + ultmtCdtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtCdtr>") && ultmtCdtrPrvtId){
			if((isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
					retVal = setCommentsForTransaction("2291", "7136", map);
					return retVal;
				}
			}

		//ULTIMATEDEBTOR
		var ultmtDbtrPrvtId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<PrvtId>");

		var ultmtDbtrDtAndPlcOfBirthPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtDbtrDtAndPlcOfBirth = getValueFromPath(Document, ultmtDbtrDtAndPlcOfBirthPath);

		var ultmtDbtrPrvtIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/Othr';
		var ultmtDbtrPrvtIdOthr = getValueFromPath(Document, ultmtDbtrPrvtIdOthrPath); 

		var ultmtDbtrDATA = dataBetweenTokens("<UltmtDbtr>" , "</UltmtDbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrDATA = " + ultmtDbtrDATA);
		var ultmtDbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtDbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrPrvtIdDATA = " + ultmtDbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtDbtr>") && ultmtDbtrPrvtId){
			if((isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
					retVal = setCommentsForTransaction("1952", "7136", map);
					return retVal;
				}
			}
		}
	
	//loop for camt.056
	if(isPatternPresent(Document1, "<FIToFIPmtCxlReq>")){
		//CREDITOR
		var cdtrPrvtId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<PrvtId>");

		var cdtrDtAndPlcOfBirthPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var cdtrDtAndPlcOfBirth = getValueFromPath(Document, cdtrDtAndPlcOfBirthPath);

		var cdtrPrvtIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/Othr';
		var cdtrPrvtIdOthr = getValueFromPath(Document, cdtrPrvtIdOthrPath);

		var cdtrPrvtIdDATA = dataBetweenTokens("<Cdtr>" , "</Cdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrPrvtIdDATA = " + cdtrPrvtIdDATA);
		var cdtrDtAndPlcOfBirth1 = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , cdtrPrvtIdDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrDtAndPlcOfBirth1 = " + cdtrDtAndPlcOfBirth1);

		if(isPatternPresent(Document1, "<Cdtr>") && cdtrPrvtId){
			if((isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>")) || (!isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& !isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>"))){
				logger.info("DtAndPlcOfBirthOthrFromPathRule: inside second if.." );
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Cdtr-Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
				retVal = setCommentsForTransaction("945", "7136", map);
				return retVal;
				}
			}

		//DEBTOR
		var dbtrPrvtId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<PrvtId>");

		var dbtrPrvtIdDtAndPlcOfBirthPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var dbtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, dbtrPrvtIdDtAndPlcOfBirthPath);

		var dbtrPrvtIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/Othr';
		var dbtrPrvtIdOthr = getValueFromPath(Document, dbtrPrvtIdOthrPath); 

		var dbtrDATA = dataBetweenTokens("<Dbtr>" , "</Dbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrDATA = " + dbtrDATA);
		var dbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , dbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrPrvtIdDATA = " + dbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<Dbtr>") && dbtrPrvtId){
			if((isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(dbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(dbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
					retVal = setCommentsForTransaction("779", "7136", map);
					return retVal;
				}
			}
		
		//ULTIMATECREDITOR
		var ultmtcdtrPrvtId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<PrvtId>");

		var ultmtcdtrDtAndPlcOfBirthPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtcdtrDtAndPlcOfBirth = getValueFromPath(Document, ultmtcdtrDtAndPlcOfBirthPath);

		var ultmtcdtrPrvtIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/Othr';
		var ultmtcdtrPrvtIdOthr = getValueFromPath(Document, ultmtcdtrPrvtIdOthrPath);

		var ultmtcdtrDATA = dataBetweenTokens("<UltmtCdtr>" , "</UltmtCdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtcdtrDATA = " + ultmtcdtrDATA);
		var ultmtCdtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtcdtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtCdtrPrvtIdDATA = " + ultmtCdtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtCdtr>") && ultmtCdtrPrvtId){
			if((isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
					retVal = setCommentsForTransaction("945", "7136", map);
					return retVal;
				}
			}

		//ULTIMATEDEBTOR
		var ultmtDbtrPrvtId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<PrvtId>");

		var ultmtDbtrDtAndPlcOfBirthPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtDbtrDtAndPlcOfBirth = getValueFromPath(Document, ultmtDbtrDtAndPlcOfBirthPath);

		var ultmtDbtrPrvtIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/Othr';
		var ultmtDbtrPrvtIdOthr = getValueFromPath(Document, ultmtDbtrPrvtIdOthrPath); 

		var ultmtDbtrDATA = dataBetweenTokens("<UltmtDbtr>" , "</UltmtDbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrDATA = " + ultmtDbtrDATA);
		var ultmtDbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtDbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrPrvtIdDATA = " + ultmtDbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtDbtr>") && ultmtDbtrPrvtId){
			if((isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
					retVal = setCommentsForTransaction("779", "7136", map);
					return retVal;
				}
			}
		}
	
	//loop for camt.029
	if(isPatternPresent(Document1, "<RsltnOfInvstgtn>")){
		//CREDITOR
		var cdtrPrvtId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<PrvtId>");
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrPrvtId = " + cdtrPrvtId);

		var cdtrDtAndPlcOfBirthPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var cdtrDtAndPlcOfBirth = getValueFromPath(Document, cdtrDtAndPlcOfBirthPath);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrDtAndPlcOfBirth = " + cdtrDtAndPlcOfBirth);
		
		cdtrDtAndPlcOfBirth = isXmlNodePresent3(Document, "Pty","Id", "PrvtId", "<DtAndPlcOfBirth>");
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrDtAndPlcOfBirth = " + cdtrDtAndPlcOfBirth);
		
		var cdtrPrvtIdDATA = dataBetweenTokens("<Cdtr>" , "</Cdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrPrvtIdDATA = " + cdtrPrvtIdDATA);
		var cdtrDtAndPlcOfBirth1 = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , cdtrPrvtIdDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrDtAndPlcOfBirth1 = " + cdtrDtAndPlcOfBirth1);
		
		var cdtrPrvtIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/Othr';
		var cdtrPrvtIdOthr = getValueFromPath(Document, cdtrPrvtIdOthrPath);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrPrvtIdOthr = " + cdtrPrvtIdOthr);

		if(isPatternPresent(Document1, "<Cdtr>") && isPatternPresent(cdtrPrvtIdDATA, "<PrvtId>")){
			if((isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>")) || (!isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& !isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>"))){
				logger.info("DtAndPlcOfBirthOthrFromPathRule: inside second if.." );
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Cdtr-Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
				retVal = setCommentsForTransaction("945", "7136", map);
				return retVal;
			}
		}	

		//DEBTOR
		var dbtrPrvtId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<PrvtId>");

		var dbtrPrvtIdDtAndPlcOfBirthPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var dbtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, dbtrPrvtIdDtAndPlcOfBirthPath);

		var dbtrPrvtIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/Othr';
		var dbtrPrvtIdOthr = getValueFromPath(Document, dbtrPrvtIdOthrPath); 

		var dbtrDATA = dataBetweenTokens("<Dbtr>" , "</Dbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrDATA = " + dbtrDATA);
		var dbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , dbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrPrvtIdDATA = " + dbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<Dbtr>") && dbtrPrvtId){
			if((isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(dbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(dbtrPrvtIdDATA, "<Othr>"))){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Dbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
				retVal = setCommentsForTransaction("779", "7136", map);
				return retVal;
			}
		}
		
		//ULTIMATECREDITOR
		var ultmtcdtrPrvtId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<PrvtId>");

		var ultmtcdtrDtAndPlcOfBirthPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtcdtrDtAndPlcOfBirth = getValueFromPath(Document, ultmtcdtrDtAndPlcOfBirthPath);

		var ultmtcdtrPrvtIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/Othr';
		var ultmtcdtrPrvtIdOthr = getValueFromPath(Document, ultmtcdtrPrvtIdOthrPath);

		var ultmtCdtrDATA = dataBetweenTokens("<UltmtCdtr>" , "</UltmtCdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtCdtrDATA = " + ultmtCdtrDATA);
		var ultmtCdtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtCdtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtCdtrPrvtIdDATA = " + ultmtCdtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtCdtr>") && ultmtcdtrPrvtId){
			if((isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>"))){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Cdtr-Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
				retVal = setCommentsForTransaction("945", "7136", map);
				return retVal;
			}
		}

		//ULTIMATEDEBTOR
		var ultmtDbtrPrvtId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<PrvtId>");

		var ultmtDbtrDtAndPlcOfBirthPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtDbtrDtAndPlcOfBirth = getValueFromPath(Document, ultmtDbtrDtAndPlcOfBirthPath);

		var ultmtDbtrPrvtIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/Othr';
		var ultmtDbtrPrvtIdOthr = getValueFromPath(Document, ultmtDbtrPrvtIdOthrPath); 

		var ultmtdbtrDATA = dataBetweenTokens("<UltmtDbtr>" , "</UltmtDbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtdbtrDATA = " + ultmtdbtrDATA);
		var ultmtdbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtdbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtdbtrPrvtIdDATA = " + ultmtdbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtDbtr>") && ultmtDbtrPrvtId){
			if((isPatternPresent(ultmtdbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtdbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtdbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtdbtrPrvtIdDATA, "<Othr>"))){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("UltmtDbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth’ or ‘Othr’ is allowed");
				retVal = setCommentsForTransaction("779", "7136", map);
				return retVal;
			}
		}
	}
	
	//loop added for pacs028
	if(isPatternPresent(Document1, "</FIToFIPmtStsReq>")) {
		//CREDITOR
		var cdtrPrvtId =  isXmlNodePresent3(Document, "Cdtr", "Pty","Id", "<PrvtId>");

		var cdtrPrvtIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var cdtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, cdtrPrvtIdAnyBICPath);

		var cdtrPrvtIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Cdtr/Pty/Id/PrvtId/Othr';
		var cdtrPrvtIdOthr = getValueFromPath(Document, cdtrPrvtIdOthrPath);

		var cdtrPrvtIdDATA = dataBetweenTokens("<Cdtr>" , "</Cdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrPrvtIdDATA = " + cdtrPrvtIdDATA);
		var cdtrDtAndPlcOfBirth1 = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , cdtrPrvtIdDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: cdtrDtAndPlcOfBirth1 = " + cdtrDtAndPlcOfBirth1);

		if(isPatternPresent(Document1, "<Cdtr>") && cdtrPrvtId){
			if((isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>")) || (!isPatternPresent(cdtrDtAndPlcOfBirth1, "<DtAndPlcOfBirth>")&& !isPatternPresent(cdtrDtAndPlcOfBirth1, "<Othr>"))){
				logger.info("DtAndPlcOfBirthOthrFromPathRule: inside second if.." );
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("945", "7136", map);
					return retVal;
				}
			}

		//DEBTOR
		var dbtrPrvtId =  isXmlNodePresent3(Document, "Dbtr", "Pty","Id", "<PrvtId>");

		var dbtrPrvtIdDtAndPlcOfBirthPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var dbtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, dbtrPrvtIdDtAndPlcOfBirthPath);

		var dbtrPrvtIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Dbtr/Pty/Id/PrvtId/Othr';
		var dbtrPrvtIdOthr = getValueFromPath(Document, dbtrPrvtIdOthrPath); 

		var dbtrDATA = dataBetweenTokens("<Dbtr>" , "</Dbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrDATA = " + dbtrDATA);
		var dbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , dbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: dbtrPrvtIdDATA = " + dbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<Dbtr>") && dbtrPrvtId){
			if((isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(dbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(dbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(dbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("779", "7136", map);
					return retVal;
				}
			}
		
		//ULTIMATEDEBTOR
		var ultmtDbtrPrvtId =  isXmlNodePresent3(Document, "UltmtDbtr", "Pty","Id", "<PrvtId>");

		var ultmtDbtrPrvtIdDtAndPlcOfBirthPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtDbtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, ultmtDbtrPrvtIdDtAndPlcOfBirthPath);

		var ultmtDbtrPrvtIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/PrvtId/Othr';
		var ultmtDbtrPrvtIdOthr = getValueFromPath(Document, ultmtDbtrPrvtIdOthrPath);

		var ultmtDbtrDATA = dataBetweenTokens("<UltmtDbtr>" , "</UltmtDbtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrDATA = " + ultmtDbtrDATA);
		var ultmtDbtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtDbtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtDbtrPrvtIdDATA = " + ultmtDbtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtDbtr>") && ultmtDbtrPrvtId){
			if((isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtDbtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtDbtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("693", "7136", map);
					return retVal;
				}
			}
		
		//ULTIMATECREDITOR
		var ultmtCdtrPrvtId =  isXmlNodePresent3(Document, "UltmtCdtr", "Pty","Id", "<PrvtId>");

		var ultmtCdtrPrvtIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/DtAndPlcOfBirth';
		var ultmtCdtrPrvtIdDtAndPlcOfBirth = getValueFromPath(Document, ultmtCdtrPrvtIdAnyBICPath);

		var ultmtCdtrPrvtIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/PrvtId/Othr';
		var ultmtCdtrPrvtIdOthr = getValueFromPath(Document, ultmtCdtrPrvtIdOthrPath);

		var ultmtcdtrDATA = dataBetweenTokens("<UltmtCdtr>" , "</UltmtCdtr>" , Document1);
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtcdtrDATA = " + ultmtcdtrDATA);
		var ultmtCdtrPrvtIdDATA = dataBetweenTokens("<PrvtId>" , "</PrvtId>" , ultmtcdtrDATA); 
		logger.info("DtAndPlcOfBirthOthrFromPathRule: ultmtCdtrPrvtIdDATA = " + ultmtCdtrPrvtIdDATA);

		if(isPatternPresent(Document1, "<UltmtCdtr>") && ultmtCdtrPrvtId){
			if((isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>")) || (!isPatternPresent(ultmtCdtrPrvtIdDATA, "<DtAndPlcOfBirth>")&& !isPatternPresent(ultmtCdtrPrvtIdDATA, "<Othr>"))){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if PrvtId is present then Either ‘DtAndPlcOfBirth', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1007", "7136", map);
					return retVal;
				}
			}
		}

	return retVal;
}

function genericAnyBicLEIOthrRule(exchange){ 
	logger.info(" In genericAnyBicLEIOthrRule");
 
	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
 
	var Date1 = memTblGetTableValue(map, "USER_CONFIG_MAP", "SEPA_LIB2025_DATE");
	logger.info("genericAnyBicLEIOthrRule: Date1 = " + Date1);

	var sysDate = getDate();
	logger.info("genericAnyBicLEIOthrRule: sysDate = " + sysDate);
	
	//loop added for pacs008
	if(isPatternPresent(Document1, "</FIToFICstmrCdtTrf>")) {
		
		//CREDITOR
		var cdtrOrgId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "Cdtr","Id", "<OrgId>");
		logger.info("cdtrOrgId" + cdtrOrgId);

		var cdtrOrgIdAnyBICPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Id/OrgId/AnyBIC';
		var cdtrOrgIdAnyBIC = getValueFromPath(Document, cdtrOrgIdAnyBICPath);
		logger.info("cdtrOrgIdAnyBIC" + cdtrOrgIdAnyBIC);

		var cdtrOrgIdLEIPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Id/OrgId/LEI';
		var cdtrOrgIdLEI = getValueFromPath(Document, cdtrOrgIdLEIPath);
		logger.info("cdtrOrgIdLEI"+ cdtrOrgIdLEI);

		var cdtrOrgIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Id/OrgId/Othr/Id';
		var cdtrOrgIdOthr = getValueFromPath(Document, cdtrOrgIdOthrPath);
		logger.info("cdtrOrgIdOthr"+ cdtrOrgIdOthr);

		if(isPatternPresent(Document1, "<Cdtr>")){
			if(cdtrOrgId){
				if((cdtrOrgIdAnyBIC && cdtrOrgIdLEI)||(cdtrOrgIdAnyBIC && cdtrOrgIdOthr)||(cdtrOrgIdLEI && cdtrOrgIdOthr)||(cdtrOrgIdAnyBIC && cdtrOrgIdLEI && cdtrOrgIdOthr)||(!cdtrOrgIdAnyBIC && !cdtrOrgIdLEI && !cdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("945", "7135", map);
					return retVal;
				}
			}
		}	

		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "Dbtr","Id", "<OrgId>");
		logger.info("dbtrOrgId" + dbtrOrgId);

		var dbtrOrgIdAnyBICPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);
		logger.info("dbtrOrgIdAnyBIC"+ dbtrOrgIdAnyBIC);

		var dbtrOrgIdLEIPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Id/OrgId/LEI';
		var dbtrOrgIdLEI = getValueFromPath(Document, dbtrOrgIdLEIPath);
		logger.info("dbtrOrgIdLEI"+ dbtrOrgIdLEI);

		var dbtrOrgIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Id/OrgId/Othr/Id';
		var dbtrOrgIdOthr = getValueFromPath(Document, dbtrOrgIdOthrPath);
		logger.info("dbtrOrgIdOthr"+ dbtrOrgIdOthr);

        if(sysDate < Date1){
		if(isPatternPresent(Document1, "<Dbtr>")){
			if(dbtrOrgId){
				if((dbtrOrgIdAnyBIC && dbtrOrgIdLEI)||(dbtrOrgIdAnyBIC && dbtrOrgIdOthr)|| (dbtrOrgIdLEI && dbtrOrgIdOthr)||(dbtrOrgIdAnyBIC && dbtrOrgIdLEI && dbtrOrgIdOthr)||(!dbtrOrgIdAnyBIC && !dbtrOrgIdLEI && !dbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("779", "7135", map);
					return retVal;
				}
			}
		}
        }
		
		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UltmtDbtr","Id", "<OrgId>");
		logger.info("ultmtDbtrOrgId" + ultmtDbtrOrgId);

		var ultmtDbtrOrgIdAnyBICPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
		logger.info("ultmtDbtrOrgIdAnyBIC"+ ultmtDbtrOrgIdAnyBIC);

		var ultmtDbtrOrgIdLEIPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Id/OrgId/LEI';
		var ultmtDbtrOrgIdLEI = getValueFromPath(Document, ultmtDbtrOrgIdLEIPath);
		logger.info("ultmtDbtrOrgIdLEI"+ ultmtDbtrOrgIdLEI);

		var ultmtDbtrOrgIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Id/OrgId/Othr/Id';
		var ultmtDbtrOrgIdOthr = getValueFromPath(Document, ultmtDbtrOrgIdOthrPath);
		logger.info("ultmtDbtrOrgIdOthr"+ ultmtDbtrOrgIdOthr);

        if(sysDate < Date1){
		if(isPatternPresent(Document1, "<UltmtDbtr>")){
			if(ultmtDbtrOrgId){
				if((ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI) || (ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(!ultmtDbtrOrgIdAnyBIC && !ultmtDbtrOrgIdLEI && !ultmtDbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("693", "7135", map);
					return retVal;
				}
			}
		}
        }
		
		//ULTIMATECREDITOR
		var ultmtCdtrOrgId =  isXmlNodePresent3(Document, "CdtTrfTxInf", "UltmtCdtr","Id", "<OrgId>");
		logger.info("ultmtCdtrOrgId" + ultmtCdtrOrgId);

		var ultmtCdtrOrgIdAnyBICPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Id/OrgId/AnyBIC';
		var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);
		logger.info("ultmtCdtrOrgIdAnyBIC"+ ultmtCdtrOrgIdAnyBIC);

		var ultmtCdtrOrgIdLEIPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Id/OrgId/LEI';
		var ultmtCdtrOrgIdLEI = getValueFromPath(Document, ultmtCdtrOrgIdLEIPath);
		logger.info("ultmtCdtrOrgIdLEI"+ ultmtCdtrOrgIdLEI);

		var ultmtCdtrOrgIdOthrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Id/OrgId/Othr/Id';
		var ultmtCdtrOrgIdOthr = getValueFromPath(Document, ultmtCdtrOrgIdOthrPath);
		logger.info("ultmtCdtrOrgIdOthr"+ ultmtCdtrOrgIdOthr);

		if(isPatternPresent(Document1, "<UltmtCdtr>")){
			if(ultmtCdtrOrgId){
				if((ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(!ultmtCdtrOrgIdAnyBIC && !ultmtCdtrOrgIdLEI && !ultmtCdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1007", "7135", map);
					return retVal;
				}
			}
		}	
	}
	//CAMT056
	if(isPatternPresent(Document1, "</FIToFIPmtCxlReq>")) {
		//CREDITOR
		var cdtrOrgId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<OrgId>");
		logger.info("genericAnyBicLEIOthrRule: cdtrOrgId = " + cdtrOrgId);
 
 
		var cdtrOrgIdAnyBICPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/AnyBIC';
		var cdtrOrgIdAnyBIC = getValueFromPath(Document, cdtrOrgIdAnyBICPath);
		logger.info("genericAnyBicLEIOthrRule: cdtrOrgIdAnyBIC = " + cdtrOrgIdAnyBIC);
 
		var cdtrOrgIdLEIPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/LEI';
		var cdtrOrgIdLEI = getValueFromPath(Document, cdtrOrgIdLEIPath);
		logger.info("genericAnyBicLEIOthrRule: cdtrOrgIdLEI = " + cdtrOrgIdLEI);
 
		var cdtrOrgIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/Othr/Id';
		var cdtrOrgIdOthr = getValueFromPath(Document, cdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Cdtr>")){
			if(cdtrOrgId){
				logger.info("genericAnyBicLEIOthrRule: inside creditor loop");
			if((cdtrOrgIdAnyBIC && cdtrOrgIdLEI)||(cdtrOrgIdAnyBIC && cdtrOrgIdOthr)||(cdtrOrgIdLEI && cdtrOrgIdOthr)||(cdtrOrgIdAnyBIC && cdtrOrgIdLEI && cdtrOrgIdOthr)||(!cdtrOrgIdAnyBIC && !cdtrOrgIdLEI && !cdtrOrgIdOthr)){
				logger.info("genericAnyBicLEIOthrRule: inside creditor fail loop");
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("945", "7135", map);
					return retVal;
				}
			}
		}	
 
		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<OrgId>");
 
		var dbtrOrgIdAnyBICPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);
 
		var dbtrOrgIdLEIPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/LEI';
		var dbtrOrgIdLEI = getValueFromPath(Document, dbtrOrgIdLEIPath);
 
		var dbtrOrgIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/Othr/Id';
		var dbtrOrgIdOthr = getValueFromPath(Document, dbtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Dbtr>")){
			if(dbtrOrgId){
				if((dbtrOrgIdAnyBIC && dbtrOrgIdLEI)||(dbtrOrgIdAnyBIC && dbtrOrgIdOthr)|| (dbtrOrgIdLEI && dbtrOrgIdOthr)||(dbtrOrgIdAnyBIC && dbtrOrgIdLEI && dbtrOrgIdOthr)||(!dbtrOrgIdAnyBIC && !dbtrOrgIdLEI && !dbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("779", "7135", map);
					return retVal;
				}
			}
		}
		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<OrgId>");
 
		var ultmtDbtrOrgIdAnyBICPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
 
		var ultmtDbtrOrgIdLEIPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/LEI';
		var ultmtDbtrOrgIdLEI = getValueFromPath(Document, ultmtDbtrOrgIdLEIPath);
 
		var ultmtDbtrOrgIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/Othr/Id';
		var ultmtDbtrOrgIdOthr = getValueFromPath(Document, ultmtDbtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtDbtr>")){
			if(ultmtDbtrOrgId){
				if((ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI) || (ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(!ultmtDbtrOrgIdAnyBIC && !ultmtDbtrOrgIdLEI && !ultmtDbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("693", "7135", map);
					return retVal;
				}
			}
		}
		//ULTIMATECREDITOR
		var ultmtCdtrOrgId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<OrgId>");
 
		var ultmtCdtrOrgIdAnyBICPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
		var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);
 
		var ultmtCdtrOrgIdLEIPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/LEI';
		var ultmtCdtrOrgIdLEI = getValueFromPath(Document, ultmtCdtrOrgIdLEIPath);
 
		var ultmtCdtrOrgIdOthrPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/Othr/Id';
		var ultmtCdtrOrgIdOthr = getValueFromPath(Document, ultmtCdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtCdtr>")){
			if(ultmtCdtrOrgId){
				if((ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(!ultmtCdtrOrgIdAnyBIC && !ultmtCdtrOrgIdLEI && !ultmtCdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1007", "7135", map);
					return retVal;
				}
			}
		}
	//return retVal;
	}
 
	//PACS004
	if(isPatternPresent(Document1, "</PmtRtr>")) {
 
		var cdtrOrgId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<OrgId>");
 
		var cdtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/AnyBIC';
		var cdtrOrgIdAnyBIC = getValueFromPath(Document, cdtrOrgIdAnyBICPath);
 
		var cdtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/LEI';
		var cdtrOrgIdLEI = getValueFromPath(Document, cdtrOrgIdLEIPath);
 
		var cdtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/Othr/Id';
		var cdtrOrgIdOthr = getValueFromPath(Document, cdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Cdtr>")){
			if(cdtrOrgId){
			if((cdtrOrgIdAnyBIC && cdtrOrgIdLEI)||(cdtrOrgIdAnyBIC && cdtrOrgIdOthr)||(cdtrOrgIdLEI && cdtrOrgIdOthr)||(cdtrOrgIdAnyBIC && cdtrOrgIdLEI && cdtrOrgIdOthr)||(!cdtrOrgIdAnyBIC && !cdtrOrgIdLEI && !cdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("2194", "7135", map);//field not present
					return retVal;
				}
			}
		}	
 
		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<OrgId>");
 
		var dbtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);
 
		var dbtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/LEI';
		var dbtrOrgIdLEI = getValueFromPath(Document, dbtrOrgIdLEIPath);
 
		var dbtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/Othr/Id';
		var dbtrOrgIdOthr = getValueFromPath(Document, dbtrOrgIdOthrPath);
 
        if(sysDate < Date1){
		if(isPatternPresent(Document1, "<Dbtr>")){
			if(dbtrOrgId){
				if((dbtrOrgIdAnyBIC && dbtrOrgIdLEI)||(dbtrOrgIdAnyBIC && dbtrOrgIdOthr)|| (dbtrOrgIdLEI && dbtrOrgIdOthr)||(dbtrOrgIdAnyBIC && dbtrOrgIdLEI && dbtrOrgIdOthr)||(!dbtrOrgIdAnyBIC && !dbtrOrgIdLEI && !dbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1997", "7135", map);//field not present
					return retVal;
				}
			}
		}
        }
		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<OrgId>");
 
		var ultmtDbtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
 
		var ultmtDbtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/LEI';
		var ultmtDbtrOrgIdLEI = getValueFromPath(Document, ultmtDbtrOrgIdLEIPath);
 
		var ultmtDbtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/Othr/Id';
		var ultmtDbtrOrgIdOthr = getValueFromPath(Document, ultmtDbtrOrgIdOthrPath);
 
        if(sysDate < Date1){
		if(isPatternPresent(Document1, "<UltmtDbtr>")){
			if(ultmtDbtrOrgId){
				if((ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI) || (ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(!ultmtDbtrOrgIdAnyBIC && !ultmtDbtrOrgIdLEI && !ultmtDbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1952", "7135", map);//field not present
					return retVal;
				}
			}
		}
        }
		//ULTIMATECREDITOR
		var ultmtCdtrOrgId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<OrgId>");
 
		var ultmtCdtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
		var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);
 
		var ultmtCdtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/LEI';
		var ultmtCdtrOrgIdLEI = getValueFromPath(Document, ultmtCdtrOrgIdLEIPath);
 
		var ultmtCdtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/Othr/Id';
		var ultmtCdtrOrgIdOthr = getValueFromPath(Document, ultmtCdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtCdtr>")){
			if(ultmtCdtrOrgId){
				if((ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(!ultmtCdtrOrgIdAnyBIC && !ultmtCdtrOrgIdLEI && !ultmtCdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("2291", "7135", map);//field not present
					return retVal;
				}
			}
		}
	}
 
	//CAMT029
	if(isPatternPresent(Document1, "</RsltnOfInvstgtn>")) {
 
		var cdtrOrgId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<OrgId>");
 
		var cdtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/OrgId/AnyBIC';
		var cdtrOrgIdAnyBIC = getValueFromPath(Document, cdtrOrgIdAnyBICPath);
 
		var cdtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/OrgId/LEI';
		var cdtrOrgIdLEI = getValueFromPath(Document, cdtrOrgIdLEIPath);
 
		var cdtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/OrgId/Othr/Id';
		var cdtrOrgIdOthr = getValueFromPath(Document, cdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Cdtr>")){
			if(cdtrOrgId){
				if((cdtrOrgIdAnyBIC && cdtrOrgIdLEI)||(cdtrOrgIdAnyBIC && cdtrOrgIdOthr)||(cdtrOrgIdLEI && cdtrOrgIdOthr)||(cdtrOrgIdAnyBIC && cdtrOrgIdLEI && cdtrOrgIdOthr)||(!cdtrOrgIdAnyBIC && !cdtrOrgIdLEI && !cdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("945", "7135", map);
					return retVal;
				}
			}
		}	
 
		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<OrgId>");
 
		var dbtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);
 
		var dbtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/OrgId/LEI';
		var dbtrOrgIdLEI = getValueFromPath(Document, dbtrOrgIdLEIPath);
 
		var dbtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/OrgId/Othr/Id';
		var dbtrOrgIdOthr = getValueFromPath(Document, dbtrOrgIdOthrPath);
 
        if(sysDate < Date1){
		if(isPatternPresent(Document1, "<Dbtr>")){
			if(dbtrOrgId){
				if((dbtrOrgIdAnyBIC && dbtrOrgIdLEI)||(dbtrOrgIdAnyBIC && dbtrOrgIdOthr)|| (dbtrOrgIdLEI && dbtrOrgIdOthr)||(dbtrOrgIdAnyBIC && dbtrOrgIdLEI && dbtrOrgIdOthr)||(!dbtrOrgIdAnyBIC && !dbtrOrgIdLEI && !dbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("779", "7135", map);
					return retVal;
				}
			}
		}
        }
		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<OrgId>");
 
		var ultmtDbtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
 
		var ultmtDbtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/LEI';
		var ultmtDbtrOrgIdLEI = getValueFromPath(Document, ultmtDbtrOrgIdLEIPath);
 
		var ultmtDbtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/Othr/Id';
		var ultmtDbtrOrgIdOthr = getValueFromPath(Document, ultmtDbtrOrgIdOthrPath);
 
        if(sysDate < Date1){
		if(isPatternPresent(Document1, "<UltmtDbtr>")){
			if(ultmtDbtrOrgId){
				if((ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI) || (ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(!ultmtDbtrOrgIdAnyBIC && !ultmtDbtrOrgIdLEI && !ultmtDbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("693", "7135", map);
					return retVal;
				}
			}
		}
        }
		//ULTIMATECREDITOR
		var ultmtCdtrOrgId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<OrgId>");
 
		var ultmtCdtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
		var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);
 
		var ultmtCdtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/LEI';
		var ultmtCdtrOrgIdLEI = getValueFromPath(Document, ultmtCdtrOrgIdLEIPath);
 
		var ultmtCdtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/Othr/Id';
		var ultmtCdtrOrgIdOthr = getValueFromPath(Document, ultmtCdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtCdtr>")){
			if(ultmtCdtrOrgId){
				if((ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(!ultmtCdtrOrgIdAnyBIC && !ultmtCdtrOrgIdLEI && !ultmtCdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1007", "7135", map);
					return retVal;
				}
			}
		}
	}
	
	//loop added for pacs028
	if(isPatternPresent(Document1, "</FIToFIPmtStsReq>")) {
		
		//CREDITOR
		var cdtrOrgId =  isXmlNodePresent3(Document, "Cdtr", "Pty","Id", "<OrgId>");
		logger.info("genericAnyBicLEIOthrRule: cdtrOrgId = " + cdtrOrgId);

		var cdtrOrgIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/AnyBIC';
		var cdtrOrgIdAnyBIC = getValueFromPath(Document, cdtrOrgIdAnyBICPath);
		logger.info("genericAnyBicLEIOthrRule: cdtrOrgIdAnyBIC = " + cdtrOrgIdAnyBIC);

		var cdtrOrgIdLEIPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/LEI';
		var cdtrOrgIdLEI = getValueFromPath(Document, cdtrOrgIdLEIPath);
		logger.info("genericAnyBicLEIOthrRule: cdtrOrgIdLEI = " + cdtrOrgIdLEI);

		var cdtrOrgIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/Othr/Id';
		var cdtrOrgIdOthr = getValueFromPath(Document, cdtrOrgIdOthrPath);
		logger.info("genericAnyBicLEIOthrRule: cdtrOrgIdOthr = " + cdtrOrgIdOthr);

		if(isPatternPresent(Document1, "<Cdtr>")){
			if(cdtrOrgId){
				if((cdtrOrgIdAnyBIC && cdtrOrgIdLEI)||(cdtrOrgIdAnyBIC && cdtrOrgIdOthr)||(cdtrOrgIdLEI && cdtrOrgIdOthr)||(cdtrOrgIdAnyBIC && cdtrOrgIdLEI && cdtrOrgIdOthr)||(!cdtrOrgIdAnyBIC && !cdtrOrgIdLEI && !cdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("945", "7135", map);
					return retVal;
				}
			}
		}	

		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "Dbtr", "Pty","Id", "<OrgId>");

		var dbtrOrgIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);

		var dbtrOrgIdLEIPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/LEI';
		var dbtrOrgIdLEI = getValueFromPath(Document, dbtrOrgIdLEIPath);

		var dbtrOrgIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/Othr/Id';
		var dbtrOrgIdOthr = getValueFromPath(Document, dbtrOrgIdOthrPath);

		if(isPatternPresent(Document1, "<Dbtr>")){
			if(dbtrOrgId){
				if((dbtrOrgIdAnyBIC && dbtrOrgIdLEI)||(dbtrOrgIdAnyBIC && dbtrOrgIdOthr)|| (dbtrOrgIdLEI && dbtrOrgIdOthr)||(dbtrOrgIdAnyBIC && dbtrOrgIdLEI && dbtrOrgIdOthr)||(!dbtrOrgIdAnyBIC && !dbtrOrgIdLEI && !dbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("779", "7135", map);
					return retVal;
				}
			}
		}
		
		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "UltmtDbtr", "Pty","Id", "<OrgId>");

		var ultmtDbtrOrgIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);

		var ultmtDbtrOrgIdLEIPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/LEI';
		var ultmtDbtrOrgIdLEI = getValueFromPath(Document, ultmtDbtrOrgIdLEIPath);

		var ultmtDbtrOrgIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/Othr/Id';
		var ultmtDbtrOrgIdOthr = getValueFromPath(Document, ultmtDbtrOrgIdOthrPath);

		if(isPatternPresent(Document1, "<UltmtDbtr>")){
			if(ultmtDbtrOrgId){
				if((ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI) || (ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdLEI && ultmtDbtrOrgIdOthr)||(!ultmtDbtrOrgIdAnyBIC && !ultmtDbtrOrgIdLEI && !ultmtDbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("693", "7135", map);
					return retVal;
				}
			}
		}
		
		//ULTIMATECREDITOR
		var ultmtCdtrOrgId =  isXmlNodePresent3(Document, "UltmtCdtr", "Pty","Id", "<OrgId>");

		var ultmtCdtrOrgIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
		var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);

		var ultmtCdtrOrgIdLEIPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/LEI';
		var ultmtCdtrOrgIdLEI = getValueFromPath(Document, ultmtCdtrOrgIdLEIPath);

		var ultmtCdtrOrgIdOthrPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/Othr/Id';
		var ultmtCdtrOrgIdOthr = getValueFromPath(Document, ultmtCdtrOrgIdOthrPath);

		if(isPatternPresent(Document1, "<UltmtCdtr>")){
			if(ultmtCdtrOrgId){
				if((ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdLEI && ultmtCdtrOrgIdOthr)||(!ultmtCdtrOrgIdAnyBIC && !ultmtCdtrOrgIdLEI && !ultmtCdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', 'LEI’ or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1007", "7135", map);
					return retVal;
				}
			}
		}
	}
 
	return retVal;		
}

function pmtTpInfGenericRule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In pmtTpInfGenericRule");
 
	var pmtTpInfPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/PmtTpInf";
	var pmtTpInfValue = getValueFromPath(Document, pmtTpInfPath);
	logger.info("pmtTpInfValue = "+ pmtTpInfValue);
 
	if(isPatternPresent(Document1, "<FIToFIPmtCxlReq>")){
		if(!isPatternPresent(Document1, "<PmtTpInf>")){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("pmtTpInfGenericRule-PmtTpInf Must be present"); //field not present.
			retVal = setCommentsForTransaction("945", "7157", map);
			return retVal;
		}
	}

	return retVal;
}

function nbOfTxsSepaInstGenericRule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In nbOfTxsSepaInstGenericRule");
 
	if(isPatternPresent(Document1, "<FIToFIPmtCxlReq>")){
		var nbOfTxs = isXmlNodePresent2(Document, "NbOfTxs");
		logger.info("nbOfTxsSepaInstGenericRule: nbOfTxsValue = " + nbOfTxs );
		
		if(nbOfTxs){
			var nbOfTxsPath = "/Document/FIToFIPmtCxlReq/CtrlData/NbOfTxs";
			nbOfTxs = getValueFromPath(Document, nbOfTxsPath);
			logger.info("nbOfTxs = "+ nbOfTxs);
		 
			if(nbOfTxs != 1){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("nbOfTxsSepaInstGenericRule: NbOfTxs : Must be equal to 1.");
				retVal = setCommentsForTransaction("001", "7058", map);
				return retVal;
			}
		}
	}
	if(isPatternPresent(Document1, "<FIToFICstmrCdtTrf>")){
		var nbOfTxs = isXmlNodePresent2(Document, "NbOfTxs");
		logger.info("nbOfTxsSepaInstGenericRule: nbOfTxsValue = " + nbOfTxs );
		
		var nbOfTxsPath = "/Document/FIToFICstmrCdtTrf/GrpHdr/NbOfTxs";
		nbOfTxs = getValueFromPath(Document, nbOfTxsPath);
		logger.info("nbOfTxs = "+ nbOfTxs);
	 
		if(nbOfTxs != 1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("nbOfTxsSepaInstGenericRule: NbOfTxs : Must be equal to 1.");
			retVal = setCommentsForTransaction("120", "7058", map);
			return retVal;
		}
	}
	
	return retVal;
}

function orgtrNmSepaInstCamt056Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In orgtrNmSepaInstCamt056Rule");
 
	var orgtrNmPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Orgtr/Nm";
	var orgtrNm = getValueFromPath(Document, orgtrNmPath);
	logger.info("orgtrNm = "+ orgtrNm);
	
	var orgtrNmCheck = isXmlNodePresent3(Document, "TxInf", "CxlRsnInf", "Orgtr", "<Nm>");
	logger.info("orgtrNmCheck = "+ orgtrNmCheck);
	
	var rsnCdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Rsn/Cd";
	var rsnCd = getValueFromPath(Document, rsnCdPath);
	logger.info("rsnCd = "+ rsnCd);
	
	const rsnCdValues = ["CUST","AM09","AM03"];

	if(rsnCd){
		if(rsnCdValues.includes(rsnCd)){
			logger.info("orgtrNmSepaInstCamt056Rule: rsnCd is correct");
			if(!orgtrNmCheck){
				logger.info("orgtrNmSepaInstCamt056Rule: This field must be used if “Reason Code” below is set to “CUST”, “AM09” or “AC03”.");
				retVal = setCommentsForTransaction("175", "7154", map);
			}
		}
	}
	return retVal;
}

function rsnPrtrySepaInstCamt056Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In rsnPrtrySepaInstCamt056Rule");
	
	var rsnCdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Rsn/Cd";
	var rsnCd = getValueFromPath(Document, rsnCdPath);
	logger.info("rsnCd = "+ rsnCd);
	logger.info("type of rsnCd = "+ typeof rsnCd);
	
	var rsnCdCheck = isXmlNodePresent3(Document, "TxInf", "CxlRsnInf", "Rsn", "<Cd>");
	logger.info("orgtrNmCheck = "+ rsnCdCheck);
 
 
	const rsnCdValues = ["DUPL","FRAD","CUST","TECH","AM09","AC03"];

	if(rsnCdCheck){
		if(rsnCdValues.includes(rsnCd)){
			logger.info("rsnPrtrySepaInstCamt056Rule: rsnCd is correct");
		}
		else {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("rsnPrtrySepaInstCamt056Rule: Must be used with a valid code: “CUST” or “DUPL”or “TECH” or “FRAD”or “AC03” or “AM09”.");
			retVal = setCommentsForTransaction("177", "7155", map);	//NEW violations to be defined..
			//return retVal;			
		}
	}
	return retVal;
}

function addtlInfSepaInstCamt056Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In addtlInfSepaInstCamt056Rule");
 
	var addtlInfPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/AddtlInf";
	var addtlInf = getValueFromPath(Document, addtlInfPath);
	logger.info("addtlInf = "+ addtlInf);
	
	var rsnCdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Rsn/Cd";
	var rsnCd = getValueFromPath(Document, rsnCdPath);
	logger.info("rsnCd = "+ rsnCd);
	
	const rsnCdValues = ["DUPL","TECH"];

	if(rsnCd){
		if(rsnCdValues.includes(rsnCd)){
			logger.info("addtlInfSepaInstCamt056Rule: rsnCd is correct");
			if(addtlInf){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("addtlInfSepaInstCamt056Rule: Addtional Information is only allowed when FRAD, CUST, AM09 or AC03 is used as a Recall reason code");
				retVal = setCommentsForTransaction("157", "7156", map);
			}
		}
	}

	return retVal;
}

function clrSysPrtrySepaInstCamt056Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In clrSysPrtrySepaInstCamt056Rule");
 
	var clrSysPrtryPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/SttlmInf/ClrSys/Prtry";
	var clrSysPrtry = getValueFromPath(Document, clrSysPrtryPath);
	logger.info("clrSysPrtry = "+ clrSysPrtry);
 
	if(clrSysPrtry){
		if(clrSysPrtry != "RT1"){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("clrSysPrtrySepaInstCamt056Rule: Only the value “RT1” is supported.");
			retVal = setCommentsForTransaction("007", "7488", map);
			return retVal;
		}
	}
	return retVal;
}

function lclInstrmCdSepaInstCamt056Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In lclInstrmCdSepaInstCamt056Rule");
 
	var lclInstrmCdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd";
	var lclInstrmCd = getValueFromPath(Document, lclInstrmCdPath);
	logger.info("lclInstrmCd = "+ lclInstrmCd);
 
	if(lclInstrmCd){
		if(lclInstrmCd != "INST"){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("lclInstrmCdSepaInstCamt056Rule: lclInstrmCd : Must be “INST”.");
			retVal = setCommentsForTransaction("009", "7158", map);//field not present
			return retVal;
		}
	}
	return retVal;
}

function clrSysPrtrySepaInstPacs004Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In clrSysPrtrySepaInstPacs004Rule");
 
	var clrSysPrtryPath = "/Document/PmtRtr/GrpHdr/SttlmInf/ClrSys/Prtry";
	var clrSysPrtry = getValueFromPath(Document, clrSysPrtryPath);
	logger.info("clrSysPrtry = "+ clrSysPrtry);
 
	if(clrSysPrtry){
		if(clrSysPrtry != "RT1"){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("clrSysPrtrySepaInstPacs004Rule: Only the value “RT1” is supported.");
			retVal = setCommentsForTransaction("152", "7488", map);
			return retVal;
		}
	}
	return retVal;
}

function LclInstrmCdSEPAInstCamt029Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In LclInstrmCdSEPAInstCamt029Rule");
 
	var lclCdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
	var lclInstrmCd = getValueFromPath(Document, lclCdPath);
	logger.info("LclInstrmCdSEPAInstCamt029Rule: lclInstrmCd = " + lclInstrmCd );

	if(lclInstrmCd){
		if(lclInstrmCd != "INST") {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("LclInstrmCdSEPAInstCamt029Rule: lclInstrmCd must be present INST..");
			retVal = setCommentsForTransaction("169", "7158", map);	//field not present
			//return retVal;			
		}
	}
	return retVal;
}

function svcLvlCdSepaInstPacs028Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In svcLvlCdSepaInstPacs028Rule");
 
	var svcLvlCdPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/PmtTpInf/SvcLvl/Cd";
	var svcLvlCd = getValueFromPath(Document, svcLvlCdPath);
	logger.info("svcLvlCdSepaInstPacs028Rule: svcLvlCd = "+ svcLvlCd);
 
	if(svcLvlCd){
		if(svcLvlCd != "SEPA"){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("svcLvlCdSepaInstPacs028Rule: Only the value SEPA is supported.");
			retVal = setCommentsForTransaction("037", "7629", map);//field not present
			return retVal;
		}
	}
	return retVal;
}

function LclInstrmCdSEPAInstPacs028Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In LclInstrmCdSEPAInstPacs028Rule");
 
	var lclCdPath = 'CxlDtls/TxInfAndSts/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
	var lclInstrmCd = getValueFromPath(Document, lclCdPath);
	logger.info("LclInstrmCdSEPAInstPacs028Rule: lclInstrmCd = " + lclInstrmCd );

	if(lclInstrmCd){
		if(lclInstrmCd != "INST") {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("LclInstrmCdSEPAInstPacs028Rule: lclInstrmCd must be present INST..");
			retVal = setCommentsForTransaction("169", "7189", map);	
			//return retVal;			
		}
	}
	return retVal;
}

function lclInstrmCdSEPAInstGenericRule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In lclInstrmCdSEPAInstGenericRule");
 
	//loop added for pacs028
	if(isPatternPresent(Document1, "<FIToFIPmtStsReq>")){
		var lclCdPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/OrgnlTxRef/PmtTpInf/LclInstrm/Cd';
		var lclInstrmCd = getValueFromPath(Document, lclCdPath);
		logger.info("lclInstrmCdSEPAInstGenericRule: lclInstrmCd = " + lclInstrmCd );
	 
		if(lclInstrmCd){
			if(lclInstrmCd != "INST"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("LclInstrmCdSEPAInstGenericRule: Local instrument code must be 'INST' .");
				retVal = setCommentsForTransaction("004", "7158", map);//field not present
				return retVal;
			}
		}
	}
	return retVal;
}

function pmtTpInfOrgnlMsgNmIdGenericRule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In pmtTpInfOrgnlMsgNmIdGenericRule");
 
	//loop added for pacs028
	if(isPatternPresent(Document1, "<FIToFIPmtStsReq>")){
		var orgnlMsgNmIdPath = '/Document/FIToFIPmtStsReq/OrgnlGrpInf/OrgnlMsgNmId';
		var orgnlMsgNmIdValue = getValueFromPath(Document, orgnlMsgNmIdPath);
		logger.info("pmtTpInfOrgnlMsgNmIdGenericRule: orgnlMsgNmIdValue = " + orgnlMsgNmIdValue );
	 
		if(orgnlMsgNmIdValue == 'pacs.008.001.08' || orgnlMsgNmIdValue == 'pacs.008.001.02'){
			var pmtTpInfCheck = isXmlNodePresent3(Document, "FIToFIPmtStsReq", "TxInf", "OrgnlTxRef", "PmtTpInf");
			logger.info("pmtTpInfCheck = "+ pmtTpInfCheck);
			if(!pmtTpInfCheck){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("pmtTpInfOrgnlMsgNmIdGenericRule: PmtTpInf is mandatory if the Original message Name Id value is equal to pacs.008.001.02 or pacs.008.001.08.");
				retVal = setCommentsForTransaction("004", "7163", map);//field not present
				return retVal;
			}
		}
	}
	return retVal;
}

function sttlmMtdRT1GenericRule(exchange) {

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var retVal = 0;
	var sttlmMtdPath;
	var sttlmMtdValue;
	var sttlmMtdCheck;

	logger.info('In sttlmMtdRT1GenericRule');
	
	//loop for pacs.004
	if(isPatternPresent(Document1, "<PmtRtr>")){
		//Clearing system
		sttlmMtdCheck =  isXmlNodePresent3(Document, "PmtRtr","GrpHdr", "SttlmInf", "<SttlmMtd>");
		
		sttlmMtdPath = "/Document/PmtRtr/GrpHdr/SttlmInf/SttlmMtd";
		sttlmMtdValue = getValueFromPath(Document, sttlmMtdPath);
		logger.info("PmtRtr - sttlmMtdValue = "+ sttlmMtdValue);

		if(sttlmMtdCheck){
			if(sttlmMtdValue && sttlmMtdValue != "CLRG"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("PmtRtr-ClrSys is not allowed");
				retVal = setCommentsForTransaction("128", "7490", map);
				return retVal;
			}
		}	
		
	}
	
	//loop for pacs008
	if(isPatternPresent(Document1, "<FIToFICstmrCdtTrf>")){
		//Clearing system
		sttlmMtdCheck =  isXmlNodePresent3(Document, "FIToFICstmrCdtTrf","GrpHdr", "SttlmInf", "<SttlmMtd>");
		
		sttlmMtdPath = "/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/SttlmMtd";
		sttlmMtdValue = getValueFromPath(Document, sttlmMtdPath);
		logger.info("FIToFICstmrCdtTrf-sttlmMtdValue :"+sttlmMtdValue);
		
		if(sttlmMtdCheck){
			if(sttlmMtdValue && sttlmMtdValue != "CLRG"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("FIToFICstmrCdtTrf-Prtry only CLRG is allowed");
				retVal = setCommentsForTransaction("125", "7490", map); //field no is not present
				return retVal;
			}
		}	
	}
	
	if(isPatternPresent(Document1, "<FIToFIPmtCxlReq>")){
		sttlmMtdCheck =  isXmlNodePresent3(Document, "TxInf","OrgnlTxRef", "SttlmInf", "<SttlmMtd>");
		
		sttlmMtdPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/SttlmInf/SttlmMtd';
		sttlmMtdValue = getValueFromPath(Document, sttlmMtdPath);
		logger.info("FIToFIPmtCxlReq-sttlmMtdValue :"+ sttlmMtdValue);
		
		if(sttlmMtdCheck){
			if(sttlmMtdValue && sttlmMtdValue != "CLRG"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("FIToFIPmtCxlReq-Prtry only CLRG is allowed");
				retVal = setCommentsForTransaction("945", "7490", map); //field no is not present
				return retVal;
			}
		}	
	}
	
	//loop added for pacs028
	if(isPatternPresent(Document1, "<FIToFIPmtStsReq>")){
		sttlmMtdCheck =  isXmlNodePresent3(Document, "TxInf","OrgnlTxRef", "SttlmInf", "<SttlmMtd>");
		
		sttlmMtdPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/SttlmInf/SttlmMtd";
		sttlmMtdValue = getValueFromPath(Document, sttlmMtdPath);
		logger.info("FIToFIPmtStsReq:sttlmMtdValue = "+ sttlmMtdValue);
	 
		if(sttlmMtdCheck){
			if(sttlmMtdValue && sttlmMtdValue != "CLRG"){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("FIToFIPmtStsReq: Only the value ?CLRG? is supported."); //field no is not present
				retVal = setCommentsForTransaction("004", "7490", map);
				return retVal;
			}
		}
	}
	return retVal;
}

function sttlmAcctRT1GenericRule(exchange) {

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var retVal = 0;
	var sttlmAcctCheck;

	logger.info('In sttlmAcctRT1GenericRule');
	
	//loop for pacs.004
	if(isPatternPresent(Document1, "<PmtRtr>")){
		//SttlmAcct system
		sttlmAcctCheck =  isXmlNodePresent3(Document, "PmtRtr","GrpHdr", "SttlmInf", "<SttlmAcct>");
		
		if(sttlmAcctCheck){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("PmtRtr-SttlmAcct is not allowed in RT1");
			retVal = setCommentsForTransaction("133", "7150", map);
			return retVal;
		}		
	}
	
	//loop for pacs008
	if(isPatternPresent(Document1, "<FIToFICstmrCdtTrf>")){
		//SttlmAcct system
		sttlmAcctCheck =  isXmlNodePresent3(Document, "FIToFICstmrCdtTrf","GrpHdr", "SttlmInf", "<SttlmAcct>");

		if(sttlmAcctCheck){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("FIToFICstmrCdtTrf-SttlmAcct is not allowed in RT1");
			retVal = setCommentsForTransaction("130", "7150", map); 
			return retVal;
		}	
	}
	
	return retVal;
}

function orgnlMsgNmIdRT1GenericRule(exchange) {

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.info('orgnlMsgNmIdRT1GenericRule: messageBody = ' + messageBody);
	var Document1 = inMsg.getBody(java.lang.String.class);
	logger.info('orgnlMsgNmIdRT1GenericRule: Document1 = ' + Document1);
	var retVal = 0;
	var orgnlMsgNmIdPath;
	var orgnlMsgNmIdValue;
	var orgnlMsgNmIdCheck;

	logger.info('In orgnlMsgNmIdRT1GenericRule');
	
	var Date1 = memTblGetTableValue(map, "USER_CONFIG_MAP", "SEPA_LIB2025_DATE");
	logger.info("orgnlMsgNmIdRT1GenericRule: Date1 = " + Date1);

	var sysDate = getDate();
	logger.info("orgnlMsgNmIdRT1GenericRule: sysDate = " + sysDate);
	
	//loop for pacs.004
	if(isPatternPresent(Document1, "<PmtRtr>")){
		//Clearing system
		orgnlMsgNmIdCheck =  isXmlNodePresent3(Document, "PmtRtr","TxInf", "OrgnlGrpInf", "<OrgnlMsgNmId>");
		
		if(!orgnlMsgNmIdCheck){
			var orgnlMsgNmIdCheck =  isXmlNodePresent(Document, "PmtRtr", "OrgnlGrpInf", "<OrgnlMsgNmId>");
			logger.info("PmtRtr - orgnlMsgNmIdCheck2 = "+ orgnlMsgNmIdCheck);		
		}
		
		orgnlMsgNmIdPath = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
		orgnlMsgNmIdValue = getValueFromPath(Document, orgnlMsgNmIdPath);
		logger.info("PmtRtr - orgnlMsgNmIdValue = "+ orgnlMsgNmIdValue);

		if(!orgnlMsgNmIdValue){
			var orgnlMsgNmIdPath = "/Document/PmtRtr/OrgnlGrpInf/OrgnlMsgNmId";
			var orgnlMsgNmIdValue = getValueFromPath(Document, orgnlMsgNmIdPath);
			logger.info("PmtRtr - orgnlMsgNmIdValue2 = "+ orgnlMsgNmIdValue);	
		}

		if(sysDate){
			if(sysDate < Date1){
		const orgnlMsgNmIdValue1 = ["pacs.008.001.08","pacs.008.001.02"];
				logger.info("orgnlMsgNmIdRT1GenericRule-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

		if(orgnlMsgNmIdCheck){
			if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue is correct");
			}
			else {
				setHeader(map, "PLCN_validMessage", false);
						logger.info("orgnlMsgNmIdRT1GenericRule:RT1-Only pacs.008.001.08 and pacs.008.001.02 are allowed.");
				retVal = setCommentsForTransaction("169", "7164", map);	//NEW violations to be defined..
				//return retVal;			
			}
		}	
			}else {
				orgnlMsgNmIdValue = orgnlMsgNmIdValue.slice(0, 8);
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue after trim = " + orgnlMsgNmIdValue );

				const orgnlMsgNmIdValue1 = ["pacs.008"];

				if(orgnlMsgNmIdCheck) {
					if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is begin with 'pacs.008'");
					}else {
						setHeader(map, "PLCN_validMessage",false);
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is must begin with 'pacs.008'");
						retVal = setCommentsForTransaction("169", "7624", map);	//NEW violations to be defined..
						//return retVal;			
					}
				}
			}
		}
		
	}
	
	//loop for camt.056
	if(isPatternPresent(Document1, "<FIToFIPmtCxlReq>")){
		orgnlMsgNmIdCheck =  isXmlNodePresent3(Document, "Undrlyg","TxInf", "OrgnlGrpInf", "<OrgnlMsgNmId>");
		
		orgnlMsgNmIdPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
		orgnlMsgNmIdValue = getValueFromPath(Document, orgnlMsgNmIdPath);
		logger.info("FIToFIPmtCxlReq-orgnlMsgNmIdValue :"+ orgnlMsgNmIdValue);
		
		if(sysDate){
			if(sysDate < Date1){
		const orgnlMsgNmIdValue1 = ["pacs.008.001.08","pacs.008.001.02"];
		logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

		if(orgnlMsgNmIdCheck){
			if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
				logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
			}
			else {
				setHeader(map, "PLCN_validMessage", false);
				logger.info("RsltnOfInvstgtn:RT1-Only pacs.008.001.08 and pacs.008.001.02 are allowed.");
				retVal = setCommentsForTransaction("182", "7164", map);
				//return retVal;			
			}
		}	
			}else {
				orgnlMsgNmIdValue = orgnlMsgNmIdValue.slice(0, 8);
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue after trim = " + orgnlMsgNmIdValue );

				const orgnlMsgNmIdValue1 = ["pacs.008"];

				if(orgnlMsgNmIdCheck) {
					if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is begin with 'pacs.008'");
					}else {
						setHeader(map, "PLCN_validMessage",false);
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is must begin with 'pacs.008'");
						retVal = setCommentsForTransaction("182", "7624", map);	//NEW violations to be defined..
						//return retVal;			
					}
				}
			}
		}
	}
	
	//loop for camt.029
	if(isPatternPresent(Document1, "</RsltnOfInvstgtn>")){
		//Clearing system
		orgnlMsgNmIdCheck =  isXmlNodePresent3(Document, "CxlDtls","TxInfAndSts", "OrgnlGrpInf", "<OrgnlMsgNmId>");
		
		orgnlMsgNmIdPath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlMsgNmId";
		orgnlMsgNmIdValue = getValueFromPath(Document, orgnlMsgNmIdPath);
		logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue :"+orgnlMsgNmIdValue);
		
		if(sysDate){
			if(sysDate < Date1){
				const orgnlMsgNmIdValue1 = ["pacs.008.001.08","pacs.008.001.02"];
		logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

		if(orgnlMsgNmIdCheck){
			if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
				logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
			}
			else {
				setHeader(map, "PLCN_validMessage", false);
						logger.info("RsltnOfInvstgtn:RT1-Only pacs.008.001.08 and pacs.008.001.02 are allowed.");
						retVal = setCommentsForTransaction("161", "7164", map);	
				//return retVal;			
			}
		}		
			}else {
				orgnlMsgNmIdValue = orgnlMsgNmIdValue.slice(0, 8);
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue after trim = " + orgnlMsgNmIdValue );

				const orgnlMsgNmIdValue1 = ["pacs.008"];

				if(orgnlMsgNmIdCheck) {
					if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is begin with 'pacs.008'");
					}else {
						setHeader(map, "PLCN_validMessage",false);
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is must begin with 'pacs.008'");
						retVal = setCommentsForTransaction("161", "7624", map);	//NEW violations to be defined..
						//return retVal;			
					}
				}
			}
		}
	}
	
	//loop added for pacs028
	if(isPatternPresent(Document1, "<FIToFIPmtStsReq>")){
		orgnlMsgNmIdCheck =  isXmlNodePresent(Document,"FIToFIPmtStsReq", "OrgnlGrpInf", "<OrgnlMsgNmId>");
		
		orgnlMsgNmIdPath = "/Document/FIToFIPmtStsReq/OrgnlGrpInf/OrgnlMsgNmId";
		orgnlMsgNmIdValue = getValueFromPath(Document, orgnlMsgNmIdPath);
		logger.info("FIToFIPmtStsReq:orgnlMsgNmIdValue = "+ orgnlMsgNmIdValue);
		
		if(sysDate){
			if(sysDate < Date1){
		const orgnlMsgNmIdValue1 = ["pacs.008.001.08","pacs.008.001.02","camt.056.001.012","camt.056.001.08"];
		logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

		if(orgnlMsgNmIdCheck){
			if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
				logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
			}
			else {
				setHeader(map, "PLCN_validMessage", false);
				logger.info("RsltnOfInvstgtn:RT1-Only 'pacs.008.001.02' ,'pacs.008.001.08' or 'camt.056.001.012' or 'camt.056.001.08' are allowed. are allowed.");
				retVal = setCommentsForTransaction("134", "7152", map);	//NEW violations to be defined..
				//return retVal;			
			}
		}	
			}else {
				orgnlMsgNmIdValue = orgnlMsgNmIdValue.slice(0, 8);
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue after trim = " + orgnlMsgNmIdValue );

				const orgnlMsgNmIdValue1 = ["pacs.008","camt.056"];

				if(orgnlMsgNmIdCheck) {
					if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is begin with 'pacs.008' or 'camt.056'");
					}else {
						setHeader(map, "PLCN_validMessage",false);
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is must begin with 'pacs.008' or 'camt.056'");
						retVal = setCommentsForTransaction("134", "7622", map);	//NEW violations to be defined..
						//return retVal;			
					}
				}
			}
		}
	}
	return retVal;
}

function addtlInfRT1GenericRule(exchange) {
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var addtlInfCheck;
	var addtlInfCount = 0;
	var retVal = 0;
	var count ;
	var msgString = inMsg.getBody(java.lang.String.class);
	logger.trace("In addtlInfRT1GenericRule");

	var nodes = Document.getElementsByTagName("AddtlInf"); //Get the <node> tags
	logger.info("addtlInfRT1GenericRule:nodes = "+nodes); 
    amountOfNodes = nodes.length;
	logger.info("addtlInfRT1GenericRule:amountOfNodes = "+amountOfNodes); 
	
	if(amountOfNodes > 13){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("addtlInfRT1GenericRule: only 13 occurence of additional informations are allowed in RT1.");
		retVal = setCommentsForTransaction("136", "7159", map);
		return retVal;
	}
	
	return retVal;
}

function txInfAndStsRT1GenericRule(exchange) {
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var addtlInfCheck;
	var addtlInfCount = 0;
	var retVal = 0;
	var count ;
	var msgString = inMsg.getBody(java.lang.String.class);
	logger.trace("In txInfAndStsRT1GenericRule");

	var nodes = Document.getElementsByTagName("TxInfAndSts"); //Get the <node> tags
	logger.info("txInfAndStsRT1GenericRule:nodes = "+nodes); 
    amountOfNodes = nodes.length;
	logger.info("txInfAndStsRT1GenericRule:amountOfNodes = "+amountOfNodes); 
	
	if(amountOfNodes > 1){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("txInfAndStsRT1GenericRule : If TxInfAndSts present only 1 occurence is allowed in RT1.");
		retVal = setCommentsForTransaction("134", "7058", map);
		return retVal;
	}
	
	return retVal;
}

function txInfRT1GenericRule(exchange) {
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var addtlInfCheck;
	var addtlInfCount = 0;
	var retVal = 0;
	var count ;
	var msgString = inMsg.getBody(java.lang.String.class);
	logger.trace("In txInfRT1GenericRule");

	var nodes = Document.getElementsByTagName("TxInf"); //Get the <node> tags
	logger.info("txInfRT1GenericRule:nodes = "+nodes); 
    amountOfNodes = nodes.length;
	logger.info("txInfRT1GenericRule:amountOfNodes = "+amountOfNodes); 
	
	if(amountOfNodes > 10){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("txInfRT1GenericRule : If TxInf present only 10 occurence is allowed in RT1.");
		retVal = setCommentsForTransaction("126", "7132", map);
		return retVal;
	}
	
	return retVal;
}

function sepaInstRT1ValidationRulesPacs002(pacs002ValdFlagMx, exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var retVal;

	logger.info("In sepaInstRT1ValidationRulesPacs002");

	retVal = 0;

	if(pacs002ValdFlagMx == "ERROR") {
		retVal = orgnlMsgNmIdSepaInstRT1Pacs002Rule(exchange);
		if(retVal != 0) {
			return retVal;
		}

		retVal = lclInstrmCdSEPAInstPacs002Rule(exchange);
		if(retVal != 0) {
			return retVal;
		}

		retVal = svcLvlCdSepaInstPacs002Rule(exchange);
		if(retVal != 0) {
			return retVal;
		}

		retVal = grpStsTXStsSepaInstRT1Pacs002Rule(exchange);
		if(retVal != 0) {
			return retVal;
		}

		retVal = grpStsStsRsnInfSepaInstRT1Pacs002Rule(exchange);
		if(retVal != 0) {
			return retVal;
		}

		retVal = txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule(exchange);
		if(retVal != 0) {
			return retVal;
		}
	}

	if(pacs002ValdFlagMx == "WARNING") {
		retval = orgnlMsgNmIdSepaInstRT1Pacs002Rule(exchange);
		retval = svcLvlCdSepaInstPacs002Rule(exchange);
		retval = lclInstrmCdSEPAInstPacs002Rule(exchange);
		retval = grpStsTXStsSepaInstRT1Pacs002Rule(exchange);
		retval = grpStsStsRsnInfSepaInstRT1Pacs002Rule(exchange);
		retval = txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule(exchange);
	}

	return retVal;
}

function orgnlMsgNmIdSepaInstRT1Pacs002Rule(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);	
	var retVal;

	logger.info("In orgnlMsgNmIdSepaInstRT1Pacs002Rule");

	retVal = 0;

	var Date1 = memTblGetTableValue(map, "USER_CONFIG_MAP", "SEPA_LIB2025_DATE");
	logger.info("orgnlMsgNmIdRT1GenericRule: Date1 = " + Date1);

	var sysDate = getDate();
	logger.info("orgnlMsgNmIdRT1GenericRule: sysDate = " + sysDate);
	
	var orgnlMsgNmIdValue = getValueFromPath(Document, "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgNmId");
	logger.info("orgnlMsgNmIdSepaInstRT1Pacs002Rule: orgnlMsgNmIdValue = " + orgnlMsgNmIdValue);

	if(sysDate){
		if(sysDate < Date1){
	if(orgnlMsgNmIdValue != "pacs.008.001.08") {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("orgnlMsgNmIdSepaInstRT1Pacs002Rule: Only pacs.008.001.08 is allowed");
		retVal = setCommentsForTransaction("127", "7164", map);
		return retVal;		
			}
		}else {
			orgnlMsgNmIdValue = orgnlMsgNmIdValue.slice(0, 8);
			logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue after trim = " + orgnlMsgNmIdValue );

			const orgnlMsgNmIdValue1 = ["pacs.008"];

			if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is begin with 'pacs.008'");
			}else {
				setHeader(map, "PLCN_validMessage",false);
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is must begin with 'pacs.008'");
				retVal = setCommentsForTransaction("127", "7624", map);	//NEW violations to be defined..
				return retVal;			
			}
		}
	}

	return retVal;	
}

function grpStsTXStsSepaInstRT1Pacs002Rule(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);	
	var retVal;

	logger.info("In grpStsTXStsSepaInstRT1Pacs002Rule");

	retVal = 0;

	var grpStsValue = getValueFromPath(Document, "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/GrpSts");
	logger.info("grpStsTXStsSepaInstRT1Pacs002Rule: grpStsValue = " + grpStsValue);

	var txStsValue = getValueFromPath(Document, "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts");
	logger.info("grpStsTXStsSepaInstRT1Pacs002Rule: txStsValue = " + txStsValue);

	if(grpStsValue && txStsValue) {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("grpStsTXStsSepaInstRT1Pacs002Rule: Either 'Group Status' or 'Transaction Status' must be used");
		retVal = setCommentsForTransaction("133", "7165", map);
		return retVal;		
	}

	return retVal;	
}

function grpStsStsRsnInfSepaInstRT1Pacs002Rule(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);	
	var retVal;

	logger.info("In grpStsStsRsnInfSepaInstRT1Pacs002Rule");

	retVal = 0;

	var grpStsValue = getValueFromPath(Document, "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/GrpSts");
	logger.info("grpStsStsRsnInfSepaInstRT1Pacs002Rule: grpStsValue = " + grpStsValue);

	var stsRsnInf = isXmlNodePresent(Document, "FIToFIPmtStsRpt", "OrgnlGrpInfAndSts", "StsRsnInf");
	logger.info("txInfRT1GenericRule: stsRsnInf = "+ stsRsnInf);

	if(grpStsValue == "RJCT" && !stsRsnInf) {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("grpStsStsRsnInfSepaInstRT1Pacs002Rule: StsRsnInf Must be used when 'Group Status' is 'RJCT'.");
		retVal = setCommentsForTransaction("122", "7166", map);
		return retVal;		
	}
	/*else if(grpStsValue == "RJCT" && stsRsnInf) {
		var orgtr = isXmlNodePresent3(Document, "FIToFIPmtStsRpt", "OrgnlGrpInfAndSts", "StsRsnInf", "Orgtr");
		logger.info("txInfRT1GenericRule: orgtr = "+ orgtr);

		if(!orgtr) {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("grpStsStsRsnInfSepaInstRT1Pacs002Rule: Orgtr is Mandatory if Group Status above is set to 'RJCT'");
			retVal = setCommentsForTransaction("00", "0000", map);
			return retVal;			
		}

		var rsn = isXmlNodePresent3(Document, "FIToFIPmtStsRpt", "OrgnlGrpInfAndSts", "StsRsnInf", "Rsn");
		logger.info("grpStsStsRsnInfSepaInstRT1Pacs002Rule: rsn = "+ rsn);

		if(!rsn) {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("grpStsStsRsnInfSepaInstRT1Pacs002Rule: Rsn is Mandatory if Group Status above is set to 'RJCT'");
			retVal = setCommentsForTransaction("00", "0000", map);
			return retVal;			
		}	
	}*/

	return retVal;	
}

function txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);	
	var retVal;

	logger.info("In txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule");

	retVal = 0;

	var txStsValue = getValueFromPath(Document, "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts");
	logger.info("txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule: txStsValue = " + txStsValue);

	var stsRsnInf = isXmlNodePresent(Document, "FIToFIPmtStsRpt", "TxInfAndSts", "StsRsnInf");
	logger.info("txInfRT1GenericRule: stsRsnInf = "+ stsRsnInf);

	if(txStsValue == "RJCT" && !stsRsnInf) {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule: StsRsnInf Must be used when 'Group Status' is ‘RJCT’.");
		retVal = setCommentsForTransaction("00", "0000", map);
		return retVal;		
	}
	/*else if(txStsValue == "RJCT" && stsRsnInf) {
		var orgtr = isXmlNodePresent3(Document, "FIToFIPmtStsRpt", "TxInfAndSts", "StsRsnInf", "Orgtr");
		logger.info("txInfRT1GenericRule: orgtr = "+ orgtr);

		if(!orgtr) {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule: Orgtr is Mandatory if Group Status above is set to 'RJCT'");
			retVal = setCommentsForTransaction("00", "0000", map);
			return retVal;			
		}

		var rsn = isXmlNodePresent3(Document, "FIToFIPmtStsRpt", "TxInfAndSts", "StsRsnInf", "Rsn");
		logger.info("txInfRT1GenericRule: rsn = "+ rsn);

		if(!rsn) {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("txInfAndStsStsRsnInfSepaInstRT1Pacs002Rule: Rsn is Mandatory if Group Status above is set to 'RJCT'");
			retVal = setCommentsForTransaction("00", "0000", map);
			return retVal;			
		}	
	}*/

	return retVal;	
}