"use client"
import { useState } from "react"

export default function Dashboard() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState("")

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] p-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center py-8">
            <h1 className="font-black text-4xl">ZELLOO.CH für alle</h1>
            <p className="text-gray-500 mt-2">Alles was Ihr Restaurant braucht - 15 Tage gratis</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border"><div className="text-2xl mb-2">🤖</div><h3 className="font-bold">KI Anrufe</h3><p className="text-sm text-gray-500 mt-1">Nimmt Anrufe 24/7 entgegen</p></div>
            <div className="bg-white rounded-2xl p-6 border"><div className="text-2xl mb-2">📱</div><h3 className="font-bold">Online Bestellungen</h3><p className="text-sm text-gray-500 mt-1">Google, Instagram, WhatsApp</p></div>
            <div className="bg-white rounded-2xl p-6 border"><div className="text-2xl mb-2">⚡</div><h3 className="font-bold">100% Automatisch</h3><p className="text-sm text-gray-500 mt-1">Kein Personal mehr nötig</p></div>
          </div>

          <div className="bg-white rounded-2xl border p-6 mb-6">
            <h2 className="font-black text-xl mb-4">Pakete</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 rounded-xl p-4"><div className="font-bold">Starter</div><div className="text-2xl font-black">CHF 99<span className="text-sm font-normal">/Monat</span></div><div className="text-sm text-gray-500">Bis 100 Anrufe</div></div>
              <div className="border-2 border-[#c41e24] rounded-xl p-4 bg-red-50"><div className="font-bold">Pro - Beliebt</div><div className="text-2xl font-black">CHF 199<span className="text-sm font-normal">/Monat</span></div><div className="text-sm text-gray-500">Unlimitierte Anrufe</div></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold mb-4">Jetzt registrieren</h2>
            <input placeholder="Restaurant Name" className="w-full border rounded-xl px-4 py-3 mb-3" />
            <input placeholder="E-Mail" className="w-full border rounded-xl px-4 py-3 mb-3" />
            <button className="w-full bg-[#c41e24] text-white font-bold py-3 rounded-xl">15 Tage gratis starten</button>

            <div className="mt-6 pt-4 border-t flex gap-2">
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Admin" className="flex-1 border rounded-xl px-3 py-2 text-xs" />
              <button onClick={()=>{if(pass==="zelloo123"){setAuth(true)}else{alert("Falsch!")}} } className="text-xs bg-black text-white px-4 rounded-xl">Admin</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between mb-6"><h1 className="font-black text-2xl">PRIVAT - Nur für dich</h1><button onClick={()=>setAuth(false)} className="border px-4 py-2 rounded-full text-sm">Logout</button></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border"><div className="text-xs text-gray-500">Umsatz Heute</div><div className="text-3xl font-black">CHF 5,820</div><div className="text-[10px] text-red-500 mt-1">PRIVAT</div></div>
          <div className="bg-white rounded-2xl p-5 border"><div className="text-xs text-gray-500">Gewinn</div><div className="text-3xl font-black">CHF 3,120</div><div className="text-[10px] text-red-500 mt-1">PRIVAT</div></div>
          <div className="bg-white rounded-2xl p-5 border"><div className="text-xs text-gray-500">Anrufe</div><div className="text-3xl font-black">47</div></div>
          <div className="bg-black text-white rounded-2xl p-5"><div className="text-xs">Aktive Restaurants</div><div className="text-3xl font-black">12</div></div>
        </div>
      </div>
    </div>
  )
}