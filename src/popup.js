import { createRoot } from 'react-dom/client';
import React, { useEffect, useState, createRef } from 'react';
import { matchSorter } from 'match-sorter'
import Aggregated from './suggestions.js';
import './scss/styles.scss';
import edit_icon from 'bootstrap-icons/icons/pencil-square.svg';

let config, icon_map;
let last_update_timestamp = 0, current_timestamp = 0;
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

function get_query_url(url, query) {
  return url.replace(/(?<!%)%s/, encodeURIComponent(query));
}

function App() {
  const [query, setQuery] = useState('');
  const [path, setPath] = useState([]);
  const root_obj = get_path_obj(path);
  const is_leaf = typeof root_obj === 'string';
  let [selection, setSelection] = useState(0);
  const [options, setOptions] = useState(() => Array.from(Object.keys(config)));
  function getFinalQuery() {
    return is_leaf && selection !== -1 ? options[selection]: query;
  }
  useEffect(() => { // handle search suggestion
    if (!is_leaf) {
      return;
    }
    if (selection !== -1) {
      return;
    }
    const api = new Aggregated;
    let this_time = current_timestamp++;
    api
      .fetch(get_query_url(root_obj, query), query)
      .then((res) => {
        if (this_time < last_update_timestamp) {
          return;
        }
        last_update_timestamp = this_time;
        setOptions(res);
        setSelection(-1);
      });
  }, [path, query]);
  function updateQuery(query, path) {
    let cur_root = root_obj;
    if (path !== undefined) {
      setPath(path);
      cur_root = get_path_obj(path);
    }
    setQuery(query);
    if (typeof cur_root === 'string') { // is leaf
      setSelection(-1);
      if (!is_leaf) { // if switched from non-leaf
        setOptions([]);
      }
    } else {
      setSelection(0);
      setOptions(matchSorter(Array.from(Object.keys(cur_root)), query));
    }
  }
  function confirmQuery() {
    if (is_leaf) {
      window.open(get_query_url(root_obj, getFinalQuery()));
    } else if (selection < options.length) {
      updateQuery('', path.concat(options[selection]));
    }
  }
  function handleKeyDown(ev) {
    function prev_sel() {
      let nxt = selection - 1;
      if ((is_leaf && nxt < -1) || (!is_leaf && nxt < 0)) {
        nxt = options.length - 1;
      }
      setSelection(nxt);
    }
    function next_sel() {
      let nxt = selection + 1;
      if (nxt === options.length) {
        nxt = is_leaf ? -1: 0;
      }
      setSelection(nxt);
    }
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
        if (is_leaf) {
          if (ev.shiftKey) {
            if (query === '' && path.length > 0) {
              updateQuery(path.at(-1), path.slice(0, -1));
            }
            prev_sel();
          } else {
            next_sel();
          }
        } else {
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
        prev_sel();
        break;
      }
      case 'ArrowDown': {
        ev.preventDefault();
        next_sel();
        break;
      }
    }
  }
  const text_ref = createRef();
  return <form className='container-fluid' style={{ minWidth: '20rem' }}>
    <div className='input-group mt-3'>
      {path.map(p => <span className="input-group-text" key={p}>{p}</span>)}
    <input
      autoFocus
      type='text'
      value={getFinalQuery()}
      className='form-control'
      ref={text_ref}
      onKeyDown={handleKeyDown}
      onInput={(ev) => updateQuery(ev.target.value)}
    />
    </div>
    <ul className='list-group mt-3 mb-3'>
      {options.map((key, idx) => (
        <li
          key={key}
          className={`list-group-item list-group-item-action d-flex align-items-center${selection === idx ? ' list-group-item-dark': ''}`}
          onClick={() => {
            selection = idx;
            confirmQuery();
            text_ref.current.focus();
          }}
        >
          {is_leaf ? null : typeof root_obj[key] === 'string' ? (
            <img
              src={icon_map[root_obj[key]]}
              style={{ height: '1rem', width: '1rem' }}
              title={key}
              className='me-3'
            />
          ) : null}
          {key}
          {is_leaf ? (
            <img
              className='ms-auto'
              src={edit_icon}
              title='edit'
              style={{ height: '1rem', width: '1rem' }}
              onClick={(ev) => {
                ev.stopPropagation();
                updateQuery(key);
                text_ref.current.focus();
              }}
            />
          ) : null}
        </li>
      ))}
    </ul>
  </form>;
}

function start_app() {
  createRoot(document.getElementById('root')).render(<App/>);
}

chrome.storage.sync.get(['search_engines', 'icon_map'], ({ search_engines, icon_map: _icon_map }) => {
  config = search_engines || {};
  icon_map = _icon_map;
  start_app();
});
