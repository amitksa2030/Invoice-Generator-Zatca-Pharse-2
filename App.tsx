import React, { useState } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import type { InvoiceData, InvoiceItem } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const initialItems: InvoiceItem[] = [
    { id: crypto.randomUUID(), title: 'Float Ball Valve, Brass, 1" (25 mm)', description: 'Male threaded type, with all accessories, Made in China/England', quantity: 3, rate: 100.00 },
    { id: crypto.randomUUID(), title: 'Float Ball Valve, Brass, 32 mm', description: 'Male threaded, with accessories, Made in China/England', quantity: 2, rate: 150.00 },
];

const initialInvoiceData: InvoiceData = {
    sellerName: "Top Notepad",
    sellerVatNo: "30001112223343",
    sellerAddress: "PO Box 40 - Dammam 3032\nKingdom of Saudi Arabia\ninfo@topnotepad.com",
    invoiceNo: "99",
    poNo: "POR20230205",
    invoiceDate: new Date().toISOString().split('T')[0],
    buyerName: "Khan for Trading",
    buyerVatNo: "30001112224453",
    buyerAddress: "PO Box 400, Dhahran-30003\nKingdom of Saudi Arabia",
    items: initialItems,
    headerImageUrl: undefined,
    footerImageUrl: undefined,
    watermarkImageUrl: undefined,
};

function App() {
    const [view, setView] = useState<'form' | 'preview'>('form');
    const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleUpdate = (field: keyof InvoiceData, value: any) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemUpdate = (id: string, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = { id: crypto.randomUUID(), title: '', description: '', quantity: 1, rate: 0 };
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    const handleRemoveItem = (id: string) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };
    
    const handleImageChange = (type: 'header' | 'footer' | 'watermark', file: File | null) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setInvoiceData(prev => ({
            ...prev,
            [`${type}ImageUrl`]: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      } else {
         setInvoiceData(prev => ({ ...prev, [`${type}ImageUrl`]: undefined }));
      }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const translationPromises = invoiceData.items.map(async (item) => {
                if (!item.title && !item.description) {
                    return { ...item, titleArabic: '', descriptionArabic: '' };
                }

                const prompt = `Translate the following product title and description for a technical invoice into Arabic.\n\nTitle: "${item.title}"\nDescription: "${item.description}"`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                        },
                    },
                });
                
                const translated = JSON.parse(response.text);
                return { 
                    ...item, 
                    titleArabic: translated.title?.trim() || '', 
                    descriptionArabic: translated.description?.trim() || '' 
                };
            });
            
            const translatedItems = await Promise.all(translationPromises);

            setInvoiceData(prev => ({ ...prev, items: translatedItems }));
            setView('preview');

        } catch (error) {
            console.error("Error translating descriptions:", error);
            alert("Could not translate item descriptions. Please check your API key and network connection. Proceeding without translation.");
            const itemsWithEnglishFallback = invoiceData.items.map(item => ({...item, titleArabic: item.title, descriptionArabic: item.description}));
            setInvoiceData(prev => ({ ...prev, items: itemsWithEnglishFallback }));
            setView('preview');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleEdit = () => setView('form');

    return (
        <div className="min-h-screen">
            {view === 'form' ? (
                <InvoiceForm
                    invoiceData={invoiceData}
                    onUpdate={handleUpdate}
                    onItemUpdate={handleItemUpdate}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                    onGenerate={handleGenerate}
                    onImageChange={handleImageChange}
                    isGenerating={isGenerating}
                />
            ) : (
                <InvoicePreview
                    invoiceData={invoiceData}
                    onEdit={handleEdit}
                />
            )}
        </div>
    );
}

export default App;