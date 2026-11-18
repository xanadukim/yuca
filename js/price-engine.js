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
