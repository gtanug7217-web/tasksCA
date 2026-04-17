public class AccountHandler {

    public static void createDefaultContact(List<Account> accList){
        List<Contact> conList=new List<Contact>();
        List<Account> accToUpdate=new List<Account>();
        for(Account acc:accList){

            Contact c=new Contact();
            c.FirstName='Info';
            c.LastName='Default';
            c.Email='info@websitedomain.tld';
            c.AccountId=acc.Id;
            conList.add(c);

            Account a=new Account();
            a.Id=acc.Id;
            a.Only_Default_Contact__c=true;
            accToUpdate.add(a);
        }
        if(!conList.isEmpty()) insert conList;
        if(!accToUpdate.isEmpty()) update accToUpdate;
    }
}