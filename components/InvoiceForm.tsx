import React from 'react';
import type { InvoiceData, InvoiceItem } from '../types';

interface InvoiceFormProps {
    invoiceData: InvoiceData;
    onUpdate: (field: keyof InvoiceData, value: any) => void;
    onItemUpdate: (id: string, field: keyof InvoiceItem, value: string | number) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    onGenerate: () => void;
    onImageChange: (type: 'header' | 'footer' | 'watermark', file: File | null) => void;
    isGenerating: boolean;
}

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const InputGroup: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
);

const FileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
     <input {...props} type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
);

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, onUpdate, onItemUpdate, onAddItem, onRemoveItem, onGenerate, onImageChange, isGenerating }) => {
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate();
    };
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Tax Invoice Generator</h1>
                <p className="text-gray-500 mt-2">Fill in the details to create your professional invoice.</p>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormSection title="Seller Details">
                        <InputGroup label="Seller Name"><TextInput type="text" value={invoiceData.sellerName} onChange={e => onUpdate('sellerName', e.target.value)} required /></InputGroup>
                        <InputGroup label="Seller TIN/VAT No"><TextInput type="text" value={invoiceData.sellerVatNo} onChange={e => onUpdate('sellerVatNo', e.target.value)} required /></InputGroup>
                        <InputGroup label="Seller Address"><TextArea rows={3} value={invoiceData.sellerAddress} onChange={e => onUpdate('sellerAddress', e.target.value)} required /></InputGroup>
                    </FormSection>
                    <FormSection title="Invoice Metadata">
                         <InputGroup label="Invoice #"><TextInput type="text" value={invoiceData.invoiceNo} onChange={e => onUpdate('invoiceNo', e.target.value)} required /></InputGroup>
                         <InputGroup label="PO #"><TextInput type="text" value={invoiceData.poNo} onChange={e => onUpdate('poNo', e.target.value)} /></InputGroup>
                         <InputGroup label="Invoice Date"><TextInput type="date" value={invoiceData.invoiceDate} onChange={e => onUpdate('invoiceDate', e.target.value)} required /></InputGroup>
                    </FormSection>
                </div>

                <FormSection title='Buyer Details ("Bill To")'>
                    <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup label="Buyer Name"><TextInput type="text" value={invoiceData.buyerName} onChange={e => onUpdate('buyerName', e.target.value)} required /></InputGroup>
                        <InputGroup label="Buyer TIN/VAT No"><TextInput type="text" value={invoiceData.buyerVatNo} onChange={e => onUpdate('buyerVatNo', e.target.value)} /></InputGroup>
                    </div>
                    <InputGroup label="Buyer Address"><TextArea rows={3} value={invoiceData.buyerAddress} onChange={e => onUpdate('buyerAddress', e.target.value)} required /></InputGroup>
                </FormSection>

                 <FormSection title="Branding & Layout">
                    <div className="grid md:grid-cols-3 gap-6">
                        <InputGroup label="Header Image">
                            <FileInput accept="image/*" onChange={e => onImageChange('header', e.target.files ? e.target.files[0] : null)} />
                        </InputGroup>
                         <InputGroup label="Footer Image">
                            <FileInput accept="image/*" onChange={e => onImageChange('footer', e.target.files ? e.target.files[0] : null)} />
                        </InputGroup>
                         <InputGroup label="Watermark Image">
                            <FileInput accept="image/*" onChange={e => onImageChange('watermark', e.target.files ? e.target.files[0] : null)} />
                        </InputGroup>
                    </div>
                </FormSection>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Invoice Items</h3>
                    <div className="hidden md:grid grid-cols-[1fr_100px_120px_auto] gap-4 font-sans text-sm font-medium text-gray-500 mb-2">
                        <span>ITEM DETAILS</span>
                        <span className="text-right">QUANTITY</span>
                        <span className="text-right">RATE</span>
                        <span></span>
                    </div>
                    <div className="space-y-4">
                        {invoiceData.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_auto] gap-4 items-start">
                                <div className="flex flex-col gap-2">
                                    <TextInput placeholder="Title" value={item.title} onChange={e => onItemUpdate(item.id, 'title', e.target.value)} className="font-semibold" />
                                    <TextArea placeholder="Description (optional)" value={item.description} onChange={e => onItemUpdate(item.id, 'description', e.target.value)} rows={2} />
                                </div>
                                <TextInput type="number" value={item.quantity} onChange={e => onItemUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="text-right" />
                                <TextInput type="number" step="0.01" value={item.rate.toFixed(2)} onChange={e => onItemUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)} className="text-right" />
                                <button type="button" onClick={() => onRemoveItem(item.id)} className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors mt-2 md:mt-0">&times;</button>
                            </div>
                        ))}
                    </div>
                     <div className="mt-6 flex justify-center">
                        <button type="button" onClick={onAddItem} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-colors">Add Another Item</button>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors text-lg disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto" disabled={isGenerating}>
                        {isGenerating && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isGenerating ? 'Generating...' : 'Generate Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
};