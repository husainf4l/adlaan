import { ContractDetails, ChatMessage } from "../types/contracts";
import { contractTemplates } from "./contractConstants";

export const generateContractContent = (type: string, details: ContractDetails): string => {
  const baseContract = `
# عقد ${contractTemplates.find((t) => t.id === type)?.name || "خدمات"}

**التاريخ:** ${new Date().toLocaleDateString("ar-SA")}

## الأطراف المتعاقدة

**الطرف الأول:** ${details.party1 || "[اسم الطرف الأول]"}
- العنوان: ${details.address1 || "[عنوان الطرف الأول]"}
- الهاتف: ${details.phone1 || "[رقم الهاتف]"}

**الطرف الثاني:** ${details.party2 || "[اسم الطرف الثاني]"}
- العنوان: ${details.address2 || "[عنوان الطرف الثاني]"}
- الهاتف: ${details.phone2 || "[رقم الهاتف]"}

## تفاصيل العقد

### المدة والمدة الزمنية
- تاريخ البداية: ${details.startDate || "[تاريخ البداية]"}
- تاريخ الانتهاء: ${details.endDate || "[تاريخ الانتهاء]"}

### القيمة المالية
- القيمة الإجمالية: ${details.amount || "[المبلغ]"} ريال سعودي
- طريقة الدفع: ${details.paymentMethod || "[طريقة الدفع]"}

### الالتزامات والشروط

#### التزامات الطرف الأول:
- ${details.obligations1 || "يلتزم الطرف الأول بتقديم الخدمة المتفق عليها"}
- الالتزام بالمواعيد المحددة
- ضمان جودة الخدمة المقدمة

#### التزامات الطرف الثاني:
- ${details.obligations2 || "يلتزم الطرف الثاني بدفع المبلغ المتفق عليه"}
- توفير المعلومات والوثائق اللازمة
- التعاون مع الطرف الأول لإنجاز العمل

### شروط الإلغاء والفسخ
- يحق لأي من الطرفين إلغاء العقد بإشعار مسبق 30 يوماً
- في حالة الإخلال بالشروط، يحق للطرف المتضرر فسخ العقد فوراً

### أحكام عامة
- يخضع هذا العقد للأنظمة السارية في المملكة العربية السعودية
- أي تعديل على هذا العقد يجب أن يكون كتابياً وموقعاً من الطرفين
- في حالة النزاع، يتم الرجوع للجهات المختصة

## التوقيعات

**الطرف الأول:** ___________________
التوقيع والتاريخ

**الطرف الثاني:** ___________________
التوقيع والتاريخ

---
*تم إنشاء هذا العقد باستخدام نظام أدلان الذكي*
  `;

  return baseContract.trim();
};

export const generateAIResponse = (userMessage: string): ChatMessage => {
  const responses = [
    "فهمت طلبك. سأقوم بتعديل العقد وفقاً لما ذكرت. دعني أعدل البند المحدد.",
    "هذا اقتراح ممتاز. سأضيف هذا البند إلى العقد لجعله أكثر وضوحاً.",
    "أرى أنك تريد تعديل شروط الدفع. سأحدث العقد ليعكس هذه التغييرات.",
    "هل تريد إضافة المزيد من التفاصيل حول هذا البند؟ يمكنني مساعدتك في صياغته بشكل قانوني أفضل.",
    "تم التحديث! راجع النسخة الجديدة من العقد. هل هناك تعديلات أخرى تريد إجراءها؟",
  ];

  return {
    id: `ai-${Date.now()}`,
    type: "ai",
    content: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date().toISOString(),
    action: "edit",
  };
};

export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "draft":
      return "مسودة";
    case "reviewing":
      return "قيد المراجعة";
    case "final":
      return "نهائي";
    default:
      return status;
  }
};

export const getStatusStyle = (status: string): string => {
  switch (status) {
    case "draft":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "reviewing":
      return "bg-indigo-100 text-indigo-800 border border-indigo-200";
    case "final":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-200";
  }
};
