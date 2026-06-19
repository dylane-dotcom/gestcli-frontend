const STYLES = {
  cardio: 'bg-sky-50 text-sky-700',
  pedi: 'bg-green-50 text-green-800',
  ortho: 'bg-red-50 text-red-800',
  neuro: 'bg-purple-50 text-purple-800',
  dermato: 'bg-yellow-50 text-yellow-800',
  medgen: 'bg-blue-50 text-blue-900',
};

function Tag({ type, children }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${STYLES[type]}`}>
      {children}
    </span>
  );
}

export default Tag;