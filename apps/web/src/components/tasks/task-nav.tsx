import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Section {
  id: string;
  label: string;
}

export default function TaskNav() {
  const { t } = useTranslation();
  const sections: Section[] = useMemo(
    () => [
      { id: 'overview', label: t('labels.overview', { defaultValue: 'Overview' }) },
      { id: 'activity', label: t('labels.activity', { defaultValue: 'Activity' }) },
      { id: 'attachments', label: t('labels.files', { defaultValue: 'Attachments' }) },
      { id: 'comments', label: t('labels.comments') },
    ],
    [t]
  );

  const [active, setActive] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="border-b bg-background mb-4 md:sticky md:top-14 z-10">
      <ul className="flex gap-4">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={scrollTo(id)}
              className={cn(
                'block py-2 text-sm',
                active === id ? 'font-medium border-b-2 border-primary' : 'text-muted-foreground'
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}