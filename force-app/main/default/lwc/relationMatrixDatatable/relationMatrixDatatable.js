import { LightningElement, wire, api } from 'lwc';
import getRelationMatrix from '@salesforce/apex/RelationMatrixDatatable.relationMatrix';
import { refreshApex } from '@salesforce/apex';
//importing static resource images
import tickImage from '@salesforce/resourceUrl/tickImg';
import crossImage from '@salesforce/resourceUrl/crossImage';
import hypenImage from '@salesforce/resourceUrl/HypenImg';

export default class RelationMatrixDatatable extends LightningElement {

    @api recordId;
    rows;
    users;
    error;
    showModal = false;
    selectedRecordId;
    isLoading = false;
    wiredResult;

    //data fetching from apex class
    @wire(getRelationMatrix, { accountId: '$recordId' })
    wireResults(result) {
        this.wiredResult = result;
        const { error, data } = result;

        if (data) {
            const contactMap = new Map();
            const userMap = new Map();
            const relationMap = new Map();

            data.forEach(rec => {
                if (rec.Contact__c && rec.Contact__r.Name) {
                    contactMap.set(rec.Contact__c, {
                        id: rec.Contact__c,
                        name: rec.Contact__r.Name
                    });
                }

                if (rec.User__c && rec.User__r.Name) {
                    userMap.set(rec.User__c, {
                        id: rec.User__c,
                        name: rec.User__r.Name
                    });
                }

                if (rec.Contact__c && rec.User__c) {
                    relationMap.set(`${rec.Contact__c}|${rec.User__c}`, rec);
                }
            });

            const contacts = Array.from(contactMap.values());
            const users = Array.from(userMap.values());

            this.users = users;

            this.rows = contacts.map(contact => ({
                contact,
                cells: users.map(user => {
                    const relation = relationMap.get(`${contact.id}|${user.id}`);

                    return {
                        userId: user.id,
                        recordId: relation?.Id,
                        imageUrl: relation
                            ? this.getHealthIconUrl(relation.Health__c)
                            : null
                    };
                })
            }));

            this.error = undefined;

        } else if (error) {
            this.error = error;
            this.rows = undefined;
            this.users = undefined;
        }
    }

    
    handleImageClick(event) {
        const recId = event.target.dataset.id;
        if (!recId) return;

        this.selectedRecordId = recId;
        this.showModal = true;
        this.isLoading = true;
    }

    
    handleLoad() {
        this.isLoading = false;
    }

    
    closeModal() {
        this.showModal = false;
    }

    
    handleSuccess() {
        this.showModal = false;
        refreshApex(this.wiredResult);
    }

    
    getHealthIconUrl(health) {
        const value = String(health).toLowerCase();

        if (value.includes('good')) return tickImage;
        if (value.includes('bad')) return crossImage;
        if (value.includes('average')) return hypenImage;

        return null;
    }
}