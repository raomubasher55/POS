import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService } from '@/services/api.service';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Shield,
  ShieldCheck,
  Key,
  Smartphone,
  Copy,
  Download,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface MFAStatus {
  mfaEnabled: boolean;
  hasBackupCodes: boolean;
}

interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export function MFASettingsPage() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<MFASetup | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableMfaToken, setDisableMfaToken] = useState('');

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMFAStatus();
      setMfaStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch MFA status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load MFA status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    try {
      const response = await apiService.setupMFA();
      setSetupData(response.data.data);
      toast({
        title: 'MFA Setup',
        description: 'Scan the QR code with your authenticator app',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup MFA',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiService.verifyMFA(verificationToken);
      toast({
        title: 'Success',
        description: 'MFA has been enabled successfully',
      });
      setSetupData(null);
      setVerificationToken('');
      fetchMFAStatus();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid verification code',
        variant: 'destructive',
      });
    }
  };

  const handleDisableMFA = async () => {
    if (!disablePassword) {
      toast({
        title: 'Error',
        description: 'Password is required to disable MFA',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiService.disableMFA({
        password: disablePassword,
        mfaToken: disableMfaToken
      });
      toast({
        title: 'Success',
        description: 'MFA has been disabled',
      });
      setDisablePassword('');
      setDisableMfaToken('');
      fetchMFAStatus();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable MFA',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
    });
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `MFA Backup Codes\n\n${codes.join('\n')}\n\nKeep these codes in a safe place. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Multi-Factor Authentication</h2>
        <p className="text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mfaStatus?.mfaEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-500" />
            )}
            MFA Status
          </CardTitle>
          <CardDescription>
            {mfaStatus?.mfaEnabled 
              ? 'Multi-factor authentication is enabled for your account'
              : 'Multi-factor authentication is not enabled'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                mfaStatus?.mfaEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="font-medium">
                {mfaStatus?.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {!mfaStatus?.mfaEnabled && (
              <Button onClick={handleSetupMFA}>
                <Key className="h-4 w-4 mr-2" />
                Enable MFA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {setupData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Setup Authenticator App
            </CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app and enter the verification code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <img 
                src={setupData.qrCode} 
                alt="MFA QR Code" 
                className="mx-auto border rounded-lg p-4 bg-white"
              />
            </div>
            
            <div>
              <Label>Manual Entry Code</Label>
              <div className="flex gap-2">
                <Input value={setupData.secret} readOnly className="font-mono" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(setupData.secret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="verification">Verification Code</Label>
              <Input
                id="verification"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyMFA}
                disabled={verificationToken.length !== 6}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verify & Enable
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSetupData(null);
                  setVerificationToken('');
                }}
              >
                Cancel
              </Button>
            </div>

            {setupData.backupCodes && (
              <div className="border rounded-lg p-4 bg-yellow-50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-yellow-800">Save these backup codes:</p>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {setupData.backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-gray-100 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadBackupCodes(setupData.backupCodes)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Codes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {mfaStatus?.mfaEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Lock className="h-5 w-5" />
              Disable MFA
            </CardTitle>
            <CardDescription>
              Disable multi-factor authentication for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-red-50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-red-800">
                  Disabling MFA will make your account less secure. Make sure you have alternative security measures in place.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Current Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mfaToken">MFA Token</Label>
                <Input
                  id="mfaToken"
                  type="text"
                  placeholder="Enter 6-digit MFA code"
                  value={disableMfaToken}
                  onChange={(e) => setDisableMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>

              <Button 
                variant="destructive"
                onClick={handleDisableMFA}
                disabled={!disablePassword || disableMfaToken.length !== 6}
              >
                <Lock className="h-4 w-4 mr-2" />
                Disable MFA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}