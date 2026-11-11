import {useBlocker} from 'react-router-dom';
import {navigationState} from './pendingNavigation';
import EditorSheet from '../toolkit/EditorSheet';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
/** A single router blocker covers links, imperative navigation and browser Back. */
export default function NavigationGuard(){
 const blocker=useBlocker(({currentLocation,nextLocation})=>navigationState.blocks(currentLocation,nextLocation));
 return <EditorSheet open={blocker.state==='blocked'} title="Tu trabajo sigue aquí." onClose={()=>{if(blocker.state==='blocked')blocker.reset();}}>
  <p>Hay cambios sin guardar. Puedes seguir editando y guardarlos antes de salir.</p>
  <ButtonPrimary onClick={()=>{if(blocker.state==='blocked')blocker.reset();}}>Seguir editando</ButtonPrimary>
  <ButtonSecondary onClick={()=>{if(blocker.state==='blocked')blocker.proceed();}}>Salir sin guardar</ButtonSecondary>
 </EditorSheet>;
}
