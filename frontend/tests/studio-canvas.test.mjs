import test from 'node:test';
import assert from 'node:assert/strict';
import {adaptCanvas,ideaWords,canvasCaption,ideaDesignSuggestion} from '../src/studio/canvasModel.ts';
import {parseCreative} from '../../supabase/functions/toolkit-ai/creative.ts';
test('changing ratio keeps the same piece, source, photo and editable words without mutation',()=>{
 const draft={id:'same-piece',format:'portrait',title:'Una pausa',subtitle:'Para escuchar',cta:'Conversemos',imagePath:'owner/project/photo.png',creative:{sourceKey:'idea',intent:'conversation'}};
 const original=JSON.stringify(draft);
 for(const format of ['post','portrait','story']){const next=adaptCanvas(draft,format);assert.equal(next.id,draft.id);assert.equal(next.format,format);assert.equal(next.creative,draft.creative);assert.equal(next.imagePath,draft.imagePath);assert.equal(canvasCaption(next),'Una pausa\n\nPara escuchar\n\nConversemos');}
 assert.equal(JSON.stringify(draft),original);
});
test('a validated AI layout becomes editable canvas copy and uses only supported layouts',()=>{
 const response={title:'Vuelve el brownie',text:'Disponible este viernes.',cta:'Visítanos',templateId:'mint'};
 assert.deepEqual(ideaDesignSuggestion(parseCreative(response,'layout')),{title:response.title,body:response.text,cta:response.cta,layout:'split'});
 assert.equal(ideaDesignSuggestion({...response,templateId:'violet'}).layout,'poster');
 assert.equal(ideaDesignSuggestion({...response,templateId:'pearl'}).layout,'editorial');
 assert.throws(()=>ideaDesignSuggestion({...response,templateId:'other'}));
});
test('a free idea splits on its first line without losing long title overflow or inventing copy',()=>{
 assert.deepEqual(ideaWords(' Mi idea\n\nCon mis palabras '),{title:'Mi idea',body:'Con mis palabras'});
 const text='a'.repeat(180)+'\nTexto';const words=ideaWords(text);assert.equal(words.title.length,160);assert.equal(words.body,'a'.repeat(20)+'\nTexto');assert.throws(()=>ideaWords('  '));
});
