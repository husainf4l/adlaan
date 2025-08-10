"use client";

import { useEffect, useRef, useState } from "react";

export default function Testimonials() {
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

  const testimonials = [
    {
      quote:
        "أدلان غير طريقة تعاملنا مع صياغة العقود. الذكاء الاصطناعي يفهم ليس فقط المتطلبات القانونية، بل الفروق الثقافية الحاسمة في منطقتنا.",
      author: "سارة الراشد",
      title: "شريك أول",
      company: "الراشد والشركاء",
      location: "دبي، الإمارات العربية المتحدة",
      avatar: "👩‍💼",
    },
    {
      quote:
        "دقة وسرعة إنتاج الوثائق رائعة. ما كان يستغرق أياماً يحدث الآن في دقائق، دون المساس بالجودة أو الامتثال.",
      author: "أحمد حسن",
      title: "مدير قانوني",
      company: "مجموعة الإمارات المالية",
      location: "أبوظبي، الإمارات العربية المتحدة",
      avatar: "👨‍💻",
    },
    {
      quote:
        "وجود ذكاء قانوني عربي مدمج في الذكاء الاصطناعي يحدث الفرق كله. إنه يحترم تقاليدنا القانونية بينما يتبنى احتياجات الأعمال الحديثة.",
      author: "فاطمة الزهراء",
      title: "مدير قانوني أول",
      company: "مشاريع تقنية الشرق الأوسط وشمال أفريقيا",
      location: "الرياض، المملكة العربية السعودية",
      avatar: "👩‍⚖️",
    },
  ];

  const stats = [
    { number: "500+", label: "مهني قانوني" },
    { number: "50,000+", label: "وثيقة منتجة" },
    { number: "99.7%", label: "معدل الدقة" },
    { number: "15 دقيقة", label: "متوسط المعالجة" },
  ];

  return (
    <section ref={sectionRef} className="relative bg-white py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mx-auto max-w-4xl text-center mb-20 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <p className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-4">
            شهادات العملاء
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 leading-tight tracking-[-0.02em] mb-8">
            موثوق من قادة القانون
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-8"></div>
          <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-3xl mx-auto">
            اكتشف لماذا يختار كبار المهنيين القانونيين عبر منطقة الشرق الأوسط وشمال أفريقيا
            أدلان لاحتياجات التوثيق الأكثر أهمية.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <div className="text-6xl mb-6 opacity-30">&ldquo;</div>
                <blockquote className="text-lg text-gray-700 leading-relaxed mb-8 italic">
                  {testimonial.quote}
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company}
                    </div>
                    <div className="text-xs text-gray-400">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div
          className={`transition-all duration-1000 delay-600 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gray-900 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-light text-center mb-12">
              موثوق بالأرقام
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl lg:text-5xl font-extralight mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-800 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-lg text-gray-600 mb-8">
            انضم إلى المجتمع المتنامي من المهنيين القانونيين الذين يثقون في أدلان
          </p>
          <button className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all duration-300 hover:scale-105">
            <span className="relative z-10">اقرأ المزيد من قصص النجاح</span>
          </button>
        </div>
      </div>
    </section>
  );
}
