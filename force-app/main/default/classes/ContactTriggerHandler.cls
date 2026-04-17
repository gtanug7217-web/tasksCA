public class ContactTriggerHandler {
    public static void method(List<Contact> conList){
        List<Contact_Relationship__c> conRelList=new List<Contact_Relationship__c>();
        for(Contact con:conList){
            if(con.Contact_Relationship__c==true){
                Contact_Relationship__c conRel=new Contact_Relationship__c();
                conRel.Name=con.firstName;
                conRel.Contact__c=con.id;
                conRelList.add(conRel);
            }
        }
        if(!conRelList.isEmpty()){
            insert conRelList;
        }
    }
}