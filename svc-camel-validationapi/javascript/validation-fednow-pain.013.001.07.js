/**
* This function calls externalCodelistValidationFedNowPain013 and FedNowValidationRulesPain013 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowPain013Mx(exchange) {
	logger.info("wrapperFedNowPain013Mx");
	var retVal;
	var commentsB2b;
	var Pain013ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowPain013Mx:In wrapperFedNowPain013Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	Pain013ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PAIN013_VALD_FLAG_MX");
	Pain013ValdFlagMx = Pain013ValdFlagMx.trim();
	logger.info("Pain013ValdFlagMx = " + Pain013ValdFlagMx);

	if(Pain013ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowPain013Mx: Calling FedNowValidationRulesPain013");
		retVal = fedNowValidationRulesPain013(Pain013ValdFlagMx, exchange);
		logger.info("wrapperFedNowPain013Mx: retVal from FedNowValidationRulesPain013 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPain013Mx: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPain013Mx: Calling externalCodelistValidationFedNowPain013");
		// 	retVal = externalCodelistValidationFedNowPain013(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationFedNowPain013 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPain013Mx: Calling ibanValidationFedNowPain013");
		// 	retVal = ibanValidationFedNowPain013(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowPain013Mx: txnComments from ibanValidationFedNowPain013 = " + txnComments);
		// }
	}

	if(Pain013ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowPain013Mx: Calling FedNowValidationRulesPain013");
		retVal = fedNowValidationRulesPain013(Pain013ValdFlagMx, exchange);
		logger.info("wrapperFedNowPain013Mx: retVal from FedNowValidationRulesPain013 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPain013Mx: txnComments = " + txnComments);

		// logger.info("wrapperFedNowPain013Mx: Calling externalCodelistValidationFedNowPain013");
		// retVal = externalCodelistValidationFedNowPain013(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationFedNowPain013 = " + txnComments);			
		

		// logger.info("wrapperFedNowPain013Mx: Calling ibanValidationFedNowPain013");
		// ibanValidationFedNowPain013(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowPain013Mx: txnComments from ibanValidationFedNowPain013 = " + txnComments);
	}
}


function fedNowValidationRulesPain013(Pain013ValdFlagMx, exchange){
	logger.info("FedNowValidationRulesPain013");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("Pain013ValdFlagMx value: "+ Pain013ValdFlagMx);
	if(Pain013ValdFlagMx == "ERROR") {

		//retVal = shaAndSharRulePacs2(Document, map);
		//if(retVal != 0) {
		// return retVal;
		//}


        retVal = fedNowMessageIdentificationRulePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }

        retVal = fedNowCreationDateAndTimeRulePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowCountrySubdivisonPain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowRequestedExecutionDateTimeRule1Pain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowExpiryDateTimeRule1Pain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowExpiryDateRule1Pain013(exchange);
        if (retVal != 0) {
            return retVal;
        }

        /*	try {
                retVal = fedNowAccountIdentificationProxyGuidelinePain013(exchange);
            } catch (e) { logger.info(e); }  */

        retVal = fedNowAccountTypeGuidelinePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowProxyTypeGuidelinePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowRemittanceInformationRule1Pain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
       /* retVal = fedNowRemittanceInformationRule2Pain013(exchange);
        if (retVal != 0) {
            return retVal;
        }*/
        retVal = fedNowEndToEndIdentificationRule1Pain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowServiceLevelCodeGuidelinePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowLocalInstrumentRule1Pain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowCategoryPurposeRulePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowCurrencyAndAmountRulePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        retVal = fedNowPreferredContactMethodRulePain013(exchange);
        if (retVal != 0) {
            return retVal;
        }
        // retVal = fedNowPreferredContactMethodRule2Pain013(exchange);
        // if (retVal != 0) {
        //     return retVal;
        // }
        // retVal = fedNowPreferredContactMethodRule3Pain013(exchange);
        // if (retVal != 0) {
        //     return retVal;
        // }
    }
    return retVal;
}





