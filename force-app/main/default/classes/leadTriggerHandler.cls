public class leadTriggerHandler {
    public static void method(List<Lead> leadList){
        
        set<string> leadName=new set<string>();
        for(lead l:leadList){
            if(l.FirstName!=null){
                leadName.add(l.FirstName);
            }
        }
        Map<String,Lead> leadMap=new Map<String,Lead>();
        for(lead l:[SELECT id,FirstName FROM Lead where FirstName in :leadName]){
            leadMap.put(l.FirstName,l);
        }
        for(lead l:leadList){
            if(leadMap.containskey(l.FirstName)){
                l.addError('duplicate lead name');
            }
        }
    }
}