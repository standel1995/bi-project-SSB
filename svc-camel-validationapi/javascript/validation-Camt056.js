/**
* This function calls externalCodelistValidationFedNowCamt056 and FedNowValidationRulesCamt056 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowCamt056Mx(exchange) {
	logger.info("wrapperFedNowCamt056Mx");
	var retVal;
	var commentsB2b;
	var camt056ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowCamt056Mx:In wrapperFedNowCamt056Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	camt056ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "CAMT056_VALD_FLAG_MX");
	camt056ValdFlagMx = camt056ValdFlagMx.trim();
	logger.info("camt056ValdFlagMx = " + camt056ValdFlagMx);

	if(camt056ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowCamt056Mx: Calling FedNowValidationRulesCamt056");
		retVal = FedNowValidationRulesCamt056(camt056ValdFlagMx, exchange);
		logger.info("wrapperFedNowCamt056Mx: retVal from FedNowValidationRulesCamt056 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowCamt056Mx: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowCamt056Mx: Calling externalCodelistValidationFedNowCamt056");
		// 	retVal = externalCodelistValidationFedNowCamt056(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationFedNowCamt056 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowCamt056Mx: Calling ibanValidationFedNowCamt056");
		// 	retVal = ibanValidationFedNowCamt056(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowCamt056Mx: txnComments from ibanValidationFedNowCamt056 = " + txnComments);
		// }
	}

	if(camt056ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowCamt056Mx: Calling FedNowValidationRulesCamt056");
		retVal = FedNowValidationRulesCamt056(camt056ValdFlagMx, exchange);
		logger.info("wrapperFedNowCamt056Mx: retVal from FedNowValidationRulesCamt056 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowCamt056Mx: txnComments = " + txnComments);

		// logger.info("wrapperFedNowCamt056Mx: Calling externalCodelistValidationFedNowCamt056");
		// retVal = externalCodelistValidationFedNowCamt056(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationFedNowCamt056 = " + txnComments);			
		

		// logger.info("wrapperFedNowCamt056Mx: Calling ibanValidationFedNowCamt056");
		// ibanValidationFedNowCamt056(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowCamt056Mx: txnComments from ibanValidationFedNowCamt056 = " + txnComments);
	}
}


function FedNowValidationRulesCamt056(camt056ValdFlagMx, exchange){
	logger.info("FedNowValidationRulesCamt056");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("camt056ValdFlagMx value: "+ camt056ValdFlagMx);
	if(camt056ValdFlagMx == "ERROR") {

		//retVal = shaAndSharRulePacs8(Document, map);
		//if(retVal != 0) {
		// return retVal;
		//}
		
			
		
			retVal =  fedNowOriginalCreationDateTimeRule1Camt056(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
			 	retVal = fedNowMessageIdentificationRuleCamt056(exchange);
                 if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowCurrencyAndAmountRuleCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowCreationDateAndTimeRuleCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowOriginalInterbankSettlementAmountGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowOriginalInterbankSettlementDateGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowOriginalMessageIdentificationGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
		
				retVal = fedNowOriginalMessageNameIdentificationGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowOriginalCreationDateTimeGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowOriginalTransactionIdentificationGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
				retVal = fedNowOriginalEndToEndIdentificationGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
				retVal =  fedNowOriginalInstructionIdentificationGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowRoutingNumberGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowCodeReasonGuidelineCamt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
			
				retVal = fedNowOriginalTransactionIdentificationRule1Camt056(exchange);
                if (retVal != 0) {
                    return retVal;
                }
                retVal = fedNowPreferredContactMethodRule1Camt056(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
			retVal = fedNowPreferredContactMethodRule2Camt056(exchange);
            if (retVal != 0) {
                return retVal;
            }
		  
			retVal = fedNowPreferredContactMethodRule3Camt056(exchange);
            if (retVal != 0) {
                return retVal;
            }
			
			
	}
	return retVal;
}



//Camt 056 Business validations


function fedNowMessageIdentificationRuleCamt056(exchange) {
	var path;
	var value;
	var validFlag=true;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In fedNowMessageIdentificationRuleCamt056");
	path = "/Document/FIToFIPmtCxlReq/Assgnmt/Id";
	value = getValueFromPath(Document, path);
	logger.info("fedNowMessageIdentificationRuleCamt056: MsgId value = " + value);
    logger.info("fedNowMessageIdentificationRuleCamt056: MsgId type of value = " + typeof value);


	if(value) 
    {
		// Logic to validate the MsgId
        // Must be unique for a given calendar day. 
        // 
        // Message Identification is a reference assigned by the sender of the message, 
        // and is composed of the Calendar Date (8 numerical characters, CCYYMMDD), 
        // the sender's FedNow Connection Party Identifier (9 alphanumerical characters), 
        // and a reference assigned by the sender (up to 18 characters permissible for a 
        // text element). 
        //
        // 1. Should be in the following foramt
        //     CCYYMMDD@@@@@@@@@##################
        //     CC : Century (2 number)
        //     YY : Year (2 number)
        //     MM : Month (2 number)
        //     DD : Day (2 number)
        //     @@ : FedNow Connection Party Identifier (9 alphanumerical characters)
        //     ## : a reference assigned by the sender (up to 18 characters permissible for a text element)

        // REGEX --> ^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$
        
        var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;

      

        if( validatorRegex.test(value) ) 
        {
            var extDate = value.slice(0,8);
            logger.info("fedNowMessageIdentificationRuleCamt056: extDate value = " + extDate);
            retVal = fedNowDateFormatValidate(extDate, 'YYYYMMDD');

            if( retVal == 1)
            {
                validFlag = false;
            }
            //validFlag = true;
            logger.info("fedNowMessageIdentificationRuleCamt056: validFlag value = " + validFlag);
        }
		if(!validFlag) 
        {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("410", "738", map);
			retVal = 1;
		}

		//ibanUpper(exchange, path, value);		
	}
	return retVal;
}

function fedNowDateFormatValidate(inputDate, format)
{
   var retVal = 0;
   
   var extDateMoment = moment(inputDate, format);

    logger.info("fedNowDateFormatValidate: extDateMoment value = " + extDateMoment);
    
   if( extDateMoment.isValid() )
   {
       retVal = 1;
   }

    return retVal;
}
function fedNowCreationDateAndTimeRuleCamt056(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("InfedNowCreationDateAndTimeRuleCamt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Assgnmt/CreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("creationDateAndTimeRule : Date" + date);
    logger.info("creationDateAndTimeRule : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
    } else {
        msgDate = date.toString();
    }
    // 2022-04-01 10.00 PM UTC/LOCAL TIME ZONE-SERVER TIME ZONE)
    // 2022-04-01 22.00 
    // Check for AM/PM in the date string 
    // if AM/PM is present it is not in 24 Hour Format
    // if not found then treat this string as valid

    if (msgDate) {
        var regexForUtc = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/g;
        if (regexForUtc.test(msgDate)) {
            validflag = true;
            logger.info("validflag :" + validflag);
            logger.info("Date and Time Rule is fine");
        } else {
            logger.info("fedNowCreationDateAndTimeRuleCamt056: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("131", "8978", map);
        retVal = 1;
    }
    return retVal;

}
function fedNowCurrencyAndAmountRuleCamt056(exchange) {
	logger.info("In fedNowCurrencyAndAmountRuleCamt056");
    var intrBkSttlmAmtPath;
	var intrBkSttlmAmt;
	var retVal = 0;
    var iintrbnksttlcurrPath;
    var intrbnksttlcurr;
	var validFlag;
	var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	iintrbnksttlcurrPath  = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt/@Ccy';
    intrBkSttlmAmtPath    = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt';
	intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
    intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);
	
    logger.info("intrBkSttlmAmt:" + intrBkSttlmAmt);
    logger.info("intrbnksttlcurr:" + intrbnksttlcurr);

	if (intrBkSttlmAmt && intrbnksttlcurr) 
	{
		if (intrbnksttlcurr == "USD" && intrBkSttlmAmt > 0) {
			validFlag = true;
			logger.info("In fedNowCurrencyAndAmountRuleCamt056 passed");
		}
	}

	if( !validFlag)
	{
		logger.info("The codes USD only use for show the currency");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("185", "7951", map);
		return retVal;
	}


	return retVal;

}
function fedNowPreferredContactMethodRule1Camt056(exchange){

    logger.info("In fedNowPreferredContactMethodRule1Camt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);


    var prefInvcrContactMethodfPath = "/Document/FIToFIPmtCxlReq/Case/Cretr/Pty/CtctDtls/PrefrdMtd";
    var prefInvcrContactMethodValue = getValueFromPath(Document, prefInvcrContactMethodfPath);
    logger.info("PreferredContactMethodRule1Camt056 : prefInvcrContactMethodValue " + prefInvcrContactMethodValue);

    if (prefInvcrContactMethodValue) {

        if (prefInvcrContactMethodValue == "MAIL") {
            path = "/Document/FIToFIPmtCxlReq/Case/Cretr/Pty/CtctDtls/EmailAdr";
            var pathValue = getValueFromPath(Document, path);


            logger.info("PreferredContactMethodRule1Camt056 : EmailId " +  pathValue);
            if (value) {
                logger.info("PreferredContactMethodRule1Camt056 EmailId passed " +  pathValue);
                validFlag = true;
            }
            else {
                logger.info("PreferredContactMethodRule1Camt056EmailId failed " +  pathValue);
                setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("138", "7998", map);
                retVal = 1;
            }
        }
        

        

    }
    else
    {
        logger.info("PreferredContactMethodRule1Camt056 passed :" + pathValue);
        validFlag = true;
    }

    return retVal;
}
function fedNowPreferredContactMethodRule2Camt056(exchange){

    logger.info("In fedNowPreferredContactMethodRule2Camt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Case/Cretr/Pty/CtctDtls/MobNb";
    var value = getValueFromPath(Document, path);
   
    logger.info("PreferredContactMethodRule2Camt056 : MobileNo " +value);
    if(!value){
        logger.info("PreferredContactMethodRule2Camt056 passed " +value);
        validflag = true;
    }
    else {
        logger.info("PreferredContactMethodRule2Camt056 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("139", "7998", map);
        retVal=1;
    }

    return retVal;
}
function fedNowPreferredContactMethodRule3Camt056(exchange){

    logger.info("In fedNowPreferredContactMethodRule3Camt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Case/Cretr/Pty/CtctDtls/PhneNb";
    var value = getValueFromPath(Document, path);
   
    logger.info("PreferredContactMethodRule3Camt056 : phoneNo " +value);
    if(!value){
        logger.info("PreferredContactMethodRule3Camt056 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("PreferredContactMethodRule3Camt056 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("141", "7998", map);
        retVal=1;
    }

    return retVal;
}
function fedNowOriginalTransactionIdentificationRule1Camt056(exchange){
    logger.info("In  fedNowOriginalTransactionIdentificationRule1Camt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var path;
    var path2;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxId";
    var transactionId = getValueFromPath(Document, path);

    logger.info("transactionId: "+ transactionId);
    path2 ="/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlUETR";
    var uetrValue = getValueFromPath(Document,path2)
    logger.info("UETR: "+uetrValue);
    if(transactionId || uetrValue ){
        logger.info("OriginalTransactionIdentificationRule1Camt056 passed ");
        validflag = true;
    }
    else {
        logger.info("OriginalTransactionIdentificationRule1Camt056 failed ");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("187", "7988", map);
        retVal=1;
    }

    return retVal;
}



function fedNowOriginalInterbankSettlementAmountGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalInterbankSettlementAmountGuidelineCamt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OrgnlIntrBkSttlmAmtCamt056 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("OrgnlIntrBkSttlmAmtCamt056 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("184", "7986", map);
        retVal=1;
    }

    return retVal;


}
function fedNowOriginalMessageIdentificationGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalMessageIdentificationGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
    var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;
    if(validatorRegex.test(value) ){
        logger.info("OriginalMessageIdentificationGuideline passed " +value);
        validFlag = true;
    }
    else {
        logger.info("OriginalMessageIdentificationGuideline failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("181", "7989", map);
        retVal=1;
    }

    return retVal;


}
function fedNowOriginalMessageNameIdentificationGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalMessageNameIdentificationGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalMessageNameIdentificationGuideline passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalMessageNameIdentificationGuideline failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("182", "7990", map);
        retVal=1;
    }

    return retVal;


}
function fedNowOriginalCreationDateTimeGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalCreationDateTimeGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlCreDtTm";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalCreationDateTimeGuideline passed " +value);
        validFlag = true;
    }
    else {
        logger.info("OriginalCreationDateTimeGuidelines failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("180", "7991", map);
        retVal=1;
    }

    return retVal;


}

function fedNowOriginalInstructionIdentificationGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalInstructionIdentificationGuidelineCamt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlInstrId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalInstructionIdentificationGuideline passed " +value);
        validFlag = true;
    }
    else {
        // logger.info("OriginalInstructionIdentificationGuideline failed " +value);
        // setHeader(map, "PLCN_validMessage", false);
        // retVal = setCommentsForTransaction("322", "7992", map);
        // retVal=1;
        logger.info("OriginalInstructionIdentificationGuideline passed " +value);
        validFlag = true;
    }

    return retVal;


}
function fedNowOriginalEndToEndIdentificationGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalEndToEndIdentificationGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlEndToEndId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalEndToEndIdentificationGuideline passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalEndToEndIdentificationGuideline failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("178", "7993", map);
        retVal=1;
    }

    return retVal;


}
function fedNowOriginalInterbankSettlementDateGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalInterbankSettlementDateGuidelineCamt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmDt";
    var value = getValueFromPath(Document, path);
   
    if(value){
        logger.info("OriginalInterbankSettlementDateGuidelineCamt056 passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalInterbankSettlementDateGuidelineCamt056 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("186", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowOriginalUETRGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalUETRGuidelineCamt056 ")
    var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In OriginalUETRGuidelineCamt056");
	path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlUETR";
	value = getValueFromPath(Document, path);
	logger.info("OriginalUETRGuidelineCamt056: MsgId value = " + value);
    logger.info("OriginalUETRGuidelineCamt056: MsgId type of value = " + typeof value);


	if(value) 
    {
		var match=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/g;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "OriginalUETRGuidelineCamt056 is success");


            logger.info("OriginalUETRGuidelineCamt056: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
		}	
	}
	return retVal;

}

function fedNowOriginalTransactionIdentificationGuidelineCamt056(exchange){
    logger.info("In fedNowOriginalTransactionIdentificationGuidelineCamt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    path="/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxId";
    var value=getValueFromPath(Document,path)
    if(!value){
        logger.info("OriginalTransactionIdentificationGuidelineCamt056 passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalTransactionIdentificationGuidelineCamt056 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("187", "7986", map);
        retVal=1;
    }

    return retVal;


}
function fedNowRoutingNumberGuidelineCamt056(exchange){

	var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	logger.info("In fedNowRoutingNumberGuidelineCamt056");
	path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Orgtr/Id/OrgId/Othr/Id";
	value = getValueFromPath(Document, path);
	
	
	if(value) 
    {
		var match= /^\d{9}$/;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "FedNowRoutingNumberGuidelineCamt056 is success");


            logger.info("FedNowRoutingNumberGuidelineCamt05: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
            logger.info( "FedNowRoutingNumberGuidelineCamt056 is failed");
		}	
	}
	return retVal;
}
function fedNowCodeReasonGuidelineCamt056(exchange) {
	logger.info("inside fedNowCodeReasonGuidelineCamt056");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Rsn/Cd';
	retVal = checkExternalCodelist(path, 'ExternalCancellationReasonCode', Document, map);
   
    
   
    if(retVal) {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "fedNowCodeReasonGuidelineCamt056 is failure");
            retVal = setCommentsForTransaction("177", "5252", map);
            retVal=1;
        
	}
    else {
        validflag = true;
        logger.info( "fedNowCodeReasonGuidelineCamt056 is success");
        logger.info("return value" +retVal);
    } 

	return retVal;
}
function fedNowOriginalCreationDateTimeRule1Camt056(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("In fedNowCreationDateAndTimeRuleCamt056 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlCreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("creationDateAndTimeRule : Date" + date);
    logger.info("creationDateAndTimeRule : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
    } else {
        msgDate = date.toString();
    }
    // 2022-04-01 10.00 PM UTC/LOCAL TIME ZONE-SERVER TIME ZONE)
    // 2022-04-01 22.00 
    // Check for AM/PM in the date string 
    // if AM/PM is present it is not in 24 Hour Format
    // if not found then treat this string as valid

    if (msgDate) {
        var regexForUtc = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/g;
        if (regexForUtc.test(msgDate)) {
            validflag = true;
            logger.info("validflag :" + validflag);
            logger.info("Date and Time Rule is fine");
        } else {
            logger.info("fedNowCreationDateAndTimeRuleCamt056: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("180", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("180", "8978", map);
        retVal = 1;
    }
    return retVal;

}