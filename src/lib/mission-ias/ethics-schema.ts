export interface EthicsConcept {
  id: string;
  term: string;
  definition: string;
  /** Why/where this shows up in UPSC GS4 (Section A: theory) answers. */
  examRelevance: string;
}

export const ETHICS_CONCEPTS: EthicsConcept[] = [
  {
    id: 'ethics',
    term: 'Ethics',
    definition: 'The branch of philosophy dealing with what is morally right and wrong, and the principles that ought to govern human conduct.',
    examRelevance: 'Foundational definition question; distinguish from law (law is enforced externally, ethics is largely self-governed) and from morality (personal) vs ethics (often used for professional/systemic codes).'
  },
  {
    id: 'integrity',
    term: 'Integrity',
    definition: 'Soundness of moral character — consistently acting according to one\u2019s values even when no one is watching or when it is costly to do so.',
    examRelevance: 'A core "foundational value" for civil servants (2nd ARC report). Often asked to distinguish from "honesty" \u2014 honesty is about truth-telling; integrity is broader, about wholeness of character.'
  },
  {
    id: 'probity',
    term: 'Probity in Governance',
    definition: 'Adherence to the highest standards of honesty, transparency and accountability in public administration and use of public resources.',
    examRelevance: 'A recurring GS4 keyword. Linked to concepts like RTI, Citizen\u2019s Charter, e-governance, and the Nolan Committee\u2019s Seven Principles of Public Life (selflessness, integrity, objectivity, accountability, openness, honesty, leadership).'
  },
  {
    id: 'aptitude',
    term: 'Aptitude',
    definition: 'An inherent or acquired capacity/tendency to respond positively toward a particular task, situation, or set of values \u2014 e.g. aptitude for public service.',
    examRelevance: 'Distinguished from "attitude" (aptitude = capacity/tendency; attitude = a settled way of thinking, often with an evaluative/emotional component) \u2014 a classic GS4 differentiation question.'
  },
  {
    id: 'attitude',
    term: 'Attitude',
    definition: 'A settled way of thinking or feeling about someone/something, typically reflected in behavior; has cognitive, affective and behavioral components.',
    examRelevance: 'Civil servants are expected to have a "positive attitude" toward citizens and constitutional values. Attitude change (persuasion, role of media/peer group) is a common GS4 sub-topic.'
  },
  {
    id: 'emotional-intelligence',
    term: 'Emotional Intelligence (EI)',
    definition: 'The capacity to recognize, understand and manage one\u2019s own emotions, and to recognize, understand and influence the emotions of others.',
    examRelevance: 'Daniel Goleman\u2019s 5 components \u2014 self-awareness, self-regulation, motivation, empathy, social skill \u2014 are frequently tested. High EI is linked to better decision-making, conflict resolution and stakeholder management in administration.'
  },
  {
    id: 'foundational-values',
    term: 'Foundational Values of Civil Service',
    definition: 'The core values expected of public servants: integrity, impartiality, non-partisanship, objectivity, dedication to public service, empathy, tolerance and compassion toward the weaker sections.',
    examRelevance: 'Drawn directly from the 2nd Administrative Reforms Commission (ARC) report "Ethics in Governance" \u2014 a very frequently cited source in GS4 answers.'
  },
  {
    id: 'accountability',
    term: 'Accountability',
    definition: 'The obligation of an individual or organization to account for its activities, accept responsibility, and disclose results transparently.',
    examRelevance: 'Linked to democratic governance; mechanisms include CAG audits, parliamentary committees, RTI, social audits, and citizen charters.'
  },
  {
    id: 'transparency',
    term: 'Transparency',
    definition: 'Openness in decision-making and governance processes, allowing citizens to access information about how and why decisions are made.',
    examRelevance: 'Central to the Right to Information Act, 2005. Often paired with accountability as "twin pillars" of good governance in answers.'
  },
  {
    id: 'objectivity',
    term: 'Objectivity',
    definition: 'Basing professional decisions and advice on rigorous, evidence-based analysis, uninfluenced by personal feelings, prejudices or external pressure.',
    examRelevance: 'One of the Nolan Committee\u2019s Seven Principles of Public Life; frequently tested alongside "impartiality" and "non-partisanship" as related-but-distinct terms.'
  },
  {
    id: 'impartiality-nonpartisanship',
    term: 'Impartiality vs Non-partisanship',
    definition: 'Impartiality = treating all individuals/cases fairly without bias, on merit alone. Non-partisanship = not favoring any political party or ideology while executing duties.',
    examRelevance: 'A classic "distinguish between" question \u2014 impartiality is about fairness to individuals; non-partisanship is specifically about political neutrality.'
  },
  {
    id: 'corruption',
    term: 'Corruption',
    definition: 'The abuse of entrusted power or position for private gain, at the cost of public interest \u2014 can be monetary (bribery) or non-monetary (nepotism, favoritism).',
    examRelevance: 'Case studies frequently involve corruption dilemmas. Know the Prevention of Corruption Act, 1988 (amended 2018) and the distinction between "collusive" and "coercive" corruption.'
  },
  {
    id: 'whistleblowing',
    term: 'Whistleblowing',
    definition: 'The act of an insider (employee/official) disclosing wrongdoing, corruption or malpractice within an organization, often at personal risk.',
    examRelevance: 'Linked to the Whistle Blowers Protection Act, 2014. A common case-study theme: weighing loyalty to the organization against the larger public interest.'
  },
  {
    id: 'code-of-ethics-vs-conduct',
    term: 'Code of Ethics vs Code of Conduct',
    definition: 'A Code of Ethics states broad, aspirational values/principles (why to act rightly). A Code of Conduct lists specific, enforceable dos-and-don\u2019ts (what exactly to do/not do), often with penalties for violation.',
    examRelevance: 'A frequent "distinguish between" question. Example: "public servants shall act with integrity" is a code-of-ethics statement; "a public servant shall not accept gifts above Rs. X" is a code-of-conduct rule.'
  },
  {
    id: 'conscience',
    term: 'Conscience',
    definition: 'An individual\u2019s inner sense of right and wrong that guides moral judgment and behavior, often described as an internal moral compass.',
    examRelevance: 'Discussed in the context of "conscience keeper" essay-type answers and in dilemmas where personal conscience conflicts with organizational orders or the law.'
  },
  {
    id: 'emotional-quotient-vs-iq',
    term: 'Emotional Quotient (EQ) vs Intelligence Quotient (IQ)',
    definition: 'IQ measures cognitive/analytical ability (logic, reasoning, problem-solving). EQ measures the ability to perceive, understand and manage emotions \u2014 one\u2019s own and others\u2019.',
    examRelevance: 'A common argument in GS4 answers: high IQ alone does not guarantee ethical, empathetic administration \u2014 EQ is equally or more important for a civil servant\u2019s people-facing role.'
  }
];

