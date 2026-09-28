export default function Home() {
  return (
    <div dir="rtl" style={{minHeight:'100vh', background:'white', fontFamily:'system-ui', textAlign:'center'}}>
      <div style={{padding:'20px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
        <b>ZELLOO</b>
        <button style={{background:'black', color:'white', borderRadius:'20px', padding:'8px 16px'}}>ابدأ البيع</button>
      </div>
      <div style={{padding:'60px 20px'}}>
        <h1 style={{fontSize:'48px', fontWeight:'900', lineHeight:'0.9'}}>بِع أي شيء<br/><span style={{color:'#999'}}>رقمي. فوراً.</span></h1>
        <p style={{color:'#666', marginTop:'20px'}}>منصة بيع المنتجات الرقمية الأولى في الوطن العربي</p>
        <button style={{marginTop:'30px', background:'black', color:'white', padding:'16px 32px', borderRadius:'30px', fontSize:'18px', fontWeight:'bold'}}>افتح متجرك مجاناً →</button>
      </div>
      <div style={{background:'black', color:'white', padding:'40px', borderRadius:'40px 40px 0 0', marginTop:'60px'}}>zelloo-pi.vercel.app</div>
    </div>
  )
}
