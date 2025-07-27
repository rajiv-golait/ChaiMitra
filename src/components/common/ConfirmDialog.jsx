import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

/**
 * A branded confirmation dialog.
 * @param {string} title - The title of the dialog.
 * @param {string} message - The main message/question.
 * @param {string} confirmText - The text for the confirmation button.
 * @param {string} cancelText - The text for the cancel button.
 * @param {function} onConfirm - Function to call on confirmation.
 * @param {function} onCancel - Function to call on cancellation.
 * @param {'default' | 'danger'} [type='default'] - The type of dialog, for styling.
 */
const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default',
}) => {
  const isDanger = type === 'danger';

  const Icon = isDanger ? AlertTriangle : Info;
  const iconColor = isDanger ? 'text-[#D72638]' : 'text-[#FFA500]';

  return (
    // Use AnimatePresence if you mount/unmount this component
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-message"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="p-8 text-center">
          <div className={clsx("w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5", 
            isDanger ? 'bg-red-100' : 'bg-yellow-100'
          )}>
            <Icon size={32} className={iconColor} />
          </div>

          <h3 id="dialog-title" className="font-poppins font-bold text-xl text-[#1A1A1A]">
            {title}
          </h3>
          <p id="dialog-message" className="text-gray-500 mt-2">
            {message}
          </p>
        </div>

        <div className="flex gap-4 p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-xl
                       hover:bg-gray-300 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              "flex-1 px-5 py-2.5 text-white font-semibold rounded-xl shadow-md transform",
              "hover:-translate-y-0.5 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              isDanger 
                ? "bg-[#D72638] hover:bg-red-700 focus:ring-red-500" 
                : "bg-[#FFA500] hover:bg-yellow-600 focus:ring-yellow-500"
            )}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmDialog;