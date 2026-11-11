import {useNavigate} from 'react-router-dom';
import {ProjectWizard} from '../experience/ProjectJourney';
export default function DopamineOnboarding(_props:{onComplete:(project:string)=>void}){const navigate=useNavigate();return <ProjectWizard startWithName onClose={()=>navigate('/')}/>;}
