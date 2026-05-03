export default function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 mb-1.5">
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  )
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all ${className}`}
    />
  )
}

export function Textarea({
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none ${className}`}
    />
  )
}

export function Select({
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none ${className}`}
    />
  )
}
