export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div style={{minHeight:'100vh',background:'#f5f5f7',padding:'20px',fontFamily:'-apple-system,system-ui'}}>
      <div style={{maxWidth:'420px',margin:'0 auto'}}>
        <div style={{background:'black',color:'white',borderRadius:'20px',padding:'22px'}}>
          <h1 style={{margin:0,fontSize:'26px',fontWeight:900}}>🍕 {String(id).toUpperCase()}</h1>
          <p style={{margin:'6px 0 0 0',color:'#999',fontSize:'13px'}}>Live Bestellungen • zelloo.ch</p>
        </div>
        <div style={{background:'white',padding:'16px',borderRadius:'14px',marginTop:'16px',border:'1px solid #e5e5e5'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div><div style={{fontWeight:700}}>#1024 - Margherita x2</div><div style={{fontSize:'12px',color:'#888'}}>CHF 32 • vor 2 Min</div></div>
            <span style={{background:'black',color:'white',padding:'6px 12px',borderRadius:'99px',fontSize:'11px',fontWeight:800,height:'fit-content'}}>NEU</span>
          </div>
        </div>
      </div>
    </div>
  )
}
