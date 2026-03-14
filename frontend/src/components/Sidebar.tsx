import React from 'react';
import { UserProfile } from '../backend';
import { Page } from './AppLayout';
import LoginButton from './LoginButton';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  ClipboardList,
  Tag,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userProfile: UserProfile;
  onClose: () => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'voter-list', label: 'Voter List', icon: <Users className="w-5 h-5" /> },
  { id: 'voter-entry', label: 'Voter Entry', icon: <UserPlus className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'tasks', label: 'Task Management', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'label-printing', label: 'Label Printing', icon: <Tag className="w-5 h-5" /> },
];

export default function Sidebar({ currentPage, onNavigate, userProfile, onClose }: SidebarProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--sidebar-background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/voter-mgmt-logo.dim_128x128.png"
            alt="VoterMS Logo"
            className="w-10 h-10 object-contain rounded-lg"
          />
          <div>
            <h1 className="font-heading font-bold text-lg leading-tight" style={{ color: 'var(--sidebar-foreground)' }}>
              VoterMS
            </h1>
            <p className="text-xs" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>
              Management System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}
          >
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-foreground)' }}>
              {userProfile.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>
              {userProfile.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? 'var(--sidebar-accent)' : 'transparent',
                color: isActive ? 'var(--sidebar-accent-foreground)' : 'var(--sidebar-foreground)',
                opacity: isActive ? 1 : 0.8,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--sidebar-accent)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
            >
              <span style={{ color: isActive ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)', opacity: isActive ? 1 : 0.7 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <LoginButton />
        <p className="text-center text-xs mt-3" style={{ color: 'var(--sidebar-foreground)', opacity: 0.4 }}>
          © {new Date().getFullYear()} VoterMS
        </p>
      </div>
    </div>
  );
}
