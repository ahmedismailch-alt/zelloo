export default function Page({ params }: { params: { id: string } }) {
  return (
    <div style={{padding:24, fontFamily:'system-ui'}}>
      <h1 style={{fontWeight:900, fontSize:'24px'}}>🍕 {params.id}</h1>
      <p>Live Bestellungen</p>
      <div style={{background:'black',color:'white',padding:16,borderRadius:12,marginTop:16}}>#1024 Margherita x2 - NEU</div>
      <div style={{background:'#eee',padding:16,borderRadius:12,marginTop:8}}>#1023 Döner Box</div>
    </div>
  )
}
