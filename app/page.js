'use client';
import { useState, useEffect } from 'react';
import { Save, LogIn, LogOut } from 'lucide-react';
import { useGoogleDrive } from './useGoogleDrive';

export default function QuranTracker() {
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const { 
    isSignedIn, 
    initialize, 
    signIn, 
    signOut, 
    saveToGDrive, 
    loadFromGDrive 
  } = useGoogleDrive();

  // Initialize Google Drive client
  useEffect(() => {
    initialize();
  }, []);

  // Load data on sign in
  useEffect(() => {
    const loadData = async () => {
      if (isSignedIn) {
        setLoading(true);
        const data = await loadFromGDrive();
        if (data) {
          setCompleted(data);
        }
        setLoading(false);
      } else {
        // Load from localStorage if not signed in
        const saved = localStorage.getItem('quranProgress');
        if (saved) {
          setCompleted(JSON.parse(saved));
        }
        setLoading(false);
      }
    };
    loadData();
  }, [isSignedIn]);

  const totalVerses = 604;
  const completedCount = Object.keys(completed).length;
  const progressPercentage = ((completedCount / totalVerses) * 100).toFixed(1);

  // Save progress
  useEffect(() => {
    if (!loading) {
      if (isSignedIn) {
        saveToGDrive(completed);
      } else {
        localStorage.setItem('quranProgress', JSON.stringify(completed));
      }
    }
  }, [completed, loading, isSignedIn]);

  const toggleVerse = (number) => {
    setCompleted(prev => {
      const newCompleted = { ...prev };
      if (newCompleted[number]) {
        delete newCompleted[number];
      } else {
        newCompleted[number] = true;
      }
      return newCompleted;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Quran Progress Tracker</h1>
            <p className="text-gray-600">
              Progress: {completedCount} / {totalVerses} ({progressPercentage}%)
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={isSignedIn ? signOut : signIn}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isSignedIn 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {isSignedIn ? (
                <>
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
            {isSignedIn && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Save size={16} />
                <span>Synced with Google Drive</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6">
          {Array.from({ length: totalVerses }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => toggleVerse(number)}
              className={`
                aspect-square rounded-full flex items-center justify-center text-sm
                border transition-all duration-200
                ${completed[number] 
                  ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}
              `}
            >
              {number}
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
            <span>Not completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}