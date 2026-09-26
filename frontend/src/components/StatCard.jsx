import { motion } from "framer-motion";

const StatCard = ({ label, value, delta, icon: Icon, tone = "primary" }) => {
  const tones = {
    primary: "bg-primary-50 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-yellow-700",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card flex items-center justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {delta && <p className="text-xs text-success mt-1 font-medium">{delta}</p>}
      </div>
      {Icon && (
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
