'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

interface Course {
    id: number;
    name: string;
    description: string;
    level: string;
    start_date: string;
    end_date: string;
    teacher: {
        name: string;
    };
    _count: {
        enrollments: number;
    };
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('courses.title')}</h1>
                <Link href="/dashboard/courses/new">
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('courses.addCourse')}
                    </button>
                </Link>
            </div>

            <Card>
                <div className="mb-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Table
                    data={filteredCourses}
                    keyExtractor={(item) => item.id}
                    columns={[
                        { header: t('courses.courseName'), accessor: (item) => item.name },
                        { header: t('courses.level'), accessor: (item) => item.level },
                        { header: t('courses.teacher'), accessor: (item) => item.teacher?.name || '-' },
                        {
                            header: t('courses.startDate'),
                            accessor: (item) => new Date(item.start_date).toLocaleDateString(),
                        },
                        {
                            header: t('courses.enrolledStudents'),
                            accessor: (item) => item._count?.enrollments || 0,
                        },
                        {
                            header: t('common.actions'),
                            accessor: (item) => (
                                <Link
                                    href={`/dashboard/courses/${item.id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    {t('courses.viewDetails')}
                                </Link>
                            ),
                        },
                    ]}
                    emptyMessage={t('common.noData')}
                />
            </Card>
        </div>
    );
}
