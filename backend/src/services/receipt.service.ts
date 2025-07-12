import Sale from '../models/sale.model';
import Business from '../models/business.model';

interface ReceiptData {
  sale: any;
  business: any;
  template?: 'default' | 'compact' | 'detailed';
}

export class ReceiptService {
  async generateReceipt(saleId: string, template: string = 'default'): Promise<string> {
    // Get sale with populated data
    const sale = await Sale.findById(saleId)
      .populate('cashier', 'firstName lastName')
      .populate('items.productId', 'name sku')
      .populate('businessId')
      .populate('shopId', 'name address');

    if (!sale) {
      throw new Error('Sale not found');
    }

    const business = sale.businessId as any;
    const receiptData: ReceiptData = { sale, business, template: template as any };

    switch (template) {
      case 'compact':
        return this.generateCompactReceipt(receiptData);
      case 'detailed':
        return this.generateDetailedReceipt(receiptData);
      default:
        return this.generateDefaultReceipt(receiptData);
    }
  }

  private generateDefaultReceipt(data: ReceiptData): string {
    const { sale, business } = data;
    const date = new Date(sale.createdAt).toLocaleString();

    let receipt = `
=======================================
         ${business.name.toUpperCase()}
=======================================
${business.address?.street || ''}
${business.address?.city || ''}, ${business.address?.state || ''} ${business.address?.zipCode || ''}
${business.phone || ''}
${business.email || ''}

---------------------------------------
Receipt #: ${sale.saleNumber}
Date: ${date}
Cashier: ${(sale.cashier as any).firstName} ${(sale.cashier as any).lastName}
---------------------------------------

ITEMS:
`;

    // Add items
    sale.items.forEach((item: any) => {
      const itemTotal = (item.totalPrice || 0).toFixed(2);
      const unitPrice = (item.unitPrice || 0).toFixed(2);
      
      receipt += `${item.name}\n`;
      receipt += `  ${item.quantity} x $${unitPrice} = $${itemTotal}\n`;
      if (item.sku) {
        receipt += `  SKU: ${item.sku}\n`;
      }
      receipt += `\n`;
    });

    // Add totals
    receipt += `---------------------------------------\n`;
    receipt += `Subtotal:           $${(sale.totals.subtotal || 0).toFixed(2)}\n`;
    
    if (sale.totals.discount > 0) {
      receipt += `Discount:          -$${(sale.totals.discount || 0).toFixed(2)}\n`;
    }
    
    receipt += `Tax:                $${(sale.totals.tax || 0).toFixed(2)}\n`;
    receipt += `TOTAL:              $${(sale.totals.total || 0).toFixed(2)}\n`;
    receipt += `---------------------------------------\n`;

    // Payment info
    receipt += `Payment Method: ${sale.payment.method.toUpperCase()}\n`;
    receipt += `Amount Paid:        $${(sale.payment.paidAmount || 0).toFixed(2)}\n`;
    
    if (sale.payment.changeAmount > 0) {
      receipt += `Change:             $${(sale.payment.changeAmount || 0).toFixed(2)}\n`;
    }

    // Customer info
    if (sale.customer?.name) {
      receipt += `\nCustomer: ${sale.customer.name}\n`;
      if (sale.customer.phone) {
        receipt += `Phone: ${sale.customer.phone}\n`;
      }
    }

    receipt += `\n=======================================\n`;
    receipt += `      Thank you for your business!\n`;
    receipt += `      Please come again!\n`;
    receipt += `=======================================\n`;

    return receipt;
  }

