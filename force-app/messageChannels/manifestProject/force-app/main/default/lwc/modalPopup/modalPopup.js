import { api } from 'lwc';
import updateOpp from '@salesforce/apex/updateOppDate.updDate';
import LightningModal from 'lightning/modal';

export default class MyModal extends LightningModal {

    handleChange(event){
        this.closeDate = event.target.value;
    }
    handleClose() {
        this.close('done');
    }

    handleSave() {
        updateOpp({closeDate: this.closeDate, Id: this.oppId})
    }
}