"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { listPages, deletePage, Page } from '@/lib/admin-pages'

export default function PagesList() {
  const [pages, setPages] = useState<Page[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setPages(listPages())
  }, [])

  const handleDelete = (id: string) => {
    const success = deletePage(id)
    if (success) {
      setPages(listPages())
      setDeleteId(null)
    }
  }

  const pageToDelete = pages.find(p => p.id === deleteId)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مدیریت صفحات</h1>
          <p className="text-muted-foreground mt-1">مدیریت صفحات استاتیک سایت</p>
        </div>
        <Button asChild>
          <Link href="/pages/new">
            <Plus className="ml-2 h-4 w-4" />
            صفحه جدید
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {page.isSystem && (
                    <Badge variant="default" className="gap-1">
                      <Shield className="h-3 w-3" />
                      سیستمی
                    </Badge>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                    {page.status === 'published' ? 'منتشر شده' : page.status === 'draft' ? 'پیش‌نویس' : 'آرشیو'}
                  </Badge>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/pages/${page.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  {page.isSystem ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled
                      title="صفحات سیستمی قابل حذف نیستند"
                    >
                      <Trash2 className="h-4 w-4 opacity-30" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteId(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              {pageToDelete?.isSystem ? (
                <span className="text-destructive font-semibold">
                  ⚠️ این صفحه سیستمی است و قابل حذف نیست!
                </span>
              ) : (
                <>
                  این عمل قابل بازگشت نیست. صفحه <strong>{pageToDelete?.title}</strong> برای همیشه حذف خواهد شد.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            {!pageToDelete?.isSystem && (
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                حذف
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
