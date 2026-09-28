export default function Page({ params }: { params: { id: string } }) {
  return (
    <div style={{minHeight:'100vh',background:'#f8f9fb',padding:'24px',fontFamily:'system-ui'}}>
      <div style={{maxWidth:'480px',margin:'0 auto'}}>
        <div style={{background:'black',color:'white',borderRadius:'16px',padding:'20px'}}>
          <h1 style={{fontSize:'22px',fontWeight:900,margin:0}}>🍕 {params.id.toUpperCase()}</h1>
          <p style={{color:'#aaa',margin:'4px 0 0 0',fontSize:'14px'}}>Live Bestellungen • zelloo.ch</p>
        </div>
        <div style={{background:'white',border:'1px solid #eee',borderRadius:'14px',padding:'14px',marginTop:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><b>#1024 - Margherita x2</b><div style={{fontSize:'11px',color:'#888'}}>vor 2 Min • CHF 32</div></div>
          <span style={{background:'#dcfce7',color:'#15803d',padding:'5px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:'bold'}}>NEU</span>
        </div>
        <div style={{background:'white',border:'1px solid #eee',borderRadius:'14px',padding:'14px',marginTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><b>#1023 - Döner Box</b><div style={{fontSize:'11px',color:'#888'}}>vor 5 Min • CHF 18.5</div></div>
          <span style={{background:'#fef9c3',color:'#a16207',padding:'5px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:'bold'}}>Zubereitung</span>
        </div>
        <p style={{textAlign:'center',marginTop:'24px',fontSize:'11px',color:'#aaa'}}>Link für Kunde: zelloo-pi.vercel.app/r/{params.id}</p>
      </div>
    </div>
  )
}
