import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Phone, FileText } from 'lucide-react';
import { ContactFormData } from '../../types';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    mobile: '',
    message: '',
    productInterest: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData object for submission
      const formSubmitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formSubmitData.append(key, value);
        }
      });
      
      // Add FormSubmit specific fields
      formSubmitData.append('_subject', 'New Contact Form Submission - Shivaya Solutions');
      formSubmitData.append('_template', 'table');
      formSubmitData.append('_captcha', 'false');
      
      // Send data using fetch
      const response = await fetch('https://formsubmit.co/guptahariom049@gmail.com', {
        method: 'POST',
        body: formSubmitData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Success
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        message: '',
        productInterest: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-brand-dark-card rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-light-primary dark:text-dark-primary mb-4">
          Get In Touch
        </h2>
        <p className="text-light-secondary dark:text-dark-secondary">
          Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg flex items-center space-x-2"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Message sent successfully! We'll get back to you soon.</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot anti-spam field (hidden from real users) */}
        <input type="text" name="_honey" style={{ display: 'none' }} />
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-light-primary dark:text-dark-primary mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input-field pl-12 w-full h-12 text-base"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-light-primary dark:text-dark-primary mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-field pl-12 w-full h-12 text-base"
              placeholder="Enter your email address"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-light-primary dark:text-dark-primary mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="input-field pl-12 w-full h-12 text-base"
              placeholder="Enter your phone number (optional)"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="productInterest" className="block text-sm font-medium text-light-primary dark:text-dark-primary mb-2">
            Subject
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              id="productInterest"
              name="productInterest"
              value={formData.productInterest}
              onChange={handleInputChange}
              className="input-field pl-12 w-full h-12 text-base"
              placeholder="What products are you interested in? (optional)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-light-primary dark:text-dark-primary mb-2">
            Message *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={5}
              className="input-field pl-12 resize-none w-full text-base pt-4"
              placeholder="Tell us about your inquiry..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="loading-spinner w-5 h-5"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-light-border dark:border-dark-border">
        <p className="text-sm text-light-secondary dark:text-dark-secondary text-center">
          We typically respond within 24 hours during business days.
        </p>
      </div>
    </div>
  );
};

export default ContactForm;