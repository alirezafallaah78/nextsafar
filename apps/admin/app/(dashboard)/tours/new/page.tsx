import { TourWizard } from "@/components/tours/tour-wizard"

export default function NewTourPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ایجاد تور جدید</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مراحل زیر را تکمیل کنید تا تور جدید ایجاد شود
        </p>
      </div>
      <TourWizard mode="create" />
    </div>
  )
}
