'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, MoreHorizontal } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button, IconButton } from './button'
import { Input } from './input'

// Types for table configuration
export interface TableColumn<T = any> {
  id: string
  header: string | React.ReactNode
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (props: { value: any; row: T; index: number }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
}

export type SortDirection = 'asc' | 'desc' | false
export interface SortingState {
  id: string
  desc: boolean
}

export interface FilterState {
  id: string
  value: any
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

// Table variants
const tableVariants = cva(
  'data-table',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      variant: {
        default: 'border border-border',
        ghost: '',
        striped: 'border border-border [&_tbody_tr:nth-child(odd)]:bg-muted/30',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

// Hook for table state management
export function useTableState<T>({
  data = [],
  columns = [],
  initialSorting = [],
  initialFilters = [],
  initialPagination = { pageIndex: 0, pageSize: 10 },
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
}: {
  data?: T[]
  columns?: TableColumn<T>[]
  initialSorting?: SortingState[]
  initialFilters?: FilterState[]
  initialPagination?: PaginationState
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
}) {
  const [sorting, setSorting] = React.useState<SortingState[]>(initialSorting)
  const [filters, setFilters] = React.useState<FilterState[]>(initialFilters)
  const [pagination, setPagination] = React.useState<PaginationState>(initialPagination)
  const [globalFilter, setGlobalFilter] = React.useState('')

  // Process data based on current state
  const processedData = React.useMemo(() => {
    let result = [...data]

    // Apply global filter
    if (globalFilter && enableFiltering) {
      result = result.filter((row) => {
        return columns.some((column) => {
          const value = column.accessorFn 
            ? column.accessorFn(row)
            : column.accessorKey 
            ? row[column.accessorKey]
            : ''
          
          return String(value).toLowerCase().includes(globalFilter.toLowerCase())
        })
      })
    }

    // Apply column filters
    if (enableFiltering) {
      filters.forEach((filter) => {
        const column = columns.find(col => col.id === filter.id)
        if (column && filter.value) {
          result = result.filter((row) => {
            const value = column.accessorFn 
              ? column.accessorFn(row)
              : column.accessorKey 
              ? row[column.accessorKey]
              : ''
            
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          })
        }
      })
    }

    // Apply sorting
    if (enableSorting && sorting.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorting) {
          const column = columns.find(col => col.id === sort.id)
          if (!column) continue

          const aValue = column.accessorFn 
            ? column.accessorFn(a)
            : column.accessorKey 
            ? a[column.accessorKey]
            : ''
          
          const bValue = column.accessorFn 
            ? column.accessorFn(b)
            : column.accessorKey 
            ? b[column.accessorKey]
            : ''

          if (aValue < bValue) return sort.desc ? 1 : -1
          if (aValue > bValue) return sort.desc ? -1 : 1
        }
        return 0
      })
    }

    return result
  }, [data, columns, sorting, filters, globalFilter, enableSorting, enableFiltering])

  // Paginated data
  const paginatedData = React.useMemo(() => {
    if (!enablePagination) return processedData
    
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return processedData.slice(start, end)
  }, [processedData, pagination, enablePagination])

  // Pagination info
  const pageCount = Math.ceil(processedData.length / pagination.pageSize)
  const canPreviousPage = pagination.pageIndex > 0
  const canNextPage = pagination.pageIndex < pageCount - 1

  // Actions
  const toggleSorting = (columnId: string) => {
    setSorting(prev => {
      const existing = prev.find(sort => sort.id === columnId)
      if (!existing) {
        return [{ id: columnId, desc: false }]
      }
      if (!existing.desc) {
        return [{ id: columnId, desc: true }]
      }
      return []
    })
  }

  const setColumnFilter = (columnId: string, value: any) => {
    setFilters(prev => {
      const existing = prev.find(filter => filter.id === columnId)
      if (existing) {
        if (!value) {
          return prev.filter(filter => filter.id !== columnId)
        }
        return prev.map(filter => 
          filter.id === columnId ? { ...filter, value } : filter
        )
      }
      return value ? [...prev, { id: columnId, value }] : prev
    })
  }

  const nextPage = () => {
    setPagination(prev => ({
      ...prev,
      pageIndex: Math.min(prev.pageIndex + 1, pageCount - 1)
    }))
  }

  const previousPage = () => {
    setPagination(prev => ({
      ...prev,
      pageIndex: Math.max(prev.pageIndex - 1, 0)
    }))
  }

  const setPageIndex = (pageIndex: number) => {
    setPagination(prev => ({ ...prev, pageIndex }))
  }

  const setPageSize = (pageSize: number) => {
    setPagination({ pageIndex: 0, pageSize })
  }

