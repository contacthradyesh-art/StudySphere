'use client';
import { ListChecks } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function PYQExplorer(){return <AdvancedModulePage config={{title:'PYQ Explorer',description:'Decode UPSC previous-year questions by paper, topic, directive, difficulty and recurring themes.',icon:ListChecks,focus:['Trend','Directive','Topic'],actions:['PYQ drill','Trend map','Topic practice'],prompts:['Analyse a PYQ for directive, demand, syllabus link and expected structure.','Group five questions around one recurring GS theme.','Which words in the question change the answer approach?','Create a probable question from a recurring UPSC theme without copying past wording.']}}/>}
