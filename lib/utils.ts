
interface QrPayloadData {
    sellerName: string;
    sellerVatNo: string;
    timestamp: string;
    invoiceTotal: string;
    vatTotal: string;
}

/**
 * Generates a ZATCA-compliant QR code payload in Base64 format.
 * This implementation uses dummy cryptographic values as seen in the original source.
 */
export const generateZatcaQrPayload = ({
    sellerName,
    sellerVatNo,
    timestamp,
    invoiceTotal,
    vatTotal,
}: QrPayloadData): string => {
    // Dummy values from provided example, replace with actual crypto for production
    const dummyXMLHash_b64 = "NWU3OThkYTk4YTMzN2Y5ZDU3MTQwM2FkYWFhY2I3MDU3N2ZjMGU2YjM4MDI2YmMwN2Q1Y2E4ODc4ZDZjMjU2NQ==";
    const dummyPublicKey_b64 = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEU6G0iBS4D48AMs7nGY2a6g3vQdFw+3Q+s9lPzVPxRODPLv7flz5rDs2Pwb2aeVIzPMNL2dJNv/MflR+7dB41eQ==";
    const dummySignature_b64 = "MEQCIE3QRrvp4P8C5eTRbQUK1pS2zBv4NaRaODf2V5c+n4yDAiAhAMuB+I2kYSPVzX2w56tnl5jK1ySFyCD+cjO8Q+c2PA==";
    const dummyCertificateSignature_b64 = "MEQCIAYga533L53xhED3T5tS4aUn7c5moIM3tT5i+5T0NKT/AiA11jYjB2qK2RoJGzU6bvrslk/3QcZtV2p1w+arBv4zEA==";

    const base64ToBytes = (base64: string): Uint8Array => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const stringToTLV = (tag: number, value: string): Uint8Array => {
        const valueBytes = new TextEncoder().encode(value);
        return bytesToTLV(tag, valueBytes);
    };
    
    const bytesToTLV = (tag: number, valueBytes: Uint8Array): Uint8Array => {
        const tagBuffer = new Uint8Array([tag]);
        const lengthBuffer = new Uint8Array([valueBytes.length]);
        const result = new Uint8Array(2 + valueBytes.length);
        result.set(tagBuffer, 0);
        result.set(lengthBuffer, 1);
        result.set(valueBytes, 2);
        return result;
    }

    const decodedXmlHash = base64ToBytes(dummyXMLHash_b64);
    const decodedPublicKey = base64ToBytes(dummyPublicKey_b64);
    const decodedSignature = base64ToBytes(dummySignature_b64);
    const decodedCertSignature = base64ToBytes(dummyCertificateSignature_b64);

    const tlvArray = [
        stringToTLV(1, sellerName),
        stringToTLV(2, sellerVatNo),
        stringToTLV(3, timestamp),
        stringToTLV(4, invoiceTotal),
        stringToTLV(5, vatTotal),
        bytesToTLV(6, decodedXmlHash),
        bytesToTLV(7, decodedSignature),
        bytesToTLV(8, decodedPublicKey),
        bytesToTLV(9, decodedCertSignature)
    ];

    const totalLength = tlvArray.reduce((acc, arr) => acc + arr.length, 0);
    const combinedTlv = new Uint8Array(totalLength);
    let offset = 0;
    tlvArray.forEach(arr => {
        combinedTlv.set(arr, offset);
        offset += arr.length;
    });

    return btoa(String.fromCharCode.apply(null, Array.from(combinedTlv)));
};


/**
 * Converts a number to its word representation for the invoice total.
 */
export const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    const [main, decimal] = num.toFixed(2).split('.');
    
    const convertIntegerToWords = (n: number): string => {
        if (n === 0) return '';
        const belowTwenty = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
        const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
        
        const helper = (val: number): string => {
            if (val < 20) return belowTwenty[val];
            if (val < 100) return tens[Math.floor(val/10)] + (val % 10 ? ' ' + belowTwenty[val % 10] : '');
            if (val < 1000) return belowTwenty[Math.floor(val/100)] + ' Hundred' + (val % 100 ? ' and ' + helper(val % 100) : '');
            if (val < 1000000) return helper(Math.floor(val/1000)) + ' Thousand' + (val % 1000 ? ', ' + helper(val % 1000) : '');
             if (val < 1000000000) return helper(Math.floor(val/1000000)) + ' Million' + (val % 1000000 ? ', ' + helper(val % 1000000) : '');
            return 'Number too large';
        }
        return helper(n).trim();
    }

    const mainWords = convertIntegerToWords(parseInt(main));
    let fullStr = mainWords;
    if (decimal && parseInt(decimal) > 0) {
        fullStr += ' and ' + parseInt(decimal) + '/100';
    }
    return fullStr.trim();
}
