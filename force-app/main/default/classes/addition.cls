public class addition {
    public static void main(){
        List<Account> acc=[select id,name,rating from account where id IN (select AccountId from contact)];
        for(Account a:acc){
            a.Rating='hot';
            a.Active__c='Yes';
            acc.add(a);
        }
        update acc;
    }
}