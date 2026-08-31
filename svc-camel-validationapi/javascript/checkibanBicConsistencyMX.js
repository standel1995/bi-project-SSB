function checkIbanBicConsistencyMX(exchange) {
	var ibanBic;
	var bicCode;
	var comments;
	var accFrmIban;
	var accIban;
	var messageBic;
	var errorDscn;
	var errorVal;
	var ctrycode;
	var bankName;
	var accNum;
	var checkReqd;
	var mod;
	var bankName1;
	var bicChkOptionalflag;
	var nchFrmIban;
	var danFrmIban;
	var cntryFrmIban;
	var bic4FrmIban;
	var bbanFrmIban;
	var viocode;
	var messageType;
	var consistentFlag; 
	var institutionId;
	var productCode;
	var key;
	var value;

	var inMsg = exchange.getIn();
	var	map = inMsg.getHeaders();
	//logger.info("checkIbanBicConsistencyMX:Headers = " + map);
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	setHeader(map, "PLCN_ibanBicConsistent", true);
 	logger.info("In check Iban bic consistency rule.");
	var message = inMsg.getBody(java.lang.String.class);
	logger.trace("checkIbanBicConsistencyMX:message = " + message);
	
	// institutionId = getHeader(map, "PLCN_institutionId");
 //    logger.trace("checkIbanBicConsistencyMX: institutionId = " + institutionId);

 //    logger.trace("checkIbanBicConsistencyMX: productCode = " + productCode);
 //    productCode = getHeader(map, "PLCN_productCode");
    
 //    key = institutionId + "."+ "PROCESSING_STAGES.IBANBIC" + "." + "PRODUCTS";
 //    logger.trace("checkIbanBicConsistencyMX: key = " + key);

 //    value = memTblGetTableValue(map, "INST_PARAM", key);
 //    logger.trace("checkIbanBicConsistencyMX: value = " + value);	

	checkReqd = "Y";
	messageType = getHeader(map,"PLCN_msgType");
	logger.info("checkIbanBicConsistencyMX:Message Type= " +  messageType);
	
	// if(isPatternPresent(value, productCode)) {	
	logger.info("Extract acc from Iban rule called.");
	accFrmIban = extractAccFromIBanMx(exchange);
	logger.info("checkIbanBicConsistencyMX:acc value from Iban= " + accFrmIban);
	// }else {
	// 	setHeader(map,"PLCN_ibanBicConsistent", false);;
	// }
	mod = getHeader(map,"MANUAL_MODE");

	if (isPatternPresent(mod,"REPAIR")) { 	
		logger.info("checkIbanBicConsistencyMX:In repair Mod");
		errorDscn = memTblGetTableValue(map,"FLAG-TABLE","MANUAL_ERROR_WARNING_DSCN");
	}
		
	accIban = getHeader(map,"SENDER_IBAN");
	logger.info("checkIbanBicConsistencyMX:acc iban = " + accIban);		
	messageBic = getHeader(map,"RCVR_BIC");
	messageBic = messageBic.trim();
	logger.info("checkIbanBicConsistencyMX:acc bic = " + messageBic);	
	
	ctrycode = accIban.substr(0, 2);
	logger.info("checkIbanBicConsistencyMX:country code= " + ctrycode);
	bankName = accIban.substr(4, 4);
	logger.info("checkIbanBicConsistencyMX:Bank name= " + bankName);
	accFrmIban = lTrimChar1(accFrmIban, "*");
	logger.info("checkIbanBicConsistencyMX:account number= " + accNum);

	if (isPatternPresent(ctrycode,"NL")) { 	
		bankName1 = "NL_BANK";
	}

	var routingBic;
	routingBic = getHeader(map,"ROUTING_BIC");
	routingBic = routingBic.trim();
	logger.info("checkIbanBicConsistencyMX:Iban Bic value= " + routingBic);   
	accIban = getHeader(map,"SENDER_IBAN");
	logger.info("checkIbanBicConsistencyMX:acc iban = " + accIban);
	
	messageBic = getHeader(map,"RCVR_BIC");
	//messageBic = messageBic.trim();
	logger.info("checkIbanBicConsistencyMX:Message bic = " + messageBic);

	if(bankName1){
		bicChkOptionalflag = memTblGetTableValue(map,"BIC_OPTIONAL_CHANNEL",bankName1);
	}
	logger.info("checkIbanBicConsistencyMX:Bic optional channel = " + bicChkOptionalflag);
	//setHeader(map, "PLCN_ibanBicConsistent", true);
	logger.info("Iban bic consistency check completed...");

	consistentFlag = getHeader(map, "PLCN_ibanBicConsistent");
	logger.info("checkIbanBicConsistencyMX:PLCN_ibanBicConsistent = " + consistentFlag);

	if(consistentFlag) {
		setHeader(map, "status" , "consistent");
	}else {
		setHeader(map, "status" ,"inconsistent");
	}		
}

