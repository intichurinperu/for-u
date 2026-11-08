import {useCallback,useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
/** Navigate only after successful writes are reflected by the clean-work guard. */
export function useSavedNavigation(ready:boolean){
 const navigate=useNavigate(),[destination,setDestination]=useState<{path:string;state?:unknown}|null>(null);
 useEffect(()=>{if(destination&&ready){setDestination(null);navigate(destination.path,{state:destination.state});}},[destination,ready,navigate]);
 return useCallback((path:string,state?:unknown)=>setDestination({path,state}),[]);
}
