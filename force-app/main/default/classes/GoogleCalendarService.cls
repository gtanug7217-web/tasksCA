public with sharing class GoogleCalendarService {
 
    public static String createEvent(Event e, Contact c) {
        Map<String, Object> mapReqData = new Map<String, Object>{
    		'summary' => e.Subject,
    		'description' => e.Description,

    		'start' => new Map<String, Object>{
        	'dateTime' => e.StartDateTime.format('yyyy-MM-dd\'T\'HH:mm:ss'),
        	'timeZone' => 'Asia/Kolkata'
    },

    		'end' => new Map<String, Object>{
        	'dateTime' => e.EndDateTime.format('yyyy-MM-dd\'T\'HH:mm:ss'),
        	'timeZone' => 'Asia/Kolkata'
    }
};
 
        if (c != null && String.isNotBlank(c.Email)) {
            mapReqData.put('attendees', new List<Object>{new Map<String, Object>{'email' => c.Email, 'displayName' => c.Name }});
        }
 		
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setMethod('POST');
        req.setEndpoint('callout:googleCalender/calendar/v3/calendars/primary/events');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(mapReqData));
        req.setTimeout(120000);
        
        HttpResponse res = http.send(req);
        if (res.getStatusCode() != 200 && res.getStatusCode() != 201) {
            throw new CalloutException(
                'Google Calendar insert failed. Status: ' + res.getStatus() + ' Body: ' + res.getBody()
            );
        }
 
        Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        return (String) responseMap.get('id');
    }
    public static void sendSalesforceMail(String toEmail, Event e, String googleEventId) {
        String eventLink = URL.getOrgDomainUrl().toExternalForm() + '/lightning/r/Event/' + e.Id + '/view';
        String bodyText =
            'Hello,\n\n' +
            'Your event has been created successfully.\n\n' +
            'Event Subject: ' + e.Subject + '\n' +
            'Salesforce Event Link: ' + eventLink + '\n' +
            'Google Calendar Event Id: ' + googleEventId + '\n\n' +
            'Regards,\n' +
            'Salesforce';
 
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new List<String>{ toEmail });
        mail.setSubject('Event Created Successfully');
        mail.setPlainTextBody(bodyText);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }

}