/**
 * Lightning Web Component Controller for CryptoVault.
 * Provides @AuraEnabled methods for LWC components.
 */
public with sharing class CryptoVaultController {

    @AuraEnabled(cacheable=true)
    public static String getPositions(String contactId) {
        try {
            Map<String, Object> result = CryptoVaultService.getClientPositions(contactId);
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getStatement(String contactId) {
        try {
            Map<String, Object> result = CryptoVaultService.getClientStatement(contactId);
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getTransactions(String contactId) {
        try {
            Map<String, Object> result = CryptoVaultService.getClientTransactions(contactId);
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getKycStatus(String contactId) {
        try {
            Map<String, Object> result = CryptoVaultService.getKycStatus(contactId);
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getWalletBalance(String walletId) {
        try {
            Map<String, Object> result = CryptoVaultService.getWalletBalance(walletId);
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getDepositAddress(String walletId) {
        try {
            Map<String, Object> result = CryptoVaultService.getDepositAddress(walletId);
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getAucReport() {
        try {
            Map<String, Object> result = CryptoVaultService.getAucReport();
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getAmlAlerts() {
        try {
            List<Object> result = CryptoVaultService.getAmlAlerts();
            return JSON.serialize(result);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
