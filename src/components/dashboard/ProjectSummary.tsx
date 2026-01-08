import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
interface Project {
  name: string;
  manager: string;
  dueDate: string;
  status: "Completed" | "Delayed" | "At risk" | "On going";
  progress: number;
}
const projects: Project[] = [{
  name: "Nelsa web developement",
  manager: "Om prakash sao",
  dueDate: "May 25, 2023",
  status: "Completed",
  progress: 100
}, {
  name: "Datascale AI app",
  manager: "Neilsan mando",
  dueDate: "Jun 20, 2023",
  status: "Delayed",
  progress: 35
}, {
  name: "Media channel branding",
  manager: "Tiruvelly priya",
  dueDate: "July 13, 2023",
  status: "At risk",
  progress: 68
}, {
  name: "Corlax iOS app developement",
  manager: "Matte hannery",
  dueDate: "Dec 20, 2023",
  status: "Completed",
  progress: 100
}, {
  name: "Website builder developement",
  manager: "Sukumar rao",
  dueDate: "Mar 15, 2024",
  status: "On going",
  progress: 50
}];
const getStatusStyles = (status: Project["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-success/10 text-success";
    case "Delayed":
      return "bg-warning/10 text-warning";
    case "At risk":
      return "bg-danger/10 text-danger";
    case "On going":
      return "bg-primary/10 text-primary";
  }
};
const getProgressColor = (progress: number) => {
  if (progress === 100) return "stroke-success";
  if (progress >= 50) return "stroke-primary";
  return "stroke-warning";
};
const CircularProgress = ({
  progress
}: {
  progress: number;
}) => {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress / 100 * circumference;
  return <div className="relative w-10 h-10 flex items-center justify-center">
      <svg className="w-10 h-10 -rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
        <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={getProgressColor(progress)} />
      </svg>
      <span className="absolute text-xs font-semibold text-foreground">{progress}%</span>
    </div>;
};
export const ProjectSummary = () => {
  return <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">RP</h3>
        <div className="flex gap-2">
          {["Project", "Project manager", "Status"].map(filter => <button key={filter} className="flex items-center gap-1 px-3 py-1.5 text-sm text-foreground bg-background/50 rounded-lg hover:bg-background transition-colors">
              {filter}
              <ChevronDown className="w-4 h-4" />
            </button>)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-4 text-sm font-semibold text-foreground">Name</th>
              <th className="pb-4 text-sm font-semibold text-foreground">Project manager</th>
              <th className="pb-4 text-sm font-semibold text-foreground">Due date</th>
              <th className="pb-4 text-sm font-semibold text-foreground">Status</th>
              <th className="pb-4 text-sm font-semibold text-foreground text-center">Progress</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => <tr key={index} className="border-t border-border/30">
                <td className="py-4 text-sm text-foreground">{project.name}</td>
                <td className="py-4 text-sm text-muted-foreground">{project.manager}</td>
                <td className="py-4 text-sm text-muted-foreground">{project.dueDate}</td>
                <td className="py-4">
                  <span className={cn("px-3 py-1 text-xs font-medium rounded-full", getStatusStyles(project.status))}>
                    {project.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex justify-center">
                    <CircularProgress progress={project.progress} />
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};