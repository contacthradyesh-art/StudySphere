'use client';
import { Landmark } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function PIBHub(){return <AdvancedModulePage config={{title:'PIB Hub',description:'Press Information Bureau reading room for government releases, schemes, ministries and exam-relevant facts.',icon:Landmark,focus:['GS-II','GS-III','Governance'],actions:['Today’s releases','Scheme tracker','Revision drill'],prompts:['Find the policy objective, ministry and target group of a recent government release.','Convert a PIB release into five Prelims facts and one Mains dimension.','Identify the constitutional, legal or institutional body mentioned in a government announcement.','Build a 60-second revision note from a government initiative.']}}/>}
