import { useState, useRef } from 'react';
import type { User, UploadedFile } from '../types';
import { getUsers, getFiles, addFile, deleteFile } from '../data/store';

interface FileManagerProps {
  user: User;
}

export function FileManager({ user }: FileManagerProps) {
  const isAdmin = user.role === 'admin';
  const users = getUsers();
  const [files, setFiles] = useState(getFiles());
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<UploadedFile['category']>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const employees = users.filter(u => u.role === 'employee');

  const filteredFiles = files.filter(f => {
    const matchUser = isAdmin ? (filterEmployee === 'all' || f.employeeId === filterEmployee) : f.employeeId === user.id;
    const matchCategory = filterCategory === 'all' || f.category === filterCategory;
    return matchUser && matchCategory;
  }).sort((a, b) => b.uploadedOn.localeCompare(a.uploadedOn));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: UploadedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          employeeId: user.id,
          name: file.name,
          type: file.type,
          size: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          category: uploadCategory,
          uploadedOn: new Date().toISOString().split('T')[0],
          dataUrl: reader.result as string,
        };
        addFile(newFile);
        setFiles(getFiles());
      };
      reader.readAsDataURL(file);
    });

    setShowUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(id);
      setFiles(getFiles());
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    return '📎';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'resume': return 'bg-blue-100 text-blue-700';
      case 'id-proof': return 'bg-purple-100 text-purple-700';
      case 'certificate': return 'bg-green-100 text-green-700';
      case 'contract': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📁 {isAdmin ? 'Document Management' : 'My Documents'}</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredFiles.length} documents</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload File
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Categories</option>
          <option value="resume">Resume</option>
          <option value="id-proof">ID Proof</option>
          <option value="certificate">Certificate</option>
          <option value="contract">Contract</option>
          <option value="other">Other</option>
        </select>
        {isAdmin && (
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFiles.map(file => {
          const emp = users.find(u => u.id === file.employeeId);
          return (
            <div key={file.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate text-sm">{file.name}</h3>
                  {isAdmin && <p className="text-xs text-gray-500 mt-0.5">{emp?.name}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                    <span className="text-xs text-gray-400">{file.size}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Uploaded: {file.uploadedOn}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                {file.dataUrl && (
                  <a href={file.dataUrl} download={file.name} className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-medium text-center transition cursor-pointer">
                    ⬇️ Download
                  </a>
                )}
                <button onClick={() => handleDelete(file.id)} className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition cursor-pointer">
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-5xl block mb-3">📂</span>
          <p className="text-lg">No documents found</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">📤 Upload Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value as UploadedFile['category'])} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="resume">Resume</option>
                  <option value="id-proof">ID Proof</option>
                  <option value="certificate">Certificate</option>
                  <option value="contract">Contract</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <span className="text-4xl block mb-2">📎</span>
                  <p className="text-sm text-gray-600">Click to browse files</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Images, Documents</p>
                </div>
                <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
