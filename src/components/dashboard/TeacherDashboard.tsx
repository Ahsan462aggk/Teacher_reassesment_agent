import React, { useState } from 'react';
import { Upload, FileText, BookOpen, User, LogOut, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Slide {
  id: string;
  name: string;
  subject: string;
  course: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
}

export const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      name: 'Introduction to Mathematics',
      subject: 'Mathematics',
      course: 'Basic Algebra',
      fileName: 'intro-math.pdf',
      uploadDate: '2024-01-15',
      fileSize: '2.5 MB'
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    slideName: '',
    subjectName: '',
    courseName: '',
    description: '',
    file: null as File | null
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadData.slideName || !uploadData.subjectName || !uploadData.courseName) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('slide_name', uploadData.slideName);
      formData.append('subject_name', uploadData.subjectName);
      formData.append('course_name', uploadData.courseName);
      if (uploadData.description) {
        formData.append('description', uploadData.description);
      }

      const response = await fetch('https://ahsan462agk-reassesment-agent-backend.hf.space/api/v1/slides/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, clear the token and redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.[0]?.msg || 'Failed to upload slide');
      }

      const uploadedSlides = await response.json();
      
      // Assuming the API returns an array of slides, we'll take the first one
      const newSlideData = uploadedSlides[0];
      
      const newSlide: Slide = {
        id: newSlideData.id,
        name: newSlideData.slide_name,
        subject: newSlideData.subject_name,
        course: newSlideData.course_name,
        fileName: newSlideData.file_name,
        uploadDate: new Date(newSlideData.created_at).toISOString().split('T')[0],
        fileSize: 'N/A' // You might want to get this from the file object if needed
      };

      setSlides(prev => [newSlide, ...prev]);
      setUploadData({ 
        slideName: '', 
        subjectName: '', 
        courseName: '', 
        description: '',
        file: null 
      });
      setShowUploadForm(false);

      toast({
        title: "Upload successful!",
        description: "Your slide has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'An error occurred while uploading the slide',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredSlides = slides.filter(slide =>
    slide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slide.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slide.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">EduPortal</h1>
                <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-lg text-muted-foreground">
            Manage your teaching materials and upload new slides
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card scale-in floating-animation">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Slides</p>
                  <p className="text-3xl font-bold gradient-text">{slides.length}</p>
                </div>
                <FileText className="w-12 h-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card scale-in floating-animation" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                  <p className="text-3xl font-bold gradient-text">
                    {new Set(slides.map(s => s.subject)).size}
                  </p>
                </div>
                <BookOpen className="w-12 h-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card scale-in floating-animation" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Courses</p>
                  <p className="text-3xl font-bold gradient-text">
                    {new Set(slides.map(s => s.course)).size}
                  </p>
                </div>
                <Upload className="w-12 h-12 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="glass-card mb-8 slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl gradient-text">Upload New Slides</CardTitle>
                <CardDescription className="text-lg">
                  Add new teaching materials to your collection
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showUploadForm ? 'Cancel' : 'Upload Slides'}
              </Button>
            </div>
          </CardHeader>
          
          {showUploadForm && (
            <CardContent className="p-6">
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slideName">Slide Name *</Label>
                    <Input
                      id="slideName"
                      placeholder="Enter slide name"
                      value={uploadData.slideName}
                      onChange={(e) => setUploadData(prev => ({ ...prev, slideName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectName">Subject *</Label>
                    <Input
                      id="subjectName"
                      placeholder="Enter subject name"
                      value={uploadData.subjectName}
                      onChange={(e) => setUploadData(prev => ({ ...prev, subjectName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseName">Course *</Label>
                    <Input
                      id="courseName"
                      placeholder="Enter course name"
                      value={uploadData.courseName}
                      onChange={(e) => setUploadData(prev => ({ ...prev, courseName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Slide File *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.pptx,.ppt"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Enter a brief description of the slide"
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Slide'}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Slides Management */}
        <Card className="glass-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl gradient-text">Your Slides</CardTitle>
                <CardDescription className="text-lg">
                  Manage and organize your teaching materials
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-white/50 border-white/20 focus:bg-white/80 transition-all duration-300"
                    placeholder="Search slides..."
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSlides.map((slide, index) => (
                <Card key={slide.id} className="glass-card hover:shadow-card transition-all duration-300 transform hover:scale-[1.02] scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="text-xs text-muted-foreground">{slide.fileSize}</div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 gradient-text">{slide.name}</h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium">Subject:</span> {slide.subject}</p>
                      <p><span className="font-medium">Course:</span> {slide.course}</p>
                      <p><span className="font-medium">File:</span> {slide.fileName}</p>
                      <p><span className="font-medium">Uploaded:</span> {slide.uploadDate}</p>
                    </div>
                    
                    <Button
                      className="w-full mt-4 bg-gradient-accent hover:shadow-glow transition-all duration-300"
                      size="sm"
                    >
                      View Slide
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredSlides.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {searchTerm ? 'No slides found' : 'No slides uploaded yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Upload your first slide to get started'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowUploadForm(true)}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    Upload First Slide
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};