  private generateCompactReceipt(data: ReceiptData): string {
    const { sale, business } = data;
    const date = new Date(sale.createdAt).toLocaleDateString();

    let receipt = `
${business.name}
Receipt #: ${sale.saleNumber}
${date}

`;

    // Add items (compact format)
    sale.items.forEach((item: any) => {
      receipt += `${item.quantity}x ${item.name} - $${(item.totalPrice || 0).toFixed(2)}\n`;
    });

    receipt += `\nTotal: $${(sale.totals.total || 0).toFixed(2)}\n`;
    receipt += `Payment: ${sale.payment.method}\n`;
    
    if (sale.payment.changeAmount > 0) {
      receipt += `Change: $${(sale.payment.changeAmount || 0).toFixed(2)}\n`;
    }

    receipt += `\nThank you!\n`;

    return receipt;
  }

  private generateDetailedReceipt(data: ReceiptData): string {
    const { sale, business } = data;
    const date = new Date(sale.createdAt).toLocaleString();

    let receipt = `
=======================================
         ${business.name.toUpperCase()}
=======================================
${business.address?.street || ''}
${business.address?.city || ''}, ${business.address?.state || ''} ${business.address?.zipCode || ''}
Phone: ${business.phone || 'N/A'}
Email: ${business.email || 'N/A'}
Website: ${business.website || 'N/A'}

---------------------------------------
SALES RECEIPT
---------------------------------------
Receipt #: ${sale.saleNumber}
Date: ${date}
Cashier: ${(sale.cashier as any).firstName} ${(sale.cashier as any).lastName}
Shop: ${sale.shopId?.name || 'Main'}
---------------------------------------

ITEMIZED PURCHASE:
`;

    // Add detailed items
    sale.items.forEach((item: any, index: number) => {
      const itemTotal = (item.totalPrice || 0).toFixed(2);
      const unitPrice = (item.unitPrice || 0).toFixed(2);
      
      receipt += `${index + 1}. ${item.name}\n`;
      receipt += `   SKU: ${item.sku || 'N/A'}\n`;
      receipt += `   Qty: ${item.quantity} @ $${unitPrice} each\n`;
      receipt += `   Total: $${itemTotal}\n`;
      receipt += `\n`;
    });

    // Detailed totals
    receipt += `---------------------------------------\n`;
    receipt += `Items Count:        ${sale.items.length}\n`;
    receipt += `Subtotal:           $${(sale.totals.subtotal || 0).toFixed(2)}\n`;
    
    if (sale.totals.discount > 0) {
      receipt += `Discount Applied:  -$${(sale.totals.discount || 0).toFixed(2)}\n`;
    }
    
    receipt += `Tax (10%):          $${(sale.totals.tax || 0).toFixed(2)}\n`;
    receipt += `GRAND TOTAL:        $${(sale.totals.total || 0).toFixed(2)}\n`;
    receipt += `---------------------------------------\n`;

    // Payment details
    receipt += `PAYMENT INFORMATION:\n`;
    receipt += `Method: ${sale.payment.method.toUpperCase()}\n`;
    receipt += `Amount Tendered:    $${(sale.payment.paidAmount || 0).toFixed(2)}\n`;
    
    if (sale.payment.changeAmount > 0) {
      receipt += `Change Given:       $${(sale.payment.changeAmount || 0).toFixed(2)}\n`;
    }

    receipt += `Payment Status: ${sale.payment.status.toUpperCase()}\n`;

    // Customer information
    if (sale.customer?.name) {
      receipt += `\n---------------------------------------\n`;
      receipt += `CUSTOMER INFORMATION:\n`;
      receipt += `Name: ${sale.customer.name}\n`;
      if (sale.customer.phone) {
        receipt += `Phone: ${sale.customer.phone}\n`;
      }
      if (sale.customer.email) {
        receipt += `Email: ${sale.customer.email}\n`;
      }
    }

    // Footer
    receipt += `\n=======================================\n`;
    receipt += `      THANK YOU FOR YOUR BUSINESS!\n`;
    receipt += `\n`;
    receipt += `Return Policy: Items may be returned\n`;
    receipt += `within 30 days with receipt.\n`;
    receipt += `\n`;
    receipt += `For questions or concerns, please\n`;
    receipt += `contact us at ${business.phone || business.email}\n`;
    receipt += `=======================================\n`;

    return receipt;
  }

