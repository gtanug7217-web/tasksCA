import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import RECORD_CHANNEL from '@salesforce/messageChannel/MyMessageChannel__c';

export default class Subscriber extends LightningElement {

    receivedMessage = '';

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        subscribe(this.messageContext, RECORD_CHANNEL, (message) => {
            this.receivedMessage = message.message;
        });
    }
}