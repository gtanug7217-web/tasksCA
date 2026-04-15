import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/getAccounts.method';
import getOpportunity from '@salesforce/apex/getAccounts.getOpportunity';
import updateOpportunities from '@salesforce/apex/getAccounts.updateOpportunities';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columnsOpp = [
    { 
        label: 'Opportunity Name', 
        fieldName: 'displayName',
        cellAttributes: {
            class: { fieldName: 'rowClass' }
        }
    },

    { 
        label: 'Stage Name', 
        fieldName: 'StageName', 
        editable: true,
        cellAttributes: {
            class: { fieldName: 'rowClass' }
        }
    },

    { 
        label: 'Amount', 
        fieldName: 'Amount', 
        type: 'currency',
        editable: true,
        cellAttributes: {
            class: { fieldName: 'rowClass' }
        }
    },

    { 
        label: 'Close Date', 
        fieldName: 'CloseDate',
        cellAttributes: {
            class: { fieldName: 'rowClass' }
        }
    }
];

export default class GetAccountsWithRelatedOpportunity extends LightningElement {

    @track Accounts = [];
    @track opportunities = [];
    @track draftValues = [];

    selectedAccountId = null;
    showDataTable = false;

    columns = columnsOpp;

    wiredOppResult; 

    
    @wire(getAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.Accounts = data.map(acc => ({
                ...acc,
                icon: '+'
            }));
        } else if (error) {
            console.error(error);
        }
    }

    
    @wire(getOpportunity, { accountId: '$selectedAccountId' })
    wiredOpportunities(result) {
        this.wiredOppResult = result;

        if (result.data) {
            this.opportunities = result.data.map(row => {

                let prefix = '';

                if (row.StageName === 'Closed Won') {
                    prefix = 'Closed - ';
                } 
                else if (row.StageName === 'Closed Lost') {
                    prefix = 'Lost - ';
                }

                return {
                    ...row,
                    displayName: prefix + row.Name,
                    rowClass: ''   
                };
            });
        } 
        else if (result.error) {
            console.error(result.error);
        }
    }

    
    handleClick(event) {
        const accountId = event.target.value;

        if (this.selectedAccountId === accountId) {
            this.showDataTable = false;
            this.selectedAccountId = null;

            this.Accounts = this.Accounts.map(acc => ({
                ...acc,
                icon: '+'
            }));
        } else {
            this.selectedAccountId = accountId;
            this.showDataTable = true;

            this.Accounts = this.Accounts.map(acc => ({
                ...acc,
                icon: acc.Id === accountId ? '-' : '+'
            }));
        }
    }

    
    handleSave(event) {
        const updatedFields = event.detail.draftValues;
        console.log('Updated Fields:', updatedFields);

        updateOpportunities({ oppList: updatedFields })
            .then(() => {

                this.draftValues = [];
                return refreshApex(this.wiredOppResult);
            })
            .then(() => {
                this.opportunities = this.opportunities.map(row => {

                    let updatedRow = { ...row, rowClass: '' };

                    const edited = updatedFields.find(d => d.Id === row.Id);

                    if (edited) {

                        updatedRow = { ...updatedRow, ...edited };

                        let prefix = '';

                        if (updatedRow.StageName === 'Closed Won') {
                            prefix = 'Closed - ';
                        } 
                        else if (updatedRow.StageName === 'Closed Lost') {
                            prefix = 'Lost - ';
                        }

                        updatedRow.displayName = prefix + updatedRow.Name;

                        updatedRow.rowClass = 'highlight-row'; 
                    }

                    return updatedRow;
                });

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Updated Successfully',
                        variant: 'success'
                    })
                );

            })
            .catch(error => {
                console.error(error);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Update Failed',
                        variant: 'error'
                    })
                );
            });
    }

    get accountClass() {
        return this.showDataTable 
            ? "slds-col slds-size_1-of-3"
            : "slds-col slds-size_1-of-1 slds-align_absolute-center";
    }
}