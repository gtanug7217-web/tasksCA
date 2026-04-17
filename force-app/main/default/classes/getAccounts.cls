public class getAccounts {

    @AuraEnabled(Cacheable=true)
    public static List<Account> method(){
        return [SELECT Id, Name FROM Account LIMIT 5];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Opportunity> getOpportunity(Id accountId){
        return [
            SELECT Id, Name, StageName, Amount, CloseDate 
            FROM Opportunity 
            WHERE AccountId = :accountId 
            LIMIT 5
        ];
    }

    @AuraEnabled
    public static void updateOpportunities(List<Opportunity> oppList){
        update oppList;
        system.debug(oppList);
    }
}