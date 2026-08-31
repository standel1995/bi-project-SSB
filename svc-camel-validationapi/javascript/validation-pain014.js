/**
* This function calls externalCodelistValidationFedNowPain014 and FedNowValidationRulesPain014 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowPain014Mx(exchange) {
	logger.info("wrapperFedNowPain014Mx");
	var retVal;
	var commentsB2b;
	var Pain014ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowPain014Mx:In wrapperFedNowPain014Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	Pain014ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PAIN014_VALD_FLAG_MX");
	Pain014ValdFlagMx = Pain014ValdFlagMx.trim();
	logger.info("Pain014ValdFlagMx = " + Pain014ValdFlagMx);

	if(Pain014ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowPain014Mx: Calling FedNowValidationRulesPain014");
		retVal = FedNowValidationRulesPain014(Pain014ValdFlagMx, exchange);
		logger.info("wrapperFedNowPain014Mx: retVal from FedNowValidationRulesPain014 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPain014Mx: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPain014Mx: Calling externalCodelistValidationFedNowPain014");
		// 	retVal = externalCodelistValidationFedNowPain014(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationFedNowPain014 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPain014Mx: Calling ibanValidationFedNowPain014");
		// 	retVal = ibanValidationFedNowPain014(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowPain014Mx: txnComments from ibanValidationFedNowPain014 = " + txnComments);
		// }
	}

	if(Pain014ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowPain014Mx: Calling FedNowValidationRulesPain014");
		retVal = FedNowValidationRulesPain014(Pain014ValdFlagMx, exchange);
		logger.info("wrapperFedNowPain014Mx: retVal from FedNowValidationRulesPain014 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPain014Mx: txnComments = " + txnComments);

		// logger.info("wrapperFedNowPain014Mx: Calling externalCodelistValidationFedNowPain014");
		// retVal = externalCodelistValidationFedNowPain014(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationFedNowPain014 = " + txnComments);			
		

		// logger.info("wrapperFedNowPain014Mx: Calling ibanValidationFedNowPain014");
		// ibanValidationFedNowPain014(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowPain014Mx: txnComments from ibanValidationFedNowPain014 = " + txnComments);
	}
}


function FedNowValidationRulesPain014(Pain014ValdFlagMx, exchange){
	logger.info("FedNowValidationRulesPain014");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("Pain014ValdFlagMx value: "+ Pain014ValdFlagMx);
	if(Pain014ValdFlagMx == "ERROR") {

		//retVal = shaAndSharRulePacs2(Document, map);
		//if(retVal != 0) {
		// return retVal;
		//}



        try {
			retVal = FedNowMessageIdentificationRulePain014(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowRoutingNumberGuidelinePain014(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowStatusReasonInformationRulePain014(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowProprietaryReasonPain014(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowOriginalCreationDateTimeGuidelinePain014(exchange);
		} catch (e) { logger.info(e); }
	   try {
		   retVal = FedNowOriginalInstructionIdentificationGuidelinePain014(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = FedNowOriginalUETRGuidelinePain014(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = FedNowPreferredContactMethodRule1Pain014(exchange);
	   } catch (e) { logger.info(e); }

       try {
        retVal = FedNowGuaranteedPaymentGuidelinePain014(exchange);
    } catch (e) { logger.info(e); }

	   try {
		   retVal = FedNowPreferredContactMethodRule2Pain014(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = FedNowPreferredContactMethodRule3Pain014(exchange);
	   } catch (e) { logger.info(e); }
		try {
			retVal = FedNowCreationDateAndTimeRulePain014(exchange);
		  } catch (e) { logger.info(e); }
		//   try {
		// 	retVal = FedNowCodeReasonRulePain014(exchange);
	    // } catch (e) { logger.info(e); }
       try {
		   retVal = FedNowTransactionStatusCodeRulePain014(exchange);
	   } catch (e) { logger.info(e); } 

       try {
		retVal = FedNowOriginalEndToEndIdentificationGuidelinePain014(exchange);
	   } catch (e) { logger.info(e); } 
	   try {
		retVal = FedNowOriginalMessageIdentificationGuidelinePain014(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowOriginalMessageNameIdentificationGuidelinePain014(exchange);
		} catch (e) { logger.info(e); }

        try {
			retVal = fedNowCountrySubdivisonPain014(exchange);
		} catch (e) { logger.info(e); }
        try {
			retVal = FedNowOriginalCreationDateTimeRule1Pain014(exchange);
		} catch (e) { logger.info(e); }
        try {
			retVal = FedNowCodeReasonRulePain014(exchange);
		} catch (e) { logger.info(e); }
        try {
			retVal = FedNowCurrencyAndAmountRulePain014(exchange);
		} catch (e) { logger.info(e); }
        try {
			retVal = fedNowDateTimeRule1Pain014(exchange);
		} catch (e) { logger.info(e); }
        try {
			retVal = FedNowRejectStatusRule1Pin014(exchange);
		} catch (e) { logger.info(e); }

        try {
			retVal = FedNowOriginalPaymentInformationIdentificationGuidelinePain014(exchange);
		} catch (e) { logger.info(e); }

    }
	return retVal;
}






function FedNowMessageIdentificationRulePain014(exchange) {
	logger.info("<-- RULE --> fedNowMessageIdentificationRulePain014");
	var path;
	var value;
	var validFlag=true;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	
	path = "/Document/CdtrPmtActvtnReqStsRpt/GrpHdr/MsgId";
	value = getValueFromPath(Document, path);
	logger.info("----->fedNowMessageIdentificationRulePain014: MsgId value = " + value);
    logger.info("----->fedNowMessageIdentificationRulePain014: MsgId type of value = " + typeof value);


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

        //var sValue = value.toString();

        if( validatorRegex.test(value) ) 
        {
            var extDate = value.slice(0,8);
            logger.info("----->fedNowMessageIdentificationRulePain014: extDate value = " + extDate);
            retVal = fedNowDateFormatValidate(extDate, 'YYYYMMDD');

            if( retVal == 1)
            {
                validFlag = false;
            }
            //validFlag = true;
            logger.info("----->fedNowMessageIdentificationRulePain014: validFlag value = " + validFlag);
        }
		if(!validFlag) 
        {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("186", "738", map);
			retVal = 1;
		}

		//ibanUpper(exchange, path, value);		
	}
	return retVal;
}


//Pain014 Business message 
	
//creation date time rule
  // This is the calendar date and time in New York City (Eastern Time) when 
   //the message is created by the FedNow Service application. Time is in 24-hour 
   //clock format and includes the offset against the Coordinated Universal Time (UTC).

   function FedNowCreationDateAndTimeRulePain014(exchange) {
	var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("In FedNowCreationDateAndTimeRulePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/GrpHdr/CreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("creationDateAndTimeRule : Date" + date);
    logger.info("creationDateAndTimeRule : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
    } else {
        msgDate = date.toString();
    }
    // 20142-04-01 10.00 PM UTC/LOCAL TIME ZONE-SERVER TIME ZONE)
    // 20142-04-01 22.00 
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
            logger.info("In FedNowCreationDateAndTimeRulePain014: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("141", "8978", map);
        retVal = 1;
    }
    return retVal;

}

function fedNowCountrySubdivisonPain014(exchange) {

	logger.info("<-- RULE --> FedNowCountrySubdivisonPain014");
    var path;
    var countrySubDivisonName;
    var validflag;
    var retVal = 0;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlTxRef/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn";
    countrySubDivisonName = getValueFromPath(Document, path);
    logger.info("----->country: subdivision: " + countrySubDivisonName);

    if (countrySubDivisonName) 
    {
        var ctrySubdivison = "US-";
        var result = ctrySubdivison.concat(countrySubDivisonName)


        var xValue = memTblGetTableValue(map, "CountrySubDivisions", result);
        logger.info("----->CountrySubDivisions : " + xValue);

        if (xValue) {
            //The country subdivision should be provided in line with 
            //the ISO 3166-2 standard for countries and subdivisions, i.e.,
            // use of a two-character code to represent a
            // U.S. state (e.g., 'NY' for New York).
            // We require countries data and validate whether it 
            // following ISO 3166-2 standard
            validflag = true;
            logger.info("----->fedNowCountrySubdivisonPain014 passed");

        }
        else {

            logger.info("----->fedNowCountrySubdivisonPain014 failed");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("238", "1405", map);
            retVal = 1;
        }
    }
    else
    {
        validflag = true;
        logger.info("----->fedNowCountrySubdivisonPain014 passed");
    }


    return retVal;

}

//Message Identification
	
function FedNowOriginalMessageIdentificationGuidelinePain014(exchange) {
    logger.info("In FedNowOriginalMessageIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
    var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;
    if(validatorRegex.test(value) ){
        logger.info("FedNowOriginalMessageIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalMessageIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("189", "7986", map);
        retVal=1;
    }

    return retVal;

}	
//MessageNameIdentification
function FedNowOriginalMessageNameIdentificationGuidelinePain014(exchange) {
    logger.info("In FedNowOriginalMessageNameIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlGrpInfAndSts/OrgnlMsgNmId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalMessageNameIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalMessageNameIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("190", "7986", map);
        retVal=1;
    }

    return retVal;
}	
//CreationDatetime	
function FedNowOriginalCreationDateTimeGuidelinePain014(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("FedNowOriginalCreationDateTimeGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlGrpInfAndSts/OrgnlCreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("creationDateAndTimeRule : Date" + date);
    logger.info("creationDateAndTimeRule : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
    } else {
        msgDate = date.toString();
    }
    // 20142-04-01 10.00 PM UTC/LOCAL TIME ZONE-SERVER TIME ZONE)
    // 20142-04-01 22.00 
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
            logger.info("FedNowCreationDateAndTimeRulePain014: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("188", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("188", "8978", map);
        retVal = 1;
    }
    return retVal;

}

//CreationDatetime	
function FedNowOriginalCreationDateTimeRule1Pain014(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("FedNowOriginalCreationDateTimeRule1Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlGrpInfAndSts/OrgnlCreDtTm";
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
            logger.info("FedNowOriginalCreationDateTimeRule1Pain014: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("188", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("188", "8978", map);
        retVal = 1;
    }
    return retVal;

}
//InstructionIdentification
	
function FedNowOriginalInstructionIdentificationGuidelinePain014(exchange){ //DONE 28 //SWIFT VALIDATION FAIL
	logger.info("In FedNowOriginalInstructionIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlInstrId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalInstructionIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalInstructionIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("195", "7986", map);
        retVal=1;
    }

    return retVal;

}		
	
function FedNowOriginalEndToEndIdentificationGuidelinePain014(exchange) {
	logger.info("In FedNowOriginalEndToEndIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlEndToEndId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalEndToEndIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalEndToEndIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("194", "7986", map);
        retVal=1;
    }

    return retVal;
}


function FedNowOriginalUETRGuidelinePain014(exchange) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In FedNowUETRGuidelinePain014");
	path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlUETR";
	value = getValueFromPath(Document, path);
	logger.info("FedNowUETRGuidelinePain014: MsgId value = " + value);
    logger.info("FedNowUETRGuidelinePain014: MsgId type of value = " + typeof value);


	if(value) 
    {
		var match=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/g;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "FedNowUETRGuidelinePain014 is success");


            logger.info("FedNowUETRGuidelinePain014: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
		}	
	}
	return retVal;
}	


function FedNowTransactionStatusCodeRulePain014(exchange) {
	logger.info("FedNowTransactionStatusCodeRulePain014");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/TxSts';
	retVal = checkExternalCodelist(path, 'FEDNOW_TRANS_STATUS', Document, map);
    logger.info("FedNowTransactionStatusCodeRulePain014 passed " +retVal);
	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("269", "1556", map);
		retVal = 1;
	}
	return retVal;
}


function FedNowStatusReasonInformationRulePain014(exchange) {
	logger.info("In FedNowStatusReasonInformationRule1Pain014");
	var txStsPath;
	var txSts;
	var stsRsnInfPath;
	var stsRsnInf;
	var retVal;
	retVal = 0;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	txStsPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/TxSts";
	txSts = getValueFromPath(Document, txStsPath);
	logger.info("txSts: " + txSts);

	stsRsnInfPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf";
	stsRsnInf = getValueFromPath(Document, stsRsnInfPath);
	logger.info("stsRsnInf: " + stsRsnInf);

	if(txSts == "RJCT") {
		if(!stsRsnInf){
			setHeader(map, "PLCN_validMessage", false);
			logger.info(" Status Reason Information For messages rejected by the FedNow Service application.");
			retVal = setCommentsForTransaction("256", "7966", map);
			return retVal;			
		}

	}
	return retVal;
}



//Rule-14 
//May be used to provide the 9-digit routing number of 
//the financial institution originating the status reason.


function FedNowRoutingNumberGuidelinePain014(exchange){
	logger.info("In FedNowRoutingNumberGuidelinePain014");
    var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/Id/OrgId/Othr/Id";
	value = getValueFromPath(Document, path);
	
	
	if(value) 
    {
		var match= /^\d{9}$/;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "FedNowRoutingNumberGuidelinePain014 is success");
            logger.info("FedNowRoutingNumberGuidelinePain014: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
            logger.info( "FedNowRoutingNumberGuidelinePain014 is failed");
		}	
	}
	return retVal;
}
function FedNowPreferredContactMethodRule1Pain014(exchange){

    logger.info("In FedNowPreferredContactMethodRule1Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/EmailAdr";
    var value = getValueFromPath(Document, path);

    if (value) {

        logger.info("FedNowPreferredContactMethodRule1Pain014 : EmailId " + value);
        //TODO: EMAIL FORMAT NEED TO BE VERIFIED. 
        if (value) {
            logger.info("FedNowPreferredContactMethodRule1Pain014 passed " + value);
            validFlag = true;
        }
        else {
            logger.info("FedNowPreferredContactMethodRule1Pain014 failed " + value);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("261", "7986", map);
            retVal = 1;
        }
    }
    else
    {
        logger.info("FedNowPreferredContactMethodRule1Pain014 passed " + value);
        validFlag = true;
    }

    return retVal;
}
function FedNowPreferredContactMethodRule2Pain014(exchange){

    logger.info("In FedNowPreferredContactMethodRule2Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/MobNb";
    var value = getValueFromPath(Document, path);
   
    if ( value )
    {
        logger.info("FedNowPreferredContactMethodRule2Pain014 : MobileNo " +value);
        if(value){
            logger.info("FedNowPreferredContactMethodRule2Pain014 passed " +value);
            validflag = true;
        }
        else {
            logger.info("FedNowPreferredContactMethodRule2Pain014 failed " +value);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("262", "7986", map);
            retVal=1;
        }
    }
    else{
        logger.info("FedNowPreferredContactMethodRule2Pain014 passed " +value);
        validflag = true;
    }

    return retVal;
}
function FedNowPreferredContactMethodRule3Pain014(exchange){

    logger.info("In FedNowPreferredContactMethodRule3Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/PhneNb";
    var value = getValueFromPath(Document, path);

    if (value) {

        logger.info("FedNowPreferredContactMethodRule3Pain014 : phoneNo " + value);
        if (value) {
            logger.info("FedNowPreferredContactMethodRule3Pain014 passed " + value);
            validFlag = true;
        }
        else {
            logger.info("FedNowPreferredContactMethodRule3Pain014 failed " + value);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("264", "7986", map);
            retVal = 1;
        }
    } else {
        logger.info("FedNowPreferredContactMethodRule3Pain014 passed " + value);
        validFlag = true;
    }

    return retVal;
}
function FedNowCodeReasonRulePain014(exchange) {
	logger.info("inside FedNowCodeReasonRulePain014");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Rsn/Cd';
	retVal = checkExternalCodelist(path, 'ExternalStatusReason1Code', Document, map);

	if(!retVal) {
        validflag = true;
        logger.info( "FedNowCodeReasonRulePain014 is success");
	
	}
    else {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "FedNowCodeReasonRulePain014 is failure");
            retVal = setCommentsForTransaction("268", "5252", map);
            return retVal;
    } 
	return retVal;

}


//This element is present when a message is rejected by the FedNow Service application and contains
// the FedNow Service application rejection reason in coded form.

function FedNowProprietaryReasonPain014(exchange) {
	logger.info("In FedNowProprietaryReasonPain014");
	var txStsPath;
	var txSts;
	var retVal;
	retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    reasonCodePath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Rsn/Cd";    
	reasonCode = getValueFromPath(Document, reasonCodePath);
	logger.info("FedNowProprietaryReasonPain014: reasonCode = " + reasonCode);
    
	// txSts = getValueFromPath(Document, reasonCodePath);
	// logger.info("reasonCode: " + reasonCode);
	// if(reasonCode == "RJCT") {
	// 		setHeader(map, "PLCN_validMessage", false);
	// 		logger.info("If TransactionStatus/Code equals RJCT, then “Status Reason Information/Reason” is mandatory.");
	// 		retVal = setCommentsForTransaction("184", "7996", map);
	// 		return retVal;		
    
    txStsPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/TxSts";
	txSts = getValueFromPath(Document, txStsPath);
	logger.info("txSts: " + txSts);

	if(txSts == "RJCT") {
		if(!reasonCode){
			setHeader(map, "PLCN_validMessage", false);
			logger.info(" Status Reason Information For messages rejected by the FedNow Service application.");
			retVal = setCommentsForTransaction("268", "7966", map);
			// return retVal;			
		}

	}
	return retVal;
}

/*"""CurrencyAndAmountRule1"":
	For FedNow Service Release 1 currency must be 'USD' 
	and amount must be greater than zero.
*/

