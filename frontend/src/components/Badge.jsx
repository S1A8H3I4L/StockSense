const labelMap = {
  draft: "Draft",
  waiting: "Waiting",
  ready: "Ready",
  done: "Done",
  cancelled: "Cancelled",
};

const Badge = ({ status }) => {
  return <span className={`badge-${status}`}>{labelMap[status] || status}</span>;
};

export default Badge;
