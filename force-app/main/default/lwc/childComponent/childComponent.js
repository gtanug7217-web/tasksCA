import { LightningElement, track } from 'lwc';

export default class ChildComponent extends LightningElement {
    @track inputValue = '';

    handleChange(event) {
        this.inputValue = event.target.value;
    }

    handleClick() {
        const custEve = new CustomEvent('sendtext', {
            detail: this.inputValue,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(custEve);
    }
}