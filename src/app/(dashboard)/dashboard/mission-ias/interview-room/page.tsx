'use client';
import { Mic } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function InterviewRoom(){return <AdvancedModulePage config={{title:'Interview Room',description:'Personality-test practice for DAF themes, situational judgement, opinion questions and concise communication.',icon:Mic,focus:['DAF','Situational','Communication'],actions:['Mock interview','DAF drill','Rapid fire'],prompts:['Introduce yourself in 60 seconds with a clear, authentic narrative.','How would you respond when a senior asks you to ignore a rule for convenience?','Take a balanced position on a controversial policy without becoming evasive.','Turn one hobby or academic interest into five likely interview questions.']}}/>}
