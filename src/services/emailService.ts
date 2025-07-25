// @ts-ignore: No types for emailjs-com
import emailjs from 'emailjs-com';
import { ContactFormData } from '../types';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: "your_service_id", // Replace with your EmailJS service ID
  TEMPLATE_ID: "your_template_id", // Replace with your EmailJS template ID
  PUBLIC_KEY: "your_public_key" // Replace with your EmailJS public key
};

export const sendContactEmailFormSubmit = async (formData: ContactFormData): Promise<boolean> => {
  try {
    // Initialize EmailJS (call this once in your app)
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

    const templateParams = {
      to_email: "shivayasolutions0167@gmail.com",
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      reply_to: formData.email
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};