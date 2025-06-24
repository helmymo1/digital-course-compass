
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Users, CreditCard, Download, Filter } from 'lucide-react';

const PaymentAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const paymentStats = {
    totalRevenue: 45670,
    monthlyGrowth: 12.5,
    totalTransactions: 234,
    averageOrderValue: 195.12
  };

  const recentPayments = [
    {
      id: 'pay_1',
      studentName: 'Alice Johnson',
      course: 'Complete Web Development Bootcamp',
      amount: 99,
      status: 'completed',
      date: '2024-01-15',
      method: 'stripe'
    },
    {
      id: 'pay_2',
      studentName: 'Bob Smith',
      course: 'Advanced React & Node.js',
      amount: 129,
      status: 'completed',
      date: '2024-01-14',
      method: 'paypal'
    },
    {
      id: 'pay_3',
      studentName: 'Carol Davis',
      course: 'Data Science with Python',
      amount: 0,
      status: 'completed',
      date: '2024-01-14',
      method: 'free'
    },
    {
      id: 'pay_4',
      studentName: 'David Wilson',
      course: 'Complete Web Development Bootcamp',
      amount: 99,
      status: 'pending',
      date: '2024-01-13',
      method: 'stripe'
    }
  ];

  const subscriptions = [
    {
      id: 'sub_1',
      studentName: 'Emily Brown',
      plan: 'Pro Monthly',
      amount: 29,
      status: 'active',
      nextBilling: '2024-02-15'
    },
    {
      id: 'sub_2',
      studentName: 'Frank Miller',
      plan: 'Premium Annual',
      amount: 299,
      status: 'active',
      nextBilling: '2024-12-01'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe': return '💳';
      case 'paypal': return '🟦';
      case 'free': return '🆓';
      default: return '💳';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="teacher" userName="John Instructor" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Analytics</h1>
            <p className="text-muted-foreground">Track your revenue and payment performance</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${paymentStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{paymentStats.monthlyGrowth}%</div>
              <p className="text-xs text-muted-foreground">Compared to last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${paymentStats.averageOrderValue}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">Recent Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getMethodIcon(payment.method)}</div>
                        <div>
                          <p className="font-medium">{payment.studentName}</p>
                          <p className="text-sm text-muted-foreground">{payment.course}</p>
                          <p className="text-xs text-muted-foreground">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {payment.amount === 0 ? 'Free' : `$${payment.amount}`}
                        </p>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{subscription.studentName}</p>
                        <p className="text-sm text-muted-foreground">{subscription.plan}</p>
                        <p className="text-xs text-muted-foreground">Next billing: {subscription.nextBilling}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${subscription.amount}/month</p>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentAnalytics;
