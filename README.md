# 📝 Notion-Style Document Platform

A real-time collaborative document editing platform with a hierarchical document structure and rich media support.

![Next JS](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Convex](https://img.shields.io/badge/Convex-FF6B6B?style=flat&logo=database&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

## ✨ Key Features

### 📄 Document Management
- **Real-time Collaboration**
  - Live updates using Convex
  - Multi-user editing
  - Presence indicators
  - Conflict resolution

- **Document Structure**
  - Infinite nested documents
  - Hierarchical navigation
  - Document icons
  - Cover images

- **Document Recovery**
  - Trash can functionality
  - Soft delete
  - File recovery
  - Version history

### 📝 Rich Text Editor
- **Notion-style Editor**
  - Block-based editing
  - Rich text formatting
  - Code blocks
  - Tables
  - Lists
  - Media embeds

### 🎨 User Interface
- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interactions
  - Collapsible sidebar

- **Appearance**
  - Light/Dark mode
  - Custom document icons
  - Cover image support
  - Responsive images

## 🗄️ Database Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/schema';
import { v } from 'convex/values';

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    userId: v.string(),
    parentDocument: v.optional(v.id('documents')),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_parent', ['parentDocument'])
    .index('by_user_parent', ['userId', 'parentDocument']),
  
  files: defineTable({
    documentId: v.id('documents'),
    userId: v.string(),
    url: v.string(),
    type: v.string(),
    size: v.number(),
    createdAt: v.number(),
  })
    .index('by_document', ['documentId'])
    .index('by_user', ['userId']),
});
```

## 💎 Core Features Implementation

### 📝 Document Editor

```typescript
// components/Editor.tsx
import { BlockNoteEditor } from '@blocknote/react';
import { useConvex } from 'convex/react';

export function Editor({ 
  documentId,
  initialContent,
}: { 
  documentId: string;
  initialContent?: string;
}) {
  const convex = useConvex();
  const [editor] = useState(() => 
    new BlockNoteEditor({
      initialContent: initialContent 
        ? JSON.parse(initialContent)
        : undefined,
    })
  );

  const debouncedUpdate = useMemo(
    () => debounce(async (content: string) => {
      await convex.mutation('documents:update', {
        id: documentId,
        content,
        updatedAt: Date.now(),
      });
    }, 500),
    [documentId]
  );

  return (
    <BlockNoteView
      editor={editor}
      onChange={content => {
        debouncedUpdate(JSON.stringify(content));
      }}
    />
  );
}
```

### 📚 Document Hierarchy

```typescript
// hooks/useDocuments.ts
export function useDocuments(parentId?: string) {
  const documents = useQuery('documents:list', {
    parentDocument: parentId,
    isArchived: false,
  });

  const documentsWithChildren = useMemo(() => {
    return documents?.map(doc => ({
      ...doc,
      children: documents.filter(
        child => child.parentDocument === doc._id
      ),
    }));
  }, [documents]);

  return documentsWithChildren;
}

// components/DocumentTree.tsx
export function DocumentTree({ 
  documents,
  level = 0 
}: {
  documents: Document[];
  level?: number;
}) {
  return (
    <div style={{ paddingLeft: level * 12 }}>
      {documents.map(document => (
        <div key={document._id}>
          <DocumentItem document={document} />
          {document.children?.length > 0 && (
            <DocumentTree
              documents={document.children}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 🗑️ Trash Management

```typescript
// hooks/useTrash.ts
export function useTrash() {
  const convex = useConvex();

  const moveToTrash = async (documentId: string) => {
    await convex.mutation('documents:archive', {
      id: documentId,
      isArchived: true,
      archivedAt: Date.now(),
    });
  };

  const restore = async (documentId: string) => {
    await convex.mutation('documents:archive', {
      id: documentId,
      isArchived: false,
      archivedAt: null,
    });
  };

  const deletePermanently = async (documentId: string) => {
    await convex.mutation('documents:delete', {
      id: documentId,
    });
  };

  return {
    moveToTrash,
    restore,
    deletePermanently,
  };
}
```

### 🌐 Document Publishing

```typescript
// hooks/usePublish.ts
export function usePublish() {
  const convex = useConvex();

  const publishDocument = async (documentId: string) => {
    await convex.mutation('documents:publish', {
      id: documentId,
      isPublished: true,
      publishedAt: Date.now(),
    });
  };

  const unpublishDocument = async (documentId: string) => {
    await convex.mutation('documents:publish', {
      id: documentId,
      isPublished: false,
      publishedAt: null,
    });
  };

  return {
    publishDocument,
    unpublishDocument,
  };
}
```

### 🎨 Theme Switching

```typescript
// hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark', 
      theme === 'dark'
    );
  }, []);

  return {
    theme,
    toggleTheme,
  };
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Convex account
- Authentication provider account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/notion-clone.git
cd notion-clone
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
# .env.local
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

4. **Initialize Convex**
```bash
npx convex dev
```

5. **Start development server**
```bash
pnpm dev
```

## ⚡ Performance Optimizations

- Real-time updates batching
- Image optimization
- Code splitting
- Tree shaking
- Lazy loading

## 🔒 Security Features

- Authentication
- Document permissions
- API route protection
- Input validation
- File upload restrictions

## 🚀 Deployment

1. **Deploy Convex**
```bash
npx convex deploy
```

2. **Configure Vercel**
```bash
vercel env pull
```

3. **Deploy**
```bash
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Convex](https://www.convex.dev/)
- [BlockNote](https://www.blocknotejs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Clerk](https://clerk.dev/)

---

Built with 📝 by Awais Raza