function extractAccFromIBanMx(exchange) {
    var messageType;
	var accIbanPathth;
	var accIban;
	var bicPath;
	var messageBic;
	var ibanBic;
	var isocnty;
	var ibanacc;
	var ibanaccPos;
	var ibanaccPos1;
	var accFrmIban;
	var acclen;
	var CdtrAgt;
	var FinInstnId;
	var BICFI;
	var message;
	var consistentFlag;
	var ibanFlag;
	var derivedBic;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class)

	message = inMsg.getBody(java.lang.String.class);
	
	logger.info("In extract account from iban rule.");

	messageType = getHeader(map,"PLCN_msgType");
	logger.info('extractAccFromIBanMx: messageType = ' + messageType);
	
	if (messageType == "pacs.008.001.08") {			
		accIbanPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Id/Othr/Id';
		accIban = getValueFromPath(Document,accIbanPath);
		logger.info("extractAccFromIBanMx:Iban value from path for Pacs008 = " + accIban);
			
	    bicPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
	    messageBic = getValueFromPath(Document,bicPath);
	    logger.info("extractAccFromIBanMx:Bic value from path for Pacs008 = " + messageBic);

	    // ibanFlag = isValidIban(accIban);
	    // logger.info("extractAccFromIBanMx: ibanFlag= " + ibanFlag);
	    setHeader(map,"SENDER_IBAN",accIban);
	    setHeader(map,"RCVR_BIC",messageBic);

	    if(messageBic == null) {
			logger.info("extractAccFromIBanMx:Derive Bic from ref rule called.");
			derivedBic = deriveBicFromRef (accIban, exchange);
			derivedBic = derivedBic.trim();
			logger.info("extractAccFromIBanMx:Iban bic= " + derivedBic);

			if(!(isPatternPresent(message, "</CdtrAgt>"))) {
				var Cdtr = Document.getElementsByTagName("Cdtr");
				var nextNode = Cdtr.item(0);
				logger.info(" If part:nextNode = " + nextNode);
				      
				CdtrAgt = createElement(Document, "CdtrAgt");
				FinInstnId = createElement(Document,"FinInstnId");
				          
				BICFI =  createElementwithTextNode(Document , FinInstnId, "BICFI" , derivedBic);
				FinInstnId.appendChild(BICFI);
				CdtrAgt.appendChild(FinInstnId);
				          
				var CdtTrfTxInf = Document.getElementsByTagName("CdtTrfTxInf");
				var newNode = CdtTrfTxInf.item(0);
				newNode.insertBefore(CdtrAgt, nextNode);   		       		
			}else {
				logger.info("pacs008:else part.");		
				FinInstnId =  createElement(Document, "FinInstnId" );

				BICFI =  createElementwithTextNode(Document , FinInstnId,"BICFI" , derivedBic);
				FinInstnId.appendChild(BICFI);

				CdtrAgt = Document.getElementsByTagName("CdtrAgt");
				var newNode = CdtrAgt.item(0);
				newNode.insertBefore(FinInstnId, nextNode);
			}
	    }else {
	    	derivedBic = deriveBicFromRef (accIban, exchange);
			derivedBic = derivedBic.trim();
			logger.info("extractAccFromIBanMx:Iban bic= " + derivedBic);
	    }
	}    
	
	if (messageType == "pacs.009.001.08") { 
	    accIbanPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAcct/Id/Othr/Id';
	    accIban = getValueFromPath(Document,accIbanPath);
	    logger.info("extractAccFromIBanMx:Iban value from path for Pacs009= " + accIban);
	        
        bicPath = '/Document/FICdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
        messageBic = getValueFromPath(Document,bicPath);
        logger.info("extractAccFromIBanMx:Bic code value from path for Pacs009= " + messageBic);
		
		setHeader(map,"SENDER_IBAN",accIban);
		setHeader(map,"RCVR_BIC",messageBic);
	
	  	if(messageBic == null) {
	    	logger.info("extractAccFromIBanMx:Derive Bic from ref rule called.");
			derivedBic = deriveBicFromRef (accIban,exchange);
			derivedBic = derivedBic.trim();
			logger.info("extractAccFromIBanMx:Iban bic = " + derivedBic);	
            
            var result = (isPatternPresent(message, "<CdtrAgt>"));
            logger.info("extractAccFromIBanMx:Message body = " + message);
            logger.info("extractAccFromIBanMx:DataType of message = " + typeof message);
            logger.info("extractAccFromIBanMx:result = " + result);
          
           if(!(isPatternPresent(message, "<CdtrAgt>"))) {
		     	var Cdtr = Document.getElementsByTagName("Cdtr");
				var nextNode = Cdtr.item(0);
				logger.info(" Pacs009 If part:nextNode = " + nextNode);
				    
				var CdtrAgt = createElement(Document, "CdtrAgt");
				FinInstnId = createElement(Document,"FinInstnId");
				          
				BICFI = createElementwithTextNode(Document , FinInstnId, "BICFI" , derivedBic);
				FinInstnId.appendChild(BICFI);
				CdtrAgt.appendChild(FinInstnId);
				          
				var CdtTrfTxInf = Document.getElementsByTagName("CdtTrfTxInf");
				var newNode = CdtTrfTxInf.item(0);
				newNode.insertBefore(CdtrAgt, nextNode);

			}else {
				logger.info("pacs009:else part.");
		        CdtrAgt = Document.getElementsByTagName("CdtrAgt");
				var cdtrAgtNode = CdtrAgt.item(0);

				FinInstnId =  createElement(Document, "FinInstnId" );
				BICFI =  createElementwithTextNode(Document , FinInstnId, "BICFI" , derivedBic);
				FinInstnId.appendChild(BICFI);
				cdtrAgtNode.appendChild(FinInstnId);
			} 		   
	    }else {
	    	derivedBic = deriveBicFromRef (accIban, exchange);
			derivedBic = derivedBic.trim();
			logger.info("extractAccFromIBanMx:Iban bic= " + derivedBic);
	    }	        
	}

	if(messageType == "pacs.004.001.09") {
	    accIbanPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAcct/Id/IBAN';
	    accIban = getValueFromPath(Document,accIbanPath);
	    logger.info("extractAccFromIBanMx:Iban value from path for Pacs004= " + accIban);
	        
        bicPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/CdtrAgt/FinInstnId/BICFI';
        messageBic = getValueFromPath(Document,bicPath);
        logger.info("extractAccFromIBanMx:Bic code value from path for Pacs004= " + messageBic);
        
        setHeader(map,"SENDER_IBAN",accIban);
    	setHeader(map,"RCVR_BIC",messageBic);   
    
        if(messageBic == null) {
	    	logger.info("extractAccFromIBanMx:Derive Bic from ref rule called.");
			derivedBic = deriveBicFromRef (accIban,exchange);
			derivedBic = derivedBic.trim();
			logger.info("extractAccFromIBanMx:Iban bic = " + derivedBic);	
                 
            logger.info("extractAccFromIBanMx:Message body = " + message);
            logger.info("extractAccFromIBanMx:DataType of message = " + typeof message);

	        if(!(isPatternPresent(message, "<CdtrAgt>")) && (isPatternPresent(message, "<OrgnlTxRef>"))) {
			   	var CdtrAcct = Document.getElementsByTagName("CdtrAcct");
				var nextNode = CdtrAcct.item(0);
				logger.info(" Pacs004 If part:nextNode = " + nextNode);
				var CdtrAgt = createElement(Document, "CdtrAgt");
				FinInstnId = createElement(Document,"FinInstnId");
					          
				BICFI = createElementwithTextNode(Document , FinInstnId, "BICFI" , derivedBic);
				FinInstnId.appendChild(BICFI);
				CdtrAgt.appendChild(FinInstnId);
	          
				var OrgnlTxRef = Document.getElementsByTagName("OrgnlTxRef");
				var newNode = OrgnlTxRef.item(1);
				newNode.insertBefore(CdtrAgt, nextNode);
			}else {
				logger.info("pacs004:else part.");
			    CdtrAgt = Document.getElementsByTagName("CdtrAgt");
				var cdtrAgtNode = CdtrAgt.item(0);

				FinInstnId =  createElement(Document, "FinInstnId" );
				BICFI =  createElementwithTextNode(Document , FinInstnId, "BICFI" , derivedBic);
				FinInstnId.appendChild(BICFI);
				cdtrAgtNode.appendChild(FinInstnId);	
			} 		   
	    }else {
	    	derivedBic = deriveBicFromRef (accIban, exchange);
			derivedBic = derivedBic.trim();
			logger.info("extractAccFromIBanMx:Iban bic= " + derivedBic);
	    }
	}

	if (messageType == "pain.001.001.09") {
		var cdtrAcct = isXmlNodePresent2(Document, "CdtrAcct");
		var cdtrAgt = isXmlNodePresent2(Document, "CdtrAgt");
		if(cdtrAcct || cdtrAgt){
				accIbanPath = '/Document/CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf/CdtrAcct/Id/Othr/Id';
				accIban = getValueFromPath(Document,accIbanPath);
				logger.info("extractAccFromIBanMx:Iban value from path for Pain001 = " + accIban);
					
			    bicPath = '/Document/CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
			    messageBic = getValueFromPath(Document,bicPath);
			    logger.info("extractAccFromIBanMx:Bic value from path for Pain001 = " + messageBic);

			    // ibanFlag = isValidIban(accIban);
			    // logger.info("extractAccFromIBanMx: ibanFlag= " + ibanFlag);
			    setHeader(map,"SENDER_IBAN",accIban);
			    setHeader(map,"RCVR_BIC",messageBic);

			    if(messageBic == null) {
					logger.info("extractAccFromIBanMx:Derive Bic from ref rule called.");
					derivedBic = deriveBicFromRef (accIban, exchange);
					derivedBic = derivedBic.trim();
					logger.info("extractAccFromIBanMx:Iban bic= " + derivedBic);

					if(!(isPatternPresent(message, "</CdtrAgt>"))) {
						var Cdtr = Document.getElementsByTagName("Cdtr");
						var nextNode = Cdtr.item(0);
						logger.info(" If part:nextNode = " + nextNode);
						      
						CdtrAgt = createElement(Document, "CdtrAgt");
						FinInstnId = createElement(Document,"FinInstnId");
						          
						BICFI =  createElementwithTextNode(Document , FinInstnId, "BICFI" , derivedBic);
						FinInstnId.appendChild(BICFI);
						CdtrAgt.appendChild(FinInstnId);
						          
						var CdtTrfTxInf = Document.getElementsByTagName("CdtTrfTxInf");
						var newNode = CdtTrfTxInf.item(0);
						newNode.insertBefore(CdtrAgt, nextNode);   		       		
					}else {
						logger.info("Pain001:else part.");		
						FinInstnId =  createElement(Document, "FinInstnId" );

						BICFI =  createElementwithTextNode(Document , FinInstnId,"BICFI" , derivedBic);
						FinInstnId.appendChild(BICFI);

						CdtrAgt = Document.getElementsByTagName("CdtrAgt");
						var newNode = CdtrAgt.item(0);
						newNode.insertBefore(FinInstnId, nextNode);
					}
			    }else {
			    	derivedBic = deriveBicFromRef (accIban, exchange);
					derivedBic = derivedBic.trim();
					logger.info("extractAccFromIBanMx:Iban bic= " + derivedBic);
			    }
		}
	}

	//setHeader(map,"SENDER_IBAN",accIban);
	//setHeader(map,"RCVR_BIC",messageBic);
	    
	if(accIban) {   
	    isocnty = accIban.substr(0, 2);
		logger.info("extractAccFromIBanMx:Country code = " + isocnty);
		var dataType = typeof isocnty;
		logger.info("extractAccFromIBanMx:DataType of country code = " + typeof  isocnty);
	
		if (isocnty && (dataType == "string")) {
			ibanacc = memTblGetTableValue(map,"IBAN-ACC-POS", isocnty);
			logger.info("extractAccFromIBanMx:Iban account position = " + ibanacc);
	
			if (ibanacc != null) {
				var ibanacc1 = ibanacc;
				ibanacc1 = ("|").concat(ibanacc1);
		        ibanaccPos = dataBetweenTokens ("|", "|", ibanacc1);
		        logger.info("extractAccFromIBanMx:IbanAccPos = " + ibanaccPos);

				ibanacc = ibanacc.concat("|");
				accLength = dataBetweenTokens ("|", "|", ibanacc);
				logger.info("extractAccFromIBanMx:Acclength = " + accLength);
		        accFrmIban = accIban.substr (ibanaccPos - 1, acclen);
		        logger.info("extractAccFromIBanMx:accFrmIban = " + accFrmIban);
			}
			}else {
				setHeader(map, "PLCN_ibanBicConsistent" , true);
		}	
	}

	consistentFlag = getHeader(map, "PLCN_ibanBicConsistent");
	logger.info("extractAccFromIBanMx:PLCN_ibanBicConsistent = " + consistentFlag);

	 return accFrmIban; 
	//logger.info("extractAccFromIBanMx:accFrmIban = " + accFrmIban);
}

