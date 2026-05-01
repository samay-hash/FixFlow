import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm" }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm"
          style={{ background: 'var(--cream)', border: '4px solid var(--black)', boxShadow: '8px 8px 0 var(--black)' }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full border-2 border-black">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--black)' }}>{title}</h3>
            </div>
            <p className="text-sm font-medium mb-8" style={{ color: '#444' }}>{message}</p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={onClose} 
                className="btn-ghost px-4 py-2 text-sm font-black uppercase"
                style={{ border: '2px solid var(--black)' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }} 
                className="px-4 py-2 text-sm font-black uppercase text-white transition-transform active:scale-95"
                style={{ background: 'var(--pink)', border: '2px solid var(--black)', boxShadow: '2px 2px 0 var(--black)' }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
