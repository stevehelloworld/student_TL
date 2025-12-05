'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { useLanguage } from '@/context/language-context';

interface Session {
    id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    course: {
        name: string;
    };
    teacher: {
        name: string;
    };
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            setSessions(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('sessions.title')}</h1>

            <Card title={t('sessions.upcomingSessions')}>
                <Table
                    data={sessions}
                    keyExtractor={(item) => item.id}
                    columns={[
                        {
                            header: t('sessions.sessionDate'),
                            accessor: (item) => new Date(item.session_date).toLocaleDateString(),
                        },
                        { header: t('courses.courseName'), accessor: (item) => item.course?.name || '-' },
                        {
                            header: t('sessions.startTime'),
                            accessor: (item) => new Date(item.start_time).toLocaleTimeString(),
                        },
                        {
                            header: t('sessions.endTime'),
                            accessor: (item) => new Date(item.end_time).toLocaleTimeString(),
                        },
                        { header: t('courses.teacher'), accessor: (item) => item.teacher?.name || '-' },
                    ]}
                    emptyMessage={t('common.noData')}
                />
            </Card>
        </div>
    );
}
