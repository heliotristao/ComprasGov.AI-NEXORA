declare module "recharts" {
  import type * as React from "react"

  export interface RechartsComponentProps {
    [key: string]: unknown
  }

  export const ResponsiveContainer: React.ComponentType<RechartsComponentProps>
  export const LineChart: React.ComponentType<RechartsComponentProps>
  export const Line: React.ComponentType<RechartsComponentProps>
  export const BarChart: React.ComponentType<RechartsComponentProps>
  export const Bar: React.ComponentType<RechartsComponentProps>
  export const XAxis: React.ComponentType<RechartsComponentProps>
  export const YAxis: React.ComponentType<RechartsComponentProps>
  export const CartesianGrid: React.ComponentType<RechartsComponentProps>
  export const Legend: React.ComponentType<RechartsComponentProps>
  export const Tooltip: React.ComponentType<RechartsComponentProps>
}
