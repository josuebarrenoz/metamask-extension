import React, { useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '../../../components/ui/text-field';
import { I18nContext } from '../../../contexts/i18n';
import SearchIcon from '../../../components/ui/search-icon';
import { isEqualCaseInsensitive } from '../../../../shared/modules/string-utils';
import { getSnapsRouteObjects } from '../../../selectors';

export default function SettingsSearch({
  onSearch,
  error,
  settingsRoutesList,
}) {
  const t = useContext(I18nContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchIconColor, setSearchIconColor] = useState(
    'var(--color-icon-muted)',
  );

  let settingsRoutesListArray = Object.values(settingsRoutesList);
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  const snaps = useSelector(getSnapsRouteObjects);
  settingsRoutesListArray = [settingsRoutesListArray, ...snaps];
  ///: END:ONLY_INCLUDE_IN
  const settingsSearchFuse = new Fuse(settingsRoutesListArray, {
    shouldSort: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['tabMessage', 'sectionMessage', 'descriptionMessage'],
    getFn: (routeObject, path) =>
      typeof routeObject[path] === 'function'
        ? routeObject[path](t)
        : routeObject[path],
  });

  const handleSearch = (_searchQuery) => {
    const sanitizedSearchQuery = _searchQuery.replace(
      /[^A-z0-9\s&]|[\\]/gu,
      '',
    );
    setSearchQuery(sanitizedSearchQuery);
    if (sanitizedSearchQuery === '') {
      setSearchIconColor('var(--color-icon-muted)');
    } else {
      setSearchIconColor('var(--color-icon-default)');
    }

    const fuseSearchResult = settingsSearchFuse.search(sanitizedSearchQuery);
    const addressSearchResult = settingsRoutesListArray.filter((routes) => {
      return (
        routes.tab &&
        sanitizedSearchQuery &&
        isEqualCaseInsensitive(routes.tab, sanitizedSearchQuery)
      );
    });

    const results = [...addressSearchResult, ...fuseSearchResult];
    onSearch({ searchQuery: sanitizedSearchQuery, results });
  };

  const renderStartAdornment = () => {
    return (
      <InputAdornment position="start" style={{ marginRight: '12px' }}>
        <SearchIcon color={searchIconColor} />
      </InputAdornment>
    );
  };

  const renderEndAdornment = () => {
    return (
      <>
        {searchQuery && (
          <InputAdornment
            className="imageclosectn"
            position="end"
            onClick={() => handleSearch('')}
            style={{ cursor: 'pointer' }}
          >
            <i
              className="fa fa-times"
              style={{ color: 'var(--color-icon-default)' }}
            />
          </InputAdornment>
        )}
      </>
    );
  };

  return (
    <TextField
      id="search-settings"
      placeholder={t('searchSettings')}
      type="text"
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      error={error}
      fullWidth
      autoFocus
      autoComplete="off"
      startAdornment={renderStartAdornment()}
      endAdornment={renderEndAdornment()}
    />
  );
}

SettingsSearch.propTypes = {
  onSearch: PropTypes.func,
  error: PropTypes.string,
  settingsRoutesList: PropTypes.array,
};
