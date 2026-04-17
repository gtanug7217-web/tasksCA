public with sharing class EventGoogleSyncQueueable implements Queueable, Database.AllowsCallouts{ 
    
    private List<Id> eventIds;
    public EventGoogleSyncQueueable(List<Id> eventIds) {
        this.eventIds = (eventIds == null) ? new List<Id>() : new List<Id>(eventIds);
    }
    
    public void execute(QueueableContext qc) {
        if (eventIds.isEmpty()) {
            return;
        }
 
        List<Event> events = [
            SELECT Id, Subject, Description, StartDateTime, EndDateTime, WhoId
            FROM Event
            WHERE Id IN :eventIds
        ];
 
        Set<Id> contactIds = new Set<Id>();
        Schema.DescribeSObjectResult contactDescribe = Contact.SObjectType.getDescribe();
		String contactPrefix = contactDescribe.getKeyPrefix();
        for (Event e : events) {
            if (e.WhoId != null && String.valueOf(e.WhoId).startsWith(contactPrefix)) {
                contactIds.add(e.WhoId);
            }
        }
 
        Map<Id, Contact> contactMap = new Map<Id, Contact>();
        if (!contactIds.isEmpty()) {
            for (Contact c : [
                SELECT Id, Name, Email
                FROM Contact
                WHERE Id IN :contactIds
            ]) {
                contactMap.put(c.Id, c);
            }
        }
 
        List<Event> updates = new List<Event>();
        for (Event e : events) {
            try {
                if (e.StartDateTime == null || e.EndDateTime == null) {
                    updates.add(new Event(
                        Id = e.Id,
                        Google_Calendar_Status__c = 'Pending'
                    ));
                    continue;
                }
 
                Contact c = (e.WhoId != null) ? contactMap.get(e.WhoId) : null;
                String googleEventId = GoogleCalendarService.createEvent(e, c);
                updates.add(new Event(
                    Id = e.Id,
                    Google_Calendar_Status__c = 'Success'
                ));
 
                if (c != null && String.isNotBlank(c.Email)) {
                    GoogleCalendarService.sendSalesforceMail(c.Email, e, googleEventId);
                }
            } catch (Exception ex) {
                updates.add(new Event(
                    Id = e.Id,
                    Google_Calendar_Status__c = 'Failed'
                ));
            }
        }
 
        if (!updates.isEmpty()) {
            update updates;
        }
    }
}