export interface Thinker {
  id: string;
  name: string;
  era: string;
  /** 2-3 sentence summary of their core ethical theory/contribution. */
  coreIdea: string;
  /** A short (<15 word) quote attributable to them, safe to reproduce verbatim. */
  quote: string;
  examRelevance: string;
}

export const THINKERS: Thinker[] = [
  {
    id: 'kant',
    name: 'Immanuel Kant',
    era: '18th century, German philosopher',
    coreIdea: 'Founder of deontological ethics \u2014 the morality of an action depends on whether it follows a universal duty/rule ("Categorical Imperative"), not on its consequences. An action is right only if you could will it to become a universal law.',
    quote: 'Act only according to that maxim whereby you can will it to become a universal law.',
    examRelevance: 'Deontology vs Consequentialism (Utilitarianism) is one of the most-asked theory contrasts in GS4. Kant represents the "duty-based" side.'
  },
  {
    id: 'aristotle',
    name: 'Aristotle',
    era: '4th century BCE, Greek philosopher',
    coreIdea: 'Founder of Virtue Ethics \u2014 morality is about cultivating good character traits (virtues like courage, temperance, justice) through habit, aiming for "eudaimonia" (human flourishing), found at the "golden mean" between excess and deficiency.',
    quote: 'We are what we repeatedly do. Excellence, then, is not an act but a habit.',
    examRelevance: 'Virtue ethics is the third major theory (with deontology and utilitarianism) \u2014 useful for "character-based" answers to case studies about a civil servant\u2019s habits and disposition.'
  },
  {
    id: 'bentham-mill',
    name: 'Jeremy Bentham & John Stuart Mill',
    era: '18th\u201319th century, British philosophers',
    coreIdea: 'Founders of Utilitarianism \u2014 an action is right if it produces "the greatest good for the greatest number." Bentham focused on quantity of pleasure/pain; Mill refined it to include quality of happiness.',
    quote: 'The greatest happiness of the greatest number is the foundation of morals.',
    examRelevance: 'Utilitarian reasoning is very commonly used to justify a chosen "course of action" in GS4 case studies \u2014 but examiners also expect you to note its limitations (can justify sacrificing a minority\u2019s rights).'
  },
  {
    id: 'gandhi',
    name: 'Mahatma Gandhi',
    era: '20th century, India',
    coreIdea: 'Emphasized truth (Satya) and non-violence (Ahimsa) as supreme ethical principles; proposed the "Trusteeship" theory (the wealthy hold resources in trust for society) and gave the "Talisman" as a practical test for any decision\u2019s ethics.',
    quote: 'Recall the face of the poorest and weakest man and ask if your act will help him.',
    examRelevance: 'Gandhi\u2019s Talisman is one of the most frequently quoted/applied tools in GS4 answers for evaluating a course of action\u2019s impact on the most vulnerable.'
  },
  {
    id: 'kautilya',
    name: 'Kautilya (Chanakya)',
    era: '4th century BCE, India',
    coreIdea: 'Author of the Arthashastra; laid out "Rajdharma" (duty of the ruler/state) \u2014 the king\u2019s happiness lies in the happiness of subjects, and the state exists for the welfare (yogakshema) of its people, with strict codes against corruption in office.',
    quote: 'In the happiness of his subjects lies the king\u2019s happiness.',
    examRelevance: 'Useful as an Indian/administrative-ethics source distinct from Western theory \u2014 shows historical Indian thought on public-service accountability and anti-corruption.'
  },
  {
    id: 'confucius',
    name: 'Confucius',
    era: '6th\u20135th century BCE, China',
    coreIdea: 'Emphasized "Ren" (benevolence/humaneness) and the reciprocity-based Golden Rule, along with social harmony achieved through virtuous, self-cultivated leaders who lead by moral example rather than force.',
    quote: 'Do not do to others what you do not want done to yourself.',
    examRelevance: 'Confucian ethics is often invoked for questions on leadership-by-example and the ethical responsibility of those in authority.'
  },
  {
    id: 'rawls',
    name: 'John Rawls',
    era: '20th century, American philosopher',
    coreIdea: 'Proposed "Justice as Fairness" \u2014 principles of justice should be chosen from behind a hypothetical "veil of ignorance" (not knowing your own position in society), which would lead rational people to favor equal basic liberties and arrangements that most benefit the worst-off (the "difference principle").',
    quote: 'Justice is the first virtue of social institutions.',
    examRelevance: 'Rawls\u2019s "veil of ignorance" is a powerful tool for GS4 case studies about resource allocation and policy fairness across unequal groups.'
  },
  {
    id: 'socrates',
    name: 'Socrates',
    era: '5th century BCE, Greek philosopher',
    coreIdea: 'Held that virtue is knowledge \u2014 people do wrong only out of ignorance of what is truly good, so ethical behavior follows from genuine self-examination and reasoned inquiry ("the unexamined life is not worth living").',
    quote: 'The unexamined life is not worth living.',
    examRelevance: 'Useful for essay-type answers on self-reflection, conscience, and the role of continuous ethical inquiry in a civil servant\u2019s life.'
  },
  {
    id: 'vivekananda',
    name: 'Swami Vivekananda',
    era: '19th\u201320th century, India',
    coreIdea: 'Emphasized service to humanity as service to the divine ("Daridra Narayana" \u2014 seeing God in the poor), moral strength through self-confidence, and character-building as the true aim of education.',
    quote: 'They alone live who live for others.',
    examRelevance: 'Frequently used to frame answers on selfless public service, empathy for the underprivileged, and the ethical purpose of a civil servant\u2019s work.'
  },
  {
    id: 'sen',
    name: 'Amartya Sen',
    era: '20th\u201321st century, Indian economist-philosopher',
    coreIdea: 'Developed the "Capability Approach" \u2014 development and justice should be judged not just by income/resources but by people\u2019s actual freedom and capability to live the life they value.',
    quote: 'Development can be seen as a process of expanding the real freedoms that people enjoy.',
    examRelevance: 'Useful for GS4 answers connecting ethics to development administration \u2014 evaluating policies by real outcomes for people\u2019s freedoms, not just budget spent.'
  }
];

export const CASE_STUDY_SESSIONS_COLLECTION = 'ethicsCaseStudySessions';

export interface CaseStudy {
  scenario: string;
  questions: string[];
}

export interface CaseStudyFeedback {
  score: number; // out of 100, mapped from a typical 15/20-mark GS4 question
  ethicalIssuesIdentified: string[];
  optionsEvaluated: string[];
  strengths: string[];
  improvements: string[];
  modelApproach: string;
}

export interface CaseStudySession {
  id: string;
  scenario: string;
  questions: string[];
  answer: string;
  feedback: CaseStudyFeedback;
  createdAt: number;
}
