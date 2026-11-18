// 가격표 공용 엔진 - 가격표 관리(pricebook.js)와 예약관리(reservations.js)에서 함께 사용
import { load, save, KEYS } from './storage.js';

// 시드 데이터 (CHAPTER 09 교재 예시 기반)
export const PB_SEED = {
  tiers: [
    { id:'t1', label:'소형', minKg:0,  maxKg:7  },
    { id:'t2', label:'중형', minKg:7,  maxKg:15 },
    { id:'t3', label:'대형', minKg:15, maxKg:null },
  ],
  services: ['목욕','위생미용','전체미용','가위컷','부분미용'],
  prices: {
    '목욕':     {'소형':50000,'중형':60000,'대형':80000},
    '위생미용': {'소형':60000,'중형':70000,'대형':90000},
    '전체미용': {'소형':80000,'중형':90000,'대형':110000},
    '가위컷':   {'소형':120000,'중형':140000,'대형':170000},
    '부분미용': {'소형':30000,'중형':40000,'대형':50000},
  },
  coats: [
    { id:'c1', label:'A 보통', add:0 },
    { id:'c2', label:'B 많음/장모', add:10000 },
    { id:'c3', label:'C 극도/이중모', add:20000 },
  ],
  styles: [
    { id:'s1', label:'유지', add:0 },
    { id:'s2', label:'변화', add:15000 },
    { id:'s3', label:'풀 가위컷', add:30000 },
  ],
  addons: [
    { id:'a1', name:'엉킴 케어', price:20000, autoOver:null },
    { id:'a2', name:'장모 케어', price:20000, autoOver:null },
    { id:'a3', name:'대형견 케어', price:15000, autoOver:15 },
    { id:'a4', name:'위생 클리닝', price:15000, autoOver:null },
    { id:'a5', name:'안전관리', price:10000, autoOver:null },
    { id:'a6', name:'노령견 케어', price:15000, autoOver:null },
    { id:'a7', name:'약욕·스파', price:20000, autoOver:null },
    { id:'a8', name:'픽업·야간', price:10000, autoOver:null },
  ],
  // 호텔 요금제: 1박(24h) × 체급 × 객실타입 + 장기할인/성수기할증/추가옵션
  hotel: {
    tiers: [
      { id:'h1', label:'미니', minKg:0,  maxKg:5  },
      { id:'h2', label:'소형', minKg:5,  maxKg:10 },
      { id:'h3', label:'중형', minKg:10, maxKg:15 },
      { id:'h4', label:'대형', minKg:15, maxKg:25 },
      { id:'h5', label:'특대', minKg:25, maxKg:null },
    ],
    roomTypes: [
      { id:'S',      label:'S 케이지' },
      { id:'M',      label:'M 룸' },
      { id:'L',      label:'L 룸' },
      { id:'SUITE',  label:'SUITE 프리미엄' },
    ],
    prices: {
      'S':     {'미니':25000,'소형':30000,'중형':35000,'대형':40000,'특대':45000},
      'M':     {'미니':30000,'소형':35000,'중형':40000,'대형':45000,'특대':50000},
      'L':     {'미니':35000,'소형':40000,'중형':45000,'대형':50000,'특대':55000},
      'SUITE': {'미니':50000,'소형':60000,'중형':70000,'대형':80000,'특대':90000},
    },
    longStay: [ { nights:4, pct:5 }, { nights:8, pct:10 } ],
    peak: { enabled:false, start:'', end:'', pct:15 },
    addons: [
      { id:'ha1', name:'1회 식사', price:2000 },
      { id:'ha2', name:'무제한 간식', price:3000 },
      { id:'ha3', name:'산책 서비스', price:5000 },
      { id:'ha4', name:'개별 CCTV', price:5000 },
      { id:'ha5', name:'목욕 서비스', price:20000 },
      { id:'ha6', name:'픽업/샌딩', price:5000 },
    ],
  },
  // 유치원 요금제: 1회/반일/시간제(건별) + 월정액(주N회)
  kg: {
    tiers: [
      { id:'k1', label:'소형', minKg:0,  maxKg:7  },
      { id:'k2', label:'중형', minKg:7,  maxKg:15 },
      { id:'k3', label:'대형', minKg:15, maxKg:null },
    ],
    // 단건 요금: 1회(종일) / 반일(5h)
    oneTime: {
      '1회':  {'소형':40000,'중형':40000,'대형':55000},
      '반일': {'소형':25000,'중형':25000,'대형':35000},
    },
    // 시간제: 시간당 단가
    hourly: {'소형':3500,'중형':4000,'대형':5000},
    // 월정액: 주 N회 × 체급 (대형견 프리미엄 ~1.35배)
    monthly: {
      '주 1회':  {'소형':150000,'중형':155000,'대형':210000},
      '주 2회':  {'소형':250000,'중형':260000,'대형':350000},
      '주 3회':  {'소형':350000,'중형':360000,'대형':490000},
      '주 4회':  {'소형':430000,'중형':445000,'대형':600000},
      '매일':    {'소형':500000,'중형':520000,'대형':700000},
    },
    // 월정액 이용 출석은 무료 처리용 플랜
    freePlanLabel: '월정액 이용',
    addons: [
      { id:'ka1', name:'목욕 서비스', price:25000 },
      { id:'ka2', name:'간식 추가', price:3000 },
      { id:'ka3', name:'미용 연계', price:0 },
    ],
  },
  updatedAt: null,
};

