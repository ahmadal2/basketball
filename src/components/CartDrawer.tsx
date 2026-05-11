import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, User } from 'lucide-react';

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
  themeColor?: string;
}

export function CartDrawer({ isOpen, onClose, items, onRemove, themeColor = '#FF5A00' }: CartDrawerProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] pointer-events-none">
          <div className="absolute inset-0 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer z-0"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full md:w-[550px] bg-[#050505]/95 backdrop-blur-2xl border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col z-10"
          >
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-4xl text-white tracking-tight uppercase italic">Your Cart</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">{items.length} items selected</p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 interactive cursor-pointer"
                    style={{ backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}44` }}
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="relative group p-2 interactive cursor-pointer"
                  >
                    <ShoppingBag className="w-6 h-6 transition-colors" style={{ color: themeColor }} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                      {items.length}
                    </span>
                  </button>
                </div>

                <button 
                  onClick={onClose} 
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-500 interactive cursor-pointer group"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <ShoppingBag className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="uppercase tracking-[0.2em] text-xs font-bold">Your cart is empty</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 text-xs uppercase tracking-widest hover:text-white transition-colors"
                    style={{ color: themeColor }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-colors"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-lg flex items-center justify-center shrink-0">
                      <div 
                        className="w-12 h-12 rounded-full shadow-lg" 
                        style={{ 
                          backgroundColor: item.color,
                          boxShadow: `0 0 20px ${item.color}44`
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-bold tracking-tight">{item.name}</h3>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Classic Edition</p>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-gray-600 hover:text-red-500 interactive transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: item.color }}>{item.color}</div>
                        <div className="text-white font-bold font-mono">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-[#080808]">
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500">
                    <span>Shipping</span>
                    <span className="text-white">Calculated at next step</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-400 text-sm uppercase tracking-widest">Subtotal</span>
                    <span className="text-white text-3xl font-display tracking-tight">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  className="w-full text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all duration-500 interactive shadow-2xl group"
                  style={{ 
                    backgroundColor: themeColor,
                    boxShadow: `0 0 40px ${themeColor}44`
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Checkout Now
                    <X className="w-4 h-4 rotate-45 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-[0.2em]">Free express shipping on all orders</p>
              </div>
            )}
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
