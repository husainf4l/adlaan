export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10">
      {/* Apple-style subtle background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/30 to-black"></div>
      
      <div className="relative z-10 px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-6xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h3 className="font-cairo text-xl font-light text-white/95 mb-2">
                  أدلان
                </h3>
                <p className="font-cairo text-sm text-gray-400 leading-relaxed max-w-md">
                  ذكاء اصطناعي عربي الجذور مصمم للتميز القانوني — مبني على مبدأ{' '}
                  <span className="text-white font-medium">العدل</span>{' '}
                  (العدالة)، مدعوم بسير عمل متطور.
                </p>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-cairo text-sm font-semibold text-white mb-4">المنتج</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    الوكلاء الأذكياء
                  </a>
                </li>
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    سير العمل
                  </a>
                </li>
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    التكاملات
                  </a>
                </li>
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    الأمان
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-cairo text-sm font-semibold text-white mb-4">الشركة</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    عن أدلان
                  </a>
                </li>
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    الوظائف
                  </a>
                </li>
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    تواصل معنا
                  </a>
                </li>
                <li>
                  <a href="#" className="font-cairo text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    الخصوصية
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Apple-style divider */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row-reverse justify-between items-center">
              <div className="mb-4 sm:mb-0 order-2 sm:order-1">
                <p className="font-cairo text-sm text-gray-500">
                  © 2025 أدلان. جميع الحقوق محفوظة.
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-6 order-1 sm:order-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
