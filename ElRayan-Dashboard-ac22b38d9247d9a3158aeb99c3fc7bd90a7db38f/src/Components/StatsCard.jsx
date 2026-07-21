import { Video as LucideIcon } from 'lucide-react';


export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    iconBgColor = 'bg-blue-50',
    iconColor = 'text-blue-600',
}) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                <div className={`${iconBgColor} ${iconColor} p-4 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
