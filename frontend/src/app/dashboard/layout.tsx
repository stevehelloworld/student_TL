'use client';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    ClipboardCheck,
    FileText,
    Users,
    Bell,
    LogOut,
    Globe,
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const pathname = usePathname();

    const navigation = [
        { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: 'nav.courses', href: '/dashboard/courses', icon: BookOpen },
        { name: 'nav.classes', href: '/dashboard/classes', icon: Users }, // Using Users icon as placeholder or suggest another if available
        { name: 'nav.sessions', href: '/dashboard/sessions', icon: Calendar },
        { name: t('nav.attendance'), href: '/dashboard/attendance', icon: ClipboardCheck },
        { name: t('nav.leave'), href: '/dashboard/leave', icon: FileText },
        { name: t('nav.parents'), href: '/dashboard/parents', icon: Users },
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: t('nav.notifications'), href: '/dashboard/notifications', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-indigo-600">StudentSys</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        {t('auth.logout')}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {navigation.find((n) => n.href === pathname)?.name || t('dashboard.title')}
                                </h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors flex items-center"
                                    title={language === 'zh' ? 'Switch to English' : '切換至中文'}
                                >
                                    <Globe className="w-5 h-5 mr-1" />
                                    <span className="text-sm font-medium">{language === 'zh' ? 'EN' : '中'}</span>
                                </button>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {user?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
