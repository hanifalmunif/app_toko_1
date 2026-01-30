import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, LogIn } from 'lucide-react';
import { BASE_URL } from '../config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}/api_login.php`, { username, password })
      .then(res => {
        if (res.data.success) {
          // Simpan data user ke localStorage (Browser)
          localStorage.setItem('user', JSON.stringify(res.data.data));
          // Panggil fungsi parent untuk masuk ke dashboard
          onLogin(res.data.data);
        } else {
          setError(res.data.message);
        }
      })
      .catch(err => setError("Gagal terhubung ke server"));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Selamat Datang</h1>
            <p className="text-slate-400 text-sm">Silakan login untuk mengelola toko.</p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-slate-400 text-xs mb-1 ml-1">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-500" size={18}/>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Masukkan username"
                    />
                </div>
            </div>

            <div>
                <label className="block text-slate-400 text-xs mb-1 ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-500" size={18}/>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                <LogIn size={20}/> Masuk Aplikasi
            </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Aplikasi Toko & Servis Komputer
        </div>
      </div>
    </div>
  );
};

export default Login;