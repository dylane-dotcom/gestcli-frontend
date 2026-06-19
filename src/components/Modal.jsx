function Modal({ title, icon, onClose, children, onSubmit, submitLabel = "✓ Enregistrer" }) {
  return (
    
     <div
      style={{position: 'fixed', inset: 0, background: 'rgba(10,25,47,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[640px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h3 className="font-serif text-lg font-bold text-navy">{icon} {title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm font-semibold text-navy">
            Annuler
          </button>
          <button onClick={onSubmit} className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;