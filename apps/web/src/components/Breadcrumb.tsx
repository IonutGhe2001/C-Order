import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {item.href ? (
              <Link
                to={item.href}
                className="text-brand hover:underline focus-visible:ring-brand"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-brand-fg">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}