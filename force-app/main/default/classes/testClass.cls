@isTest
public class testClass {
	@isTest
    public static void test(){
        Account a=new Account(Name='xyz',rating='hot');
        insert a;
        Contact c=new Contact(lastName='giri');
        c.AccountId=a.Id;
        insert c;
        addition.main();
        Account updAcc=[select id,rating from account where  Id = :a.Id];
        System.assertEquals('hot',updAcc.Rating,'wrong rating');
        
    }
}