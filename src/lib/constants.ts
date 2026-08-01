import type { Department } from './types';
import {
  Zap,
  Construction,
  Trash2,
  Droplets,
  type LucideIcon,
} from 'lucide-react';

export interface DepartmentConfig {
  key: Department;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  ringColor: string;
}

export const DEPARTMENTS: DepartmentConfig[] = [
  {
    key: 'Electricity',
    label: 'Electricity',
    icon: Zap,
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    ringColor: 'ring-amber-400',
  },
  {
    key: 'Potholes & Roads',
    label: 'Potholes & Roads',
    icon: Construction,
    color: 'slate',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-700',
    ringColor: 'ring-slate-400',
  },
  {
    key: 'Municipality & Waste',
    label: 'Municipality & Waste',
    icon: Trash2,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    ringColor: 'ring-emerald-400',
  },
  {
    key: 'Water Supply',
    label: 'Water Supply',
    icon: Droplets,
    color: 'sky',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    textColor: 'text-sky-700',
    ringColor: 'ring-sky-400',
  },
];

export const STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  Pending: {
    label: 'Pending',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  'In Progress': {
    label: 'In Progress',
    dotClass: 'bg-sky-500',
    badgeClass: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  Resolved: {
    label: 'Resolved',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

export const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'] as const;
