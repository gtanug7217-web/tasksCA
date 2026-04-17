public class relationMatrixDatatable {

    @AuraEnabled(cacheable=true)
    public static List<Relation_Matrix__c> relationMatrix(Id accountId){
        try {
            List<Relation_Matrix__c> relationMatrix= [SELECT Id, Account__c,Contact__c, Contact__r.Name,User__c, User__r.Name,Health__c, Health_Index__c FROM Relation_Matrix__c WHERE Account__c =:accountId];
            return relationMatrix;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}