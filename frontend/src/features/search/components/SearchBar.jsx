import Button from '../../../components/common/Button';

export default function SearchBar({ value, onChange, onSubmit, loading }) {
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search across your documents by meaning…"
      />
      <Button type="submit" loading={loading} disabled={!value.trim()}>Search</Button>
    </form>
  );
}
