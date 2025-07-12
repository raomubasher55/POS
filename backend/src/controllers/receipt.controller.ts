import { Request, Response } from 'express';
import { receiptService } from '../services/receipt.service';

export const generateReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const { template = 'default', format = 'text' } = req.query;

    if (format === 'html') {
      const receiptHTML = await receiptService.generateReceiptHTML(saleId);
      res.setHeader('Content-Type', 'text/html');
      res.send(receiptHTML);
      return;
    }

    const receipt = await receiptService.generateReceipt(saleId, template as string);
    
    // Mark receipt as printed
    await receiptService.markReceiptPrinted(saleId);

    res.setHeader('Content-Type', 'text/plain');
    res.send(receipt);

  } catch (error: any) {
    console.error('Generate receipt error:', error);
    if (error.message === 'Sale not found') {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReceiptData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const receiptData = await receiptService.getReceiptData(saleId);

    if (!receiptData) {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }

    res.json({ receipt: receiptData });

  } catch (error) {
    console.error('Get receipt data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const printReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const { template = 'default' } = req.body;

    const receipt = await receiptService.generateReceipt(saleId, template);
    
    // Mark receipt as printed
    await receiptService.markReceiptPrinted(saleId);

    res.json({ 
      message: 'Receipt generated successfully',
      receipt,
      printed: true
    });

  } catch (error: any) {
    console.error('Print receipt error:', error);
    if (error.message === 'Sale not found') {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const emailReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const { email, template = 'default' } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email address required' });
      return;
    }

    // Get receipt HTML for email
    const receiptHTML = await receiptService.generateReceiptHTML(saleId);
    
    // TODO: Integrate with email service (SendGrid, etc.)
    // For now, just return the HTML content
    
    res.json({ 
      message: 'Receipt email functionality ready',
      email,
      receiptHTML,
      note: 'Email integration to be implemented with email service provider'
    });

  } catch (error: any) {
    console.error('Email receipt error:', error);
    if (error.message === 'Sale not found') {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};