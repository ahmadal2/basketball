import React from 'react';
import { ShoppingBag, User, Search } from 'lucide-react';

interface NavbarProps {
  onCartClick: () => void;
  cartCount: number;
}

export function Navbar({ onCartClick, cartCount }: NavbarProps) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-6 md:py-8 w-full pointer-events-none md:pointer-events-auto">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-black" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 0 20" opacity="0.5" />
            <path d="M2 12h20" opacity="0.5" />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-white text-lg tracking-wider">SLAM</span>
          <span className="font-display font-bold text-white text-lg tracking-wider -mt-1">DUNK</span>
        </div>
      </div>

      <div className="hidden md:flex gap-12 pointer-events-auto">
        <button className="text-sm font-medium tracking-wide transition-colors duration-300 interactive text-brand-orange">Products</button>
        <button className="text-sm font-medium tracking-wide transition-colors duration-300 interactive text-gray-300 hover:text-white">Customize</button>
        <button className="text-sm font-medium tracking-wide transition-colors duration-300 interactive text-gray-300 hover:text-white">Contacts</button>
      </div>

      <div className="flex items-center gap-6 text-white pointer-events-auto">
        <button className="hover:text-brand-orange transition-colors interactive">
          <User className="w-5 h-5" />
        </button>
        <button 
          onClick={onCartClick}
          className="hover:text-brand-orange transition-colors relative interactive"
        >
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
              {cartCount}
            </div>
          )}
          <ShoppingBag className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
