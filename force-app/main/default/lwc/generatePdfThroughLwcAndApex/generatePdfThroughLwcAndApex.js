import { LightningElement, api, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import savePDFToFiles from '@salesforce/apex/AccountPDFSaveController.savePDFToFiles';

export default class SavePdfAction extends LightningElement {
    @api recordId; 
    @track isLoading = false;
    @track isSuccess = false;
    @track errorMessage = '';

    handleSavePDF() {
        this.isLoading = true;
        this.errorMessage = '';

        savePDFToFiles({ accountId: this.recordId })
            .then(() => {
                this.isLoading = false;
                this.isSuccess = true;
                setTimeout(() => {
                    this.dispatchEvent(new CloseActionScreenEvent());
                }, 2000);
            })
            .catch(error => {
                this.isLoading = false;
                this.errorMessage = error.body?.message || 'Kuch problem aayi';
            });
    }
}