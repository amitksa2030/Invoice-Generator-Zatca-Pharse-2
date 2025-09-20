import React, { useEffect, useState } from 'react';
import type { InvoiceData } from '../../types';
import { generateZatcaQrPayload } from '../../lib/utils';

declare var QRCode: any;

interface ZatcaQrCodeProps {
  invoiceData: InvoiceData;
  totalNet: number;
  totalTax: number;
  size?: number;
}

export const ZatcaQrCode: React.FC<ZatcaQrCodeProps> = ({ invoiceData, totalNet, totalTax, size = 128 }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const payload = generateZatcaQrPayload({
      sellerName: invoiceData.sellerName,
      sellerVatNo: invoiceData.sellerVatNo,
      timestamp: new Date(invoiceData.invoiceDate).toISOString(),
      invoiceTotal: totalNet.toFixed(2),
      vatTotal: totalTax.toFixed(2),
    });

    const tempDiv = document.createElement('div');
    // The QR Code library needs the element to be in the DOM to calculate dimensions and render the canvas.
    // We can add it off-screen and remove it after we've captured the data URL.
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      new QRCode(tempDiv, {
        text: payload,
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.L,
      });

      const canvas = tempDiv.querySelector('canvas');
      if (canvas) {
        setQrCodeDataUrl(canvas.toDataURL('image/png'));
      } else {
        console.error("QR Code canvas was not created.");
      }
    } catch (e) {
      console.error("Error generating QR code:", e);
    } finally {
      document.body.removeChild(tempDiv);
    }

  }, [invoiceData, totalNet, totalTax, size]);

  if (!qrCodeDataUrl) {
    // Return a placeholder while the QR code is generating. The size includes padding.
    return <div style={{ width: size + 8, height: size + 8 }} className="p-1 bg-gray-200 inline-block shadow-sm animate-pulse rounded-md"></div>;
  }

  return (
    <div className="p-1 bg-white inline-block shadow-sm rounded-md">
      <img src={qrCodeDataUrl} alt="ZATCA compliant QR Code" width={size} height={size} />
    </div>
  );
};