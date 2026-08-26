'use client';
import { ListChecks } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function PrelimsTestEngine(){return <AdvancedModulePage config={{title:'Prelims Test Engine',description:'समयबद्ध MCQ, accuracy, negative marking, विकल्प-उन्मूलन और topic diagnostics के साथ हिंदी अभ्यास।',icon:ListChecks,focus:['MCQ','Accuracy','उन्मूलन'],actions:['10 प्रश्न टेस्ट','विषय अभ्यास','गलतियों की समीक्षा'],prompts:['सही कथन चुनिए और explanation देखने से पहले विकल्प-उन्मूलन कीजिए।','दो-कथन वाले प्रश्न में हर विकल्प सही या गलत क्यों है, दर्ज कीजिए।','Error log बनाइए: concept gap, factual gap, प्रश्न गलत पढ़ना या risky guess।','Mock के बाद सबसे कमजोर topic पहचानकर targeted revision block बनाइए।']}}/>}
