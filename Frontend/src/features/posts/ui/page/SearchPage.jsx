import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import GooeyNav from "../components/GooeyNav";

import api from "../../../../config/axiosInstance";

import SearchBar from "../components/SearchBar";
import { SkeletonPostCard, SkeletonSearchRow } from "../components/SkeletonPostCard";

const RECENT_KEY = "resolvenet_recent_searches";
const MAX_RECENT = 6;
const DEBOUNCE_MS = 400;

// GooeyNav ke tabs. Order wahi rakhna jo TAB_TYPES aur TAB_PLACEHOLDERS ka hai
// (items component ke bahar hai, taaki har render par naya array na bane)
const TAB_ITEMS = [
  { label: "Posts", href: "#" },
  { label: "Accounts", href: "#" },
  { label: "Near me", href: "#" },
];
const TAB_TYPES = ["posts", "accounts", "near"]; // backend ke ?type= ki value
const TAB_PLACEHOLDERS = [
  "Search issues and places",
  "Search people",
  "Search issues near you",
];

const getPlace = (post) => [post.city, post.state].filter(Boolean).join(", ");

const getSubtitle = (post) => {
  const distance = post.distance_km !== undefined ? `${post.distance_km} km away` : "";
  return [getPlace(post), distance].filter(Boolean).join(" · ");
};

const SearchPage = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [recent, setRecent] = useState([]);
  const debounceRef = useRef(null);

  const [selectedIndx, setSelectedIndx] = useState(0);

  // Near me tab ke liye user ki location
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState("");

  const searchType = TAB_TYPES[selectedIndx];
  const isNearTab = searchType === "near";

  // Near me tab mein query ke bina bhi nearby posts dikhte hain
  const showingResults = query.trim().length > 0 || isNearTab;

  const receiveActiveIndex = (index) => {
    setSelectedIndx(index);
  };

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
        const res = await api.get("/api/posts/trending/");
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

  // Near me tab khulte hi browser se location maango (ek hi baar)
  useEffect(() => {
    if (!isNearTab || coords) return;

    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError("");
      },
      () => {
        setLocationError("Please allow location access to see issues near you.");
      }
    );
  }, [isNearTab, coords]);

  // Debounced live search — query, tab ya location badalne par
  useEffect(() => {
    // Posts / Accounts: query chahiye. Near me: location chahiye (query optional)
    const needsQuery = !isNearTab && !query.trim();
    const needsLocation = isNearTab && !coords;

    if (needsQuery || needsLocation) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    setSearchLoading(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const params = { q: query.trim(), type: searchType };
        if (isNearTab) {
          params.lat = coords.lat;
          params.lng = coords.lng;
        }

        const res = await api.get("/api/search/", { params });
        if (active) setResults(res.data.results);
      } catch (err) {
        console.error("Search failed:", err);
        if (active) setResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(debounceRef.current);
    };
  }, [query, searchType, isNearTab, coords]);

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

  const openPost = (postId) => {
    saveRecent(query);
    navigate(`/dashboard/posts/${postId}`);
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
          placeholder={TAB_PLACEHOLDERS[selectedIndx]}
        />
      </div>

      <div className=" bg-accent-light m-2 ">
        <GooeyNav
          items={TAB_ITEMS}
          sendActiveIndex={receiveActiveIndex}
          particleCount={12}
          particleDistances={[90, 10]}
          particleR={200}
          initialActiveIndex={0}
          animationTime={600}
          timeVariance={400}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
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
              Trending this week
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
                      onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                      className="aspect-square overflow-hidden rounded-lg bg-card"
                    >
                      <img
                        src={post.media?.[0]?.image_url}
                        alt={post.caption}
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
            {isNearTab && locationError ? (
              <p className="py-10 text-center text-sm text-text-muted">{locationError}</p>
            ) : isNearTab && !coords ? (
              <p className="py-10 text-center text-sm text-text-muted">
                Getting your location...
              </p>
            ) : searchLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonSearchRow key={i} />)
            ) : results.length > 0 ? (
              results.map((item) =>
                searchType === "accounts" ? (
                  // Account row (abhi kisi aur ki profile ka page nahi hai, isliye click nahi hota)
                  <div key={item.id} className="flex w-full items-center gap-3 px-4 py-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-text-secondary">
                          {(item.full_name || item.username)?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {item.full_name || item.username}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        @{item.username}
                        {(item.city || item.state) &&
                          ` · ${[item.city, item.state].filter(Boolean).join(", ")}`}
                      </p>
                    </div>
                    {item.match === "similar" && (
                      <span className="ml-auto shrink-0 rounded-full border border-border bg-card px-2 py-0.5 text-xs text-text-muted">
                        Similar
                      </span>
                    )}
                  </div>
                ) : (
                  // Post row (Posts aur Near me dono ke liye)
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openPost(item.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left
                               transition-colors hover:bg-card"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-card">
                      {item.media?.[0]?.image_url && (
                        <img
                          src={item.media[0].image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {item.caption}
                      </p>
                      <p className="truncate text-xs text-text-muted">{getSubtitle(item)}</p>
                    </div>
                  </button>
                )
              )
            ) : (
              <p className="py-10 text-center text-sm text-text-muted">
                {isNearTab && !query.trim()
                  ? "No issues found near you."
                  : `No results for "${query}"`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;