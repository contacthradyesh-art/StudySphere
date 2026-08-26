'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Play, Search, Sparkles, Target, Bookmark, Brain } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';

export type MissionModuleConfig = {
  title: string;
  description: string;
  icon: React.ElementType;
  accent?: string;
  focus: string[];
  actions: string[];
  prompts: string[];
};

const HINDI: Record<string, { title: string; description: string; actions: string[]; prompts: string[] }> = {
  'Daily Answer Writing': { title: 'दैनिक उत्तर लेखन', description: 'UPSC Mains के लिए हिंदी में रोज़ उत्तर लिखें, संरचना सुधारें और परीक्षा-उपयोगी उदाहरण जोड़ें।', actions: ['आज का 10 अंक प्रश्न', '15 अंक का अभ्यास', 'स्व-मूल्यांकन'], prompts: ['सामाजिक पूंजी भारतीय लोकतंत्र को मजबूत करने में किस प्रकार सहायक है? उदाहरण सहित चर्चा कीजिए।','कल्याणकारी योजनाओं के प्रभावी क्रियान्वयन में सहकारी संघवाद की भूमिका का परीक्षण कीजिए।','भारत के लिए कृत्रिम बुद्धिमत्ता के अवसरों और जोखिमों का आलोचनात्मक विश्लेषण कीजिए।','नैतिक शासन के लिए संस्थागत क्षमता के साथ व्यक्तिगत सत्यनिष्ठा भी आवश्यक है। चर्चा कीजिए।'] },
  'Essay Lab': { title: 'निबंध प्रयोगशाला', description: 'दार्शनिक, सामाजिक, आर्थिक और समसामयिक विषयों पर UPSC शैली में निबंध की सोच और संरचना विकसित करें।', actions: ['आज का विषय', 'रूपरेखा बनाएं', 'निबंध जाँचें'], prompts: ['तकनीक मानवता की सेवा का साधन है, उसका विकल्प नहीं।','विकास की वास्तविक कसौटी अवसरों की समानता है।','लोकतंत्र केवल संस्थाओं का नहीं, नागरिक संस्कृति का भी नाम है।','जलवायु न्याय के बिना सतत विकास अधूरा है।'] },
  'PYQ Explorer': { title: 'PYQ एक्सप्लोरर', description: 'पिछले वर्षों के प्रश्नों को विषय, GS पेपर, निर्देशात्मक शब्द और syllabus-link के आधार पर समझें।', actions: ['विषय खोजें', 'ट्रेंड देखें', 'प्रश्न हल करें'], prompts: ['संविधान की मूल संरचना और न्यायिक समीक्षा — PYQ विश्लेषण','सहकारी संघवाद और वित्त आयोग — PYQ विश्लेषण','जलवायु परिवर्तन और भारत की नीतियाँ — PYQ विश्लेषण','कृषि विपणन एवं खाद्य सुरक्षा — PYQ विश्लेषण'] },
  'Prelims Test Engine': { title: 'प्रीलिम्स टेस्ट इंजन', description: 'हिंदी में समयबद्ध MCQ अभ्यास, विकल्प-उन्मूलन, accuracy और गलतियों की समीक्षा।', actions: ['10 प्रश्न क्विज़', '25 प्रश्न टेस्ट', 'गलतियाँ दोहराएँ'], prompts: ['संविधान की मूल विशेषताएँ','मौद्रिक नीति और मुद्रास्फीति','जैव विविधता एवं संरक्षित क्षेत्र','भारत की नदियाँ और जल संसाधन'] },
  'Revision Engine': { title: 'स्मार्ट रिवीजन इंजन', description: 'कमजोर topics को प्राथमिकता देकर active recall, spaced revision और quick tests से दोहराएँ।', actions: ['आज का रिवीजन', 'कमजोर विषय', 'Rapid Recall'], prompts: ['पोलिटी: मौलिक अधिकार और DPSP','अर्थव्यवस्था: राजकोषीय घाटा और मुद्रास्फीति','पर्यावरण: पारिस्थितिकी तंत्र और जैव विविधता','इतिहास: स्वतंत्रता आंदोलन की प्रमुख घटनाएँ'] },
  'Interview Room': { title: 'इंटरव्यू रूम', description: 'DAF, समसामयिक मुद्दों और situational questions पर हिंदी में structured mock interview करें।', actions: ['मॉक इंटरव्यू', 'DAF प्रश्न', 'Situation Round'], prompts: ['अपने गृह जिले की तीन प्रमुख विकास चुनौतियाँ बताइए।','आप किसी नीति से असहमत हों तो एक सिविल सेवक के रूप में क्या करेंगे?','किसी हालिया राष्ट्रीय मुद्दे पर आपका संतुलित मत क्या है?','आपकी सबसे बड़ी सीख और कमजोरी क्या है?'] },
  'Knowledge Graph': { title: 'ज्ञान ग्राफ', description: 'समसामयिक घटनाओं को static syllabus, PYQ, notes और answer-writing से जोड़कर पढ़ें।', actions: ['कनेक्शन खोजें', 'विषय मैप', 'Revision Trail'], prompts: ['AI नीति → डिजिटल शासन → मौलिक अधिकार → GS-II','हरित हाइड्रोजन → ऊर्जा सुरक्षा → जलवायु नीति → GS-III','जल सुरक्षा → मानसून → कृषि → आपदा प्रबंधन','संघवाद → वित्त आयोग → स्थानीय शासन'] },
  'Reports & Indices': { title: 'रिपोर्ट्स एवं सूचकांक', description: 'महत्वपूर्ण राष्ट्रीय-अंतरराष्ट्रीय रिपोर्टों के स्रोत, संकेतक, भारत की स्थिति और UPSC उपयोग समझें।', actions: ['आज की रिपोर्ट', 'भारत प्रोफाइल', 'MCQ अभ्यास'], prompts: ['मानव विकास और सामाजिक संकेतक','वैश्विक जलवायु एवं ऊर्जा रिपोर्ट','भूख, पोषण और खाद्य सुरक्षा संकेतक','विश्व बैंक और IMF के प्रमुख आर्थिक संकेतक'] },
  'PRS Hub': { title: 'PRS विधायी हब', description: 'विधेयक, संसद, कानून और नीति बदलाव को सरल हिंदी में समझें और GS-II से जोड़ें।', actions: ['नया विधेयक', 'कानून समझें', 'Mains Angle'], prompts: ['विधायी प्रक्रिया और संसदीय समितियाँ','न्यायपालिका और विधायी समीक्षा','सामाजिक क्षेत्र के कानून और अधिकार','संघ-राज्य संबंधों पर विधायी प्रभाव'] },
  'PIB Hub': { title: 'PIB सरकारी सूचना हब', description: 'सरकारी घोषणाओं को केवल headline की तरह नहीं, बल्कि योजना, उद्देश्य, लाभार्थी और UPSC angle के साथ पढ़ें।', actions: ['आज की PIB', 'योजना खोजें', 'Exam Angle'], prompts: ['नई सरकारी योजना का उद्देश्य और लक्षित लाभार्थी','विज्ञान एवं तकनीक में सरकारी मिशन','कृषि और ग्रामीण विकास की नई पहल','ऊर्जा संक्रमण और हरित अर्थव्यवस्था'] }
};

