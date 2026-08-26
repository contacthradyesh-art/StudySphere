import type { CurrentAffairsItem } from './current-affairs-schema';

const now = Date.now();

/** Curated Hindi starter set so the Hub is useful even before the RSS/AI pipeline runs. */
export const HINDI_CURRENT_AFFAIRS: CurrentAffairsItem[] = [
  {
    id: 'hindi-ai-rdi-2026-08', title: 'भारत में AI, क्वांटम और डीप-टेक अनुसंधान को बढ़ावा', source: 'PIB', link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2298231&lang=1&reg=48', publishedAt: now - 14 * 86400000,
    summary: 'सरकार ने AI, क्वांटम तकनीक, सेमीकंडक्टर और जैव-प्रौद्योगिकी जैसे क्षेत्रों में अनुसंधान एवं नवाचार को बढ़ाने के लिए मिशन-आधारित कार्यक्रमों पर जोर दिया है। RDI Fund और National Quantum Mission जैसे प्रयास भारत की तकनीकी आत्मनिर्भरता को मजबूत करने से जुड़े हैं।',
    examRelevance: 'RDI Fund और National Quantum Mission को विज्ञान-तकनीक, नवाचार और आत्मनिर्भरता के GS-III संदर्भ से जोड़ें।', topic: 'AI एवं डीप-टेक नीति', category: 'science-tech', gsPaper: 'GS3', createdAt: now
  },
  {
    id: 'hindi-gobardhan-2026-08', title: 'GOBARdhan: जैव-कचरे से स्वच्छ ऊर्जा और ग्रामीण आय', source: 'PIB', link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2295480&lang=1&reg=3', publishedAt: now - 20 * 86400000,
    summary: 'केंद्र ने GOBARdhan को राष्ट्रीय सर्कुलर बायोएनर्जी योजना के रूप में मंजूरी दी है। इसका लक्ष्य कृषि अवशेष, गोबर और जैविक कचरे से कम्प्रेस्ड बायोगैस, जैविक खाद और ग्रामीण आय के अवसर बढ़ाना है।',
    examRelevance: 'CBG, सर्कुलर इकोनॉमी, कचरा-से-संसाधन और ऊर्जा सुरक्षा को GS-III में जोड़ें।', topic: 'सर्कुलर इकोनॉमी एवं बायोगैस', category: 'environment', gsPaper: 'GS3', createdAt: now
  },
  {
    id: 'hindi-cbdc-dbt-2026-08', title: 'CBDC आधारित DBT: डिजिटल सार्वजनिक अवसंरचना का नया प्रयोग', source: 'PIB', link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2298531&lang=1&reg=1', publishedAt: now - 14 * 86400000,
    summary: 'सरकार ने कुछ केंद्रशासित प्रदेशों में PMGKAY के अंतर्गत CBDC आधारित प्रत्यक्ष लाभ अंतरण के प्रयोग की घोषणा की। इससे डिजिटल भुगतान, लक्षित कल्याण वितरण और पारदर्शिता के बीच संबंध समझा जा सकता है।',
    examRelevance: 'CBDC, DBT और डिजिटल सार्वजनिक अवसंरचना को शासन तथा वित्तीय समावेशन से जोड़ें।', topic: 'CBDC एवं DBT', category: 'governance', gsPaper: 'GS2, GS3', createdAt: now
  },
  {
    id: 'hindi-jjm-2026-08', title: 'जल जीवन मिशन 2.0 और ग्रामीण नल-जल कवरेज', source: 'PIB', link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2298526&lang=2&reg=48', publishedAt: now - 14 * 86400000,
    summary: 'जल जीवन मिशन के तहत ग्रामीण घरों में नल-जल पहुंच बढ़ी है और JJM 2.0 को विस्तारित अवधि तथा बड़े वित्तीय परिव्यय के साथ आगे बढ़ाया गया है। यह जल सुरक्षा और सेवा-प्रदाय की क्षमता से जुड़ा महत्वपूर्ण शासन मुद्दा है।',
    examRelevance: 'JJM को जल सुरक्षा, सहकारी संघवाद, स्थानीय निकाय और SDG-6 के साथ जोड़कर पढ़ें।', topic: 'जल सुरक्षा एवं स्थानीय शासन', category: 'governance', gsPaper: 'GS2, GS3', createdAt: now
  },
  {
    id: 'hindi-green-hydrogen-2026-08', title: 'राष्ट्रीय हरित हाइड्रोजन मिशन और ऊर्जा संक्रमण', source: 'PIB', link: 'https://www.pib.gov.in/newsite/pmreleases.aspx?lang=2&mincode=28&reg=3', publishedAt: now - 15 * 86400000,
    summary: 'भारत हरित हाइड्रोजन के उत्पादन और उपयोग को बढ़ाने के लिए मिशन-आधारित कार्यक्रम चला रहा है। पेट्रोलियम और रिफाइनिंग जैसे क्षेत्रों में इसका विस्तार जीवाश्म ईंधन निर्भरता घटाने और ऊर्जा संक्रमण से जुड़ा है।',
    examRelevance: 'हरित हाइड्रोजन को ऊर्जा सुरक्षा, डीकार्बोनाइजेशन और भारत के जलवायु लक्ष्यों से जोड़ें।', topic: 'हरित हाइड्रोजन', category: 'environment', gsPaper: 'GS3', createdAt: now
  },
  {
    id: 'hindi-anrf-2026-08', title: 'ANRF और भारत का अनुसंधान-नवाचार पारिस्थितिकी तंत्र', source: 'PIB', link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2298884&lang=1&reg=3', publishedAt: now - 13 * 86400000,
    summary: 'Anusandhan National Research Foundation का उद्देश्य अनुसंधान, नवाचार और उद्यमिता को रणनीतिक दिशा देना है। इसमें प्राकृतिक विज्ञान, इंजीनियरिंग, कृषि और सामाजिक विज्ञान के अंतर्विषयक शोध को बढ़ावा देने पर जोर है।',
    examRelevance: 'ANRF को R&D, innovation ecosystem, private-sector participation और मानव पूंजी के संदर्भ में पढ़ें।', topic: 'अनुसंधान एवं नवाचार नीति', category: 'science-tech', gsPaper: 'GS3', createdAt: now
  },
  {
    id: 'hindi-rbi-price-risks-2026-08', title: 'RBI ने मुद्रास्फीति और विकास पर जोखिमों को रेखांकित किया', source: 'RBI/समाचार विश्लेषण', link: 'https://www.rbi.org.in/', publishedAt: now - 1 * 86400000,
    summary: 'हाल के आर्थिक आकलनों में महंगाई और विकास पर बाहरी तथा घरेलू जोखिमों—जैसे कच्चे तेल की कीमत, मानसून और वैश्विक व्यापार अनिश्चितता—पर ध्यान दिया गया है। UPSC के लिए यह मौद्रिक नीति और मुद्रास्फीति के कारणों को जोड़ने का अवसर है।',
    examRelevance: 'मुद्रास्फीति के supply-side shocks और RBI की मौद्रिक नीति प्रतिक्रिया को समझें।', topic: 'मुद्रास्फीति एवं मौद्रिक नीति', category: 'economy', gsPaper: 'GS3', createdAt: now
  },
  {
    id: 'hindi-monsoon-2026-08', title: 'मानसून, अत्यधिक वर्षा और आपदा प्रबंधन', source: 'IMD आधारित विश्लेषण', link: 'https://mausam.imd.gov.in/', publishedAt: now - 1 * 86400000,
    summary: 'अगस्त के अंत में देश के कई हिस्सों में व्यापक वर्षा और कुछ क्षेत्रों में भारी से बहुत भारी वर्षा की चेतावनी दी गई है। ऐसी घटनाएं शहरी बाढ़, कृषि, जल संसाधन और आपदा-तैयारी के लिए महत्वपूर्ण हैं।',
    examRelevance: 'अत्यधिक वर्षा को आपदा प्रबंधन, शहरी बाढ़, जलवायु परिवर्तन और जल संसाधन से जोड़ें।', topic: 'मानसून एवं आपदा प्रबंधन', category: 'environment', gsPaper: 'GS1, GS3', createdAt: now
  }
];
