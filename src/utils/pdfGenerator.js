// pdfGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoicePDF = async (invoiceId, elementId = null) => {
    if (elementId) {
        // Option 1: Generate from a specific element (HTML to image to PDF)
        const invoiceElement = document.getElementById(elementId);
        const canvas = await html2canvas(invoiceElement);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 10, 10);
        pdf.save(`Invoice-${invoiceId}.pdf`);
    } else {
        // Option 2: Basic text-only PDF (fallback)
        const pdf = new jsPDF();
        pdf.setFontSize(20);
        pdf.text(`Invoice #${invoiceId}`, 20, 20);
        pdf.save(`Invoice-${invoiceId}.pdf`);
    }
};
