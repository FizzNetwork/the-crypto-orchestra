import Head from 'next/head'
import { useState, useEffect, useCallback, useRef } from 'react'

const API  = '/api/state'
const POLL = 10000

const C = {
  bg:'#080c10', panel:'#0d1117', border:'#1a2332', dim:'#1e2a3a',
  text:'#c8d8e8', muted:'#4a6080', accent:'#00d4ff',
  green:'#00ff88', red:'#ff3d5a', gold:'#f0b429', purple:'#9d6fff',
  orange:'#ff8c00', grid:'#111b26',
}

const fmt  = (n,d=0) => n==null?'—':Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})
const fmtP = (n) => n==null?'—':`${n>=0?'+':''}${Number(n).toFixed(2)}%`
const dirC = (d) => d==='long'?C.green:d==='short'?C.red:C.muted
const rC   = (r) => r<-0.3?C.green:r>0.3?C.red:C.gold
const sess = (s) => ({london_open:'🇬🇧 LONDON OPEN',london:'🇬🇧 LONDON',ny_open:'🗽 NY OPEN',ny:'🗽 NEW YORK',asian:'🌏 ASIAN',dead:'🌙 DEAD ZONE'}[s]||(s||'—').toUpperCase())

// ── WALLET PROFILES ──
const WALLETS = {
  W1_SPOT:       { label:'SPOT HOLD',    color:C.accent,  start:150, role:'Long-term buy & hold. No leverage.' },
  W2_DCA:        { label:'DCA LAYER',    color:C.purple,  start:150, role:'Staged entries. Cash when waiting.' },
  W3_CONFIG_C:   { label:'CONFIG C',     color:C.gold,    start:150, role:'Macro-aligned swings. 2x perp.' },
  W4_CONFIG_AB:  { label:'CONFIG A+B',   color:C.green,   start:150, role:'Sweep+OB & FVG fills. 2x perp.' },
  W5_CONFIG_D:   { label:'CONFIG D',     color:C.orange,  start:150, role:'Event brackets. Cash until FOMC.' },
  W6_AGGRESSIVE: { label:'AGGRESSIVE',   color:'#ff2d55', start:150, role:'3x lev, all signals, wide stops.' },
  W7_CAUTIOUS:   { label:'CAUTIOUS',     color:'#34aadc', start:150, role:'1x only, Config C signals, tight.' },
  W8_PHASE:      { label:'PHASE SIGNAL', color:'#b44fff', start:150, role:'Weekly SUSPENDED + Jupiter. SOL/USDT spot (pure: SOL/BTC). 7/7 wins.' },
  W9_SPY_NVDA:   { label:'SPY × NVDA',   color:'#00bcd4', start:150, role:'SPY anchor, NVDA oscillator. SUSPENDED = NVDA relative strength entry.' },
  W10_SPY_AMC:   { label:'SPY × AMC',    color:'#4db6ac', start:150, role:'SPY anchor, AMC oscillator. High-beta meme chord signal.' },
  W11_PERPS:     { label:'PERPS BOOK',   color:'#ff6b35', start:150, role:'BTC/SOL leveraged perp positions. Manual entry tracking.' },
}

// ── PHASE SIGNAL CONSTANTS ──
const SOL_SIGNALS = [
  { date:'2021-07-29', ret:15.4 },
  { date:'2022-09-01', ret:4.2  },
  { date:'2023-12-07', ret:15.1 },
  { date:'2024-10-17', ret:2.4  },
  { date:'2025-08-21', ret:3.8  },
  { date:'2025-11-20', ret:1.2  },
  { date:'2026-02-12', ret:7.7  },
]
const W8_BAL = SOL_SIGNALS.reduce((b,s)=>b*(1+s.ret/100), 150)  // ~240.52

const JUP_REF_DATE    = new Date('2026-02-12').getTime()
const JUP_PERIOD_MS   = 398.88 * 86400000
const JUP_REF_PHASE   = 37.4
const JUP_SIGNAL_ZONE = 340.9
const JUP_SIGNAL_HALF = 60

// ── TF CONFIG ──
const TF_CONFIG = {
  '1m':  { label:'1M',     mult:2.0,  pollMs:12000,   color:'#ff6b6b' },
  '15m': { label:'15M',    mult:1.5,  pollMs:60000,   color:'#ffa94d' },
  '1h':  { label:'1H',     mult:1.0,  pollMs:60000,   color:'#00d4ff' },
  '4h':  { label:'4H',     mult:0.75, pollMs:180000,  color:'#9d6fff' },
  '1d':  { label:'Daily',  mult:0.5,  pollMs:600000,  color:'#f0b429' },
  '1w':  { label:'Weekly', mult:0.25, pollMs:1800000, color:'#b44fff' },
}

// ── AUDIO ENGINE ──
const CHORD_ARPS = {
  // ── original 4 ──
  MAJOR:      [261.63, 329.63, 392.00],              // C·E·G — resolution
  DOMINANT:   [196.00, 246.94, 293.66, 349.23],      // G·B·D·F — tension, BTC leads
  SUSPENDED:  [261.63, 349.23, 392.00],              // C·F·G — the signal chord
  TRITONE:    [261.63, 311.13, 369.99],              // C·Eb·F# — maximum dissonance
  // ── 5 new divergence/flat chords ──
  LEADING:    [246.94, 293.66, 369.99, 493.88],      // B·D·F#·B — wants to resolve up
  LYDIAN:     [261.63, 293.66, 329.63, 369.99],      // C·D·E·F# — floating Lydian ascent
  PEDAL:      [130.81, 196.00, 261.63],              // C·G·C — power drone, pressure builds
  PHRYGIAN:   [164.81, 174.61, 196.00, 220.00],      // E·F·G·A — dark Phrygian descent
  NEAPOLITAN: [277.18, 349.23, 415.30],              // Db·F·Ab — bII, pre-cadential warning
  // ── system ──
  ENTRY:     [261.63, 329.63, 392.00, 523.25],
  EXIT_WIN:  [523.25, 392.00, 329.63, 261.63],
  EXIT_LOSS: [311.13, 261.63, 220.00],
}

function playTone(ctx, freq, startTime, duration, vol=0.18, type='sine') {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
}

function playArp(ctx, name, mult=1.0) {
  const freqs = CHORD_ARPS[name]
  if (!freqs || !ctx) return
  const now = ctx.currentTime
  freqs.forEach((f, i) => { playTone(ctx, f * mult, now + i * 0.13, 0.55) })
}

// ── CHORD STATE (9-state · any TF) ──
// ±0.2% treated as sideways — within this threshold, direction is → not ↑↓
const FLAT_THRESHOLD = 0.002
const dirOf = r => Math.abs(r) < FLAT_THRESHOLD ? 0 : r > 0 ? 1 : -1

function computeChord(btcCandles, solKlines) {
  if (!btcCandles?.length || !solKlines?.length) return null
  const sorted = [...btcCandles].sort((a,b)=>a.ts-b.ts)
  if (sorted.length < 2) return null
  const btcRet = (sorted[sorted.length-1].c - sorted[sorted.length-2].c) / sorted[sorted.length-2].c
  const sl = solKlines.length
  if (sl < 2) return null
  const solRet = (parseFloat(solKlines[sl-1][4]) - parseFloat(solKlines[sl-2][4])) / parseFloat(solKlines[sl-2][4])

  const bDir = dirOf(btcRet)
  const sDir = dirOf(solRet)
  let chord
  if      (bDir===1  && sDir===1)  chord='MAJOR'
  else if (bDir===1  && sDir===0)  chord='LEADING'
  else if (bDir===1  && sDir===-1) chord='DOMINANT'
  else if (bDir===0  && sDir===1)  chord='LYDIAN'
  else if (bDir===0  && sDir===0)  chord='PEDAL'
  else if (bDir===0  && sDir===-1) chord='NEAPOLITAN'
  else if (bDir===-1 && sDir===1)  chord='SUSPENDED'
  else if (bDir===-1 && sDir===0)  chord='PHRYGIAN'
  else                             chord='TRITONE'

  const now = Date.now()
  const phase = ((JUP_REF_PHASE+((now-JUP_REF_DATE)/JUP_PERIOD_MS)*360)%360+360)%360
  const diff = Math.abs(((phase-JUP_SIGNAL_ZONE)+180+360)%360-180)
  const inSignalZone = diff<=JUP_SIGNAL_HALF
  const gateOpen = chord==='SUSPENDED' && inSignalZone
  const solPrice = parseFloat(solKlines[sl-1]?.[4]||0)
  return { chord, btcRet, solRet, bDir, sDir, phase:phase.toFixed(1), inSignalZone, gateOpen, solPrice }
}