export function getPricebook(){
  let pb = load(KEYS.pricebook, null);
  if(!pb){
    pb = JSON.parse(JSON.stringify(PB_SEED));
    savePricebook(pb);
  }
  return pb;
}
export function savePricebook(pb){ pb.updatedAt=Date.now(); save(KEYS.pricebook, pb); }

// 체중 → 체급 판정
export function tierForWeight(pb, kg){
  if(kg===null||kg===undefined||kg==='') return null;
  kg=Number(kg);
  return (pb.tiers||[]).find(t=>kg>=t.minKg && (t.maxKg==null || kg<t.maxKg)) || null;
}
// 체급 라벨로 찾기
export function tierByLabel(pb,label){ return (pb.tiers||[]).find(t=>t.label===label)||null; }
// 서비스 기본가
export function basePrice(pb, service, tierLabel){
  return pb.prices?.[service]?.[tierLabel] ?? null;
}
// 가격 계산 - 반환: {tierLabel, base, coatAdd, styleAdd, doubleAdd, addonItems, total, manualBase}
export function calcPrice(pb, opt){
  const { service, weightKg, tierLabel, coatLabel, styleLabel, doubleCoat, addonNames=[] } = opt||{};
  let tier=null;
  if(weightKg!==null&&weightKg!==undefined&&weightKg!==''){
    tier = tierForWeight(pb, weightKg);
  }
  if(!tier && tierLabel) tier = tierByLabel(pb, tierLabel);
  const tLabel = tier?.label || tierLabel || null;
  const base = tLabel!=null ? basePrice(pb, service, tLabel) : null;
  const coat = (pb.coats||[]).find(c=>c.label===coatLabel);
  const style = (pb.styles||[]).find(s=>s.label===styleLabel);
  const coatAdd = coat?.add||0, styleAdd = style?.add||0;
  const doubleAdd = doubleCoat ? 20000 : 0;
  const kg = weightKg!==''&&weightKg!=null ? Number(weightKg) : null;
  const addonItems=[];
  (pb.addons||[]).forEach(ad=>{
    const auto = ad.autoOver!=null && kg!=null && kg>ad.autoOver;
    if(auto || addonNames.includes(ad.name)){
      addonItems.push({ name:ad.name, price:ad.price, auto });
    }
  });
  const addonSum = addonItems.reduce((s,x)=>s+x.price,0);
  const total = (base??0)+coatAdd+styleAdd+doubleAdd+addonSum;
  return { tierLabel:tLabel, base, coatAdd, styleAdd, doubleAdd, addonItems, addonSum, total, manualBase: base==null };
}
// 가격표 적용 가능 서비스인지 (미용 계열)
export function isPricedService(pb, service){
  if(!service||!pb) return false;
  if(pb.services.includes(service)) return true;
  if(service==='미용') return pb.services.includes('전체미용'); // '미용'은 전체미용으로 간주
  return false;
}

