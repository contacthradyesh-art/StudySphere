'use client';
import { Repeat } from 'lucide-react';
import { AdvancedModulePage } from '@/components/mission-ias/advanced-module-page';
export default function RevisionEngine(){return <AdvancedModulePage config={{title:'Revision Engine',description:'Active-recall workspace for spaced revision, weak-topic recovery and last-mile exam readiness.',icon:Repeat,focus:['Recall','Weak areas','Retention'],actions:['Due today','Weak areas','Rapid revision'],prompts:['Recall five facts from a topic without notes, then check what you missed.','Convert a difficult concept into a one-minute revision card.','Choose three weak topics and assign the next revision date.','Create a final-week rapid revision checklist from your error log.']}}/>}
