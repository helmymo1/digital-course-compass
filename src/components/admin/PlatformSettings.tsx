
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PlatformSettings = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    platformName: 'EduPlatform',
    enableRegistration: true,
    requireEmailVerification: true,
    allowGuestAccess: false,
    maxFileUploadSize: 10,
    sessionTimeout: 60,
    maintenanceMode: false,
    welcomeMessage: 'Welcome to our learning platform!',
    supportEmail: 'support@eduplatform.com',
    maxCoursesPerTeacher: 20,
    courseApprovalRequired: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving platform settings:', settings);
    // Here you would save the settings to your backend
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Platform Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => handleSettingChange('platformName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* User Registration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Registration</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableRegistration">Enable User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register on the platform</p>
                </div>
                <Switch
                  id="enableRegistration"
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) => handleSettingChange('enableRegistration', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify their email before accessing the platform</p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowGuestAccess">Allow Guest Access</Label>
                  <p className="text-sm text-muted-foreground">Allow users to browse courses without registration</p>
                </div>
                <Switch
                  id="allowGuestAccess"
                  checked={settings.allowGuestAccess}
                  onCheckedChange={(checked) => handleSettingChange('allowGuestAccess', checked)}
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                <Input
                  id="maxFileUploadSize"
                  type="number"
                  value={settings.maxFileUploadSize}
                  onChange={(e) => handleSettingChange('maxFileUploadSize', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Enable maintenance mode to prevent user access</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>
          </div>

          {/* Course Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxCoursesPerTeacher">Max Courses Per Teacher</Label>
                <Input
                  id="maxCoursesPerTeacher"
                  type="number"
                  value={settings.maxCoursesPerTeacher}
                  onChange={(e) => handleSettingChange('maxCoursesPerTeacher', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="courseApprovalRequired">Course Approval Required</Label>
                <p className="text-sm text-muted-foreground">New courses require admin approval before publishing</p>
              </div>
              <Switch
                id="courseApprovalRequired"
                checked={settings.courseApprovalRequired}
                onCheckedChange={(checked) => handleSettingChange('courseApprovalRequired', checked)}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSettings} size="lg">
              Save All Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-muted-foreground">Server Status</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1.2s</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSettings;
