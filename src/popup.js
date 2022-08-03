import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
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

let config;
function get_path_obj(path) {
  let ans = config || {};
  for (const k of path) {
    try {
      ans = ans[k];
    } catch {
      return ans;
    }
  }
  return ans;
}

function App() {
  const [query, setQuery] = useState('');
  const [path, setPath] = useState([]);
  const root_obj = get_path_obj(path);
  const is_leaf = typeof root_obj === 'string';
  const [selection, setSelection] = useState(0);
  const [options, setOptions] = useState(() => Array.from(Object.keys(config)));
  function updateQuery(query, path) {
    let cur_root = root_obj;
    if (path !== undefined) {
      setPath(path);
      cur_root = get_path_obj(path);
    }
    setQuery(query);
    setSelection(0);
    if (typeof cur_root === 'string') { // is leaf
      setOptions([]);
    } else {
      setOptions(matchSorter(Array.from(Object.keys(cur_root)), query));
    }
  }
  function confirmQuery() {
    if (is_leaf) {
      window.open(root_obj.replace(/(?<!%)%s/, encodeURIComponent(query)));
    } else if (selection < options.length) {
      updateQuery('', path.concat(options[selection]));
    }
  }
  function handleKeyDown(ev) {
    switch (ev.key) {
      case 'Escape': {
        ev.preventDefault();
        window.close();
        break;
      }
      case 'Enter': {
        ev.preventDefault();
        confirmQuery();
        break;
      }
      case 'Tab': {
        ev.preventDefault();
        if (!is_leaf) {
          confirmQuery();
        }
        break;
      }
      case 'Backspace': {
        if (query === '' && path.length > 0) {
          ev.preventDefault();
          updateQuery(path.at(-1), path.slice(0, -1));
        }
        break;
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
      label={path.join('»')}
      autoFocus
      fullWidth
      color={is_leaf ? 'success': 'warning'}
      value={query}
      size="small"
      onKeyDown={handleKeyDown}
      onInput={(ev) => updateQuery(ev.target.value)}
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

function start_app() {
  createRoot(document.getElementById('root')).render(<App/>);
}

chrome.storage.sync.get(['search_engines'], ({ search_engines }) => {
  config = search_engines || {};
  start_app();
});
