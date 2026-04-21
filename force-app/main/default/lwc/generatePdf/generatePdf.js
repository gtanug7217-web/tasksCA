import { LightningElement, wire, api, track } from 'lwc';
import jsPDFLibrary from '@salesforce/resourceUrl/jsPDFLibrary';
import { loadScript } from 'lightning/platformResourceLoader';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import NAME_FIELD     from "@salesforce/schema/Account.Name";
import RATING_FIELD   from "@salesforce/schema/Account.Rating";
import TYPE_FIELD     from '@salesforce/schema/Account.Type';
import INDUSTRY_FIELD from "@salesforce/schema/Account.Industry";
import cloudAnalogyImg from '@salesforce/resourceUrl/cloudAnalogyImg';

const fields = [NAME_FIELD, TYPE_FIELD, RATING_FIELD, INDUSTRY_FIELD];

const DARK_NAVY  = [26,  58, 92];
const SUB_NAVY   = [44,  82, 130];
const LABEL_BG   = [247, 248, 250];
const META_BG    = [240, 244, 248];
const BORDER_CLR = [224, 224, 224];
const WHITE      = [255, 255, 255];
const TEXT_DARK  = [34,  34,  34];
const TEXT_MID   = [85,  85,  85];
const TEXT_LIGHT = [184, 212, 240];
const TEXT_WHITE = [255, 255, 255];

export default class GeneratePDFCmp extends LightningElement {

    jsPDFInitialized = false;

    @api recordId;
    accountName;
    rating;
    type;
    industry;

    today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    @track contacts      = [];
    @track opportunities = [];
    @track handleGeneratePdfClick = false;

    @wire(getRecord, { recordId: '$recordId', fields })
    accountData({ data, error }) {
        if (data) {
            this.accountName= getFieldValue(data, NAME_FIELD);
            this.rating= getFieldValue(data, RATING_FIELD);
            this.type= getFieldValue(data, TYPE_FIELD);
            this.industry= getFieldValue(data, INDUSTRY_FIELD);
        } else if (error) {
            console.error('Account error:', JSON.stringify(error));
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Contacts',
        fields: ['Contact.Name', 'Contact.Id', 'Contact.Email', 'Contact.Phone'],
    })
    contactsInfo({ data, error }) {
        if (data) {
            this.contacts = data.records.map((r, i) => ({
                index : i + 1,
                Id    : r.fields.Id?.value ?? '',
                Name  : r.fields.Name?.value  ?? '',
                Email : r.fields.Email?.value ?? '',
                Phone : r.fields.Phone?.value ?? '',
            }));
        } else if (error) {
            console.error('Contacts error:', JSON.stringify(error));
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Opportunities',
        fields: ['Opportunity.Name', 'Opportunity.Id', 'Opportunity.StageName', 'Opportunity.CloseDate'],
    })
    opportunitiesInfo({ data, error }) {
        if (data) {
            this.opportunities = data.records.map((r, i) => ({
                index     : i + 1,
                Id        : r.fields.Id?.value ?? '',
                Name      : r.fields.Name?.value ?? '',
                StageName : r.fields.StageName?.value ?? '',
                CloseDate : r.fields.CloseDate?.value ?? '',
            }));
        } else if (error) {
            console.error('Opportunities error:', JSON.stringify(error));
        }
    }

    get hasContacts() {
        return this.contacts && this.contacts.length > 0;
    }

    get hasOpportunities() {
        return this.opportunities && this.opportunities.length > 0;
    }

    renderedCallback() {
        if (!this.jsPDFInitialized) {
            this.jsPDFInitialized = true;
            loadScript(this, jsPDFLibrary)
                .then(() => console.log('jsPDF loaded'))
                .catch(err => console.error('jsPDF load error:', err));
        }
    }

    generatePDF() {
        this.handleGeneratePdfClick = true;
    }

    handleModalCancel() {
        this.handleGeneratePdfClick = false;
    }

    handleDownloadPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const PageWidth  = doc.internal.pageSize.getWidth();
            const pageHeight  = doc.internal.pageSize.getHeight();
            const leftMargin  = 36;
            const rightMargin  = 36;
            const contentWidth  = PageWidth - leftMargin - rightMargin;
            let   y   = 0;

            const checkPage = (needed = 20) => {
                if (y + needed > pageHeight - 40) {
                    doc.addPage();
                    y = 36;
                }
            };

            const fillRect = (x, ry, w, h, color) => {
                doc.setFillColor(...color);
                doc.rect(x, ry, w, h, 'F');
            };

            const drawCell = (x, cy, w, h, text, opts = {}) => {
                const {
                    bg, textColor = TEXT_DARK,
                    fontSize = 9, fontStyle = 'normal',
                    align = 'left', pad = 6
                } = opts;
                if (bg) fillRect(x, cy, w, h, bg);
                if (text !== null && text !== undefined) {
                    doc.setFontSize(fontSize);
                    doc.setFont('helvetica', fontStyle);
                    doc.setTextColor(...textColor);
                    const tx = align === 'center' ? x + w / 2 : x + pad;
                    const ty = cy + h / 2 + fontSize * 0.35;
                    doc.text(String(text), tx, ty, { align });
                }
            };

            const hLine = (lx, ly, lw, color = BORDER_CLR) => {
                doc.setDrawColor(...color);
                doc.setLineWidth(0.5);
                doc.line(lx, ly, lx + lw, ly);
            };

            const vLine = (lx, ly, lh, color = BORDER_CLR) => {
                doc.setDrawColor(...color);
                doc.setLineWidth(0.5);
                doc.line(lx, ly, lx, ly + lh);
            };

            
            const ROW_H = 20;
            const c1 = leftMargin,            w1 = contentWidth * 0.18;
            const c2 = leftMargin + w1,       w2 = contentWidth * 0.32;
            const c3 = leftMargin + w1 + w2,  w3 = contentWidth * 0.18;
            const c4 = c3 + w3,       w4 = contentWidth - w1 - w2 - w3;

           
            const drawInfoRow = (label1, val1, label2, val2) => {
                checkPage(ROW_H);
                const ry = y;
                drawCell(c1, ry, w1, ROW_H, label1, { bg: LABEL_BG, textColor: TEXT_MID, fontStyle: 'bold', fontSize: 8 });
                drawCell(c2, ry, w2, ROW_H, val1,   { fontSize: 8 });
                drawCell(c3, ry, w3, ROW_H, label2, { bg: LABEL_BG, textColor: TEXT_MID, fontStyle: 'bold', fontSize: 8 });
                drawCell(c4, ry, w4, ROW_H, val2,   { fontSize: 8 });
                vLine(c2, ry, ROW_H);
                vLine(c3, ry, ROW_H);
                vLine(c4, ry, ROW_H);
                hLine(leftMargin, ry + ROW_H, contentWidth, [232, 232, 232]);
                y += ROW_H;
            };

            const drawInfoRowWide = (label, val) => {
                checkPage(ROW_H);
                const ry = y;
                drawCell(c1, ry, w1, ROW_H, label, { bg: LABEL_BG, textColor: TEXT_MID, fontStyle: 'bold', fontSize: 8 });
                drawCell(c2, ry, w2 + w3 + w4, ROW_H, val, { fontSize: 8 });
                vLine(c2, ry, ROW_H);
                hLine(leftMargin, ry + ROW_H, contentWidth, [232, 232, 232]);
                y += ROW_H;
            };

            const drawSectionBar = (title) => {
                checkPage(18);
                const BAR_H = 18;
                fillRect(leftMargin, y, contentWidth, BAR_H, DARK_NAVY);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(...TEXT_WHITE);
                doc.text(title.toUpperCase(), leftMargin + 10, y + BAR_H / 2 + 3.5);
                y += BAR_H;
            };

            
            const drawSubBar = (title) => {
                checkPage(16);
                const BAR_H = 16;
                fillRect(leftMargin, y, contentWidth, BAR_H, SUB_NAVY);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(...TEXT_LIGHT);
                doc.text(title, leftMargin + 10, y + BAR_H / 2 + 3);
                y += BAR_H;
            };

