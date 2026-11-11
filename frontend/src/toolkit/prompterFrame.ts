export type RecordingRatio='square'|'portrait'|'vertical';
export const recordingFrames={square:{width:720,height:720,label:'1:1'},portrait:{width:720,height:900,label:'4:5'},vertical:{width:720,height:1280,label:'9:16'}} as const;
/** The preview and output use the same cover crop, with a movable horizontal focus. */
export function recordingCrop(sourceWidth:number,sourceHeight:number,targetWidth:number,targetHeight:number,focus=.5){
 if(![sourceWidth,sourceHeight,targetWidth,targetHeight].every(value=>Number.isFinite(value)&&value>0))throw new Error('Espera a que la cámara esté lista.');
 const scale=Math.max(targetWidth/sourceWidth,targetHeight/sourceHeight),width=targetWidth/scale,height=targetHeight/scale;
 return {x:(sourceWidth-width)*Math.max(0,Math.min(1,focus)),y:(sourceHeight-height)/2,width,height};
}
