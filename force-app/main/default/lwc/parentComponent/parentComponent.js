import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
    message='';
    handleCustEvent(event){
        this.message=event.detail;
    }
}