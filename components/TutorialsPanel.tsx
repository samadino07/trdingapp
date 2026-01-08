import React, { useState } from 'react';
import { TutorialItem } from '../types';
import { BookOpen, PlayCircle, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';

const TUTORIALS: TutorialItem[] = [
  { 
    id: '1', 
    title: 'كيف تبدأ التداول بأمان؟', 
    category: 'Basics', 
    duration: '5 min', 
    content: 'القاعدة الذهبية: لا تخاطر أبداً بأكثر من 1-2% من رأس مالك في الصفقة الواحدة. التداول ليس مقامرة، بل هو إدارة احتمالات.' 
  },
  { 
    id: '2', 
    title: 'شرح الشموع اليابانية (Candlesticks)', 
    category: 'Basics', 
    duration: '8 min', 
    content: 'الشموع تخبرك بقصة الصراع بين المشترين والبائعين. الذيل الطويل يعني رفض السعر، والجسم الممتلئ يعني قوة الاتجاه.' 
  },
  { 
    id: '3', 
    title: 'استراتيجية الكسر وإعادة الاختبار', 
    category: 'Strategy', 
    duration: '10 min', 
    content: 'انتظر السعر حتى يكسر مستوى مقاومة قوي، ثم انتظر عودته للمستوى (Retest) للتأكد من تحوله لدعم قبل الدخول.' 
  },
  { 
    id: '4', 
    title: 'نفسية المتداول (Trading Psychology)', 
    category: 'Psychology', 
    duration: '6 min', 
    content: 'العدو الأول للمتداول هو الطمع والخوف. ضع خطة والتزم بها مهما حدث في السوق. لا تنتقم من السوق بعد الخسارة.' 
  }
];

const TutorialsPanel: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('1');

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-900/30">
             <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">أكاديمية المحلل (Academy)</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">تعلم أساسيات التداول المؤسساتي خطوة بخطوة. المعرفة هي سلاحك الأول لحماية رأس المال.</p>
       </div>

       <div className="grid gap-4">
          {TUTORIALS.map(tut => (
             <div key={tut.id} className="bg-institutional-card border border-slate-700 rounded-xl overflow-hidden shadow-md transition-all hover:border-indigo-500/50">
                <button 
                  onClick={() => setExpandedId(expandedId === tut.id ? null : tut.id)}
                  className="w-full flex items-center justify-between p-4 text-right bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                         tut.category === 'Basics' ? 'bg-emerald-500/10 text-emerald-400' :
                         tut.category === 'Strategy' ? 'bg-blue-500/10 text-blue-400' :
                         'bg-purple-500/10 text-purple-400'
                      }`}>
                         <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="font-bold text-white text-sm md:text-base">{tut.title}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{tut.category}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                               <PlayCircle className="w-3 h-3" /> {tut.duration}
                            </span>
                         </div>
                      </div>
                   </div>
                   {expandedId === tut.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                
                {expandedId === tut.id && (
                   <div className="p-5 bg-slate-900/50 text-sm text-slate-300 leading-relaxed border-t border-slate-700/50 animate-in slide-in-from-top-2">
                      {tut.content}
                   </div>
                )}
             </div>
          ))}
       </div>
    </div>
  );
};

export default TutorialsPanel;