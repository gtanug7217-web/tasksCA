public class program {
    public program(){
        Integer percent=90;
        if(percent>=90){
            system.debug('grade A');
        }
        else if(percent>=80){
            system.debug('grade B');
        }
        else if(percent>=60){
            system.debug('grade C');
        }
        else if(percent>=40){
            system.debug('grade D');
        }
        else{
            system.debug('Fail');
        }
    }
}