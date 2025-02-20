import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { UserCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { emailService } from '../services/emailService';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    organizationName: 'Acme Inc',
  });

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setProfileImage(reader.result as string);
          setIsUploading(false);
        };
        reader.onerror = () => {
          toast.error('Failed to read image file');
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error uploading image:', err);
        toast.error('Failed to upload image');
        setIsUploading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  // Show error toast for rejected files
  useEffect(() => {
    fileRejections.forEach(({ errors }) => {
      errors.forEach(error => {
        switch (error.code) {
          case 'file-too-large':
            toast.error('Image must be less than 5MB');
            break;
          case 'file-invalid-type':
            toast.error('Only PNG and JPEG images are allowed');
            break;
          default:
            toast.error(error.message);
        }
      });
    });
  }, [fileRejections]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement profile update with image
      console.log('Saving profile:', { ...profileData, image: profileImage });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900 dark:text-white">
          Your Profile
        </h1>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div
                {...(isEditing ? getRootProps() : {})}
                className={twMerge(
                  'relative h-20 w-20 overflow-hidden rounded-full',
                  isEditing && 'cursor-pointer hover:opacity-80',
                  isDragActive && 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-secondary-900'
                )}
              >
                {isEditing && (
                  <input {...getInputProps()} />
                )}
                {isUploading ? (
                  <div className="flex h-full w-full items-center justify-center bg-secondary-100 dark:bg-secondary-700">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
                  </div>
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary-100 dark:bg-secondary-700">
                    <UserCircleIcon className="h-12 w-12 text-secondary-400" />
                  </div>
                )}
                {isEditing && !isUploading && (
                  <div className={twMerge(
                    'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity',
                    isDragActive ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                  )}>
                    <PhotoIcon className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-4">
                      <Input
                        label="Full name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <Input
                        label="Organization"
                        value={profileData.organizationName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, organizationName: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center gap-x-4">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsEditing(false);
                          if (!profileImage) {
                            setProfileImage(null);
                          }
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Full name</dt>
                        <dd className="mt-1 text-sm text-secondary-900 dark:text-white">{profileData.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Email</dt>
                        <dd className="mt-1 text-sm text-secondary-900 dark:text-white">{profileData.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Organization</dt>
                        <dd className="mt-1 text-sm text-secondary-900 dark:text-white">{profileData.organizationName}</dd>
                      </div>
                    </dl>
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                      Edit profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 