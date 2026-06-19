function KpiCardSmall({ icon, iconBg, value, label, sub, trend, trendUp, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'text-green bg-green/10' : 'text-red-500 bg-red-50'}`}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
      <div className="font-serif text-3xl font-bold text-navy">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
      <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100">{sub}</div>
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${accent}`} />
    </div>
  );
}

export default KpiCardSmall;