
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart, Settings, User } from 'lucide-react';
import Header from '@/components/Header';
import UserManagement from '@/components/admin/UserManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import RevenueControl from '@/components/admin/RevenueControl';
import PlatformSettings from '@/components/admin/PlatformSettings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock admin stats
  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '+12%',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Total Teachers',
      value: '156',
      change: '+8%',
      icon: <User className="h-5 w-5" />
    },
    {
      title: 'Total Revenue',
      value: '$87,420',
      change: '+23%',
      icon: <BarChart className="h-5 w-5" />
    },
    {
      title: 'Active Courses',
      value: '342',
      change: '+15%',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" userName="Admin" onRoleSwitch={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform and monitor performance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-green-600">{stat.change} from last month</p>
                      </div>
                      <div className="text-muted-foreground">{stat.icon}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button 
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setActiveTab('users')}
                  >
                    <div className="font-medium">Manage Users</div>
                    <div className="text-sm text-muted-foreground">Add, edit, or remove students and teachers</div>
                  </button>
                  <button 
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-muted-foreground">Monitor platform performance and engagement</div>
                  </button>
                  <button 
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setActiveTab('revenue')}
                  >
                    <div className="font-medium">Revenue Settings</div>
                    <div className="text-sm text-muted-foreground">Control course pricing and revenue distribution</div>
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">New teacher registered</p>
                        <p className="text-sm text-muted-foreground">Sarah Johnson joined</p>
                      </div>
                      <span className="text-xs text-muted-foreground">2h ago</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">Course published</p>
                        <p className="text-sm text-muted-foreground">Advanced React Development</p>
                      </div>
                      <span className="text-xs text-muted-foreground">4h ago</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">Payment processed</p>
                        <p className="text-sm text-muted-foreground">$299 course enrollment</p>
                      </div>
                      <span className="text-xs text-muted-foreground">6h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueControl />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
