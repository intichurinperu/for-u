import test from 'node:test';import assert from 'node:assert/strict';
import { emptyTourism, saveTour, saveGuide, saveDeparture, reserveTour, cancelTourBooking, bookedSeats } from '../src/modules/tourism/model.ts';
const tour={id:'t',name:'Tour',description:'',price:30,durationMinutes:120,image:'',active:true,itinerary:[],meetingPoint:'Plaza',latitude:-12,longitude:-77};
const departure={id:'d',tourId:'t',guideId:'g',date:'2026-10-01',time:'09:00',capacity:3};
const booking={id:'b',departureId:'d',customer:'Ana',contact:'correo',people:2};
function fixture(){return saveDeparture(saveGuide(saveTour(emptyTourism('Agencia'),tour),{id:'g',name:'Guía',contact:'',languages:'Español'}),departure);}
test('guide cannot be assigned to overlapping tours but adjacent departures are valid',()=>{
 assert.throws(()=>saveDeparture(fixture(),{...departure,id:'d2',time:'10:00'}),/horario/);
 assert.equal(saveDeparture(fixture(),{...departure,id:'d2',time:'11:00'}).departures.length,2);
});
test('booking capacity includes all active reservations and confirmation is idempotent',()=>{
 const data=reserveTour(fixture(),booking);assert.equal(bookedSeats(data,'d'),2);assert.equal(data.bookings[0].total,60);
 assert.equal(reserveTour(data,booking),data);assert.throws(()=>reserveTour(data,{...booking,id:'b2'}),/plazas/);
 assert.throws(()=>saveDeparture(data,{...departure,capacity:1}),/capacidad/);
});
test('cancellation frees seats and dates of existing bookings are protected',()=>{
 const data=reserveTour(fixture(),booking);assert.throws(()=>saveDeparture(data,{...departure,date:'2026-10-02'}),/reservas/);
 assert.equal(bookedSeats(cancelTourBooking(data,'b'),'d'),0);
});
test('changing tour duration cannot introduce guide conflicts',()=>{
 const data=saveDeparture(fixture(),{...departure,id:'d2',time:'11:00'});
 assert.throws(()=>saveTour(data,{...tour,durationMinutes:180}),/horario/);
});
