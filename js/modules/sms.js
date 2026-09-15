
import {load,save,KEYS} from '../storage.js';
import {smsTemplates} from '../data.js';
export function renderSMS(c){
  const logs=load(KEYS.messages);
  c.innerHTML=`
  <div class="header"><h2>💬 문자 발송</h2><button class="btn btn-orange" onclick="window.sendBulkSMS()">대량 발송</button></div>
  <div class="grid grid-2">
    <div class="card"><h3>템플릿 4종</h3><div style="margin-top:12px">${smsTemplates.map(t=>`<div style="border:1px solid #F3F4F6;border-radius:10px;padding:12px;margin-bottom:8px"><b>${t.name}</b><div style="font-size:13px;color:#6B7280;margin-top:4px">${t.text}</div><button class="btn btn-gray" style="margin-top:8px;padding:6px 12px;font-size:12px" onclick="window.useTemplate('${t.id}')">사용</button></div>`).join('')}</div></div>
    <div class="card"><h3>발송 기록 (${logs.length})</h3><div style="margin-top:12px;max-height:400px;overflow:auto"><table class="table"><thead><tr><th>시간</th><th>받는사람</th><th>내용</th></tr></thead><tbody>${logs.slice(-20).reverse().map(m=>`<tr><td style="font-size:11px">${m.time}</td><td style="font-size:12px">${m.to}</td><td style="font-size:12px;max-width:150px;overflow:hidden;text-overflow:ellipsis">${m.text.slice(0,20)}...</td></tr>`).join('') || '<tr><td colspan=3>발송 기록 없음</td></tr>'}</tbody></table></div></div>
  </div>`;
}
