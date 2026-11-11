import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyTourism } from '../src/modules/tourism/model.ts';
import { tourismSnapshot, parsePublishedTourism } from '../src/modules/tourism/tourismPublicationModel.ts';
function fixture() {
  const data = emptyTourism('Agencia de prueba');
  data.tours = [{id:'walk',name:'Caminata',description:'Centro histórico',price:35,durationMinutes:60,image:'',active:true,itinerary:[{id:'stop',title:'Plaza',description:'Inicio'}],meetingPoint:'Plaza',latitude:-12,longitude:-77}];
  return data;
}
test('tourism snapshots exclude bookings, guide contacts and unpublished tours', () => {
  const data=fixture();data.guides=[{id:'guide',name:'Guía',contact:'private@example.test',languages:'es'}];
  data.bookings=[{id:'booking',customer:'Persona privada',contact:'customer@example.test',departureId:'day',people:1,total:35,status:'confirmed'}];
  data.tours.push({...data.tours[0],id:'hidden',active:false,name:'No publicado'});
  data.tours[0].supplierCost=3;
  const snapshot=tourismSnapshot(data);
  assert.deepEqual(Object.keys(snapshot).sort(),['settings','tours','type','version']);
  assert.equal(snapshot.tours.length,1);assert.equal(snapshot.settings.timeZone,'America/Lima');
  for(const text of ['private@example.test','Persona privada','customer@example.test','No publicado','supplierCost'])assert.equal(JSON.stringify(snapshot).includes(text),false);
});
test('public tours reject invalid coordinates, prices, time zones and empty catalogs', () => {
  for(const mutate of [data=>data.tours[0].latitude=91,data=>data.tours[0].price=NaN,data=>data.settings.timeZone='unknown',data=>data.tours=[]]){
    const data=fixture();mutate(data);assert.throws(()=>tourismSnapshot(data));
  }
});
test('public tourism reader validates shape and duplicate identifiers', () => {
  const snapshot=tourismSnapshot(fixture());assert.deepEqual(parsePublishedTourism(snapshot),snapshot);
  for(const value of [null,{}, {...snapshot,version:2},{...snapshot,tours:[null]}])assert.equal(parsePublishedTourism(value),null);
  snapshot.tours.push(snapshot.tours[0]);assert.equal(parsePublishedTourism(snapshot),null);
});