function deriveBicFromRef(accIban,exchange) {
	var nchFrmIban;
	var ntryFrmIban;
	var danFrmIban;
	var bic4FrmIban;
	var bbanFrmIban;
	var ibanBic = "";
	var ibanBicflag;
	var checkReqd;
	var routingBic;
	var cntryFrmIban;
	var multiNchValue
	var multiUniqueNchValue;
	var nchCheck;
	var ibanValidation;
	var errorVal;
	var errorDscn;
	var comments;
	var comments1;
	var gvComments;
	var msgBic;
	var msgIban;
    var derivedBic;

	var inMsg = exchange.getIn();
	var	map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	logger.info(" In Derive BIC from Ref rule .");
	nchCheck = memTblGetTableValue(map,"FLAG-TABLE","NCH_CHECK");
	ibanValidation = memTblGetTableValue (map,"STD_PARAM_TBL","IBAN_VALIDATION");
	
	logger.info("NCH Check value= " + nchCheck);
	logger.info("Iban Validation value= " + ibanValidation);

	routingBic = getHeader(map,"ROUTING_BIC");
	routingBic = routingBic.trim();

	if (isPatternPresent(nchCheck,"Y")) {
		logger.info("Extract NCH from Iban rule called.");
		nchFrmIban = extractNchFromIban(accIban,exchange);
	}
	if (isPatternPresent(ibanValidation,"Y")) { 
	
		if (accIban) { 
		
			if (!(isValid(accIban))) {
				errorVal = "5714";				
				errorDscn = memTblGetTableValue(map,"FLAG-TABLE","TA_ERROR_WARNING_DSCN");

				if (isPatternPresent(errorDscn,"ERROR")) { 
					setHeader(map, "PLCN_ibanBicConsistent" , true);
                  	setHeader(map,"TransErrorflag","T");
                  	setHeader(map,"TransErrorcode",errorVal);
                  	var value1 = ("P00-1:A00:00").concat(errorVal);
                  	logger.info("TechErrcomments= " + value1);
                  	setHeader(map,"TechErrcomments",value1);
                  	gvComments = ("P00-1:A00:00-").concat(errorVal);
					gvComments = (gvComments).concat(errorVal);
					comments = ("P00-1:A00:00-").concat(errorVal);
                  	comments1 = getHeader(map,"comments");
                  	logger.info("Comments1= " + comments1);
					
                  	if (comments1) { 
						logger.info("In comments1.");
                  		comments = (comments).concat(":").concat(comments1);
                  		comments = replaceAllPattern(comments,":P00_1:A00:",":A00:");
                  		//setHeader(map, "comments", comments);
						logger.info("Comments= " + comments);
                  	}else { 
						logger.info("In comments.");
                  		//setHeader(map, "comments", comments);	
                  	}
                    return errorVal;
				}
			}
		}
	}

	if (isPatternPresent(nchCheck,"Y")) { 
		logger.info("extract NCH from IBAN rule called.");
		nchFrmIban = extractNchFromIban(accIban,exchange);
		logger.info("Nch value from Iban= " + nchFrmIban);
	}
	
	if ((nchFrmIban !== "8894")) { 
		logger.info("extract country from Iban rule called.");
		cntryFrmIban = extractCountryFromIban(accIban,exchange);
		logger.info("deriveBicFromRef:country value from Iban= " + cntryFrmIban);
			
		logger.info("extractBic4FromIban rule called.");
		bic4FrmIban = extractBic4FromIban (accIban,exchange);
		logger.info("deriveBicFromRef:Bic4 value from iban= " + bic4FrmIban);

		if (nchFrmIban) { 
			logger.info("extract Nch lookup rule called.");
			extractNchLookUp (nchFrmIban, cntryFrmIban, bic4FrmIban,exchange);

		}
		multiNchValue = getHeader(map,"nchcode");
		multiUniqueNchValue = getHeader(map,"UniqueNchValue");
		logger.info("multiUniqueNchValue = " + multiUniqueNchValue);
			
		if((multiUniqueNchValue) && (!(ibanBic)) && (isPatternPresent(nchCheck,"Y"))) { 
			logger.info("DD Bic From NCH3 rule called.");
			derivedBic = ddbicFromNch3 (cntryFrmIban, multiUniqueNchValue,exchange);
			derivedBic = derivedBic.trim();
			logger.info("Iban bic value from dd bic from nch3 rule= " + derivedBic);
			setHeader(map,"DERIVED_BIC",derivedBic);
	 	}
			
		if((multiUniqueNchValue) && (!(ibanBic)) && (isPatternPresent(nchCheck,"Y"))) {
			logger.info("DD Bic From NCH2 rule called.");
			derivedBic = ddbicFromNch2(cntryFrmIban, multiNchValue,exchange);
			derivedBic = derivedBic.trim();
			logger.info("Iban bic value from dd bic from nch2 rule= " + derivedBic);
			setHeader(map,"DERIVED_BIC",derivedBic);
		}
			
		if((bic4FrmIban) && (!(ibanBic))) { 
			logger.info("DD Bic From Bic4 SWF2 rule called.");
			derivedBic = ddbicFrombic4Swf2(cntryFrmIban, bic4FrmIban,exchange);
			derivedBic = derivedBic.trim();
			logger.info("deriveBicFromRef:Iban bic value from dd bic from bic4 swf2 rule= " + derivedBic);
			setHeader(map,"DERIVED_BIC",derivedBic);
		}
		if (( (!accIban) || (derivedBic == "N")) && (!routingBic)) { 
			checkReqd = "N";
		}
		msgBic = getHeader(map,"RCVR_BIC");
		logger.info("deriveBicFromRef: Message Bic=" + msgBic);

		msgIban = getHeader(map,"SENDER_IBAN");
		logger.info("deriveBicFromRef: Message Iban= " + msgIban);

		if(msgIban && msgBic && derivedBic){
			logger.info("deriveBicFromRef:bicConcatAndComparison rule called.");
		    bicCode = getHeader(map,"RCVR_BIC");
			consistentBic = bicConcatAndComparison(derivedBic, checkReqd, bicCode, errorDscn,exchange);
			derivedBic = derivedBic.trim();
			checkReqd = "Y";
			setHeader(map,"UNIQUE_NCH_VALUE",multiUniqueNchValue);
		}else {
			setHeader(map,"PLCN_ibanBicConsistent",true);
		}

		if ((ibanBic) && (gvComments == "8895")) { 
			gvComments = removePattern (gvComments, "P00_1:A00:00_8895");
		}		
	}
	return ibanBic;	
}

