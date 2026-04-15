import { LightningElement ,api} from 'lwc';

export default class Child1 extends LightningElement {
    @api childId;
    status='';
    handleSelected(){
        this.status='Selected';
        const st1=new CustomEvent('select',{
            id:this.childId,
            detail:this.status
        });
        this.dispatchEvent(st1);
    }
    handleDeselected(){
        this.status='Deselected';
        const st2=new CustomEvent('deselect',{
            id:this.childId,
            detail:this.status
        });
        this.dispatchEvent(st2);
    }

}