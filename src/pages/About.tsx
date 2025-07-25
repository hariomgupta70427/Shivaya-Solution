import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Users, Target } from 'lucide-react';
import { CORE_VALUES, CERTIFICATIONS } from '../utils/constants';

const About: React.FC = () => {
  return (
    <div className="pt-16 min-h-screen bg-brand-cream dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            About Shivaya Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Building trust through quality products and exceptional service since our establishment. 
            We are committed to being your reliable partner in business growth.
          </p>
        </motion.div>

        {/* Company Story */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Shivaya Solutions was founded with a vision to provide high-quality, affordable products 
                to businesses across India. What started as a small venture has grown into a trusted name 
                in the industry, serving thousands of satisfied customers nationwide.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our journey is marked by continuous innovation, unwavering commitment to quality, and 
                building long-lasting relationships with our clients. We believe in growing together 
                with our customers and partners.
              </p>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-warm-orange">1000+</div>
                  <div className="text-gray-600 dark:text-gray-400">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-warm-orange">5+</div>
                  <div className="text-gray-600 dark:text-gray-400">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg"
                alt="Our Team"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </motion.section>

        {/* Core Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_VALUES.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Certifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Certifications & Credentials
              </h2>
              <div className="space-y-4">
                {CERTIFICATIONS.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {cert}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <Award className="h-8 w-8 text-brand-warm-orange" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Quality Assurance
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Our ISO 9001:2015 certification ensures that we maintain the highest 
                  standards in quality management and customer satisfaction.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <Users className="h-8 w-8 text-brand-warm-orange" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    MSME Registration
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  As a registered MSME, we contribute to India's economic growth while 
                  maintaining our commitment to excellence and innovation.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Vision & Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-brand-cream dark:bg-gray-800 p-8 rounded-xl">
              <Target className="h-10 w-10 text-brand-warm-orange mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                To be the leading supplier of quality products in India, recognized for 
                our reliability, innovation, and commitment to customer success.
              </p>
            </div>
            <div className="bg-brand-light-beige dark:bg-gray-800 p-8 rounded-xl">
              <Target className="h-10 w-10 text-brand-burnt-coral mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                To provide affordable, durable, and reliable products that empower 
                businesses to achieve their goals while maintaining the highest standards 
                of quality and service.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Industries Served */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Industries We Serve
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Supporting diverse sectors with our comprehensive product range
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Hospitality', 'Manufacturing', 'Healthcare', 'Education', 'Retail', 'Food Service', 'Corporate', 'Government'].map((industry, index) => (
              <div key={index} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {industry}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="pt-10"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Reach out to us for any queries or collaboration opportunities
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <a
              href="mailto:shivayasolutions0167@gmail.com"
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-warm-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4-4 4m0 0l4 4 4-4" /></svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">shivayasolutions0167@gmail.com</span>
            </a>
            <a
              href="https://wa.me/919899716237"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-warm-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16.72 13.06a6.5 6.5 0 10-2.72 2.72l2.13.62a1 1 0 001.26-1.26l-.62-2.13z" /><path d="M8.5 11a3.5 3.5 0 006.5 0" /></svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">+91 9899716237</span>
            </a>
            <a
              href="https://instagram.com/shivayasolutions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-warm-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">@shivayasolutions</span>
            </a>
            <a
              href="https://www.linkedin.com/in/shivaya-solutions-813663375/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-warm-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M8 11v5M8 8v.01M12 16v-5m0 0a2 2 0 114 0v5" /></svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Shivaya Solutions</span>
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;