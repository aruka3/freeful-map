'use client'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < currentStep
                  ? 'bg-emerald-500 text-white'
                  : i === currentStep
                  ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {i < currentStep ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-[10px] mt-1 whitespace-nowrap ${
                i === currentStep ? 'text-emerald-700 font-medium' : 'text-stone-400'
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${
                i < currentStep ? 'bg-emerald-400' : 'bg-stone-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
