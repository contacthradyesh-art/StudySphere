export type RiverType = 'himalayan' | 'peninsular';

export interface RiverInfo {
  id: string;
  name: string;
  type: RiverType;
  origin: string;
  lengthKm: number;
  outflow: string;
  states: string[];
  tributaries: string[];
  significance: string;
  /** Names as they appear in the Natural Earth dataset (public/data/world-rivers.geojson),
   *  used to match this entry to its map line. Not every river has a match — Natural Earth's
   *  global-scale rivers layer doesn't include every mid-size Indian river (see README note
   *  in map-practice/page.tsx for which ones currently have no line). */
  matchNames: string[];
}

export const RIVERS: RiverInfo[] = [
  {
    id: 'ganga',
    name: 'Ganga (Ganges)',
    type: 'himalayan',
    origin: 'Gangotri Glacier (Gaumukh), Uttarakhand',
    lengthKm: 2525,
    outflow: 'Bay of Bengal (via the Ganga-Brahmaputra delta, Sundarbans)',
    states: ['Uttarakhand', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'West Bengal'],
    tributaries: ['Yamuna', 'Ghaghara', 'Gandak', 'Kosi', 'Son', 'Ramganga', 'Damodar'],
    significance: 'India\u2019s longest river and most sacred; supports the Indo-Gangetic Plain, one of the world\u2019s most fertile and densely populated regions. Subject of the Namami Gange mission for pollution control.',
    matchNames: ['Ganges', 'Ganga']
  },
  {
    id: 'yamuna',
    name: 'Yamuna',
    type: 'himalayan',
    origin: 'Yamunotri Glacier, Uttarakhand',
    lengthKm: 1376,
    outflow: 'Joins the Ganga at Prayagraj (Triveni Sangam)',
    states: ['Uttarakhand', 'Himachal Pradesh', 'Haryana', 'Delhi', 'Uttar Pradesh'],
    tributaries: ['Chambal', 'Betwa', 'Ken', 'Sindh', 'Hindon'],
    significance: 'Largest tributary of the Ganga; flows through Delhi and Agra (Taj Mahal). Pollution levels in Delhi stretch are a recurring GS3/environment exam topic.',
    matchNames: ['Yamuna']
  },
  {
    id: 'brahmaputra',
    name: 'Brahmaputra',
    type: 'himalayan',
    origin: 'Angsi Glacier, near Mount Kailash, Tibet (known as Yarlung Tsangpo there)',
    lengthKm: 2900,
    outflow: 'Bay of Bengal (joins the Ganga delta in Bangladesh as the Jamuna)',
    states: ['Arunachal Pradesh', 'Assam'],
    tributaries: ['Dibang', 'Lohit', 'Subansiri', 'Teesta', 'Manas'],
    significance: 'One of the few major rivers that is male-named in Indian tradition; known for the Majuli river island (world\u2019s largest) and frequent flooding in Assam \u2014 a recurring disaster-management topic.',
    matchNames: ['Brahmaputra']
  },
  {
    id: 'indus',
    name: 'Indus (Sindhu)',
    type: 'himalayan',
    origin: 'Near Lake Mansarovar, Tibetan Plateau',
    lengthKm: 3180,
    outflow: 'Arabian Sea (through Pakistan)',
    states: ['Ladakh', 'Punjab (Beas, Sutlej, Ravi are Indus tributaries)'],
    tributaries: ['Jhelum', 'Chenab', 'Ravi', 'Beas', 'Sutlej', 'Zanskar'],
    significance: 'Gave India its name and hosted the Indus Valley Civilization. Governed by the Indus Waters Treaty (1960) with Pakistan \u2014 frequently in current-affairs and international-relations questions.',
    matchNames: ['Indus']
  },
  {
    id: 'godavari',
    name: 'Godavari',
    type: 'peninsular',
    origin: 'Trimbakeshwar, Nashik district, Maharashtra',
    lengthKm: 1465,
    outflow: 'Bay of Bengal',
    states: ['Maharashtra', 'Telangana', 'Andhra Pradesh', 'Chhattisgarh', 'Odisha'],
    tributaries: ['Pranhita', 'Indravati', 'Manjira', 'Wardha', 'Penganga'],
    significance: 'Longest peninsular river; called the "Dakshin Ganga" (Ganga of the South). Basin is the second-largest river basin in India after the Ganga.',
    matchNames: ['Godavari']
  },
  {
    id: 'krishna',
    name: 'Krishna',
    type: 'peninsular',
    origin: 'Mahabaleshwar, Western Ghats, Maharashtra',
    lengthKm: 1400,
    outflow: 'Bay of Bengal',
    states: ['Maharashtra', 'Karnataka', 'Telangana', 'Andhra Pradesh'],
    tributaries: ['Bhima', 'Tungabhadra', 'Koyna', 'Ghataprabha'],
    significance: 'Second-longest peninsular river; inter-state water-sharing disputes over the Krishna (among Maharashtra, Karnataka, Telangana and Andhra Pradesh) are a recurring federalism/GS2 topic.',
    matchNames: ['Krishna']
  },
  {
    id: 'kaveri',
    name: 'Kaveri (Cauvery)',
    type: 'peninsular',
    origin: 'Talakaveri, Brahmagiri Range, Kodagu district, Karnataka',
    lengthKm: 800,
    outflow: 'Bay of Bengal',
    states: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Puducherry'],
    tributaries: ['Hemavati', 'Kabini', 'Bhavani', 'Amaravati'],
    significance: 'Called the "Ganga of the South"; center of the long-running Karnataka\u2013Tamil Nadu water-sharing dispute, adjudicated by the Cauvery Water Disputes Tribunal and Supreme Court \u2014 a frequent GS2 topic.',
    matchNames: ['Cauvery', 'Kaveri']
  },
  {
    id: 'narmada',
    name: 'Narmada',
    type: 'peninsular',
    origin: 'Amarkantak Plateau, Madhya Pradesh',
    lengthKm: 1312,
    outflow: 'Arabian Sea (Gulf of Khambhat) \u2014 flows westward, unlike most peninsular rivers',
    states: ['Madhya Pradesh', 'Maharashtra', 'Gujarat'],
    tributaries: ['Tawa', 'Hiran', 'Barna', 'Orsang'],
    significance: 'Flows through a rift valley between the Vindhya and Satpura ranges. Site of the Sardar Sarovar Dam, historically a major environment-vs-development case study.',
    matchNames: ['Narmada']
  },
  {
    id: 'tapi',
    name: 'Tapi (Tapti)',
    type: 'peninsular',
    origin: 'Multai, Betul district, Madhya Pradesh (Satpura Range)',
    lengthKm: 724,
    outflow: 'Arabian Sea (Gulf of Khambhat)',
    states: ['Madhya Pradesh', 'Maharashtra', 'Gujarat'],
    tributaries: ['Purna', 'Girna', 'Panzara'],
    significance: 'Second major west-flowing peninsular river (after the Narmada); flows through a rift valley parallel to and south of the Narmada.',
    matchNames: ['Tapi', 'Tapti']
  },
  {
    id: 'mahanadi',
    name: 'Mahanadi',
    type: 'peninsular',
    origin: 'Sihawa, Dhamtari district, Chhattisgarh',
    lengthKm: 858,
    outflow: 'Bay of Bengal',
    states: ['Chhattisgarh', 'Odisha'],
    tributaries: ['Seonath', 'Hasdeo', 'Ong', 'Jonk'],
    significance: 'Odisha\u2019s principal river; the Hirakud Dam on it is one of the world\u2019s longest earthen dams and a major flood-control/irrigation project.',
    matchNames: ['Mahanadi']
  }
];

