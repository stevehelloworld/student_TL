'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';

interface ClassGroup {
    id: number;
    name: string;
    academic_year: string;
    semester: string;
    description: string;
    status: string;
}

export default function ClassesPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        academic_year: new Date().getFullYear().toString(),
        semester: '1',
        description: '',
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes');
            setClasses(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClassesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/classes', {
                ...formData,
                status: 'active',
                created_by: user?.id || 1,
                // class_teacher_id: optional, can add later
            });
            alert(t('common.success'));
            setShowForm(false);
            setFormData({
                name: '',
                academic_year: new Date().getFullYear().toString(),
                semester: '1',
                description: '',
            });
            fetchClasses();
        } catch (error) {
            console.error('Failed to create class:', error);
            alert(t('common.error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.delete') + '?')) return;
        try {
            await api.delete(`/classes/${id}`);
            fetchClasses();
        } catch (error) {
            console.error('Failed to delete class:', error);
            alert(t('common.error'));
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('nav.classes')}</h1>
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('common.add')}
                    </button>
                )}
            </div>

            {showForm && (
                <Card title={t('common.add')} className="mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('classes.className')}</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleClassesChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('classes.academicYear')}</label>
                                <input
                                    type="text"
                                    name="academic_year"
                                    required
                                    value={formData.academic_year}
                                    onChange={handleClassesChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('classes.semester')}</label>
                                <input
                                    type="text"
                                    name="semester"
                                    required
                                    value={formData.semester}
                                    onChange={handleClassesChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('common.description')}</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleClassesChange}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
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

            <Card>
                <Table
                    data={classes}
                    keyExtractor={(c) => c.id}
                    columns={[
                        { header: t('classes.className'), accessor: (c) => c.name },
                        { header: t('classes.academicYear'), accessor: (c) => c.academic_year },
                        { header: t('classes.semester'), accessor: (c) => c.semester },
                        { header: t('common.description'), accessor: (c) => c.description || '-' },
                        {
                            header: t('common.actions'),
                            accessor: (c) => (
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    {t('common.delete')}
                                </button>
                            ),
                        },
                    ]}
                    emptyMessage={t('common.noData')}
                />
            </Card>
        </div>
    );
}
