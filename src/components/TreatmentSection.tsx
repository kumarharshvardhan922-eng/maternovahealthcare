import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
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
  Stethoscope,
  Camera,
  Upload,
  X,
  Image,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TreatmentSection = () => {
  const { treatmentRecords, addTreatmentRecord, updateTreatmentRecord, deleteTreatmentRecord, currentUser, profiles } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<typeof treatmentRecords[0] | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    beneficiary_type: 'pregnant' as 'pregnant' | 'elderly' | 'infant',
    treatment_type: '',
    diagnosis: '',
    prescription: '',
    date_given: '',
    doctor_name: '',
    notes: '',
  });

  const isAsha = currentUser?.role === 'asha';

  const filteredRecords = treatmentRecords.filter(record => {
    const matchesCategory = filterCategory === 'all' || record.beneficiary_type === filterCategory;
    const matchesSearch = record.beneficiary_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedDocuments(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.beneficiary_name || !formData.diagnosis || !formData.date_given) {
      toast.error('Please fill in required fields');
      return;
    }

    const matchingProfile = profiles.find(p => p.name.toLowerCase() === formData.beneficiary_name.toLowerCase());

    if (editingRecord) {
      await updateTreatmentRecord(editingRecord.id, {
        ...formData,
        photo_url: capturedPhoto || editingRecord.photo_url,
        documents: uploadedDocuments.length > 0 ? uploadedDocuments : editingRecord.documents,
        notes: formData.notes || null,
      });
    } else {
      await addTreatmentRecord({
        beneficiary_id: matchingProfile?.id || crypto.randomUUID(),
        beneficiary_name: formData.beneficiary_name,
        beneficiary_type: formData.beneficiary_type,
        treatment_type: formData.treatment_type || 'General',
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        date_given: formData.date_given,
        doctor_name: formData.doctor_name || 'PHC Staff',
        notes: formData.notes || null,
        photo_url: capturedPhoto || null,
        documents: uploadedDocuments.length > 0 ? uploadedDocuments : null,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      beneficiary_name: '',
      beneficiary_type: 'pregnant',
      treatment_type: '',
      diagnosis: '',
      prescription: '',
      date_given: '',
      doctor_name: '',
      notes: '',
    });
    setEditingRecord(null);
    setCapturedPhoto(null);
    setUploadedDocuments([]);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: typeof treatmentRecords[0]) => {
    setEditingRecord(record);
    setFormData({
      beneficiary_name: record.beneficiary_name,
      beneficiary_type: record.beneficiary_type,
      treatment_type: record.treatment_type,
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      date_given: format(new Date(record.date_given), 'yyyy-MM-dd'),
      doctor_name: record.doctor_name,
      notes: record.notes || '',
    });
    setCapturedPhoto(record.photo_url || null);
    setUploadedDocuments(record.documents || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTreatmentRecord(id);
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Category', 'Treatment Type', 'Diagnosis', 'Prescription', 'Date', 'Doctor', 'Notes'],
      ...filteredRecords.map(r => [
        r.beneficiary_name,
        r.beneficiary_type,
        r.treatment_type,
        r.diagnosis,
        r.prescription,
        format(new Date(r.date_given), 'yyyy-MM-dd'),
        r.doctor_name,
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
                      value={formData.beneficiary_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_name: e.target.value }))}
                      placeholder="Patient name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <Select
                      value={formData.beneficiary_type}
                      onValueChange={(v: 'pregnant' | 'elderly' | 'infant') => 
                        setFormData(prev => ({ ...prev, beneficiary_type: v }))
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
                      value={formData.treatment_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatment_type: e.target.value }))}
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
                      value={formData.date_given}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_given: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Doctor Name</label>
                    <Input
                      value={formData.doctor_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
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

                  {/* Photo Capture Section */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Camera className="w-4 h-4 inline mr-1" />
                      Capture Photo (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={photoInputRef}
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {capturedPhoto ? 'Photo Captured ✓' : 'Take Photo'}
                    </Button>
                    {capturedPhoto && (
                      <div className="mt-2 relative">
                        <img src={capturedPhoto} alt="Captured" className="w-full max-h-32 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => setCapturedPhoto(null)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Document Upload Section */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Upload className="w-4 h-4 inline mr-1" />
                      Upload Scanned Documents (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      multiple
                      ref={documentInputRef}
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => documentInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Button>
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {uploadedDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              {doc.startsWith('data:image') ? (
                                <Image className="w-4 h-4 text-primary" />
                              ) : (
                                <File className="w-4 h-4 text-primary" />
                              )}
                              <span className="text-sm truncate max-w-[150px]">
                                Document {idx + 1}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeDocument(idx)}
                            >
                              <X className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {getCategoryIcon(record.beneficiary_type)}
                    <span className="font-semibold text-foreground">{record.beneficiary_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryBadge(record.beneficiary_type)}`}>
                      {record.beneficiary_type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Diagnosis</p>
                      <p className="font-medium text-destructive">{record.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Treatment</p>
                      <p className="font-medium">{record.treatment_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{format(new Date(record.date_given), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  {record.prescription && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-medium text-primary mb-1">💊 Prescription:</p>
                      <p className="text-sm text-foreground">{record.prescription}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Stethoscope className="w-4 h-4" />
                    <span>Dr. {record.doctor_name}</span>
                  </div>
                  {record.notes && (
                    <p className="text-sm text-muted-foreground mt-2">📝 {record.notes}</p>
                  )}
                  
                  {/* Display Photo and Documents */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {record.photo_url && (
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer border border-border"
                        onClick={() => window.open(record.photo_url || '', '_blank')}
                      >
                        <img src={record.photo_url} alt="Record photo" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {record.documents?.map((doc, idx) => (
                      <div 
                        key={idx}
                        className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer border border-border flex items-center justify-center bg-muted"
                        onClick={() => window.open(doc, '_blank')}
                      >
                        {doc.startsWith('data:image') ? (
                          <img src={doc} alt={`Document ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <File className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
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