// ── WALLET PROFILES DERIVED ──
function deriveProfileWallets(data) {
  const base = data?.wallets || {}
  const totalTrades = Object.values(base).reduce((s,w)=>s+(w?.total_trades||0),0)
  const wins = Object.values(base).reduce((s,w)=>s+(w?.wins||0),0)
  const losses = Object.values(base).reduce((s,w)=>s+(w?.losses||0),0)
  const aggPnl = Object.values(base).reduce((s,w)=>s+((w?.balance||150)-150)*3.0,0)
  const cauPnl = Object.values(base).reduce((s,w)=>s+((w?.balance||150)-150)*0.5,0)
  return {
    W6_AGGRESSIVE: { balance:150+aggPnl, total_trades:totalTrades, wins, losses, win_rate:totalTrades?Math.round(wins/totalTrades*100):0 },
    W7_CAUTIOUS:   { balance:150+cauPnl, total_trades:totalTrades, wins, losses, win_rate:totalTrades?Math.round(wins/totalTrades*100):0 },
    W1_SPOT:       { balance:data?.price?150*(data.price/(data?.candles?.[0]?.c||data.price)):150, total_trades:1, wins:1, losses:0, win_rate:100 },
    W2_DCA:        { balance:150, total_trades:0, wins:0, losses:0, win_rate:0 },
    W8_PHASE:      { balance:W8_BAL, total_trades:7, wins:7, losses:0, win_rate:100 },
  }
}

// ── CHORD MARKER HELPER ──
function applyChordMarkers(series, markers, show) {
  if (!series) return
  try {
    if (!show || !markers?.length) { series.setMarkers([]); return }
    const formatted = markers
      .map(m => ({ time: Math.floor(m.ts/1000), position:'aboveBar', color:m.color, shape:'circle', text:m.chord.slice(0,3) }))
      .sort((a,b)=>a.time-b.time)
    series.setMarkers(formatted)
  } catch(e){}
}

// ── TRADINGVIEW LIGHTWEIGHT CHART ──
function TVChart({ candles, trades, chordMarkers, showChordOverlay }) {
  const ref=useRef(null), chartRef=useRef(null), seriesRef=useRef(null)
  const [ready,setReady]=useState(false)
  const chordMarkersRef = useRef(chordMarkers)
  const showOverlayRef  = useRef(showChordOverlay)
  useEffect(()=>{ chordMarkersRef.current = chordMarkers },[chordMarkers])
  useEffect(()=>{ showOverlayRef.current  = showChordOverlay },[showChordOverlay])
  useEffect(()=>{
    if(window.LightweightCharts){setReady(true);return}
    const s=document.createElement('script')
    s.src='https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js'
    s.onload=()=>setReady(true)
    document.head.appendChild(s)
  },[])
  useEffect(()=>{
    if(!ready||!ref.current||!candles?.length)return
    const LWC=window.LightweightCharts
    if(!LWC)return
    if(chartRef.current){chartRef.current.remove();chartRef.current=null;seriesRef.current=null}
    const chart=LWC.createChart(ref.current,{
      width:ref.current.clientWidth,height:320,
      layout:{background:{type:'solid',color:'#080c10'},textColor:'#4a6080'},
      grid:{vertLines:{color:'#111b26'},horzLines:{color:'#111b26'}},
      crosshair:{mode:1},
      rightPriceScale:{borderColor:'#1a2332'},
      timeScale:{borderColor:'#1a2332',timeVisible:true,secondsVisible:false},
    })
    chartRef.current=chart
    const series=chart.addCandlestickSeries({
      upColor:'#00ff88',downColor:'#ff3d5a',
      borderUpColor:'#00ff88',borderDownColor:'#ff3d5a',
      wickUpColor:'#00ff88',wickDownColor:'#ff3d5a',
    })
    seriesRef.current=series
    const formatted=[...candles]
      .map(c=>({time:Math.floor(c.ts/1000),open:c.o,high:c.h,low:c.l,close:c.c}))
      .sort((a,b)=>a.time-b.time)
      .filter((c,i,arr)=>i===0||c.time!==arr[i-1].time)
    series.setData(formatted)
    chart.timeScale().fitContent()
    applyChordMarkers(series, chordMarkersRef.current, showOverlayRef.current)
    if(trades?.length){trades.forEach(t=>{try{
      series.createPriceLine({price:t.entry,color:dirC(t.direction),lineWidth:1,lineStyle:2,title:`${t.config} ${t.direction?.toUpperCase()}`})
      series.createPriceLine({price:t.stop,color:'#ff3d5a88',lineWidth:1,lineStyle:3,title:'SL'})
      if(t.tp1)series.createPriceLine({price:t.tp1,color:'#00ff8888',lineWidth:1,lineStyle:3,title:'TP1'})
    }catch(e){}})}
    const ro=new ResizeObserver(()=>{if(ref.current&&chartRef.current)chartRef.current.applyOptions({width:ref.current.clientWidth})})
    ro.observe(ref.current)
    return()=>{ro.disconnect();if(chartRef.current){chartRef.current.remove();chartRef.current=null}}
  },[ready,candles?.length])
  useEffect(()=>{
    if(!seriesRef.current||!candles?.length)return
    try{const last=candles[candles.length-1];seriesRef.current.update({time:Math.floor(last.ts/1000),open:last.o,high:last.h,low:last.l,close:last.c})}catch(e){}
  },[candles])
  // Update markers independently (no chart rebuild needed)
  useEffect(()=>{
    applyChordMarkers(seriesRef.current, chordMarkers, showChordOverlay)
  },[chordMarkers, showChordOverlay])

  if(!ready||!candles?.length)return(
    <div style={{height:320,display:'flex',alignItems:'center',justifyContent:'center',color:'#4a6080',fontFamily:'Space Mono,monospace',fontSize:12}}>
      {!ready?'LOADING CHART...':`AWAITING CANDLES (${candles?.length||0})`}
    </div>
  )
  return <div ref={ref} style={{width:'100%',height:320}}/>
}

