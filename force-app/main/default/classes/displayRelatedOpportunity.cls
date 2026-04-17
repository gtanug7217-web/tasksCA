public class displayRelatedOpportunity {
	@AuraEnabled(cacheable=true)
    public static list<Opportunity> getOpportunity(Id accId){
        return [Select id,Name,stageName from Opportunity where AccountId=:accId];
    }
}