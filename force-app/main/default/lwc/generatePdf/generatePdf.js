import { LightningElement, wire, api, track } from 'lwc';
import jsPDFLibrary from '@salesforce/resourceUrl/jsPDFLibrary';
import { loadScript } from 'lightning/platformResourceLoader';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import NAME_FIELD     from "@salesforce/schema/Account.Name";
import RATING_FIELD   from "@salesforce/schema/Account.Rating";
import TYPE_FIELD     from '@salesforce/schema/Account.Type';
import INDUSTRY_FIELD from "@salesforce/schema/Account.Industry";

const fields = [NAME_FIELD, TYPE_FIELD, RATING_FIELD, INDUSTRY_FIELD];

const DARK_NAVY  = [26,  58, 92];
const MID_NAVY   = [44,  82, 130];
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
            this.accountName = getFieldValue(data, NAME_FIELD);
            this.rating      = getFieldValue(data, RATING_FIELD);
            this.type        = getFieldValue(data, TYPE_FIELD);
            this.industry    = getFieldValue(data, INDUSTRY_FIELD);
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
                Id    : r.fields.Id?.value    ?? '',
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
                Id        : r.fields.Id?.value        ?? '',
                Name      : r.fields.Name?.value      ?? '',
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
            const PW  = doc.internal.pageSize.getWidth();
            const PH  = doc.internal.pageSize.getHeight();
            const LM  = 36;
            const RM  = 36;
            const CW  = PW - LM - RM;
            let   y   = 0;

            /* ── helpers ── */
            const checkPage = (needed = 20) => {
                if (y + needed > PH - 40) {
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

            /* ── column layout (same for account, contacts, opps) ── */
            const ROW_H = 20;
            const c1 = LM,            w1 = CW * 0.18;
            const c2 = LM + w1,       w2 = CW * 0.32;
            const c3 = LM + w1 + w2,  w3 = CW * 0.18;
            const c4 = c3 + w3,       w4 = CW - w1 - w2 - w3;

            /* draws a 4-col label|value|label|value row */
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
                hLine(LM, ry + ROW_H, CW, [232, 232, 232]);
                y += ROW_H;
            };

            /* draws a full-width label|value row (spans cols 2-4) */
            const drawInfoRowWide = (label, val) => {
                checkPage(ROW_H);
                const ry = y;
                drawCell(c1, ry, w1, ROW_H, label, { bg: LABEL_BG, textColor: TEXT_MID, fontStyle: 'bold', fontSize: 8 });
                drawCell(c2, ry, w2 + w3 + w4, ROW_H, val, { fontSize: 8 });
                vLine(c2, ry, ROW_H);
                hLine(LM, ry + ROW_H, CW, [232, 232, 232]);
                y += ROW_H;
            };

            /* ── section bar (dark navy full-width) ── */
            const drawSectionBar = (title) => {
                checkPage(18);
                const BAR_H = 18;
                fillRect(LM, y, CW, BAR_H, DARK_NAVY);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(...TEXT_WHITE);
                doc.text(title.toUpperCase(), LM + 10, y + BAR_H / 2 + 3.5);
                y += BAR_H;
            };

            /* ── sub-header bar (mid navy, for each card) ── */
            const drawSubBar = (title) => {
                checkPage(16);
                const BAR_H = 16;
                fillRect(LM, y, CW, BAR_H, SUB_NAVY);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(...TEXT_LIGHT);
                doc.text(title, LM + 10, y + BAR_H / 2 + 3);
                y += BAR_H;
            };

            /* ══════════════════════════════════════
               REPORT HEADER
            ══════════════════════════════════════ */
            const HDR_H = 52;
            fillRect(LM, 28, CW, HDR_H, DARK_NAVY);
            fillRect(LM + 10, 38, 30, 30, WHITE);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(...TEXT_WHITE);
            doc.text('Account Information Report', LM + 50, 52);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(184, 212, 240);
            doc.text('Salesforce CRM \u2014 System Generated', LM + 50, 65);
            y = 28 + HDR_H;

            /* ── meta bar ── */
            const META_H = 34;
            fillRect(LM, y, CW, META_H, META_BG);
            const metaItems = [
                { label: 'Date of Report:', value: this.today },
                { label: 'Record ID:',      value: this.recordId || '' },
                { label: 'Report Type:',    value: 'Account APF Report' },
                { label: 'Prepared By:',    value: 'Sales Team' },
            ];
            const cellW = CW / 4;
            metaItems.forEach((item, i) => {
                const cx = LM + i * cellW;
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
            hLine(LM, y + META_H, CW, [204, 204, 204]);
            y += META_H + 14;

            /* ══════════════════════════════════════
               SECTION 1 — ACCOUNT INFORMATION
            ══════════════════════════════════════ */
            drawSectionBar('Account Information');
            drawInfoRow('Account Name', this.accountName || '', 'Type',   this.type   || '');
            drawInfoRow('Industry',     this.industry    || '', 'Rating', this.rating || '');
            hLine(LM, y, CW, DARK_NAVY);
            y += 14;

            /* ══════════════════════════════════════
               SECTION 2 — RELATED CONTACTS
            ══════════════════════════════════════ */
            drawSectionBar('Related Contacts');

            if (!this.contacts || this.contacts.length === 0) {
                checkPage(20);
                fillRect(LM, y, CW, 20, WHITE);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8.5);
                doc.setTextColor(136, 136, 136);
                doc.text('No contacts found.', LM + 10, y + 13);
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

            hLine(LM, y, CW, DARK_NAVY);
            y += 14;

            /* ══════════════════════════════════════
               SECTION 3 — RELATED OPPORTUNITIES
            ══════════════════════════════════════ */
            drawSectionBar('Related Opportunities');

            if (!this.opportunities || this.opportunities.length === 0) {
                checkPage(20);
                fillRect(LM, y, CW, 20, WHITE);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8.5);
                doc.setTextColor(136, 136, 136);
                doc.text('No opportunities found.', LM + 10, y + 13);
                y += 20;
            } else {
                this.opportunities.forEach(opp => {
                    checkPage(16 + ROW_H * 2 + 4);
                    drawSubBar(`Opportunity #${opp.index}`);
                    drawInfoRow('Name',       opp.Name      || '', 'Stage', opp.StageName || '');
                    drawInfoRowWide('Close Date', opp.CloseDate || '');
                    y += 4; // small gap between cards
                });
            }

            hLine(LM, y, CW, DARK_NAVY);
            y += 12;

            /* ── footer note ── */
            checkPage(20);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(170, 170, 170);
            doc.text('This is a system generated report', PW / 2, y + 10, { align: 'center' });

            doc.save('AccountInformation.pdf');
            this.handleGeneratePdfClick = false;

        } catch (err) {
            console.error('PDF generation error:', JSON.stringify(err));
        }
    }
}