function extractNchFromIban(ibancode,exchange){
	var countrycode;
	var value;
	var startPosition;
	var ibanlength;
	var nchValue;
	var bussElement;
	var ibanBicFunc;
	var errorVal;
	var errorDscn;
	var comments;
	var comments1;

    var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	logger.info("In Extract NCH from IBAN rule .")
	errorDscn = memTblGetTableValue (map,"FLAG-TABLE","TA_ERROR_WARNING_DSCN");
	
	logger.info("Error Dscn = " + errorDscn);

	if (ibancode){ 
		logger.info("IBAN for extract NCH from IBAN= " + ibancode);
		logger.info("is valid rule called.");
		
		if (isPatternPresent(isValid(ibancode),"Valid")) { 
			logger.info("Valid Iban.");
			countrycode = ibancode.substr(0,2);
			countrycode = countrycode.toUpperCase();
			logger.info("countrycode= " + countrycode);

 			if (countrycode){ 
 			
 				if (isAlpha(countrycode.substr(0,1)) && isAlpha(countrycode.substr(1,1))){ 		
 					value = memTblGetTableValue(map,"IBAN-NCH-POS",countrycode);
 					logger.info("NCH position in IBAN code= " + value);
 					
					if ((value)&&(isPatternPresent(value,"|"))) { 
 						startPosition = value.substr(0,1);
 						ibanlength = value.substr(2 ,((value.length) - 2));
 						logger.info("NCH Length in IBAN= " + ibanlength);

 						if ((startPosition) && (ibanlength)) { 
 							nchValue = ibancode.substr(startPosition-1,ibanlength);
 							logger.info("NCH code= " + nchValue);

 							if (nchValue){  							
								setHeader(map,"nchcode", nchValue);
								logger.info("extractNchFromIban: NCH code = " + nchValue);
 								return nchValue;
 							}
 						}
 					}
 				}
 			}
 		}	
 		else {
 				logger.info("In extract NCH from IBAN Error block.");
 				errorVal = "8894";

 				if (errorDscn == "ERROR") { 
 					setHeader(map, "PLCN_ibanBicConsistent" , true);
					setHeader(map,"TransErrorflag","T");
					
					setHeader(map,"TransErrorcode",errorVal);
					logger.info("Error value= " + errorVal);
                   
 					var value1 = ("P00-1:A00:00-").concat(errorVal);
 					setHeader(map,"TechErrcomments",valu1); 
 					logger.info("Error value after concatination= " + value1);                             
                    comments = ("P00-1:A00:00-".concat (errorVal));					
					comments1 = getHeader(map,"comments");
					logger.info("Comments1= " + comments1);
					
                    if (comments1) {                    
                    	logger.info("In comments1.");
                    	comments = comments.concat(":").concat(comments1);
						comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
						setHeader(map, "comments", comments);					
                    }                    
                    else {
                    	logger.info("In comments.");
						setHeader(map, "comments", comments);                   	
                    }
                    return errorVal;   
 				}
 				comments = comments.concat(":P00-1:A00:00-").concat(errorVal);
				comments = (removePattern (comments,(strStr(comments,":A00:")))).concat(strStr(comments,":A00:"));				
				comments1=getHeader(map,"comments");

				if (comments1) { 
					comments = comments.concat(":").concat(comments1);
					comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
					//setHeader(map, "comments", comments);					
				}
				else { 
					setHeader(map, "comments", comments);					
				}

				gvComments = gvComments.concat(":P00-1:A00:00-").concat(errorVal);
                setCommentsForTransaction("","00-8894");
                gvComments = removePattern(gvComments,(strStr (gvComments,":A00:"))).concat(strStr(gvComments, ":A00:"));
		}
	}
}

function extractCountryFromIban(ibancode, exchange) {
	var tmpstr;
	var isoCnty;
	var bussElement;
	var countrycode;
	var cntry1;
	var cntry2;
	var ibanBicFun;
	var consistentFlag;

	var inMsg = exchange.getIn();
	var	map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	logger.info("In extract country from Iban Rule.");
	logger.info("extractCountryFromIban: IBAN = " + ibancode);

	if (ibancode){ 			
		logger.info("Iban code for Extract country from IBAN= " + ibancode);

		if (isPatternPresent(isValid(ibancode),"Valid")) { 
			countrycode = ibancode.substr(0,2);
            countrycode = countrycode.toUpperCase();          
           	logger.info("country code= " + countrycode);

		   if (countrycode) {             				
				logger.info("check extracted country code.");
            	var cntrycode;
            	cntrycode = memTblGetTableValue (map,"COUNTRY_TABLE", countrycode);
            	logger.info("extractCountryFromIban:country = " + cntrycode);

            	if (cntrycode) {             					
					logger.info("country is found on basis of country code.");
					setHeader(map, "countrycode", countrycode);		
					setHeader(map, "PLCN_ibanBicConsistent" , true);
					return countrycode;
            	}
            	else {            						
					logger.info("country is not found on basis of country code.");
					setHeader(map, "countrycode", "");	
					return "";
            	}
            	consistentFlag = getHeader(map, "PLCN_ibanBicConsistent");
            	logger.info("extractCountryFromIban:PLCN_ibanBicConsistent = " + consistentFlag);

            	if(consistentFlag) {
            		setHeader(map, "status" ,"consistent");
            	}else {
            		setHeader(map, "status","inconsistent");
            	}	
            }
		}
	}
}

function extractBic4FromIban (ibancode, exchange) {
	var key;
	var xtIban;
	var ddIban;
	var countrycode;
	var value;
	var Ibanlength;
	var nchValue;
	var bussElement;
	var bic4Value;
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	logger.info("In extract bic4 from iban rule.")
	bic4Value = "";
	logger.info("extractBic4FromIban: Iban = " + ibancode);

	if (ibancode) { 			
	      	countrycode = ibancode.substr(0,2);
	      	logger.info("country code extracted from Iban= " + countrycode);
			value = memTblGetTableValue(map,"IBAN-BIC4-POS",countrycode);
			logger.info("Bic4 position in Iban = " + value);

      	if (value) {       		      		
			Ibanlength = ibancode.length;	

      		if (value && Ibanlength) { 	
      			bic4Value = ibancode.substr(value-1,4);
                bic4Value = bic4Value.toUpperCase();
			   	setHeader(map, "BIC4-CODE", bic4Value);			   
			   	return bic4Value;
      		}
      	}
	}
}

function extractNchLookUp(nchcode, countrycode, bic4, exchange) {
	var value;
    var value1;
    var lenValue;
    var lenValue1;
    var position;
    var len;
    var startposition;
    var nchlength;
    var nchValue;
    var nchValue1;
    var nchcodelength;
    var tmpstr;
    var fld;
    var nchLookupFormat;
    var nchlengthMin;
    var nchlengthMax;
    var nchlengthLookup;
    var nchFromIban;
    var nchflag;
  	var temp1;
	var consistentFlag;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
	    logger.info("In extract NCH lookup rule.");
	  	nchflag = memTblGetTableValue(map,"STD_PARAM_TBL","NCH_REPAIR");
	    var countrycode1 = getHeader(map,"countrycode");
		logger.info("extractNchLookUp:country code = " + countrycode1);
	    logger.info("extractNchLookUp:nch flag= " + nchflag);
		nchflag = nchflag.toUpperCase();

	if (isPatternPresent(nchflag,"Y")) { 
			
		if (countrycode1) { 
		
			if ((isAlpha(countrycode1.substr(0,1))) && (isAlpha(countrycode1.substr(1,1)))) { 		
                logger.info("extractNchLookUp:isAlpha Condition Check: ");
				nchLookupFormat = memTblGetTableValue(map,"NCH_LOOKUP",countrycode1);
				logger.info("extractNchLookUp:NCH lookup format= " + nchLookupFormat);
                logger.info("extractNchLookUp:NCH code= " + nchcode);

				if ((nchLookupFormat) && (nchcode)) { 					
                    logger.info("extractNchLookUp:if nchLookupFormat and nchcode is present.");
					nchLookupFormat = ("|").concat(nchLookupFormat);
					logger.info("extractNchLookUp:nchLookupFormat = " + nchLookupFormat);
                    nchlengthMin = dataBetweenTokens ("|","|",nchLookupFormat);
                    logger.info("extractNchLookUp:nchlengthMin = " + nchlengthMin);
                    nchLookupFormat = removePattern (nchLookupFormat,(("|").concat(nchlengthMin)));
                    nchlengthMax = dataBetweenTokens("|","|",nchLookupFormat);
                    logger.info("extractNchLookUp:nchlengthMax = " + nchlengthMax);
                   	nchLookupFormat = removePattern (nchLookupFormat,(("|").concat(nchlengthMax).concat("|")));
                    nchlengthLookup = nchLookupFormat;
                    nchcodelength = nchcode.length;
                    logger.info("extractNchLookUp:nchcodelength = " + nchcodelength);
                    logger.info("extractNchLookUp:checkNchlength rule called.");
                    checkNchlength(countrycode,nchcode,nchcodelength,nchlengthMin,nchlengthMax,nchlengthLookup, exchange);
				}

				nchLookupFormat = memTblGetTableValue(map,"IBAN_NCH_LKUP",countrycode1);           
                logger.info("extractNchLookUp:IBAN nchLookupFormat value :" + nchLookupFormat);
				
                if ((nchLookupFormat) && (nchcode)) { 
					nchLookupFormat = ("|").concat(nchLookupFormat);
		 			logger.info("extractNchLookUp:nchLookupFormat = " + nchLookupFormat);
                    nchlengthMin = dataBetweenTokens ("|","|",nchLookupFormat);
                    logger.info("extractNchLookUp:nchlengthMin = " + nchlengthMin);
                    nchLookupFormat = removePattern (nchLookupFormat,(("|").concat(nchlengthMin)));
                    nchlengthMax = dataBetweenTokens("|","|",nchLookupFormat);
                    logger.info("extractNchLookUp:nchlengthMax = " + nchlengthMax);
                   	nchLookupFormat = removePattern (nchLookupFormat,(("|").concat(nchlengthMax).concat("|")));
                    nchlengthLookup = nchLookupFormat;
                    nchcodelength = nchcode.length;
                    logger.info("extractNchLookUp:nchcodelength = " + nchcodelength);
                    logger.info("extractNchLookUp:Check Iban Nch length rule called.");
                   	checkIbanNchlength (countrycode1,nchcode,nchcodelength,nchlengthMin,nchlengthMax,nchlengthLookup, exchange);
					setHeader(map, "PLCN_ibanBicConsistent", true);
				}else {
					setHeader(map, "PLCN_ibanBicConsistent", true);
				}

                consistentFlag = getHeader(map,"PLCN_ibanBicConsistent");
                logger.info("extractNchLookUp:PLCN_ibanBicConsistent = " + consistentFlag);	

                if(consistentFlag) {
                	setHeader(map,"status","consistent");
                }else {
                	setHeader(map,"status","inconsistent");
                }
			}
		}
	}
}

