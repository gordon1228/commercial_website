export interface FilterOption {
  id: string
  label: string
}

export interface VehicleFiltersConfig {
  statusOptions: FilterOption[]
  fuelTypeOptions: FilterOption[]
  transmissionOptions: FilterOption[]
  makeOptions: FilterOption[]
}