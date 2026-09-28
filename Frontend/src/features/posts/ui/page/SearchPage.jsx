import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";


import api from "../../../../config/axiosInstance";

import SearchBar from "../components/SearchBar";
import { SkeletonPostCard, SkeletonSearchRow } from "../components/SkeletonPostCard";

const RECENT_KEY = "resolvenet_recent_searches";
const MAX_RECENT = 6;
const DEBOUNCE_MS = 400;

const SearchPage=() => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [recent, setRecent] = useState([]);
  const debounceRef = useRef(null);

  const showingResults = query.trim().length > 0;

  // Load recent searches from localStorage once
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecent(stored);
    } catch {
      setRecent([]);
    }
  }, []);

  // Fetch trending posts on mount (empty-query state)
  useEffect(() => {
    let active = true;
    const fetchTrending = async () => {
      setTrendingLoading(true);
      try {
        const res = await api.get("/posts/trending/");
        if (active) setTrending(res.data);
      } catch (err) {
        console.error("Failed to load trending posts:", err);
      } finally {
        if (active) setTrendingLoading(false);
      }
    };
    fetchTrending();
    return () => {
      active = false;
    };
  }, []);

  // Debounced live search whenever `query` changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get("/search/", { params: { q: query } });
        setResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const saveRecent = useCallback((term) => {
    if (!term.trim()) return;
    setRecent((prev) => {
      const next = [term, ...prev.filter((t) => t !== term)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecent = (term) => {
    setRecent((prev) => {
      const next = prev.filter((t) => t !== term);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearAllRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          autoFocus
          placeholder="Search issues, categories, people"
        />
      </div>

      <div className="px-4 py-4">
        {/* Recent searches — only when the query is empty */}
        {!showingResults && recent.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-primary">Recent</h2>
              <button
                type="button"
                onClick={clearAllRecent}
                className="text-xs text-accent hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-1.5 rounded-full border border-border
                             bg-card px-3 py-1.5 text-xs text-text-secondary
                             transition-colors hover:bg-secondary"
                >
                  {term}
                  <X
                    size={11}
                    className="text-text-muted hover:text-text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecent(term);
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending grid — empty-query state, skeleton while loading */}
        {!showingResults && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-text-primary">
              Trending in your area
            </h2>
            <div className="grid grid-cols-3 gap-1">
              {trendingLoading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonPostCard key={i} />
                  ))
                : trending.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => window.location.assign(`/posts/${post.id}`)}
                      className="aspect-square overflow-hidden rounded-lg bg-card"
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform
                                   duration-200 hover:scale-105"
                      />
                    </button>
                  ))}
            </div>
            {!trendingLoading && trending.length === 0 && (
              <p className="py-10 text-center text-sm text-text-muted">
                No trending issues right now. Check back soon.
              </p>
            )}
          </div>
        )}

        {/* Results list — active-query state, skeleton rows while loading */}
        {showingResults && (
          <div className="-mx-4">
            {searchLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonSearchRow key={i} />)
            ) : results.length > 0 ? (
              results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    saveRecent(query);
                    window.location.assign(`/posts/${item.id}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left
                             transition-colors hover:bg-card"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-card">
                    {item.image && (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {item.category} · {item.location}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-text-muted">
                No results for "{query}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
