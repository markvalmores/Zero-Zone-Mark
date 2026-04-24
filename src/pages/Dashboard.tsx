import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, addDoc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface TimeEntry {
  id: string;
  clockIn: any;
  clockOut?: any;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      }
    };
    fetchProfile();
    
    const fetchActive = async () => {
      if (auth.currentUser) {
        const q = query(
          collection(db, 'timeEntries'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('clockIn', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const entry = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TimeEntry;
          if (!entry.clockOut) setActiveEntry(entry);
        }
      }
    };
    fetchActive();
    
    // Timer
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    if (!auth.currentUser) return;
    const entry = await addDoc(collection(db, 'timeEntries'), {
      userId: auth.currentUser.uid,
      clockIn: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    setActiveEntry({ id: entry.id, clockIn: new Date() });
    alert('Clocked In!');
  };

  const handleClockOut = async () => {
    if (!activeEntry || !auth.currentUser) return;
    await updateDoc(doc(db, 'timeEntries', activeEntry.id), {
      clockOut: serverTimestamp()
    });
    setActiveEntry(null);
    alert('Clocked Out!');
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Zero Zone Mark - Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
      </div>
      
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">{currentTime.toLocaleTimeString()}</h1>
        <p className="text-zinc-400 mb-8">{currentTime.toDateString()}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={handleClockIn} 
            disabled={!!activeEntry}
            className={`px-8 py-4 rounded-xl text-lg font-semibold ${activeEntry ? 'bg-zinc-800' : 'bg-emerald-600'}`}
          >
            {activeEntry ? 'Clocked In' : 'Clock In'}
          </button>
          <button 
            onClick={handleClockOut} 
            disabled={!activeEntry}
            className={`px-8 py-4 rounded-xl text-lg font-semibold ${!activeEntry ? 'bg-zinc-800' : 'bg-zinc-700'}`}
          >
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}