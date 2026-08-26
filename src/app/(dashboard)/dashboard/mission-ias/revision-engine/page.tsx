'use client';
import { Repeat } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function RevisionEngine(){return <AdvancedModulePage config={{title:'Revision Engine',description:'Active recall, spaced revision, कमजोर topics और exam-ready rapid revision के लिए हिंदी workspace।',icon:Repeat,focus:['Recall','कमजोर क्षेत्र','Retention'],actions:['आज का रिवीजन','कमजोर विषय','Rapid Revision'],prompts:['किसी topic के पाँच तथ्य बिना notes देखे याद कीजिए, फिर छूटे हुए बिंदु जाँचिए।','कठिन concept को एक मिनट के revision card में बदलिए।','तीन कमजोर topics चुनकर अगली revision date तय कीजिए।','Error log से अंतिम सप्ताह की rapid revision checklist बनाइए।']}}/>}
