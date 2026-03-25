import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
}

export function CartDrawer({ isOpen, onClose, items, onRemove }: CartDrawerProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-[#080808] border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto"
          >
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-display text-3xl text-white tracking-wide">YOUR CART ({items.length})</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors interactive p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="uppercase tracking-widest text-xs">Your cart is empty</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 bg-white/5 p-4 rounded-lg border border-white/5"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-md flex items-center justify-center shrink-0">
                      <div 
                        className="w-12 h-12 rounded-full border-2 border-[#1a1a1a]" 
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-bold tracking-wider">{item.name}</h3>
                          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Classic Edition</p>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-gray-500 hover:text-red-500 interactive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-brand-orange text-sm font-mono">{item.color}</div>
                        <div className="text-white font-mono">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-white/10 bg-[#0a0a0a]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-sm uppercase tracking-widest">Subtotal</span>
                <span className="text-white text-2xl font-display tracking-wide">${subtotal.toFixed(2)}</span>
              </div>
              <button className="w-full bg-white text-black py-4 font-bold uppercase tracking-[0.2em] hover:bg-brand-orange hover:text-white transition-all duration-300 interactive shadow-lg">
                Checkout
              </button>
              <p className="text-center text-xs text-gray-600 mt-4 uppercase tracking-widest">Free shipping worldwide</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { ShoppingBag } from 'lucide-react';
