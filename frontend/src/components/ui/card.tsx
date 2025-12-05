import React from 'react';

interface CardProps {
    title: string;
    description?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function Card({ title, description, footer, children, className = '' }: CardProps) {
    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                <div className="mt-4">{children}</div>
            </div>
            {footer && <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">{footer}</div>}
        </div>
    );
}
