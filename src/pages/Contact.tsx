import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Instagram, Linkedin } from 'lucide-react';
import ContactForm from '../components/Contact/ContactForm';

const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'shivayasolutions0167@gmail.com',
      link: 'mailto:shivayasolutions0167@gmail.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 9899716237',
      link: 'https://wa.me/919899716237'
    },
    {
      icon: Instagram,
      title: 'Instagram',
      value: '@shivayasolutions',
      link: 'https://instagram.com/shivayasolutions'
    },
    {
      icon: Linkedin,
      title: 'LinkedIn',
      value: 'Shivaya Solutions',
      link: 'https://www.linkedin.com/in/shivaya-solutions-813663375/'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-light-primary dark:text-dark-primary mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-light-secondary dark:text-dark-secondary max-w-3xl mx-auto">
            Get in touch with us for any inquiries, quotes, or collaboration opportunities. 
            We're here to help you find the perfect solutions for your business needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-light-primary dark:text-dark-primary mb-6">
                Get In Touch
              </h2>
              <p className="text-light-secondary dark:text-dark-secondary mb-8">
                We're committed to providing exceptional service and support. 
                Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-white dark:bg-brand-dark-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 scale-hover"
                >
                  <div className="p-3 bg-brand-warm-orange/10 dark:bg-brand-warm-orange/20 rounded-lg">
                    <item.icon className="h-6 w-6 text-brand-warm-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-light-primary dark:text-dark-primary">
                      {item.title}
                    </h3>
                    <p className="text-light-secondary dark:text-dark-secondary">
                      {item.value}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-brand-warm-orange" />
                <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-2 text-light-secondary dark:text-dark-secondary">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ContactForm />
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white dark:bg-brand-dark-card rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-6 text-center">
              Why Choose Shivaya Solutions?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-warm-orange/10 dark:bg-brand-warm-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-warm-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Quality Assurance</h3>
                <p className="text-light-secondary dark:text-dark-secondary text-sm">
                  All our products meet the highest quality standards
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-warm-orange/10 dark:bg-brand-warm-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-warm-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-2">Fast Delivery</h3>
                <p className="text-light-secondary dark:text-dark-secondary text-sm">
                  Quick and reliable delivery across India
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-warm-orange/10 dark:bg-brand-warm-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-warm-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-2">24/7 Support</h3>
                <p className="text-light-secondary dark:text-dark-secondary text-sm">
                  Round-the-clock customer support and assistance
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;