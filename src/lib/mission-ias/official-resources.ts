import type { UpscCategory } from './current-affairs-schema';

export interface OfficialResource {
  id: string;
  title: string;
  type: string;
  description: string;
  officialUrl: string;
  subject: UpscCategory;
}

// Every entry links to the source's own official government/institutional
// page — StudySphere never re-hosts, copies, or links to pirated/paid-book
// PDFs. Only genuinely free, official material is included here.
export const OFFICIAL_RESOURCES: OfficialResource[] = [
  // --- NCERT, split by GS-relevant subject so each card points students
  // straight to the right section instead of one generic catch-all link ---
  {
    id: 'ncert-history',
    title: 'NCERT History (Class VI\u2013XII)',
    type: 'Textbooks',
    description: 'Ancient, medieval, modern Indian history and world history \u2014 free official PDFs, all classes.',
    officialUrl: 'https://ncert.nic.in/textbook.php',
    subject: 'other'
  },
  {
    id: 'ncert-geography',
    title: 'NCERT Geography (Class VI\u2013XII)',
    type: 'Textbooks',
    description: 'Physical, human, and Indian geography \u2014 the syllabus foundation for GS1.',
    officialUrl: 'https://ncert.nic.in/textbook.php',
    subject: 'environment'
  },
  {
    id: 'ncert-polity',
    title: 'NCERT Political Science (Class IX\u2013XII)',
    type: 'Textbooks',
    description: 'Constitution, democratic politics, and contemporary world politics \u2014 GS2 foundation.',
    officialUrl: 'https://ncert.nic.in/textbook.php',
    subject: 'polity'
  },
  {
    id: 'ncert-economics',
    title: 'NCERT Economics (Class IX\u2013XII)',
    type: 'Textbooks',
    description: 'Indian economic development, micro/macroeconomics basics \u2014 GS3 foundation.',
    officialUrl: 'https://ncert.nic.in/textbook.php',
    subject: 'economy'
  },
  // --- Current affairs / government primary sources ---
  {
    id: 'pib-archive',
    title: 'PIB Press Releases Archive',
    type: 'Government Portal',
    description: 'Official government press releases \u2014 the primary source behind most current-affairs coverage.',
    officialUrl: 'https://pib.gov.in',
    subject: 'governance'
  },
  {
    id: 'prs-legislative',
    title: 'Bills, Acts & Policy Analysis',
    type: 'Legislative Tracker',
    description: 'Independent, non-partisan tracking and analysis of every Bill before Parliament.',
    officialUrl: 'https://prsindia.org',
    subject: 'polity'
  },
  {
    id: 'sansad',
    title: 'Lok Sabha & Rajya Sabha Proceedings',
    type: 'Parliament Records',
    description: 'Official record of debates, questions, and legislative business in both Houses.',
    officialUrl: 'https://sansad.in',
    subject: 'polity'
  },
  {
    id: 'egazette',
    title: 'The Gazette of India',
    type: 'Official Gazette',
    description: 'Official notifications for new laws, rules, and appointments as they are enacted.',
    officialUrl: 'https://egazette.gov.in',
    subject: 'governance'
  },
  // --- Economy ---
  {
    id: 'union-budget',
    title: 'Union Budget & Economic Survey (all years)',
    type: 'Budget Documents',
    description: 'The official annual budget documents and Economic Survey \u2014 essential for GS3 economy questions.',
    officialUrl: 'https://www.indiabudget.gov.in',
    subject: 'economy'
  },
  {
    id: 'rbi-publications',
    title: 'RBI Reports & Publications',
    type: 'Central Bank Reports',
    description: 'Monetary policy statements, Financial Stability Report, and annual RBI publications.',
    officialUrl: 'https://www.rbi.org.in',
    subject: 'economy'
  },
  // --- Governance / policy think tank ---
  {
    id: 'niti-aayog',
    title: 'Reports & Publications',
    type: 'Policy Think Tank',
    description: 'Policy reports, SDG India Index, and strategy documents from India\u2019s policy think tank.',
    officialUrl: 'https://www.niti.gov.in',
    subject: 'governance'
  },
  // --- International Relations ---
  {
    id: 'mea',
    title: 'Ministry of External Affairs \u2014 Statements & Press Releases',
    type: 'Government Portal',
    description: 'Official statements, bilateral relations documents, and foreign policy positions.',
    officialUrl: 'https://www.mea.gov.in',
    subject: 'international-relations'
  },
  // --- Polity / Judiciary ---
  {
    id: 'livelaw',
    title: 'Supreme Court & High Court Judgments',
    type: 'Legal News',
    description: 'Judiciary and constitutional-law coverage \u2014 strengthens GS2 answers with real case references.',
    officialUrl: 'https://www.livelaw.in',
    subject: 'polity'
  },
  // --- UPSC itself ---
  {
    id: 'upsc-official',
    title: 'Syllabus, Notifications & Previous Year Papers',
    type: 'Exam Authority',
    description: 'The exam authority\u2019s own site \u2014 official syllabus, notifications, and downloadable previous year question papers.',
    officialUrl: 'https://upsc.gov.in',
    subject: 'other'
  },
  // --- Yojana / Kurukshetra ---
  {
    id: 'yojana-kurukshetra',
    title: 'Yojana & Kurukshetra (free e-journals)',
    type: 'Government Journal',
    description: 'Ministry of I&B\u2019s monthly journals on development (Yojana) and rural issues (Kurukshetra), free to read.',
    officialUrl: 'https://publicationsdivision.nic.in/journals',
    subject: 'governance'
  }
];