function ddbicFromNch3(cntycode, nchcode, exchange) {	
	var flag;
	var bic;
	var busiElement;
	var nchcode1;
	var value;
	var fld;
	var bicDToA;
	var bicNch;
	var tmpBicDToA;
	var tmpBicNch;
	var bbanNch;
	var len;
	var char;
	var bicField;
	var tmpBicField;
	var frchCntyFlag;
	var icc;
	var nchcodeIcc;
	var uniqueNchflag;
	var iccflag;
	var iccCnty;
	var ibanIcc;
	var cntryXt;
	var msgClass;
	var viocode;
	var errorVal;
	var errorDscn;
	var mode;
	var comments;
	var comments1;
	var retVal=0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	flag = "Y";
	
    logger.info("In DD BIC from NCH3 rule called.");
	errorDscn = memTblGetTableValue(map,"FLAG-TABLE","TA_ERROR_WARNING_DSCN");
	logger.info("ddbicFromNch3:errorDscn = " + errorDscn);
	
	if (isPatternPresent(mode,"REPAIR")) {
		errorDscn = memTblGetTableValue(map,"FLAG-TABLE","MANUAL_ERROR_WARNING_DSCN");
	}
	
	if (flag !== "N") {
		nchcodeIcc = nchcode;
		frchCntyFlag = memTblGetTableValue(map,"FRANCE-RELATED", cntycode);

		if(nchcode) {		
			logger.info("nch value= " + nchcode);
			value = cntycode.concat("|").concat(nchcode);
			logger.info("ddbicFromNch3:value = " + value);
			var code = memTblGetTableValue(map,"BIC-NCH-TABLE",value);
			code = code.trim();
			logger.info("ddbicFromNch3: code = " + code);
			setHeader(map,"ROUTING_BIC",code);

			if (!nchcode) { 			
				value = cntycode.concat("|").concat(nchcodeIcc);
				logger.info("if not NCH code then value= " + value);
				var code1 = memTblGetTableValue(map,"BIC-NCH-TABLE",value);
				logger.info("ddbicFromNch3: code1 = " + code1);
                uniqueNchflag = "Y";
               
                if (!(isPatternPresent(frchCntyFlag,"Y"))) {                
                	setHeader(map, "IBAN_NCH", "N");					
                }
			}
			
			if ((!nchcode) && (isPatternPresent(frchCntyFlag,"Y"))) { 			
				logger.info("checking National code");
				value = ("NATIDCODE ").concat(nchcodeIcc);
				var code2 = memTblGetTableValue(map,"NATIONAL-CODE",value);

				if (!value) {                    
                	value = ("UNIQUE-NATID").concat (nchcodeIcc);
					logger.info("unique national id " + value);
					code2 = memTblGetTableValue(map,"NATIONAL-CODE",value);
                    ibanIcc = "N";
                }
				
				iccCnty = memTblGetTableValue(map,"FRANCE-RELATED",value);
				logger.info("Icc country= " + iccCnty);
				
				if((value) && (isPatternPresent(iccCnty, "Y")) && (!(isPatternPresent(value,"|")))) {
					logger.info("checking for icc and icc country.");
					iccflag = "Y";

					if (isPatternPresent(ibanIcc,"N")) { 
                   		value = value.concat("|").concat(nchcode1);
                		logger.info("concating iso country code and unique national id = " + value);
                        setHeader(map, "IBAN_NCH", "N");
                        nchcode = nchcode1;
                	}
                	else {
                        value = value.concat("|").concat(nchcodeIcc);
                        nchcode = nchcodeIcc;
                	}
					
					errorVal = "7031";

					if (errorDscn == "ERROR") {
 						setHeader(map, "PLCN_ibanBicConsistent",true);
						setHeader(map,"TransErrorflag","T");                     
                        setHeader(map,"TransErrorcode",errorVal);                     
                       	var value1 = "P00-1:A00:00".concat(errorVal);
                       	setHeader(map,"TechErrcomments",value1);
						gvComments = gvComments.concat ("P00-1:A00:00-").concat(errorVal);
                        comments = ("P00-1:A00:00-").concat (errorVal);      
					     comments1 = getHeader(map,"comments");

						if (comments1) {                         
                        	logger.info("Comments= " + comments1);
                        	comments = (comments).concat (":").concat (comments1);
                            comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
                          //  setHeader(map, "comments", comments);
						
                        }
                        else { 
                           	logger.info("Comments= " + comments);
							setHeader(map, "comments", comments);
                        	
                        }	
						return errorVal;
					}
					
					comments = comments.concat (":P00-1:A00:00-").concat (errorVal);
                    comments = removePattern(comments, (strStr (comments, ":A00:"))).concat((strStr (comments, ":A00:")));
					comments1 = getHeader(map,"comments");

					 if (comments1) {                       
                       		logger.info("Comments= " + comments1);
                       		comments = comments.concat (":").concat (comments1);
                            comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
                            setHeader(map, "comments", comments);			
                       	} 
                       	else {                       	
                       		logger.info("Comments= " + comments);
							setHeader(map, "comments", comments);		
                       	}
					
						gvComments = gvComments.concat (":P00-1:A00:00-").concat (errorVal);                      
                       	retVal = setCommentsForTransaction("","00-7031",map);
                        gvComments = ((removePattern (gvComments,(strStr (gvComments, ":A00:")))).concat (strStr (gvComments,":A00:")));
				}
			}
		}	
			
		if (nchcode) { 

			if ((isPatternPresent(uniqueNchflag,"Y")) && (!iccflag) && (isPatternPresent(frchCntyFlag,"Y"))) { 			
				setHeader(map, "IBAN_NCH", "N");				
			}

			isAllApha1 (nchcode,cntycode);
			var value3 = cntycode.concat("|").concat(nchcode);
			var bicCode = memTblGetTableValue(map,"BIC-NCH-TABLE",value3);
			bic = bicCode
			setHeader(map, "NCH_DERIVED", nchcode);
			
			if (bic) {            	
           		if (!(isPatternPresent(bic,"|"))) {            		
					setHeader(map, "IBAN_BIC", "Y");           			
           		}
           		else {           		
					setHeader(map, "IBAN_BIC", "Y");        			
           		}
           	return bic;
           	} 
           	else {           	
				setHeader(map, "IBAN_BIC", "N");           		
           	}
		}
					
	}
	 
  return "";
}

