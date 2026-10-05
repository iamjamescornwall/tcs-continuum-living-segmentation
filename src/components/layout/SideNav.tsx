import React from 'react';
import { NavLink } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { PersonaId } from '../../types';
import {
  LayoutDashboard,
  Calculator,
  BookOpen,
  Database,
  UploadCloud,
  Sparkles,
  FolderGit2,
  PieChart,
  Activity,
  CheckSquare,
  Send,
  HeartPulse,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export interface SideNavProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedPersonas?: PersonaId[];
}

interface NavGroup {
  id: string;
  name: string;
  question: string;
  items: NavItem[];
  allowedPersonas?: PersonaId[];
}

export const SideNav: React.FC<SideNavProps> = ({ collapsed, onToggleCollapse }) => {
  const { currentPersona } = useAppStore();

  const isFieldRep = currentPersona === 'P4';

  const navGroups: NavGroup[] = [
    {
      id: 'overview',
      name: 'Overview',
      question: 'Is segmentation healthy and worth it?',
      allowedPersonas: ['P1', 'P6'],
      items: [
        { id: 'S01', label: 'Executive Cockpit', path: '/cockpit', icon: LayoutDashboard },
        { id: 'S02', label: 'Value Calculator', path: '/value-calculator', icon: Calculator, allowedPersonas: ['P1', 'P6'] },
      ],
    },
    {
      id: 'standards',
      name: 'Standards & Data',
      question: 'What are the rules, and is our data ready?',
      allowedPersonas: ['P1', 'P2', 'P5'],
      items: [
        { id: 'S03', label: 'Global Standards', path: '/standards', icon: BookOpen, allowedPersonas: ['P1'] },
        { id: 'S04', label: 'Market Data', path: '/market-data', icon: Database, allowedPersonas: ['P1', 'P2'] },
        { id: 'S05', label: 'Data Intake', path: '/intake', icon: UploadCloud, allowedPersonas: ['P1', 'P5'] },
      ],
    },
    {
      id: 'segments',
      name: 'Segments',
      question: 'What segments do we have, and what do they tell us?',
      allowedPersonas: ['P1', 'P2', 'P3', 'P6'],
      items: [
        { id: 'S06', label: 'Segmentation Studio', path: '/studio', icon: Sparkles, allowedPersonas: ['P1', 'P2'] },
        { id: 'S07', label: 'Segment Library', path: '/library', icon: FolderGit2, allowedPersonas: ['P1', 'P2'] },
        { id: 'S08', label: 'Segment Insights', path: '/insights', icon: PieChart, allowedPersonas: ['P1', 'P2', 'P3', 'P6'] },
      ],
    },
    {
      id: 'changes',
      name: 'Changes',
      question: 'What changed, and what do we do about it?',
      allowedPersonas: ['P1', 'P2', 'P3', 'P4'],
      items: [
        { id: 'S09', label: 'Change Monitor', path: '/change-monitor', icon: Activity, allowedPersonas: ['P1', 'P2'] },
        {
          id: 'S10',
          label: isFieldRep ? 'My Customers' : 'Review Queue',
          path: '/review-queue',
          icon: CheckSquare,
          allowedPersonas: ['P1', 'P2', 'P3', 'P4'],
        },
        { id: 'S11', label: 'Publish to CRM', path: '/publish', icon: Send, allowedPersonas: ['P1', 'P2', 'P3'] },
      ],
    },
    {
      id: 'controls',
      name: 'Controls',
      question: 'Is it under control and fair?',
      allowedPersonas: ['P1', 'P6'],
      items: [
        { id: 'S12', label: 'Segment Health', path: '/health', icon: HeartPulse },
        { id: 'S13', label: 'Audit & Learning', path: '/audit', icon: History },
        { id: 'S14', label: 'Responsible AI', path: '/responsible-ai', icon: ShieldCheck },
      ],
    },
  ];

  // Filter groups and items visible to current persona
  const visibleGroups = navGroups
    .filter((g) => !g.allowedPersonas || g.allowedPersonas.includes(currentPersona))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.allowedPersonas || item.allowedPersonas.includes(currentPersona)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] bg-navy-900 border-r border-navy-800 flex flex-col justify-between transition-all duration-200 z-20 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {visibleGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {/* Group Header with Question Tooltip */}
            {!collapsed && (
              <div
                className="px-2.5 py-1 text-3xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between cursor-help group"
                title={group.question}
              >
                <span>{group.name}</span>
                <HelpCircle className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />
              </div>
            )}

            {/* Group Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={collapsed ? `${item.label} — ${group.question}` : group.question}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-navy-800'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-navy-800 flex items-center justify-between">
        {!collapsed && (
          <span className="text-3xs text-slate-400 font-medium px-2">Collapse menu</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={`p-1.5 rounded text-slate-400 hover:text-white hover:bg-navy-800 transition ${
            collapsed ? 'mx-auto' : ''
          }`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default SideNav;
