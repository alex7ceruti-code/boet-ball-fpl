'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Crown,
  Shield,
  Mail,
  Calendar,
  MapPin,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  UserPlus,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings,
  Send,
  UserCheck,
  UserX,
  CreditCard,
  Activity,
  Clock,
  Globe,
  Database,
  X,
  Check,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  fplTeamId: number | null;
  miniLeague1Id: number | null;
  miniLeague2Id: number | null;
  favoriteTeam: number | null;
  location: string | null;
  subscriptionType: 'FREE' | 'PREMIUM';
  isActive: boolean;
  lastLoginAt: Date | null;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
  termsAcceptedAt: Date | null;
  marketingOptIn: boolean;
  promoCodeUsed: string | null;
  preferences: any;
  isAdmin: boolean;
  adminRole: string | null;
  analyticsCount: number;
  articlesCount: number;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalCount: 0,
    totalPages: 0,
  });
  
  // Advanced features state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleExpandUser = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserDetails(null);
    } else {
      setExpandedUser(userId);
      setLoadingDetails(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch details');
        setUserDetails(data.user);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Could not load user details.');
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleBulkAction = async (action: string, data?: any) => {
    setActionLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedUsers, data }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Action failed');
      }

      await fetchUsers(); // Refresh users
      setSelectedUsers([]);
      setShowBulkActions(false);
      setShowEmailModal(false);
    } catch (err) {
      console.error('Bulk action error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '25',
        search: searchTerm,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session, currentPage, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (user: User) => {
    if (user.isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          <Crown className="w-3 h-3" />
          {user.adminRole}
        </span>
      );
    }
    
    if (user.subscriptionType === 'PREMIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          <Crown className="w-3 h-3" />
          Premium
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
        <Shield className="w-3 h-3" />
        Free
      </span>
    );
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          Inactive
        </span>
      );
    }
    
    if (!user.emailVerified) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          Unverified
        </span>
      );
    }

    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
        Active
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Users</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">
                Manage users, view profiles, and handle support requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Admin
              </Link>
              <button
                onClick={() => fetchUsers()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.emailVerified).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.subscriptionType === 'PREMIUM').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isAdmin).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-700">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkActions(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      User
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    FPL Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('lastLoginAt')}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Last Login
                      {sortBy === 'lastLoginAt' && (
                        sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Joined
                      {sortBy === 'createdAt' && (
                        sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${
                    selectedUsers.includes(user.id) ? 'bg-green-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No name set'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(user)}
                            {user.location && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {user.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {user.fplTeamId && (
                          <div>Team ID: {user.fplTeamId}</div>
                        )}
                        {user.miniLeague1Id && (
                          <div>League 1: {user.miniLeague1Id}</div>
                        )}
                        {user.miniLeague2Id && (
                          <div>League 2: {user.miniLeague2Id}</div>
                        )}
                        {!user.fplTeamId && !user.miniLeague1Id && (
                          <div className="text-gray-400">No FPL data</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(user)}
                        {user.promoCodeUsed && (
                          <span className="text-xs text-purple-600">
                            Promo: {user.promoCodeUsed}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {formatDate(user.lastLoginAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.loginCount} login{user.loginCount !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span>{user.analyticsCount}</span>
                        </div>
                        {user.articlesCount > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-green-500" />
                            <span>{user.articlesCount}</span>
                          </div>
                        )}
                        {user.marketingOptIn && (
                          <Mail className="w-4 h-4 text-purple-500" title="Marketing opt-in" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleExpandUser(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={expandedUser === user.id ? 'Collapse details' : 'View details'}
                        >
                          {expandedUser === user.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUsers([user.id]);
                            setShowEmailModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Send email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded User Details */}
                  {expandedUser === user.id && (
                    <tr>
                      <td colSpan={8} className="px-6 py-0 bg-gray-50 border-t-0">
                        <div className="py-6">
                          {loadingDetails ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                              <span className="text-gray-600">Loading details...</span>
                            </div>
                          ) : userDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Personal Information */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Database className="w-4 h-4" />
                                  Personal Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium text-gray-600">Name:</span> {userDetails.name || 'Not set'}</div>
                                  <div><span className="font-medium text-gray-600">Email:</span> {userDetails.email}</div>
                                  <div><span className="font-medium text-gray-600">Location:</span> {userDetails.location || 'Not set'}</div>
                                  <div><span className="font-medium text-gray-600">Favorite Team:</span> {userDetails.favoriteTeam || 'Not set'}</div>
                                  <div><span className="font-medium text-gray-600">Marketing Opt-in:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                      userDetails.marketingOptIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {userDetails.marketingOptIn ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Account Status */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Account Status
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium text-gray-600">Status:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                      userDetails.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {userDetails.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  <div><span className="font-medium text-gray-600">Email Verified:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                      userDetails.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {userDetails.emailVerified ? formatDate(userDetails.emailVerified) : 'Unverified'}
                                    </span>
                                  </div>
                                  <div><span className="font-medium text-gray-600">Subscription:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                      userDetails.subscriptionType === 'PREMIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {userDetails.subscriptionType}
                                    </span>
                                  </div>
                                  <div><span className="font-medium text-gray-600">Admin:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                      userDetails.isAdmin ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {userDetails.isAdmin ? userDetails.adminRole || 'Yes' : 'No'}
                                    </span>
                                  </div>
                                  <div><span className="font-medium text-gray-600">Terms Accepted:</span> {userDetails.termsAcceptedAt ? formatDate(userDetails.termsAcceptedAt) : 'Not accepted'}</div>
                                  <div><span className="font-medium text-gray-600">Promo Code:</span> {userDetails.promoCodeUsed || 'None'}</div>
                                </div>
                              </div>

                              {/* Activity & Stats */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Activity className="w-4 h-4" />
                                  Activity & Stats
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium text-gray-600">Created:</span> {formatDate(userDetails.createdAt)}</div>
                                  <div><span className="font-medium text-gray-600">Last Login:</span> {formatDate(userDetails.lastLoginAt)}</div>
                                  <div><span className="font-medium text-gray-600">Login Count:</span> {userDetails.loginCount}</div>
                                  <div><span className="font-medium text-gray-600">Analytics Count:</span> {userDetails.analyticsCount}</div>
                                  <div><span className="font-medium text-gray-600">Articles Count:</span> {userDetails.articlesCount}</div>
                                  <div><span className="font-medium text-gray-600">Last Updated:</span> {formatDate(userDetails.updatedAt)}</div>
                                </div>
                              </div>

                              {/* FPL Information */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  FPL Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium text-gray-600">Team ID:</span> {userDetails.fplTeamId || 'Not set'}</div>
                                  <div><span className="font-medium text-gray-600">Mini League 1:</span> {userDetails.miniLeague1Id || 'Not set'}</div>
                                  <div><span className="font-medium text-gray-600">Mini League 2:</span> {userDetails.miniLeague2Id || 'Not set'}</div>
                                </div>
                              </div>

                              {/* Preferences */}
                              {userDetails.preferences && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Preferences
                                  </h4>
                                  <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(userDetails.preferences, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Quick Actions */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Quick Actions
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => openEditModal(user)}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors flex items-center gap-1"
                                  >
                                    <Edit className="w-3 h-3" /> Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUsers([user.id]);
                                      setShowEmailModal(true);
                                    }}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors flex items-center gap-1"
                                  >
                                    <Mail className="w-3 h-3" /> Email
                                  </button>
                                  {userDetails.subscriptionType === 'FREE' && (
                                    <button
                                      onClick={() => handleBulkAction('updateSubscription', { subscriptionType: 'PREMIUM' })}
                                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors flex items-center gap-1"
                                    >
                                      <Crown className="w-3 h-3" /> Upgrade
                                    </button>
                                  )}
                                  {!userDetails.isActive && (
                                    <button
                                      onClick={() => handleBulkAction('updateStatus', { isActive: true })}
                                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors flex items-center gap-1"
                                    >
                                      <UserCheck className="w-3 h-3" /> Activate
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              Failed to load user details
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
