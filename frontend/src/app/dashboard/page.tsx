'use client';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.welcome', { name: user?.name || '' })}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title={t('dashboard.overview')}>
                    <p className="text-gray-600">Dashboard content coming soon...</p>
                </Card>
            </div>
        </div>
    );
}
