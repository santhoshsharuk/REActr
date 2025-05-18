// ESC/POS Commands for thermal printers
const ESC = '\x1B';
const GS = '\x1D';
const INIT = ESC + '@';
const CUT = GS + 'V' + '\x01';
const TEXT_FORMAT = {
  NORMAL: ESC + '!' + '\x00',
  BOLD: ESC + '!' + '\x08',
  DOUBLE_HEIGHT: ESC + '!' + '\x10',
  DOUBLE_WIDTH: ESC + '!' + '\x20',
  UNDERLINE: ESC + '!' + '\x80',
};
const LINE_FEED = '\x0A';
const ALIGN = {
  LEFT: ESC + 'a' + '\x00',
  CENTER: ESC + 'a' + '\x01',
  RIGHT: ESC + 'a' + '\x02',
};

class BluetoothPrinter {
  constructor() {
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
    this.encoder = new TextEncoder();
  }

  // Check if Web Bluetooth is supported
  isSupported() {
    return 'bluetooth' in navigator;
  }

  // Connect to a Bluetooth printer
  async connect() {
    if (!this.isSupported()) {
      throw new Error('Bluetooth is not supported in this browser');
    }

    try {
      // Request device with printer service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Common printer service
          { services: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] }, // ESC/POS service
          { services: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] }, // Printer Service
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'BT' }
        ],
        optionalServices: ['battery_service']
      });

      if (!this.device) {
        throw new Error('No printer selected');
      }

      // Connect to the device
      const server = await this.device.gatt.connect();
      
      // Find the appropriate service
      const services = await server.getPrimaryServices();
      let characteristic = null;
      
      // Loop through services to find a writable characteristic
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristic = char;
            break;
          }
        }
        
        if (characteristic) break;
      }
      
      if (!characteristic) {
        throw new Error('No suitable printer characteristic found');
      }
      
      this.characteristic = characteristic;
      this.isConnected = true;
      
      return true;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  // Disconnect from the printer
  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.characteristic = null;
  }

  // Print text to the printer
  async print(text) {
    if (!this.isConnected) {
      throw new Error('Not connected to a printer');
    }

    try {
      // Initialize printer
      await this.sendCommand(INIT);
      
      // Print the text
      await this.sendCommand(text);
      
      // Cut the paper
      await this.sendCommand(CUT);
      
      return true;
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  // Print a receipt
  async printReceipt(receiptData) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      let receipt = '';
      
      // Add header
      receipt += ALIGN.CENTER;
      receipt += TEXT_FORMAT.BOLD;
      
      if (receiptData.logo) {
        // Logo would require image printing commands - omitted for simplicity
      }
      
      receipt += receiptData.storeName + LINE_FEED;
      receipt += TEXT_FORMAT.NORMAL;
      receipt += receiptData.address + LINE_FEED;
      receipt += "Phone: " + receiptData.phone + LINE_FEED;
      receipt += LINE_FEED;
      
      // Add invoice number and date
      receipt += ALIGN.LEFT;
      receipt += "Invoice #" + receiptData.invoiceId + LINE_FEED;
      receipt += "Date: " + receiptData.date + LINE_FEED;
      receipt += LINE_FEED;
      
      // Add items header
      receipt += "--------------------------------" + LINE_FEED;
      receipt += "Item       Qty   Price    Total" + LINE_FEED;
      receipt += "--------------------------------" + LINE_FEED;
      
      // Add items
      receiptData.items.forEach(item => {
        const name = item.name.substring(0, 10).padEnd(10, ' ');
        const qty = String(item.qty).padStart(4, ' ');
        const price = String(item.price.toFixed(2)).padStart(8, ' ');
        const total = String((item.qty * item.price).toFixed(2)).padStart(8, ' ');
        
        receipt += name + qty + price + total + LINE_FEED;
      });
      
      receipt += "--------------------------------" + LINE_FEED;
      
      // Add totals
      receipt += ALIGN.RIGHT;
      receipt += "Subtotal: " + receiptData.subtotal.toFixed(2) + LINE_FEED;
      
      if (receiptData.gst) {
        receipt += "GST (18%): " + receiptData.gst.toFixed(2) + LINE_FEED;
      }
      
      receipt += TEXT_FORMAT.BOLD;
      receipt += "Total: " + receiptData.total.toFixed(2) + LINE_FEED;
      receipt += TEXT_FORMAT.NORMAL + LINE_FEED;
      
      // Add footer
      receipt += ALIGN.CENTER;
      receipt += "Thank you for your business!" + LINE_FEED;
      receipt += "--------------------------------" + LINE_FEED;
      receipt += LINE_FEED;
      receipt += LINE_FEED;
      
      // Print the receipt
      await this.print(receipt);
      
      return true;
    } catch (error) {
      console.error('Receipt print error:', error);
      throw error;
    }
  }

  // Send a command to the printer
  async sendCommand(command) {
    const data = this.encoder.encode(command);
    await this.characteristic.writeValue(data);
  }
}

export default new BluetoothPrinter();