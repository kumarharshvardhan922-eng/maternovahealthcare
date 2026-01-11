import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { GovernmentFunding } from '@/types/healthcare';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  Search,
  CheckCircle,
  Clock,
  IndianRupee,
  Users,
  Heart,
  Baby
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const FundingSection = () => {
  const { governmentFunding, setGovernmentFunding, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEligibility, setFilterEligibility] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFunding, setEditingFunding] = useState<GovernmentFunding | null>(null);
  
  const [formData, setFormData] = useState({
    schemeName: '',
    description: '',
    eligibility: 'all' as 'pregnant' | 'elderly' | 'infant' | 'all',
    amountINR: 0,
    disbursementDate: '',
    status: 'pending' as 'pending' | 'approved' | 'disbursed',
    beneficiaryCount: 0,
    notes: '',
  });

  const isAsha = currentUser?.role === 'asha';

  const filteredFunding = governmentFunding.filter(fund => {
    const matchesEligibility = filterEligibility === 'all' || fund.eligibility === filterEligibility || fund.eligibility === 'all';
    const matchesSearch = fund.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fund.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEligibility && matchesSearch;
  });

  const totalDisbursed = governmentFunding
    .filter(f => f.status === 'disbursed')
    .reduce((sum, f) => sum + (f.amountINR * f.beneficiaryCount), 0);

  const totalApproved = governmentFunding
    .filter(f => f.status === 'approved')
    .reduce((sum, f) => sum + (f.amountINR * f.beneficiaryCount), 0);

  const getEligibilityIcon = (eligibility: string) => {
    switch (eligibility) {
      case 'pregnant': return <Heart className="w-4 h-4 text-terracotta" />;
      case 'elderly': return <Users className="w-4 h-4 text-sky" />;
      case 'infant': return <Baby className="w-4 h-4 text-lavender" />;
      case 'all': return <Users className="w-4 h-4 text-primary" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'disbursed':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Disbursed</span>;
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!formData.schemeName || !formData.description || !formData.amountINR) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingFunding) {
      setGovernmentFunding(prev =>
        prev.map(f => f.id === editingFunding.id ? {
          ...f,
          ...formData,
          disbursementDate: formData.disbursementDate ? new Date(formData.disbursementDate) : undefined,
        } : f)
      );
      toast.success('Funding scheme updated');
    } else {
      const newFunding: GovernmentFunding = {
        id: Date.now().toString(),
        schemeName: formData.schemeName,
        description: formData.description,
        eligibility: formData.eligibility,
        amountINR: formData.amountINR,
        disbursementDate: formData.disbursementDate ? new Date(formData.disbursementDate) : undefined,
        status: formData.status,
        beneficiaryCount: formData.beneficiaryCount,
        notes: formData.notes,
      };
      setGovernmentFunding(prev => [newFunding, ...prev]);
      toast.success('Funding scheme added');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      schemeName: '',
      description: '',
      eligibility: 'all',
      amountINR: 0,
      disbursementDate: '',
      status: 'pending',
      beneficiaryCount: 0,
      notes: '',
    });
    setEditingFunding(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (funding: GovernmentFunding) => {
    setEditingFunding(funding);
    setFormData({
      schemeName: funding.schemeName,
      description: funding.description,
      eligibility: funding.eligibility,
      amountINR: funding.amountINR,
      disbursementDate: funding.disbursementDate ? format(funding.disbursementDate, 'yyyy-MM-dd') : '',
      status: funding.status,
      beneficiaryCount: funding.beneficiaryCount,
      notes: funding.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setGovernmentFunding(prev => prev.filter(f => f.id !== id));
    toast.success('Funding scheme deleted');
  };

  const exportData = () => {
    const csvContent = [
      ['Scheme Name', 'Description', 'Eligibility', 'Amount (INR)', 'Total Amount', 'Status', 'Beneficiaries', 'Disbursement Date', 'Notes'],
      ...governmentFunding.map(f => [
        f.schemeName,
        f.description,
        f.eligibility,
        f.amountINR,
        f.amountINR * f.beneficiaryCount,
        f.status,
        f.beneficiaryCount,
        f.disbursementDate ? format(f.disbursementDate, 'yyyy-MM-dd') : '',
        f.notes || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `government-funding-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Funding data exported');
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} K`;
    }
    return `₹${amount}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Government Funding</h1>
          <p className="text-muted-foreground">Track government schemes and disbursements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {isAsha && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingFunding ? 'Edit' : 'Add'} Funding Scheme</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Scheme Name *</label>
                    <Input
                      value={formData.schemeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, schemeName: e.target.value }))}
                      placeholder="e.g., Pradhan Mantri Matru Vandana Yojana"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the scheme"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Eligibility *</label>
                      <Select
                        value={formData.eligibility}
                        onValueChange={(v: 'pregnant' | 'elderly' | 'infant' | 'all') => 
                          setFormData(prev => ({ ...prev, eligibility: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="pregnant">Pregnant Women</SelectItem>
                          <SelectItem value="elderly">Elderly</SelectItem>
                          <SelectItem value="infant">Infants</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status *</label>
                      <Select
                        value={formData.status}
                        onValueChange={(v: 'pending' | 'approved' | 'disbursed') => 
                          setFormData(prev => ({ ...prev, status: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="disbursed">Disbursed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
                      <Input
                        type="number"
                        value={formData.amountINR}
                        onChange={(e) => setFormData(prev => ({ ...prev, amountINR: parseInt(e.target.value) || 0 }))}
                        placeholder="Per beneficiary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Beneficiaries</label>
                      <Input
                        type="number"
                        value={formData.beneficiaryCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryCount: parseInt(e.target.value) || 0 }))}
                        placeholder="Number of beneficiaries"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Disbursement Date</label>
                    <Input
                      type="date"
                      value={formData.disbursementDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, disbursementDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                      {editingFunding ? 'Update' : 'Add'} Scheme
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-success/10 border-success/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalDisbursed)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-warning/10 border-warning/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved (Pending)</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(totalApproved)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Schemes</p>
              <p className="text-2xl font-bold text-primary">{governmentFunding.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterEligibility} onValueChange={setFilterEligibility}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Eligibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="pregnant">Pregnant Women</SelectItem>
            <SelectItem value="elderly">Elderly</SelectItem>
            <SelectItem value="infant">Infants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Funding List */}
      <div className="space-y-4">
        {filteredFunding.length === 0 ? (
          <Card className="p-8 text-center">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Funding Schemes Found</h3>
            <p className="text-muted-foreground">
              {isAsha ? 'Add a funding scheme to get started.' : 'No funding data available.'}
            </p>
          </Card>
        ) : (
          filteredFunding.map(funding => (
            <Card key={funding.id} className="p-4 md:p-6 hover:shadow-soft transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {getEligibilityIcon(funding.eligibility)}
                    <span className="font-semibold text-foreground">{funding.schemeName}</span>
                    {getStatusBadge(funding.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{funding.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Per Person</p>
                      <p className="font-semibold text-lg text-primary">₹{funding.amountINR.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Beneficiaries</p>
                      <p className="font-semibold">{funding.beneficiaryCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(funding.amountINR * funding.beneficiaryCount)}
                      </p>
                    </div>
                    {funding.disbursementDate && (
                      <div>
                        <p className="text-muted-foreground">Disbursement</p>
                        <p className="font-medium">{format(funding.disbursementDate, 'dd MMM yyyy')}</p>
                      </div>
                    )}
                  </div>
                  
                  {funding.notes && (
                    <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-2 rounded">📝 {funding.notes}</p>
                  )}
                </div>
                
                {isAsha && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(funding)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(funding.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FundingSection;
