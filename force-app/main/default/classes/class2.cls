public class class2 {
    public static void main(){
        Account acc=new Account();
        acc.Name='tanu';
        insert acc;
        List<Contact> con=new List<Contact>();
        for(Integer i=0;i<=5;i++){
            Contact c=new Contact();
            c.LastName='giri';
            c.AccountId=acc.Id;
            con.add(c);
        }
        insert con;
    }
}