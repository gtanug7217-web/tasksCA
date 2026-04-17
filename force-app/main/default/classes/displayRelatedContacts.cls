public class displayRelatedContacts {
    @AuraEnabled(cacheable=true)
    public static list<Contact> getContacts(Id accId){
        return [Select id,firstName,lastName from contact where AccountId=:accId];
    }
}