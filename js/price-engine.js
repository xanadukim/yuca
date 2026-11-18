// 가격표 공용 엔진 - 미용 가격표 관리(pricebook.js)와 예약관리(reservations.js)에서 함께 사용
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
  // 셀별 원가 구조 (내부용): 직접재료비 + 표준 소요시간 — BEP 공헌이익 계산용
  costs: {
    '목욕':     {'소형':{material:4000,minutes:50}, '중형':{material:5500,minutes:60}, '대형':{material:7500,minutes:80}},
    '위생미용': {'소형':{material:5000,minutes:70}, '중형':{material:6500,minutes:85}, '대형':{material:8500,minutes:110}},
    '전체미용': {'소형':{material:6000,minutes:120},'중형':{material:8000,minutes:140},'대형':{material:10500,minutes:180}},
    '가위컷':   {'소형':{material:6500,minutes:140},'중형':{material:8500,minutes:160},'대형':{material:11000,minutes:200}},
    '부분미용': {'소형':{material:3000,minutes:40}, '중형':{material:4000,minutes:50}, '대형':{material:5500,minutes:65}},
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
  updatedAt: null,
};

export function getPricebook(){
  let pb = load(KEYS.pricebook, null);
  if(!pb){
    pb = JSON.parse(JSON.stringify(PB_SEED));
    savePricebook(pb);
    return pb;
  }
  // 구버전 데이터 정리: 제거된 hotel/kg 섹션 삭제
  delete pb.hotel; delete pb.kg;
  if(!pb.costs) pb.costs=JSON.parse(JSON.stringify(PB_SEED.costs));
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
// 셀별 원가 (재료비/소요시간)
export function cellCost(pb, service, tierLabel){
  const c=pb.costs?.[service]?.[tierLabel];
  return { material:Number(c?.material)||0, minutes:Number(c?.minutes)||0 };
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
  let addonSum = addonItems.reduce((s,x)=>s+x.price,0);
  // 추가요금 상한: 기본가격의 50% (외부 검토 문서 규칙)
  let addonCapped=false;
  if(base!=null && addonSum > base*0.5){ addonSum=base*0.5; addonCapped=true; }
  const total = (base??0)+coatAdd+styleAdd+doubleAdd+addonSum;
  return { tierLabel:tLabel, base, coatAdd, styleAdd, doubleAdd, addonItems, addonSum, total, manualBase: base==null, addonCapped };
}
// 가격표 적용 가능 서비스인지 (미용 계열)
export function isPricedService(pb, service){
  if(!service||!pb) return false;
  if(pb.services.includes(service)) return true;
  if(service==='미용') return pb.services.includes('전체미용'); // '미용'은 전체미용으로 간주
  return false;
}
