import { useState, useEffect } from 'react'
import { Box, TextField, Tooltip } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import { useController, useFormContext } from 'react-hook-form'
import type { FieldError } from 'react-hook-form'

interface ImageUrlFieldProps {
  name: string
  error?: FieldError
}

export function ImageUrlField({ name, error }: ImageUrlFieldProps) {
  const { control } = useFormContext()
  const { field } = useController({ control, name })
  const [broken, setBroken] = useState(false)

  const url = typeof field.value === 'string' ? field.value : ''

  useEffect(() => {
    setBroken(false)
  }, [url])

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Tooltip title={url ? (broken ? 'Image failed to load' : 'Image preview') : 'No image'} arrow>
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            mt: '2px',
            borderRadius: 1,
            border: '1px solid',
            borderColor: broken ? 'error.light' : 'divider',
            bgcolor: 'action.hover',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s',
            cursor: url && !broken ? 'zoom-in' : 'default',
          }}
          onClick={() => {
            if (url && !broken) window.open(url, '_blank', 'noopener,noreferrer')
          }}
        >
          {url && !broken ? (
            <img
              src={url}
              alt="preview"
              onError={() => setBroken(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : broken ? (
            <BrokenImageIcon sx={{ color: 'error.light', fontSize: 18 }} />
          ) : (
            <ImageIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
          )}
        </Box>
      </Tooltip>
      <TextField
        label="Image URL"
        size="small"
        fullWidth
        placeholder="https://..."
        value={url}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
        name={field.name}
        error={Boolean(error)}
        helperText={error?.message}
      />
    </Box>
  )
}
