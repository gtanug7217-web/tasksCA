public class currencyExchange {
    
    public static void updateCurrency(List<Opportunity> newList,Map<Id,Opportunity> oldMap,Boolean isInsert,Boolean isUpdate){
        Set<Id> oppIds=new Set<Id>();
        if(isInsert){
            for(Opportunity opp:newList){
                if(opp.Currency_Type__c!=NULL){
                    oppIds.add(opp.Id);
                }
            }
        }
        if(isUpdate){
            for(Opportunity opp:newList){
                if(opp.Currency_Type__c!=oldMap.get(opp.Id).Currency_Type__c||opp.Amount!=oldMap.get(opp.Id).Amount){
                    oppIds.add(opp.Id);
                }
            }
        }
        if(!oppIds.isEmpty()){
            updateCurrencySync(oppIds);
        }
    }
    @future(callout=true)
    public static void updateCurrencySync(Set<Id> oppIds){
        Map<String, Decimal> rates=getRates();
        List<Opportunity> oppList=[SELECT Id,Amount,Currency_Type__c FROM Opportunity WHERE Id=:oppIds];
        List<Opportunity> oppToUpdate=new List<Opportunity>();
        
        for (Opportunity opp : oppList) {
            String currencyType= opp.Currency_Type__c;
                      
            if (rates.containsKey(currencyType)) {
                Decimal converted = opp.Amount * rates.get(currencyType);
                oppToUpdate.add(new Opportunity(Id = opp.Id,Converted_Currency__c = converted.setScale(2)));
            }
            
        }
        if(!oppToUpdate.isEmpty()){
            update oppToUpdate;
        }
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, Decimal> getRates(){
        Http http=new Http();
        httpRequest req=new httpRequest();
        req.setEndpoint('https://v6.exchangerate-api.com/v6/d2924f869d8327dca38775ba/latest/USD');
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');
        httpResponse res=http.send(req);
        Map<String,Object> responseMap=(Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        Map<String,Object> conversionRates=(Map<String, Object>) responseMap.get('conversion_rates');
        
        Map<String,Decimal> rates=new Map<String, Decimal>();
        
        for (String key:conversionRates.keySet()) {
            rates.put(key,Decimal.valueOf(conversionRates.get(key).toString()));
        }
        
        return rates;
    }    
}