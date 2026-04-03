/**
 * CryptoVault Service — Main service class for crypto custody operations.
 * Handles API calls to CryptoVault middleware.
 * MiCA compliant — all operations are audited.
 */
public with sharing class CryptoVaultService {

    private static final String API_BASE_URL = 'callout:CryptoVault_API/v1';

    /**
     * Get crypto positions for a client
     */
    public static Map<String, Object> getClientPositions(String contactId) {
        HttpRequest req = buildRequest('GET', '/clients/' + contactId + '/wallets');
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Get client statement (MiCA Art. 75 compliant)
     */
    public static Map<String, Object> getClientStatement(String contactId) {
        HttpRequest req = buildRequest('GET', '/clients/' + contactId + '/statement');
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Get wallet balance (real-time from custodian)
     */
    public static Map<String, Object> getWalletBalance(String walletId) {
        HttpRequest req = buildRequest('GET', '/wallets/' + walletId + '/balance');
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Get deposit address for a wallet
     */
    public static Map<String, Object> getDepositAddress(String walletId) {
        HttpRequest req = buildRequest('GET', '/wallets/' + walletId + '/address');
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Get transaction history for a client
     */
    public static Map<String, Object> getClientTransactions(String contactId) {
        HttpRequest req = buildRequest('GET', '/clients/' + contactId + '/transactions');
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Get KYC status for a client
     */
    public static Map<String, Object> getKycStatus(String contactId) {
        HttpRequest req = buildRequest('GET', '/clients/' + contactId + '/kyc-status');
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Initiate a withdrawal
     */
    public static Map<String, Object> initiateWithdrawal(Map<String, Object> params) {
        HttpRequest req = buildRequest('POST', '/transactions/withdraw');
        req.setBody(JSON.serialize(params));
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Get global AuC report
     */
    public static Map<String, Object> getAucReport() {
        HttpRequest req = buildRequest('GET', '/reports/auc');
        HttpResponse res = sendRequest(req);
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    /**
     * Get AML alerts for compliance
     */
    public static List<Object> getAmlAlerts() {
        HttpRequest req = buildRequest('GET', '/reports/aml-alerts');
        HttpResponse res = sendRequest(req);
        return (List<Object>) JSON.deserializeUntyped(res.getBody());
    }

    // --- Private helpers ---

    private static HttpRequest buildRequest(String method, String endpoint) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_BASE_URL + endpoint);
        req.setMethod(method);
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-Request-Id', generateRequestId());
        req.setTimeout(30000);
        return req;
    }

    private static HttpResponse sendRequest(HttpRequest req) {
        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() >= 400) {
            throw new CryptoVaultException(
                'API Error: ' + res.getStatusCode() + ' - ' + res.getBody()
            );
        }

        return res;
    }

    private static String generateRequestId() {
        Blob b = Crypto.generateAesKey(128);
        return EncodingUtil.convertToHex(b);
    }

    public class CryptoVaultException extends Exception {}
}