function ddbicFromNch2(cntycode, nchcode, exchange){
	var flag;
	var advflag;
	var runEnv;
	var seccode;
	var bic;
	var busiElement;
	var nchcode1;
	var value;
	var fld;
	var bicDToA;
	var bicNch;
	var tmpBicDToA;
	var tmpBicNch;
	var bbanNch;
	var len;
	var char;
	var bicField;
	var tmpBicField;
	var frchCntyFlag;
	var icc;
	var nchcodeIcc;
	var uniqueNchflag;
	var iccflag;
	var iccCnty;
	var ibanIcc;
	var cntryXt;
	var msgClass;
	var viocode;
	var errorVal;
	var errorDscn;
	var mode;
	var comments;
	var comments1;
	var retVal=0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	flag = "Y";
	
    logger.info("In DD BIC from NCH3 rule called.");
	errorDscn = memTblGetTableValue(map,"FLAG-TABLE","TA_ERROR_WARNING_DSCN");
	logger.info("ddbicFromNch3:errorDscn = " + errorDscn);
	
	if (isPatternPresent(mode,"REPAIR")) { 	
		errorDscn = memTblGetTableValue(map,"FLAG-TABLE","MANUAL_ERROR_WARNING_DSCN");
	}	
	
	if (flag !== "N") { 	
		nchcodeIcc = nchcode;		
		frchCntyFlag = memTblGetTableValue(map,"FRANCE-RELATED", cntycode);

		if(nchcode) {		
			logger.info("nch value= " + nchcode);
			value = cntycode.concat("|").concat(nchcode);
			logger.info("ddbicFromNch3:value = " + value);
			var code = memTblGetTableValue(map,"BIC-NCH-TABLE",value);
			code = code.trim();
			logger.info("ddbicFromNch3: code = " + code);
			setHeader(map,"ROUTING_BIC",code);

			if (!nchcode) { 		
				value = cntycode.concat("|").concat(nchcodeIcc);
				logger.info("if not NCH code then value= " + value);
				var code1 = memTblGetTableValue(map,"BIC-NCH-TABLE",value);
				logger.info("ddbicFromNch3: code1 = " + code1);
                uniqueNchflag = "Y";
               
                if (!(isPatternPresent(frchCntyFlag,"Y"))) {               
                	setHeader(map, "IBAN_NCH", "N");					
                }
			}
			
			if ((!nchcode) && (isPatternPresent(frchCntyFlag,"Y"))) { 
				logger.info("checking National code");
				value = ("NATIDCODE ").concat(nchcodeIcc);
				var code2 = memTblGetTableValue(map,"NATIONAL-CODE",value);

				if (!value) { 
                	value = ("UNIQUE-NATID").concat (nchcodeIcc);
					logger.info("unique national id " + value);
					code2 = memTblGetTableValue(map,"NATIONAL-CODE",value);
                    ibanIcc = "N";
                }
				
				iccCnty = memTblGetTableValue(map,"FRANCE-RELATED",value);
				logger.info("Icc country= " + iccCnty);
				
				if((value) && (isPatternPresent(iccCnty, "Y")) && (!(isPatternPresent(value,"|")))) {				
					logger.info("checking for icc and icc country.");
					iccflag = "Y";

					if (isPatternPresent(ibanIcc,"N")) {          	
                		value = value.concat("|").concat(nchcode1);
                		logger.info("concating iso country code and unique national id = " + value);
                        setHeader(map, "IBAN_NCH", "N");
                        nchcode = nchcode1;
                	}
                	else {
                	    value = value.concat("|").concat(nchcodeIcc);
                        nchcode = nchcodeIcc;
                	}
					
					errorVal = "7031";
					
					if (errorDscn == "ERROR") {
						setHeader(map, "PLCN_ibanBicConsistent" , true);	
						setHeader(map,"TransErrorflag","T");                     
                        setHeader(map,"TransErrorcode",errorVal);                     
                       	var value1 = "P00-1:A00:00".concat(errorVal);
                       	setHeader(map,"TechErrcomments",value1);
						gvComments = gvComments.concat ("P00-1:A00:00-").concat(errorVal);
                        comments = ("P00-1:A00:00-").concat (errorVal);      
					     comments1 = getHeader(map,"comments");

						if (comments1) {
                           	logger.info("Comments= " + comments1);
                        	comments = (comments).concat (":").concat (comments1);
                            comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
                          //  setHeader(map, "comments", comments);						
                        }
                        else {                         
                        	logger.info("Comments= " + comments);
							setHeader(map, "comments", comments);	
                        }	
					return errorVal;
					}
					
					comments = comments.concat (":P00-1:A00:00-").concat (errorVal);
                    comments = removePattern(comments, (strStr (comments, ":A00:"))).concat((strStr (comments, ":A00:")));                  
					comments1 = getHeader(map,"comments");

					 if (comments1) {                        	
                       		logger.info("Comments= " + comments1);
                       		comments = comments.concat (":").concat (comments1);
                            comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
                            //setHeader(map, "comments", comments);							
                       	} 
                       	else { 
                       		logger.info("Comments= " + comments);
							setHeader(map, "comments", comments);
                       		
                       	}
					
						gvComments = gvComments.concat (":P00-1:A00:00-").concat (errorVal);                      
                       	retVal = setCommentsForTransaction("","00-7031",map);
                        gvComments = ((removePattern (gvComments,(strStr (gvComments, ":A00:")))).concat (strStr (gvComments,":A00:")));
				}
			}
		}	
			
		if (nchcode) { 
		
			if ((isPatternPresent(uniqueNchflag,"Y")) && (!iccflag) && (isPatternPresent(frchCntyFlag,"Y"))) { 			
				setHeader(map, "IBAN_NCH", "N");				
			}

			isAllApha1 (nchcode,cntycode);
			var value3 = cntycode.concat("|").concat(nchcode);
			var bicCode = memTblGetTableValue(map,"BIC-NCH-TABLE",value3);
			bic = bicCode
			setHeader(map, "NCH_DERIVED", nchcode);
			
			if (bic) { 
           	
           		if (!(isPatternPresent(bic,"|"))) { 
           		setHeader(map, "IBAN_BIC", "Y");		
           		}
           		else {           		
					setHeader(map, "IBAN_BIC", "Y");           			
           		}
           	return bic;
           	} 
           	else {           	
				setHeader(map, "IBAN_BIC", "N");           		
           	}
		}
					
	}	 
  return "";
}

