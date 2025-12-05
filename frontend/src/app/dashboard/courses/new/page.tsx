'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';

export default function NewCoursePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        level: '',
        start_date: '',
        end_date: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: In a real app, we'd probably select a teacher. 
            // For now, if the creator is a teacher, assign them. If admin, maybe assign self or need a dropdown.
            // Simplified: Assign to current user if teacher, or hardcoded ID 2 (Teacher from seed) if Admin for demo.
            const teacherId = user?.role === 'teacher' ? user.id : 2;

            // Hardcoding classGroupId to 1 (from seed) for simplicity as per requirements scope does not mention Class creation UI yet.
            const classGroupId = 1;
            const creatorId = user?.id || 1;

            await api.post('/courses', {
                ...formData,
                teacherId,
                classGroupId,
                creatorId,
                // Ensure dates are ISO strings or Date objects as backend expects
                start_date: new Date(formData.start_date),
                end_date: new Date(formData.end_date),
            });

            router.push('/dashboard/courses');
            router.refresh();
        } catch (error) {
            console.error('Failed to create course:', error);
            alert(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('courses.addCourse')}</h1>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('courses.courseName')}</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('common.description')}</label>
                        <textarea
                            name="description"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('courses.level')}</label>
                        <input
                            type="text"
                            name="level"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={formData.level}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('courses.startDate')}</label>
                            <input
                                type="date"
                                name="start_date"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.start_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('courses.endDate')}</label>
                            <input
                                type="date"
                                name="end_date"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.end_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
