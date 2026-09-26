import { Boxes } from "lucide-react";
import { motion } from "framer-motion";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Boxes size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">StockSense</span>
        </div>
        <div className="relative">
          <h2 className="text-white text-3xl font-bold leading-tight mb-3">
            Real-time inventory,<br />zero spreadsheets.
          </h2>
          <p className="text-primary-100 text-sm max-w-md">
            Track receipts, deliveries, transfers and adjustments across every warehouse
            from one clean, connected dashboard.
          </p>
        </div>
        <p className="relative text-primary-200 text-xs">© {new Date().getFullYear()} StockSense. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Boxes size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800">StockSense</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-1.5 mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
