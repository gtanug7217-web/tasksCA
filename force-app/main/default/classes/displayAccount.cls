public class displayAccount{
    @auraEnabled(cacheable=true)
    public static list<Account> getAccount(){
        return [select id,name,phone,rating from account limit 10];
    }
}