"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
  }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            labelStyle={{ color: "#374151" }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
