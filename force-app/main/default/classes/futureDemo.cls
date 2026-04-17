public class futureDemo {
    
    public static void calling(){
        something();
        event();
    }
    
    public static void something(){
        Account acc = new Account(Name = 'Test Account');
        insert acc;
    }
    
    public static void event(){
        
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Chatter free User' LIMIT 1];
        
        User usr = new User(
            Alias = 'test',
            Email = 'test@example.com',
            LastName = 'User',
            ProfileId = p.Id,
            Username = 'test' + DateTime.now().getTime() + '@example.com',
            
            
            TimeZoneSidKey = 'Asia/Kolkata',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US'
        );
        
        insert usr;
    }
}