            const HDR_H = 52;
            fillRect(leftMargin, 28, contentWidth, HDR_H, DARK_NAVY);
            if(cloudAnalogyImg)
            {
            const img = new Image();
            img.src = cloudAnalogyImg;
            doc.addImage(img, 'JPEG', leftMargin + 10, 38, 30, 30);
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(...TEXT_WHITE);
            doc.text('Account Information Report', leftMargin + 50, 52);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(184, 212, 240);
            doc.text('Salesforce CrightMargin \u2014 System Generated', leftMargin + 50, 65);
            y = 28 + HDR_H;

            const META_H = 34;
            fillRect(leftMargin, y, contentWidth, META_H, META_BG);
            const metaItems = [
                { label: 'Date of Report:', value: this.today },
                { label: 'Record ID:',      value: this.recordId || '' },
                { label: 'Report Type:',    value: 'Account APF Report' },
                { label: 'Prepared By:',    value: 'Sales Team' },
            ];
            const cellW = contentWidth / 4;
            metaItems.forEach((item, i) => {
                const cx = leftMargin + i * cellW;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(102, 102, 102);
                doc.text(item.label, cx + 8, y + 10);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(...DARK_NAVY);
                doc.text(item.value, cx + 8, y + 23);
                if (i < 3) vLine(cx + cellW, y, META_H, [204, 204, 204]);
            });
            hLine(leftMargin, y + META_H, contentWidth, [204, 204, 204]);
            y += META_H + 14;

            drawSectionBar('Account Information');
            drawInfoRow('Account Name', this.accountName || '', 'Type',   this.type   || '');
            drawInfoRow('Industry',     this.industry    || '', 'Rating', this.rating || '');
            hLine(leftMargin, y, contentWidth, DARK_NAVY);
            y += 14;

            drawSectionBar('Related Contacts');

            if (!this.contacts || this.contacts.length === 0) {
                checkPage(20);
                fillRect(leftMargin, y, contentWidth, 20, WHITE);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8.5);
                doc.setTextColor(136, 136, 136);
                doc.text('No contacts found.', leftMargin + 10, y + 13);
                y += 20;
            } else {
                this.contacts.forEach(con => {
                    checkPage(16 + ROW_H * 2 + 4);
                    drawSubBar(`Contact #${con.index}`);
                    drawInfoRow('Name',  con.Name  || '', 'Phone', con.Phone || '');
                    drawInfoRowWide('Email', con.Email || '');
                    y += 4; // small gap between cards
                });
            }

            hLine(leftMargin, y, contentWidth, DARK_NAVY);
            y += 14;

            drawSectionBar('Related Opportunities');

            if (!this.opportunities || this.opportunities.length === 0) {
                checkPage(20);
                fillRect(leftMargin, y, contentWidth, 20, WHITE);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8.5);
                doc.setTextColor(136, 136, 136);
                doc.text('No opportunities found.', leftMargin + 10, y + 13);
                y += 20;
            } else {
                this.opportunities.forEach(opp => {
                    checkPage(16 + ROW_H * 2 + 4);
                    drawSubBar(`Opportunity #${opp.index}`);
                    drawInfoRow('Name',       opp.Name      || '', 'Stage', opp.StageName || '');
                    drawInfoRowWide('Close Date', opp.CloseDate || '');
                    y += 4; 
                });
            }

            hLine(leftMargin, y, contentWidth, DARK_NAVY);
            y += 12;

            
            checkPage(20);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(170, 170, 170);
            doc.text('This is a system generated report', PageWidth / 2, y + 10, { align: 'center' });
            doc.save('AccountInformation.pdf');
            this.handleGeneratePdfClick = false;

        } catch (err) {
            console.error('PDF generation error:', JSON.stringify(err));
        }
    }
}