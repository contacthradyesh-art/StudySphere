'use client';
import { ListChecks } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function PYQExplorer(){return <AdvancedModulePage config={{title:'PYQ Explorer',description:'UPSC के पिछले वर्षों के प्रश्नों को पेपर, विषय, directive, कठिनाई और recurring themes से समझें।',icon:ListChecks,focus:['ट्रेंड','Directive','विषय'],actions:['PYQ अभ्यास','ट्रेंड मैप','विषय अभ्यास'],prompts:['किसी PYQ में directive, demand, syllabus-link और अपेक्षित structure पहचानिए।','एक recurring GS theme से पाँच प्रश्नों को समूहित कीजिए।','प्रश्न में कौन-से शब्द उत्तर लिखने का तरीका बदल देते हैं?','किसी recurring UPSC theme से नया संभावित प्रश्न बनाइए, पुराने प्रश्न की भाषा copy किए बिना।']}}/>}
