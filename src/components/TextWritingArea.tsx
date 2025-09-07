import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Upload, FileText, Trash2 } from 'lucide-react';

interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface TextWritingAreaProps {
  onScriptSave?: (script: Script) => void;
  onScriptUpload?: (script: Script) => void;
}

const TextWritingArea: React.FC<TextWritingAreaProps> = ({ onScriptSave, onScriptUpload }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [savedScripts, setSavedScripts] = useState<Script[]>([]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    const newScript: Script = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date()
    };
    
    setSavedScripts(prev => [newScript, ...prev]);
    onScriptSave?.(newScript);
    
    // Clear form
    setTitle('');
    setContent('');
  };

  const handleUploadScript = (script: Script) => {
    onScriptUpload?.(script);
  };

  const deleteScript = (id: string) => {
    setSavedScripts(prev => prev.filter(script => script.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Text Writing Form */}
      <Card className="p-6 bg-glass-bg backdrop-blur-glass border-glass-border">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-white">Write Your Script</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="script-title" className="text-white">Script Title</Label>
            <Input
              id="script-title"
              placeholder="Enter script title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/50 border-glass-border text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="script-content" className="text-white">Script Content</Label>
            <Textarea
              id="script-content"
              placeholder="Write your script content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] bg-secondary/50 border-glass-border text-white resize-none"
            />
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            variant="accent"
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Script
          </Button>
        </div>
      </Card>

      {/* Saved Scripts */}
      {savedScripts.length > 0 && (
        <Card className="p-6 bg-glass-bg backdrop-blur-glass border-glass-border">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Saved Scripts ({savedScripts.length})
            </h3>
            
            <div className="space-y-3">
              {savedScripts.map((script) => (
                <div key={script.id} className="bg-secondary/30 rounded-lg p-4 border border-glass-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{script.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {script.content.length > 100 
                          ? `${script.content.substring(0, 100)}...` 
                          : script.content
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {script.createdAt.toLocaleDateString()} {script.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUploadScript(script)}
                        className="border-accent/50 text-accent hover:bg-accent/20"
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteScript(script.id)}
                        className="border-destructive/50 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TextWritingArea;