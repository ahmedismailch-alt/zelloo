"use client"
import { useState } from "react"

export default function Dashboard() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState("")

  if (!auth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 w-full max-w-[360px]">
          <h1 className="font-black text-2xl">ZELLOO Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Nur für dich</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Passwort" className="w-full border-2 rounded-xl px-4 py-3 mt-6" />
          <button onClick={()=>{if(pass==="zelloo123"){setAuth(true)}else{alert("Falsch!")}} } className="w-full bg-[#c41e24] text-white font-bold py-3 rounded-xl mt-3">Login</button>
          <p className="text-[11px] text-gray-400 mt-3">Passwort: zelloo123</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="font-black text-2xl mb-6">ZELLOO Dashboard - Privat</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border"><div className="text-xs text-gray-500">Anrufe Heute</div><div className="text-3xl font-black">47</div></div>
          <div className="bg-white rounded-2xl p-5 border"><div className="text-xs text-gray-500">Neue Abos</div><div className="text-3xl font-black">42</div></div>
          <div className="bg-white rounded-2xl p-5 border"><div className="text-xs text-gray-500">Umsatz</div><div className="text-3xl font-black">CHF 5,820</div></div>
          <div className="bg-black text-white rounded-2xl p-5"><div className="text-xs text-gray-400">Aktive Restaurants</div><div className="text-3xl font-black">12</div></div>
        </div>
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold mb-3">Letzte Kontakte</h2>
          <div className="space-y-2 text-sm"><div className="flex justify-between p-3 bg-gray-50 rounded-xl"><span>🍕 Pizzeria Milano - Lachen</span><span className="text-green-600 font-bold">Interessiert</span></div><div className="flex justify-between p-3 bg-gray-50 rounded-xl"><span>🥗 Alpenrose</span><span className="text-yellow-600 font-bold">Demo</span></div></div>
        </div>
      </div>
    </div>
  )
}
