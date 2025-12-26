'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, Activity } from 'lucide-react';
import api from '../utils/api';
import clsx from 'clsx';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    let result = [...patients];

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredPatients(result);
  }, [patients, search, sortConfig]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/getMinimalPatientInfo');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Progressive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Responsive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Stable':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <span className="font-bold text-lg">MC</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-800">Memorial Cancer Center</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">Dr. Emily Richardson</p>
            <p className="text-xs text-slate-500">Medical Oncology</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Patient Overview</h2>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow duration-200"
              placeholder="Search patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Name', 'Age', 'Sex', 'Primary Cancer Type', 'Disease Status'].map((header, idx) => {
                    const keyMap = {
                      'Name': 'name',
                      'Age': 'age',
                      'Sex': 'sex',
                      'Primary Cancer Type': 'primary_cancer_type',
                      'Disease Status': 'disease_status'
                    };
                    const key = keyMap[header];
                    return (
                      <th
                        key={idx}
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-1">
                          {header}
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )
                  })}
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.uid}
                    className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/dashboard/${patient.name}`} className="block w-full h-full">
                        <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          {patient.name}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {patient.sex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {patient.primary_cancer_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getStatusColor(patient.disease_status)
                      )}>
                        {patient.disease_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/${patient.name}`} className="text-slate-400 hover:text-blue-600">
                        <Activity className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-500">
              No patients found matching your search.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
