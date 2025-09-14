import React, { useState } from 'react';

interface LoginViewProps {
    onLogin: (username: string, password?: string) => Promise<boolean>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const success = await onLogin(username, password);
            if (!success) {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
            }
        } catch (err) {
            setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-indigo-600">ISCHOOLGO</h1>
                    <p className="mt-2 text-gray-500">مرحباً بعودتك! يرجى تسجيل الدخول للمتابعة.</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                        <p className="font-semibold">حسابات تجريبية متاحة:</p>
                        <p>admin | director | marketer | headtrainer | agent | teacher</p>
                        <p>كلمة المرور لجميع الحسابات: password123</p>
                    </div>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="username"
                            className="text-sm font-bold text-gray-600 block"
                        >
                            اسم المستخدم
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 mt-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-bold text-gray-600 block"
                        >
                            كلمة المرور
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 mt-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-4 font-bold text-white uppercase bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginView;