// ── GAUGE ──
function Gauge({ r }) {
  const v=r||0, pct=((Math.max(-1,Math.min(1,v))+1)/2*100).toFixed(2), col=rC(v)
  return (
    <div style={{padding:'10px 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:11,fontFamily:'Space Mono,monospace'}}>
        <span style={{color:C.red}}>SELL ZONE +0.3</span>
        <span style={{color:col,fontWeight:700,fontSize:14}}>{v>=0?'+':''}{v.toFixed(4)}</span>
        <span style={{color:C.green}}>BUY ZONE -0.3</span>
      </div>
      <div style={{position:'relative',height:20,background:`linear-gradient(90deg,${C.green},${C.gold} 50%,${C.red})`,borderRadius:4}}>
        <div style={{position:'absolute',left:`${pct}%`,top:-2,bottom:-2,width:3,background:'#fff',transform:'translateX(-50%)',boxShadow:`0 0 10px ${col}`,borderRadius:2}}/>
      </div>
      <div style={{textAlign:'center',marginTop:8,fontSize:14,color:col,fontWeight:700,letterSpacing:1}}>
        {v<-0.5?'⚡ EXTREME BUY ZONE':v<-0.3?'▼ BUY ZONE':v>0.5?'⚡ EXTREME SELL ZONE':v>0.3?'▲ SELL ZONE':'◆ NEUTRAL'}
      </div>
    </div>
  )
}

// ── WALLET CARD ──
function WalletCard({ id, live, extra }) {
  const cfg=WALLETS[id], d={...live,...extra}
  const bal=d?.balance??cfg.start, pnl=bal-cfg.start
  const col=pnl>0?C.green:pnl<0?C.red:C.muted
  return (
    <div style={{background:C.panel,border:`1px solid ${C.border}`,borderLeft:`3px solid ${cfg.color}`,borderRadius:6,padding:'14px 16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div style={{fontSize:10,color:cfg.color,fontFamily:'Space Mono,monospace',letterSpacing:1}}>{cfg.label}</div>
        <div style={{fontSize:9,color:C.muted,fontFamily:'Space Mono,monospace',textAlign:'right',maxWidth:120,lineHeight:1.4}}>{cfg.role}</div>
      </div>
      <div style={{fontSize:24,fontWeight:700,color:col,fontFamily:'Space Mono,monospace'}}>${fmt(bal,2)}</div>
      <div style={{fontSize:12,color:col,marginTop:2}}>{pnl>=0?'+':''}{fmt(pnl,2)} ({((pnl/cfg.start)*100).toFixed(1)}%)</div>
      <div style={{display:'flex',gap:14,marginTop:10,fontSize:11,color:C.muted,flexWrap:'wrap'}}>
        <span>Trades <b style={{color:C.text}}>{d?.total_trades||0}</b></span>
        <span>W <b style={{color:C.green}}>{d?.wins||0}</b></span>
        <span>L <b style={{color:C.red}}>{d?.losses||0}</b></span>
        <span>WR <b style={{color:C.gold}}>{d?.win_rate||0}%</b></span>
      </div>
    </div>
  )
}

// ── TAB BAR ──
function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tab-bar" style={{display:'flex',gap:2,background:C.panel,borderBottom:`1px solid ${C.border}`,padding:'0 24px'}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} className="tab-btn" style={{
          padding:'10px 18px',fontSize:11,fontFamily:'Space Mono,monospace',letterSpacing:1,
          background:'none',border:'none',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,
          color:active===t.id?C.accent:C.muted,
          borderBottom:active===t.id?`2px solid ${C.accent}`:'2px solid transparent',
          transition:'all 0.15s',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

const Panel=({children,style={}})=>(
  <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8,padding:'16px 20px',...style}}>{children}</div>
)
const Label=({txt})=>(
  <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',letterSpacing:2,marginBottom:10}}>{txt}</div>
)

// ── TABS ──
function TabOverview({ data, resid, chg, totalBal, totalPnl, extra, chartTF, setChartTF, btcKlines, showChordOverlay, setShowChordOverlay, chordHistoryByTF }) {
  const chartCandles = (chartTF === '1h' ? data?.candles : btcKlines) || data?.candles
  const chartMarkers = chordHistoryByTF?.[chartTF] || []
  return (
    <div className="ov-grid" style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:14}}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',letterSpacing:2}}>
              BTC/USD · {(chartTF||'1H').toUpperCase()} · KRAKEN
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              {['15m','1h','4h','1d'].map(tf=>(<button key={tf} onClick={()=>setChartTF(tf)} style={{
                padding:'4px 10px',borderRadius:3,cursor:'pointer',fontSize:10,
                fontFamily:'Space Mono,monospace',letterSpacing:1,
                border:`1px solid ${chartTF===tf?C.accent:C.border}`,
                background:chartTF===tf?`${C.accent}18`:C.dim,
                color:chartTF===tf?C.accent:C.muted,
              }}>{tf.toUpperCase()}</button>))}
              <button onClick={()=>setShowChordOverlay(v=>!v)} style={{
                padding:'4px 10px',borderRadius:3,cursor:'pointer',fontSize:10,
                fontFamily:'Space Mono,monospace',letterSpacing:1,
                border:`1px solid ${showChordOverlay?'#b44fff':C.border}`,
                background:showChordOverlay?'#b44fff22':C.dim,
                color:showChordOverlay?'#b44fff':C.muted,
              }}>◈ CHORD</button>
            </div>
          </div>
          <TVChart candles={chartCandles} trades={data?.open_trades} chordMarkers={chartMarkers} showChordOverlay={showChordOverlay}/>
        </Panel>
        <Panel>
          <Label txt="POWER LAW RESIDUAL"/>
          <Gauge r={resid}/>
          <div style={{display:'flex',gap:24,marginTop:10,fontSize:11,fontFamily:'Space Mono,monospace'}}>
            <span style={{color:C.muted}}>TREND <span style={{color:C.text}}>${fmt(data?.trend_price)}</span></span>
            <span style={{color:C.muted}}>ATR(14) <span style={{color:C.text}}>${fmt(data?.atr)}</span></span>
            <span style={{color:C.muted}}>CALIBRATED <span style={{color:data?.calibrated?C.green:C.red}}>{data?.calibrated?'YES':'NO'}</span></span>
          </div>
        </Panel>
        <Panel>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',letterSpacing:2}}>TOTAL PORTFOLIO (11 wallets)</div>
            <div style={{display:'flex',gap:36,alignItems:'center'}}>
              {[['START','$1,650.00',C.text],['CURRENT',`$${fmt(totalBal,2)}`,C.accent],['P&L',`${totalPnl>=0?'+':''}$${fmt(totalPnl,2)}`,totalPnl>=0?C.green:C.red]].map(([l,v,c])=>(
                <div key={l} style={{textAlign:'center'}}>
                  <div style={{fontSize:10,color:C.muted}}>{l}</div>
                  <div style={{fontSize:20,fontFamily:'Space Mono,monospace',fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <Label txt="MACRO STATUS"/>
          {[['L0 LIQUIDITY','M2↑ + DXY↑ = SUPPRESSED',C.gold],['L1 RESIDUAL',resid<-0.3?'BUY ZONE ✓':resid>0.3?'SELL ZONE ✓':'NEUTRAL',rC(resid)],['FOMC','JUN 17 · 14:00 ET',C.purple],['NEW STOP','$59,500',C.red],['BULL TRIGGER','$100,000',C.green],['CME GAPS','$78.5K · $80K ↑',C.accent]]
            .map(([k,v,c])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}>
                <span style={{color:C.muted}}>{k}</span><span style={{color:c,fontWeight:600}}>{v}</span>
              </div>
            ))}
        </Panel>
        <Panel>
          <Label txt={`OPEN TRADES (${data?.open_trades?.length||0})`}/>
          {data?.open_trades?.length?data.open_trades.map(t=>(
            <div key={t.id} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace',alignItems:'center'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:C.green,display:'inline-block',animation:'pulse 1.5s infinite'}}/>
              <span style={{color:C.purple}}>{t.config}</span>
              <span style={{color:dirC(t.direction)}}>{t.direction?.toUpperCase()}</span>
              <span style={{color:C.gold}}>${fmt(t.entry)}</span>
              <span style={{color:C.red,fontSize:10,marginLeft:'auto'}}>SL {fmt(t.stop)}</span>
            </div>
          )):<div style={{color:C.muted,fontSize:11,fontFamily:'Space Mono,monospace'}}>NO OPEN POSITIONS</div>}
        </Panel>
        <Panel>
          <Label txt="SIGNAL FEED"/>
          {data?.signals?.length?data.signals.slice(0,8).map((s,i)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}>
              <span style={{color:C.purple,minWidth:18}}>{s.config}</span>
              <span style={{color:dirC(s.direction),minWidth:40}}>{s.direction?.toUpperCase()}</span>
              <span style={{color:C.gold}}>${fmt(s.price)}</span>
              <span style={{color:rC(s.residual),fontSize:10,marginLeft:'auto'}}>{s.residual>=0?'+':''}{s.residual?.toFixed(3)}</span>
              <span style={{color:C.muted,fontSize:10,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.notes}</span>
            </div>
          )):<div style={{color:C.muted,fontSize:11,fontFamily:'Space Mono,monospace'}}>SCANNING...</div>}
        </Panel>
        <Panel>
          <Label txt="ENGINE STATUS"/>
          <div style={{display:'flex',gap:14,fontSize:11,fontFamily:'Space Mono,monospace',alignItems:'center'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:data?C.green:C.red,display:'inline-block',animation:'pulse 2s infinite'}}/>
            <span style={{color:C.text}}>{data?'LIVE':'OFFLINE'}</span>
            <span style={{color:C.muted}}>KRAKEN 1H</span>
          </div>
          <div style={{marginTop:6,fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace'}}>POLL: {POLL/1000}s · PROXY: /api/state</div>
        </Panel>
      </div>
    </div>
  )
}

function TabWallets({ data, extra }) {
  const allWallets={...data?.wallets,...extra}
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{fontSize:12,color:C.muted,fontFamily:'Space Mono,monospace',padding:'4px 0'}}>
        11-wallet system. W1-2 passive. W3-5 configs. W6-7 profiles. W8 phase. W9-10 SPY×NVDA/AMC chord. W11 perps.
      </div>
      <div className="wlt-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {Object.keys(WALLETS).map(id=>(<WalletCard key={id} id={id} live={allWallets[id]} extra={{}}/>))}
      </div>
    </div>
  )
}

function TabAggressive({ data, extra }) {
  const d=extra?.W6_AGGRESSIVE, trades=data?.recent_trades||[]
  return (
    <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <Label txt="AGGRESSIVE PROFILE — 3x LEVERAGE · ALL SIGNALS · WIDE STOPS"/>
          <WalletCard id="W6_AGGRESSIVE" live={d} extra={{}}/>
          <div style={{marginTop:14,fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted,lineHeight:1.8}}>
            <div>Strategy: Takes every Config A, B, C, D signal</div>
            <div>Leverage: 3x on all perp positions</div>
            <div>Stop: 2x ATR (wider, more room to breathe)</div>
            <div>TP: Runs to TP2 first (no partial closes)</div>
            <div>Max concurrent: 4 trades</div>
            <div style={{color:C.red,marginTop:8}}>⚠ Higher drawdown risk. Suitable for small position sizing only.</div>
          </div>
        </Panel>
        <Panel>
          <Label txt="AGGRESSIVE — RECENT TRADES"/>
          {trades.length?trades.slice(0,8).map(t=>{
            const aggPnl=(t.pnl||0)*3
            return(<div key={t.id} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}>
              <span style={{color:C.purple}}>{t.config}</span>
              <span style={{color:dirC(t.direction)}}>{t.direction?.toUpperCase()}</span>
              <span style={{color:C.muted,fontSize:10}}>${fmt(t.entry)}→${fmt(t.exit)}</span>
              <span style={{color:aggPnl>=0?C.green:C.red,fontWeight:700,marginLeft:'auto'}}>{aggPnl>=0?'+':''}{fmt(aggPnl,2)} <span style={{color:C.muted,fontSize:9}}>(3x)</span></span>
            </div>)
          }):<div style={{color:C.muted,fontSize:11,fontFamily:'Space Mono,monospace'}}>NO TRADES YET</div>}
        </Panel>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <Label txt="RISK METRICS — AGGRESSIVE"/>
          {[['Max drawdown risk','Up to -60% on bad streak',C.red],['Expected monthly','15-35% in favourable conditions',C.green],['Liquidation risk','Moderate at 3x leverage',C.gold],['Best for','Traders with high risk tolerance',C.muted],['Position size','Keep under 10% of total capital',C.accent]]
            .map(([k,v,c])=>(<div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}><span style={{color:C.muted}}>{k}</span><span style={{color:c}}>{v}</span></div>))}
        </Panel>
        <Panel>
          <Label txt="CURRENT SIGNALS (AGGRESSIVE WOULD TAKE ALL)"/>
          {data?.signals?.length?data.signals.slice(0,10).map((s,i)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace',alignItems:'center'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#ff2d55',display:'inline-block'}}/>
              <span style={{color:C.purple}}>{s.config}</span><span style={{color:dirC(s.direction)}}>{s.direction?.toUpperCase()}</span>
              <span style={{color:C.gold}}>${fmt(s.price)}</span>
              <span style={{color:C.muted,fontSize:10,marginLeft:'auto'}}>{s.notes?.slice(0,40)}</span>
            </div>
          )):<div style={{color:C.muted,fontSize:11,fontFamily:'Space Mono,monospace'}}>SCANNING...</div>}
        </Panel>
      </div>
    </div>
  )
}

