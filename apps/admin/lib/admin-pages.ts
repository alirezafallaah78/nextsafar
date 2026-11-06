export interface Page {
  id: string
  title: string
  slug: string
  content: string
  template: string
  status: 'draft' | 'published' | 'archived'
  isSystem: boolean  // صفحات سیستمی قابل حذف نیستند
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'nextsafar_pages'

// صفحات سیستمی پیش‌فرض (غیرقابل حذف)
const systemPages: Page[] = [
  {
    id: 'page-1',
    title: 'درباره ما',
    slug: 'about',
    content: '<h1>درباره ما</h1><p>محتوای صفحه درباره ما...</p>',
    template: 'about',
    status: 'published',
    isSystem: true,
    metaTitle: 'درباره ما | NextSafar',
    metaDescription: 'با ما بیشتر آشنا شوید',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-2',
    title: 'تماس با ما',
    slug: 'contact',
    content: '<h1>تماس با ما</h1><p>اطلاعات تماس...</p>',
    template: 'contact',
    status: 'published',
    isSystem: true,
    metaTitle: 'تماس با ما | NextSafar',
    metaDescription: 'راه‌های ارتباطی با ما',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-3',
    title: 'قوانین و مقررات',
    slug: 'terms',
    content: '<h1>قوانین و مقررات</h1><p>شرایط استفاده...</p>',
    template: 'terms',
    status: 'published',
    isSystem: true,
    metaTitle: 'قوانین و مقررات | NextSafar',
    metaDescription: 'شرایط و قوانین استفاده از خدمات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-4',
    title: 'حریم خصوصی',
    slug: 'privacy',
    content: '<h1>حریم خصوصی</h1><p>سیاست حفظ حریم خصوصی...</p>',
    template: 'privacy',
    status: 'published',
    isSystem: true,
    metaTitle: 'حریم خصوصی | NextSafar',
    metaDescription: 'سیاست حفظ حریم خصوصی کاربران',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-5',
    title: 'سوالات متداول',
    slug: 'faq',
    content: '<h1>سوالات متداول</h1><p>پاسخ به سوالات رایج...</p>',
    template: 'faq',
    status: 'published',
    isSystem: true,
    metaTitle: 'سوالات متداول | NextSafar',
    metaDescription: 'پاسخ به سوالات رایج کاربران',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function listPages(): Page[] {
  if (typeof window === 'undefined') return systemPages
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systemPages))
    return systemPages
  }
  try {
    return JSON.parse(stored)
  } catch {
    return systemPages
  }
}

export function getPage(id: string): Page | null {
  const pages = listPages()
  return pages.find(p => p.id === id) || null
}

export function createPage(data: Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>): Page {
  const pages = listPages()
  const newPage: Page = {
    ...data,
    id: `page-${Date.now()}`,
    isSystem: false,  // صفحات جدید سیستمی نیستند
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  pages.push(newPage)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
  }
  return newPage
}

export function updatePage(id: string, data: Partial<Omit<Page, 'id' | 'createdAt' | 'isSystem'>>): Page | null {
  const pages = listPages()
  const index = pages.findIndex(p => p.id === id)
  if (index === -1) return null
  
  // جلوگیری از تغییر isSystem
  const { isSystem, createdAt, ...rest } = data as any
  pages[index] = {
    ...pages[index],
    ...rest,
    updatedAt: new Date().toISOString(),
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
  }
  return pages[index]
}

export function deletePage(id: string): boolean {
  const pages = listPages()
  const page = pages.find(p => p.id === id)
  
  // محافظت از صفحات سیستمی
  if (page?.isSystem) {
    console.error('Cannot delete system page:', page.title)
    return false
  }
  
  const filtered = pages.filter(p => p.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }
  return true
}
