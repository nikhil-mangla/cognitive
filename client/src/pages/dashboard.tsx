import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Brain, Download, FolderSync, FileText, Users, Mic, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/ui/navbar";
import { SubscriptionStatus } from "@/components/ui/subscription-status";
import { useToast } from "@/hooks/use-toast";
import { getToken, isAuthenticated, logout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email: string;
  jobRole?: string;
  company?: string;
  resumeName?: string;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
}

interface Session {
  id: number;
  sessionType: string;
  duration: number;
  status: string;
  createdAt: string;
}

interface ApiToken {
  id: number;
  name: string;
  lastUsed?: string;
  createdAt: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/");
    }
  }, [setLocation]);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
  });

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return response.json();
    },
  });

  const { data: tokens } = useQuery<ApiToken[]>({
    queryKey: ['/api/tokens'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('/api/tokens', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      return response.json();
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'Desktop App Token' }),
      });
      if (!response.ok) {
        throw new Error('Failed to create token');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      // Download the token as a file
      const blob = new Blob([JSON.stringify({ token: data.token }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cognitive-copilot-token.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Token Generated",
        description: "Your desktop app token has been generated and downloaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate token",
        variant: "destructive",
      });
    },
  });

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'interview':
        return <Mic className="h-5 w-5 text-white" />;
      case 'sales':
        return <Handshake className="h-5 w-5 text-white" />;
      case 'meeting':
        return <Users className="h-5 w-5 text-white" />;
      default:
        return <FileText className="h-5 w-5 text-white" />;
    }
  };

  const getSessionColor = (sessionType: string) => {
    switch (sessionType) {
      case 'interview':
        return 'bg-primary';
      case 'sales':
        return 'bg-accent';
      case 'meeting':
        return 'bg-secondary';
      default:
        return 'bg-gray-500';
    }
  };

  const formatSessionType = (sessionType: string) => {
    return sessionType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Manage your AI assistant and view your activity</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Status */}
            <SubscriptionStatus />
            
            {/* Desktop App Connection */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">Desktop App Connection</CardTitle>
                    <p className="text-sm text-gray-600">Connect your desktop application to sync your profile</p>
                  </div>
                  <Badge className="bg-secondary text-white">
                    <FolderSync className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Brain className="h-6 w-6 text-gray-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Desktop App</div>
                      <div className="text-sm text-gray-600">
                        {tokens && tokens.length > 0 ? `Last sync: ${formatDate(tokens[0].lastUsed || tokens[0].createdAt)}` : 'No tokens generated'}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    FolderSync Now
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => createTokenMutation.mutate()}
                    disabled={createTokenMutation.isPending}
                  >
                    {createTokenMutation.isPending ? 'Generating...' : 'Generate New Token'}
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Token
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Sessions</CardTitle>
              </CardHeader>
              
              <CardContent>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 ${getSessionColor(session.sessionType)} rounded-full flex items-center justify-center mr-3`}>
                            {getSessionIcon(session.sessionType)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{formatSessionType(session.sessionType)}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(session.createdAt)} • {session.duration} min
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-secondary text-white">
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No sessions yet. Start your first AI session to see activity here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Profile</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={user?.name || ''}
                    readOnly
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Email</Label>
                  <Input
                    value={user?.email || ''}
                    readOnly
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Job Role</Label>
                  <Select value={user?.jobRole || ''} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-engineer">Software Engineer</SelectItem>
                      <SelectItem value="product-manager">Product Manager</SelectItem>
                      <SelectItem value="sales-representative">Sales Representative</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Company</Label>
                  <Input
                    value={user?.company || ''}
                    readOnly
                    className="mt-1"
                  />
                </div>
                
                {user?.resumeName && (
                  <div>
                    <Label>Resume</Label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-1">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm text-gray-700 truncate">{user.resumeName}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button className="w-full" disabled>
                  Update Profile
                </Button>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="text-lg font-bold">{sessions?.length || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Tokens</span>
                  <span className="text-lg font-bold">{tokens?.length || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="text-lg font-bold">
                    {sessions?.reduce((total, session) => total + (session.duration || 0), 0) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