function fedNowMessageIdentificationRulePain013(exchange) {
	logger.info(" MessageIdentificationRulePain013");
	var path;
	var value;
	var validFlag=true;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	
	path = "/Document/CdtrPmtActvtnReq/GrpHdr/MsgId";

	value = getValueFromPath(Document, path);
	logger.info("MessageIdentificationRulePain013: MsgId value = " + value);
    logger.info("MessageIdentificationRulePain013: MsgId type of value = " + typeof value);


	if(value) 
    {
        
        var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;

        //var sValue = value.toString();

        if( validatorRegex.test(value) ) 
        {
            var extDate = value.slice(0,8);
            logger.info("MessageIdentificationRulePain013: extDate value = " + extDate);
            retVal = DateFormatValidate(extDate, 'YYYYMMDD');

            if( retVal == 1)
            {
                validFlag = false;
            }
            //validFlag = true;
            logger.info("MessageIdentificationRulePain013: validFlag value = " + validFlag);
        }
		if(!validFlag) 
        {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("138", "738", map);
			retVal = 1;
		}
	}
	return retVal;
}


function DateFormatValidate(inputDate, format)
{
    // 0=VALID
    // 1=INVALID
   var retVal = 0;
   
   var extDateMoment = moment(inputDate, format);

    logger.info("----->DateFormatValidate: extDateMoment value = " + extDateMoment);
    
   if( !extDateMoment.isValid() )
   {
       logger.info("----->InValid Date");
       retVal = 1;
   }

    return retVal;
}

function fedNowCreationDateAndTimeRulePain013(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;
    logger.info(" CreationDateAndTimeRulePain013");
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReq/GrpHdr/CreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("CreationDateAndTimeRule : Date" + date);
    logger.info("CreationDateAndTimeRule : Date" + date);

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
            logger.info("CreationDateAndTimeRulePain013: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("117", "8978", map);
        retVal = 1;
    }
    return retVal;

}


// changes by sunny

function fedNowRequestedExecutionDateTimeRule1Pain013(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;
    logger.info("In fedNowRequestedExecutionDateTimeRule1Pain013");
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReq/PmtInf/ReqdExctnDt/DtTm";
	path1 ='/Document/CdtrPmtActvtnReq/PmtInf/ReqdExctnDt/Dt';
    date = getValueFromPath(Document, path);
	date1 = getValueFromPath(Document, path1);
    logger.info("fedNowRequestedExecutionDateTimeRule1Pain013 : Date" + date);
    logger.info("fedNowRequestedExecutionDateTimeRule1Pain013 : Date" + date1);

  /* if (typeof date === 'string') {
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
            logger.info("fedNowRequestedExecutionDateTimeRule1Pain013: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("410", "8978", map);
        retVal = 1;
    } */


	if(date || date1) {
		validflag = true;
		logger.info("validflag :" + validflag);
		logger.info("Date and Time Rule is fine");
	}else {
		logger.info("fedNowRequestedExecutionDateTimeRule1Pain013: invalid");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("655", "8144", map);
		retVal = 1;
	}

    return retVal;

}

function fedNowExpiryDateTimeRule1Pain013(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;
    logger.info(" fedNowExpiryDateTimeRule1Pain013");
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReq/PmtInf/XpryDt/DtTm";
	path1 = "/Document/CdtrPmtActvtnReq/PmtInf/XpryDt/Dt";
    date = getValueFromPath(Document, path);
	date1 = getValueFromPath(Document,path1);
    logger.info("fedNowExpiryDateTimeRule1Pain013 : Date" + date);
    logger.info("fedNowExpiryDateTimeRule1Pain013 : Date" + date1);

   /* if (typeof date === 'string') {
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
            logger.info("fedNowExpiryDateTimeRule1Pain013: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("410", "8978", map);
        retVal = 1;
    }
	*/

	if(date || date1) {
		validflag = true;
		logger.info("validflag :" + validflag);
		logger.info("Date and Time Rule is fine");
	}else {
		logger.info("fedNowRequestedExecutionDateTimeRule1Pain013: invalid");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("656", "8144", map);
		retVal = 1;
	}
    return retVal;

}


//The Expiry Date must not be more than 365 days out in the future from the day the RFP is sent.

