import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Mail, Calendar, Settings } from 'lucide-react'
import { coupleService } from '../../services/business-logic/CoupleService'
import { CoupleForm, type CoupleFormData } from '../components/CoupleForm'
import { useAuth } from '../../services/AuthContext'
import type { Couple } from '../models/Couple'

type ViewMode = 'list' | 'add' | 'edit'

export function CoupleManagementPage() {
  const { user } = useAuth()
  const [couples, setCouples] = useState<Couple[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingCouple, setEditingCouple] = useState<Couple | null>(null)
  const [canAddMore, setCanAddMore] = useState(false)
  const [currentUserCouple, setCurrentUserCouple] = useState<Couple | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCouples()
  }, [])

  const loadCouples = async () => {
    try {
      setLoading(true)
      setError(null)
      const [couplesData, canAddMoreCouples, userCouple] = await Promise.all([
        coupleService.getAllCouples(),
        coupleService.canAddMoreCouples(),
        getUserCouple()
      ])
      setCouples(couplesData)
      setCanAddMore(canAddMoreCouples)
      setCurrentUserCouple(userCouple)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load couples')
    } finally {
      setLoading(false)
    }
  }

  const getUserCouple = async (): Promise<Couple | null> => {
    if (!user?.id) return null
    try {
      return await coupleService.getCoupleByAuthUserId(user.id)
    } catch (err) {
      return null
    }
  }

  const handleAddMyself = () => {
    setEditingCouple(null)
    setViewMode('add')
  }

  const handleEditCouple = (couple: Couple) => {
    setEditingCouple(couple)
    setViewMode('edit')
  }

  const handleDeleteCouple = async (couple: Couple) => {
    if (!confirm(`Are you sure you want to delete ${couple.fullName}? This action cannot be undone.`)) {
      return
    }

    try {
      await coupleService.deleteCouple(couple.id)
      await loadCouples()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete couple')
    }
  }

  const handleFormSubmit = async (formData: CoupleFormData) => {
    if (!user?.email) {
      setError('User email not available')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (editingCouple) {
        // Update existing couple
        await coupleService.updateCouple(editingCouple.id, formData)
      } else {
        // Create new couple for current user
        await coupleService.createCouple({
          ...formData,
          email: user.email, // Use auth email automatically
          authUserId: user.id
        })
      }

      await loadCouples()
      setViewMode('list')
      setEditingCouple(null)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Maximum of 2 couples')) {
        setError('This wedding already has the maximum of 2 couples registered.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save couple information')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setViewMode('list')
    setEditingCouple(null)
    setError(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Couples</h3>
            <p className="text-base text-gray-600 dark:text-gray-400">Please wait while we gather couple information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <Users className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Couple Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage the couples planning your wedding. Maximum 2 couples allowed.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="text-red-800 dark:text-red-400 font-medium">{error}</div>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'list' && (
          <div className="space-y-8">
            {/* Add Myself Section */}
            {!currentUserCouple && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-center">
                  <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-3xl inline-block mb-8">
                    <Users className="h-20 w-20 text-rose-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Add Yourself as a Couple
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                    You need to add yourself as a couple first before you can manage guests. 
                    Your information will be used to identify you as one of the wedding planners.
                  </p>
                  <button
                    onClick={handleAddMyself}
                    className="px-6 py-2 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all duration-300 font-bold text-sm shadow-xl hover:shadow-2xl"
                  >
                    Add Myself
                  </button>
                </div>
              </div>
            )}

            {/* Couples Table */}
            {couples.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-3xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <Users className="h-5 w-5 mr-3 text-rose-600" />
                      Wedding Couples ({couples.length}/2)
                    </h3>
                    {canAddMore && !currentUserCouple && (
                      <button
                        onClick={handleAddMyself}
                        className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl shadow-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-300 hover:shadow-xl"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add Myself
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Date Added
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {couples.map((couple) => (
                        <tr key={couple.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg">
                                  <Users className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {couple.fullName}
                                </div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {couple.authUserId === user?.id ? 'You' : 'Partner'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                              <Mail className="h-4 w-4 mr-3 text-gray-400" />
                              {couple.email}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-3" />
                              {couple.createdAt.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleEditCouple(couple)}
                                className="inline-flex items-center p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                                title="Edit couple"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCouple(couple)}
                                className="inline-flex items-center p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                                title="Delete couple"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer with limits info */}
                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {couples.length} of 2 couples maximum
                    </span>
                    {!canAddMore && couples.length >= 2 && (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center font-medium">
                        <Settings className="h-4 w-4 mr-2" />
                        Maximum couples reached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {viewMode === 'add' ? 'Add Yourself as Couple' : 'Edit Couple Information'}
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-8">
              <CoupleForm
                initialData={editingCouple ? {
                  firstName: editingCouple.firstName,
                  lastName: editingCouple.lastName,
                  email: editingCouple.email
                } : {}}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isSubmitting={isSubmitting}
                submitButtonText={viewMode === 'add' ? 'Add Myself' : 'Update Information'}
                hideEmail={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}