export interface MountainInfo {
  id: string;
  name: string;
  category: 'range' | 'peak';
  states: string[];
  highestPoint: string;
  highestElevationM: number | null;
  /** Coordinates of the highest point, used to place the marker on the map. */
  peakLat: number;
  peakLng: number;
  significance: string;
}

export const MOUNTAINS: MountainInfo[] = [
  {
    id: 'himalayas',
    name: 'Himalayas',
    category: 'range',
    states: ['Jammu and Kashmir', 'Ladakh', 'Himachal Pradesh', 'Uttarakhand', 'Sikkim', 'Arunachal Pradesh'],
    highestPoint: 'Kanchenjunga (highest peak located in India)',
    highestElevationM: 8586,
    peakLat: 27.7025,
    peakLng: 88.1475,
    significance: 'World\u2019s youngest fold mountain range (still rising); acts as a climatic barrier blocking cold Central Asian winds and forcing monsoon rainfall over the subcontinent. Divided into Trans-, Greater (Himadri), Lesser (Himachal) and Outer (Shiwalik) Himalayas.'
  },
  {
    id: 'karakoram',
    name: 'Karakoram Range',
    category: 'range',
    states: ['Ladakh'],
    highestPoint: 'K2 (Godwin Austen) \u2014 highest peak in India/Pakistan-administered territory, 2nd highest in the world',
    highestElevationM: 8611,
    peakLat: 35.8825,
    peakLng: 76.5133,
    significance: 'Home to the Siachen Glacier, the world\u2019s highest militarized zone \u2014 a recurring strategic/border-security topic. Contains more glaciers than any region outside the polar areas.'
  },
  {
    id: 'aravalli',
    name: 'Aravalli Range',
    category: 'range',
    states: ['Rajasthan', 'Haryana', 'Delhi', 'Gujarat'],
    highestPoint: 'Guru Shikhar (Mount Abu)',
    highestElevationM: 1722,
    peakLat: 24.5925,
    peakLng: 72.7139,
    significance: 'One of the world\u2019s oldest fold mountain ranges (Precambrian); now heavily eroded. Acts as a barrier slowing the eastward spread of the Thar Desert \u2014 illegal mining and range depletion are a recurring environment/GS3 issue.'
  },
  {
    id: 'vindhya',
    name: 'Vindhya Range',
    category: 'range',
    states: ['Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'Gujarat'],
    highestPoint: 'Sad-bhawna Shikhar',
    highestElevationM: 752,
    peakLat: 24.6167,
    peakLng: 81.9333,
    significance: 'Traditionally regarded as the symbolic boundary between North and South India (Aryavarta and the Deccan). A block mountain formed by faulting, running roughly east-west across central India.'
  },
  {
    id: 'satpura',
    name: 'Satpura Range',
    category: 'range',
    states: ['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Chhattisgarh'],
    highestPoint: 'Dhupgarh (Pachmarhi)',
    highestElevationM: 1350,
    peakLat: 22.3300,
    peakLng: 78.4200,
    significance: 'Runs parallel to the Vindhyas, south of the Narmada; separates the Narmada and Tapi river valleys. A block mountain range, geologically distinct from the (much older, folded) Himalayas.'
  },
  {
    id: 'western-ghats',
    name: 'Western Ghats (Sahyadri)',
    category: 'range',
    states: ['Gujarat', 'Maharashtra', 'Goa', 'Karnataka', 'Kerala', 'Tamil Nadu'],
    highestPoint: 'Anamudi',
    highestElevationM: 2695,
    peakLat: 10.1631,
    peakLng: 77.0653,
    significance: 'A UNESCO World Heritage Site and one of the world\u2019s eight "hottest hotspots" of biological diversity. Origin point of most peninsular rivers (Godavari, Krishna, Kaveri, Narmada, Tapi). The Gadgil and Kasturirangan committee reports on its ecological protection are frequent GS3/environment exam topics.'
  },
  {
    id: 'eastern-ghats',
    name: 'Eastern Ghats',
    category: 'range',
    states: ['Odisha', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka'],
    highestPoint: 'Jindhagada (Arma Konda)',
    highestElevationM: 1690,
    peakLat: 18.9000,
    peakLng: 82.6167,
    significance: 'Discontinuous and lower than the Western Ghats, broken up by major peninsular rivers (Godavari, Krishna, Mahanadi) cutting through it on their way to the Bay of Bengal. Meets the Western Ghats at the Nilgiri Hills.'
  }
];