function ddbicFrombic4Swf2(cntycode,bic4, exchange) {
	var flag;
	var advflag;
	var runEnv;
	var seccode;
	var bic;
	var busiElement;
	var bic4One;
	var value;
	var fld;
	var bicDToA;
	var bicNch;
	var tmpBicDToA;
	var tmpBicNch;
	var bBanNch;
	var len;
	var char;
	var bicField;
	var tmpbicField;
	var frchCntyFlag;
	var icc;
	var bic4Icc;
	var uniqueNchflag;
	var iccflag;
	var iccCnty;
	var ibanIcc;
	var cntryXt;
	var msgClass;
	var viocode;
	var errorVal;
	var errorDscn;
	var mode;
	var comments;
	var comments1;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In DD BIC From BIC4 SWF2.");

	flag = "Y";
	
	errorDscn = memTblGetTableValue(map,"FLAG-TABLE","TA_ERROR_WARNING_DSCN");
	logger.info("ddbicFrombic4Swf2:ErrodDscn = " + errorDscn);

	if (isPatternPresent(mode,"REPAIR")) { 		
		logger.info("In DD BIC from BIC4 REPAIR MODE.");
		errorDscn = memTblGetTableValue(map,"FLAG-TABLE","MANUAL_ERROR_WARNING_DSCN");			
	}

	if (!(isPatternPresent(flag ,"N"))) {		
		bic4Icc = bic4;
        frchCntyFlag = memTblGetTableValue(map,"FRANCE-RELATED", "countrycode");
		logger.info("French country = " + frchCntyFlag);

		if (bic4) { 					
			value = cntycode.concat("|").concat(bic4);
			logger.info("value after concatinating Iso country code and bic4= " + value);
			bic = memTblGetTableValue(map,"BIC-CODES",value);
			bic = bic.trim();
			logger.info("ddbicFrombic4Swf2:Bic = " + bic);

			if (!bic && (isPatternPresent(frchCntyFlag,"Y"))) {
				value = cntycode.concat("|").concat (bic4Icc);
	           	icc = memTblGetTableValue(map,"BIC-CODES",value);
	           	logger.info("ddbicFrombic4Swf2:icc = " + icc);

	            if (!icc){     
	            	value = cntycode.concat("|").concat (bic4Icc);
	                icc = memTblGetTableValue(map,"BIC-CODES",value);
	                ibanIcc = "N";
	            } 

				iccCnty = memTblGetTableValue(map,"FRANCE-RELATED",icc);
				logger.info("ddbicFrombic4Swf2:iccCnty = " + iccCnty);

	            if ((icc) && (isPatternPresent(iccCnty,"Y")) && (!(isPatternPresent (icc,"|")))) {  
	            	iccflag = "Y";

	            	if (isPatternPresent(ibanIcc,"N")) { 
	             		value = icc.concat("|").concat(bic4One);
	             		setHeader(map, "IBAN_BIC", "N");
	                    bic4 = bic4One
	            	}else { 
	            	    value = icc.concat("|").concat(bic4Icc);
	                    bic4 = bic4Icc;
	            	}
	            	errorVal = "7031";

	            	if (isPatternPresent(errorDscn,"ERROR")) { 
							setHeader(map, "PLCN_ibanBicConsistent" , true);
	            		setHeader(map,"TransErrorflag","T");
	                   	var value1 = ("P00-1:A00:00-").concat(errorVal);
	                   	setHeader(map,"TechErrcomments",value1);
	                   	gvComments = (gvComments).concat ("P00-1:A00:00-").concat(errorVal);
	                    comments = ("P00-1:A00:00-").concat(errorVal);
						comments1 = getHeader(map,"comments");
						logger.info("ddbicFrombic4Swf2:comments1= " + comments1);

						if (comments1) { 
							logger.info("In comments1.");
							comments = (comments).concat(":").concat (comments1);
							comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
							logger.info("ddbicFrombic4Swf2: comments = " + comments);
							setHeader(map, "comments", comments);
						}else { 				
							logger.info("In comments.");
							setHeader(map, "comments", comments);
						}
	            	
	            	} 
	            	comments = (comments).concat (":P00-1:A00:00-").concat(errorVal);
					comments = removePattern (comments,(strStr (comments,":A00:"))).concat (strStr (comments,":A00:"));
					comments1=getHeader(map,"comments");

					if (comments1) { 
						comments = (comments).concat (":").concat(comments1);
						comments = replaceAllPattern (comments,":P00-1:A00:",":A00:");
						setHeader(map, "comments", comments);
					}else { 					
						setHeader(map, "comments", comments);
					}
					gvComments = (gvComments).concat (":P00-1:A00:00-").concat(errorVal);
	               	setCommentsForTransaction("","00-7031");
	                gvComments = ((removePattern (gvComments,(strStr (gvComments,":A00:")))).concat (strStr(gvComments,":A00:")));
	            }
			}

			if (bic4) { 			
				logger.info("ddbicFrombic4Swf2:bic4 = " + bic4);

				if ((isPatternPresent(uniqueNchflag,"Y")) && (!iccflag) && (isPatternPresent(frchCntyFlag,"Y"))) {
					setHeader(map, "IBAN_NCH", "N");
				}

				isAllApha1 (bic4,cntycode,map);
				var value3 = cntycode.concat("|").concat(bic4);
	    		bic = memTblGetTableValue(map,"BIC-CODES",value3);
	    		bic = bic.trim();
	    		setHeader(map, "NCH_DERIVED", bic4);
				logger.info("Bic code= " + bic);

	            if (bic) { 
	            
	            	if (!(isPatternPresent(bic,"|"))) { 
	    				setHeader(map, "IBAN_BIC", "Y");
	            	}else { 
	            		setHeader(map, "IBAN_BIC", "Y");
	            	}
	            	return bic;
	            }else { 
	    			setHeader(map, "IBAN_BIC", "N");
	            }
			} 	
		}
	}
	
	return "";
}

function checkIbanNchlength (countrycode,nchcode,nchcodelength,nchlengthMin,nchlengthMax,nchlengthLookup, exchange){
	var tmpstr;
    var nchValue;
    var fld;
    var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
		
	logger.info("In check Iban Nch length rule.");
    tmpstr = "IE|GB|MT|BG|MU";

    if (isPatternPresent (countrycode,tmpstr)) {     		
		logger.info("if pattern is present.");

    	if (((nchcodelength == (nchlengthMin - 4))||(nchcodelength > (nchlengthMin - 4))) && ((nchcodelength == (nchlengthMax - 4))||(nchcodelength < (nchlengthMax - 4)))) {     				
			logger.info("NCH lengths Chceks-4:");
    		nchValue = nchcode.substr(0,nchlengthLookup);
			logger.info("nch Value= " + nchValue);

    		if (nchValue) {  		
				logger.info(" if nchValue is present then.");
				logger.info("nch Value= " + nchValue);
				logger.info("country code= " + countrycode);

    			setHeader(map, "nchValue", nchValue);
				setHeader(map, "cntycode", countrycode);
				setHeader(map, "nchValue", nchValue);
				setHeader(map, "cntycode", countrycode);
				memTblSetTableValue(map,"","nchValue",nchValue);
				memTblSetTableValue(map,"","cntycode",countrycode);			
    		}
    	}else {
    		
	    		if (((nchcodelength == nchlengthMin) || (nchcodelength > nchlengthMin)) && ((nchcodelength == nchlengthMax)||(nchcodelength < nchlengthMax))) { 
	    			logger.info("checkIbanNchlength:Checking NCH length.");
	    			nchValue = nchcode.substr(0,nchlengthLookup);		
					logger.info("checkIbanNchlength:NCH Value= " + nchValue);

	    			if (nchValue) {    			    				
						logger.info(" if nchValue is present then.");
						logger.info("checkIbanNchlength:nch Value= " + nchValue);
						logger.info("checkIbanNchlength:country code= " + countrycode);
	    				
	    				setHeader(map, "nchValue", nchValue);
						setHeader(map, "cntycode", countrycode);
						
						memTblSetTableValue(map,"","nchValue",nchValue);
						memTblSetTableValue(map,"","cntycode",countrycode);
						setHeader(map,"PLCN_ibanBicConsistent",true);
	    			}
	    		}else {
					retVal = setCommentsForTransaction("56","8895",map);
					setHeader(map, "nchValue", "");
					setHeader(map, "cntycode", countrycode);
										
					memTblSetTableValue(map,"","nchValue",nchValue);
					memTblSetTableValue(map,"","cntycode",countrycode);
	    	    }
        	}
	}else {		
			logger.info("checkIbanNchlength:if condition fails then else condition executes.");

	    	if (((nchcodelength == nchlengthMin) || (nchcodelength > nchlengthMin)) && ((nchcodelength == nchlengthMax)||(nchcodelength < nchlengthMax))) { 				
				logger.info("checkIbanNchlength:NCH length check");
	    		nchValue = nchcode.substr(0,nchlengthLookup);
	    		logger.info("checkIbanNchlength:nchValue = " + nchValue);

	    		if (nchValue) { 
	   				setHeader(map, "nchValue", nchValue);
					setHeader(map, "cntycode", countrycode);						
	   			}
	    		else {
	    			logger.info("setCommentsForTransaction rule called.");
	    			retVal = setCommentsForTransaction("56","8895",map);
					setHeader(map, "nchValue", "");
					setHeader(map, "cntycode", countrycode);			
	    		}
    		}	
    }
    	return retVal;
}

