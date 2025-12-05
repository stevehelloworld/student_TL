'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { Table } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface Session {
    id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
}

interface CourseDetail {
    id: number;
    name: string;
    description: string;
    level: string;
    status: string;
    sessions: Session[];
    enrollments: { student: Student; status: string }[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchCourseDetails(params.id as string);
        }
    }, [params.id]);

    const fetchCourseDetails = async (id: string) => {
        try {
            const response = await api.get(`/courses/${id}`);
            setCourse(response.data.data);
        } catch (error) {
            console.error('Failed to fetch course details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading details...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <p className="text-gray-500 mt-2">{course.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Sessions">
                    <Table
                        data={course.sessions || []}
                        keyExtractor={(item) => item.id}
                        columns={[
                            {
                                header: 'Date',
                                accessor: (item) => new Date(item.session_date).toLocaleDateString(),
                            },
                            {
                                header: 'Time',
                                accessor: (item) =>
                                    `${new Date(item.start_time).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })} - ${new Date(item.end_time).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}`,
                            },
                            {
                                header: 'Status',
                                accessor: (item) => (
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'scheduled'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                ),
                            },
                        ]}
                    />
                </Card>

                <Card title="Enrolled Students">
                    <Table
                        data={course.enrollments || []}
                        keyExtractor={(item) => item.student.id}
                        columns={[
                            { header: 'Name', accessor: (item) => item.student.name },
                            { header: 'Email', accessor: (item) => item.student.email },
                            {
                                header: 'Status',
                                accessor: (item) => (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                        {item.status}
                                    </span>
                                ),
                            },
                        ]}
                    />
                </Card>
            </div>
        </div>
    );
}
