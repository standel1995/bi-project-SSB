/**
* This function calls externalCodelistValidationFedNowPain014 and FedNowValidationRulesPain014 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowPain014Mx(exchange) {
	logger.info("wrapperFedNowPain014Mx");
	var retVal;
	var commentsB2b;
	var pain014ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowPain014Mx:In wrapperFedNowPain014Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	pain014ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PAIN014_VALD_FLAG_MX");
	pain014ValdFlagMx = pain014ValdFlagMx.trim();
	logger.info("pain014ValdFlagMx = " + pain014ValdFlagMx);

	if(pain014ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowPain014Mx: Calling FedNowValidationRulesPain014");
		retVal = fedNowValidationRulesPain014(pain014ValdFlagMx, exchange);
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

	if(pain014ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowPain014Mx: Calling FedNowValidationRulesPain014");
		retVal = fedNowValidationRulesPain014(pain014ValdFlagMx, exchange);
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


function fedNowValidationRulesPain014(pain014ValdFlagMx, exchange){
	logger.info("FedNowValidationRulesPain014");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("pain014ValdFlagMx value: "+ pain014ValdFlagMx);
	if(pain014ValdFlagMx == "ERROR") {

		//retVal = shaAndSharRulePacs2(Document, map);
		//if(retVal != 0) {
		// return retVal;
		//}



			retVal = fedNowMessageIdentificationRulePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
		
			retVal = fedNowRoutingNumberGuidelinePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
	
			retVal = fedNowStatusReasonInformationRulePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
	
			retVal = fedNowProprietaryReasonPain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
	
			retVal = fedNowOriginalCreationDateTimeGuidelinePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
		   retVal = fedNowOriginalInstructionIdentificationGuidelinePain014(exchange);
           if (retVal != 0) {
			return retVal;
		}
	 
		   retVal = fedNowOriginalUETRGuidelinePain014(exchange);
           if (retVal != 0) {
			return retVal;
		}
	 
		   retVal = fedNowPreferredContactMethodRule1Pain014(exchange);
           if (retVal != 0) {
			return retVal;
		}
	  
		   retVal = fedNowPreferredContactMethodRule2Pain014(exchange);
           if (retVal != 0) {
			return retVal;
		}
	 
		   retVal = fedNowPreferredContactMethodRule3Pain014(exchange);
           if (retVal != 0) {
			return retVal;
		}
	  
			retVal = fedNowCreationDateAndTimeRulePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
		//   try {
		// 	retVal = fedNowCodeReasonRulePain014(exchange);
	    // } catch (e) { logger.info(e); }
      
		   retVal = fedNowTransactionStatusCodeRulePain014(exchange);
           if (retVal != 0) {
			return retVal;
		}
	  

       
		retVal = fedNowOriginalEndToEndIdentificationGuidelinePain014(exchange);
        if (retVal != 0) {
			return retVal;
		}
	 
		retVal = fedNowOriginalMessageIdentificationGuidelinePain014(exchange);
        if (retVal != 0) {
			return retVal;
		}
		
			retVal = fedNowOriginalMessageNameIdentificationGuidelinePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
			retVal = fedNowCountrySubdivisonPain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
			retVal = fedNowOriginalCreationDateTimeRule1Pain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
			retVal = fedNowCodeReasonRulePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
			retVal = fedNowCurrencyAndAmountRulePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
	
			retVal = fedNowDateTimeRule1Pain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
			retVal = fedNowRejectStatusRule1Pin014(exchange);
            if (retVal != 0) {
                return retVal;
            }
		
			retVal = fedNowOriginalPaymentInformationIdentificationGuidelinePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }

           
          
            retVal =  fedNowGuaranteedPaymentGuidelinePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }
            retVal =   fedNowEarlyPaymentGuidelinePain014(exchange);
            if (retVal != 0) {
                return retVal;
            }

    }
	return retVal;
}




/**
* This function validates Message Identification Rule
* @param {exchange} Document - The message.
* 
*/

