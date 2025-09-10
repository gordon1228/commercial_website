'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button, IconButton } from './button'

// Modal Context for managing state
interface ModalContextType {
  isOpen: boolean
  onClose: () => void
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined)

const useModal = () => {
  const context = React.useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a Modal component')
  }
  return context
}

// Modal variants for different sizes and styles
const modalVariants = cva(
  'modal-content',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        full: 'max-w-full h-full',
      },
      centered: {
        true: 'mx-auto my-auto',
        false: 'mx-auto mt-20',
      },
    },
    defaultVariants: {
      size: 'md',
      centered: true,
    },
  }
)

// Hook for managing modal state
export function useModalState(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  const onOpen = React.useCallback(() => setIsOpen(true), [])
  const onClose = React.useCallback(() => setIsOpen(false), [])
  const onToggle = React.useCallback(() => setIsOpen(prev => !prev), [])
  
  return { isOpen, onOpen, onClose, onToggle }
}

// Main Modal component
export interface ModalProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  preventScroll?: boolean
  returnFocus?: boolean
  children: React.ReactNode
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    isOpen,
    onClose,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    preventScroll = true,
    returnFocus = true,
    size,
    centered,
    className,
    children,
    ...props
  }, ref) => {
    const [mounted, setMounted] = React.useState(false)
    const previousFocusRef = React.useRef<HTMLElement | null>(null)
    const modalRef = React.useRef<HTMLDivElement>(null)

    // Handle mounting for SSR compatibility
    React.useEffect(() => {
      setMounted(true)
    }, [])

    // Handle escape key
    React.useEffect(() => {
      if (!isOpen || !closeOnEscape) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, closeOnEscape, onClose])

    // Handle focus management
    React.useEffect(() => {
      if (!isOpen) return

      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus()
      }

      return () => {
        // Return focus to the previously focused element
        if (returnFocus && previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }, [isOpen, returnFocus])

    // Handle body scroll prevention
    React.useEffect(() => {
      if (!isOpen || !preventScroll) return

      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalStyle
      }
    }, [isOpen, preventScroll])

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose()
      }
    }

    // Trap focus within modal
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    if (!mounted || !isOpen) return null

    const modalContent = (
      <ModalContext.Provider value={{ isOpen, onClose }}>
        <div
          className="modal-overlay"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div
            ref={modalRef}
            className={cn(modalVariants({ size, centered, className }))}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            {...props}
          >
            {showCloseButton && (
              <div className="absolute right-4 top-4 z-10">
                <IconButton
                  icon={<X className="h-4 w-4" />}
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  aria-label="Close modal"
                />
              </div>
            )}
            {children}
          </div>
        </div>
      </ModalContext.Provider>
    )

    return createPortal(modalContent, document.body)
  }
)
Modal.displayName = 'Modal'

// Modal Header component
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-header', className)}
        {...props}
      />
    )
  }
)
ModalHeader.displayName = 'ModalHeader'

// Modal Title component
export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        id="modal-title"
        className={cn('card-title', className)}
        {...props}
      />
    )
  }
)
ModalTitle.displayName = 'ModalTitle'

// Modal Description component
export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        id="modal-description"
        className={cn('card-description', className)}
        {...props}
      />
    )
  }
)
ModalDescription.displayName = 'ModalDescription'

// Modal Body component
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-content', className)}
        {...props}
      />
    )
  }
)
ModalBody.displayName = 'ModalBody'

// Modal Footer component
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-footer gap-3', className)}
        {...props}
      />
    )
  }
)
ModalFooter.displayName = 'ModalFooter'

// Confirmation Modal component
export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription>{description}</ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={onConfirm}
          loading={loading}
          loadingText="Processing..."
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

// Alert Modal component
export interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  buttonText?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText = 'OK',
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-success-600'
      case 'warning':
        return 'text-warning-600'
      case 'error':
        return 'text-error-600'
      default:
        return ''
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>
        <ModalTitle className={getVariantStyles()}>{title}</ModalTitle>
        <ModalDescription>{description}</ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <Button onClick={onClose} className="ml-auto">
          {buttonText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

// Form Modal component
export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit?: () => void
  submitText?: string
  cancelText?: string
  loading?: boolean
  submitDisabled?: boolean
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  submitDisabled = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        {description && <ModalDescription>{description}</ModalDescription>}
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
      {onSubmit && (
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            onClick={onSubmit}
            loading={loading}
            disabled={submitDisabled}
            loadingText="Saving..."
          >
            {submitText}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}

export {
  useModal,
  useModalState,
}