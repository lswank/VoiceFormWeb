import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ResponseTimelineData {
  date: string;
  count: number;
}

interface ResponseTimelineChartProps {
  data: ResponseTimelineData[];
}

export function ResponseTimelineChart({ data }: ResponseTimelineChartProps) {
  return (
    <div>
      <h3 className="text-base font-medium text-secondary-900 dark:text-white">
        Response Timeline
      </h3>
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#F3F4F6',
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 