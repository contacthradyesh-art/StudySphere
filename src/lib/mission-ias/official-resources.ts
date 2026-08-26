import type { UpscCategory } from './current-affairs-schema';

export interface OfficialResource {
  id: string;
  title: string;
  type: string;
  description: string;
  officialUrl: string;
  subject: UpscCategory;
  language?: 'Hindi' | 'English' | 'Bilingual';
}

// Only free/official source pages are linked here. StudySphere does not
// re-host pirated or copyrighted commercial book PDFs.
export const OFFICIAL_RESOURCES: OfficialResource[] = [
  // Hindi-medium NCERT foundation
  { id: 'ncert-hindi-textbooks', title: 'NCERT पाठ्यपुस्तकें — हिंदी माध्यम', type: 'Textbooks', description: 'कक्षा 1–12 की आधिकारिक हिंदी पाठ्यपुस्तकें — इतिहास, भूगोल, विज्ञान, सामाजिक विज्ञान और अन्य विषय।', officialUrl: 'https://ncert.nic.in/textbook.php', subject: 'other', language: 'Hindi' },
  { id: 'ncert-history-hindi', title: 'NCERT इतिहास — कक्षा VI–XII', type: 'Textbooks', description: 'प्राचीन, मध्यकालीन और आधुनिक भारत तथा विश्व इतिहास की आधारभूत सामग्री।', officialUrl: 'https://ncert.nic.in/textbook.php', subject: 'other', language: 'Hindi' },
  { id: 'ncert-geography-hindi', title: 'NCERT भूगोल — कक्षा VI–XII', type: 'Textbooks', description: 'भौतिक, मानव और भारतीय भूगोल — GS-I की मजबूत नींव।', officialUrl: 'https://ncert.nic.in/textbook.php', subject: 'environment', language: 'Hindi' },
  { id: 'ncert-polity-hindi', title: 'NCERT राजनीति विज्ञान — हिंदी', type: 'Textbooks', description: 'संविधान, लोकतंत्र, राजनीतिक संस्थाएँ और समकालीन राजनीति।', officialUrl: 'https://ncert.nic.in/textbook.php', subject: 'polity', language: 'Hindi' },
  { id: 'ncert-economy-hindi', title: 'NCERT अर्थशास्त्र — हिंदी', type: 'Textbooks', description: 'भारतीय अर्थव्यवस्था और आर्थिक अवधारणाओं की आधारभूत तैयारी।', officialUrl: 'https://ncert.nic.in/textbook.php', subject: 'economy', language: 'Hindi' },
  { id: 'ncert-science-hindi', title: 'NCERT विज्ञान — हिंदी', type: 'Textbooks', description: 'स्कूल स्तर की विज्ञान सामग्री और UPSC/SSC के लिए conceptual foundation।', officialUrl: 'https://ncert.nic.in/textbook.php', subject: 'science-tech', language: 'Hindi' },

  // UPSC / exam authority
  { id: 'upsc-pyq', title: 'UPSC Previous Year Question Papers', type: 'Exam Authority', description: 'Civil Services के आधिकारिक प्रश्नपत्र — Prelims, Mains और विषयवार papers।', officialUrl: 'https://upsc.gov.in/examinations/previous-question-papers', subject: 'other', language: 'Bilingual' },
  { id: 'upsc-syllabus', title: 'UPSC Syllabus & Notifications', type: 'Exam Authority', description: 'आधिकारिक syllabus, examination notice और परीक्षा से जुड़ी सूचनाएँ।', officialUrl: 'https://upsc.gov.in', subject: 'other', language: 'Bilingual' },

  // Government primary sources
  { id: 'pib-hindi', title: 'PIB हिंदी — Press Releases', type: 'Government Portal', description: 'सरकार की योजनाओं, नीतियों और घटनाक्रमों की आधिकारिक हिंदी जानकारी।', officialUrl: 'https://pib.gov.in', subject: 'governance', language: 'Hindi' },
  { id: 'sansad', title: 'संसद — Lok Sabha & Rajya Sabha', type: 'Parliament Records', description: 'संसदीय कार्यवाही, प्रश्न, विधेयक और अन्य आधिकारिक रिकॉर्ड।', officialUrl: 'https://sansad.in', subject: 'polity', language: 'Bilingual' },
  { id: 'egazette', title: 'भारत का राजपत्र — e-Gazette', type: 'Official Gazette', description: 'कानून, नियम, अधिसूचनाएँ और सरकारी notifications के आधिकारिक रिकॉर्ड।', officialUrl: 'https://egazette.gov.in', subject: 'governance', language: 'Bilingual' },
  { id: 'union-budget', title: 'केंद्रीय बजट & Economic Survey', type: 'Budget Documents', description: 'Union Budget और Economic Survey के आधिकारिक दस्तावेज।', officialUrl: 'https://www.indiabudget.gov.in', subject: 'economy', language: 'Bilingual' },
  { id: 'rbi-publications', title: 'RBI Reports & Publications', type: 'Central Bank Reports', description: 'Monetary policy, financial stability और banking/economy से जुड़े आधिकारिक reports।', officialUrl: 'https://www.rbi.org.in', subject: 'economy', language: 'Bilingual' },
  { id: 'niti-aayog', title: 'NITI Aayog Reports', type: 'Policy Think Tank', description: 'सरकारी नीति, विकास, SDG और policy reports।', officialUrl: 'https://www.niti.gov.in', subject: 'governance', language: 'Bilingual' },
  { id: 'mea', title: 'विदेश मंत्रालय — Statements & Releases', type: 'Government Portal', description: 'भारत की विदेश नीति और अंतरराष्ट्रीय संबंधों से जुड़े आधिकारिक statements।', officialUrl: 'https://www.mea.gov.in', subject: 'international-relations', language: 'Bilingual' },
  { id: 'yojana-kurukshetra', title: 'Yojana & Kurukshetra', type: 'Government Journal', description: 'विकास, ग्रामीण भारत और सामाजिक-आर्थिक मुद्दों पर सरकारी e-journals।', officialUrl: 'https://publicationsdivision.nic.in/journals', subject: 'governance', language: 'Bilingual' },
];
