import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface FieldCompletionData {
  fieldId: string;
  fieldLabel: string;
  completionRate: number;
  voiceUsageRate: number;
}

interface FieldCompletionChartProps {
  data: FieldCompletionData[];
}

export function FieldCompletionChart({ data }: FieldCompletionChartProps) {
  return (
    <div>
      <h3 className="text-base font-medium text-secondary-900 dark:text-white">
        Field Completion & Voice Usage
      </h3>
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 10,
              right: 30,
              left: 100,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              stroke="#6B7280"
            />
            <YAxis
              type="category"
              dataKey="fieldLabel"
              stroke="#6B7280"
              width={90}
            />
            <Tooltip
              formatter={(value: number) => `${Math.round(value * 100)}%`}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#F3F4F6',
              }}
            />
            <Legend />
            <Bar 
              dataKey="completionRate" 
              name="Completion Rate"
              fill="#3B82F6" 
              radius={[0, 4, 4, 0]}
            />
            <Bar 
              dataKey="voiceUsageRate" 
              name="Voice Usage"
              fill="#10B981" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 