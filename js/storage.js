export const KEYS={customers:'yuca_customers',reservations:'yuca_reservations',visits:'yuca_visits',kindergarten:'yuca_kindergarten',hotel:'yuca_hotel',employees:'yuca_employees',products:'yuca_products',logs:'yuca_product_logs',messages:'yuca_messages'};
export function load(key,fallback=[]){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){return fallback}}
export function save(key,data){localStorage.setItem(key,JSON.stringify(data))}
export function getDBStats(){const s={};for(const k in KEYS){s[k]=load(KEYS[k]).length}return s}
