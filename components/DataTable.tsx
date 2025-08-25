import React, { useState, useMemo, useEffect } from 'react';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;


interface CustomAction<T> {
  icon: React.ReactNode;
  onClick: (item: T) => void;
  title: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  headers: { key: keyof T; label: string }[];
  searchKeys?: (keyof T)[];
  filters?: { key: keyof T; label: string }[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  customActions?: CustomAction<T>[];
  summary?: React.ReactNode;
  onDataFiltered?: (filteredData: T[], searchTerm: string) => void;
}

const statusColors = {
    'نشط': 'bg-green-100 text-green-800',
    'معلق': 'bg-yellow-100 text-yellow-800',
    'منقطع': 'bg-red-100 text-red-800',
    'مفصول': 'bg-red-100 text-red-800',
    'متأخر': 'bg-red-100 text-red-800',
    'مدفوع': 'bg-green-100 text-green-800',
    'حضر': 'bg-blue-100 text-blue-800',
    'لم يحضر': 'bg-gray-100 text-gray-800',
    'تم التحويل': 'bg-purple-100 text-purple-800',
    'حجز حصة': 'bg-indigo-100 text-indigo-800',
    'متصل به': 'bg-cyan-100 text-cyan-800',
    'جديد': 'bg-gray-100 text-gray-800',
    'ملغي': 'bg-red-100 text-red-800',
    'قيد المراجعة': 'bg-yellow-100 text-yellow-800',
    'مقابلة': 'bg-blue-100 text-blue-800',
    'مقبول': 'bg-green-100 text-green-800',
    'مرفوض': 'bg-red-100 text-red-800',
};

const DataTable = <T extends object>({ title, data, headers, searchKeys, filters, onAdd, onEdit, onDelete, customActions, summary, onDataFiltered }: DataTableProps<T>): React.ReactNode => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const showActions = !!(onEdit || onDelete || (customActions && customActions.length > 0));

    const filterOptions = useMemo(() => {
        if (!filters) return {};
        const options: Record<string, string[]> = {};
        filters.forEach(filter => {
            const uniqueValues = Array.from(new Set(data.map(item => item[filter.key] as string)));
            options[filter.key as string] = uniqueValues.filter(Boolean).sort();
        });
        return options;
    }, [data, filters]);

    const filteredData = useMemo(() => {
        let result = [...data];

        if (searchTerm && searchKeys && searchKeys.length > 0) {
            const lowercasedTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                searchKeys.some(key => {
                    const value = item[key];
                    return String(value).toLowerCase().includes(lowercasedTerm);
                })
            );
        }

        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(item => item[key as keyof T] === value);
            }
        });

        return result;
    }, [data, searchTerm, activeFilters, searchKeys]);

    useEffect(() => {
        if (onDataFiltered) {
            onDataFiltered(filteredData, searchTerm);
        }
    }, [filteredData, searchTerm, onDataFiltered]);

    const handleFilterChange = (key: keyof T, value: string) => {
        setActiveFilters(prev => ({ ...prev, [key as string]: value }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    const isFiltered = searchTerm || Object.values(activeFilters).some(v => v);

    const handleDownload = () => {
        if (filteredData.length === 0) {
            alert('لا توجد بيانات حالية لتحميلها.');
            return;
        }

        const csvHeaders = headers.map(h => `"${h.label}"`).join(',');

        const csvRows = filteredData.map(row =>
            headers.map(header => {
                const value = row[header.key];
                // Handle potential commas and quotes in the value
                const stringValue = String(value ?? '').replace(/"/g, '""');
                return `"${stringValue}"`;
            }).join(',')
        );

        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        // Add BOM for Excel to recognize UTF-8 correctly with Arabic characters
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.setAttribute('href', url);
            link.setAttribute('download', `${sanitizedTitle}_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b flex-wrap gap-4">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <div className="flex items-center gap-2">
                     <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
                    >
                        <DownloadIcon />
                        <span>تحميل</span>
                    </button>
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                        >
                            <PlusIcon />
                            <span>إضافة جديد</span>
                        </button>
                    )}
                </div>
            </div>

            {(searchKeys?.length || filters?.length) && (
                <div className="p-4 bg-gray-50/50 border-b flex items-center gap-4 flex-wrap">
                    {searchKeys && searchKeys.length > 0 && (
                        <div className="relative flex-grow max-w-xs">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    )}
                    {filters && filters.map(filter => (
                        <div key={String(filter.key)}>
                            <select
                                value={activeFilters[String(filter.key)] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                className="w-full md:w-auto pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">كل {filter.label}</option>
                                {filterOptions[String(filter.key)]?.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    {isFiltered && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition"
                        >
                            <XCircleIcon />
                            <span>مسح الفلتر</span>
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider">
                        <tr>
                            {headers.map((header) => (
                                <th key={String(header.key)} className="p-4">
                                    {header.label}
                                </th>
                            ))}
                            {showActions && <th className="p-4 text-center">إجراءات</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {headers.map((header, colIndex) => {
                                        const value = row[header.key] as string | number;
                                        const statusClass = statusColors[value as keyof typeof statusColors] || '';
                                        return (
                                            <td key={colIndex} className="p-4 whitespace-nowrap">
                                                {statusClass ? (
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                                                        {value}
                                                    </span>
                                                ) : (
                                                    value
                                                )}
                                            </td>
                                        );
                                    })}
                                    {showActions && (
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-4">
                                                {onEdit && (
                                                    <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-800" title="تعديل">
                                                        <EditIcon />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-800" title="حذف">
                                                        <DeleteIcon />
                                                    </button>
                                                )}
                                                {customActions && customActions.map((action, index) => (
                                                    <button key={index} onClick={() => action.onClick(row)} className="text-gray-500 hover:text-gray-700" title={action.title}>
                                                        {action.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length + (showActions ? 1 : 0)} className="text-center p-8 text-gray-500">
                                    لا توجد بيانات مطابقة للبحث أو الفلتر
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {summary && (
                        <tfoot className="bg-gray-100 font-bold border-t-2">
                            <tr>
                                <td colSpan={headers.length + (showActions ? 1 : 0)} className="p-4 text-right text-gray-800">
                                    {summary}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default DataTable;