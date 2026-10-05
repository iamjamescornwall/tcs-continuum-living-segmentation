import React from 'react';
import { Bot, Cpu, Sparkles, Scale, User } from 'lucide-react';

export type InterventionType = 'Agent' | 'ML' | 'GenAI' | 'Rules' | 'Human' | string;

export interface InterventionBadgeProps {
  type: InterventionType;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const InterventionBadge: React.FC<InterventionBadgeProps> = ({
  type,
  showIcon = true,
  className = '',
  size = 'md',
}) => {
  const getConfig = () => {
    switch (type) {
      case 'Agent':
        return {
          bg: 'bg-[#8A6D1F]/10',
          text: 'text-[#8A6D1F]',
          border: 'border-[#8A6D1F]/30',
          icon: Bot,
        };
      case 'ML':
        return {
          bg: 'bg-[#0E7C86]/10',
          text: 'text-[#0E7C86]',
          border: 'border-[#0E7C86]/30',
          icon: Cpu,
        };
      case 'GenAI':
        return {
          bg: 'bg-[#5B6ABF]/10',
          text: 'text-[#5B6ABF]',
          border: 'border-[#5B6ABF]/30',
          icon: Sparkles,
        };
      case 'Rules':
        return {
          bg: 'bg-[#B0603C]/10',
          text: 'text-[#B0603C]',
          border: 'border-[#B0603C]/30',
          icon: Scale,
        };
      case 'Human':
        return {
          bg: 'bg-[#B03A2E]/10',
          text: 'text-[#B03A2E]',
          border: 'border-[#B03A2E]/30',
          icon: User,
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-300',
          icon: Bot,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1 inline shrink-0" />}
      {type}
    </span>
  );
};

export default InterventionBadge;
