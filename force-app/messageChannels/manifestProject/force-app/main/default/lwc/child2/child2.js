import { LightningElement } from 'lwc';

export default class Child2 extends LightningElement {
    status='';
    handleSelected(){
        this.status='Selected';
        const st1=new CustomEvent('select',{
            detail:this.status
        });
        this.dispatchEvent(st1);
    }
    handleDeselected(){
        this.status='Deselected';
        const st2=new CustomEvent('deselect',{
            detail:this.status
        });
        this.dispatchEvent(st2);
    }
}