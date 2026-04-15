public with sharing class FilterOpportunityHandler {
    @AuraEnabled(cacheable=true)
    public static list<Opportunity> getAllOpportunities(){
        try {
            return [SELECT Account.Name,Name,stageName,closeDate,Amount FROM Opportunity];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}