  return {
    data: paginatedData,
    sorting,
    filters,
    pagination,
    globalFilter,
    pageCount,
    canPreviousPage,
    canNextPage,
    toggleSorting,
    setColumnFilter,
    setGlobalFilter,
    nextPage,
    previousPage,
    setPageIndex,
    setPageSize,
    setSorting,
    setFilters,
    setPagination,
    totalRows: processedData.length,
  }
}

// Main DataTable component
export interface DataTableProps<T = any> 
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  enableGlobalFilter?: boolean
  enableRowSelection?: boolean
  onRowClick?: (row: T, index: number) => void
  onRowSelect?: (selectedRows: T[]) => void
  initialSorting?: SortingState[]
  initialFilters?: FilterState[]
  initialPagination?: PaginationState
  stickyHeader?: boolean
  maxHeight?: string
}

export const DataTable = <T,>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  enableSorting = true,
  enableFiltering = false,
  enablePagination = true,
  enableGlobalFilter = false,
  enableRowSelection = false,
  onRowClick,
  onRowSelect,
  initialSorting = [],
  initialFilters = [],
  initialPagination = { pageIndex: 0, pageSize: 10 },
  stickyHeader = false,
  maxHeight,
  size,
  variant,
  className,
  ...props
}: DataTableProps<T>) => {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())
  
  const table = useTableState({
    data,
    columns,
    initialSorting,
    initialFilters,
    initialPagination,
    enableSorting,
    enableFiltering,
    enablePagination,
  })

  // Handle row selection
  const handleRowSelect = (index: number, selected: boolean) => {
    const newSelected = new Set(selectedRows)
    if (selected) {
      newSelected.add(index)
    } else {
      newSelected.delete(index)
    }
    setSelectedRows(newSelected)
    
    if (onRowSelect) {
      const selectedData = Array.from(newSelected).map(i => table.data[i])
      onRowSelect(selectedData)
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIndices = new Set(table.data.map((_, i) => i))
      setSelectedRows(allIndices)
      onRowSelect?.(table.data)
    } else {
      setSelectedRows(new Set())
      onRowSelect?.([])
    }
  }

  const getSortIcon = (columnId: string) => {
    const sort = table.sorting.find(s => s.id === columnId)
    if (!sort) return <ChevronsUpDown className="h-4 w-4" />
    return sort.desc ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
  }

  const tableStyle = maxHeight ? { maxHeight, overflowY: 'auto' as const } : undefined

  return (
    <div className="space-y-4">
      {/* Global Filter */}
      {enableGlobalFilter && (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={table.globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-lg border" style={tableStyle}>
        <table className={cn(tableVariants({ size, variant, className }))} {...props}>
          <thead className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
            <tr>
              {enableRowSelection && (
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === table.data.length && table.data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {column.sortable && enableSorting ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.toggleSorting(column.id)}
                        className="h-auto p-0 hover:bg-transparent"
                      >
                        <span>{column.header}</span>
                        {getSortIcon(column.id)}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="loading-spinner h-4 w-4" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : table.data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.data.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'hover:bg-muted/50 transition-colors',
                    onRowClick && 'cursor-pointer',
                    selectedRows.has(index) && 'bg-muted/50'
                  )}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {enableRowSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => handleRowSelect(index, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = column.accessorFn 
                      ? column.accessorFn(row)
                      : column.accessorKey 
                      ? row[column.accessorKey]
                      : ''
                    
                    return (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4 py-3 text-sm',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                      >
                        {column.cell ? column.cell({ value, row, index }) : String(value)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && table.totalRows > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {table.pagination.pageIndex * table.pagination.pageSize + 1} to{' '}
            {Math.min((table.pagination.pageIndex + 1) * table.pagination.pageSize, table.totalRows)} of{' '}
            {table.totalRows} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={table.previousPage}
              disabled={!table.canPreviousPage}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(table.pageCount, 5) }, (_, i) => {
                const pageIndex = i + Math.max(0, table.pagination.pageIndex - 2)
                if (pageIndex >= table.pageCount) return null
                
                return (
                  <Button
                    key={pageIndex}
                    variant={pageIndex === table.pagination.pageIndex ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => table.setPageIndex(pageIndex)}
                  >
                    {pageIndex + 1}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={table.nextPage}
              disabled={!table.canNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple table for basic use cases
export interface SimpleTableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  loading?: boolean
  emptyMessage?: string
}

export const SimpleTable: React.FC<SimpleTableProps> = ({
  headers,
  rows,
  loading = false,
  emptyMessage = 'No data available',
  className,
  ...props
}) => {
  return (
    <div className="rounded-lg border">
      <table className={cn('data-table', className)} {...props}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner h-4 w-4" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export { useTableState }