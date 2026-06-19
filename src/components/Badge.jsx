const STYLES = {
  confirmed: 'bg-green/10 text-emerald-700 before:bg-green',
  pending: 'bg-amber-50 text-amber-700 before:bg-gold',
  urgent: 'bg-red-50 text-red-600 before:bg-red-500',
  completed: 'bg-purple-50 text-purple-700 before:bg-purple-600',
  inprogress: 'bg-blue-50 text-blue-700 before:bg-blue-500',
};

function Badge({ type, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${STYLES[type]} before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full`}>
      {children}
    </span>
  );
}

export default Badge;