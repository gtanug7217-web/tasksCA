public class EmployeeTriggerHandler {
    public static void method1(List<Employee__c> empList){
        
        for(Employee__c emp : empList){
            if(emp.Active__c == true){
                emp.addError('You can\'t delete active employee.');
            }
        }
        
    }
    public static void method2(List<Employee__c> empList){
       set<id> accIds=new set<id>();
        for(Employee__c emp : empList){
            if(emp.Account__c!=NULL){
                accIds.add(emp.Account__c);
            }
        }
        map<id,Employee__c> mapEmp=new map<id,Employee__c>();
        
        
    }
}