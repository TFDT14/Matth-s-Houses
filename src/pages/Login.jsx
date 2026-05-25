import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [code, setCode]       = useState('');
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    if (login(code)) {
      navigate('/');
    } else {
      setError("Code d'accès incorrect.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* grid bg */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />

      <div className="relative w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-red-600" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                <span className="text-white font-black text-3xl tracking-tight">MH</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">MATTH'S HOUSES</h1>
              <p className="text-xs text-gray-400 mt-1">SARL • Martinique</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Code d'accès</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={show ? 'text' : 'password'}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={!code || loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : "Accéder à l'application"
                }
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-3 text-center text-xs text-gray-400 border-t border-gray-100">
            Accès réservé — Matth's Houses
          </div>
        </div>
      </div>
    </div>
  );
}
