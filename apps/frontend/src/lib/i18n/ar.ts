import type { Bundle } from "./en.js";

// <DOMAIN_PLACEHOLDER>: Arabic translations. The structure must mirror `en`.
// Replace placeholder strings as the EO-TACTICA copy is finalised.
export const ar: Bundle = {
  common: {
    loading: "جارٍ التحميل…",
    retry: "إعادة المحاولة",
    cancel: "إلغاء",
    save: "حفظ",
    close: "إغلاق",
    search: "بحث",
    create: "إنشاء",
    open: "فتح",
    error: "حدث خطأ ما",
  },
  app: {
    name: "EO-TACTICA",
    tagline: "لوحة قيادة البرنامج",
  },
  nav: {
    overview: "نظرة عامة على المشروع",
    commandCenter: "مركز القيادة",
    line1: "R1 · صور + رؤية حاسوبية",
    line2: "R2 · وحدات المنصة",
    line3: "R3 · واجهات الموردين",
    line4: "R4 · منصة GSA",
    line5: "R5 · SIGINT",
    tickets: "التذاكر",
    reports: "التقارير",
    settings: "الإعدادات",
    groupOperations: "العمليات",
    groupRequirements: "المتطلبات",
    groupAdmin: "الإدارة",
  },
  pages: {
    commandCenter: {
      title: "مركز القيادة",
      subtitle: "موجز تشغيلي حي عبر خطوط المتطلبات الخمسة",
      kpiConfirmedQuote: "العرض المؤكد",
      kpiInvoiced: "تم إصدار الفاتورة",
      kpiUpcomingQuotes: "العروض القادمة",
      kpiHighPriorityAsks: "طلبات ذات أولوية عالية",
    },
    project: {
      title: "نظرة عامة على المشروع",
      subtitle: "ما هو EO-TACTICA — الهيكل والمالك والإيقاع والنطاق",
    },
    line: {
      contractValue: "قيمة العقد (بدون ضريبة)",
      progress: "التقدم",
      nextMilestone: "المعلم التالي",
      predecessors: "السوابق",
      none: "لا يوجد",
    },
    tickets: {
      title: "التذاكر",
      empty: {
        title: "لا توجد تذاكر بعد",
        detail: "قم بترقية أي عائق أو معلم متأخر لبدء تتبعه هنا.",
      },
      loadError: "فشل تحميل التذاكر.",
      create: "إنشاء تذكرة",
    },
    reports: { title: "التقارير" },
    settings: { title: "الإعدادات" },
  },
  auth: {
    title: "تسجيل الدخول إلى EO-TACTICA",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "تسجيل الدخول",
    invalid: "البريد أو كلمة المرور غير صحيحة",
  },
  tour: {
    next: "التالي",
    back: "السابق",
    skip: "تخطي الجولة",
    done: "تم",
    steps: {
      commandCenter: {
        title: "مركز القيادة",
        body: "حالة موحدة حية عبر جميع خطوط المتطلبات الخمسة.",
        bullet1: "العرض المؤكد مقابل الفواتير اليوم.",
        bullet2: "معالم هذا الأسبوع عبر R1..R5.",
        bullet3: "الطلبات الحرجة موجهة إلى المالك المسؤول.",
      },
      lines: {
        title: "خطوط المتطلبات",
        body: "كل خط يملك شريط مؤشرات أداء وعلامات تفاصيل خاصة به.",
        bullet1: "انقر على أي خط لعرض مهامه ومقاييسه.",
        bullet2: "السوابق تحرك محرك الكاسكيد.",
        bullet3: "قم بترقية أي عائق إلى تذكرة متتبعة.",
      },
      tickets: {
        title: "التذاكر",
        body: "نظام تذاكر مدمج للعوائق وطلبات العملاء والإجراءات التجارية.",
        bullet1: "أنشئها من صف أو لوحة أو من واجهة الأوامر.",
        bullet2: "أولوية Tier 1..4 تتحكم في الترتيب ولون الشارة.",
        bullet3: "التذاكر المرتبطة بمصدر تتيح الرجوع المباشر إلى الصف الأصلي.",
      },
    },
  },
};
