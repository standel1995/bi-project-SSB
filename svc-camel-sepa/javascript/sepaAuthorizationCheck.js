function amountCapFunctionalityTxn(Document, map) {

 var systemLevelFlag;
 var sepaAmtCapLimit;
 var sepaAmtCapPerChannel;
 var channelIdSource;
 var messageClassType;
 var priorityAmountNum;
 var queueId;
 var messageDirection;
 var key;
 logger.info("In amountCapFunctionalityTxn");
 
 channelIdSource = getHeader(map, "PLCN_channelIdSource");
 var key1 = "Amount_CAP_".concat(channelIdSource);
 key = key1.concat("_TXN");
 key = key.toUpperCase();
 messageClassType = getHeader(map, "PLCN_messageClassType");
 priorityAmountNum = getHeader(map, "PLCN_priorityAmountNum");
 messageDirection = getHeader(map, "PLCN_messageDirection");
 
 systemLevelFlag = memTblGetTableValue(map, "USER_CONFIG", "HIVAL_CAP_LIMIT_CHK");
 
 sepaAmtCapLimit = memTblGetTableValue(map, "AMOUNT_CAP_TBL", key);
 sepaAmtCapPerChannel = memTblGetTableValue(map, "APPLY_AUTH_CAP", key);
  
  if(systemLevelFlag == "YES"){
	  
	  if(messageClassType == "pacs.008.001.02" && messageDirection == "I"){
		  
		  if(sepaAmtCapPerChannel == "YES"){
			   
				if(priorityAmountNum > sepaAmtCapLimit){
					queueId = "TEMPTXNQ";
					setHeader(map, "PLCN_queueId", queueId);
				}
			}
		}
	}
}


function amountCapFuctinalityBtch(Document, map) {

 var systemLevelFlag;
 var sepaAmtCapLimit;
 var sepaAmtCapPerChannel;
 var channelIdSource;
 var messageClassType;
 var totalAmtOfBatch;
 var queueId;
 var messageDirection;
 var key;
 logger.info("In amountCapFuctinalityBtch");
 
 channelIdSource = getHeader(map, "PLCN_channelIdSource");
 var key1 = "Amount_CAP_".concat(channelIdSource);
 key = key1.concat("_BTCH");
 key = key.toUpperCase();
 messageClassType = getHeader(map, "PLCN_messageClassType");
 totalAmtOfBatch = getHeader(map, "PLCN_totalAmtOfBatch");
 messageDirection = getHeader(map, "PLCN_messageDirection");
 
 systemLevelFlag = memTblGetTableValue(map, "USER_CONFIG", "HIVAL_CAP_LIMIT_CHK");
 sepaAmtCapLimit = memTblGetTableValue(map, "AMOUNT_CAP_TBL", key);
 sepaAmtCapPerChannel = memTblGetTableValue(map, "APPLY_AUTH_CAP", key);
  
  if(systemLevelFlag == "YES"){
	  
	  if(messageClassType == "pacs.008.001.02" && messageDirection == "I"){
		  
		  if(sepaAmtCapPerChannel == "YES"){
			   
				if(totalAmtOfBatch > sepaAmtCapLimit){
					queueId = "TEMPBTHQ";
					setHeader(map, "PLCN_queueId", queueId);
				}
			}
		}
	}
}