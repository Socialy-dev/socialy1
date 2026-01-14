import { ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/theme-provider";

const data = [
  { name: "Completed", value: 26, color: "#22c55e" },
  { name: "Delayed", value: 35, color: "#f59e0b" },
  { name: "On going", value: 35, color: "#8b5cf6" },
];

const COLORS = ["#22c55e", "#f59e0b", "#8b5cf6"];

export const OverallProgress = () => {
  const { theme } = useTheme();
  // Ensure stroke color adapts to theme
  const strokeColor = theme === 'dark' ? '#080c14' : '#ffffff';

  return (
    <div className="glass-card p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Overall Progress</h3>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-secondary/50 border border-border rounded-xl hover:bg-secondary transition-all">
          All
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Semi-circle Chart */}
      <div className="relative h-44 flex items-end justify-center mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke={strokeColor} // Dynamic stroke
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
          <span className="text-4xl font-bold text-foreground tracking-tight">72%</span>
          <p className="text-sm text-muted-foreground font-medium">Completed</p>
        </div>

        {/* Scale Labels */}
        <span className="absolute left-2 bottom-2 text-xs text-muted-foreground font-medium">0</span>
        <span className="absolute left-[18%] top-10 text-xs text-muted-foreground font-medium">25</span>
        <span className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-muted-foreground font-medium">50</span>
        <span className="absolute right-[18%] top-10 text-xs text-muted-foreground font-medium">75</span>
        <span className="absolute right-2 bottom-2 text-xs text-muted-foreground font-medium">100</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 pt-5 border-t border-border/50">
        <div className="text-center p-3 rounded-xl bg-secondary/50 dark:bg-secondary/20 hover:bg-secondary transition-colors">
          <p className="text-2xl font-bold text-foreground">95</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">Total</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-success/10 hover:bg-success/20 transition-colors">
          <p className="text-2xl font-bold text-success">26</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">Done</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-warning/10 hover:bg-warning/20 transition-colors">
          <p className="text-2xl font-bold text-warning">35</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">Delayed</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
          <p className="text-2xl font-bold text-primary">35</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">Active</p>
        </div>
      </div>
    </div>
  );
};
