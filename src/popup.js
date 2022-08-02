import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { matchSorter } from 'match-sorter'
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Icon,
} from '@mui/material';

function getFavicon(url) {
  try {
    url = new URL(url);
  } catch {
    return null;
  }
  url.pathname = 'favicon.ico';
  return url.toString();
}

function App() {
  const [config, setConfig] = useState(null);
  if (config === null) {
    chrome.storage.sync.get(['search_engines'], ({ search_engines }) => {
      search_engines ||= {};
      setConfig(search_engines);
    });
  }
  const [query, setQuery] = useState('');
  const [path, setPath] = useState([]);
  let root_obj = config || {};
  for (let k of path) {
    try {
      root_obj = root_obj[k];
    } catch {
      break;
    }
  }
  const is_leaf = typeof root_obj === 'string';
  const options = matchSorter(Array.from(Object.keys(root_obj)), query);
  const [selection, setSelection] = useState(0);
  function handleKeyDown(ev) {
    switch (ev.key) {
      case 'Escape': {
        ev.preventDefault();
        window.close();
      }
      case 'Enter': {
        ev.preventDefault();
      }
      case 'ArrowUp': {
        ev.preventDefault();
        let nxt = selection - 1;
        if (nxt < 0) {
          nxt = options.length - 1;
        }
        setSelection(nxt);
        break;
      }
      case 'ArrowDown': {
        ev.preventDefault();
        let nxt = selection + 1;
        if (nxt === options.length) {
          nxt = 0;
        }
        setSelection(nxt);
        break;
      }
    }
  }
  return <Box component='form' sx={{ minWidth: '20rem' }} >
    <TextField
      label={path.join('&raquo;')}
      autoFocus
      fullWidth
      size="small"
      onKeyDown={handleKeyDown}
      onInput={(ev) => setQuery(ev.target.value)}
    />
    { is_leaf ? null : <List dense>
      {options.map((key, idx) => (
        <ListItem key={key} disablePadding>
          <ListItemButton
            selected={selection === idx}
            onMouseOver={() => setSelection(idx)}
          >
            <ListItemIcon>
              <Icon>
                <img src={getFavicon(root_obj[key])} height={25} width={25}/>
              </Icon>
            </ListItemIcon>
            <ListItemText primary={key}/>
          </ListItemButton>
        </ListItem>
      ))}
    </List>}
  </Box>;
}

createRoot(document.getElementById('root')).render(<App/>);
