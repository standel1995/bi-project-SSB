function messageRepair(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var priorityDate;
	var currentDate;
	var pastDateFlag;
	var ibanBicConsistent;
	var msgType;
	
	logger.info("In messageRepair");

    institutionId = getHeader(map, "PLCN_institutionId");
    logger.info("messageRepair: institutionId = " + institutionId);

	var plcnInternalcall = getHeader(map,"PLCN_call");
	logger.info("messageRepair: plcnInternalcall = " + plcnInternalcall);
	plcnInternalcall = plcnInternalcall.toString();

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("messageRepair: msgFamily = " + msgFamily);

   	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("messageRepair: custom13 = " + custom13);

    productCode = getHeader(map, "PLCN_productCode");
    logger.info("messageRepair: productCode = " + productCode);
    
    key = institutionId + "."+ "PROCESSING_STAGES.REPAIR" + "." + "PRODUCTS";
    logger.info("messageRepair: key = " + key);

    value = memTblGetTableValue(map, "INST_PARAM", key);
    logger.info("messageRepair: value = " + value);

	msgType = getHeader(map, "PLCN_msgType");
	logger.info("messageRepair: msgType = " + msgType);

	if(isPatternPresent(msgFamily,"SEPA")  && plcnInternalcall == "true" && isPatternPresent(custom13, "REPAIR=Y")){
	    if(productCode) {
	        if(isPatternPresent(value, productCode)) {
				priorityDate = getHeader(map,"PLCN_priorityDate");
				logger.info("messageRepair: priorityDate = " + priorityDate);

				currentDate = getDate();
				logger.info("messageRepair: currentDate = " + currentDate);

				if(priorityDate < currentDate) {
					if(msgType != 'pain.001.001.09') {
						pastDateFlag = "true";
					}
					
					setCommentsForTransaction("00", "9506", map);
				}else {
					pastDateFlag = "false";
				}
	        }else {
	        	pastDateFlag = "false";
	            setHeader(map, "PLCN_repairReq", "false");
	        }
	    }
		custom13 = replacePattern(custom13, "REPAIR=Y", "REPAIR=D");
		logger.info("messageRepair: custom13 = " + custom13);
		setHeader(map, "PLCN_custom13", custom13);
	}else{
		pastDateFlag = "false";
	    setHeader(map, "PLCN_repairReq", "false");
	}

	setHeader(map, "PLCN_pastDateFlag", pastDateFlag);
	logger.info("messageRepair: pastDateFlag = " + pastDateFlag);
}