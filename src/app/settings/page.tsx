'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateSiteTitle } from '@/lib/api';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { logout as apiLogout, getSiteTitle } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

const titleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type TitleForm = z.infer<typeof titleSchema>;

export default function SettingsPage() {
  useProtectedRoute();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [isTitleLoading, setIsTitleLoading] = useState(true);
  const { logout } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TitleForm>({
    resolver: zodResolver(titleSchema),
  });

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const title = await getSiteTitle();
        setCurrentTitle(title);
        setValue('title', title);
      } catch (err: unknown) {
        const axiosError = err as AxiosError;
        const errorMessage = (axiosError.response?.data as { message?: string })?.message || 'Failed to fetch title';
        setError(errorMessage);
      } finally {
        setIsTitleLoading(false);
      }
    };
    fetchTitle();
  }, [setValue]);

  const onSubmit = async (data: TitleForm) => {
    setIsUpdating(true);
    try {
      await updateSiteTitle(data.title);
      setSuccess('Title updated successfully!');
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      const errorMessage = (axiosError.response?.data as { message?: string })?.message || 'Update failed';
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      logout();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Update Site Title</h1>
        {currentTitle && <p className="text-center text-gray-600 mb-4">Current Title: {currentTitle}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">New Title</label>
            <input
              {...register('title')}
              disabled={isUpdating || isLoggingOut || isTitleLoading}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          {success && <p className="text-green-500 text-center">{success}</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600" disabled={isUpdating || isLoggingOut || isTitleLoading}>
            {isUpdating ? 'Updating...' : 'Update Title'}
          </button>
        </form>
        <button
          onClick={handleLogout}
          disabled={isUpdating || isLoggingOut || isTitleLoading}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}