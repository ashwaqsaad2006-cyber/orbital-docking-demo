const $=s=>document.querySelector(s),cv=$('#cv'),ctx=cv.getContext('2d');
const W=800,H=450,dpr=Math.min(devicePixelRatio||1,2);
cv.width=W*dpr;cv.height=H*dpr;ctx.scale(dpr,dpr);
const nf=new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2});
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),lerp=(a,b,u)=>a+(b-a)*u,ease=x=>x*x*(3-2*x);
const pw=(t,ts,vs)=>{if(t<=ts[0])return vs[0];for(let i=1;i<ts.length;i++)if(t<=ts[i])return lerp(vs[i-1],vs[i],(t-ts[i-1])/(ts[i]-ts[i-1]));return vs[vs.length-1]};
const K=[0,.18,.45,.65,.85,1];
const S=[
['الإطلاق','تنطلق المركبة حين يمر مستوى مدار المحطة فوق موقع الإطلاق، وتصعد إلى مدار منخفض خلف المحطة.'],
['مرحلة الطور (Phasing)','تدور المركبة في مدار أدنى قليلًا فتكون أسرع، فتلحق بالمحطة تدريجيًا ويتقلص فرق الطور.'],
['الاقتراب البعيد','تُرفع المركبة إلى مدار المحطة بدفعات متتابعة، وتُقلَّص المسافة إلى بضعة كيلومترات.'],
['الاقتراب القريب','تقيس أجهزة الليزر والرادار والكاميرات المسافة والاتجاه، وتتباطأ السرعة النسبية.'],
['التلامس والالتحام','تطابق المركبة اتجاه المنفذ وتتلامس ببطء، ثم تلتقط الأقفال المركبة وتُحكم الوصلة.']];
// stars
let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
const stars=Array.from({length:80},()=>[rnd()*W,rnd()*H,.2+rnd()*.6]);
// orbit-view geometry
const cx=400,cy=250,Re=105,Rl=172,Ro=190;
const P=(r,a)=>[cx+r*Math.cos(a),cy-r*Math.sin(a)];
const th=t=>2.2+1.1*t;
const gap=t=>pw(t,[0,.18,.45,.65,1],[1.9,1.6,.14,.03,.03]);
const rad=t=>t<.18?lerp(Re,Rl,ease(t/.18)):t<.45?Rl:t<.53?lerp(Rl,Ro,ease((t-.45)/.08)):Ro;
const SC=t=>P(rad(t),th(t)-gap(t));
const ring=(r,c)=>{ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.strokeStyle=c;ctx.stroke()};
function label(txt,x,y,c,sz){ctx.font=(sz||14)+'px "Noto Naskh Arabic",Tahoma,sans-serif';ctx.direction='rtl';ctx.textAlign='center';ctx.fillStyle=c||'#e6eaf5';ctx.fillText(txt,x,y)}
function station(x,y,s){ctx.fillStyle='#e8ecf7';ctx.fillRect(x-4*s,y-4*s,8*s,8*s);ctx.fillStyle='#7ea2ff';ctx.fillRect(x-15*s,y-1.5*s,30*s,3*s)}
function orbit(t){
 const g=ctx.createRadialGradient(cx-30,cy-30,10,cx,cy,Re);g.addColorStop(0,'#3d7be0');g.addColorStop(1,'#12306b');
 ctx.beginPath();ctx.arc(cx,cy,Re,0,7);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='rgba(120,170,255,.35)';ctx.stroke();
 label('الأرض',cx,cy+5,'#cfe0ff');
 ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ring(Ro,'rgba(255,255,255,.45)');
 ctx.setLineDash([]);if(t>.1&&t<.56)ring(Rl,'rgba(240,176,85,.4)');
 // trail
 ctx.beginPath();let first=true;for(let u=Math.max(0,t-.3);u<=t;u+=.005){const p=SC(u);first?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]);first=false}
 ctx.strokeStyle='rgba(240,176,85,.8)';ctx.lineWidth=2;ctx.stroke();
 const s=P(Ro,th(t)),c=SC(t);
 if(t>.45){ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(s[0],s[1]);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([])}
 station(s[0],s[1],1.3);label('المحطة',s[0],s[1]-16);
 if(t<.18||(t>.45&&t<.53)){const d=Math.hypot(cx-c[0],cy-c[1]),ux=(cx-c[0])/d,uy=(cy-c[1])/d;ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(c[0]+ux*16,c[1]+uy*16);ctx.strokeStyle='#ffb347';ctx.lineWidth=4;ctx.stroke()}
 ctx.beginPath();ctx.arc(c[0],c[1],5,0,7);ctx.fillStyle='#f0b055';ctx.fill();
 label('المركبة',c[0],c[1]+20,'#f0b055');
}
// close-up
const distM=t=>t<.65?(t<.45?1e9:20000*Math.pow(.05,(t-.45)/.2)):t<.85?250*Math.pow(.08,(t-.65)/.2):t<.9?20*(1-(t-.85)/.05):0;
function close(t){
 const d=Math.min(250,distM(t)),px=640,y0=225,gp=380*Math.log(1+d)/Math.log(251);
 const hz=ctx.createLinearGradient(0,330,0,H);hz.addColorStop(0,'#1c4a9e');hz.addColorStop(1,'#0b2250');
 ctx.beginPath();ctx.arc(400,1250,880,0,7);ctx.fillStyle=hz;ctx.fill();
 // station
 ctx.fillStyle='#c9d1e6';ctx.fillRect(px,175,170,100);
 ctx.fillStyle='#8fa0c8';ctx.fillRect(px-14,200,14,50);
 ctx.fillStyle='#3b63c9';ctx.fillRect(px+50,40,70,130);ctx.fillRect(px+50,280,70,130);
 ctx.strokeStyle='#9db8ff';ctx.lineWidth=1;for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(px+50,40+i*26);ctx.lineTo(px+120,40+i*26);ctx.moveTo(px+50,280+i*26);ctx.lineTo(px+120,280+i*26);ctx.stroke()}
 label('المحطة',px+85,230,'#16213b',16);
 // target cross
 ctx.strokeStyle='#ff5a4f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px-24,y0);ctx.lineTo(px-4,y0);ctx.moveTo(px-14,y0-10);ctx.lineTo(px-14,y0+10);ctx.stroke();
 // spacecraft
 const off=14*Math.sin(d*.15)*Math.min(1,d/60),y=y0+off,xn=px-14-gp;
 if(t>=.65){ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(xn,y);ctx.lineTo(px-14,y0);ctx.strokeStyle='rgba(240,176,85,.7)';ctx.lineWidth=1.2;ctx.stroke();ctx.setLineDash([])}
 ctx.fillStyle='#e9edf8';ctx.fillRect(xn-150,y-42,80,84);
 ctx.beginPath();ctx.moveTo(xn-8,y-18);ctx.lineTo(xn-70,y-42);ctx.lineTo(xn-70,y+42);ctx.lineTo(xn-8,y+18);ctx.closePath();ctx.fillStyle='#f4f6fc';ctx.fill();
 ctx.fillStyle='#8fa0c8';ctx.fillRect(xn-8,y-18,8,36);
 if(t>=.65&&t<.85&&((t*60)%1)<.2){ctx.fillStyle='#ffb347';ctx.fillRect(xn-80,y-48,10,4);ctx.fillRect(xn-80,y+44,10,4)}
 // latches
 const L=t<.9?'#d9ddea':t<.95?'#f0b055':'#4fd08a';
 [205,225,245].forEach(yy=>{ctx.beginPath();ctx.arc(px-7,yy,3.5,0,7);ctx.fillStyle=L;ctx.fill()});
 // ruler
 if(d>0.05){const m=(xn+px-14)/2;label(nf.format(d<10?+d.toFixed(1):Math.round(d))+' م',m,y0-70,'#f0b055',15);
  ctx.strokeStyle='rgba(240,176,85,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xn,y0-60);ctx.lineTo(px-14,y0-60);ctx.stroke()}
 label('المركبة',xn-110,y+62,'#f0b055');
 if(t>=.95)label('✓ تم
