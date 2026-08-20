export type PsychologyCategory =
  | 'Motivation & Goals'
  | 'Habits & Behavior'
  | 'Mindset & Beliefs'
  | 'Emotional Wellbeing'
  | 'Decision-Making & Biases';

export const PSYCHOLOGY_CATEGORIES: PsychologyCategory[] = [
  'Motivation & Goals',
  'Habits & Behavior',
  'Mindset & Beliefs',
  'Emotional Wellbeing',
  'Decision-Making & Biases'
];

export interface PsychologyTheory {
  id: string;
  name: string;
  hindiName: string;
  category: PsychologyCategory;
  originator: string;
  /** 2-4 sentence explanation of the theory itself. */
  coreIdea: string;
  hindiCoreIdea: string;
  /** A concrete, actionable way to apply this theory in daily life/study routine. */
  howToApply: string;
  hindiHowToApply: string;
}

export const PSYCHOLOGY_THEORIES: PsychologyTheory[] = [
  // ---------------------------------------------------------------- Motivation & Goals
  {
    id: 'maslow-hierarchy',
    name: 'Maslow\u2019s Hierarchy of Needs',
    hindiName: '\u092e\u093e\u0938\u094d\u0932\u094b \u0915\u093e \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e\u0913\u0902 \u0915\u093e \u0938\u094b\u092a\u093e\u0928',
    category: 'Motivation & Goals',
    originator: 'Abraham Maslow (1943)',
    coreIdea: 'Human needs form a pyramid \u2014 physiological (food, sleep), safety, love/belonging, esteem, and self-actualization at the top. Lower needs generally must be reasonably met before higher ones become strong motivators.',
    hindiCoreIdea: '\u092e\u093e\u0928\u0935 \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e\u090f\u0902 \u090f\u0915 \u092a\u093f\u0930\u093e\u092e\u093f\u0921 \u092c\u0928\u093e\u0924\u0940 \u0939\u0948\u0902 \u2014 \u0936\u093e\u0930\u0940\u0930\u093f\u0915 \u091c\u0930\u0942\u0930\u0924\u0947\u0902, \u0938\u0941\u0930\u0915\u094d\u0937\u093e, \u092a\u094d\u0930\u0947\u092e/\u0938\u0902\u092c\u0902\u0927, \u0938\u092e\u094d\u092e\u093e\u0928, \u0914\u0930 \u0938\u092c\u0938\u0947 \u090a\u092a\u0930 \u0906\u0924\u094d\u092e-\u0938\u093e\u0915\u094d\u0937\u093e\u0924\u094d\u0915\u093e\u0930\u0964 \u0928\u093f\u091a\u0932\u0940 \u091c\u0930\u0942\u0930\u0924\u0947\u0902 \u092a\u0942\u0930\u0940 \u0939\u0941\u090f \u092c\u093f\u0928\u093e \u090a\u092a\u0930 \u0935\u093e\u0932\u0940 \u092a\u094d\u0930\u0947\u0930\u0923\u093e\u090f\u0902 \u0915\u092e\u091c\u094b\u0930 \u0930\u0939\u0924\u0940 \u0939\u0948\u0902\u0964',
    howToApply: 'If motivation to study feels low, check the basics first \u2014 sleep, food, financial stress, relationships. Fixing these often restores focus faster than forcing willpower alone.',
    hindiHowToApply: '\u0905\u0917\u0930 \u092a\u095d\u0939\u093e\u0908 \u0915\u0940 \u092a\u094d\u0930\u0947\u0930\u0923\u093e \u0915\u092e \u0932\u0917\u0947, \u0924\u094b \u092a\u0939\u0932\u0947 \u0928ींद, \u0916\u093e\u0928\u093e, \u092a\u0930\u093f\u0935\u093e\u0930\u093f\u0915/\u0906\u0930\u094d\u0925\u093f\u0915 \u0924\u0928\u093e\u0935 \u091a\u0947\u0915 \u0915\u0930\u094b \u2014 \u092f\u0947 \u0920\u0940\u0915 \u0915\u0930\u0928\u0947 \u0938\u0947 \u092b\u094b\u0915\u0938 \u0916\u0941\u0926 \u092c \u0938\u0941\u0927\u0930\u0924\u093e \u0939\u0948\u0964'
  },
  {
    id: 'self-determination-theory',
    name: 'Self-Determination Theory',
    hindiName: '\u0906\u0924\u094d\u092e-\u0928\u093f\u0930\u094d\u0927\u093e\u0930\u0923 \u0938\u093f\u0926\u094d\u0927\u093e\u0902\u0924',
    category: 'Motivation & Goals',
    originator: 'Edward Deci & Richard Ryan (1985)',
    coreIdea: 'Sustainable motivation comes from three psychological needs: autonomy (feeling in control of your choices), competence (feeling capable), and relatedness (feeling connected to others). External rewards alone (money, pressure) create weaker, shorter-lived motivation.',
    hindiCoreIdea: 'टिकाऊ \u092a\u094d\u0930\u0947\u0930\u0923\u093e \u0924\u0940\u0928 \u092e\u0928\u094b\u0935\u0948\u091c\u094d\u091e\u093e\u0928\u093f\u0915 \u091c\u0930\u0942\u0930\u0924\u094b\u0902 \u0938\u0947 \u0906\u0924\u0940 \u0939\u0948: \u0938\u094d\u0935\u093e\u092f\u0924\u094d\u0924\u0924\u093e (\u0916\u0941\u0926 \u0915\u093e \u092b\u0948\u0938\u0932\u093e), \u092f\u094b\u0917\u094d\u092f\u0924\u093e (\u0938\u0915\u094d\u0937\u092e \u092e\u0939\u0938\u0942\u0938 \u0915\u0930\u0928\u093e), \u0914\u0930 \u091c\u0941\u0921\u093c\u093e\u0935 (\u0926\u0942\u0938\u0930\u094b\u0902 \u0938\u0947 \u0938\u0902\u092c\u0902\u0927)\u0964',
    howToApply: 'When setting a study goal, choose the "why" yourself (e.g. "I want this for my family\u2019s future") rather than only external pressure \u2014 it makes the same effort feel less exhausting.',
    hindiHowToApply: '\u0932\u0915\u094d\u0937\u094d\u092f \u092c\u0928\u093e\u0924\u0947 \u0938\u092e\u092f \u0905\u092a\u0928\u093e "\u0915\u094d\u092f\u094b\u0902" \u0916\u0941\u0926 \u091a\u0941\u0928\u094b (\u091c\u0948\u0938\u0947 "\u092e\u0947\u0930\u0947 \u092a\u0930\u093f\u0935\u093e\u0930 \u0915\u0947 \u092d\u0935\u093f\u0937\u094d\u092f \u0915\u0947 \u0932\u093f\u090f") \u2014 \u0907\u0938\u0938\u0947 \u0935\u0939\u0940 \u092e\u0947\u0939\u0928\u0924 \u0915\u092e \u0925\u0915\u093e\u0928\u0947 \u0935\u093e\u0932\u0940 \u0932\u0917\u0924\u0940 \u0939\u0948\u0964'
  },
  {
    id: 'goal-setting-theory',
    name: 'Goal-Setting Theory',
    hindiName: '\u0932\u0915\u094d\u0937\u094d\u092f-\u0928\u093f\u0930\u094d\u0927\u093e\u0930\u0923 \u0938\u093f\u0926\u094d\u0927\u093e\u0902\u0924',
    category: 'Motivation & Goals',
    originator: 'Edwin Locke & Gary Latham (1990)',
    coreIdea: 'Specific, challenging (but achievable) goals lead to higher performance than vague goals like "do your best." Feedback on progress and genuine commitment to the goal both amplify the effect.',
    hindiCoreIdea: '\u0938\u094d\u092a\u0937\u094d\u091f, \u091a\u0941\u0928\u094c\u0924\u0940\u092a\u0942\u0930\u094d\u0923 (\u092e\u0917\u0930 \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u0915\u0930\u0928\u0947 \u092f\u094b\u0917\u094d\u092f) \u0932\u0915\u094d\u0937\u094d\u092f "\u0905\u092a\u0928\u093e \u0938\u0930\u094d\u0935\u0936\u094d\u0930\u0947\u0937\u094d\u0920 \u0926\u094b" \u091c\u0948\u0938\u0947 \u0905\u0938\u094d\u092a\u0937\u094d\u091f \u0932\u0915\u094d\u0937\u094d\u092f\u094b\u0902 \u0938\u0947 \u091c\u094d\u092f\u093e\u0926\u093e \u092a\u094d\u0930\u0926\u0930\u094d\u0936\u0928 \u0926\u0947\u0924\u0947 \u0939\u0948\u0902\u0964',
    howToApply: 'Instead of "study more," set "complete 2 Physics chapters and 50 MCQs by Sunday." Track progress visibly \u2014 it keeps the goal real and adjustable.',
    hindiHowToApply: '"\u091c\u094d\u092f\u093e\u0926\u093e \u092a\u095d\u0939\u093e\u0908" \u0915\u0947 \u092c\u091c\u093e\u092f "\u0930\u0935\u093f\u0935\u093e\u0930 \u0924\u0915 2 \u092b\u093f\u091c\u093f\u0915\u094d\u0938 \u091a\u0948\u092a\u094d\u091f\u0930 + 50 MCQ \u092a\u0942\u0930\u0947" \u091c\u0948\u0938\u093e \u0932\u0915\u094d\u0937\u094d\u092f \u0930\u0916\u094b\u0964'
  },

  // ---------------------------------------------------------------- Habits & Behavior
  {
    id: 'habit-loop',
    name: 'The Habit Loop',
    hindiName: '\u0906\u0926\u0924 \u091a\u0915\u094d\u0930 (\u0939\u0948\u092c\u093f\u091f \u0932\u0942\u092a)',
    category: 'Habits & Behavior',
    originator: 'Charles Duhigg / James Clear (popularized)',
    coreIdea: 'Every habit runs on a loop: Cue (trigger) \u2192 Craving \u2192 Response (the habit itself) \u2192 Reward. To build a new habit, make the cue obvious and the reward satisfying; to break one, make the cue invisible or the response hard.',
    hindiCoreIdea: '\u0939\u0930 \u0906\u0926\u0924 \u090f\u0915 \u091a\u0915\u094d\u0930 \u092a\u0930 \u091a\u0932\u0924\u0940 \u0939\u0948: \u0938\u0902\u0915\u0947\u0924 \u2192 \u0932\u0932\u0938\u093e \u2192 \u092a\u094d\u0930\u0924\u093f\u0915\u094d\u0930\u093f\u092f\u093e (\u0906\u0926\u0924) \u2192 \u0907\u0928\u093e\u092e\u0964 \u0928\u0908 \u0906\u0926\u0924 \u092c\u0928\u093e\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u0902\u0915\u0947\u0924 \u0938\u094d\u092a\u0937\u094d\u091f \u0930\u0916\u094b, \u092a\u0941\u0930\u093e\u0928\u0940 \u0924\u094b\u095c\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u0902\u0915\u0947\u0924 \u0939\u091f\u093e\u0913\u0964',
    howToApply: 'To build "study at 6 AM," place your books on the pillow the night before (obvious cue) and reward yourself with something small right after (e.g. favorite chai) to reinforce the loop.',
    hindiHowToApply: '"\u0938\u0941\u092c\u0939 6 \u092c\u091c\u0947 \u092a\u095d\u0939\u093e\u0908" \u0915\u0940 \u0906\u0926\u0924 \u0915\u0947 \u0932\u093f\u090f, \u0930\u093e\u0924 \u0915\u094b \u0939\u0940 \u0915\u093f\u0924\u093e\u092c\u0947\u0902 \u0924\u0915\u093f\u092f\u0947 \u092a\u0930 \u0930\u0916\u094b (\u0938\u094d\u092a\u0937\u094d\u091f \u0938\u0902\u0915\u0947\u0924), \u092a\u095d\u0939\u0928\u0947 \u0915\u0947 \u0924\u0941\u0930\u0902\u0924 \u092c\u093e\u0926 \u0916\u0941\u0926 \u0915\u094b \u091b\u094b\u091f\u093e \u0938\u093e \u0907\u0928\u093e\u092e \u0926\u094b (\u091c\u0948\u0938\u0947 \u092a\u0938\u0902\u0926\u0940\u0926\u093e \u091a\u093e\u092f)\u0964'
  },
  {
    id: 'operant-conditioning',
    name: 'Operant Conditioning',
    hindiName: '\u0938\u0902\u091a\u093e\u0932\u0928 \u0905\u0928\u0941\u092c\u0902\u0927\u0928',
    category: 'Habits & Behavior',
    originator: 'B.F. Skinner (1930s\u201340s)',
    coreIdea: 'Behavior followed by a reward tends to repeat (reinforcement); behavior followed by an unpleasant consequence tends to decrease (punishment). Consistent, immediate consequences shape behavior more effectively than occasional/delayed ones.',
    hindiCoreIdea: '\u091c\u093f\u0938 \u0935\u094d\u092f\u0935\u0939\u093e\u0930 \u0915\u0947 \u092c\u093e\u0926 \u0907\u0928\u093e\u092e \u092e\u093f\u0932\u0924\u093e \u0939\u0948, \u0935\u0939 \u0926\u094b\u0939\u0930\u093e\u092f\u093e \u091c\u093e\u0924\u093e \u0939\u0948 (\u0938\u0941\u0926\u0943\u095c\u0940\u0915\u0930\u0923); \u091c\u093f\u0938\u0915\u0947 \u092c\u093e\u0926 \u0905\u092a\u094d\u0930\u093f\u092f \u092a\u0930\u093f\u0923\u093e\u092e \u092e\u093f\u0932\u0924\u093e \u0939\u0948, \u0935\u0939 \u0915\u092e \u0939\u094b\u0924\u093e \u0939\u0948\u0964',
    howToApply: 'Reward yourself immediately after completing a hard study block (a short break, favorite snack) rather than a big reward weeks later \u2014 immediate reinforcement builds the habit faster.',
    hindiHowToApply: '\u090f\u0915 \u0915\u0920\u093f\u0928 \u092a\u095d\u0939\u093e\u0908 \u0938\u0947\u0936\u0928 \u0915\u0947 \u0924\u0941\u0930\u0902\u0924 \u092c\u093e\u0926 \u0916\u0941\u0926 \u0915\u094b \u0907\u0928\u093e\u092e \u0926\u094b (\u091b\u094b\u091f\u093e \u092c\u094d\u0930\u0947\u0915, \u092a\u0938\u0902\u0926\u0940\u0926\u093e \u0938\u094d\u0928\u0948\u0915) \u2014 \u0939\u092b\u094d\u0924\u094b\u0902 \u092c\u093e\u0926 \u0915\u0947 \u092c\u095c\u0947 \u0907\u0928\u093e\u092e \u0938\u0947 \u091c\u094d\u092f\u093e\u0926\u093e \u0905\u0938\u0930\u0926\u093e\u0930\u0964'
  },
  {
    id: 'implementation-intentions',
    name: 'Implementation Intentions',
    hindiName: '\u0915\u093e\u0930\u094d\u092f\u093e\u0928\u094d\u0935\u092f\u0928 \u0907\u0930\u093e\u0926\u093e (\u0907\u092e\u094d\u092a\u094d\u0932\u0940\u092e\u0947\u0902\u091f\u0947\u0936\u0928 \u0907\u0902\u091f\u0947\u0902\u0936\u0928)',
    category: 'Habits & Behavior',
    originator: 'Peter Gollwitzer (1999)',
    coreIdea: 'A specific "If X happens, I will do Y" plan makes you far more likely to actually follow through than a vague intention. It pre-decides the response so willpower isn\u2019t needed in the moment.',
    hindiCoreIdea: '"\u0905\u0917\u0930 X \u0939\u094b, \u0924\u094b \u092e\u0948\u0902 Y \u0915\u0930\u0942\u0902\u0917\u093e" \u091c\u0948\u0938\u0940 \u0938\u094d\u092a\u0937\u094d\u091f \u092f\u094b\u091c\u0928\u093e \u0905\u0938\u094d\u092a\u0937\u094d\u091f \u0907\u0930\u093e\u0926\u0947 \u0938\u0947 \u0915\u0939\u0940\u0902 \u091c\u094d\u092f\u093e\u0926\u093e \u0938\u092b\u0932 \u0939\u094b\u0924\u0940 \u0939\u0948\u0964',
    howToApply: 'Instead of "I\u2019ll study Physics if I get time," decide: "If it\u2019s 7 PM, I will open my Physics book at my desk." Removes the in-the-moment decision.',
    hindiHowToApply: '"\u0905\u0917\u0930 \u0938\u092e\u092f \u092e\u093f\u0932\u093e \u0924\u094b \u092b\u093f\u091c\u093f\u0915\u094d\u0938 \u092a\u095d\u0942\u0902\u0917\u093e" \u0915\u0940 \u091c\u0917\u0939 "\u0905\u0917\u0930 7 \u092c\u091c \u0917\u090f \u0924\u094b \u092e\u0948\u0902 \u0921\u0947\u0938\u094d\u0915 \u092a\u0930 \u092c\u0948\u0920\u0915\u0930 \u092b\u093f\u091c\u093f\u0915\u094d\u0938 \u0916\u094b\u0932\u0942\u0902\u0917\u093e" \u091c\u0948\u0938\u093e \u0924\u092f \u0915\u0930\u094b\u0964'
  },

  // ---------------------------------------------------------------- Mindset & Beliefs
  {
    id: 'growth-mindset',
    name: 'Growth Mindset',
    hindiName: '\u0917\u094d\u0930\u094b\u0925 \u092e\u093e\u0907\u0902\u0921\u0938\u0947\u091f (\u0935\u093f\u0915\u093e\u0938\u0936\u0940\u0932 \u0938\u094b\u091a)',
    category: 'Mindset & Beliefs',
    originator: 'Carol Dweck (2006)',
    coreIdea: 'People with a "growth mindset" believe abilities can be developed through effort and learning; people with a "fixed mindset" believe intelligence/talent is static. Growth-mindset people handle failure better and improve faster because they see setbacks as information, not verdicts.',
    hindiCoreIdea: '\u091c\u094b \u0932\u094b\u0917 \u092e\u093e\u0928\u0924\u0947 \u0939\u0948\u0902 \u0915\u093f \u092f\u094b\u0917\u094d\u092f\u0924\u093e \u092e\u0947\u0939\u0928\u0924 \u0938\u0947 \u092c\u095d \u0938\u0915\u0924\u0940 \u0939\u0948 ("\u0917\u094d\u0930\u094b\u0925 \u092e\u093e\u0907\u0902\u0921\u0938\u0947\u091f"), \u0935\u0947 \u092a\u094d\u0930\u092f\u093e\u0938 \u0915\u094b \u092c\u0947\u0939\u0924\u0930 \u0938\u0902\u092d\u093e\u0932\u0924\u0947 \u0939\u0948\u0902 \u0909\u0928 \u0932\u094b\u0917\u094b\u0902 \u0938\u0947 \u091c\u094b \u092e\u093e\u0928\u0924\u0947 \u0939\u0948\u0902 \u092c\u0941\u0926\u094d\u0927\u093f \u0938\u094d\u0925\u093f\u0930 \u0939\u0948 ("\u092b\u093f\u0915\u094d\u0938\u094d\u0921 \u092e\u093e\u0907\u0902\u0921\u0938\u0947\u091f")\u0964',
    howToApply: 'When you fail a mock test, replace "I\u2019m bad at this" with "I haven\u2019t mastered this yet" \u2014 then identify exactly which topic to fix.',
    hindiHowToApply: '\u092e\u0949\u0915 \u091f\u0947\u0938\u094d\u091f \u092e\u0947\u0902 \u092b\u0947\u0932 \u0939\u094b\u0928\u0947 \u092a\u0930 "\u092e\u0941\u091d\u0938\u0947 \u0928\u0939\u0940\u0902 \u0939\u094b\u0924\u093e" \u0915\u0940 \u091c\u0917\u0939 "\u0905\u092d\u0940 \u092e\u093e\u0938\u094d\u091f\u0930 \u0928\u0939\u0940\u0902 \u0915\u093f\u092f\u093e" \u0938\u094b\u091a\u094b \u2014 \u092b\u093f\u0930 \u0924\u092f \u0915\u0930\u094b \u0915\u094c\u0928 \u0938\u093e \u091f\u0949\u092a\u093f\u0915 \u0920\u0940\u0915 \u0915\u0930\u0928\u093e \u0939\u0948\u0964'
  },
  {
    id: 'self-efficacy',
    name: 'Self-Efficacy',
    hindiName: '\u0906\u0924\u094d\u092e-\u0938\u093e\u092e\u0930\u094d\u0925\u094d\u092f (\u0938\u0947\u0932\u094d\u092b-\u090f\u092b\u093f\u0915\u0947\u0938\u0940)',
    category: 'Mindset & Beliefs',
    originator: 'Albert Bandura (1977)',
    coreIdea: 'Self-efficacy is your belief in your own ability to succeed at a specific task. It\u2019s built through 4 sources: past success (strongest), watching similar others succeed, verbal encouragement, and managing anxiety before the task.',
    hindiCoreIdea: '\u0906\u0924\u094d\u092e-\u0938\u093e\u092e\u0930\u094d\u0925\u094d\u092f \u092f\u0939 \u0935\u093f\u0936\u094d\u0935\u093e\u0938 \u0939\u0948 \u0915\u093f \u0906\u092a \u090f\u0915 \u0916\u093e\u0938 \u0915\u093e\u092e \u092e\u0947\u0902 \u0938\u092b\u0932 \u0939\u094b \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964 \u092f\u0939 \u092a\u0942\u0930\u094d\u0935 \u0938\u092b\u0932\u0924\u093e, \u0926\u0942\u0938\u0930\u094b\u0902 \u0915\u094b \u0938\u092b\u0932 \u0939\u094b\u0924\u0947 \u0926\u0947\u0916\u0928\u0947, \u0914\u0930 \u0939\u094c\u0938\u0932\u093e \u0938\u0947 \u092c\u0928\u0924\u093e \u0939\u0948\u0964',
    howToApply: 'Before a big exam, deliberately recall a past test you cleared well \u2014 it directly strengthens belief in yourself for the next one, more than pep talk alone.',
    hindiHowToApply: '\u092c\u095c\u0940 \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0938\u0947 \u092a\u0939\u0932\u0947, \u091c\u093e\u0928\u092c\u0942\u091d\u0915\u0930 \u0915\u094b\u0908 \u092a\u0941\u0930\u093e\u0928\u093e \u0938\u092b\u0932 \u091f\u0947\u0938\u094d\u091f \u092f\u093e\u0926 \u0915\u0930\u094b \u2014 \u092f\u0939 \u0938\u0940\u0927\u0947 \u0906\u0924\u094d\u092e\u0935\u093f\u0936\u094d\u0935\u093e\u0938 \u092c\u095d\u093e\u0924\u093e \u0939\u0948\u0964'
  },
  {
    id: 'locus-of-control',
    name: 'Locus of Control',
    hindiName: '\u0928\u093f\u092f\u0902\u0924\u094d\u0930\u0923 \u0915\u0947\u0902\u0926\u094d\u0930',
    category: 'Mindset & Beliefs',
    originator: 'Julian Rotter (1954)',
    coreIdea: 'People with an "internal" locus believe outcomes result mainly from their own effort/choices. People with an "external" locus believe outcomes result mainly from luck/fate/others. An internal locus is linked to higher persistence and better exam performance.',
    hindiCoreIdea: '"\u0906\u0902\u0924\u0930\u093f\u0915 \u0928\u093f\u092f\u0902\u0924\u094d\u0930\u0923" \u0935\u093e\u0932\u0947 \u0932\u094b\u0917 \u092e\u093e\u0928\u0924\u0947 \u0939\u0948\u0902 \u0915\u093f \u092a\u0930\u093f\u0923\u093e\u092e \u0909\u0928\u0915\u0947 \u0916\u0941\u0926 \u0915\u0947 \u092a\u094d\u0930\u092f\u093e\u0938 \u0938\u0947 \u0906\u0924\u0947 \u0939\u0948\u0902; "\u092c\u093e\u0939\u094d\u092f" \u0928\u093f\u092f\u0902\u0924\u094d\u0930\u0923 \u0935\u093e\u0932\u0947 \u092d\u093e\u0917\u094d\u092f/\u0926\u0942\u0938\u0930\u094b\u0902 \u092a\u0930 \u0928\u093f\u0930\u094d\u092d\u0930 \u092e\u093e\u0928\u0924\u0947 \u0939\u0948\u0902\u0964',
    howToApply: 'After a bad result, ask "what could I have controlled?" instead of blaming the paper/luck \u2014 it directs energy toward what you can actually fix next time.',
    hindiHowToApply: '\u0916\u0930\u093e\u092c \u092a\u0930\u093f\u0923\u093e\u092e \u0915\u0947 \u092c\u093e\u0926 "\u092e\u0947\u0930\u0947 \u0915\u0902\u091f\u094d\u0930\u094b\u0932 \u092e\u0947\u0902 \u0915\u094d\u092f\u093e \u0925\u093e?" \u092a\u0942\u091b\u094b, \u092a\u0947\u092a\u0930/\u0915\u093f\u0938\u094d\u092e\u0924 \u0915\u094b \u0926\u094b\u0937 \u0926\u0947\u0928\u0947 \u0915\u0947 \u092c\u091c\u093e\u092f\u0964'
  },
  {
    id: 'cognitive-dissonance',
    name: 'Cognitive Dissonance',
    hindiName: '\u0938\u0902\u091c\u094d\u091e\u093e\u0928\u093e\u0924\u094d\u092e\u0915 \u0905\u0938\u0902\u0917\u0924\u093f',
    category: 'Mindset & Beliefs',
    originator: 'Leon Festinger (1957)',
    coreIdea: 'Holding two conflicting beliefs (or a belief and a contradicting action) creates mental discomfort, which we resolve by changing one of them \u2014 often by rationalizing the action instead of changing the behavior.',
    hindiCoreIdea: '\u0926\u094b \u0935\u093f\u0930\u094b\u0927\u093e\u092d\u093e\u0938\u0940 \u092e\u093e\u0928\u094d\u092f\u0924\u093e\u090f\u0902 \u092f\u093e \u092e\u093e\u0928\u094d\u092f\u0924\u093e-\u092c\u0928\u093e\u092e \u0935\u093f\u0930\u094b\u0927\u0940 \u0915\u093e\u0930\u094d\u092f \u0930\u0916\u0928\u093e \u092e\u093e\u0928\u0938\u093f\u0915 \u0905\u0938\u0939\u091c\u0924\u093e \u092a\u0948\u0926\u093e \u0915\u0930\u0924\u093e \u0939\u0948, \u091c\u093f\u0938\u0947 \u0939\u092e \u0905\u0915\u094d\u0938\u0930 \u0906\u091a\u0930\u0923 \u0915\u094b \u091c\u093e\u092f\u091c \u0920\u0939\u0930\u093e\u0915\u0930 \u0938\u0941\u0932\u091d\u093e\u0924\u0947 \u0939\u0948\u0902\u0964',
    howToApply: 'If you believe "I want to clear UPSC" but keep skipping study, notice the dissonance directly instead of rationalizing ("I\u2019ll catch up later") \u2014 naming it honestly is the first step to closing the gap.',
    hindiHowToApply: '\u0905\u0917\u0930 "\u092e\u0941\u091d\u0947 UPSC \u0915\u094d\u0932\u093f\u092f\u0930 \u0915\u0930\u0928\u093e \u0939\u0948" \u092e\u093e\u0928\u0924\u0947 \u0939\u094b \u092b\u093f\u0930 \u092d\u0940 \u092a\u095d\u0939\u093e\u0908 \u091b\u094b\u095c\u0924\u0947 \u0939\u094b, \u0924\u094b \u0907\u0938 \u0905\u0938\u0902\u0917\u0924\u093f \u0915\u094b \u0938\u093e\u092b \u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0915\u0930\u094b, \u092c\u0939\u093e\u0928\u093e \u0928 \u092c\u0928\u093e\u0913\u0964'
  },

  // ---------------------------------------------------------------- Emotional Wellbeing
  {
    id: 'flow-theory',
    name: 'Flow Theory',
    hindiName: '\u092b\u094d\u0932\u094b \u0938\u093f\u0926\u094d\u0927\u093e\u0902\u0924',
    category: 'Emotional Wellbeing',
    originator: 'Mihaly Csikszentmihalyi (1990)',
    coreIdea: '"Flow" is a state of complete absorption in a task where challenge and skill are perfectly balanced \u2014 too easy causes boredom, too hard causes anxiety. Flow is where people report their highest satisfaction and productivity.',
    hindiCoreIdea: '"\u092b\u094d\u0932\u094b" \u0935\u0939 \u0905\u0935\u0938\u094d\u0925\u093e \u0939\u0948 \u091c\u092c \u0915\u093e\u0930\u094d\u092f \u092e\u0947\u0902 \u092a\u0942\u0930\u0940 \u0924\u0930\u0939 \u0921\u0942\u092c \u091c\u093e\u0924\u0947 \u0939\u0948\u0902 \u2014 \u091a\u0941\u0928\u094c\u0924\u0940 \u0914\u0930 \u0915\u094c\u0936\u0932 \u092a\u0942\u0930\u0940 \u0924\u0930\u0939 \u0938\u0902\u0924\u0941\u0932\u093f\u0924 \u0939\u094b\u0924\u0947 \u0939\u0948\u0902\u0964 \u092c\u0939\u0941\u0924 \u0906\u0938\u093e\u0928 \u0938\u0947 \u092c\u094b\u0930\u093f\u092f\u0924, \u092c\u0939\u0941\u0924 \u0915\u0920\u093f\u0928 \u0938\u0947 \u091a\u093f\u0902\u0924\u093e\u0964',
    howToApply: 'If a subject feels boring, raise the challenge (timed practice, harder questions). If it feels overwhelming, break it into smaller wins first \u2014 both push you back toward flow.',
    hindiHowToApply: '\u0905\u0917\u0930 \u0935\u093f\u0937\u092f \u092c\u094b\u0930\u093f\u0902\u0917 \u0932\u0917\u0947, \u091a\u0941\u0928\u094c\u0924\u0940 \u092c\u095c\u093e\u0913 (\u091f\u093e\u0907\u092e\u094d\u0921 \u092a\u094d\u0930\u0948\u0915\u094d\u091f\u093f\u0938)\u0964 \u0905\u0917\u0930 \u092d\u093e\u0930\u0940 \u0932\u0917\u0947, \u091b\u094b\u091f\u0947 \u091f\u0941\u0915\u095c\u094b\u0902 \u092e\u0947\u0902 \u092c\u093e\u0902\u091f\u094b\u0964'
  },
  {
    id: 'perma-model',
    name: 'PERMA Model (Positive Psychology)',
    hindiName: 'PERMA \u092e\u0949\u0921\u0932 (\u0938\u0915\u093e\u0930\u093e\u0924\u094d\u092e\u0915 \u092e\u0928\u094b\u0935\u093f\u091c\u094d\u091e\u093e\u0928)',
    category: 'Emotional Wellbeing',
    originator: 'Martin Seligman (2011)',
    coreIdea: 'Wellbeing has 5 pillars: Positive emotion, Engagement (flow), Relationships, Meaning (purpose beyond yourself), and Accomplishment. A sustainable exam-prep life needs all 5, not just study hours.',
    hindiCoreIdea: '\u0916\u0941\u0936\u0939\u093e\u0932\u0940 \u0915\u0947 5 \u0938\u094d\u0924\u0902\u092d \u0939\u0948\u0902: \u0938\u0915\u093e\u0930\u093e\u0924\u094d\u092e\u0915 \u092d\u093e\u0935\u0928\u093e, \u091c\u0941\u095c\u093e\u0935 (\u092b\u094d\u0932\u094b), \u0938\u0902\u092c\u0902\u0927, \u0905\u0930\u094d\u0925 (\u092a\u0930\u094d\u092a\u095b), \u0914\u0930 \u0909\u092a\u0932\u092c\u094d\u0927\u093f\u0964',
    howToApply: 'Audit your week against all 5 \u2014 if relationships or positive emotion are at zero because of nonstop study, burnout is coming. Protect at least a little of each.',
    hindiHowToApply: '\u0905\u092a\u0928\u0947 \u0939\u092b\u094d\u0924\u0947 \u0915\u094b \u0907\u0928 5 \u0938\u0947 \u091c\u093e\u0902\u091a\u094b \u2014 \u0905\u0917\u0930 \u0938\u0902\u092c\u0902\u0927/\u0916\u0941\u0936\u0940 \u091c\u0940\u0930\u094b \u0939\u0948\u0902 \u0924\u094b \u092c\u0930\u094d\u0928\u0906\u0909\u091f \u0906 \u0938\u0915\u0924\u093e \u0939\u0948\u0964'
  },
  {
    id: 'emotional-intelligence-goleman',
    name: 'Emotional Intelligence',
    hindiName: '\u092d\u093e\u0935\u0928\u093e\u0924\u094d\u092e\u0915 \u092c\u0941\u0926\u094d\u0927\u093f\u092e\u0924\u094d\u0924\u093e',
    category: 'Emotional Wellbeing',
    originator: 'Daniel Goleman (1995)',
    coreIdea: 'The ability to recognize and manage your own emotions, and understand others\u2019, made of 5 parts: self-awareness, self-regulation, motivation, empathy, and social skill. It predicts real-world success as much as raw intelligence in many fields.',
    hindiCoreIdea: '\u0905\u092a\u0928\u0940 \u0914\u0930 \u0926\u0942\u0938\u0930\u094b\u0902 \u0915\u0940 \u092d\u093e\u0935\u0928\u093e\u0913\u0902 \u0915\u094b \u092a\u0939\u091a\u093e\u0928\u0928\u0947 \u0914\u0930 \u0938\u0902\u092d\u093e\u0932\u0928\u0947 \u0915\u0940 \u0915\u094d\u0937\u092e\u0924\u093e \u2014 \u0938\u094d\u0935-\u091c\u093e\u0917\u0930\u0942\u0915\u0924\u093e, \u0938\u094d\u0935-\u0928\u093f\u092f\u0902\u0924\u094d\u0930\u0923, \u092a\u094d\u0930\u0947\u0930\u0923\u093e, \u0938\u0939\u093e\u0928\u0941\u092d\u0942\u0924\u093f, \u0938\u093e\u092e\u093e\u091c\u093f\u0915 \u0915\u094c\u0936\u0932\u0964',
    howToApply: 'Before reacting to frustration (a bad mock score), pause and name the emotion ("I feel discouraged") before deciding your next action \u2014 it prevents impulsive decisions like quitting.',
    hindiHowToApply: '\u0928\u093f\u0930\u093e\u0936\u093e \u092a\u0930 \u0924\u0941\u0930\u0902\u0924 \u092a\u094d\u0930\u0924\u093f\u0915\u094d\u0930\u093f\u092f\u093e \u0926\u0947\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0930\u0941\u0915\u094b, \u092d\u093e\u0935\u0928\u093e \u0915\u094b \u0928\u093e\u092e \u0926\u094b, \u092b\u093f\u0930 \u0905\u0917\u0932\u093e \u0915\u0926\u092e \u0924\u092f \u0915\u0930\u094b\u0964'
  },
  {
    id: 'zeigarnik-effect',
    name: 'Zeigarnik Effect',
    hindiName: '\u091c़ेगारनिक \u092a\u094d\u0930\u092d\u093e\u0935',
    category: 'Emotional Wellbeing',
    originator: 'Bluma Zeigarnik (1927)',
    coreIdea: 'Unfinished tasks stay active in your memory and create mental tension \u2014 which is why an incomplete chapter nags at you more than a completed one. Simply writing down the next step (not finishing it) reduces this tension.',
    hindiCoreIdea: '\u0905\u0927\u0942\u0930\u0947 \u0915\u093e\u092e \u092f\u093e\u0926 \u092e\u0947\u0902 \u091c़्\u092f\u093e\u0926\u093e \u0905\u091f\u0915\u0947 \u0930\u0939\u0924\u0947 \u0939\u0948\u0902 \u0914\u0930 \u092e\u093e\u0928\u0938\u093f\u0915 \u0924\u0928\u093e\u0935 \u092a\u0948\u0926\u093e \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964 \u092c\u0938 \u0905\u0917\u0932\u093e \u0915\u0926\u092e \u0932\u093f\u0916 \u0926\u0947\u0928\u0947 \u0938\u0947 \u092d\u0940 \u092f\u0939 \u0924\u0928\u093e\u0935 \u0915\u092e \u0939\u094b \u091c\u093e\u0924\u093e \u0939\u0948\u0964',
    howToApply: 'If an unfinished topic is distracting you at night, don\u2019t force-finish it \u2014 just write "next step: solve Q5-10 tomorrow morning" and close the book. The tension eases enough to sleep.',
    hindiHowToApply: '\u0905\u0917\u0930 \u0905\u0927\u0942\u0930\u093e \u091f\u0949\u092a\u093f\u0915 \u0930\u093e\u0924 \u092e\u0947\u0902 \u092a\u0930\u0947\u0936\u093e\u0928 \u0915\u0930\u0947, \u0924\u094b "\u0905\u0917\u0932\u093e \u0915\u0926\u092e: \u0938\u0941\u092c\u0939 Q5-10 \u0915\u0930\u0928\u093e" \u0932\u093f\u0916\u0915\u0930 \u0915\u093f\u0924\u093e\u092c \u092c\u0902\u0926 \u0915\u0930\u094b\u0964'
  },

  // ---------------------------------------------------------------- Decision-Making & Biases
  {
    id: 'delayed-gratification',
    name: 'Delayed Gratification (Marshmallow Test)',
    hindiName: '\u0935\u093f\u0932\u0902\u092c\u093f\u0924 \u0938\u0902\u0924\u0941\u0937\u094d\u091f\u0940',
    category: 'Decision-Making & Biases',
    originator: 'Walter Mischel (1960s\u201370s)',
    coreIdea: 'Children who could resist eating one marshmallow now for two later showed better life outcomes decades on (grades, health, relationships). The core skill is not raw willpower but strategies \u2014 distraction, reframing \u2014 that make waiting easier.',
    hindiCoreIdea: '\u091c\u094b \u092c\u091a\u094d\u091a\u0947 \u0905\u092d\u0940 \u090f\u0915 \u092e\u093e\u0930\u094d\u0936\u092e\u0948\u0932\u094b \u0916\u093e\u0928\u0947 \u0915\u0940 \u092c\u091c\u093e\u092f \u092c\u093e\u0926 \u092e\u0947\u0902 \u0926\u094b \u0915\u093e \u0907\u0902\u0924\u091c़ार \u0915\u0930 \u0938\u0915\u0924\u0947 \u0925\u0947, \u0909\u0928\u0915\u093e \u092d\u0935\u093f\u0937\u094d\u092f \u092c\u0947\u0939\u0924\u0930 \u0930\u0939\u093e\u0964 \u092e\u0942\u0932 \u0915\u094c\u0936\u0932 \u0921\u093f\u0938्\u091f्\u0930\u0948\u0915्\u0936\u0928/\u0930\u0940फ्रेमिंग \u0925\u093e, \u0938िर्फ \u0907च्\u091b\u093e\u0936\u0915्\u0924\u093f \u0928\u0939\u0940\u0902\u0964',
    howToApply: 'When tempted to scroll Instagram instead of studying, don\u2019t just "resist" \u2014 physically put the phone in another room (removes the temptation rather than fighting it).',
    hindiHowToApply: '\u091c\u092c \u092a\u095d\u0939\u093e\u0908 \u0915\u0940 \u091c\u0917\u0939 \u0907\u0902\u0938्\u091f\u093e \u091a\u0932\u093e\u0928\u0947 \u0915\u093e \u092e\u0928 \u0915\u0930\u0947, \u092b\u094b\u0928 \u0926\u0942\u0938\u0930\u0947 \u0915\u092e\u0930\u0947 \u092e\u0947\u0902 \u0930\u0916 \u0926\u094b \u2014 \u0932\u095c\u0928\u0947 \u0938\u0947 \u092c\u0947\u0939\u0924\u0930 \u0939\u0948 \u0939\u091f\u093e \u0926\u0947\u0928\u093e\u0964'
  },
  {
    id: 'loss-aversion',
    name: 'Loss Aversion',
    hindiName: '\u0939\u093e\u0928\u093f \u0938\u0947 \u092c\u091a\u093e\u0935',
    category: 'Decision-Making & Biases',
    originator: 'Daniel Kahneman & Amos Tversky (1979)',
    coreIdea: 'Losing something feels roughly twice as painful as gaining the equivalent feels good. This is why fear of "losing" a streak or rank often motivates more than the promise of gaining one \u2014 useful, but can also cause overly cautious decisions.',
    hindiCoreIdea: '\u0915\u0941\u091b \u0916\u094b\u0928\u0947 \u0915\u093e \u0926\u0930्\u0926 \u0909\u0924\u0928\u093e \u0939\u0940 \u092a\u093e\u0928\u0947 \u0915\u0940 \u0916\u0941\u0936\u0940 \u0938\u0947 \u0932\u0917\u092d\u0917 \u0926\u094b\u0917\u0941\u0928\u093e \u0939\u094b\u0924\u093e \u0939\u0948\u0964 \u0907\u0938\u0940\u0932\u093f\u090f स्ट्रीक \u0916\u094b\u0928\u0947 \u0915\u093e \u095b\u0930 \u0905\u0915्\u0938\u0930 \u092a्\u0930\u0947\u0930\u0923\u093e \u092c\u095c\u093e \u0926\u0947\u0924\u093e \u0939\u0948\u0964',
    howToApply: 'Use it consciously: commit to a study streak publicly (or in the app) \u2014 the discomfort of "losing" the streak keeps you consistent on low-motivation days.',
    hindiHowToApply: '\u0938्\u091f्\u0930\u0940\u0915 \u0915\u093e \u092a्\u0930\u092f\u094b\u0917 \u0915\u0930\u094b \u2014 \u0938्\u091f्\u0930\u0940\u0915 \u091f\u0942\u091f\u0928\u0947 \u0915\u093e \u0921\u0930 \u0915\u092e-\u092e\u094b\u091f\u093f\u0935\u0947\u0936\u0928 \u0935\u093e\u0932\u0947 \u0926\u093f\u0928 \u092d\u0940 \u0906\u0917\u0947 \u092c\u095c\u093e\u0924\u093e \u0939\u0948\u0964'
  },
  {
    id: 'sunk-cost-fallacy',
    name: 'Sunk Cost Fallacy',
    hindiName: '\u0921\u0942\u092c\u0940 \u0932\u093e\u0917\u0924 \u0915\u0940 \u0917\u0932\u0924\u0940',
    category: 'Decision-Making & Biases',
    originator: 'Behavioral economics (Kahneman, Thaler et al.)',
    coreIdea: 'We often keep investing time/money in something just because we\u2019ve already invested a lot ("I\u2019ve already studied 2 years for this exam, can\u2019t quit now") even when a rational look at future costs/benefits says otherwise. Past investment shouldn\u2019t control future decisions.',
    hindiCoreIdea: '\u0939\u092e \u0915\u0941\u091b \u092e\u0947\u0902 \u0938\u092e\u092f/\u092a\u0948\u0938\u093e \u0932\u0917\u093e\u0924\u0947 \u0930\u0939\u0924\u0947 \u0939\u0948\u0902 \u0938िर्फ \u0907\u0938\u0932िए \u0915्\u092f\u094b\u0902\u0915ि \u092a\u0939\u0932े \u0938े \u0932\u0917\u093e \u091a\u0941\u0915\u0947 \u0939\u0948\u0902, \u091a\u093e\u0939\u0947 \u0906\u0917\u0947 \u0928\u0941\u0915\u0938\u093e\u0928 \u0939\u094b\u0964',
    howToApply: 'Evaluate your exam strategy based only on forward-looking facts (current preparation level, remaining time) \u2014 not on how many years you\u2019ve already put in. That helps you decide rationally, not emotionally.',
    hindiHowToApply: '\u0905\u092a\u0928\u0940 \u0930\u0923\u0928\u0940\u0924\u093f \u0915\u094b \u0938िर्फ आगे \u0915\u0947 \u0924\u0925्\u092f\u094b\u0902 \u092a\u0930 \u0906\u0927\u093e\u0930ित \u0915\u0930\u094b, \u092c\u0940\u0924\u0947 \u0938\u093e\u0932\u094b\u0902 \u092a\u0930 \u0928\u0939\u0940\u0902\u0964'
  },
  {
    id: 'confirmation-bias',
    name: 'Confirmation Bias',
    hindiName: '\u092a\u0941\u0937्\u091f\u093f\u0915\u0930\u0923 \u092a\u0942\u0930्\u0935\u093e\u0917्\u0930\u0939',
    category: 'Decision-Making & Biases',
    originator: 'Widely studied; term popularized by Peter Wason (1960)',
    coreIdea: 'We naturally seek out and remember information that confirms what we already believe, and ignore/dismiss information that contradicts it \u2014 e.g. only revisiting topics you\u2019re already good at because it "feels" productive.',
    hindiCoreIdea: '\u0939\u092e \u0938्\u0935\u092d\u093e\u0935\u0924: \u0935\u0939\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0922\u0942\u0902\u0922\u0924\u0947/\u092f\u093e\u0926 \u0930\u0916\u0924\u0947 \u0939\u0948\u0902 \u091c\u094b \u092a\u0939\u0932े \u0938े हमारी सोच \u0938े \u092e\u0947\u0932 \u0916\u093e\u0924ी \u0939\u0948, \u0914\u0930 \u0935िपरीत \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0928\u095b\u0930\u0905\u0902\u0926\u093e\u095b \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964',
    howToApply: 'Deliberately track your weak topics with real data (mock test scores) rather than "gut feeling" \u2014 gut feeling is often just confirmation bias favoring what already feels comfortable.',
    hindiHowToApply: '\u0905\u092a\u0928े \u0915मज़ोर \u091f\u0949\u092a\u093f\u0915्स \u0915ो असली \u0921ेटा (\u092e\u0949\u0915 \u091f\u0947\u0938्\u091f \u0938्\u0915ोर) \u0938े ट्रैक \u0915\u0930ो, "\u092e\u0928 \u0915ी भावना" \u0938े नहीं\u0964'
  }
];
