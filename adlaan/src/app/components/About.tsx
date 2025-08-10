"use client";

import { useEffect, useRef, useState } from "react";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gray-50 py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Enhanced Section Header with Apple-style spacing */}
        <div
          className={`mx-auto max-w-4xl text-center mb-24 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-4">
              حول أدلان
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 leading-tight tracking-[-0.02em] mb-8">
              مبني على مبدأ{" "}
              <span className="italic text-gray-700">العدل</span>
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-8"></div>
            <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-3xl mx-auto">
              ريادة مستقبل التكنولوجيا القانونية من خلال الذكاء الاصطناعي العربي الجذور،
              حيث كل وثيقة تجسد العدالة والتوازن.
            </p>
          </div>
        </div>

        {/* Main Content with enhanced visual hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-start">
          {/* Left Content - Apple-style content blocks */}
          <div className="lg:col-span-7 space-y-12">
            {/* First content block */}
            <div
              className={`transition-all duration-1000 delay-200 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-6">
                <h3 className="text-2xl lg:text-3xl font-light text-gray-900 leading-tight">
                  العدالة في كل خوارزمية
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  أدلان يمثل أكثر من تقنية ذكاء اصطناعي متطورة—إنه يجسد المفهوم العربي لـ{" "}
                  <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    العدل
                  </span>{" "}
                  (العدالة)، مضمناً أن كل وثيقة قانونية ليست دقيقة فحسب،
                  بل عادلة ومتوازنة بشكل أساسي.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  منصتنا تجمع بين قرون من الحكمة القانونية والذكاء الاصطناعي المتطور،
                  خالقة توثيقاً يخدم الاحتياجات التجارية والمعايير الأخلاقية.
                </p>
              </div>
            </div>

            {/* Second content block */}
            <div
              className={`transition-all duration-1000 delay-400 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-6">
                <h3 className="text-2xl lg:text-3xl font-light text-gray-900 leading-tight">
                  ذكاء عربي الجذور
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  استقاءً من التقاليد القانونية العربية الغنية والفقه الإسلامي،
                  ذكاؤنا الاصطناعي يفهم ليس فقط نص القانون، بل روحه—خالقاً اتفاقيات
                  تكرم الممارسات التجارية الحديثة والمبادئ الخالدة للعدالة.
                </p>
              </div>
            </div>

            {/* Third content block */}
            <div
              className={`transition-all duration-1000 delay-600 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-6">
                <h3 className="text-2xl lg:text-3xl font-light text-gray-900 leading-tight">
                  الدقة تلتقي بالهدف
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  كل عقد وسياسة واتفاقية ينتجها أدلان تخضع لمراجعة دقيقة بالذكاء الاصطناعي
                  لضمان السلامة القانونية والوضوح والنزاهة الأخلاقية—مقدمة وثائق
                  تحمي جميع الأطراف بينما تعزز الثقة والشفافية.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced visual elements */}
          <div className="lg:col-span-5">
            <div
              className={`sticky top-24 transition-all duration-1000 delay-800 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Key principles card */}
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                <h4 className="text-xl font-medium text-gray-900 mb-8">
                  المبادئ الأساسية
                </h4>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        العدالة (العدل)
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        ضمان العدالة والتوازن في كل وثيقة قانونية
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        الدقة (الإتقان)
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        اهتمام دقيق بالتفاصيل القانونية والدقة
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        الحكمة (الحكمة)
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        دمج الحكمة القانونية التقليدية مع الابتكار الحديث
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        الثقة (الأمانة)
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        بناء عمليات قانونية موثوقة وشفافة
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats or additional info */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                  <div className="text-3xl font-light mb-2">99.7%</div>
                  <div className="text-sm text-gray-300">دقة قانونية</div>
                </div>
                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                  <div className="text-3xl font-light mb-2">15 دقيقة</div>
                  <div className="text-sm text-gray-300">متوسط المعالجة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
