import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { VaccinationRecord } from '@/types/healthcare';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Syringe, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  Search,
  Heart,
  Users,
  Baby,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const VaccinationSection = () => {
  const { vaccinationRecords, setVaccinationRecords, currentUser } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    beneficiaryType: 'pregnant' as 'pregnant' | 'elderly' | 'infant',
    vaccineName: '',
    doseNumber: 1,
    dateGiven: '',
    nextDueDate: '',
    administeredBy: '',
    notes: '',
  });

  const isAsha = currentUser?.role === 'asha';

  const filteredRecords = vaccinationRecords.filter(record => {
    const matchesCategory = filterCategory === 'all' || record.beneficiaryType === filterCategory;
    const matchesSearch = record.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'pregnant': return <Heart className="w-4 h-4 text-terracotta" />;
      case 'elderly': return <Users className="w-4 h-4 text-sky" />;
      case 'infant': return <Baby className="w-4 h-4 text-lavender" />;
      default: return <Syringe className="w-4 h-4" />;
    }
  };

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'pregnant': return 'bg-terracotta/20 text-terracotta';
      case 'elderly': return 'bg-sky/20 text-sky';
      case 'infant': return 'bg-lavender/20 text-lavender';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSubmit = () => {
    if (!formData.beneficiaryName || !formData.vaccineName || !formData.dateGiven) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingRecord) {
      setVaccinationRecords(prev =>
        prev.map(r => r.id === editingRecord.id ? {
          ...r,
          ...formData,
          beneficiaryId: r.beneficiaryId,
          dateGiven: new Date(formData.dateGiven),
          nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : undefined,
        } : r)
      );
      toast.success('Vaccination record updated');
    } else {
      const newRecord: VaccinationRecord = {
        id: Date.now().toString(),
        beneficiaryId: Date.now().toString(),
        beneficiaryName: formData.beneficiaryName,
        beneficiaryType: formData.beneficiaryType,
        vaccineName: formData.vaccineName,
        doseNumber: formData.doseNumber,
        dateGiven: new Date(formData.dateGiven),
        nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : undefined,
        administeredBy: formData.administeredBy || 'ASHA Worker',
        notes: formData.notes,
      };
      setVaccinationRecords(prev => [newRecord, ...prev]);
      toast.success('Vaccination record added');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      beneficiaryName: '',
      beneficiaryType: 'pregnant',
      vaccineName: '',
      doseNumber: 1,
      dateGiven: '',
      nextDueDate: '',
      administeredBy: '',
      notes: '',
    });
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: VaccinationRecord) => {
    setEditingRecord(record);
    setFormData({
      beneficiaryName: record.beneficiaryName,
      beneficiaryType: record.beneficiaryType,
      vaccineName: record.vaccineName,
      doseNumber: record.doseNumber,
      dateGiven: format(record.dateGiven, 'yyyy-MM-dd'),
      nextDueDate: record.nextDueDate ? format(record.nextDueDate, 'yyyy-MM-dd') : '',
      administeredBy: record.administeredBy,
      notes: record.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setVaccinationRecords(prev => prev.filter(r => r.id !== id));
    toast.success('Record deleted');
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Category', 'Vaccine', 'Dose', 'Date Given', 'Next Due', 'Administered By', 'Notes'],
      ...filteredRecords.map(r => [
        r.beneficiaryName,
        r.beneficiaryType,
        r.vaccineName,
        r.doseNumber,
        format(r.dateGiven, 'yyyy-MM-dd'),
        r.nextDueDate ? format(r.nextDueDate, 'yyyy-MM-dd') : '',
        r.administeredBy,
        r.notes || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaccination-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Vaccination Records</h1>
          <p className="text-muted-foreground">Track and manage immunization data</p>
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
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Vaccination Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Beneficiary Name *</label>
                    <Input
                      value={formData.beneficiaryName}
                      onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                      placeholder="Patient name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <Select
                      value={formData.beneficiaryType}
                      onValueChange={(v: 'pregnant' | 'elderly' | 'infant') => 
                        setFormData(prev => ({ ...prev, beneficiaryType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pregnant">Pregnant Woman</SelectItem>
                        <SelectItem value="elderly">Elderly</SelectItem>
                        <SelectItem value="infant">Infant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vaccine Name *</label>
                    <Input
                      value={formData.vaccineName}
                      onChange={(e) => setFormData(prev => ({ ...prev, vaccineName: e.target.value }))}
                      placeholder="e.g., BCG, TT-1, Polio"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Dose #</label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.doseNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, doseNumber: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Given *</label>
                      <Input
                        type="date"
                        value={formData.dateGiven}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateGiven: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Next Due Date</label>
                    <Input
                      type="date"
                      value={formData.nextDueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Administered By</label>
                    <Input
                      value={formData.administeredBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, administeredBy: e.target.value }))}
                      placeholder="Doctor/Staff name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional notes"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                      {editingRecord ? 'Update' : 'Add'} Record
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or vaccine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="pregnant">Pregnant Women</SelectItem>
            <SelectItem value="elderly">Elderly</SelectItem>
            <SelectItem value="infant">Infants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <Syringe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Records Found</h3>
            <p className="text-muted-foreground">
              {isAsha ? 'Add a vaccination record to get started.' : 'No vaccination records available.'}
            </p>
          </Card>
        ) : (
          filteredRecords.map(record => (
            <Card key={record.id} className="p-4 md:p-6 hover:shadow-soft transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(record.beneficiaryType)}
                    <span className="font-semibold text-foreground">{record.beneficiaryName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryBadge(record.beneficiaryType)}`}>
                      {record.beneficiaryType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vaccine</p>
                      <p className="font-medium">{record.vaccineName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dose</p>
                      <p className="font-medium">#{record.doseNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date Given</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(record.dateGiven, 'dd MMM yyyy')}
                      </p>
                    </div>
                    {record.nextDueDate && (
                      <div>
                        <p className="text-muted-foreground">Next Due</p>
                        <p className="font-medium text-warning">{format(record.nextDueDate, 'dd MMM yyyy')}</p>
                      </div>
                    )}
                  </div>
                  {record.notes && (
                    <p className="text-sm text-muted-foreground mt-2">📝 {record.notes}</p>
                  )}
                </div>
                {isAsha && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
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

export default VaccinationSection;
