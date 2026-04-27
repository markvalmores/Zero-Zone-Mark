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
  const [elapsedTime, setElapsedTime] = useState<number>(0);
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
    
    // Timer to update display
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (activeEntry) {
        const start = activeEntry.clockIn.toDate ? activeEntry.clockIn.toDate() : new Date(activeEntry.clockIn);
        setElapsedTime(Math.floor((Date.now() - start.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeEntry]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockIn = async () => {
    if (!auth.currentUser) return;
    const entryData = {
      userId: auth.currentUser.uid,
      clockIn: serverTimestamp(),
      date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    };
    const entry = await addDoc(collection(db, 'timeEntries'), entryData);
    setActiveEntry({ id: entry.id, clockIn: new Date() });
    alert('Clocked In!');
  };

  const handleClockOut = async () => {
    if (!activeEntry || !auth.currentUser) return;
    await updateDoc(doc(db, 'timeEntries', activeEntry.id), {
      clockOut: serverTimestamp()
    });
    setActiveEntry(null);
    setElapsedTime(0);
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
        <h1 className="text-4xl font-bold mb-4">{currentTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' })}</h1>
        <p className="text-zinc-400 mb-8">{currentTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
        
        {activeEntry && (
            <div className="mb-6">
                <p className="text-sm text-zinc-400">Time Worked:</p>
                <p className="text-3xl font-mono text-emerald-400">{formatTime(elapsedTime)}</p>
            </div>
        )}
        
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