function FedNowCurrencyAndAmountRulePain014(exchange) {
	logger.info("<-- RULE --> fedNowCurrencyAndAmountRulePain014");
    var intrBkSttlmAmtPath;
	var intrBkSttlmAmt;
	var retVal = 0;
    var iintrbnksttlcurrPath;
    var intrbnksttlcurr;
	var validFlag;
	var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	iintrbnksttlcurrPath  = '/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/PmtCondSts/AccptdAmt/@Ccy';
    intrBkSttlmAmtPath    = '/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/PmtCondSts/AccptdAmt';
	intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
    intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);
	
    logger.info("----->intrBkSttlmAmt:" + intrBkSttlmAmt);
    logger.info("----->intrbnksttlcurr:" + intrbnksttlcurr);

    if (intrBkSttlmAmt && intrbnksttlcurr) {
        if (intrbnksttlcurr == "USD" && intrBkSttlmAmt > 0) {
            validFlag = true;
            logger.info("----->In fedNowCurrencyAndAmountRulePain014");
        }

        if (!validFlag) {
            logger.info("----->The codes USD only use for show the currency");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("253", "7951", map);
            return retVal;
        }
    }
    else
    {
        validFlag = true;
        logger.info("----->In fedNowCurrencyAndAmountRulePain014");
    }

	


	return retVal;

}

