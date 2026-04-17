public class demoFuture {


    public static void methodCall(){
        createUser();
        createAccount();
    }
    public static void createUser() {
        
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Chatter Free User' LIMIT 1];
        
        User u = new User(
            FirstName = 'tanu',
            LastName = 'giri',
            Email = 'tanu@gmail.com',
            Username = 'tg241@gamil.com', 
            Alias = 'tg',
            TimeZoneSidKey = 'Asia/Kolkata',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            ProfileId = p.Id,
            LanguageLocaleKey = 'en_US'
        );
        
        insert u;
        
    }

    
    public static void createAccount() {
        
        Account acc = new Account(
            Name = 'tanu'
            
        );
        
        insert acc;
        
    }
}