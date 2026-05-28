import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';

interface Invoice { 
  id: number; 
  invoiceNumber: string; 
  date: string; 
  customer: string; 
  items: number; 
  total: number; 
  status: string; 
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const transactions = await transactionService.getTransactions({ limit: 100 });
      const generatedInvoices = transactions.items.map((t: any) => ({
        id: t.id,
        invoiceNumber: `INV-${String(t.id).padStart(6, '0')}`,
        date: t.timestamp,
        customer: t.type === 'OUT' ? 'Walk-in Customer' : 'Supplier',
        items: 1,
        total: t.total_price,
        status: t.type === 'OUT' ? 'paid' : 'pending',
      }));
      setInvoices(generatedInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: monospace; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid #00ffff; margin-bottom: 20px; }
          .total { font-size: 1.2em; font-weight: bold; text-align: right; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 20px; }
        </style></head>
        <body>
          <div class="header">
            <h1>INVENTORY MANAGEMENT SYSTEM</h1>
            <p>123 Business Street, City | Phone: (555) 123-4567</p>
          </div>
          <h2>INVOICE: ${invoice.invoiceNumber}</h2>
          <p>Date: ${new Date(invoice.date).toLocaleString()}</p>
          <p>Customer: ${invoice.customer}</p>
          <hr/>
          <h3>Total Amount: $${invoice.total.toFixed(2)}</h3>
          <p>Status: ${invoice.status.toUpperCase()}</p>
          <div class="total"><p>Thank you for your business!</p></div>
        </body></html>
      `);
      printWindow.print();
      printWindow.close();
    }
  };

  const handleDownload = (invoice: Invoice) => {
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'date', header: 'Date', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'customer', header: 'Customer' },
    { key: 'items', header: 'Items' },
    { key: 'total', header: 'Total', render: (value: number) => `$${value.toFixed(2)}` },
    { 
      key: 'status', 
      header: 'Status', 
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs ${value === 'paid' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-yellow/20 text-neon-yellow'}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, item: Invoice) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handlePrint(item)}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleDownload(item)}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredInvoices = invoices.filter(i =>
    i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-mono text-neon-cyan animate-glow">Invoices</h1>
        <Button onClick={loadInvoices}><FileText className="w-4 h-4" />Refresh</Button>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Input placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={Search} />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div></div>
      ) : (
        <Table columns={columns} data={filteredInvoices} />
      )}
    </div>
  );
}
