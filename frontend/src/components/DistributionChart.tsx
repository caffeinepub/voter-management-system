import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';

export interface DistributionChartData {
  label: string;
  count: number;
}

interface EnrichedData extends DistributionChartData {
  percentage: number;
}

interface DistributionChartProps {
  title: string;
  data: DistributionChartData[];
  chartType: 'bar' | 'pie';
}

const COLORS = [
  'oklch(0.45 0.15 250)',
  'oklch(0.55 0.15 145)',
  'oklch(0.65 0.15 75)',
  'oklch(0.55 0.18 25)',
  'oklch(0.55 0.15 300)',
  'oklch(0.50 0.15 200)',
  'oklch(0.60 0.12 170)',
];

const barFormatter = (value: number, _name: string, entry: Payload<number, string>): [string, string] => {
  const pct = (entry.payload as EnrichedData | undefined)?.percentage ?? 0;
  return [`${value} (${pct}%)`, 'Count'];
};

const pieFormatter = (value: number, name: string, entry: Payload<number, string>): [string, string] => {
  const pct = (entry.payload as EnrichedData | undefined)?.percentage ?? 0;
  return [`${value} (${pct}%)`, name];
};

export default function DistributionChart({ title, data, chartType }: DistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const enriched: EnrichedData[] = data.map(d => ({
    ...d,
    percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
  }));

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <h3 className="font-heading font-semibold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
          No data available
        </div>
      ) : chartType === 'bar' ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={enriched} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              formatter={barFormatter}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {enriched.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={enriched}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ label, percentage }: { label: string; percentage: number }) =>
                `${label} (${percentage}%)`
              }
              labelLine={false}
            >
              {enriched.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              formatter={pieFormatter}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
