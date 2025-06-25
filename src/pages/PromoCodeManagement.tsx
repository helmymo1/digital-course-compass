
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Copy, Percent, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const PromoCodeManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState([
    {
      id: '1',
      code: 'WELCOME20',
      description: 'Welcome discount for new students',
      type: 'percentage',
      value: 20,
      usageLimit: 100,
      usageCount: 45,
      expiryDate: '2024-12-31',
      status: 'active',
      applicableCourses: ['all']
    },
    {
      id: '2',
      code: 'STUDENT50',
      description: 'Student special discount',
      type: 'fixed',
      value: 50,
      usageLimit: 50,
      usageCount: 23,
      expiryDate: '2024-06-30',
      status: 'active',
      applicableCourses: ['1', '2']
    },
    {
      id: '3',
      code: 'EXPIRED10',
      description: 'Expired promo code',
      type: 'percentage',
      value: 10,
      usageLimit: 200,
      usageCount: 156,
      expiryDate: '2024-01-01',
      status: 'expired',
      applicableCourses: ['all']
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    usageLimit: '',
    expiryDate: '',
    applicableCourses: 'all'
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPromoCode({...newPromoCode, code: result});
  };

  const handleCreatePromoCode = () => {
    const promoCode = {
      id: Date.now().toString(),
      ...newPromoCode,
      value: parseFloat(newPromoCode.value),
      usageLimit: parseInt(newPromoCode.usageLimit),
      usageCount: 0,
      status: 'active',
      applicableCourses: newPromoCode.applicableCourses === 'all' ? ['all'] : [newPromoCode.applicableCourses]
    };
    setPromoCodes([...promoCodes, promoCode]);
    setIsCreateDialogOpen(false);
    setNewPromoCode({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      usageLimit: '',
      expiryDate: '',
      applicableCourses: 'all'
    });
    toast({
      title: "Promo Code Created",
      description: "Your new promo code has been created successfully.",
    });
  };

  const handleDeletePromoCode = (id: string) => {
    setPromoCodes(promoCodes.filter(code => code.id !== id));
    toast({
      title: "Promo Code Deleted",
      description: "The promo code has been removed.",
    });
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: `Promo code "${code}" copied to clipboard.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `$${value}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="teacher" userName="John Instructor" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Promo Code Management</h1>
            <p className="text-muted-foreground">Create and manage discount codes for your courses</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Promo Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={newPromoCode.code}
                      onChange={(e) => setNewPromoCode({...newPromoCode, code: e.target.value.toUpperCase()})}
                      placeholder="Enter code or generate"
                    />
                    <Button type="button" onClick={generateRandomCode} variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newPromoCode.description}
                    onChange={(e) => setNewPromoCode({...newPromoCode, description: e.target.value})}
                    placeholder="Promo code description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount Type</Label>
                    <Select value={newPromoCode.type} onValueChange={(value) => setNewPromoCode({...newPromoCode, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">
                      {newPromoCode.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      value={newPromoCode.value}
                      onChange={(e) => setNewPromoCode({...newPromoCode, value: e.target.value})}
                      placeholder={newPromoCode.type === 'percentage' ? '20' : '50'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={newPromoCode.usageLimit}
                      onChange={(e) => setNewPromoCode({...newPromoCode, usageLimit: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newPromoCode.expiryDate}
                      onChange={(e) => setNewPromoCode({...newPromoCode, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Applicable Courses</Label>
                  <Select value={newPromoCode.applicableCourses} onValueChange={(value) => setNewPromoCode({...newPromoCode, applicableCourses: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="1">Complete Web Development Bootcamp</SelectItem>
                      <SelectItem value="2">Advanced React & Node.js</SelectItem>
                      <SelectItem value="3">Data Science with Python</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreatePromoCode} className="w-full">
                  Create Promo Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {promoCodes.map((promoCode) => (
            <Card key={promoCode.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-xl font-mono">{promoCode.code}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCodeToClipboard(promoCode.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-1">{promoCode.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(promoCode.status)}>
                      {promoCode.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePromoCode(promoCode.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Discount</p>
                      <p className="font-semibold">{formatValue(promoCode.type, promoCode.value)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Usage</p>
                      <p className="font-semibold">{promoCode.usageCount}/{promoCode.usageLimit}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expires</p>
                      <p className="font-semibold">{promoCode.expiryDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Courses</p>
                      <p className="font-semibold">
                        {promoCode.applicableCourses.includes('all') ? 'All' : promoCode.applicableCourses.length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCodeManagement;