function checkNchlength(countrycode,nchcode,nchcodelength,nchlengthMin,nchlengthMax,nchlengthlookup, exchange){

	var tmpstr;
    var nchValue;
    var fld;
    var retVal = 0;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
		
    logger.info(" In Check NCH length Rule Called.");
    
    tmpstr = "IE|GB|MT|BG|MU";

    if(isPatternPresent (tmpstr,countrycode)) {  		
        logger.info("checkNchlength:pattern match found.");

    	if(((nchcodelength == (nchlengthMin - 4)) || (nchcodelength > (nchlengthMin - 4))) && ((nchcodelength == (nchlengthMax - 4))||(nchcodelength < (nchlengthMax - 4)))) {    				
            logger.info("checkNchlength:Minimum NCH code length.");
    		nchValue = nchcode.substr(0,nchlengthlookup);
    		logger.info("checkNchlength:NCH value= " + nchValue);
            logger.info("checkNchlength:country code= " + countrycode);

            if(nchValue) {   						
                logger.info("checkNchlength:NCH value found.");
				setHeader(map,"uniqueNchValue",nchValue);
                setHeader(map,"uniqueCntycode",countrycode);                                        
    		}
    	}else {
    	
    		if(((nchcodelength == nchlengthMin) || (nchcodelength > nchlengthMin)) && ((nchcodelength == nchlengthMax)||(nchcodelength < nchlengthMax))) { 
    			tmpstr = "IE|GB|MT";

    			if((isPatternPresent (tmpstr,countrycode))) {    			
    				nchValue = nchcode.substr(4,nchlengthlookup);
    				logger.info("checkNchlength:nchValue = " + nchValue);
    			}
                else {   
                    nchValue = nchcode.substr(0,nchlengthlookup);
                 	logger.info("checkNchlength:nchValue = " + nchValue);   
                }
                if (nchValue) {                
                    setHeader(map,"uniqueNchValue",nchValue);
	                setHeader(map,"uniqueCntycode",countrycode);          				
                }
            }else {	
               retVal = setCommentsForTransaction("56","8895",map);
    		   setHeader(map,"uniqueNchValue","");
               setHeader(map,"uniqueCntycode","");             
            }
    	}
    }else {
    
    	if(((nchcodelength == nchlengthMin) || (nchcodelength > nchlengthMin)) && ((nchcodelength == nchlengthMax)||(nchcodelength < nchlengthMax))) { 
    	
    		if(isPatternPresent(countrycode,"TR")) {     		
                nchValue = nchcode.substr(1,nchlengthlookup);
                logger.info("checkNchlength:nchValue = " + nchValue);
   			}else {    		
                tmpstr = "IE|GB|MT";

                if (isPatternPresent(tmpstr,countrycode)) { 
                    nchValue = nchcode.substr(4,nchlengthlookup);
                    logger.info("checkNchlength:nchValue = " + nchValue);
                }else {             
                    nchValue = nchcode.substr(0,nchlengthlookup);
                    logger.info("checkNchlength:nchValue = " + nchValue);
                }
    		}
            if(nchValue) {                           
                setHeader(map,"UniqueNchValue",nchValue);               
                setHeader(map,"UniqueCntycode",countrycode);                               
            }
    	}else {                   
            retVal = setCommentsForTransaction("56","8895",map);
            setHeader(map,"UniqueNchValue","");        
            setHeader(map,"UniqueCntycode",countrycode);
        }	
    }
}

function isAllApha1(nchcode,cntycode, map){

	logger.info("In isAlpha rule.");
	var len;
    var char;
    var count;
    var orgNchcode;
    len = nchcode.length;
    orgNchcode = nchcode;

    if (isPatternPresent ("GI|LV|NL|RO",cntycode)) {     		
    	logger.info("if pattern exist.");

    	if (len == 4) {     	
    		while (len > 0) {
    			char = nchcode.substr(0,1);
    			if (isAlpha(char)) { 
    				nchcode = removePattern (nchcode,char);
    				len = len - 1;
    				count = count + 1;
    			} 
    		}
    		if (count == 4) {     			
				setHeader(map, "BIC4_CUM_NCH", nchcode);
    		}
    	}
    } 
}

function IsAlldigits(inputtxt) {

	var digits = /^[0-9]+$/;
	if (inputtxt.match(digits)) {
		return true;
	} else {
		return false;
	}		
}

function bicConcatAndComparison(derivedBic,checkReqd,bicCode,errorDscn,exchange) {
	var dbtrIban;
	var dbtrBic;
	var errorVal;
	var messageBic2;
	var routingBic;
	var errorflag;
	var messageType;
	var gvComments;

	logger.info("In bicConcatAndComparison Rule.");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
		
	routingBic = getHeader(map,"ROUTING_BIC");
	routingBic = routingBic.trim();
	logger.info("ROUTING_BIC= " + routingBic)
	derivedBic = routingBic;
		
	messageBic2 = bicCode; //getHeader(map,"RCVR_BIC");
	// messageBic2 = messageBic2.trim();
	logger.info("Message Bic = " + messageBic2);

	var ibanBicLen = derivedBic.length;
	ibanBicLen = parseInt(ibanBicLen);
	logger.info("bicConcatAndComparison:ibanBicLen = " + ibanBicLen);

	if (ibanBicLen == 8 ) { 	
		derivedBic = derivedBic.concat("XXX");
		logger.info("bicConcatAndComparison:derivedBic = " + derivedBic);
	}
		var ibanBicLen1 = bicCode.length;
		ibanBicLen1 = parseInt(ibanBicLen1);
		logger.info("bicConcatAndComparison:ibanBicLen1 = " + ibanBicLen1);

	if (ibanBicLen1 == 8) { 	
		bicCode = bicCode.concat("XXX");
		logger.info("bicConcatAndComparison:messageBic = " + bicCode);
	}

	if ((routingBic !== derivedBic)) {	
		var routingBicLen = routingBic.length;
		var messageBic2Len = derivedBic.length;

		if ((routingBicLen) > (messageBic2Len)) { 		
			routingBic = routingBic.substr(0,7);
		}

		if ((routingBicLen) < (messageBic2Len)) { 		
			routingBic = routingBic.concat("XXX");
			logger.info("bicConcatAndComparison:routingBic = " + routingBic);
		 	setHeader(map,"BIC_CODE",routingBic);
		}

	}

	if (derivedBic == bicCode) { 	
		 errorflag = "F";
		 setHeader(map,"PLCN_ibanBicConsistent",true);
	}else {	
		errorflag = "T";
		setHeader(map,"PLCN_ibanBicConsistent",false);
		if ((errorflag == "T") && (checkReqd == "Y")) {		
			errorVal == "8053";

			if (errorDscn == "ERROR") { 						
				messageType = getHeader(map,"messageType");
				logger.info("messageType= " + messageType);

				if ((messageType != "pacs008.001.02") || (messageType != "pacs009.001.02") || (messageType != "cbprpacs008.001.02") || (messageType != "pacs004.001.09")) { 				
					setHeader(map,"TransErrorflag","T");
	                setHeader(map,"TransErrorcode",errorVal);
	        		var value1 = ("P00-1:A00:00-").concat(errorVal);
					setHeader(map,"TechErrComments",value1);
				}
				gvComments = (":A00:00-").concat(errorVal);
	            setCommentsForTransaction ("","00-8053");
	            return errorVal;
			}

			gvComments = gvComments.concat(":P00-1:A00:00-").concat(errorVal);
			logger.info("bicConcatAndComparison:setCommentsForTransaction rule called.");
	        setCommentsForTransaction ("","00-8053");
	        gvComments = removePattern (gvComments, strStr (gvComments, ":A00:")).concat(strStr (gvComments, ":A00:"));
	        logger.info("bicConcatAndComparison:GV comments = " + gvComments);
	   	}
	}
	return routingBic;
}

function isValid(ibancode) {
	var countrycode;
	var checkDigit;
	var bic4;
	var account;
	var account1;
	var str;
	var str1;
	var value;

	logger.info("In isValid rule.");

	countrycode = ibancode.substr(0,2);
	logger.info("country code = " + countrycode);

	checkDigit = ibancode.substr(2,2);
	logger.info("Check didgit = " + checkDigit);

	bic4 = ibancode.substr(4,4);
	logger.info("bic4 = " + bic4);

	account = ibancode.substr(8,ibancode.length-2-2);
	logger.info("Account = " + account);

	account1 = ibancode.substr(4,ibancode.length-2-2);
	logger.info("Account1 = " + account1);

	str = countrycode+checkDigit+bic4+account;
	logger.info("str = " + str);
	str1 = countrycode+checkDigit+account1;
	logger.info("str1 = " + str1);

	if((isPatternPresent(ibancode,str)) || (isPatternPresent(ibancode,str1))) {
		value = "Valid";
	}else {
		value = "Invalid";
	}
	logger.info("isValid: value = " + value);
	return value;
}
