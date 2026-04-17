public class updateOppDate {
	@auraEnabled(cacheable=true)
    public static void updDate(Id oppId,Date dt){
        Opportunity opp=[SELECT ID,closeDate FROM Opportunity Where id=:oppId limit 1];
        opp.closeDate=dt;
        update opp;
    }
}