'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Plus, Trash, Edit } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    status: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { t } = useLanguage();

    // Form state
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', {
                name,
                username,
                email,
                password,
                role
            });
            alert(t('common.success'));
            setShowForm(false);
            // Reset form
            setName('');
            setUsername('');
            setEmail('');
            setPassword('');
            setRole('student');
            fetchUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
            alert(t('common.error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.delete') + '?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(t('common.error'));
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('sidebar.profile')} Management</h1> {/* Using profile key as placeholder if users key missing */}
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New User
                </button>
            </div>

            {showForm && (
                <Card title="New User" className="mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
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

            <Card title="User List">
                <Table
                    data={users}
                    keyExtractor={(item) => item.id}
                    columns={[
                        { header: 'Name', accessor: (item) => item.name },
                        { header: 'Username', accessor: (item) => item.username },
                        { header: 'Role', accessor: (item) => item.role },
                        {
                            header: 'Status',
                            accessor: (item) => (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {item.status}
                                </span>
                            )
                        },
                        {
                            header: t('common.actions'),
                            accessor: (item) => (
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash className="w-4 h-4" />
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