export function AdvancedModulePage({ config }: { config: MissionModuleConfig }) {
  const Icon = config.icon;
  const local = HINDI[config.title];
  const title = local?.title ?? config.title;
  const description = local?.description ?? config.description;
  const actions = local?.actions ?? config.actions;
  const prompts = local?.prompts ?? config.prompts;
  const [query, setQuery] = useState('');
  const [done, setDone] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<'practice' | 'ai'>('practice');
  const items = useMemo(() => prompts.filter((x) => x.toLowerCase().includes(query.toLowerCase())), [prompts, query]);
  function toggle(setter: React.Dispatch<React.SetStateAction<Set<number>>>, i: number) { setter((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; }); }

  return (
    <div className="space-y-5 animate-fade-in">
      <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.10] via-white/[0.03] to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Mission IAS · हिंदी Advanced Lab</p><h1 className="mt-1 text-2xl font-bold">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm"><span className="text-muted-foreground">प्रगति</span><div className="mt-1 text-xl font-bold">{done.size}/{items.length}</div></div>
        </div>
      </GlassCard>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.slice(0, 3).map((action, i) => <button key={action} onClick={() => setActive(i)} className={`rounded-2xl border p-4 text-left transition ${active === i ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}><div className="flex items-center gap-2 font-semibold"><Play className="h-4 w-4 text-primary" />{action}</div><p className="mt-1 text-xs text-muted-foreground">परीक्षा-केंद्रित अभ्यास</p></button>)}
      </div>
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="विषय, प्रश्न या अवधारणा खोजें..." className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/40" /></div><button onClick={() => setMode(mode === 'practice' ? 'ai' : 'practice')} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary"><Brain className="h-4 w-4" />{mode === 'practice' ? 'AI अभ्यास' : 'सामान्य अभ्यास'}</button><div className="rounded-xl border border-white/10 px-3 py-2 text-xs text-muted-foreground">{items.length} अभ्यास आइटम</div></div>
      </GlassCard>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((prompt, i) => <GlassCard key={prompt} className="p-5"><div className="flex gap-3"><div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary"><Target className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-primary">{config.focus[i % config.focus.length]}</p><h2 className="mt-1 font-semibold leading-snug">{prompt}</h2><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={done.has(i) ? 'default' : 'default'} onClick={() => toggle(setDone, i)}><CheckCircle2 className="h-3.5 w-3.5" />{done.has(i) ? 'पूर्ण' : 'पूरा करें'}</Button><button onClick={() => toggle(setSaved, i)} className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs ${saved.has(i) ? 'text-primary' : 'text-muted-foreground'}`}><Bookmark className="h-3.5 w-3.5" />{saved.has(i) ? 'सहेजा गया' : 'सहेजें'}</button><span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />10–20 मिनट</span></div></div></div></GlassCard>)}
      </div>
      <GlassCard className="border-primary/15 bg-primary/[0.04] p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-semibold">UPSC परीक्षा बुद्धिमत्ता</p><p className="mt-1 text-sm text-muted-foreground">पढ़ें → अभ्यास करें → उत्तर लिखें → गलतियाँ देखें → दोहराएँ। यही closed-loop preparation इस lab का core है।</p></div></div></GlassCard>
    </div>
  );
}
