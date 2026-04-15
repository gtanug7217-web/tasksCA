import { LightningElement } from 'lwc';

export default class TodoApp extends LightningElement {
    tasks=[];
    inputTask='';
    handleOnchange(event){
        this.inputTask=event.target.value;
    }
    handleAddTask(){
        if(this.inputTask){
            this.tasks=[...this.tasks,this.inputTask];
        }
    }
    handleDeleteTask(){
        this.tasks=this.tasks.filter(task=>task!==this.inputTask);
    }   
}