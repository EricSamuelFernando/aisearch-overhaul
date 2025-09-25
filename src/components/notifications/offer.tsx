'use client';

import { CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfferNotificationProps {
  agentName: string;
  data:any;
  propertyName: string;
  onClose?: () => void;
  duration?: number;
}

const OfferNotification: React.FC<OfferNotificationProps> = ({
  agentName,
  propertyName,
  onClose,
  duration = 5000,
  data
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className={`fixed bottom-6 right-6 z-50 bg-orange-100 border border-green-500 text-orange-800 px-5 py-4 rounded-xl shadow-lg flex items-start gap-4 max-w-sm`}
        >
          <CheckCircle className="w-6 h-6 mt-1 text-orange-500" />
          <div className="flex-1">
            <p className="font-semibold text-orange-700">New offer revieved</p>
            <p className="text-sm mt-1">
              <span className="font-medium">You have recieved a new from </span> has {data?.agentName}
              in property <span className="font-medium">{data?.propertyName}</span>.
            </p>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              onClose?.();
            }}
            className="text-orange-500 hover:text-orange-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfferNotification;
