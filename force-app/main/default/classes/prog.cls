public class prog{
    public static void met(Integer n){
        Integer i=0;
        while(n>0){
            n=n/10;
            i++;
        }
        System.debug(i);
    }
}