function fedNowExpiryDateRule1Pain013(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;

    logger.info(" fedNowExpiryDateTimeRule1Pain013");
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReq/PmtInf/XpryDt/Dt";
	// path1 = "/Document/CdtrPmtActvtnReq/PmtInf/XpryDt/Dt";
    date = getValueFromPath(Document, path);
	// date1=getValueFromPath(Document,path1);
	path1= "/Document/CdtrPmtActvtnReq/GrpHdr/CreDtTm";
	date1 = getValueFromPath(Document,path1);
    logger.info("fedNowExpiryDateRule1Pain013 : Date" + date);
    logger.info("fedNowExpiryDateRule1Pain013 : Date" + date1);


	var crtDateMoment = moment(date1, moment.ISO_8601);
	var expDateMoment = moment(date, moment.ISO_8601);
    var newExpDateExpected= crtDateMoment.add(1,'years');
	var isValidExpriy = expDateMoment.isSameOrBefore(newExpDateExpected);

	if(isValidExpriy) {
		validflag = true;
		logger.info("fedNowExpiryDateRule1Pain013 passed");
	} else {
		logger.info("fedNowExpiryDateRule1Pain013: False");
    setHeader(map, "PLCN_validMessage", false);
    retVal = setCommentsForTransaction("656", "8144", map);
    retVal = 1;
	}
    
//     var expiry_date = new Date("2019-12-23");
//     var current_date = new Date();
//     var current_year = current_date.getFullYear();
//     var expiry_date_year = expiry_date.getFullYear();
//     var difference_in_years = current_year - expiry_date_year;


//     if( difference_in_years > 1){
//     logger.info("fedNowExpiryDateRule1Pain013: False");
//     setHeader(map, "PLCN_validMessage", false);
//     retVal = setCommentsForTransaction("410", "8144", map);
//     retVal = 1;
//     }

// else{
//     validflag = true;
//     logger.info("fedNowExpiryDateRule1Pain013 passed");

// }

    return retVal;

}

function fedNowCountrySubdivisonPain013(exchange) {

	logger.info("CountrySubdivisonPain013");
    var path;
    var countrySubDivisonName;
    var validflag;
    var retVal = 0;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/CdtrPmtActvtnReq/PmtInf/Dbtr/PstlAdr/CtrySubDvsn";
    countrySubDivisonName = getValueFromPath(Document, path);
    logger.info("----->country: subdivision: " + countrySubDivisonName);
     var ctrySubdivison="US-";
     var result=ctrySubdivison.concat(countrySubDivisonName)


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
        logger.info("CountrySubdivisonPain013 passed");
         
    }
    else {
        logger.info("CountrySubdivisonPain013 failed");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("612", "1405", map);
        retVal=1;
    }


    return retVal;

}


/*
function fedNowAccountIdentificationProxyGuidelinePain013(exchange) {

    logger.info("AccountIdentificationProxyGuidelinePain013");
    var dbtracct;
    var dbtracctPath;
    var retVal = 0;
    var validflag;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);
    dbtracctPath = '/Document/CdtrPmtActvtnReq/PmtInf/DbtrAcct/Prxy';

    dbtracct = getValueFromPath(Document, dbtracctPath);
    logger.info("AccountIdentificationProxyGuidelinePain013: dbtracct = " + dbtracct);
    // retVal = checkCodelist(path, 'ProxyAccountidentificationType1Code', Document, map);
    /* logger.info("Pac008testfile(Prxy)-V0.4.1: dbtracct = " + dbtracct);
 */
/*

    if(dbtracct == "PROXY"){
        validflag = true;
        
        logger.info( "AccountIdentificationProxyGuidelinePain013 is success");
    }
    else{
        logger.info( "AccountIdentificationProxyGuidelinePain013 is failed")
        logger.info("retVal: " +retVal)
    }
    return retVal;
}*/


