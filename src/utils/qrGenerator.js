import QRCode from 'qrcode';
export async function generateQRCode(text) {
  try { return await QRCode.toDataURL(text); }
  catch (e) { console.error(e); return null; }
}