import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyHospitality, saveRoom, removeRoom, saveBooking, changeBookingStatus, saveFinanceEntry, hospitalitySummary } from '../src/modules/hospitality/model.ts';
import { nightsBetween, addDays } from '../src/modules/dates.ts';
const room={id:'r',name:'Doble',type:'Doble',price:100,capacity:2,image:'',status:'clean',amenities:[]};
const booking={id:'b',roomId:'r',guest:'Ana',contact:'',guests:2,checkIn:'2026-09-28',checkOut:'2026-10-02',nightlyRate:100,total:0,status:'confirmed',notes:''};
const fixture=()=>saveRoom(emptyHospitality('Casa'),room);
test('date-only nights are independent of daylight savings and handle month/year boundaries',()=>{
 assert.equal(nightsBetween('2026-03-07','2026-03-09'),2);
 assert.equal(addDays('2026-12-31',1),'2027-01-01');
 assert.throws(()=>nightsBetween('2026-02-30','2026-03-02'));
 assert.throws(()=>nightsBetween('2026-09-28','2026-09-28'));
});
test('reservation calculates nights but never invents a received payment',()=>{
 const data=saveBooking(fixture(),booking); assert.equal(data.bookings[0].total,400); assert.equal(data.finances.length,0);
});
test('overlapping stays are blocked, including containment, while adjacent stays are allowed',()=>{
 const data=saveBooking(fixture(),booking);
 for(const [checkIn,checkOut] of [['2026-09-27','2026-10-03'],['2026-09-29','2026-09-30'],['2026-09-27','2026-09-29']])
 assert.throws(()=>saveBooking(data,{...booking,id:'new',checkIn,checkOut}),/ya tiene/);
 assert.equal(saveBooking(data,{...booking,id:'new',checkIn:'2026-10-02',checkOut:'2026-10-03'}).bookings.length,2);
});
test('cancelled reservations free availability without deleting history',()=>{
 const data=changeBookingStatus(saveBooking(fixture(),booking),'b','cancelled');
 assert.equal(saveBooking(data,{...booking,id:'new'}).bookings.length,2);
 assert.throws(()=>removeRoom(data,'r'),/historial/);
});
test('capacity, maintenance and invalid tariffs are rejected',()=>{
 assert.throws(()=>saveBooking(fixture(),{...booking,guests:3}),/capacidad/);
 assert.throws(()=>saveBooking(fixture(),{...booking,nightlyRate:-10}),/tarifa/);
 assert.throws(()=>saveBooking({...fixture(),rooms:[{...room,status:'maintenance'}]},booking),/mantenimiento/);
});
test('check-in requires clean room and checkout requests cleaning',()=>{
 const data=saveBooking(fixture(),booking);
 assert.throws(()=>changeBookingStatus({...data,rooms:[{...room,status:'dirty'}]},'b','checked-in'),/limpia/);
 const checkedOut=changeBookingStatus(changeBookingStatus(data,'b','checked-in'),'b','checked-out');
 assert.equal(checkedOut.rooms[0].status,'dirty');
 assert.throws(()=>changeBookingStatus(checkedOut,'b','confirmed'));
});
test('monthly finance includes only recorded payments and the requested month',()=>{
 let data=fixture();
 for(const entry of [{id:'1',type:'income',amount:400,date:'2026-09-28'},{id:'2',type:'expense',amount:50,date:'2026-09-29'},{id:'3',type:'income',amount:100,date:'2026-10-01'}]) data=saveFinanceEntry(data,{...entry,concept:'Registro'});
 assert.deepEqual(hospitalitySummary(data,'2026-09-30'),{occupied:0,available:1,income:400,expense:50,profit:350});
 assert.throws(()=>saveFinanceEntry(data,{id:'x',type:'income',amount:-1,date:'2026-09-30',concept:'Error'}));
});
