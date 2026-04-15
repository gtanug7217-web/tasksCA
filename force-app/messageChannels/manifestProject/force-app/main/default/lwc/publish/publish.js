import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import RECORD_CHANNEL from '@salesforce/messageChannel/MyMessageChannel__c';

export default class Publisher extends LightningElement {

    @wire(MessageContext)
    messageContext;

    handleClick() {
        const payload = {
            message: 'Hello from Publisher'
        };

        publish(this.messageContext, RECORD_CHANNEL, payload);
    }
}