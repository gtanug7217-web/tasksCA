public with sharing class displayContactFromAccount {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        // Fetch a simple list of Accounts the user can see. Adjust fields/filters as needed.
        return [
            SELECT Id, Name, Phone, Rating
            FROM Account
            ORDER BY Name
            LIMIT 2000
        ];
    }

    @AuraEnabled
    public static void deleteAccounts(List<Id> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) {
            return;
        }
        // Ensure all Ids are Account Ids to avoid mixed-DML and type issues
        List<Account> toDelete = [SELECT Id FROM Account WHERE Id IN :accountIds];
        delete toDelete;
    }
}