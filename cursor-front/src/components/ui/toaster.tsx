import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/toast"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const IconComponent = {
          success: CheckCircle,
          warning: AlertCircle,
          destructive: XCircle,
          info: Info,
          default: Info,
        }[variant || 'default']

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
