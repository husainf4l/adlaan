'use client';

import { useEffect, useRef, useState } from 'react';

export default function Solutions() {
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

  const solutions = [
    {
      icon: "🏢",
      title: "مكاتب القانون التجاري",
      description: "تبسيط صياغة العقود والعناية الواجبة والتوثيق القانوني بذكاء اصطناعي يفهم العلاقات التجارية المعقدة.",
      features: ["إنتاج العقود", "تقارير العناية الواجبة", "حوكمة الشركات"]
    },
    {
      icon: "🏛️",
      title: "الحكومة والقطاع العام",
      description: "إنشاء وثائق السياسات واللوائح والاتفاقيات العامة التي توازن بين المتطلبات القانونية والحساسية الثقافية.",
      features: ["صياغة السياسات", "الامتثال التنظيمي", "الاتفاقيات العامة"]
    },
    {
      icon: "🏪",
      title: "المؤسسات الصغيرة والمتوسطة",
      description: "الوصول إلى ذكاء اصطناعي قانوني على مستوى المؤسسات دون التعقيد، مثالي للشركات النامية في منطقة الشرق الأوسط وشمال أفريقيا.",
      features: ["عقود الموظفين", "اتفاقيات الموردين", "فحوصات الامتثال"]
    },
    {
      icon: "🏥",
      title: "الرعاية الصحية وعلوم الحياة",
      description: "التنقل في لوائح الرعاية الصحية المعقدة مع الحفاظ على خصوصية المرضى وممارسات الرعاية الصحية الثقافية.",
      features: ["امتثال HIPAA", "اتفاقيات البحث", "نماذج موافقة المرضى"]
    }
  ];

  const industries = [
    { name: "المصارف والتمويل", growth: "+34%" },
    { name: "العقارات", growth: "+28%" },
    { name: "التكنولوجيا", growth: "+42%" },
    { name: "الرعاية الصحية", growth: "+31%" },
    { name: "التصنيع", growth: "+25%" },
    { name: "التعليم", growth: "+38%" }
  ];

  return (
    <section ref={sectionRef} className="relative bg-gray-50 py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`mx-auto max-w-4xl text-center mb-20 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <p className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-4">
            الحلول
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 leading-tight tracking-[-0.02em] mb-8">
            مبني لكل احتياج قانوني
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-8"></div>
          <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-3xl mx-auto">
            من الشركات الناشئة إلى المؤسسات، أدلان ينمو مع مؤسستك مع الحفاظ على أعلى معايير الدقة القانونية والذكاء الثقافي.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <div className="text-4xl mb-6">{solution.icon}</div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  {solution.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {solution.description}
                </p>
                <div className="space-y-2">
                  {solution.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Growth Stats */}
        <div className={`transition-all duration-1000 delay-600 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">
              نمو الصناعات مع أدلان
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">
                    {industry.growth}
                  </div>
                  <div className="text-sm text-gray-600">
                    {industry.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Focus */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-800 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h3 className="text-2xl font-light text-gray-900 mb-4">
            موثوق عبر منطقة الشرق الأوسط وشمال أفريقيا
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            دعم المهنيين القانونيين من دبي إلى الرياض، من القاهرة إلى الدار البيضاء
          </p>
          <button className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all duration-300 hover:scale-105">
            <span className="relative z-10">اعثر على حلك</span>
          </button>
        </div>
      </div>
    </section>
  );
}
