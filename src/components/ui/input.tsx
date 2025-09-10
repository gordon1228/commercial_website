import * as React from "react"
import { cva, type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff, AlertCircle, CheckCircle, Search } from 'lucide-react'
import { cn } from "@/lib/utils"

const inputVariants = cva(
  'input',
  {
    variants: {
      variant: {
        default: '',
        error: 'input-error',
        success: 'input-success',
      },
      size: {
        sm: 'h-8 px-2 py-1 text-sm',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant,
    size,
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    loading,
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type
    
    // Determine variant based on state
    const computedVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="form-group">
        {label && (
          <label className="label" htmlFor={props.id}>
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: computedVariant, size }),
              leftIcon && 'pl-10',
              (rightIcon || isPassword || loading || error || success) && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled || loading}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error 
                ? `${props.id}-error` 
                : success 
                ? `${props.id}-success`
                : helperText
                ? `${props.id}-help`
                : undefined
            }
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <div className="loading-spinner h-4 w-4 text-muted-foreground" />
            )}
            
            {!loading && error && (
              <AlertCircle className="h-4 w-4 text-error" />
            )}
            
            {!loading && !error && success && (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
            
            {!loading && !error && !success && rightIcon && (
              <span className="text-muted-foreground">{rightIcon}</span>
            )}
            
            {isPassword && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div id={`${props.id}-error`} className="form-error" role="alert">
            {error}
          </div>
        )}
        
        {!error && success && (
          <div id={`${props.id}-success`} className="text-sm text-success-600 mt-1">
            {success}
          </div>
        )}
        
        {!error && !success && helperText && (
          <div id={`${props.id}-help`} className="form-help">
            {helperText}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant,
    size,
    label,
    error,
    success,
    helperText,
    resize = 'vertical',
    disabled,
    ...props 
  }, ref) => {
    // Determine variant based on state
    const computedVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="form-group">
        {label && (
          <label className="label" htmlFor={props.id}>
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(
            inputVariants({ variant: computedVariant, size }),
            'min-h-[80px]',
            resize === 'none' && 'resize-none',
            resize === 'vertical' && 'resize-y',
            resize === 'horizontal' && 'resize-x',
            resize === 'both' && 'resize',
            className
          )}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error 
              ? `${props.id}-error` 
              : success 
              ? `${props.id}-success`
              : helperText
              ? `${props.id}-help`
              : undefined
          }
          {...props}
        />
        
        {error && (
          <div id={`${props.id}-error`} className="form-error" role="alert">
            {error}
          </div>
        )}
        
        {!error && success && (
          <div id={`${props.id}-success`} className="text-sm text-success-600 mt-1">
            {success}
          </div>
        )}
        
        {!error && !success && helperText && (
          <div id={`${props.id}-help`} className="form-help">
            {helperText}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

// Search Input component
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch,
    onClear,
    showClearButton = true,
    placeholder = "Search...",
    value: controlledValue,
    ...props 
  }, ref) => {
    const [value, setValue] = React.useState(controlledValue || '')
    
    React.useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue)
      }
    }, [controlledValue])
    
    const handleSearch = (searchValue: string) => {
      setValue(searchValue)
      onSearch?.(searchValue)
    }
    
    const handleClear = () => {
      setValue('')
      onSearch?.('')
      onClear?.()
    }
    
    return (
      <Input
        {...props}
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          showClearButton && value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              ×
            </button>
          ) : undefined
        }
        onChange={(e) => handleSearch(e.target.value)}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

// Input Group for combining inputs
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-stretch', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
InputGroup.displayName = "InputGroup"

// Input Addon for prefixes/suffixes
export interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center px-3 py-2 bg-muted border border-border text-sm text-muted-foreground',
          'first:rounded-l-md first:border-r-0',
          'last:rounded-r-md last:border-l-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
InputAddon.displayName = "InputAddon"

export { Input, Textarea, SearchInput, InputGroup, InputAddon }