function fedNowAccountTypeGuidelinePain013(exchange) {

    logger.info("AccountTypeGuidelinePain013");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
    var path;
    var retVal = 0;
	var cRetVal = 0;
	var dRetVal = 0;
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/CdtrAcct/Tp/Cd";
    cRetVal=  checkExternalCodelist(path, 'ExternalCashAccountType1Code', Document, map);

    
	if(cRetVal) {
        logger.info("AccountTypeGuidelinePain013:CdtrAcct Tp/Cd");
		setHeader(map, "PLCN_validMessage", false);
		cRetVal = setCommentsForTransaction("175", "7996", map);
		cRetVal = 1;
    }


	path = "/Document/CdtrPmtActvtnReq/PmtInf/DbtrAcct/Tp/Cd";
    dRetVal= checkExternalCodelist(path, 'ExternalCashAccountType1Code', Document, map);

    if(dRetVal) {
        logger.info("AccountTypeGuidelinePain013:DbtrAcct: tp/Cd");
		setHeader(map, "PLCN_validMessage", false);
		dRetVal = setCommentsForTransaction("628", "7996", map);
		dRetVal = 1;
    }

	if( cRetVal ==1 || dRetVal == 1)
	{
        logger.info("AccountTypeGuidelinePain013 is failed");
		retVal = 1;
	}
    else{
        logger.info("AccountTypeGuidelinePain013 is success");
  
    }

    return retVal;
}


function fedNowProxyTypeGuidelinePain013(exchange) {

	logger.info("ProxyTypeGuidelinePain013");
	//logger.info(" VALID -- > XSD Rule and XPATH mismatch");
	
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    var path;
    var retVal = 0;
	var cRetVal =0;
	var dRetVal =0;

    // path = "/Document/CdtrPmtActvtnReq/PmtInf/DbtrAcct/Prxy/Tp/Cd";
    // dRetVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

    // if (dRetVal) {
    //     logger.info("ProxyTypeGuidelinePain013:DbtrAcct-TP/CD");
    //     setHeader(map, "PLCN_validMessage", false);
    //     dRetVal = setCommentsForTransaction("148", "7984", map);
    //     dRetVal = 1;
    // }

    // path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/CdtrAcct/Prxy/Tp/Cd";
    // cRetVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);


    // if (cRetVal) {
    //     logger.info("ProxyTypeGuidelinePain013:tp/cd");
    //     setHeader(map, "PLCN_validMessage", false);
    //     cRetVal = setCommentsForTransaction("181", "7984", map);
    //     cRetVal = 1;
    // }

	// if( cRetVal==1 || dRetVal ==1 )
	// {
	// 	retVal = 1;
	// }

    return retVal;
}



function fedNowRemittanceInformationRule1Pain013(exchange) {
    logger.info("RemittanceInformationRule1Pain013");
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    var retVal = 0;
    var remPath;
    var relRemPath;

    relRemPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RltdRmtInf";
    var relRemPathValue = getValueFromPath(Document, relRemPath);
    remPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf";
    var remPathValue = getValueFromPath(Document, remPath);

    if (relRemPathValue && remPathValue) {
        logger.info("RemittanceInformationRule1Pain013 is failed");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("148", "7981", map);
        retVal = 1;
    } else if (relRemPathValue || !remPathValue) {
        logger.info("RemittanceInformationRule1Pain013 is passed");
        validflag = true;
        logger.info("relRemPathValue is " + relRemPathValue);
        return retVal;
    } else if (!relRemPathValue || remPathValue) {
        logger.info("RemittanceInformationRule1Pain013 is passed");
        validflag = true;
        logger.info("remPathValue is " + remPathValue);
        return retVal;
    } else {
        logger.info("RemittanceInformationRule1Pain013 is failed");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("214", "7981", map);
        retVal = 1;
    }


    return retVal;
}


/*function fedNowRemittanceInformationRule2Pain013(exchange) {

	//Unstructured and Structured remittance information must not be combined.
	logger.info("RemittanceInformationRule2Pain013");
    var  structuredPath ;
    var validflag;
    var retVal = 0;
    var  structuredPathValue;
    var  unStructuredPath;
    var   unStructuredPathValue;


    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    structuredPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd ";
   structuredPathValue = getValueFromPath(Document,structuredPath );
   unStructuredPath="/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Ustrd";
   unStructuredPathValue= getValueFromPath(Document,  unStructuredPath);

   

    if ((structuredPathValue && !unStructuredPathValue) || (!structuredPathValue && unStructuredPathValue)) {
		//validflag = false;
		validflag = true;
		logger.info("----->unStructuredPathValue is " + unStructuredPathValue);

	} else {
		if (unStructuredPath) {
			logger.info("----->fedNowRemittanceInformationRule2 failed");
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("512", "7987", map);
			return retVal = 1;
		} else {
		logger.info("----->fedNowRemittanceInformationRule2 passed");
		setHeader(map, "PLCN_validMessage", false);
        validflag = true;
		}

	}

   
    //RemittanceInformationRule2 :Unstructured and Structured 
    //remittance information must not be combined."//

    //Information supplied to enable the matching/reconciliation of an entry
    // with the items that the payment is intended to settle, 
    //such as commercial invoices in an accounts' receivable system, 
    // in an unstructured form.

    return retVal;
}
*/

