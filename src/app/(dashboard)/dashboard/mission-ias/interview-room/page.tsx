'use client';
import { Mic } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function InterviewRoom(){return <AdvancedModulePage config={{title:'Interview Room',description:'DAF, situational judgement, opinion questions और स्पष्ट संचार का हिंदी mock-interview अभ्यास।',icon:Mic,focus:['DAF','स्थिति-आधारित','संचार'],actions:['मॉक इंटरव्यू','DAF अभ्यास','Rapid Fire'],prompts:['60 सेकंड में अपना परिचय स्पष्ट और स्वाभाविक तरीके से दीजिए।','यदि वरिष्ठ अधिकारी सुविधा के लिए नियम की अनदेखी करने को कहें तो आप क्या करेंगे?','किसी विवादित नीति पर संतुलित मत रखिए, बिना evasive हुए।','अपने hobby या academic interest से पाँच संभावित interview questions बनाइए।']}}/>}
