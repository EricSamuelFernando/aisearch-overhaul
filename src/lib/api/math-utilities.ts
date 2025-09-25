import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.CONVERSATION_ENC_DEC_KEY || ""
const formatNumber = (amount: number) => {
  const amountString = String(amount);

  const formattedAmount = amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `$ ${formattedAmount}`;
};

export { formatNumber };

const formatPhoneNumber = (phoneNumber: string | number): string => {
  // Convert the input to a string
  const phoneString = String(phoneNumber).replace(/\D/g, ''); // Remove any non-digit characters

  // Match the phone number parts (area code, first 3 digits, last 4 digits)
  const match = phoneString.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  // Return the original input if it cannot be formatted
  return phoneString;
};

export { formatPhoneNumber };


export const generateTempUserId = (): string => {
  return `temp-${uuidv4()}`;
};

export function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
}

export function decryptMessage(encryptedMessage: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export const generateColorFromName = (name: string): string => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0); // Sum of character codes
  const hue = hash % 360; // Get a value between 0 and 360
  return `hsl(${hue}, 60%, 55%)`; // Increased lightness to 75% for lighter colors
};