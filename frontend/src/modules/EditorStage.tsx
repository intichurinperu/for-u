import {createContext,useContext} from 'react';
export const EditorStageContext=createContext<{stage:number;setStage:(stage:number)=>void}>({stage:1,setStage:()=>{}});
export const useEditorStage=()=>useContext(EditorStageContext);
