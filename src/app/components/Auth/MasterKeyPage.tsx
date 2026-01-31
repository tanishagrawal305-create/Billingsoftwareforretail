import React, { useState } from 'react';
import { ShoppingBag, Lock, Shield, Key, AlertTriangle, CheckCircle } from 'lucide-react';

interface MasterKeyPageProps {
  onUnlock: () => void;
}

export const MasterKeyPage: React.FC<MasterKeyPageProps> = ({ onUnlock }) => {
  const [masterKey, setMasterKey] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // DEVELOPER MASTER KEY - Change this to your desired password
  const MASTER_KEY = 'JR@2024';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!masterKey) {
      setError('Please enter the master key');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (masterKey === MASTER_KEY) {
      // Store master key verification in sessionStorage (more secure - clears on browser close)
      sessionStorage.setItem('jr_invoice_master_unlocked', 'true');
      onUnlock();
    } else {
      setAttempts(attempts + 1);
      setError(`Invalid master key. Attempt ${attempts + 1}/5`);
      setMasterKey('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Lock for 30 seconds after 5 failed attempts
      if (attempts >= 4) {
        setError('Too many failed attempts. Please try again in 30 seconds.');
        setTimeout(() => {
          setAttempts(0);
          setError('');
        }, 30000);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-md transition-all duration-500 ${isShaking ? 'animate-shake' : ''}`}>
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header Section with Gradient */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  JR Invoice Maker
                </h1>
                <p className="text-indigo-100 text-sm font-medium">
                  Secure Access Portal
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              {/* Info Alert */}
              <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                      Protected Application
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Enter the master key to access the billing software. Only authorized users can proceed.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Alert */}
                {error && (
                  <div className={`${
                    attempts >= 5 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-red-50 border-red-200'
                  } border rounded-xl p-4 flex items-start gap-3 animate-fade-in`}>
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      attempts >= 5 ? 'text-red-600' : 'text-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        attempts >= 5 ? 'text-red-800' : 'text-red-700'
                      }`}>
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Master Key Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Master Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-900 placeholder-gray-400 font-medium"
                      placeholder="Enter your master key"
                      disabled={attempts >= 5}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={attempts >= 5}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-base ${
                    attempts >= 5
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {attempts >= 5 ? (
                    <>
                      <Lock className="w-5 h-5" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Unlock Application
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer Section */}
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-800">For Developers:</span> Configure master key in{' '}
                      <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono text-[10px] border border-gray-200">
                        MasterKeyPage.tsx
                      </code>
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-mono bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                      Default: <span className="text-indigo-600 font-semibold">JR@2024</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              🔒 Secured with session-based authentication
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-shake {
          animation: shake 0.5s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};