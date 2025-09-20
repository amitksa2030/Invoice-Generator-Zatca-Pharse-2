export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  titleArabic?: string;
  descriptionArabic?: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  sellerName: string;
  sellerVatNo: string;
  sellerAddress: string;
  invoiceNo: string;
  poNo: string;
  invoiceDate: string;
  buyerName: string;
  buyerVatNo: string;
  buyerAddress: string;
  items: InvoiceItem[];
  headerImageUrl?: string;
  footerImageUrl?: string;
  watermarkImageUrl?: string;
}