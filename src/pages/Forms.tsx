import { useState, useEffect, Fragment } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formService } from '../services/formService';
import { type Form, type FormStatus } from '../types/form';
import { 
  PlusIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  Bars3Icon,
  StarIcon,
  EyeIcon,
  PencilSquareIcon,
  ShareIcon,
  LinkIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { DndContext, DragEndEvent, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Switch, Menu, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface Collection {
  id: string;
  name: string;
  color?: string;
  isFilter?: boolean;
  icon?: React.ComponentType<React.ComponentProps<'svg'>>;
}

interface FormWithCollection extends Form {
  collectionId?: string;
}

function ViewToggle({ view, onChange }: { view: 'grid' | 'list', onChange: (view: 'grid' | 'list') => void }) {
  return (
    <div className="flex items-center rounded-lg bg-secondary-100 p-1 dark:bg-secondary-800">
      <button
        type="button"
        className={`flex items-center rounded-md px-2 py-1 text-sm ${
          view === 'grid'
            ? 'bg-white text-secondary-700 shadow dark:bg-secondary-700 dark:text-white'
            : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'
        }`}
        onClick={() => onChange('grid')}
      >
        <Squares2X2Icon className="mr-1.5 h-4 w-4" />
        Grid
      </button>
      <button
        type="button"
        className={`flex items-center rounded-md px-2 py-1 text-sm ${
          view === 'list'
            ? 'bg-white text-secondary-700 shadow dark:bg-secondary-700 dark:text-white'
            : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'
        }`}
        onClick={() => onChange('list')}
      >
        <ListBulletIcon className="mr-1.5 h-4 w-4" />
        List
      </button>
    </div>
  );
}

function CollectionBadge({ collection }: { collection?: Collection }) {
  if (!collection) return null;
  
  return (
    <div className="flex items-center">
      <div 
        className="mr-1.5 h-2 w-2 rounded-full"
        style={{ backgroundColor: collection.color || '#6366F1' }}
      />
      <span className="text-xs text-secondary-500 dark:text-secondary-400">
        {collection.name}
      </span>
    </div>
  );
}

function FormCard({ form, collection }: { form: Form, collection?: Collection }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: form.id,
    data: { type: 'form', form },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-secondary-200 bg-white shadow transition-all hover:shadow-md dark:border-secondary-700 dark:bg-secondary-800 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-move rounded p-1 text-secondary-400 opacity-0 hover:bg-secondary-100 group-hover:opacity-100 dark:text-secondary-500 dark:hover:bg-secondary-700"
      >
        <Bars3Icon className="h-5 w-5" />
      </div>

      <Link to={`/forms/${form.id}`} className="flex-1 p-6">
        <div className="flex-1">
          <CollectionBadge collection={collection} />
          <h3 className="mt-2 text-lg font-medium text-secondary-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
            {form.title}
          </h3>
          {form.description && (
            <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
              {form.description}
            </p>
          )}
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-x-6">
            <div className="flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
              <CalendarIcon className="h-5 w-5" />
              <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              <span>{form.responseCount} responses</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function ShareDropdown({ form }: { form: Form }) {
  const shareUrl = `${window.location.origin}/respond/${form.id}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // TODO: Show success toast
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(form.title);
    const body = encodeURIComponent(`Please fill out this form: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const text = encodeURIComponent(`Check out this form: ${form.title}`);
    const url = encodeURIComponent(shareUrl);
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    
    window.open(shareUrls[platform], '_blank');
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="inline-flex items-center gap-x-1 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-secondary-900 shadow-sm ring-1 ring-inset ring-secondary-300 hover:bg-secondary-50 dark:bg-secondary-800 dark:text-white dark:ring-secondary-700 dark:hover:bg-secondary-700"
      >
        <ShareIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Share
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-secondary-800 dark:ring-secondary-700">
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                onClick={handleCopyLink}
                className={twMerge(
                  'flex w-full items-center px-4 py-2 text-sm',
                  active
                    ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-700 dark:text-secondary-300'
                )}
              >
                <LinkIcon className="mr-3 h-5 w-5 text-secondary-400" />
                Copy Link
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                onClick={handleEmailShare}
                className={twMerge(
                  'flex w-full items-center px-4 py-2 text-sm',
                  active
                    ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-700 dark:text-secondary-300'
                )}
              >
                <EnvelopeIcon className="mr-3 h-5 w-5 text-secondary-400" />
                Email
              </button>
            )}
          </Menu.Item>
          <div className="border-t border-secondary-200 dark:border-secondary-700" />
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                onClick={() => handleSocialShare('twitter')}
                className={twMerge(
                  'flex w-full items-center px-4 py-2 text-sm',
                  active
                    ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-700 dark:text-secondary-300'
                )}
              >
                <GlobeAltIcon className="mr-3 h-5 w-5 text-secondary-400" />
                Twitter
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                onClick={() => handleSocialShare('linkedin')}
                className={twMerge(
                  'flex w-full items-center px-4 py-2 text-sm',
                  active
                    ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-700 dark:text-secondary-300'
                )}
              >
                <GlobeAltIcon className="mr-3 h-5 w-5 text-secondary-400" />
                LinkedIn
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                onClick={() => handleSocialShare('facebook')}
                className={twMerge(
                  'flex w-full items-center px-4 py-2 text-sm',
                  active
                    ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-700 dark:text-secondary-300'
                )}
              >
                <GlobeAltIcon className="mr-3 h-5 w-5 text-secondary-400" />
                Facebook
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function FormListItem({ form, collection }: { form: Form, collection?: Collection }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: form.id,
    data: { type: 'form', form },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handlePublishToggle = async () => {
    try {
      const newStatus: FormStatus = form.status === 'published' ? 'draft' : 'published';
      await formService.updateForm(form.id, { ...form, status: newStatus });
      // TODO: Refresh forms list
    } catch (err) {
      console.error('Failed to update form status:', err);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between rounded-lg border border-secondary-200 bg-white p-4 shadow-sm transition-all hover:shadow dark:border-secondary-700 dark:bg-secondary-800 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mr-3 cursor-move rounded p-1 text-secondary-400 opacity-0 hover:bg-secondary-100 group-hover:opacity-100 dark:text-secondary-500 dark:hover:bg-secondary-700"
      >
        <Bars3Icon className="h-5 w-5" />
      </div>

      <Link to={`/forms/${form.id}`} className="flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <CollectionBadge collection={collection} />
            <h3 className="mt-1 text-sm font-medium text-secondary-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
              {form.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-x-6">
          <div className="flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
            <CalendarIcon className="h-5 w-5" />
            <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span>{form.responseCount} responses</span>
          </div>
        </div>
      </Link>

      <div className="ml-4 flex items-center gap-x-4">
        <Switch
          checked={form.status === 'published'}
          onChange={handlePublishToggle}
          className={twMerge(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
            form.status === 'published' ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
          )}
        >
          <span className="sr-only">
            {form.status === 'published' ? 'Unpublish form' : 'Publish form'}
          </span>
          <span
            className={twMerge(
              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              form.status === 'published' ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </Switch>

        {form.status === 'published' && (
          <ShareDropdown form={form} />
        )}
      </div>
    </div>
  );
}

interface CollectionDropZoneProps { 
  collection: Collection, 
  isSelected: boolean,
  onSelect: () => void,
  onRename: (name: string) => void,
  onDelete: () => void,
  onDrop: (formId: string, collectionId: string) => void 
}

function CollectionDropZone({ 
  collection, 
  isSelected, 
  onSelect, 
  onRename,
  onDelete,
  onDrop 
}: CollectionDropZoneProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const { setNodeRef, isOver } = useDroppable({
    id: collection.id,
    data: { type: 'collection', collection },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({
    id: collection.id,
    data: { type: 'collection', collection },
    disabled: collection.isFilter,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRename = () => {
    if (newName.trim() && newName !== collection.name) {
      onRename(newName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewName(collection.name);
    }
  };

  return (
    <div
      ref={collection.isFilter ? undefined : setSortableRef}
      style={style}
      {...(collection.isFilter ? {} : attributes)}
      className={`group relative ${collection.isFilter ? 'mb-2' : ''}`}
    >
      <div
        ref={setNodeRef}
        className={`flex w-full items-center rounded-lg px-3 py-2 transition-colors ${
          isSelected
            ? 'bg-secondary-100 dark:bg-secondary-800'
            : isOver
            ? 'bg-secondary-50 dark:bg-secondary-800/70'
            : 'hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
        }`}
      >
        {!collection.isFilter && (
          <div {...listeners} className="mr-2 cursor-move opacity-0 group-hover:opacity-100">
            <Bars3Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
        <button
          type="button"
          onClick={onSelect}
          className="flex flex-1 items-center"
        >
          {collection.icon ? (
            <collection.icon className={`mr-2 h-5 w-5 ${
              isSelected
                ? 'text-secondary-600 dark:text-secondary-300'
                : 'text-secondary-400'
            }`} />
          ) : (
            <FolderIcon className={`mr-2 h-5 w-5 ${
              isSelected
                ? 'text-secondary-600 dark:text-secondary-300'
                : 'text-secondary-400'
            }`} />
          )}
          {isEditing ? (
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-6 text-sm"
            />
          ) : (
            <span className={`text-sm font-medium ${
              isSelected
                ? 'text-secondary-900 dark:text-white'
                : 'text-secondary-700 dark:text-secondary-300'
            }`}>
              {collection.name}
            </span>
          )}
        </button>
        {!isEditing && !collection.isFilter && collection.id !== 'all' && (
          <div className="ml-auto flex items-center gap-x-1 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-500 dark:text-secondary-500 dark:hover:bg-secondary-700 dark:hover:text-secondary-400"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded p-1 text-secondary-400 hover:bg-red-100 hover:text-red-500 dark:text-secondary-500 dark:hover:bg-red-900 dark:hover:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        {isOver && (
          <span className="ml-auto text-xs text-secondary-500 dark:text-secondary-400">
            Drop to move
          </span>
        )}
      </div>
    </div>
  );
}

export function Forms() {
  const [searchParams] = useSearchParams();
  const [forms, setForms] = useState<FormWithCollection[]>([]);
  const [collections, setCollections] = useState<Collection[]>([
    { id: 'starred', name: 'Starred', isFilter: true, icon: StarIconSolid, color: '#FCD34D' },
    { id: 'published', name: 'Published', isFilter: true, icon: EyeIcon, color: '#10B981' },
    { id: 'drafts', name: 'Drafts', isFilter: true, icon: PencilSquareIcon, color: '#6B7280' },
    { id: 'all', name: 'All Forms' },
    { id: 'templates', name: 'Templates', color: '#3B82F6' },
    { id: 'archived', name: 'Archived', color: '#6B7280' },
  ]);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    const collection = searchParams.get('collection');
    if (collection && collections.some(c => c.id === collection)) {
      setSelectedCollection(collection);
    }
  }, [searchParams, collections]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await formService.getForms();
        setForms(data);
      } catch (err) {
        setError('Failed to load forms. Please try again later.');
        console.error('Error fetching forms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.data.current?.type === 'form' && over.data.current?.type === 'collection') {
      const formId = active.id as string;
      const collectionId = over.id as string;
      
      setForms(forms.map(form => 
        form.id === formId
          ? { ...form, collectionId }
          : form
      ));
    } else if (active.data.current?.type === 'collection' && over.data.current?.type === 'collection') {
      const oldIndex = collections.findIndex(c => c.id === active.id);
      const newIndex = collections.findIndex(c => c.id === over.id);
      
      if (oldIndex !== newIndex) {
        const newCollections = [...collections];
        const [removed] = newCollections.splice(oldIndex, 1);
        newCollections.splice(newIndex, 0, removed);
        setCollections(newCollections);
      }
    }
  };

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      setCollections([
        ...collections,
        {
          id: `collection-${Date.now()}`,
          name: newCollectionName,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
        },
      ]);
      setNewCollectionName('');
      setIsAddingCollection(false);
    }
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (window.confirm('Are you sure you want to delete this collection? Forms in this collection will be moved to All Forms.')) {
      setForms(forms.map(form => 
        form.collectionId === collectionId
          ? { ...form, collectionId: undefined }
          : form
      ));
      setCollections(collections.filter(c => c.id !== collectionId));
      if (selectedCollection === collectionId) {
        setSelectedCollection('all');
      }
    }
  };

  const filteredForms = forms.filter(form => {
    if (selectedCollection === 'all') return true;
    if (selectedCollection === 'starred') return form.starred;
    if (selectedCollection === 'published') return form.status === 'active';
    if (selectedCollection === 'drafts') return form.status === 'draft';
    return form.collectionId === selectedCollection;
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-secondary-900 dark:text-white">Forms</h1>
            <p className="mt-2 text-sm text-secondary-700 dark:text-secondary-400">
              Create and manage your forms
            </p>
          </div>
          <div className="flex items-center gap-x-4">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Collections Sidebar */}
          <div className="w-64 space-y-1">
            {/* Filter Collections */}
            {collections.filter(c => c.isFilter).map(collection => (
              <CollectionDropZone
                key={collection.id}
                collection={collection}
                isSelected={selectedCollection === collection.id}
                onSelect={() => setSelectedCollection(collection.id)}
                onRename={() => {}}
                onDelete={() => {}}
                onDrop={() => {}}
              />
            ))}

            {/* Divider */}
            <div className="my-2 border-t border-secondary-200 dark:border-secondary-700" />

            {/* Regular Collections */}
            <SortableContext 
              items={collections.filter(c => !c.isFilter).map(c => c.id)} 
              strategy={verticalListSortingStrategy}
            >
              {collections.filter(c => !c.isFilter).map(collection => (
                <CollectionDropZone
                  key={collection.id}
                  collection={collection}
                  isSelected={selectedCollection === collection.id}
                  onSelect={() => setSelectedCollection(collection.id)}
                  onRename={(name) => {
                    setCollections(collections.map(c =>
                      c.id === collection.id ? { ...c, name } : c
                    ));
                  }}
                  onDelete={() => handleDeleteCollection(collection.id)}
                  onDrop={(formId, collectionId) => {
                    setForms(forms.map(form => 
                      form.id === formId
                        ? { ...form, collectionId }
                        : form
                    ));
                  }}
                />
              ))}
            </SortableContext>

            {isAddingCollection ? (
              <div className="mt-2 space-y-2 px-3">
                <Input
                  type="text"
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCollection();
                    } else if (e.key === 'Escape') {
                      setIsAddingCollection(false);
                      setNewCollectionName('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex items-center gap-x-2">
                  <Button
                    size="sm"
                    onClick={handleAddCollection}
                    disabled={!newCollectionName.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setIsAddingCollection(false);
                      setNewCollectionName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingCollection(true)}
                className="mt-2 flex w-full items-center gap-x-2 px-3 py-2 text-sm text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                <PlusIcon className="h-5 w-5" />
                Add Collection
              </button>
            )}
          </div>

          {/* Forms Grid/List */}
          {view === 'grid' ? (
            <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form) => (
                <FormCard
                  key={form.id}
                  form={form}
                  collection={collections.find(c => c.id === form.collectionId)}
                />
              ))}

              {filteredForms.length === 0 && (
                <div className="col-span-full">
                  <div className="rounded-lg border-2 border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
                    <PlusIcon className="mx-auto h-12 w-12 text-secondary-400" />
                    <h3 className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">No forms</h3>
                    <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                      Get started by creating a new form
                    </p>
                    <div className="mt-6">
                      <Link to="/forms/new">
                        <Button>
                          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                          New Form
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              {filteredForms.map((form) => (
                <FormListItem
                  key={form.id}
                  form={form}
                  collection={collections.find(c => c.id === form.collectionId)}
                />
              ))}

              {filteredForms.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
                  <PlusIcon className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">No forms</h3>
                  <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                    Get started by creating a new form
                  </p>
                  <div className="mt-6">
                    <Link to="/forms/new">
                      <Button>
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        New Form
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
} 