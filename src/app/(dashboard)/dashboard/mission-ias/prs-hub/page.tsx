'use client';
import { Scale } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function PRSHub(){return <AdvancedModulePage config={{title:'PRS Hub',description:'Policy and legislation lab for Bills, Acts, parliamentary changes and their UPSC implications.',icon:Scale,focus:['Polity','Governance','GS-II'],actions:['Bill brief','Policy drill','Revision'],prompts:['Summarise a Bill into problem, provision, institution and likely impact.','What constitutional provision or federal issue could arise from a proposed law?','Compare a new policy with the existing institutional framework.','Create three Prelims statements and one Mains question from a legislative development.']}}/>}
