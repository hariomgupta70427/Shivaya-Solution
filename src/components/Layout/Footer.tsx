import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Linkedin, ShoppingBag } from 'lucide-react';
import { COMPANY_INFO } from '../../utils/constants';
import { EXTERNAL_LINKS } from '../../config/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppClick = () => {
    window.open(EXTERNAL_LINKS.WHATSAPP_LINK, '_blank');
  };

  const handleInstagramClick = () => {
    window.open(EXTERNAL_LINKS.INSTAGRAM_LINK, '_blank');
  };

  const handleLinkedInClick = () => {
    window.open(EXTERNAL_LINKS.LINKEDIN_LINK, '_blank');
  };

  const handleEmailClick = () => {
    window.open(`mailto:${EXTERNAL_LINKS.EMAIL_RECEIVER}`, '_blank');
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-brand-warm-orange" />
              <span className="text-xl font-bold">{COMPANY_INFO.name}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {COMPANY_INFO.description}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-brand-mustard rounded-full text-xs">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>ISO 9001:2015</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-brand-burnt-coral rounded-full text-xs">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>MSME Registered</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-brand-warm-orange" />
                <a 
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {COMPANY_INFO.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-brand-warm-orange" />
                <button
                  onClick={handleEmailClick}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {EXTERNAL_LINKS.EMAIL_RECEIVER}
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-brand-warm-orange" />
                <span className="text-gray-400">{COMPANY_INFO.address}</span>
              </div>
            </div>
          </div>

          {/* Social & Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect With Us</h3>
            <div className="flex space-x-3">
              <button
                onClick={handleInstagramClick}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5 text-pink-500" />
              </button>
              <button
                onClick={handleLinkedInClick}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-blue-500" />
              </button>
            </div>
            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-brand-mustard hover:bg-brand-burnt-coral rounded-lg transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>WhatsApp Inquiry</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} {COMPANY_INFO.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;