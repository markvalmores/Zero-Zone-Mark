import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TimeEntry {
  id: string;
  userId: string;
  clockIn: any;
  clockOut?: any;
  date: string;
}

export default function AdminPanel() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      setEmployees(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
      
      const entriesSnap = await getDocs(collection(db, 'timeEntries'));
      setEntries(entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeEntry)));
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      await deleteDoc(doc(db, 'timeEntries', id));
      setEntries(entries.filter(e => e.id !== id));
      alert('Entry deleted!');
    }
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Name,Email,Date,ClockIn,ClockOut"].concat(
        entries.map(e => `${employees.find(u => u.id === e.userId)?.name},${employees.find(u => u.id === e.userId)?.email},${e.date},${e.clockIn.toDate().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' })},${e.clockOut ? e.clockOut.toDate().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }) : 'N/A'}`)
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payroll_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Time Entries</h2>
        <button onClick={exportCSV} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm mb-4">Export CSV</button>
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="pb-2">Name</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Clock In</th>
              <th className="pb-2">Clock Out</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-zinc-800/50">
                <td className="py-2">{employees.find(u => u.id === entry.userId)?.name}</td>
                <td className="py-2">{entry.date}</td>
                <td className="py-2">{entry.clockIn?.toDate().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' })}</td>
                <td className="py-2">{entry.clockOut ? entry.clockOut.toDate().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }) : 'N/A'}</td>
                <td className="py-2">
                  <button onClick={() => handleDelete(entry.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
