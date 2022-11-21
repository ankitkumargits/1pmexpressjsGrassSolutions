const inDate1 = new Date('09/28/2022')
const outDate2 = new Date('09/29/2022')

let finalDate = (outDate2 - inDate1)/(1000*60*60*24);
console.log(finalDate);

let date = new Date().toLocaleDateString()
console.log(date);

let time1 = new Date().toLocaleTimeString()
let time2 = new Date().getHours()
console.log(time1);
console.log(time2);