import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/services/api.service';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Clock, 
  DollarSign, 
  Receipt, 
  Save,
  Loader2
} from 'lucide-react';

interface BusinessSettings {
  businessInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  settings: {
    taxRate: number;
    currency: string;
    receiptTemplate: string;
    loyaltyPointsRate: number;
    lowStockThreshold: number;
    autoBackup: boolean;
    businessHours: {
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
    paymentMethods: {
      cash: boolean;
      card: boolean;
      mobile: boolean;
      credit: boolean;
    };
    notifications: {
      lowStock: boolean;
      dailySummary: boolean;
      newCustomer: boolean;
    };
  };
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const;

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'PKR', label: 'Pakistani Rupee (₨)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
];

const RECEIPT_TEMPLATES = [
  { value: 'default', label: 'Default Template' },
  { value: 'modern', label: 'Modern Template' },
  { value: 'classic', label: 'Classic Template' },
  { value: 'minimal', label: 'Minimal Template' },
];

export function BusinessSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBusinessSettings();
      setSettings(response.data as any);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessInfo = async (businessInfo: BusinessSettings['businessInfo']) => {
    try {
      setSaving(true);
      await apiService.updateBusinessSettings({ businessInfo } as any);
      await fetchSettings();
      toast({
        title: 'Success',
        description: 'Business information updated successfully',
      });
    } catch (error) {
      console.error('Failed to update business info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business information',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = async (newSettings: Partial<BusinessSettings['settings']>) => {
    try {
      setSaving(true);
      await apiService.updateBusinessSettings(newSettings as any);
      await fetchSettings();
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePaymentMethods = async (paymentMethods: BusinessSettings['settings']['paymentMethods']) => {
    try {
      setSaving(true);
      await apiService.updatePaymentMethods(paymentMethods);
      await fetchSettings();
      toast({
        title: 'Success',
        description: 'Payment methods updated successfully',
      });
    } catch (error) {
      console.error('Failed to update payment methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment methods',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load settings. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Business Settings</h2>
        <p className="text-muted-foreground">
          Configure your business information and operational settings
        </p>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Business Information
          </CardTitle>
          <CardDescription>
            Update your business details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessInfo.name}
                onChange={(e) => setSettings({
                  ...settings,
                  businessInfo: { ...settings.businessInfo, name: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Phone Number</Label>
              <Input
                id="businessPhone"
                value={settings.businessInfo.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  businessInfo: { ...settings.businessInfo, phone: e.target.value }
                })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Email Address</Label>
            <Input
              id="businessEmail"
              type="email"
              value={settings.businessInfo.email}
              onChange={(e) => setSettings({
                ...settings,
                businessInfo: { ...settings.businessInfo, email: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea
              id="businessAddress"
              value={settings.businessInfo.address}
              onChange={(e) => setSettings({
                ...settings,
                businessInfo: { ...settings.businessInfo, address: e.target.value }
              })}
            />
          </div>
          <Button 
            onClick={() => updateBusinessInfo(settings.businessInfo)}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Business Info
          </Button>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Settings
          </CardTitle>
          <CardDescription>
            Configure tax rates, currency, and pricing options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.settings.taxRate * 100}
                onChange={(e) => setSettings({
                  ...settings,
                  settings: { 
                    ...settings.settings, 
                    taxRate: parseFloat(e.target.value) / 100 
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.settings.currency}
                onValueChange={(value) => setSettings({
                  ...settings,
                  settings: { ...settings.settings, currency: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="loyaltyRate">Loyalty Points Rate</Label>
              <Input
                id="loyaltyRate"
                type="number"
                min="0"
                value={settings.settings.loyaltyPointsRate}
                onChange={(e) => setSettings({
                  ...settings,
                  settings: { 
                    ...settings.settings, 
                    loyaltyPointsRate: parseInt(e.target.value) 
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockThreshold">Low Stock Threshold</Label>
              <Input
                id="stockThreshold"
                type="number"
                min="0"
                value={settings.settings.lowStockThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  settings: { 
                    ...settings.settings, 
                    lowStockThreshold: parseInt(e.target.value) 
                  }
                })}
              />
            </div>
          </div>
          <Button 
            onClick={() => updateSettings({
              taxRate: settings.settings.taxRate,
              currency: settings.settings.currency,
              loyaltyPointsRate: settings.settings.loyaltyPointsRate,
              lowStockThreshold: settings.settings.lowStockThreshold
            })}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Financial Settings
          </Button>
        </CardContent>
      </Card>

      {/* Receipt Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Receipt Settings
          </CardTitle>
          <CardDescription>
            Configure receipt template and formatting options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receiptTemplate">Receipt Template</Label>
            <Select
              value={settings.settings.receiptTemplate}
              onValueChange={(value) => setSettings({
                ...settings,
                settings: { ...settings.settings, receiptTemplate: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECEIPT_TEMPLATES.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => updateSettings({
              receiptTemplate: settings.settings.receiptTemplate
            })}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Receipt Settings
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Configure which payment methods are accepted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cash">Cash Payments</Label>
              <Switch
                id="cash"
                checked={settings.settings.paymentMethods.cash}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    paymentMethods: { 
                      ...settings.settings.paymentMethods, 
                      cash: checked 
                    }
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="card">Card Payments</Label>
              <Switch
                id="card"
                checked={settings.settings.paymentMethods.card}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    paymentMethods: { 
                      ...settings.settings.paymentMethods, 
                      card: checked 
                    }
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mobile">Mobile Payments</Label>
              <Switch
                id="mobile"
                checked={settings.settings.paymentMethods.mobile}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    paymentMethods: { 
                      ...settings.settings.paymentMethods, 
                      mobile: checked 
                    }
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="credit">Credit/Store Credit</Label>
              <Switch
                id="credit"
                checked={settings.settings.paymentMethods.credit}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    paymentMethods: { 
                      ...settings.settings.paymentMethods, 
                      credit: checked 
                    }
                  }
                })}
              />
            </div>
          </div>
          <Button 
            onClick={() => updatePaymentMethods(settings.settings.paymentMethods)}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Payment Methods
          </Button>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Business Hours
          </CardTitle>
          <CardDescription>
            Set your operating hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-24">
                <Label className="capitalize">{day}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!settings.settings.businessHours[day].closed}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    settings: {
                      ...settings.settings,
                      businessHours: {
                        ...settings.settings.businessHours,
                        [day]: {
                          ...settings.settings.businessHours[day],
                          closed: !checked
                        }
                      }
                    }
                  })}
                />
                <Label className="text-sm text-muted-foreground">Open</Label>
              </div>
              {!settings.settings.businessHours[day].closed && (
                <>
                  <Input
                    type="time"
                    value={settings.settings.businessHours[day].open}
                    onChange={(e) => setSettings({
                      ...settings,
                      settings: {
                        ...settings.settings,
                        businessHours: {
                          ...settings.settings.businessHours,
                          [day]: {
                            ...settings.settings.businessHours[day],
                            open: e.target.value
                          }
                        }
                      }
                    })}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={settings.settings.businessHours[day].close}
                    onChange={(e) => setSettings({
                      ...settings,
                      settings: {
                        ...settings.settings,
                        businessHours: {
                          ...settings.settings.businessHours,
                          [day]: {
                            ...settings.settings.businessHours[day],
                            close: e.target.value
                          }
                        }
                      }
                    })}
                    className="w-32"
                  />
                </>
              )}
            </div>
          ))}
          <Button 
            onClick={() => updateSettings({
              businessHours: settings.settings.businessHours
            })}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Business Hours
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lowStockNotif">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when items are running low
                </p>
              </div>
              <Switch
                id="lowStockNotif"
                checked={settings.settings.notifications.lowStock}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    notifications: { 
                      ...settings.settings.notifications, 
                      lowStock: checked 
                    }
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dailySummaryNotif">Daily Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily sales and performance reports
                </p>
              </div>
              <Switch
                id="dailySummaryNotif"
                checked={settings.settings.notifications.dailySummary}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    notifications: { 
                      ...settings.settings.notifications, 
                      dailySummary: checked 
                    }
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newCustomerNotif">New Customer Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new customers register
                </p>
              </div>
              <Switch
                id="newCustomerNotif"
                checked={settings.settings.notifications.newCustomer}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    notifications: { 
                      ...settings.settings.notifications, 
                      newCustomer: checked 
                    }
                  }
                })}
              />
            </div>
          </div>
          <Button 
            onClick={() => updateSettings({
              notifications: settings.settings.notifications
            })}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system-wide operational settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">Automatic Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup your data daily
              </p>
            </div>
            <Switch
              id="autoBackup"
              checked={settings.settings.autoBackup}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                settings: { ...settings.settings, autoBackup: checked }
              })}
            />
          </div>
          <Button 
            onClick={() => updateSettings({
              autoBackup: settings.settings.autoBackup
            })}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save System Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}