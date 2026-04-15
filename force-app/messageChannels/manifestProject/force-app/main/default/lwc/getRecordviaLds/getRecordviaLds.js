import { LightningElement, wire } from 'lwc';
import { getRecord, deleteRecord } from 'lightning/uiRecordApi';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import OWNER_FIELD from '@salesforce/schema/Account.OwnerId';

const fields = [NAME_FIELD, INDUSTRY_FIELD, PHONE_FIELD, OWNER_FIELD];

export default class getRecordviaLds extends LightningElement {

    accountName;
    industry;
    phone;
    owner;
    accountId;

    @wire(getRecord, { 
        recordId: '001fj00000mqsdPAAQ', 
        fields 
    })
    wireAccount({ data, error }) {

        if (data) {
            this.accountId = data.id;
            this.accountName = data.fields.Name.value;
            this.industry = data.fields.Industry.value;
            this.phone = data.fields.Phone.value;
            this.owner = data.fields.OwnerId.displayValue;
        } 
        else if (error) {
            console.error('Error: ', error);
        }
    }

    handleDelete() {
        deleteRecord(this.accountId)
            .then(() => {
                console.log('Record Deleted');

                this.accountName = '';
                this.industry = '';
                this.phone = '';
                this.owner = '';
            })
            .catch(error => {
                console.error('Delete Error: ', error);
            });
    }
}