function fedNowEndToEndIdentificationRule1Pain013(exchange) {
	logger.info("EndToEndIdentificationRule1Pain013");
    var path;
    var endToEnd;
    var retVal = 0;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/PmtId/EndToEndId";
    // var msgType = getHeaders(map,"PaymentType")
    endToEnd = getValueFromPath(Document, path);
   // logger.info("EndToEndIdentificationRule1Pain013: endToEnd" + endToEnd);

    if (!endToEnd) {
        logger.info("EndToEndIdentificationRule1Pain013: For no value")
        EndToEndId = "NOT PROVIDED"
        // path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/PmtId/EndToEndId";
        // setValueInPath(Document, path , EndToEndId);
        logger.info("Setting EndToEndIdentification as NOTPROVIDED" + EndToEndId);
        setHeader(map, "PLCN_endToEnd", EndToEndId);
    } else {
        logger.info("Setting EndToEndIdentification" + endToEnd);
        setHeader(map, "PLCN_endToEnd", endToEnd);
    }
    return retVal;
}



function fedNowServiceLevelCodeGuidelinePain013 (exchange) {
    logger.info("ServiceLevelCodeGuidelinePain013");
    var path;
    var retVal = 0;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();	
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = '/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/PmtTpInf/SvcLvl/Cd';
    retVal = checkExternalCodelist(path, 'ExternalServiceLevel1Code', Document, map);
    logger.info("retVal: " +retVal);

    if(retVal) {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "ServiceLevelCodeGuidelinePain013 is Failure ");
        retVal = setCommentsForTransaction("2", "5795", map);
        retVal = 1;
    } else {
        logger.info( "ServiceLevelCodeGuidelinePain013 is success");
        logger.info("retVal: " +retVal)

    }
    return retVal;	


}



function fedNowLocalInstrumentRule1Pain013(exchange) {
	logger.info("In LocalInstrumentRule1Pain013");
	var lclInstrm;
	var lclInstrmPath;
	var retVal = 0;
    var validflag;
    var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    lclInstrmPath = '/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/PmtTpInf/LclInstrm/Prtry';
	lclInstrm = getValueFromPath(Document, lclInstrmPath);
	logger.info("LocalInstrumentRule1Pain013: lclInstrm = " + lclInstrm);

	if(lclInstrm == "FDNA"){
		validflag = true;
		logger.info("PLCN_validMessage");
		logger.info( "LocalInstrumentRule1Pain013 is success");
    }
	else{
		setHeader(map, "PLCN_validMessage", false);
		logger.info( "LocalInstrumentRule1Pain013 is Failed");
		retVal = setCommentsForTransaction("211", "7984", map);
		retVal = 1;
	}
	
	return retVal;


}


function fedNowCategoryPurposeRulePain013 (exchange) {
	logger.info("CategoryPurposeRulePain013");
	var path;
	var value;
	var retVal = 0;
	var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/PmtTpInf/CtgyPurp/Prtry'
	value = getValueFromPath(Document, path);
    logger.info("value:" + value);
    // logger.info("prop:" + prop);

	if( value )
	{
		var uValue = value.toUpperCase();
		if(uValue == "CONS" || uValue == "BIZZ" || uValue == "GOVT" ) 
		{
			validflag = true;
			logger.info( "CategoryPurposeRulePain013 is success");
			
		} else {
			logger.info("CategoryPurposeRulePain013 is failure");
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("210", "8186", map);
			return retVal;
		}
	} else {
		setHeader(map, "PLCN_validMessage", false);
		logger.info( "CategoryPurposeRulePain013 is failure");
			retVal = setCommentsForTransaction("210", "8186", map);
			return retVal;
	}
	
	return retVal;


	
}



