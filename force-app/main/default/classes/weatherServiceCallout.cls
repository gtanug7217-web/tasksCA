public class weatherServiceCallout{
    
    public static void getWeather() {
        
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        String apiKey = 'ee73f0c261604938a3293204260704';
        String city = 'Paris';
        req.setEndpoint('https://api.weatherapi.com/v1/current.json?key=' + apiKey + '&q=' + city);
        req.setMethod('GET');
        HttpResponse res = http.send(req);
        System.debug('Status Code: ' + res.getStatusCode());
        System.debug('Response Body: ' + res.getBody());
        
       
    }
}