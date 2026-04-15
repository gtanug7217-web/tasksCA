import { LightningElement } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';

import ID_FIELD from '@salesforce/schema/Account.Id';
import NAME_FIELD from '@salesforce/schema/Account.Name';

export default class updateRecordAccount extends LightningElement {

    idValue;
    nameValue;
    handleIdChange(event) {
        this.idValue = event.target.value;
    }
    handleNameChange(event) {
        this.nameValue = event.target.value;
    }
    handleClick() {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.idValue;
        fields[NAME_FIELD.fieldApiName] = this.nameValue;

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                console.log('Record Updated Successfully');
            })
            .catch(error => {
                console.error(error);
            });
    }
}