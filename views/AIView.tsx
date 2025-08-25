import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Student, Payment, Attendance, Lead, Expense, Campaign } from '../types';
import DataTable from '../components/DataTable';
import TabbedView from '../components/TabbedView';
import DashboardCard from '../components/DashboardCard';

// Helper component for loading spinner
const Spinner = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
);

// Simple markdown to HTML renderer
const renderMarkdown = (text: string) => {
    return text
        .replace(/### (.*)/g, '<h3 class="text-xl font-bold text-gray-800 mb-3 mt-6">$1</h3>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n- (.*)/g, '<li class="text-gray-700">$1</li>')
        .replace(/<ul><li/g, '<ul class="list-disc list-inside space-y-2"><li')
        .replace(/<\/li>\n/g, '</li>')
        .replace(/<\/li><li/g, '</li><li');
};

const callGeminiAPI = async (prompt: string, setError: (msg: string) => void): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (err) {
        console.error("Gemini API Error:", err);
        setError('حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التأكد من صلاحية مفتاح الواجهة البرمجية والمحاولة مرة أخرى.');
        return '';
    }
};

type AtRiskStudent = Student & { riskFactor: string };

interface AIViewProps {
    students: Student[];
    payments: Payment[];
    attendance: Attendance[];
    leads: Lead[];
    expenses: Expense[];
    campaigns: Campaign[];
}

// Main AI View Component
const AIView: React.FC<AIViewProps> = (props) => {
    const [error, setError] = useState('');
    
    const tabs = [
        { label: 'لوحة القيادة الذكية', content: <SmartDashboardTab {...props} setError={setError} /> },
        { label: 'التنبؤ والسلوك', content: <PredictionTab {...props} setError={setError} /> },
        { label: 'المساعد الذكي', content: <SmartAssistantTab {...props} setError={setError} /> },
        { label: 'أدوات المحتوى', content: <ContentToolsTab setError={setError} /> },
        { label: 'محاكاة التطبيق الذكي', content: <SmartAppTab {...props} setError={setError} /> },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">الذكاء الاصطناعي</h2>
            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
            <TabbedView tabs={tabs} />
        </div>
    );
};

// --- Tab Components ---

const SmartDashboardTab: React.FC<AIViewProps & { setError: (msg: string) => void }> = ({ students, payments, leads, expenses, setError }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const kpis = useMemo(() => {
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        return {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            activeStudents: students.filter(s => s.status === 'نشط').length
        };
    }, [students, payments, expenses]);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        const prompt = `
            You are an expert business analyst for an educational center called ISCHOOLGO.
            Analyze these KPIs and provide a concise summary and smart, actionable recommendations in Arabic.
            - Total Revenue: ${kpis.totalRevenue} DH
            - Total Expenses: ${kpis.totalExpenses} DH
            - Net Profit: ${kpis.netProfit} DH
            - Active Students: ${kpis.activeStudents}
            - Total Leads: ${leads.length}
            Structure your response with "### تحليل الأداء" and "### توصيات ذكية للتحسين" headings.
        `;
        const result = await callGeminiAPI(prompt, setError);
        setAnalysis(result);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="إجمالي الإيرادات" value={`${kpis.totalRevenue.toLocaleString()} د.م`} icon={<div />} color="green" />
                <DashboardCard title="إجمالي المصاريف" value={`${kpis.totalExpenses.toLocaleString()} د.م`} icon={<div />} color="red" />
                <DashboardCard title="صافي الربح" value={`${kpis.netProfit.toLocaleString()} د.م`} icon={<div />} color="blue" />
                <DashboardCard title="الطلاب النشطين" value={kpis.activeStudents} icon={<div />} color="indigo" />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">تحليل الأداء الشامل</h3>
                    <button onClick={handleGenerateAnalysis} disabled={isLoading} className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300">
                        {isLoading ? '...جاري التحليل' : '🧠 إنشاء التحليل'}
                    </button>
                </div>
                <div className="mt-6 border-t pt-6 min-h-[100px]">
                    {isLoading ? <Spinner /> : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }} />}
                </div>
            </div>
        </div>
    );
};