function fedNowCurrencyAndAmountRulePain013(exchange) {
	logger.info("CurrencyAndAmountRulePain013");
	var retVal = 0;
    var iintrbnksttlcurrPath;
	var intrBkSttlmAmtPath ;
    var intrbnksttlcurr;
	var intrBkSttlmAmtPath ;
	var validFlag;
	var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	// iintrbnksttlcurrPath  = '/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Amt/InstdAmt/@Ccy';
	// intrbnksttlcurr  = '/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Amt/InstdAmt';
    
	// intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);


	iintrbnksttlcurrPath  = '/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Amt/InstdAmt/@Ccy';
    intrBkSttlmAmtPath    = '/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Amt/InstdAmt';
	intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
    intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);
	
    logger.info("----->intrBkSttlmAmt:" + intrBkSttlmAmt);
    logger.info("----->intrbnksttlcurr:" + intrbnksttlcurr);

	if (intrBkSttlmAmt && intrbnksttlcurr) 
	{
		if (intrbnksttlcurr == "USD" && intrBkSttlmAmt > 0) {
			validFlag = true;
			logger.info("----->In CurrencyAndAmountRulePain013");
		}
	}

	if( !validFlag)
	{
		logger.info("The codes USD only use for show the currency");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("142", "7951", map);
		return retVal;
	}

	return retVal;

}

/*

PREFERED METHODS
-----------------
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/PrefrdMtd
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcee/CtctDtls/PrefrdMtd
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/PrefrdMtd
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/PrefrdMtd


VALUES 
-----------
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/PhneNb
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcee/CtctDtls/PhneNb
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/PhneNb
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/PhneNb

Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/MobNb
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcee/CtctDtls/MobNb
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/MobNb
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/MobNb


Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/EmailAdr
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcee/CtctDtls/EmailAdr
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/EmailAdr
Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/EmailAdr



*/
/* This function validates PreferredContactMethodRule1.
* If Preferred Method to contact the Case Creator is Email, then Email Address must be present.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

function fedNowPreferredContactMethodRulePain013(exchange){

    logger.info("In PreferredContactMethodRulePain013 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);


    var prefInvcrContactMethodfPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Cdtr/CtctDtls/PrefrdMtd";
    var prefInvcrContactMethodValue = getValueFromPath(Document, prefInvcrContactMethodfPath);
    logger.info("PreferredContactMethodRule1Pain013 : prefInvcrContactMethodValue " + prefInvcrContactMethodValue);

    if (prefInvcrContactMethodValue) {


        if (prefInvcrContactMethodValue == 'MAIL' || prefInvcrContactMethodValue == 'CELL' || prefInvcrContactMethodValue == 'PHON') {
            if (prefInvcrContactMethodValue == "MAIL") {
                var path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Cdtr/CtctDtls/EmailAdr";
                var pathValue = getValueFromPath(Document, path);
                logger.info("PreferredContactMethodRule1Pain013 : EmailId " + pathValue);
                if (pathValue) {
                    logger.info("PreferredContactMethodRule1Pain013 EmailId passed " + pathValue);
                    validFlag = true;
                }
                else {
                    logger.info("PreferredContactMethodRule1Pain013 EmailId failed " + pathValue);
                    setHeader(map, "PLCN_validMessage", false);
                    retVal = setCommentsForTransaction("146", "8199", map);
                    retVal = 1;
                }
            }
            else if (prefInvcrContactMethodValue == "CELL") {
                var path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Cdtr/CtctDtls/MobNb";
                var pathValue = getValueFromPath(Document, path);
                logger.info("PreferredContactMethodRule2Pain013 : CELL " + pathValue);
                if (pathValue) {
                    logger.info("PreferredContactMethodRule2Pain013 CELL passed " + pathValue);
                    validFlag = true;
                }
                else {
                    logger.info("PreferredContactMethodRule2Pain013 CELL failed " + pathValue);
                    setHeader(map, "PLCN_validMessage", false);
                    retVal = setCommentsForTransaction("147", "8199", map);
                    retVal = 1;
                }
            }
            else if (prefInvcrContactMethodValue == "PHON") {
                var path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/Cdtr/CtctDtls/PhneNb";
                var pathValue = getValueFromPath(Document, path);
                logger.info("PreferredContactMethodRule3Pain013 : phone " + pathValue);
                if (pathValue) {
                    logger.info("PreferredContactMethodRule3Pain013 phone passed " + pathValue);
                    validFlag = true;
                }
                else {
                    logger.info("PreferredContactMethodRule3Pain013 phone failed " + pathValue);
                    setHeader(map, "PLCN_validMessage", false);
                    retVal = setCommentsForTransaction("149", "8199", map);
                    retVal = 1;
                }
            }
        }
    }
    else
    {
        logger.info("PreferredContactMethodRule1Pain013 passed :" + prefInvcrContactMethodValue);
        validFlag = true;
    }

    return retVal;
}

/* This function validates PreferredContactMethodRule2.
* If Preferred Method to contact the Case Creator is Mobile or Cell Phone, then Mobile Number must be present.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

// function fedNowPreferredContactMethodRule2Pain013(exchange){

//     logger.info("In PreferredContactMethodRule2Pain013 ")
//     var inMsg = exchange.getIn();
//     var map = inMsg.getHeaders();
//     var retVal = 0;
//     var validflag;
//     var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

//     var prefInvcrContactMethodfPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/PrefrdMtd";
//     var prefInvcrContactMethodValue = getValueFromPath(Document, prefInvcrContactMethodfPath);
//     logger.info("PreferredContactMethodRule2Pain013 : prefInvcrContactMethodValue " + prefInvcrContactMethodValue);

//     if (prefInvcrContactMethodValue) {

//         if (prefInvcrContactMethodValue == "CELL") {
//             var path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/MobNb";
//             var pathValue = getValueFromPath(Document, path);

//             logger.info("PreferredContactMethodRule2Pain013 : CELL " + pathValue);
//             if (pathValue) {
//                 logger.info("PreferredContactMethodRule2Pain013 CELL passed " + pathValue);
//                 validFlag = true;
//             }


//             else {
//                 logger.info("PreferredContactMethodRule2Pain013 CELL failed " + pathValue);
//                 setHeader(map, "PLCN_validMessage", false);
//                 retVal = setCommentsForTransaction("370", "7986", map);
//                 retVal = 1;
//             }
//         }



//     }
//     else {
//         logger.info("PreferredContactMethodRule2Pain013 passed :" + pathValue);
//         validFlag = true;
//     }

//     return retVal;

// }

    


/* This function validates PreferredContactMethodRule3.
* If Preferred Method to contact the Case Creator is Phone, then Phone Number must be present.
* @param {DOMTree} Document - The message.
* @returns {String} return 0 for valid message 
*/

