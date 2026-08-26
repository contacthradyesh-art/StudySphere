'use client';
import { Network } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function KnowledgeGraph(){return <AdvancedModulePage config={{title:'Knowledge Graph',description:'Static syllabus, current affairs, PYQ, notes और answer writing को आपस में जोड़कर integrated preparation करें।',icon:Network,focus:['कनेक्शन','Syllabus','Value-add'],actions:['Link बनाएं','विषय मैप','Revision Graph'],prompts:['एक current-affairs issue को दो static syllabus concepts और एक PYQ से जोड़िए।','किसी policy issue को संविधान, अर्थव्यवस्था, समाज और शासन के dimensions में map कीजिए।','GS answer को enrich करने वाले तीन examples या case studies पहचानिए।','Topic chain बनाइए: concept → current issue → PYQ → revision note।']}}/>}