const PredictionTab: React.FC<AIViewProps & { setError: (msg: string) => void }> = ({ students, attendance, setError }) => {
    const [interventionPlan, setInterventionPlan] = useState('');
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const atRiskStudents: AtRiskStudent[] = useMemo(() => {
        const studentAttendance = attendance.reduce((acc, att) => {
            acc[att.studentId] = acc[att.studentId] || { present: 0, total: 0 };
            if (att.status === 'حاضر') acc[att.studentId].present++;
            acc[att.studentId].total++;
            return acc;
        }, {} as Record<string, { present: number, total: number }>);

        return students.map(student => {
            let riskFactor = '';
            const attData = studentAttendance[student.id];
            const attRate = attData ? (attData.present / attData.total) * 100 : 100;
            if (student.paymentStatus === 'متأخر') riskFactor += 'دفع متأخر. ';
            if (student.status === 'معلق') riskFactor += 'حالة معلقة. ';
            if (attRate < 60) riskFactor += `حضور منخفض (${attRate.toFixed(0)}%).`;
            return { ...student, riskFactor: riskFactor.trim() };
        }).filter(s => s.riskFactor);
    }, [students, attendance]);
    
    const handleGetPlan = async (student: AtRiskStudent) => {
        setIsLoadingPlan(true);
        setSelectedStudent(student);
        setInterventionPlan('');
        setError('');
        const prompt = `You are an educational advisor. A student named ${student.studentName} is at risk due to: ${student.riskFactor}. Suggest a concise, personalized intervention plan with 3 actionable steps in Arabic.`;
        const result = await callGeminiAPI(prompt, setError);
        setInterventionPlan(result);
        setIsLoadingPlan(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b">
                <h3 className="text-xl font-bold">الطلاب المعرضون لخطر التسرب</h3>
            </div>
            <DataTable
                title=""
                data={atRiskStudents}
                headers={[ { key: 'studentName', label: 'الاسم' }, { key: 'riskFactor', label: 'سبب الخطورة' } ]}
                customActions={[{ icon: '🧠', onClick: handleGetPlan, title: 'اقترح خطة تدخل' }]}
            />
            {selectedStudent && (
                 <div className="p-6 border-t">
                    <h4 className="font-bold text-lg">خطة التدخل المقترحة لـ {selectedStudent.studentName}:</h4>
                    {isLoadingPlan ? <Spinner /> : <div className="mt-2" dangerouslySetInnerHTML={{ __html: renderMarkdown(interventionPlan) }} />}
                </div>
            )}
        </div>
    );
};

const SmartAssistantTab: React.FC<AIViewProps & { setError: (msg: string) => void }> = (props) => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleQuery = async () => {
        setIsLoading(true);
        setAnswer('');
        props.setError('');

        // Example of providing context from the app's data
        const totalStudents = props.students.length;
        const totalLeads = props.leads.length;
        const totalRevenue = props.payments.reduce((sum, p) => sum + p.amount, 0);

        const prompt = `You are an AI assistant for ISCHOOLGO. Based on this data, answer the user's question in Arabic.
        Data:
        - Total Students: ${totalStudents}
        - Total Leads: ${totalLeads}
        - Total Revenue: ${totalRevenue} DH
        User's question: "${query}"
        `;
        const result = await callGeminiAPI(prompt, props.setError);
        setAnswer(result);
        setIsLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="text-xl font-bold">المساعد الذكي (Chatbot)</h3>
            <p className="text-sm text-gray-500">اطرح سؤالاً باللغة العربية حول بيانات مركزك.</p>
            <textarea value={query} onChange={e => setQuery(e.target.value)} rows={3} className="w-full p-2 border rounded-md" placeholder="مثال: كم عدد الطلاب الجدد هذا الشهر؟ أو ما هي الحملة الإعلانية الأكثر نجاحًا؟" />
            <button onClick={handleQuery} disabled={isLoading || !query} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300">
                {isLoading ? '...جار التفكير' : 'اسأل'}
            </button>
            <div className="mt-4 border-t pt-4 min-h-[50px]">
                {isLoading ? <Spinner /> : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }} />}
            </div>
        </div>
    );
};

