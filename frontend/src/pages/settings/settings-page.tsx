import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { BusinessSettings } from './business-settings';
import { 
  Settings, 
  User, 
  Building2, 
  CreditCard, 
  Bell, 
  Shield,
  Database,
  Palette,
  ArrowLeft
} from 'lucide-react';

export function SettingsPage() {
  const { user, business } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal account settings',
      icon: User,
      items: ['Update profile information', 'Change password', 'Notification preferences'],
    },
    {
      id: 'business',
      title: 'Business Settings',
      description: 'Configure your business information',
      icon: Building2,
      items: ['Business details', 'Operating hours', 'Contact information'],
    },
    {
      id: 'billing',
      title: 'Subscription & Billing',
      description: 'Manage your subscription and payment methods',
      icon: CreditCard,
      items: ['Current plan', 'Payment methods', 'Billing history'],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Control your notification preferences',
      icon: Bell,
      items: ['Email notifications', 'SMS alerts', 'Desktop notifications'],
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Security and privacy settings',
      icon: Shield,
      items: ['Two-factor authentication', 'Active sessions', 'Privacy settings'],
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Backup and data management options',
      icon: Database,
      items: ['Data backup', 'Export data', 'Data retention policy'],
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel',
      icon: Palette,
      items: ['Theme settings', 'Display preferences', 'Language settings'],
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      items: ['Tax settings', 'Currency preferences', 'Receipt templates'],
    },
  ];

  // Handle section navigation
  if (activeSection === 'business') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
        </div>
        <BusinessSettings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account, business, and system preferences
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{user?.firstName} {user?.lastName}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Role: {user?.role}</p>
            </div>
          </div>
          {business && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{business.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  business.subscriptionStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {business.subscriptionStatus}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => section.id && setActiveSection(section.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <section.icon className="h-5 w-5 mr-2 text-primary" />
                {section.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    • {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common settings tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <Shield className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Enable 2FA</h3>
              <p className="text-sm text-muted-foreground">Secure your account</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <Database className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Backup Data</h3>
              <p className="text-sm text-muted-foreground">Export your business data</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <CreditCard className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Upgrade Plan</h3>
              <p className="text-sm text-muted-foreground">Access more features</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}