// ---------- 호텔 요금 계산 ----------
// pb.hotel: {tiers, roomTypes, prices[roomType][tierLabel], longStay, peak, addons}
export function hotelTierForWeight(hotel, kg){
  if(kg===null||kg===undefined||kg==='') return null;
  kg=Number(kg);
  return (hotel.tiers||[]).find(t=>kg>=t.minKg && (t.maxKg==null || kg<t.maxKg)) || null;
}
export function hotelBasePerNight(hotel, roomType, tierLabel){
  return hotel.prices?.[roomType]?.[tierLabel] ?? null;
}
// 장기 할인율 (가장 큰 적용 가능 pct)
export function longStayPct(hotel, nights){
  let best=0;
  (hotel.longStay||[]).forEach(r=>{ if(nights>=r.nights && r.pct>best) best=r.pct; });
  return best;
}
// 성수기 여부 (체크인 날짜 기준)
export function isPeak(hotel, dateStr){
  const p=hotel.peak;
  if(!p||!p.enabled||!p.start||!p.end||!dateStr) return false;
  return dateStr>=p.start && dateStr<=p.end;
}
// 호텔 가격 계산
// opt: {weightKg, tierLabel, roomType, nights, checkInDate, addonNames[]}
export function calcHotelPrice(pb, opt){
  const h=pb?.hotel; if(!h) return {total:0};
  const {weightKg, tierLabel, roomType, nights=1, checkInDate, addonNames=[]}=opt||{};
  let tier=null;
  if(weightKg!==null&&weightKg!==undefined&&weightKg!=='') tier=hotelTierForWeight(h,weightKg);
  if(!tier&&tierLabel) tier=(h.tiers||[]).find(t=>t.label===tierLabel)||null;
  const tLabel=tier?.label||tierLabel||null;
  const perNight=tLabel!=null?hotelBasePerNight(h,roomType,tLabel):null;
  const base=(perNight??0)*nights;
  const discPct=longStayPct(h,nights);
  const discount=Math.round(base*discPct/100);
  const peak=isPeak(h,checkInDate);
  const peakPct=peak?(h.peak.pct||0):0;
  const surcharge=Math.round((base-discount)*peakPct/100);
  const addonItems=(h.addons||[]).filter(a=>addonNames.includes(a.name)).map(a=>({name:a.name,price:a.price}));
  const addonSum=addonItems.reduce((s,x)=>s+x.price,0);
  const total=base-discount+surcharge+addonSum;
  return {tierLabel:tLabel,roomType,perNight,nights,base,discPct,discount,peak,peakPct,surcharge,addonItems,addonSum,total,manualBase:perNight==null};
}

// ---------- 유치원 요금 계산 ----------
// plan: '1회' | '반일' | '시간제' | '월정액' | '월정액 이용'(무료) | '체험'(무료)
export function kgTierForWeight(kg, w){
  if(w===null||w===undefined||w==='') return null;
  w=Number(w);
  return (kg.tiers||[]).find(t=>w>=t.minKg && (t.maxKg==null || w<t.maxKg)) || null;
}
// 시간 계산 (HH:MM → 시간, 소수점)
function hoursBetween(tIn,tOut){
  if(!tIn||!tOut) return null;
  const[a,b]=tIn.split(':'),[c,d]=tOut.split(':').map(Number);
  const h1=+a+(+b||0)/60, h2=c+d/60;
  const diff=h2-h1;
  return diff>0?diff:null;
}
// opt: {weightKg, tierLabel, plan, freqLabel('주 2회' 등), checkIn, checkOut, addonNames[]}
export function calcKgPrice(pb, opt){
  const k=pb?.kg; if(!k) return {total:0};
  const {weightKg,tierLabel,plan,freqLabel,checkIn,checkOut,addonNames=[]}=opt||{};
  let tier=null;
  if(weightKg!==null&&weightKg!==undefined&&weightKg!=='') tier=kgTierForWeight(k,weightKg);
  if(!tier&&tierLabel) tier=(k.tiers||[]).find(t=>t.label===tierLabel)||null;
  const tLabel=tier?.label||tierLabel||null;
  let base=0, detail='';
  if(plan==='1회'||plan==='반일'){
    base=k.oneTime?.[plan]?.[tLabel]??0;
    detail=`${plan} ${tLabel||''}`;
  }else if(plan==='시간제'){
    const h=hoursBetween(checkIn,checkOut);
    const rate=k.hourly?.[tLabel]??0;
    const billed=h==null?1:Math.ceil(h*2)/2; // 30분 단위 올림
    base=Math.round(rate*billed);
    detail=`시간제 ${tLabel||''} ${billed}시간`;
  }else if(plan==='월정액'){
    base=k.monthly?.[freqLabel]?.[tLabel]??0;
    detail=`월정액 ${freqLabel||''} ${tLabel||''}`;
  }else{
    base=0; detail=plan||'';
  }
  const addonItems=(k.addons||[]).filter(a=>(addonNames||[]).includes(a.name)).map(a=>({name:a.name,price:a.price}));
  const addonSum=addonItems.reduce((s,x)=>s+x.price,0);
  const total=base+addonSum;
  return {tierLabel:tLabel,plan,freqLabel,base,detail,addonItems,addonSum,total,manualBase:!base&&!!tLabel&&(plan==='1회'||plan==='반일'||plan==='시간제'||plan==='월정액')};
}