function TabCautious({ data, extra }) {
  const d=extra?.W7_CAUTIOUS, trades=data?.recent_trades||[]
  return (
    <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <Label txt="CAUTIOUS PROFILE — 1x ONLY · CONFIG C SIGNALS · TIGHT STOPS"/>
          <WalletCard id="W7_CAUTIOUS" live={d} extra={{}}/>
          <div style={{marginTop:14,fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted,lineHeight:1.8}}>
            <div>Strategy: Config C only (highest conviction)</div>
            <div>Leverage: 1x spot or spot-equivalent perp</div>
            <div>Stop: 0.8x ATR (tighter, faster exit)</div>
            <div>TP: TP1 partial close (50%), runner to TP2</div>
            <div>Max concurrent: 1 trade at a time</div>
            <div style={{color:C.green,marginTop:8}}>✓ Lower drawdown. Suitable for larger position sizing.</div>
          </div>
        </Panel>
        <Panel>
          <Label txt="CAUTIOUS — RECENT TRADES"/>
          {trades.length?trades.filter(t=>t.config==='C').slice(0,8).map(t=>{
            const cauPnl=(t.pnl||0)*0.5
            return(<div key={t.id} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}>
              <span style={{color:C.purple}}>{t.config}</span>
              <span style={{color:dirC(t.direction)}}>{t.direction?.toUpperCase()}</span>
              <span style={{color:C.muted,fontSize:10}}>${fmt(t.entry)}→${fmt(t.exit)}</span>
              <span style={{color:cauPnl>=0?C.green:C.red,fontWeight:700,marginLeft:'auto'}}>{cauPnl>=0?'+':''}{fmt(cauPnl,2)} <span style={{color:C.muted,fontSize:9}}>(1x)</span></span>
            </div>)
          }):<div style={{color:C.muted,fontSize:11,fontFamily:'Space Mono,monospace'}}>Config C trades only</div>}
        </Panel>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <Label txt="RISK METRICS — CAUTIOUS"/>
          {[['Max drawdown risk','Up to -15% on bad streak',C.green],['Expected monthly','5-12% in favourable conditions',C.green],['Liquidation risk','None at 1x leverage',C.green],['Best for','Capital preservation focus',C.accent],['Position size','Can run up to 40% of total capital',C.accent]]
            .map(([k,v,c])=>(<div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}><span style={{color:C.muted}}>{k}</span><span style={{color:c}}>{v}</span></div>))}
        </Panel>
        <Panel>
          <Label txt="CURRENT SIGNALS (CAUTIOUS TAKES ONLY CONFIG C)"/>
          {data?.signals?.filter(s=>s.config==='C').length?data.signals.filter(s=>s.config==='C').slice(0,10).map((s,i)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace',alignItems:'center'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#34aadc',display:'inline-block'}}/>
              <span style={{color:C.purple}}>{s.config}</span><span style={{color:dirC(s.direction)}}>{s.direction?.toUpperCase()}</span>
              <span style={{color:C.gold}}>${fmt(s.price)}</span>
              <span style={{color:C.muted,fontSize:10,marginLeft:'auto'}}>{s.notes?.slice(0,40)}</span>
            </div>
          )):<div style={{color:C.muted,fontSize:11,fontFamily:'Space Mono,monospace'}}>No Config C signals yet</div>}
        </Panel>
      </div>
    </div>
  )
}

