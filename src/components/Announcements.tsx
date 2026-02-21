import { useState } from 'react';
import type { User, Announcement } from '../types';
import { getAnnouncements, addAnnouncement, deleteAnnouncement } from '../data/store';

interface AnnouncementsProps {
  user: User;
}

export function Announcements({ user }: AnnouncementsProps) {
  const isAdmin = user.role === 'admin';
  const [announcements, setAnnouncements] = useState(getAnnouncements());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'medium' as Announcement['priority'] });

  const handleAdd = () => {
    if (!formData.title || !formData.message) return;
    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      ...formData,
      date: new Date().toISOString().split('T')[0],
    };
    addAnnouncement(announcement);
    setAnnouncements(getAnnouncements());
    setShowModal(false);
    setFormData({ title: '', message: '', priority: 'medium' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      deleteAnnouncement(id);
      setAnnouncements(getAnnouncements());
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-rose-500';
      case 'medium': return 'from-amber-500 to-orange-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-100';
      case 'medium': return 'bg-amber-50 border-amber-100';
      default: return 'bg-green-50 border-green-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📢 Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">{announcements.length} announcements</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Announcement
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.sort((a, b) => b.date.localeCompare(a.date)).map(ann => (
          <div key={ann.id} className={`rounded-2xl p-6 border ${getPriorityBg(ann.priority)} hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPriorityColor(ann.priority)}`}></div>
                  <h2 className="text-lg font-semibold text-gray-900">{ann.title}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    ann.priority === 'high' ? 'bg-red-100 text-red-700' :
                    ann.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>{ann.priority}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{ann.message}</p>
                <p className="text-xs text-gray-400 mt-3">📅 {ann.date}</p>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(ann.id)} className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition cursor-pointer flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-5xl block mb-3">📢</span>
          <p className="text-lg">No announcements yet</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">📢 New Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Announcement details..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Announcement['priority']})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition cursor-pointer">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer">Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
