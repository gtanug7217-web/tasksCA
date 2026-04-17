public class employeeHandler2 {
	public static void method2(List<Employee__c> empList){ 
        List<Account> accList = [SELECT Id, Deleted_Employee_Count__c FROM Account];
        for(Account acc : accList){

            if(acc.Deleted_Employee_Count__c == null){
                acc.Deleted_Employee_Count__c = 1;
            }
            else{
                acc.Deleted_Employee_Count__c = acc.Deleted_Employee_Count__c + 1;
            }
        }

        update accList;
}
}