import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../../lib/lucide-icon';

interface ActivityItem {
  icon: IconName;
  title: string;
  time: string;
}

export default function RecentActivity() {
  const activities: ActivityItem[] = [
    { icon: 'check-circle', title: 'Completed task', time: '2h ago' },
    { icon: 'user-plus', title: 'New supplier added', time: '3h ago' },
    { icon: 'file-text', title: 'Generated report', time: '1d ago' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <Link to="/activity" className="text-sm text-brand hover:underline">
          View all
        </Link>
      </div>
      <ul className="space-y-2">
        {activities.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon name={item.icon} className="h-4 w-4 text-brand" />
              <span>{item.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}