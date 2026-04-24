import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (role: 'admin' | 'worker') => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      let userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists() && email === 'mdv4244@gmail.com') {
        // Auto-fix: try to create the missing admin document
        await setDoc(userDocRef, {
          email,
          name: 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        userDoc = await getDoc(userDocRef);
      }
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        if (userRole === role) {
          navigate(role === 'admin' ? '/admin' : '/dashboard');
        } else {
          alert('You do not have permission to log in as ' + role);
        }
      } else {
        alert('User not found');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6">
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">Zero Zone Mark</h1>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
          />
        </div>
        <div className="flex flex-col gap-3 mt-8">
          <button onClick={() => handleLogin('admin')} className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 py-3 rounded-lg text-sm font-medium transition-colors">Login as Admin</button>
          <button onClick={() => handleLogin('worker')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg text-sm font-medium transition-colors">Login as Worker</button>
          <p className="text-center text-zinc-500 text-sm mt-4">Don't have an account? <Link to="/register" className="text-emerald-500 hover:underline">Register</Link></p>
        </div>
      </div>
    </div>
  );
}
