import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Upload, Scan, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface ScanInputProps {
  onScan: (url: string) => void;
  onFileUpload: (files: FileList) => void;
  isScanning: boolean;
  initialUrl?: string;
}

export function ScanInput({ onScan, onFileUpload, isScanning, initialUrl = '' }: ScanInputProps) {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onScan(url.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <Card className="card-shadow-lg border-2">
      <CardContent className="p-6">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Enter URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={isScanning}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold gradient-hero hover:opacity-90 transition-opacity"
                disabled={!url.trim() || isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-5 w-5" />
                    Scan Website
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="upload">
            <div className="space-y-4">
              <motion.label
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm">
                    <span className="font-semibold text-primary">Click to upload</span>
                    {' '}or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    HTML, CSS files (max 10MB each)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".html,.htm,.css"
                  multiple
                  onChange={handleFileChange}
                  disabled={isScanning}
                />
              </motion.label>
              <Button 
                className="w-full h-12 text-base font-semibold gradient-hero hover:opacity-90 transition-opacity"
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-5 w-5" />
                    Analyze Files
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
