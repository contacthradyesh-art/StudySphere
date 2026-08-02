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
// page — StudySphere never re-hosts or copies these documents, for both
// copyright safety and so the content is always the current edition.
export const OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    id: 'ncert-textbooks',
    title: 'NCERT Textbooks (Class VI\u2013XII)',
    type: 'Textbooks',
    description: 'The static-syllabus foundation for UPSC \u2014 free, official PDFs for History, Geography, Polity, and Economics across every class.',
    officialUrl: 'https://ncert.nic.in/textbook.php',
    subject: 'other'
  },
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
    id: 'union-budget',
    title: 'Union Budget & Economic Survey (all years)',
    type: 'Budget Documents',
    description: 'The official annual budget documents and Economic Survey \u2014 essential for GS3 economy questions.',
    officialUrl: 'https://www.indiabudget.gov.in',
    subject: 'economy'
  },
  {
    id: 'egazette',
    title: 'The Gazette of India',
    type: 'Official Gazette',
    description: 'Official notifications for new laws, rules, and appointments as they are enacted.',
    officialUrl: 'https://egazette.gov.in',
    subject: 'governance'
  },
  {
    id: 'niti-aayog',
    title: 'Reports & Publications',
    type: 'Policy Think Tank',
    description: 'Policy reports, SDG India Index, and strategy documents from India\u2019s policy think tank.',
    officialUrl: 'https://www.niti.gov.in',
    subject: 'governance'
  },
  {
    id: 'livelaw',
    title: 'Supreme Court & High Court Judgments',
    type: 'Legal News',
    description: 'Judiciary and constitutional-law coverage \u2014 strengthens GS2 answers with real case references.',
    officialUrl: 'https://www.livelaw.in',
    subject: 'polity'
  }
];