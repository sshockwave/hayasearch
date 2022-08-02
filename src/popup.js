import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';

function App() {
  const [options, setOptions] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!ready) {
      chrome.storage.sync.get(['search_engines'], ({ search_engines }) => {
        search_engines ||= {};
        setOptions(Object.keys(search_engines));
        setReady(true);
      });
    }
  });
  return <Box component='form'>
    <Autocomplete
      open
      options={options}
      renderInput={(params) => <TextField
          label="Outlined"
          variant="outlined"
          sx={{ minWidth: '20rem' }}
          margin="dense"
          autoFocus
          fullWidth
          {...params}
      />}
      />
  </Box>;
}

createRoot(document.getElementById('root')).render(<App/>);
