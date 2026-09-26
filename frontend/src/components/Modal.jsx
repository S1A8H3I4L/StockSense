import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, size = "md" }) => {
  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className={`bg-surface rounded-2xl shadow-popover w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-canvas">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
