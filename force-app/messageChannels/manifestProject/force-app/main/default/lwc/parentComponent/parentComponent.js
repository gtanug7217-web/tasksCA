import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
    childId;
    handleSelect(event) {
        this.childId = event.target.childId;
    }
    handleDeselect(event) {
        this.childId = null;
    }
    
}