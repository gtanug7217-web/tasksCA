public class soqlQuestion {
    public static void main(List<Account> accList){
        set<String> s=new set<String>();
            
        for(Account acc:accList){
            if(s.contains(acc.name)){
                acc.addError('error occured!!');
            }
        }
    }
}