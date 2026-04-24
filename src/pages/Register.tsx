import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [idPictureUrl, setIdPictureUrl] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Basic validation
    if (!/^\d{8}$/.test(code)) {
      alert("Registration code must be exactly 8 digits.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const isAdmin = email === 'mdv4244@gmail.com';
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role: isAdmin ? 'admin' : 'worker',
        idPictureUrl,
        createdAt: new Date().toISOString()
      });

      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (error) {
      if (error instanceof Error && error.message.includes('email-already-in-use')) {
        alert('This email is already registered. Please log in.');
        navigate('/login');
      } else {
        alert(error instanceof Error ? error.message : 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6">
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">Register</h1>
        <div className="space-y-4">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          <input type="text" placeholder="Registration Code" value={code} onChange={e => setCode(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          <input type="text" placeholder="ID Picture URL" value={idPictureUrl} onChange={e => setIdPictureUrl(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>
        <button onClick={handleRegister} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg text-sm font-medium transition-colors mt-8">Register</button>
      </div>
    </div>
  );
}
