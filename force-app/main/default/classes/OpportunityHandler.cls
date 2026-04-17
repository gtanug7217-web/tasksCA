public class OpportunityHandler {
   
    public static void handleAllEvent(List<Opportunity> newList,List<Opportunity> oldList,Map<Id, Opportunity> oldMap) {
        Set<Id> accountIds=new Set<Id>();
        if(newList!=null){
        for(Opportunity opp:newList){
            if(opp.AccountId!=null){
                accountIds.add(opp.AccountId);
            }
        }}
        if(oldList!=null){
        for(Opportunity opp:oldList){
            if(opp.AccountId!=null){
                accountIds.add(opp.AccountId);
            }
        }}
        if(newList!=null && oldMap!=null){
        for(opportunity opp:newList){
        Opportunity oldOpp=oldMap.get(opp.Id);
            if (oldOpp.AccountId!=null) {
                accountIds.add(oldOpp.AccountId);
            }
        }}
        if(accountIds.isEmpty()){
            return;
        }

        Map<Id,Decimal> maxMap=new Map<Id,Decimal>();
        Map<Id,Decimal> minMap=new Map<Id,Decimal>();

        for(AggregateResult ar:[SELECT AccountId,MAX(Amount) maxAmount,MIN(Amount) minAmount FROM Opportunity WHERE AccountId IN :accountIds GROUP BY AccountId]) {
            Id accId=(Id)ar.get('AccountId');
            maxMap.put(accId,(Decimal)ar.get('maxAmount'));
            minMap.put(accId,(Decimal)ar.get('minAmount'));
        }

        List<Account> accToUpdate=new List<Account>();

        for(Id accId:accountIds) {
            Account acc=new Account(Id = accId);
            if(maxMap.containsKey(accId)){
                acc.Max_Amount__c=maxMap.get(accId);
            }
            else{
                acc.Max_Amount__c=0;
            }
           if(minMap.containsKey(accId)){
                acc.Min_Amount__c=minMap.get(accId);
            }
            else{
                acc.Min_Amount__c=0;
            }
            accToUpdate.add(acc);
        }

        if(!accToUpdate.isEmpty()) {
            update accToUpdate;
        }
    }
}