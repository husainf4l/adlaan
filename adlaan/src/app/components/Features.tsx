'use client';

import { useEffect, useRef, useState } from 'react';

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "🤖",
      title: "مساعد قانوني ذكي",
      description: "ذكاء اصطناعي متطور يفهم السياق القانوني والتقاليد القانونية العربية ومتطلبات الأعمال الحديثة لإنتاج توثيق دقيق.",
      highlight: "معدل دقة 99.7%"
    },
    {
      icon: "⚖️",
      title: "إطار العدالة أولاً",
      description: "مبني على مبدأ العدل، يضمن أن كل وثيقة توازن بين العدالة والامتثال والجدوى التجارية.",
      highlight: "ذكاء ثقافي"
    },
    {
      icon: "🔍",
      title: "مراجعة فورية",
      description: "تحليل فوري للوثائق مع تقييم المخاطر وفحص الامتثال واقتراحات التحسين مدعومة بالذكاء الاصطناعي القانوني.",
      highlight: "تحليل خلال 15 ثانية"
    },
    {
      icon: "🌐",
      title: "دعم متعدد اللغات",
      description: "إنشاء وثائق سلس بالعربية والإنجليزية مع الحفاظ على المصطلحات القانونية المناسبة والوعي بالسياق الثقافي.",
      highlight: "خبرة ثنائية اللغة"
    },
    {
      icon: "🔒",
      title: "أمان المؤسسات",
      description: "منصة معتمدة SOC 2 Type II مع تشفير شامل، مضمنة أن بياناتك القانونية تبقى سرية وآمنة.",
      highlight: "عدم تدريب البيانات"
    },
    {
      icon: "📊",
      title: "لوحة تحليلات",
      description: "رؤى شاملة حول أداء الوثائق ومقاييس الامتثال وتقييم المخاطر القانونية عبر مؤسستك.",
      highlight: "رؤى فورية"
    }
  ];

  return (
    <section ref={sectionRef} className="relative bg-white py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`mx-auto max-w-4xl text-center mb-20 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <p className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-4">
            الميزات الأساسية
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 leading-tight tracking-[-0.02em] mb-8">
            تقنية قانونية ذكية
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-8"></div>
          <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-3xl mx-auto">
            اكتشف كيف يحول أدلان إنشاء الوثائق القانونية بذكاء اصطناعي يفهم القانون الحديث والمبادئ الخالدة للعدالة.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-2 rounded-full inline-block">
                  {feature.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-20 transition-all duration-1000 delay-800 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-lg text-gray-600 mb-8">
            اختبر مستقبل تقنية الذكاء الاصطناعي القانوني
          </p>
          <button className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all duration-300 hover:scale-105">
            <span className="relative z-10">استكشف جميع الميزات</span>
          </button>
        </div>
      </div>
    </section>
  );
}
