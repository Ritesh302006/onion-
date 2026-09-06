import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { UserCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function Login() {
  const { users, setCurrentUser, currentUser } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else if (currentUser.role === 'officer') navigate('/officer');
      else if (currentUser.role === 'farmer') navigate('/farmer');
      else if (currentUser.role === 'reviewer') navigate('/reviewer');
    }
  }, [currentUser, navigate]);

  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">
          AgriVision AI
        </h2>
        <p className="mt-2 text-center text-sm font-semibold uppercase tracking-widest text-slate-500">
          Onion Quality Assessment Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-800">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Select Role to Continue</h3>
          
          <div className="space-y-4">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all bg-white dark:bg-slate-900 group text-left shadow-sm hover:shadow"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors border border-slate-200 dark:border-slate-800 group-hover:border-emerald-200">
                    <UserCircle className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-700">{user.name}</p>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">{user.role}</p>
                  </div>
                </div>
                <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  &rarr;
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center flex flex-col items-center">
             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">SIH 2024 PROTOTYPE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
