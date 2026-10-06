"use client"

import { useEffect, useState } from "react"

const STEPS = [
  {
    label: "1. Gast scannt QR",
    title: "QR-Code am Tisch scannen",
    description: "Der Gast öffnet die Kamera und scannt den Code — kein App-Download nötig.",
  },
  {
    label: "2. Gast bestellt",
    title: "Menü öffnen & bestellen",
    description: "Das Menü öffnet sich direkt im Browser. Der Gast wählt Gerichte und bestätigt.",
  },
  {
    label: "3. Küche erhält Bestellung",
    title: "Bestellung kommt im Dashboard an",
    description: "Ein lauter Ton weckt das Team — die Bestellung ist sofort sichtbar, bereit zur Zubereitung.",
  },
] as const

const STEP_DURATION_MS = 3200

export function AnimatedJourney() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length)
    }, STEP_DURATION_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-center">
      {/* Step list */}
      <div className="space-y-3 order-2 md:order-1">
        {STEPS.map((step, index) => {
          const isActive = index === activeStep
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`w-full text-left rounded-2xl px-5 py-4 transition-colors ${
                isActive ? "bg-white shadow-sm" : "bg-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? "bg-[#c41e24] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </span>
                <h3 className={`font-bold text-sm md:text-base ${isActive ? "text-black" : "text-gray-400"}`}>
                  {step.title}
                </h3>
              </div>
              {isActive && (
                <p className="text-gray-500 text-sm mt-2 leading-relaxed pl-10">{step.description}</p>
              )}
              {isActive && (
                <div className="pl-10 mt-3">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden w-full max-w-[160px]">
                    <div
                      key={activeStep}
                      className="h-full bg-[#c41e24] rounded-full"
                      style={{ animation: `journey-progress ${STEP_DURATION_MS}ms linear forwards` }}
                    />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Visual stage */}
      <div className="order-1 md:order-2 flex justify-center">
        <div className="relative w-[280px] h-[400px]">
          {/* Step 0: QR scan */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 flex flex-col items-center justify-center bg-white rounded-[28px] shadow-xl ring-1 ring-black/5 ${
              activeStep === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative">
              <div className="w-36 h-36 rounded-2xl bg-white border-2 border-gray-900 grid grid-cols-5 grid-rows-5 gap-1 p-2">
                {[
                  1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1,
                ].map((filled, i) => (
                  <div key={i} className={filled ? "bg-gray-900 rounded-[1px]" : ""} />
                ))}
              </div>
              <div
                className="absolute inset-0 border-2 border-[#c41e24] rounded-2xl"
                style={{ animation: "journey-scan 3.2s ease-in-out infinite" }}
              />
            </div>
            <span className="mt-5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Tisch 4 · Scannen zum Bestellen
            </span>
          </div>

          {/* Step 1: menu/order */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 bg-white rounded-[28px] shadow-xl ring-1 ring-black/5 overflow-hidden ${
              activeStep === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="bg-[#c41e24] px-4 py-3">
              <span className="text-white font-bold text-sm">Zelloo Pizzeria</span>
            </div>
            <div className="p-4 space-y-2.5">
              {[
                { name: "Pizza Margherita", price: "16.00", checked: true },
                { name: "Caesar Salat", price: "14.50", checked: true },
                { name: "Tiramisu", price: "7.50", checked: false },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        item.checked ? "bg-[#c41e24]" : "border border-gray-300"
                      }`}
                    >
                      {item.checked && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">CHF {item.price}</span>
                </div>
              ))}
              <div className="bg-[#c41e24] text-white text-center font-bold text-sm rounded-xl py-2.5 mt-3">
                Jetzt bestellen · CHF 30.50
              </div>
            </div>
          </div>

          {/* Step 2: dashboard receives order */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 bg-[#0a0a0a] rounded-[28px] shadow-xl overflow-hidden ${
              activeStep === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-white font-bold text-sm">Bestellungen</span>
              <span className="w-2 h-2 rounded-full bg-[#25D366]" style={{ animation: "journey-pulse 1.4s ease-in-out infinite" }} />
            </div>
            <div className="px-4">
              <div className="bg-white rounded-2xl p-4 ring-2 ring-[#c41e24]/40" style={{ animation: "journey-bounce-in 0.5s ease-out" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold bg-[#c41e24]/10 text-[#c41e24] px-2 py-0.5 rounded-full">
                    Neu
                  </span>
                  <span className="text-[11px] text-gray-400">vor 2 Sek.</span>
                </div>
                <div className="font-black mt-2">Tisch 4 · #1031</div>
                <div className="text-sm text-gray-600 mt-0.5">1x Margherita, 1x Caesar Salat</div>
                <div className="text-sm font-bold mt-2">CHF 30.50</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 mt-3 opacity-50">
                <div className="font-black mt-1 text-white text-sm">Tisch 2 · #1030</div>
                <div className="text-xs text-gray-500 mt-0.5">2x Pizza Calzone</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes journey-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes journey-scan {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes journey-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes journey-bounce-in {
          0% { transform: scale(0.92) translateY(6px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
