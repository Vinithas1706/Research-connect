/* ============================================================
   RESEARCH CONNECT - live demo engine
   Builds a fully working mini-app (HTML string) for every project.
   10 domains x 3 variants = 30 different running demos.
   Runs inside a sandboxed iframe (srcdoc).
   ============================================================ */
(function () {
  const CATS = ['ecommerce', 'healthcare', 'education', 'food delivery', 'social media',
                'finance', 'travel', 'real estate', 'fitness', 'entertainment'];

  const PALETTES = [
    ['#ff6a8b', '#7c3aed'], ['#22b8ff', '#7c3aed'], ['#22d3a8', '#2575fc'],
    ['#ffb347', '#ff6a8b'], ['#a06aff', '#22b8ff'], ['#f06595', '#ffb347']
  ];

  function categoryOf(proj) {
    return CATS.find(k => proj.domain.includes(k)) || 'ecommerce';
  }

  function variantOf(proj) {
    const cat = categoryOf(proj);
    const same = PROJECT_DATA.filter(p => categoryOf(p) === cat);
    return Math.max(0, same.findIndex(p => p.id === proj.id)) % 3;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------------- shared CSS / JS used by every demo ---------------- */
  const BASE_CSS = `
    *{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,Arial,sans-serif}
    html,body{height:100%}
    body{background:linear-gradient(135deg,#fdf2f8,#eef2ff 40%,#f0fdfa 75%,#fff7ed);color:#2b2545;display:flex;flex-direction:column;overflow:hidden}
    .top{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;flex:none}
    .brand{font-weight:800;font-size:16px}
    .live{font-size:11px;font-weight:800;display:flex;gap:6px;align-items:center;background:rgba(255,255,255,.25);padding:4px 10px;border-radius:12px}
    .live i{width:7px;height:7px;border-radius:50%;background:#7CFFB2;animation:bl 1.2s infinite}
    @keyframes bl{50%{opacity:.2}}
    main{flex:1;overflow:auto;padding:16px 18px}
    button{cursor:pointer;border:0;font-weight:700;border-radius:10px;font-size:13px;font-family:inherit;transition:transform .15s,box-shadow .15s,background .2s}
    button:active{transform:scale(.94)}
    .btn{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;padding:9px 16px;box-shadow:0 6px 14px rgba(124,58,237,.2)}
    .btn:hover{transform:translateY(-2px)}
    .card{background:rgba(255,255,255,.92);border-radius:14px;padding:14px;box-shadow:0 4px 16px rgba(80,60,140,.08)}
    .grid{display:grid;gap:12px}
    .row{display:flex;align-items:center;gap:10px}
    .sp{justify-content:space-between}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    @media(max-width:680px){.two{grid-template-columns:1fr}}
    h3{font-size:14px;margin-bottom:10px}
    .muted{color:#7a7399;font-size:12px}
    input,select{width:100%;padding:9px 11px;border-radius:10px;border:1.5px solid #e4defa;background:#fff;font-size:13px;outline:none;font-family:inherit}
    input:focus,select:focus{border-color:var(--c2)}
    input[type=range]{padding:0;accent-color:var(--c2)}
    input[type=checkbox]{width:auto}
    .chip{background:#fff;border:1.5px solid #e4defa;padding:7px 12px;border-radius:18px;color:#4a4566}
    .chip.on{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;border-color:transparent}
    .badge{background:var(--c2);color:#fff;border-radius:10px;padding:1px 8px;font-size:11px;margin-left:6px;display:inline-block}
    .bump{animation:bump .4s}
    @keyframes bump{40%{transform:scale(1.5)}}
    .bar{height:8px;background:#eadffd;border-radius:6px;overflow:hidden}
    .bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--c1),var(--c2));border-radius:6px;transition:width .5s}
    .fade{animation:fu .45s both}
    @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    .pop{animation:pop .4s both}
    @keyframes pop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .av{width:34px;height:34px;border-radius:50%;display:inline-grid;place-items:center;color:#fff;font-weight:800;font-size:14px;background:linear-gradient(135deg,var(--c1),var(--c2));flex:none}
    .ok{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#22d3a8,#16a085);color:#fff;display:grid;place-items:center;font-weight:800;animation:pop .4s both;flex:none}
    .cf{position:fixed;top:-14px;width:9px;height:14px;border-radius:2px;animation:cf 1.8s linear forwards;z-index:99}
    @keyframes cf{to{transform:translateY(105vh) rotate(720deg)}}
    #toast{position:fixed;left:50%;bottom:16px;transform:translate(-50%,60px);opacity:0;padding:10px 18px;border-radius:20px;color:#fff;font-weight:700;font-size:13px;background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 10px 24px rgba(124,58,237,.3);transition:all .3s;z-index:100;white-space:nowrap}
    #toast.show{transform:translate(-50%,0);opacity:1}
  `;

  const BASE_JS = `
    const $=s=>document.querySelector(s);
    const $$=s=>Array.from(document.querySelectorAll(s));
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2000)}
    function confetti(){const cols=['#ff6a8b','#7c3aed','#22d3a8','#ffb347','#22b8ff'];for(let i=0;i<48;i++){const d=document.createElement('div');d.className='cf';d.style.left=Math.random()*100+'vw';d.style.background=cols[i%5];d.style.animationDelay=Math.random()*.4+'s';d.style.animationDuration=(1.2+Math.random()*1)+'s';document.body.appendChild(d);setTimeout(()=>d.remove(),2800)}}
    function tween(el,to,fmt){const from=+el.dataset.v||0;const t0=performance.now();function s(t){const k=Math.min(1,(t-t0)/500);const v=from+(to-from)*(1-Math.pow(1-k,3));el.textContent=fmt(Math.round(v));if(k<1)requestAnimationFrame(s);else el.dataset.v=to}requestAnimationFrame(s)}
  `;

  const DEMOS = {};

  /* =====================================================================
     1. E-COMMERCE - products, live cart, flash-sale countdown, checkout
     ===================================================================== */
  DEMOS['ecommerce'] = v => ({
    icon: '🛒',
    data: {
      deal: ['⚡ Flash Sale', '🔥 Mega Sale', '🎉 Festival Offer'][v],
      items: [
        [{ e: '🎧', n: 'Wireless Earbuds', p: 1299 }, { e: '⌚', n: 'Smart Watch', p: 2499 }, { e: '🎒', n: 'Backpack', p: 899 },
         { e: '📷', n: 'Action Cam', p: 3299 }, { e: '🔊', n: 'Bluetooth Speaker', p: 1599 }, { e: '🕶️', n: 'Sunglasses', p: 649 }],
        [{ e: '☕', n: 'Coffee Maker', p: 2199 }, { e: '💡', n: 'Smart Bulb', p: 499 }, { e: '🧴', n: 'Water Bottle', p: 349 },
         { e: '🪴', n: 'Indoor Plant', p: 299 }, { e: '🛋️', n: 'Cushion Set', p: 799 }, { e: '🕯️', n: 'Aroma Candle', p: 399 }],
        [{ e: '👕', n: 'Cotton T-Shirt', p: 599 }, { e: '👖', n: 'Slim Jeans', p: 1499 }, { e: '👟', n: 'Sneakers', p: 1799 },
         { e: '👜', n: 'Handbag', p: 1299 }, { e: '🧢', n: 'Cap', p: 349 }, { e: '⌚', n: 'Analog Watch', p: 2199 }]
      ][v]
    },
    css: `
      .banner{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;margin-bottom:14px;font-size:13px;font-weight:700;background:linear-gradient(90deg,#ffe3ec,#efe4ff,#dff6ff,#ffe3ec);background-size:300% 100%;animation:slide 6s linear infinite}
      @keyframes slide{to{background-position:300% 0}}
      .banner b{color:var(--c2);font-variant-numeric:tabular-nums}
      .shop{display:grid;grid-template-columns:1fr 260px;gap:14px;align-items:start}
      @media(max-width:700px){.shop{grid-template-columns:1fr}}
      .pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:12px}
      .prod{text-align:center;transition:transform .2s,box-shadow .2s}
      .prod:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(124,58,237,.15)}
      .em{font-size:40px;animation:fl 3s ease-in-out infinite}
      @keyframes fl{50%{transform:translateY(-6px)}}
      .ci{padding:6px 0;font-size:13px;border-bottom:1px dashed #e4defa}
      .q{width:22px;height:22px;background:#efe4ff;color:var(--c2);border-radius:50%;padding:0}
      .tot{margin-top:10px;font-size:15px}
    `,
    body: `
      <div class="banner"><span id="deal"></span><span>Ends in <b id="cd">10:00</b></span><span>🚚 Free delivery above ₹999</span></div>
      <div class="shop">
        <section class="pg" id="prods"></section>
        <aside class="card">
          <h3>🛒 Your Cart <span class="badge" id="cnt">0</span></h3>
          <div id="cartList" class="muted">Cart is empty. Add something!</div>
          <div class="bar" style="margin-top:12px"><i id="fd"></i></div>
          <div class="muted" id="fdt" style="margin-top:4px"></div>
          <div class="row sp tot"><b>Total</b><b id="tot">₹0</b></div>
          <button class="btn" id="co" style="width:100%;margin-top:10px">Checkout →</button>
        </aside>
      </div>`,
    js: `
      const P=D.items,cart={};
      $('#deal').textContent=D.deal;
      $('#prods').innerHTML=P.map((p,i)=>'<div class="card prod fade" style="animation-delay:'+(i*70)+'ms"><div class="em" style="animation-delay:'+(i*220)+'ms">'+p.e+'</div><div style="font-weight:700;font-size:13px;margin:6px 0 2px">'+p.n+'</div><div class="muted">'+inr(p.p)+'</div><button class="btn" style="margin-top:8px;padding:6px 12px" data-i="'+i+'">Add to Cart</button></div>').join('');
      $('#prods').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const i=b.dataset.i;cart[i]=(cart[i]||0)+1;b.textContent='Added ✓';setTimeout(()=>b.textContent='Add to Cart',900);const c=$('#cnt');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');draw();});
      $('#cartList').addEventListener('click',e=>{const b=e.target.closest('.q');if(!b)return;const k=b.dataset.k;cart[k]+=+b.dataset.d;if(cart[k]<=0)delete cart[k];draw();});
      function draw(){const ks=Object.keys(cart);let t=0,n=0;$('#cartList').innerHTML=ks.length?ks.map(k=>{const p=P[k],q=cart[k];t+=p.p*q;n+=q;return '<div class="row sp ci"><span>'+p.e+' '+p.n+'</span><span class="row"><button class="q" data-k="'+k+'" data-d="-1">−</button><b>'+q+'</b><button class="q" data-k="'+k+'" data-d="1">+</button></span></div>'}).join(''):'Cart is empty. Add something!';
        $('#cnt').textContent=n;$('#tot').textContent=inr(t);$('#fd').style.width=Math.min(100,t/999*100)+'%';$('#fdt').textContent=t>=999?'🎉 You unlocked free delivery!':(t>0?'Add '+inr(999-t)+' more for free delivery':'Free delivery above ₹999')}
      $('#co').onclick=()=>{if(!Object.keys(cart).length){toast('Add some items first 🙂');return}confetti();toast('🎉 Order placed! Arriving in 2 days');for(const k in cart)delete cart[k];draw()};
      let s=600;setInterval(()=>{s=s>0?s-1:600;$('#cd').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},1000);
      draw();
    `
  });

  /* =====================================================================
     2. HEALTHCARE - doctor booking + LIVE ECG + vitals
     ===================================================================== */
  DEMOS['healthcare'] = v => ({
    icon: '🏥',
    data: {
      docs: [
        [{ e: '❤️', n: 'Dr. Anita Rao', s: 'Cardiologist' }, { e: '🦷', n: 'Dr. Suresh Kumar', s: 'Dentist' }, { e: '🧴', n: 'Dr. Priya Menon', s: 'Dermatologist' }],
        [{ e: '🫀', n: 'Dr. Rahul Verma', s: 'General Physician' }, { e: '🧠', n: 'Dr. Kavya Nair', s: 'Neurologist' }, { e: '🦴', n: 'Dr. Imran Shaikh', s: 'Orthopedic' }],
        [{ e: '👁️', n: 'Dr. Lakshmi Iyer', s: 'Eye Specialist' }, { e: '👶', n: 'Dr. Arjun Das', s: 'Pediatrician' }, { e: '💊', n: 'Dr. Neha Kapoor', s: 'Pharmacist Consult' }]
      ][v],
      slots: ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'],
      base: [74, 78, 71][v]
    },
    css: `
      .doc{display:flex;gap:10px;align-items:center;padding:9px;border-radius:12px;border:1.5px solid #e4defa;margin-bottom:8px;cursor:pointer;background:#fff;transition:all .2s}
      .doc:hover{transform:translateX(3px)}
      .doc.on{border-color:var(--c2);background:#f5eeff}
      .doc .e{font-size:22px}
      .conf{display:none;gap:10px;align-items:center;margin-top:12px;padding:10px;border-radius:12px;background:#e8fbf3}
      .conf.show{display:flex;animation:pop .4s both}
      .vit{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
      .vt{text-align:center;padding:10px 4px;border-radius:12px;background:#fff}
      .vt b{display:block;font-size:20px;font-variant-numeric:tabular-nums}
      .heart{display:inline-block;animation:beat .8s infinite}
      @keyframes beat{30%{transform:scale(1.3)}}
      canvas{width:100%;height:100px;background:#fbf7ff;border-radius:12px;display:block}
      .flash{animation:fl2 .5s}
      @keyframes fl2{from{color:var(--c1);transform:scale(1.2)}}
    `,
    body: `
      <div class="two">
        <div class="card">
          <h3>📅 Book an appointment</h3>
          <div id="docs"></div>
          <div class="muted" style="margin:6px 0">Choose a slot</div>
          <div class="row" id="slots" style="flex-wrap:wrap"></div>
          <button class="btn" id="book" style="margin-top:12px;width:100%">Confirm Appointment</button>
          <div class="conf" id="conf"></div>
        </div>
        <div class="card">
          <h3><span class="heart">❤️</span> Live Patient Vitals</h3>
          <canvas id="ecg" width="320" height="100"></canvas>
          <div class="vit">
            <div class="vt"><div class="muted">Heart rate</div><b id="bpm">74</b><span class="muted">BPM</span></div>
            <div class="vt"><div class="muted">SpO₂</div><b id="spo">98</b><span class="muted">%</span></div>
            <div class="vt"><div class="muted">Temp</div><b id="tmp">36.7</b><span class="muted">°C</span></div>
          </div>
          <div class="muted" style="margin-top:10px">🟢 Monitoring active. Values refresh every 1.5s</div>
        </div>
      </div>`,
    js: `
      let selD=0,selS=null;
      $('#docs').innerHTML=D.docs.map((d,i)=>'<div class="doc'+(i===0?' on':'')+'" data-i="'+i+'"><span class="e">'+d.e+'</span><span><b>'+d.n+'</b><div class="muted">'+d.s+'</div></span></div>').join('');
      $('#docs').onclick=e=>{const el=e.target.closest('.doc');if(!el)return;selD=+el.dataset.i;$$('.doc').forEach(x=>x.classList.remove('on'));el.classList.add('on')};
      $('#slots').innerHTML=D.slots.map(s=>'<button class="chip" data-s="'+s+'">'+s+'</button>').join('');
      $('#slots').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;selS=b.dataset.s;$$('.chip').forEach(x=>x.classList.remove('on'));b.classList.add('on')};
      $('#book').onclick=()=>{if(!selS){toast('Pick a time slot first ⏰');return}const tok='MC-'+(100+Math.floor(Math.random()*900));const c=$('#conf');c.innerHTML='<div class="ok">✓</div><div><b>Appointment confirmed!</b><div class="muted">'+D.docs[selD].n+' • '+selS+' • Token '+tok+'</div></div>';c.classList.remove('show');void c.offsetWidth;c.classList.add('show');confetti()};

      const cv=$('#ecg'),cx=cv.getContext('2d'),W=cv.width,H=cv.height,N=160;
      const buf=new Array(N).fill(0);let ph=0,bpm=D.base;
      function wave(t){
        if(t<.12)return .12*Math.sin(Math.PI*t/.12);
        if(t>=.16&&t<.19)return -.18*(t-.16)/.03;
        if(t>=.19&&t<.22)return -.18+1.18*(t-.19)/.03;
        if(t>=.22&&t<.26)return 1-1.3*(t-.22)/.04;
        if(t>=.26&&t<.29)return -.3+.3*(t-.26)/.03;
        if(t>=.36&&t<.52)return .22*Math.sin(Math.PI*(t-.36)/.16);
        return 0}
      function drawEcg(){
        ph=(ph+bpm/60*.034)%1;buf.shift();buf.push(wave(ph)+(Math.random()-.5)*.02);
        cx.clearRect(0,0,W,H);cx.strokeStyle='#efe4ff';cx.lineWidth=1;
        for(let x=0;x<W;x+=20){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}
        for(let y=0;y<H;y+=20){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}
        const g=cx.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(124,58,237,.1)');g.addColorStop(1,'#ff6a8b');
        cx.strokeStyle=g;cx.lineWidth=2.2;cx.lineJoin='round';cx.beginPath();
        buf.forEach((v,i)=>{const x=i/(N-1)*W,y=H*.62-v*H*.5;i?cx.lineTo(x,y):cx.moveTo(x,y)});cx.stroke()}
      setInterval(drawEcg,30);
      function setV(id,val){const el=$(id);el.textContent=val;el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}
      setInterval(()=>{bpm=D.base-4+Math.round(Math.random()*9);setV('#bpm',bpm);setV('#spo',97+Math.round(Math.random()*2));setV('#tmp',(36.4+Math.random()*.6).toFixed(1))},1500);
    `
  });

  /* =====================================================================
     3. EDUCATION - timed quiz, streaks, score, leaderboard
     ===================================================================== */
  DEMOS['education'] = v => ({
    icon: '🎓',
    data: {
      topic: ['Web Dev Basics', 'Science Challenge', 'General Knowledge'][v],
      qs: [
        [{ q: 'HTML stands for?', o: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlinks and Text Mark Language', 'Home Tool Markup Language'], a: 0 },
         { q: 'Which CSS property changes text color?', o: ['font-style', 'color', 'text-size', 'background'], a: 1 },
         { q: 'Which keyword declares a constant in JavaScript?', o: ['var', 'let', 'const', 'static'], a: 2 },
         { q: 'Node.js lets JavaScript run on the...', o: ['Browser only', 'Server', 'Database', 'Router'], a: 1 },
         { q: 'Which HTML tag creates a hyperlink?', o: ['anchor (a)', 'link', 'href', 'nav'], a: 0 }],
        [{ q: 'Which planet is called the Red Planet?', o: ['Venus', 'Mars', 'Jupiter', 'Mercury'], a: 1 },
         { q: 'Chemical formula of water?', o: ['CO2', 'H2O', 'O2', 'NaCl'], a: 1 },
         { q: 'Plants absorb which gas for photosynthesis?', o: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], a: 2 },
         { q: 'Speed of light is about...', o: ['3 lakh km/s', '3000 km/s', '30 km/s', '3 million km/s'], a: 0 },
         { q: 'Which organ pumps blood?', o: ['Lungs', 'Liver', 'Heart', 'Kidney'], a: 2 }],
        [{ q: 'Capital of France?', o: ['Berlin', 'Madrid', 'Paris', 'Rome'], a: 2 },
         { q: 'Who wrote the Indian national anthem?', o: ['Bankim Chandra', 'Rabindranath Tagore', 'Sarojini Naidu', 'Subramania Bharati'], a: 1 },
         { q: 'Largest ocean on Earth?', o: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], a: 3 },
         { q: '9 x 8 = ?', o: ['72', '81', '64', '69'], a: 0 },
         { q: 'Currency of Japan?', o: ['Won', 'Yuan', 'Yen', 'Rupee'], a: 2 }]
      ][v]
    },
    css: `
      .qhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-weight:700;font-size:13px}
      .streak{color:#ff7a3d}
      .tm{height:10px;margin-bottom:14px}
      .tm>i{transition:width .1s linear}
      .qq{font-size:17px;font-weight:800;margin-bottom:14px}
      .opt{display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:9px;background:#fff;border:1.5px solid #e4defa;border-radius:12px;font-size:14px;color:#2b2545}
      .opt:hover{border-color:var(--c2);transform:translateX(4px)}
      .opt.good{background:#dcfce7;border-color:#22c55e}
      .opt.bad{background:#fee2e2;border-color:#ef4444;animation:shake .4s}
      @keyframes shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
      .dots{display:flex;gap:6px;margin-top:6px}
      .dots i{width:26px;height:6px;border-radius:4px;background:#eadffd}
      .dots i.d{background:var(--c2)}
      .big{font-size:48px}
      .lb div{display:flex;justify-content:space-between;padding:8px 10px;border-radius:10px;margin-bottom:6px;background:#fff;animation:fu .4s both}
      .lb .me{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-weight:800}
    `,
    body: `
      <div class="two">
        <div class="card" id="qbox"></div>
        <div class="card"><h3>🏆 Live Leaderboard</h3><div class="lb" id="lb"></div><div class="muted" style="margin-top:8px">Answer faster for bonus points ⚡</div></div>
      </div>`,
    js: `
      let qi=0,score=0,streak=0,right=0,locked=false,t=15,timer=null;
      const base=[{n:'Aarav',s:40},{n:'Meera',s:32},{n:'Karthik',s:25},{n:'Divya',s:18}];
      function lb(me){const arr=base.slice();if(me!=null)arr.push({n:'You',s:me,me:1});arr.sort((a,b)=>b.s-a.s);$('#lb').innerHTML=arr.map((x,i)=>'<div class="'+(x.me?'me':'')+'"><span>'+(i+1)+'. '+x.n+'</span><b>'+x.s+'</b></div>').join('')}
      function show(){
        clearInterval(timer);locked=false;t=15;const q=D.qs[qi];
        $('#qbox').innerHTML='<div class="qhead"><span>'+D.topic+' • Q'+(qi+1)+'/'+D.qs.length+'</span><span class="streak">🔥 '+streak+'</span><span>⭐ '+score+'</span></div><div class="bar tm"><i id="tb" style="width:100%"></i></div><div class="qq">'+esc(q.q)+'</div><div id="os"></div><div class="dots">'+D.qs.map((_,i)=>'<i class="'+(i<qi?'d':'')+'"></i>').join('')+'</div>';
        q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';b.textContent=o;b.onclick=()=>ans(i,b);$('#os').appendChild(b)});
        timer=setInterval(()=>{t-=.1;$('#tb').style.width=Math.max(0,t/15*100)+'%';if(t<=0){clearInterval(timer);ans(-1)}},100)}
      function ans(i,btn){
        if(locked)return;locked=true;clearInterval(timer);const q=D.qs[qi],bs=$$('.opt');
        if(i===q.a){btn.classList.add('good');right++;streak++;score+=10+Math.round(t/3);toast('✅ Correct! +'+(10+Math.round(t/3))+' pts')}
        else{if(btn)btn.classList.add('bad');bs[q.a].classList.add('good');streak=0;toast(i<0?'⏰ Time up!':'❌ Not quite')}
        lb(score);setTimeout(()=>{qi++;qi<D.qs.length?show():finish()},1100)}
      function finish(){
        $('#qbox').innerHTML='<div style="text-align:center"><div class="big pop">'+(right>=4?'🏆':right>=2?'🎉':'💪')+'</div><h3 style="font-size:20px;margin:8px 0">You scored '+right+'/'+D.qs.length+'</h3><div class="muted">Total points: '+score+'</div><button class="btn" id="again" style="margin-top:14px">Play Again ↻</button></div>';
        if(right>=3)confetti();$('#again').onclick=()=>{qi=0;score=0;streak=0;right=0;lb(null);show()}}
      lb(null);show();
    `
  });

  /* =====================================================================
     4. FOOD DELIVERY - menu, cart, LIVE order tracking with moving scooter
     ===================================================================== */
  DEMOS['food delivery'] = v => ({
    icon: '🍔',
    data: {
      menu: [
        [{ e: '🍕', n: 'Margherita Pizza', p: 299 }, { e: '🍔', n: 'Veg Burger', p: 149 }, { e: '🍟', n: 'French Fries', p: 99 }, { e: '🥤', n: 'Cold Coffee', p: 99 }, { e: '🌯', n: 'Paneer Wrap', p: 179 }],
        [{ e: '🍛', n: 'Chicken Biryani', p: 249 }, { e: '🥘', n: 'Paneer Butter Masala', p: 219 }, { e: '🫓', n: 'Butter Naan', p: 49 }, { e: '🍮', n: 'Gulab Jamun', p: 79 }, { e: '🥭', n: 'Mango Lassi', p: 89 }],
        [{ e: '🍜', n: 'Ramen Bowl', p: 289 }, { e: '🥗', n: 'Caesar Salad', p: 199 }, { e: '🍣', n: 'Sushi Roll', p: 349 }, { e: '🍰', n: 'Cheesecake', p: 159 }, { e: '🍵', n: 'Green Tea', p: 79 }]
      ][v],
      from: ['🍳 FoodFast Kitchen', '🍽️ TastyTrack Restaurant', '👨‍🍳 CloudKitchen Hub'][v]
    },
    css: `
      .menu .mi{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:12px;background:#faf6ff;margin-bottom:8px;animation:fu .4s both}
      .mi .e{font-size:26px;margin-right:8px}
      .qb{width:26px;height:26px;border-radius:50%;background:#efe4ff;color:var(--c2);padding:0;font-size:15px}
      .road{position:relative;height:54px;margin:14px 0 6px;border-radius:12px;background:linear-gradient(#f3ecff,#f3ecff);overflow:hidden}
      .road:before{content:'';position:absolute;left:0;right:0;top:50%;border-top:3px dashed #cbb8f5}
      .scoot{position:absolute;top:8px;left:4%;font-size:28px;transition:left 2.8s ease-in-out;transform:scaleX(-1)}
      .scoot.go{animation:bob .5s infinite}
      @keyframes bob{50%{transform:scaleX(-1) translateY(-4px)}}
      .src,.dst{position:absolute;top:10px;font-size:24px}
      .src{left:2px}.dst{right:4px}
      .stg{display:flex;align-items:center;gap:10px;padding:6px 0;color:#b4abd6;font-size:13px;font-weight:600;transition:color .3s}
      .stg i{width:16px;height:16px;border-radius:50%;background:#eadffd;display:grid;place-items:center;font-size:10px;color:#fff;font-style:normal}
      .stg.done{color:#2b2545}.stg.done i{background:#22c55e}
      .stg.now i{background:var(--c2);animation:bl 1s infinite}
      .eta{font-size:26px;font-weight:800;color:var(--c2)}
    `,
    body: `
      <div class="two">
        <div class="card menu"><h3>📋 Menu</h3><div id="menu"></div></div>
        <div class="card">
          <div id="orderBox">
            <h3>🧾 Your Order <span class="badge" id="cnt">0</span></h3>
            <div class="row sp" style="font-size:16px"><b>Total</b><b id="tot">₹0</b></div>
            <button class="btn" id="place" style="width:100%;margin-top:12px">Place Order 🛵</button>
            <div class="muted" style="margin-top:10px">Add items, place the order and watch the live tracker.</div>
          </div>
          <div id="trackBox" style="display:none">
            <h3>📍 Live Order Tracking</h3>
            <div class="row sp"><span class="muted">Arriving in</span><span class="eta"><span id="eta">12</span> min</span></div>
            <div class="road"><span class="src" id="src">🍳</span><span class="scoot" id="sc">🛵</span><span class="dst">🏠</span></div>
            <div id="stages"></div>
            <button class="btn" id="again" style="width:100%;margin-top:10px;display:none">Order Again ↻</button>
          </div>
        </div>
      </div>`,
    js: `
      const M=D.menu,q=M.map(()=>0);let timers=[];
      $('#menu').innerHTML=M.map((m,i)=>'<div class="mi" style="animation-delay:'+(i*70)+'ms"><span><span class="e">'+m.e+'</span><b style="font-size:13px">'+m.n+'</b><div class="muted" style="margin-left:34px">'+inr(m.p)+'</div></span><span class="row"><button class="qb" data-i="'+i+'" data-d="-1">−</button><b class="qv">0</b><button class="qb" data-i="'+i+'" data-d="1">+</button></span></div>').join('');
      $('#menu').onclick=e=>{const b=e.target.closest('.qb');if(!b)return;const i=+b.dataset.i;q[i]=Math.max(0,q[i]+ +b.dataset.d);upd()};
      function upd(){let t=0,n=0;q.forEach((x,i)=>{t+=x*M[i].p;n+=x});$$('.qv').forEach((el,i)=>el.textContent=q[i]);$('#tot').textContent=inr(t);const c=$('#cnt');c.textContent=n;c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}
      const ST=['Order placed ✅','Preparing your food 👨‍🍳','Out for delivery 🛵','Delivered. Enjoy! 🎉'],POS=[4,4,46,86],AT=[0,3000,6000,10000];
      function track(){
        $('#orderBox').style.display='none';$('#trackBox').style.display='block';$('#again').style.display='none';
        $('#src').textContent=D.from.split(' ')[0];$('#sc').style.transition='none';$('#sc').style.left='4%';void $('#sc').offsetWidth;$('#sc').style.transition='';
        const render=s=>{$('#stages').innerHTML=ST.map((t,i)=>'<div class="stg '+(i<s?'done':i===s?'now':'')+'"><i>'+(i<s?'✓':'')+'</i>'+t+'</div>').join('')};
        render(0);let sec=0;
        timers.push(setInterval(()=>{sec++;$('#eta').textContent=Math.max(0,12-sec)},1000));
        AT.forEach((ms,s)=>timers.push(setTimeout(()=>{render(s>=3?4:s);$('#sc').style.left=POS[s]+'%';$('#sc').classList.toggle('go',s===2);
          if(s===3){timers.forEach(clearInterval);$('#eta').textContent='0';$('#sc').textContent='😋';$('#sc').style.transform='none';confetti();$('#again').style.display='block'}},ms)));
      }
      $('#place').onclick=()=>{if(!q.some(x=>x>0)){toast('Add something tasty first 🍕');return}track()};
      $('#again').onclick=()=>{timers.forEach(t=>{clearTimeout(t);clearInterval(t)});timers=[];$('#sc').textContent='🛵';$('#sc').style.transform='';q.fill(0);upd();$('#trackBox').style.display='none';$('#orderBox').style.display='block'};
      upd();
    `
  });

  /* =====================================================================
     5. SOCIAL MEDIA - live feed / real-time chat / photo feed
     ===================================================================== */
  DEMOS['social media'] = v => ({
    icon: ['💬', '🗨️', '📸'][v],
    data: {
      mode: ['feed', 'chat', 'photo'][v],
      posts: [
        [{ u: 'Riya Sharma', x: 'Just shipped a new feature! 🚀 #coding' }, { u: 'Arun Kumar', x: 'Coffee + code = productive Monday ☕' }, { u: 'Sneha Patel', x: 'Finally learned CSS grid. Mind blown 🤯' },
         { u: 'Vikram Rao', x: 'Anyone up for a hackathon this weekend?' }, { u: 'Isha Gupta', x: 'Deployed my first Node.js app today 🎉' }, { u: 'Dev Menon', x: 'Dark mode or light mode? Choose wisely.' }],
        [],
        [{ u: 'Ananya', x: 'Golden hour hits different ✨', e: '🌇' }, { u: 'Rohit', x: 'Weekend trip vibes', e: '🏔️' }, { u: 'Mira', x: 'Fresh from the oven 🥐', e: '🥐' },
         { u: 'Kabir', x: 'City lights at night', e: '🌃' }, { u: 'Tara', x: 'Beach day with friends', e: '🏖️' }, { u: 'Zoya', x: 'New pet, new life 🐶', e: '🐶' }]
      ][v],
      friends: [{ n: 'Aisha', e: '👩' }, { n: 'Rohan', e: '👨' }, { n: 'Meera', e: '👩‍💻' }, { n: 'Karan', e: '🧑' }],
      seed: [['Aisha', 'Hey team! Ready for the demo? 🚀'], ['Rohan', 'Yes! Just finished the chat module'], ['Meera', 'Nice, the typing indicator looks smooth']],
      replies: ['That sounds great! 👍', 'Haha exactly 😄', 'Let me check and get back to you', 'Awesome work!', 'Can we push this today?', 'Love it ❤️', 'On it! 🔥', 'Brb, grabbing coffee ☕']
    },
    css: `
      .av{margin-right:0}
      .stories{display:flex;gap:12px;margin-bottom:12px;overflow:hidden}
      .story{position:relative;width:54px;height:54px;flex:none}
      .story:before{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(var(--c1),var(--c2),#ffb347,var(--c1));animation:spin 3s linear infinite}
      .story span{position:absolute;inset:3px;background:#fff;border-radius:50%;display:grid;place-items:center;font-size:22px}
      .post{margin-bottom:12px}
      .pt{margin:10px 0;font-size:14px}
      .photo{height:150px;border-radius:12px;display:grid;place-items:center;font-size:64px;position:relative;cursor:pointer;user-select:none}
      .photo .hp{position:absolute;font-size:70px;opacity:0;pointer-events:none}
      .photo .hp.show{animation:hp .8s}
      @keyframes hp{0%{opacity:1;transform:scale(.3)}50%{opacity:1;transform:scale(1.2)}100%{opacity:0;transform:scale(1)}}
      .act button{background:#f5eeff;color:var(--c2);padding:6px 12px}
      .act button.liked{background:#ffe4ec;color:#e11d48}
      .heartpop{animation:bump .4s}
      .cms p{background:#f7f3ff;padding:7px 11px;border-radius:10px;margin-top:6px;font-size:13px}
      .newp{box-shadow:0 0 0 2px var(--c1),0 8px 24px rgba(124,58,237,.2)}
      /* chat */
      .chat{display:grid;grid-template-columns:1fr 150px;gap:12px;height:100%}
      @media(max-width:600px){.chat{grid-template-columns:1fr}.who{display:none}}
      .log{height:calc(100% - 78px);min-height:230px;overflow:auto;padding:4px}
      .m{display:flex;gap:8px;margin-bottom:10px;align-items:flex-end}
      .m.me{flex-direction:row-reverse}
      .bb{max-width:75%;padding:9px 13px;border-radius:16px 16px 16px 4px;background:#fff;font-size:13px;box-shadow:0 2px 8px rgba(80,60,140,.08)}
      .m.me .bb{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;border-radius:16px 16px 4px 16px}
      .bb small{display:block;font-weight:800;font-size:10px;opacity:.7;margin-bottom:2px}
      .em2{font-size:26px}
      .typing{height:20px;font-size:12px;color:var(--c2);font-weight:700}
      .dots3 span{display:inline-block;animation:dj 1s infinite}
      .dots3 span:nth-child(2){animation-delay:.15s}.dots3 span:nth-child(3){animation-delay:.3s}
      @keyframes dj{40%{transform:translateY(-4px)}}
      .on-l{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:13px;font-weight:600}
      .on-l i{width:9px;height:9px;border-radius:50%;background:#22c55e;animation:bl 1.6s infinite}
    `,
    body: `<div id="root"></div>`,
    js: `
      const root=$('#root');
      const COL=['#ff6a8b','#7c3aed','#22b8ff','#22d3a8','#ffb347','#f06595'];
      const GRAD=['linear-gradient(135deg,#ffd6e0,#e0c3fc)','linear-gradient(135deg,#c2f0ff,#e0c3fc)','linear-gradient(135deg,#d4fcdf,#c2e9fb)','linear-gradient(135deg,#ffe8b8,#ffc3d8)'];
      if(D.mode==='chat'){
        root.innerHTML='<div class="chat"><div class="card" style="display:flex;flex-direction:column"><h3>💬 Team Chat <span class="badge">LIVE</span></h3><div class="log" id="log"></div><div class="typing" id="typ"></div><div class="row"><input id="msg" placeholder="Type a message and press Enter…"><button class="btn" id="snd">Send</button></div></div><div class="card who"><h3>🟢 Online</h3>'+D.friends.map(f=>'<div class="on-l"><span class="em2">'+f.e+'</span>'+f.n+'<i></i></div>').join('')+'<div class="on-l"><span class="em2">🙂</span>You<i></i></div></div></div>';
        const log=$('#log');
        function add(n,t,me,e){const d=document.createElement('div');d.className='m fade'+(me?' me':'');d.innerHTML=(me?'':'<span class="em2">'+(e||'🙂')+'</span>')+'<div class="bb"><small>'+(me?'You':esc(n))+'</small>'+esc(t)+'</div>';log.appendChild(d);log.scrollTop=log.scrollHeight}
        function reply(){const f=pick(D.friends);$('#typ').innerHTML=f.n+' is typing <span class="dots3"><span>•</span><span>•</span><span>•</span></span>';setTimeout(()=>{$('#typ').innerHTML='';add(f.n,pick(D.replies),false,f.e)},1300+Math.random()*900)}
        D.seed.forEach((s,i)=>setTimeout(()=>add(s[0],s[1],false,(D.friends.find(f=>f.n===s[0])||{}).e),400+i*900));
        function send(){const t=$('#msg').value.trim();if(!t)return;add('You',t,true);$('#msg').value='';setTimeout(reply,500)}
        $('#snd').onclick=send;$('#msg').addEventListener('keydown',e=>{if(e.key==='Enter')send()});
        setInterval(reply,9000);
      } else {
        root.innerHTML='<div class="stories">'+['➕','🧑','👩','🧔','👧','👨'].map(e=>'<div class="story"><span>'+e+'</span></div>').join('')+'</div><div class="card row" style="margin-bottom:12px"><input id="comp" placeholder="'+(D.mode==='photo'?'Share a caption…':'What is on your mind?')+'"><button class="btn" id="pb">Post</button></div><div id="feed"></div>';
        let idx=0;
        function post(p,top,fresh){
          const d=document.createElement('div');d.className='card post fade'+(fresh?' newp':'');
          d.innerHTML='<div class="row"><span class="av" style="background:'+COL[(p.u.length)%6]+'">'+esc(p.u[0])+'</span><span><b>'+esc(p.u)+'</b><div class="muted">'+(fresh?'just now':Math.ceil(Math.random()*50)+' min ago')+'</div></span></div><p class="pt">'+esc(p.x)+'</p>'+(D.mode==='photo'?'<div class="photo" style="background:'+GRAD[p.u.length%4]+'">'+(p.e||'📷')+'<span class="hp">❤️</span></div>':'')+'<div class="row act"><button class="lk">🤍 <b>'+(5+Math.floor(Math.random()*40))+'</b></button><button class="cm">💬 Comment</button></div><div class="cms"></div><input class="ci" placeholder="Write a comment, press Enter…" style="display:none;margin-top:8px">';
          const lk=d.querySelector('.lk');
          function like(on){const b=lk.querySelector('b');if(on===undefined)on=!lk.classList.contains('liked');if(on===lk.classList.contains('liked'))return;lk.classList.toggle('liked',on);b.textContent=+b.textContent+(on?1:-1);lk.firstChild.textContent=on?'❤️ ':'🤍 ';lk.classList.remove('heartpop');void lk.offsetWidth;lk.classList.add('heartpop')}
          lk.onclick=()=>like();
          const ph=d.querySelector('.photo');if(ph)ph.ondblclick=()=>{like(true);const h=ph.querySelector('.hp');h.classList.remove('show');void h.offsetWidth;h.classList.add('show')};
          const ci=d.querySelector('.ci');d.querySelector('.cm').onclick=()=>{ci.style.display=ci.style.display==='none'?'block':'none';ci.focus()};
          ci.addEventListener('keydown',e=>{if(e.key==='Enter'&&ci.value.trim()){const c=document.createElement('p');c.className='fade';c.textContent='🗨️ '+ci.value;d.querySelector('.cms').appendChild(c);ci.value=''}});
          const f=$('#feed');top?f.prepend(d):f.appendChild(d);if(fresh)setTimeout(()=>d.classList.remove('newp'),2500)}
        for(let i=0;i<3;i++)post(D.posts[idx++%D.posts.length],false);
        $('#pb').onclick=()=>{const t=$('#comp').value.trim();if(!t){toast('Write something first ✍️');return}post({u:'You',x:t,e:'🌟'},true,true);$('#comp').value=''};
        setInterval(()=>{const p=D.posts[idx++%D.posts.length];post(p,true,true);toast('🔔 New post from '+p.u)},7000);
      }
    `
  });

  /* =====================================================================
     6. FINANCE - LIVE stock chart, buy/sell, budget tracker
     ===================================================================== */
  DEMOS['finance'] = v => ({
    icon: '💰',
    data: { sym: ['TCS', 'INFY', 'RELIANCE'][v], base: [3800, 1500, 2900][v] },
    css: `
      .tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
      .tile{background:#fff;border-radius:12px;padding:8px;text-align:center}
      .tile b{display:block;font-size:14px;font-variant-numeric:tabular-nums}
      .price{font-size:28px;font-weight:800;font-variant-numeric:tabular-nums;transition:color .3s}
      .up{color:#16a34a}.dn{color:#dc2626}
      svg.ch{width:100%;height:auto;display:block}
      .bud{margin-bottom:12px}
      .bud .bar{height:10px;margin-top:5px}
      .bud .bar>i.over{background:linear-gradient(90deg,#fb7185,#e11d48)}
      .plus{background:#efe4ff;color:var(--c2);padding:4px 9px;font-size:11px}
    `,
    body: `
      <div class="two">
        <div class="card">
          <div class="row sp"><div><div class="muted">📈 Live market</div><b id="sym"></b></div><div style="text-align:right"><div class="price" id="pr">0</div><div class="muted" id="chg">0%</div></div></div>
          <svg class="ch" viewBox="0 0 400 130"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c1);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--c2);stop-opacity:0"/></linearGradient><linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--c2)"/><stop offset="1" style="stop-color:var(--c1)"/></linearGradient></defs><polygon id="ar" fill="url(#ag)"/><polyline id="ln" fill="none" stroke="url(#lg)" stroke-width="2.5" stroke-linejoin="round"/><circle id="dot" r="4.5" fill="#ff6a8b"><animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite"/></circle></svg>
          <div class="row" style="margin-top:8px"><button class="btn" id="buy" style="flex:1">Buy 1</button><button class="btn" id="sell" style="flex:1;background:#fff;color:var(--c2);border:1.5px solid var(--c2);box-shadow:none">Sell 1</button></div>
          <div class="tiles"><div class="tile"><span class="muted">Cash</span><b id="cash"></b></div><div class="tile"><span class="muted">Shares</span><b id="sh">0</b></div><div class="tile"><span class="muted">Portfolio</span><b id="pv"></b></div></div>
        </div>
        <div class="card"><h3>💳 Monthly Budget</h3><div id="bud"></div><div class="muted">Tap +₹500 to log an expense. Bars turn red over budget.</div></div>
      </div>`,
    js: `
      const N=50,W=400,H=130;let pr=D.base,hist=[];for(let i=0;i<N;i++){pr+=(Math.random()-.48)*D.base*.004;hist.push(pr)}
      let cash=100000,sh=0;$('#sym').textContent=D.sym+' • NSE';
      function chart(){const mn=Math.min(...hist),mx=Math.max(...hist);const pts=hist.map((x,i)=>[i/(N-1)*(W-12),H-10-(x-mn)/((mx-mn)||1)*(H-26)]);const l=pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');$('#ln').setAttribute('points',l);$('#ar').setAttribute('points','0,'+H+' '+l+' '+(W-12)+','+H);$('#dot').setAttribute('cx',pts[N-1][0]);$('#dot').setAttribute('cy',pts[N-1][1])}
      function stats(){$('#pr').textContent=inr(Math.round(pr));const c=(pr/hist[0]-1)*100;const el=$('#chg');el.textContent=(c>=0?'▲ ':'▼ ')+Math.abs(c).toFixed(2)+'%';el.className='muted '+(c>=0?'up':'dn');$('#cash').textContent=inr(Math.round(cash));$('#sh').textContent=sh;$('#pv').textContent=inr(Math.round(cash+sh*pr))}
      setInterval(()=>{const old=pr;pr=Math.max(D.base*.8,pr+(Math.random()-.5)*D.base*.008);hist.shift();hist.push(pr);$('#pr').className='price '+(pr>=old?'up':'dn');chart();stats()},900);
      $('#buy').onclick=()=>{if(cash<pr){toast('Not enough cash 💸');return}cash-=pr;sh++;stats();toast('Bought 1 '+D.sym)};
      $('#sell').onclick=()=>{if(sh<1){toast('No shares to sell');return}cash+=pr;sh--;stats();toast('Sold 1 '+D.sym)};
      const B=[{n:'🍔 Food',lim:8000,sp:5200},{n:'🏠 Rent',lim:15000,sp:15000},{n:'🎮 Fun',lim:4000,sp:1800}];
      function bud(){$('#bud').innerHTML=B.map((b,i)=>'<div class="bud"><div class="row sp"><b style="font-size:13px">'+b.n+'</b><span class="muted">'+inr(b.sp)+' / '+inr(b.lim)+' <button class="plus" data-i="'+i+'">+₹500</button></span></div><div class="bar"><i class="'+(b.sp>b.lim?'over':'')+'" style="width:'+Math.min(100,b.sp/b.lim*100)+'%"></i></div></div>').join('')}
      $('#bud').onclick=e=>{const b=e.target.closest('.plus');if(!b)return;const x=B[+b.dataset.i];x.sp+=500;bud();if(x.sp>x.lim)toast('⚠️ Over budget on '+x.n)};
      chart();stats();setTimeout(bud,50);
    `
  });

  /* =====================================================================
     7. TRAVEL - search with moving vehicle, offers, boarding pass
     ===================================================================== */
  DEMOS['travel'] = v => ({
    icon: ['✈️', '🧳', '🚕'][v],
    data: {
      what: ['flights', 'trip packages', 'rides'][v], veh: ['✈️', '✈️', '🚕'][v],
      l1: ['From', 'Start', 'Pickup'][v], l2: ['To', 'Destination', 'Drop'][v],
      cities: [['Chennai', 'Goa', 'Delhi', 'Mumbai', 'Kochi'], ['Chennai', 'Goa', 'Munnar', 'Jaipur', 'Manali'], ['Gandhipuram', 'Airport', 'Railway Station', 'RS Puram', 'Peelamedu']][v],
      f: [0, 0, 0][v], t: [1, 1, 1][v],
      ticket: ['BOARDING PASS', 'TRIP VOUCHER', 'RIDE CONFIRMED'][v], act: ['Book', 'Book', 'Book Ride'][v],
      offers: [
        [{ a: 'IndiGo', t: '06:05 to 07:45', p: 3499 }, { a: 'Air India', t: '09:40 to 11:15', p: 4120 }, { a: 'Akasa Air', t: '14:20 to 15:55', p: 3290 }],
        [{ a: 'Beach Escape', t: '3N / 4D', p: 12999 }, { a: 'Hills Retreat', t: '2N / 3D', p: 8999 }, { a: 'Heritage Tour', t: '3N / 4D', p: 14499 }],
        [{ a: '🚗 Mini', t: 'ETA 4 min', p: 189 }, { a: '🚕 Sedan', t: 'ETA 6 min', p: 259 }, { a: '🚙 SUV', t: 'ETA 9 min', p: 379 }]
      ][v]
    },
    css: `
      .lane{position:relative;height:36px;margin:14px 0 4px;border-bottom:3px dashed #cbb8f5;overflow:hidden}
      .veh{position:absolute;left:-40px;top:2px;font-size:26px;animation:fly 6s linear infinite}
      .lane.run .veh{animation-duration:1.1s}
      @keyframes fly{to{left:105%}}
      .of{display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:12px;background:#fff;margin-bottom:8px;animation:fu .45s both}
      .price{font-weight:800;color:var(--c2);margin-right:10px}
      .ticket{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px;border-radius:14px;margin-top:12px;color:#fff;background:linear-gradient(135deg,var(--c1),var(--c2));position:relative}
      .ticket:after{content:'';position:absolute;right:112px;top:8px;bottom:8px;border-left:2px dashed rgba(255,255,255,.6)}
      .ticket small{opacity:.85;display:block}
      .barcode{width:84px;height:54px;background:repeating-linear-gradient(90deg,#fff 0 2px,transparent 2px 5px,#fff 5px 6px,transparent 6px 9px);border-radius:4px}
    `,
    body: `
      <div class="card">
        <div class="two">
          <div><div class="muted" id="l1"></div><select id="f"></select></div>
          <div><div class="muted" id="l2"></div><select id="t"></select></div>
        </div>
        <button class="btn" id="go" style="margin-top:12px;width:100%">🔍 Search</button>
        <div class="lane" id="lane"><span class="veh" id="veh"></span></div>
        <div class="muted" id="ls" style="min-height:16px"></div>
        <div id="res" style="margin-top:8px"></div>
        <div id="tk"></div>
      </div>`,
    js: `
      $('#l1').textContent=D.l1;$('#l2').textContent=D.l2;$('#veh').textContent=D.veh;
      const opt=i=>D.cities.map((c,k)=>'<option'+(k===i?' selected':'')+'>'+c+'</option>').join('');
      $('#f').innerHTML=opt(D.f);$('#t').innerHTML=opt(D.t);
      $('#go').onclick=()=>{
        const f=$('#f').value,t=$('#t').value;if(f===t){toast('Choose two different places 📍');return}
        $('#res').innerHTML='';$('#tk').innerHTML='';$('#lane').classList.add('run');$('#ls').textContent='Searching best '+D.what+' for '+f+' to '+t+'…';
        setTimeout(()=>{$('#lane').classList.remove('run');$('#ls').textContent='✅ '+D.offers.length+' options found';
          $('#res').innerHTML=D.offers.map((o,i)=>'<div class="of" style="animation-delay:'+(i*120)+'ms"><span><b>'+o.a+'</b><div class="muted">'+f+' → '+t+' • '+o.t+'</div></span><span><span class="price">'+inr(o.p)+'</span><button class="btn" data-i="'+i+'" style="padding:6px 12px">'+D.act+'</button></span></div>').join('')},1700)};
      $('#res').onclick=e=>{const b=e.target.closest('button');if(!b)return;const o=D.offers[+b.dataset.i];const code=(Math.random().toString(36).slice(2,8)).toUpperCase();
        $('#tk').innerHTML='<div class="ticket pop"><div><small>'+D.ticket+'</small><b style="font-size:18px">'+$('#f').value+' → '+$('#t').value+'</b><small>'+o.a+' • '+o.t+' • '+inr(o.p)+'</small><small>Ref: '+code+'</small></div><div class="barcode"></div></div>';confetti();toast('🎉 Booking confirmed!')};
    `
  });

  /* =====================================================================
     8. REAL ESTATE - budget filter, favourites, visit booking, EMI / rent split
     ===================================================================== */
  DEMOS['real estate'] = v => ({
    icon: '🏠',
    data: {
      mode: ['sale', 'rent', 'sale'][v],
      list: [
        [{ e: '🏢', n: '2BHK Apartment', a: 'Whitefield', b: 2, p: 65, g: 'linear-gradient(135deg,#ffd6e0,#e0c3fc)' }, { e: '🏡', n: '3BHK Villa', a: 'ECR', b: 3, p: 120, g: 'linear-gradient(135deg,#c2f0ff,#e0c3fc)' },
         { e: '🏬', n: '1BHK Studio', a: 'Indiranagar', b: 1, p: 42, g: 'linear-gradient(135deg,#d4fcdf,#c2e9fb)' }, { e: '🏘️', n: '3BHK Flat', a: 'OMR', b: 3, p: 88, g: 'linear-gradient(135deg,#ffe8b8,#ffc3d8)' }],
        [{ e: '🏢', n: '1BHK Apartment', a: 'Koramangala', b: 1, p: 18000, g: 'linear-gradient(135deg,#ffd6e0,#e0c3fc)' }, { e: '🏠', n: '2BHK House', a: 'Adyar', b: 2, p: 26000, g: 'linear-gradient(135deg,#c2f0ff,#e0c3fc)' },
         { e: '🏬', n: 'Studio Flat', a: 'HSR Layout', b: 1, p: 12000, g: 'linear-gradient(135deg,#d4fcdf,#c2e9fb)' }, { e: '🏡', n: '3BHK Duplex', a: 'Anna Nagar', b: 3, p: 42000, g: 'linear-gradient(135deg,#ffe8b8,#ffc3d8)' }],
        [{ e: '🏰', n: 'Luxury Penthouse', a: 'Marine Drive', b: 4, p: 190, g: 'linear-gradient(135deg,#ffd6e0,#e0c3fc)' }, { e: '🏡', n: 'Garden Villa', a: 'Lonavala', b: 3, p: 110, g: 'linear-gradient(135deg,#c2f0ff,#e0c3fc)' },
         { e: '🏢', n: 'Smart Apartment', a: 'Gachibowli', b: 2, p: 72, g: 'linear-gradient(135deg,#d4fcdf,#c2e9fb)' }, { e: '🏘️', n: 'Row House', a: 'Wakad', b: 3, p: 58, g: 'linear-gradient(135deg,#ffe8b8,#ffc3d8)' }]
      ][v],
      min: [20, 8000, 30][v], max: [200, 50000, 200][v], step: [5, 1000, 5][v]
    },
    css: `
      .props{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:12px}
      .prop{padding:0;overflow:hidden;transition:all .35s}
      .prop.off{opacity:.2;transform:scale(.94);pointer-events:none;filter:grayscale(1)}
      .pic{height:84px;display:grid;place-items:center;font-size:42px}
      .pb{padding:10px 12px}
      .pr{font-weight:800;color:var(--c2)}
      .hrt{background:none;font-size:18px;padding:2px 4px}
      .emi{font-size:30px;font-weight:800;color:var(--c2);font-variant-numeric:tabular-nums}
      .lbl{display:flex;justify-content:space-between;font-size:12px;margin-top:10px}
    `,
    body: `
      <div class="card"><div class="row sp"><b id="bl"></b><span class="muted" id="mc"></span></div><input type="range" id="bud" style="margin-top:8px"></div>
      <div class="props" id="props"></div>
      <div class="card" style="margin-top:12px" id="calc"></div>`,
    js: `
      const sale=D.mode==='sale';
      const fmt=p=>sale?(p>=100?'₹'+(p/100).toFixed(2)+' Cr':'₹'+p+' Lakh'):'₹'+p.toLocaleString('en-IN')+'/mo';
      const bud=$('#bud');bud.min=D.min;bud.max=D.max;bud.step=D.step;bud.value=D.max;
      $('#props').innerHTML=D.list.map((l,i)=>'<div class="card prop fade" style="animation-delay:'+(i*90)+'ms"><div class="pic" style="background:'+l.g+'">'+l.e+'</div><div class="pb"><b>'+l.n+'</b><div class="muted">📍 '+l.a+' • 🛏 '+l.b+' BHK</div><div class="row sp" style="margin-top:6px"><span class="pr">'+fmt(l.p)+'</span><span class="row"><button class="hrt">🤍</button><button class="btn vs" style="padding:5px 9px;font-size:11px">Visit</button></span></div></div></div>').join('');
      $('#props').onclick=e=>{const h=e.target.closest('.hrt');if(h){h.textContent=h.textContent==='🤍'?'❤️':'🤍';h.classList.remove('bump');void h.offsetWidth;h.classList.add('bump')}
        const b=e.target.closest('.vs');if(b){b.textContent='Booked ✓';b.disabled=true;toast('📅 Visit scheduled for Saturday 11 AM');confetti()}};
      function filt(){const m=+bud.value;let n=0;$$('.prop').forEach((el,i)=>{const ok=D.list[i].p<=m;el.classList.toggle('off',!ok);if(ok)n++});$('#bl').textContent='Max budget: '+fmt(m);$('#mc').textContent=n+' of '+D.list.length+' homes match'}
      bud.oninput=filt;filt();
      if(sale){
        $('#calc').innerHTML='<h3>🧮 EMI Calculator</h3><div class="two"><div><div class="lbl"><span>Loan</span><b id="a1">50 L</b></div><input type="range" id="ln" min="10" max="150" value="50"><div class="lbl"><span>Interest</span><b id="a2">8.5%</b></div><input type="range" id="rt" min="6" max="12" step=".1" value="8.5"><div class="lbl"><span>Tenure</span><b id="a3">20 yr</b></div><input type="range" id="yr" min="5" max="30" value="20"></div><div style="text-align:center;align-self:center"><div class="muted">Monthly EMI</div><div class="emi" id="emi">₹0</div></div></div>';
        const calc=()=>{const P=$('#ln').value*1e5,r=$('#rt').value/1200,n=$('#yr').value*12;const e=P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);$('#a1').textContent=$('#ln').value+' L';$('#a2').textContent=$('#rt').value+'%';$('#a3').textContent=$('#yr').value+' yr';tween($('#emi'),Math.round(e),inr)};
        ['#ln','#rt','#yr'].forEach(s=>$(s).oninput=calc);calc();
      } else {
        $('#calc').innerHTML='<h3>🤝 Split the rent</h3><div class="two"><div><div class="lbl"><span>Monthly rent</span><b id="a1">₹26,000</b></div><input type="range" id="rn" min="8000" max="50000" step="1000" value="26000"><div class="lbl"><span>Roommates</span><b id="a2">2</b></div><input type="range" id="rm" min="1" max="5" value="2"></div><div style="text-align:center;align-self:center"><div class="muted">Each person pays</div><div class="emi" id="emi">₹0</div></div></div>';
        const calc=()=>{const r=+$('#rn').value,m=+$('#rm').value;$('#a1').textContent=inr(r);$('#a2').textContent=m;tween($('#emi'),Math.round(r/m),inr)};
        ['#rn','#rm'].forEach(s=>$(s).oninput=calc);calc();
      }
    `
  });

  /* =====================================================================
     9. FITNESS - progress ring, live session timer + calories, weekly bars
     ===================================================================== */
  DEMOS['fitness'] = v => ({
    icon: ['💪', '🏋️', '🥗'][v],
    data: {
      mode: ['workout', 'class', 'meal'][v],
      title: ["Today's Workout", "Today's Classes", "Today's Meal Plan"][v],
      unit: ['kcal burned', 'kcal planned', 'kcal eaten'][v],
      goal: [150, 800, 1650][v],
      items: [
        [{ n: 'Push-ups x20', v: 12 }, { n: 'Squats x25', v: 15 }, { n: 'Plank 1 min', v: 8 }, { n: 'Jumping Jacks x30', v: 14 }, { n: 'Burpees x10', v: 18 }],
        [{ n: 'Yoga 6:30 AM', v: 120 }, { n: 'Zumba 8:00 AM', v: 300 }, { n: 'HIIT 6:00 PM', v: 400 }, { n: 'Spin 7:00 PM', v: 350 }, { n: 'Stretch 8:00 PM', v: 80 }],
        [{ n: 'Oats and Banana', v: 320 }, { n: 'Veg Sandwich', v: 280 }, { n: 'Dal Rice', v: 520 }, { n: 'Fruit Bowl', v: 150 }, { n: 'Paneer Salad', v: 380 }]
      ][v]
    },
    css: `
      .ex{display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:10px 12px;cursor:pointer;transition:all .2s}
      .ex span:nth-child(2){flex:1;font-weight:600;font-size:13px}
      .ex:has(input:checked){background:#e8fbf3;transform:translateX(4px)}
      .ex:has(input:checked) span:nth-child(2){text-decoration:line-through;opacity:.6}
      .ring{position:relative;width:140px;height:140px;margin:0 auto}
      .ring svg{transform:rotate(0)}
      .ring .mid{position:absolute;inset:0;display:grid;place-content:center;text-align:center}
      .ring b{font-size:26px;font-variant-numeric:tabular-nums}
      .wk{display:flex;align-items:stretch;gap:8px;height:80px;margin-top:14px}
      .wk div{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;text-align:center;font-size:10px;color:#7a7399}
      .wk i{display:block;border-radius:6px 6px 0 0;background:linear-gradient(180deg,var(--c1),var(--c2));height:4px;transition:height .8s;flex:none}
      .wk .today i{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--c2)}
      .sess{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums}
      .gl{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
      .gl button{font-size:20px;background:#eaf6ff;padding:6px 8px;opacity:.45;transition:all .3s}
      .gl button.f{opacity:1;background:#cfeaff;transform:scale(1.08)}
    `,
    body: `
      <div class="two">
        <div class="card"><h3 id="ttl"></h3><div id="ex"></div></div>
        <div class="card" style="text-align:center">
          <div class="ring"><svg width="140" height="140" viewBox="0 0 140 140"><defs><linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--c1)"/><stop offset="1" style="stop-color:var(--c2)"/></linearGradient></defs><circle cx="70" cy="70" r="58" fill="none" stroke="#eadffd" stroke-width="12"/><circle id="rg" cx="70" cy="70" r="58" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="364.4" stroke-dashoffset="364.4" transform="rotate(-90 70 70)" style="stroke:url(#gr);transition:stroke-dashoffset .6s"/></svg><div class="mid"><b id="kc">0</b><span class="muted" id="un"></span></div></div>
          <div class="muted" id="goal" style="margin:6px 0 10px"></div>
          <div id="live"></div>
          <div class="wk" id="wk"></div>
        </div>
      </div>`,
    js: `
      const I=D.items,C=364.4;let live=0,t=0,run=false;
      $('#ttl').textContent='📋 '+D.title;$('#un').textContent=D.unit;$('#goal').textContent='Daily goal: '+D.goal+' kcal';
      $('#ex').innerHTML=I.map((x,i)=>'<label class="card ex fade" style="animation-delay:'+(i*70)+'ms"><input type="checkbox" data-i="'+i+'"><span>'+x.n+'</span><span class="muted">'+x.v+' kcal</span></label>').join('');
      function ring(){let s=0;$$('#ex input').forEach((c,i)=>{if(c.checked)s+=I[i].v});const tot=s+live;$('#kc').textContent=Math.round(tot);$('#rg').style.strokeDashoffset=C*(1-Math.min(1,tot/D.goal));return tot}
      $('#ex').onchange=()=>{const was=ring();if(was>=D.goal){confetti();toast('🏆 Goal reached!')}};
      if(D.mode!=='meal'){
        $('#live').innerHTML='<div class="muted">Live session</div><div class="sess" id="sess">00:00</div><div class="muted">❤️ <b id="hr">72</b> BPM</div><button class="btn" id="ss" style="margin-top:8px">▶ Start session</button>';
        $('#ss').onclick=()=>{run=!run;$('#ss').textContent=run?'⏸ Pause':'▶ Resume'};
        setInterval(()=>{if(!run)return;t++;live+=.2;$('#sess').textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');$('#hr').textContent=110+Math.round(Math.random()*30);ring()},1000);
      } else {
        $('#live').innerHTML='<div class="muted">💧 Water intake. Tap a glass</div><div class="gl" id="gl" style="justify-content:center">'+Array(8).fill('<button>🥛</button>').join('')+'</div>';
        $('#gl').onclick=e=>{const b=e.target.closest('button');if(!b)return;b.classList.toggle('f');if($$('#gl .f').length===8){confetti();toast('💧 Hydration goal done!')}};
      }
      const days=['M','T','W','T','F','S','S'],td=(new Date().getDay()+6)%7;
      $('#wk').innerHTML=days.map((d,i)=>'<div class="'+(i===td?'today':'')+'"><i data-h="'+(25+Math.round(Math.random()*65))+'"></i>'+d+'</div>').join('');
      setTimeout(()=>$$('#wk i').forEach(el=>el.style.height=el.dataset.h+'%'),200);
      ring();
    `
  });

  /* =====================================================================
     10. ENTERTAINMENT - video player / music player w/ equalizer / ticket booking
     ===================================================================== */
  DEMOS['entertainment'] = v => ({
    icon: ['🎬', '🎟️', '🎵'][v],
    data: {
      mode: ['video', 'tickets', 'music'][v],
      items: [
        [{ t: 'Inception', e: '🌀', g: 'Sci-Fi', m: 148 }, { t: 'Stranger Things', e: '🔦', g: 'Thriller', m: 52 }, { t: 'The Office', e: '📎', g: 'Comedy', m: 22 },
         { t: 'Interstellar', e: '🚀', g: 'Sci-Fi', m: 169 }, { t: 'Planet Earth', e: '🌍', g: 'Documentary', m: 50 }, { t: 'Spider-Verse', e: '🕷️', g: 'Animation', m: 117 }],
        [{ t: 'Indie Music Night', e: '🎸', g: 'Sat 8 PM', p: 499 }, { t: 'Stand-up Comedy', e: '🎤', g: 'Sun 7 PM', p: 349 }, { t: 'Tech Meetup', e: '💻', g: 'Fri 6 PM', p: 199 }],
        [{ t: 'Midnight Drive', e: '🌙', g: 'Neon Waves' }, { t: 'Golden Hour', e: '🌅', g: 'Sunset Club' }, { t: 'Coffee Break', e: '☕', g: 'Lo-Fi Beats' },
         { t: 'Run Wild', e: '⚡', g: 'Pulse' }, { t: 'Ocean Eyes', e: '🌊', g: 'Blue Tide' }]
      ][v]
    },
    css: `
      .G0{background:linear-gradient(135deg,#ffd6e0,#e0c3fc)}.G1{background:linear-gradient(135deg,#c2f0ff,#e0c3fc)}.G2{background:linear-gradient(135deg,#d4fcdf,#c2e9fb)}.G3{background:linear-gradient(135deg,#ffe8b8,#ffc3d8)}
      .posters{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:10px}
      .poster{border-radius:12px;padding:10px 6px;text-align:center;cursor:pointer;transition:all .2s;border:2px solid transparent}
      .poster:hover{transform:translateY(-4px) scale(1.03)}
      .poster.on{border-color:var(--c2);box-shadow:0 8px 20px rgba(124,58,237,.25)}
      .poster span{font-size:30px;display:block}.poster b{display:block;font-size:12px;margin-top:4px}.poster small{font-size:10px;color:#6b6489}
      .screen{position:relative;height:170px;border-radius:14px;overflow:hidden;display:grid;place-content:center;text-align:center;color:#fff;background:linear-gradient(120deg,var(--c1),var(--c2),#22b8ff,var(--c1));background-size:300% 300%}
      .screen.playing{animation:gs 6s linear infinite}
      @keyframes gs{to{background-position:300% 0}}
      .sc-em{font-size:52px}.screen.playing .sc-em{animation:beat .9s infinite}
      @keyframes beat{40%{transform:scale(1.2)}}
      .eq{display:flex;gap:4px;align-items:flex-end;justify-content:center;height:46px;margin-top:6px}
      .eq i{width:7px;border-radius:3px;background:rgba(255,255,255,.9);height:6px;transition:height .12s}
      .disc{width:110px;height:110px;border-radius:50%;margin:0 auto;display:grid;place-items:center;font-size:42px;background:conic-gradient(#fff,var(--c1),#fff,var(--c2),#fff);box-shadow:0 8px 24px rgba(124,58,237,.3)}
      .disc.playing{animation:spin 4s linear infinite}
      .eq.dark i{background:linear-gradient(180deg,var(--c1),var(--c2))}
      .tr{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:12px;background:#fff;margin-bottom:7px;cursor:pointer;transition:all .2s}
      .tr.on{background:#f5eeff;border-left:4px solid var(--c2)}
      .seats{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin:10px 0;max-width:340px}
      .st{aspect-ratio:1;border-radius:7px 7px 3px 3px;background:#e9defc;padding:0;font-size:9px;color:#6b6489}
      .st.tk{background:#d9d4e6;cursor:not-allowed;opacity:.55}
      .st.sel{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;transform:scale(1.1)}
      .stage{max-width:340px;text-align:center;font-size:11px;font-weight:800;letter-spacing:4px;color:#fff;padding:5px;border-radius:0 0 40px 40px;background:linear-gradient(135deg,var(--c1),var(--c2))}
      .ticket{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px;border-radius:14px;margin-top:10px;color:#fff;background:linear-gradient(135deg,var(--c1),var(--c2))}
      .ticket small{display:block;opacity:.9}
      .barcode{width:80px;height:50px;background:repeating-linear-gradient(90deg,#fff 0 2px,transparent 2px 5px,#fff 5px 6px,transparent 6px 9px);border-radius:4px}
    `,
    body: `<div id="root"></div>`,
    js: `
      const root=$('#root'),S=D.items;
      if(D.mode==='video'){
        root.innerHTML='<div class="two"><div><div class="screen" id="scr"><div class="sc-em" id="sce">🎬</div><b id="sct">Pick something to watch</b></div><div class="row" style="margin-top:10px"><button class="btn" id="pp">▶ Play</button><div class="bar" style="flex:1"><i id="pg"></i></div><span class="muted" id="tm" style="min-width:70px;text-align:right">0 / 0</span></div></div><div class="posters" id="ps"></div></div>';
        let cur=-1,pos=0,playing=false;
        $('#ps').innerHTML=S.map((s,i)=>'<div class="poster G'+(i%4)+' fade" style="animation-delay:'+(i*70)+'ms" data-i="'+i+'"><span>'+s.e+'</span><b>'+s.t+'</b><small>'+s.g+' • '+s.m+'m</small></div>').join('');
        function setP(on){playing=on;$('#pp').textContent=on?'⏸ Pause':'▶ Play';$('#scr').classList.toggle('playing',on)}
        $('#ps').onclick=e=>{const p=e.target.closest('.poster');if(!p)return;cur=+p.dataset.i;pos=0;$$('.poster').forEach(x=>x.classList.remove('on'));p.classList.add('on');$('#sce').textContent=S[cur].e;$('#sct').textContent='Now playing: '+S[cur].t;setP(true)};
        $('#pp').onclick=()=>{if(cur<0){toast('Pick a title first 🎬');return}setP(!playing)};
        setInterval(()=>{if(!playing||cur<0)return;pos=Math.min(100,pos+.8);$('#pg').style.width=pos+'%';$('#tm').textContent=Math.round(pos/100*S[cur].m)+' / '+S[cur].m+' min';if(pos>=100){setP(false);toast('✅ Finished watching')}},500);
      } else if(D.mode==='music'){
        root.innerHTML='<div class="two"><div class="card" style="text-align:center"><div class="disc" id="dc">🎵</div><b id="tt" style="display:block;margin-top:12px">Pick a track</b><div class="muted" id="ar"></div><div class="eq dark" id="eq">'+Array(16).fill('<i></i>').join('')+'</div><div class="bar" style="margin:10px 0"><i id="pg"></i></div><div class="row" style="justify-content:center"><button class="chip" id="pv">⏮</button><button class="btn" id="pp">▶ Play</button><button class="chip" id="nx">⏭</button></div></div><div id="tl"></div></div>';
        let cur=0,pos=0,playing=false;
        $('#tl').innerHTML=S.map((s,i)=>'<div class="tr fade" style="animation-delay:'+(i*70)+'ms" data-i="'+i+'"><span style="font-size:22px">'+s.e+'</span><span><b style="font-size:13px">'+s.t+'</b><div class="muted">'+s.g+'</div></span></div>').join('');
        function load(i){cur=(i+S.length)%S.length;pos=0;$('#tt').textContent=S[cur].t;$('#ar').textContent=S[cur].g;$('#dc').textContent=S[cur].e;$$('.tr').forEach((x,k)=>x.classList.toggle('on',k===cur))}
        function setP(on){playing=on;$('#pp').textContent=on?'⏸ Pause':'▶ Play';$('#dc').classList.toggle('playing',on);if(!on)$$('#eq i').forEach(b=>b.style.height='6px')}
        $('#tl').onclick=e=>{const t=e.target.closest('.tr');if(!t)return;load(+t.dataset.i);setP(true)};
        $('#pp').onclick=()=>setP(!playing);$('#nx').onclick=()=>{load(cur+1)};$('#pv').onclick=()=>{load(cur-1)};
        setInterval(()=>{if(!playing)return;$$('#eq i').forEach(b=>b.style.height=(8+Math.random()*38)+'px')},130);
        setInterval(()=>{if(!playing)return;pos+=2;$('#pg').style.width=Math.min(100,pos)+'%';if(pos>=100)load(cur+1)},500);
        load(0);
      } else {
        root.innerHTML='<div class="two"><div class="card"><h3>🎫 Pick an event</h3><div id="ev"></div></div><div class="card"><h3>💺 Choose seats</h3><div class="stage">STAGE</div><div class="seats" id="seats"></div><div class="row sp"><b id="sum">No seats selected</b><button class="btn" id="bk">Book Tickets</button></div><div id="tk"></div></div></div>';
        let ev=0,sel=[],taken={};
        function mk(){const rows='ABCDE';let h='';for(let r=0;r<5;r++)for(let c=0;c<8;c++){const id=rows[r]+(c+1);const tk=((r*7+c*3+ev*5)%4===0)||taken[ev+id];h+='<button class="st'+(tk?' tk':'')+'" data-id="'+id+'" '+(tk?'disabled':'')+'>'+id+'</button>'}$('#seats').innerHTML=h;sel=[];sum()}
        function sum(){$('#sum').textContent=sel.length?sel.join(', ')+' • '+inr(sel.length*S[ev].p):'No seats selected'}
        $('#ev').innerHTML=S.map((s,i)=>'<div class="tr fade'+(i===0?' on':'')+'" data-i="'+i+'"><span style="font-size:26px">'+s.e+'</span><span style="flex:1"><b style="font-size:13px">'+s.t+'</b><div class="muted">'+s.g+'</div></span><b>'+inr(s.p)+'</b></div>').join('');
        $('#ev').onclick=e=>{const t=e.target.closest('.tr');if(!t)return;ev=+t.dataset.i;$$('#ev .tr').forEach(x=>x.classList.remove('on'));t.classList.add('on');$('#tk').innerHTML='';mk()};
        $('#seats').onclick=e=>{const b=e.target.closest('.st');if(!b||b.disabled)return;const id=b.dataset.id,k=sel.indexOf(id);if(k>=0)sel.splice(k,1);else sel.push(id);b.classList.toggle('sel',k<0);sum()};
        $('#bk').onclick=()=>{if(!sel.length){toast('Select at least one seat 💺');return}sel.forEach(id=>taken[ev+id]=1);$('#tk').innerHTML='<div class="ticket pop"><div><small>ADMIT '+sel.length+'</small><b style="font-size:17px">'+S[ev].e+' '+S[ev].t+'</b><small>'+S[ev].g+' • Seats '+sel.join(', ')+'</small></div><div class="barcode"></div></div>';confetti();toast('🎉 Tickets booked!');mk()};
        mk();
      }
    `
  });

  /* ---------------- build the full HTML document for a project ---------------- */
  function build(proj) {
    const cat = categoryOf(proj);
    const v = variantOf(proj);
    const [c1, c2] = PALETTES[(CATS.indexOf(cat) + v) % PALETTES.length];
    const d = DEMOS[cat](v);
    const dataJson = JSON.stringify(d.data).replace(/</g, '\\u003c');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<style>:root{--c1:' + c1 + ';--c2:' + c2 + '}' + BASE_CSS + (d.css || '') + '</style></head><body>'
      + '<header class="top"><div class="brand">' + d.icon + ' ' + esc(proj.name) + '</div><div class="live"><i></i>LIVE</div></header>'
      + '<main>' + d.body + '</main><div id="toast"></div>'
      + '<script>const D=' + dataJson + ';' + BASE_JS + d.js + '<\/script></body></html>';
  }

  window.buildDemoHTML = build;
  window.demoCategoryOf = categoryOf;
  window.demoPaletteOf = function (proj) {
    return PALETTES[(CATS.indexOf(categoryOf(proj)) + variantOf(proj)) % PALETTES.length];
  };
})();
