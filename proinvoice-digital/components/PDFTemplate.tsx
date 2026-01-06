import React from 'react';
import { Invoice, Client, CompanyProfile, InvoiceItem } from '../types';

interface PDFTemplateProps {
  invoice: Invoice;
  client: Client;
  company: CompanyProfile;
}

export const PDFTemplate: React.FC<PDFTemplateProps> = ({ invoice, client, company }) => {
  const calculateTotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const subTotal = calculateTotal(invoice.items);
  const taxRate = invoice.taxRate || 0;
  const taxAmount = subTotal * (taxRate / 100);
  const totalAmount = subTotal + taxAmount;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    // Using XAF for FCFA formatting
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
  };

  return (
    <div id="pdf-template" className="bg-white text-zinc-800 p-12 w-[210mm] min-h-[297mm] mx-auto relative text-sm font-sans print:w-full print:mx-0 print:p-8">
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-16">
        <div>
          {company.logoUrl ? (
             <img src={company.logoUrl} alt={company.name} className="h-20 w-auto object-contain mb-4 rounded-xl" />
          ) : (
             <div className="text-3xl font-bold text-zinc-900 mb-2 tracking-tighter uppercase">{company.name}</div>
          )}
          
          <div className="text-zinc-500 whitespace-pre-line leading-relaxed font-medium">
            {company.address}
            <br />
            {company.email}
            <br />
            {company.phone}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-bold text-zinc-100 mb-4 tracking-tighter uppercase">Facture</h1>
          <div className="text-zinc-600">
            <span className="font-bold text-zinc-900">N° </span> {invoice.number}
          </div>
          <div className="text-zinc-600">
             <span className="font-bold text-zinc-900">Date :</span> {formatDate(invoice.date)}
          </div>
          <div className="text-zinc-600">
             <span className="font-bold text-zinc-900">Échéance :</span> {formatDate(invoice.dueDate)}
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="flex justify-end mb-16">
        <div className="w-1/2 bg-zinc-50 p-6 rounded-lg border border-zinc-100">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Facturer à</div>
          <div className="text-xl font-bold text-zinc-900">{client.name}</div>
          <div className="text-zinc-600 whitespace-pre-line leading-relaxed mt-2">
            {client.address}
            <br />
            {client.phone}
            {client.email && (
                <>
                    <br />
                    {client.email}
                </>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-zinc-900">
              <th className="text-left py-4 text-xs font-bold text-zinc-900 uppercase tracking-wider">Description</th>
              <th className="text-right py-4 text-xs font-bold text-zinc-900 uppercase tracking-wider w-24">Qté</th>
              <th className="text-right py-4 text-xs font-bold text-zinc-900 uppercase tracking-wider w-32">Prix Unit.</th>
              <th className="text-right py-4 text-xs font-bold text-zinc-900 uppercase tracking-wider w-40">Total</th>
            </tr>
          </thead>
          <tbody className="text-zinc-600">
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-4 pr-4">
                  <div className="font-bold text-zinc-900">{item.description}</div>
                </td>
                <td className="py-4 text-right align-top font-medium">{item.quantity}</td>
                <td className="py-4 text-right align-top font-medium">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 text-right font-bold text-zinc-900 align-top">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 max-w-xs">
          <div className="flex justify-between text-zinc-600 text-sm mb-2">
             <span>Total HT</span>
             <span>{formatCurrency(subTotal)}</span>
          </div>
          {taxRate > 0 && (
             <div className="flex justify-between text-zinc-600 text-sm mb-2">
                <span>TVA ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
             </div>
          )}
          
          <div className="flex justify-between text-zinc-900 text-2xl font-bold pt-4 border-t-2 border-zinc-900">
            <span>Total TTC</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          {taxRate === 0 && (
              <div className="text-right text-xs text-zinc-400 mt-2">Exonéré de TVA</div>
          )}
        </div>
      </div>

      {/* Specific Notes */}
      {invoice.notes && (
          <div className="mb-12 p-4 bg-zinc-50 border-l-4 border-zinc-200 rounded-r-lg">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-zinc-700 whitespace-pre-line">{invoice.notes}</p>
          </div>
      )}

      {/* Footer / Payment Info */}
      <div className="absolute bottom-12 left-12 right-12 text-zinc-500 text-xs border-t border-zinc-100 pt-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-zinc-900 mb-2 uppercase tracking-wider">Informations de paiement</h4>
            <div className="space-y-1 font-medium">
               {company.iban && <p>IBAN: <span className="font-mono text-zinc-600">{company.iban}</span></p>}
               {company.bic && <p>BIC: <span className="font-mono text-zinc-600">{company.bic}</span></p>}
               {!company.iban && <p>Veuillez effectuer le règlement par les moyens convenus (Chèque / Virement / Mobile Money).</p>}
            </div>
          </div>
          <div className="text-right">
             <h4 className="font-bold text-zinc-900 mb-2 uppercase tracking-wider">Mentions légales</h4>
             {company.siret && <p>NIF/RCCM: {company.siret}</p>}
             <p>{company.footerText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};