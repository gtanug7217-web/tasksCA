public class day1getOpportunityFromAccount{
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(){
        try {
            return [SELECT id,Name,Phone,Industry FROM Account LIMIT 5];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunityFromAccount(Id accountId){
        try {
            return [SELECT id,Name,stageName,closeDate,Amount,Account.Name FROM Opportunity WHERE AccountId=:accountId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static void updatingOpportunities(List<Opportunity> opportunityList){
        try {
            update opportunityList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}