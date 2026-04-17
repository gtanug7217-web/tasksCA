public with sharing class EventGoogleSyncHandler {

    public static void afterInsert(List<Event> newEvents) {
        
        List<Id> eventIds = new List<Id>();
        for (Event e : newEvents) {
            if (e.Id != null) {
     	         eventIds.add(e.Id);
            }
        }
 
        if (!eventIds.isEmpty()) {
            System.enqueueJob(new EventGoogleSyncQueueable(eventIds));
        }
        
    }
}