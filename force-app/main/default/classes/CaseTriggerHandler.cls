public class CaseTriggerHandler {
    public static void method(List<Case> caseList){
        set<Id> accIds=new set<Id>();
        
        for(Case c:caseList){
            if(c.AccountId!=NULL){
            accIds.add(c.AccountId);
        	}
        }
        List<Account> accUpdate=new List<Account>();
        for(AggregateResult ar:[SELECT AccountId,count(id) total,status FROM case where AccountId IN :accIds group by status,AccountId]){
              system.debug(ar);                      
            Id accId = (Id)ar.get('AccountId');
            if((String)ar.get('Status')=='New'){
                Integer NewCasesCount=(Integer)ar.get('total');
                accUpdate.add(new Account(id=accId,No_of_New_Cases__c=NewCasesCount));
            }
            else if((String)ar.get('Status')=='Working'){
                Integer NewWorkingCount=(Integer)ar.get('total');
                accUpdate.add(new Account(id=accId,No_of_Working_Cases__c=NewWorkingCount));
            }
			else if((String)ar.get('Status')=='Escalated'){
                Integer NewEscalatedCount=(Integer)ar.get('total');
                accUpdate.add(new Account(id=accId,No_of_Escalated_Cases__c=NewEscalatedCount));
            }
        }
        if(!accUpdate.isEmpty()){
            update accUpdate;
        }
    }
}