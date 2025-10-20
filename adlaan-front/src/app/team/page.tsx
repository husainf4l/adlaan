"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { client } from "../../lib/apollo-client";
import {
  Building2,
  ArrowLeft,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { GET_USERS_QUERY, CREATE_USER_MUTATION, UPDATE_USER_MUTATION, DELETE_USER_MUTATION } from "../../lib/graphql";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function TeamManagementPage() {
  const { user, company, authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN"
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
      return;
    }
    if (!authLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [user, authLoading, router]);

  const fetchUsers = async () => {
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      console.log('User not authorized or not loaded:', user);
      return;
    }

    console.log('Fetching users...');
    setLoading(true);
    setError(null);

    try {
      console.log('Making GraphQL query with:', GET_USERS_QUERY);
      const result = await client.query({
        query: GET_USERS_QUERY,
        fetchPolicy: 'network-only' as any,
      });
      console.log('Query result:', result);
      const data = result.data as any;
      console.log('Received data:', data);
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      fetchUsers();
    }
  }, [user, authLoading]);

  const handleCreateUser = async () => {
    try {
      await client.mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          }
        }
      });
      alert("User created successfully!");
      setShowCreateForm(false);
      setFormData({ name: "", email: "", password: "", role: "USER" });
      fetchUsers();
    } catch (error) {
      alert("Failed to create user. Please try again.");
      console.error("Create user error:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await client.mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: {
          id: parseInt(editingUser.id),
          input: {
            name: formData.name,
            email: formData.email,
            role: formData.role
          }
        }
      });
      alert("User updated successfully!");
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "USER" });
      fetchUsers();
    } catch (error) {
      alert("Failed to update user. Please try again.");
      console.error("Update user error:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await client.mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { id: parseInt(userId) }
      });
      alert("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      alert("Failed to delete user. Please try again.");
      console.error("Delete user error:", error);
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as "USER" | "ADMIN" | "SUPER_ADMIN"
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive";
      case "ADMIN":
        return "default";
      default:
        return "secondary";
    }
  };

  if (authLoading || !user || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team management...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access team management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Team Management</h1>
                <p className="text-sm text-muted-foreground">Manage your team members and permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u: User) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Admin privileges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u: User) => u.role === "USER").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Standard access
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team members, roles, and permissions
                </CardDescription>
              </div>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <UserPlus className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Add Member"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Create User Form */}
            {showCreateForm && (
              <Card className="mb-6 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Team Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Password</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as "USER" | "ADMIN" | "SUPER_ADMIN" })}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        {user.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">Super Admin</option>}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateUser}>Create User</Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit User Form */}
            {editingUser && (
              <Card className="mb-6 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg">Edit Team Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as "USER" | "ADMIN" | "SUPER_ADMIN" })}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        {user.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">Super Admin</option>}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateUser}>Update User</Button>
                    <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Users List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading team members...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">Failed to load team members</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((member: User) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={member.name} />
                          <AvatarFallback>
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {member.role.replace("_", " ")}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(member.id)}
                            disabled={member.id === user.id || (user.role !== "SUPER_ADMIN" && member.role === "SUPER_ADMIN")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}