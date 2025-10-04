import { useToast as useToastHook } from '@/components/ui/toast';

export function useToast() {
  const { toast } = useToastHook();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'success',
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'warning',
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'info',
    });
  };

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
