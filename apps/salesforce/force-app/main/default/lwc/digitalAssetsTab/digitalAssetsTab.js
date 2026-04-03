import { LightningElement, api, wire } from 'lwc';
import getPositions from '@salesforce/apex/CryptoVaultController.getPositions';
import getKycStatus from '@salesforce/apex/CryptoVaultController.getKycStatus';

const POSITION_COLUMNS = [
    { label: 'Asset', fieldName: 'asset', type: 'text' },
    { label: 'Quantite', fieldName: 'quantity', type: 'text' },
    { label: 'Valeur EUR', fieldName: 'totalValueEur', type: 'currency', typeAttributes: { currencyCode: 'EUR' } },
    { label: 'Adresse', fieldName: 'walletAddress', type: 'text' },
    { label: 'Custodian', fieldName: 'custodian', type: 'text' },
];

export default class DigitalAssetsTab extends LightningElement {
    @api recordId; // Contact or Account ID

    positions = [];
    kycStatus = '';
    totalAuc = 0;
    positionColumns = POSITION_COLUMNS;

    @wire(getPositions, { contactId: '$recordId' })
    wiredPositions({ error, data }) {
        if (data) {
            const parsed = JSON.parse(data);
            this.positions = parsed || [];
            this.totalAuc = this.positions.reduce((sum, p) => sum + (p.balanceEur || 0), 0);
        } else if (error) {
            console.error('Error loading positions:', error);
        }
    }

    @wire(getKycStatus, { contactId: '$recordId' })
    wiredKycStatus({ error, data }) {
        if (data) {
            const parsed = JSON.parse(data);
            this.kycStatus = parsed.status || 'unknown';
        }
    }

    get hasPositions() {
        return this.positions && this.positions.length > 0;
    }

    get kycPending() {
        return this.kycStatus === 'pending_kyc' || this.kycStatus === 'kyc_in_progress';
    }

    get totalAucFormatted() {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(this.totalAuc);
    }

    get walletCount() {
        return this.positions ? this.positions.length : 0;
    }

    get kycStatusLabel() {
        const labels = {
            pending_kyc: 'En attente',
            kyc_in_progress: 'En cours',
            kyc_approved: 'Verifie',
            active: 'Actif',
            kyc_rejected: 'Rejete',
        };
        return labels[this.kycStatus] || this.kycStatus;
    }

    handleDeposit() {
        // Open deposit modal
    }

    handleWithdraw() {
        // Open withdrawal modal
    }

    handleStatement() {
        // Generate and download statement PDF
    }

    handleKycStatus() {
        // Show KYC detail
    }
}
