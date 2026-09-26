const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    {Icon && (
      <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-4">
        <Icon size={26} />
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-700">{title}</h3>
    {description && <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
