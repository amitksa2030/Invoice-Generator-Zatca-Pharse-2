import React, { useMemo, useState, useRef } from 'react';
import type { InvoiceData } from '../types';
import { numberToWords } from '../lib/utils';
import { ZatcaQrCode } from './templates/ZatcaQrCode';

declare var html2canvas: any;
declare var jspdf: any;

interface InvoicePreviewProps {
    invoiceData: InvoiceData;
    onEdit: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData, onEdit }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadOptionsVisible, setDownloadOptionsVisible] = useState(false);
    const [previewLang, setPreviewLang] = useState<'en' | 'ar'>('en');
    const printableAreaRef = useRef<HTMLDivElement>(null);

    const { totalTaxable, totalTax, totalNet } = useMemo(() => {
        let taxable = invoiceData.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
        const tax = taxable * 0.15;
        const net = taxable + tax;
        return { totalTaxable: taxable, totalTax: tax, totalNet: net };
    }, [invoiceData.items]);

    const handleDownload = async (lang: 'en' | 'ar') => {
        setIsDownloading(true);
        setDownloadOptionsVisible(false);
        const elementToPrint = printableAreaRef.current;
        if (!elementToPrint) return;

        // Temporarily set the language for rendering
        const originalLang = previewLang;
        setPreviewLang(lang);

        // Allow state to update and component to re-render
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const canvas = await html2canvas(elementToPrint, {
                scale: 2,
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${invoiceData.invoiceNo}-${lang}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Sorry, an error occurred while generating the PDF.");
        } finally {
            // Revert to original language
            setPreviewLang(originalLang);
            setIsDownloading(false);
        }
    };

    return (
        <div className="bg-gray-100 p-4 sm:p-8 font-sans preview-wrapper">
             <style>{`
                .lang-en-only .arabic-text { display: none !important; }
                .lang-ar-only .english-text { display: none !important; }
                 @media print {
                    body {
                        background: white !important;
                    }
                    .controls-container {
                        display: none !important;
                    }
                    .preview-wrapper {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: transparent !important;
                    }
                    #printable-invoice {
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        min-height: initial !important; /* Override screen-only min-height */
                        position: static !important; /* Ensure it's in the document flow */
                    }
                    .lang-ar-only {
                        direction: rtl;
                    }
                }
            `}</style>
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 print:hidden controls-container">
                 <div className="flex bg-white rounded-lg shadow-md p-1">
                    <button 
                        onClick={() => setPreviewLang('en')} 
                        className={`w-full text-sm font-bold py-1 px-3 rounded-md transition ${previewLang === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        aria-pressed={previewLang === 'en'}>
                        English
                    </button>
                    <button 
                        onClick={() => setPreviewLang('ar')} 
                        className={`w-full text-sm font-bold py-1 px-3 rounded-md transition ${previewLang === 'ar' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        aria-pressed={previewLang === 'ar'}>
                        Arabic
                    </button>
                </div>
                 <button onClick={() => window.print()} className="bg-white text-gray-700 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-50 transition flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Invoice
                </button>
                <div className="relative">
                     <button onClick={() => setDownloadOptionsVisible(!downloadOptionsVisible)} disabled={isDownloading} className="bg-white text-gray-700 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-50 transition flex items-center gap-2 w-full justify-center disabled:opacity-50">
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                    {downloadOptionsVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('en'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English Only</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('ar'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Arabic Only</a>
                        </div>
                    )}
                </div>
                <button onClick={onEdit} className="bg-white text-gray-700 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-50 transition flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                    Edit Invoice
                </button>
            </div>
            
            <div id="printable-invoice" ref={printableAreaRef} className={`mx-auto bg-white shadow-lg w-[210mm] min-h-[297mm] flex flex-col text-gray-800 relative ${previewLang === 'en' ? 'lang-en-only' : 'lang-ar-only'}`} dir={previewLang === 'ar' ? 'rtl' : 'ltr'}>
                 {invoiceData.watermarkImageUrl && (
                    <img src={invoiceData.watermarkImageUrl} className="absolute inset-0 w-full h-full object-contain object-center opacity-10 z-0" alt="Watermark" />
                )}
                <div className="relative z-10 flex flex-col flex-grow">
                    {invoiceData.headerImageUrl && (
                        <header>
                            <img src={invoiceData.headerImageUrl} className="w-full h-auto" alt="Invoice Header" />
                        </header>
                    )}
                    
                    <main className="flex-grow p-12">
                         {/* Combined Header */}
                        <section className="flex justify-between items-start mb-12">
                             {/* Billed To */}
                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-500 uppercase">
                                    <span className="english-text">Billed To</span>
                                    <span className="arabic-text">فاتورة إلى</span>
                                </p>
                                <div className="mt-2">
                                    <p className="text-lg font-bold text-gray-800">{invoiceData.buyerName}</p>
                                    <p className="whitespace-pre-wrap text-sm text-gray-600">{invoiceData.buyerAddress}</p>
                                    {invoiceData.buyerVatNo && <p className="text-sm text-gray-600"><span className="english-text">VAT Reg: </span><span className="arabic-text">الرقم الضريبي: </span>{invoiceData.buyerVatNo}</p>}
                                </div>
                            </div>

                             {/* Invoice Metadata */}
                            <div className="text-right">
                                 <h1 className="text-4xl font-bold uppercase text-indigo-600">
                                    <span className="english-text">Invoice</span>
                                    <span className="arabic-text">فاتورة</span>
                                 </h1>
                                <div className="space-y-1 mt-2 text-sm">
                                    <p><span className="english-text">Invoice # </span><span className="arabic-text">رقم الفاتورة </span> <span className="font-semibold">{invoiceData.invoiceNo}</span></p>
                                    <p><span className="english-text">Date: </span><span className="arabic-text">التاريخ </span> <span className="font-semibold">{invoiceData.invoiceDate}</span></p>
                                    {invoiceData.poNo && <p><span className="english-text">P.O. #: </span><span className="arabic-text">رقم طلب الشراء </span> <span className="font-semibold">{invoiceData.poNo}</span></p>}
                                </div>
                            </div>
                        </section>


                        {/* Items Table */}
                        <section>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-gray-600 uppercase text-xs text-left border-b-2 border-gray-200">
                                        <th className="py-3 px-4 font-semibold"><div className="english-text">Description</div><div className="arabic-text text-right">الوصف</div></th>
                                        <th className="py-3 px-4 text-center font-semibold"><div className="english-text">Qty</div><div className="arabic-text">الكمية</div></th>
                                        <th className="py-3 px-4 text-right font-semibold"><div className="english-text">Rate</div><div className="arabic-text">السعر</div></th>
                                        <th className="py-3 px-4 text-right font-semibold"><div className="english-text">Amount</div><div className="arabic-text">المبلغ</div></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium text-gray-700">
                                                <div className="english-text text-left">
                                                    <p className="font-semibold">{item.title}</p>
                                                    {item.description && <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.description}</p>}
                                                </div>
                                                <div className="arabic-text text-right">
                                                    <p className="font-semibold">{item.titleArabic}</p>
                                                    {item.descriptionArabic && <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.descriptionArabic}</p>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right text-gray-700">{item.rate.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right font-medium text-gray-800">{(item.quantity * item.rate).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                        
                         {/* Footer section with Totals and QR Code */}
                        <footer className="mt-auto pt-10">
                             <section className="mb-6 text-left">
                                <h3 className="text-sm font-semibold text-gray-700"><span className="english-text">Amount in Words</span><span className="arabic-text">المبلغ بالكلمات</span></h3>
                                <p className="text-xs text-gray-600"><span className="english-text">{numberToWords(totalNet)} Riyals Only</span><span className="arabic-text">{numberToWords(totalNet)} ريال فقط</span></p>
                            </section>
                            <section className="flex justify-between items-end">
                                <div>
                                    <ZatcaQrCode invoiceData={invoiceData} totalNet={totalNet} totalTax={totalTax} size={112} />
                                </div>
                                <div className="w-full max-w-sm space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500"><span className="english-text">Subtotal</span><span className="arabic-text">المجموع الفرعي</span></span>
                                        <span className="font-medium text-gray-700">{totalTaxable.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500"><span className="english-text">VAT (15%)</span><span className="arabic-text">ضريبة القيمة المضافة (15%)</span></span>
                                        <span className="font-medium text-gray-700">{totalTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-indigo-600 pt-3 border-t-2 border-indigo-100">
                                        <span><span className="english-text">Grand Total</span><span className="arabic-text">المجموع الإجمالي</span></span>
                                        <span>SAR {totalNet.toFixed(2)}</span>
                                    </div>
                                </div>
                            </section>
                        </footer>
                    </main>

                    {invoiceData.footerImageUrl && (
                        <footer className="mt-auto">
                            <img src={invoiceData.footerImageUrl} className="w-full h-auto" alt="Invoice Footer" />
                        </footer>
                    )}
                </div>
            </div>
        </div>
    );
};