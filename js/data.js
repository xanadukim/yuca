export const seedCustomers=[
{id:'C001',name:'김콩이',dog_name:'콩이',breed:'푸들',phone:'010-1234-5678',last_visit:'2026-09-10',total_visits:12,note:'피부 예민'},
{id:'C002',name:'이보리',dog_name:'보리',breed:'비숑',phone:'010-2345-6789',last_visit:'2026-09-12',total_visits:8,note:''},
{id:'C003',name:'박초코',dog_name:'초코',breed:'말티즈',phone:'010-3456-7890',last_visit:'2026-09-13',total_visits:15,note:'입질 있음'},
];
export const seedEmployees=[
{id:'E001',name:'김미용',role:'디자이너',phone:'010-1111-2222',salary:2500000,commute:[]},
{id:'E002',name:'이유치원',role:'유치원 교사',phone:'010-3333-4444',salary:2200000,commute:[]},
];
export const seedProducts=[
{id:'P001',name:'샴푸 프리미엄',stock:12,price:25000,category:'미용'},
{id:'P002',name:'발톱깎이',stock:3,price:18000,category:'도구'},
{id:'P003',name:'간식',stock:25,price:8000,category:'간식'},
];
export const rooms=['S01','S02','S03','M01','M02','L01','SUITE'];
export const smsTemplates=[
{id:'T01',name:'예약확정',text:'{고객명}님, {강아지명} {날짜} {시간} 미용 예약 확정되었습니다. YUCA'},
{id:'T02',name:'픽업완료',text:'{강아지명} 미용 완료! 픽업 가능합니다. YUCA'},
{id:'T03',name:'유치원 일지',text:'{강아지명} 오늘 기분 {기분}, 식사 {식사} 잘했어요!'},
{id:'T04',name:'호텔 안내',text:'{강아지명} 호텔 {객실} 입실 완료. 퇴실 {퇴실일}입니다.'},
];