function TabSignals({ data }) {
  return (
    <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <Panel>
        <Label txt="ALL SIGNALS — LIVE FEED"/>
        <div style={{fontSize:11,color:C.muted,fontFamily:'Space Mono,monospace',marginBottom:10}}>Every signal fired by the engine, all configs</div>
        {data?.signals?.length?data.signals.map((s,i)=>(
          <div key={i} style={{padding:'9px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:4}}>
              <span style={{background:dirC(s.direction),color:C.bg,padding:'1px 6px',borderRadius:2,fontSize:10,fontWeight:700}}>{s.direction?.toUpperCase()}</span>
              <span style={{color:C.purple,fontWeight:700}}>Config {s.config}</span>
              <span style={{color:C.gold}}>${fmt(s.price)}</span>
              <span style={{color:rC(s.residual),marginLeft:'auto'}}>resid {s.residual>=0?'+':''}{s.residual?.toFixed(4)}</span>
            </div>
            <div style={{color:C.muted,fontSize:10}}>{s.notes}</div>
          </div>
        )):<div style={{color:C.muted}}>SCANNING FOR SETUPS...</div>}
      </Panel>
      <Panel>
        <Label txt="CLOSED TRADES LOG"/>
        {data?.recent_trades?.length?data.recent_trades.map(t=>(
          <div key={t.id} style={{padding:'9px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:3}}>
              <span style={{color:C.purple}}>Config {t.config}</span>
              <span style={{color:dirC(t.direction)}}>{t.direction?.toUpperCase()}</span>
              <span style={{color:t.pnl>=0?C.green:C.red,fontWeight:700,marginLeft:'auto'}}>{t.pnl>=0?'+':''}{fmt(t.pnl,2)}</span>
              <span style={{color:C.muted,fontSize:10,padding:'1px 6px',border:`1px solid ${C.border}`,borderRadius:2}}>{t.reason||'—'}</span>
            </div>
            <div style={{color:C.muted,fontSize:10}}>{t.wallet} · ${fmt(t.entry)} → ${fmt(t.exit)}</div>
          </div>
        )):<div style={{color:C.muted}}>NO CLOSED TRADES YET</div>}
      </Panel>
    </div>
  )
}

function TabMacro({ data, resid }) {
  return (
    <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <Label txt="6-LAYER FRAMEWORK STATUS"/>
          {[
            {layer:'L0',name:'GLOBAL LIQUIDITY',status:'SUPPRESSED',note:'M2 at ATH but DXY rising. Wait for DXY < 97-98.',col:C.gold},
            {layer:'L1',name:'POWER LAW RESIDUAL',status:resid<-0.3?'ACTIVE':'INACTIVE',note:`Current residual: ${resid>=0?'+':''}${resid?.toFixed(4)}`,col:resid<-0.3?C.green:C.muted},
            {layer:'L2',name:'DAILY STRUCTURE',status:'LIVE CHART',note:'Check chart — price above/below daily open candle',col:C.muted},
            {layer:'L3',name:'4HR ORDER BLOCK',status:'LIVE CHART',note:'Check 4hr for nearest unmitigated OB',col:C.muted},
            {layer:'L4',name:'1HR ENTRY',status:'SCANNING',note:'Engine scanning every candle close',col:C.accent},
            {layer:'L5',name:'15MIN EXECUTION',status:'EXECUTION',note:'Manual — enter on 15min market structure shift',col:C.muted},
          ].map(item=>(
            <div key={item.layer} style={{padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:10,color:item.col,fontFamily:'Space Mono,monospace',fontWeight:700,minWidth:20}}>{item.layer}</span>
                <span style={{fontSize:11,fontFamily:'Space Mono,monospace',color:C.text}}>{item.name}</span>
                <span style={{marginLeft:'auto',fontSize:10,fontFamily:'Space Mono,monospace',color:item.col,fontWeight:700,padding:'2px 8px',border:`1px solid ${item.col}40`,borderRadius:2}}>{item.status}</span>
              </div>
              <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',paddingLeft:30}}>{item.note}</div>
            </div>
          ))}
        </Panel>
        <Panel>
          <Label txt="FOMC JUN 17 — SCENARIO MATRIX"/>
          {[
            {scenario:'A) HOLD + NEUTRAL',prob:'55%',btc:'$63-70k',action:'Relief bounce. Bear intact but paused.',col:C.gold},
            {scenario:'B) HAWKISH HOLD',prob:'35%',btc:'$54-57k',action:'Test miner floor. Reduce exposure.',col:C.red},
            {scenario:'C) DOVISH SURPRISE',prob:'10%',btc:'$73-79k',action:'L0 flips active. Size up Config C.',col:C.green},
          ].map(item=>(
            <div key={item.scenario} style={{padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,fontFamily:'Space Mono,monospace',color:item.col,fontWeight:700}}>{item.scenario}</span>
                <span style={{fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted}}>P={item.prob}</span>
              </div>
              <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',marginBottom:4}}>BTC {item.btc}</div>
              <div style={{fontSize:10,color:C.muted}}>{item.action}</div>
            </div>
          ))}
        </Panel>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Panel>
          <Label txt="KEY STRUCTURAL LEVELS"/>
          {[['$126,198','C5 ATH — Oct 6 2025',C.gold],['$100,000','Bull confirmation trigger',C.green],['$80,000','Prior consolidation + CME gap',C.accent],['$78,500','CME gap unfilled',C.accent],['$63,446','CURRENT PRICE',C.text],['$59,500','New geometric stop (weekend low)',C.red],['$55,000','Efficient miner floor',C.red],['$44,169','-65% from ATH (C3 equivalent)',C.muted],['$37,859','-70% from ATH',C.muted]]
            .map(([price,label,col])=>(<div key={price} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace'}}><span style={{color:col,fontWeight:700}}>{price}</span><span style={{color:C.muted}}>{label}</span></div>))}
        </Panel>
        <Panel>
          <Label txt="MODIFIERS — DAILY CHECKS"/>
          {[['Funding rate','Check Bybit/Binance. < -0.05%/8hr = contrarian long',C.green],['Options skew','Deribit 25d. < -15% = extreme fear = buy signal',C.green],['ETH/BTC ratio','Outperforming = risk-on = add to Config C',C.accent],['SOL/BTC ratio','Outperforming = risk-on = add to Config C',C.accent],['DXY trend','Needs to break below 97-98 to flip L0 active',C.gold],['M2 YoY','Currently > 0% and rising. Tailwind exists.',C.green]]
            .map(([k,v,c])=>(<div key={k} style={{padding:'7px 0',borderBottom:`1px solid ${C.border}`}}><div style={{fontSize:11,fontFamily:'Space Mono,monospace',color:c,marginBottom:2}}>{k}</div><div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace'}}>{v}</div></div>))}
        </Panel>
      </div>
    </div>
  )
}

// ── TAB STOCKS ──
function StockChordPanel({ anchor, osc, cs, walletId }) {
  const col = cs ? (CHORD_COLORS[cs.chord]||'#4a6080') : '#4a6080'
  const cfg = WALLETS[walletId]
  return (
    <Panel>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
        <div>
          <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',letterSpacing:2,marginBottom:4}}>
            {anchor} ← anchor &nbsp;|&nbsp; {osc} ← oscillator
          </div>
          <div style={{fontSize:36,fontWeight:700,fontFamily:'Space Mono,monospace',color:col,letterSpacing:2,textShadow:`0 0 20px ${col}44`}}>
            {cs?.chord||'—'}
          </div>
          {cs?.chord && (
            <div style={{fontSize:10,color:col,fontFamily:'Space Mono,monospace',marginTop:4}}>
              {CHORD_SUB[cs.chord]}
            </div>
          )}
        </div>
        <div style={{textAlign:'right',fontSize:11,fontFamily:'Space Mono,monospace'}}>
          <div style={{color:C.muted,fontSize:9,marginBottom:4}}>{anchor}</div>
          <div style={{color:C.text,fontWeight:700}}>${cs?.spyPrice?cs.spyPrice.toFixed(2):'—'}</div>
          <div style={{color:C.muted,fontSize:9,marginTop:8,marginBottom:4}}>{osc}</div>
          <div style={{color:cfg.color,fontWeight:700}}>${cs?.oscPrice?cs.oscPrice.toFixed(2):'—'}</div>
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
        {Object.entries(CHORD_COLORS).map(([chord,c])=>(
          <div key={chord} style={{padding:'3px 8px',borderRadius:3,border:`1px solid ${c}${cs?.chord===chord?'ff':'22'}`,background:cs?.chord===chord?`${c}22`:'transparent',fontSize:9,fontFamily:'Space Mono,monospace',color:cs?.chord===chord?c:C.muted}}>
            {chord}
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <div style={{padding:'6px 14px',borderRadius:4,border:`1px solid ${cs?.gateOpen?C.green:C.border}`,color:cs?.gateOpen?C.green:C.muted,background:cs?.gateOpen?`${C.green}18`:'transparent',fontSize:11,fontFamily:'Space Mono,monospace',fontWeight:cs?.gateOpen?700:400}}>
          {cs?.gateOpen?`⚡ ${osc} SIGNAL`:'GATE CLOSED'}
        </div>
        <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',alignSelf:'center'}}>
          {anchor}↓ {osc}↑ = SUSPENDED = entry signal
        </div>
      </div>
      <WalletCard id={walletId} live={{balance:WALLETS[walletId].start,total_trades:0,wins:0,losses:0,win_rate:0}} extra={{}}/>
    </Panel>
  )
}

function TabStocks({ nvdaChord, amcChord, stockKlines }) {
  const spyCandles = stockKlines?.SPY || []
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Panel style={{padding:'12px 16px'}}>
        <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',letterSpacing:2,marginBottom:6}}>EQUITIES CHORD SYSTEM — SPY AS ANCHOR</div>
        <div style={{fontSize:11,color:C.muted,fontFamily:'Space Mono,monospace',lineHeight:1.7}}>
          SPY = broad market anchor (like BTC). NVDA + AMC = high-beta oscillators (like SOL).
          SUSPENDED = oscillator showing relative strength vs falling SPY. Same chord framework, no Jupiter filter.
        </div>
      </Panel>
      <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <StockChordPanel anchor="SPY" osc="NVDA" cs={nvdaChord} walletId="W9_SPY_NVDA"/>
        <StockChordPanel anchor="SPY" osc="AMC"  cs={amcChord}  walletId="W10_SPY_AMC"/>
      </div>
      <Panel>
        <Label txt="SPY RECENT CANDLES (DAILY)"/>
        {spyCandles.length>=2 ? (
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {spyCandles.slice(-5).map((c,i)=>{
              const pct = i===0 ? 0 : ((c.c-spyCandles[spyCandles.indexOf(c)-1]?.c||c.c)/((spyCandles[spyCandles.indexOf(c)-1]?.c)||c.c)*100)
              const up = c.c >= c.o
              return (
                <div key={c.ts} style={{flex:'1 1 80px',background:C.dim,borderRadius:4,padding:'8px 10px',border:`1px solid ${up?C.green+'44':C.red+'44'}`}}>
                  <div style={{fontSize:9,color:C.muted,fontFamily:'Space Mono,monospace',marginBottom:4}}>
                    {new Date(c.ts).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                  </div>
                  <div style={{fontSize:13,fontWeight:700,fontFamily:'Space Mono,monospace',color:up?C.green:C.red}}>
                    ${c.c.toFixed(2)}
                  </div>
                  <div style={{fontSize:9,color:up?C.green:C.red,marginTop:2}}>
                    {up?'+':''}{((c.c-c.o)/c.o*100).toFixed(2)}%
                  </div>
                </div>
              )
            })}
          </div>
        ) : <div style={{color:C.muted,fontSize:11,fontFamily:'Space Mono,monospace'}}>LOADING SPY DATA...</div>}
      </Panel>
    </div>
  )
}

// ── TAB PHASE ──
const CHORD_COLORS = {
  MAJOR:      '#00ff88',
  LEADING:    '#44ffaa',
  DOMINANT:   '#f0b429',
  LYDIAN:     '#00d4ff',
  PEDAL:      '#4a7090',
  NEAPOLITAN: '#ff8c00',
  SUSPENDED:  '#b44fff',
  PHRYGIAN:   '#9d6fff',
  TRITONE:    '#ff3d5a',
}
const CHORD_SUB = {
  MAJOR:      'BTC↑ SOL↑ · resolution',
  LEADING:    'BTC↑ SOL→ · SOL will follow',
  DOMINANT:   'BTC↑ SOL↓ · tension',
  LYDIAN:     'BTC→ SOL↑ · alt-season signal',
  PEDAL:      'BTC→ SOL→ · pressure builds',
  NEAPOLITAN: 'BTC→ SOL↓ · SOL distribution warning',
  SUSPENDED:  'BTC↓ SOL↑ · W8 signal chord ◈',
  PHRYGIAN:   'BTC↓ SOL→ · SOL relative strength',
  TRITONE:    'BTC↓ SOL↓ · risk off',
}

function TabPhase({ chordState, soundOn, setSoundOn, audioCtxRef, activeTFs, setActiveTFs, flashTFs, primaryTF }) {
  function toggleTF(tf) {
    setActiveTFs(prev=>{
      const next=new Set(prev)
      if (next.has(tf)) { if(next.size>1) next.delete(tf) } else { next.add(tf) }
      return next
    })
  }
  const cs = chordState
  const chordCol = cs ? (CHORD_COLORS[cs.chord]||C.accent) : C.muted

  function handleSoundToggle() {
    if (!soundOn) {
      // First click — create + resume AudioContext (browser gesture requirement)
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext||window.webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
      setSoundOn(true)
      // Play current chord immediately as feedback
      if (cs?.chord) playArp(audioCtxRef.current, cs.chord, audioReg)
    } else {
      setSoundOn(false)
    }
  }

  return (
    <div className="phase-grid" style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:14}}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>

        {/* CHORD STATE */}
        <Panel>
          <Label txt={`CHORD STATE — BTC 1H vs SOL ${primaryTF.toUpperCase()} (most granular active)`}/>
          <div style={{display:'flex',alignItems:'center',gap:24,padding:'16px 0'}}>
            <div style={{fontSize:52,fontWeight:700,fontFamily:'Space Mono,monospace',color:chordCol,letterSpacing:2,textShadow:`0 0 30px ${chordCol}55`}}>
              {cs?.chord||'—'}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <div style={{fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted}}>
                BTC weekly <span style={{color:cs?.btcWeekRet>=0?C.green:C.red,fontWeight:700}}>
                  {cs?.btcWeekRet!=null?`${cs.btcWeekRet>=0?'+':''}${(cs.btcWeekRet*100).toFixed(2)}%`:'—'}
                </span>
              </div>
              <div style={{fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted}}>
                SOL weekly <span style={{color:cs?.solWeekRet>=0?C.green:C.red,fontWeight:700}}>
                  {cs?.solWeekRet!=null?`${cs.solWeekRet>=0?'+':''}${(cs.solWeekRet*100).toFixed(2)}%`:'—'}
                </span>
              </div>
              <div style={{fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted}}>
                SOL price <span style={{color:C.gold,fontWeight:700}}>${cs?.solPrice?fmt(cs.solPrice,2):'—'}</span>
              </div>
            </div>
          </div>
          {/* sub-label for active chord */}
          {cs?.chord && (
            <div style={{fontSize:10,color:CHORD_COLORS[cs.chord],fontFamily:'Space Mono,monospace',marginBottom:10,letterSpacing:1}}>
              {CHORD_SUB[cs.chord]}
            </div>
          )}
          {/* 3×3 chord grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5,marginBottom:10}}>
            {Object.entries(CHORD_COLORS).map(([chord,col])=>(
              <div key={chord} style={{padding:'5px 8px',borderRadius:3,border:`1px solid ${col}${cs?.chord===chord?'ff':'22'}`,background:cs?.chord===chord?`${col}22`:'transparent',fontSize:10,fontFamily:'Space Mono,monospace',color:cs?.chord===chord?col:C.muted,fontWeight:cs?.chord===chord?700:400,textAlign:'center',transition:'all 0.2s'}}>
                {chord}
              </div>
            ))}
          </div>
          <div style={{fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted}}>
            BTC 1H return <span style={{color:cs?.btcRet>=0?C.green:C.red}}>{cs?.btcRet!=null?`${cs.btcRet>=0?'+':''}${(cs.btcRet*100).toFixed(3)}%`:'—'}</span>
            <span style={{margin:'0 12px',color:C.border}}>|</span>
            SOL <span style={{color:C.gold}}>{primaryTF.toUpperCase()}</span> return <span style={{color:cs?.solRet>=0?C.green:C.red}}>{cs?.solRet!=null?`${cs.solRet>=0?'+':''}${(cs.solRet*100).toFixed(3)}%`:'—'}</span>
          </div>
        </Panel>

        {/* JUPITER FILTER */}
        <Panel>
          <Label txt="JUPITER PHASE FILTER"/>
          <div style={{display:'flex',gap:20,alignItems:'center',padding:'10px 0'}}>
            <div style={{flex:1}}>
              <div style={{position:'relative',height:16,background:C.dim,borderRadius:8,overflow:'hidden'}}>
                <div style={{position:'absolute',left:`${((cs?.phase||0)/360*100)}%`,top:'50%',transform:'translate(-50%,-50%)',width:12,height:12,borderRadius:'50%',background:cs?.inSignalZone?'#b44fff':C.muted,boxShadow:cs?.inSignalZone?'0 0 12px #b44fff':'none',transition:'left 1s ease'}}/>
                <div style={{position:'absolute',left:`${((JUP_SIGNAL_ZONE-JUP_SIGNAL_HALF)/360*100)}%`,width:`${(JUP_SIGNAL_HALF*2/360*100)}%`,top:0,bottom:0,background:'#b44fff18',borderLeft:'1px solid #b44fff44',borderRight:'1px solid #b44fff44'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:9,color:C.muted,fontFamily:'Space Mono,monospace'}}>
                <span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span>
              </div>
            </div>
            <div style={{textAlign:'center',minWidth:80}}>
              <div style={{fontSize:22,fontWeight:700,fontFamily:'Space Mono,monospace',color:cs?.inSignalZone?'#b44fff':C.muted}}>{cs?.phase||'—'}°</div>
              <div style={{fontSize:9,color:C.muted,fontFamily:'Space Mono,monospace'}}>JUPITER</div>
            </div>
          </div>
          <div style={{display:'flex',gap:12,fontSize:11,fontFamily:'Space Mono,monospace',marginTop:4}}>
            <div style={{padding:'6px 14px',borderRadius:4,border:`1px solid ${cs?.inSignalZone?'#b44fff':C.border}`,color:cs?.inSignalZone?'#b44fff':C.muted,background:cs?.inSignalZone?'#b44fff18':'transparent'}}>
              ZONE {cs?.inSignalZone?'ACTIVE':'INACTIVE'}
            </div>
            <div style={{padding:'6px 14px',borderRadius:4,border:`1px solid ${cs?.gateOpen?C.green:C.border}`,color:cs?.gateOpen?C.green:C.muted,background:cs?.gateOpen?`${C.green}18`:'transparent',fontWeight:cs?.gateOpen?700:400}}>
              {cs?.gateOpen?'⚡ GATE OPEN':'GATE CLOSED'}
            </div>
            <div style={{fontSize:10,color:C.muted,alignSelf:'center'}}>Signal zone: {JUP_SIGNAL_ZONE}° ±{JUP_SIGNAL_HALF}°</div>
          </div>
        </Panel>

        {/* BACKTEST LOG */}
        <Panel>
          <Label txt="W8 PHASE — BACKTEST SIGNAL LOG (7/7)"/>
          <div style={{fontSize:11,color:C.muted,fontFamily:'Space Mono,monospace',marginBottom:10}}>
            All historical SUSPENDED + Jupiter zone signals. SOL spot, compounded from $150.
          </div>
          {SOL_SIGNALS.map((s,i)=>{
            const bal=SOL_SIGNALS.slice(0,i+1).reduce((b,x)=>b*(1+x.ret/100),150)
            return(
              <div key={s.date} style={{display:'flex',gap:12,padding:'6px 0',borderBottom:`1px solid ${C.border}`,fontSize:11,fontFamily:'Space Mono,monospace',alignItems:'center'}}>
                <span style={{color:C.muted,minWidth:80}}>{s.date}</span>
                <span style={{color:C.green,fontWeight:700}}>+{s.ret}%</span>
                <span style={{color:C.muted,fontSize:10,marginLeft:'auto'}}>→ ${fmt(bal,2)}</span>
              </div>
            )
          })}
          <div style={{marginTop:10,display:'flex',justifyContent:'space-between',fontSize:12,fontFamily:'Space Mono,monospace'}}>
            <span style={{color:C.muted}}>Final balance</span>
            <span style={{color:'#b44fff',fontWeight:700,fontSize:16}}>${fmt(W8_BAL,2)}</span>
          </div>
        </Panel>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>

        {/* W8 WALLET */}
        <Panel>
          <Label txt="W8 PHASE SIGNAL WALLET"/>
          <WalletCard id="W8_PHASE" live={{balance:W8_BAL,total_trades:7,wins:7,losses:0,win_rate:100}} extra={{}}/>
          <div style={{marginTop:12,fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted,lineHeight:1.8}}>
            <div>Asset: SOL spot (USDT) — pure play: SOL/BTC ratio</div>
            <div>Filter: SUSPENDED chord + Jupiter zone</div>
            <div>Entry: Weekly candle open on signal</div>
            <div>Exit: Weekly candle close (1 candle hold)</div>
            <div style={{color:'#b44fff',marginTop:6}}>◈ 7/7 wins · 100% win rate · +60.3% total</div>
          </div>
        </Panel>

        {/* AUDIO CONTROLS */}
        <Panel>
          <Label txt="AUDIO ENGINE — CHORD SOUNDS"/>
          <div style={{fontSize:11,color:C.muted,fontFamily:'Space Mono,monospace',marginBottom:12,lineHeight:1.6}}>
            Plays chord arpeggios live as the phase state changes. Trade entry/exit events trigger distinct tones. Click once to unlock audio.
          </div>
          <button onClick={handleSoundToggle} style={{
            width:'100%',padding:'12px',borderRadius:6,border:`1px solid ${soundOn?C.green:C.border}`,
            background:soundOn?`${C.green}18`:C.dim,cursor:'pointer',
            fontSize:13,fontFamily:'Space Mono,monospace',fontWeight:700,letterSpacing:1,
            color:soundOn?C.green:C.muted,transition:'all 0.2s',marginBottom:14,
          }}>
            {soundOn?'♪ SOUND ON — CLICK TO MUTE':'♪ CLICK TO ENABLE SOUND'}
          </button>

          {soundOn && (
            <button onClick={()=>{
              const ctx = audioCtxRef.current
              if (!ctx) return
              const doTest=()=>playArp(ctx, cs?.chord||'MAJOR', TF_CONFIG[primaryTF]?.mult||1.0)
              ctx.state==='suspended' ? ctx.resume().then(doTest) : doTest()
            }} style={{
              width:'100%',padding:'10px',borderRadius:4,border:`1px solid ${C.green}`,background:`${C.green}18`,
              cursor:'pointer',fontSize:12,fontFamily:'Space Mono,monospace',color:C.green,fontWeight:700,marginBottom:10,letterSpacing:1,
            }}>▶ TEST SOUND — {cs?.chord||'MAJOR'}</button>
          )}

          <Label txt="SYMPHONY — SELECT TFs (MULTI, FIRES ON CANDLE CLOSE)"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:6}}>
            {Object.entries(TF_CONFIG).map(([tf,cfg])=>{
              const active = activeTFs.has(tf)
              const flashing = flashTFs.has(tf)
              return (
                <button key={tf} onClick={()=>toggleTF(tf)} style={{
                  padding:'10px 4px',borderRadius:4,cursor:'pointer',textAlign:'center',
                  border:`1px solid ${active?cfg.color:C.border}`,
                  background: flashing ? cfg.color : active ? `${cfg.color}22` : C.dim,
                  transition: flashing ? 'background 0.05s' : 'background 0.3s, border 0.2s',
                  boxShadow: flashing ? `0 0 16px ${cfg.color}` : 'none',
                }}>
                  <div style={{fontSize:12,fontFamily:'Space Mono,monospace',fontWeight:700,color:active||flashing?cfg.color:C.muted}}>{cfg.label}</div>
                  <div style={{fontSize:9,color:active?cfg.color:C.muted,marginTop:2}}>×{cfg.mult}</div>
                </button>
              )
            })}
          </div>
          <div style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',marginBottom:14}}>
            Select any combo. Each TF chimes on its own candle close at its own octave.
          </div>

          <div style={{marginTop:14,fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace',lineHeight:1.9}}>
            {Object.entries(CHORD_SUB).map(([chord,sub])=>(
              <div key={chord} style={{color:CHORD_COLORS[chord]}}>{chord} — {sub}</div>
            ))}
          </div>
        </Panel>

        {/* STRATEGY INFO */}
        <Panel>
          <Label txt="STRATEGY — THEATER ONLY"/>
          <div style={{fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted,lineHeight:1.9}}>
            <div style={{color:C.text,marginBottom:6}}>Fully automated observation mode.</div>
            <div>No manual inputs. Watch only.</div>
            <div>SOL price: Binance public API (1W)</div>
            <div>BTC state: /api/state 1H candles</div>
            <div>Chord: auto-computed each poll</div>
            <div>Audio: fires on state change events</div>
            <div style={{color:'#b44fff',marginTop:8,fontWeight:700}}>◈ SUSPENDED + Gate = take signal</div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

// ── MAIN ──
export default function TraderLive() {
  const [data,setData]         = useState(null)
  const [err,setErr]           = useState(null)
  const [clock,setClock]       = useState('')
  const [tab,setTab]           = useState('overview')
  const [activeTFs,setActiveTFs]         = useState(new Set(['1h']))
  const [solKlinesMap,setSolKlinesMap]   = useState({})
  const [flashTFs,setFlashTFs]           = useState(new Set())
  const [soundOn,setSoundOn]             = useState(false)
  const [chartTF,setChartTF]             = useState('1h')
  const [btcKlines,setBtcKlines]         = useState(null)
  const [showChordOverlay,setShowChordOverlay] = useState(true)
  const [chordHistoryByTF,setChordHistoryByTF] = useState({})
  const audioCtxRef    = useRef(null)
  const prevChordRef   = useRef(null)
  const prevSigTsRef   = useRef(0)
  const prevTradeIdRef = useRef(0)
  const prevKlineTsRef = useRef({})
  const soundOnRef     = useRef(false)
  const dataRef        = useRef(null)

  const load = useCallback(async()=>{
    try {
      const r = await fetch(API)
      if (!r.ok) throw new Error(r.status)
      setData(await r.json()); setErr(null)
    } catch(e){ setErr(e.message) }
  },[])

  // Per-TF SOL kline fetcher — detects candle close and fires sound + flash
  const fetchSolTF = useCallback(async(tf)=>{
    try {
      const r = await fetch(`/api/sol-klines?interval=${tf}&limit=5`)
      if (!r.ok) return
      const klines = await r.json()
      if (!Array.isArray(klines) || klines.length < 2) return
      setSolKlinesMap(prev=>({...prev,[tf]:klines}))
      // Candle close detection: last kline openTime changed → previous candle just closed
      const latestTs = klines[klines.length-1][0]
      const seenTs   = prevKlineTsRef.current[tf]
      if (seenTs !== undefined && seenTs !== latestTs) {
        // New candle opened = fire chord for this TF
        if (soundOnRef.current && audioCtxRef.current) {
          const ctx = audioCtxRef.current
          const doPlay = ()=>{
            const cs = computeChord(dataRef.current?.candles, klines)
            if (cs) {
              playArp(ctx, cs.chord, TF_CONFIG[tf].mult)
              setFlashTFs(prev=>{ const s=new Set(prev); s.add(tf); return s })
              setTimeout(()=>setFlashTFs(prev=>{ const s=new Set(prev); s.delete(tf); return s }), 700)
              // Track chord history for chart overlay — keyed by TF
              setChordHistoryByTF(prev=>({
                ...prev,
                [tf]: [...(prev[tf]||[]), { ts: latestTs, chord: cs.chord, color: CHORD_COLORS[cs.chord] }].slice(-500)
              }))
            }
          }
          ctx.state==='suspended' ? ctx.resume().then(doPlay) : doPlay()
        }
      }
      prevKlineTsRef.current[tf] = latestTs
    } catch(e){}
  },[])

  // Sync refs so fetchSolTF closures always see latest values
  useEffect(()=>{ soundOnRef.current = soundOn },[soundOn])
  useEffect(()=>{ dataRef.current = data },[data])

  useEffect(()=>{
    load()
    const iv = setInterval(load, POLL)
    const ck = setInterval(()=>setClock(new Date().toUTCString().slice(17,22)+' UTC'),1000)
    return ()=>{ clearInterval(iv); clearInterval(ck) }
  },[load])

  // Per-TF SOL polling — restarts whenever activeTFs changes
  useEffect(()=>{
    const tfs = Array.from(activeTFs)
    tfs.forEach(tf=>fetchSolTF(tf))
    const intervals = tfs.map(tf=>setInterval(()=>fetchSolTF(tf), TF_CONFIG[tf].pollMs))
    return ()=>intervals.forEach(clearInterval)
  },[fetchSolTF, [...activeTFs].sort().join(',')])

  // ── STOCK CHORD STATE ──
  const [stockKlines,setStockKlines] = useState({}) // { SPY:[], NVDA:[], AMC:[] }

  const fetchStock = useCallback(async(sym)=>{
    try {
      const r = await fetch(`/api/stock-klines?symbol=${sym}&tf=1d&limit=5`)
      if (!r.ok) return
      const candles = await r.json()
      if (!Array.isArray(candles) || candles.length < 2) return
      setStockKlines(prev=>({...prev,[sym]:candles}))
    } catch(e){}
  },[])

  useEffect(()=>{
    ['SPY','NVDA','AMC'].forEach(s=>fetchStock(s))
    const iv = setInterval(()=>['SPY','NVDA','AMC'].forEach(s=>fetchStock(s)), 300000) // 5min
    return ()=>clearInterval(iv)
  },[fetchStock])

  // Compute stock chord: anchor=SPY, oscillator=NVDA or AMC
  function computeStockChord(spyCandles, oscCandles) {
    if (!spyCandles?.length || !oscCandles?.length) return null
    if (spyCandles.length < 2 || oscCandles.length < 2) return null
    const spyRet = (spyCandles[spyCandles.length-1].c - spyCandles[spyCandles.length-2].c) / spyCandles[spyCandles.length-2].c
    const oscRet = (oscCandles[oscCandles.length-1].c - oscCandles[oscCandles.length-2].c) / oscCandles[oscCandles.length-2].c
    const bDir = dirOf(spyRet), sDir = dirOf(oscRet)
    let chord
    if      (bDir===1  && sDir===1)  chord='MAJOR'
    else if (bDir===1  && sDir===0)  chord='LEADING'
    else if (bDir===1  && sDir===-1) chord='DOMINANT'
    else if (bDir===0  && sDir===1)  chord='LYDIAN'
    else if (bDir===0  && sDir===0)  chord='PEDAL'
    else if (bDir===0  && sDir===-1) chord='NEAPOLITAN'
    else if (bDir===-1 && sDir===1)  chord='SUSPENDED'
    else if (bDir===-1 && sDir===0)  chord='PHRYGIAN'
    else                             chord='TRITONE'
    const gateOpen = chord==='SUSPENDED'
    return { chord, spyRet, oscRet, bDir, sDir, gateOpen,
      spyPrice: spyCandles[spyCandles.length-1].c,
      oscPrice: oscCandles[oscCandles.length-1].c }
  }

  const nvdaChord = computeStockChord(stockKlines.SPY, stockKlines.NVDA)
  const amcChord  = computeStockChord(stockKlines.SPY, stockKlines.AMC)

  // BTC klines for chart TF (1H uses existing data.candles; others fetch from Kraken)
  const loadBtcKlines = useCallback(async(tf)=>{
    if (tf === '1h') { setBtcKlines(null); return }
    try {
      const r = await fetch(`/api/btc-klines?interval=${tf}&limit=150`)
      if (!r.ok) return
      setBtcKlines(await r.json())
    } catch(e){}
  },[])

  useEffect(()=>{
    loadBtcKlines(chartTF)
    const pollMs = { '15m':60000, '4h':300000, '1d':600000 }[chartTF] || 60000
    const iv = setInterval(()=>loadBtcKlines(chartTF), pollMs)
    return ()=>clearInterval(iv)
  },[loadBtcKlines, chartTF])

  // Chord state derived from BTC candles + SOL klines
  // Display chord from most granular active TF
  const primaryTF = ['1m','15m','1h','4h','1d','1w'].find(tf=>activeTFs.has(tf)) || '1h'
  const chordState = data?.candles && solKlinesMap[primaryTF]
    ? computeChord(data.candles, solKlinesMap[primaryTF]) : null

  // Chord state change → play at primary TF octave
  useEffect(()=>{
    if (!soundOn || !audioCtxRef.current || !chordState) return
    if (prevChordRef.current !== null && prevChordRef.current !== chordState.chord) {
      playArp(audioCtxRef.current, chordState.chord, TF_CONFIG[primaryTF]?.mult||1.0)
    }
    prevChordRef.current = chordState.chord
  },[chordState?.chord, soundOn])

  // Trade entry / exit sounds
  useEffect(()=>{
    if (!soundOn || !audioCtxRef.current || !data) return
    const ctx = audioCtxRef.current
    const latestSigTs = data?.signals?.[0]?.ts || 0
    if (latestSigTs && latestSigTs !== prevSigTsRef.current && prevSigTsRef.current !== 0) {
      playArp(ctx, 'ENTRY', 1.0)
    }
    prevSigTsRef.current = latestSigTs
    const latestTradeId = data?.recent_trades?.[0]?.id || 0
    if (latestTradeId && latestTradeId !== prevTradeIdRef.current && prevTradeIdRef.current !== 0) {
      playArp(ctx, (data.recent_trades[0].pnl||0)>=0 ? 'EXIT_WIN' : 'EXIT_LOSS', 1.0)
    }
    prevTradeIdRef.current = latestTradeId
  },[data?.signals?.[0]?.ts, data?.recent_trades?.[0]?.id, soundOn])

  const price   = data?.price || data?.candles?.[data.candles.length-1]?.c || 0
  const resid   = data?.residual||0
  const prev    = data?.candles?.[data.candles.length-2]?.c
  const chg     = prev ? (price-prev)/prev*100 : 0
  const extra   = data ? deriveProfileWallets(data) : {}

  const totalBal = Object.keys(WALLETS).reduce((s,id)=>{
    const d = data?.wallets?.[id] || extra[id]
    return s + ((d?.balance) ?? WALLETS[id].start)
  }, 0)
  const totalPnl = totalBal - 1650  // 11 wallets × $150

  const TABS = [
    { id:'overview',   label:'◈ OVERVIEW' },
    { id:'wallets',    label:'◫ WALLETS' },
    { id:'aggressive', label:'⚡ AGGRESSIVE' },
    { id:'cautious',   label:'◉ CAUTIOUS' },
    { id:'signals',    label:'⊕ SIGNALS' },
    { id:'macro',      label:'⊞ MACRO' },
    { id:'phase',      label:'◈ PHASE SIGNAL' },
    { id:'stocks',     label:'◎ STOCKS' },
  ]

  return (
    <>
      <Head>
        <title>BTC Theatre · TraderLive</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:${C.bg};color:${C.text};font-family:'Rajdhani',sans-serif;min-height:100vh}
          ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.bg}}
          ::-webkit-scrollbar-thumb{background:${C.dim};border-radius:2px}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
          @keyframes ticker{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}
          button:hover{opacity:0.85}
          /* ── TAB BAR ── */
          .tab-bar{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .tab-bar::-webkit-scrollbar{display:none}
          /* ── MOBILE ── */
          @media(max-width:768px){
            .tab-bar{padding:0 8px!important}
            .tab-btn{padding:9px 10px!important;font-size:9px!important;letter-spacing:0!important}
            .content-pad{padding:12px 10px!important}
            .ov-grid{grid-template-columns:1fr!important}
            .two-col{grid-template-columns:1fr!important}
            .wlt-grid{grid-template-columns:1fr 1fr!important}
            .phase-grid{grid-template-columns:1fr!important}
            .hdr-inner{gap:10px!important;padding:8px 12px!important}
            .hdr-price{font-size:16px!important}
            .hdr-session{font-size:9px!important}
            .ticker-wrap{display:none!important}
            .tf-btn-row{flex-wrap:wrap!important;gap:4px!important}
          }
        `}</style>
      </Head>

      {/* HEADER */}
      <div className="hdr-inner" style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <span style={{fontSize:17,fontWeight:700,color:C.accent,letterSpacing:3,fontFamily:'Rajdhani,sans-serif'}}>◈ BTC THEATRE</span>
          <span style={{fontSize:10,color:C.muted,fontFamily:'Space Mono,monospace'}}>PAPER TRADING ENGINE</span>
          {chordState && (
            <span style={{fontSize:10,fontFamily:'Space Mono,monospace',color:CHORD_COLORS[chordState.chord]||C.muted,border:`1px solid ${CHORD_COLORS[chordState.chord]||C.border}40`,padding:'2px 8px',borderRadius:3}}>
              {chordState.chord}{chordState.gateOpen?' ⚡':''}
            </span>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:24}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:22,fontWeight:700,color:chg>=0?C.green:C.red,fontFamily:'Space Mono,monospace'}}>${fmt(price)}</div>
            <div style={{fontSize:11,color:chg>=0?C.green:C.red}}>{fmtP(chg)} · {sess(data?.session)}</div>
          </div>
          <div style={{textAlign:'right',fontSize:11,color:C.muted,fontFamily:'Space Mono,monospace'}}>
            <div>{clock}</div>
            <div style={{color:err?C.red:C.green}}>{err?`⚠ ${err}`:'● LIVE'}</div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div className="ticker-wrap" style={{background:'#050810',borderBottom:`1px solid ${C.border}`,height:26,overflow:'hidden',display:'flex',alignItems:'center'}}>
        <div style={{animation:'ticker 40s linear infinite',whiteSpace:'nowrap',fontSize:11,fontFamily:'Space Mono,monospace',color:C.muted}}>
          {[`BTC $${fmt(price)}`,`RESID ${resid>=0?'+':''}${resid?.toFixed(4)}`,`TREND $${fmt(data?.trend_price)}`,`ATR $${fmt(data?.atr)}`,`SESSION ${data?.session?.toUpperCase()||'—'}`,`PORT $${fmt(totalBal,2)}`,`PNL ${totalPnl>=0?'+':''}$${fmt(totalPnl,2)}`,`OPEN ${data?.open_trades?.length||0}`,`CHORD ${chordState?.chord||'—'}`,`SOL $${chordState?.solPrice?fmt(chordState.solPrice,2):'—'}`,`JUP ${chordState?.phase||'—'}°`,`FOMC JUN 17 14:00 ET`]
            .map((t,i)=><span key={i} style={{marginRight:60}}>{t}</span>)}
        </div>
      </div>

      {/* TABS */}
      <TabBar tabs={TABS} active={tab} onChange={setTab}/>

      {/* CONTENT */}
      <div className="content-pad" style={{padding:'18px 24px',maxWidth:1400,margin:'0 auto'}}>
        {tab==='overview'   && <TabOverview   data={data} resid={resid} chg={chg} totalBal={totalBal} totalPnl={totalPnl} extra={extra} chartTF={chartTF} setChartTF={setChartTF} btcKlines={btcKlines} showChordOverlay={showChordOverlay} setShowChordOverlay={setShowChordOverlay} chordHistoryByTF={chordHistoryByTF}/>}
        {tab==='wallets'    && <TabWallets    data={data} extra={extra}/>}
        {tab==='aggressive' && <TabAggressive data={data} extra={extra}/>}
        {tab==='cautious'   && <TabCautious   data={data} extra={extra}/>}
        {tab==='signals'    && <TabSignals    data={data}/>}
        {tab==='macro'      && <TabMacro      data={data} resid={resid}/>}
        {tab==='phase'      && <TabPhase      chordState={chordState} soundOn={soundOn} setSoundOn={setSoundOn} audioCtxRef={audioCtxRef} activeTFs={activeTFs} setActiveTFs={setActiveTFs} flashTFs={flashTFs} primaryTF={primaryTF}/>}
        {tab==='stocks'     && <TabStocks     nvdaChord={nvdaChord} amcChord={amcChord} stockKlines={stockKlines}/>}
      </div>
    </>
  )
}
