'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Plus, Trash } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';

interface Parent {
    id: number;
    parent_name: string;
    relationship: string;
    phone: string;
    email: string;
    student_id: number;
    student?: {
        name: string;
    };
}

interface Student {
    id: number;
    name: string;
}

export default function ParentsPage() {
    const { user } = useAuth();
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { t } = useLanguage();

    // Form state
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [parentName, setParentName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Fetch all students if admin/teacher to populate dropdown
        // In a real app we might paginate or search this
        // For now, we reuse the existing course-student fetch pattern or need a new 'get all students' endpoint.
        // Or we can just fetch parents for 'current' view.

        // Let's implement: Select a student first -> Show parents.
        // Or: Show all parents (admin view).
        // Let's assume we want to create a parent for a specific student.
        fetchStudents();
    }, []);

    // Watch selected student to fetch their parents
    useEffect(() => {
        if (selectedStudentId) {
            fetchParents(selectedStudentId);
        } else {
            setLoading(false);
            setParents([]);
        }
    }, [selectedStudentId]);

    const fetchStudents = async () => {
        try {
            // We need a way to get all students. 
            // The /api/users endpoint (which we haven't built yet fully) would be ideal.
            // But for now, let's use the attendance flow hack or just assume we have a few students.
            // Let's try fetching from /courses/1 for now as a fallback since we know students are there.
            // Ideally: GET /users?role=student
            // We will stub this with a known student list for the demo if API fails.

            // For this implementation, I will rely on the seeded data: Student (id: 3)
            setStudents([{ id: 3, name: 'Alice Student' }]);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setLoading(false);
        }
    };

    const fetchParents = async (studentId: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/students/${studentId}/parents`);
            setParents(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch parents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!selectedStudentId) {
                alert('Please select a student');
                return;
            }
            await api.post(`/students/${selectedStudentId}/parents`, {
                parentName,
                relationship,
                phone,
                email,
                studentId: Number(selectedStudentId),
                createdBy: user?.id || 1, // Fallback
            });
            alert(t('common.success'));
            setShowForm(false);
            // Reset form
            setParentName('');
            setRelationship('');
            setPhone('');
            setEmail('');
            fetchParents(selectedStudentId);
        } catch (error) {
            console.error('Failed to add parent:', error);
            alert(t('common.error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.delete') + '?')) return;
        try {
            await api.delete(`/parents/${id}`);
            fetchParents(selectedStudentId);
        } catch (error) {
            console.error('Failed to delete parent:', error);
            alert(t('common.error'));
        }
    }

    if (loading && !students.length) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('parents.title')}</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('parents.addParent')}
                </button>
            </div>

            <Card title={t('common.select')} className="mb-6 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('attendance.studentList')}</label>
                <select
                    className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                    <option value="">Select a Student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>)}
                </select>
            </Card>

            {showForm && (
                <Card title={t('parents.addParent')} className="mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('parents.parentName')}</label>
                                <input
                                    type="text"
                                    value={parentName}
                                    onChange={(e) => setParentName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('parents.relationship')}</label>
                                <input
                                    type="text"
                                    value={relationship}
                                    onChange={(e) => setRelationship(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('parents.phone')}</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('parents.email')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                {t('common.save')}
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            {selectedStudentId && (
                <Card title={t('parents.parentList')}>
                    <Table
                        data={parents}
                        keyExtractor={(item) => item.id}
                        columns={[
                            { header: t('parents.parentName'), accessor: (item) => item.parent_name },
                            { header: t('parents.relationship'), accessor: (item) => item.relationship },
                            { header: t('parents.phone'), accessor: (item) => item.phone || '-' },
                            { header: t('parents.email'), accessor: (item) => item.email || '-' },
                            {
                                header: t('common.actions'),
                                accessor: (item) => (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                ),
                            },
                        ]}
                        emptyMessage={t('common.noData')}
                    />
                </Card>
            )}
        </div>
    );
}
