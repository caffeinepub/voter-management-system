import React from 'react';
import LoginButton from '../components/LoginButton';
import { Shield, Users, BarChart3, ClipboardList } from 'lucide-react';

export default function LoginScreen() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'var(--sidebar-background)' }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/voter-mgmt-logo.dim_128x128.png"
            alt="VoterMS"
            className="w-12 h-12 object-contain rounded-xl"
          />
          <div>
            <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--sidebar-foreground)' }}>
              VoterMS
            </h1>
            <p className="text-sm" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>
              Voter Management System
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-heading font-bold text-4xl mb-4" style={{ color: 'var(--sidebar-foreground)' }}>
              Manage Voters<br />with Confidence
            </h2>
            <p className="text-lg" style={{ color: 'var(--sidebar-foreground)', opacity: 0.7 }}>
              A comprehensive platform for voter registration, management, and analytics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Users className="w-5 h-5" />, label: 'Voter Registry', desc: 'Complete voter records' },
              { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', desc: 'Data-driven insights' },
              { icon: <ClipboardList className="w-5 h-5" />, label: 'Task Management', desc: 'Role-based workflows' },
              { icon: <Shield className="w-5 h-5" />, label: 'Secure Access', desc: 'Role-based permissions' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="p-4 rounded-xl"
                style={{ background: 'var(--sidebar-accent)' }}
              >
                <div style={{ color: 'var(--sidebar-primary)' }}>{feature.icon}</div>
                <p className="font-semibold text-sm mt-2" style={{ color: 'var(--sidebar-foreground)' }}>
                  {feature.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm" style={{ color: 'var(--sidebar-foreground)', opacity: 0.4 }}>
          © {new Date().getFullYear()} VoterMS. Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--sidebar-primary)', opacity: 1 }}
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <img
              src="/assets/generated/voter-mgmt-logo.dim_128x128.png"
              alt="VoterMS"
              className="w-12 h-12 object-contain rounded-xl"
            />
            <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--foreground)' }}>
              VoterMS
            </h1>
          </div>

          <div className="text-center">
            <h2 className="font-heading font-bold text-3xl" style={{ color: 'var(--foreground)' }}>
              Welcome Back
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Sign in to access the Voter Management System
            </p>
          </div>

          <div
            className="p-8 rounded-2xl border shadow-sm space-y-6"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="space-y-2 text-center">
              <Shield className="w-12 h-12 mx-auto" style={{ color: 'var(--primary)' }} />
              <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                Secure Authentication
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Use Internet Identity for secure, decentralized authentication.
              </p>
            </div>

            <LoginButton />

            <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
              Your identity is protected by Internet Computer's cryptographic security.
            </p>
          </div>

          <p className="text-center text-xs lg:hidden" style={{ color: 'var(--muted-foreground)' }}>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)' }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
