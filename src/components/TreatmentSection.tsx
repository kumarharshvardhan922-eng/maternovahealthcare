import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TreatmentRecord } from '@/types/healthcare';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  Search,
  Heart,
  Users,
  Baby,
  Stethoscope
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TreatmentSection = () => {
  const { treatmentRecords, setTreatmentRecords, currentUser } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TreatmentRecord | null>(null);
  
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    beneficiaryType: 'pregnant' as 'pregnant' | 'elderly' | 'infant',
    treatmentType: '',
    diagnosis: '',
    prescription: '',
    dateGiven: '',
    doctorName: '',
    notes: '',
  });

  const isAsha = currentUser?.role === 'asha';

  const filteredRecords = treatmentRecords.filter(record => {
    const matchesCategory = filterCategory === 'all' || record.beneficiaryType === filterCategory;
    const matchesSearch = record.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'pregnant': return <Heart className="w-4 h-4 text-terracotta" />;
      case 'elderly': return <Users className="w-4 h-4 text-sky" />;
      case 'infant': return <Baby className="w-4 h-4 text-lavender" />;
      default: return <FileText className="w-4 h-4" />;
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
    if (!formData.beneficiaryName || !formData.diagnosis || !formData.dateGiven) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingRecord) {
      setTreatmentRecords(prev =>
        prev.map(r => r.id === editingRecord.id ? {
          ...r,
          ...formData,
          beneficiaryId: r.beneficiaryId,
          dateGiven: new Date(formData.dateGiven),
        } : r)
      );
      toast.success('Treatment record updated');
    } else {
      const newRecord: TreatmentRecord = {
        id: Date.now().toString(),
        beneficiaryId: Date.now().toString(),
        beneficiaryName: formData.beneficiaryName,
        beneficiaryType: formData.beneficiaryType,
        treatmentType: formData.treatmentType || 'General',
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        dateGiven: new Date(formData.dateGiven),
        doctorName: formData.doctorName || 'PHC Staff',
        notes: formData.notes,
      };
      setTreatmentRecords(prev => [newRecord, ...prev]);
      toast.success('Treatment record added');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      beneficiaryName: '',
      beneficiaryType: 'pregnant',
      treatmentType: '',
      diagnosis: '',
      prescription: '',
      dateGiven: '',
      doctorName: '',
      notes: '',
    });
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: TreatmentRecord) => {
    setEditingRecord(record);
    setFormData({
      beneficiaryName: record.beneficiaryName,
      beneficiaryType: record.beneficiaryType,
      treatmentType: record.treatmentType,
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      dateGiven: format(record.dateGiven, 'yyyy-MM-dd'),
      doctorName: record.doctorName,
      notes: record.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTreatmentRecords(prev => prev.filter(r => r.id !== id));
    toast.success('Record deleted');
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Category', 'Treatment Type', 'Diagnosis', 'Prescription', 'Date', 'Doctor', 'Notes'],
      ...filteredRecords.map(r => [
        r.beneficiaryName,
        r.beneficiaryType,
        r.treatmentType,
        r.diagnosis,
        r.prescription,
        format(r.dateGiven, 'yyyy-MM-dd'),
        r.doctorName,
        r.notes || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Treatment Records</h1>
          <p className="text-muted-foreground">Track diagnoses and prescriptions</p>
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
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Treatment Record</DialogTitle>
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
                    <label className="block text-sm font-medium mb-2">Treatment Type</label>
                    <Input
                      value={formData.treatmentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatmentType: e.target.value }))}
                      placeholder="e.g., Prenatal Care, Chronic Care"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Diagnosis *</label>
                    <Input
                      value={formData.diagnosis}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Medical diagnosis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prescription</label>
                    <Textarea
                      value={formData.prescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, prescription: e.target.value }))}
                      placeholder="Medicines and dosage"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <Input
                      type="date"
                      value={formData.dateGiven}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateGiven: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Doctor Name</label>
                    <Input
                      value={formData.doctorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                      placeholder="Treating doctor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Follow-up instructions, etc."
                      rows={2}
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
            placeholder="Search by name or diagnosis..."
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
            <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Records Found</h3>
            <p className="text-muted-foreground">
              {isAsha ? 'Add a treatment record to get started.' : 'No treatment records available.'}
            </p>
          </Card>
        ) : (
          filteredRecords.map(record => (
            <Card key={record.id} className="p-4 md:p-6 hover:shadow-soft transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(record.beneficiaryType)}
                    <span className="font-semibold text-foreground">{record.beneficiaryName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryBadge(record.beneficiaryType)}`}>
                      {record.beneficiaryType}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-24">Diagnosis:</span>
                      <span className="font-medium">{record.diagnosis}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-24">Prescription:</span>
                      <span className="font-medium">{record.prescription}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>📅 {format(record.dateGiven, 'dd MMM yyyy')}</span>
                      <span>👨‍⚕️ {record.doctorName}</span>
                    </div>
                  </div>
                  {record.notes && (
                    <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">📝 {record.notes}</p>
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

export default TreatmentSection;
