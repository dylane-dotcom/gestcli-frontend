function MiniCalendar({ joursAvecRdv = [], aujourdhui }) {
  const joursMois = Array.from({ length: 30 }, (_, i) => i + 1);
  const decalageDebut = 0;
  const joursVides = Array.from({ length: decalageDebut }, () => null);
  const tousLesJours = [...joursVides, ...joursMois];

  return (
    <div className="bg-navy rounded-2xl p-3 text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base opacity-60 cursor-pointer">‹</span>
        <span className="font-serif font-bold text-sm">Juin 2026</span>
        <span className="text-base opacity-60 cursor-pointer">›</span>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-[9px] text-center text-white/40 font-semibold py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {tousLesJours.map((jour, i) => {
          if (!jour) return <div key={i} />;
          const isToday = jour === aujourdhui;
          const hasRdv = joursAvecRdv.includes(jour);
          return (
            <div
              key={i}
              className={`h-7 flex items-center justify-center text-[11px] rounded-md cursor-pointer relative
                ${isToday
                  ? 'bg-green text-white font-bold'
                  : 'text-white/65 hover:bg-white/10'}`}
            >
              {jour}
              {hasRdv && !isToday && (
                <span className="absolute bottom-0.5 w-1 h-1 bg-gold rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;