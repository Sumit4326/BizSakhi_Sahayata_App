// Translation system for BizSakhi application
export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.chat': string;
  'nav.income': string;
  'nav.inventory': string;
  'nav.tips': string;
  'nav.loans': string;
  'nav.settings': string;
  'nav.menu': string;
  
  // Common
  'common.add': string;
  'common.edit': string;
  'common.delete': string;
  'common.cancel': string;
  'common.save': string;
  'common.update': string;
  'common.search': string;
  'common.filter': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.refresh': string;

  // Authentication
  'auth.signIn': string;
  'auth.signUp': string;
  'auth.signOut': string;
  'auth.email': string;
  'auth.password': string;
  'auth.confirmPassword': string;
  'auth.fullName': string;
  'auth.phone': string;
  'auth.businessType': string;
  'auth.location': string;
  'auth.welcomeBack': string;
  'auth.signInSubtitle': string;
  'auth.signUpSubtitle': string;
  'auth.dontHaveAccount': string;
  'auth.alreadyHaveAccount': string;

  // Income/Expense
  'income.title': string;
  'income.total': string;
  'income.totalExpense': string;
  'income.netProfit': string;
  'income.addTransaction': string;
  'income.newTransaction': string;
  'income.amount': string;
  'income.category': string;
  'income.description': string;
  'income.recent': string;
  'income.income': string;
  'income.expense': string;
  
  // Inventory
  'inventory.title': string;
  'inventory.totalItems': string;
  'inventory.totalValue': string;
  'inventory.lowStock': string;
  'inventory.lowStockAlert': string;
  'inventory.productName': string;
  'inventory.category': string;
  'inventory.quantity': string;
  'inventory.price': string;
  'inventory.threshold': string;
  'inventory.addProduct': string;
  'inventory.editProduct': string;
  'inventory.noProducts': string;
  
  // Voice
  'voice.listening': string;
  'voice.processing': string;
  'voice.speak': string;
  'voice.stop': string;
  'voice.speakNow': string;
  'voice.speaking': string;
  'voice.gotIt': string;
  'voice.couldNotHear': string;
  'voice.noSpeech': string;
  'voice.networkError': string;
  'voice.stopListening': string;
  'voice.startListening': string;
  
  // Hero Section
  'hero.title': string;
  'hero.subtitle': string;
  'hero.cta': string;

  // Homepage Navigation
  'homepage.features': string;
  'homepage.testimonials': string;
  'homepage.contact': string;

  // Stats on homepage
  'stats.averageRating': string;
  'stats.reviews': string;
  'stats.satisfaction': string;
  'stats.support': string;

  // Features
  'features.title': string;
  'features.subtitle': string;
  'features.chat.title': string;
  'features.chat.desc': string;
  'features.money.title': string;
  'features.money.desc': string;
  'features.inventory.title': string;
  'features.inventory.desc': string;
  'features.tips.title': string;
  'features.tips.desc': string;
  'features.voice.title': string;
  'features.voice.desc': string;
  'features.languages.title': string;
  'features.languages.desc': string;
  'features.fast.title': string;
  'features.fast.desc': string;
  'features.secure.title': string;
  'features.secure.desc': string;
  
  // Testimonials
  'testimonials.title': string;
  'testimonials.subtitle': string;
  'testimonials.1.text': string;
  'testimonials.1.author': string;
  'testimonials.1.business': string;
  'testimonials.2.text': string;
  'testimonials.2.author': string;
  'testimonials.2.business': string;
  'testimonials.3.text': string;
  'testimonials.3.author': string;
  'testimonials.3.business': string;
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.chat': 'Sakhi Chat',
    'nav.income': 'Income/Expense',
    'nav.inventory': 'Inventory',
    'nav.tips': 'Daily Tips',
    'nav.loans': 'Loan Help',
    'nav.settings': 'Settings',
    'nav.menu': 'Menu',
    
    // Common
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.refresh': 'Refresh',

    // Navigation
    'nav.home': 'Home',

    // Authentication
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.businessType': 'Business Type',
    'auth.location': 'Location',
    'auth.welcomeBack': 'Welcome Back',
    'auth.signInSubtitle': 'Sign in to your BizSakhi account',
    'auth.signUpSubtitle': 'Create your BizSakhi account',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    
    // Income/Expense
    'income.title': 'Income & Expense Tracker',
    'income.total': 'Total Income',
    'income.totalExpense': 'Total Expense',
    'income.netProfit': 'Net Profit',
    'income.profit': 'Profit',
    'income.loss': 'Loss',
    'income.summary': 'Summary',
    'income.addTransaction': 'Add New Transaction',
    'income.newTransaction': 'New Transaction',
    'income.amount': 'Amount (₹)',
    'income.category': 'Category',
    'income.description': 'Description',
    'income.recent': 'Recent Transactions',
    'income.income': 'Income',
    'income.expense': 'Expense',
    
    // Inventory
    'inventory.title': 'Inventory Management',
    'inventory.totalItems': 'Total Items',
    'inventory.totalValue': 'Total Value',
    'inventory.lowStock': 'Low Stock',
    'inventory.lowStockAlert': 'Low Stock Alert!',
    'inventory.productName': 'Product Name',
    'inventory.category': 'Category',
    'inventory.quantity': 'Quantity',
    'inventory.price': 'Price (₹)',
    'inventory.threshold': 'Low Stock Threshold',
    'inventory.addProduct': 'Add New Product',
    'inventory.editProduct': 'Edit Product',
    'inventory.noProducts': 'No products found',
    
    // Voice
    'voice.listening': 'Listening...',
    'voice.processing': 'Processing...',
    'voice.speak': 'Speak',
    'voice.stop': 'Stop',
    'voice.speakNow': 'Speak now',
    'voice.speaking': 'Speaking...',
    'voice.gotIt': 'Got it!',
    'voice.couldNotHear': 'Could not hear you clearly',
    'voice.noSpeech': 'No speech detected',
    'voice.networkError': 'Network error',
    'voice.stopListening': 'Stop Listening',
    'voice.startListening': 'Start Listening',
    
    // Hero Section
    'hero.title': 'Empowering Rural Women Entrepreneurs',
    'hero.subtitle': 'Your smart business companion for managing inventory, tracking finances, and growing your business with confidence.',
    'hero.cta': 'Start Your Journey',

    // Homepage Navigation
    'homepage.features': 'Features',
    'homepage.testimonials': 'Success Stories',
    'homepage.contact': 'Contact',

    // Stats
    'stats.averageRating': 'Average Rating',
    'stats.reviews': 'Reviews',
    'stats.satisfaction': 'Satisfaction Rate',
    'stats.support': 'Support',

    // Features
    'features.title': 'Everything You Need to Grow',
    'features.subtitle': 'All the essential tools you need to become a successful entrepreneur in one place',
    'features.chat.title': 'AI Assistant',
    'features.chat.desc': 'Get instant help with voice commands in your local language',
    'features.money.title': 'Money Management',
    'features.money.desc': 'Track income, expenses and plan your business growth',
    'features.inventory.title': 'Inventory Control',
    'features.inventory.desc': 'Keep track of stock levels and never run out',
    'features.tips.title': 'Daily Tips',
    'features.tips.desc': 'Learn new business strategies every day',
    'features.voice.title': 'Voice Support',
    'features.voice.desc': 'Add data and give commands using your voice',
    'features.languages.title': '9+ Languages',
    'features.languages.desc': 'Use in your preferred Indian language',
    'features.fast.title': 'Fast & Simple',
    'features.fast.desc': 'Start using immediately without any difficulty',
    'features.secure.title': 'Secure Data',
    'features.secure.desc': 'Your information is 100% secure and private',
    
    // Testimonials
    'testimonials.title': 'Success Stories',
    'testimonials.subtitle': 'See how BizSakhi has transformed the lives of thousands of women',
    'testimonials.1.text': 'BizSakhi helped me organize my tailoring business. Now I track everything easily!',
    'testimonials.1.author': 'Priya, Bangalore',
    'testimonials.1.business': 'Tailoring Business',
    'testimonials.2.text': 'The voice feature is amazing. I can add transactions while working.',
    'testimonials.2.author': 'Meera, Punjab',
    'testimonials.2.business': 'Agriculture Business',
    'testimonials.3.text': 'My vegetable business grew 50% after using BizSakhi for planning.',
    'testimonials.3.author': 'Lakshmi, Tamil Nadu',
    'testimonials.3.business': 'Vegetable Business',
  },
  
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.chat': 'सखी चैट',
    'nav.income': 'आय/व्यय',
    'nav.inventory': 'स्टॉक',
    'nav.tips': 'दैनिक सुझाव',
    'nav.loans': 'लोन सहायता',
    'nav.settings': 'सेटिंग्स',
    'nav.menu': 'मेन्यू',
    'common.add': 'जोड़ें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.update': 'अपडेट करें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.refresh': 'रीफ्रेश',

    // Authentication
    'auth.signIn': 'लॉग इन करें',
    'auth.signUp': 'खाता बनाएं',
    'auth.signOut': 'लॉग आउट',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.fullName': 'पूरा नाम',
    'auth.phone': 'फोन नंबर',
    'auth.businessType': 'व्यापार प्रकार',
    'auth.location': 'स्थान',
    'auth.welcomeBack': 'स्वागत है',
    'auth.signInSubtitle': 'अपने BizSakhi खाते में लॉग इन करें',
    'auth.signUpSubtitle': 'अपना BizSakhi खाता बनाएं',
    'auth.dontHaveAccount': 'खाता नहीं है?',
    'auth.alreadyHaveAccount': 'पहले से खाता है?',
    'nav.home': 'होम',
    'nav.income': 'आय/व्यय',
    'nav.inventory': 'स्टॉक',
    'nav.tips': 'दैनिक सुझाव',
    'nav.loans': 'लोन सहायता',
    'nav.settings': 'सेटिंग्स',
    'nav.menu': 'मेन्यू',

    // Income/Expense
    'income.title': 'आय और व्यय ट्रैकर',
    'income.total': 'कुल आय',
    'income.totalExpense': 'कुल व्यय',
    'income.netProfit': 'शुद्ध लाभ',
    'income.profit': 'लाभ',
    'income.loss': 'हानि',
    'income.summary': 'सारांश',
    'income.addTransaction': 'नया लेन-देन जोड़ें',
    'income.newTransaction': 'नया लेन-देन',
    'income.amount': 'राशि (₹)',
    'income.category': 'श्रेणी',
    'income.description': 'विवरण',
    'income.recent': 'हाल के लेन-देन',
    'income.income': 'आय',
    'income.expense': 'खर्च',
    
    // Inventory
    'inventory.title': 'स्टॉक प्रबंधन',
    'inventory.totalItems': 'कुल आइटम',
    'inventory.totalValue': 'कुल मूल्य',
    'inventory.lowStock': 'कम स्टॉक',
    'inventory.lowStockAlert': 'कम स्टॉक चेतावनी!',
    'inventory.productName': 'उत्पाद का नाम',
    'inventory.category': 'श्रेणी',
    'inventory.quantity': 'मात्रा',
    'inventory.price': 'मूल्य (₹)',
    'inventory.threshold': 'कम स्टॉक सीमा',
    'inventory.addProduct': 'नया उत्पाद जोड़ें',
    'inventory.editProduct': 'उत्पाद संपादित करें',
    'inventory.noProducts': 'कोई उत्पाद नहीं मिला',
    
    // Voice
    'voice.listening': 'सुन रहा है...',
    'voice.processing': 'प्रोसेसिंग...',
    'voice.speak': 'बोलें',
    'voice.stop': 'रोकें',
    'voice.speakNow': 'अब बोलें',
    'voice.speaking': 'बोल रही हूँ...',
    'voice.gotIt': 'सुन लिया!',
    'voice.couldNotHear': 'आवाज़ नहीं सुन पाया',
    'voice.noSpeech': 'कुछ नहीं सुना',
    'voice.networkError': 'नेटवर्क समस्या',
    'voice.stopListening': 'सुनना बंद करें',
    'voice.startListening': 'सुनना शुरू करें',
    
    // Hero Section
    'hero.title': 'ग्रामीण महिला उद्यमियों को सशक्त बनाना',
    'hero.subtitle': 'स्टॉक प्रबंधन, वित्त ट्रैकिंग और आत्मविश्वास के साथ व्यापार बढ़ाने के लिए आपका स्मार्ट व्यापारिक साथी।',
    'hero.cta': 'अपनी यात्रा शुरू करें',

    // Homepage Navigation
    'homepage.features': 'फीचर्स',
    'homepage.testimonials': 'सफलता की कहानियां',
    'homepage.contact': 'संपर्क',

    // Stats
    'stats.averageRating': 'औसत रेटिंग',
    'stats.reviews': 'समीक्षाएं',
    'stats.satisfaction': 'संतुष्टि दर',
    'stats.support': 'सहायता',

    // Features
    'features.title': 'बढ़ने के लिए सब कुछ',
    'features.subtitle': 'सफल व्यापारी बनने के लिए आवश्यक सभी टूल्स एक ही जगह',
    'features.chat.title': 'AI सहायक',
    'features.chat.desc': 'अपनी स्थानीय भाषा में वॉइस कमांड से तुरंत मदद पाएं',
    'features.money.title': 'पैसे का प्रबंधन',
    'features.money.desc': 'आय, खर्च ट्रैक करें और अपने व्यापार की योजना बनाएं',
    'features.inventory.title': 'स्टॉक नियंत्रण',
    'features.inventory.desc': 'स्टॉक लेवल का ट्रैक रखें और कभी खत्म न होने दें',
    'features.tips.title': 'दैनिक सुझाव',
    'features.tips.desc': 'हर दिन नई व्यापारिक रणनीतियां सीखें',
    'features.voice.title': 'वॉइस सपोर्ट',
    'features.voice.desc': 'अपनी आवाज़ से डेटा एंट्री करें, कमांड दें',
    'features.languages.title': '9+ भाषाएं',
    'features.languages.desc': 'अपनी पसंदीदा भारतीय भाषा में उपयोग करें',
    'features.fast.title': 'तेज़ और सरल',
    'features.fast.desc': 'बिना कठिनाई के तुरंत उपयोग शुरू करें',
    'features.secure.title': 'सुरक्षित डेटा',
    'features.secure.desc': 'आपकी जानकारी 100% सुरक्षित और निजी है',
    
    // Testimonials
    'testimonials.title': 'सफलता की कहानियां',
    'testimonials.subtitle': 'देखिए कैसे BizSakhi ने हज़ारों महिलाओं के जीवन को बदला है',
    'testimonials.1.text': 'BizSakhi ने मेरे सिलाई व्यापार को व्यवस्थित करने में मदद की। अब मैं सब कुछ आसानी से ट्रैक करती हूं!',
    'testimonials.1.author': 'प्रिया, बैंगलोर',
    'testimonials.1.business': 'सिलाई व्यापार',
    'testimonials.2.text': 'वॉइस फीचर अद्भुत है। मैं काम करते समय लेन-देन जोड़ सकती हूं।',
    'testimonials.2.author': 'मीरा, पंजाब',
    'testimonials.2.business': 'कृषि व्यापार',
    'testimonials.3.text': 'BizSakhi का उपयोग करके योजना बनाने के बाद मेरा सब्जी व्यापार 50% बढ़ गया।',
    'testimonials.3.author': 'लक्ष्मी, तमिल नाडु',
    'testimonials.3.business': 'सब्जी व्यापार',
  },
  
  // Additional languages with basic translations
  ta: {
    'nav.home': 'முகப்பு',
    'nav.chat': 'சகி சாட்',
    'nav.income': 'வருமானம்/செலவு',
    'nav.inventory': 'சரக்கு',
    'nav.tips': 'தினசரி குறிப்புகள்',
    'nav.loans': 'கடன் உதவி',
    'nav.settings': 'அமைப்புகள்',
    'nav.menu': 'மெனு',
    'common.add': 'சேர்க்க',
    'common.edit': 'திருத்து',
    'common.delete': 'நீக்கு',
    'common.cancel': 'ரத்து',
    'common.save': 'சேமி',
    'common.update': 'புதுப்பிக்க',
    'common.search': 'தேடு',
    'common.filter': 'வடிகட்டி',
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.refresh': 'புதுப்பிக்க',

    // Income/Expense
    'income.title': 'வருமானம் & செலவு கண்காணிப்பு',
    'income.total': 'மொத்த வருமானம்',
    'income.totalExpense': 'மொத்த செலவு',
    'income.netProfit': 'நிகர லாபம்',
    'income.profit': 'லாபம்',
    'income.loss': 'நஷ்டம்',
    'income.summary': 'சுருக்கம்',
    'income.addTransaction': 'புதிய பரிவர்த்தனை சேர்க்க',
    'income.newTransaction': 'புதிய பரிவர்த்தனை',
    'income.amount': 'தொகை (₹)',
    'income.category': 'வகை',
    'income.description': 'விளக்கம்',
    'income.recent': 'சமீபத்திய பரிவர்த்தனைகள்',
    'income.income': 'வருமானம்',
    'income.expense': 'செலவு',

    // Voice
    'voice.listening': 'கேட்கிறது',
    'voice.processing': 'செயலாக்கம்',
    'voice.speak': 'பேசுங்கள்',
    'voice.stop': 'நிறுத்து',
    'voice.speakNow': 'இப்போது பேசுங்கள்',
    'voice.speaking': 'பேசுகிறேன்...',
    'voice.gotIt': 'கேட்டுவிட்டேன்!',
    'voice.couldNotHear': 'தெளிவாக கேட்க முடியவில்லை',
    'voice.noSpeech': 'பேச்சு கேட்டில்ல',
    'voice.networkError': 'நெட்வொர்க் பிழை',
    'voice.stopListening': 'கேட்பதை நிறுத்து',
    'voice.startListening': 'கேட்க ஆரம்பிக்க',

    'hero.title': 'கிராமப்புற பெண் தொழிலாளர்களை வளர்க்கிறது',
    'hero.subtitle': 'சரக்கு மாநேஜ்மെன்ற், பினான்ஸ் டிராக்கிங், விச்சாளித்தோடு நிங்களுடைய பிசினஸ் வளர்த்தலுக்கான நிங்களுடைய சுமார்த்த பிசினஸ் பார்ட்னர்.',
    'hero.cta': 'உங்கள் பயணத்தைத் தொடங்குங்கள்',

    // Navigation
    'nav.home': 'முகப்பு',

    // Authentication
    'auth.signIn': 'உள்நுழையவும்',
    'auth.signUp': 'கணக்கு உருவாக்கவும்',
    'auth.signOut': 'வெளியேறு',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.confirmPassword': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    'auth.fullName': 'முழு பெயர்',
    'auth.phone': 'தொலைபேசி எண்',
    'auth.businessType': 'வணிக வகை',
    'auth.location': 'இடம்',
    'auth.welcomeBack': 'மீண்டும் வரவேற்கிறோம்',
    'auth.signInSubtitle': 'உங்கள் BizSakhi கணக்கில் உள்நுழையவும்',
    'auth.signUpSubtitle': 'உங்கள் BizSakhi கணக்கை உருவாக்கவும்',
    'auth.dontHaveAccount': 'கணக்கு இல்லையா?',
    'auth.alreadyHaveAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',

    // Homepage Navigation
    'homepage.features': 'அம்சங்கள்',
    'homepage.testimonials': 'வெற்றிக் கதைகள்',
    'homepage.contact': 'தொடர்பு',

    // Stats
    'stats.averageRating': 'சராசரி மதிப்பீடு',
    'stats.reviews': 'விமர்சனங்கள்',
    'stats.satisfaction': 'திருப்தி விகிதம்',
    'stats.support': 'ஆதரவு',

    // Features
    'features.title': 'உங்களுக்கு தேவையான அனைத்தும்',
    'features.subtitle': 'ஒரே இடத்தில் ஒரு வெற்றிகரமான தொழிலதிபராக வளர்ந்து வர தேவையான அனைத்து கருவிகளும்',
    'features.chat.title': 'AI உதவியாளர்',
    'features.chat.desc': 'உங்கள் உள்ளூர் மொழியில் வாய் கட்டளைகளுடன் உடனடி உதவி பெறுங்கள்',
    'features.money.title': 'பண மாநேஜ்மென்ற்',
    'features.money.desc': 'வருமானம், செலவுகள் கண்காணித்து உங்கள் தொழிலை திட்டமிடுங்கள்',
    'features.inventory.title': 'சரக்கு கட்டுப்பாடு',
    'features.inventory.desc': 'சரக்கு அளவுகளை கண்காணித்து எப்போதும் குறையாதபடி செய்க',
    'features.tips.title': 'தினசரி குறிப்புகள்',
    'features.tips.desc': 'தினமும் புதிய தொழில் உத்திகள் கற்றுக்கொள்ளுங்கள்',
    'features.voice.title': 'வாய்ஸ் ஆதரவு',
    'features.voice.desc': 'உங்கள் குரலால் தரவு சேர்த்து கட்டளைகள் வழங்குங்கள்',
    'features.languages.title': '9+ மொழிகள்',
    'features.languages.desc': 'உங்களுக்கு விருப்பமான இந்திய மொழியில் பயன்படுத்துங்கள்',
    'features.fast.title': 'வேகமாக & எளிதாக',
    'features.fast.desc': 'எந்த சிக்கலும் இல்லாமல் உடனே தொடங்குங்கள்',
    'features.secure.title': 'பாதுகாப்பான தரவு',
    'features.secure.desc': 'உங்கள் தகவல் 100% பாதுகாப்பானதும் தனிப்பட்டதும்',

    // Testimonials
    'testimonials.title': 'வெற்றிக் கதைகள்',
    'testimonials.subtitle': 'ஆயிரக்கணக்கான பெண்களின் வாழ்க்கையை BizSakhi எவ்வாறு மாற்றியுள்ளது என்பதை பாருங்கள்',
    'testimonials.1.text': 'BizSakhi எனது தையல் தொழிலை ஒழுங்குபடுத்த உதவியது. இப்போது அனைத்தையும் எளிதாக கண்காணிக்கிறேன்!',
    'testimonials.1.author': 'ப்ரியா, பெங்களூர்',
    'testimonials.1.business': 'தையல் தொழில்',
    'testimonials.2.text': 'வாய்ஸ் அம்சம் அற்புதம். வேலை செய்வதற்கோடு நான் பரிவர்த்தனைகளை சேர்க்க முடிகிறது.',
    'testimonials.2.author': 'மீரா, பஞ்சாப்',
    'testimonials.2.business': 'வேளாண்மை தொழில்',
    'testimonials.3.text': 'திட்டமிட BizSakhi பயன்படுத்திய பிறகு என் காய்கறி விற்பனை 50% அதிகரித்தது.',
    'testimonials.3.author': 'லட்சுமி, தமிழ்நாடு',
    'testimonials.3.business': 'காய்கறி வியாபாரம்',
  } as any,

  ml: {
    'nav.home': 'ഹോം',
    'nav.chat': 'സഖി ചാറ്റ്',
    'nav.income': 'വരുമാനം/ചെലവ്',
    'nav.inventory': 'സ്റ്റോക്ക്',
    'nav.tips': 'ദൈനംദിന നുറുങ്ങുകൾ',
    'nav.loans': 'വായ്പാ സഹായം',
    'nav.settings': 'ക്രമീകരണങ്ങൾ',
    'nav.menu': 'മെനു',
    'common.add': 'ചേർക്കുക',
    'common.edit': 'എഡിറ്റ് ചെയ്യുക',
    'common.delete': 'ഇല്ലാതാക്കുക',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.save': 'സേവ് ചെയ്യുക',
    'common.update': 'അപ്ഡേറ്റ് ചെയ്യുക',
    'common.search': 'തിരയുക',
    'common.filter': 'ഫില്ടറ്',
    'common.loading': 'ലോഡ് ചെയ്യുന്നു...',
    'common.error': 'പിശക്',
    'common.success': 'വിജയം',
    'income.profit': 'ലാഭം',
    'income.loss': 'നഷ്ടം',
    'income.summary': 'സംഗ്രഹം',
    'hero.title': 'ഗ്രാമീണ സ്ത്രീ സംരംഭകരെ ശാക്തീകരിക്കുന്നു',
    'hero.subtitle': 'സ്റ്റോക്ക് മാനേജ്മെന്റ്, ഫിനാൻസ് ട്രാക്കിംഗ്, വിശ്വാസത്തോടെ നിങ്ങളുടെ ബിസിനസ്സ് വളർത്താനുള്ള നിങ്ങളുടെ സ്മാർട്ട് ബിസിനസ്സ് പാർട്ണർ.',
    'hero.cta': 'നിങ്ങളുടെ യാത്ര ആരംഭിക്കുക',

    // Homepage Navigation
    'homepage.features': 'അമ്ചങ്കള്',
    'homepage.testimonials': 'വിജയഗാഥകൾ',
    'homepage.contact': 'ബന്ധപ്പെടുക',

    // Stats
    'stats.averageRating': 'ശരാശരി റേറ്റിംഗ്',
    'stats.reviews': 'റിവ്യൂകൾ',
    'stats.satisfaction': 'തൃപ്തി നിരക്ക്',
    'stats.support': 'സഹായം',

    // Features
    'features.title': 'വളരാൻ വേണ്ടതെല്ലാം',
    'features.subtitle': 'വിജയകരമായ സംരംഭകയാകാൻ ആവശ്യമായ എല്ലാ ഉപകരണങ്ങളും ഒരിടത്ത്',
    'features.chat.title': 'AI അസിസ്റ്റന്റ്',
    'features.chat.desc': 'നിങ്ങളുടെ ഭാഷയിൽ വോയ്സ് കമാൻഡുകളിലൂടെ ഉടൻ സഹായം ലഭിക്കുക',
    'features.money.title': 'ധനകാര്യ മാനേജ്മെന്റ്',
    'features.money.desc': 'വരുമാനവും ചെലവും ട്രാക്ക് ചെയ്ത് നിങ്ങളുടെ ബിസിനസ് പ്ലാൻ ചെയ്യുക',
    'features.inventory.title': 'സ്റ്റോക്ക് നിയന്ത്രണം',
    'features.inventory.desc': 'സ്റ്റോക്ക് നിലകൾ ട്രാക്ക് ചെയ്ത് ഒരിക്കലും തീരാതിരിക്കുക',
    'features.tips.title': 'ദൈനംദിന നുറുങ്ങുകൾ',
    'features.tips.desc': 'പ്രതിദിനം പുതിയ ബിസിനസ് തന്ത്രങ്ങൾ പഠിക്കുക',
    'features.voice.title': 'വോയ്സ് പിന്തുണ',
    'features.voice.desc': 'നിങ്ങളുടെ ശബ്ദം ഉപയോഗിച്ച് ഡാറ്റ ചേർക്കുകയും കമാൻഡുകൾ നൽകുകയും ചെയ്യുക',
    'features.languages.title': '9+ ഭാഷകൾ',
    'features.languages.desc': 'നിങ്ങൾക്ക് ഇഷ്ടമുള്ള ഇന്ത്യൻ ഭാഷയിൽ ഉപയോഗിക്കുക',
    'features.fast.title': 'വേഗതയും ലളിതവും',
    'features.fast.desc': 'ഒരു ബുദ്ധിമുട്ടും ഇല്ലാതെ ഉടൻ തുടങ്ങുക',
    'features.secure.title': 'സുരക്ഷിത ഡാറ്റ',
    'features.secure.desc': 'നിങ്ങളുടെ വിവരങ്ങൾ 100% സുരക്ഷിതവും സ്വകാര്യവുമാണ്',

    // Testimonials
    'testimonials.title': 'വിജയഗാഥകൾ',
    'testimonials.subtitle': 'ആയിരക്കണക്കിന് സ്ത്രീകളുടെ ജീവിതം BizSakhi എങ്ങനെ മാറ്റിയെന്ന് കാണൂ',
    'testimonials.1.text': 'BizSakhi എനിക്ക് എന്റെ തുന്നൽ ബിസിനസ് ക്രമീകരിക്കാൻ സഹായിച്ചു. ഇപ്പോൾ എല്ലാം എളുപ്പത്തിൽ ട്രാക്ക് ചെയ്യാം!',
    'testimonials.1.author': 'പ്രിയ, ബംഗളൂരു',
    'testimonials.1.business': 'തുന്നൽ ബിസിനസ്',
    'testimonials.2.text': 'വോയ്സ് ഫീച്ചർ അത്ഭുതകരമാണ്. ഞാൻ ജോലി ചെയ്യുമ്പോഴും ഇടപാടുകൾ ചേർക്കാം.',
    'testimonials.2.author': 'മീര, പഞ്ചാബ്',
    'testimonials.2.business': 'കൃഷി ബിസിനസ്',
    'testimonials.3.text': 'പ്ലാനിംഗിന് BizSakhi ഉപയോഗിച്ചതിനുശേഷം എന്റെ പച്ചക്കറി ബിസിനസ് 50% വർദ്ധിച്ചു.',
    'testimonials.3.author': 'ലക്ഷ്മി, തമിഴ്നാട്',
    'testimonials.3.business': 'പച്ചക്കറി വ്യാപാരം',
  } as any,

  te: {
    'nav.chat': 'సఖి చాట్',
    'nav.income': 'ఆదాయం/వ్యయం',
    'nav.inventory': 'స్టాక్',
    'nav.tips': 'రోజువారీ చిట్కాలు',
    'nav.loans': 'రుణ సహాయం',
    'nav.settings': 'సెట్టింగ్స్',
    'nav.menu': 'మెనూ',
    'common.add': 'జోడించు',
    'common.edit': 'సవరించు',
    'common.delete': 'తొలగించు',
    'common.cancel': 'రద్దు',
    'common.save': 'సేవ్',
    'common.update': 'అప్డేట్',
    'common.search': 'వెతుకు',
    'common.filter': 'ఫిల్టర్',
    'common.loading': 'లోడ് అవుతోంది...',
    'common.error': 'దోషం',
    'common.success': 'విజయం',
    'hero.title': 'గ్రామീణ మహిళా వ్యవసాయదారുలను శక്తివంతం చേయడం',
    'hero.subtitle': 'స్టాక് నిర్వహణ్, ఫైనాన్స్ ట్రాకింగ్ మరియు విశ്వాసతో మీ వ్యాపారాన్ని పెంచడానికి మీ స్మార്ట് వ്యాపార భాగస്వామి.',
    'hero.cta': 'మీ యాత్రను ప్రారంభించండి',
    // ... (would include full translations)
  } as any,
  
  kn: {
    'nav.chat': 'ಸಖಿ ಚಾಟ್',
    'nav.income': 'ಆದಾಯ/ವೆಚ್ಚ',
    'nav.inventory': 'ಸ್ಟಾಕ್',
    'nav.tips': 'ದೈನಂದಿನ ಸಲಹೆಗಳು',
    'nav.loans': 'ಸಾಲ ಸಹಾಯ',
    'nav.settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'nav.menu': 'ಮೆನು',
    'common.add': 'ಸೇರಿಸು',
    'common.edit': 'ಸಂಪಾದಿಸು',
    'common.delete': 'ಅಳಿಸು',
    'common.cancel': 'ರದ್ದುಗೊಳಿಸು',
    'common.save': 'ಉಳಿಸು',
    'common.update': 'ನವೀಕರಿಸು',
    'common.search': 'ಹುಡುಕು',
    'common.filter': 'ಫಿಲ್ಟರ್',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.error': 'ದೋಷ',
    'common.success': 'ಯಶಸ್ಸು',
    'hero.title': 'ಗ്ರಾಮീಣ ಮಹಿಳಾ ಉದ್ಯಮಿಗಳನ്ನു ಬಲಪಡಿಸുವುದು',
    'hero.subtitle': 'ಸ್ಟಾಕ് ನಿರ్ವಹಣೆ, ಹಣಕಾಸು ಟ್ರ್ಯಾಕಿಂಗ് ಮತ್ತು ವಿಶ്ವಾಸದೊಂದಿಗെ ನಿಮ്ಮ ವ್ಯಾಪಾರವನ്ನു ಬೆಳെಸಲು ನಿಮ്ಮ ಸ್ಮಾರ്ಟ് ವ್ಯಾಪಾರ ಸಹಚರ.',
    'hero.cta': 'ನಿಮ്ಮ ಪ്ರಯಾಣವನ്ನു ಪ്ರಾರಂಭಿಸಿ',
    // ... (would include full translations)
  } as any,
};

export function useTranslation(language: string) {
  const currentTranslations = translations[language] || translations.en;
  
  return {
    t: (key: keyof TranslationKeys): string => {
      return currentTranslations[key] || translations.en[key] || key;
    }
  };
}