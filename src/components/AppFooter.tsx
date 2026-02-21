import React from 'react';
import { Clock, Mail, Phone, MapPin, Instagram, Facebook, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { MosqueIcon } from './IslamicPattern';

export default function AppFooter({ 
  onNavigateToContact 
}: { 
  onNavigateToContact?: () => void;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Office Hours */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <MosqueIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Jamaah.net</h3>
                <p className="text-xs text-white/70">Platform Komunitas Muslim</p>
              </div>
            </div>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">
              Beribadah, Berinteraksi, dan Bertransaksi Halal dalam satu platform digital.
            </p>
            
            {/* Office Hours Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-sm">Office Hour Admin</h4>
              </div>
              <div className="space-y-2 text-xs text-white/90">
                <div className="flex justify-between">
                  <span>Senin - Jumat</span>
                  <span className="font-mono font-semibold">08.00 - 17.00 WIB</span>
                </div>
                <div className="flex justify-between">
                  <span>Sabtu</span>
                  <span className="font-mono font-semibold">08.00 - 12.00 WIB</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Minggu & Libur</span>
                  <span className="font-semibold">Tutup</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-xs text-emerald-300">
                  ⚡ Approval & pengiriman password diproses pada jam kerja
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={onNavigateToContact}
                  className="text-sm text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform" />
                  Hubungi Kami
                </button>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-sm text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform" />
                  Tentang Jamaah.net
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-sm text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform" />
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-sm text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform" />
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-sm text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform" />
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Kontak</h4>
            <div className="space-y-4">
              <a 
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-white/80 hover:text-emerald-400 transition-colors group"
              >
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-white mb-1">WhatsApp</div>
                  <div>+62 812-3456-7890</div>
                </div>
              </a>
              
              <a 
                href="mailto:admin@jamaah.net"
                className="flex items-start gap-3 text-sm text-white/80 hover:text-emerald-400 transition-colors group"
              >
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-white mb-1">Email</div>
                  <div>admin@jamaah.net</div>
                </div>
              </a>
              
              <div className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white mb-1">Alamat</div>
                  <div className="leading-relaxed">
                    Jl. Masjid Raya No. 123<br />
                    Jakarta Selatan 12345
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <div className="font-semibold text-white mb-3 text-sm">Ikuti Kami</div>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com/jamaah.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-pink-500 transition-all hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://facebook.com/jamaah.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/60 text-center md:text-left">
              © {currentYear} Jamaah.net. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Made with</span>
              <span className="text-red-400 text-base">♥</span>
              <span>for Umat Muslim</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
