'use client';
import { Landmark } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function PIBHub(){return <AdvancedModulePage config={{title:'PIB Hub',description:'सरकारी घोषणाओं, योजनाओं, मंत्रालयों और परीक्षा-उपयोगी तथ्यों को सरल हिंदी में समझें।',icon:Landmark,focus:['GS-II','GS-III','शासन'],actions:['आज की PIB','योजना खोजें','Exam Angle'],prompts:['किसी सरकारी घोषणा का उद्देश्य, मंत्रालय और लक्षित समूह पहचानिए।','PIB समाचार से पाँच Prelims तथ्य और एक Mains आयाम तैयार कीजिए।','सरकारी घोषणा में उल्लिखित संवैधानिक, कानूनी या संस्थागत निकाय पहचानिए।','किसी सरकारी पहल का 60-सेकंड रिवीजन नोट बनाइए।']}}/>}