function fedNowMessageIdentificationRulePain014(exchange) {
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
/**
* This function validates Date format for Date
* @param {exchange} Document - The message.
* 
*/
function fedNowDateFormatValidate(inputDate, format) {
	// 0=VALID
	// 1=INVALID
	var retVal = 0;

	var extDateMoment = moment(inputDate, format);

	logger.info("----->fedNowDateFormatValidate: extDateMoment value = " + extDateMoment);

	if (!extDateMoment.isValid()) {
		logger.info("----->InValid Date");
		retVal = 1;
	}

	return retVal;
}

/* This function validates "CreationDateTimeRule" .
*  Must be date and time when the message is created by 
   the FedNow Sender. 
   
*  Time must be in 24-hour clock format and 
   either in Coordinated Universal Time (UTC) or 
    in local time with offset against UTC.

* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message otherwise returns 1
*/

   function fedNowCreationDateAndTimeRulePain014(exchange) {
	var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("In fedNowCreationDateAndTimeRulePain014 ")
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
            logger.info("In fedNowCreationDateAndTimeRulePain014: invalid");
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

/* This function validates "CountrySubDivision" is present or not in Document
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/
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

/* This function validates OriginalMessageIdentificationGuideline.
* It checks whether OrgnlMsgId is present or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message returns 1
*/
function fedNowOriginalMessageIdentificationGuidelinePain014(exchange) {
    logger.info("In fedNowOriginalMessageIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
    var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;
    if(validatorRegex.test(value) ){
        logger.info("fedNowOriginalMessageIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalMessageIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("189", "7986", map);
        retVal=1;
    }

    return retVal;

}	
/* This function validates OriginalMessageNameIdentificationGuideline.
* It checks whether OrgnlMsgId is present or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message returns 1
*/
function fedNowOriginalMessageNameIdentificationGuidelinePain014(exchange) {
    logger.info("In fedNowOriginalMessageNameIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlGrpInfAndSts/OrgnlMsgNmId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalMessageNameIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalMessageNameIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("190", "7986", map);
        retVal=1;
    }

    return retVal;
}	
/* This function validates OriginalCreationDateTimeGuideline
* It checks whether OrgnlCreDtTm is valid or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message returns 1
*/	
function fedNowOriginalCreationDateTimeGuidelinePain014(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("fedNowOriginalCreationDateTimeGuidelinePain014 ")
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
            logger.info("fedNowCreationDateAndTimeRulePain014: invalid");
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

/* This function validates OriginalCreationDateTimeRule1
* It checks whether OrgnlCreDtTm is valid or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message returns 1
*/	
function fedNowOriginalCreationDateTimeRule1Pain014(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("fedNowOriginalCreationDateTimeRule1Pain014 ")
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
            logger.info("fedNowOriginalCreationDateTimeRule1Pain014: invalid");
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
/* This function validates OriginalInstructionIdentificationGuideline
* It checks whether OrgnlInstrId is present or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message returns 1
*/
	
function fedNowOriginalInstructionIdentificationGuidelinePain014(exchange){ //DONE 28 //SWIFT VALIDATION FAIL
	logger.info("In fedNowOriginalInstructionIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlInstrId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalInstructionIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalInstructionIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("195", "7986", map);
        retVal=1;
    }

    return retVal;

}		
	/* This function validates OriginalEndToEndIdentificationGuideline.
* It checks whether OrgnlEndToEndId is present or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message returns 1
*/
function fedNowOriginalEndToEndIdentificationGuidelinePain014(exchange) {
	logger.info("In fedNowOriginalEndToEndIdentificationGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlEndToEndId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalEndToEndIdentificationGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalEndToEndIdentificationGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("194", "7986", map);
        retVal=1;
    }

    return retVal;
}
/* This function validates "UETRGuideline" checks whether UETR is present or not in Document
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

function fedNowOriginalUETRGuidelinePain014(exchange) {
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
/* This function validates TransactionStatusCodeRule
* It checks whether fednowTransactionStatus is present or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message returns 1
*/

function fedNowTransactionStatusCodeRulePain014(exchange) {
	logger.info("fedNowTransactionStatusCodeRulePain014");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/TxSts';
	retVal = checkExternalCodelist(path, 'FEDNOW_TRANS_STATUS', Document, map);
    logger.info("fedNowTransactionStatusCodeRulePain014 passed " +retVal);
	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("269", "1556", map);
		retVal = 1;
	}
	return retVal;
}
/* This function validates StatusReasonInformationRule
* It checks whether status is RJCT 
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message otherwise returns 1
*/

function fedNowStatusReasonInformationRulePain014(exchange) {
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



/* This function validates RoutingNumberGuideline
* It checks whether RoutingNumber is present or not.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message otherwise returns 1
*/


function fedNowRoutingNumberGuidelinePain014(exchange){
	logger.info("In fedNowRoutingNumberGuidelinePain014");
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
			logger.info( "fedNowRoutingNumberGuidelinePain014 is success");
            logger.info("fedNowRoutingNumberGuidelinePain014: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
            logger.info( "fedNowRoutingNumberGuidelinePain014 is failed");
		}	
	}
	return retVal;
}



/* This function validates PreferredContactMethodRule1.
* If Preferred Method to contact the Case Creator is Email, then Email Address must be present.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/
function fedNowPreferredContactMethodRule1Pain014(exchange) {

    logger.info("In fedNowPreferredContactMethodRule1Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    var prefInvcrContactMethodfPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/PrefrdMtd";
    var prefInvcrContactMethodValue = getValueFromPath(Document, prefInvcrContactMethodfPath);
    logger.info("PreferredContactMethodRule2Pain013 : prefInvcrContactMethodValue " + prefInvcrContactMethodValue);

      if (prefInvcrContactMethodValue) {

       if (prefInvcrContactMethodValue == "MAIL") {
    
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/EmailAdr";
    var pathvalue = getValueFromPath(Document, path);

        logger.info("fedNowPreferredContactMethodRule1Pain014 : EmailId " + pathvalue);
        //TODO: EMAIL FORMAT NEED TO BE VERIFIED. 
        if (pathvalue) {
            logger.info("fedNowPreferredContactMethodRule1Pain014 passed " + pathvalue);
            validFlag = true;
        }
        else {
            logger.info("fedNowPreferredContactMethodRule1Pain014 failed " + pathvalue);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("261", "7986", map);
            retVal = 1;
        }
    }
    }
    else
    {
        logger.info("fedNowPreferredContactMethodRule1Pain014 passed " + pathvalue);
        validFlag = true;
    }

    return retVal;
}
/* This function validates PreferredContactMethodRule2.
* If Preferred Method to contact the Case Creator is Mobile or Cell Phone, then Mobile Number must be present.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

function fedNowPreferredContactMethodRule2Pain014(exchange){

    logger.info("In fedNowPreferredContactMethodRule2Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    var prefInvcrContactMethodfPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/PrefrdMtd";
    var prefInvcrContactMethodValue = getValueFromPath(Document, prefInvcrContactMethodfPath);
    logger.info("PreferredContactMethodRule2Pain013 : prefInvcrContactMethodValue " + prefInvcrContactMethodValue);

      if (prefInvcrContactMethodValue) {

       if (prefInvcrContactMethodValue == "CELL") {
         var path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/MobNb";
          var pathvalue = getValueFromPath(Document, path);
   
        logger.info("fedNowPreferredContactMethodRule2Pain014 : MobileNo " +pathvalue);
        if(pathvalue){
            logger.info("fedNowPreferredContactMethodRule2Pain014 passed " +pathvalue);
            validflag = true;
        }
        else {
            logger.info("fedNowPreferredContactMethodRule2Pain014 failed " +pathvalue);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("262", "7986", map)
	    retVal=1;
	     }
	   }
}
    else
    {
        logger.info("fedNowPreferredContactMethodRule2Pain014 passed " +pathvalue);
        validflag = true;
    }

    return retVal;
}
/* This function validates PreferredContactMethodRule3.
* If Preferred Method to contact the Case Creator is Phone, then Phone Number must be present.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/
function fedNowPreferredContactMethodRule3Pain014(exchange)
{

    logger.info("In fedNowPreferredContactMethodRule3Pain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
       var prefInvcrContactMethodfPath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/PrefrdMtd";
    var prefInvcrContactMethodValue = getValueFromPath(Document, prefInvcrContactMethodfPath);
    logger.info("PreferredContactMethodRule2Pain013 : prefInvcrContactMethodValue " + prefInvcrContactMethodValue);

      if (prefInvcrContactMethodValue) 
    {

       if (prefInvcrContactMethodValue == "PHONE")
       
       {
             var path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/PhneNb";
             var pathvalue = getValueFromPath(Document, path);



        logger.info("fedNowPreferredContactMethodRule3Pain014 : phoneNo " + pathvalue);
        if (pathvalue) {
            logger.info("fedNowPreferredContactMethodRule3Pain014 passed " + pathvalue);
            validFlag = true;
        }
        else {
            logger.info("fedNowPreferredContactMethodRule3Pain014 failed " + pathvalue);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("264", "7986", map);
            retVal = 1;
        }
    }
    }
    else {
        logger.info("fedNowPreferredContactMethodRule3Pain014 passed " + pathvalue);
        validFlag = true;
    
    }

    return retVal;
}
/**
* This function validates "ExternalStatusReason1Code" from list of codes in hazelcast map by calling checkExternalCodelist function.
* @param {DOMTree} Document - The message.
* @param {HashMap} map - The header values.
* @returns {String} return 0 for valid message otherwise returns 1.
*/
function fedNowCodeReasonRulePain014(exchange) {
	logger.info("inside fedNowCodeReasonRulePain014");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Rsn/Cd';
	retVal = checkExternalCodelist(path, 'ExternalStatusReason1Code', Document, map);

	if(!retVal) {
        validflag = true;
        logger.info( "fedNowCodeReasonRulePain014 is success");
	
	}
    else {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "fedNowCodeReasonRulePain014 is failure");
            retVal = setCommentsForTransaction("268", "5252", map);
            return retVal;
    } 
	return retVal;

}


/* This function validates ProprietaryReasonGuideline
* It checks whether status is RJCT 
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message otherwise returns 1
*/

function fedNowProprietaryReasonPain014(exchange) {
	logger.info("In fedNowProprietaryReasonPain014");
	var txStsPath;
	var txSts;
	var retVal;
	retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    reasonCodePath = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/StsRsnInf/Rsn/Cd";    
	reasonCode = getValueFromPath(Document, reasonCodePath);
	logger.info("fedNowProprietaryReasonPain014: reasonCode = " + reasonCode);
    
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

/* This function validates CurrencyAndAmountRule .
* For FedNow Service Release 1 currency must be 'USD' and amount must be greater than zero.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

function fedNowCurrencyAndAmountRulePain014(exchange) {
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

/* This function validates "DateTimeRule" .
*  Must be date and time when the message is created by 
   the FedNow Sender. 
   
*  Time must be in 24-hour clock format and 
   either in Coordinated Universal Time (UTC) or 
    in local time with offset against UTC.

* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message otherwise returns 1
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

/* This function validates "RejectStatusRule1" .
* If Transaction Status is 'RJCT', then Status Reason Information must be present.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

//If Transaction Status is 'RJCT', then Status Reason Information must be present.

function fedNowRejectStatusRule1Pin014(exchange) {

	logger.info("In fedNowRejectStatusRule1Pin014");
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


/* This function validates "OriginalPaymentInformationIdentificationGuideline" .
*This should be the Payment Information Identification of the original request for payment message to which this request for payment response message relates.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/
 
	
function fedNowOriginalPaymentInformationIdentificationGuidelinePain014(exchange) {
    logger.info("In fedNowOriginalPaymentInformationIdentificationGuidelinePain014 ");
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
            logger.info("fedNowOriginalPaymentInformationIdentificationGuidelinePain014 passed " + value);
            validflag = true;
        }
        else {
            logger.info("fedNowOriginalPaymentInformationIdentificationGuidelinePain014 failed " + value);
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("322", "7986", map);
            retVal = 1;
        }
    }
    else
    {
        logger.info("fedNowOriginalPaymentInformationIdentificationGuidelinePain014 passed " + value);
        validflag = true;
    }
    return retVal;

}
/* This function validates "GuaranteedPaymentGuideline" .
*If set to 'True', then the Debtor Agent guarantees that a FedNow funds-transfer will be sent for the Accepted Amount on the date indicated in Original Transaction Reference / Requested Execution Date. If set to 'False', then the Debtor Agent does not guarantee that a FedNow Service funds-transfer will be sent for the Accepted Amount on the date indicated in Original Transaction Reference / Requested Execution Date.

* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/
function fedNowGuaranteedPaymentGuidelinePain014(exchange) {
    logger.info("In FedNowGuaranteedPaymentGuidelinePain014 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/PmtCondSts/GrntedPmt";
    var value = getValueFromPath(Document, path);
    value=value.toUpperCase();
    if(value == "TRUE" ){
        logger.info("FedNowGuaranteedPaymentGuidelinePain014 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("FedNowGuaranteedPaymentGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }
    return retVal;

    }
 /* This function validates "GuaranteedPaymentGuideline" .
*  If set to 'True', then the Debtor will instruct payment prior to the date indicated in Original Transaction Reference / Requested Execution Date. If set to 'False', then the Debtor will not instruct payment prior to the date indicated in Original Transaction Reference / Requested Execution Date.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

function fedNowEarlyPaymentGuidelinePain014(exchange) {
    logger.info("In FedNowEarlyPaymentGuidelinePain014 ");
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReqStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/PmtCondSts/EarlyPmt";
    var value = getValueFromPath(Document, path);
    value=value.toUpperCase();
    if(value =="TRUE"){
        logger.info("FedNowEarlyPaymentGuidelinePain014 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowEarlyPaymentGuidelinePain014 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }

    return retVal;

}
