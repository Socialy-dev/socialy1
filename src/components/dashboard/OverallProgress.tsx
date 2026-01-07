import { ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Completed", value: 26, color: "#1A932E" },
  { name: "Delayed", value: 35, color: "#DFA510" },
  { name: "On going", value: 35, color: "#E65F2B" },
];

const COLORS = ["#1A932E", "#DFA510", "#E65F2B"];

export const OverallProgress = () => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const completedPercentage = Math.round((data[0].value / (total - 1)) * 100);

  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Overall Progress</h3>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-foreground bg-background/50 rounded-lg hover:bg-background transition-colors">
          All
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Semi-circle Chart */}
      <div className="relative h-48 flex items-end justify-center mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
          <span className="text-4xl font-bold text-foreground">72%</span>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>

        {/* Scale Labels */}
        <span className="absolute left-4 bottom-2 text-xs text-muted-foreground">0</span>
        <span className="absolute left-1/4 top-8 text-xs text-muted-foreground">25</span>
        <span className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-muted-foreground">50</span>
        <span className="absolute right-1/4 top-8 text-xs text-muted-foreground">75</span>
        <span className="absolute right-4 bottom-2 text-xs text-muted-foreground">100</span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border/30">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">95</p>
          <p className="text-xs text-muted-foreground">Total projects</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">26</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">35</p>
          <p className="text-xs text-muted-foreground">Delayed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">35</p>
          <p className="text-xs text-muted-foreground">On going</p>
        </div>
      </div>
    </div>
  );
};