// function fedNowPreferredContactMethodRule3Pain013(exchange){

//     logger.info("In PreferredContactMethodRule3Pain013 ")
//     var inMsg = exchange.getIn();
//     var map = inMsg.getHeaders();
//     var retVal = 0;
//     var validFlag;
//     var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);


//     var prefInvcrContactMethodfPath = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/PrefrdMtd";
//     var prefInvcrContactMethodValue = getValueFromPath(Document, prefInvcrContactMethodfPath);
//     logger.info("PreferredContactMethodRule3Pain013 : prefInvcrContactMethodValue " + prefInvcrContactMethodValue);

//     if (prefInvcrContactMethodValue) {


//         if (prefInvcrContactMethodValue == "PHON") {
//             var path = "/Document/CdtrPmtActvtnReq/PmtInf/CdtTrfTx/RmtInf/Strd/Invcr/CtctDtls/PhneNb";
//             var pathValue = getValueFromPath(Document, path);


//             logger.info("PreferredContactMethodRule3Pain013 : PHON " + pathValue);
//             if (pathValue) {
//                 logger.info("PreferredContactMethodRule3Pain013 PHON passed " + pathValue);
//                 validFlag = true;
//             }
//             else {
//                 logger.info("PreferredContactMethodRule3Pain013 PHON failed " + pathValue);
//                 setHeader(map, "PLCN_validMessage", false);
//                 retVal = setCommentsForTransaction("376", "7986", map);
//                 retVal = 1;
//             }
//         }
//     }
//     else
//     {
//         logger.info("PreferredContactMethodRule3Pain013 passed :" +pathValue);
//         validFlag = true;
//     }

//     return retVal;
// }






