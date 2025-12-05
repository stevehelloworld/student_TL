'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';

interface Course {
    id: number;
    name: string;
}

interface Session {
    id: number;
    session_date: string;
}

interface Student {
    id: number;
    name: string;
}

interface AttendanceRecord {
    id: number;
    status: string;
    note?: string;
    session: {
        session_date: string;
        course_id: number;
    }
}

export default function AttendancePage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [attendance, setAttendance] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);

    // Student specific state
    const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);

    const { t } = useLanguage();

    useEffect(() => {
        if (user?.role === 'student') {
            fetchMyAttendance();
        } else {
            fetchCourses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCourse && user?.role !== 'student') {
            fetchSessions(selectedCourse);
            fetchStudents(selectedCourse);
        } else {
            setSessions([]);
            setStudents([]);
        }
    }, [selectedCourse, user]);

    const fetchMyAttendance = async () => {
        try {
            const response = await api.get(`/attendance?studentId=${user?.id}`);
            setMyAttendance(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch my attendance:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            console.log('Fetched courses:', response.data);
            if (response.data && Array.isArray(response.data.data)) {
                setCourses(response.data.data);
            } else {
                console.error('Invalid courses data format:', response.data);
                setCourses([]);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchSessions = async (courseId: string) => {
        try {
            const response = await api.get('/sessions');
            // @ts-ignore
            const courseSessions = response.data.data.filter((s: any) => s.course_id === Number(courseId));
            setSessions(courseSessions || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };

    const fetchStudents = async (courseId: string) => {
        try {
            const response = await api.get(`/courses/${courseId}`);
            if (response.data.data && Array.isArray(response.data.data.enrollments)) {
                const enrolledStudents = response.data.data.enrollments.map((e: any) => e.student).filter(Boolean);
                setStudents(enrolledStudents);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudents([]);
        }
    }

    const handleAttendanceChange = (studentId: number, status: string) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId: Number(studentId),
                status,
            }));

            await api.post('/attendance', {
                sessionId: Number(selectedSession),
                records,
            });
            alert(t('attendance.markSuccess'));
        } catch (error) {
            console.error('Failed to mark attendance:', error);
            alert(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (user?.role === 'student') {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('attendance.title')}</h1>
                <Card title={t('attendance.myAttendance')}>
                    <Table
                        data={myAttendance}
                        keyExtractor={(item) => item.id}
                        columns={[
                            {
                                header: t('courses.courseName'),
                                // Ideally backend would return course name, but we only have ID in session. 
                                // For now display Session Date, improving this would require backend change or client match.
                                // Displaying Date for clarity.
                                accessor: (item) => new Date(item.session.session_date).toLocaleDateString()
                            },
                            {
                                header: 'Status',
                                accessor: (item) => (
                                    <span className={`px-2 py-1 rounded text-xs ${item.status === 'present' ? 'bg-green-100 text-green-800' :
                                            item.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                )
                            },
                            { header: 'Note', accessor: (item) => item.note || '-' },
                        ]}
                        emptyMessage={t('common.noData')}
                    />
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('attendance.title')}</h1>

            <Card title={t('attendance.selectSession')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('attendance.selectCourse')}</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">{t('attendance.selectCourse')}</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('attendance.selectSession')}</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            disabled={!selectedCourse}
                        >
                            <option value="">{t('attendance.selectSession')}</option>
                            {sessions.map((session) => (
                                <option key={session.id} value={session.id}>
                                    {new Date(session.session_date).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {selectedSession && students.length > 0 && (
                <Card title={t('attendance.studentList')}>
                    <Table
                        data={students}
                        keyExtractor={(item) => item.id}
                        columns={[
                            { header: t('courses.courseName'), accessor: (item) => item.name },
                            {
                                header: t('common.status'),
                                accessor: (item) => (
                                    <select
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                                        value={attendance[item.id] || ''}
                                        onChange={(e) => handleAttendanceChange(item.id, e.target.value)}
                                    >
                                        <option value="">{t('common.status')}</option>
                                        <option value="present">{t('attendance.present')}</option>
                                        <option value="absent">{t('attendance.absent')}</option>
                                        <option value="late">{t('attendance.late')}</option>
                                        <option value="excused">{t('attendance.excused')}</option>
                                    </select>
                                ),
                            },
                        ]}
                        emptyMessage={t('common.noData')}
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </Card>
            )}
        </div>
    );
}
