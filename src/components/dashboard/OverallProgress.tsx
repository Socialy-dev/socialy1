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
  const strokeColor = theme === 'dark' ? '#080c14' : '#ffffff';

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Progression</h3>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 border border-border/50 rounded-lg hover:bg-secondary transition-all">
          Tous
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Semi-circle Chart */}
      <div className="relative flex-1 min-h-[140px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-1">
          <span className="text-3xl font-bold text-foreground tracking-tight">72%</span>
          <p className="text-xs text-muted-foreground font-medium">Complété</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border/50">
        <div className="text-center p-2.5 rounded-xl bg-secondary/50 dark:bg-secondary/20">
          <p className="text-xl font-bold text-foreground">95</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Total</p>
        </div>
        <div className="text-center p-2.5 rounded-xl bg-success/10">
          <p className="text-xl font-bold text-success">26</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Finis</p>
        </div>
        <div className="text-center p-2.5 rounded-xl bg-warning/10">
          <p className="text-xl font-bold text-warning">35</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Retard</p>
        </div>
        <div className="text-center p-2.5 rounded-xl bg-primary/10">
          <p className="text-xl font-bold text-primary">35</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Actifs</p>
        </div>
      </div>
    </div>
  );
};
