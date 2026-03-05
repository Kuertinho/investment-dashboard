export default function PageShell({ title, description, icon: Icon, children }) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="px-8 py-6 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
            <Icon size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-8 py-8">
        {children}
      </div>
    </div>
  )
}
