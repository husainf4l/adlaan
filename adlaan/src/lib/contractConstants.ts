import { ContractTemplate } from "../types/contracts";

export const contractTemplates: ContractTemplate[] = [
  {
    id: "service",
    name: "عقد خدمات",
    description: "عقد تقديم خدمات مهنية أو استشارية",
    icon: "🤝",
    category: "خدمات",
  },
  {
    id: "employment",
    name: "عقد عمل",
    description: "عقد توظيف موظف أو مستقل",
    icon: "💼",
    category: "توظيف",
  },
  {
    id: "purchase",
    name: "عقد شراء",
    description: "عقد شراء وبيع البضائع أو الممتلكات",
    icon: "🛒",
    category: "تجاري",
  },
  {
    id: "rental",
    name: "عقد إيجار",
    description: "عقد إيجار عقارات أو معدات",
    icon: "🏠",
    category: "عقاري",
  },
  {
    id: "partnership",
    name: "عقد شراكة",
    description: "عقد شراكة تجارية أو مهنية",
    icon: "🤝",
    category: "شراكة",
  },
];

export const quickActions = [
  "إضافة بند جديد",
  "تعديل المبلغ",
  "تغيير المدة",
  "إضافة شروط إضافية",
];

export const features = [
  {
    icon: "🤖",
    title: "ذكاء اصطناعي",
    description: "مساعد ذكي لتحسين العقود",
  },
  {
    icon: "⚡",
    title: "سريع ومرن",
    description: "إنشاء وتعديل فوري للعقود",
  },
  {
    icon: "📋",
    title: "قوالب متنوعة",
    description: "قوالب لجميع أنواع العقود",
  },
];
