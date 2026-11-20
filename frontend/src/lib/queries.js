import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from './api'

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => api.get('/settings'), staleTime: 5 * 60_000 })

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories'), staleTime: 5 * 60_000 })

export const useProducts = (params = {}, opts = {}) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: ({ signal }) => api.get('/products', params, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    ...opts,
  })

export const useProduct = (slug) =>
  useQuery({ queryKey: ['product', slug], queryFn: () => api.get(`/products/${slug}`), enabled: Boolean(slug) })

export const useFacets = () =>
  useQuery({ queryKey: ['facets'], queryFn: () => api.get('/products/facets'), staleTime: 5 * 60_000 })

export const useProductsByIds = (ids) =>
  useQuery({
    queryKey: ['products-by-ids', [...ids].sort()],
    queryFn: () => api.get('/products-by-ids', { ids }),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
  })