  async generateReceiptHTML(saleId: string): Promise<string> {
    const sale = await Sale.findById(saleId)
      .populate('cashier', 'firstName lastName')
      .populate('items.productId', 'name sku')
      .populate('businessId')
      .populate('shopId', 'name');

    if (!sale) {
      throw new Error('Sale not found');
    }

    const business = sale.businessId as any;
    const date = new Date(sale.createdAt).toLocaleString();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt #${sale.saleNumber}</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            max-width: 400px; 
            margin: 0 auto; 
            padding: 20px;
            background: white;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .business-name { font-weight: bold; font-size: 18px; }
        .receipt-info { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 0; }
        .items { margin: 20px 0; }
        .item { margin-bottom: 10px; }
        .item-name { font-weight: bold; }
        .item-details { font-size: 12px; color: #666; }
        .totals { border-top: 1px solid #000; padding-top: 10px; }
        .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
        .grand-total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        @media print {
            body { margin: 0; padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="business-name">${business.name}</div>
        <div>${business.address?.street || ''}</div>
        <div>${business.address?.city || ''}, ${business.address?.state || ''} ${business.address?.zipCode || ''}</div>
        <div>${business.phone || ''}</div>
    </div>
    
    <div class="receipt-info">
        <div><strong>Receipt #:</strong> ${sale.saleNumber}</div>
        <div><strong>Date:</strong> ${date}</div>
        <div><strong>Cashier:</strong> ${(sale.cashier as any).firstName} ${(sale.cashier as any).lastName}</div>
    </div>
    
    <div class="items">
        <h3>Items:</h3>
        ${sale.items.map((item: any) => `
            <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                    ${item.quantity} x $${(item.unitPrice || 0).toFixed(2)} = $${(item.totalPrice || 0).toFixed(2)}
                    ${item.sku ? `<br>SKU: ${item.sku}` : ''}
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="totals">
        <div class="total-line">
            <span>Subtotal:</span>
            <span>$${(sale.totals.subtotal || 0).toFixed(2)}</span>
        </div>
        ${sale.totals.discount > 0 ? `
        <div class="total-line">
            <span>Discount:</span>
            <span>-$${(sale.totals.discount || 0).toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-line">
            <span>Tax:</span>
            <span>$${(sale.totals.tax || 0).toFixed(2)}</span>
        </div>
        <div class="total-line grand-total">
            <span>TOTAL:</span>
            <span>$${(sale.totals.total || 0).toFixed(2)}</span>
        </div>
    </div>
    
    <div class="payment-info">
        <div><strong>Payment:</strong> ${sale.payment.method.toUpperCase()}</div>
        <div><strong>Amount Paid:</strong> $${(sale.payment.paidAmount || 0).toFixed(2)}</div>
        ${sale.payment.changeAmount > 0 ? `<div><strong>Change:</strong> $${(sale.payment.changeAmount || 0).toFixed(2)}</div>` : ''}
    </div>
    
    ${sale.customer?.name ? `
    <div class="customer-info">
        <div><strong>Customer:</strong> ${sale.customer.name}</div>
        ${sale.customer.phone ? `<div><strong>Phone:</strong> ${sale.customer.phone}</div>` : ''}
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Please come again!</p>
    </div>
</body>
</html>
`;

    return html;
  }

  async markReceiptPrinted(saleId: string): Promise<any> {
    return await Sale.findByIdAndUpdate(
      saleId,
      { receiptPrinted: true },
      { new: true }
    );
  }

  async getReceiptData(saleId: string): Promise<any> {
    return await Sale.findById(saleId)
      .populate('cashier', 'firstName lastName')
      .populate('items.productId', 'name sku')
      .populate('businessId')
      .populate('shopId', 'name');
  }
}

export const receiptService = new ReceiptService();