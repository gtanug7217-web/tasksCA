import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';

export default class someComponent extends LightningElement {

    accountName;
    handleChange(event) {
        this.accountName = event.target.value;
    }
    handleClick() {
        const fields = {
            Name: this.accountName
        };
        const recordInput = {
            apiName: 'Account',
            fields: fields
            
        };
        createRecord(recordInput)
            .then(result => {
                alert('Account Created! Id: ' + result.id);
            })
            .catch(error => {
                console.error(error);
            });
    }
}