import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import { Badge } from './Badge';

export interface ChartCardProps {
  title: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, badge, action, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {badge && <Badge variant="default">{badge}</Badge>}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
