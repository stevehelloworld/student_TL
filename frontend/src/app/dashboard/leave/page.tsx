'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';

interface LeaveRequest {
    id: number;
    type: string;
    reason: string;
    status: string;
    created_at: string;
    student: {
        name: string;
    };
    sessions: {
        session: {
            session_date: string;
            course: {
                name: string;
            }
        }
    }[];
}

interface Course {
    id: number;
    name: string;
}

interface Session {
    id: number;
    session_date: string;
}

export default function LeavePage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { t } = useLanguage();

    // Form state
    const [courses, setCourses] = useState<Course[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [type, setType] = useState('sick');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchRequests();
        if (user?.role === 'student') {
            fetchCourses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCourse) {
            fetchSessions(selectedCourse);
        } else {
            setSessions([]);
        }
    }, [selectedCourse]);

    const fetchRequests = async () => {
        try {
            const endpoint = user?.role === 'student' ? `/leave?studentId=${user.id}` : '/leave';
            const response = await api.get(endpoint);
            setRequests(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            // Students should only see their enrolled courses, but general /courses might return all.
            // Ideally backend filters for student, or we filter user-side if response includes enrollment info.
            // For now, fetching all valid courses.
            const response = await api.get('/courses');
            setCourses(response.data.data || []);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!selectedSession || !user) return;

            await api.post('/leave', {
                studentId: user.id,
                courseId: Number(selectedCourse),
                sessionIds: [Number(selectedSession)],
                type,
                reason,
            });

            alert(t('common.success'));
            setShowForm(false);
            setReason('');
            setSelectedCourse('');
            setSelectedSession('');
            fetchRequests();
        } catch (error) {
            console.error('Failed to create request:', error);
            alert(t('common.error'));
        }
    };

    const handleApprove = async (id: number) => {
        if (!user) return;

        // Optimistic update
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'approved' } : req));

        try {
            await api.put(`/leave/${id}/status`, { status: 'approved', reviewerId: user.id });
            // success, stale state is already updated optimally.
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert(t('common.error')); // Notify user of failure
            await fetchRequests(); // Re-sync with server
        }
    };

    const handleReject = async (id: number) => {
        if (!user) return;

        // Optimistic update
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req));

        try {
            await api.put(`/leave/${id}/status`, { status: 'rejected', reviewerId: user.id });
            // success
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert(t('common.error'));
            await fetchRequests();
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('leave.title')}</h1>
                {user?.role === 'student' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('leave.newRequest')}
                    </button>
                )}
            </div>

            {showForm && (
                <Card title={t('leave.newRequest')} className="mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('attendance.selectCourse')}</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    required
                                >
                                    <option value="">{t('attendance.selectCourse')}</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('attendance.selectSession')}</label>
                                <select
                                    value={selectedSession}
                                    onChange={(e) => setSelectedSession(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    required
                                    disabled={!selectedCourse}
                                >
                                    <option value="">{t('attendance.selectSession')}</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{new Date(s.session_date).toLocaleDateString()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('leave.type')}</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                <option value="sick">{t('leave.sick')}</option>
                                <option value="personal">{t('leave.personal')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('leave.reason')}</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                rows={3}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                {t('common.submit')}
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Card title={t('leave.myRequests')}>
                <Table
                    data={requests}
                    keyExtractor={(item) => item.id}
                    columns={[
                        {
                            header: t('common.date'),
                            accessor: (item) => new Date(item.created_at).toLocaleDateString(),
                        },
                        {
                            header: 'Target Session', // Need translation key, but using string for now
                            // @ts-ignore
                            accessor: (item) => item.sessions?.[0]?.session?.session_date ? new Date(item.sessions[0].session.session_date).toLocaleDateString() : '-'
                        },
                        { header: t('leave.type'), accessor: (item) => item.type },
                        { header: t('leave.reason'), accessor: (item) => item.reason },
                        {
                            header: t('common.status'),
                            accessor: (item) => (
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : item.status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {item.status}
                                </span>
                            ),
                        },
                        ...(user?.role === 'teacher' || user?.role === 'admin' ? [{
                            header: 'Actions',
                            accessor: (item: LeaveRequest) => (
                                item.status === 'pending' ? (
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleApprove(item.id)} className="text-green-600 hover:text-green-800 text-xs">Approve</button>
                                        <button onClick={() => handleReject(item.id)} className="text-red-600 hover:text-red-800 text-xs">Reject</button>
                                    </div>
                                ) : null
                            )
                        }] : [])
                    ]}
                    emptyMessage={t('common.noData')}
                />
            </Card>
        </div>
    );
}
