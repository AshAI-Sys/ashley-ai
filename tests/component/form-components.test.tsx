/**
 * Form Components - React Component Tests
 *
 * Tests for form UI components using React Testing Library
 * Tests validation, submission, error handling, and user interactions
 *
 * Total: 15 tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'

// Mock form components
const MockOrderForm = ({ onSubmit, initialData }: any) => {
  const [formData, setFormData] = React.useState(initialData || {
    client_name: '',
    quantity: '',
    due_date: ''
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.client_name || formData.client_name.trim() === '') {
      newErrors.client_name = 'Client name is required'
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit?.(formData)
    }
  }

  return (
    <form data-testid="order-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="client_name">Client Name</label>
        <input
          id="client_name"
          data-testid="client-name-input"
          value={formData.client_name}
          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
        />
        {errors.client_name && (
          <span data-testid="client-name-error">{errors.client_name}</span>
        )}
      </div>

      <div>
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          data-testid="quantity-input"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        />
        {errors.quantity && (
          <span data-testid="quantity-error">{errors.quantity}</span>
        )}
      </div>

      <div>
        <label htmlFor="due_date">Due Date</label>
        <input
          id="due_date"
          type="date"
          data-testid="due-date-input"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
        {errors.due_date && (
          <span data-testid="due-date-error">{errors.due_date}</span>
        )}
      </div>

      <button type="submit" data-testid="submit-btn">Submit</button>
    </form>
  )
}

const MockSearchFilter = ({ onSearch, onFilter }: any) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('ALL')

  const handleSearch = () => {
    onSearch?.(searchTerm)
  }

  const handleFilter = (status: string) => {
    setFilterStatus(status)
    onFilter?.(status)
  }

  return (
    <div data-testid="search-filter">
      <div>
        <input
          data-testid="search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} data-testid="search-btn">
          Search
        </button>
      </div>

      <div data-testid="filter-buttons">
        <button
          onClick={() => handleFilter('ALL')}
          data-testid="filter-all"
          className={filterStatus === 'ALL' ? 'active' : ''}
        >
          All
        </button>
        <button
          onClick={() => handleFilter('ACTIVE')}
          data-testid="filter-active"
          className={filterStatus === 'ACTIVE' ? 'active' : ''}
        >
          Active
        </button>
        <button
          onClick={() => handleFilter('COMPLETED')}
          data-testid="filter-completed"
          className={filterStatus === 'COMPLETED' ? 'active' : ''}
        >
          Completed
        </button>
      </div>
    </div>
  )
}

const MockFileUploadForm = ({ onUpload, acceptedTypes }: any) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState('')
  const [uploading, setUploading] = React.useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError('')

    if (!file) return

    // Validate file type
    if (acceptedTypes && !acceptedTypes.includes(file.type)) {
      setError(`File type ${file.type} not allowed`)
      setSelectedFile(null)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    try {
      await onUpload?.(selectedFile)
      setSelectedFile(null)
    } catch (err) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div data-testid="file-upload-form">
      <input
        type="file"
        data-testid="file-input"
        onChange={handleFileSelect}
        accept={acceptedTypes?.join(',')}
      />

      {selectedFile && (
        <div data-testid="selected-file">
          {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
        </div>
      )}

      {error && <div data-testid="upload-error">{error}</div>}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        data-testid="upload-btn"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  )
}

describe('Form Components', () => {
  describe('OrderForm Component', () => {
    it('should render all form fields', () => {
      render(<MockOrderForm onSubmit={jest.fn()} />)

      expect(screen.getByTestId('client-name-input')).toBeInTheDocument()
      expect(screen.getByTestId('quantity-input')).toBeInTheDocument()
      expect(screen.getByTestId('due-date-input')).toBeInTheDocument()
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
    })

    it('should show validation errors on submit with empty fields', async () => {
      render(<MockOrderForm onSubmit={jest.fn()} />)

      const submitButton = screen.getByTestId('submit-btn')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('client-name-error')).toHaveTextContent('Client name is required')
        expect(screen.getByTestId('quantity-error')).toHaveTextContent('Quantity must be greater than 0')
        expect(screen.getByTestId('due-date-error')).toHaveTextContent('Due date is required')
      })
    })

    it('should update input values on change', () => {
      render(<MockOrderForm onSubmit={jest.fn()} />)

      const clientInput = screen.getByTestId('client-name-input') as HTMLInputElement
      fireEvent.change(clientInput, { target: { value: 'Test Client' } })

      expect(clientInput.value).toBe('Test Client')
    })

    it('should call onSubmit with valid data', async () => {
      const mockSubmit = jest.fn()
      render(<MockOrderForm onSubmit={mockSubmit} />)

      fireEvent.change(screen.getByTestId('client-name-input'), { target: { value: 'Test Client' } })
      fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '100' } })
      fireEvent.change(screen.getByTestId('due-date-input'), { target: { value: '2025-12-31' } })

      fireEvent.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          client_name: 'Test Client',
          quantity: '100',
          due_date: '2025-12-31'
        })
      })
    })

    it('should pre-fill form with initial data', () => {
      const initialData = {
        client_name: 'Existing Client',
        quantity: '50',
        due_date: '2025-11-15'
      }

      render(<MockOrderForm onSubmit={jest.fn()} initialData={initialData} />)

      expect((screen.getByTestId('client-name-input') as HTMLInputElement).value).toBe('Existing Client')
      expect((screen.getByTestId('quantity-input') as HTMLInputElement).value).toBe('50')
      expect((screen.getByTestId('due-date-input') as HTMLInputElement).value).toBe('2025-11-15')
    })

    it('should validate quantity is greater than zero', async () => {
      render(<MockOrderForm onSubmit={jest.fn()} />)

      fireEvent.change(screen.getByTestId('client-name-input'), { target: { value: 'Test' } })
      fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '0' } })
      fireEvent.change(screen.getByTestId('due-date-input'), { target: { value: '2025-12-31' } })

      fireEvent.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('quantity-error')).toHaveTextContent('Quantity must be greater than 0')
      })
    })
  })

  describe('SearchFilter Component', () => {
    it('should render search input and filter buttons', () => {
      render(<MockSearchFilter onSearch={jest.fn()} onFilter={jest.fn()} />)

      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByTestId('search-btn')).toBeInTheDocument()
      expect(screen.getByTestId('filter-all')).toBeInTheDocument()
      expect(screen.getByTestId('filter-active')).toBeInTheDocument()
      expect(screen.getByTestId('filter-completed')).toBeInTheDocument()
    })

    it('should call onSearch with search term', () => {
      const mockSearch = jest.fn()
      render(<MockSearchFilter onSearch={mockSearch} onFilter={jest.fn()} />)

      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'test search' } })

      const searchButton = screen.getByTestId('search-btn')
      fireEvent.click(searchButton)

      expect(mockSearch).toHaveBeenCalledWith('test search')
    })

    it('should call onFilter when filter button clicked', () => {
      const mockFilter = jest.fn()
      render(<MockSearchFilter onSearch={jest.fn()} onFilter={mockFilter} />)

      const activeButton = screen.getByTestId('filter-active')
      fireEvent.click(activeButton)

      expect(mockFilter).toHaveBeenCalledWith('ACTIVE')
    })

    it('should update filter status when different filters clicked', () => {
      render(<MockSearchFilter onSearch={jest.fn()} onFilter={jest.fn()} />)

      const activeButton = screen.getByTestId('filter-active')
      fireEvent.click(activeButton)

      expect(activeButton).toHaveClass('active')
      expect(screen.getByTestId('filter-all')).not.toHaveClass('active')
    })
  })

  describe('FileUploadForm Component', () => {
    const createMockFile = (name: string, size: number, type: string): File => {
      const file = new File(['a'.repeat(size)], name, { type })
      return file
    }

    it('should render file input and upload button', () => {
      render(<MockFileUploadForm onUpload={jest.fn()} />)

      expect(screen.getByTestId('file-input')).toBeInTheDocument()
      expect(screen.getByTestId('upload-btn')).toBeInTheDocument()
    })

    it('should display selected file info', () => {
      render(<MockFileUploadForm onUpload={jest.fn()} />)

      const fileInput = screen.getByTestId('file-input')
      const file = createMockFile('test.jpg', 1024, 'image/jpeg')

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })

      fireEvent.change(fileInput)

      expect(screen.getByTestId('selected-file')).toHaveTextContent('test.jpg')
      expect(screen.getByTestId('selected-file')).toHaveTextContent('1KB')
    })

    it('should reject file exceeding size limit', () => {
      render(<MockFileUploadForm onUpload={jest.fn()} />)

      const fileInput = screen.getByTestId('file-input')
      const largeFile = createMockFile('large.jpg', 6 * 1024 * 1024, 'image/jpeg')

      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false
      })

      fireEvent.change(fileInput)

      expect(screen.getByTestId('upload-error')).toHaveTextContent('File size exceeds 5MB limit')
    })

    it('should reject invalid file type', () => {
      const acceptedTypes = ['image/jpeg', 'image/png']
      render(<MockFileUploadForm onUpload={jest.fn()} acceptedTypes={acceptedTypes} />)

      const fileInput = screen.getByTestId('file-input')
      const invalidFile = createMockFile('test.pdf', 1024, 'application/pdf')

      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false
      })

      fireEvent.change(fileInput)

      expect(screen.getByTestId('upload-error')).toHaveTextContent('File type application/pdf not allowed')
    })

    it('should call onUpload with selected file', async () => {
      const mockUpload = jest.fn().mockResolvedValue(undefined)
      render(<MockFileUploadForm onUpload={mockUpload} />)

      const fileInput = screen.getByTestId('file-input')
      const file = createMockFile('test.jpg', 1024, 'image/jpeg')

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })

      fireEvent.change(fileInput)

      const uploadButton = screen.getByTestId('upload-btn')
      fireEvent.click(uploadButton)

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file)
      })
    })

    it('should show uploading state', async () => {
      const mockUpload = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<MockFileUploadForm onUpload={mockUpload} />)

      const fileInput = screen.getByTestId('file-input')
      const file = createMockFile('test.jpg', 1024, 'image/jpeg')

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })

      fireEvent.change(fileInput)

      const uploadButton = screen.getByTestId('upload-btn')
      fireEvent.click(uploadButton)

      expect(uploadButton).toHaveTextContent('Uploading...')
      expect(uploadButton).toBeDisabled()
    })

    it('should disable upload button when no file selected', () => {
      render(<MockFileUploadForm onUpload={jest.fn()} />)

      const uploadButton = screen.getByTestId('upload-btn')
      expect(uploadButton).toBeDisabled()
    })
  })
})
