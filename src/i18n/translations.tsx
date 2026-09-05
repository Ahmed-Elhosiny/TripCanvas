import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Locale = 'en' | 'ar';

const STORAGE_KEY = 'tripcanvas:locale:v1';

// Get browser preferred language
function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  return 'en';
}

// Get saved locale or fallback to browser/default
function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {
    // localStorage not available
  }
  return getBrowserLocale();
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

// Flatten translations for easy lookup
function flattenTranslations(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTranslations(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  return result;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // localStorage not available
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const isRTL = locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Memoize flattened translations
  const flatTranslations = useCallback(() => {
    return flattenTranslations(translations[locale]);
  }, [locale]);

  const t = useCallback((key: string): string => {
    const flat = flatTranslations();
    return flat[key] ?? key;
  }, [flatTranslations]);

  const value: I18nValue = { locale, setLocale, t, dir, isRTL };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// Hook to apply document direction and lang attribute
export function useDocumentDirection() {
  const { locale, dir } = useI18n();
  
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);
}

export const translations = {
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      reset: 'Reset',
      export: 'Export',
      import: 'Import',
      settings: 'Settings',
      language: 'Language',
      currency: 'Currency',
      unit: 'Unit',
      traveler: 'Traveler',
      email: 'Email',
      home: 'Home',
    },
    // Navigation
    navigation: {
      home: 'Home',
      trips: 'My Trips',
      dashboard: 'Dashboard',
      itinerary: 'Itinerary',
      discover: 'Discover',
      map: 'Map',
      budget: 'Budget',
      memories: 'Memories',
      overview: 'Overview',
      settings: 'Settings',
      accountMenu: 'Account menu',
      exportData: 'Export data',
      resetDemoData: 'Reset demo data',
    },
    // Landing page
    landing: {
      navMethod: 'THE METHOD',
      navNotes: 'FIELD NOTES',
      openTrips: 'Open my trips',
      heroTagline: 'ITINERARY · MAP · BUDGET · JOURNAL',
      heroTitle1: 'Your trip.',
      heroTitle2: 'Beautifully',
      heroTitle3: 'planned.',
      heroDesc: 'TripCanvas lays your whole journey on a single canvas — the day-by-day plan, a live map of everywhere you\'re going, a budget that keeps score, and a journal for when it\'s over.',
      startPlanning: 'Start planning',
      seeHowItWorks: 'See how it works',
      heroFooter: 'NO ACCOUNT · DEMO TRIPS INSIDE · 41.90°N 12.49°E',
      boardingPass: 'BOARDING · ITINERARY №001',
      route: 'ROM → VCE',
      dayLabel: 'DAY 01 · ROME',
      stops: 'STOPS',
      duration: 'DAYS',
      budget: 'BUDGET',
      methodTitle1: 'One canvas for the',
      methodTitle2: 'whole',
      methodTitle3: 'journey.',
      methodDesc: 'Five movements, from the first daydream to the last souvenir. Everything lives in the same workspace, so nothing gets lost between apps, screenshots and group chats.',
      tryWorkspace: 'Try it in the workspace',
      chapter1Title: 'Plan',
      chapter1Sub: 'Your whole trip on one canvas',
      chapter1Copy: 'Days down the left, moments down the page. Drag a dinner between Tuesdays, drop the Vatican on day two, and watch every count, cost and map pin update itself.',
      chapter2Title: 'Explore',
      chapter2Sub: 'Discover places worth the detour',
      chapter2Copy: 'A curated field guide for every city — attractions, trattorias, markets, viewpoints. Save what calls to you and it lands straight on your map.',
      chapter3Title: 'Route',
      chapter3Sub: 'Build my day, minus the zigzag',
      chapter3Copy: 'Pick the places, set your hours, and TripCanvas reorders the day into a walkable line — nearest-neighbour logic, 2-opt polish, and the minutes you saved.',
      chapter4Title: 'Budget',
      chapter4Sub: 'Know where every euro walks to',
      chapter4Copy: 'Stays, plates, trains, tickets — logged in two taps and charted live against the number you set before you packed.',
      chapter5Title: 'Remember',
      chapter5Sub: 'The trip becomes a keepsake',
      chapter5Copy: 'When the suitcase is unpacked, pin photos, dates and one-line truths into an editorial journal you\'ll actually reread.',
      quote: '"We planned ten days of Italy in one evening — and the map knew our route better than we did by day three."',
      quoteAttribution: 'ELENA & MARCO · TRIP №001 · ROME — VENICE',
      finalCall: 'FINAL CALL',
      closingTitle1: 'The world is waiting. Plan it',
      closingTitle2: 'beautifully',
      closingDesc: 'Three demo trips are packed and ready — open Italy and start dragging your first day around.',
      openCanvas: 'Open the canvas',
      peekItaly: 'Peek at the Italy itinerary',
      footerTagline: 'PLAN THE JOURNEY · KEEP THE MEMORY · © 2025',
      // Demo content for mini components
      demo: {
        espresso: 'Sant\'Eustachio espresso',
        colosseum: 'Colosseum — skip the line',
        lunch: 'Lunch in Trastevere',
        forum: 'Roman Forum at golden hour',
        dateRome: 'MON · MAY 12 — ROME',
      },
    },
    // Dashboard
    dashboard: {
      title: 'Your adventures',
      subtitle: 'Every journey starts with a single step.',
      newTrip: 'New trip',
      searchPlaceholder: 'Search trips...',
      noTripsTitle: 'No trips yet',
      noTripsDesc: 'Create your first adventure and start planning.',
      createTrip: 'Create trip',
      tripStatus: 'Status',
      tripDates: 'Dates',
      tripBudget: 'Budget',
      tripCities: 'Cities',
      tripActivities: 'Activities',
      deleteTrip: 'Delete trip',
      viewTrip: 'View trip',
    },
    // Trip creation
    createTrip: {
      title: 'Create new trip',
      name: 'Trip name',
      namePlaceholder: 'e.g., Summer in Italy',
      startDate: 'Start date',
      endDate: 'End date',
      cities: 'Cities',
      citiesPlaceholder: 'Add cities...',
      budget: 'Budget',
      budgetPlaceholder: 'Enter budget',
      coverImage: 'Cover image',
      create: 'Create trip',
      cancel: 'Cancel',
    },
    // Itinerary
    itinerary: {
      title: 'Itinerary',
      days: 'DAYS',
      dayLabel: 'DAY',
      of: 'of',
      stops: 'STOPS',
      planned: 'PLANNED',
      estimated: 'EST.',
      noCostsYet: 'NO COSTS YET',
      buildThisDay: 'Build this day',
      addActivity: 'Add activity',
      blankCanvasTitle: 'A blank canvas',
      blankCanvasDesc: 'Nothing planned for this day yet. Add a moment, or let Build my day compose the whole route for you.',
      pullFromDiscover: 'Pull from Discover',
      dayOnMap: 'DAY ON THE MAP',
      expand: 'Expand',
      walkingEst: 'WALKING EST.',
      moveAnotherDay: 'Moved to another day',
      activityUpdated: 'Activity updated',
      activityRemoved: 'Activity removed',
      activityMoved: 'Moved & updated',
      addedToPlan: 'Added to the plan',
      tipDragCard: 'TIP — DRAG A CARD ONTO ANOTHER DAY TO MOVE IT',
      onMap: 'on map',
      until: 'until',
      editActivity: 'Edit activity',
      moveOrDelete: 'Move or delete',
      moveTo: 'Move to',
      stopNumber: 'Stop',
    },
    // Activity modal
    activity: {
      title: 'Activity',
      editTitle: 'Edit activity',
      addTitle: 'Add activity',
      activityName: 'Activity name',
      namePlaceholder: 'e.g., Visit Colosseum',
      category: 'Category',
      time: 'Time',
      duration: 'Duration',
      cost: 'Cost',
      note: 'Note',
      notePlaceholder: 'Add a personal note...',
      location: 'Location',
      save: 'Save activity',
      cancel: 'Cancel',
      delete: 'Delete activity',
    },
    // Build Day
    buildday: {
      title: 'Build My Day',
      subtitle: 'Let TripCanvas compose your perfect day',
      description: 'Select the places you want to visit and we\'ll arrange them into an efficient, walkable route.',
      selectedPlaces: 'Selected places',
      availablePlaces: 'Available places',
      generateRoute: 'Generate route',
      addToItinerary: 'Add to itinerary',
      cancel: 'Cancel',
      noPlacesTitle: 'No places selected',
      noPlacesDesc: 'Select places from the list to build your day.',
      browseDiscover: 'Browse Discover',
      clearSelection: 'Clear selection',
      optimizeSuccess: 'Route optimized! Check the preview.',
    },
    // Discover
    discover: {
      title: 'Discover',
      subtitle: 'Curated places worth your time',
      searchPlaceholder: 'Search places...',
      allCategories: 'All categories',
      filters: 'Filters',
      sortBy: 'Sort by',
      rating: 'Rating',
      reviews: 'reviews',
      savePlace: 'Save place',
      unsavePlace: 'Unsave place',
      saved: 'Saved',
      addToDay: 'Add to day',
      viewOnMap: 'View on map',
      noResultsTitle: 'No places found',
      noResultsDesc: 'Try adjusting your filters or search term.',
      clearFilters: 'Clear filters',
      hours: 'Hours',
      blurb: 'About',
    },
    // Map
    map: {
      title: 'Map',
      list: 'List',
      selectedPlace: 'Selected place',
      noPlaceSelected: 'No place selected',
      selectMarker: 'Select a marker to see details',
      savedPlaces: 'Saved places',
      itineraryStops: 'Itinerary stops',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      directions: 'Directions',
      distance: 'Distance',
      route: 'Route',
    },
    // Budget
    budget: {
      title: 'Budget',
      totalBudget: 'Total budget',
      spent: 'Spent',
      remaining: 'Remaining',
      planned: 'Planned',
      setBudget: 'Set budget',
      addExpense: 'Add expense',
      editExpense: 'Edit expense',
      expenses: 'Expenses',
      noExpensesTitle: 'No expenses yet',
      noExpensesDesc: 'Track your spending by adding expenses.',
      addFirstExpense: 'Add first expense',
      category: 'Category',
      amount: 'Amount',
      date: 'Date',
      label: 'Label',
      note: 'Note',
      notePlaceholder: 'Add details...',
      deleteExpense: 'Delete expense',
      expenseUpdated: 'Expense updated',
      expenseAdded: 'Expense added',
      expenseRemoved: 'Expense removed',
      overBudget: 'Over budget!',
      onTrack: 'On track',
      budgetSummary: 'Budget summary',
      byCategory: 'By category',
    },
    // Memories
    memories: {
      title: 'Memories',
      subtitle: 'Your journey, captured',
      addMemory: 'Add memory',
      editMemory: 'Edit memory',
      noMemoriesTitle: 'No memories yet',
      noMemoriesDesc: 'Pin photos and moments from your trip.',
      addFirstMemory: 'Add first memory',
      photo: 'Photo',
      caption: 'Caption',
      captionPlaceholder: 'Write a caption...',
      place: 'Place',
      date: 'Date',
      note: 'Note',
      notePlaceholder: 'Add more details...',
      deleteMemory: 'Delete memory',
      memoryAdded: 'Memory added',
      memoryDeleted: 'Memory deleted',
    },
    // Settings
    settings: {
      title: 'Settings',
      profile: 'Profile',
      preferences: 'Preferences',
      data: 'Data',
      travelerName: 'Traveler name',
      email: 'Email address',
      homeCity: 'Home city',
      currency: 'Currency',
      distanceUnit: 'Distance unit',
      kilometers: 'Kilometers',
      miles: 'Miles',
      saveChanges: 'Save changes',
      changesSaved: 'Settings saved',
      exportData: 'Export data',
      exportSuccess: 'Export ready',
      exportDesc: 'Your trips were downloaded as JSON.',
      resetData: 'Reset data',
      resetConfirm: 'Reset demo data?',
      resetDesc: 'This discards every change you\'ve made and restores the original Italy, Japan and Paris trips. There\'s no undo.',
      keepTrips: 'Keep my trips',
      resetEverything: 'Reset everything',
      dataRestored: 'Demo data restored',
      freshCanvas: 'Fresh canvas, fresh journey.',
      careful: 'Careful',
    },
    // Categories
    categories: {
      attraction: 'Attraction',
      restaurant: 'Restaurant',
      cafe: 'Café',
      museum: 'Museum',
      shopping: 'Shopping',
      nature: 'Nature',
      logistics: 'Logistics',
      other: 'Other',
      stays: 'Stays',
      food: 'Food',
      transport: 'Transport',
      activities: 'Activities',
    },
    // Status
    status: {
      draft: 'Draft',
      planning: 'Planning',
      ready: 'Ready',
      completed: 'Completed',
    },
    // Validation
    validation: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      invalidDate: 'Please enter a valid date',
      endDateAfterStart: 'End date must be after start date',
      minBudget: 'Budget must be at least 0',
      nameTooShort: 'Name is too short',
      nameTooLong: 'Name is too long',
    },
    // Toasts
    toasts: {
      success: 'Success',
      error: 'Error',
      info: 'Info',
      tripCreated: 'Trip created',
      tripDeleted: 'Trip deleted',
      placeSaved: 'Place saved',
      placeUnsaved: 'Place removed from saved',
    },
    // Cities
    cities: {
      rome: 'Rome',
      florence: 'Florence',
      venice: 'Venice',
      paris: 'Paris',
      tokyo: 'Tokyo',
      kyoto: 'Kyoto',
      osaka: 'Osaka',
    },
    // Wordmark
    wordmark: {
      brand: 'TripCanvas',
      tagline: 'FIELD PLANNER',
      home: 'TripCanvas home',
    },
    // Footer
    footer: {
      tagline: 'TRIPCANVAS — PLAN · ROUTE · REMEMBER',
      coords: '41.9028° N, 12.4964° E · MADE FOR WANDERERS',
    },
    // Build My Day specific
    bmd: {
      title: 'Build My Day',
      generating: 'Generating your perfect day...',
      generated: 'Generated!',
      preview: 'Preview',
      shuffle: 'Shuffle',
      reset: 'Reset',
      apply: 'Apply to day',
      optimizing: 'Optimizing route...',
      optimized: 'Route optimized',
      timeSaved: 'Time saved',
      distanceReduced: 'Distance reduced',
    },
  },
  ar: {
    // Common
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      close: 'إغلاق',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      remove: 'إزالة',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      done: 'تم',
      search: 'بحث',
      filter: 'تصفية',
      clear: 'مسح',
      reset: 'إعادة تعيين',
      export: 'تصدير',
      import: 'استيراد',
      settings: 'الإعدادات',
      language: 'اللغة',
      currency: 'العملة',
      unit: 'الوحدة',
      traveler: 'المسافر',
      email: 'البريد الإلكتروني',
      home: 'الرئيسية',
    },
    // Navigation
    navigation: {
      home: 'الرئيسية',
      trips: 'رحلاتي',
      dashboard: 'لوحة التحكم',
      itinerary: 'مسار الرحلة',
      discover: 'اكتشف',
      map: 'الخريطة',
      budget: 'الميزانية',
      memories: 'الذكريات',
      overview: 'نظرة عامة',
      settings: 'الإعدادات',
      accountMenu: 'قائمة الحساب',
      exportData: 'تصدير البيانات',
      resetDemoData: 'إعادة البيانات التجريبية',
    },
    // Landing page
    landing: {
      navMethod: 'الطريقة',
      navNotes: 'ملاحظات ميدانية',
      openTrips: 'افتح رحلاتي',
      heroTagline: 'مسار الرحلة · الخريطة · الميزانية · المفكرة',
      heroTitle1: 'رحلتك.',
      heroTitle2: 'بشكل',
      heroTitle3: 'رائع.',
      heroDesc: 'ترسم TripCanvas رحلتك الكاملة على لوحة واحدة — خطة يوم بيوم، وخريطة حية لكل مكان ستذهب إليه، وميزانية تحافظ على حساباتك، ومفكرة لتدوين ما بعد الرحلة.',
      startPlanning: 'ابدأ التخطيط',
      seeHowItWorks: 'شاهد كيف يعمل',
      heroFooter: 'بدون حساب · رحلات تجريبية داخل · 41.90°N 12.49°E',
      boardingPass: 'صعود · مسار الرحلة رقم 001',
      route: 'ROM → VCE',
      dayLabel: 'اليوم 01 · روما',
      stops: 'محطات',
      duration: 'أيام',
      budget: 'الميزانية',
      methodTitle1: 'لوحة واحدة لـ',
      methodTitle2: 'كامل',
      methodTitle3: 'الرحلة.',
      methodDesc: 'خمس حركات، من الحلم الأول إلى آخر تذكار. كل شيء يعيش في مساحة العمل نفسها، فلا يضيع شيء بين التطبيقات ولقطات الشاشة ومحادثات المجموعة.',
      tryWorkspace: 'جرّبه في مساحة العمل',
      chapter1Title: 'خطّط',
      chapter1Sub: 'رحلتك كاملة على لوحة واحدة',
      chapter1Copy: 'الأيام على اليسار، واللحظات تنساب على الصفحة. اسحب عشاءً بين أيام الثلاثاء، وأضف الفاتيكان في اليوم الثاني، وشاهد كل عدد وتكلفة ودبوس خريطة يُحدّث تلقائياً.',
      chapter2Title: 'اكتشف',
      chapter2Sub: 'اكتشف أماكن تستحق الانحراف عن المسار',
      chapter2Copy: 'دليل منسّق لكل مدينة — معالم جذب، Trattorias، أسواق، مناظر خلابة. احفظ ما يثير اهتمامك وسيظهر مباشرة على خريطتك.',
      chapter3Title: 'وجّه المسار',
      chapter3Sub: 'ابنِ يومي، بدون تعرجات',
      chapter3Copy: 'اختر الأماكن، وحدّد ساعاتك، وسيقوم TripCanvas بإعادة ترتيب اليوم في مسار قابل للمشي — منطق أقرب الجيران، صقل 2-opt، والدقائق التي وفّرتها.',
      chapter4Title: 'الميزانية',
      chapter4Sub: 'اعرف أين يذهب كل يورو',
      chapter4Copy: 'الإقامات، الوجبات، القطارات، التذاكر — تُسجّل بنقرتين وتُرسَم مباشرة مقابل الرقم الذي حددته قبل التعبئة.',
      chapter5Title: 'تذكّر',
      chapter5Sub: 'تتحول الرحلة إلى ذكرى ثمينة',
      chapter5Copy: 'عندما تُفرَغ الحقيبة، ثبّت الصور والتواريخ وبعض الحقائق الموجزة في مفكرة تحريرية ستعيد قراءتها فعلاً.',
      quote: '"خطّطنا عشرة أيام في إيطاليا في مساء واحد — وكانت الخريطة تعرف مسارنا أفضل مما عرفناه نحن في اليوم الثالث."',
      quoteAttribution: 'إيلينا وماركو · الرحلة رقم 001 · روما — البندقية',
      finalCall: 'النداء الأخير',
      closingTitle1: 'العالم ينتظر. خطّط له',
      closingTitle2: 'بشكل رائع',
      closingDesc: 'ثلاث رحلات تجريبية جاهزة — افتح إيطاليا وابدأ بسحب يومك الأول.',
      openCanvas: 'افتح اللوحة',
      peekItaly: 'ألقِ نظرة على مسار إيطاليا',
      footerTagline: 'خطّط الرحلة · احفظ الذكرى · © 2025',
      // Demo content for mini components
      demo: {
        espresso: 'إسبرسو سانت يوستاكيو',
        colosseum: 'الكولوسيوم — تخطّ الطابور',
        lunch: 'غداء في تراستيفيري',
        forum: 'المنتدى الروماني في الساعة الذهبية',
        dateRome: 'الاثنين · 12 مايو · روما',
      },
    },
    // Dashboard
    dashboard: {
      title: 'مغامراتك',
      subtitle: 'كل رحلة تبدأ بخطوة أولى.',
      newTrip: 'رحلة جديدة',
      searchPlaceholder: 'بحث في الرحلات...',
      noTripsTitle: 'لا توجد رحلات بعد',
      noTripsDesc: 'أنشئ مغامرتك الأولى وابدأ التخطيط.',
      createTrip: 'إنشاء رحلة',
      tripStatus: 'الحالة',
      tripDates: 'التواريخ',
      tripBudget: 'الميزانية',
      tripCities: 'المدن',
      tripActivities: 'الأنشطة',
      deleteTrip: 'حذف الرحلة',
      viewTrip: 'عرض الرحلة',
    },
    // Trip creation
    createTrip: {
      title: 'إنشاء رحلة جديدة',
      name: 'اسم الرحلة',
      namePlaceholder: 'مثال: صيف في إيطاليا',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء',
      cities: 'المدن',
      citiesPlaceholder: 'أضف مدناً...',
      budget: 'الميزانية',
      budgetPlaceholder: 'أدخل الميزانية',
      coverImage: 'صورة الغلاف',
      create: 'إنشاء الرحلة',
      cancel: 'إلغاء',
    },
    // Itinerary
    itinerary: {
      title: 'مسار الرحلة',
      days: 'الأيام',
      dayLabel: 'اليوم',
      of: 'من',
      stops: 'محطات',
      planned: 'مخطّط',
      estimated: 'تقريبي',
      noCostsYet: 'لا توجد تكاليف بعد',
      buildThisDay: 'ابنِ هذا اليوم',
      addActivity: 'إضافة نشاط',
      blankCanvasTitle: 'لوحة فارغة',
      blankCanvasDesc: 'لا شيء مخطط لهذا اليوم بعد. أضف لحظة، أو دع \"ابنِ يومي\" يؤلف المسار الكامل لك.',
      pullFromDiscover: 'اسحب من اكتشف',
      dayOnMap: 'اليوم على الخريطة',
      expand: 'توسيع',
      walkingEst: 'المشي تقديرياً',
      moveAnotherDay: 'نُقل إلى يوم آخر',
      activityUpdated: 'تم تحديث النشاط',
      activityRemoved: 'تمت إزالة النشاط',
      activityMoved: 'تم النقل والتحديث',
      addedToPlan: 'أُضيف إلى الخطة',
      tipDragCard: 'نصيحة — اسحب بطاقة فوق يوم آخر لنقلها',
      onMap: 'على الخريطة',
      until: 'حتى',
      editActivity: 'تعديل النشاط',
      moveOrDelete: 'نقل أو حذف',
      moveTo: 'نقل إلى',
      stopNumber: 'محطة',
    },
    // Activity modal
    activity: {
      title: 'النشاط',
      editTitle: 'تعديل النشاط',
      addTitle: 'إضافة نشاط',
      activityName: 'اسم النشاط',
      namePlaceholder: 'مثال: زيارة الكولوسيوم',
      category: 'الفئة',
      time: 'الوقت',
      duration: 'المدة',
      cost: 'التكلفة',
      note: 'ملاحظة',
      notePlaceholder: 'أضف ملاحظة شخصية...',
      location: 'الموقع',
      save: 'حفظ النشاط',
      cancel: 'إلغاء',
      delete: 'حذف النشاط',
    },
    // Build Day
    buildday: {
      title: 'ابنِ يومي',
      subtitle: 'دع TripCanvas يؤلف يومك المثالي',
      description: 'اختر الأماكن التي تريد زيارتها وسنقوم بترتيبها في مسار فعال قابل للمشي.',
      selectedPlaces: 'الأماكن المحددة',
      availablePlaces: 'الأماكن المتاحة',
      generateRoute: 'إنشاء المسار',
      addToItinerary: 'إضافة إلى مسار الرحلة',
      cancel: 'إلغاء',
      noPlacesTitle: 'لم يتم تحديد أماكن',
      noPlacesDesc: 'حدد أماكن من القائمة لبناء يومك.',
      browseDiscover: 'تصفح اكتشف',
      clearSelection: 'مسح التحديد',
      optimizeSuccess: 'تم تحسين المسار! تحقق من المعاينة.',
    },
    // Discover
    discover: {
      title: 'اكتشف',
      subtitle: 'أماكن منسّقة تستحق وقتك',
      searchPlaceholder: 'بحث في الأماكن...',
      allCategories: 'كل الفئات',
      filters: 'التصفية',
      sortBy: 'ترتيب حسب',
      rating: 'التقييم',
      reviews: 'مراجعة',
      savePlace: 'حفظ المكان',
      unsavePlace: 'إزالة الحفظ',
      saved: 'محفوظ',
      addToDay: 'إضافة إلى اليوم',
      viewOnMap: 'عرض على الخريطة',
      noResultsTitle: 'لم يتم العثور على أماكن',
      noResultsDesc: 'حاول تعديل التصفية أو مصطلح البحث.',
      clearFilters: 'مسح التصفية',
      hours: 'الساعات',
      blurb: 'حول',
    },
    // Map
    map: {
      title: 'الخريطة',
      list: 'القائمة',
      selectedPlace: 'المكان المحدد',
      noPlaceSelected: 'لم يتم تحديد مكان',
      selectMarker: 'حدد علامة لرؤية التفاصيل',
      savedPlaces: 'الأماكن المحفوظة',
      itineraryStops: 'محطات مسار الرحلة',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      directions: 'الاتجاهات',
      distance: 'المسافة',
      route: 'المسار',
    },
    // Budget
    budget: {
      title: 'الميزانية',
      totalBudget: 'إجمالي الميزانية',
      spent: 'تم إنفاقه',
      remaining: 'المتبقي',
      planned: 'مخطّط',
      setBudget: 'تعيين الميزانية',
      addExpense: 'إضافة مصروف',
      editExpense: 'تعديل المصروف',
      expenses: 'المصروفات',
      noExpensesTitle: 'لا توجد مصروفات بعد',
      noExpensesDesc: 'تتبع إنفاقك بإضافة المصروفات.',
      addFirstExpense: 'إضافة أول مصروف',
      category: 'الفئة',
      amount: 'المبلغ',
      date: 'التاريخ',
      label: 'التسمية',
      note: 'ملاحظة',
      notePlaceholder: 'أضف تفاصيل...',
      deleteExpense: 'حذف المصروف',
      expenseUpdated: 'تم تحديث المصروف',
      expenseAdded: 'تمت إضافة المصروف',
      expenseRemoved: 'تمت إزالة المصروف',
      overBudget: 'تجاوز الميزانية!',
      onTrack: 'على المسار الصحيح',
      budgetSummary: 'ملخص الميزانية',
      byCategory: 'حسب الفئة',
    },
    // Memories
    memories: {
      title: 'الذكريات',
      subtitle: 'رحلتك، مُخلَّدة',
      addMemory: 'إضافة ذكرى',
      editMemory: 'تعديل الذكرى',
      noMemoriesTitle: 'لا توجد ذكريات بعد',
      noMemoriesDesc: 'ثبّت صوراً ولحظات من رحلتك.',
      addFirstMemory: 'إضافة أول ذكرى',
      photo: 'صورة',
      caption: 'تعليق',
      captionPlaceholder: 'اكتب تعليقاً...',
      place: 'المكان',
      date: 'التاريخ',
      note: 'ملاحظة',
      notePlaceholder: 'أضف المزيد من التفاصيل...',
      deleteMemory: 'حذف الذكرى',
      memoryAdded: 'تمت إضافة الذكرى',
      memoryDeleted: 'تم حذف الذكرى',
    },
    // Settings
    settings: {
      title: 'الإعدادات',
      profile: 'الملف الشخصي',
      preferences: 'التفضيلات',
      data: 'البيانات',
      travelerName: 'اسم المسافر',
      email: 'عنوان البريد الإلكتروني',
      homeCity: 'المدينة الرئيسية',
      currency: 'العملة',
      distanceUnit: 'وحدة المسافة',
      kilometers: 'كيلومترات',
      miles: 'أميال',
      saveChanges: 'حفظ التغييرات',
      changesSaved: 'تم حفظ الإعدادات',
      exportData: 'تصدير البيانات',
      exportSuccess: 'التصدير جاهز',
      exportDesc: 'تم تنزيل رحلاتك كملف JSON.',
      resetData: 'إعادة البيانات',
      resetConfirm: 'إعادة البيانات التجريبية؟',
      resetDesc: 'سيؤدي هذا إلى تجاهل كل تغيير قمت به واستعادة رحلات إيطاليا واليابان وباريس الأصلية. لا يوجد تراجع.',
      keepTrips: 'الاحتفاظ برحلاتي',
      resetEverything: 'إعادة تعيين كل شيء',
      dataRestored: 'تم استعادة البيانات التجريبية',
      freshCanvas: 'لوحة جديدة، رحلة جديدة.',
      careful: 'احذر',
    },
    // Categories
    categories: {
      attraction: 'معلم سياحي',
      restaurant: 'مطعم',
      cafe: 'مقهى',
      museum: 'متحف',
      shopping: 'تسوق',
      nature: 'طبيعة',
      logistics: 'لوجستيات',
      other: 'أخرى',
      stays: 'الإقامة',
      food: 'الطعام',
      transport: 'المواصلات',
      activities: 'الأنشطة',
    },
    // Status
    status: {
      draft: 'مسودة',
      planning: 'تخطيط',
      ready: 'جاهز',
      completed: 'مكتمل',
    },
    // Validation
    validation: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صالح',
      invalidDate: 'يرجى إدخال تاريخ صالح',
      endDateAfterStart: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء',
      minBudget: 'يجب أن تكون الميزانية 0 على الأقل',
      nameTooShort: 'الاسم قصير جداً',
      nameTooLong: 'الاسم طويل جداً',
    },
    // Toasts
    toasts: {
      success: 'تم',
      error: 'خطأ',
      info: 'معلومات',
      tripCreated: 'تم إنشاء الرحلة',
      tripDeleted: 'تم حذف الرحلة',
      placeSaved: 'تم حفظ المكان',
      placeUnsaved: 'تمت إزالة المكان من المحفوظات',
    },
    // Cities
    cities: {
      rome: 'روما',
      florence: 'فلورنسا',
      venice: 'البندقية',
      paris: 'باريس',
      tokyo: 'طوكيو',
      kyoto: 'كيوتو',
      osaka: 'أوساكا',
    },
    // Wordmark
    wordmark: {
      brand: 'TripCanvas',
      tagline: 'مخطط الرحلات',
      home: 'الرئيسية TripCanvas',
    },
    // Footer
    footer: {
      tagline: 'TRIPCANVAS — خطّط · وجّه · تذكّر',
      coords: '41.9028° شمالاً، 12.4964° شرقاً · صُنّع للمسافرين',
    },
    // Build My Day specific
    bmd: {
      title: 'ابنِ يومي',
      generating: 'جاري توليد يومك المثالي...',
      generated: 'تم التوليد!',
      preview: 'معاينة',
      shuffle: 'عشوائي',
      reset: 'إعادة تعيين',
      apply: 'تطبيق على اليوم',
      optimizing: 'جاري تحسين المسار...',
      optimized: 'تم تحسين المسار',
      timeSaved: 'الوقت المُوفَّر',
      distanceReduced: 'المسافة المُختَصَرة',
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
export type NestedKey<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKey<T[K]>}`
        : K
      : never
    }[keyof T]
  : never;

export type DeepTranslationKey = NestedKey<typeof translations.en>;
