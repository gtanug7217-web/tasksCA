public class TaskTriggerHandler {
    public static void method(List<Task> taskList){
        User u=[SELECT profile.name FROM User WHERE Id = :UserInfo.getUserId()];
        for(Task t:taskList){
            if(u.profile.name!='System Administrator'){
                t.addError('You don\'t have access to delete the task');
            }
        }
    }
}