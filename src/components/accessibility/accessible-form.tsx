'use client'

import { forwardRef, useState, useId } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react'

// Accessible form field wrapper
interface FormFieldProps {
  children: React.ReactNode
  label?: string
  description?: string
  error?: string
  success?: string
  required?: boolean
  className?: string
  labelClassName?: string
  id?: string
}

export function FormField({ 
  children, 
  label, 
  description, 
  error, 
  success,
  required = false,
  className,
  labelClassName,
  id 
}: FormFieldProps) {
  const fieldId = useId()
  const inputId = id || fieldId
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const successId = success ? `${inputId}-success` : undefined

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-gray-700',
            required && 'after:content-["*"] after:text-red-500 after:ml-1',
            labelClassName
          )}
        >
          {label}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-gray-600"
        >
          {description}
        </p>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: inputId,
          'aria-describedby': [descriptionId, errorId, successId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required,
          className: cn(
            (children as React.ReactElement).props.className,
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            success && 'border-green-500 focus:border-green-500 focus:ring-green-500'
          )
        })}
        
        {/* Error/Success Icons */}
        {(error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error && <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />}
            {success && <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />}
          </div>
        )}
      </div>

      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {success && (
        <p 
          id={successId}
          className="text-sm text-green-600 flex items-center"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
          {success}
        </p>
      )}
    </div>
  )
}

// Accessible input component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  success?: string
  showPasswordToggle?: boolean
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ 
    label, 
    description, 
    error, 
    success, 
    showPasswordToggle = false,
    type = 'text',
    className,
    required,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type

    const input = (
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            showPasswordToggle && 'pr-10',
            className
          )}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    )

    if (label || description || error || success) {
      return (
        <FormField
          label={label}
          description={description}
          error={error}
          success={success}
          required={required}
        >
          {input}
        </FormField>
      )
    }

    return input
  }
)

AccessibleInput.displayName = 'AccessibleInput'

// Accessible textarea component
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  success?: string
  showCharacterCount?: boolean
  maxLength?: number
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ 
    label, 
    description, 
    error, 
    success, 
    showCharacterCount = false,
    maxLength,
    className,
    required,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const textarea = (
      <div className="relative">
        <textarea
          ref={ref}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'resize-y min-h-[100px]',
            className
          )}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        
        {showCharacterCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    )

    const enhancedDescription = showCharacterCount && maxLength 
      ? `${description || ''}${description ? ' ' : ''}Maximum ${maxLength} characters.`
      : description

    if (label || enhancedDescription || error || success) {
      return (
        <FormField
          label={label}
          description={enhancedDescription}
          error={error}
          success={success}
          required={required}
        >
          {textarea}
        </FormField>
      )
    }

    return textarea
  }
)

AccessibleTextarea.displayName = 'AccessibleTextarea'

// Accessible select component
interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  error?: string
  success?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ 
    label, 
    description, 
    error, 
    success, 
    options,
    placeholder,
    className,
    required,
    ...props 
  }, ref) => {
    const select = (
      <select
        ref={ref}
        className={cn(
          'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    )

    if (label || description || error || success) {
      return (
        <FormField
          label={label}
          description={description}
          error={error}
          success={success}
          required={required}
        >
          {select}
        </FormField>
      )
    }

    return select
  }
)

AccessibleSelect.displayName = 'AccessibleSelect'

// Accessible checkbox component
interface AccessibleCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ label, description, error, className, ...props }, ref) => {
    const fieldId = useId()

    return (
      <FormField error={error}>
        <div className="flex items-start">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            className={cn(
              'h-4 w-4 text-blue-600 border-gray-300 rounded',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            aria-describedby={description ? `${fieldId}-description` : undefined}
            {...props}
          />
          <div className="ml-3 text-sm">
            <label htmlFor={fieldId} className="font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
            {description && (
              <p id={`${fieldId}-description`} className="text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </FormField>
    )
  }
)

AccessibleCheckbox.displayName = 'AccessibleCheckbox'

// Accessible radio group component
interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface AccessibleRadioGroupProps {
  name: string
  label?: string
  description?: string
  error?: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  className?: string
}

export function AccessibleRadioGroup({
  name,
  label,
  description,
  error,
  options,
  value,
  onChange,
  required = false,
  className
}: AccessibleRadioGroupProps) {
  return (
    <FormField
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <fieldset>
        <legend className="sr-only">{label}</legend>
        <div className="space-y-3">
          {options.map((option) => {
            const optionId = `${name}-${option.value}`
            return (
              <div key={option.value} className="flex items-start">
                <input
                  id={optionId}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={option.disabled}
                  className={cn(
                    'h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  aria-describedby={option.description ? `${optionId}-description` : undefined}
                />
                <div className="ml-3 text-sm">
                  <label htmlFor={optionId} className="font-medium text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                  {option.description && (
                    <p id={`${optionId}-description`} className="text-gray-500 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </fieldset>
    </FormField>
  )
}