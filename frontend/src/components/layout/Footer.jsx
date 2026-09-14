import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-14 sm:pt-20 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">
          
          {/* Brand Bio (2 cols) */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                GetChasma.
              </span>
            </Link>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Get the perfect vision you deserve with our extensive range of eyeglasses. From stylish aviators to classic wayfarers, express your unique personality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/membership" className="hover:text-white transition-colors">VIP Club</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">Updates &amp; Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">Shipping &amp; Returns</Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>Kalaburagi, Karnataka India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-neutral-400 flex-shrink-0" />
                <a href="tel:+919740310101" className="hover:text-white transition-colors">+91 97403 10101</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-neutral-400 flex-shrink-0" />
                <a href="mailto:info@getchasma.com" className="hover:text-white transition-colors">info@getchasma.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 GetChasma.com. All rights reserved.</p>
          <p className="text-neutral-600">Website Developed by Antmark.in</p>
        </div>

      </div>
    </footer>
  );
}
