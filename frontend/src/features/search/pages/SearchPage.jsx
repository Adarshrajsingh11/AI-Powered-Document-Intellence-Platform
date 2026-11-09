import { useState } from 'react';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Spinner from '../../../components/common/Spinner';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { searchService } from '../searchService';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async () => {
    setLoading(true);
    setError('');
    try {
      setResults(await searchService.search({ query: query.trim() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Semantic search</h1>
      <SearchBar value={query} onChange={setQuery} onSubmit={runSearch} loading={loading} />
      <ErrorMessage message={error} />
      {loading && <Spinner label="Searching…" />}
      {!loading && results && <SearchResults results={results} />}
    </div>
  );
}
