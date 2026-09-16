export const KEYS={
    customers:'yuca_customers',
    reservations:'yuca_reservations',
    visits:'yuca_visits',
    kindergarten:'yuca_kindergarten',
    hotel:'yuca_hotel',
    employees:'yuca_employees',
    products:'yuca_products',
    logs:'yuca_product_logs',
    messages:'yuca_messages'
};
export function load(k,f=[]){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}}
export function save(k,d){localStorage.setItem(k,JSON.stringify(d))}
export function getDBStats(){const s={};for(const k in KEYS){s[k]=load(KEYS[k]).length}return s}