const ContentToolsTab: React.FC<{ setError: (msg: string) => void }> = ({ setError }) => {
    const [topic, setTopic] = useState('');
    const [contentType, setContentType] = useState<'marketing' | 'quiz'>('marketing');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setContent('');
        setError('');
        let prompt = '';
        if (contentType === 'marketing') {
            prompt = `You are a marketing expert for ISCHOOLGO. Write an engaging Facebook post in Arabic about our new course on "${topic}". Use emojis and a clear call to action.`;
        } else {
            prompt = `You are a teacher. Generate a 3-question multiple-choice quiz in Arabic for intermediate level students on the topic of "${topic}". Provide the correct answer for each question.`;
        }
        const result = await callGeminiAPI(prompt, setError);
        setContent(result);
        setIsLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="text-xl font-bold">مولد المحتوى الذكي</h3>
            <div className="flex gap-4">
                <select value={contentType} onChange={e => setContentType(e.target.value as any)} className="p-2 border rounded-md">
                    <option value="marketing">محتوى تسويقي</option>
                    <option value="quiz">أسئلة اختبار</option>
                </select>
                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2 border rounded-md" placeholder="أدخل الموضوع هنا (مثال: البرمجة بلغة بايثون)" />
            </div>
            <button onClick={handleGenerate} disabled={isLoading || !topic} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300">
                {isLoading ? '...جاري الإنشاء' : 'إنشاء المحتوى'}
            </button>
            <div className="mt-4 border-t pt-4 min-h-[150px] bg-gray-50 p-4 rounded-md">
                {isLoading ? <Spinner /> : <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />}
            </div>
        </div>
    );
};

const SmartAppTab: React.FC<AIViewProps & { setError: (msg: string) => void }> = ({ students, attendance, setError }) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [summary, setSummary] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const handleGenerateSummary = async () => {
        if (!selectedStudentId) return;
        setIsLoadingSummary(true);
        setSummary('');
        setError('');
        const student = students.find(s => s.id === selectedStudentId)!;
        const prompt = `As a teacher, write a brief, friendly progress summary in Arabic for the parents of ${student.studentName}. The student's level is ${student.level}, and their academic status is ${student.status}. Mention one positive point and one area for improvement.`;
        const result = await callGeminiAPI(prompt, setError);
        setSummary(result);
        setIsLoadingSummary(false);
    };
    
     const handleGenerateSuggestions = async () => {
        if (!selectedStudentId) return;
        setIsLoadingSuggestions(true);
        setSuggestions('');
        setError('');
        const student = students.find(s => s.id === selectedStudentId)!;
        const prompt = `You are an expert teacher. Provide 3 personalized teaching suggestions in Arabic for a student named ${student.studentName}. Their level is ${student.level}. The suggestions should be practical.`;
        const result = await callGeminiAPI(prompt, setError);
        setSuggestions(result);
        setIsLoadingSuggestions(false);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">محاكاة ميزات التطبيق الذكي</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Parent View */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <h4 className="font-bold text-lg">عرض ولي الأمر</h4>
                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full p-2 border rounded-md">
                        <option value="">اختر طالبًا...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.studentName}</option>)}
                    </select>
                    <button onClick={handleGenerateSummary} disabled={!selectedStudentId || isLoadingSummary} className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoadingSummary ? '...جاري التوليد' : 'توليد ملخص للأهل'}
                    </button>
                    <div className="mt-2 border-t pt-2 min-h-[100px] bg-gray-50 p-2 rounded-md">
                        {isLoadingSummary ? <Spinner/> : <p>{summary}</p>}
                    </div>
                </div>
                {/* Teacher View */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                     <h4 className="font-bold text-lg">عرض الأستاذ</h4>
                    <button className="w-full px-4 py-2 text-sm font-semibold text-white bg-gray-500 rounded-lg" onClick={() => alert('ميزة قيد التطوير. سيتمكن النظام من تسجيل الحضور تلقائياً عبر التعرف على وجوه الطلاب.')}>
                        📷 استخدام الكاميرا للحضور الذكي
                    </button>
                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full p-2 border rounded-md">
                        <option value="">اختر طالبًا...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.studentName}</option>)}
                    </select>
                     <button onClick={handleGenerateSuggestions} disabled={!selectedStudentId || isLoadingSuggestions} className="w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                        {isLoadingSuggestions ? '...جاري التفكير' : 'اقتراح أساليب تدريس'}
                    </button>
                     <div className="mt-2 border-t pt-2 min-h-[100px] bg-gray-50 p-2 rounded-md">
                         {isLoadingSuggestions ? <Spinner/> : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(suggestions) }} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIView;