/*

"""CreationDateTimeRule"":
Must be date and time when the message is created by the FedNow Sender. 
Time must be in 24-hour clock format and either in Coordinated Universal Time (UTC) 
or in local time with offset against UTC."

*/


function fedNowDateTimeRule1Pain014(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("In fednowDateTimeRule1Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlTxRef/ReqdExctnDt/Dt";
    date = getValueFromPath(Document, path);
    logger.info("fednowDateTimeRule1Pain014 : Date" + date);
    logger.info("fednowDateTimeRule1Pain014 : Date" + date);

  
 
    if (date) 
    {

        if (typeof date === 'string') {
            msgDate = date;
        } else {
            msgDate = date.toString();
        }

        var regexForUtc =  /^\d{4}-\d{2}-\d{2}$/;
        if (regexForUtc.test(msgDate)) {
            validflag = true;
            logger.info("validflag :" + validflag);
            logger.info("Date and Time Rule is fine");
        } else {
            logger.info("fednowDateTimeRule1Pain014: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        validflag = true;
        logger.info("validflag :" + validflag);
        logger.info("Date and Time Rule is fine");
    }
    return retVal;

}



//If Transaction Status is 'RJCT', then Status Reason Information must be present.

function FedNowRejectStatusRule1Pin014(exchange) {

	logger.info("In FedNowRejectStatusRule1Pin014");
	var txStsPath;
	var txSts;
	var stsRsnInfPath;
	var stsRsnInf;
	var retVal;
	retVal = 0;
    var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	txStsPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/TxSts";
	txSts = getValueFromPath(Document, txStsPath);
	logger.info("txSts: " + txSts);

	stsRsnInfPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Rsn/Cd";
	stsRsnInf = getValueFromPath(Document, stsRsnInfPath);
	logger.info("stsRsnInf: " + stsRsnInf);

	if(txSts == "RJCT") {
		if(stsRsnInf){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("If If Transaction Status is 'RJCT', then Status Reason Information must be present.");
			retVal = setCommentsForTransaction("268", "7966", map);
			return retVal;			
		}

	}
	return retVal;

 }



 //Payment information Identification
	
function FedNowOriginalPaymentInformationIdentificationGuidelinePain014(exchange) {
    logger.info("In FedNowOriginalPaymentInformationIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/OrgnlPmtInfId";
    var value = getValueFromPath(Document, path);

    if (value) {

        var len = value.length;

        if (len <=35 ) {
            logger.info("FedNowOriginalPaymentInformationIdentificationGuidelinePain014 passed " + value);
            validflag = true;
        }
        else {
            logger.info("FedNowOriginalPaymentInformationIdentificationGuidelinePain014 failed " + value);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("322", "7986", map);
            retVal = 1;
        }
    }
    else
    {
        logger.info("FedNowOriginalPaymentInformationIdentificationGuidelinePain014 passed " + value);
        validflag = true;
    }
    return retVal;

}

function FedNowGuaranteedPaymentGuidelinePain014(exchange) {
    logger.info("In FedNowGuaranteedPaymentGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/PmtCondSts/GrntedPmt";
    var value = getValueFromPath(Document, path);
    value=value.toUpperCase();
    if(value == "TRUE" ){
        logger.info("FedNowGuaranteedPaymentGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowGuaranteedPaymentGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }
    return retVal;

    }
    
