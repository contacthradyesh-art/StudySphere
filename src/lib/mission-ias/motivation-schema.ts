export type MotivationCategory = 'perseverance' | 'discipline' | 'failure-success' | 'focus' | 'self-belief';

export const CATEGORY_LABELS: Record<MotivationCategory, { en: string; hi: string }> = {
  perseverance: { en: 'Perseverance', hi: '\u0926\u0943\u0922\u093c\u0924\u093e' },
  discipline: { en: 'Discipline', hi: '\u0905\u0928\u0941\u0936\u093e\u0938\u0928' },
  'failure-success': { en: 'Failure & Success', hi: '\u0938\u092b\u0932\u0924\u093e \u0914\u0930 \u0905\u0938\u092b\u0932\u0924\u093e' },
  focus: { en: 'Focus', hi: '\u090f\u0915\u093e\u0917\u094d\u0930\u0924\u093e' },
  'self-belief': { en: 'Self-Belief', hi: '\u0906\u0924\u094d\u092e\u0935\u093f\u0936\u094d\u0935\u093e\u0938' }
};

export interface MotivationQuote {
  id: string;
  textEn: string;
  textHi: string;
  author: string;
  category: MotivationCategory;
}

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    id: 'kalam-1',
    textEn: 'Dream is not that which you see while sleeping, it is something that does not let you sleep.',
    textHi: '\u0938\u092a\u0928\u093e \u0935\u0939 \u0928\u0939\u0940\u0902 \u091c\u094b \u0906\u092a \u0938\u094b\u0924\u0947 \u0939\u0941\u090f \u0926\u0947\u0916\u0924\u0947 \u0939\u0948\u0902, \u0938\u092a\u0928\u093e \u0935\u0939 \u0939\u0948 \u091c\u094b \u0906\u092a\u0915\u094b \u0938\u094b\u0928\u0947 \u0928\u0939\u0940\u0902 \u0926\u0947\u0924\u093e\u0964',
    author: 'Dr. A.P.J. Abdul Kalam',
    category: 'self-belief'
  },
  {
    id: 'kalam-2',
    textEn: 'If you fail, never give up because F.A.I.L. means "First Attempt In Learning".',
    textHi: '\u0905\u0917\u0930 \u0906\u092a \u0905\u0938\u092b\u0932 \u0939\u094b\u0902, \u0924\u094b \u0915\u092d\u0940 \u0939\u093e\u0930 \u092e\u0924 \u092e\u093e\u0928\u093f\u090f\u0964 F.A.I.L. \u0915\u093e \u092e\u0924\u0932\u092c \u0939\u0948 "\u0938\u0940\u0916\u0928\u0947 \u0915\u093e \u092a\u0939\u0932\u093e \u092a\u094d\u0930\u092f\u093e\u0938"\u0964',
    author: 'Dr. A.P.J. Abdul Kalam',
    category: 'failure-success'
  },
  {
    id: 'vivekananda-1',
    textEn: 'Arise, awake, and stop not till the goal is reached.',
    textHi: '\u0909\u0920\u094b, \u091c\u093e\u0917\u094b \u0914\u0930 \u0924\u092c \u0924\u0915 \u0930\u0941\u0915\u094b \u0928\u0939\u0940\u0902 \u091c\u092c \u0924\u0915 \u0932\u0915\u094d\u0937\u094d\u092f \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u0928 \u0939\u094b \u091c\u093e\u090f\u0964',
    author: 'Swami Vivekananda',
    category: 'perseverance'
  },
  {
    id: 'vivekananda-2',
    textEn: 'All the power in the universe is already ours; it is we who have put our hands before our eyes and cry that it is dark.',
    textHi: '\u0938\u0902\u0938\u093e\u0930 \u0915\u0940 \u0938\u093e\u0930\u0940 \u0936\u0915\u094d\u0924\u093f \u092a\u0939\u0932\u0947 \u0938\u0947 \u0939\u092e\u093e\u0930\u0947 \u0905\u0902\u0926\u0930 \u0939\u0940 \u0939\u0948; \u0939\u092e \u0916\u0941\u0926 \u0905\u092a\u0928\u0940 \u0906\u0902\u0916\u094b\u0902 \u092a\u0930 \u0939\u093e\u0925 \u0930\u0916\u0915\u0930 \u0930\u094b \u0930\u0939\u0947 \u0939\u0948\u0902 \u0915\u093f \u0905\u0902\u0927\u0947\u0930\u093e \u0939\u0948\u0964',
    author: 'Swami Vivekananda',
    category: 'self-belief'
  },
  {
    id: 'gandhi-1',
    textEn: 'Strength does not come from physical capacity. It comes from an indomitable will.',
    textHi: '\u0936\u0915\u094d\u0924\u093f \u0936\u093e\u0930\u0940\u0930\u093f\u0915 \u0915\u094d\u0937\u092e\u0924\u093e \u0938\u0947 \u0928\u0939\u0940\u0902 \u0906\u0924\u0940\u0964 \u092f\u0939 \u090f\u0915 \u0905\u0921\u093f\u0917 \u0907\u091a\u094d\u091b\u093e\u0936\u0915\u094d\u0924\u093f \u0938\u0947 \u0906\u0924\u0940 \u0939\u0948\u0964',
    author: 'Mahatma Gandhi',
    category: 'perseverance'
  },
  {
    id: 'chanakya-1',
    textEn: 'A person should not be too honest. Straight trees are cut first and Straight forward people are screwed first.',
    textHi: '\u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0915\u094b \u0905\u0924\u094d\u092f\u0927\u093f\u0915 \u0938\u0940\u0927\u093e \u0928\u0939\u0940\u0902 \u0939\u094b\u0928\u093e \u091a\u093e\u0939\u093f\u090f\u0964 \u0938\u0940\u0927\u0947 \u092a\u0947\u0921\u093c \u0938\u092c\u0938\u0947 \u092a\u0939\u0932\u0947 \u0915\u093e\u091f\u0947 \u091c\u093e\u0924\u0947 \u0939\u0948\u0902\u0964',
    author: 'Chanakya',
    category: 'discipline'
  },
  {
    id: 'gita-1',
    textEn: 'You have the right to work, but never to the fruit of work. You should never engage in action for the sake of reward.',
    textHi: '\u0915\u0930\u094d\u092e \u0915\u0930\u0928\u0947 \u092e\u0947\u0902 \u0939\u0940 \u0924\u0941\u092e\u094d\u0939\u093e\u0930\u093e \u0905\u0927\u093f\u0915\u093e\u0930 \u0939\u0948, \u092b\u0932 \u092e\u0947\u0902 \u0915\u092d\u0940 \u0928\u0939\u0940\u0902\u0964 \u092b\u0932 \u0915\u0940 \u0907\u091a\u094d\u091b\u093e \u0938\u0947 \u0915\u0930\u094d\u092e \u092e\u0924 \u0915\u0930\u094b\u0964',
    author: 'Bhagavad Gita',
    category: 'focus'
  },
  {
    id: 'edison-1',
    textEn: 'I have not failed. I\'ve just found 10,000 ways that won\'t work.',
    textHi: '\u092e\u0948\u0902 \u0905\u0938\u092b\u0932 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964 \u092e\u0941\u091d\u0947 \u092c\u0938 10,000 \u0924\u0930\u0940\u0915\u0947 \u092e\u093f\u0932\u0947 \u091c\u094b \u0915\u093e\u092e \u0928\u0939\u0940\u0902 \u0915\u0930\u0924\u0947\u0964',
    author: 'Thomas Edison',
    category: 'failure-success'
  },
  {
    id: 'mandela-1',
    textEn: 'It always seems impossible until it\'s done.',
    textHi: '\u091c\u092c \u0924\u0915 \u0915\u0941\u091b \u0939\u094b \u0928\u0939\u0940\u0902 \u091c\u093e\u0924\u093e, \u0924\u092c \u0924\u0915 \u0935\u0939 \u0939\u092e\u0947\u0936\u093e \u0905\u0938\u0902\u092d\u0935 \u0939\u0940 \u0932\u0917\u0924\u093e \u0939\u0948\u0964',
    author: 'Nelson Mandela',
    category: 'perseverance'
  },
  {
    id: 'confucius-1',
    textEn: 'It does not matter how slowly you go as long as you do not stop.',
    textHi: '\u0906\u092a \u0915\u093f\u0924\u0928\u0940 \u0927\u0940\u092e\u0947 \u091a\u0932\u0924\u0947 \u0939\u0948\u0902, \u0907\u0938\u0938\u0947 \u0915\u094b\u0908 \u092b\u0930\u094d\u0915 \u0928\u0939\u0940\u0902 \u092a\u0921\u093c\u0924\u093e, \u092c\u0938 \u0930\u0941\u0915\u0928\u093e \u0928\u0939\u0940\u0902 \u091a\u093e\u0939\u093f\u090f\u0964',
    author: 'Confucius',
    category: 'discipline'
  },
  {
    id: 'kalam-3',
    textEn: 'You have to dream before your dreams can come true.',
    textHi: '\u0938\u092a\u0928\u0947 \u0938\u091a \u0939\u094b\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947, \u0938\u092a\u0928\u093e \u0926\u0947\u0916\u0928\u093e \u091c\u0930\u0942\u0930\u0940 \u0939\u0948\u0964',
    author: 'Dr. A.P.J. Abdul Kalam',
    category: 'self-belief'
  },
  {
    id: 'gita-2',
    textEn: 'The mind acting through the five senses of perception may either be the cause of bondage or liberation.',
    textHi: '\u092a\u093e\u0902\u091a \u0907\u0902\u0926\u094d\u0930\u093f\u092f\u094b\u0902 \u0915\u0947 \u092e\u093e\u0927\u094d\u092f\u092e \u0938\u0947 \u0915\u093e\u0930\u094d\u092f \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u093e \u092e\u0928 \u0939\u0940 \u092c\u0902\u0927\u0928 \u092f\u093e \u092e\u094b\u0915\u094d\u0937 \u0915\u093e \u0915\u093e\u0930\u0923 \u092c\u0928 \u0938\u0915\u0924\u093e \u0939\u0948\u0964',
    author: 'Bhagavad Gita',
    category: 'focus'
  },
  {
    id: 'vivekananda-3',
    textEn: 'Take up one idea. Make that one idea your life; dream of it, think of it, live on that idea.',
    textHi: '\u090f\u0915 \u0935\u093f\u091a\u093e\u0930 \u0932\u094b\u0964 \u0909\u0938\u0940 \u0935\u093f\u091a\u093e\u0930 \u0915\u094b \u0905\u092a\u0928\u093e \u091c\u0940\u0935\u0928 \u092c\u0928\u093e\u0913, \u0909\u0938\u0940 \u0915\u093e \u0938\u092a\u0928\u093e \u0926\u0947\u0916\u094b, \u0909\u0938\u0940 \u092a\u0930 \u091c\u093f\u092f\u094b\u0964',
    author: 'Swami Vivekananda',
    category: 'focus'
  },
  {
    id: 'gandhi-2',
    textEn: 'A man is but the product of his thoughts. What he thinks, he becomes.',
    textHi: '\u092e\u0928\u0941\u0937\u094d\u092f \u0905\u092a\u0928\u0947 \u0935\u093f\u091a\u093e\u0930\u094b\u0902 \u0915\u093e \u092b\u0932 \u0939\u0948\u0964 \u0935\u0939 \u091c\u094b \u0938\u094b\u091a\u0924\u093e \u0939\u0948, \u0935\u0939\u0940 \u092c\u0928 \u091c\u093e\u0924\u093e \u0939\u0948\u0964',
    author: 'Mahatma Gandhi',
    category: 'self-belief'
  },
  {
    id: 'chanakya-2',
    textEn: 'The fragrance of flowers spreads only in the direction of the wind. But the goodness of a person spreads in all directions.',
    textHi: '\u092b\u0942\u0932\u094b\u0902 \u0915\u0940 \u0916\u0941\u0936\u092c\u0942 \u0915\u0947\u0935\u0932 \u0939\u0935\u093e \u0915\u0940 \u0926\u093f\u0936\u093e \u092e\u0947\u0902 \u092b\u0948\u0932\u0924\u0940 \u0939\u0948, \u0932\u0947\u0915\u093f\u0928 \u090f\u0915 \u0905\u091a\u094d\u091b\u0947 \u0907\u0902\u0938\u093e\u0928 \u0915\u0940 \u0905\u091a\u094d\u091b\u093e\u0908 \u0938\u092d\u0940 \u0926\u093f\u0936\u093e\u0913\u0902 \u092e\u0947\u0902 \u092b\u0948\u0932\u0924\u0940 \u0939\u0948\u0964',
    author: 'Chanakya',
    category: 'discipline'
  }
];