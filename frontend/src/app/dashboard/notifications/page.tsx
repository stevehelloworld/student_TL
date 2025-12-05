'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>
                <button
                    onClick={markAllAsRead}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                    <Check className="w-4 h-4 mr-2" />
                    {t('notifications.markAllRead')}
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t('notifications.noNotifications')}</div>
                ) : (
                    notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            title={notification.title}
                            className={notification.is_read ? 'opacity-75' : 'border-l-4 border-indigo-500'}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-600 mt-1">{notification.content}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800"
                                    >
                                        {t('notifications.markRead')}
                                    </button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
