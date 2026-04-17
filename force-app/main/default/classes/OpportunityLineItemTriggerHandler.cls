public class OpportunityLineItemTriggerHandler {
    public static void createAssets(List<OpportunityLineItem> oliList){

        Set<Id> oppIds = new Set<Id>();
        Set<Id> pricebookEntryIds = new Set<Id>();
        for(OpportunityLineItem oli : oliList){
            if(oli.OpportunityId != null){
                oppIds.add(oli.OpportunityId);
            }
            if(oli.PricebookEntryId != null){
                pricebookEntryIds.add(oli.PricebookEntryId);
            }
        }
        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>(
            [SELECT Id, AccountId FROM Opportunity WHERE Id IN :oppIds]
        );
        Map<Id, PricebookEntry> pbeMap = new Map<Id, PricebookEntry>(
            [SELECT Id, Product2Id FROM PricebookEntry WHERE Id IN :pricebookEntryIds]
        );
        List<Asset> assetList = new List<Asset>();
        for(OpportunityLineItem oli : oliList){
            Opportunity opp = oppMap.get(oli.OpportunityId);
            if(opp != null && opp.AccountId != null){

                Asset asset = new Asset();
                asset.Name = 'Asset for ' + oli.Id;
                asset.AccountId = opp.AccountId;
                
                if(pbeMap.containsKey(oli.PricebookEntryId)){
                    asset.Product2Id = pbeMap.get(oli.PricebookEntryId).Product2Id;
                }
                assetList.add(asset);
            }
        }
        if(!assetList.isEmpty()){
            insert assetList;
        }
    }
}